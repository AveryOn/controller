import { BrowserWindow } from "electron";
import { prepareUsersStore } from "./users";
import { prepareMaterialsStore, prepareMaterialsStoreForMenu } from "./materials";
import { DatabaseManager } from "../database/manager";

// Подготовить хранилище пользователя
export async function prepareUserStore(win: BrowserWindow | null, username: string) {
    console.log('[prepareUserStore]>> ', username);
    try {
        let isReliableStores: boolean = true;
        const manager = DatabaseManager.instance();
        if(!await manager.initOnUser(username, { migrate: true })) isReliableStores = false;
        if(!await prepareUsersStore()) isReliableStores = false;
        // if(!await prepareMaterialsStore()) isReliableStores = false;
        // if(!await prepareMaterialsStoreForMenu()) isReliableStores = false;
        
        if(!win) console.debug('[prepareUserStore]>> win is null', win);
        win?.webContents.send('main-process-message', isReliableStores);
        console.log('ГОТОВНОСТЬ БАЗ ДАННЫХ:', isReliableStores);
    } catch (err) {
        console.error('[prepareUserStore]>> ', err);
        throw err;
    }
}