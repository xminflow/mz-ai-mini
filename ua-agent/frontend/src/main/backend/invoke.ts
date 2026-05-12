import { spawn } from "node:child_process";

import { PingResult, type PingResult as PingResultType } from "../../shared/contracts/ping";
import { buildBackendPythonEnv, resolvePythonInterpreter, BackendUnavailableError } from "./locate";

const PING_TIMEOUT_MS = 5_000;

interface InvokeOptions {
  timeoutMs?: number;
  env?: Record<string, string>;
}

export class BackendInvocationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BackendInvocationError";
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildInternalEnvelope(message: string): {
  schema_version: "1";
  ok: false;
  error: { code: "INTERNAL"; message: string };
} {
  return {
    schema_version: "1",
    ok: false,
    error: { code: "INTERNAL", message: message.slice(0, 1024) || "internal error" },
  };
}

/**
 * Spawn `python -m ua_agent <args>` and return the parsed JSON object emitted
 * on stdout. On any failure (spawn, timeout, non-JSON output), returns an
 * INTERNAL error envelope (`schema_version: "1", ok: false, error: ...`).
 *
 * The caller is responsible for validating the payload shape with Zod.
 */
export async function invokeJsonSubcommand(
  args: readonly string[],
  options: InvokeOptions = {},
): Promise<unknown> {
  const timeoutMs = options.timeoutMs ?? 10_000;

  let interpreter: string;
  let cwd: string;
  try {
    ({ interpreter, cwd } = await resolvePythonInterpreter());
  } catch (err) {
    const cause =
      err instanceof BackendUnavailableError
        ? err.message
        : err instanceof Error
          ? err.message
          : String(err);
    return buildInternalEnvelope(`Backend unavailable: ${cause}`);
  }

  const fullArgs = ["-m", "ua_agent", ...args];

  return await new Promise<unknown>((resolve) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const proc = spawn(interpreter, fullArgs, {
      cwd,
      windowsHide: true,
      signal: controller.signal,
      env: buildBackendPythonEnv(options.env),
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    proc.stdout.on("data", (c: Buffer) => stdoutChunks.push(c));
    proc.stderr.on("data", (c: Buffer) => stderrChunks.push(c));

    let settled = false;
    const settle = (result: unknown): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    proc.on("error", (err) => {
      settle(buildInternalEnvelope(`spawn failed: ${err.message}`));
    });

    proc.on("close", (code) => {
      const stdoutText = Buffer.concat(stdoutChunks).toString("utf8").trim();
      const stderrText = Buffer.concat(stderrChunks).toString("utf8").trim();

      if (stdoutText.length > 0) {
        const parsed = safeJsonParse(stdoutText);
        if (parsed !== null) {
          settle(parsed);
          return;
        }
      }

      const fallbackMessage =
        stderrText || `python -m ua_agent exited with code ${code ?? "?"}`;
      settle(buildInternalEnvelope(fallbackMessage));
    });
  });
}

export async function invokePing(message: string | null): Promise<PingResultType> {
  const args = ["ping", "--json"];
  if (message !== null) {
    args.push("--message", message);
  }
  const raw = await invokeJsonSubcommand(args, { timeoutMs: PING_TIMEOUT_MS });
  const parsed = PingResult.safeParse(raw);
  if (parsed.success) {
    return parsed.data;
  }
  return {
    schema_version: "1",
    ok: false,
    error: { code: "INTERNAL", message: "ping payload failed contract validation" },
  };
}
