"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  readFile: (filePath) => electron.ipcRenderer.invoke("read-file", filePath)
  // Вызов через invoke
});
