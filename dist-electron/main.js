var Cs = Object.defineProperty;
var Us = (e, t, r) => t in e ? Cs(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var k = (e, t, r) => Us(e, typeof t != "symbol" ? t + "" : t, r);
import Ar from "fs";
import C from "path";
import Ls from "os";
import W from "crypto";
import { app as oe, BrowserWindow as Mr, ipcMain as R } from "electron";
import { fileURLToPath as xs } from "node:url";
import ye from "node:path";
import je from "fs/promises";
import { fileURLToPath as Ws } from "url";
import { fork as Vs } from "child_process";
var he = { exports: {} };
const Hs = "16.4.7", $s = {
  version: Hs
}, Pt = Ar, Bt = C, Bs = Ls, Gs = W, js = $s, Gt = js.version, Ks = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function qs(e) {
  const t = {};
  let r = e.toString();
  r = r.replace(/\r\n?/mg, `
`);
  let s;
  for (; (s = Ks.exec(r)) != null; ) {
    const a = s[1];
    let n = s[2] || "";
    n = n.trim();
    const i = n[0];
    n = n.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), i === '"' && (n = n.replace(/\\n/g, `
`), n = n.replace(/\\r/g, "\r")), t[a] = n;
  }
  return t;
}
function Zs(e) {
  const t = Ir(e), r = M.configDotenv({ path: t });
  if (!r.parsed) {
    const i = new Error(`MISSING_DATA: Cannot parse ${t} for an unknown reason`);
    throw i.code = "MISSING_DATA", i;
  }
  const s = Fr(e).split(","), a = s.length;
  let n;
  for (let i = 0; i < a; i++)
    try {
      const o = s[i].trim(), l = Qs(r, o);
      n = M.decrypt(l.ciphertext, l.key);
      break;
    } catch (o) {
      if (i + 1 >= a)
        throw o;
    }
  return M.parse(n);
}
function Js(e) {
  console.log(`[dotenv@${Gt}][INFO] ${e}`);
}
function zs(e) {
  console.log(`[dotenv@${Gt}][WARN] ${e}`);
}
function ct(e) {
  console.log(`[dotenv@${Gt}][DEBUG] ${e}`);
}
function Fr(e) {
  return e && e.DOTENV_KEY && e.DOTENV_KEY.length > 0 ? e.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function Qs(e, t) {
  let r;
  try {
    r = new URL(t);
  } catch (o) {
    if (o.code === "ERR_INVALID_URL") {
      const l = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw l.code = "INVALID_DOTENV_KEY", l;
    }
    throw o;
  }
  const s = r.password;
  if (!s) {
    const o = new Error("INVALID_DOTENV_KEY: Missing key part");
    throw o.code = "INVALID_DOTENV_KEY", o;
  }
  const a = r.searchParams.get("environment");
  if (!a) {
    const o = new Error("INVALID_DOTENV_KEY: Missing environment part");
    throw o.code = "INVALID_DOTENV_KEY", o;
  }
  const n = `DOTENV_VAULT_${a.toUpperCase()}`, i = e.parsed[n];
  if (!i) {
    const o = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${n} in your .env.vault file.`);
    throw o.code = "NOT_FOUND_DOTENV_ENVIRONMENT", o;
  }
  return { ciphertext: i, key: s };
}
function Ir(e) {
  let t = null;
  if (e && e.path && e.path.length > 0)
    if (Array.isArray(e.path))
      for (const r of e.path)
        Pt.existsSync(r) && (t = r.endsWith(".vault") ? r : `${r}.vault`);
    else
      t = e.path.endsWith(".vault") ? e.path : `${e.path}.vault`;
  else
    t = Bt.resolve(process.cwd(), ".env.vault");
  return Pt.existsSync(t) ? t : null;
}
function mr(e) {
  return e[0] === "~" ? Bt.join(Bs.homedir(), e.slice(1)) : e;
}
function Xs(e) {
  Js("Loading env from encrypted .env.vault");
  const t = M._parseVault(e);
  let r = process.env;
  return e && e.processEnv != null && (r = e.processEnv), M.populate(r, t, e), { parsed: t };
}
function ea(e) {
  const t = Bt.resolve(process.cwd(), ".env");
  let r = "utf8";
  const s = !!(e && e.debug);
  e && e.encoding ? r = e.encoding : s && ct("No encoding is specified. UTF-8 is used by default");
  let a = [t];
  if (e && e.path)
    if (!Array.isArray(e.path))
      a = [mr(e.path)];
    else {
      a = [];
      for (const l of e.path)
        a.push(mr(l));
    }
  let n;
  const i = {};
  for (const l of a)
    try {
      const c = M.parse(Pt.readFileSync(l, { encoding: r }));
      M.populate(i, c, e);
    } catch (c) {
      s && ct(`Failed to load ${l} ${c.message}`), n = c;
    }
  let o = process.env;
  return e && e.processEnv != null && (o = e.processEnv), M.populate(o, i, e), n ? { parsed: i, error: n } : { parsed: i };
}
function ta(e) {
  if (Fr(e).length === 0)
    return M.configDotenv(e);
  const t = Ir(e);
  return t ? M._configVault(e) : (zs(`You set DOTENV_KEY but you are missing a .env.vault file at ${t}. Did you forget to build it?`), M.configDotenv(e));
}
function ra(e, t) {
  const r = Buffer.from(t.slice(-64), "hex");
  let s = Buffer.from(e, "base64");
  const a = s.subarray(0, 12), n = s.subarray(-16);
  s = s.subarray(12, -16);
  try {
    const i = Gs.createDecipheriv("aes-256-gcm", r, a);
    return i.setAuthTag(n), `${i.update(s)}${i.final()}`;
  } catch (i) {
    const o = i instanceof RangeError, l = i.message === "Invalid key length", c = i.message === "Unsupported state or unable to authenticate data";
    if (o || l) {
      const _ = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw _.code = "INVALID_DOTENV_KEY", _;
    } else if (c) {
      const _ = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw _.code = "DECRYPTION_FAILED", _;
    } else
      throw i;
  }
}
function sa(e, t, r = {}) {
  const s = !!(r && r.debug), a = !!(r && r.override);
  if (typeof t != "object") {
    const n = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw n.code = "OBJECT_REQUIRED", n;
  }
  for (const n of Object.keys(t))
    Object.prototype.hasOwnProperty.call(e, n) ? (a === !0 && (e[n] = t[n]), s && ct(a === !0 ? `"${n}" is already defined and WAS overwritten` : `"${n}" is already defined and was NOT overwritten`)) : e[n] = t[n];
}
const M = {
  configDotenv: ea,
  _configVault: Xs,
  _parseVault: Zs,
  config: ta,
  decrypt: ra,
  parse: qs,
  populate: sa
};
he.exports.configDotenv = M.configDotenv;
he.exports._configVault = M._configVault;
he.exports._parseVault = M._parseVault;
he.exports.config = M.config;
he.exports.decrypt = M.decrypt;
he.exports.parse = M.parse;
he.exports.populate = M.populate;
he.exports = M;
var aa = he.exports;
const Fe = {};
process.env.DOTENV_CONFIG_ENCODING != null && (Fe.encoding = process.env.DOTENV_CONFIG_ENCODING);
process.env.DOTENV_CONFIG_PATH != null && (Fe.path = process.env.DOTENV_CONFIG_PATH);
process.env.DOTENV_CONFIG_DEBUG != null && (Fe.debug = process.env.DOTENV_CONFIG_DEBUG);
process.env.DOTENV_CONFIG_OVERRIDE != null && (Fe.override = process.env.DOTENV_CONFIG_OVERRIDE);
process.env.DOTENV_CONFIG_DOTENV_KEY != null && (Fe.DOTENV_KEY = process.env.DOTENV_CONFIG_DOTENV_KEY);
var na = Fe;
const ia = /^dotenv_config_(encoding|path|debug|override|DOTENV_KEY)=(.+)$/;
var oa = function(t) {
  return t.reduce(function(r, s) {
    const a = s.match(ia);
    return a && (r[a[1]] = a[2]), r;
  }, {});
};
(function() {
  aa.config(
    Object.assign(
      {},
      na,
      oa(process.argv)
    )
  );
})();
const g = {
  USER_PRAGMA_KEY: "USER_PRAGMA_KEY",
  USER_PRAGMA_SALT: "USER_PRAGMA_SALT",
  USER_PRAGMA_KEY_TTL: "USER_PRAGMA_KEY_TTL",
  APP_KEY: "APP_KEY",
  USER_TOKEN: "USER_TOKEN_001",
  USER_BROKEN_TOKEN: "USER_BROKEN_TOKEN",
  USER_TOKEN_SALT: "USER_TOKEN_SALT",
  USER_TOKEN_SALT_TTL: "USER_TOKEN_SALT_TLL",
  THROTTLER_TIMER: "THROTTLER_TIMER"
}, Re = 7.5, T = {
  APP_KEY: "24ca469e-b258-4e08-a4f2-54fd70c86aeb",
  USER_TOKEN_SALT: "4af29447-8908-413d-83ad-1717df1d429d",
  TOKEN_SIGNATURE: "a6dc6870c9087fa5ce31cda27d5db3595bcccf1087624c73cdd2ab0efb398478bf706754400fb058e",
  USER_PRAGMA_KEY_TTL: 1e3 * 60 * Re,
  // 5 min
  USER_BROKEN_TOKEN_TTL: 1e3 * 60 * Re,
  USER_TOKEN_TTL: 1e3 * 60 * Re,
  // 5 min
  USER_TOKEN_SALT_TTL: 1e3 * 60 * Re,
  // 5 min,
  THROTTLER_REFRESH_TOKEN_TTL: 1e4
}, jt = 64, Yr = 16384, Pr = 8, Cr = 1;
async function ut(e, t) {
  if (!e || typeof e != "string") throw new Error("invalid username");
  if (!t || typeof t != "string") throw new Error("invalid password");
  return new Promise((r, s) => {
    try {
      const a = T.APP_KEY, n = W.createHash("sha256").update(e + a).digest("hex"), o = W.pbkdf2Sync(t, n, 3e5, jt, "sha512").toString("hex");
      r(o);
    } catch (a) {
      s(a);
    }
  });
}
async function Ur(e) {
  if (!e) throw new Error("input - обязательный аргумент");
  if (typeof e != "string") throw new Error("input - должен быть типа string");
  return new Promise((t, r) => {
    try {
      const s = W.randomBytes(16).toString("hex");
      W.scrypt(e, s, jt, { N: Yr, r: Pr, p: Cr }, (a, n) => {
        if (a)
          throw a;
        const i = s + n.toString("hex");
        t(i);
      });
    } catch (s) {
      r(s);
    }
  });
}
async function Lr(e, t) {
  return new Promise((r, s) => {
    if (!e || !t) throw new Error("input, hash - обязательные аргмуенты");
    if (typeof e != "string" || typeof t != "string")
      throw new Error("аргументы input, hash должны быть типа string");
    try {
      const a = t.slice(0, 32), n = t.slice(32);
      W.scrypt(e, a, jt, { N: Yr, r: Pr, p: Cr }, (i, o) => {
        if (i) throw i;
        o.toString("hex") === n ? r(!0) : r(!1);
      });
    } catch (a) {
      s(a);
    }
  });
}
async function We(e, t) {
  if (!e) throw new Error("[Services.encryptJsonData]>> NOT_DATA");
  if (!t || typeof t != "string") throw new Error("[Services.encryptJsonData]>> INVALID_SIGNATURE");
  return new Promise((r, s) => {
    try {
      const a = "aes-256-cbc", n = W.randomBytes(16).toString("hex"), i = W.scryptSync(t, n, 32), o = W.randomBytes(16);
      let l = null;
      e && typeof e == "object" ? l = JSON.stringify(e) : l = String(e);
      const c = W.createCipheriv(a, i, o);
      let _ = c.update(l, "utf8", "hex");
      l = null, _ += c.final("hex"), r(o.toString("hex") + _ + n);
    } catch (a) {
      s(a);
    }
  });
}
async function Ve(e, t) {
  if (!e) throw new Error("[Services.decryptJsonData]>> NOT_DATA");
  if (!t || typeof t != "string") throw new Error("[Services.decryptJsonData]>> INVALID_SIGNATURE");
  return new Promise((r, s) => {
    try {
      const a = "aes-256-cbc", n = e.slice(e.length - 32), i = W.scryptSync(t, n, 32), o = Buffer.from(e.slice(0, 32), "hex");
      if (o.length < 16) throw new Error("[Services.decryptJsonData]>> INVALID_INIT_VECTOR");
      let l = e.slice(32, e.length - 32);
      const c = W.createDecipheriv(a, i, o);
      let _ = c.update(l, "hex", "utf8");
      l = null, _ += c.final("utf8"), r(_);
    } catch (a) {
      s(a);
    }
  });
}
const la = C.dirname(Ws(import.meta.url));
function mt() {
  return C.join(oe.getPath("appData"), "controller");
}
function Kt(e) {
  return C.join(oe.getPath("appData"), "controller", `user_${e}`);
}
function ca() {
  return oe.isPackaged ? C.join(process.resourcesPath, "app.asar.unpacked", "dist-electron") : la;
}
async function xr(e, t) {
  try {
    let r;
    t.customPath === !0 ? r = t.directory : r = mt();
    const s = C.join(r, t.filename), a = t.format === "json" ? JSON.stringify(e) : e;
    return void await je.writeFile(s, a, { encoding: t.encoding || "utf-8" });
  } catch (r) {
    throw console.error("[writeFile]>>", r), r;
  }
}
async function ht(e) {
  try {
    let t;
    e.customPath === !0 ? t = e.directory : t = mt();
    const r = C.join(t, e.filename), s = await je.readFile(r, { encoding: e.encoding || "utf-8" });
    return e.format === "json" ? JSON.parse(s) : s;
  } catch (t) {
    throw console.error(t), t;
  }
}
async function ua(e) {
  try {
    const t = mt(), r = C.join(t, e);
    await je.mkdir(r, { recursive: !0 });
  } catch (t) {
    throw t;
  }
}
async function Sr(e, t) {
  if (!e) throw new Error("[isExistFileOrDir]>> pathName обязательный аргумент");
  try {
    let r, s;
    return t != null && t.custom || (r = mt(), s = C.join(r, e)), await je.access(s, je.constants.F_OK), !0;
  } catch (r) {
    if (r.code === "ENOENT")
      return !1;
    throw r;
  }
}
const Se = class Se {
  constructor() {
    k(this, "store");
    k(this, "TimersIds", /* @__PURE__ */ new Map());
    this.store = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    return Se.instance || (Se.instance = new Se()), Se.instance;
  }
  /**
   * Полная очистка хранилища
   */
  cleanup() {
    for (const t of this.store.keys())
      this.store.set(t, { value: null, expiresAt: null });
    for (const t of this.TimersIds.keys())
      clearInterval(this.TimersIds.get(t));
    this.TimersIds.clear(), this.store.clear();
  }
  /**
   * Создает новую запись в временном хранилище
   * @param key название ключа по которому происходит взаимодействие с записью
   * @param value значение которое будет хранится
   * @param ttl время которое запись будет существовать в хранилище (в `мс`)
   * @param cb коллбэк который вызывается, когда запись просрочилась и удаляется из хранилища 
   */
  set(t, r, s = 60 * 60 * 1, a) {
    const n = Date.now() + s;
    this.store.set(t, { value: r, expiresAt: n }), clearInterval(this.TimersIds.get(`T_${t}`));
    const i = setTimeout(() => {
      this.delete(t), a == null || a.call(null);
    }, s);
    this.TimersIds.set(`T_${t}`, i);
  }
  /**
   * Позволяет получить значение хранимое по ключу
   * @param key название ключа для извлечения значения
   * @returns значение из существующей записи
   */
  get(t) {
    const r = this.store.get(t);
    if (!r || r.expiresAt < Date.now()) {
      this.store.delete(t);
      return;
    }
    return r.value;
  }
  /**
   * Позволяет получить оставшийся TTL для строки по её ключу
   * @param key название ключа для извлечения значения
   * @returns значение из существующей записи
   */
  getTTL(t) {
    const r = this.store.get(t);
    if (!r || r.expiresAt < Date.now()) {
      this.store.delete(t);
      return;
    }
    return r.expiresAt;
  }
  /**
   * Удаление строки по ключу
   * @param key название ключа
   */
  delete(t) {
    this.store.delete(t);
  }
};
k(Se, "instance");
let J = Se;
function q(e, t) {
  if (!e) throw new Error("IPC > logoutIpc > win is not defined");
  const r = J.getInstance(), s = r.get(g.THROTTLER_TIMER);
  clearTimeout(s), r.cleanup(), e.webContents.send("logout", t);
}
function ha(e, t) {
  if (!t) throw new Error("IPC > refreshTokenIpc > win is not defined");
  t.webContents.send("refresh-token", e);
}
function da(e) {
  let t = 0;
  if (e.Y && (t += 1e3 * 60 * 60 * 24 * 365 * Math.max(e.Y, 1)), e.M && (t += 1e3 * 60 * 60 * 24 * 30 * Math.max(e.M, 1)), e.d && (t += 1e3 * 60 * 60 * 24 * Math.max(e.d, 1)), e.h && (t += 1e3 * 60 * 60 * Math.max(e.h, 1)), e.m && (t += 1e3 * 60 * Math.max(e.m, 1)), e.s && (t += 1e3 * Math.max(e.s, 1)), !t) throw new Error("[prepareExpireTime]>> INVALID_INPUT");
  return t += Date.now(), t;
}
function fa() {
  try {
    return T.TOKEN_SIGNATURE;
  } catch (e) {
    throw console.error("[createSignatureToken]>>", e), e;
  }
}
async function St(e) {
  try {
    if (!e || typeof e != "string")
      throw new Error("invalid value");
    e = await We(e, T.USER_TOKEN_SALT);
    let t = e.split("");
    if (t.length >= 64) {
      let r = t.slice(t.length - 32);
      r = r.reverse().join(), r = await We(r, T.USER_TOKEN_SALT), r = r.split("").reverse().join("$");
      let s = t.slice(0, t.length - 32);
      return s = s.reverse().join(), s = await We(s, T.USER_TOKEN_SALT), s = s.split("").reverse().join("#"), { value: s, salt: r };
    }
    return { value: e, salt: "" };
  } catch (t) {
    throw t;
  }
}
async function Wr(e, t) {
  try {
    if (!e || typeof e != "string") throw new Error("invalid brokenToken");
    if (!t || typeof t != "string") throw new Error("invalid salt");
    let r = e.split("#").reverse().join("");
    r = await Ve(r, T.USER_TOKEN_SALT), r = r.split(",").reverse();
    let s = t.split("$").reverse().join("");
    return s = await Ve(s, T.USER_TOKEN_SALT), s = s.split(",").reverse(), await Ve(r.join("") + s.join(""), T.USER_TOKEN_SALT);
  } catch (r) {
    throw r;
  }
}
async function Vr(e, t) {
  try {
    if (!e || !t) throw new Error("[createAccessToken]>> INVALID_INPUT");
    const r = da(t), s = fa();
    let n = await We({
      expires: r,
      payload: e,
      signature: s
    }, T.TOKEN_SIGNATURE);
    const i = await We(n, T.USER_TOKEN_SALT), { value: o, salt: l } = await St(n);
    n = "";
    const c = J.getInstance();
    return c.set(g.USER_TOKEN, i, T.USER_TOKEN_TTL), c.set(g.USER_BROKEN_TOKEN, o, T.USER_BROKEN_TOKEN_TTL), c.set(g.USER_TOKEN_SALT, l, T.USER_TOKEN_SALT_TTL), o;
  } catch (r) {
    throw r;
  }
}
const Er = [], st = { t: null };
let Tr = 0;
async function Y(e, t) {
  try {
    if (!e || typeof e != "string") throw new Error("[verifyAccessToken]>> INVALID_INPUT");
    const r = J.getInstance(), s = r.get(g.USER_TOKEN), a = r.get(g.USER_BROKEN_TOKEN), n = r.get(g.USER_TOKEN_SALT);
    if (!a || !s || !n)
      throw q(win), new Error("[verifyAccessToken]>> ACCESS_FORBIDDEN [1]");
    if (e !== a)
      throw q(win), new Error("[verifyAccessToken]>> ACCESS_FORBIDDEN [2]");
    const i = await Ve(s, T.USER_TOKEN_SALT);
    if (await Wr(a, n) !== i)
      throw q(win), new Error("[verifyAccessToken]>> ACCESS_FORBIDDEN [3]");
    const l = JSON.parse(await Ve(i, T.TOKEN_SIGNATURE));
    if (l.expires <= Date.now())
      throw q(win), new Error("[verifyAccessToken]>> EXPIRES_LIFE_TOKEN");
    return (t == null ? void 0 : t.refresh) === !0 && (Er.push(`R_${Tr}`), clearInterval(st.t), st.t = setTimeout(async () => {
      console.log("INVOKED REFRESH TOKEN", ++Tr), Er.length = 0, st.t = null;
      const { payload: { userId: c, username: _ } } = l;
      r.set(
        g.USER_PRAGMA_KEY,
        r.get(g.USER_PRAGMA_KEY),
        T.USER_PRAGMA_KEY_TTL,
        () => q(win, { fromServer: !0 })
      ), r.set(
        g.USER_PRAGMA_SALT,
        r.get(g.USER_PRAGMA_SALT),
        T.USER_PRAGMA_KEY_TTL
      );
      const v = await Vr({ userId: c, username: _ }, { m: Re });
      ha(v, win);
    }, T.THROTTLER_REFRESH_TOKEN_TTL), r.set(g.THROTTLER_TIMER, st.t, T.THROTTLER_REFRESH_TOKEN_TTL)), {
      newToken: null,
      payload: l.payload
    };
  } catch (r) {
    throw r;
  }
}
//! moment.js
//! version : 2.30.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
var Hr;
function h() {
  return Hr.apply(null, arguments);
}
function _a(e) {
  Hr = e;
}
function B(e) {
  return e instanceof Array || Object.prototype.toString.call(e) === "[object Array]";
}
function ke(e) {
  return e != null && Object.prototype.toString.call(e) === "[object Object]";
}
function m(e, t) {
  return Object.prototype.hasOwnProperty.call(e, t);
}
function qt(e) {
  if (Object.getOwnPropertyNames)
    return Object.getOwnPropertyNames(e).length === 0;
  var t;
  for (t in e)
    if (m(e, t))
      return !1;
  return !0;
}
function P(e) {
  return e === void 0;
}
function le(e) {
  return typeof e == "number" || Object.prototype.toString.call(e) === "[object Number]";
}
function ze(e) {
  return e instanceof Date || Object.prototype.toString.call(e) === "[object Date]";
}
function $r(e, t) {
  var r = [], s, a = e.length;
  for (s = 0; s < a; ++s)
    r.push(t(e[s], s));
  return r;
}
function _e(e, t) {
  for (var r in t)
    m(t, r) && (e[r] = t[r]);
  return m(t, "toString") && (e.toString = t.toString), m(t, "valueOf") && (e.valueOf = t.valueOf), e;
}
function Q(e, t, r, s) {
  return ds(e, t, r, s, !0).utc();
}
function pa() {
  return {
    empty: !1,
    unusedTokens: [],
    unusedInput: [],
    overflow: -2,
    charsLeftOver: 0,
    nullInput: !1,
    invalidEra: null,
    invalidMonth: null,
    invalidFormat: !1,
    userInvalidated: !1,
    iso: !1,
    parsedDateParts: [],
    era: null,
    meridiem: null,
    rfc2822: !1,
    weekdayMismatch: !1
  };
}
function p(e) {
  return e._pf == null && (e._pf = pa()), e._pf;
}
var Ct;
Array.prototype.some ? Ct = Array.prototype.some : Ct = function(e) {
  var t = Object(this), r = t.length >>> 0, s;
  for (s = 0; s < r; s++)
    if (s in t && e.call(this, t[s], s, t))
      return !0;
  return !1;
};
function Zt(e) {
  var t = null, r = !1, s = e._d && !isNaN(e._d.getTime());
  if (s && (t = p(e), r = Ct.call(t.parsedDateParts, function(a) {
    return a != null;
  }), s = t.overflow < 0 && !t.empty && !t.invalidEra && !t.invalidMonth && !t.invalidWeekday && !t.weekdayMismatch && !t.nullInput && !t.invalidFormat && !t.userInvalidated && (!t.meridiem || t.meridiem && r), e._strict && (s = s && t.charsLeftOver === 0 && t.unusedTokens.length === 0 && t.bigHour === void 0)), Object.isFrozen == null || !Object.isFrozen(e))
    e._isValid = s;
  else
    return s;
  return e._isValid;
}
function Et(e) {
  var t = Q(NaN);
  return e != null ? _e(p(t), e) : p(t).userInvalidated = !0, t;
}
var kr = h.momentProperties = [], Mt = !1;
function Jt(e, t) {
  var r, s, a, n = kr.length;
  if (P(t._isAMomentObject) || (e._isAMomentObject = t._isAMomentObject), P(t._i) || (e._i = t._i), P(t._f) || (e._f = t._f), P(t._l) || (e._l = t._l), P(t._strict) || (e._strict = t._strict), P(t._tzm) || (e._tzm = t._tzm), P(t._isUTC) || (e._isUTC = t._isUTC), P(t._offset) || (e._offset = t._offset), P(t._pf) || (e._pf = p(t)), P(t._locale) || (e._locale = t._locale), n > 0)
    for (r = 0; r < n; r++)
      s = kr[r], a = t[s], P(a) || (e[s] = a);
  return e;
}
function Qe(e) {
  Jt(this, e), this._d = new Date(e._d != null ? e._d.getTime() : NaN), this.isValid() || (this._d = /* @__PURE__ */ new Date(NaN)), Mt === !1 && (Mt = !0, h.updateOffset(this), Mt = !1);
}
function G(e) {
  return e instanceof Qe || e != null && e._isAMomentObject != null;
}
function Br(e) {
  h.suppressDeprecationWarnings === !1 && typeof console < "u" && console.warn && console.warn("Deprecation warning: " + e);
}
function V(e, t) {
  var r = !0;
  return _e(function() {
    if (h.deprecationHandler != null && h.deprecationHandler(null, e), r) {
      var s = [], a, n, i, o = arguments.length;
      for (n = 0; n < o; n++) {
        if (a = "", typeof arguments[n] == "object") {
          a += `
[` + n + "] ";
          for (i in arguments[0])
            m(arguments[0], i) && (a += i + ": " + arguments[0][i] + ", ");
          a = a.slice(0, -2);
        } else
          a = arguments[n];
        s.push(a);
      }
      Br(
        e + `
Arguments: ` + Array.prototype.slice.call(s).join("") + `
` + new Error().stack
      ), r = !1;
    }
    return t.apply(this, arguments);
  }, t);
}
var Dr = {};
function Gr(e, t) {
  h.deprecationHandler != null && h.deprecationHandler(e, t), Dr[e] || (Br(t), Dr[e] = !0);
}
h.suppressDeprecationWarnings = !1;
h.deprecationHandler = null;
function X(e) {
  return typeof Function < "u" && e instanceof Function || Object.prototype.toString.call(e) === "[object Function]";
}
function ya(e) {
  var t, r;
  for (r in e)
    m(e, r) && (t = e[r], X(t) ? this[r] = t : this["_" + r] = t);
  this._config = e, this._dayOfMonthOrdinalParseLenient = new RegExp(
    (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) + "|" + /\d{1,2}/.source
  );
}
function Ut(e, t) {
  var r = _e({}, e), s;
  for (s in t)
    m(t, s) && (ke(e[s]) && ke(t[s]) ? (r[s] = {}, _e(r[s], e[s]), _e(r[s], t[s])) : t[s] != null ? r[s] = t[s] : delete r[s]);
  for (s in e)
    m(e, s) && !m(t, s) && ke(e[s]) && (r[s] = _e({}, r[s]));
  return r;
}
function zt(e) {
  e != null && this.set(e);
}
var Lt;
Object.keys ? Lt = Object.keys : Lt = function(e) {
  var t, r = [];
  for (t in e)
    m(e, t) && r.push(t);
  return r;
};
var wa = {
  sameDay: "[Today at] LT",
  nextDay: "[Tomorrow at] LT",
  nextWeek: "dddd [at] LT",
  lastDay: "[Yesterday at] LT",
  lastWeek: "[Last] dddd [at] LT",
  sameElse: "L"
};
function ma(e, t, r) {
  var s = this._calendar[e] || this._calendar.sameElse;
  return X(s) ? s.call(t, r) : s;
}
function z(e, t, r) {
  var s = "" + Math.abs(e), a = t - s.length, n = e >= 0;
  return (n ? r ? "+" : "" : "-") + Math.pow(10, Math.max(0, a)).toString().substr(1) + s;
}
var Qt = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g, at = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g, Ft = {}, ge = {};
function f(e, t, r, s) {
  var a = s;
  typeof s == "string" && (a = function() {
    return this[s]();
  }), e && (ge[e] = a), t && (ge[t[0]] = function() {
    return z(a.apply(this, arguments), t[1], t[2]);
  }), r && (ge[r] = function() {
    return this.localeData().ordinal(
      a.apply(this, arguments),
      e
    );
  });
}
function Sa(e) {
  return e.match(/\[[\s\S]/) ? e.replace(/^\[|\]$/g, "") : e.replace(/\\/g, "");
}
function Ea(e) {
  var t = e.match(Qt), r, s;
  for (r = 0, s = t.length; r < s; r++)
    ge[t[r]] ? t[r] = ge[t[r]] : t[r] = Sa(t[r]);
  return function(a) {
    var n = "", i;
    for (i = 0; i < s; i++)
      n += X(t[i]) ? t[i].call(a, e) : t[i];
    return n;
  };
}
function it(e, t) {
  return e.isValid() ? (t = jr(t, e.localeData()), Ft[t] = Ft[t] || Ea(t), Ft[t](e)) : e.localeData().invalidDate();
}
function jr(e, t) {
  var r = 5;
  function s(a) {
    return t.longDateFormat(a) || a;
  }
  for (at.lastIndex = 0; r >= 0 && at.test(e); )
    e = e.replace(
      at,
      s
    ), at.lastIndex = 0, r -= 1;
  return e;
}
var Ta = {
  LTS: "h:mm:ss A",
  LT: "h:mm A",
  L: "MM/DD/YYYY",
  LL: "MMMM D, YYYY",
  LLL: "MMMM D, YYYY h:mm A",
  LLLL: "dddd, MMMM D, YYYY h:mm A"
};
function ka(e) {
  var t = this._longDateFormat[e], r = this._longDateFormat[e.toUpperCase()];
  return t || !r ? t : (this._longDateFormat[e] = r.match(Qt).map(function(s) {
    return s === "MMMM" || s === "MM" || s === "DD" || s === "dddd" ? s.slice(1) : s;
  }).join(""), this._longDateFormat[e]);
}
var Da = "Invalid date";
function ba() {
  return this._invalidDate;
}
var Oa = "%d", va = /\d{1,2}/;
function Ra(e) {
  return this._ordinal.replace("%d", e);
}
var Na = {
  future: "in %s",
  past: "%s ago",
  s: "a few seconds",
  ss: "%d seconds",
  m: "a minute",
  mm: "%d minutes",
  h: "an hour",
  hh: "%d hours",
  d: "a day",
  dd: "%d days",
  w: "a week",
  ww: "%d weeks",
  M: "a month",
  MM: "%d months",
  y: "a year",
  yy: "%d years"
};
function ga(e, t, r, s) {
  var a = this._relativeTime[r];
  return X(a) ? a(e, t, r, s) : a.replace(/%d/i, e);
}
function Aa(e, t) {
  var r = this._relativeTime[e > 0 ? "future" : "past"];
  return X(r) ? r(t) : r.replace(/%s/i, t);
}
var br = {
  D: "date",
  dates: "date",
  date: "date",
  d: "day",
  days: "day",
  day: "day",
  e: "weekday",
  weekdays: "weekday",
  weekday: "weekday",
  E: "isoWeekday",
  isoweekdays: "isoWeekday",
  isoweekday: "isoWeekday",
  DDD: "dayOfYear",
  dayofyears: "dayOfYear",
  dayofyear: "dayOfYear",
  h: "hour",
  hours: "hour",
  hour: "hour",
  ms: "millisecond",
  milliseconds: "millisecond",
  millisecond: "millisecond",
  m: "minute",
  minutes: "minute",
  minute: "minute",
  M: "month",
  months: "month",
  month: "month",
  Q: "quarter",
  quarters: "quarter",
  quarter: "quarter",
  s: "second",
  seconds: "second",
  second: "second",
  gg: "weekYear",
  weekyears: "weekYear",
  weekyear: "weekYear",
  GG: "isoWeekYear",
  isoweekyears: "isoWeekYear",
  isoweekyear: "isoWeekYear",
  w: "week",
  weeks: "week",
  week: "week",
  W: "isoWeek",
  isoweeks: "isoWeek",
  isoweek: "isoWeek",
  y: "year",
  years: "year",
  year: "year"
};
function H(e) {
  return typeof e == "string" ? br[e] || br[e.toLowerCase()] : void 0;
}
function Xt(e) {
  var t = {}, r, s;
  for (s in e)
    m(e, s) && (r = H(s), r && (t[r] = e[s]));
  return t;
}
var Ma = {
  date: 9,
  day: 11,
  weekday: 11,
  isoWeekday: 11,
  dayOfYear: 4,
  hour: 13,
  millisecond: 16,
  minute: 14,
  month: 8,
  quarter: 7,
  second: 15,
  weekYear: 1,
  isoWeekYear: 1,
  week: 5,
  isoWeek: 5,
  year: 1
};
function Fa(e) {
  var t = [], r;
  for (r in e)
    m(e, r) && t.push({ unit: r, priority: Ma[r] });
  return t.sort(function(s, a) {
    return s.priority - a.priority;
  }), t;
}
var Kr = /\d/, U = /\d\d/, qr = /\d{3}/, er = /\d{4}/, Tt = /[+-]?\d{6}/, b = /\d\d?/, Zr = /\d\d\d\d?/, Jr = /\d\d\d\d\d\d?/, kt = /\d{1,3}/, tr = /\d{1,4}/, Dt = /[+-]?\d{1,6}/, Ie = /\d+/, bt = /[+-]?\d+/, Ia = /Z|[+-]\d\d:?\d\d/gi, Ot = /Z|[+-]\d\d(?::?\d\d)?/gi, Ya = /[+-]?\d+(\.\d{1,3})?/, Xe = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i, Ye = /^[1-9]\d?/, rr = /^([1-9]\d|\d)/, dt;
dt = {};
function d(e, t, r) {
  dt[e] = X(t) ? t : function(s, a) {
    return s && r ? r : t;
  };
}
function Pa(e, t) {
  return m(dt, e) ? dt[e](t._strict, t._locale) : new RegExp(Ca(e));
}
function Ca(e) {
  return ne(
    e.replace("\\", "").replace(
      /\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,
      function(t, r, s, a, n) {
        return r || s || a || n;
      }
    )
  );
}
function ne(e) {
  return e.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}
function x(e) {
  return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
}
function y(e) {
  var t = +e, r = 0;
  return t !== 0 && isFinite(t) && (r = x(t)), r;
}
var xt = {};
function E(e, t) {
  var r, s = t, a;
  for (typeof e == "string" && (e = [e]), le(t) && (s = function(n, i) {
    i[t] = y(n);
  }), a = e.length, r = 0; r < a; r++)
    xt[e[r]] = s;
}
function et(e, t) {
  E(e, function(r, s, a, n) {
    a._w = a._w || {}, t(r, a._w, a, n);
  });
}
function Ua(e, t, r) {
  t != null && m(xt, e) && xt[e](t, r._a, r, e);
}
function vt(e) {
  return e % 4 === 0 && e % 100 !== 0 || e % 400 === 0;
}
var I = 0, re = 1, Z = 2, A = 3, $ = 4, se = 5, Te = 6, La = 7, xa = 8;
f("Y", 0, 0, function() {
  var e = this.year();
  return e <= 9999 ? z(e, 4) : "+" + e;
});
f(0, ["YY", 2], 0, function() {
  return this.year() % 100;
});
f(0, ["YYYY", 4], 0, "year");
f(0, ["YYYYY", 5], 0, "year");
f(0, ["YYYYYY", 6, !0], 0, "year");
d("Y", bt);
d("YY", b, U);
d("YYYY", tr, er);
d("YYYYY", Dt, Tt);
d("YYYYYY", Dt, Tt);
E(["YYYYY", "YYYYYY"], I);
E("YYYY", function(e, t) {
  t[I] = e.length === 2 ? h.parseTwoDigitYear(e) : y(e);
});
E("YY", function(e, t) {
  t[I] = h.parseTwoDigitYear(e);
});
E("Y", function(e, t) {
  t[I] = parseInt(e, 10);
});
function He(e) {
  return vt(e) ? 366 : 365;
}
h.parseTwoDigitYear = function(e) {
  return y(e) + (y(e) > 68 ? 1900 : 2e3);
};
var zr = Pe("FullYear", !0);
function Wa() {
  return vt(this.year());
}
function Pe(e, t) {
  return function(r) {
    return r != null ? (Qr(this, e, r), h.updateOffset(this, t), this) : Ke(this, e);
  };
}
function Ke(e, t) {
  if (!e.isValid())
    return NaN;
  var r = e._d, s = e._isUTC;
  switch (t) {
    case "Milliseconds":
      return s ? r.getUTCMilliseconds() : r.getMilliseconds();
    case "Seconds":
      return s ? r.getUTCSeconds() : r.getSeconds();
    case "Minutes":
      return s ? r.getUTCMinutes() : r.getMinutes();
    case "Hours":
      return s ? r.getUTCHours() : r.getHours();
    case "Date":
      return s ? r.getUTCDate() : r.getDate();
    case "Day":
      return s ? r.getUTCDay() : r.getDay();
    case "Month":
      return s ? r.getUTCMonth() : r.getMonth();
    case "FullYear":
      return s ? r.getUTCFullYear() : r.getFullYear();
    default:
      return NaN;
  }
}
function Qr(e, t, r) {
  var s, a, n, i, o;
  if (!(!e.isValid() || isNaN(r))) {
    switch (s = e._d, a = e._isUTC, t) {
      case "Milliseconds":
        return void (a ? s.setUTCMilliseconds(r) : s.setMilliseconds(r));
      case "Seconds":
        return void (a ? s.setUTCSeconds(r) : s.setSeconds(r));
      case "Minutes":
        return void (a ? s.setUTCMinutes(r) : s.setMinutes(r));
      case "Hours":
        return void (a ? s.setUTCHours(r) : s.setHours(r));
      case "Date":
        return void (a ? s.setUTCDate(r) : s.setDate(r));
      case "FullYear":
        break;
      default:
        return;
    }
    n = r, i = e.month(), o = e.date(), o = o === 29 && i === 1 && !vt(n) ? 28 : o, a ? s.setUTCFullYear(n, i, o) : s.setFullYear(n, i, o);
  }
}
function Va(e) {
  return e = H(e), X(this[e]) ? this[e]() : this;
}
function Ha(e, t) {
  if (typeof e == "object") {
    e = Xt(e);
    var r = Fa(e), s, a = r.length;
    for (s = 0; s < a; s++)
      this[r[s].unit](e[r[s].unit]);
  } else if (e = H(e), X(this[e]))
    return this[e](t);
  return this;
}
function $a(e, t) {
  return (e % t + t) % t;
}
var N;
Array.prototype.indexOf ? N = Array.prototype.indexOf : N = function(e) {
  var t;
  for (t = 0; t < this.length; ++t)
    if (this[t] === e)
      return t;
  return -1;
};
function sr(e, t) {
  if (isNaN(e) || isNaN(t))
    return NaN;
  var r = $a(t, 12);
  return e += (t - r) / 12, r === 1 ? vt(e) ? 29 : 28 : 31 - r % 7 % 2;
}
f("M", ["MM", 2], "Mo", function() {
  return this.month() + 1;
});
f("MMM", 0, 0, function(e) {
  return this.localeData().monthsShort(this, e);
});
f("MMMM", 0, 0, function(e) {
  return this.localeData().months(this, e);
});
d("M", b, Ye);
d("MM", b, U);
d("MMM", function(e, t) {
  return t.monthsShortRegex(e);
});
d("MMMM", function(e, t) {
  return t.monthsRegex(e);
});
E(["M", "MM"], function(e, t) {
  t[re] = y(e) - 1;
});
E(["MMM", "MMMM"], function(e, t, r, s) {
  var a = r._locale.monthsParse(e, s, r._strict);
  a != null ? t[re] = a : p(r).invalidMonth = e;
});
var Ba = "January_February_March_April_May_June_July_August_September_October_November_December".split(
  "_"
), Xr = "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), es = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/, Ga = Xe, ja = Xe;
function Ka(e, t) {
  return e ? B(this._months) ? this._months[e.month()] : this._months[(this._months.isFormat || es).test(t) ? "format" : "standalone"][e.month()] : B(this._months) ? this._months : this._months.standalone;
}
function qa(e, t) {
  return e ? B(this._monthsShort) ? this._monthsShort[e.month()] : this._monthsShort[es.test(t) ? "format" : "standalone"][e.month()] : B(this._monthsShort) ? this._monthsShort : this._monthsShort.standalone;
}
function Za(e, t, r) {
  var s, a, n, i = e.toLocaleLowerCase();
  if (!this._monthsParse)
    for (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = [], s = 0; s < 12; ++s)
      n = Q([2e3, s]), this._shortMonthsParse[s] = this.monthsShort(
        n,
        ""
      ).toLocaleLowerCase(), this._longMonthsParse[s] = this.months(n, "").toLocaleLowerCase();
  return r ? t === "MMM" ? (a = N.call(this._shortMonthsParse, i), a !== -1 ? a : null) : (a = N.call(this._longMonthsParse, i), a !== -1 ? a : null) : t === "MMM" ? (a = N.call(this._shortMonthsParse, i), a !== -1 ? a : (a = N.call(this._longMonthsParse, i), a !== -1 ? a : null)) : (a = N.call(this._longMonthsParse, i), a !== -1 ? a : (a = N.call(this._shortMonthsParse, i), a !== -1 ? a : null));
}
function Ja(e, t, r) {
  var s, a, n;
  if (this._monthsParseExact)
    return Za.call(this, e, t, r);
  for (this._monthsParse || (this._monthsParse = [], this._longMonthsParse = [], this._shortMonthsParse = []), s = 0; s < 12; s++) {
    if (a = Q([2e3, s]), r && !this._longMonthsParse[s] && (this._longMonthsParse[s] = new RegExp(
      "^" + this.months(a, "").replace(".", "") + "$",
      "i"
    ), this._shortMonthsParse[s] = new RegExp(
      "^" + this.monthsShort(a, "").replace(".", "") + "$",
      "i"
    )), !r && !this._monthsParse[s] && (n = "^" + this.months(a, "") + "|^" + this.monthsShort(a, ""), this._monthsParse[s] = new RegExp(n.replace(".", ""), "i")), r && t === "MMMM" && this._longMonthsParse[s].test(e))
      return s;
    if (r && t === "MMM" && this._shortMonthsParse[s].test(e))
      return s;
    if (!r && this._monthsParse[s].test(e))
      return s;
  }
}
function ts(e, t) {
  if (!e.isValid())
    return e;
  if (typeof t == "string") {
    if (/^\d+$/.test(t))
      t = y(t);
    else if (t = e.localeData().monthsParse(t), !le(t))
      return e;
  }
  var r = t, s = e.date();
  return s = s < 29 ? s : Math.min(s, sr(e.year(), r)), e._isUTC ? e._d.setUTCMonth(r, s) : e._d.setMonth(r, s), e;
}
function rs(e) {
  return e != null ? (ts(this, e), h.updateOffset(this, !0), this) : Ke(this, "Month");
}
function za() {
  return sr(this.year(), this.month());
}
function Qa(e) {
  return this._monthsParseExact ? (m(this, "_monthsRegex") || ss.call(this), e ? this._monthsShortStrictRegex : this._monthsShortRegex) : (m(this, "_monthsShortRegex") || (this._monthsShortRegex = Ga), this._monthsShortStrictRegex && e ? this._monthsShortStrictRegex : this._monthsShortRegex);
}
function Xa(e) {
  return this._monthsParseExact ? (m(this, "_monthsRegex") || ss.call(this), e ? this._monthsStrictRegex : this._monthsRegex) : (m(this, "_monthsRegex") || (this._monthsRegex = ja), this._monthsStrictRegex && e ? this._monthsStrictRegex : this._monthsRegex);
}
function ss() {
  function e(l, c) {
    return c.length - l.length;
  }
  var t = [], r = [], s = [], a, n, i, o;
  for (a = 0; a < 12; a++)
    n = Q([2e3, a]), i = ne(this.monthsShort(n, "")), o = ne(this.months(n, "")), t.push(i), r.push(o), s.push(o), s.push(i);
  t.sort(e), r.sort(e), s.sort(e), this._monthsRegex = new RegExp("^(" + s.join("|") + ")", "i"), this._monthsShortRegex = this._monthsRegex, this._monthsStrictRegex = new RegExp(
    "^(" + r.join("|") + ")",
    "i"
  ), this._monthsShortStrictRegex = new RegExp(
    "^(" + t.join("|") + ")",
    "i"
  );
}
function en(e, t, r, s, a, n, i) {
  var o;
  return e < 100 && e >= 0 ? (o = new Date(e + 400, t, r, s, a, n, i), isFinite(o.getFullYear()) && o.setFullYear(e)) : o = new Date(e, t, r, s, a, n, i), o;
}
function qe(e) {
  var t, r;
  return e < 100 && e >= 0 ? (r = Array.prototype.slice.call(arguments), r[0] = e + 400, t = new Date(Date.UTC.apply(null, r)), isFinite(t.getUTCFullYear()) && t.setUTCFullYear(e)) : t = new Date(Date.UTC.apply(null, arguments)), t;
}
function ft(e, t, r) {
  var s = 7 + t - r, a = (7 + qe(e, 0, s).getUTCDay() - t) % 7;
  return -a + s - 1;
}
function as(e, t, r, s, a) {
  var n = (7 + r - s) % 7, i = ft(e, s, a), o = 1 + 7 * (t - 1) + n + i, l, c;
  return o <= 0 ? (l = e - 1, c = He(l) + o) : o > He(e) ? (l = e + 1, c = o - He(e)) : (l = e, c = o), {
    year: l,
    dayOfYear: c
  };
}
function Ze(e, t, r) {
  var s = ft(e.year(), t, r), a = Math.floor((e.dayOfYear() - s - 1) / 7) + 1, n, i;
  return a < 1 ? (i = e.year() - 1, n = a + ie(i, t, r)) : a > ie(e.year(), t, r) ? (n = a - ie(e.year(), t, r), i = e.year() + 1) : (i = e.year(), n = a), {
    week: n,
    year: i
  };
}
function ie(e, t, r) {
  var s = ft(e, t, r), a = ft(e + 1, t, r);
  return (He(e) - s + a) / 7;
}
f("w", ["ww", 2], "wo", "week");
f("W", ["WW", 2], "Wo", "isoWeek");
d("w", b, Ye);
d("ww", b, U);
d("W", b, Ye);
d("WW", b, U);
et(
  ["w", "ww", "W", "WW"],
  function(e, t, r, s) {
    t[s.substr(0, 1)] = y(e);
  }
);
function tn(e) {
  return Ze(e, this._week.dow, this._week.doy).week;
}
var rn = {
  dow: 0,
  // Sunday is the first day of the week.
  doy: 6
  // The week that contains Jan 6th is the first week of the year.
};
function sn() {
  return this._week.dow;
}
function an() {
  return this._week.doy;
}
function nn(e) {
  var t = this.localeData().week(this);
  return e == null ? t : this.add((e - t) * 7, "d");
}
function on(e) {
  var t = Ze(this, 1, 4).week;
  return e == null ? t : this.add((e - t) * 7, "d");
}
f("d", 0, "do", "day");
f("dd", 0, 0, function(e) {
  return this.localeData().weekdaysMin(this, e);
});
f("ddd", 0, 0, function(e) {
  return this.localeData().weekdaysShort(this, e);
});
f("dddd", 0, 0, function(e) {
  return this.localeData().weekdays(this, e);
});
f("e", 0, 0, "weekday");
f("E", 0, 0, "isoWeekday");
d("d", b);
d("e", b);
d("E", b);
d("dd", function(e, t) {
  return t.weekdaysMinRegex(e);
});
d("ddd", function(e, t) {
  return t.weekdaysShortRegex(e);
});
d("dddd", function(e, t) {
  return t.weekdaysRegex(e);
});
et(["dd", "ddd", "dddd"], function(e, t, r, s) {
  var a = r._locale.weekdaysParse(e, s, r._strict);
  a != null ? t.d = a : p(r).invalidWeekday = e;
});
et(["d", "e", "E"], function(e, t, r, s) {
  t[s] = y(e);
});
function ln(e, t) {
  return typeof e != "string" ? e : isNaN(e) ? (e = t.weekdaysParse(e), typeof e == "number" ? e : null) : parseInt(e, 10);
}
function cn(e, t) {
  return typeof e == "string" ? t.weekdaysParse(e) % 7 || 7 : isNaN(e) ? null : e;
}
function ar(e, t) {
  return e.slice(t, 7).concat(e.slice(0, t));
}
var un = "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), ns = "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), hn = "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), dn = Xe, fn = Xe, _n = Xe;
function pn(e, t) {
  var r = B(this._weekdays) ? this._weekdays : this._weekdays[e && e !== !0 && this._weekdays.isFormat.test(t) ? "format" : "standalone"];
  return e === !0 ? ar(r, this._week.dow) : e ? r[e.day()] : r;
}
function yn(e) {
  return e === !0 ? ar(this._weekdaysShort, this._week.dow) : e ? this._weekdaysShort[e.day()] : this._weekdaysShort;
}
function wn(e) {
  return e === !0 ? ar(this._weekdaysMin, this._week.dow) : e ? this._weekdaysMin[e.day()] : this._weekdaysMin;
}
function mn(e, t, r) {
  var s, a, n, i = e.toLocaleLowerCase();
  if (!this._weekdaysParse)
    for (this._weekdaysParse = [], this._shortWeekdaysParse = [], this._minWeekdaysParse = [], s = 0; s < 7; ++s)
      n = Q([2e3, 1]).day(s), this._minWeekdaysParse[s] = this.weekdaysMin(
        n,
        ""
      ).toLocaleLowerCase(), this._shortWeekdaysParse[s] = this.weekdaysShort(
        n,
        ""
      ).toLocaleLowerCase(), this._weekdaysParse[s] = this.weekdays(n, "").toLocaleLowerCase();
  return r ? t === "dddd" ? (a = N.call(this._weekdaysParse, i), a !== -1 ? a : null) : t === "ddd" ? (a = N.call(this._shortWeekdaysParse, i), a !== -1 ? a : null) : (a = N.call(this._minWeekdaysParse, i), a !== -1 ? a : null) : t === "dddd" ? (a = N.call(this._weekdaysParse, i), a !== -1 || (a = N.call(this._shortWeekdaysParse, i), a !== -1) ? a : (a = N.call(this._minWeekdaysParse, i), a !== -1 ? a : null)) : t === "ddd" ? (a = N.call(this._shortWeekdaysParse, i), a !== -1 || (a = N.call(this._weekdaysParse, i), a !== -1) ? a : (a = N.call(this._minWeekdaysParse, i), a !== -1 ? a : null)) : (a = N.call(this._minWeekdaysParse, i), a !== -1 || (a = N.call(this._weekdaysParse, i), a !== -1) ? a : (a = N.call(this._shortWeekdaysParse, i), a !== -1 ? a : null));
}
function Sn(e, t, r) {
  var s, a, n;
  if (this._weekdaysParseExact)
    return mn.call(this, e, t, r);
  for (this._weekdaysParse || (this._weekdaysParse = [], this._minWeekdaysParse = [], this._shortWeekdaysParse = [], this._fullWeekdaysParse = []), s = 0; s < 7; s++) {
    if (a = Q([2e3, 1]).day(s), r && !this._fullWeekdaysParse[s] && (this._fullWeekdaysParse[s] = new RegExp(
      "^" + this.weekdays(a, "").replace(".", "\\.?") + "$",
      "i"
    ), this._shortWeekdaysParse[s] = new RegExp(
      "^" + this.weekdaysShort(a, "").replace(".", "\\.?") + "$",
      "i"
    ), this._minWeekdaysParse[s] = new RegExp(
      "^" + this.weekdaysMin(a, "").replace(".", "\\.?") + "$",
      "i"
    )), this._weekdaysParse[s] || (n = "^" + this.weekdays(a, "") + "|^" + this.weekdaysShort(a, "") + "|^" + this.weekdaysMin(a, ""), this._weekdaysParse[s] = new RegExp(n.replace(".", ""), "i")), r && t === "dddd" && this._fullWeekdaysParse[s].test(e))
      return s;
    if (r && t === "ddd" && this._shortWeekdaysParse[s].test(e))
      return s;
    if (r && t === "dd" && this._minWeekdaysParse[s].test(e))
      return s;
    if (!r && this._weekdaysParse[s].test(e))
      return s;
  }
}
function En(e) {
  if (!this.isValid())
    return e != null ? this : NaN;
  var t = Ke(this, "Day");
  return e != null ? (e = ln(e, this.localeData()), this.add(e - t, "d")) : t;
}
function Tn(e) {
  if (!this.isValid())
    return e != null ? this : NaN;
  var t = (this.day() + 7 - this.localeData()._week.dow) % 7;
  return e == null ? t : this.add(e - t, "d");
}
function kn(e) {
  if (!this.isValid())
    return e != null ? this : NaN;
  if (e != null) {
    var t = cn(e, this.localeData());
    return this.day(this.day() % 7 ? t : t - 7);
  } else
    return this.day() || 7;
}
function Dn(e) {
  return this._weekdaysParseExact ? (m(this, "_weekdaysRegex") || nr.call(this), e ? this._weekdaysStrictRegex : this._weekdaysRegex) : (m(this, "_weekdaysRegex") || (this._weekdaysRegex = dn), this._weekdaysStrictRegex && e ? this._weekdaysStrictRegex : this._weekdaysRegex);
}
function bn(e) {
  return this._weekdaysParseExact ? (m(this, "_weekdaysRegex") || nr.call(this), e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex) : (m(this, "_weekdaysShortRegex") || (this._weekdaysShortRegex = fn), this._weekdaysShortStrictRegex && e ? this._weekdaysShortStrictRegex : this._weekdaysShortRegex);
}
function On(e) {
  return this._weekdaysParseExact ? (m(this, "_weekdaysRegex") || nr.call(this), e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex) : (m(this, "_weekdaysMinRegex") || (this._weekdaysMinRegex = _n), this._weekdaysMinStrictRegex && e ? this._weekdaysMinStrictRegex : this._weekdaysMinRegex);
}
function nr() {
  function e(_, v) {
    return v.length - _.length;
  }
  var t = [], r = [], s = [], a = [], n, i, o, l, c;
  for (n = 0; n < 7; n++)
    i = Q([2e3, 1]).day(n), o = ne(this.weekdaysMin(i, "")), l = ne(this.weekdaysShort(i, "")), c = ne(this.weekdays(i, "")), t.push(o), r.push(l), s.push(c), a.push(o), a.push(l), a.push(c);
  t.sort(e), r.sort(e), s.sort(e), a.sort(e), this._weekdaysRegex = new RegExp("^(" + a.join("|") + ")", "i"), this._weekdaysShortRegex = this._weekdaysRegex, this._weekdaysMinRegex = this._weekdaysRegex, this._weekdaysStrictRegex = new RegExp(
    "^(" + s.join("|") + ")",
    "i"
  ), this._weekdaysShortStrictRegex = new RegExp(
    "^(" + r.join("|") + ")",
    "i"
  ), this._weekdaysMinStrictRegex = new RegExp(
    "^(" + t.join("|") + ")",
    "i"
  );
}
function ir() {
  return this.hours() % 12 || 12;
}
function vn() {
  return this.hours() || 24;
}
f("H", ["HH", 2], 0, "hour");
f("h", ["hh", 2], 0, ir);
f("k", ["kk", 2], 0, vn);
f("hmm", 0, 0, function() {
  return "" + ir.apply(this) + z(this.minutes(), 2);
});
f("hmmss", 0, 0, function() {
  return "" + ir.apply(this) + z(this.minutes(), 2) + z(this.seconds(), 2);
});
f("Hmm", 0, 0, function() {
  return "" + this.hours() + z(this.minutes(), 2);
});
f("Hmmss", 0, 0, function() {
  return "" + this.hours() + z(this.minutes(), 2) + z(this.seconds(), 2);
});
function is(e, t) {
  f(e, 0, 0, function() {
    return this.localeData().meridiem(
      this.hours(),
      this.minutes(),
      t
    );
  });
}
is("a", !0);
is("A", !1);
function os(e, t) {
  return t._meridiemParse;
}
d("a", os);
d("A", os);
d("H", b, rr);
d("h", b, Ye);
d("k", b, Ye);
d("HH", b, U);
d("hh", b, U);
d("kk", b, U);
d("hmm", Zr);
d("hmmss", Jr);
d("Hmm", Zr);
d("Hmmss", Jr);
E(["H", "HH"], A);
E(["k", "kk"], function(e, t, r) {
  var s = y(e);
  t[A] = s === 24 ? 0 : s;
});
E(["a", "A"], function(e, t, r) {
  r._isPm = r._locale.isPM(e), r._meridiem = e;
});
E(["h", "hh"], function(e, t, r) {
  t[A] = y(e), p(r).bigHour = !0;
});
E("hmm", function(e, t, r) {
  var s = e.length - 2;
  t[A] = y(e.substr(0, s)), t[$] = y(e.substr(s)), p(r).bigHour = !0;
});
E("hmmss", function(e, t, r) {
  var s = e.length - 4, a = e.length - 2;
  t[A] = y(e.substr(0, s)), t[$] = y(e.substr(s, 2)), t[se] = y(e.substr(a)), p(r).bigHour = !0;
});
E("Hmm", function(e, t, r) {
  var s = e.length - 2;
  t[A] = y(e.substr(0, s)), t[$] = y(e.substr(s));
});
E("Hmmss", function(e, t, r) {
  var s = e.length - 4, a = e.length - 2;
  t[A] = y(e.substr(0, s)), t[$] = y(e.substr(s, 2)), t[se] = y(e.substr(a));
});
function Rn(e) {
  return (e + "").toLowerCase().charAt(0) === "p";
}
var Nn = /[ap]\.?m?\.?/i, gn = Pe("Hours", !0);
function An(e, t, r) {
  return e > 11 ? r ? "pm" : "PM" : r ? "am" : "AM";
}
var ls = {
  calendar: wa,
  longDateFormat: Ta,
  invalidDate: Da,
  ordinal: Oa,
  dayOfMonthOrdinalParse: va,
  relativeTime: Na,
  months: Ba,
  monthsShort: Xr,
  week: rn,
  weekdays: un,
  weekdaysMin: hn,
  weekdaysShort: ns,
  meridiemParse: Nn
}, O = {}, Le = {}, Je;
function Mn(e, t) {
  var r, s = Math.min(e.length, t.length);
  for (r = 0; r < s; r += 1)
    if (e[r] !== t[r])
      return r;
  return s;
}
function Or(e) {
  return e && e.toLowerCase().replace("_", "-");
}
function Fn(e) {
  for (var t = 0, r, s, a, n; t < e.length; ) {
    for (n = Or(e[t]).split("-"), r = n.length, s = Or(e[t + 1]), s = s ? s.split("-") : null; r > 0; ) {
      if (a = Rt(n.slice(0, r).join("-")), a)
        return a;
      if (s && s.length >= r && Mn(n, s) >= r - 1)
        break;
      r--;
    }
    t++;
  }
  return Je;
}
function In(e) {
  return !!(e && e.match("^[^/\\\\]*$"));
}
function Rt(e) {
  var t = null, r;
  if (O[e] === void 0 && typeof module < "u" && module && module.exports && In(e))
    try {
      t = Je._abbr, r = require, r("./locale/" + e), we(t);
    } catch {
      O[e] = null;
    }
  return O[e];
}
function we(e, t) {
  var r;
  return e && (P(t) ? r = de(e) : r = or(e, t), r ? Je = r : typeof console < "u" && console.warn && console.warn(
    "Locale " + e + " not found. Did you forget to load it?"
  )), Je._abbr;
}
function or(e, t) {
  if (t !== null) {
    var r, s = ls;
    if (t.abbr = e, O[e] != null)
      Gr(
        "defineLocaleOverride",
        "use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."
      ), s = O[e]._config;
    else if (t.parentLocale != null)
      if (O[t.parentLocale] != null)
        s = O[t.parentLocale]._config;
      else if (r = Rt(t.parentLocale), r != null)
        s = r._config;
      else
        return Le[t.parentLocale] || (Le[t.parentLocale] = []), Le[t.parentLocale].push({
          name: e,
          config: t
        }), null;
    return O[e] = new zt(Ut(s, t)), Le[e] && Le[e].forEach(function(a) {
      or(a.name, a.config);
    }), we(e), O[e];
  } else
    return delete O[e], null;
}
function Yn(e, t) {
  if (t != null) {
    var r, s, a = ls;
    O[e] != null && O[e].parentLocale != null ? O[e].set(Ut(O[e]._config, t)) : (s = Rt(e), s != null && (a = s._config), t = Ut(a, t), s == null && (t.abbr = e), r = new zt(t), r.parentLocale = O[e], O[e] = r), we(e);
  } else
    O[e] != null && (O[e].parentLocale != null ? (O[e] = O[e].parentLocale, e === we() && we(e)) : O[e] != null && delete O[e]);
  return O[e];
}
function de(e) {
  var t;
  if (e && e._locale && e._locale._abbr && (e = e._locale._abbr), !e)
    return Je;
  if (!B(e)) {
    if (t = Rt(e), t)
      return t;
    e = [e];
  }
  return Fn(e);
}
function Pn() {
  return Lt(O);
}
function lr(e) {
  var t, r = e._a;
  return r && p(e).overflow === -2 && (t = r[re] < 0 || r[re] > 11 ? re : r[Z] < 1 || r[Z] > sr(r[I], r[re]) ? Z : r[A] < 0 || r[A] > 24 || r[A] === 24 && (r[$] !== 0 || r[se] !== 0 || r[Te] !== 0) ? A : r[$] < 0 || r[$] > 59 ? $ : r[se] < 0 || r[se] > 59 ? se : r[Te] < 0 || r[Te] > 999 ? Te : -1, p(e)._overflowDayOfYear && (t < I || t > Z) && (t = Z), p(e)._overflowWeeks && t === -1 && (t = La), p(e)._overflowWeekday && t === -1 && (t = xa), p(e).overflow = t), e;
}
var Cn = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, Un = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/, Ln = /Z|[+-]\d\d(?::?\d\d)?/, nt = [
  ["YYYYYY-MM-DD", /[+-]\d{6}-\d\d-\d\d/],
  ["YYYY-MM-DD", /\d{4}-\d\d-\d\d/],
  ["GGGG-[W]WW-E", /\d{4}-W\d\d-\d/],
  ["GGGG-[W]WW", /\d{4}-W\d\d/, !1],
  ["YYYY-DDD", /\d{4}-\d{3}/],
  ["YYYY-MM", /\d{4}-\d\d/, !1],
  ["YYYYYYMMDD", /[+-]\d{10}/],
  ["YYYYMMDD", /\d{8}/],
  ["GGGG[W]WWE", /\d{4}W\d{3}/],
  ["GGGG[W]WW", /\d{4}W\d{2}/, !1],
  ["YYYYDDD", /\d{7}/],
  ["YYYYMM", /\d{6}/, !1],
  ["YYYY", /\d{4}/, !1]
], It = [
  ["HH:mm:ss.SSSS", /\d\d:\d\d:\d\d\.\d+/],
  ["HH:mm:ss,SSSS", /\d\d:\d\d:\d\d,\d+/],
  ["HH:mm:ss", /\d\d:\d\d:\d\d/],
  ["HH:mm", /\d\d:\d\d/],
  ["HHmmss.SSSS", /\d\d\d\d\d\d\.\d+/],
  ["HHmmss,SSSS", /\d\d\d\d\d\d,\d+/],
  ["HHmmss", /\d\d\d\d\d\d/],
  ["HHmm", /\d\d\d\d/],
  ["HH", /\d\d/]
], xn = /^\/?Date\((-?\d+)/i, Wn = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/, Vn = {
  UT: 0,
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};
function cs(e) {
  var t, r, s = e._i, a = Cn.exec(s) || Un.exec(s), n, i, o, l, c = nt.length, _ = It.length;
  if (a) {
    for (p(e).iso = !0, t = 0, r = c; t < r; t++)
      if (nt[t][1].exec(a[1])) {
        i = nt[t][0], n = nt[t][2] !== !1;
        break;
      }
    if (i == null) {
      e._isValid = !1;
      return;
    }
    if (a[3]) {
      for (t = 0, r = _; t < r; t++)
        if (It[t][1].exec(a[3])) {
          o = (a[2] || " ") + It[t][0];
          break;
        }
      if (o == null) {
        e._isValid = !1;
        return;
      }
    }
    if (!n && o != null) {
      e._isValid = !1;
      return;
    }
    if (a[4])
      if (Ln.exec(a[4]))
        l = "Z";
      else {
        e._isValid = !1;
        return;
      }
    e._f = i + (o || "") + (l || ""), ur(e);
  } else
    e._isValid = !1;
}
function Hn(e, t, r, s, a, n) {
  var i = [
    $n(e),
    Xr.indexOf(t),
    parseInt(r, 10),
    parseInt(s, 10),
    parseInt(a, 10)
  ];
  return n && i.push(parseInt(n, 10)), i;
}
function $n(e) {
  var t = parseInt(e, 10);
  return t <= 49 ? 2e3 + t : t <= 999 ? 1900 + t : t;
}
function Bn(e) {
  return e.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, "");
}
function Gn(e, t, r) {
  if (e) {
    var s = ns.indexOf(e), a = new Date(
      t[0],
      t[1],
      t[2]
    ).getDay();
    if (s !== a)
      return p(r).weekdayMismatch = !0, r._isValid = !1, !1;
  }
  return !0;
}
function jn(e, t, r) {
  if (e)
    return Vn[e];
  if (t)
    return 0;
  var s = parseInt(r, 10), a = s % 100, n = (s - a) / 100;
  return n * 60 + a;
}
function us(e) {
  var t = Wn.exec(Bn(e._i)), r;
  if (t) {
    if (r = Hn(
      t[4],
      t[3],
      t[2],
      t[5],
      t[6],
      t[7]
    ), !Gn(t[1], r, e))
      return;
    e._a = r, e._tzm = jn(t[8], t[9], t[10]), e._d = qe.apply(null, e._a), e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), p(e).rfc2822 = !0;
  } else
    e._isValid = !1;
}
function Kn(e) {
  var t = xn.exec(e._i);
  if (t !== null) {
    e._d = /* @__PURE__ */ new Date(+t[1]);
    return;
  }
  if (cs(e), e._isValid === !1)
    delete e._isValid;
  else
    return;
  if (us(e), e._isValid === !1)
    delete e._isValid;
  else
    return;
  e._strict ? e._isValid = !1 : h.createFromInputFallback(e);
}
h.createFromInputFallback = V(
  "value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",
  function(e) {
    e._d = /* @__PURE__ */ new Date(e._i + (e._useUTC ? " UTC" : ""));
  }
);
function ve(e, t, r) {
  return e ?? t ?? r;
}
function qn(e) {
  var t = new Date(h.now());
  return e._useUTC ? [
    t.getUTCFullYear(),
    t.getUTCMonth(),
    t.getUTCDate()
  ] : [t.getFullYear(), t.getMonth(), t.getDate()];
}
function cr(e) {
  var t, r, s = [], a, n, i;
  if (!e._d) {
    for (a = qn(e), e._w && e._a[Z] == null && e._a[re] == null && Zn(e), e._dayOfYear != null && (i = ve(e._a[I], a[I]), (e._dayOfYear > He(i) || e._dayOfYear === 0) && (p(e)._overflowDayOfYear = !0), r = qe(i, 0, e._dayOfYear), e._a[re] = r.getUTCMonth(), e._a[Z] = r.getUTCDate()), t = 0; t < 3 && e._a[t] == null; ++t)
      e._a[t] = s[t] = a[t];
    for (; t < 7; t++)
      e._a[t] = s[t] = e._a[t] == null ? t === 2 ? 1 : 0 : e._a[t];
    e._a[A] === 24 && e._a[$] === 0 && e._a[se] === 0 && e._a[Te] === 0 && (e._nextDay = !0, e._a[A] = 0), e._d = (e._useUTC ? qe : en).apply(
      null,
      s
    ), n = e._useUTC ? e._d.getUTCDay() : e._d.getDay(), e._tzm != null && e._d.setUTCMinutes(e._d.getUTCMinutes() - e._tzm), e._nextDay && (e._a[A] = 24), e._w && typeof e._w.d < "u" && e._w.d !== n && (p(e).weekdayMismatch = !0);
  }
}
function Zn(e) {
  var t, r, s, a, n, i, o, l, c;
  t = e._w, t.GG != null || t.W != null || t.E != null ? (n = 1, i = 4, r = ve(
    t.GG,
    e._a[I],
    Ze(D(), 1, 4).year
  ), s = ve(t.W, 1), a = ve(t.E, 1), (a < 1 || a > 7) && (l = !0)) : (n = e._locale._week.dow, i = e._locale._week.doy, c = Ze(D(), n, i), r = ve(t.gg, e._a[I], c.year), s = ve(t.w, c.week), t.d != null ? (a = t.d, (a < 0 || a > 6) && (l = !0)) : t.e != null ? (a = t.e + n, (t.e < 0 || t.e > 6) && (l = !0)) : a = n), s < 1 || s > ie(r, n, i) ? p(e)._overflowWeeks = !0 : l != null ? p(e)._overflowWeekday = !0 : (o = as(r, s, a, n, i), e._a[I] = o.year, e._dayOfYear = o.dayOfYear);
}
h.ISO_8601 = function() {
};
h.RFC_2822 = function() {
};
function ur(e) {
  if (e._f === h.ISO_8601) {
    cs(e);
    return;
  }
  if (e._f === h.RFC_2822) {
    us(e);
    return;
  }
  e._a = [], p(e).empty = !0;
  var t = "" + e._i, r, s, a, n, i, o = t.length, l = 0, c, _;
  for (a = jr(e._f, e._locale).match(Qt) || [], _ = a.length, r = 0; r < _; r++)
    n = a[r], s = (t.match(Pa(n, e)) || [])[0], s && (i = t.substr(0, t.indexOf(s)), i.length > 0 && p(e).unusedInput.push(i), t = t.slice(
      t.indexOf(s) + s.length
    ), l += s.length), ge[n] ? (s ? p(e).empty = !1 : p(e).unusedTokens.push(n), Ua(n, s, e)) : e._strict && !s && p(e).unusedTokens.push(n);
  p(e).charsLeftOver = o - l, t.length > 0 && p(e).unusedInput.push(t), e._a[A] <= 12 && p(e).bigHour === !0 && e._a[A] > 0 && (p(e).bigHour = void 0), p(e).parsedDateParts = e._a.slice(0), p(e).meridiem = e._meridiem, e._a[A] = Jn(
    e._locale,
    e._a[A],
    e._meridiem
  ), c = p(e).era, c !== null && (e._a[I] = e._locale.erasConvertYear(c, e._a[I])), cr(e), lr(e);
}
function Jn(e, t, r) {
  var s;
  return r == null ? t : e.meridiemHour != null ? e.meridiemHour(t, r) : (e.isPM != null && (s = e.isPM(r), s && t < 12 && (t += 12), !s && t === 12 && (t = 0)), t);
}
function zn(e) {
  var t, r, s, a, n, i, o = !1, l = e._f.length;
  if (l === 0) {
    p(e).invalidFormat = !0, e._d = /* @__PURE__ */ new Date(NaN);
    return;
  }
  for (a = 0; a < l; a++)
    n = 0, i = !1, t = Jt({}, e), e._useUTC != null && (t._useUTC = e._useUTC), t._f = e._f[a], ur(t), Zt(t) && (i = !0), n += p(t).charsLeftOver, n += p(t).unusedTokens.length * 10, p(t).score = n, o ? n < s && (s = n, r = t) : (s == null || n < s || i) && (s = n, r = t, i && (o = !0));
  _e(e, r || t);
}
function Qn(e) {
  if (!e._d) {
    var t = Xt(e._i), r = t.day === void 0 ? t.date : t.day;
    e._a = $r(
      [t.year, t.month, r, t.hour, t.minute, t.second, t.millisecond],
      function(s) {
        return s && parseInt(s, 10);
      }
    ), cr(e);
  }
}
function Xn(e) {
  var t = new Qe(lr(hs(e)));
  return t._nextDay && (t.add(1, "d"), t._nextDay = void 0), t;
}
function hs(e) {
  var t = e._i, r = e._f;
  return e._locale = e._locale || de(e._l), t === null || r === void 0 && t === "" ? Et({ nullInput: !0 }) : (typeof t == "string" && (e._i = t = e._locale.preparse(t)), G(t) ? new Qe(lr(t)) : (ze(t) ? e._d = t : B(r) ? zn(e) : r ? ur(e) : ei(e), Zt(e) || (e._d = null), e));
}
function ei(e) {
  var t = e._i;
  P(t) ? e._d = new Date(h.now()) : ze(t) ? e._d = new Date(t.valueOf()) : typeof t == "string" ? Kn(e) : B(t) ? (e._a = $r(t.slice(0), function(r) {
    return parseInt(r, 10);
  }), cr(e)) : ke(t) ? Qn(e) : le(t) ? e._d = new Date(t) : h.createFromInputFallback(e);
}
function ds(e, t, r, s, a) {
  var n = {};
  return (t === !0 || t === !1) && (s = t, t = void 0), (r === !0 || r === !1) && (s = r, r = void 0), (ke(e) && qt(e) || B(e) && e.length === 0) && (e = void 0), n._isAMomentObject = !0, n._useUTC = n._isUTC = a, n._l = r, n._i = e, n._f = t, n._strict = s, Xn(n);
}
function D(e, t, r, s) {
  return ds(e, t, r, s, !1);
}
var ti = V(
  "moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",
  function() {
    var e = D.apply(null, arguments);
    return this.isValid() && e.isValid() ? e < this ? this : e : Et();
  }
), ri = V(
  "moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",
  function() {
    var e = D.apply(null, arguments);
    return this.isValid() && e.isValid() ? e > this ? this : e : Et();
  }
);
function fs(e, t) {
  var r, s;
  if (t.length === 1 && B(t[0]) && (t = t[0]), !t.length)
    return D();
  for (r = t[0], s = 1; s < t.length; ++s)
    (!t[s].isValid() || t[s][e](r)) && (r = t[s]);
  return r;
}
function si() {
  var e = [].slice.call(arguments, 0);
  return fs("isBefore", e);
}
function ai() {
  var e = [].slice.call(arguments, 0);
  return fs("isAfter", e);
}
var ni = function() {
  return Date.now ? Date.now() : +/* @__PURE__ */ new Date();
}, xe = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
  "millisecond"
];
function ii(e) {
  var t, r = !1, s, a = xe.length;
  for (t in e)
    if (m(e, t) && !(N.call(xe, t) !== -1 && (e[t] == null || !isNaN(e[t]))))
      return !1;
  for (s = 0; s < a; ++s)
    if (e[xe[s]]) {
      if (r)
        return !1;
      parseFloat(e[xe[s]]) !== y(e[xe[s]]) && (r = !0);
    }
  return !0;
}
function oi() {
  return this._isValid;
}
function li() {
  return j(NaN);
}
function Nt(e) {
  var t = Xt(e), r = t.year || 0, s = t.quarter || 0, a = t.month || 0, n = t.week || t.isoWeek || 0, i = t.day || 0, o = t.hour || 0, l = t.minute || 0, c = t.second || 0, _ = t.millisecond || 0;
  this._isValid = ii(t), this._milliseconds = +_ + c * 1e3 + // 1000
  l * 6e4 + // 1000 * 60
  o * 1e3 * 60 * 60, this._days = +i + n * 7, this._months = +a + s * 3 + r * 12, this._data = {}, this._locale = de(), this._bubble();
}
function ot(e) {
  return e instanceof Nt;
}
function Wt(e) {
  return e < 0 ? Math.round(-1 * e) * -1 : Math.round(e);
}
function ci(e, t, r) {
  var s = Math.min(e.length, t.length), a = Math.abs(e.length - t.length), n = 0, i;
  for (i = 0; i < s; i++)
    y(e[i]) !== y(t[i]) && n++;
  return n + a;
}
function _s(e, t) {
  f(e, 0, 0, function() {
    var r = this.utcOffset(), s = "+";
    return r < 0 && (r = -r, s = "-"), s + z(~~(r / 60), 2) + t + z(~~r % 60, 2);
  });
}
_s("Z", ":");
_s("ZZ", "");
d("Z", Ot);
d("ZZ", Ot);
E(["Z", "ZZ"], function(e, t, r) {
  r._useUTC = !0, r._tzm = hr(Ot, e);
});
var ui = /([\+\-]|\d\d)/gi;
function hr(e, t) {
  var r = (t || "").match(e), s, a, n;
  return r === null ? null : (s = r[r.length - 1] || [], a = (s + "").match(ui) || ["-", 0, 0], n = +(a[1] * 60) + y(a[2]), n === 0 ? 0 : a[0] === "+" ? n : -n);
}
function dr(e, t) {
  var r, s;
  return t._isUTC ? (r = t.clone(), s = (G(e) || ze(e) ? e.valueOf() : D(e).valueOf()) - r.valueOf(), r._d.setTime(r._d.valueOf() + s), h.updateOffset(r, !1), r) : D(e).local();
}
function Vt(e) {
  return -Math.round(e._d.getTimezoneOffset());
}
h.updateOffset = function() {
};
function hi(e, t, r) {
  var s = this._offset || 0, a;
  if (!this.isValid())
    return e != null ? this : NaN;
  if (e != null) {
    if (typeof e == "string") {
      if (e = hr(Ot, e), e === null)
        return this;
    } else Math.abs(e) < 16 && !r && (e = e * 60);
    return !this._isUTC && t && (a = Vt(this)), this._offset = e, this._isUTC = !0, a != null && this.add(a, "m"), s !== e && (!t || this._changeInProgress ? ws(
      this,
      j(e - s, "m"),
      1,
      !1
    ) : this._changeInProgress || (this._changeInProgress = !0, h.updateOffset(this, !0), this._changeInProgress = null)), this;
  } else
    return this._isUTC ? s : Vt(this);
}
function di(e, t) {
  return e != null ? (typeof e != "string" && (e = -e), this.utcOffset(e, t), this) : -this.utcOffset();
}
function fi(e) {
  return this.utcOffset(0, e);
}
function _i(e) {
  return this._isUTC && (this.utcOffset(0, e), this._isUTC = !1, e && this.subtract(Vt(this), "m")), this;
}
function pi() {
  if (this._tzm != null)
    this.utcOffset(this._tzm, !1, !0);
  else if (typeof this._i == "string") {
    var e = hr(Ia, this._i);
    e != null ? this.utcOffset(e) : this.utcOffset(0, !0);
  }
  return this;
}
function yi(e) {
  return this.isValid() ? (e = e ? D(e).utcOffset() : 0, (this.utcOffset() - e) % 60 === 0) : !1;
}
function wi() {
  return this.utcOffset() > this.clone().month(0).utcOffset() || this.utcOffset() > this.clone().month(5).utcOffset();
}
function mi() {
  if (!P(this._isDSTShifted))
    return this._isDSTShifted;
  var e = {}, t;
  return Jt(e, this), e = hs(e), e._a ? (t = e._isUTC ? Q(e._a) : D(e._a), this._isDSTShifted = this.isValid() && ci(e._a, t.toArray()) > 0) : this._isDSTShifted = !1, this._isDSTShifted;
}
function Si() {
  return this.isValid() ? !this._isUTC : !1;
}
function Ei() {
  return this.isValid() ? this._isUTC : !1;
}
function ps() {
  return this.isValid() ? this._isUTC && this._offset === 0 : !1;
}
var Ti = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/, ki = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
function j(e, t) {
  var r = e, s = null, a, n, i;
  return ot(e) ? r = {
    ms: e._milliseconds,
    d: e._days,
    M: e._months
  } : le(e) || !isNaN(+e) ? (r = {}, t ? r[t] = +e : r.milliseconds = +e) : (s = Ti.exec(e)) ? (a = s[1] === "-" ? -1 : 1, r = {
    y: 0,
    d: y(s[Z]) * a,
    h: y(s[A]) * a,
    m: y(s[$]) * a,
    s: y(s[se]) * a,
    ms: y(Wt(s[Te] * 1e3)) * a
    // the millisecond decimal point is included in the match
  }) : (s = ki.exec(e)) ? (a = s[1] === "-" ? -1 : 1, r = {
    y: me(s[2], a),
    M: me(s[3], a),
    w: me(s[4], a),
    d: me(s[5], a),
    h: me(s[6], a),
    m: me(s[7], a),
    s: me(s[8], a)
  }) : r == null ? r = {} : typeof r == "object" && ("from" in r || "to" in r) && (i = Di(
    D(r.from),
    D(r.to)
  ), r = {}, r.ms = i.milliseconds, r.M = i.months), n = new Nt(r), ot(e) && m(e, "_locale") && (n._locale = e._locale), ot(e) && m(e, "_isValid") && (n._isValid = e._isValid), n;
}
j.fn = Nt.prototype;
j.invalid = li;
function me(e, t) {
  var r = e && parseFloat(e.replace(",", "."));
  return (isNaN(r) ? 0 : r) * t;
}
function vr(e, t) {
  var r = {};
  return r.months = t.month() - e.month() + (t.year() - e.year()) * 12, e.clone().add(r.months, "M").isAfter(t) && --r.months, r.milliseconds = +t - +e.clone().add(r.months, "M"), r;
}
function Di(e, t) {
  var r;
  return e.isValid() && t.isValid() ? (t = dr(t, e), e.isBefore(t) ? r = vr(e, t) : (r = vr(t, e), r.milliseconds = -r.milliseconds, r.months = -r.months), r) : { milliseconds: 0, months: 0 };
}
function ys(e, t) {
  return function(r, s) {
    var a, n;
    return s !== null && !isNaN(+s) && (Gr(
      t,
      "moment()." + t + "(period, number) is deprecated. Please use moment()." + t + "(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."
    ), n = r, r = s, s = n), a = j(r, s), ws(this, a, e), this;
  };
}
function ws(e, t, r, s) {
  var a = t._milliseconds, n = Wt(t._days), i = Wt(t._months);
  e.isValid() && (s = s ?? !0, i && ts(e, Ke(e, "Month") + i * r), n && Qr(e, "Date", Ke(e, "Date") + n * r), a && e._d.setTime(e._d.valueOf() + a * r), s && h.updateOffset(e, n || i));
}
var bi = ys(1, "add"), Oi = ys(-1, "subtract");
function ms(e) {
  return typeof e == "string" || e instanceof String;
}
function vi(e) {
  return G(e) || ze(e) || ms(e) || le(e) || Ni(e) || Ri(e) || e === null || e === void 0;
}
function Ri(e) {
  var t = ke(e) && !qt(e), r = !1, s = [
    "years",
    "year",
    "y",
    "months",
    "month",
    "M",
    "days",
    "day",
    "d",
    "dates",
    "date",
    "D",
    "hours",
    "hour",
    "h",
    "minutes",
    "minute",
    "m",
    "seconds",
    "second",
    "s",
    "milliseconds",
    "millisecond",
    "ms"
  ], a, n, i = s.length;
  for (a = 0; a < i; a += 1)
    n = s[a], r = r || m(e, n);
  return t && r;
}
function Ni(e) {
  var t = B(e), r = !1;
  return t && (r = e.filter(function(s) {
    return !le(s) && ms(e);
  }).length === 0), t && r;
}
function gi(e) {
  var t = ke(e) && !qt(e), r = !1, s = [
    "sameDay",
    "nextDay",
    "lastDay",
    "nextWeek",
    "lastWeek",
    "sameElse"
  ], a, n;
  for (a = 0; a < s.length; a += 1)
    n = s[a], r = r || m(e, n);
  return t && r;
}
function Ai(e, t) {
  var r = e.diff(t, "days", !0);
  return r < -6 ? "sameElse" : r < -1 ? "lastWeek" : r < 0 ? "lastDay" : r < 1 ? "sameDay" : r < 2 ? "nextDay" : r < 7 ? "nextWeek" : "sameElse";
}
function Mi(e, t) {
  arguments.length === 1 && (arguments[0] ? vi(arguments[0]) ? (e = arguments[0], t = void 0) : gi(arguments[0]) && (t = arguments[0], e = void 0) : (e = void 0, t = void 0));
  var r = e || D(), s = dr(r, this).startOf("day"), a = h.calendarFormat(this, s) || "sameElse", n = t && (X(t[a]) ? t[a].call(this, r) : t[a]);
  return this.format(
    n || this.localeData().calendar(a, this, D(r))
  );
}
function Fi() {
  return new Qe(this);
}
function Ii(e, t) {
  var r = G(e) ? e : D(e);
  return this.isValid() && r.isValid() ? (t = H(t) || "millisecond", t === "millisecond" ? this.valueOf() > r.valueOf() : r.valueOf() < this.clone().startOf(t).valueOf()) : !1;
}
function Yi(e, t) {
  var r = G(e) ? e : D(e);
  return this.isValid() && r.isValid() ? (t = H(t) || "millisecond", t === "millisecond" ? this.valueOf() < r.valueOf() : this.clone().endOf(t).valueOf() < r.valueOf()) : !1;
}
function Pi(e, t, r, s) {
  var a = G(e) ? e : D(e), n = G(t) ? t : D(t);
  return this.isValid() && a.isValid() && n.isValid() ? (s = s || "()", (s[0] === "(" ? this.isAfter(a, r) : !this.isBefore(a, r)) && (s[1] === ")" ? this.isBefore(n, r) : !this.isAfter(n, r))) : !1;
}
function Ci(e, t) {
  var r = G(e) ? e : D(e), s;
  return this.isValid() && r.isValid() ? (t = H(t) || "millisecond", t === "millisecond" ? this.valueOf() === r.valueOf() : (s = r.valueOf(), this.clone().startOf(t).valueOf() <= s && s <= this.clone().endOf(t).valueOf())) : !1;
}
function Ui(e, t) {
  return this.isSame(e, t) || this.isAfter(e, t);
}
function Li(e, t) {
  return this.isSame(e, t) || this.isBefore(e, t);
}
function xi(e, t, r) {
  var s, a, n;
  if (!this.isValid())
    return NaN;
  if (s = dr(e, this), !s.isValid())
    return NaN;
  switch (a = (s.utcOffset() - this.utcOffset()) * 6e4, t = H(t), t) {
    case "year":
      n = lt(this, s) / 12;
      break;
    case "month":
      n = lt(this, s);
      break;
    case "quarter":
      n = lt(this, s) / 3;
      break;
    case "second":
      n = (this - s) / 1e3;
      break;
    case "minute":
      n = (this - s) / 6e4;
      break;
    case "hour":
      n = (this - s) / 36e5;
      break;
    case "day":
      n = (this - s - a) / 864e5;
      break;
    case "week":
      n = (this - s - a) / 6048e5;
      break;
    default:
      n = this - s;
  }
  return r ? n : x(n);
}
function lt(e, t) {
  if (e.date() < t.date())
    return -lt(t, e);
  var r = (t.year() - e.year()) * 12 + (t.month() - e.month()), s = e.clone().add(r, "months"), a, n;
  return t - s < 0 ? (a = e.clone().add(r - 1, "months"), n = (t - s) / (s - a)) : (a = e.clone().add(r + 1, "months"), n = (t - s) / (a - s)), -(r + n) || 0;
}
h.defaultFormat = "YYYY-MM-DDTHH:mm:ssZ";
h.defaultFormatUtc = "YYYY-MM-DDTHH:mm:ss[Z]";
function Wi() {
  return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
}
function Vi(e) {
  if (!this.isValid())
    return null;
  var t = e !== !0, r = t ? this.clone().utc() : this;
  return r.year() < 0 || r.year() > 9999 ? it(
    r,
    t ? "YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYYYY-MM-DD[T]HH:mm:ss.SSSZ"
  ) : X(Date.prototype.toISOString) ? t ? this.toDate().toISOString() : new Date(this.valueOf() + this.utcOffset() * 60 * 1e3).toISOString().replace("Z", it(r, "Z")) : it(
    r,
    t ? "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]" : "YYYY-MM-DD[T]HH:mm:ss.SSSZ"
  );
}
function Hi() {
  if (!this.isValid())
    return "moment.invalid(/* " + this._i + " */)";
  var e = "moment", t = "", r, s, a, n;
  return this.isLocal() || (e = this.utcOffset() === 0 ? "moment.utc" : "moment.parseZone", t = "Z"), r = "[" + e + '("]', s = 0 <= this.year() && this.year() <= 9999 ? "YYYY" : "YYYYYY", a = "-MM-DD[T]HH:mm:ss.SSS", n = t + '[")]', this.format(r + s + a + n);
}
function $i(e) {
  e || (e = this.isUtc() ? h.defaultFormatUtc : h.defaultFormat);
  var t = it(this, e);
  return this.localeData().postformat(t);
}
function Bi(e, t) {
  return this.isValid() && (G(e) && e.isValid() || D(e).isValid()) ? j({ to: this, from: e }).locale(this.locale()).humanize(!t) : this.localeData().invalidDate();
}
function Gi(e) {
  return this.from(D(), e);
}
function ji(e, t) {
  return this.isValid() && (G(e) && e.isValid() || D(e).isValid()) ? j({ from: this, to: e }).locale(this.locale()).humanize(!t) : this.localeData().invalidDate();
}
function Ki(e) {
  return this.to(D(), e);
}
function Ss(e) {
  var t;
  return e === void 0 ? this._locale._abbr : (t = de(e), t != null && (this._locale = t), this);
}
var Es = V(
  "moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",
  function(e) {
    return e === void 0 ? this.localeData() : this.locale(e);
  }
);
function Ts() {
  return this._locale;
}
var _t = 1e3, Ae = 60 * _t, pt = 60 * Ae, ks = (365 * 400 + 97) * 24 * pt;
function Me(e, t) {
  return (e % t + t) % t;
}
function Ds(e, t, r) {
  return e < 100 && e >= 0 ? new Date(e + 400, t, r) - ks : new Date(e, t, r).valueOf();
}
function bs(e, t, r) {
  return e < 100 && e >= 0 ? Date.UTC(e + 400, t, r) - ks : Date.UTC(e, t, r);
}
function qi(e) {
  var t, r;
  if (e = H(e), e === void 0 || e === "millisecond" || !this.isValid())
    return this;
  switch (r = this._isUTC ? bs : Ds, e) {
    case "year":
      t = r(this.year(), 0, 1);
      break;
    case "quarter":
      t = r(
        this.year(),
        this.month() - this.month() % 3,
        1
      );
      break;
    case "month":
      t = r(this.year(), this.month(), 1);
      break;
    case "week":
      t = r(
        this.year(),
        this.month(),
        this.date() - this.weekday()
      );
      break;
    case "isoWeek":
      t = r(
        this.year(),
        this.month(),
        this.date() - (this.isoWeekday() - 1)
      );
      break;
    case "day":
    case "date":
      t = r(this.year(), this.month(), this.date());
      break;
    case "hour":
      t = this._d.valueOf(), t -= Me(
        t + (this._isUTC ? 0 : this.utcOffset() * Ae),
        pt
      );
      break;
    case "minute":
      t = this._d.valueOf(), t -= Me(t, Ae);
      break;
    case "second":
      t = this._d.valueOf(), t -= Me(t, _t);
      break;
  }
  return this._d.setTime(t), h.updateOffset(this, !0), this;
}
function Zi(e) {
  var t, r;
  if (e = H(e), e === void 0 || e === "millisecond" || !this.isValid())
    return this;
  switch (r = this._isUTC ? bs : Ds, e) {
    case "year":
      t = r(this.year() + 1, 0, 1) - 1;
      break;
    case "quarter":
      t = r(
        this.year(),
        this.month() - this.month() % 3 + 3,
        1
      ) - 1;
      break;
    case "month":
      t = r(this.year(), this.month() + 1, 1) - 1;
      break;
    case "week":
      t = r(
        this.year(),
        this.month(),
        this.date() - this.weekday() + 7
      ) - 1;
      break;
    case "isoWeek":
      t = r(
        this.year(),
        this.month(),
        this.date() - (this.isoWeekday() - 1) + 7
      ) - 1;
      break;
    case "day":
    case "date":
      t = r(this.year(), this.month(), this.date() + 1) - 1;
      break;
    case "hour":
      t = this._d.valueOf(), t += pt - Me(
        t + (this._isUTC ? 0 : this.utcOffset() * Ae),
        pt
      ) - 1;
      break;
    case "minute":
      t = this._d.valueOf(), t += Ae - Me(t, Ae) - 1;
      break;
    case "second":
      t = this._d.valueOf(), t += _t - Me(t, _t) - 1;
      break;
  }
  return this._d.setTime(t), h.updateOffset(this, !0), this;
}
function Ji() {
  return this._d.valueOf() - (this._offset || 0) * 6e4;
}
function zi() {
  return Math.floor(this.valueOf() / 1e3);
}
function Qi() {
  return new Date(this.valueOf());
}
function Xi() {
  var e = this;
  return [
    e.year(),
    e.month(),
    e.date(),
    e.hour(),
    e.minute(),
    e.second(),
    e.millisecond()
  ];
}
function eo() {
  var e = this;
  return {
    years: e.year(),
    months: e.month(),
    date: e.date(),
    hours: e.hours(),
    minutes: e.minutes(),
    seconds: e.seconds(),
    milliseconds: e.milliseconds()
  };
}
function to() {
  return this.isValid() ? this.toISOString() : null;
}
function ro() {
  return Zt(this);
}
function so() {
  return _e({}, p(this));
}
function ao() {
  return p(this).overflow;
}
function no() {
  return {
    input: this._i,
    format: this._f,
    locale: this._locale,
    isUTC: this._isUTC,
    strict: this._strict
  };
}
f("N", 0, 0, "eraAbbr");
f("NN", 0, 0, "eraAbbr");
f("NNN", 0, 0, "eraAbbr");
f("NNNN", 0, 0, "eraName");
f("NNNNN", 0, 0, "eraNarrow");
f("y", ["y", 1], "yo", "eraYear");
f("y", ["yy", 2], 0, "eraYear");
f("y", ["yyy", 3], 0, "eraYear");
f("y", ["yyyy", 4], 0, "eraYear");
d("N", fr);
d("NN", fr);
d("NNN", fr);
d("NNNN", wo);
d("NNNNN", mo);
E(
  ["N", "NN", "NNN", "NNNN", "NNNNN"],
  function(e, t, r, s) {
    var a = r._locale.erasParse(e, s, r._strict);
    a ? p(r).era = a : p(r).invalidEra = e;
  }
);
d("y", Ie);
d("yy", Ie);
d("yyy", Ie);
d("yyyy", Ie);
d("yo", So);
E(["y", "yy", "yyy", "yyyy"], I);
E(["yo"], function(e, t, r, s) {
  var a;
  r._locale._eraYearOrdinalRegex && (a = e.match(r._locale._eraYearOrdinalRegex)), r._locale.eraYearOrdinalParse ? t[I] = r._locale.eraYearOrdinalParse(e, a) : t[I] = parseInt(e, 10);
});
function io(e, t) {
  var r, s, a, n = this._eras || de("en")._eras;
  for (r = 0, s = n.length; r < s; ++r) {
    switch (typeof n[r].since) {
      case "string":
        a = h(n[r].since).startOf("day"), n[r].since = a.valueOf();
        break;
    }
    switch (typeof n[r].until) {
      case "undefined":
        n[r].until = 1 / 0;
        break;
      case "string":
        a = h(n[r].until).startOf("day").valueOf(), n[r].until = a.valueOf();
        break;
    }
  }
  return n;
}
function oo(e, t, r) {
  var s, a, n = this.eras(), i, o, l;
  for (e = e.toUpperCase(), s = 0, a = n.length; s < a; ++s)
    if (i = n[s].name.toUpperCase(), o = n[s].abbr.toUpperCase(), l = n[s].narrow.toUpperCase(), r)
      switch (t) {
        case "N":
        case "NN":
        case "NNN":
          if (o === e)
            return n[s];
          break;
        case "NNNN":
          if (i === e)
            return n[s];
          break;
        case "NNNNN":
          if (l === e)
            return n[s];
          break;
      }
    else if ([i, o, l].indexOf(e) >= 0)
      return n[s];
}
function lo(e, t) {
  var r = e.since <= e.until ? 1 : -1;
  return t === void 0 ? h(e.since).year() : h(e.since).year() + (t - e.offset) * r;
}
function co() {
  var e, t, r, s = this.localeData().eras();
  for (e = 0, t = s.length; e < t; ++e)
    if (r = this.clone().startOf("day").valueOf(), s[e].since <= r && r <= s[e].until || s[e].until <= r && r <= s[e].since)
      return s[e].name;
  return "";
}
function uo() {
  var e, t, r, s = this.localeData().eras();
  for (e = 0, t = s.length; e < t; ++e)
    if (r = this.clone().startOf("day").valueOf(), s[e].since <= r && r <= s[e].until || s[e].until <= r && r <= s[e].since)
      return s[e].narrow;
  return "";
}
function ho() {
  var e, t, r, s = this.localeData().eras();
  for (e = 0, t = s.length; e < t; ++e)
    if (r = this.clone().startOf("day").valueOf(), s[e].since <= r && r <= s[e].until || s[e].until <= r && r <= s[e].since)
      return s[e].abbr;
  return "";
}
function fo() {
  var e, t, r, s, a = this.localeData().eras();
  for (e = 0, t = a.length; e < t; ++e)
    if (r = a[e].since <= a[e].until ? 1 : -1, s = this.clone().startOf("day").valueOf(), a[e].since <= s && s <= a[e].until || a[e].until <= s && s <= a[e].since)
      return (this.year() - h(a[e].since).year()) * r + a[e].offset;
  return this.year();
}
function _o(e) {
  return m(this, "_erasNameRegex") || _r.call(this), e ? this._erasNameRegex : this._erasRegex;
}
function po(e) {
  return m(this, "_erasAbbrRegex") || _r.call(this), e ? this._erasAbbrRegex : this._erasRegex;
}
function yo(e) {
  return m(this, "_erasNarrowRegex") || _r.call(this), e ? this._erasNarrowRegex : this._erasRegex;
}
function fr(e, t) {
  return t.erasAbbrRegex(e);
}
function wo(e, t) {
  return t.erasNameRegex(e);
}
function mo(e, t) {
  return t.erasNarrowRegex(e);
}
function So(e, t) {
  return t._eraYearOrdinalRegex || Ie;
}
function _r() {
  var e = [], t = [], r = [], s = [], a, n, i, o, l, c = this.eras();
  for (a = 0, n = c.length; a < n; ++a)
    i = ne(c[a].name), o = ne(c[a].abbr), l = ne(c[a].narrow), t.push(i), e.push(o), r.push(l), s.push(i), s.push(o), s.push(l);
  this._erasRegex = new RegExp("^(" + s.join("|") + ")", "i"), this._erasNameRegex = new RegExp("^(" + t.join("|") + ")", "i"), this._erasAbbrRegex = new RegExp("^(" + e.join("|") + ")", "i"), this._erasNarrowRegex = new RegExp(
    "^(" + r.join("|") + ")",
    "i"
  );
}
f(0, ["gg", 2], 0, function() {
  return this.weekYear() % 100;
});
f(0, ["GG", 2], 0, function() {
  return this.isoWeekYear() % 100;
});
function gt(e, t) {
  f(0, [e, e.length], 0, t);
}
gt("gggg", "weekYear");
gt("ggggg", "weekYear");
gt("GGGG", "isoWeekYear");
gt("GGGGG", "isoWeekYear");
d("G", bt);
d("g", bt);
d("GG", b, U);
d("gg", b, U);
d("GGGG", tr, er);
d("gggg", tr, er);
d("GGGGG", Dt, Tt);
d("ggggg", Dt, Tt);
et(
  ["gggg", "ggggg", "GGGG", "GGGGG"],
  function(e, t, r, s) {
    t[s.substr(0, 2)] = y(e);
  }
);
et(["gg", "GG"], function(e, t, r, s) {
  t[s] = h.parseTwoDigitYear(e);
});
function Eo(e) {
  return Os.call(
    this,
    e,
    this.week(),
    this.weekday() + this.localeData()._week.dow,
    this.localeData()._week.dow,
    this.localeData()._week.doy
  );
}
function To(e) {
  return Os.call(
    this,
    e,
    this.isoWeek(),
    this.isoWeekday(),
    1,
    4
  );
}
function ko() {
  return ie(this.year(), 1, 4);
}
function Do() {
  return ie(this.isoWeekYear(), 1, 4);
}
function bo() {
  var e = this.localeData()._week;
  return ie(this.year(), e.dow, e.doy);
}
function Oo() {
  var e = this.localeData()._week;
  return ie(this.weekYear(), e.dow, e.doy);
}
function Os(e, t, r, s, a) {
  var n;
  return e == null ? Ze(this, s, a).year : (n = ie(e, s, a), t > n && (t = n), vo.call(this, e, t, r, s, a));
}
function vo(e, t, r, s, a) {
  var n = as(e, t, r, s, a), i = qe(n.year, 0, n.dayOfYear);
  return this.year(i.getUTCFullYear()), this.month(i.getUTCMonth()), this.date(i.getUTCDate()), this;
}
f("Q", 0, "Qo", "quarter");
d("Q", Kr);
E("Q", function(e, t) {
  t[re] = (y(e) - 1) * 3;
});
function Ro(e) {
  return e == null ? Math.ceil((this.month() + 1) / 3) : this.month((e - 1) * 3 + this.month() % 3);
}
f("D", ["DD", 2], "Do", "date");
d("D", b, Ye);
d("DD", b, U);
d("Do", function(e, t) {
  return e ? t._dayOfMonthOrdinalParse || t._ordinalParse : t._dayOfMonthOrdinalParseLenient;
});
E(["D", "DD"], Z);
E("Do", function(e, t) {
  t[Z] = y(e.match(b)[0]);
});
var vs = Pe("Date", !0);
f("DDD", ["DDDD", 3], "DDDo", "dayOfYear");
d("DDD", kt);
d("DDDD", qr);
E(["DDD", "DDDD"], function(e, t, r) {
  r._dayOfYear = y(e);
});
function No(e) {
  var t = Math.round(
    (this.clone().startOf("day") - this.clone().startOf("year")) / 864e5
  ) + 1;
  return e == null ? t : this.add(e - t, "d");
}
f("m", ["mm", 2], 0, "minute");
d("m", b, rr);
d("mm", b, U);
E(["m", "mm"], $);
var go = Pe("Minutes", !1);
f("s", ["ss", 2], 0, "second");
d("s", b, rr);
d("ss", b, U);
E(["s", "ss"], se);
var Ao = Pe("Seconds", !1);
f("S", 0, 0, function() {
  return ~~(this.millisecond() / 100);
});
f(0, ["SS", 2], 0, function() {
  return ~~(this.millisecond() / 10);
});
f(0, ["SSS", 3], 0, "millisecond");
f(0, ["SSSS", 4], 0, function() {
  return this.millisecond() * 10;
});
f(0, ["SSSSS", 5], 0, function() {
  return this.millisecond() * 100;
});
f(0, ["SSSSSS", 6], 0, function() {
  return this.millisecond() * 1e3;
});
f(0, ["SSSSSSS", 7], 0, function() {
  return this.millisecond() * 1e4;
});
f(0, ["SSSSSSSS", 8], 0, function() {
  return this.millisecond() * 1e5;
});
f(0, ["SSSSSSSSS", 9], 0, function() {
  return this.millisecond() * 1e6;
});
d("S", kt, Kr);
d("SS", kt, U);
d("SSS", kt, qr);
var pe, Rs;
for (pe = "SSSS"; pe.length <= 9; pe += "S")
  d(pe, Ie);
function Mo(e, t) {
  t[Te] = y(("0." + e) * 1e3);
}
for (pe = "S"; pe.length <= 9; pe += "S")
  E(pe, Mo);
Rs = Pe("Milliseconds", !1);
f("z", 0, 0, "zoneAbbr");
f("zz", 0, 0, "zoneName");
function Fo() {
  return this._isUTC ? "UTC" : "";
}
function Io() {
  return this._isUTC ? "Coordinated Universal Time" : "";
}
var u = Qe.prototype;
u.add = bi;
u.calendar = Mi;
u.clone = Fi;
u.diff = xi;
u.endOf = Zi;
u.format = $i;
u.from = Bi;
u.fromNow = Gi;
u.to = ji;
u.toNow = Ki;
u.get = Va;
u.invalidAt = ao;
u.isAfter = Ii;
u.isBefore = Yi;
u.isBetween = Pi;
u.isSame = Ci;
u.isSameOrAfter = Ui;
u.isSameOrBefore = Li;
u.isValid = ro;
u.lang = Es;
u.locale = Ss;
u.localeData = Ts;
u.max = ri;
u.min = ti;
u.parsingFlags = so;
u.set = Ha;
u.startOf = qi;
u.subtract = Oi;
u.toArray = Xi;
u.toObject = eo;
u.toDate = Qi;
u.toISOString = Vi;
u.inspect = Hi;
typeof Symbol < "u" && Symbol.for != null && (u[Symbol.for("nodejs.util.inspect.custom")] = function() {
  return "Moment<" + this.format() + ">";
});
u.toJSON = to;
u.toString = Wi;
u.unix = zi;
u.valueOf = Ji;
u.creationData = no;
u.eraName = co;
u.eraNarrow = uo;
u.eraAbbr = ho;
u.eraYear = fo;
u.year = zr;
u.isLeapYear = Wa;
u.weekYear = Eo;
u.isoWeekYear = To;
u.quarter = u.quarters = Ro;
u.month = rs;
u.daysInMonth = za;
u.week = u.weeks = nn;
u.isoWeek = u.isoWeeks = on;
u.weeksInYear = bo;
u.weeksInWeekYear = Oo;
u.isoWeeksInYear = ko;
u.isoWeeksInISOWeekYear = Do;
u.date = vs;
u.day = u.days = En;
u.weekday = Tn;
u.isoWeekday = kn;
u.dayOfYear = No;
u.hour = u.hours = gn;
u.minute = u.minutes = go;
u.second = u.seconds = Ao;
u.millisecond = u.milliseconds = Rs;
u.utcOffset = hi;
u.utc = fi;
u.local = _i;
u.parseZone = pi;
u.hasAlignedHourOffset = yi;
u.isDST = wi;
u.isLocal = Si;
u.isUtcOffset = Ei;
u.isUtc = ps;
u.isUTC = ps;
u.zoneAbbr = Fo;
u.zoneName = Io;
u.dates = V(
  "dates accessor is deprecated. Use date instead.",
  vs
);
u.months = V(
  "months accessor is deprecated. Use month instead",
  rs
);
u.years = V(
  "years accessor is deprecated. Use year instead",
  zr
);
u.zone = V(
  "moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",
  di
);
u.isDSTShifted = V(
  "isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",
  mi
);
function Yo(e) {
  return D(e * 1e3);
}
function Po() {
  return D.apply(null, arguments).parseZone();
}
function Ns(e) {
  return e;
}
var S = zt.prototype;
S.calendar = ma;
S.longDateFormat = ka;
S.invalidDate = ba;
S.ordinal = Ra;
S.preparse = Ns;
S.postformat = Ns;
S.relativeTime = ga;
S.pastFuture = Aa;
S.set = ya;
S.eras = io;
S.erasParse = oo;
S.erasConvertYear = lo;
S.erasAbbrRegex = po;
S.erasNameRegex = _o;
S.erasNarrowRegex = yo;
S.months = Ka;
S.monthsShort = qa;
S.monthsParse = Ja;
S.monthsRegex = Xa;
S.monthsShortRegex = Qa;
S.week = tn;
S.firstDayOfYear = an;
S.firstDayOfWeek = sn;
S.weekdays = pn;
S.weekdaysMin = wn;
S.weekdaysShort = yn;
S.weekdaysParse = Sn;
S.weekdaysRegex = Dn;
S.weekdaysShortRegex = bn;
S.weekdaysMinRegex = On;
S.isPM = Rn;
S.meridiem = An;
function yt(e, t, r, s) {
  var a = de(), n = Q().set(s, t);
  return a[r](n, e);
}
function gs(e, t, r) {
  if (le(e) && (t = e, e = void 0), e = e || "", t != null)
    return yt(e, t, r, "month");
  var s, a = [];
  for (s = 0; s < 12; s++)
    a[s] = yt(e, s, r, "month");
  return a;
}
function pr(e, t, r, s) {
  typeof e == "boolean" ? (le(t) && (r = t, t = void 0), t = t || "") : (t = e, r = t, e = !1, le(t) && (r = t, t = void 0), t = t || "");
  var a = de(), n = e ? a._week.dow : 0, i, o = [];
  if (r != null)
    return yt(t, (r + n) % 7, s, "day");
  for (i = 0; i < 7; i++)
    o[i] = yt(t, (i + n) % 7, s, "day");
  return o;
}
function Co(e, t) {
  return gs(e, t, "months");
}
function Uo(e, t) {
  return gs(e, t, "monthsShort");
}
function Lo(e, t, r) {
  return pr(e, t, r, "weekdays");
}
function xo(e, t, r) {
  return pr(e, t, r, "weekdaysShort");
}
function Wo(e, t, r) {
  return pr(e, t, r, "weekdaysMin");
}
we("en", {
  eras: [
    {
      since: "0001-01-01",
      until: 1 / 0,
      offset: 1,
      name: "Anno Domini",
      narrow: "AD",
      abbr: "AD"
    },
    {
      since: "0000-12-31",
      until: -1 / 0,
      offset: 1,
      name: "Before Christ",
      narrow: "BC",
      abbr: "BC"
    }
  ],
  dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
  ordinal: function(e) {
    var t = e % 10, r = y(e % 100 / 10) === 1 ? "th" : t === 1 ? "st" : t === 2 ? "nd" : t === 3 ? "rd" : "th";
    return e + r;
  }
});
h.lang = V(
  "moment.lang is deprecated. Use moment.locale instead.",
  we
);
h.langData = V(
  "moment.langData is deprecated. Use moment.localeData instead.",
  de
);
var ee = Math.abs;
function Vo() {
  var e = this._data;
  return this._milliseconds = ee(this._milliseconds), this._days = ee(this._days), this._months = ee(this._months), e.milliseconds = ee(e.milliseconds), e.seconds = ee(e.seconds), e.minutes = ee(e.minutes), e.hours = ee(e.hours), e.months = ee(e.months), e.years = ee(e.years), this;
}
function As(e, t, r, s) {
  var a = j(t, r);
  return e._milliseconds += s * a._milliseconds, e._days += s * a._days, e._months += s * a._months, e._bubble();
}
function Ho(e, t) {
  return As(this, e, t, 1);
}
function $o(e, t) {
  return As(this, e, t, -1);
}
function Rr(e) {
  return e < 0 ? Math.floor(e) : Math.ceil(e);
}
function Bo() {
  var e = this._milliseconds, t = this._days, r = this._months, s = this._data, a, n, i, o, l;
  return e >= 0 && t >= 0 && r >= 0 || e <= 0 && t <= 0 && r <= 0 || (e += Rr(Ht(r) + t) * 864e5, t = 0, r = 0), s.milliseconds = e % 1e3, a = x(e / 1e3), s.seconds = a % 60, n = x(a / 60), s.minutes = n % 60, i = x(n / 60), s.hours = i % 24, t += x(i / 24), l = x(Ms(t)), r += l, t -= Rr(Ht(l)), o = x(r / 12), r %= 12, s.days = t, s.months = r, s.years = o, this;
}
function Ms(e) {
  return e * 4800 / 146097;
}
function Ht(e) {
  return e * 146097 / 4800;
}
function Go(e) {
  if (!this.isValid())
    return NaN;
  var t, r, s = this._milliseconds;
  if (e = H(e), e === "month" || e === "quarter" || e === "year")
    switch (t = this._days + s / 864e5, r = this._months + Ms(t), e) {
      case "month":
        return r;
      case "quarter":
        return r / 3;
      case "year":
        return r / 12;
    }
  else
    switch (t = this._days + Math.round(Ht(this._months)), e) {
      case "week":
        return t / 7 + s / 6048e5;
      case "day":
        return t + s / 864e5;
      case "hour":
        return t * 24 + s / 36e5;
      case "minute":
        return t * 1440 + s / 6e4;
      case "second":
        return t * 86400 + s / 1e3;
      case "millisecond":
        return Math.floor(t * 864e5) + s;
      default:
        throw new Error("Unknown unit " + e);
    }
}
function fe(e) {
  return function() {
    return this.as(e);
  };
}
var Fs = fe("ms"), jo = fe("s"), Ko = fe("m"), qo = fe("h"), Zo = fe("d"), Jo = fe("w"), zo = fe("M"), Qo = fe("Q"), Xo = fe("y"), el = Fs;
function tl() {
  return j(this);
}
function rl(e) {
  return e = H(e), this.isValid() ? this[e + "s"]() : NaN;
}
function De(e) {
  return function() {
    return this.isValid() ? this._data[e] : NaN;
  };
}
var sl = De("milliseconds"), al = De("seconds"), nl = De("minutes"), il = De("hours"), ol = De("days"), ll = De("months"), cl = De("years");
function ul() {
  return x(this.days() / 7);
}
var te = Math.round, Ne = {
  ss: 44,
  // a few seconds to seconds
  s: 45,
  // seconds to minute
  m: 45,
  // minutes to hour
  h: 22,
  // hours to day
  d: 26,
  // days to month/week
  w: null,
  // weeks to month
  M: 11
  // months to year
};
function hl(e, t, r, s, a) {
  return a.relativeTime(t || 1, !!r, e, s);
}
function dl(e, t, r, s) {
  var a = j(e).abs(), n = te(a.as("s")), i = te(a.as("m")), o = te(a.as("h")), l = te(a.as("d")), c = te(a.as("M")), _ = te(a.as("w")), v = te(a.as("y")), F = n <= r.ss && ["s", n] || n < r.s && ["ss", n] || i <= 1 && ["m"] || i < r.m && ["mm", i] || o <= 1 && ["h"] || o < r.h && ["hh", o] || l <= 1 && ["d"] || l < r.d && ["dd", l];
  return r.w != null && (F = F || _ <= 1 && ["w"] || _ < r.w && ["ww", _]), F = F || c <= 1 && ["M"] || c < r.M && ["MM", c] || v <= 1 && ["y"] || ["yy", v], F[2] = t, F[3] = +e > 0, F[4] = s, hl.apply(null, F);
}
function fl(e) {
  return e === void 0 ? te : typeof e == "function" ? (te = e, !0) : !1;
}
function _l(e, t) {
  return Ne[e] === void 0 ? !1 : t === void 0 ? Ne[e] : (Ne[e] = t, e === "s" && (Ne.ss = t - 1), !0);
}
function pl(e, t) {
  if (!this.isValid())
    return this.localeData().invalidDate();
  var r = !1, s = Ne, a, n;
  return typeof e == "object" && (t = e, e = !1), typeof e == "boolean" && (r = e), typeof t == "object" && (s = Object.assign({}, Ne, t), t.s != null && t.ss == null && (s.ss = t.s - 1)), a = this.localeData(), n = dl(this, !r, s, a), r && (n = a.pastFuture(+this, n)), a.postformat(n);
}
var Yt = Math.abs;
function Oe(e) {
  return (e > 0) - (e < 0) || +e;
}
function At() {
  if (!this.isValid())
    return this.localeData().invalidDate();
  var e = Yt(this._milliseconds) / 1e3, t = Yt(this._days), r = Yt(this._months), s, a, n, i, o = this.asSeconds(), l, c, _, v;
  return o ? (s = x(e / 60), a = x(s / 60), e %= 60, s %= 60, n = x(r / 12), r %= 12, i = e ? e.toFixed(3).replace(/\.?0+$/, "") : "", l = o < 0 ? "-" : "", c = Oe(this._months) !== Oe(o) ? "-" : "", _ = Oe(this._days) !== Oe(o) ? "-" : "", v = Oe(this._milliseconds) !== Oe(o) ? "-" : "", l + "P" + (n ? c + n + "Y" : "") + (r ? c + r + "M" : "") + (t ? _ + t + "D" : "") + (a || s || e ? "T" : "") + (a ? v + a + "H" : "") + (s ? v + s + "M" : "") + (e ? v + i + "S" : "")) : "P0D";
}
var w = Nt.prototype;
w.isValid = oi;
w.abs = Vo;
w.add = Ho;
w.subtract = $o;
w.as = Go;
w.asMilliseconds = Fs;
w.asSeconds = jo;
w.asMinutes = Ko;
w.asHours = qo;
w.asDays = Zo;
w.asWeeks = Jo;
w.asMonths = zo;
w.asQuarters = Qo;
w.asYears = Xo;
w.valueOf = el;
w._bubble = Bo;
w.clone = tl;
w.get = rl;
w.milliseconds = sl;
w.seconds = al;
w.minutes = nl;
w.hours = il;
w.days = ol;
w.weeks = ul;
w.months = ll;
w.years = cl;
w.humanize = pl;
w.toISOString = At;
w.toString = At;
w.toJSON = At;
w.locale = Ss;
w.localeData = Ts;
w.toIsoString = V(
  "toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",
  At
);
w.lang = Es;
f("X", 0, 0, "unix");
f("x", 0, 0, "valueOf");
d("x", bt);
d("X", Ya);
E("X", function(e, t, r) {
  r._d = new Date(parseFloat(e) * 1e3);
});
E("x", function(e, t, r) {
  r._d = new Date(y(e));
});
//! moment.js
h.version = "2.30.1";
_a(D);
h.fn = u;
h.min = si;
h.max = ai;
h.now = ni;
h.utc = Q;
h.unix = Yo;
h.months = Co;
h.isDate = ze;
h.locale = we;
h.invalid = Et;
h.duration = j;
h.isMoment = G;
h.weekdays = Lo;
h.parseZone = Po;
h.localeData = de;
h.isDuration = ot;
h.monthsShort = Uo;
h.weekdaysMin = Wo;
h.defineLocale = or;
h.updateLocale = Yn;
h.locales = Pn;
h.weekdaysShort = xo;
h.normalizeUnits = H;
h.relativeTimeRounding = fl;
h.relativeTimeThreshold = _l;
h.calendarFormat = Ai;
h.prototype = u;
h.HTML5_FMT = {
  DATETIME_LOCAL: "YYYY-MM-DDTHH:mm",
  // <input type="datetime-local" />
  DATETIME_LOCAL_SECONDS: "YYYY-MM-DDTHH:mm:ss",
  // <input type="datetime-local" step="1" />
  DATETIME_LOCAL_MS: "YYYY-MM-DDTHH:mm:ss.SSS",
  // <input type="datetime-local" step="0.001" />
  DATE: "YYYY-MM-DD",
  // <input type="date" />
  TIME: "HH:mm",
  // <input type="time" />
  TIME_SECONDS: "HH:mm:ss",
  // <input type="time" step="1" />
  TIME_MS: "HH:mm:ss.SSS",
  // <input type="time" step="0.001" />
  WEEK: "GGGG-[W]WW",
  // <input type="week" />
  MONTH: "YYYY-MM"
  // <input type="month" />
};
function ce(e, t, r) {
  try {
    return e || (e = Date.now()), t || (t = "DD-MM-YYYY HH:mm:ss"), r || (r = "+03:00"), h(e).utcOffset(r).format(t);
  } catch (s) {
    throw console.error("[Service.formatDate]>> INTERNAL_ERROR", s), s;
  }
}
const Ge = class Ge {
  constructor(t, r, s) {
    k(this, "dbpath", null);
    k(this, "dbname", null);
    k(this, "processPath", null);
    k(this, "process", null);
    k(this, "storeTTL", null);
    if (!t) throw new Error("InstanceDatabase > constructor: dbname is a required");
    if (!r || typeof r != "string") throw new Error("InstanceDatabase > constructor: username is a required");
    this.init(t, r, (a) => {
      s && s(a);
    }), this.storeTTL || (this.storeTTL = J.getInstance()), Ge.instanceDB || (Ge.instanceDB = this);
  }
  // Инициализация базы данных
  init(t, r, s) {
    this.dbname = t, r !== "--" ? this.dbpath = C.join(oe.getPath("appData"), "controller", `user_${r}`, `${t}.db`) : this.dbpath = C.join(oe.getPath("appData"), "controller", `${t}.db`), this.processPath = C.join(ca(), "database/init.mjs"), this.process = Vs(this.processPath), this.requestIPC({ action: "init", payload: { dbpath: this.dbpath } }, !0).then(({ status: a }) => s && s(a === "ok")).catch(() => {
      s && s(!1);
    });
  }
  // Извлечь ключ шифрования базы данных
  async fetchPragmaKey(t) {
    try {
      if (!t && typeof t != "boolean") throw new Error("[fetchPragmaKey]>> onApp is not defined");
      if (t === !0)
        return T.APP_KEY;
      {
        if (!this.storeTTL) throw new Error("fetchPragmaKey > storeTTL is not defined");
        const r = this.storeTTL.get(g.USER_PRAGMA_KEY), s = this.storeTTL.get(g.USER_PRAGMA_SALT);
        if (!r || !s)
          throw new Error("fetchPragmaKey > ");
        return await Wr(r, s);
      }
    } catch (r) {
      throw console.debug("requestIPC>>", r), r;
    }
  }
  // сделать запрос к дочернему процессу и получить ответ
  async requestIPC(t, r) {
    try {
      if (this.process) {
        const s = await this.fetchPragmaKey(r), a = `${t.action}-${Date.now()}`;
        let n;
        const i = new Promise((l, c) => {
          n = (_) => {
            _.status === "error" && c(_.payload), _.action === a && l(_);
          }, this.process.on("message", n);
        });
        this.process.send({
          action: a,
          payload: { ...t.payload, pragmaKey: s }
        });
        const o = await i;
        return this.process.removeListener("message", n), o;
      } else throw new Error("requestIPC => process is not defined");
    } catch (s) {
      throw console.debug("requestIPC>>", s), s;
    }
  }
  /* Запросы к sqlite */
  // Выполняет запрос и возвращает все строки результата
  async all(t, r, s = !1) {
    if (this.process)
      return await this.requestIPC({ action: "all", payload: {
        sql: t,
        arguments: r
      } }, s);
    throw new Error("all => process is not defined");
  }
  // Выполняет запрос и возвращает одну строку результата
  async get(t, r, s = !1) {
    if (this.process)
      return await this.requestIPC({ action: "get", payload: {
        sql: t,
        arguments: r
      } }, s);
    throw new Error("get => process is not defined");
  }
  // Выполняет запрос без возврата результата 
  async run(t, r, s = !1) {
    if (this.process)
      return await this.requestIPC({ action: "run", payload: {
        sql: t,
        arguments: r
      } }, s);
    throw new Error("run => process is not defined");
  }
  // Выполняет один или несколько запросов SQL без параметров. Не возвращает результаты, используется для выполнения скриптов.
  async exec(t, r, s = !1) {
    if (this.process)
      return await this.requestIPC({ action: "exec", payload: {
        sql: t,
        arguments: r
      } }, s);
    throw new Error("exec => process is not defined");
  }
  // Запуск миграций для текущей базы данных
  async migrate(t) {
    if (!t) throw new Error("[migrate]>> config is not defined");
    if (this.process)
      return await this.requestIPC({
        action: `migrate:${this.dbname}`,
        payload: { ...t }
      }, t.isGeneral);
    throw new Error("exec => process is not defined");
  }
};
k(Ge, "instanceDB", null);
let $e = Ge;
const Ee = class Ee {
  constructor() {
    k(this, "instanceDatabaseList", /* @__PURE__ */ Object.create(null));
    k(this, "username", null);
    k(this, "stateConnectManager", !0);
  }
  // получение экземпляра менеджера
  static instance() {
    if (!Ee.instanceManager) {
      console.debug("DatabaseManager > created a new DB manager instance");
      const t = new Ee();
      Ee.instanceManager = t;
    }
    return Ee.instanceManager;
  }
  // Подключение всех баз данных
  async executeAllInitDB(t, r) {
    if (!r || !Array.isArray(r)) throw TypeError("[executeAllInitDB]>> invalid items");
    try {
      for (const s of r) {
        const a = await new Promise((n) => {
          const i = s.dbname;
          this.instanceDatabaseList[i] = new $e(i, t, (o) => {
            n(o);
          });
        });
        this.stateConnectManager = a;
      }
      return this.stateConnectManager;
    } catch (s) {
      throw console.error("[executeAllInitDB]>> ", s), s;
    }
  }
  /**
   * Проводит rekey ключа шифрования для всех БД пользователя
   * @param username 
   * @param newPragmaKey новый ключ шифрования
   */
  async rekeyAllUserDataBases(t, r) {
    if (!t) throw TypeError("[rekeyAllUserDataBases]>> invalid username");
    if (!r) throw TypeError("[rekeyAllUserDataBases]>> invalid newPragmaKey");
    const s = ["materials"];
    for (const a of s)
      try {
        const n = new $e(a, t), i = C.join(n.dbpath, "..", `backup-${a}-${ce(Date.now(), "DD-MM-YY_HH-mm-ss")}.db`);
        console.debug("BACKUP WAS CREATED", i), await n.run(`
                    VACUUM INTO ?;
                `, [i]), await n.run(`
                    PRAGMA rekey = '${r}';
                `), Ar.unlinkSync(i);
      } catch (n) {
        throw console.log("ERROR DURING REKEY"), n;
      }
  }
  // Залутать инстанс БД
  getDatabase(t) {
    const r = this.instanceDatabaseList[t];
    if (!r || !(r instanceof $e))
      throw new Error(`getDatabase > the instance "${t}" was not initialized`);
    return r;
  }
  // Инициализация Баз Данных уровня приложения
  async initOnApp(t) {
    try {
      const r = this.executeAllInitDB("--", [
        { dbname: "users", isGeneral: !0 }
      ]);
      return (t == null ? void 0 : t.migrate) === !0 && (await this.executeMigrations({ pragmaKey: process.env.APP_KEY, isGeneral: !0 }), console.debug("initOnApp>> migrations were applied")), await r;
    } catch (r) {
      throw console.error("[DatabaseManager.initOnApp]>> ", r), r;
    }
  }
  // Инициализация Баз Данных уровня пользователя
  async initOnUser(t, r) {
    try {
      this.username = t;
      const s = this.executeAllInitDB(t, [
        { dbname: "materials", isGeneral: !1 }
      ]);
      return (r == null ? void 0 : r.migrate) === !0 && (await this.executeMigrations({ pragmaKey: "abc123", isGeneral: !1 }), console.debug("initOnUser>> migrations were applied")), await s;
    } catch (s) {
      throw console.error("[DatabaseManager.initOnUser]>> ", s), s;
    }
  }
  // применить миграции для всех баз данных
  async executeMigrations(t) {
    try {
      for (let r in this.instanceDatabaseList)
        Object.prototype.hasOwnProperty.apply(this.instanceDatabaseList, [r]) && await this.instanceDatabaseList[r].migrate(t);
    } catch (r) {
      throw console.error("executeMigrations>>", r), r;
    }
  }
};
k(Ee, "instanceManager", null);
let ue = Ee;
class yr {
  constructor() {
    k(this, "instanceDb", null);
    k(this, "allFields", {
      id: "id",
      username: "username",
      password: "password",
      avatar: "avatar",
      createdAt: "created_at AS createdAt",
      updatedAt: "updated_at AS updatedAt"
    });
    if (this.instanceDb = ue.instance().getDatabase("users"), !this.instanceDb) throw new Error("DB users is not initialized");
  }
  // Получить массив пользователей
  async getAll() {
    return await this.instanceDb.all(`
            SELECT * FROM users;
        `, [], !0);
  }
  // Создать одного пользователя
  async create({ username: t, password: r, avatar: s, createdAt: a, updatedAt: n }) {
    await this.instanceDb.run(`
            INSERT INTO users (username, password, avatar, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?);
        `, [t, r, s, a, n], !0);
    const i = await this.findByUsername({ username: t }, { excludes: ["password"] });
    if (!i) throw new Error("[UserService.create]>> newUser was not created");
    return i;
  }
  // Найти пользователя по username
  async findByUsername(t, r) {
    var s;
    try {
      let a;
      ((s = r == null ? void 0 : r.excludes) == null ? void 0 : s.length) > 0 ? a = Object.entries(this.allFields).filter(([i, o]) => !(r != null && r.excludes.includes(i))).map(([i, o]) => o).join(",") : a = Object.values(this.allFields).join(",");
      const n = await this.instanceDb.get(`
                SELECT ${a}
                FROM users
                WHERE username = ?;
            `, [t.username], !0);
      return !n || !(n != null && n.payload) ? null : n.payload;
    } catch (a) {
      return console.error(a), null;
    }
  }
  // Обновление пароля
  async updatePassword(t) {
    return await this.instanceDb.run(`
            UPDATE users SET password = ? 
            WHERE username = ?;
        `, [t.password, t.username], !0), null;
  }
}
function Nr(e, t) {
  const r = ` !"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~	
\r\v\f`, s = (t == null ? void 0 : t.separator) || "/";
  let a = e.split(s), n;
  return a.at(-1) === "" && (e = e.slice(0, -1)), r.includes(a[0]) ? n = e.slice(2) : a[0] === "" ? n = e.slice(1) : n = e, a = void 0, (t == null ? void 0 : t.split) === !0 ? n.split(s) : n;
}
class Ce {
  constructor() {
    k(this, "instanceDb", null);
    k(this, "allFields", {
      id: "id",
      pathName: "path_name AS pathName",
      icon: "icon",
      iconType: "icon_type AS iconType",
      chapterType: "chapter_type AS chapterType",
      label: "label",
      route: "route",
      contentTitle: "content_title AS contentTitle",
      createdAt: "created_at AS createdAt",
      updatedAt: "updated_at AS updatedAt"
    });
    k(this, "allFieldsForRec", {
      pathName: "path_name",
      icon: "icon",
      iconType: "icon_type",
      chapterType: "chapter_type",
      label: "label",
      contentTitle: "content_title",
      updatedAt: "updated_at"
    });
    if (this.instanceDb = ue.instance().getDatabase("materials"), !this.instanceDb) throw new Error("DB materials is not initialized");
  }
  // коррекция полей таблицы. Исключает те поля которые приходят в массиве
  correctFieldsSqlForExclude(t) {
    let r;
    return (t == null ? void 0 : t.length) > 0 ? r = Object.entries(this.allFields).filter(([s, a]) => !t.includes(s)).map(([s, a]) => a).join(",") : r = Object.values(this.allFields).join(","), r;
  }
  // корректировка полей таблицы для выполнения записи данных sql
  correctFieldsSqlForRec(t) {
    if (!t || typeof t != "object")
      throw new Error("[ChapterService.correctFieldsSqlForRec]>> dto is not defined");
    const r = Object.entries(this.allFieldsForRec).filter(([a, n]) => !!Object.prototype.hasOwnProperty.call(t, a)), s = r.map(([a, n]) => t[a]);
    return {
      keys: r.map(([a, n]) => n + " = ?").join(", "),
      args: s
    };
  }
  // region READ
  // Получить массив разделов
  async getAll(t) {
    let r = this.correctFieldsSqlForExclude(t == null ? void 0 : t.excludes);
    return (await this.instanceDb.all(`
            SELECT ${r} FROM chapters;
        `)).payload;
  }
  // Получить массив разделов с их подразделами для формирования массива для панели меню
  async getAllForMenu() {
    const t = await this.instanceDb.all(`
            SELECT 
                chapters.${this.allFields.id}, chapters.${this.allFields.pathName},
                chapters.${this.allFields.icon}, chapters.${this.allFields.iconType},
                chapters.${this.allFields.label}, chapters.${this.allFields.route},
                chapters.${this.allFields.chapterType},
                JSON_GROUP_ARRAY(
                    JSON_OBJECT(
                        'id', sub_chapters.id,
                        'fullpath', sub_chapters.fullpath,
                        'chapterType', sub_chapters.chapter_type,
                        'icon', sub_chapters.icon,
                        'iconType', sub_chapters.icon_type,
                        'label', sub_chapters.label,
                        'route', sub_chapters.route
                    )
                ) AS items
            FROM chapters
            LEFT JOIN sub_chapters
            ON chapters.id = sub_chapters.chapter_id
            GROUP BY chapters.id;
        `);
    return !t || !(t != null && t.payload) ? null : t.payload;
  }
  // Найти раздел по ID
  async findById(t, r) {
    var s, a, n, i;
    try {
      let o = this.correctFieldsSqlForExclude(r == null ? void 0 : r.excludes);
      if ((s = r == null ? void 0 : r.select) != null && s.length && ((a = r == null ? void 0 : r.select) == null ? void 0 : a.length) > 0) {
        const _ = Object.keys(this.allFields).filter((v) => {
          var F;
          return !((F = r.select) != null && F.includes(v));
        });
        o = this.correctFieldsSqlForExclude(_);
      }
      let l;
      if (((n = r == null ? void 0 : r.includes) == null ? void 0 : n.blocks) === !0 ? l = await this.instanceDb.get(`
                    SELECT 
                        chapters.${this.allFields.id}, chapters.${this.allFields.pathName},
                        chapters.${this.allFields.contentTitle}, chapters.${this.allFields.createdAt},
                        chapters.${this.allFields.updatedAt},
                        chapters.${this.allFields.icon}, chapters.${this.allFields.iconType},
                        chapters.${this.allFields.label}, chapters.${this.allFields.route},
                        chapters.${this.allFields.chapterType},
                        JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'id', blocks.id,
                                'chapterId', blocks.chapter_id,
                                'title', blocks.title,
                                'content', blocks.content,
                                'createdAt', blocks.created_at,
                                'updatedAt', blocks.updated_at
                            )
                        ) AS blocks
                    FROM chapters
                    LEFT JOIN blocks
                    ON chapters.id = blocks.chapter_id
                    WHERE chapters.id = ?
                    GROUP BY chapters.id;
                `, [t]) : l = await this.instanceDb.get(`
                    SELECT ${o}
                    FROM chapters WHERE path_name = ?;
                `, [t]), !l || !(l != null && l.payload)) return null;
      const c = l.payload;
      return c.blocks && typeof c.blocks == "string" && (c.blocks = JSON.parse(c.blocks), c.blocks = (i = c.blocks[0]) != null && i.id ? c.blocks : []), c;
    } catch (o) {
      return console.error(o), null;
    }
  }
  // Найти раздел по pathName
  async findByPathName(t, r) {
    var s, a, n;
    try {
      let i = this.correctFieldsSqlForExclude(r == null ? void 0 : r.excludes);
      if ((s = r == null ? void 0 : r.select) != null && s.length && ((a = r == null ? void 0 : r.select) == null ? void 0 : a.length) > 0) {
        const l = Object.keys(this.allFields).filter((c) => {
          var _;
          return !((_ = r.select) != null && _.includes(c));
        });
        i = this.correctFieldsSqlForExclude(l);
      }
      let o;
      return ((n = r == null ? void 0 : r.includes) == null ? void 0 : n.blocks) === !0 ? o = await this.instanceDb.get(`
                    SELECT 
                        chapters.${this.allFields.id}, chapters.${this.allFields.pathName},
                        chapters.${this.allFields.contentTitle}, chapters.${this.allFields.createdAt},
                        chapters.${this.allFields.updatedAt},
                        chapters.${this.allFields.icon}, chapters.${this.allFields.iconType},
                        chapters.${this.allFields.label}, chapters.${this.allFields.route},
                        chapters.${this.allFields.chapterType},
                        JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'id', blocks.id,
                                'chapterId', blocks.chapter_id,
                                'title', blocks.title,
                                'content', blocks.content,
                                'createdAt', blocks.created_at,
                                'updatedAt', blocks.updated_at
                            )
                        ) AS blocks
                    FROM chapters
                    LEFT JOIN blocks
                    ON chapters.id = blocks.chapter_id
                    WHERE chapters.path_name = ?
                    GROUP BY chapters.id;
                `, [t]) : o = await this.instanceDb.get(`
                    SELECT ${i}
                    FROM chapters WHERE path_name = ?;
                `, [t]), !o || !(o != null && o.payload) ? null : o.payload;
    } catch (i) {
      return console.error(i), null;
    }
  }
  // end region
  // region CREATE
  // Создать один раздел
  async create(t) {
    await this.instanceDb.run(`
            INSERT INTO chapters (
                path_name,
                icon,
                icon_type,
                chapter_type,
                label,
                route,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `, [
      t.pathName,
      t.icon,
      t.iconType,
      t.chapterType,
      t.label,
      t.route,
      t.createdAt,
      t.updatedAt
    ]);
    const r = await this.findByPathName(t.pathName);
    if (!r) throw new Error("[ChapterService.create]>> newChapter was not created");
    return r;
  }
  // end region
  // region UPDATE
  // Обновление данных раздела
  async update(t, r) {
    if (!t) throw new Error("[ChapterService.updateByPathName]>> id is not defined");
    const { args: s, keys: a } = this.correctFieldsSqlForRec(r);
    await this.instanceDb.run(`
            UPDATE chapters
            SET
                ${a}
            WHERE id = ?;
        `, [...s, t]);
    const n = await this.findById(t, {
      includes: {
        blocks: !0
      }
    });
    if (!n) throw new Error("[ChapterService.updateByPathName]>> newChapter was not created");
    return n;
  }
  // end region
  // region DELETE
  // Удаление раздела по pathName
  async deleteOneByPathName(t) {
    if (!t) throw new Error("[ChapterService.deleteOneByPathName]>> pathName is not defined");
    await this.instanceDb.run(`
            DELETE FROM sub_chapters 
            WHERE path_name = ?;
        `, [t]), await this.instanceDb.run(`
            DELETE FROM chapters
            WHERE path_name = ?;
        `, [t]);
  }
  // end region
}
class tt {
  constructor() {
    k(this, "instanceDb", null);
    k(this, "allFields", {
      id: "id",
      pathName: "path_name AS pathName",
      chapterId: "chapter_id AS chapterId",
      fullpath: "fullpath",
      icon: "icon",
      iconType: "icon_type AS iconType",
      chapterType: "chapter_type AS chapterType",
      label: "label",
      route: "route",
      contentTitle: "content_title AS contentTitle",
      createdAt: "created_at AS createdAt",
      updatedAt: "updated_at AS updatedAt"
    });
    k(this, "allFieldsForRec", {
      icon: "icon",
      iconType: "icon_type",
      chapterType: "chapter_type",
      label: "label",
      contentTitle: "content_title",
      updatedAt: "updated_at"
    });
    if (this.instanceDb = ue.instance().getDatabase("materials"), !this.instanceDb) throw new Error("DB materials is not initialized");
  }
  // коррекция полей таблицы. Исключает те поля которые приходят в массиве
  correctFieldsSqlForExclude(t) {
    let r;
    return (t == null ? void 0 : t.length) > 0 ? r = Object.entries(this.allFields).filter(([s, a]) => !t.includes(s)).map(([s, a]) => a).join(",") : r = Object.values(this.allFields).join(","), r;
  }
  // корректировка полей таблицы для выполнения записи данных sql
  correctFieldsSqlForRec(t) {
    if (!t || typeof t != "object")
      throw new Error("[SubChapterService.correctFieldsSqlForRec]>> dto is not defined");
    const r = Object.entries(this.allFieldsForRec).filter(([a, n]) => !!Object.prototype.hasOwnProperty.call(t, a)), s = r.map(([a, n]) => t[a]);
    return {
      keys: r.map(([a, n]) => n + " = ?").join(", "),
      args: s
    };
  }
  // region READ
  // Получить массив подразделов
  async getAll(t) {
    let r = this.correctFieldsSqlForExclude(t == null ? void 0 : t.excludes);
    return (await this.instanceDb.all(`
            SELECT ${r} FROM sub_chapters;
        `)).payload;
  }
  // Найти подраздел по ID
  async findById(t, r) {
    var s, a, n, i;
    try {
      let o = this.correctFieldsSqlForExclude(r == null ? void 0 : r.excludes);
      if ((s = r == null ? void 0 : r.select) != null && s.length && ((a = r == null ? void 0 : r.select) == null ? void 0 : a.length) > 0) {
        const _ = Object.keys(this.allFields).filter((v) => {
          var F;
          return !((F = r.select) != null && F.includes(v));
        });
        o = this.correctFieldsSqlForExclude(_);
      }
      let l;
      if (((n = r == null ? void 0 : r.includes) == null ? void 0 : n.blocks) === !0 ? l = await this.instanceDb.get(`
                    SELECT 
                        sub_chapters.${this.allFields.id}, sub_chapters.${this.allFields.pathName},
                        sub_chapters.${this.allFields.contentTitle}, sub_chapters.${this.allFields.createdAt},
                        sub_chapters.${this.allFields.updatedAt}, sub_chapters.${this.allFields.fullpath},
                        sub_chapters.${this.allFields.icon}, sub_chapters.${this.allFields.iconType},
                        sub_chapters.${this.allFields.label}, sub_chapters.${this.allFields.route},
                        sub_chapters.${this.allFields.chapterType},
                        JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'id', blocks.id,
                                'chapterId', blocks.sub_chapter_id,
                                'title', blocks.title,
                                'content', blocks.content,
                                'createdAt', blocks.created_at,
                                'updatedAt', blocks.updated_at
                            )
                        ) AS blocks
                    FROM sub_chapters
                    LEFT JOIN blocks
                    ON sub_chapters.id = blocks.sub_chapter_id
                    WHERE sub_chapters.id = ?
                    GROUP BY sub_chapters.id;
                `, [t]) : l = await this.instanceDb.get(`
                    SELECT ${o}
                    FROM sub_chapters WHERE path_name = ?;
                `, [t]), !l || !(l != null && l.payload)) return null;
      const c = l.payload;
      return c.blocks && typeof c.blocks == "string" && (c.blocks = JSON.parse(c.blocks), c.blocks = (i = c.blocks[0]) != null && i.id ? c.blocks : []), c;
    } catch (o) {
      return console.error(o), null;
    }
  }
  // Найти подраздел по pathName
  async findByPathName(t, r) {
    var s, a;
    try {
      let n = this.correctFieldsSqlForExclude(r == null ? void 0 : r.excludes);
      if ((s = r == null ? void 0 : r.select) != null && s.length && ((a = r == null ? void 0 : r.select) == null ? void 0 : a.length) > 0) {
        const o = Object.keys(this.allFields).filter((l) => {
          var c;
          return !((c = r.select) != null && c.includes(l));
        });
        n = this.correctFieldsSqlForExclude(o);
      }
      const i = await this.instanceDb.get(`
                SELECT ${n}
                FROM sub_chapters
                WHERE path_name = ?;
            `, [t]);
      return !i || !(i != null && i.payload) ? null : i.payload;
    } catch (n) {
      return console.error(n), null;
    }
  }
  // Найти подраздел по fullpath
  async findByFullpath(t, r) {
    var s, a, n;
    try {
      let i = this.correctFieldsSqlForExclude(r == null ? void 0 : r.excludes);
      if ((s = r == null ? void 0 : r.select) != null && s.length && ((a = r == null ? void 0 : r.select) == null ? void 0 : a.length) > 0) {
        const l = Object.keys(this.allFields).filter((c) => {
          var _;
          return !((_ = r.select) != null && _.includes(c));
        });
        i = this.correctFieldsSqlForExclude(l);
      }
      let o;
      return ((n = r == null ? void 0 : r.includes) == null ? void 0 : n.blocks) === !0 ? o = await this.instanceDb.get(`
                    SELECT 
                        sub_chapters.${this.allFields.id}, sub_chapters.${this.allFields.pathName},
                        sub_chapters.${this.allFields.fullpath},
                        sub_chapters.${this.allFields.contentTitle}, sub_chapters.${this.allFields.createdAt},
                        sub_chapters.${this.allFields.updatedAt},
                        sub_chapters.${this.allFields.icon}, sub_chapters.${this.allFields.iconType},
                        sub_chapters.${this.allFields.label}, sub_chapters.${this.allFields.route},
                        sub_chapters.${this.allFields.chapterType},
                        JSON_GROUP_ARRAY(
                            JSON_OBJECT(
                                'id', blocks.id,
                                'subChapterId', blocks.sub_chapter_id,
                                'title', blocks.title,
                                'content', blocks.content,
                                'createdAt', blocks.created_at,
                                'updatedAt', blocks.updated_at
                            )
                        ) AS blocks
                    FROM sub_chapters
                    LEFT JOIN blocks
                    ON sub_chapters.id = blocks.sub_chapter_id
                    WHERE sub_chapters.fullpath = ?
                    GROUP BY sub_chapters.id;
                `, [t]) : o = await this.instanceDb.get(`
                    SELECT ${i}
                    FROM sub_chapters WHERE fullpath = ?;
                `, [t]), !o || !(o != null && o.payload) ? null : o.payload;
    } catch (i) {
      return console.error(i), null;
    }
  }
  //end region
  // region CREATE
  // Создать один подраздел
  async create(t) {
    await this.instanceDb.run(`
            INSERT INTO sub_chapters (
                path_name,
                fullpath,    
                chapter_id,
                icon,
                icon_type,
                chapter_type,
                label,
                route,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `, [
      t.pathName,
      t.fullpath,
      t.chapterId,
      t.icon,
      t.iconType,
      t.chapterType,
      t.label,
      t.route,
      t.createdAt,
      t.updatedAt
    ]);
    const r = await this.findByFullpath(t.fullpath);
    if (!r) throw new Error("[SubChapterService.create]>> newSubChapter was not created");
    return r;
  }
  // end region
  // region UPDATE
  // Обновление данных ПОДраздела
  async update(t, r) {
    if (!t) throw new Error("[SubChapterService.update]>> id is not defined");
    const { args: s, keys: a } = this.correctFieldsSqlForRec(r);
    await this.instanceDb.run(`
                UPDATE sub_chapters
                SET
                    ${a}
                WHERE id = ?;
            `, [...s, t]);
    const n = await this.findById(t, {
      includes: {
        blocks: !0
      }
    });
    if (!n) throw new Error("[SubChapterService.update]>> subChapter was not updated");
    return n;
  }
  // end region
  // region DELETE
  async deleteOneByFullpath(t) {
    if (!t) throw new Error("[SubChapterService.deleteOneByFullpath]>> fullpath is not defined");
    await this.instanceDb.run(`
            DELETE FROM sub_chapters 
            WHERE fullpath LIKE ? || '%';
        `, [t]);
  }
  // end region
}
class rt {
  constructor() {
    k(this, "instanceDb", null);
    k(this, "allFields", {
      id: "id",
      chapterId: "chapter_id AS chapterId",
      subChapterId: "sub_chapter_id AS subChapterId",
      title: "title",
      content: "content",
      createdAt: "created_at AS createdAt",
      updatedAt: "updated_at AS updatedAt"
    });
    k(this, "allFieldsForRec", {
      chapterId: "chapter_id",
      subChapterId: "sub_chapter_id",
      title: "title",
      content: "content",
      updatedAt: "updated_at"
    });
    if (this.instanceDb = ue.instance().getDatabase("materials"), !this.instanceDb) throw new Error("DB materials is not initialized");
  }
  // коррекция полей таблицы. Исключает те поля которые приходят в массиве
  correctFieldsSqlForExclude(t) {
    let r;
    return (t == null ? void 0 : t.length) > 0 ? r = Object.entries(this.allFields).filter(([s, a]) => !t.includes(s)).map(([s, a]) => a).join(",") : r = Object.values(this.allFields).join(","), r;
  }
  // корректировка полей таблицы для выполнения записи данных sql
  correctFieldsSqlForRec(t) {
    if (!t || typeof t != "object")
      throw new Error("[BlocksService.correctFieldsSqlForRec]>> dto is not defined");
    const r = Object.entries(this.allFieldsForRec).filter(([a, n]) => !!Object.prototype.hasOwnProperty.call(t, a)), s = r.map(([a, n]) => t[a]);
    return {
      keys: r.map(([a, n]) => n + " = ?").join(", "),
      args: s
    };
  }
  // region READ
  // Получить массив блоков для раздела
  async getAllForChapter(t, r) {
    if (!t) throw new Error("[BlocksService.getAllForChapter]>> chapterId is not defined");
    if (typeof t != "number" || Object.is(+t, NaN)) throw new Error("[BlocksService.getAllForChapter]>> invalid chapterId");
    let s = this.correctFieldsSqlForExclude(r == null ? void 0 : r.excludes);
    return (await this.instanceDb.all(`
            SELECT ${s} FROM blocks 
            WHERE chapter_id = ${t};
            `, [])).payload;
  }
  // Получить массив блоков для подраздела
  async getAllForSubChapter(t, r) {
    if (!t) throw new Error("[BlocksService.getAllForSubChapter]>> chapterId is not defined");
    if (typeof t != "number" || Object.is(+t, NaN)) throw new Error("[BlocksService.getAllForSubChapter]>> invalid chapterId");
    let s = this.correctFieldsSqlForExclude(r == null ? void 0 : r.excludes);
    return (await this.instanceDb.all(`
            SELECT ${s} FROM blocks
            WHERE sub_chapter_id = ${t};
        `, [])).payload;
  }
  // Получить раздел по title 
  async getByTitle(t, r) {
    var i, o;
    if (!t.title) throw new Error("[BlocksService.getByTitle]>> title is not defined");
    if (!t.chapterId && !t.subChapterId) throw new Error("[BlocksService.getByTitle]>> either chapterId or subChapterId must be transmitted");
    let s = this.correctFieldsSqlForExclude(r == null ? void 0 : r.excludes);
    if ((i = r == null ? void 0 : r.select) != null && i.length && ((o = r == null ? void 0 : r.select) == null ? void 0 : o.length) > 0) {
      const l = Object.keys(this.allFields).filter((c) => {
        var _;
        return !((_ = r.select) != null && _.includes(c));
      });
      s = this.correctFieldsSqlForExclude(l);
    }
    let a = null, n = [];
    if (t.chapterId ? (a = `
                SELECT ${s} FROM blocks
                WHERE chapter_id = ? AND title = ?;
            `, n = [t.chapterId, t.title]) : t.subChapterId && (a = `
                SELECT ${s} FROM blocks
                WHERE sub_chapter_id = ? AND title = ?;
            `, n = [t.subChapterId, t.title]), a) {
      const l = await this.instanceDb.get(a, n);
      return !l || !(l != null && l.payload) ? null : l.payload;
    } else throw new Error("[BlocksService.getByTitle]>> INTERNAL ERROR");
  }
  // Получить блок по ID 
  async getById(t, r) {
    var n, i;
    if (!t) throw new Error("[BlocksService.getById]>> blockId is not defined");
    if (typeof t != "number") throw new Error("[BlocksService.getById]>> invalid blockId");
    let s = this.correctFieldsSqlForExclude(r == null ? void 0 : r.excludes);
    if ((n = r == null ? void 0 : r.select) != null && n.length && ((i = r == null ? void 0 : r.select) == null ? void 0 : i.length) > 0) {
      const o = Object.keys(this.allFields).filter((l) => {
        var c;
        return !((c = r.select) != null && c.includes(l));
      });
      s = this.correctFieldsSqlForExclude(o);
    }
    const a = await this.instanceDb.get(`
            SELECT ${s} FROM blocks
            WHERE id = ?;
        `, [t]);
    return !a || !(a != null && a.payload) ? null : a.payload;
  }
  // end region
  // region CREATE
  // Создать блок для раздела
  async createForChapter(t) {
    await this.instanceDb.run(`
            INSERT INTO blocks (
                chapter_id,
                sub_chapter_id,
                title,
                created_at,
                updated_at
            )
            VALUES (?, ?, ?, ?, ?);
        `, [
      t.chapterId,
      t.subChapterId,
      t.title,
      ce(),
      ce()
    ]);
    const r = await this.getByTitle({
      title: t.title,
      chapterId: t.chapterId,
      subChapterId: t.subChapterId
    });
    if (!r) throw new Error("[BlocksService.createForChapter]>> newBlock was not created");
    return r;
  }
  // end region
  // region UPDATE
  async update(t, r) {
    if (!t) throw new Error("[ChapterService.update]>> blockId is not defined");
    if (typeof t != "number") throw new Error("[ChapterService.update]>> invalid blockId");
    const { args: s, keys: a } = this.correctFieldsSqlForRec(r);
    await this.instanceDb.run(`
            UPDATE blocks
            SET
                ${a}
            WHERE id = ?;
        `, [...s, t]);
    const n = await this.getById(t);
    if (!n) throw new Error("[BlocksService.update]>> updatedBlock is not defined");
    return n;
  }
  // end region
  // region DELETE
  // Удалить блок по айди
  async deleteOne(t) {
    if (!t) throw new Error("[ChapterService.deleteOne]>> blockId is not defined");
    if (typeof t != "number") throw new Error("[ChapterService.deleteOne]>> invalid blockId");
    await this.instanceDb.run(`
            DELETE FROM blocks 
            WHERE id = ?;
        `, [t]);
  }
  //end region
}
const yl = "materials.json", wl = "materials-menu.json", ml = {
  directory: "appData",
  encoding: "utf-8",
  filename: yl,
  format: "json"
}, wt = {
  directory: "appData",
  encoding: "utf-8",
  filename: wl,
  format: "json"
};
async function Sl(e) {
  const t = Kt(e);
  return ht({ ...wt, directory: t, customPath: !0 }).then((r) => !0).catch(async () => {
    try {
      return await xr([], { ...wt, directory: t, customPath: !0 }), !0;
    } catch (r) {
      return console.error("WRITE FILE", r), !1;
    }
  });
}
async function El(e, t) {
  try {
    if (!(t != null && t.token)) throw new Error("[createChapter]>> 401 UNAUTHORIZE");
    await Y(t.token, { refresh: !0 });
    const r = new Ce(), s = ce();
    return await r.create({
      chapterType: e.chapterType,
      label: e.label,
      icon: e.icon,
      iconType: e.iconType,
      pathName: e.pathName,
      route: e.route,
      createdAt: s,
      updatedAt: s
    });
  } catch (r) {
    throw console.error(r), r;
  }
}
async function Tl(e, t) {
  try {
    if (!e) throw new Error("[getChapters]>> invalid params");
    e.token || new Error("[getChapters]>> 401 UNAUTHORIZE");
    const { payload: { username: r } } = await Y(t.token, { refresh: !0 }), s = Kt(r);
    let a;
    if ((e == null ? void 0 : e.forMenu) === !0 ? a = await ht({ ...wt, directory: s, customPath: !0 }) : a = await ht(ml), !a) throw "[getChapters]>> INTERNAL_ERROR";
    if (e && e.page && e.perPage) {
      const n = e.perPage * e.page, i = n - e.perPage;
      return a.slice(i, n);
    }
    return a;
  } catch (r) {
    throw console.error(r), r;
  }
}
async function kl(e, t) {
  try {
    t.token || new Error("[getChapters]>> 401 UNAUTHORIZE"), await Y(t.token, { refresh: !0 });
    const r = new Ce();
    if (e.pathName) {
      const s = await r.findByPathName(e.pathName, {
        includes: {
          blocks: !0
          // также прикрепить блоки в объект раздела
        }
      });
      if (!s) throw "[getOneChapter]>> NOT_EXISTS_RECORD";
      const a = {
        id: s.id,
        icon: s.icon,
        chapterType: s.chapterType,
        createdAt: s.createdAt,
        label: s.label,
        pathName: s.pathName,
        route: s.route,
        updatedAt: s.updatedAt,
        iconType: s.iconType,
        content: {
          title: s.contentTitle,
          blocks: []
        },
        items: s.chapterType === "dir" ? [] : null
      };
      if (s != null && s.blocks) {
        let n = JSON.parse(s == null ? void 0 : s.blocks);
        n.length === 1 && !n[0].id ? n.length = 0 : n[0].id && (a.content.blocks = n);
      }
      return s == null || s.blocks, a;
    } else
      throw "[getOneChapter]>> NOT_EXISTS_RECORD";
  } catch (r) {
    throw console.error(r), r;
  }
}
async function Dl(e, t) {
  try {
    if (!e || !e.chapterId) throw "[createSubChapter]>> INVALID_INPUT_DATA";
    if (!(t != null && t.token)) throw "[createSubChapter]>> 401 UNAUTHORIZE";
    await Y(t.token, { refresh: !0 });
    const r = new tt(), s = ce();
    return await r.create({
      chapterId: e.chapterId,
      chapterType: e.chapterType,
      fullpath: e.fullpath,
      icon: e.icon,
      iconType: e.iconType,
      label: e.label,
      pathName: e.pathName,
      route: e.route,
      createdAt: s,
      updatedAt: s
    });
  } catch (r) {
    throw console.error(r), r;
  }
}
async function bl(e) {
  try {
    let t = function(o, l, c, _) {
      const v = {}, F = [];
      for (let L = 0; L < l.length; L++) {
        const K = l[L];
        K.pathName || (K.pathName = o);
        const Ue = Nr(K.fullpath, { split: !0 }).slice(c.length), be = Ue.shift();
        v[be] || (v[be] = []), K.fullLabels = [..._, K.label], Ue.length > 0 ? v[be].push(K) : F.push(K);
      }
      return F.map((L) => {
        var Ue;
        const K = Nr(L.fullpath, { split: !0 }).slice(c.length);
        if (((Ue = v[K[0]]) == null ? void 0 : Ue.length) <= 0)
          return L.items = L.chapterType === "dir" ? [] : null, L.pathName = c[0], L;
        {
          _.push(L.label);
          const be = K.shift();
          return L.items = t(o, v[be], [...c, be], _), L;
        }
      });
    };
    if (!(e != null && e.token)) throw "[syncMaterialsStores]>> 401 UNAUTHORIZE";
    const { payload: { username: r } } = await Y(e.token, { refresh: !0 });
    if (!r) throw new Error("[syncMaterialsStores]>> invalid username");
    const n = (await new Ce().getAllForMenu()).map((o) => {
      var l, c;
      return typeof o.items == "string" && (o.items = JSON.parse(o.items)), o.items && o.items.length > 0 ? (((l = o.items) == null ? void 0 : l.length) === 1 && !((c = o.items[0]) != null && c.id) && (o.items = o.chapterType === "dir" ? [] : null), o.items && (o.items = t(o.pathName, o.items, [o.pathName], [o.label]))) : console.error("[syncMaterialsStores]>> chapter.length is NULL"), o;
    }), i = Kt(r);
    return await xr(n, { ...wt, directory: i, customPath: !0 }), n;
  } catch (t) {
    throw console.error(t), t;
  }
}
async function Ol(e, t) {
  try {
    if (!(t != null && t.token)) throw new Error("[getOneSubChapter]>> 401 UNAUTHORIZE");
    await Y(t.token, { refresh: !0 });
    const r = new tt();
    if (await r.findByFullpath(e.fullpath), e.fullpath) {
      const s = await r.findByFullpath(e.fullpath, {
        includes: {
          blocks: !0
          // также прикрепить блоки в объект подраздела
        }
      });
      if (!s) throw "[getOneSubChapter]>> NOT_EXISTS_RECORD";
      const a = {
        id: s.id,
        icon: s.icon,
        fullpath: s.fullpath,
        chapterType: s.chapterType,
        createdAt: s.createdAt,
        label: s.label,
        pathName: s.pathName,
        route: s.route,
        updatedAt: s.updatedAt,
        iconType: s.iconType,
        content: {
          title: s.contentTitle,
          blocks: []
        },
        items: s.chapterType === "dir" ? [] : null
      };
      if (s != null && s.blocks) {
        let n = JSON.parse(s == null ? void 0 : s.blocks);
        n.length === 1 && !n[0].id ? n.length = 0 : n[0].id && (a.content.blocks = n);
      }
      return a;
    } else
      throw "[getOneSubChapter]>> NOT_EXISTS_RECORD";
  } catch (r) {
    throw console.error(r), r;
  }
}
async function vl(e, t) {
  try {
    if (!(t != null && t.token)) throw new Error("[editChapter]>> 401 UNAUTHORIZE");
    await Y(t.token, { refresh: !0 });
    const { params: r, fullpath: s, pathName: a } = e;
    if (!s && a) {
      const n = new Ce(), i = await n.findByPathName(a);
      if (i) {
        if (r.chapterType === "file" && i.chapterType === "dir")
          throw "[editChapter]>> INVALID_CHAPTER_TYPE[1]";
        const o = await n.update(
          i.id,
          {
            ...r,
            updatedAt: ce()
          }
        ), l = {
          ...o,
          content: {
            title: o.contentTitle ?? null,
            blocks: Array.isArray(o.blocks) ? o.blocks : []
          }
        };
        return Reflect.deleteProperty(l, "blocks"), l;
      } else throw "[editChapter]>> NOT_FOUND [1]";
    } else if (s && a) {
      const n = new tt(), i = await n.findByFullpath(s);
      if (i) {
        if (r.chapterType === "file" && i.chapterType === "dir")
          throw "[editChapter]>> INVALID_CHAPTER_TYPE[1]";
        const o = await n.update(
          i.id,
          {
            ...r,
            updatedAt: ce()
          }
        ), l = {
          ...o,
          content: {
            title: o.contentTitle ?? null,
            blocks: Array.isArray(o.blocks) ? o.blocks : []
          }
        };
        return Reflect.deleteProperty(l, "blocks"), l;
      } else throw "[editChapter]>> NOT_FOUND [2]";
    } else throw "[editChapter]>> INTERNAL_ERROR[3]";
  } catch (r) {
    throw console.error(r), r;
  }
}
async function Rl(e, t) {
  try {
    if (!e) throw new Error("[deleteChapter]>> INVALID_INPUT");
    if (!(t != null && t.token)) throw new Error("[deleteChapter]>> 401 UNAUTHORIZE");
    await Y(t.token, { refresh: !0 });
    const r = new Ce();
    if (e.pathName)
      await r.deleteOneByPathName(e.pathName);
    else return e.chapterId ? "success" : "failed";
    return "success";
  } catch (r) {
    return console.error(r), "failed";
  }
}
async function Nl(e, t) {
  try {
    if (!e) throw new Error("[deleteChapter]>> INVALID_INPUT");
    if (!(t != null && t.token)) throw new Error("[deleteChapter]>> 401 UNAUTHORIZE");
    await Y(t.token, { refresh: !0 });
    const r = new tt();
    if (e.fullpath)
      await r.deleteOneByFullpath(e.fullpath);
    else
      return "failed";
    return "success";
  } catch (r) {
    return console.error(r), "failed";
  }
}
async function gl(e, t) {
  try {
    if (!(t != null && t.token)) throw new Error("[getChapterBlocks]>> 401 UNAUTHORIZE");
    return await Y(t.token, { refresh: !0 }), await new rt().getAllForChapter(e.chapterId);
  } catch (r) {
    throw console.error(r), r;
  }
}
async function Al(e, t) {
  try {
    if (!(t != null && t.token)) throw new Error("[getSubChapterBlocks]>> 401 UNAUTHORIZE");
    return await Y(t.token, { refresh: !0 }), await new rt().getAllForSubChapter(e.chapterId);
  } catch (r) {
    throw console.error(r), r;
  }
}
async function Ml(e, t) {
  try {
    if (!e || !e.pathName || !e.title)
      throw new Error("[createChapterBlock]>> INVALID_INPUT");
    if (!(t != null && t.token)) throw new Error("[createChapterBlock]>> 401 UNAUTHORIZE");
    await Y(t.token, { refresh: !0 });
    const r = new rt(), s = new Ce(), a = new tt();
    if (!e.fullpath && e.pathName) {
      const n = await s.findByPathName(e.pathName, { select: ["id"] });
      if (!n || !n.id) throw new Error("[createChapterBlock]>> NOT_FOUND [1]");
      return await r.createForChapter({
        chapterId: n.id,
        subChapterId: null,
        title: e.title
      });
    } else if (e.fullpath && e.pathName) {
      const n = await a.findByFullpath(e.fullpath, { select: ["id"] });
      if (!n || !n.id) throw new Error("[createChapterBlock]>> NOT_FOUND [2]");
      return await r.createForChapter({
        chapterId: null,
        subChapterId: n.id,
        title: e.title
      });
    } else
      throw new Error("[createChapterBlock]>> INTERNAL_ERROR");
  } catch (r) {
    throw console.error(r), r;
  }
}
async function Fl(e, t) {
  try {
    if (!e || !e.pathName || !e.block)
      throw new Error("[editChapterBlock]>> INVALID_INPUT");
    if (!(t != null && t.token)) throw new Error("[editChapterBlock]>> 401 UNAUTHORIZE");
    return await Y(t.token, { refresh: !0 }), await new rt().update(e.block.id, {
      ...e.block,
      updatedAt: ce()
    });
  } catch (r) {
    throw console.error(r), r;
  }
}
async function Il(e, t) {
  try {
    if (!e || !e.pathName)
      throw new Error("[deleteChapterBlock]>> INVALID_INPUT");
    if (!(t != null && t.token)) throw new Error("[deleteChapterBlock]>> 401 UNAUTHORIZE");
    return await Y(t.token, { refresh: !0 }), await new rt().deleteOne(e.blockId);
  } catch (r) {
    throw console.error(r), r;
  }
}
async function wr(e, t) {
  try {
    let r = !0;
    await ue.instance().initOnUser(t, { migrate: !0 }) || (r = !1), await Sl(t) || (r = !1), e || console.debug("[prepareUserStore]>> win is null", e);
  } catch (r) {
    throw console.error("[prepareUserStore]>> ", r), q(e), r;
  }
}
function Yl() {
  const e = J.getInstance(), { USER_PRAGMA_KEY: t, USER_PRAGMA_SALT: r, USER_TOKEN: s } = g;
  return !(!e.get(t) || !e.get(s) || !e.get(r));
}
const Be = J.getInstance(), Pl = "users.json", Cl = {
  directory: "appData",
  encoding: "utf-8",
  filename: Pl,
  format: "json"
};
async function Ul(e) {
  try {
    const t = await ht(Cl);
    if (e && e.page && e.perPage) {
      const r = e.perPage * e.page, s = r - e.perPage;
      return t.slice(s, r);
    } else return t;
  } catch (t) {
    throw console.error(t), t;
  }
}
async function Ll(e) {
  if (!e) throw new Error("user - обязательный аргумент");
  try {
    if (typeof e.id != "number" || e.id !== e.id)
      throw new TypeError("[initUserDir]>> ID пользователя неверный");
    const t = `user_${e.username}`;
    return await Sr(t) === !1 ? (await ua(t), await Sr(t) ? (await wr(null, e.username), !0) : !1) : !1;
  } catch (t) {
    throw t;
  }
}
async function xl(e, t) {
  try {
    if (!t.password || !t.username) throw "[createUser]>> INVALID_USER_DATA";
    const r = new yr();
    if (await r.findByUsername({ username: t.username }))
      throw "[createUser]>> CONSTRAINT_VIOLATE_UNIQUE";
    const a = ce(), n = await Ur(t.password), i = await ut(t.username, t.password), { salt: o, value: l } = await St(i);
    Be.set(
      g.USER_PRAGMA_KEY,
      l,
      T.USER_PRAGMA_KEY_TTL,
      () => q(e)
    ), Be.set(
      g.USER_PRAGMA_SALT,
      o,
      T.USER_PRAGMA_KEY_TTL
    );
    const c = await r.create({
      username: t.username,
      password: n,
      avatar: null,
      createdAt: a,
      updatedAt: a
    });
    if (!await Ll(c))
      throw new Error(`[createUser]>> directory for user ${c.id} was not created!`);
    return c;
  } catch (r) {
    throw console.error(r), r;
  }
}
async function Wl(e) {
  try {
    if (e.newPassword === e.oldPassword || !e.username) throw "[updatePassword]>> INVALID_DATA";
    const t = new yr(), r = await t.findByUsername({ username: e.username });
    if (!r)
      throw "[updatePassword]>> NOT_EXISTS_RECORD";
    if (!await Lr(e.oldPassword, r.password))
      throw "[updatePassword]>> INVALID_CREDENTIALS";
    let s = await ut(e.username, e.oldPassword), a = await ut(e.username, e.newPassword);
    const { salt: n, value: i } = await St(s);
    Be.set(
      g.USER_PRAGMA_KEY,
      i,
      T.USER_PRAGMA_KEY_TTL,
      () => q(win)
    ), Be.set(
      g.USER_PRAGMA_SALT,
      n,
      T.USER_PRAGMA_KEY_TTL
    ), await ue.instance().rekeyAllUserDataBases(e.username, a), s = "", a = "", Be.cleanup();
    const o = await Ur(e.newPassword);
    return await t.updatePassword({
      username: e.username,
      password: o
    }), !0;
  } catch (t) {
    throw console.error(t), t;
  }
}
const gr = J.getInstance();
async function Vl(e) {
  try {
    if (!(e != null && e.token))
      throw q(win), "[validateAccessToken]>> INVALID_DATA";
    return !!await Y(e.token, { refresh: !0 });
  } catch (t) {
    return console.error(t), !1;
  }
}
async function Hl(e, t) {
  try {
    if (!t.password || !t.username) throw "[loginUser]>> INVALID_USER_DATA";
    const s = await new yr().findByUsername({ username: t.username });
    if (!s)
      throw "[loginUser]>> NOT_EXISTS_RECORD";
    if (await Lr(t.password, s.password).catch((n) => {
      console.log("[loginUser]>> INTERNAL_ERROR", n);
    }) === !0) {
      const n = { ...s };
      Reflect.deleteProperty(n, "hash_salt"), Reflect.deleteProperty(n, "password");
      const i = await ut(t.username, t.password), { salt: o, value: l } = await St(i);
      gr.set(
        g.USER_PRAGMA_KEY,
        l,
        T.USER_PRAGMA_KEY_TTL,
        () => q(e)
      ), gr.set(
        g.USER_PRAGMA_SALT,
        o,
        T.USER_PRAGMA_KEY_TTL
      );
      const c = await Vr({
        userId: n.id,
        username: n.username
      }, { m: Re });
      return await wr(e, t.username), {
        token: c,
        user: n
      };
    } else
      throw "[loginUser]>> INVALID_CREDENTIALS";
  } catch (r) {
    throw console.error(r), r;
  }
}
const Is = ye.dirname(xs(import.meta.url));
process.env.APP_ROOT = ye.join(Is, "..");
const $t = process.env.VITE_DEV_SERVER_URL, ec = ye.join(process.env.APP_ROOT, "dist-electron"), Ys = ye.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = $t ? ye.join(process.env.APP_ROOT, "public") : Ys;
let ae;
function Ps() {
  ae = new Mr({
    icon: ye.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: ye.join(Is, "preload.mjs")
    },
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#2f3241",
      symbolColor: "#74b1be",
      height: 20
    }
    // expose window controls in Windows/Linux
    // ...(process.platform !== 'darwin' ? { titleBarOverlay: true } : {})
  }), ae.webContents.on("did-finish-load", async () => {
  }), $t ? ae.loadURL($t) : ae.loadFile(ye.join(Ys, "index.html"));
}
oe.on("window-all-closed", () => {
  process.platform !== "darwin" && (oe.quit(), ae = null);
});
oe.on("activate", () => {
  Mr.getAllWindows().length === 0 && Ps();
});
oe.whenReady().then(async () => {
  if (J.getInstance(), !await ue.instance().initOnApp({ migrate: !0 })) throw new Error("DATABASE MANAGER WAS NOT INITIALIZED");
  console.debug("APPLICATION DATABASES ARE READY"), Ps(), globalThis.win = ae, R.handle("check-access", async (t) => Yl()), R.handle("validate-access-token", async (t, r) => await Vl(r)), R.handle("prepare-user-store", async (t, r) => {
    const { payload: { username: s } } = await Y(r.token, { refresh: !1 });
    return await wr(ae, s);
  }), R.handle("get-users", async (t, r) => await Ul(r)), R.handle("create-user", async (t, r) => await xl(ae, r)), R.handle("login-user", async (t, r) => await Hl(ae, r)), R.handle("update-password", async (t, r) => await Wl(r)), R.handle("create-chapter", async (t, r, s) => await El(r, s)), R.handle("get-menu-chapters", async (t, r, s) => await Tl(r, s)), R.handle("get-one-chapter", async (t, r, s) => await kl(r, s)), R.handle("create-sub-chapter", async (t, r, s) => await Dl(r, s)), R.handle("sync-materials", async (t, r) => await bl(r)), R.handle("get-one-sub-chapter", async (t, r, s) => await Ol(r, s)), R.handle("edit-chapter", async (t, r, s) => await vl(r, s)), R.handle("delete-chapter", async (t, r, s) => await Rl(r, s)), R.handle("delete-sub-chapter", async (t, r, s) => await Nl(r, s)), R.handle("get-chapter-blocks", async (t, r, s) => await gl(r, s)), R.handle("get-sub-chapter-blocks", async (t, r, s) => await Al(r, s)), R.handle("create-chapter-block", async (t, r, s) => await Ml(r, s)), R.handle("edit-chapter-block", async (t, r, s) => await Fl(r, s)), R.handle("delete-chapter-block", async (t, r, s) => await Il(r, s));
});
export {
  ec as MAIN_DIST,
  Ys as RENDERER_DIST,
  $t as VITE_DEV_SERVER_URL
};
