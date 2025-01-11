import { ValidateAccessTokenParamsApi } from "../@types/entities/user.types";

const TIMEOUT = 1000;
// Валидация токена доступа
export async function validateAccessTokenApi(params: ValidateAccessTokenParamsApi): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.validateAccessToken(params));
        } catch (err) {
            resolve(false);
        }
    });
}
