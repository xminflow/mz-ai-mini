import os from "node:os";
import path from "node:path";

const APP_NAME = "ua-agent";

export function userDataDir(): string {
  if (process.platform === "win32") {
    const appData = process.env["APPDATA"] ?? path.join(os.homedir(), "AppData", "Roaming");
    return path.join(appData, APP_NAME);
  }
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Application Support", APP_NAME);
  }
  const xdg = process.env["XDG_DATA_HOME"] ?? path.join(os.homedir(), ".local", "share");
  return path.join(xdg, APP_NAME);
}

export function libraryDbPath(): string {
  return path.join(userDataDir(), "library.db");
}

export function patchrightProfileDir(): string {
  return path.join(userDataDir(), "patchright-profile");
}

export function logsDir(): string {
  return path.join(userDataDir(), "logs");
}

export function keywordCrawlLogPath(): string {
  return path.join(logsDir(), "keyword-crawl.log");
}

export function asrModelDir(): string {
  return path.join(userDataDir(), "asr", "Fun-ASR-Nano-2512");
}
