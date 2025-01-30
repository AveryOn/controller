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
    SubChapterCreate, 
    SubChapterForMenu
} from "../types/controllers/materials.types";
import { trimPath } from "../services/string.service";
import { formatDate } from "../services/date.service";
import { verifyAccessToken } from "../services/tokens.service";
import ChapterService from "../database/services/chapter.service";
import { ChapterCreateDto, ChapterGetByPathNameRes, SubChapterCreateResponse, SubChapterGetByPathNameRes, SubChapterRawResponse } from "../types/services/chapter.service";
import { AuthParams } from "../types/controllers/index.types";
import SubChapterService from "../database/services/subchapter.service";

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
        const menu = await syncMaterialsStores(payload.username);
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
            const baseSubChapters: SubChapterForMenu[] = []
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
        // if(!params?.labels) throw new Error("[getOneSubChapter]>> invalid labels");
        if(!auth?.token) throw new Error("[getOneSubChapter]>> 401 UNAUTHORIZATE");
        const subChapterService = new SubChapterService();
        await verifyAccessToken(auth.token);
        await subChapterService.findByFullpath(params.fullpath);
        // Получение по имени пути
        if (params.fullpath) {
            const findedSubChapter: SubChapterGetByPathNameRes | null = await subChapterService.findByFullpath(params.fullpath, {
                includes: {
                    blocks: true // также прикрепить блоки в объект подраздела
                }
            });
            console.log(findedSubChapter);
            
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
            findedSubChapter?.blocks
            console.log(correctSubChapter);
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
        // Редактирование раздела
        if (!fullpath && pathName) {
            const chapterService = new ChapterService();
            chapterService.findByPathName(pathName)
            // let findedChapter = materials.find((chapter) => chapter.pathName === pathName);
            // if (findedChapter) {
            //     // Доп защита для избежания изменения типа раздела с dir на file. Чтобы директория не лишилась данных 
            //     if (params.chapterType === 'file' && findedChapter.chapterType === 'dir') {
            //         throw '[editChapter]>> INVALID_CHAPTER_TYPE[1]';
            //     }
            //     updateChapter(findedChapter, params);
            //     if (params.chapterType === 'dir') findedChapter.items = [];
            //     // Обновляем updatedAt
            //     findedChapter.updatedAt = new Date().toISOString();
            //     // запись изменений в БД
            //     await writeFile(materials, FSCONFIG);
            //     return findedChapter;
            // }
            // else throw '[editChapter]>> NOT_FOUND';
        }
        // Редактирование ПОДразделов
        else if (fullpath && pathName) {
            // const correctPath = trimPath(fullpath, { split: true }) as string[];
            // const root: string = correctPath[0];
            // const findedChapter = materials.find((chapter) => chapter.pathName === root);
            // const lastPath: string[] = correctPath.slice(1);
            // if (findedChapter?.items) {
            //     let subchapter = findLevel(findedChapter.items, lastPath) as SubChapter;
            //     // Доп защита для избежания изменения типа раздела с dir на file. Чтобы директория не лишилась данных 
            //     if (params.chapterType === 'file' && subchapter.chapterType === 'dir') {
            //         throw '[editChapter]>> INVALID_CHAPTER_TYPE[2]';
            //     }
            //     // Обновление fullpath так как он может изменяться для разделов типа file
            //     if (params.pathName) correctPath[correctPath.length - 1] = params.pathName;
            //     updateChapter(subchapter, params);
            //     subchapter.fullpath = correctPath.join('/');
            //     // Добавляем массив items если 
            //     if (params.chapterType === 'dir' && !subchapter.items) subchapter.items = [];
            //     // Обновляем updatedAt
            //     subchapter.updatedAt = formatDate(Date.now());
            //     // запись изменений в БД
            //     await writeFile(materials, FSCONFIG);
            //     return subchapter;
            // }
            // else throw '[editChapter]>> INTERNAL_ERROR[2]';
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