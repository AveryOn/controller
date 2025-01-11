import { writeFile, readFile, type FsOperationConfig, getAppUserDirname } from "../services/fs.service";
import { encrypt, verify } from '../services/crypto.service';
import { Chapter, 
    ChapterBlock, 
    ChapterCreate, 
    ChapterForMenu, 
    CreateChapterBlock, 
    DeleteChapterBlock, 
    DeleteChapterParams, 
    DeleteResponseMessage, 
    DeleteSubChapterParams, 
    EditChapterBlock, 
    EditChapterBlockTitle, 
    EditChapterParams, 
    GetChapterOneParams, 
    GetChaptersConfig, 
    GetSubChapterOneParams, 
    SubChapter, 
    SubChapterCreate 
} from "../types/controllers/materials.types";
import { trimPath } from "../services/string.service";
import { formatDate } from "../services/date.service";
import { verifyAccessToken } from "../services/tokens.service";

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

// Подготовить базу данных для меню материалов
export async function prepareMaterialsStoreForMenu(username: string): Promise<boolean> {
    const userDirPath = getAppUserDirname(username);
    console.log('[prepareMaterialsStoreForMenu] => void');
    return readFile(FSCONFIG_MENU)
        .then((data) => {
            return true;
        })
        .catch(async () => {
            try {
                await writeFile([], { ...FSCONFIG_MENU, directory: userDirPath, customPath: true });
                return true;
            } catch (err) {
                console.error('WRITE FILE', err);
                return false;
            }
        });
}

// Создание нового раздела в материалах
export async function createChapter(params: ChapterCreate) {
    console.log('[createChapter] => ', params);
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
        const timestamp = formatDate();
        const newChapter: Chapter = {
            id: Date.now(),
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
export async function getChapters(params: GetChaptersConfig): Promise<ChapterForMenu[] | Chapter[]> {
    console.log('getChapters => ', params);
    try {
        if(!params) throw new Error('[getChapters]>> invalid params');
        if(!params.token) new Error('[getChapters]>> 401 UNAUTHORIZATE');
        const { payload: { username } } = await verifyAccessToken(params.token);
        const userDirPath = getAppUserDirname(username);
        // Если запрос шел от панели меню
        let chapters: ChapterForMenu[] | Chapter[];
        if (params?.forMenu === true) {
            chapters = await readFile({ ...FSCONFIG_MENU, directory: userDirPath, customPath: true });
            chapters = [];
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
    console.log('[getOneChapter] => ', params);
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
    console.log('[createSubChapter] => ', params);
    try {
        if (!params) throw '[createSubChapter]>> INVALID_INPUT_DATA';
        const materials: Chapter[] = await readFile(FSCONFIG);
        const chapter = materials.find((chapter) => chapter.pathName === params.pathName);
        if (chapter?.chapterType === 'dir' && chapter.items) {
            const timestamp = formatDate();
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
                createdAt: timestamp,
                updatedAt: timestamp,
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
    console.log('[syncMaterialsStores] => void');
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
        return 'success';
    } catch (err) {
        console.error(err);
        throw err;
    }
}


// Поиск и удаление нужного подраздела по полному пути
function findAndDeleteLevel(items: SubChapter[], initPath: string[]): Array<SubChapter> | boolean {
    if (items.length <= 0) return false;
    const current = initPath.shift();
    for (let i = 0; i < items.length; i++) {
        const chapter = items[i];
        const selfPath = trimPath(chapter!.fullpath, { split: true }).at(-1);
        // Нашли нужный уровень
        if (selfPath === current) {
            // если исчерпан, то мы нашли искомый подраздел
            if (initPath.length <= 0) {
                return items.filter((ch) => ch.id !== chapter.id);
            }
            // Если путь еще не пуст, то продолжаем проходить по нему
            else {
                if (chapter!.items && chapter!.items.length > 0) {
                    const updateItems = findAndDeleteLevel(chapter!.items, initPath) as Array<SubChapter>;
                    if(updateItems && Array.isArray(updateItems)) {
                        chapter.items = updateItems;
                    }
                    return items;
                }
                else {
                    throw `[Materials/findAndDeleteLevel]>> Ожидается, что items для "${selfPath}" не будет пустым, но он пуст`;
                }
            }
        }
    }
    return false;
}
// Удаление подраздела из materials
export async function deleteSubChapter(params: DeleteSubChapterParams): Promise<DeleteResponseMessage> {
    console.log('[deleteSubChapter] => ', params);
    try {
        if(!params || !params.fullpath) throw new Error('[deleteSubChapter]>> INVALID_INPUT');
        // Получение всех materials 
        let materials: Chapter[] = await readFile(FSCONFIG);
        
        // Подготовить маршрут для поиска уровня
        let correctPath = trimPath(params.fullpath, { split: true }) as string[];
        // Поиск корневого раздела с которого идет поиск целевого подраздела
        const rootName = correctPath[0];
        const rootChapter = materials.find((chapter) => chapter.pathName === rootName);

        // Если корневой раздел не найден то ошибка
        if(!rootChapter) throw new Error('[deleteSubChapter]>> NOT_FOUND_ROOT_CHAPTER');
        if(!rootChapter.items) throw new Error('[deleteSubChapter]>> INVALID_CHAPTER_TYPE');

        // Поиск нужного уровня подраздела
        const updatedChapterItems = findAndDeleteLevel(rootChapter.items, correctPath.slice(1))
        if(Array.isArray(updatedChapterItems)) rootChapter.items = updatedChapterItems;
        else {
            throw new Error('[deleteSubChapter]>> INTERNAL_ERROR')
        }
        // Сохранение изменений в БД
        await writeFile(materials, FSCONFIG);
        return 'success';
    } catch (err) {
        console.error(err);
        throw err;
    }
}


// Создание нового блока для раздела
export async function createChapterBlock(params: CreateChapterBlock) {
    console.log('[createChapterBlock] => ', params);
    try {
        if(!params || !params.pathName || !params.title || params.title.length < 3) {
            throw new Error('[createChapterBlock]>> INVALID_INPUT');
        }
        const materials: Chapter[] = await readFile(FSCONFIG);
        // Создание нового экземпляра блока
        const timestamp = formatDate();
        const newBlock: ChapterBlock = {
            id: Date.now(),
            title: params.title,
            content: null,
            createdAt: timestamp,
            updatedAt: timestamp,
        }
        // Поиск уровня для записи блока в соответствующий раздел/подраздел
        // Поиск раздела
        if(params.pathName && !params.fullpath) {
            const findedChapter = materials.find((chapter) => chapter.pathName === params.pathName);
            if(!findedChapter?.content) throw new Error('[createChapterBlock]>> Ключа content не существует!');
            findedChapter.content.blocks.push(newBlock);
        }
        // Поиск подраздела
        else if(params.pathName && params.fullpath) {
            const findedChapter = materials.find((chapter) => chapter.pathName === params.pathName);
            const correctPath: string[] = trimPath(params.fullpath, { split: true }) as string[];
            if(!findedChapter || !findedChapter.items) throw new Error('[createChapterBlock]>> INTERNAL_ERROR[1]');
            const subChapter: SubChapter = findLevel(findedChapter.items, correctPath.slice(1)) as SubChapter;
            if(!subChapter || !subChapter.content) throw new Error('[createChapterBlock]>> INTERNAL_ERROR[2]!');
            // Добавление нового блока в исходный массив
            subChapter.content.blocks.push(newBlock);
        }
        else {
            throw new Error('[createChapterBlock]>> INTERNAL_ERROR[3]');
        }
        // Запись изменений в БД
        await writeFile(materials, FSCONFIG);
        return newBlock;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Обновление данных блока раздела
function updateBlock(oldBlock: ChapterBlock, newBlock: ChapterBlock) {
    if(!oldBlock || !newBlock) throw new Error('[editChapterBlock]>>[updateBlock]>> INVALID_INPUT');
    oldBlock.content = newBlock.content;
    oldBlock.title = newBlock.title;
}
// Редактирование нового блока для раздела
export async function editChapterBlock(params: EditChapterBlock & EditChapterBlockTitle) {
    console.log('[editChapterBlock] => ', params);
    try {
        if(!params || !params.pathName) {
            throw new Error('[editChapterBlock]>> INVALID_INPUT');
        }
        const materials: Chapter[] = await readFile(FSCONFIG);
        const blockId = params?.block?.id || params?.blockId;
        const timestamp = formatDate();
        // Поиск уровня для записи блока в соответствующий раздел/подраздел
        // Поиск раздела
        if(params.pathName && !params.fullpath) {
            const findedChapter = materials.find((chapter) => chapter.pathName === params.pathName);
            if(!findedChapter?.content) throw new Error('[editChapterBlock]>> Ключа content не существует!');
            // Поиск нужного блока
            const findedBlock = findedChapter.content.blocks.find((block: ChapterBlock) => block.id === blockId);
            if(!findedBlock) throw new Error('[editChapterBlock]>> NOT_FOUND_RECORD[1]');
            if(!params.blockTitle) {
                updateBlock(findedBlock, params.block); // обновление исходного объекта новыми данными, сохраняя ссылки
            } else {
                findedBlock.title = params.blockTitle;
            }
            // Обновление временных меток
            findedChapter.updatedAt = timestamp;
            findedBlock.updatedAt = timestamp;
        }
        // Поиск подраздела
        else if(params.pathName && params.fullpath) {
            const findedChapter = materials.find((chapter) => chapter.pathName === params.pathName);
            const correctPath: string[] = trimPath(params.fullpath, { split: true }) as string[];
            if(!findedChapter || !findedChapter.items) throw new Error('[editChapterBlock]>> INTERNAL_ERROR[1]');
            const subChapter: SubChapter = findLevel(findedChapter.items, correctPath.slice(1)) as SubChapter;
            if(!subChapter || !subChapter.content) throw new Error('[editChapterBlock]>> INTERNAL_ERROR[2]!');
            // Поиск нужного блока
            const findedBlock = subChapter.content.blocks.find((block: ChapterBlock) => block.id === blockId);
            if(!findedBlock) throw new Error('[editChapterBlock]>> NOT_FOUND_RECORD[2]');
            if(!params.blockTitle) {
                updateBlock(findedBlock, params.block); // обновление исходного объекта новыми данными, сохраняя ссылки
            } else {
                findedBlock.title = params.blockTitle;
            }
            // Обновление временных меток
            findedChapter.updatedAt = timestamp;
            findedBlock.updatedAt = timestamp;
        }
        else {
            throw new Error('[editChapterBlock]>> INTERNAL_ERROR[3]');
        }
        // Запись изменений в БД
        await writeFile(materials, FSCONFIG);
        return materials;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Удаление блока из раздела
export async function deleteChapterBlock(params: DeleteChapterBlock): Promise<Chapter | SubChapter> {
    console.log('[deleteChapterBlock] => ', params);
    try {
        if(!params || !params.pathName) {
            throw new Error('[deleteChapterBlock]>> INVALID_INPUT');
        }
        const materials: Chapter[] = await readFile(FSCONFIG);
        // Поиск уровня для удаления блока из раздела/подраздела
        // Поиск раздела
        if(params.pathName && !params.fullpath) {
            const findedChapter = materials.find((chapter) => chapter.pathName === params.pathName);
            if(!findedChapter?.content) throw new Error('[deleteChapterBlock]>> Ключа content не существует!');
            // Удаление блока
            findedChapter.content.blocks = findedChapter.content.blocks.filter((block: ChapterBlock) => block.id !== params.blockId);
            // Запись изменений в БД
            await writeFile(materials, FSCONFIG);
            return findedChapter
        }
        // Поиск подраздела
        else if(params.pathName && params.fullpath) {
            const findedChapter = materials.find((chapter) => chapter.pathName === params.pathName);
            const correctPath: string[] = trimPath(params.fullpath, { split: true }) as string[];
            if(!findedChapter || !findedChapter.items) throw new Error('[deleteChapterBlock]>> INTERNAL_ERROR[1]');
            const subChapter: SubChapter = findLevel(findedChapter.items, correctPath.slice(1)) as SubChapter;
            if(!subChapter || !subChapter.content) throw new Error('[deleteChapterBlock]>> INTERNAL_ERROR[2]!');
            // Удаление блока
            subChapter.content.blocks = subChapter.content.blocks.filter((block: ChapterBlock) => block.id !== params.blockId);
            // Запись изменений в БД
            await writeFile(materials, FSCONFIG);
            return subChapter;
        }
        else {
            throw new Error('[deleteChapterBlock]>> INTERNAL_ERROR[3]');
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
} 