import path from 'path';
import fs from 'fs/promises';
import { app } from 'electron';

export type UserDirectory = "home" | "appData" | "userData" | "sessionData" | "temp" | "exe" | "module" | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos" | "recent" | "logs" | "crashDumps";
export type FormatData = 'text' | 'json';
export interface FsOperationConfig {
    filename: string;
    directory: UserDirectory; 
    format: FormatData;
    encoding: BufferEncoding;
}

// Запись в файл
export async function writeFile(data: any, config: FsOperationConfig): Promise<void> {
    try {
        const userDataDir = app.getPath(config.directory);
        const filePath = path.join(userDataDir, config.filename);
        const correctData = (config.format === 'json') ? JSON.stringify(data) : data;
        return void await fs.writeFile(filePath, correctData, { encoding: config.encoding || 'utf-8' });
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Чтение файла
export async function readFile(config: FsOperationConfig): Promise<any> {
    try {
        const userDataDir = app.getPath(config.directory);
        const filePath = path.join(userDataDir, config.filename);
        const data = await fs.readFile(filePath, { encoding: config.encoding || 'utf-8' });
        return (config.format === 'json') ? JSON.parse(data) : data;
    } catch (err) {
        console.error(err);
        throw err;
    }
}