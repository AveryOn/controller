import { LocalVars } from "../@types/main.types";
import { clearSensitiveData } from "./web-api.utils";

/**
 * Выход из системы. Уборка клиентского мусора для разлогина
*/
export function logout(config?: { fromServer?: boolean }) {
    clearSensitiveData(); // сброс чувствительных данных в localStorage
    if(config?.fromServer === true) {
        window.location.reload();
    }
}

/**
 * Обновление токена доступа
 */
export function refreshToken(token: string) {
    localStorage.setItem(LocalVars.token, token)
}