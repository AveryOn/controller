import { writeFile, readFile, type FsOperationConfig, getAppUserDirname } from "../services/fs.service";
// import { encrypt, verify } from '../services/crypto.service';
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
    EditChapterParams, 
    GetChapterBlocks, 
    GetChapterOneParams, 
    GetChaptersConfig, 
    GetSubChapterOneParams, 
    SubChapter, 
    SubChapterCreate, 
    SubChapterForMenu
} from "../types/controllers/materials.types";
import { trimPath } from "../services/string.service";
import { formatDate } from "../services/date.service";
import { verifyAccessToken } from "../services/tokens.service";
import ChapterService from "../database/services/chapter.service";
import { ChapterGetByPathNameRes, ChapterRawResponse, SubChapterCreateResponse, SubChapterGetByPathNameRes, SubChapterRawResponse } from "../types/services/chapter.service";
import { AuthParams } from "../types/controllers/index.types";
import SubChapterService from "../database/services/subchapter.service";
import BlocksService from "../database/services/blocks.service";

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
    return readFile({ ...FSCONFIG_MENU, directory: userDirPath, customPath: true })
        .then((_) => {
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
export async function createChapter(params: ChapterCreate, auth: AuthParams) {
    console.log('[createChapter] => ', params);
    try {
        if(!auth?.token) throw new Error("[createChapter]>> 401 UNAUTHORIZATE");
        const { payload } = await verifyAccessToken(auth.token);
        const chapterService = new ChapterService();
        // Создание нового экзепляра раздела
        const timestamp = formatDate();
        const newChapter = await chapterService.create({
            chapterType: params.chapterType,
            label: params.label,
            icon: params.icon,
            iconType: params.iconType,
            pathName: params.pathName,
            route: params.route,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
        // Вызов синхронизации с меню
        await syncMaterialsStores(payload.username);
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
        const chapterService = new ChapterService();
        // Получение по имени пути
        if (params.pathName) {
            const findedChapter: ChapterGetByPathNameRes | null = await chapterService.findByPathName(params.pathName, { 
                includes: { 
                    blocks: true // также прикрепить блоки в объект раздела
                } 
            });
            if (!findedChapter) throw '[getOneChapter]>> NOT_EXISTS_RECORD';
            const correctChapter: Chapter = {
                id: findedChapter.id,
                icon: findedChapter.icon,
                chapterType: findedChapter.chapterType,
                createdAt: findedChapter.createdAt,
                label: findedChapter.label,
                pathName: findedChapter.pathName,
                route: findedChapter.route,
                updatedAt: findedChapter.updatedAt,
                iconType: findedChapter.iconType,
                content: {
                    title: findedChapter.contentTitle,
                    blocks: [],
                },
                items: (findedChapter.chapterType === 'dir')? [] : null,
            }
            if(findedChapter?.blocks) {
                let blocks: ChapterBlock[] = JSON.parse(findedChapter?.blocks)
                // если массив блоков пришел с одной пустой записью то считаем что  для этого раздела нет блоков
                if(blocks.length === 1 && !blocks[0].id) {
                    blocks.length = 0;
                }
                else if(!!blocks[0].id) {
                    correctChapter.content.blocks = blocks;
                } 
            }
            else {  }
            findedChapter?.blocks
            console.log(correctChapter);
            return correctChapter;
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
export async function createSubChapter(params: SubChapterCreate, auth: AuthParams): Promise<SubChapterCreateResponse> {
    console.log('[createSubChapter] => ', params);
    try {
        if (!params || !params.chapterId) throw '[createSubChapter]>> INVALID_INPUT_DATA';
        if(!auth?.token) throw '[createSubChapter]>> 401 UNAUTHORIZATE';
        const { payload: { username } } = await verifyAccessToken(auth.token)
        const subChapterService = new SubChapterService();
        const now = formatDate();
        const res = await subChapterService.create({
            chapterId: params.chapterId,
            chapterType: params.chapterType,
            fullpath: params.fullpath,
            icon: params.icon,
            iconType: params.iconType,
            label: params.label,
            pathName: params.pathName,
            route: params.route,
            createdAt: now,
            updatedAt: now,
        });
        await syncMaterialsStores(username);
        return res;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Синхронизация БД Материалов и БД Меню Материалов. Для того чтобы панель меню содержала актуальное состояние данных
export async function syncMaterialsStores(username: string): Promise<Array<ChapterForMenu>> {
    console.log('[syncMaterialsStores] =>', username);
    try {
        if(!username) throw new Error('[syncMaterialsStores]>> invalid username')
        function sync(pathName: string, subchapters: Array<SubChapterForMenu>, envStack: string[], stackLabels: string[]): Array<SubChapterForMenu> {
            /* envStack - массив окружений разделов. начинается от pathName раздела
                и на каждом последующем вызове в него добавляется новый участок fullpath[0] уже подраздела, на который 
                была запущена рекурсия.
            */
            const mappa: {[key:string]: SubChapterForMenu[]} = {};
            const baseSubChapters: SubChapterForMenu[] = [];
            for (let i = 0; i < subchapters.length; i++) {
                const subChapter = subchapters[i];
                if(!subChapter.pathName) subChapter.pathName = pathName;
                // здесь correctFullpath отделяется от envStack чтобы смещаться по пути в рекурсии
                const correctFullpath = trimPath(subChapter.fullpath, { split: true }).slice(envStack.length) as string[];
                const basePath = correctFullpath.shift();
                
                if(!mappa[basePath!]) mappa[basePath!] = [];
                subChapter.fullLabels = [...stackLabels, subChapter.label]; // собираем полный label. Берем стек лэйблов предыдущего пути + текщий лэйбл 
                if(correctFullpath.length > 0) {
                    mappa[basePath!].push(subChapter);
                }
                // этот массив нужен для того чтобы определять какие подразделы являются директориями
                // чтобы по ним вызывать рекурсию
                else {
                    baseSubChapters.push(subChapter);
                }
            }
            return baseSubChapters.map((subChapter) => {
   
                const correctFullpath = trimPath(subChapter.fullpath, { split: true }).slice(envStack.length) as string[];
                if((mappa[correctFullpath[0]]?.length <= 0)) {
                    subChapter.items = (subChapter.chapterType === 'dir')? [] : null;
                    subChapter.pathName = envStack[0];
                    return subChapter;
                }
                else {
                    // подраздел который обрабатывается в этом условии имеет несколько items
                    // и этот подраздел по сути является некотрым узлом, и его label является некоторым неймспейсом
                    // для всех находящихся в нем подразделов, и потому, его лэйбл нужно поместить в текущий стек (трассу) лэйблов,
                    // чтобы каждый из его дочерних разделов знал вс. трассу лэйблов + свой лэйбл (для формирования fullLabel каждого подраздела)
                    stackLabels.push(subChapter.label);  
                    // добавляем текущее название подраздела на котором запускаем рекурсия, для смещения
                    const env = correctFullpath.shift();
                    subChapter.items = sync(pathName, mappa[env!], [...envStack, env!], stackLabels);
                    return subChapter;
                }
            })
        }
        // получаем все разделы и подразделы
        const chapterService = new ChapterService()
        const result: any[] = await chapterService.getAllForMenu();
        const mapped = result.map((chapter: ChapterForMenu) => {
            if(typeof chapter.items === 'string') {
                chapter.items = JSON.parse(chapter.items);
            }
            // если раздел является директорией
            if(chapter.items && chapter.items.length > 0) {
                // убираем массив items если он пришел с одним пустым подразделом
                if(chapter.items?.length === 1 && !chapter.items![0]?.id) {
                    chapter.items = (chapter.chapterType === 'dir')? [] : null;
                }
                if(chapter.items) {
                    chapter.items = sync(chapter.pathName, chapter.items, [chapter.pathName!], [chapter.label]);
                }
            }
            else {
                console.error('[syncMaterialsStores]>> chapter.length is NULL');
            }
            return chapter;
        });
        // Запись в файл
        const userDirPath = getAppUserDirname(username);
        await writeFile(mapped, { ...FSCONFIG_MENU, directory: userDirPath, customPath: true });
        return mapped;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Получить конкретный ПОДраздел с БД материалов
export async function getOneSubChapter(params: GetSubChapterOneParams, auth: AuthParams): Promise<SubChapter> {
    console.log('[getOneSubChapter] => ', params);
    try {
        if(!auth?.token) throw new Error("[getOneSubChapter]>> 401 UNAUTHORIZATE");
        await verifyAccessToken(auth.token);
        const subChapterService = new SubChapterService();
        await subChapterService.findByFullpath(params.fullpath);
        // Получение по имени пути
        if (params.fullpath) {
            const findedSubChapter: SubChapterGetByPathNameRes | null = await subChapterService.findByFullpath(params.fullpath, {
                includes: {
                    blocks: true // также прикрепить блоки в объект подраздела
                }
            });
            if (!findedSubChapter) throw '[getOneSubChapter]>> NOT_EXISTS_RECORD';
            const correctSubChapter: SubChapter = {
                id: findedSubChapter.id,
                icon: findedSubChapter.icon,
                fullpath: findedSubChapter.fullpath,
                chapterType: findedSubChapter.chapterType,
                createdAt: findedSubChapter.createdAt,
                label: findedSubChapter.label,
                pathName: findedSubChapter.pathName,
                route: findedSubChapter.route,
                updatedAt: findedSubChapter.updatedAt,
                iconType: findedSubChapter.iconType,
                content: {
                    title: findedSubChapter.contentTitle,
                    blocks: [],
                },
                items: (findedSubChapter.chapterType === 'dir')? [] : null,
            }
            if (findedSubChapter?.blocks) {
                let blocks: ChapterBlock[] = JSON.parse(findedSubChapter?.blocks)
                // если массив блоков пришел с одной пустой записью то считаем что  для этого подраздела нет блоков
                if (blocks.length === 1 && !blocks[0].id) {
                    blocks.length = 0;
                }
                else if (!!blocks[0].id) {
                    correctSubChapter.content.blocks = blocks;
                }
            }
            else { }
            return correctSubChapter;
        }
        else {
            throw '[getOneSubChapter]>> NOT_EXISTS_RECORD';
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Редактирование общих данных раздела/подраздела
export async function editChapter(input: EditChapterParams, auth: AuthParams): Promise<Chapter> {
    console.log('[editChapter] => ', input);
    try {
        if(!auth?.token) throw new Error("[editChapter]>> 401 UNAUTHORIZATE");
        const { payload: { username } } = await verifyAccessToken(auth.token);
        const { params, fullpath, pathName } = input;
        // Редактирование раздела
        if (!fullpath && pathName) {
            const chapterService = new ChapterService();
            const findedChapter: ChapterGetByPathNameRes | null  = await chapterService.findByPathName(pathName);
            if (findedChapter) {
                // Доп защита для избежания изменения типа раздела с dir на file. Чтобы директория не лишилась данных 
                if (params.chapterType === 'file' && findedChapter.chapterType === 'dir') {
                    throw '[editChapter]>> INVALID_CHAPTER_TYPE[1]';
                }
                const updatedChapter = await chapterService.update(findedChapter.id, params) as ChapterRawResponse;
                await syncMaterialsStores(username);
                const resultChapter = { 
                    ...updatedChapter,
                    content: {
                        title: updatedChapter.contentTitle ?? null,
                        blocks: (Array.isArray(updatedChapter.blocks)) ? updatedChapter.blocks : []
                    }
                }
                Reflect.deleteProperty(resultChapter, 'blocks');
                return resultChapter as any as Chapter;
            }
            else throw '[editChapter]>> NOT_FOUND [1]';
        }
        // Редактирование ПОДразделов
        else if (fullpath && pathName) {
            const subChapterService = new SubChapterService();
            const findedSubChapter: SubChapterGetByPathNameRes | null = await subChapterService.findByFullpath(fullpath);
            if(findedSubChapter) {
                // Доп защита для избежания изменения типа раздела с dir на file. Чтобы директория не лишилась данных 
                if (params.chapterType === 'file' && findedSubChapter.chapterType === 'dir') {
                    throw '[editChapter]>> INVALID_CHAPTER_TYPE[1]';
                }
                const updatedSubChapter = await subChapterService.update(findedSubChapter.id, params) as SubChapterRawResponse;
                await syncMaterialsStores(username);
                const resultSubChapter = { 
                    ...updatedSubChapter,
                    content: {
                        title: updatedSubChapter.contentTitle ?? null,
                        blocks: (Array.isArray(updatedSubChapter.blocks)) ? updatedSubChapter.blocks : [],
                    }
                }
                Reflect.deleteProperty(resultSubChapter, 'blocks');
                return resultSubChapter as any as Chapter;
            }
            else throw '[editChapter]>> NOT_FOUND [2]';
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

        const chapterService = new ChapterService();
        // Удаление по pathName если указано в параметрах
        if(params.pathName) {
            await chapterService.deleteOneByPathName(params.pathName);
        }
        // Удаление по chapter.id если указано в параметрах
        else if (params.chapterId) {
            return 'success';
        }
        // Если нужные параметры не были переданы 
        else {
            return 'failed';
        }
        return 'success';
    } catch (err) {
        console.error(err);
        return 'failed';
    }
}


// Удаление подраздела из materials
export async function deleteSubChapter(params: DeleteSubChapterParams): Promise<DeleteResponseMessage> {
    console.log('[deleteChapter] => ', params);
    try {
        if(!params) throw new Error('[deleteChapter]>> INVALID_INPUT');

        const subChapterService = new SubChapterService();
        // Удаление по pathName если указано в параметрах
        if(params.fullpath) {
            await subChapterService.deleteOneByFullpath(params.fullpath);
        }
        // Если нужные параметры не были переданы 
        else {
            return 'failed';
        }
        return 'success';
    } catch (err) {
        console.error(err);
        return 'failed';
    }
}

// Получить блоки раздела по его айди
export async function getChapterBlocks(params: GetChapterBlocks) {
    console.log('[getChapterBlocks] => ', params);
    try {
        const blockService = new BlocksService();
        const blocks = await blockService.getAllForChapter(params.chapterId);
        return blocks;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Получить блоки подраздела по его айди
export async function getSubChapterBlocks(params: GetChapterBlocks) {
    console.log('[getSubChapterBlocks] => ', params);
    try {
        const blockService = new BlocksService();
        const blocks = await blockService.getAllForSubChapter(params.chapterId);
        return blocks;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Создание нового блока для раздела
export async function createChapterBlock(params: CreateChapterBlock) {
    console.log('[createChapterBlock] => ', params);
    try {
        if(!params || !params.pathName || !params.title)
            throw new Error('[createChapterBlock]>> INVALID_INPUT');

        const blockService = new BlocksService();
        const chapterService = new ChapterService();
        const subChapterService = new SubChapterService();
        // Создание блока для раздела
        if(!params.fullpath && params.pathName) {
            const findedChapter = await chapterService.findByPathName<{id: number}>(params.pathName, { select: ['id'] });
            if(!findedChapter || !findedChapter.id) throw new Error('[createChapterBlock]>> NOT_FOUND [1]');
            const newBlock = await blockService.createForChapter({ 
                chapterId: findedChapter.id, 
                subChapterId: null, 
                title: params.title,
            });
            return newBlock;
        }
        // Создание блока для подраздела
        else if (params.fullpath && params.pathName) {
            const findedSubChapter = await subChapterService.findByFullpath<{ id: number }>(params.fullpath, { select: ['id'] });
            if(!findedSubChapter || !findedSubChapter.id) throw new Error('[createChapterBlock]>> NOT_FOUND [2]');
            const newBlock = await blockService.createForChapter({ 
                chapterId: null, 
                subChapterId: findedSubChapter.id, 
                title: params.title,
            });
            return newBlock;
        }
        else
            throw new Error('[createChapterBlock]>> INTERNAL_ERROR');
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Редактирование нового блока для раздела
export async function editChapterBlock(params: EditChapterBlock) {
    console.log('[editChapterBlock] => ', params);
    try {
        if(!params || !params.pathName || !params.block)
            throw new Error('[editChapterBlock]>> INVALID_INPUT');

        const blockService = new BlocksService();

        const updatedBlock = await blockService.update(params.block.id, { 
            ...params.block,
            updatedAt: formatDate(),
        });
        return updatedBlock;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// Удаление блока из раздела
export async function deleteChapterBlock(params: DeleteChapterBlock): Promise<void> {
    console.log('[deleteChapterBlock] => ', params);
    try {
        if(!params || !params.pathName)
            throw new Error('[deleteChapterBlock]>> INVALID_INPUT');
        
        const blockService = new BlocksService();

        return await blockService.deleteOne(params.blockId);
    } catch (err) {
        console.error(err);
        throw err;
    }
} 