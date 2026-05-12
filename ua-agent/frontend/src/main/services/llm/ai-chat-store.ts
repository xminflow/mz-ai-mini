import { app } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { ProviderId } from "./provider";
import type { AiChatSnapshot } from "../../../shared/contracts/ai-chat";

interface PersistedState {
  schema_version: "1";
  snapshots: Record<string, AiChatSnapshot>;
}

const EMPTY_STATE: PersistedState = {
  schema_version: "1",
  snapshots: {},
};

let cache: PersistedState | null = null;
let writePromise: Promise<void> = Promise.resolve();

function storePath(): string {
  return path.join(app.getPath("userData"), "ai-chat-state.json");
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function snapshotKey(workspacePath: string, provider: ProviderId): string {
  return `${provider}::${workspacePath.trim().toLowerCase()}`;
}

async function readState(): Promise<PersistedState> {
  const file = storePath();
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (
      parsed &&
      parsed.schema_version === "1" &&
      parsed.snapshots &&
      typeof parsed.snapshots === "object"
    ) {
      return {
        schema_version: "1",
        snapshots: parsed.snapshots as Record<string, AiChatSnapshot>,
      };
    }
  } catch {
    // Ignore and fall back.
  }
  return clone(EMPTY_STATE);
}

async function persist(state: PersistedState): Promise<void> {
  const file = storePath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(state, null, 2), "utf8");
  await fs.rename(tmp, file);
}

async function getState(): Promise<PersistedState> {
  if (cache !== null) return clone(cache);
  cache = await readState();
  return clone(cache);
}

export async function loadAiChatSnapshot(
  workspacePath: string,
  provider: ProviderId,
): Promise<AiChatSnapshot | null> {
  const state = await getState();
  return clone(state.snapshots[snapshotKey(workspacePath, provider)] ?? null);
}

export async function saveAiChatSnapshot(snapshot: AiChatSnapshot): Promise<void> {
  const state = await getState();
  state.snapshots[snapshotKey(snapshot.workspace_path, snapshot.provider)] = clone(snapshot);
  cache = state;
  writePromise = writePromise.then(() => persist(state));
  await writePromise;
}

export async function clearAiChatSnapshot(
  workspacePath: string,
  provider: ProviderId,
): Promise<void> {
  const state = await getState();
  delete state.snapshots[snapshotKey(workspacePath, provider)];
  cache = state;
  writePromise = writePromise.then(() => persist(state));
  await writePromise;
}

export function __resetAiChatStoreForTests(): void {
  cache = null;
  writePromise = Promise.resolve();
}
