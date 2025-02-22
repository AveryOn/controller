import { BrowserWindow } from "electron";
import { prepareMaterialsStoreForMenu } from "./materials";
import { DatabaseManager } from "../database/manager";
import { TTLStore } from "../services/ttl-store.service";
import { GlobalNames } from "../../config/global";

// Подготовить хранилище пользователя
export async function prepareUserStore(win: BrowserWindow | null, username: string) {
    try {
        let isReliableStores: boolean = true;
        const manager = DatabaseManager.instance();
        if(!await manager.initOnUser(username, { migrate: true })) isReliableStores = false;
        if(!await prepareMaterialsStoreForMenu(username)) isReliableStores = false;
        
        if(!win) console.debug('[prepareUserStore]>> win is null', win);
    } catch (err) {
        console.error('[prepareUserStore]>> ', err);
        throw err;
    }
}

/**
 * Проверка доступа к приложению
 */
export function checkAccess(): boolean {
    const store = TTLStore.getInstance()
    const { USER_PRAGMA_KEY, USER_TOKEN } = GlobalNames
    // В случае если пользовательского ключа для БД нет
    if(!store.get(USER_PRAGMA_KEY) || !store.get(USER_TOKEN)) {
        return false
    }
    return true
}