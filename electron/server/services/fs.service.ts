import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';
import { fileURLToPath } from 'url';

export type UserDirectory = (string | {}) | "home" | "appData" | "userData" | "sessionData" | "temp" | "exe" | "module" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps";
export type FormatData = 'text' | 'json';
export interface FsOperationConfig {
    filename: string;
    directory: UserDirectory; 
    format: FormatData;
    encoding: BufferEncoding;
    customPath?: boolean;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Получает корневую директорию приложения (для хранения данных приложения)
export function getAppDirname() {
    return path.join(app.getPath('appData'), 'controller');
}

// Получает корневую директорию пользовательского хранилища
export function getAppUserDirname(username: string) {
    return path.join(app.getPath('appData'), 'controller', `user_${username}`);
}

// Получает корневую директорию работы приложения
export function getDistProjectDir() {
    return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'dist-electron')
    : __dirname;
}

// Запись в файл
export async function writeFile(data: any, config: FsOperationConfig): Promise<void> {
    try {
        let appDataDir: UserDirectory;
        if(config.customPath === true) {
            appDataDir = config.directory;
        }
        else {
            appDataDir = getAppDirname();
        }
        const filePath = path.join(appDataDir as string, config.filename);
        const correctData = (config.format === 'json') ? JSON.stringify(data) : data;
        return void await fs.writeFile(filePath, correctData, { encoding: config.encoding || 'utf-8' });
    } catch (err) {
        console.error('[writeFile]>>', err);
        throw err;
    }
}

// Чтение файла
export async function readFile(config: FsOperationConfig): Promise<any> {
    try {
        let appDataDir: UserDirectory;
        if(config.customPath === true) {
            appDataDir = config.directory;
        } else {
            appDataDir = getAppDirname();
        }
        const filePath = path.join(appDataDir as string, config.filename);
        const data = await fs.readFile(filePath, { encoding: config.encoding || 'utf-8' });
        return (config.format === 'json') ? JSON.parse(data) : data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Создать директорию
export async function mkDir(dirName: string): Promise<void> {
    try {
        const root = getAppDirname();
        const filePath = path.join(root, dirName);
        await fs.mkdir(filePath, { recursive: true });
    } catch (err) {
        throw err;
    }
}

// Прочитать содержимое директории
export async function readDir(dirName: string) {
    try {
        const root = getAppDirname();
        const filePath = path.join(root, dirName);
        const files = await fs.readdir(filePath, { withFileTypes: true });
        return files;
    } catch (err) {
        throw err;
    }
}

// Проверить существует ли директория или файл
// interface IsExistFileOrDirConfig {
//     root?: UserDirectory | (string & {}),
// }
export async function isExistFileOrDir(pathName: string, config?: { custom: boolean }): Promise<boolean> {
    if(!pathName) throw new Error('[isExistFileOrDir]>> pathName обязательный аргумент');
    try {
        let root: string;
        let fullPath: string;
        if(!config?.custom) {
            root = getAppDirname();
            fullPath = path.join(root, pathName);
        }
        else fullPath = pathName;
        await fs.access(fullPath, fs.constants.F_OK);
        return true;
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            return false;
        }
        else throw err;
    }
}