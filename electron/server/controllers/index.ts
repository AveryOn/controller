import { resetMaterialDB } from "./materials";

type DbNames = 'materials' | 'users'

// Полностью сбросить данные
export async function resetAllDB(options?: { exclude: DbNames[] }) {
    console.log('[RESET ALL DATA]>> ...');
    try {
        if(!options?.exclude.includes('materials')) await resetMaterialDB(); // Сброс материалов
    } catch (err) {
        throw err;
    }
}
