import { ipcRenderer, contextBridge } from 'electron'
import type { CreateUserParams, GetUsersConfig, LoginParams, PrepareUserStoreParams, UpdatePasswordParams } from './server/types/controllers/users.types';
import type { ChapterCreate, CreateChapterBlock, DeleteChapterBlock, DeleteChapterParams, DeleteSubChapterParams, EditChapterBlock, EditChapterParams, GetChapterBlocks, GetChapterOneParams, GetChaptersConfig, GetSubChapterOneParams, SubChapterCreate } from './server/types/controllers/materials.types';
import { ValidateAccessTokenParams } from './server/types/controllers/auth.types';
import { AuthParams } from './server/types/controllers/index.types';
import { logout } from '../src/utils/auth';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
    // ============= AUTH =============
    validateAccessToken: (params: ValidateAccessTokenParams) => ipcRenderer.invoke('validate-access-token', params),

    // ============= USERS =============
    prepareUserStore: (params: PrepareUserStoreParams) => ipcRenderer.invoke('prepare-user-store', params),
    getUsers: (config: GetUsersConfig) => ipcRenderer.invoke('get-users', config),
    createUser: (params: CreateUserParams) => ipcRenderer.invoke('create-user', params),
    loginUser: (params: LoginParams) => ipcRenderer.invoke('login-user', params),
    updatePassword: (params: UpdatePasswordParams) => ipcRenderer.invoke('update-password', params),

    // ===== MATERIALS ========
    createChapter: (params: ChapterCreate, auth: AuthParams) => ipcRenderer.invoke('create-chapter', params, auth),
    getChapters: (params: GetChaptersConfig) => ipcRenderer.invoke('get-menu-chapters', params),
    getChapter: (params: GetChapterOneParams) => ipcRenderer.invoke('get-one-chapter', params),
    createSubChapter: (params: SubChapterCreate, auth: AuthParams) => ipcRenderer.invoke('create-sub-chapter', params, auth),
    syncMaterials: (auth: AuthParams) => ipcRenderer.invoke('sync-materials', auth),
    getOneSubChapter: (params: GetSubChapterOneParams, auth: AuthParams) => ipcRenderer.invoke('get-one-sub-chapter', params, auth),
    editChapter: (params: EditChapterParams, auth: AuthParams) => ipcRenderer.invoke('edit-chapter', params, auth),
    deleteChapter: (params: DeleteChapterParams) => ipcRenderer.invoke('delete-chapter', params),
    deleteSubChapter: (params: DeleteSubChapterParams) => ipcRenderer.invoke('delete-sub-chapter', params),

    // ======= MATERIALS > BLOCKS ========
    getChapterBlocks: (params: GetChapterBlocks) => ipcRenderer.invoke('get-chapter-blocks', params),
    getSubChapterBlocks: (params: GetChapterBlocks) => ipcRenderer.invoke('get-sub-chapter-blocks', params),
    createChapterBlock: (params: CreateChapterBlock) => ipcRenderer.invoke('create-chapter-block', params),
    editChapterBlock: (params: EditChapterBlock) => ipcRenderer.invoke('edit-chapter-block', params),
    deleteChapterBlock: (params: DeleteChapterBlock) => ipcRenderer.invoke('delete-chapter-block', params),
});


ipcRenderer.on('main-process-message', (_, message) => {
    console.log('Сообщение от основного процесса:', message);
});

ipcRenderer.on('logout', (_) => {
    logout();
});
