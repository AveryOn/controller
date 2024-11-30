import type { Chapter, ChapterCreate, ChapterEditRequest, ChapterForMenu, DeleteChapterParams, DeleteSubChapterParams, GetChaptersParams, GetOneChapterParams, GetOneSubChapterParams, SubChapterCreate } from "../@types/entities/materials.types";

const TIMEOUT = 1003;
// Получить материлы с БД
export async function getChapters(params?: GetChaptersParams): Promise<ChapterForMenu[]> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(() => {
            try {
                resolve(window.electron.getChapters(params));
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Получить конкретный раздел
export async function getOneChapter(params: GetOneChapterParams): Promise<Chapter> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                resolve(await window.electron.getChapter(params));
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Получить конкретный ПОДраздел
export async function getOneSubChapter(params: GetOneSubChapterParams): Promise<{ chapter: Chapter, labels: string[] }> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                resolve(await window.electron.getOneSubChapter(params));
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Создание нового раздела
export async function createChapter(params: ChapterCreate) {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(() => {
            try {
                resolve(window.electron.createChapter(params));
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
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