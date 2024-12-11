import crypto from 'crypto';

// Параметры для scrypt
const KEYLEN = 64;  // Длина ключа (хеша)
const N = 16384;    // Число итераций (можно увеличивать для усиления безопасности)
const R = 8;        // Параметр блока
const P = 1;        // Параметр параллельности

// Хеширование с помощью scrypt
export async function encrypt(input: string): Promise<{ hash: string, salt: string }> {
    if(!input) throw new Error('input - обязательный аргумент');
    if(typeof input !== 'string') throw new Error('input - должен быть типа string');
    return new Promise((resolve, reject) => {
        try {
            // Генерация соль
            const salt = crypto.randomBytes(16).toString('hex');  // Соль — случайная строка, которая добавляется к паролю
            crypto.scrypt(input, salt, KEYLEN, { N, r: R, p: P }, (err, derivedKey) => {
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
        if(!input || !salt || !hash) throw new Error('input, salt, hash - обязательные аргмуенты');
        if(typeof input !== 'string' || typeof salt !== 'string' || typeof hash !== 'string') {
            throw new Error('аргументы input, salt, hash должны быть типа string');
        }
        try {
            crypto.scrypt(input, salt, KEYLEN, { N, r: R, p: P }, (err, derivedKey) => {
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