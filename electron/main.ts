import { app, BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { prepareUsersStore, getUsers, createUser, loginUser, updatePassword } from './server/controllers/users'
import type { CreateUserParams, GetUsersConfig, LoginParams, UpdatePasswordParams } from './server/types/controllers/users.types'
import type { ChapterCreate, CreateChapterBlock, DeleteChapterParams, DeleteSubChapterParams, EditChapterParams, GetChapterOneParams, GetChaptersConfig, GetSubChapterOneParams, SubChapterCreate } from './server/types/controllers/materials.types'
import { createChapter, createChapterBlock, createSubChapter, deleteChapter, deleteSubChapter, editChapter, getChapters, getOneChapter, getOneSubChapter, prepareMaterialsStore, prepareMaterialsStoreForMenu, resetMaterialDB, syncMaterialsStores } from './server/controllers/materials'
import { decryptJsonData, encryptJsonData } from './server/services/crypto.service'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
        },
    });

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', async () => {
        // Сброс БД materials
        // await resetMaterialDB();
        let isReliableStores: boolean = true;
        // Проверка баз данных
        isReliableStores = await prepareUsersStore(); // Users
        isReliableStores = await prepareMaterialsStore(); // Materials
        isReliableStores = await prepareMaterialsStoreForMenu() // Materials For Menu
        win?.webContents.send('main-process-message', isReliableStores);
        console.log('ГОТОВНОСТЬ БАЗ ДАННЫХ:', isReliableStores);
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

app.whenReady().then(() => {
    createWindow();

    // createSubChapter().then((res) => console.log('RESULT FIND SUBCHAPTER', res))

    // Обработчики IPC
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
        return await loginUser(params);
    });

    // Обновление пароля
    ipcMain.handle("update-password", async (event, params: UpdatePasswordParams) => {
        return await updatePassword(params);
    });

    // ===== MATERIALS ========
    // Созданое нового раздела материалов
    ipcMain.handle("create-chapter", async (event, params: ChapterCreate) => {
        return await createChapter(params);
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
    ipcMain.handle("create-sub-chapter", async (event, params: SubChapterCreate) => {
        return await createSubChapter(params);
    });

    // Синхронизация БД Материалов и БД Меню Материалов. Для того чтобы панель меню содержала актуальное состояние данных
    ipcMain.handle("sync-materials", async (event) => {
        return await syncMaterialsStores();
    });

    // Получить конкретный ПОДраздел с БД материалов
    ipcMain.handle("get-one-sub-chapter", async (event, params: GetSubChapterOneParams) => {
        return await getOneSubChapter(params);
    });

    // Редактирование общих данных раздела/подраздела
    ipcMain.handle("edit-chapter", async (event, params: EditChapterParams) => {
        return await editChapter(params);
    });

    // Удаление раздела
    ipcMain.handle("delete-chapter", async (event, params: DeleteChapterParams) => {
        return await deleteChapter(params);
    });

    // Удаление подраздела
    ipcMain.handle("delete-sub-chapter", async (event, params: DeleteSubChapterParams) => {
        return await deleteSubChapter(params);
    });

    // Создание блока для раздела
    ipcMain.handle("create-chapter-block", async (event, params: CreateChapterBlock) => {
        return await createChapterBlock(params);
    });
})
