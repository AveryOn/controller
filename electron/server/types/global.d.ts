import { BrowserWindow } from "electron";

export {}; // Чтобы сделать файл модулем

declare global {
  var win: BrowserWindow | null;
}