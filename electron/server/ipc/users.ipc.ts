import { BrowserWindow } from "electron";
import { TTLStore } from "../services/ttl-store.service";

/**
 * Обработка разлогина на сервере + отправка сигнала logout на клиент,
 * чтобы он также выполнил соответствующие процедуры по разлогину
 */
export function logoutIpc(win?: BrowserWindow | null) {
    if(!win) throw new Error('IPC > logoutIpc > win is not defined');
    const store = TTLStore.getInstance()
    store.cleanup()
    win.webContents.send('logout');
}