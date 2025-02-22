/**
 * Выход из системы. Уборка клиентского мусора для разлогина
*/
export function logout(config?: { fromServer?: boolean }) {
    localStorage.clear(); // сброс данных в localStorage
    if(config?.fromServer === true) {
        window.location.reload();
    }
}

/**
 * Обновление токена доступа
 */
export function refreshToken(token: string) {
    localStorage.setItem('token', token)
}