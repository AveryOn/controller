import type { Chapter, ChapterCreate, ChapterEditRequest, ChapterForMenu, DeleteChapterParams, DeleteSubChapterParams, GetChaptersParams, GetOneChapterParams, GetOneSubChapterParams, SubChapterCreate } from "../@types/entities/materials.types";

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

// Создание нового раздела
export async function createChapter(params: ChapterCreate) {
    try {
        return await window.electron.createChapter(params);
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

// Удаление раздела
export async function deleteChapterApi(params: DeleteChapterParams): Promise<void> {
    try {
        return await window.electron.deleteChapter(params);
    } catch (err) {
        throw err; 
    }
}

// Удаление подраздела
export async function deleteSubChapterApi(params: DeleteSubChapterParams): Promise<void> {
    try {
        return await window.electron.deleteSubChapter(params);
    } catch (err) {
        throw err; 
    }
}