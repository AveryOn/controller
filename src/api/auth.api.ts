import { ValidateAccessTokenParamsApi } from "../@types/entities/user.types";
import { LocalVars } from "../@types/main.types";

// Валидация токена доступа
export async function validateAccessTokenApi(): Promise<boolean> {
    return new Promise((resolve) => {
        try {
            const params: ValidateAccessTokenParamsApi = { token: localStorage.getItem(LocalVars.token) }
            resolve(window.electron.validateAccessToken(params));
        } catch (err) {
            resolve(false);
        }
    });
}
