import { GlobalNames, SESSION_TTL, Vars } from "../../config/global";
import { TTLStore } from "../services/ttl-store.service";
import UserService from "../database/services/users.service";
import { encryptPragmaKey, verify } from "../services/crypto.service";
import { createAccessToken, verifyAccessToken } from "../services/tokens.service";
import { ValidateAccessTokenParams } from "../types/controllers/auth.types";
import { LoginParams, LoginResponse } from "../types/controllers/users.types";
import { prepareUserStore } from "./system.controller";
import { BrowserWindow } from "electron";
import { logoutIpc } from "../ipc/users.ipc";

// инициализация TTL хранилища 
const storeTTL = TTLStore.getInstance<string>()


// Валидация токена доступа
export async function validateAccessToken(params: ValidateAccessTokenParams) {
    try {
        if(!params?.token) {
            logoutIpc(win)
            throw '[validateAccessToken]>> INVALID_DATA';
        }
        return !!(await verifyAccessToken(params.token, { refresh: true }));
    } catch (err) {
        console.error(err);
        return false
    }
}


// Подтверждение учетных данных пользователя при входе в систему
export async function loginUser(win: BrowserWindow | null, params: LoginParams): Promise<LoginResponse> {
    try {
        if (!params.password || !params.username) throw '[loginUser]>> INVALID_USER_DATA';
        // Получение экземпляра сервиса
        const userService = new UserService();
        
        // Поиск пользователя по username
        const user = await userService.findByUsername({ username: params.username })
        if (!user) {
            throw '[loginUser]>> NOT_EXISTS_RECORD';
        }
        // Проверка пароля
        const isVerifyPassword = await verify(params.password, user.password).catch((err) => {
            console.log('[loginUser]>> INTERNAL_ERROR', err);
        });
        // Если пароль верный то выписываем необходимые креды
        if (isVerifyPassword === true) {
            const readyUser = { ...user };
            Reflect.deleteProperty(readyUser, 'hash_salt');
            Reflect.deleteProperty(readyUser, 'password');

            // Формируется ключ шифрования баз данных уровня пользователь
            const keyDB = await encryptPragmaKey(params.username, params.password);
            storeTTL.set(
                GlobalNames.USER_PRAGMA_KEY, 
                keyDB, 
                Vars.USER_PRAGMA_KEY_TTL, 
                () => logoutIpc(win, { fromServer: true }),
            );

            // Формируем токен доступа
            const token = await createAccessToken({ 
                userId: readyUser.id, 
                username: readyUser.username 
            }, { m: SESSION_TTL });

            // вызов подготовки пользовательского хранилища
            await prepareUserStore(win, params.username);
            return {
                token: token,
                user: readyUser,
            } as LoginResponse;
        }
        // Иначе выкидываем ошибку
        else {
            throw '[loginUser]>> INVALID_CREDENTIALS';
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}