import fs from "node:fs";
import path from "node:path";

import { keywordCrawlLogPath, logsDir } from "./paths";

const ROTATE_BYTES = 5 * 1024 * 1024;

export type LogLevel = "INFO" | "WARN" | "ERROR";

export interface LoggerOptions {
  /** override the on-disk path (used in tests). */
  filePath?: string;
  /** override the rotate threshold (used in tests). */
  rotateBytes?: number;
  /** values that must never appear in any logged field. Each entry is matched
   *  as a literal substring against every stringified field value. */
  redactValues?: readonly string[];
}

export interface Logger {
  info: (event: string, fields?: Record<string, unknown>) => void;
  warn: (event: string, fields?: Record<string, unknown>) => void;
  error: (event: string, fields?: Record<string, unknown>) => void;
  setRedactValues: (values: readonly string[]) => void;
  close: () => void;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function fieldToString(v: unknown): string {
  if (v === null || v === undefined) return String(v);
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

const ALWAYS_REDACT_KEY_PATTERNS = [
  /cookie/i,
  /^cookies?$/i,
  /set-cookie/i,
  /profile_dir_contents?/i,
  /own_handle/i,
  /own_user_id/i,
  /own_nickname/i,
  /^user(name)?$/i,
];

function shouldRedactKey(key: string): boolean {
  return ALWAYS_REDACT_KEY_PATTERNS.some((re) => re.test(key));
}

function redactValue(value: string, redactValues: readonly string[]): string {
  let out = value;
  for (const v of redactValues) {
    if (!v) continue;
    if (out.includes(v)) {
      out = out.split(v).join("[redacted]");
    }
  }
  return out;
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const filePath = options.filePath ?? keywordCrawlLogPath();
  const rotateBytes = options.rotateBytes ?? ROTATE_BYTES;
  let redactValues: readonly string[] = options.redactValues ?? [];

  let fd: number | null = null;
  let bytesWritten = 0;

  function ensureOpen(): number {
    if (fd !== null) return fd;
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    let initialSize = 0;
    try {
      const st = fs.statSync(filePath);
      initialSize = st.size;
    } catch {
      // file doesn't exist; that's fine
    }
    fd = fs.openSync(filePath, "a");
    bytesWritten = initialSize;
    return fd;
  }

  function rotateIfNeeded(): void {
    if (bytesWritten < rotateBytes) return;
    if (fd !== null) {
      try {
        fs.closeSync(fd);
      } catch {
        /* ignore */
      }
      fd = null;
    }
    const backup = `${filePath}.1`;
    try {
      fs.rmSync(backup, { force: true });
    } catch {
      /* ignore */
    }
    try {
      fs.renameSync(filePath, backup);
    } catch {
      /* ignore */
    }
    bytesWritten = 0;
  }

  function buildLine(level: LogLevel, event: string, fields?: Record<string, unknown>): string {
    const ts = new Date().toISOString();
    const safeFields: Record<string, string> = {};
    if (fields) {
      for (const [key, raw] of Object.entries(fields)) {
        const stringValue = isPlainObject(raw) || Array.isArray(raw) ? JSON.stringify(raw) : fieldToString(raw);
        const value = shouldRedactKey(key) ? "[redacted]" : redactValue(stringValue, redactValues);
        safeFields[key] = value;
      }
    }
    const obj = { ts, level, event, ...safeFields };
    return `${JSON.stringify(obj)}\n`;
  }

  function write(level: LogLevel, event: string, fields?: Record<string, unknown>): void {
    try {
      const line = buildLine(level, event, fields);
      const handle = ensureOpen();
      const buf = Buffer.from(line, "utf-8");
      fs.writeSync(handle, buf);
      bytesWritten += buf.byteLength;
      rotateIfNeeded();
    } catch {
      // Logger must never throw out of the utility process; swallow.
    }
  }

  return {
    info: (event, fields) => write("INFO", event, fields),
    warn: (event, fields) => write("WARN", event, fields),
    error: (event, fields) => write("ERROR", event, fields),
    setRedactValues: (values) => {
      redactValues = values;
    },
    close: () => {
      if (fd !== null) {
        try {
          fs.closeSync(fd);
        } catch {
          /* ignore */
        }
        fd = null;
      }
    },
  };
}

let sharedLogger: Logger | null = null;

export function getLogger(): Logger {
  if (sharedLogger === null) {
    fs.mkdirSync(logsDir(), { recursive: true });
    sharedLogger = createLogger();
    process.once("exit", () => sharedLogger?.close());
  }
  return sharedLogger;
}
