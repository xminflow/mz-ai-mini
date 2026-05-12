import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

import { app } from "electron";
import ffmpegStaticPath from "ffmpeg-static";
import log from "electron-log/main";

/**
 * FrameExtractError — thrown by `extract4Frames` on failure. `code` matches
 * the new error envelope codes added by the analyze pipeline.
 */
export class FrameExtractError extends Error {
  code: "FFMPEG_NOT_FOUND" | "FRAME_EXTRACT_FAILED";
  constructor(code: FrameExtractError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Resolve the bundled ffmpeg binary path. In the packaged app, electron-builder
 * unpacks ffmpeg-static out of app.asar via `asarUnpack`, but the static export
 * still hard-codes the original `app.asar` path — rewrite to `app.asar.unpacked`.
 */
function resolveFfmpegBinary(): string {
  const raw = ffmpegStaticPath as string | null;
  if (raw === null || typeof raw !== "string" || raw.length === 0) {
    throw new FrameExtractError(
      "FFMPEG_NOT_FOUND",
      "ffmpeg-static did not provide a binary path for this platform",
    );
  }
  return raw.replace(`${path.sep}app.asar${path.sep}`, `${path.sep}app.asar.unpacked${path.sep}`);
}

/**
 * Probe the duration (seconds) of a media file by running `ffmpeg -i <file>`
 * and parsing the `Duration: HH:MM:SS.ms` line from stderr. ffmpeg always
 * writes to stderr and exits non-zero when no output is specified — we
 * intentionally ignore the exit code and look only at stderr.
 */
export async function probeDurationSeconds(localPath: string): Promise<number> {
  const bin = resolveFfmpegBinary();
  const stderr = await new Promise<string>((resolve, reject) => {
    const proc = spawn(bin, ["-hide_banner", "-i", localPath], {
      windowsHide: true,
    });
    const chunks: Buffer[] = [];
    proc.stderr.on("data", (c: Buffer) => chunks.push(c));
    proc.on("error", reject);
    proc.on("close", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
  const m = /Duration:\s*(\d+):(\d{2}):(\d{2})\.(\d{1,3})/.exec(stderr);
  if (m === null) {
    throw new FrameExtractError(
      "FRAME_EXTRACT_FAILED",
      `ffmpeg did not report a Duration in stderr for ${path.basename(localPath)}`,
    );
  }
  const h = Number(m[1] ?? "0");
  const mm = Number(m[2] ?? "0");
  const s = Number(m[3] ?? "0");
  const ms = Number((m[4] ?? "0").padEnd(3, "0"));
  return h * 3600 + mm * 60 + s + ms / 1000;
}

/** Format seconds → `HH:MM:SS.mmm` (ffmpeg `-ss` accepts this directly). */
function fmtTimestamp(secs: number): string {
  const total = Math.max(0, secs);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  const ms = Math.round((total - Math.floor(total)) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

export async function extractFrameAt(
  bin: string,
  inputPath: string,
  outPath: string,
  timestampSecs: number,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    // -ss before -i = fast seek (keyframe-aligned); good enough for thumbnails.
    // -frames:v 1 = single frame; -q:v 2 = high JPEG quality (range 2..31).
    // -y overwrites; -hide_banner / -loglevel error keep stderr clean.
    const args = [
      "-hide_banner",
      "-loglevel",
      "error",
      "-ss",
      fmtTimestamp(timestampSecs),
      "-i",
      inputPath,
      "-frames:v",
      "1",
      "-q:v",
      "2",
      "-y",
      outPath,
    ];
    const proc = spawn(bin, args, { windowsHide: true });
    const stderrChunks: Buffer[] = [];
    proc.stderr.on("data", (c: Buffer) => stderrChunks.push(c));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      const tail = Buffer.concat(stderrChunks).toString("utf8").trim();
      reject(
        new FrameExtractError(
          "FRAME_EXTRACT_FAILED",
          `ffmpeg exit=${code} at t=${fmtTimestamp(timestampSecs)}: ${tail.slice(0, 400)}`,
        ),
      );
    });
  });
}

/**
 * Resolve a stable, short directory key for a Douyin video URL. Uses the
 * trailing aweme_id from `/video/{aweme_id}` when present; falls back to a
 * short sha1 prefix so analysis still works for non-canonical URLs.
 */
export function awemeIdFromUrl(videoUrl: string): string {
  const m = /\/video\/(\d+)/.exec(videoUrl);
  if (m !== null && m[1] !== undefined) return m[1];
  return createHash("sha1").update(videoUrl).digest("hex").slice(0, 12);
}

/**
 * Build the persistent directory under the user's app data where this video's
 * frames will live. Caller is responsible for `mkdir -p`.
 */
export function blogger4FramesDir(bloggerId: string, videoUrl: string): string {
  return path.join(
    app.getPath("userData"),
    "blogger-frames",
    bloggerId,
    awemeIdFromUrl(videoUrl),
  );
}

/**
 * Compute 4 sampling timestamps. The first is fixed at t=0 — that's the
 * Douyin "封面" (cover / poster frame). The remaining `count - 1` are
 * evenly distributed across the rest of the clip at quarter-points
 * (T·1/4, T·2/4, T·3/4). Skips the very last frame which is usually a
 * fade-out.
 *
 * Exposed for tests so the math stays honest without spinning up ffmpeg.
 */
export function sampleTimestamps(durationSecs: number, count = 4): number[] {
  if (durationSecs <= 0 || !Number.isFinite(durationSecs)) return [];
  const out: number[] = [0];
  const remaining = count - 1;
  for (let i = 1; i <= remaining; i += 1) {
    out.push((durationSecs * i) / (remaining + 1));
  }
  return out;
}

export interface TimedFrameSpec {
  filename: string;
  timestampSecs: number;
}

export async function extractTimedFrames(
  localMp4Path: string,
  outDir: string,
  specs: TimedFrameSpec[],
): Promise<string[]> {
  const bin = resolveFfmpegBinary();
  await fs.mkdir(outDir, { recursive: true });

  const paths: string[] = [];
  for (const spec of specs) {
    const out = path.join(outDir, spec.filename);
    try {
      await extractFrameAt(bin, localMp4Path, out, spec.timestampSecs);
    } catch (err) {
      log.warn(
        `extractTimedFrames: ${spec.filename} failed at t=${spec.timestampSecs}s — ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    }
    paths.push(out);
  }
  return paths;
}

/**
 * Decode the audio track of `localMp4Path` to a 16 kHz mono WAV at `outWavPath`.
 *
 * Why pre-decode: when Python's `librosa.load()` is handed an mp4 it falls
 * back to `audioread`, which probes for a system ffmpeg via PATH and tends
 * to deadlock on Windows when no system ffmpeg is installed. Handing it a
 * plain WAV makes librosa pick `soundfile` (native, no subprocess) and
 * sidesteps the whole probing chain. It's also faster + smaller (the audio
 * track of a 30 MB mp4 is typically a few MB).
 */
export async function extractAudioWav(
  localMp4Path: string,
  outWavPath: string,
): Promise<void> {
  const bin = resolveFfmpegBinary();
  await fs.mkdir(path.dirname(outWavPath), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(
      bin,
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        localMp4Path,
        // Mono, 16 kHz, signed 16-bit PCM — exactly what FunASR-Nano expects.
        "-ac",
        "1",
        "-ar",
        "16000",
        "-vn",
        "-c:a",
        "pcm_s16le",
        outWavPath,
      ],
      { windowsHide: true },
    );
    const stderrChunks: Buffer[] = [];
    proc.stderr.on("data", (c: Buffer) => stderrChunks.push(c));
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      const tail = Buffer.concat(stderrChunks).toString("utf8").trim();
      reject(
        new FrameExtractError(
          "FRAME_EXTRACT_FAILED",
          `ffmpeg audio→wav exit=${code}: ${tail.slice(0, 400)}`,
        ),
      );
    });
  });
}

/**
 * Extract 4 evenly-spaced frames from a local mp4. Writes JPEGs to `outDir`
 * (creating it as needed) and returns the absolute paths in time order.
 *
 * Throws `FrameExtractError` on any failure — the analyze coordinator catches
 * and records the message into `analyze_error` for the affected sample.
 */
export async function extract4Frames(
  localMp4Path: string,
  outDir: string,
): Promise<string[]> {
  const bin = resolveFfmpegBinary();
  await fs.mkdir(outDir, { recursive: true });

  const duration = await probeDurationSeconds(localMp4Path);
  const stamps = sampleTimestamps(duration, 4);
  if (stamps.length !== 4) {
    throw new FrameExtractError(
      "FRAME_EXTRACT_FAILED",
      `cannot derive 4 timestamps from duration=${duration}s`,
    );
  }

  const paths: string[] = [];
  for (let i = 0; i < stamps.length; i += 1) {
    const t = stamps[i] ?? 0;
    const out = path.join(outDir, `${i + 1}.jpg`);
    try {
      await extractFrameAt(bin, localMp4Path, out, t);
    } catch (err) {
      log.warn(
        `extract4Frames: frame ${i + 1}/4 failed at t=${t}s — ${err instanceof Error ? err.message : String(err)}`,
      );
      throw err;
    }
    paths.push(out);
  }
  return paths;
}
