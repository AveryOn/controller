import 'dotenv/config';
import { app, BrowserWindow, ipcMain } from 'electron'
// import { createRequire } from 'node:module'
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
    getSubChapterBlocks,
    syncMaterialsStores, 
    // syncMaterialsStores 
} from './server/controllers/materials'
import { DatabaseManager } from './server/database/manager';
import { loginUser, validateAccessToken } from './server/controllers/auth.controller';
import { ValidateAccessTokenParams } from './server/types/controllers/auth.types';
import { AuthParams } from './server/types/controllers/index.types';
import { checkAccess, prepareUserStore } from './server/controllers/system.controller';
import { verifyAccessToken } from './server/services/tokens.service';
import { TTLStore } from './server/services/ttl-store.service';


// const require = createRequire(import.meta.url);
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
        // expose window controls in Windows/Linux
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
    // Инициализация TTL Store
    TTLStore.getInstance<string>();

    // Инициализация кластера баз данных
    const isReadyDB = await DatabaseManager
        .instance()
        .initOnApp({ migrate: true });
    
    if(!isReadyDB) throw new Error('DATABASE MANAGER WAS NOT INITIALIZED')
    console.debug('APPLICATION DATABASES ARE READY');
    createWindow();
    globalThis.win = win

    // await DatabaseManager
    // .instance().initOnUser('root')
    // syncMaterialsStores('root')

    // Обработчики IPC
    // ==========  SYSTEM  ==========
    ipcMain.handle("check-access", async (_) => {
        return checkAccess()
    })

    // ==========  AUTH  ===========
    ipcMain.handle("validate-access-token", async (_, params: ValidateAccessTokenParams) => {
        return await validateAccessToken(params);
    });

    // ==========  USERS  ===========
    // Подготовить пользовательское хранилище
    ipcMain.handle("prepare-user-store", async (_, params: PrepareUserStoreParams) => {
        const { payload: { username } } = await verifyAccessToken(params.token, { refresh: true })
        return await prepareUserStore(win, username);
    });

    // Получение пользователей
    ipcMain.handle("get-users", async (_, config?: GetUsersConfig) => {
        return await getUsers(config);
    });

    // Создание нового пользователя
    ipcMain.handle("create-user", async (_, params: CreateUserParams) => {
        return await createUser(win, params);
    });

    // Вход пользователя в систему
    ipcMain.handle("login-user", async (_, params: LoginParams) => {
        return await loginUser(win, params);
    });

    // Обновление пароля
    ipcMain.handle("update-password", async (_, params: UpdatePasswordParams) => {
        return await updatePassword(params);
    });

    // ===== MATERIALS ========
    // Созданное нового раздела материалов
    ipcMain.handle("create-chapter", async (_, params: ChapterCreate, auth: AuthParams) => {
        return await createChapter(params, auth);
    });

    // Получение разделов для меню
    ipcMain.handle("get-menu-chapters", async (_, params: GetChaptersConfig, auth: AuthParams) => {
        return await getChapters(params, auth);
    });

    // Получение раздела
    ipcMain.handle("get-one-chapter", async (_, params: GetChapterOneParams, auth: AuthParams) => {
        return await getOneChapter(params, auth);
    });

    // Создание подраздела
    ipcMain.handle("create-sub-chapter", async (_, params: SubChapterCreate, auth: AuthParams) => {
        return await createSubChapter(params, auth);
    });

    // Синхронизация БД Материалов и БД Меню Материалов. Для того чтобы панель меню содержала актуальное состояние данных
    ipcMain.handle("sync-materials", async (_, auth: AuthParams) => {
        return await syncMaterialsStores(auth);
    });

    // Получить конкретный ПОДраздел с БД материалов
    ipcMain.handle("get-one-sub-chapter", async (_, params: GetSubChapterOneParams, auth: AuthParams) => {
        return await getOneSubChapter(params, auth);
    });

    // Редактирование общих данных раздела/подраздела
    ipcMain.handle("edit-chapter", async (_, params: EditChapterParams, auth: AuthParams) => {
        return await editChapter(params, auth);
    });

    // Удаление раздела
    ipcMain.handle("delete-chapter", async (_, params: DeleteChapterParams, auth: AuthParams) => {
        return await deleteChapter(params, auth);
    });

    // Удаление подраздела
    ipcMain.handle("delete-sub-chapter", async (_, params: DeleteSubChapterParams, auth: AuthParams) => {
        return await deleteSubChapter(params, auth);
    });

    // получение блоков раздела
    ipcMain.handle("get-chapter-blocks", async (_, params: GetChapterBlocks, auth: AuthParams) => {
        return await getChapterBlocks(params, auth);
    });

    // получение блоков раздела
    ipcMain.handle("get-sub-chapter-blocks", async (_, params: GetChapterBlocks, auth: AuthParams) => {
        return await getSubChapterBlocks(params, auth);
    });

    // Создание блока для раздела
    ipcMain.handle("create-chapter-block", async (_, params: CreateChapterBlock, auth: AuthParams) => {
        return await createChapterBlock(params, auth);
    });

    // Редактирование блока для раздела
    ipcMain.handle("edit-chapter-block", async (_, params: EditChapterBlock, auth: AuthParams) => {
        return await editChapterBlock(params, auth);
    });

    // Удаление блока из раздела
    ipcMain.handle("delete-chapter-block", async (_, params: DeleteChapterBlock, auth: AuthParams) => {
        return await deleteChapterBlock(params, auth);
    });
})
