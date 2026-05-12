import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import https from "node:https";
import path from "node:path";

import log from "electron-log/main";

import { asrModelDir } from "../../../utility/keyword-crawl/infra/paths";

// Fun-ASR-Nano-2512 lives on ModelScope. We crawl the repo recursively via the
// ModelScope tree API, skipping README + example/images dirs, and download the
// rest with progress reporting. The Qwen3-0.6B subdirectory is included; that
// subdir holds the LLM half of the model and is required for inference.
const MS_OWNER = "FunAudioLLM";
const MS_REPO = "Fun-ASR-Nano-2512";
const MS_REVISION = "master";
const MS_HOST = "https://modelscope.cn";

// model.pt is ~2.13 GB. Anything smaller than 1 GB is a partial download.
const MIN_INSTALLED_BYTES = 1 * 1024 * 1024 * 1024;
const HEADER_TIMEOUT_MS = 30_000;
const REDIRECT_LIMIT = 5;

// Top-level entries we explicitly skip — they are documentation / example
// audio that the runtime doesn't need.
const SKIP_TOP_LEVEL_DIRS = new Set(["example", "images"]);
const SKIP_FILE_NAMES = new Set([
  "README.md",
  "README_zh.md",
  ".gitattributes",
]);

export interface AsrInstallProgress {
  stage: "queued" | "listing" | "downloading" | "verifying" | "done" | "error";
  file?: string;
  bytes?: number;
  total?: number;
  percent?: number;
  message?: string;
}

export type ProgressCallback = (event: AsrInstallProgress) => void;

export interface AsrStatus {
  installed: boolean;
  model_dir: string;
  size_bytes: number | null;
  downloading: boolean;
}

let inflight: Promise<void> | null = null;

export function asrModelDirPath(): string {
  return asrModelDir();
}

export async function getAsrStatus(): Promise<AsrStatus> {
  const dir = asrModelDir();
  const binPath = path.join(dir, "model.pt");
  let installed = false;
  let size: number | null = null;
  try {
    const stat = await fs.stat(binPath);
    size = stat.size;
    installed = stat.size >= MIN_INSTALLED_BYTES;
  } catch {
    /* missing → installed=false */
  }
  return {
    installed,
    model_dir: dir,
    size_bytes: size,
    downloading: inflight !== null,
  };
}

export function isInstalling(): boolean {
  return inflight !== null;
}

interface RemoteFile {
  /** Path relative to repo root, using forward slashes. */
  path: string;
  /** Size in bytes, or null if unknown. */
  size: number | null;
}

interface MsTreeEntry {
  Name: string;
  Type: "blob" | "tree";
  Path: string;
  Size?: number;
}

function fetchJson(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let attemptCount = 0;
    const open = (target: string): void => {
      attemptCount += 1;
      if (attemptCount > REDIRECT_LIMIT) {
        reject(new Error(`exceeded ${REDIRECT_LIMIT} redirects starting from ${url}`));
        return;
      }
      const req = https.get(
        target,
        {
          headers: {
            "User-Agent": "ua-agent/0.1 (+asr-installer)",
            Accept: "application/json",
          },
          timeout: HEADER_TIMEOUT_MS,
        },
        (res) => {
          const status = res.statusCode ?? 0;
          if (status >= 300 && status < 400 && res.headers.location) {
            res.resume();
            open(new URL(res.headers.location, target).toString());
            return;
          }
          if (status !== 200) {
            res.resume();
            reject(new Error(`GET ${target} → HTTP ${status}`));
            return;
          }
          const chunks: Buffer[] = [];
          res.on("data", (c: Buffer) => chunks.push(c));
          res.on("end", () => {
            try {
              const body = Buffer.concat(chunks).toString("utf8");
              resolve(JSON.parse(body) as unknown);
            } catch (err) {
              reject(err);
            }
          });
          res.on("error", reject);
        },
      );
      req.on("timeout", () => {
        req.destroy(new Error(`request timeout after ${HEADER_TIMEOUT_MS} ms: ${target}`));
      });
      req.on("error", reject);
    };
    open(url);
  });
}

async function crawl(onProgress: ProgressCallback): Promise<RemoteFile[]> {
  onProgress({ stage: "listing", message: "枚举模型文件清单…" });
  // ModelScope's `repo/files?Path=<subdir>` endpoint 404s for some subdirs
  // (observed for Qwen3-0.6B), but `?Recursive=true` reliably returns the
  // entire flat tree in one call with `Path` reflecting nested locations.
  const url = `${MS_HOST}/api/v1/models/${MS_OWNER}/${MS_REPO}/repo/files?Revision=${MS_REVISION}&Recursive=true`;
  const raw = await fetchJson(url);
  const obj = raw as { Files?: unknown; Data?: { Files?: unknown } };
  const filesField = obj.Files ?? obj.Data?.Files;
  if (!Array.isArray(filesField)) {
    throw new Error(`unexpected ModelScope response shape from ${url}`);
  }
  const collected: RemoteFile[] = [];
  for (const entry of filesField) {
    if (
      typeof entry !== "object" ||
      entry === null ||
      !("Type" in entry) ||
      !("Path" in entry)
    ) {
      continue;
    }
    const e = entry as MsTreeEntry;
    if (e.Type !== "blob") continue;
    // Filter: skip docs, .gitattributes, and anything under example/ or images/.
    const topSegment = e.Path.split("/")[0] ?? "";
    if (SKIP_TOP_LEVEL_DIRS.has(topSegment)) continue;
    if (SKIP_FILE_NAMES.has(e.Name)) continue;
    collected.push({
      path: e.Path,
      size: typeof e.Size === "number" ? e.Size : null,
    });
  }
  return collected;
}

export async function downloadAsrModel(onProgress: ProgressCallback): Promise<void> {
  if (inflight !== null) {
    onProgress({ stage: "queued", message: "another install is already in progress" });
    return inflight;
  }
  inflight = (async () => {
    const dir = asrModelDir();
    await fs.mkdir(dir, { recursive: true });

    const remoteFiles = await crawl(onProgress);
    if (remoteFiles.length === 0) {
      throw new Error("ModelScope 返回空文件列表");
    }
    log.info(`asr install: ${remoteFiles.length} files to consider`);

    const totalBytes = remoteFiles.reduce((acc, f) => acc + (f.size ?? 0), 0);
    let cumulativeBytes = 0;

    try {
      for (let i = 0; i < remoteFiles.length; i += 1) {
        const file = remoteFiles[i]!;
        const fileBase = `${i + 1}/${remoteFiles.length} ${file.path}`;
        await downloadOneFile(dir, file, (bytes, _total) => {
          // Overall progress = (already-finished bytes + current-file bytes) / totalBytes
          const overall =
            totalBytes > 0
              ? ((cumulativeBytes + bytes) / totalBytes) * 100
              : ((i + 0.5) / remoteFiles.length) * 100;
          onProgress({
            stage: "downloading",
            file: fileBase,
            bytes: cumulativeBytes + bytes,
            total: totalBytes,
            percent: Math.min(99, overall),
          });
        });
        cumulativeBytes += file.size ?? 0;
      }

      onProgress({ stage: "verifying", percent: 99 });
      const stat = await fs.stat(path.join(dir, "model.pt"));
      if (stat.size < MIN_INSTALLED_BYTES) {
        throw new Error(
          `model.pt size ${stat.size} below minimum ${MIN_INSTALLED_BYTES}; download appears truncated`,
        );
      }
      onProgress({ stage: "done", percent: 100 });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      log.error(`asr install failed: ${message}`);
      // Best-effort cleanup of the giant model.pt + its tmp so disk is reclaimed.
      // Smaller files are kept — harmless and a retry skips them.
      await fs.rm(path.join(dir, "model.pt"), { force: true }).catch(() => {});
      await fs.rm(path.join(dir, "model.pt.tmp"), { force: true }).catch(() => {});
      onProgress({ stage: "error", message });
      throw err;
    }
  })();

  try {
    await inflight;
  } finally {
    inflight = null;
  }
}

async function downloadOneFile(
  rootDir: string,
  file: RemoteFile,
  onChunk: (bytes: number, total: number) => void,
): Promise<void> {
  // ModelScope file content URL. The `?FilePath=` form supports nested paths
  // (e.g. Qwen3-0.6B/config.json) reliably; the `/resolve/master/` path-style
  // form sometimes 404s on subdirs.
  const url = `${MS_HOST}/api/v1/models/${MS_OWNER}/${MS_REPO}/repo?Revision=${MS_REVISION}&FilePath=${encodeURIComponent(file.path)}`;
  const finalPath = path.join(rootDir, ...file.path.split("/"));
  const tmpPath = `${finalPath}.tmp`;

  await fs.mkdir(path.dirname(finalPath), { recursive: true });

  // Skip if final file already exists at full size.
  try {
    const existing = await fs.stat(finalPath);
    if (file.size !== null && existing.size === file.size) {
      onChunk(existing.size, existing.size);
      return;
    }
    if (file.size === null && existing.size > 0) {
      onChunk(existing.size, existing.size);
      return;
    }
    // size mismatch → re-download
    await fs.rm(finalPath, { force: true });
  } catch {
    /* doesn't exist → proceed */
  }

  await fs.rm(tmpPath, { force: true });
  await streamHttpsToFile(url, tmpPath, onChunk);
  await fs.rename(tmpPath, finalPath);
}

function streamHttpsToFile(
  url: string,
  dest: string,
  onChunk: (bytes: number, total: number) => void,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let attemptCount = 0;
    const open = (target: string): void => {
      attemptCount += 1;
      if (attemptCount > REDIRECT_LIMIT) {
        reject(new Error(`exceeded ${REDIRECT_LIMIT} redirects starting from ${url}`));
        return;
      }
      const req = https.get(
        target,
        {
          headers: { "User-Agent": "ua-agent/0.1 (+asr-installer)" },
          // Header timeout only — large body downloads may take many minutes
          // and must not be aborted mid-stream.
          timeout: HEADER_TIMEOUT_MS,
        },
        (res) => {
          // Once headers are in, drop the timeout so the body has unlimited time.
          req.setTimeout(0);
          const status = res.statusCode ?? 0;
          if (status >= 300 && status < 400 && res.headers.location) {
            res.resume();
            open(new URL(res.headers.location, target).toString());
            return;
          }
          if (status !== 200) {
            res.resume();
            reject(new Error(`GET ${target} → HTTP ${status}`));
            return;
          }
          const total = Number.parseInt(res.headers["content-length"] ?? "0", 10);
          let bytes = 0;
          const out = createWriteStream(dest);
          res.on("data", (chunk: Buffer) => {
            bytes += chunk.length;
            onChunk(bytes, total);
          });
          res.on("error", (err) => {
            out.destroy();
            reject(err);
          });
          out.on("error", reject);
          out.on("finish", () => resolve());
          res.pipe(out);
        },
      );
      req.on("timeout", () => {
        req.destroy(new Error(`header timeout after ${HEADER_TIMEOUT_MS} ms: ${target}`));
      });
      req.on("error", (err) => {
        reject(err);
      });
    };
    open(url);
  });
}
