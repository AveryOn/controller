import { BrowserWindow } from "electron";
import { TTLStore } from "../services/ttl-store.service";
import { GlobalNames } from "../../config/global";

/**
 * Обработка разлогина на сервере + отправка сигнала logout на клиент,
 * чтобы он также выполнил соответствующие процедуры по разлогину
 */
export function logoutIpc(win?: BrowserWindow | null, config?: { fromServer?: boolean }) {
    if(!win) throw new Error('IPC > logoutIpc > win is not defined');
    const store = TTLStore.getInstance()

    /**
     * Очистка таймера троттлера при разлогине. Чтобы он не вызывался когда приложение перешло на страницу авторизации
     */
    const TimerRef = store.get(GlobalNames.THROTTLER_TIMER) as NodeJS.Timeout;
    clearTimeout(TimerRef);
    store.cleanup();
    win.webContents.send('logout', config);
}

/**
 * Отправка клиенту сигнала для обновления токена
 * @param token - битый токен
 * @param win - экземпляр окна через который идет отправка сигнала
 */
export function refreshTokenIpc(token: string, win?: BrowserWindow | null) {
    if(!win) throw new Error('IPC > refreshTokenIpc > win is not defined');
    win.webContents.send('refresh-token', token);
}