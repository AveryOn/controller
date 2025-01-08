import { resetMaterialDB } from "./materials";
import { resetUsersDB } from "./users";

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
