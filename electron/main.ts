import 'dotenv/config';
import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { getUsers, createUser, updatePassword } from './server/controllers/users'
import type {
    CreateUserParams,
    GetUsersConfig,
    LoginParams,
    PrepareUserStoreParams,
    UpdatePasswordParams
} from './server/types/controllers/users.types'
import type {
    ChapterCreate,
    CreateChapterBlock,
    DeleteChapterBlock,
    DeleteChapterParams,
    DeleteSubChapterParams,
    EditChapterBlock,
    EditChapterBlockTitle,
    EditChapterParams,
    GetChapterBlocks,
    GetChapterOneParams,
    GetChaptersConfig,
    GetSubChapterOneParams,
    SubChapterCreate
} from './server/types/controllers/materials.types'
import { createChapter, 
    createChapterBlock, 
    createSubChapter, 
    deleteChapter, 
    deleteChapterBlock, 
    deleteSubChapter, 
    editChapter, 
    editChapterBlock, 
    getChapterBlocks, 
    getChapters, 
    getOneChapter, 
    getOneSubChapter,
    syncMaterialsStores, 
    // syncMaterialsStores 
} from './server/controllers/materials'
import { DatabaseManager } from './server/database/manager';
import { loginUser, validateAccessToken } from './server/controllers/auth.controller';
import { ValidateAccessTokenParams } from './server/types/controllers/auth.types';
import { AuthParams } from './server/types/controllers/index.types';
import { prepareUserStore } from './server/controllers/system.controller';
import { verifyAccessToken } from './server/services/tokens.service';


const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;



let win: BrowserWindow | null

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#2f3241',
            symbolColor: '#74b1be',
            height: 20
        },
        // expose window controlls in Windows/Linux
        // ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
    });

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', async () => {

    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

// ХУК ЗАПУСКА ПРИЛОЖЕНИЯ
app.whenReady().then(async () => {
    // Инициалзация кластера баз данных
    const isReadyDB = await DatabaseManager
        .instance()
        .initOnApp({ migrate: true });
    
    if(!isReadyDB) throw new Error('DATABASE MANAGER WAS NOT INITIALIZED')
    console.debug('APPLICATION DATABASES ARE READY');
    createWindow();

    // await DatabaseManager
    // .instance().initOnUser('root')
    // syncMaterialsStores('root')

    // Обработчики IPC
    // ==========  SYSTEM  ==========

    // ==========  AUTH  ===========
    ipcMain.handle("validate-access-token", async (event, params: ValidateAccessTokenParams) => {
        return await validateAccessToken(params);
    });

    // ==========  USERS  ===========
    // Подготовить пользовательское хранилище
    ipcMain.handle("prepare-user-store", async (event, params: PrepareUserStoreParams) => {
        const { payload: { username } } = await verifyAccessToken(params.token)
        return await prepareUserStore(win, username);
    });

    // Получение пользователей
    ipcMain.handle("get-users", async (event, config?: GetUsersConfig) => {
        return await getUsers(config);
    });

    // Создание нового пользователя
    ipcMain.handle("create-user", async (event, params: CreateUserParams) => {
        return await createUser(params);
    });

    // Вход пользователя в систему
    ipcMain.handle("login-user", async (event, params: LoginParams) => {
        return await loginUser(win, params, { expiresToken: { Y: 1 } });
    });

    // Обновление пароля
    ipcMain.handle("update-password", async (event, params: UpdatePasswordParams) => {
        return await updatePassword(params);
    });

    // ===== MATERIALS ========
    // Созданое нового раздела материалов
    ipcMain.handle("create-chapter", async (event, params: ChapterCreate, auth: AuthParams) => {
        return await createChapter(params, auth);
    });

    // Получение разделов для меню
    ipcMain.handle("get-menu-chapters", async (event, params: GetChaptersConfig) => {
        return await getChapters(params);
    });

    // Получение раздела
    ipcMain.handle("get-one-chapter", async (event, params: GetChapterOneParams) => {
        return await getOneChapter(params);
    });

    // Создание подраздела
    ipcMain.handle("create-sub-chapter", async (event, params: SubChapterCreate, auth: AuthParams) => {
        return await createSubChapter(params, auth);
    });

    // Синхронизация БД Материалов и БД Меню Материалов. Для того чтобы панель меню содержала актуальное состояние данных
    ipcMain.handle("sync-materials", async (event, auth: AuthParams) => {
        if(!auth?.token) throw new Error("[IPC > sync-materials]>> 401 UNAUTHORIZATE");
        const { payload: { username } } = await verifyAccessToken(auth.token);
        return await syncMaterialsStores(username);
    });

    // Получить конкретный ПОДраздел с БД материалов
    ipcMain.handle("get-one-sub-chapter", async (event, params: GetSubChapterOneParams, auth: AuthParams) => {
        return await getOneSubChapter(params, auth);
    });

    // Редактирование общих данных раздела/подраздела
    ipcMain.handle("edit-chapter", async (event, params: EditChapterParams, auth: AuthParams) => {
        return await editChapter(params, auth);
    });

    // Удаление раздела
    ipcMain.handle("delete-chapter", async (event, params: DeleteChapterParams) => {
        return await deleteChapter(params);
    });

    // Удаление подраздела
    ipcMain.handle("delete-sub-chapter", async (event, params: DeleteSubChapterParams) => {
        return await deleteSubChapter(params);
    });

    // получение блоков раздела
    ipcMain.handle("get-chapter-blocks", async (event, params: GetChapterBlocks) => {
        return await getChapterBlocks(params);
    });

    // Создание блока для раздела
    ipcMain.handle("create-chapter-block", async (event, params: CreateChapterBlock) => {
        return await createChapterBlock(params);
    });

    // Редактирование блока для раздела
    ipcMain.handle("edit-chapter-block", async (event, params: EditChapterBlock & EditChapterBlockTitle) => {
        return await editChapterBlock(params);
    });

    // Редактирование заголовка блока для раздела
    ipcMain.handle("edit-chapter-block-title", async (event, params: EditChapterBlockTitle & EditChapterBlock) => {
        return await editChapterBlock(params);
    });

    // Удаление блока из раздела
    ipcMain.handle("delete-chapter-block", async (event, params: DeleteChapterBlock) => {
        return await deleteChapterBlock(params);
    });
})
