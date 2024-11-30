import type { Chapter, ChapterEditRequest, ChapterForMenu, GetChaptersParams, GetOneChapterParams, GetOneSubChapterParams, SubChapterCreate } from "../@types/entities/materials.types";

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

// Получить конкретный ПОДраздел
export async function getOneSubChapter(params: GetOneSubChapterParams): Promise<{ chapter: Chapter, labels: string[] }> {
    try {
        return await window.electron.getOneSubChapter(params);
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

// Синхронизация БД Материалов и БД Меню Материалов. Для того чтобы панель меню содержала актуальное состояние данных
export async function syncMaterials(): Promise<ChapterForMenu[]> {
    try {
        return await window.electron.syncMaterials();
    } catch (err) {
        throw err; 
    }
}

// Редактирование данных раздела/подраздела
export async function editChapterApi(params: ChapterEditRequest): Promise<Chapter> {
    try {
        return await window.electron.editChapter(params);
    } catch (err) {
        throw err; 
    }
}