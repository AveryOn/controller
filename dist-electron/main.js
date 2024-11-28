import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path$1 from "node:path";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
const keylen = 64;
const N = 16384;
const r = 8;
const p = 1;
async function encrypt(input) {
  return new Promise((resolve, reject) => {
    try {
      const salt = crypto.randomBytes(16).toString("hex");
      crypto.scrypt(input, salt, keylen, { N, r, p }, (err, derivedKey) => {
        if (err) {
          throw err;
        }
        resolve({ hash: derivedKey.toString("hex"), salt });
      });
    } catch (err) {
      reject(err);
    }
  });
}
async function verify(input, salt, hash) {
  return new Promise((resolve, reject) => {
    try {
      crypto.scrypt(input, salt, keylen, { N, r, p }, (err, derivedKey) => {
        if (err) throw err;
        if (derivedKey.toString("hex") === hash) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
const USER_FILENAME = "users.json";
async function writeUsersDataFs(data) {
  try {
    const userDataDir = app.getPath("userData");
    const filePath = path.join(userDataDir, USER_FILENAME);
    return void await fs.writeFile(filePath, JSON.stringify(data), { encoding: "utf-8" });
  } catch (err) {
    console.error(err);
    throw err;
  }
}
async function prepareUsersStore() {
  const userDataDir = app.getPath("userData");
  const filePath = path.join(userDataDir, USER_FILENAME);
  return fs.readFile(filePath, { encoding: "utf-8" }).then((data) => {
    return true;
  }).catch(async () => {
    try {
      await fs.writeFile(filePath, JSON.stringify([]), { encoding: "utf-8" });
      return true;
    } catch (err) {
      console.error("WRITE FILE", err);
      return false;
    }
  });
}
async function getUsers(config) {
  try {
    const userDataDir = app.getPath("userData");
    const filePath = path.join(userDataDir, USER_FILENAME);
    const users = JSON.parse(await fs.readFile(filePath, { encoding: "utf-8" }));
    if (config && config.page && config.perPage) {
      const right = config.perPage * config.page;
      const left = right - config.perPage;
      return users.slice(left, right);
    } else return users;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
async function createUser(params) {
  try {
    if (!params.password || !params.username) throw "[createUser]>> INVALID_USER_DATA";
    const users = await getUsers();
    users.forEach((user) => {
      if (user.username === params.username) {
        throw "[createUser]>> CONSTRAINT_VIOLATE_UNIQUE";
      }
    });
    const { hash, salt } = await encrypt(params.password);
    const newUser = {
      id: users.length + 1,
      username: params.username,
      password: hash,
      hash_salt: salt,
      avatar: null
    };
    users.push(newUser);
    await writeUsersDataFs(users);
    return newUser;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
async function loginUser(params) {
  try {
    if (!params.password || !params.username) throw "[loginUser]>> INVALID_USER_DATA";
    const users = await getUsers();
    const findedUser = users.find((user) => user.username === params.username);
    if (!findedUser) {
      throw "[loginUser]>> NOT_EXISTS_RECORD";
    }
    const isVerifyPassword = await verify(params.password, findedUser.hash_salt, findedUser.password).catch((err) => {
      console.log("ERROR", err);
    });
    if (isVerifyPassword === true) {
      const readyUser = { ...findedUser };
      Reflect.deleteProperty(readyUser, "password");
      Reflect.deleteProperty(readyUser, "hash_salt");
      return {
        token: "tested_hash_token_type_jwt",
        user: readyUser
      };
    } else {
      throw "[loginUser]>> INVALID_CREDENTIALS";
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}
async function updatePassword(params) {
  try {
    if (params.newPassword === params.oldPassword) throw "[updatePassword]>> INVALID_DATA";
    let users = await getUsers();
    const findedUser = users.find((user) => user.username === params.username);
    if (!findedUser) {
      throw "[updatePassword]>> NOT_EXISTS_RECORD";
    }
    if (!await verify(params.oldPassword, findedUser.hash_salt, findedUser.password)) {
      throw "[updatePassword]>> INVALID_CREDENTIALS";
    }
    const { hash, salt } = await encrypt(params.newPassword);
    findedUser.hash_salt = salt;
    findedUser.password = hash;
    users = users.map((user) => {
      if (user.id === findedUser.id) {
        return findedUser;
      }
      return user;
    });
    await writeUsersDataFs(users);
    return true;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
async function writeFile(data, config) {
  try {
    const userDataDir = app.getPath(config.directory);
    const filePath = path.join(userDataDir, config.filename);
    const correctData = config.format === "json" ? JSON.stringify(data) : data;
    return void await fs.writeFile(filePath, correctData, { encoding: config.encoding || "utf-8" });
  } catch (err) {
    console.error(err);
    throw err;
  }
}
async function readFile(config) {
  try {
    const userDataDir = app.getPath(config.directory);
    const filePath = path.join(userDataDir, config.filename);
    const data = await fs.readFile(filePath, { encoding: config.encoding || "utf-8" });
    return config.format === "json" ? JSON.parse(data) : data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
function trimPath(fullpath, config) {
  const symbols = ` !"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~	
\r\v\f`;
  const separator = (config == null ? void 0 : config.separator) || "/";
  let pathChunks = fullpath.split(separator);
  let correctFullPath;
  if (pathChunks.at(-1) === "") fullpath = fullpath.slice(0, -1);
  if (symbols.includes(pathChunks[0])) correctFullPath = fullpath.slice(2);
  else if (pathChunks[0] === "") correctFullPath = fullpath.slice(1);
  else correctFullPath = fullpath;
  pathChunks = void 0;
  if ((config == null ? void 0 : config.split) === true) {
    return correctFullPath.split(separator);
  }
  return correctFullPath;
}
const MATERIALS_FILENAME = "materials.json";
const FSCONFIG = {
  directory: "appData",
  encoding: "utf-8",
  filename: MATERIALS_FILENAME,
  format: "json"
};
async function prepareMaterialsStore() {
  return readFile(FSCONFIG).then((data) => {
    return true;
  }).catch(async () => {
    try {
      await writeFile([], FSCONFIG);
      return true;
    } catch (err) {
      console.error("WRITE FILE", err);
      return false;
    }
  });
}
async function createChapter(params) {
  try {
    const materials = await readFile(FSCONFIG);
    materials.forEach((chapter) => {
      if (chapter.pathName === params.pathName) {
        throw "[createChapter]>> CONSTRAINT_VIOLATE_UNIQUE";
      }
    });
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const newChapter = {
      id: (materials.length || 0) + 1,
      chapterType: params.chapterType,
      content: {
        blocks: [],
        title: null
      },
      label: params.label,
      icon: params.icon,
      iconType: params.iconType,
      pathName: params.pathName,
      route: params.route,
      items: params.chapterType === "dir" ? [] : null,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    materials.push(newChapter);
    await writeFile(materials, FSCONFIG);
    return newChapter;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
async function getChapters(params) {
  try {
    const formattedChapters = (items) => {
      return items.map((chapter) => {
        return {
          id: chapter.id,
          icon: chapter.icon,
          iconType: chapter.iconType,
          label: chapter.label,
          pathName: chapter.pathName,
          route: chapter.route,
          items: chapter.items
        };
      });
    };
    const chapters = await readFile(FSCONFIG);
    if (params && params.page && params.perPage) {
      const right = params.perPage * params.page;
      const left = right - params.perPage;
      let chaptersChunk = chapters.slice(left, right);
      return formattedChapters(chaptersChunk);
    }
    return formattedChapters(chapters);
  } catch (err) {
    console.error(err);
    throw err;
  }
}
async function getOneChapter(params) {
  try {
    const materials = await readFile(FSCONFIG);
    if (params.chapterId) {
      const findedChapter = materials.find((chapter) => chapter.id === params.chapterId);
      if (!findedChapter) throw "[getOneChapter]>> NOT_EXISTS_RECORD";
      return findedChapter;
    } else if (params.pathName) {
      const findedChapter = materials.find((chapter) => chapter.pathName === params.pathName);
      if (!findedChapter) throw "[getOneChapter]>> NOT_EXISTS_RECORD";
      return findedChapter;
    } else {
      throw "[getOneChapter]>> NOT_EXISTS_RECORD";
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}
function findLevel(items, initPath) {
  if (items.length <= 0) return null;
  const current = initPath.shift();
  console.log("current:", current);
  for (const chapter of items) {
    const selfPath = trimPath(chapter.fullpath, { split: true }).at(-1);
    console.log("selfPath:", selfPath);
    if (selfPath === current) {
      console.log("НАшли нужный уровень", selfPath === current);
      if (initPath.length <= 0) {
        return chapter;
      } else {
        console.log("Путь еще не пуст:", initPath);
        if (chapter.items && chapter.items.length > 0) {
          console.log("Выполняем поиск по items:", chapter.items.length);
          return findLevel(chapter.items, initPath);
        } else {
          throw `[Materials/findLevel]>> Ожидается, что items для "${selfPath}" не будет пустым, но он пуст`;
        }
      }
    } else {
      console.log("Нужный уровень не найден:", selfPath === current);
    }
  }
  return null;
}
async function createSubChapter(params) {
  try {
    if (!params) throw "[createSubChapter]>> INVALID_INPUT_DATA";
    const materials = await readFile(FSCONFIG);
    const chapter = materials.find((chapter2) => chapter2.id === params.chapterId);
    if ((chapter == null ? void 0 : chapter.chapterType) === "dir" && chapter.items) {
      const newSubChapter = {
        id: (chapter.items.length || 0) + 1,
        chapterType: params.chapterType,
        content: {
          blocks: [],
          title: null
        },
        icon: params.icon,
        iconType: params.iconType,
        fullpath: params.fullpath,
        label: params.label,
        route: params.route,
        items: params.chapterType === "dir" ? [] : null,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const correctFullPath = trimPath(params.fullpath, { split: true }).slice(1, -1);
      if (correctFullPath.length <= 0) {
        chapter.items.push(newSubChapter);
      }
      const needLevel = findLevel(chapter.items, correctFullPath);
      if (!needLevel) {
        throw "[createSubChapter]>> Нужный уровень найти не удалось";
      }
    } else {
      throw "[createSubChapter]>> INVALID_CHAPTER_TYPE";
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}
createRequire(import.meta.url);
const __dirname = path$1.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path$1.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path$1.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path$1.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path$1.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path$1.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path$1.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", async () => {
    let isReliableStores = true;
    isReliableStores = await prepareUsersStore();
    isReliableStores = await prepareMaterialsStore();
    win == null ? void 0 : win.webContents.send("main-process-message", isReliableStores);
    console.log("ГОТОВНОСТЬ БАЗ ДАННЫХ:", isReliableStores);
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path$1.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  createWindow();
  ipcMain.handle("get-users", async (event, config) => {
    return await getUsers(config);
  });
  ipcMain.handle("create-user", async (event, params) => {
    return await createUser(params);
  });
  ipcMain.handle("login-user", async (event, params) => {
    return await loginUser(params);
  });
  ipcMain.handle("update-password", async (event, params) => {
    return await updatePassword(params);
  });
  ipcMain.handle("create-chapter", async (event, params) => {
    return await createChapter(params);
  });
  ipcMain.handle("get-menu-chapters", async (event, params) => {
    return await getChapters(params);
  });
  ipcMain.handle("get-one-chapter", async (event, params) => {
    return await getOneChapter(params);
  });
  ipcMain.handle("create-sub-chapter", async (event, params) => {
    return await createSubChapter(params);
  });
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
