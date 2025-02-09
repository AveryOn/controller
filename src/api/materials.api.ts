import type { Chapter, ChapterCreate, ChapterEditRequest, ChapterForMenu, CreateChapterBlock, DeleteChapterBlock, DeleteChapterParams, DeleteSubChapterParams, EditChapterBlock, EditChapterBlockTitle, GetChapterBlocks, GetChaptersParams, GetOneChapterParams, GetOneSubChapterParams, SubChapterCreate } from "../@types/entities/materials.types";
import { useMaterialsStore } from "../stores/materials.store";

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
export async function getOneSubChapter(params: GetOneSubChapterParams): Promise<Chapter> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.getOneSubChapter(params, { token: localStorage.getItem('token') }));
        } catch (err) {
            reject(err);
        }
    });
}

// Создание нового раздела
export async function createChapter(params: ChapterCreate) {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.createChapter(params, { token: localStorage.getItem('token') });
                // await syncMaterials();
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
                const result = await window.electron.createSubChapter(params, { token: localStorage.getItem('token') });
                // await syncMaterials();  // Синхронизация подразделов с меню
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Синхронизация БД Материалов и БД Меню Материалов. Для того чтобы панель меню содержала актуальное состояние данных
export async function syncMaterials(): Promise<ChapterForMenu[]> {
    const materialStore = useMaterialsStore();
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const items: ChapterForMenu[] = await window.electron.syncMaterials({ token: localStorage.getItem('token') });
                materialStore.updateMenuItems(items); // Обновить состояние меню панели
                resolve(items);
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
                const result = await window.electron.editChapter(params, { token: localStorage.getItem('token') });
                // await syncMaterials();  // Синзронизация материалов в меню
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
                // await syncMaterials(); // Синхронизация данных в панели меню
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
                // await syncMaterials();  // Синхронизация панели меню материалов
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Получение блоков для раздела
export async function getChapterBlocksApi(params: GetChapterBlocks) {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.getChapterBlocks(params);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Создание нового блока для раздела
export async function createChapterBlockApi(params: CreateChapterBlock) {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.createChapterBlock(params);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Редактирование блока для раздела
export async function editChapterBlockApi(params: EditChapterBlock): Promise<Chapter[]> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.editChapterBlock(params);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Редактирование заголовка блока для раздела
export async function editChapterBlockTitleApi(params: EditChapterBlockTitle): Promise<Chapter[]> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.editChapterBlockTitle(params);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}

// Удаление блока из раздела
export async function deleteChapterBlockApi(params: DeleteChapterBlock): Promise<Chapter> {
    return new Promise((resolve, reject) => {
        // Иммитация того что запрос не настолько быстрый
        setTimeout(async () => {
            try {
                const result = await window.electron.deleteChapterBlock(params);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        }, TIMEOUT);
    });
}