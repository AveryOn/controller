import UserService from "../database/services/users.service";
import { encryptPragmaKey, verify } from "../services/crypto.service";
import { createAccessToken, verifyAccessToken } from "../services/tokens.service";
import { ValidateAccessTokenParams } from "../types/controllers/auth.types";
import { LoginParams, LoginResponse } from "../types/controllers/users.types";
import { ExpiresToken } from "../types/services/tokens.types";
import { prepareUserStore } from "./system.controller";
import { BrowserWindow } from "electron";

// Валидация токена доступа
export async function validateAccessToken(params: ValidateAccessTokenParams) {
    console.log('[validateAccessToken] =>', params);
    try {
        if(!params?.token) throw '[validateAccessToken]>> INVALID_DATA';
        return !!(await verifyAccessToken(params.token));
    } catch (err) {
        console.error(err);
        return false
    }
}


// Подтверждение учетных данных пользователя при входе в систему
export async function loginUser(win: BrowserWindow | null, params: LoginParams, config: { expiresToken: ExpiresToken }): Promise<LoginResponse> {
    console.log('[loginUser] =>', params);

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
            console.log('KEY CIPHER', keyDB);
            

            // Формируем токен доступа
            const token = await createAccessToken({ 
                userId: readyUser.id, 
                username: readyUser.username 
            }, config.expiresToken);

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