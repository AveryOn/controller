import { ipcRenderer, contextBridge } from 'electron'
import type { CreateUserParams, GetUsersConfig, LoginParams, UpdatePasswordParams } from './server/types/controllers/users.types';
import type { ChapterCreate, GetChapterOneParams, GetChaptersConfig } from './server/types/controllers/materials.types';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
    getUsers: (config: GetUsersConfig) => ipcRenderer.invoke('get-users', config),
    createUser: (params: CreateUserParams) => ipcRenderer.invoke('create-user', params),
    loginUser: (params: LoginParams) => ipcRenderer.invoke('login-user', params),
    updatePassword: (params: UpdatePasswordParams) => ipcRenderer.invoke('update-password', params),

    // ===== MATERIALS ========
    createChapter: (params: ChapterCreate) => ipcRenderer.invoke('create-chapter', params),
    getChapters: (params: GetChaptersConfig) => ipcRenderer.invoke('get-menu-chapters', params),
    getChapter: (params: GetChapterOneParams) => ipcRenderer.invoke('get-one-chapter', params),
});


ipcRenderer.on('main-process-message', (event, message) => {
    console.log('Сообщение от основного процесса:', message);
    // Вы можете обновить UI или выполнить другие действия с полученными данными
});