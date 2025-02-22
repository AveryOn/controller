/**
 * Выход из системы. Уборка клиентского мусора для разлогина
*/
export function logout() {
    localStorage.clear(); // сброс данных в localStorage
}

/**
 * Обновление токена доступа
 */
export function refreshToken(token: string) {
    localStorage.setItem('token', token)
}