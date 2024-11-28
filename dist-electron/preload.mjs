"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  getUsers: (config) => electron.ipcRenderer.invoke("get-users", config),
  createUser: (params) => electron.ipcRenderer.invoke("create-user", params),
  loginUser: (params) => electron.ipcRenderer.invoke("login-user", params),
  updatePassword: (params) => electron.ipcRenderer.invoke("update-password", params),
  // ===== MATERIALS ========
  createChapter: (params) => electron.ipcRenderer.invoke("create-chapter", params),
  getChapters: (params) => electron.ipcRenderer.invoke("get-menu-chapters", params),
  getChapter: (params) => electron.ipcRenderer.invoke("get-one-chapter", params),
  createSubChapter: (params) => electron.ipcRenderer.invoke("create-sub-chapter", params),
  syncMaterials: () => electron.ipcRenderer.invoke("sync-materials")
});
electron.ipcRenderer.on("main-process-message", (event, message) => {
  console.log("Сообщение от основного процесса:", message);
});
