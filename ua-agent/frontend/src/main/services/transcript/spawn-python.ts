import { spawn } from "node:child_process";
import path from "node:path";
import readline from "node:readline";

import ffmpegStaticPath from "ffmpeg-static";
import log from "electron-log/main";

import { buildBackendPythonEnv, resolvePythonInterpreter, BackendUnavailableError } from "../../backend/locate";

/**
 * Resolve the directory holding the bundled ffmpeg.exe. We prepend it to
 * the child process's PATH so Python libraries that shell out to ffmpeg
 * (librosa → audioread → ffdec) find it without requiring a system install.
 *
 * Returns null when ffmpeg-static didn't ship a binary for this platform.
 */
function ffmpegBinaryDir(): string | null {
  const raw = ffmpegStaticPath as string | null;
  if (raw === null || typeof raw !== "string" || raw.length === 0) return null;
  const resolved = raw.replace(
    `${path.sep}app.asar${path.sep}`,
    `${path.sep}app.asar.unpacked${path.sep}`,
  );
  return path.dirname(resolved);
}

export type LineHandler = (line: string) => void;

export interface SpawnOutcome {
  exitCode: number | null;
  stderr: string;
}

export interface SpawnHandle {
  completion: Promise<SpawnOutcome>;
  cancel: () => void;
}

/**
 * Spawn `python -m ua_agent <args>` and stream stdout one line at a time to
 * `onLine`. Resolves with the final exit code + buffered stderr once the
 * process exits.
 *
 * Use this for subcommands that emit JSON-lines (e.g. `transcript run`)
 * rather than `invokeJsonSubcommand`, which assumes a single JSON object on
 * stdout and a short timeout.
 *
 * `timeoutMs` (default 20 min) — guards against the FunASR model deadlocking
 * on a pathological input. The child is sent SIGKILL when the timer fires;
 * the resolved outcome carries `exitCode: null` and a timed-out marker in
 * stderr so callers can surface a useful error.
 */
export async function spawnUaAgentJsonStream(
  args: readonly string[],
  onLine: LineHandler,
  timeoutMs: number = 20 * 60 * 1000,
): Promise<SpawnOutcome> {
  return (await spawnUaAgentJsonStreamHandle(args, onLine, timeoutMs)).completion;
}

export async function spawnUaAgentJsonStreamHandle(
  args: readonly string[],
  onLine: LineHandler,
  timeoutMs: number = 20 * 60 * 1000,
  env: Record<string, string> = {},
): Promise<SpawnHandle> {
  let interpreter: string;
  let cwd: string;
  try {
    ({ interpreter, cwd } = await resolvePythonInterpreter());
  } catch (err) {
    if (err instanceof BackendUnavailableError) throw err;
    throw new BackendUnavailableError(
      err instanceof Error ? err.message : String(err),
    );
  }

  return await new Promise<SpawnHandle>((resolve, reject) => {
    const proc = spawn(interpreter, ["-m", "ua_agent", ...args], {
      cwd,
      windowsHide: true,
      // Force UTF-8 stdout so CJK transcripts round-trip cleanly on Windows
      // (default cp936 stdout would mangle Chinese into mojibake before our
      // readline UTF-8 decoder sees it). Belt-and-braces with the Python-side
      // sys.stdout.reconfigure() in cli.py.
      // PYTHONUNBUFFERED=1 — force unbuffered stdout so each typer.echo() line
      // hits our readline reader immediately. Without this, child Python
      // appears to "hang" while progress lines pile up in a 4–8 KB stdout
      // buffer that only flushes on full or process exit.
      env: (() => {
        const ffmpegDir = ffmpegBinaryDir();
        const envPathKey = process.platform === "win32" ? "Path" : "PATH";
        const existingPath = process.env[envPathKey] ?? process.env["PATH"] ?? "";
        const augmentedPath =
          ffmpegDir !== null
            ? `${ffmpegDir}${path.delimiter}${existingPath}`
            : existingPath;
        return {
          ...buildBackendPythonEnv(),
          PYTHONIOENCODING: "utf-8",
          PYTHONUNBUFFERED: "1",
          [envPathKey]: augmentedPath,
          ...env,
        };
      })(),
    });

    const argSummary = args.slice(0, 3).join(" ");
    log.info(`ua_agent.spawn pid=${proc.pid ?? "?"} cmd="${argSummary} ..." timeoutMs=${timeoutMs}`);

    let timedOut = false;
    let manuallyCancelled = false;
    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      log.warn(`ua_agent.timeout pid=${proc.pid ?? "?"} after ${timeoutMs} ms — killing child`);
      try {
        proc.kill("SIGKILL");
      } catch {
        /* ignore */
      }
    }, timeoutMs);

    proc.stdout.setEncoding("utf8");
    const rl = readline.createInterface({ input: proc.stdout });
    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return;
      // Mirror to main.log so a "stuck" Python is observable from disk.
      log.info(`ua_agent.stdout pid=${proc.pid ?? "?"} ${trimmed.slice(0, 400)}`);
      try {
        onLine(trimmed);
      } catch (err) {
        log.warn(
          `spawnUaAgentJsonStream: line handler threw — ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    });

    const stderrChunks: Buffer[] = [];
    proc.stderr.setEncoding("utf8");
    const rlErr = readline.createInterface({ input: proc.stderr });
    rlErr.on("line", (line) => {
      const trimmed = line.trim();
      if (trimmed.length === 0) return;
      stderrChunks.push(Buffer.from(`${line}\n`, "utf8"));
      // Live-tail stderr so we can see funasr / torch / librosa warnings
      // in real time instead of only after the process exits.
      log.info(`ua_agent.stderr pid=${proc.pid ?? "?"} ${trimmed.slice(0, 400)}`);
    });

    const completion = new Promise<SpawnOutcome>((innerResolve, innerReject) => {
      proc.on("error", (err) => {
        clearTimeout(timeoutHandle);
        rl.close();
        rlErr.close();
        innerReject(err);
      });

      proc.on("close", (code) => {
        clearTimeout(timeoutHandle);
        rl.close();
        rlErr.close();
        const baseStderr = Buffer.concat(stderrChunks).toString("utf8").trim();
        const stderr =
          timedOut
            ? `${baseStderr}\n[ua-agent] timeout after ${timeoutMs} ms; child killed`.trim()
            : manuallyCancelled
              ? `${baseStderr}\n[ua-agent] cancelled by caller`.trim()
              : baseStderr;
        log.info(`ua_agent.exit pid=${proc.pid ?? "?"} code=${code ?? "?"} timedOut=${timedOut}`);
        innerResolve({ exitCode: code, stderr });
      });
    });

    resolve({
      completion,
      cancel: () => {
        if (proc.killed) return;
        manuallyCancelled = true;
        try {
          proc.kill("SIGKILL");
        } catch {
          /* ignore */
        }
      },
    });
  });
}
