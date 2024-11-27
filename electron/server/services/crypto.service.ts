import crypto from 'crypto';

// Параметры для scrypt
const keylen = 64;  // Длина ключа (хеша)
const N = 16384;    // Число итераций (можно увеличивать для усиления безопасности)
const r = 8;        // Параметр блока
const p = 1;        // Параметр параллельности

// Хеширование с помощью scrypt
export async function encrypt(input: string): Promise<{ hash: string, salt: string }> {
    return new Promise((resolve, reject) => {
        try {
            // Генерация соль
            const salt = crypto.randomBytes(16).toString('hex');  // Соль — случайная строка, которая добавляется к паролю
            crypto.scrypt(input, salt, keylen, { N, r, p }, (err, derivedKey) => {
                if (err) {
                    throw err;
                }
                // Вывод хеша и соли
                resolve({ hash: derivedKey.toString('hex'), salt: salt });
            });
        } catch (err) {
            reject(err);
        }
    });
}

// Верификация строки
export async function verify(input: string, salt: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            crypto.scrypt(input, salt, keylen, { N, r, p }, (err, derivedKey) => {
                if (err) throw err;
                // Проверка совпадения хешей
                if (derivedKey.toString('hex') === hash) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}