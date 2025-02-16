
/**
 * Выход из системы. Уборка клиентского мусора для разлогина
*/
export function logout() {
    localStorage.clear(); // сброс данных в localStorage
    window.location.reload();
}