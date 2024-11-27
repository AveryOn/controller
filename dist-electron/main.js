import { app as c, BrowserWindow as _, ipcMain as l } from "electron";
import { createRequire as S } from "node:module";
import { fileURLToPath as N } from "node:url";
import i from "node:path";
import f from "path";
import u from "fs/promises";
import w from "crypto";
const y = 64, P = 16384, R = 8, E = 1;
async function I(r) {
  return new Promise((e, t) => {
    try {
      const n = w.randomBytes(16).toString("hex");
      w.scrypt(r, n, y, { N: P, r: R, p: E }, (s, o) => {
        if (s)
          throw s;
        e({ hash: o.toString("hex"), salt: n });
      });
    } catch (n) {
      t(n);
    }
  });
}
async function m(r, e, t) {
  return new Promise((n, s) => {
    try {
      w.scrypt(r, e, y, { N: P, r: R, p: E }, (o, A) => {
        if (o) throw o;
        A.toString("hex") === t ? n(!0) : n(!1);
      });
    } catch (o) {
      s(o);
    }
  });
}
const p = "users.json";
async function D(r) {
  try {
    const e = c.getPath("userData"), t = f.join(e, p);
    return void await u.writeFile(t, JSON.stringify(r), { encoding: "utf-8" });
  } catch (e) {
    throw console.error(e), e;
  }
}
async function O() {
  const r = c.getPath("userData"), e = f.join(r, p);
  return u.readFile(e, { encoding: "utf-8" }).then((t) => !0).catch(async () => {
    try {
      return await u.writeFile(e, JSON.stringify([]), { encoding: "utf-8" }), !0;
    } catch (t) {
      return console.error("WRITE FILE", t), !1;
    }
  });
}
async function d(r) {
  try {
    const e = c.getPath("userData"), t = f.join(e, p), n = JSON.parse(await u.readFile(t, { encoding: "utf-8" }));
    if (r && r.page && r.perPage) {
      const s = r.perPage * r.page, o = s - r.perPage;
      return n.slice(o, s);
    } else return n;
  } catch (e) {
    throw console.error(e), e;
  }
}
async function v(r) {
  try {
    if (!r.password || !r.username) throw "[createUser]>> INVALID_USER_DATA";
    const e = await d();
    e.forEach((o) => {
      if (o.username === r.username)
        throw "[createUser]>> CONSTRAINT_VIOLATE_UNIQUE";
    });
    const { hash: t, salt: n } = await I(r.password), s = {
      id: e.length + 1,
      username: r.username,
      password: t,
      hash_salt: n,
      avatar: null
    };
    return e.push(s), await D(e), s;
  } catch (e) {
    throw console.error(e), e;
  }
}
async function L(r) {
  try {
    if (!r.password || !r.username) throw "[loginUser]>> INVALID_USER_DATA";
    const t = (await d()).find((s) => s.username === r.username);
    if (!t)
      throw "[loginUser]>> NOT_EXISTS_RECORD";
    if (await m(r.password, t.hash_salt, t.password).catch((s) => {
      console.log("ERROR", s);
    }) === !0) {
      const s = { ...t };
      return Reflect.deleteProperty(s, "password"), Reflect.deleteProperty(s, "hash_salt"), {
        token: "tested_hash_token_type_jwt",
        user: s
      };
    } else
      throw "[loginUser]>> INVALID_CREDENTIALS";
  } catch (e) {
    throw console.error(e), e;
  }
}
async function V(r) {
  try {
    if (r.newPassword === r.oldPassword) throw "[updatePassword]>> INVALID_DATA";
    let e = await d();
    const t = e.find((o) => o.username === r.username);
    if (!t)
      throw "[updatePassword]>> NOT_EXISTS_RECORD";
    if (!await m(r.oldPassword, t.hash_salt, t.password))
      throw "[updatePassword]>> INVALID_CREDENTIALS";
    const { hash: n, salt: s } = await I(r.newPassword);
    return t.hash_salt = s, t.password = n, e = e.map((o) => o.id === t.id ? t : o), await D(e), !0;
  } catch (e) {
    throw console.error(e), e;
  }
}
S(import.meta.url);
const g = i.dirname(N(import.meta.url));
process.env.APP_ROOT = i.join(g, "..");
const h = process.env.VITE_DEV_SERVER_URL, k = i.join(process.env.APP_ROOT, "dist-electron"), U = i.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = h ? i.join(process.env.APP_ROOT, "public") : U;
let a;
function T() {
  a = new _({
    icon: i.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: i.join(g, "preload.mjs")
    }
  }), a.webContents.on("did-finish-load", async () => {
    let r = !0;
    r = await O(), a == null || a.webContents.send("main-process-message", r);
  }), h ? a.loadURL(h) : a.loadFile(i.join(U, "index.html"));
}
c.on("window-all-closed", () => {
  process.platform !== "darwin" && (c.quit(), a = null);
});
c.on("activate", () => {
  _.getAllWindows().length === 0 && T();
});
c.whenReady().then(() => {
  T(), l.handle("get-users", async (r, e) => await d(e)), l.handle("create-user", async (r, e) => await v(e)), l.handle("login-user", async (r, e) => await L(e)), l.handle("update-password", async (r, e) => await V(e));
});
export {
  k as MAIN_DIST,
  U as RENDERER_DIST,
  h as VITE_DEV_SERVER_URL
};
