import { writeFile, readFile, type FsOperationConfig } from "../services/fs.service";
import { encrypt, verify } from '../services/crypto.service';
import { Chapter, ChapterCreate, ChapterForMenu, DeleteChapterParams, DeleteResponseMessage, EditChapterParams, GetChapterOneParams, GetChaptersConfig, GetSubChapterOneParams, SubChapter, SubChapterCreate } from "../types/controllers/materials.types";
import { trimPath } from "../services/string.service";
import { formatDate } from "../services/date.service";

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
    console.log('prepareMaterialsStore');
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
    console.log('prepareMaterialsStoreForMenu');
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
    console.log('resetMaterialDB');
    try {
        await writeFile([], FSCONFIG);
        await writeFile([], FSCONFIG_MENU);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Создание нового раздела в материалах
export async function createChapter(params: ChapterCreate) {
    console.log('createChapter => ', params);
    try {
        // Получние материалов с БД
        const materials: Chapter[] = await readFile(FSCONFIG);
        // Проверка на уникальность pathName в БД
        materials.forEach((chapter: Chapter) => {
            if (chapter.pathName === params.pathName) {
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
    console.log('getChapters => ', params);
    try {
        // Если запрос шел от панели меню
        let chapters: ChapterForMenu[] | Chapter[];
        if (params?.forMenu === true) {
            chapters = await readFile(FSCONFIG_MENU);
        }
        // Классическое получение данных
        else chapters = await readFile(FSCONFIG);
        // Если на текущий момент массива chapters нет то выкидываем ошибку
        if (!chapters!) throw '[getChapters]>> INTERNAL_ERROR';
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
    console.log('getOneChapter => ', params);
    try {
        // Получение materials
        const materials: Chapter[] = await readFile(FSCONFIG);
        // Получение по ID
        if (params.chapterId) {
            const findedChapter = materials.find((chapter) => chapter.id === params.chapterId);
            if (!findedChapter) throw '[getOneChapter]>> NOT_EXISTS_RECORD';
            return findedChapter;
        }
        // Получение по имени пути
        else if (params.pathName) {
            const findedChapter = materials.find((chapter) => chapter.pathName === params.pathName);
            if (!findedChapter) throw '[getOneChapter]>> NOT_EXISTS_RECORD';
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
interface LevelWithLabels { chapter: SubChapter, labels: string[] }
type FindLevelResult = SubChapter | null | LevelWithLabels;
const bundleLabels: string[] = [];
function findLevel(items: SubChapter[], initPath: string[], config?: { labels?: boolean }): FindLevelResult {
    if (items.length <= 0) return null;
    const current = initPath.shift();
    for (const chapter of items) {
        const selfPath = trimPath(chapter.fullpath, { split: true }).at(-1);
        // Нашли нужный уровень
        if (selfPath === current) {
            // Собираем массив название разделов, если на клиенте был на это запрос
            if (config?.labels === true) bundleLabels.push(chapter.label);
            // если исчерпан, то мы нашли искомый подраздел
            if (initPath.length <= 0) {
                if (config?.labels === true) {
                    const labels = [...bundleLabels];
                    bundleLabels.length = 0;
                    return { chapter, labels: labels };
                }
                else {
                    return chapter;
                }
            }
            // Если путь еще не пуст, то продолжаем проходить по нему
            else {
                if (chapter.items && chapter.items.length > 0) {
                    return findLevel(chapter.items, initPath, config);
                }
                else {
                    throw `[Materials/findLevel]>> Ожидается, что items для "${selfPath}" не будет пустым, но он пуст`;
                }
            }
        }
    }
    return null;
}

// Создание нового подраздела
export async function createSubChapter(params: SubChapterCreate): Promise<SubChapter> {
    try {
        if (!params) throw '[createSubChapter]>> INVALID_INPUT_DATA';
        const materials: Chapter[] = await readFile(FSCONFIG);
        const chapter = materials.find((chapter) => chapter.pathName === params.pathName);
        if (chapter?.chapterType === 'dir' && chapter.items) {
            const newSubChapter: SubChapter = {
                id: Date.now(),
                chapterType: params.chapterType,
                content: {
                    blocks: [],
                    title: null,
                },
                icon: params.icon,
                iconType: params.iconType,
                fullpath: trimPath(params.fullpath) as string,
                label: params.label,
                route: params.route,
                items: (params.chapterType === 'dir') ? [] : null,
                createdAt: formatDate(),
                updatedAt: formatDate(),
            }
            const correctFullPath = trimPath(params.fullpath, { split: true }).slice(1, -1) as string[];
            // Если путь до подраздела пуст, значит, не существует подраздела в корневом разделе и его здесь и нужно создать 
            if (correctFullPath.length <= 0) {
                // Проверка на уникальность создаваемого подраздела
                const alreadyExists = chapter.items.find((subCh) => trimPath(subCh.fullpath) === trimPath(newSubChapter.fullpath));
                if (alreadyExists) throw '[createSubChapter]>> CONSTRAINT_VIOLATE_UNIQUE';
                chapter.items.push(newSubChapter);
            } else {
                const needLevel = findLevel(chapter.items, correctFullPath) as SubChapter | null;
                // Если нужный уровень не найден
                if (!needLevel) {
                    throw '[createSubChapter]>> Нужный уровень найти не удалось';
                }
                // Проверка на уникальность создаваемого подраздела
                const alreadyExists = chapter.items.find((subCh) => trimPath(subCh.fullpath) === trimPath(newSubChapter.fullpath));
                if (alreadyExists) throw '[createSubChapter]>> CONSTRAINT_VIOLATE_UNIQUE';
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
    console.log('[syncMaterialsStores]');
    function correctChapter(chapter: Chapter & SubChapter, initPathName?: string): ChapterForMenu {
        const { icon, iconType, id, label, pathName, fullpath, route, items } = chapter;
        return { icon, iconType, id, label, pathName: initPathName ? initPathName : pathName, fullpath, route, items }
    };
    let pathName: string;
    function sync(chapters: Array<Chapter & SubChapter>): Array<ChapterForMenu> {
        return chapters.map((chapter) => {
            if (chapter.pathName && chapter.pathName !== pathName!) {
                pathName = chapter.pathName;
            }
            // Если подраздел является конечным файлом а не директорией
            if (chapter.chapterType === 'file' && !chapter.items) {
                return correctChapter(chapter, pathName);
            }
            // Если подраздел является директорией
            else if (chapter.chapterType === 'dir' && chapter.items) {
                // Если подраздел имеет свои подразделы
                if (chapter.items.length > 0) {
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
        const syncMaterials: Array<ChapterForMenu> = sync(materials);
        // Запись синхроинзованных данных в БД materials-menu
        await writeFile(syncMaterials, FSCONFIG_MENU);
        return syncMaterials;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Получить конкретный ПОДраздел с БД материалов
export async function getOneSubChapter(params: GetSubChapterOneParams): Promise<LevelWithLabels> {
    console.log('[getOneSubChapter] => ', params);
    try {
        // Получение материалов с БД
        const materials: Chapter[] = await readFile(FSCONFIG);
        const chapter = materials.find((chapter) => chapter.pathName === params.pathName);
        if (chapter?.items && chapter.items.length) {
            const correctFullpath = trimPath(params.fullpath, { split: true }).slice(1) as string[];
            const { chapter: findedChapter, labels } = findLevel(chapter?.items, correctFullpath, { labels: true }) as LevelWithLabels;
            if (!findedChapter) throw '[getOneSubChapter]>> NOT_FOUND';
            labels.unshift(chapter.label);
            return { chapter: findedChapter, labels };
        }
        else throw '[getOneSubChapter]>> INTERNAL_ERROR';
    } catch (err) {
        console.error(err);
        throw err;
    }
}


// Обновить Раздел/Подраздел данными из входных параметров
function updateChapter(chapter: Chapter | SubChapter, params: EditChapterParams['params']) {
    try {
        if(params.chapterType) chapter.chapterType = params.chapterType;
        if(params.icon) chapter.icon = params.icon;
        if(params.iconType) chapter.iconType = params.iconType;
        if(params.label) chapter.label = params.label;
        if(params.pathName && chapter.pathName) chapter.pathName = params.pathName;
    } catch (err) {
        console.error('[editChapter]>> Ошибка при обновлении раздела/подраздела');
        throw err
    }
}
// Редактирование общих данных раздела/подраздела
export async function editChapter(input: EditChapterParams): Promise<Chapter | SubChapter> {
    console.log('[editChapter] => ', input);
    try {
        const { params, fullpath, pathName } = input;
        // Получение материалов с БД
        const materials: Chapter[] = await readFile(FSCONFIG);
        // Редактирование раздела
        if (!fullpath && pathName) {
            let findedChapter = materials.find((chapter) => chapter.pathName === pathName);
            if (findedChapter) {
                // Доп защита для избежания изменения типа раздела с dir на file. Чтобы директория не лишилась данных 
                if (params.chapterType === 'file' && findedChapter.chapterType === 'dir') {
                    throw '[editChapter]>> INVALID_CHAPTER_TYPE[1]';
                }
                updateChapter(findedChapter, params);
                if (params.chapterType === 'dir') findedChapter.items = [];
                // Обновляем updatedAt
                findedChapter.updatedAt = new Date().toISOString();
                // запись изменений в БД
                await writeFile(materials, FSCONFIG);
                return findedChapter;
            }
            else throw '[editChapter]>> NOT_FOUND';
        }
        // Редактирование ПОДразделов
        else if (fullpath && pathName) {
            const correctPath = trimPath(fullpath, { split: true }) as string[];
            const root: string = correctPath[0];
            const findedChapter = materials.find((chapter) => chapter.pathName === root);
            const lastPath: string[] = correctPath.slice(1);
            if (findedChapter?.items) {
                let subchapter = findLevel(findedChapter.items, lastPath) as SubChapter;
                // Доп защита для избежания изменения типа раздела с dir на file. Чтобы директория не лишилась данных 
                if (params.chapterType === 'file' && subchapter.chapterType === 'dir') {
                    throw '[editChapter]>> INVALID_CHAPTER_TYPE[2]';
                }
                // Обновление fullpath так как он может изменяться для разделов типа file
                if (params.pathName) correctPath[correctPath.length - 1] = params.pathName;
                updateChapter(subchapter, params);
                subchapter.fullpath = correctPath.join('/');
                // Добавляем массив items если 
                if (params.chapterType === 'dir' && !subchapter.items) subchapter.items = [];
                // Обновляем updatedAt
                subchapter.updatedAt = formatDate(Date.now());
                // запись изменений в БД
                await writeFile(materials, FSCONFIG);
                return subchapter;
            }
            else throw '[editChapter]>> INTERNAL_ERROR[2]';
        }
        else throw '[editChapter]>> INTERNAL_ERROR[3]';
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Удаление раздела из materials
export async function deleteChapter(params: DeleteChapterParams): Promise<DeleteResponseMessage> {
    console.log('[deleteChapter] => ', params);
    try {
        if(!params) throw new Error('[deleteChapter]>> INVALID_INPUT');
        // Получение всех materials 
        let materials: Chapter[] = await readFile(FSCONFIG);
        // Фильтрация по pathName если указано в параметрах
        if(params.pathName) {
            materials = materials.filter((chapter) => chapter.pathName !== params.pathName);
        }
        // Фильтрация по chapter.id если указано в параметрах
        else if (params.chapterId) {
            materials = materials.filter((chapter) => chapter.id !== params.chapterId);
        }
        // Если нужные параметры не были переданы 
        else {
            return 'failed';
        }
        // Сохранение изменений в БД
        await writeFile(materials, FSCONFIG);
        console.log(materials);
        return 'success';
    } catch (err) {
        console.error(err);
        throw err;
    }
}
