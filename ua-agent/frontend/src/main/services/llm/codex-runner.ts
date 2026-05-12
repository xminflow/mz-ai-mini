import { execFile, spawn, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";

import { BrowserWindow } from "electron";
import log from "electron-log/main";

import type { ProviderRunFinal, ProviderStreamEvent } from "./provider";
import { getSettingsSync } from "../settings/store";

const execFileAsync = promisify(execFile);

function codexBin(): string {
  const override = getSettingsSync().llm.codex.binPath?.trim();
  return override && override.length > 0 ? override : "codex";
}

function useShell(): boolean {
  return process.platform === "win32";
}

function networkEnv(): Record<string, string> {
  const { network } = getSettingsSync();
  const env: Record<string, string> = {};
  if (network.httpsProxy) env.HTTPS_PROXY = network.httpsProxy;
  if (network.httpProxy) env.HTTP_PROXY = network.httpProxy;
  if (network.noProxy) env.NO_PROXY = network.noProxy;
  return env;
}

let codexCache: { available: boolean; version?: string } | null = null;

export function resetCodexCache(): void {
  codexCache = null;
}

export async function detectCodex(
  force = false,
): Promise<{ available: boolean; version?: string }> {
  if (codexCache && !force) return codexCache;
  try {
    const { stdout } = await execFileAsync(codexBin(), ["--version"], {
      windowsHide: true,
      shell: useShell(),
    });
    codexCache = { available: true, version: stdout.trim() };
  } catch (err) {
    codexCache = { available: false };
    log.warn("[codex-runner] detect failed", String(err));
  }
  log.info("[codex-runner] cli detected", {
    available: codexCache.available,
    version: codexCache.version,
  });
  return codexCache;
}

const runningProcs = new Map<string, ChildProcess>();

export interface CodexRunOptions {
  runId: string;
  prompt: string;
  cwd: string;
  env?: Record<string, string>;
  resumeSessionId?: string;
  onChunk?: (kind: "stdout" | "stderr", data: string) => void;
  onSessionId?: (sessionId: string) => void;
  onStreamEvent?: (evt: ProviderStreamEvent) => void;
  onClose?: (code: number | null, final: ProviderRunFinal) => void;
}

interface CodexJsonMessage {
  type?: string;
  id?: string;
  thread_id?: string;
  session_id?: string;
  delta?: string;
  text?: string;
  message?: string;
  last_agent_message?: string;
  error?: unknown;
  item?: Record<string, unknown>;
}

const RESUME_FAIL_PATTERNS = [
  /no such session/i,
  /session .* not found/i,
  /could not (?:find|resume)/i,
  /invalid session/i,
];

const IGNORED_STDERR_PATTERNS = [
  /failed to clean up stale arg0 temp dirs/i,
  /proceeding, even though we could not update PATH/i,
];

function looksLikeResumeFailure(text: string): boolean {
  if (!text) return false;
  return RESUME_FAIL_PATTERNS.some((re) => re.test(text));
}

function shouldIgnoreStderr(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  return IGNORED_STDERR_PATTERNS.some((re) => re.test(trimmed));
}

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function pickItemText(item: Record<string, unknown>): string {
  const directKeys = [
    "text",
    "message",
    "summary",
    "reasoning",
    "output",
    "stdout",
    "stderr",
  ];
  for (const key of directKeys) {
    const value = stringField(item[key]);
    if (value) return value;
  }
  const content = item["content"];
  if (Array.isArray(content)) {
    const parts = content
      .map((part) => {
        if (!part || typeof part !== "object") return null;
        return stringField((part as Record<string, unknown>)["text"]);
      })
      .filter((part): part is string => part !== null);
    if (parts.length > 0) return parts.join("");
  }
  return "";
}

function toolNameFromItem(item: Record<string, unknown>): string {
  return (
    stringField(item["name"]) ??
    stringField(item["tool_name"]) ??
    stringField(item["kind"]) ??
    stringField(item["type"]) ??
    "tool"
  );
}

function toolInputFromItem(item: Record<string, unknown>): unknown {
  return (
    item["input"] ??
    item["arguments"] ??
    item["params"] ??
    item["command"] ??
    {}
  );
}

function toolResultFromItem(item: Record<string, unknown>): string {
  const text = pickItemText(item);
  if (text) return text;
  const result = item["result"];
  if (typeof result === "string") return result;
  if (result !== undefined) return JSON.stringify(result);
  return "";
}

function extractErrorMessage(msg: CodexJsonMessage): string | null {
  if (typeof msg.error === "string") return msg.error;
  if (msg.error && typeof msg.error === "object") {
    const message = stringField((msg.error as Record<string, unknown>)["message"]);
    if (message) return message;
  }
  return stringField(msg.message);
}

export function buildCodexExecArgs(opts: {
  cwd: string;
  resumeSessionId?: string;
}): string[] {
  const args = [
    "--cd",
    opts.cwd,
    "--dangerously-bypass-approvals-and-sandbox",
    "exec",
    "--json",
    "--skip-git-repo-check",
    "--color",
    "never",
  ];
  if (opts.resumeSessionId) {
    args.push("resume", opts.resumeSessionId);
  }
  args.push("-");
  return args;
}

export async function runCodexStreaming(
  opts: CodexRunOptions,
  win: BrowserWindow,
): Promise<void> {
  const detected = await detectCodex();
  if (!detected.available) {
    throw new Error(
      "codex CLI 未检测到。请先安装 Codex CLI 并确保 `codex --version` 能在命令行执行。",
    );
  }

  const netEnv = networkEnv();
  const args = buildCodexExecArgs({
    cwd: opts.cwd,
    ...(opts.resumeSessionId ? { resumeSessionId: opts.resumeSessionId } : {}),
  });

  log.info("[codex-runner] spawn", {
    runId: opts.runId,
    cwd: opts.cwd,
    bin: codexBin(),
    args,
    proxy: netEnv.HTTPS_PROXY ?? netEnv.HTTP_PROXY ?? null,
  });

  const child = spawn(codexBin(), args, {
    cwd: opts.cwd,
    env: { ...process.env, ...netEnv, ...(opts.env ?? {}) },
    windowsHide: true,
    shell: useShell(),
  });
  runningProcs.set(opts.runId, child);

  if (child.stdin) {
    child.stdin.end(opts.prompt);
  }

  let stdoutBuf = "";
  let stderrBuf = "";
  let resultText = "";
  let resultErr: string | null = null;
  let capturedSessionId: string | null = null;
  let resumeFailed = false;
  const startedToolUseIds = new Set<string>();

  const emitStdout = (data: string): void => {
    if (!data) return;
    opts.onChunk?.("stdout", data);
  };
  const emitStderr = (data: string): void => {
    if (!data || shouldIgnoreStderr(data)) return;
    opts.onChunk?.("stderr", data);
  };
  const emitStreamEvent = (evt: ProviderStreamEvent): void => {
    opts.onStreamEvent?.(evt);
  };
  const rememberToolStart = (id: string, name: string, input: unknown): void => {
    if (startedToolUseIds.has(id)) return;
    startedToolUseIds.add(id);
    emitStreamEvent({ type: "tool-use", id, name, input });
  };

  const processLine = (line: string): void => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const msg = JSON.parse(trimmed) as CodexJsonMessage;
      if (msg.type === "thread.started") {
        const sessionId = msg.thread_id ?? msg.session_id ?? msg.id ?? null;
        if (sessionId) {
          capturedSessionId = sessionId;
          opts.onSessionId?.(sessionId);
        }
        return;
      }
      if (msg.type === "agent_message_delta") {
        const text = msg.delta ?? msg.text ?? "";
        if (text) {
          resultText += text;
          emitStreamEvent({ type: "text", text });
          emitStdout(text);
        }
        return;
      }
      if (msg.type === "agent_message") {
        const text = msg.text ?? msg.message ?? msg.last_agent_message ?? "";
        if (text) {
          resultText = text;
          emitStreamEvent({ type: "text", text });
          emitStdout(text);
        }
        return;
      }
      if (msg.type === "item.started" || msg.type === "item.completed") {
        const item = msg.item;
        if (!item) return;
        const itemId = stringField(item["id"]) ?? `${msg.type}:${toolNameFromItem(item)}`;
        const itemType = stringField(item["type"]) ?? "item";
        if (itemType === "agent_message") {
          const text = pickItemText(item);
          if (text) {
            resultText = text;
            emitStreamEvent({ type: "text", text });
            emitStdout(text);
          }
          return;
        }
        if (itemType === "reasoning") {
          const text = pickItemText(item);
          if (text) emitStreamEvent({ type: "thinking", text });
          return;
        }

        const name = toolNameFromItem(item);
        if (msg.type === "item.started") {
          rememberToolStart(itemId, name, toolInputFromItem(item));
          return;
        }

        rememberToolStart(itemId, name, toolInputFromItem(item));
        emitStreamEvent({
          type: "tool-result",
          toolUseId: itemId,
          content: toolResultFromItem(item),
          ...(item["status"] === "failed" ? { isError: true } : {}),
        });
        return;
      }
      if (msg.type === "task_complete") {
        const last = msg.last_agent_message ?? "";
        if (last) resultText = last;
        const errMessage = extractErrorMessage(msg);
        if (errMessage) {
          resultErr = errMessage;
          if (opts.resumeSessionId && looksLikeResumeFailure(errMessage)) {
            resumeFailed = true;
          }
        }
        return;
      }
      if (msg.type === "error") {
        const errMessage = extractErrorMessage(msg) ?? "codex CLI returned error";
        resultErr = errMessage;
        if (opts.resumeSessionId && looksLikeResumeFailure(errMessage)) {
          resumeFailed = true;
        }
        emitStderr(errMessage);
        return;
      }
    } catch {
      if (opts.resumeSessionId && looksLikeResumeFailure(trimmed)) resumeFailed = true;
      emitStderr(line.endsWith("\n") ? line : `${line}\n`);
    }
  };

  child.stdout?.setEncoding("utf8");
  child.stdout?.on("data", (chunk: string) => {
    stdoutBuf += chunk;
    let idx: number;
    while ((idx = stdoutBuf.indexOf("\n")) !== -1) {
      const line = stdoutBuf.slice(0, idx);
      stdoutBuf = stdoutBuf.slice(idx + 1);
      processLine(line);
    }
  });

  child.stderr?.setEncoding("utf8");
  child.stderr?.on("data", (chunk: string) => {
    stderrBuf += chunk;
    let idx: number;
    while ((idx = stderrBuf.indexOf("\n")) !== -1) {
      const line = stderrBuf.slice(0, idx);
      stderrBuf = stderrBuf.slice(idx + 1);
      if (opts.resumeSessionId && looksLikeResumeFailure(line)) resumeFailed = true;
      emitStderr(line.endsWith("\n") ? line : `${line}\n`);
    }
  });

  let spawnErr: Error | null = null;
  child.on("error", (err) => {
    spawnErr = err;
    emitStderr(String(err));
    log.error("[codex-runner] spawn error", { runId: opts.runId, err: String(err) });
  });

  const exitCode: number | null = await new Promise<number | null>((resolve) => {
    child.on("close", (code) => {
      if (stdoutBuf.length > 0) {
        processLine(stdoutBuf);
        stdoutBuf = "";
      }
      if (stderrBuf.length > 0) {
        emitStderr(stderrBuf);
        stderrBuf = "";
      }
      runningProcs.delete(opts.runId);
      resolve(code);
    });
  });

  const finalCode = spawnErr ? null : exitCode;
  opts.onClose?.(finalCode, {
    resultText,
    resultError: resultErr,
    sessionId: capturedSessionId,
    resumeFailed,
  });
  void win;
}

export function cancelCodex(runId: string): boolean {
  const child = runningProcs.get(runId);
  if (!child) return false;
  try {
    child.kill("SIGTERM");
  } catch (err) {
    log.warn("[codex-runner] cancel failed", { runId, err: String(err) });
  }
  runningProcs.delete(runId);
  return true;
}
