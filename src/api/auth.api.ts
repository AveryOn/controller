import { ValidateAccessTokenParamsApi } from "../@types/entities/user.types";

// Валидация токена доступа
export async function validateAccessTokenApi(params: ValidateAccessTokenParamsApi): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            resolve(window.electron.validateAccessToken(params));
        } catch (err) {
            resolve(false);
        }
    });
}
