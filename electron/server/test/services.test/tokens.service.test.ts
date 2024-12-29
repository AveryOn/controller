import { describe, expect, test } from 'vitest'
import { createAccessToken, verifyAccessToken } from '../../services/tokens.service';


// Тестирование Сервиса токенов
describe('[Service: tokens]', () => {

    describe(`Function { ${createAccessToken.name} }`, () => {
        test(`${createAccessToken.name} -> нет данных на вход`, async () => {
            await expect(createAccessToken()).rejects.toThrowError('[createAccessToken]>> INVALID_INPUT');
        });

        test(`${createAccessToken.name} -> не передан expires`, async () => {
            await expect(createAccessToken({userId: 123})).rejects.toThrowError('[createAccessToken]>> INVALID_INPUT');
        });

        test(`${createAccessToken.name} -> payload верный. expires не верный 1`, async () => {
            await expect(createAccessToken({userId: 123}, {  })).rejects.toThrowError('[prepareExpireTime]>> INVALID_INPUT');
        });

        test(`${createAccessToken.name} -> payload верный. expires не верный 2`, async () => {
            await expect(createAccessToken({userId: 123}, { K: 150 })).rejects.toThrowError('[prepareExpireTime]>> INVALID_INPUT');
        });

        test(`${createAccessToken.name} -> payload верный. expires верный`, async () => {
            const token = await createAccessToken({userId: 123}, { h: 2 });
            expect(typeof token === 'string' && token.length > 0).toBe(true);
        });
    });

    describe(`Function { ${verifyAccessToken.name} }`, () => {
        test(`${verifyAccessToken.name} -> нет данных на вход`, async () => {
            await expect(verifyAccessToken()).rejects.toThrowError('[verifyAccessToken]>> INVALID_INPUT');
        });

        test(`${verifyAccessToken.name} -> token неверного типа`, async () => {
            await expect(verifyAccessToken(123)).rejects.toThrowError('[verifyAccessToken]>> INVALID_INPUT');
        });

        test(`${verifyAccessToken.name} -> token неверный`, async () => {
            await expect(verifyAccessToken('rabdom_string_123')).rejects.toThrowError('[Services.decryptJsonData]>> INVALID_INIT_VECTOR');
        });

        test(`${verifyAccessToken.name} -> token верный`, async () => {
            const payload = { userId: 123 }
            const token = await createAccessToken(payload, { d: 1 });
            const result = await verifyAccessToken(token);
            const isHasExpires = !!result.expires && typeof result.expires === 'number';
            expect(result.payload.userId).toBe(123);
            expect(isHasExpires).toBe(true);
        });
    });
});