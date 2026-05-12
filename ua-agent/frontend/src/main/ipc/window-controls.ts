import { BrowserWindow, ipcMain } from "electron";

const MINIMIZE_CHANNEL = "window:minimize";
const MAXIMIZE_CHANNEL = "window:maximize";
const CLOSE_CHANNEL = "window:close";

export function registerWindowControlHandlers(): void {
  ipcMain.on(MINIMIZE_CHANNEL, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });

  ipcMain.on(MAXIMIZE_CHANNEL, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return;
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });

  ipcMain.on(CLOSE_CHANNEL, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });
}

export function unregisterWindowControlHandlers(): void {
  ipcMain.removeAllListeners(MINIMIZE_CHANNEL);
  ipcMain.removeAllListeners(MAXIMIZE_CHANNEL);
  ipcMain.removeAllListeners(CLOSE_CHANNEL);
}
