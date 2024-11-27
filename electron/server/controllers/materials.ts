import { writeFile, readFile, type FsOperationConfig } from "../services/fs.service";
import { encrypt, verify } from '../services/crypto.service';
import { app } from 'electron';
import { Chapter, ChapterCreate, ChapterForMenu, GetChapterOneParams, GetChaptersConfig } from "../types/controllers/materials.types";

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

// Сбросить все данные materials 
export async function resetMaterialDB() {
    try {
        await writeFile([], FSCONFIG);
    } catch (err) {
        console.error(err);
        throw err;
    }
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
            label: params.label,
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

export async function getChapters(params?: GetChaptersConfig): Promise<ChapterForMenu[]> {
    try {
        const formattedChapters = (items: Chapter[]) => {
            return items.map((chapter) => {
                return {
                    id: chapter.id,
                    icon: chapter.icon,
                    iconType: chapter.iconType,
                    label: chapter.label,
                    pathName: chapter.pathName,
                    route: chapter.route,
                    items: chapter.items,
                } as ChapterForMenu
            })
        }
        const chapters: Chapter[] = await readFile(FSCONFIG);
        // Получение с пагинацией
        if (params && params.page && params.perPage) {
            const right = params.perPage * params.page;
            const left = right - params.perPage;
            let chaptersChunk = chapters.slice(left, right); 
            return formattedChapters(chaptersChunk);
        }
        return formattedChapters(chapters);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Получение конкретного раздела
export async function getOneChapter(params: GetChapterOneParams): Promise<Chapter> {
    try {
        // Получение materials
        const materials: Chapter[] = await readFile(FSCONFIG);
        // Получение по ID
        if(params.chapterId) {
            const findedChapter = materials.find((chapter) => chapter.id === params.chapterId);
            if(!findedChapter) throw '[getOneChapter]>> NOT_EXISTS_RECORD';
            return findedChapter;
        } 
        // Получение по имени пути
        else if(params.pathName) {
            const findedChapter = materials.find((chapter) => chapter.pathName === params.pathName);
            if(!findedChapter) throw '[getOneChapter]>> NOT_EXISTS_RECORD';
            return findedChapter;
        } 
        else {
            throw '[getOneChapter]>> NOT_EXISTS_RECORD';
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}