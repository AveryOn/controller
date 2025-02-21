"use strict";
const electron = require("electron");
function logout() {
  localStorage.clear();
  window.location.reload();
}
electron.contextBridge.exposeInMainWorld("electron", {
  // ================= SYSTEM  ==================
  checkAccess: () => electron.ipcRenderer.invoke("check-access"),
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
  syncMaterials: (auth) => electron.ipcRenderer.invoke("sync-materials", auth),
  getOneSubChapter: (params, auth) => electron.ipcRenderer.invoke("get-one-sub-chapter", params, auth),
  editChapter: (params, auth) => electron.ipcRenderer.invoke("edit-chapter", params, auth),
  deleteChapter: (params) => electron.ipcRenderer.invoke("delete-chapter", params),
  deleteSubChapter: (params) => electron.ipcRenderer.invoke("delete-sub-chapter", params),
  // ======= MATERIALS > BLOCKS ========
  getChapterBlocks: (params) => electron.ipcRenderer.invoke("get-chapter-blocks", params),
  getSubChapterBlocks: (params) => electron.ipcRenderer.invoke("get-sub-chapter-blocks", params),
  createChapterBlock: (params) => electron.ipcRenderer.invoke("create-chapter-block", params),
  editChapterBlock: (params) => electron.ipcRenderer.invoke("edit-chapter-block", params),
  deleteChapterBlock: (params) => electron.ipcRenderer.invoke("delete-chapter-block", params)
});
electron.ipcRenderer.on("main-process-message", (_, message) => {
  console.log("Сообщение от основного процесса:", message);
});
electron.ipcRenderer.on("logout", (_) => {
  logout();
});
