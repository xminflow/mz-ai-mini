import { createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

const REQUEST_TIMEOUT_MS = 30_000;
const REDIRECT_LIMIT = 5;
const MOBILE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/121.0.2277.107 Version/17.0 Mobile/15E148 Safari/604.1";

export interface DownloadedMp4 {
  path: string;
  bytes: number;
  cleanup: () => Promise<void>;
}

/**
 * Stream the signed mp4 URL into the OS temp dir. Returns the local
 * path plus a cleanup() callback the caller should invoke in a `finally`
 * regardless of success.
 */
export async function downloadMp4ToTemp(
  url: string,
  onProgress?: (bytes: number, total: number) => void,
): Promise<DownloadedMp4> {
  const dir = path.join(tmpdir(), "ua-agent-transcripts");
  await fs.mkdir(dir, { recursive: true });
  const dest = path.join(dir, `${randomUUID()}.mp4`);

  const cleanup = async (): Promise<void> => {
    await fs.rm(dest, { force: true }).catch(() => {});
  };

  try {
    const bytes = await streamUrlToFile(url, dest, onProgress);
    return { path: dest, bytes, cleanup };
  } catch (err) {
    await cleanup();
    throw err;
  }
}

function streamUrlToFile(
  url: string,
  dest: string,
  onProgress?: (bytes: number, total: number) => void,
): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    let attemptCount = 0;
    const open = (target: string): void => {
      attemptCount += 1;
      if (attemptCount > REDIRECT_LIMIT) {
        reject(new Error(`exceeded ${REDIRECT_LIMIT} redirects starting from ${url}`));
        return;
      }
      const parsed = new URL(target);
      const transport = parsed.protocol === "https:" ? https : parsed.protocol === "http:" ? http : null;
      if (transport === null) {
        reject(new Error(`unsupported mp4 URL protocol: ${parsed.protocol}`));
        return;
      }
      const req = transport.get(
        target,
        {
          headers: { "User-Agent": MOBILE_USER_AGENT },
          timeout: REQUEST_TIMEOUT_MS,
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
            reject(new Error(`GET mp4 → HTTP ${status}`));
            return;
          }
          const total = Number.parseInt(res.headers["content-length"] ?? "0", 10);
          let bytes = 0;
          const out = createWriteStream(dest);
          res.on("data", (chunk: Buffer) => {
            bytes += chunk.length;
            if (onProgress) onProgress(bytes, total);
          });
          res.on("error", (err) => {
            out.destroy();
            reject(err);
          });
          out.on("error", reject);
          out.on("finish", () => resolve(bytes));
          res.pipe(out);
        },
      );
      req.on("timeout", () => {
        req.destroy(new Error(`mp4 request timeout after ${REQUEST_TIMEOUT_MS} ms`));
      });
      req.on("error", reject);
    };
    open(url);
  });
}
