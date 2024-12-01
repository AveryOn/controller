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
        }, 0);
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
        }, 0);
    });
}

// Создание нового раздела
export async function createChapter(params: ChapterCreate) {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.createChapter(params);
                await syncMaterials();
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Создание нового подраздела
export async function createSubChapter(params: SubChapterCreate) {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.createSubChapter(params);
                await syncMaterials();  // Синхронизация подразделов с меню
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Синхронизация БД Материалов и БД Меню Материалов. Для того чтобы панель меню содержала актуальное состояние данных
export async function syncMaterials(): Promise<ChapterForMenu[]> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(() => {
            try {
                resolve(window.electron.syncMaterials());
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Редактирование данных раздела/подраздела
export async function editChapterApi(params: ChapterEditRequest): Promise<Chapter> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.editChapter(params);
                await syncMaterials();  // Синзронизация материалов в меню
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Удаление раздела
export async function deleteChapterApi(params: DeleteChapterParams): Promise<void> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.deleteChapter(params);
                await syncMaterials(); // Синхронизация данных в панели меню
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Удаление подраздела
export async function deleteSubChapterApi(params: DeleteSubChapterParams): Promise<void> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.deleteSubChapter(params);
                await syncMaterials();  // Синхронизация панели меню материалов
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}