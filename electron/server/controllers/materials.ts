import { writeFile, readFile, type FsOperationConfig } from "../services/fs.service";
import { encrypt, verify } from '../services/crypto.service';
import { app } from 'electron';
import { Chapter, ChapterCreate, ChapterForMenu, GetChapterOneParams, GetChaptersConfig, SubChapter, SubChapterCreate } from "../types/controllers/materials.types";
import { excludesWords, trimPath } from "../services/string.service";

const MATERIALS_FILENAME = 'materials.json';
const MATERIALS_MENU_FILENAME = 'materials-menu.json';
const FSCONFIG: FsOperationConfig = {
    directory: 'appData',
    encoding: 'utf-8',
    filename: MATERIALS_FILENAME,
    format: 'json',
}
const FSCONFIG_MENU: FsOperationConfig = {
    directory: 'appData',
    encoding: 'utf-8',
    filename: MATERIALS_MENU_FILENAME,
    format: 'json',
}

// Подготовить базу данных материалов
export async function prepareMaterialsStore(): Promise<boolean> {
    return readFile(FSCONFIG)
        .then((data) => {
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

// Подготовить базу данных для меню материалов
export async function prepareMaterialsStoreForMenu(): Promise<boolean> {
    return readFile(FSCONFIG_MENU)
        .then((data) => {
            return true;
        })
        .catch(async () => {
            try {
                await writeFile([], FSCONFIG_MENU);
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

// Получение данных сущности Материалы (Либо для панели меню, либо оригинальные данные)
export async function getChapters(params?: GetChaptersConfig): Promise<ChapterForMenu[] | Chapter[]> {
    try {
        // Если запрос шел от панели меню
        let chapters: ChapterForMenu[] | Chapter[];
        if(params?.forMenu === true) {
            chapters = await readFile(FSCONFIG_MENU);
        } 
        // Классическое получение данных
        else chapters = await readFile(FSCONFIG);
        // Если на текущий момент массива chapters нет то выкидываем ошибку
        if(!chapters!) throw '[getChapters]>> INTERNAL_ERROR';
        // Постраничный выбор данных
        if (params && params.page && params.perPage) {
            const right = params.perPage * params.page;
            const left = right - params.perPage;
            let chaptersChunk = chapters.slice(left, right); 
            return chaptersChunk;
        }
        return chapters;
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

// Поиск нужного подраздела по полному пути
function findLevel(items: SubChapter[], initPath: string[]): SubChapter | null {
    if(items.length <= 0) return null;
    const current = initPath.shift();
    console.log('current:', current);
    for (const chapter of items) {
        const selfPath = trimPath(chapter.fullpath, { split: true }).at(-1);
        console.log('selfPath:', selfPath);
        // Нашли нужный уровень
        if(selfPath === current) {
            console.log('НАшли нужный уровень', selfPath === current);
            // если исчерпан, то мы нашли искомый подраздел
            if(initPath.length <= 0) {
                return chapter;
            } 
            // Если путь еще не пуст, то продолжаем проходить по нему
            else {
                console.log('Путь еще не пуст:', initPath);
                if(chapter.items && chapter.items.length > 0) {
                    console.log('Выполняем поиск по items:', chapter.items.length);
                    return findLevel(chapter.items, initPath);
                }
                else {
                    throw `[Materials/findLevel]>> Ожидается, что items для "${selfPath}" не будет пустым, но он пуст`;
                }
            }
        } else {
            console.log('Нужный уровень не найден:', selfPath === current);
        }
    }
    return null;
}

// Создание нового подраздела
export async function createSubChapter(params: SubChapterCreate): Promise<SubChapter> {
    try {
        if(!params) throw '[createSubChapter]>> INVALID_INPUT_DATA';
        const materials: Chapter[] = await readFile(FSCONFIG);
        const chapter = materials.find((chapter) => chapter.id === params.chapterId);
        if(chapter?.chapterType === 'dir' && chapter.items) {
            const newSubChapter: SubChapter = {
                id: (chapter.items.length || 0) + 1,
                chapterType: params.chapterType,
                content: {
                    blocks: [],
                    title: null,
                },
                icon: params.icon,
                iconType: params.iconType,
                fullpath: params.fullpath,
                label: params.label,
                route: params.route,
                items: (params.chapterType === 'dir')? [] : null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
            const correctFullPath = trimPath(params.fullpath, { split: true }).slice(1, -1) as string[];
            // Если путь до подраздела пуст, значит, не существует подраздела в корневом разделе и его здесь и нужно создать 
            if(correctFullPath.length <= 0) {
                // Проверка на уникальность создаваемого подраздела
                const alreadyExists = chapter.items.find((subCh) => trimPath(subCh.fullpath) === trimPath(newSubChapter.fullpath));
                if(alreadyExists) throw '[createSubChapter]>> CONSTRAINT_VIOLATE_UNIQUE';
                chapter.items.push(newSubChapter);
            } else {
                console.log(chapter.items, correctFullPath);
                const needLevel = findLevel(chapter.items, correctFullPath);
                // Если нужный уровень не найден
                if(!needLevel) {
                    throw '[createSubChapter]>> Нужный уровень найти не удалось';
                }
                // Проверка на уникальность создаваемого подраздела
                const alreadyExists = chapter.items.find((subCh) => trimPath(subCh.fullpath) === trimPath(newSubChapter.fullpath));
                if(alreadyExists) throw '[createSubChapter]>> CONSTRAINT_VIOLATE_UNIQUE';
                needLevel.items?.push(newSubChapter);
            }
            // Запись изменений в БД
            await writeFile(materials, FSCONFIG);
            return newSubChapter; 
        } else {
            throw '[createSubChapter]>> INVALID_CHAPTER_TYPE';
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Синхронизация БД Материалов и БД Меню Материалов. Для того чтобы панель меню содержала актуальное состояние данных
export async function syncMaterialsStores(): Promise<ChapterForMenu[]> {
    console.log('syncMaterialsStores');
    function correctChapter(chapter: Chapter & SubChapter, initPathName?: string): ChapterForMenu {
        const { icon, iconType, id, label, pathName, fullpath, route, items } = chapter;
        return { icon, iconType, id, label, pathName: initPathName? initPathName : pathName, fullpath, route, items }
    };
    let pathName: string;
    function sync(chapters: Array<Chapter & SubChapter>): Array<ChapterForMenu> {
        return chapters.map((chapter) => {
            if(chapter.pathName && chapter.pathName !== pathName!) {
                pathName = chapter.pathName;
            }
            // Если подраздел является конечным файлом а не директорией
            if(chapter.chapterType === 'file' && !chapter.items) {
                return correctChapter(chapter, pathName);
            }
            // Если подраздел является директорией
            else if (chapter.chapterType === 'dir' && chapter.items) {
                // Если подраздел имеет свои подразделы
                if(chapter.items.length > 0) {
                    const syncCh = correctChapter(chapter, pathName);
                    syncCh.items = sync(chapter.items as Array<Chapter & SubChapter>);
                    return syncCh;
                }
                // Если подраздел не имеет подразделы
                else {
                    return correctChapter(chapter, pathName);
                }
            }
            else throw '[syncMaterialsStores]>> INVALID_CHAPTER_TYPE';
        });
    }
    try {
        // Получение исходных Данных Материалов
        const materials: Array<Chapter & SubChapter> = await readFile(FSCONFIG);
        // Синхронизация
        const syncMaterials:  Array<ChapterForMenu> = sync(materials);
        // Запись синхроинзованных данных в БД materials-menu
        await writeFile(syncMaterials, FSCONFIG_MENU);
        return syncMaterials;
    } catch (err) {
        console.error(err);
        throw err;
    }
}