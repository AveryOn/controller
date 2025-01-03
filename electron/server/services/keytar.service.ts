import { setPassword, deletePassword, getPassword, findPassword, findCredentials } from 'keytar'
const SERVICE_NAME = 'controller';

// Установить ключ
export async function setKey(account: string, password: string): Promise<boolean> {
    if(!account || !password) throw new Error('[keytar.setKey]>> account and password are required arguments');
    if(typeof account !== 'string' || typeof password !== 'string') throw new Error('[keytar.setKey]>> account and password must be strings');
    try {
        await setPassword(SERVICE_NAME, account, password);
        return true;
    } catch (err) {
        console.error('[keytar.setKey]>>', err);
        return false;
    }
}

// Удалить ключ
export async function deleteKey(account: string) {
    if(!account) throw new Error('[keytar.deleteKey]>> account is required argument');
    if(typeof account !== 'string') throw new Error('[keytar.deleteKey]>> account must be string');
    try {
        await deletePassword(SERVICE_NAME, account);
        return true
    } catch (err) {
        console.error('[keytar.deleteKey]>>', err);
        return false;
    }
}

// Получить сохраненный ключ для сервиса и аккаунта
export async function getKey(account: string): Promise<string | null> {
    if(!account) throw new Error('[keytar.getKey]>> account is required argument');
    if(typeof account !== 'string') throw new Error('[keytar.getKey]>> account must be string');
    try {
        return await getPassword(SERVICE_NAME, account);
    } catch (err) {
        console.error('[keytar.getKey]>>', err);
        return null;
    }
}

// Найти ключ для сервиса. Полезно когда аккаунт не нужен
export async function findKey(): Promise<string | null> {
    try {
        return await findPassword(SERVICE_NAME);
    } catch (err) {
        console.error('[keytar.findKey]>>', err);
        return null;
    }
}

// Получить все учетные данные аккаунтов в границах сервиса
export async function getAccounts(): Promise<Array<{ account: string, password: string }>> {
    try {
        return await findCredentials(SERVICE_NAME);
    } catch (err) {
        console.error('[keytar.getAccounts]>>', err);
        throw err;
    }
}