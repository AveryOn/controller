
import { describe, expect, test } from 'vitest'
import { decryptJsonData, encrypt, encryptJsonData, verify } from '../../services/crypto.service'

// Тестирование сервиса криптографии (crypto)
describe('[Service: crypto]', () => {
    // Тестирование функции encrypt
    describe('Function: { encrypt }', () => {
        test('encrypt -> нет данных на вход', async () => {
            await expect(encrypt()).rejects.toThrowError(/^input - обязательный аргумент$/);
        });
        test('encrypt -> на вход число', async () => {
            await expect(encrypt(123)).rejects.toThrowError(/^input - должен быть типа string$/);
        });
        test('encrypt -> на вход строка', async () => {
            const result = await encrypt('simple_text');
            expect(result).not.toBeNull();
            expect(typeof result === 'object').toBeTruthy();
        });
    });

    // Тестирование функции verify
    describe('Function: { verify }', () => {
        test('verify -> нет данных на вход', async () => {
            await expect(verify()).rejects.toThrowError(/^input, salt, hash - обязательные аргмуенты$/);
        });
        test('verify -> для input передано число', async () => {
            await expect(verify(123)).rejects.toThrowError(/^input, salt, hash - обязательные аргмуенты$/);
        });
        test('verify -> input: number, salt: string, hash: string', async () => {
            await expect(verify(123, 'text', 'text')).rejects.toThrowError(/^аргументы input, salt, hash должны быть типа string$/);
        });
        test('verify -> все аргументы строки', async () => {
            expect(await verify('text', 'text', 'text')).toBe(false);
        });
        test('verify -> все аргументы верные', async () => {
            const { hash, salt } = await encrypt('sample');
            expect(await verify('sample', salt, hash)).toBe(true);
        });
    });

    // Тестирование функции encryptJsonData
    describe('Function: { encryptJsonData }', () => {
        test('encryptJsonData -> нет данных на вход', async () => {
            await expect(encryptJsonData()).rejects.toThrowError('[Services.encryptJsonData]>> NOT_DATA');
        });
        test('encryptJsonData -> для data объект, второй пуст', async () => {
            await expect(encryptJsonData({ key: 'text' })).rejects.toThrowError('[Services.encryptJsonData]>> INVALID_SIGNATURE');
        });
        test('encryptJsonData -> для data объект, второй число', async () => {
            await expect(encryptJsonData({ key: 'text' }, 123)).rejects.toThrowError('[Services.encryptJsonData]>> INVALID_SIGNATURE');
        });
        test('encryptJsonData -> Аргументы правильного типа', async () => {
            const result = await encryptJsonData({ key: 'text' }, 'signature');
            // result ~ 9582dd17ff79b8794acc500bed3d1356026aa1bfa5b08eb636164bac37666b2f
            expect(typeof result === 'string').toBeTruthy();
            expect(result.length).toBe(64);
        });
        test('encryptJsonData -> для data число', async () => {
            const result = await encryptJsonData(123, 'signature');
            // result ~ 9582dd17ff79b8794acc500bed3d1356026aa1bfa5b08eb636164bac37666b2f
            expect(typeof result === 'string').toBeTruthy();
            expect(result.length).toBe(64);
        });
        test('encryptJsonData -> для data boolean', async () => {
            const result = await encryptJsonData(true, 'signature');
            // result ~ 9582dd17ff79b8794acc500bed3d1356026aa1bfa5b08eb636164bac37666b2f
            expect(typeof result === 'string').toBeTruthy();
            expect(result.length).toBe(64);
        });
        test('encryptJsonData -> для data Array', async () => {
            const result = await encryptJsonData(['abc', 123, {}, [], false, null, undefined], 'signature');
            expect(typeof result === 'string').toBeTruthy();
            expect(result.length).toBe(128);
        });
    });
    // Тестирование функции decryptJsonData
    describe('Function: { decryptJsonData }', () => {
        test('decryptJsonData -> нет данных на вход', async () => {
            await expect(decryptJsonData()).rejects.toThrowError('[Services.decryptJsonData]>> NOT_DATA');
        });
        test('decryptJsonData -> для data объект, второй пуст', async () => {
            await expect(decryptJsonData({ key: 'text' })).rejects.toThrowError('[Services.decryptJsonData]>> INVALID_SIGNATURE');
        });
        test('decryptJsonData -> для data объект, второй число', async () => {
            await expect(decryptJsonData({ key: 'text' }, 123)).rejects.toThrowError('[Services.decryptJsonData]>> INVALID_SIGNATURE');
        });
        test('decryptJsonData -> на вход правильные данные (object)', async () => {
            const result = await encryptJsonData({ key: 'text' }, 'signature');
            const decrypt = await decryptJsonData(result, 'signature');
            expect(decrypt).toBe(JSON.stringify({ key: 'text' }));
        });
        test('decryptJsonData -> на вход правильные данные (string)', async () => {
            const result = await encryptJsonData('payload', 'signature');
            const decrypt = await decryptJsonData(result, 'signature');
            expect(decrypt).toBe('payload');
        });
        test('decryptJsonData -> на вход правильные данные (number)', async () => {
            const result = await encryptJsonData(123, 'signature');
            const decrypt = await decryptJsonData(result, 'signature');
            expect(decrypt).toBe('123');
        });
        test('decryptJsonData -> на вход правильные данные (boolean)', async () => {
            const result = await encryptJsonData(true, 'signature');
            const decrypt = await decryptJsonData(result, 'signature');
            expect(decrypt).toBe('true');
        });
        test('decryptJsonData -> на вход неверный шифр 1 (string)', async () => {
            await expect(decryptJsonData('antoher', 'signature'))
                .rejects
                .toThrowError('[Services.decryptJsonData]>> INVALID_INIT_VECTOR');
        });
        test('decryptJsonData -> на вход неверный шифр 2 (string)', async () => {
            const inp = '9582dd17ff79bhfhfacc500bed3d1888826aa1bfa5b08eb636164bac37666b2f'
            await expect(decryptJsonData(inp, 'signature'))
                .rejects
                .toThrowError('[Services.decryptJsonData]>> INVALID_INIT_VECTOR');
        });
    });
});