import { AccessTokenData, ExpiresToken } from "../types/services/tokens.types";
import { decryptJsonData, encryptJsonData } from "./crypto.service";

// Создать время со смещением вперед
function prepareExpireTime(expires: ExpiresToken) {
    let ready = 0;
    if(expires.Y) ready += 1000*60*60*24*365*Math.max(expires.Y, 1);
    if(expires.M) ready += 1000*60*60*24*30*Math.max(expires.M, 1);
    if(expires.d) ready += 1000*60*60*24*Math.max(expires.d, 1);
    if(expires.h) ready += 1000*60*60*Math.max(expires.h, 1);
    if(expires.m) ready += 1000*60*Math.max(expires.m, 1);
    if(expires.s) ready += 1000*Math.max(expires.s, 1);
    ready+=Date.now();
    return ready;
}

const KEY = process.env.APP_KEY || 'a6dc6870c9087fa5ce31cda27d5db3595bcccf1087624c73cdd2ab0efb398478bf706754400fb058e';
// Формирование токена доступа
export async function createAccessToken(payload: any, expires: ExpiresToken) {
    try {
        if(!payload || !expires) throw new Error('[createAccessToken]>> INVALID_INPUT');
        const expiresStamp: number = prepareExpireTime(expires);
        const token = await encryptJsonData({ payload, expires: expiresStamp }, KEY);
        return token;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Верификация токена доступа и получение payload
export async function verifyAccessToken(token: string): Promise<AccessTokenData> {
    try {
        if(!token) throw new Error('[verifyAccessToken]>> INVALID_INPUT');
        const payload: AccessTokenData = JSON.parse(await decryptJsonData(token, KEY));
        if(payload.expires <= Date.now()) {
            throw new Error('[verifyAccessToken]>> EXPIRES_LIFE_TOKEN');
        }
        return payload;
    } catch (err) {
        console.error(err);
        throw err;
    }
}
