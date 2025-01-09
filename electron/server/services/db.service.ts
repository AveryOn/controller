// Сервис для менеджмента баз данных

import { initDB } from "./sqlite.service";

// Инициализация пользовательских баз данных
export async function initUserDataBases(username: string) {
    try {
        const db = await initDB('MATERIALS_DB_NAME', username);
    } catch (err) {
        throw err;
    }
}