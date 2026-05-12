import { app } from "electron";
import log from "electron-log/main";
import { promises as fs } from "node:fs";
import fsSync from "node:fs";
import path from "node:path";

import { DEFAULT_SCHEDULING, type SchedulingSettings } from "../../../shared/contracts/scheduling";
import type { ProviderId } from "../llm/provider";

export const SETTINGS_SCHEMA_VERSION = "1" as const;

export interface ClaudeCodeProviderSettings {
  binPath?: string;
  apiKey?: string;
  defaultCwd?: string;
}

export interface CodexProviderSettings {
  binPath?: string;
  apiKey?: string;
}

export interface KimiProviderSettings {
  binPath?: string;
}

export interface NetworkSettings {
  httpsProxy?: string;
  httpProxy?: string;
  noProxy?: string;
}

export type AppTheme = "light" | "dark" | "system";

export interface AppSettings {
  schema_version: typeof SETTINGS_SCHEMA_VERSION;
  llm: {
    provider: ProviderId;
    claudeCode: ClaudeCodeProviderSettings;
    codex: CodexProviderSettings;
    kimi: KimiProviderSettings;
  };
  network: NetworkSettings;
  theme: AppTheme;
  scheduling: SchedulingSettings;
}

export const DEFAULT_SETTINGS: AppSettings = Object.freeze({
  schema_version: SETTINGS_SCHEMA_VERSION,
  llm: {
    provider: "claude-code",
    claudeCode: {},
    codex: {},
    kimi: {},
  },
  network: {},
  theme: "system",
  scheduling: DEFAULT_SCHEDULING,
}) as unknown as AppSettings;

type Listener = (next: AppSettings) => void;

let cache: AppSettings | null = null;
let writePromise: Promise<void> = Promise.resolve();
const listeners = new Set<Listener>();

function configPath(): string {
  return path.join(app.getPath("userData"), "config.json");
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function mergeSettings(base: AppSettings, patch: DeepPartial<AppSettings>): AppSettings {
  return {
    schema_version: SETTINGS_SCHEMA_VERSION,
    llm: {
      provider: patch.llm?.provider ?? base.llm.provider,
      claudeCode: { ...base.llm.claudeCode, ...(patch.llm?.claudeCode ?? {}) },
      codex: { ...base.llm.codex, ...(patch.llm?.codex ?? {}) },
      kimi: { ...base.llm.kimi, ...(patch.llm?.kimi ?? {}) },
    },
    network: { ...base.network, ...(patch.network ?? {}) },
    theme: patch.theme ?? base.theme,
    scheduling: {
      douyin: { ...base.scheduling.douyin, ...(patch.scheduling?.douyin ?? {}) },
      xiaohongshu: { ...base.scheduling.xiaohongshu, ...(patch.scheduling?.xiaohongshu ?? {}) },
    },
  };
}

function normalize(parsed: unknown): AppSettings {
  if (!parsed || typeof parsed !== "object") return clone(DEFAULT_SETTINGS);
  const p = parsed as DeepPartial<AppSettings>;
  return mergeSettings(DEFAULT_SETTINGS, p);
}

async function readFromDisk(): Promise<AppSettings> {
  const file = configPath();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return normalize(parsed);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return clone(DEFAULT_SETTINGS);
    }
    log.warn(
      `[settings] failed to read ${file}: ${err instanceof Error ? err.message : String(err)} — falling back to defaults`,
    );
    return clone(DEFAULT_SETTINGS);
  }
}

async function writeToDisk(settings: AppSettings): Promise<void> {
  const file = configPath();
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(settings, null, 2), "utf8");
  await fs.rename(tmp, file);
}

export async function getSettings(): Promise<AppSettings> {
  if (cache) return clone(cache);
  cache = await readFromDisk();
  return clone(cache);
}

export function getSettingsSync(): AppSettings {
  if (cache) return clone(cache);
  const file = configPath();
  try {
    const raw = fsSync.readFileSync(file, "utf8");
    const parsed: unknown = JSON.parse(raw);
    cache = normalize(parsed);
    return clone(cache);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      log.warn(
        `[settings] failed to synchronously read ${file}: ${err instanceof Error ? err.message : String(err)} - falling back to defaults`,
      );
    }
    cache = clone(DEFAULT_SETTINGS);
    return clone(cache);
  }
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export async function updateSettings(patch: DeepPartial<AppSettings>): Promise<AppSettings> {
  const current = cache ?? (await readFromDisk());
  const next = mergeSettings(current, patch);
  cache = next;

  // Serialize writes so concurrent updates don't race.
  writePromise = writePromise.then(() => writeToDisk(next)).catch((err) => {
    log.error(
      `[settings] write failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  });
  await writePromise;

  for (const listener of listeners) {
    try {
      listener(clone(next));
    } catch (err) {
      log.warn(
        `[settings] listener threw: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return clone(next);
}

export function onSettingsChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Reset cache; useful for tests. */
export function __resetForTests(): void {
  cache = null;
  listeners.clear();
}
