import { GetBlockByIdParams } from "../../electron/server/types/controllers/materials.types";
import type { 
    Block,
    Chapter, 
    ChapterBlock, 
    ChapterCreate, 
    ChapterEditRequest, 
    ChapterForMenu, 
    CreateChapterBlock, 
    DeleteChapterBlock, 
    DeleteChapterParams, 
    DeleteSubChapterParams, 
    EditChapterBlock, 
    GetChapterBlocks, 
    GetChaptersParams, 
    GetOneChapterParams, 
    GetOneSubChapterParams, 
    SubChapterCreate,
} from "../@types/entities/materials.types";
import { LocalVars } from "../@types/main.types";
import { useMaterialsStore } from "../stores/materials.store";

// Получить материалы с БД
export async function getChapters(params?: GetChaptersParams): Promise<ChapterForMenu[]> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.getChapters(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Получить конкретный раздел
export async function getOneChapter(params: GetOneChapterParams): Promise<Chapter> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.getChapter(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Получить конкретный ПОДраздел
export async function getOneSubChapter(params: GetOneSubChapterParams): Promise<Chapter> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.getOneSubChapter(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Создание нового раздела
export async function createChapter(params: ChapterCreate) {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.createChapter(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Создание нового подраздела
export async function createSubChapter(params: SubChapterCreate) {
    return new Promise((resolve, reject) => {
        try {
            const result = window.electron.createSubChapter(params, { token: localStorage.getItem(LocalVars.token) });
            resolve(result);
        } catch (err) {
            reject(err);
        }
    });
}

// Синхронизация БД Материалов и БД Меню Материалов. Для того чтобы панель меню содержала актуальное состояние данных
export async function syncMaterials(): Promise<ChapterForMenu[]> {
    const materialStore = useMaterialsStore();
    return new Promise(async (resolve, reject) => {
        try {
            const items: ChapterForMenu[] = await window.electron.syncMaterials({ token: localStorage.getItem(LocalVars.token) });
            materialStore.updateMenuItems(items); // Обновить состояние меню панели
            resolve(items);
        } catch (err) {
            reject(err);
        }
    });
}

// Редактирование данных раздела/подраздела
export async function editChapterApi(params: ChapterEditRequest): Promise<Chapter> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.editChapter(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Удаление раздела
export async function deleteChapterApi(params: DeleteChapterParams): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.deleteChapter(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Удаление подраздела
export async function deleteSubChapterApi(params: DeleteSubChapterParams): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.deleteSubChapter(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Получение блоков для раздела
export async function getOneBlockApi(params: GetBlockByIdParams): Promise<Block> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.getOneBlock(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Получение блоков для раздела
export async function getChapterBlocksApi(params: GetChapterBlocks): Promise<Array<ChapterBlock>> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.getChapterBlocks(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Получение блоков для подраздела
export async function getSubChapterBlocksApi(params: GetChapterBlocks): Promise<Array<ChapterBlock>> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.getSubChapterBlocks(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Создание нового блока для раздела
export async function createChapterBlockApi(params: CreateChapterBlock) {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.createChapterBlock(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Редактирование блока для раздела
export async function editChapterBlockApi(params: EditChapterBlock): Promise<Chapter[]> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.editChapterBlock(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}

// Удаление блока из раздела
export async function deleteChapterBlockApi(params: DeleteChapterBlock): Promise<Chapter> {
    return new Promise((resolve, reject) => {
        try {
            resolve(window.electron.deleteChapterBlock(params, { token: localStorage.getItem(LocalVars.token) }));
        } catch (err) {
            reject(err);
        }
    });
}