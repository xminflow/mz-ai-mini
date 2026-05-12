import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { BrowserWindow, ipcMain } from "electron";
import log from "electron-log/main";

import {
  AI_CHAT_EVENT_TOPIC,
  aiChatSendInputSchema,
  type AiChatEvent,
  type AiChatMessage,
  type AiChatSnapshot,
  type AiChatToolTrace,
} from "../../shared/contracts/ai-chat";
import { SCHEMA_VERSION, type ErrorCode, type ErrorEnvelope } from "../../shared/contracts/error";
import { getProvider, type ProviderId, type ProviderRunFinal, type ProviderStreamEvent } from "../services/llm/provider";
import { defaultLlmWorkspace } from "../services/llm/workspace";
import {
  clearAiChatSnapshot,
  loadAiChatSnapshot,
  saveAiChatSnapshot,
} from "../services/llm/ai-chat-store";
import { getSettingsSync } from "../services/settings/store";

const CHANNEL_STATE = "ai-chat:get-state";
const CHANNEL_SEND = "ai-chat:send";
const CHANNEL_CANCEL = "ai-chat:cancel";
const CHANNEL_RESET = "ai-chat:reset";

interface InflightRun {
  runId: string;
  providerId: ProviderId;
}

const inflightRuns = new Map<string, InflightRun>();

function nowIso(): string {
  return new Date().toISOString();
}

function errorEnvelope(code: ErrorCode, message: string): ErrorEnvelope {
  return {
    schema_version: SCHEMA_VERSION,
    ok: false,
    error: {
      code,
      message: message.length > 1024 ? `${message.slice(0, 1021)}...` : message,
    },
  };
}

function configuredProvider(): ProviderId {
  return getSettingsSync().llm.provider;
}

function configuredWorkspace(): string {
  return defaultLlmWorkspace();
}

function workspaceValid(workspacePath: string): boolean {
  try {
    return fs.existsSync(workspacePath) && fs.statSync(workspacePath).isDirectory();
  } catch {
    return false;
  }
}

function createEmptySnapshot(provider: ProviderId, workspacePath: string): AiChatSnapshot {
  return {
    provider,
    workspace_path: workspacePath,
    session_id: null,
    run_status: "idle",
    messages: [],
    last_error: null,
    updated_at: nowIso(),
  };
}

async function loadSnapshot(provider: ProviderId, workspacePath: string): Promise<AiChatSnapshot> {
  const persisted = await loadAiChatSnapshot(workspacePath, provider);
  if (persisted) {
    return {
      ...persisted,
      provider,
      workspace_path: workspacePath,
      run_status: "idle",
    };
  }
  return createEmptySnapshot(provider, workspacePath);
}

function emitEvent(event: AiChatEvent): void {
  for (const bw of BrowserWindow.getAllWindows()) {
    try {
      bw.webContents.send(AI_CHAT_EVENT_TOPIC, event);
    } catch (err) {
      log.warn(
        `[ai-chat] emit failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

async function currentSnapshot(): Promise<{
  provider: ProviderId;
  workspacePath: string;
  workspaceOk: boolean;
  snapshot: AiChatSnapshot;
}> {
  const provider = configuredProvider();
  const workspacePath = configuredWorkspace();
  const snapshot = await loadSnapshot(provider, workspacePath);
  return {
    provider,
    workspacePath,
    workspaceOk: workspaceValid(workspacePath),
    snapshot,
  };
}

function ensureAssistantMessage(snapshot: AiChatSnapshot): AiChatMessage {
  const last = snapshot.messages[snapshot.messages.length - 1];
  if (last && last.role === "assistant") return last;
  const next: AiChatMessage = {
    id: randomUUID(),
    role: "assistant",
    content: "",
    created_at: nowIso(),
    tool_traces: [],
  };
  snapshot.messages.push(next);
  return next;
}

function updateAssistantMessage(
  snapshot: AiChatSnapshot,
  updater: (message: AiChatMessage) => void,
): AiChatMessage {
  const msg = ensureAssistantMessage(snapshot);
  updater(msg);
  snapshot.updated_at = nowIso();
  return msg;
}

function applyToolEvent(
  message: AiChatMessage,
  evt: ProviderStreamEvent,
): AiChatToolTrace | null {
  if (evt.type === "tool-use") {
    const trace: AiChatToolTrace = {
      id: evt.id,
      name: evt.name,
      input: evt.input,
      content: "",
      is_error: false,
      started_at: nowIso(),
      ended_at: null,
    };
    message.tool_traces.push(trace);
    return trace;
  }
  if (evt.type === "tool-result") {
    const existing = message.tool_traces.find((item) => item.id === evt.toolUseId);
    if (!existing) {
      const trace: AiChatToolTrace = {
        id: evt.toolUseId,
        name: "tool",
        input: {},
        content: evt.content,
        is_error: evt.isError === true,
        started_at: nowIso(),
        ended_at: nowIso(),
      };
      message.tool_traces.push(trace);
      return trace;
    }
    existing.content = evt.content;
    existing.is_error = evt.isError === true;
    existing.ended_at = nowIso();
    return existing;
  }
  return null;
}

async function runProviderTurn(
  win: BrowserWindow,
  snapshot: AiChatSnapshot,
  prompt: string,
): Promise<ProviderRunFinal & { code: number | null }> {
  const provider = getProvider(snapshot.provider);
  if (provider === null) {
    throw new Error("LLM_NOT_CONFIGURED: current provider is not registered");
  }
  const runId = randomUUID();
  inflightRuns.set(win.webContents.id.toString(), {
    runId,
    providerId: snapshot.provider,
  });
  try {
    return await new Promise((resolve, reject) => {
      provider
        .run(
          {
            runId,
            prompt,
            cwd: snapshot.workspace_path,
            ...(snapshot.session_id ? { resumeSessionId: snapshot.session_id } : {}),
            onSessionId: (sessionId) => {
              snapshot.session_id = sessionId;
            },
            onStreamEvent: (evt) => {
              if (evt.type === "text") {
                const msg = updateAssistantMessage(snapshot, (message) => {
                  message.content += evt.text;
                });
                emitEvent({
                  schema_version: SCHEMA_VERSION,
                  phase: "message-delta",
                  provider: snapshot.provider,
                  workspace_path: snapshot.workspace_path,
                  message_id: msg.id,
                  text: evt.text,
                });
                return;
              }
              if (evt.type === "thinking") {
                emitEvent({
                  schema_version: SCHEMA_VERSION,
                  phase: "thinking",
                  provider: snapshot.provider,
                  workspace_path: snapshot.workspace_path,
                  text: evt.text,
                });
                return;
              }
              const msg = updateAssistantMessage(snapshot, () => {});
              const trace = applyToolEvent(msg, evt);
              if (trace === null) return;
              emitEvent({
                schema_version: SCHEMA_VERSION,
                phase: evt.type === "tool-use" ? "tool-started" : "tool-ended",
                provider: snapshot.provider,
                workspace_path: snapshot.workspace_path,
                message_id: msg.id,
                trace,
              });
            },
            onClose: (code, final) => resolve({ code, ...final }),
          },
          win,
        )
        .catch(reject);
    });
  } finally {
    inflightRuns.delete(win.webContents.id.toString());
  }
}

async function executeTurn(
  win: BrowserWindow,
  prompt: string,
  snapshot: AiChatSnapshot,
): Promise<AiChatSnapshot> {
  snapshot.messages.push({
    id: randomUUID(),
    role: "user",
    content: prompt,
    created_at: nowIso(),
    tool_traces: [],
  });
  snapshot.run_status = "running";
  snapshot.last_error = null;
  snapshot.updated_at = nowIso();
  await saveAiChatSnapshot(snapshot);
  emitEvent({
    schema_version: SCHEMA_VERSION,
    phase: "run-started",
    provider: snapshot.provider,
    workspace_path: snapshot.workspace_path,
    snapshot,
  });

  let final = await runProviderTurn(win, snapshot, prompt);
  if (final.resumeFailed) {
    snapshot.session_id = null;
    snapshot.run_status = "running";
    const lastAssistant = snapshot.messages[snapshot.messages.length - 1];
    if (lastAssistant?.role === "assistant" && lastAssistant.content.length === 0) {
      snapshot.messages.pop();
    }
    final = await runProviderTurn(win, snapshot, prompt);
  }

  snapshot.run_status = "idle";
  snapshot.updated_at = nowIso();
  snapshot.last_error =
    final.resultError ?? (final.code !== 0 ? `provider exited with code ${final.code ?? "?"}` : null);

  if (snapshot.last_error && snapshot.messages.at(-1)?.role === "assistant") {
    const last = snapshot.messages.at(-1);
    if (last && last.content.trim().length === 0) {
      last.content = snapshot.last_error;
    }
  }

  await saveAiChatSnapshot(snapshot);
  emitEvent({
    schema_version: SCHEMA_VERSION,
    phase: "run-ended",
    provider: snapshot.provider,
    workspace_path: snapshot.workspace_path,
    snapshot,
  });
  return snapshot;
}

export function registerAiChatHandlers(): void {
  ipcMain.handle(CHANNEL_STATE, async () => {
    const { provider, workspacePath, workspaceOk, snapshot } = await currentSnapshot();
    emitEvent({
      schema_version: SCHEMA_VERSION,
      phase: "hydrated",
      provider,
      workspace_path: workspacePath,
      snapshot,
      workspace_valid: workspaceOk,
    });
    return {
      schema_version: SCHEMA_VERSION,
      ok: true,
      provider,
      workspace_path: workspacePath,
      workspace_valid: workspaceOk,
      snapshot,
    };
  });

  ipcMain.handle(CHANNEL_SEND, async (event, rawArgs: unknown) => {
    const parsed = aiChatSendInputSchema.safeParse(rawArgs);
    if (!parsed.success) {
      return errorEnvelope(
        "INVALID_INPUT",
        parsed.error.issues[0]?.message ?? "invalid chat prompt",
      );
    }
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win === null) {
      return errorEnvelope("INTERNAL", "window not found");
    }
    const { snapshot } = await currentSnapshot();
    if (inflightRuns.has(win.webContents.id.toString()) || snapshot.run_status === "running") {
      return errorEnvelope("ANALYZE_BUSY", "ai chat is already running");
    }
    void executeTurn(win, parsed.data.prompt, snapshot).catch((err) => {
      log.error(`[ai-chat] send failed: ${err instanceof Error ? err.message : String(err)}`);
    });
    return {
      schema_version: SCHEMA_VERSION,
      ok: true,
      accepted: true,
    };
  });

  ipcMain.handle(CHANNEL_CANCEL, async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win === null) return errorEnvelope("INTERNAL", "window not found");
    const inflight = inflightRuns.get(win.webContents.id.toString());
    if (!inflight) {
      return {
        schema_version: SCHEMA_VERSION,
        ok: true,
        cancelled: false,
      };
    }
    const cancelled = getProvider(inflight.providerId)?.cancel(inflight.runId) ?? false;
    return {
      schema_version: SCHEMA_VERSION,
      ok: true,
      cancelled,
    };
  });

  ipcMain.handle(CHANNEL_RESET, async () => {
    const provider = configuredProvider();
    const workspacePath = configuredWorkspace();
    await clearAiChatSnapshot(workspacePath, provider);
    const snapshot = createEmptySnapshot(provider, workspacePath);
    await saveAiChatSnapshot(snapshot);
    emitEvent({
      schema_version: SCHEMA_VERSION,
      phase: "reset",
      provider,
      workspace_path: workspacePath,
      snapshot,
    });
    return {
      schema_version: SCHEMA_VERSION,
      ok: true,
      snapshot,
    };
  });

}

export function unregisterAiChatHandlers(): void {
  ipcMain.removeHandler(CHANNEL_STATE);
  ipcMain.removeHandler(CHANNEL_SEND);
  ipcMain.removeHandler(CHANNEL_CANCEL);
  ipcMain.removeHandler(CHANNEL_RESET);
}
