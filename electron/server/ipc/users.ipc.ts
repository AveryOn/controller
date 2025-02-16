import { BrowserWindow } from "electron";

/**
 * Обработка разлогина на сервере + отправка сигнала logout на клиент,
 * чтобы он также выполнил соответствующие процедуры по разлогину
 */
export function logoutIpc(win?: BrowserWindow | null) {
    if(!win) throw new Error('IPC > logoutIpc > win is not defined');

    win.webContents.send('logout');
}