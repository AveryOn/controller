import { GlobalNames, SESSION_TTL, Vars } from "../../config/global";
import { logoutIpc, refreshTokenIpc } from "../ipc/users.ipc";
import { AccessTokenData, AccessTokenPayload, ExpiresToken } from "../types/services/tokens.types";
import { decryptJsonData, encryptJsonData } from "./crypto.service";
import { TTLStore } from "./ttl-store.service";

// Создать время со смещением вперед
function prepareExpireTime(expires: ExpiresToken) {
    let ready = 0;
    if(expires.Y) ready += 1000*60*60*24*365*Math.max(expires.Y, 1);
    if(expires.M) ready += 1000*60*60*24*30*Math.max(expires.M, 1);
    if(expires.d) ready += 1000*60*60*24*Math.max(expires.d, 1);
    if(expires.h) ready += 1000*60*60*Math.max(expires.h, 1);
    if(expires.m) ready += 1000*60*Math.max(expires.m, 1);
    if(expires.s) ready += 1000*Math.max(expires.s, 1);
    if(!ready) throw new Error('[prepareExpireTime]>> INVALID_INPUT');
    ready+=Date.now();
    return ready;
}

// Создать сигнатуру токена для исключения риска его подделки
function createSignatureToken() {
    try {
        return Vars.TOKEN_SIGNATURE;
    } catch (err) {
        console.error('[createSignatureToken]>>', err);
        throw err;
    }        
}

/**
 *  Перебить токен
 */
export async function brokeAccessToken(value: string): Promise<{ value: string, salt: string }> {
    try {
        if(!value || typeof value !== 'string') 
            throw new Error('invalid value');
        value = await encryptJsonData(value, Vars.USER_TOKEN_SALT) 
        let processValue = value.split('')
        if(processValue.length >= 64) {
            // Salt
            let salt: string | string[] = processValue.slice(processValue.length - 32)
            salt = salt.reverse().join()
            salt = await encryptJsonData(salt, Vars.USER_TOKEN_SALT);
            salt = salt.split('').reverse().join('$')

            // broken token
            let brokenToken: string | string[] = processValue.slice(0, processValue.length - 32)
            brokenToken = brokenToken.reverse().join()
            brokenToken = await encryptJsonData(brokenToken, Vars.USER_TOKEN_SALT);
            brokenToken = brokenToken.split('').reverse().join('#')
            return { value: brokenToken, salt }
        }
        return { value, salt: '' }
    } catch (err) {
        throw err;
    }
}

/**
 * Восстановить токен
 */
export async function repairToken(brokenToken: string, salt: string): Promise<string> {
    try {
        if(!brokenToken || typeof brokenToken !== 'string') throw new Error('invalid brokenToken');
        if(!salt || typeof salt !== 'string') throw new Error('invalid salt');
        // broken token
        let repairToken: string | string[] = brokenToken.split('#').reverse().join('');
        repairToken = await decryptJsonData(repairToken, Vars.USER_TOKEN_SALT);
        repairToken = repairToken.split(',').reverse();
        
        // salt
        let repairSalt: string | string[] = salt.split('$').reverse().join('');
        repairSalt = await decryptJsonData(repairSalt, Vars.USER_TOKEN_SALT);
        repairSalt = repairSalt.split(',').reverse();

        const token = await decryptJsonData((repairToken.join('') + repairSalt.join('')), Vars.USER_TOKEN_SALT);
        return token

    } catch (err) {
        throw err;
    }
}

// Формирование токена доступа
export async function createAccessToken(payload: AccessTokenPayload, expires: ExpiresToken): Promise<string> {
    try {
        if(!payload || !expires) throw new Error('[createAccessToken]>> INVALID_INPUT');
        const expiresStamp: number = prepareExpireTime(expires);
        const signatureToken: string = createSignatureToken();
        const tokenData: AccessTokenData = {
            expires: expiresStamp,
            payload,
            signature: signatureToken,
        }
        let token = await encryptJsonData(tokenData, Vars.TOKEN_SIGNATURE);
        const hashedToken = await encryptJsonData(token, Vars.USER_TOKEN_SALT)
        const { value: brokenToken, salt } = await brokeAccessToken(token)
        token = ''

        const store = TTLStore.getInstance();
        store.set(GlobalNames.USER_TOKEN, hashedToken, Vars.USER_TOKEN_TTL)
        store.set(GlobalNames.USER_BROKEN_TOKEN, brokenToken, Vars.USER_BROKEN_TOKEN_TTL);
        store.set(GlobalNames.USER_TOKEN_SALT, salt, Vars.USER_TOKEN_SALT_TTL);
        return brokenToken;
    } catch (err) {
        throw err;
    }
}

const RefreshTokenQueue: string[] = []
const refreshTimer: { t: any } = { t: null }
let RefreshTokenCount  = 0
// Верификация токена доступа и получение payload
export async function verifyAccessToken(token: string, config?: { refresh?: boolean }): Promise<{ newToken: string | null, payload: AccessTokenPayload }> {
    try {
        if(!token || typeof token !== 'string') throw new Error('[verifyAccessToken]>> INVALID_INPUT');
        const store = TTLStore.getInstance();
        const hashedToken = store.get(GlobalNames.USER_TOKEN) as string;
        const brokenToken = store.get(GlobalNames.USER_BROKEN_TOKEN) as string;
        const tokenSalt = store.get(GlobalNames.USER_TOKEN_SALT) as string;
        // Если нет хотя бы одной необходимой части для восстановления токена, то запрещаем доступ в приложение 
        if(!brokenToken || !hashedToken || !tokenSalt) {
            logoutIpc(win)
            throw new Error('[verifyAccessToken]>> ACCESS_FORBIDDEN [1]');
        }
        // Если пришедший битый токен не соответствует битому токену в хранилище
        if(token !== brokenToken) {
            logoutIpc(win)
            throw new Error('[verifyAccessToken]>> ACCESS_FORBIDDEN [2]');
        }
        const decryptedRealToken = await decryptJsonData(hashedToken, Vars.USER_TOKEN_SALT);
        const repairedToken = await repairToken(brokenToken, tokenSalt);

        if(repairedToken !== decryptedRealToken) {
            logoutIpc(win)
            throw new Error('[verifyAccessToken]>> ACCESS_FORBIDDEN [3]');
        }

        const payload: AccessTokenData = JSON.parse(await decryptJsonData(decryptedRealToken, Vars.TOKEN_SIGNATURE));
        if(payload.expires <= Date.now()) {
            logoutIpc(win)
            throw new Error('[verifyAccessToken]>> EXPIRES_LIFE_TOKEN');
        }
        // обновление токена
        else {
            if(config?.refresh === true) {
                /**
                 * Применяется Троттлер для того чтобы разгрузить большое кол-во обновлений на ед. времени.
                 * Троттлер накапливает идентификаторы запросов в очередь и только по истечению таймера THROTTLER_REFRESH_TOKEN_TTL вызывается команда 
                 * на обновление токена. Если троттлер не включен, то возможны нарушения проверок ключей, что приводит к непредсказуемому разлогину 
                 * раньше времени 
                 */
                RefreshTokenQueue.push(`R_${RefreshTokenCount}`)
                clearInterval(refreshTimer.t)
                refreshTimer.t = setTimeout( async() => {
                    console.log('INVOKED REFRESH TOKEN', ++RefreshTokenCount);
                    RefreshTokenQueue.length = 0;
                    refreshTimer.t = null;
                    const { payload: { userId, username } } = payload;
                    store.set(
                        GlobalNames.USER_PRAGMA_KEY,
                        store.get(GlobalNames.USER_PRAGMA_KEY),
                        Vars.USER_PRAGMA_KEY_TTL,
                        () => logoutIpc(win, { fromServer: true }),
                    );
                    const newBrokenToken = await createAccessToken({ userId, username }, { m: SESSION_TTL });
                    // Отправить команду на обновление токена на клиент
                    refreshTokenIpc(newBrokenToken, win);
                }, Vars.THROTTLER_REFRESH_TOKEN_TTL);
                store.set(GlobalNames.THROTTLER_TIMER, refreshTimer.t, Vars.THROTTLER_REFRESH_TOKEN_TTL);
            }
        }
        return { 
            newToken: null, 
            payload: payload.payload,
        };
    } catch (err) {
        throw err;
    }
}
