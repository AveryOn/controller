import { BrowserWindow } from "electron";
import { PrepareUserStorageParams } from "../types/controllers/system.types";
import { prepareUsersStore } from "./users";
import { prepareMaterialsStore, prepareMaterialsStoreForMenu } from "./materials";

// Подготовить хранилище пользователя
export async function prepareUserStore(win: BrowserWindow | null, params: PrepareUserStorageParams) {
    console.log('[prepareUserStore]>> ', params);
    try {
        let isReliableStores: boolean = true;
        isReliableStores = await prepareUsersStore();             // Users
        isReliableStores = await prepareMaterialsStore();         // Materials
        isReliableStores = await prepareMaterialsStoreForMenu()   // Materials For Menu
        
        if(!win) console.debug('[prepareUserStore]>> win is null', win);

        win?.webContents.send('main-process-message', isReliableStores);
        console.log('ГОТОВНОСТЬ БАЗ ДАННЫХ:', isReliableStores);
    } catch (err) {
        console.error('[prepareUserStore]>> ', err);
        throw err;
    }
}