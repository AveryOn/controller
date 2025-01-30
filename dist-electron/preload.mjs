"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // ============= AUTH =============
  validateAccessToken: (params) => electron.ipcRenderer.invoke("validate-access-token", params),
  // ============= USERS =============
  prepareUserStore: (params) => electron.ipcRenderer.invoke("prepare-user-store", params),
  getUsers: (config) => electron.ipcRenderer.invoke("get-users", config),
  createUser: (params) => electron.ipcRenderer.invoke("create-user", params),
  loginUser: (params) => electron.ipcRenderer.invoke("login-user", params),
  updatePassword: (params) => electron.ipcRenderer.invoke("update-password", params),
  // ===== MATERIALS ========
  createChapter: (params, auth) => electron.ipcRenderer.invoke("create-chapter", params, auth),
  getChapters: (params) => electron.ipcRenderer.invoke("get-menu-chapters", params),
  getChapter: (params) => electron.ipcRenderer.invoke("get-one-chapter", params),
  createSubChapter: (params, auth) => electron.ipcRenderer.invoke("create-sub-chapter", params, auth),
  // syncMaterials: () => ipcRenderer.invoke('sync-materials'),
  getOneSubChapter: (params, auth) => electron.ipcRenderer.invoke("get-one-sub-chapter", params, auth),
  editChapter: (params, auth) => electron.ipcRenderer.invoke("edit-chapter", params, auth),
  deleteChapter: (params) => electron.ipcRenderer.invoke("delete-chapter", params),
  deleteSubChapter: (params) => electron.ipcRenderer.invoke("delete-sub-chapter", params),
  // ======= MATERIALS > BLOCKS ========
  createChapterBlock: (params) => electron.ipcRenderer.invoke("create-chapter-block", params),
  editChapterBlock: (params) => electron.ipcRenderer.invoke("edit-chapter-block", params),
  editChapterBlockTitle: (params) => electron.ipcRenderer.invoke("edit-chapter-block-title", params),
  deleteChapterBlock: (params) => electron.ipcRenderer.invoke("delete-chapter-block", params)
});
electron.ipcRenderer.on("main-process-message", (event, message) => {
  console.log("Сообщение от основного процесса:", message);
});
