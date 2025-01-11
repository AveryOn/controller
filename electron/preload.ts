import { ipcRenderer, contextBridge } from 'electron'
import type { CreateUserParams, GetUsersConfig, LoginParams, UpdatePasswordParams } from './server/types/controllers/users.types';
import type { ChapterCreate, CreateChapterBlock, DeleteChapterBlock, DeleteChapterParams, DeleteSubChapterParams, EditChapterBlock, EditChapterBlockTitle, EditChapterParams, GetChapterOneParams, GetChaptersConfig, GetSubChapterOneParams, SubChapterCreate } from './server/types/controllers/materials.types';
import { PrepareUserStorageParams } from './server/types/controllers/system.types';
import { ValidateAccessTokenParams } from './server/types/controllers/auth.types';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
    // ============= AUTH =============
    validateAccessToken: (params: ValidateAccessTokenParams) => ipcRenderer.invoke('validate-access-token', params),

    // ============= USERS =============
    prepareUserStorage: (params: PrepareUserStorageParams) => ipcRenderer.invoke('prepare-user-storage', params),
    getUsers: (config: GetUsersConfig) => ipcRenderer.invoke('get-users', config),
    createUser: (params: CreateUserParams) => ipcRenderer.invoke('create-user', params),
    loginUser: (params: LoginParams) => ipcRenderer.invoke('login-user', params),
    updatePassword: (params: UpdatePasswordParams) => ipcRenderer.invoke('update-password', params),

    // ===== MATERIALS ========
    createChapter: (params: ChapterCreate) => ipcRenderer.invoke('create-chapter', params),
    getChapters: (params: GetChaptersConfig) => ipcRenderer.invoke('get-menu-chapters', params),
    getChapter: (params: GetChapterOneParams) => ipcRenderer.invoke('get-one-chapter', params),
    createSubChapter: (params: SubChapterCreate) => ipcRenderer.invoke('create-sub-chapter', params),
    syncMaterials: () => ipcRenderer.invoke('sync-materials'),
    getOneSubChapter: (params: GetSubChapterOneParams) => ipcRenderer.invoke('get-one-sub-chapter', params),
    editChapter: (params: EditChapterParams) => ipcRenderer.invoke('edit-chapter', params),
    deleteChapter: (params: DeleteChapterParams) => ipcRenderer.invoke('delete-chapter', params),
    deleteSubChapter: (params: DeleteSubChapterParams) => ipcRenderer.invoke('delete-sub-chapter', params),

    // ======= MATERIALS > BLOCKS ========
    createChapterBlock: (params: CreateChapterBlock) => ipcRenderer.invoke('create-chapter-block', params),
    editChapterBlock: (params: EditChapterBlockTitle & EditChapterBlock) => ipcRenderer.invoke('edit-chapter-block', params),
    editChapterBlockTitle: (params: EditChapterBlockTitle & EditChapterBlock) => ipcRenderer.invoke('edit-chapter-block-title', params),
    deleteChapterBlock: (params: DeleteChapterBlock) => ipcRenderer.invoke('delete-chapter-block', params),
});


ipcRenderer.on('main-process-message', (event, message) => {
    console.log('Сообщение от основного процесса:', message);
    // Вы можете обновить UI или выполнить другие действия с полученными данными
});