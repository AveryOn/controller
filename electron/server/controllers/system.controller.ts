import { BrowserWindow } from "electron";
import { prepareMaterialsStoreForMenu } from "./materials";
import { DatabaseManager } from "../database/manager";

// Подготовить хранилище пользователя
export async function prepareUserStore(win: BrowserWindow | null, username: string) {
    console.log('[prepareUserStore]>> ', username);
    try {
        let isReliableStores: boolean = true;
        const manager = DatabaseManager.instance();
        if(!await manager.initOnUser(username, { migrate: true })) isReliableStores = false;
        if(!await prepareMaterialsStoreForMenu(username)) isReliableStores = false;
        
        if(!win) console.debug('[prepareUserStore]>> win is null', win);
        win?.webContents.send('main-process-message', isReliableStores);
        console.log('ГОТОВНОСТЬ БАЗ ДАННЫХ:', isReliableStores);
    } catch (err) {
        console.error('[prepareUserStore]>> ', err);
        throw err;
    }
}