import { spawn } from "node:child_process";
import fsSync from "node:fs";
import path from "node:path";

import { app } from "electron";

export class BackendUnavailableError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "BackendUnavailableError";
  }
}

export interface ResolvedInterpreter {
  interpreter: string;
  cwd: string;
}

export function resolveBackendCwd(): string {
  // Packaged: backend/ is staged into app resources by electron-builder.
  // Dev: ../../../backend (frontend/out/main → frontend/out → frontend → repo root).
  return app.isPackaged
    ? path.join(process.resourcesPath, "backend")
    : path.resolve(__dirname, "../../../backend");
}

export function buildBackendPythonEnv(extraEnv: Record<string, string> = {}): NodeJS.ProcessEnv {
  const backendSrc = path.join(resolveBackendCwd(), "src");
  const existingPythonPath = process.env["PYTHONPATH"] ?? "";
  return {
    ...process.env,
    PYTHONPATH: existingPythonPath.length > 0
      ? `${backendSrc}${path.delimiter}${existingPythonPath}`
      : backendSrc,
    ...extraEnv,
  };
}

/**
 * Resolve the Python interpreter that should run the ua-agent CLI.
 *
 * Order of resolution (research Decision 12):
 *   1. process.env.UA_AGENT_PYTHON, used verbatim if set.
 *   2. backend/.venv python, which is the uv-managed project environment in dev.
 *   3. `uv run --quiet python -c "import sys; print(sys.executable)"` from backend/.
 *   4. Otherwise, BackendUnavailableError.
 */
export async function resolvePythonInterpreter(): Promise<ResolvedInterpreter> {
  const backendCwd = resolveBackendCwd();

  const override = process.env["UA_AGENT_PYTHON"];
  if (override && override.trim().length > 0) {
    return { interpreter: override.trim(), cwd: backendCwd };
  }

  const uvVenvPython = process.platform === "win32"
    ? path.join(backendCwd, ".venv", "Scripts", "python.exe")
    : path.join(backendCwd, ".venv", "bin", "python");
  if (fsSync.existsSync(uvVenvPython)) {
    return { interpreter: uvVenvPython, cwd: backendCwd };
  }

  return await new Promise<ResolvedInterpreter>((resolve, reject) => {
    // Single-statement form so the command has no shell metacharacters
    // (the previous `import sys; print(...)` was being split at `;` when
    // shell: true was used on Windows, leading to a Python SyntaxError).
    const proc = spawn(
      process.platform === "win32" ? "uv.exe" : "uv",
      [
        "run",
        "--quiet",
        "python",
        "-c",
        "print(__import__('sys').executable)",
      ],
      { cwd: backendCwd, windowsHide: true },
    );

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    proc.stdout.on("data", (c: Buffer) => stdoutChunks.push(c));
    proc.stderr.on("data", (c: Buffer) => stderrChunks.push(c));

    proc.on("error", (err) => {
      reject(new BackendUnavailableError(`uv not on PATH: ${err.message}`, err));
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        const stderr = Buffer.concat(stderrChunks).toString("utf8").trim();
        reject(
          new BackendUnavailableError(
            `uv exited with code ${code ?? "?"}: ${stderr || "(no stderr)"}`,
          ),
        );
        return;
      }
      const interpreter = Buffer.concat(stdoutChunks).toString("utf8").trim();
      if (!interpreter) {
        reject(new BackendUnavailableError("uv returned an empty interpreter path"));
        return;
      }
      resolve({ interpreter, cwd: backendCwd });
    });
  });
}
