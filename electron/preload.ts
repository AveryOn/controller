import { ipcRenderer, contextBridge } from 'electron'
import type { CreateUserParams, GetUsersConfig, LoginParams, PrepareUserStoreParams, UpdatePasswordParams } from './server/types/controllers/users.types';
import type { ChapterCreate, CreateChapterBlock, DeleteChapterBlock, DeleteChapterParams, DeleteSubChapterParams, EditChapterBlock, EditChapterParams, GetChapterBlocks, GetChapterOneParams, GetChaptersConfig, GetSubChapterOneParams, SubChapterCreate } from './server/types/controllers/materials.types';
import { ValidateAccessTokenParams } from './server/types/controllers/auth.types';
import { AuthParams } from './server/types/controllers/index.types';
import { logout, refreshToken } from '../src/utils/auth';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
    // ================= SYSTEM  ==================
    checkAccess: () => ipcRenderer.invoke('check-access'),

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
    getChapters: (params: GetChaptersConfig, auth: AuthParams) => ipcRenderer.invoke('get-menu-chapters', params, auth),
    getChapter: (params: GetChapterOneParams, auth: AuthParams) => ipcRenderer.invoke('get-one-chapter', params, auth),
    createSubChapter: (params: SubChapterCreate, auth: AuthParams) => ipcRenderer.invoke('create-sub-chapter', params, auth),
    syncMaterials: (auth: AuthParams) => ipcRenderer.invoke('sync-materials', auth),
    getOneSubChapter: (params: GetSubChapterOneParams, auth: AuthParams) => ipcRenderer.invoke('get-one-sub-chapter', params, auth),
    editChapter: (params: EditChapterParams, auth: AuthParams) => ipcRenderer.invoke('edit-chapter', params, auth),
    deleteChapter: (params: DeleteChapterParams, auth: AuthParams) => ipcRenderer.invoke('delete-chapter', params, auth),
    deleteSubChapter: (params: DeleteSubChapterParams, auth: AuthParams) => ipcRenderer.invoke('delete-sub-chapter', params, auth),

    // ======= MATERIALS > BLOCKS ========
    getChapterBlocks: (params: GetChapterBlocks, auth: AuthParams) => ipcRenderer.invoke('get-chapter-blocks', params, auth),
    getSubChapterBlocks: (params: GetChapterBlocks, auth: AuthParams) => ipcRenderer.invoke('get-sub-chapter-blocks', params, auth),
    createChapterBlock: (params: CreateChapterBlock, auth: AuthParams) => ipcRenderer.invoke('create-chapter-block', params, auth),
    editChapterBlock: (params: EditChapterBlock, auth: AuthParams) => ipcRenderer.invoke('edit-chapter-block', params, auth),
    deleteChapterBlock: (params: DeleteChapterBlock, auth: AuthParams) => ipcRenderer.invoke('delete-chapter-block', params, auth),
});


ipcRenderer.on('logout', (_, config) => {
    logout(config);
});

ipcRenderer.on('refresh-token', (_, token: string) => {
    refreshToken(token);
});
