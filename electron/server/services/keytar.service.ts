import { setPassword, deletePassword, getPassword, findPassword, findCredentials } from 'keytar'
const SERVICE_NAME = 'controller';

// Установить ключ
export async function setKey(account: string, password: string): Promise<boolean> {
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
    try {
        return await deletePassword(SERVICE_NAME, account);
    } catch (err) {
        console.error('[keytar.deleteKey]>>', err);
        return false;
    }
}

// Получить сохраненный ключ для сервиса и аккаунта
export async function getKey(account: string): Promise<string | null> {
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
export async function getAccounts(): Promise<Array<{account: string, password: string}>> {
    try {
        return await findCredentials(SERVICE_NAME);
    } catch (err) {
        console.error('[keytar.getAccounts]>>', err);
        throw err;
    }
}