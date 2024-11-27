import { writeFile, readFile, type FsOperationConfig } from "../services/fs.service";
import { encrypt, verify } from '../services/crypto.service';
import { app } from 'electron';
import { Chapter, ChapterCreate } from "../types/controllers/materials.types";

const MATERIALS_FILENAME = 'materials.json';
const FSCONFIG: FsOperationConfig = {
    directory: 'appData',
    encoding: 'utf-8',
    filename: MATERIALS_FILENAME,
    format: 'json',
}

// Подгтововить базу данных материалов
export async function prepareMaterialsStore(): Promise<boolean> {
    return readFile(FSCONFIG)
        .then((data) => {
            console.log(data);
            return true;
        })
        .catch(async () => {
            try {
                await writeFile([], FSCONFIG);
                return true;
            } catch (err) {
                console.error('WRITE FILE', err);
                return false;
            }
        });
}

// Создание нового раздела в материалах
export async function createChapter(params: ChapterCreate) {
    try {
        // Получние материалов с БД
        const materials: Chapter[] = await readFile(FSCONFIG);
        // Проверка на уникальность pathName в БД
        materials.forEach((chapter: Chapter) => {
            if(chapter.pathName === params.pathName) {
                throw '[createChapter]>> CONSTRAINT_VIOLATE_UNIQUE';
            }
        });

        // Создание нового экзепляра раздела
        const timestamp = new Date().toISOString();
        const newChapter: Chapter = {
            id: (materials.length || 0) + 1,
            chapterType: params.chapterType,
            content: {
                blocks: [],
                title: null,
            },
            icon: params.icon,
            iconType: params.iconType,
            pathName: params.pathName,
            route: params.route,
            items: (params.chapterType === 'dir') ? [] : null,
            createdAt: timestamp,
            updatedAt: timestamp,
        }
        materials.push(newChapter);
        await writeFile(materials, FSCONFIG);
        return newChapter;
    } catch (err) {
        console.error(err);
        throw err;
    }
}