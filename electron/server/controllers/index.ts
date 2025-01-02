import { prepareMaterialsStore, prepareMaterialsStoreForMenu, resetMaterialDB } from "./materials";
import { prepareUsersStore, resetUsersDB } from "./users";

type DbNames = 'materials' | 'users'

// Полностью сбросить данные
export async function resetAllDB(options?: { exclude: DbNames[] }) {
    console.log('[RESET ALL DATA]>> ...');
    try {
        if(!options?.exclude.includes('materials')) await resetMaterialDB(); // Сброс материалов
        if(!options?.exclude.includes('users')) await resetUsersDB();   // Сбор пользователей
    } catch (err) {
        throw err;
    }
}

// Подготовить хранилище для пользователя
export async function prepareUserStorage(): Promise<boolean> {
    console.log('[prepareUserStorage]>> LOADING DATA...');
    try {
        let isReliableStores: boolean = true;
        isReliableStores = await prepareUsersStore();             // Users
        isReliableStores = await prepareMaterialsStore();         // Materials
        isReliableStores = await prepareMaterialsStoreForMenu()   // Materials For Menu
        return isReliableStores;
    } catch (err) {
        throw err;
    }
}