
import { describe, expect, test } from 'vitest'
import { initDB } from '../../services/sqlite.service';
import { isExistFileOrDir } from '../../services/fs.service';
import { Database } from 'sqlite3';

// Тестирование сервиса sqlite 
describe('[Service: sqlite]', () => {

    // Тестирование initDB
    describe('Function: { initDB }', () => {
        test('initDB -> нет данных на вход', async () => {
            await expect(initDB()).rejects.toThrowError(/^\[sqlite.initDB\]>> invalid dbname$/);
        });
        test('initDB -> на вход аргумент неверного типа', async () => {
            await expect(initDB(123)).rejects.toThrowError(/^\[sqlite.initDB\]>> invalid dbname$/);
        });
        test('initDB -> верный ввод', async () => {
            const db = await initDB('MATERIALS_DB_NAME');
            expect(db instanceof Database).toBeTruthy();
        });
    });

});