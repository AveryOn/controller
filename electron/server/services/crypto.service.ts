import crypto from 'crypto';
import { variables } from '../../config/global';

// Параметры для scrypt
const KEYLEN = 64;  // Длина ключа (хеша)
const N = 16_384;    // Число итераций (можно увеличивать для усиления безопасности)
const R = 8;        // Параметр блока
const P = 1;        // Параметр параллельности

// Формирование одностороннего ключа шифрования для баз данных уровня пользователя
export async function encryptPragmaKey(username: string, password: string): Promise<string> {
    if(!username || typeof username !== 'string') throw new Error('invalid username');
    if(!password || typeof password !== 'string') throw new Error('invalid password');
    return new Promise((resolve, reject) => {
        try {
            const APP_KEY = variables.APP_KEY;
            if(!APP_KEY) throw new Error('APP_KEY is not defined');
            const S = crypto.createHash('sha256').update(username + APP_KEY).digest('hex');
            const I = 300_000;
            const key = crypto.pbkdf2Sync(password, S, I, KEYLEN, 'sha512').toString('hex');
            resolve(key);
        } catch (err) {
            reject(err);
        }
    })
}

// Хеширование с помощью scrypt
export async function encrypt(input: string): Promise<string> {
    if(!input) throw new Error('input - обязательный аргумент');
    if(typeof input !== 'string') throw new Error('input - должен быть типа string');
    return new Promise((resolve, reject) => {
        try {
            // Генерация соль
            const SALT = crypto.randomBytes(16).toString('hex');  // Соль — случайная строка, которая добавляется к паролю
            crypto.scrypt(input, SALT, KEYLEN, { N, r: R, p: P }, (err, derivedKey) => {
                if (err) {
                    throw err;
                }
                // Вывод хеша и соли
                const readyHash = SALT + derivedKey.toString('hex');
                resolve(readyHash);
            });
        } catch (err) {
            reject(err);
        }
    });
}

// Верификация строки
export async function verify(input: string, hash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if(!input || !hash) throw new Error('input, hash - обязательные аргмуенты');
        if(typeof input !== 'string' || typeof hash !== 'string') {
            throw new Error('аргументы input, hash должны быть типа string');
        }
        try {
            const SALT = hash.slice(0, 32);
            const readyHash = hash.slice(32);
            crypto.scrypt(input, SALT, KEYLEN, { N, r: R, p: P }, (err, derivedKey) => {
                if (err) throw err;
                // Проверка совпадения хешей
                if (derivedKey.toString('hex') === readyHash) {
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


// ########################  Работа с шифрованием файлов  ###########################
// Шифрование json-данных (Документоориентированных БД и пр.)
export async function encryptJsonData<T>(data: T, signature: string): Promise<string> {
    if(!data) throw new Error('[Services.encryptJsonData]>> NOT_DATA');
    if(!signature || typeof signature !== 'string') throw new Error('[Services.encryptJsonData]>> INVALID_SIGNATURE');
    return new Promise((resolve, reject) => {
        try {
            const ALG = 'aes-256-cbc';                                  // Алгоритм шифрования
            const SALT = crypto.randomBytes(16).toString('hex');        // Рандомная соль
            const KEY = crypto.scryptSync(signature, SALT, 32);         // Создаем ключ из пароля
            const IV = crypto.randomBytes(16);                          // Генерация случайного вектора
            // Подготовка данных
            let readyData: string | null = null;
            if(data && typeof data === 'object') {
                readyData = JSON.stringify(data);
            } 
            else {
                readyData = String(data);
            }
            // Шифрование данных
            const cipher = crypto.createCipheriv(ALG, KEY, IV);
            let encryptedData = cipher.update(readyData!, 'utf8', 'hex');
            readyData = null;
            encryptedData += cipher.final('hex');
            resolve(IV.toString('hex') + encryptedData + SALT);
        } catch (err) {
            reject(err);
        }
    });
}

// Расшифровка json-данных (Документоориентированных БД и пр.)
export async function decryptJsonData(data: string, signature: string): Promise<string> {
    if(!data) throw new Error('[Services.decryptJsonData]>> NOT_DATA');
    if(!signature || typeof signature !== 'string') throw new Error('[Services.decryptJsonData]>> INVALID_SIGNATURE');
    return new Promise((resolve, reject) => {
        try {
            const ALG = 'aes-256-cbc';                                  // Алгоритм шифрования
            const SALT = data.slice(data.length - 32);                  // Рандомная соль
            const KEY = crypto.scryptSync(signature, SALT, 32);         // Создаем ключ из пароля
            const IV = Buffer.from(data.slice(0, 32), 'hex');           // Генерация случайного вектора
            if(IV.length < 16) throw new Error('[Services.decryptJsonData]>> INVALID_INIT_VECTOR');
            // Подготовка данных
            let readyData: string | null = data.slice(32, data.length - 32);
            // Расшифровка данных
            const decipher = crypto.createDecipheriv(ALG, KEY, IV);
            let decryptedData = decipher.update(readyData!, 'hex', 'utf8');
            readyData = null;
            decryptedData += decipher.final('utf8');
            resolve(decryptedData);
        } catch (err) {
            reject(err);
        }
    });
}