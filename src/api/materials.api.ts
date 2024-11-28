import type { Chapter, ChapterForMenu, GetChaptersParams, GetOneChapterParams, SubChapterCreate } from "../@types/entities/materials.types";

// Получить материлы с БД
export async function getChapters(params?: GetChaptersParams): Promise<ChapterForMenu[]> {
    try {
        return await window.electron.getChapters(params);
    } catch (err) {
        throw err;
    }
}

// Получить конкретный раздел
export async function getOneChapter(params: GetOneChapterParams): Promise<Chapter> {
    try {
        return await window.electron.getChapter(params);
    } catch (err) {
        throw err; 
    }
}

// Создание нового подраздела
export async function createSubChapter(params: SubChapterCreate) {
    try {
        return await window.electron.createSubChapter(params);
    } catch (err) {
        throw err; 
    }
}