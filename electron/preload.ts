import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electron', {
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),  // Вызов через invoke
});
