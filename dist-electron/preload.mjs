"use strict";
const electron = require("electron");
var LocalVars = /* @__PURE__ */ ((LocalVars2) => {
  LocalVars2["userData"] = "user-data";
  LocalVars2["token"] = "token";
  LocalVars2["currentRoute"] = "current_route";
  LocalVars2["materialsFullLabel"] = "materials-full-label";
  LocalVars2["palette"] = "palette";
  LocalVars2["theme"] = "theme";
  return LocalVars2;
})(LocalVars || {});
function clearSensitiveData() {
  localStorage.removeItem(LocalVars.userData);
  localStorage.removeItem(LocalVars.token);
  localStorage.removeItem(LocalVars.materialsFullLabel);
  localStorage.removeItem(LocalVars.currentRoute);
}
function logout(config) {
  clearSensitiveData();
  if ((config == null ? void 0 : config.fromServer) === true) {
    window.location.reload();
  }
}
function refreshToken(token) {
  localStorage.setItem(LocalVars.token, token);
}
electron.contextBridge.exposeInMainWorld("electron", {
  // ================= SYSTEM  ==================
  windowMin: () => electron.ipcRenderer.send("win:minimize"),
  windowMax: () => electron.ipcRenderer.send("win:maximize"),
  windowClose: () => electron.ipcRenderer.send("win:close"),
  // ============= AUTH =============
  checkAccess: () => electron.ipcRenderer.invoke("check-access"),
  validateAccessToken: (params) => electron.ipcRenderer.invoke("validate-access-token", params),
  // ============= USERS =============
  prepareUserStore: (params) => electron.ipcRenderer.invoke("prepare-user-store", params),
  getUsers: (config) => electron.ipcRenderer.invoke("get-users", config),
  createUser: (params) => electron.ipcRenderer.invoke("create-user", params),
  loginUser: (params) => electron.ipcRenderer.invoke("login-user", params),
  updatePassword: (params) => electron.ipcRenderer.invoke("update-password", params),
  // ===== MATERIALS ========
  createChapter: (params, auth) => electron.ipcRenderer.invoke("create-chapter", params, auth),
  getChapters: (params, auth) => electron.ipcRenderer.invoke("get-menu-chapters", params, auth),
  getChapter: (params, auth) => electron.ipcRenderer.invoke("get-one-chapter", params, auth),
  createSubChapter: (params, auth) => electron.ipcRenderer.invoke("create-sub-chapter", params, auth),
  syncMaterials: (auth) => electron.ipcRenderer.invoke("sync-materials", auth),
  getOneSubChapter: (params, auth) => electron.ipcRenderer.invoke("get-one-sub-chapter", params, auth),
  editChapter: (params, auth) => electron.ipcRenderer.invoke("edit-chapter", params, auth),
  deleteChapter: (params, auth) => electron.ipcRenderer.invoke("delete-chapter", params, auth),
  deleteSubChapter: (params, auth) => electron.ipcRenderer.invoke("delete-sub-chapter", params, auth),
  // ======= MATERIALS > BLOCKS ========
  getOneBlock: (params, auth) => electron.ipcRenderer.invoke("get-one-block", params, auth),
  getChapterBlocks: (params, auth) => electron.ipcRenderer.invoke("get-chapter-blocks", params, auth),
  getSubChapterBlocks: (params, auth) => electron.ipcRenderer.invoke("get-sub-chapter-blocks", params, auth),
  createChapterBlock: (params, auth) => electron.ipcRenderer.invoke("create-chapter-block", params, auth),
  editChapterBlock: (params, auth) => electron.ipcRenderer.invoke("edit-chapter-block", params, auth),
  deleteChapterBlock: (params, auth) => electron.ipcRenderer.invoke("delete-chapter-block", params, auth)
});
electron.ipcRenderer.on("logout", (_, config) => {
  logout(config);
});
electron.ipcRenderer.on("refresh-token", (_, token) => {
  refreshToken(token);
});
