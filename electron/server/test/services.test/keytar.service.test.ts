
import { describe, expect, test } from 'vitest'
import { setKey, getKey, deleteKey, findKey, getAccounts } from '../../services/keytar.service';

// Тестирование сервиса keytar (сервис работы с ключами)
describe('[Service: keytar]', () => {
    const PASSWORD = 'passwordtext123';
    const ACCOUNT = 'test_account';

    // Тестирование getKey
    describe('Function: { getKey }', () => {
        test('getKey -> нет данных на вход', async () => {
            await expect(getKey()).rejects.toThrowError(/^\[keytar.getKey\]>> account is required argument$/);
        });
        test('getKey -> на вход аргумент неверного типа', async () => {
            await expect(getKey(123)).rejects.toThrowError(/^\[keytar.getKey\]>> account must be string$/);
        });
        test('getKey -> верный ввод', async () => {
            const result = await getKey('__test_account__');
            expect(result).toBe(null);
        });
    });

    // Тестирование функции setKey
    describe('Function: { setKey }', () => {
        test('setKey -> нет данных на вход', async () => {
            await expect(setKey()).rejects.toThrowError(/^\[keytar.setKey\]>> account and password are required arguments$/);
        });
        test('setKey -> на вход только один аргумент', async () => {
            await expect(setKey('something')).rejects.toThrowError(/^\[keytar.setKey\]>> account and password are required arguments$/);
        });
        test('setKey -> на вход аргумент неверного типа', async () => {
            await expect(setKey('something', 123)).rejects.toThrowError(/^\[keytar.setKey\]>> account and password must be strings$/);
        });
        test('setKey -> верный ввод', async () => {
            const result = await setKey(ACCOUNT, PASSWORD);
            const getPswrd = await getKey(ACCOUNT);
            expect(result).toBeTruthy();
            expect(getPswrd).toBe(PASSWORD);
            await deleteKey(ACCOUNT);
        });
    });

    // Тестирование функции deleteKey
    describe('Function: { deleteKey }', () => {
        test('deleteKey -> нет данных на вход', async () => {
            await expect(deleteKey()).rejects.toThrowError(/^\[keytar.deleteKey\]>> account is required argument$/);
        });
        test('deleteKey -> на вход аргумент неверного типа', async () => {
            await expect(deleteKey(123)).rejects.toThrowError(/^\[keytar.deleteKey\]>> account must be string$/);
        });
        test('deleteKey -> верный ввод | удаление НЕсуществующего ключа', async () => {
            const result = await deleteKey('abc123');
            expect(result).toBeTruthy();
        });
        test('deleteKey -> верный ввод | удаление существующего ключа', async () => {
            await setKey(ACCOUNT+'1', PASSWORD);
            const result = await deleteKey(ACCOUNT+'1');
            const getPswrd = await getKey(ACCOUNT+'1');
            expect(result).toBeTruthy();
            expect(getPswrd).toBe(null);
        });
    });

    // Тестирование findKey
    describe('Function: { findKey }', () => {
        test('findKey -> верный ввод', async () => {
            const result = await findKey();
            expect(result).toBe(null);
        });
    });

    // Тестирование getAccounts
    describe('Function: { getAccounts }', () => {
        test('getAccounts -> верный ввод | аккаунтов нет', async () => {
            const result = await getAccounts();
            expect(result).toStrictEqual([]);
        });
        test('getAccounts -> верный ввод | аккаунты есть', async () => {
            // создать аккаунт
            await setKey('account1', 'hello123');
            await setKey('account2', 'hello122');
            const result = await getAccounts();
            expect(result).toStrictEqual([
                {
                    "account": "account2",
                    "password": "hello122",
                },
                {
                    "account": "account1",
                    "password": "hello123",
                },
            ]);
            await deleteKey('account1');
            await deleteKey('account2');
        });
    });
});