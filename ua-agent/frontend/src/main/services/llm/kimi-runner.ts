import { execFile, spawn, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";

import { BrowserWindow } from "electron";
import log from "electron-log/main";

import type { ProviderRunFinal, ProviderStreamEvent } from "./provider";
import { getSettingsSync } from "../settings/store";

const execFileAsync = promisify(execFile);

function kimiBin(): string {
  const override = getSettingsSync().llm.kimi.binPath?.trim();
  return override && override.length > 0 ? override : "kimi";
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

let kimiCache: { available: boolean; version?: string } | null = null;

export function resetKimiCache(): void {
  kimiCache = null;
}

export async function detectKimi(
  force = false,
): Promise<{ available: boolean; version?: string }> {
  if (kimiCache && !force) return kimiCache;
  try {
    const { stdout } = await execFileAsync(kimiBin(), ["--version"], {
      windowsHide: true,
      shell: useShell(),
    });
    kimiCache = { available: true, version: stdout.trim() };
  } catch (err) {
    kimiCache = { available: false };
    log.warn("[kimi-runner] detect failed", String(err));
  }
  log.info("[kimi-runner] cli detected", {
    available: kimiCache.available,
    version: kimiCache.version,
  });
  return kimiCache;
}

const runningProcs = new Map<string, ChildProcess>();

export interface KimiRunOptions {
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

interface KimiToolCall {
  id?: string;
  type?: string;
  function?: {
    name?: string;
    arguments?: string;
  };
}

interface KimiJsonMessage {
  role?: string;
  content?: unknown;
  tool_calls?: KimiToolCall[];
  tool_call_id?: string;
  session_id?: string;
  sessionId?: string;
  id?: string;
}

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  const parts = content
    .map((part) => {
      if (!part || typeof part !== "object") return null;
      const record = part as Record<string, unknown>;
      return stringField(record["text"]);
    })
    .filter((part): part is string => part !== null);
  return parts.join("");
}

function contentToResultText(content: unknown): string {
  const text = contentToText(content);
  if (text) return text;
  if (typeof content === "string") return content;
  if (content === undefined || content === null) return "";
  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}

function messageSessionId(msg: KimiJsonMessage): string | null {
  return stringField(msg.session_id) ?? stringField(msg.sessionId) ?? stringField(msg.id);
}

function toolCallName(call: KimiToolCall): string {
  return stringField(call.function?.name) ?? "tool";
}

function toolCallInput(call: KimiToolCall): unknown {
  const raw = call.function?.arguments;
  if (typeof raw !== "string" || raw.trim().length === 0) return {};
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

export function extractKimiResumeSessionId(text: string): string | null {
  const match = text.match(/To resume this session:\s*kimi\s+-r\s+([^\s]+)/i);
  return match?.[1] ?? null;
}

export function buildKimiExecArgs(opts: {
  cwd: string;
  resumeSessionId?: string;
}): string[] {
  const args = ["--work-dir", opts.cwd];
  if (opts.resumeSessionId) {
    args.push("--resume", opts.resumeSessionId);
  }
  args.push("--print", "--output-format", "stream-json", "--yolo");
  return args;
}

export async function runKimiStreaming(
  opts: KimiRunOptions,
  win: BrowserWindow,
): Promise<void> {
  const detected = await detectKimi();
  if (!detected.available) {
    throw new Error(
      "kimi CLI 未检测到。请先安装 Kimi Code CLI 并确保 `kimi --version` 能在命令行执行。",
    );
  }

  const netEnv = networkEnv();
  const args = buildKimiExecArgs({
    cwd: opts.cwd,
    ...(opts.resumeSessionId ? { resumeSessionId: opts.resumeSessionId } : {}),
  });

  log.info("[kimi-runner] spawn", {
    runId: opts.runId,
    cwd: opts.cwd,
    bin: kimiBin(),
    args,
    proxy: netEnv.HTTPS_PROXY ?? netEnv.HTTP_PROXY ?? null,
  });

  const child = spawn(kimiBin(), args, {
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

  const emitStdout = (data: string): void => {
    if (!data) return;
    opts.onChunk?.("stdout", data);
  };
  const emitStderr = (data: string): void => {
    if (!data) return;
    opts.onChunk?.("stderr", data);
  };
  const emitStreamEvent = (evt: ProviderStreamEvent): void => {
    opts.onStreamEvent?.(evt);
  };

  const processLine = (line: string): void => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const msg = JSON.parse(trimmed) as KimiJsonMessage;
      const sessionId = messageSessionId(msg);
      if (sessionId && capturedSessionId === null) {
        capturedSessionId = sessionId;
        opts.onSessionId?.(sessionId);
      }
      if (msg.role === "assistant") {
        const text = contentToText(msg.content);
        if (text) {
          resultText = text;
          emitStreamEvent({ type: "text", text });
          emitStdout(text);
        }
        for (const call of msg.tool_calls ?? []) {
          const toolUseId = stringField(call.id) ?? `${toolCallName(call)}:${Date.now()}`;
          emitStreamEvent({
            type: "tool-use",
            id: toolUseId,
            name: toolCallName(call),
            input: toolCallInput(call),
          });
        }
        return;
      }

      if (msg.role === "tool") {
        const toolUseId = stringField(msg.tool_call_id) ?? "tool";
        emitStreamEvent({
          type: "tool-result",
          toolUseId,
          content: contentToResultText(msg.content),
        });
        return;
      }
    } catch {
      const sessionId = extractKimiResumeSessionId(trimmed);
      if (sessionId && capturedSessionId === null) {
        capturedSessionId = sessionId;
        opts.onSessionId?.(sessionId);
      }
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
      const sessionId = extractKimiResumeSessionId(line);
      if (sessionId && capturedSessionId === null) {
        capturedSessionId = sessionId;
        opts.onSessionId?.(sessionId);
      }
      emitStderr(line.endsWith("\n") ? line : `${line}\n`);
    }
  });

  let spawnErr: Error | null = null;
  child.on("error", (err) => {
    spawnErr = err;
    resultErr = String(err);
    emitStderr(String(err));
    log.error("[kimi-runner] spawn error", { runId: opts.runId, err: String(err) });
  });

  const exitCode: number | null = await new Promise<number | null>((resolve) => {
    child.on("close", (code) => {
      if (stdoutBuf.length > 0) {
        processLine(stdoutBuf);
        stdoutBuf = "";
      }
      if (stderrBuf.length > 0) {
        const sessionId = extractKimiResumeSessionId(stderrBuf);
        if (sessionId && capturedSessionId === null) {
          capturedSessionId = sessionId;
          opts.onSessionId?.(sessionId);
        }
        emitStderr(stderrBuf);
        stderrBuf = "";
      }
      runningProcs.delete(opts.runId);
      resolve(code);
    });
  });

  const finalCode = spawnErr ? null : exitCode;
  if (finalCode !== 0 && resultErr === null) {
    resultErr = `kimi CLI exited code=${finalCode ?? "?"}`;
  }
  opts.onClose?.(finalCode, {
    resultText,
    resultError: resultErr,
    sessionId: capturedSessionId,
    resumeFailed: false,
  });
  void win;
}

export function cancelKimi(runId: string): boolean {
  const child = runningProcs.get(runId);
  if (!child) return false;
  try {
    child.kill("SIGTERM");
  } catch (err) {
    log.warn("[kimi-runner] cancel failed", { runId, err: String(err) });
  }
  runningProcs.delete(runId);
  return true;
}
