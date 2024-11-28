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



// ########################  Работа с шифрованием файлов  ###########################
// Шифрование json-данных (Документоориентированных БД и пр.)
export async function encryptJsonData<T>(data: T, signature: string): Promise<string> {
    if(!data) throw '[Services.encryptJsonData]>> NOT_DATA';
    if(!signature) throw '[Services.encryptJsonData]>> INVALID_SIGNATURE';
    return new Promise((resolve, reject) => {
        try {
            const ALG = 'aes-256-cbc';                               // Алгоритм шифрования
            const KEY = crypto.scryptSync(signature, 'salt_NOT_SECURE', 32);    // Создаем ключ из пароля
            const IV = crypto.randomBytes(16);                       // Генерация случайного IV
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
            resolve(IV.toString('hex') + encryptedData);
        } catch (err) {
            reject(err);
        }
    });
}

// Расшифровка json-данных (Документоориентированных БД и пр.)
export async function decryptJsonData(data: string, signature: string): Promise<string> {
    if(!data) throw '[Services.decryptJsonData]>> NOT_DATA';
    if(!signature) throw '[Services.decryptJsonData]>> INVALID_SIGNATURE';
    return new Promise((resolve, reject) => {
        try {
            const ALG = 'aes-256-cbc';                               // Алгоритм шифрования
            const KEY = crypto.scryptSync(signature, 'salt_NOT_SECURE', 32);    // Создаем ключ из пароля
            const IV = Buffer.from(data.slice(0, 32), 'hex');
            // Подготовка данных
            let readyData: string | null = data.slice(32);
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