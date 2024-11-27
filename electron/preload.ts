import { ipcRenderer, contextBridge } from 'electron'
import { CreateUserParams, GetUsersConfig, LoginParams, UpdatePasswordParams } from './server/types/controllers/users.types';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
    getUsers: (config: GetUsersConfig) => ipcRenderer.invoke('get-users', config),
    createUser: (params: CreateUserParams) => ipcRenderer.invoke('create-user', params),
    loginUser: (params: LoginParams) => ipcRenderer.invoke('login-user', params),
    updatePassword: (params: UpdatePasswordParams) => ipcRenderer.invoke('update-password', params),
});


ipcRenderer.on('main-process-message', (event, message) => {
    console.log('Сообщение от основного процесса:', message);
    // Вы можете обновить UI или выполнить другие действия с полученными данными
});