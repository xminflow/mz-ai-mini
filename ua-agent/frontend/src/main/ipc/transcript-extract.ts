import { BrowserWindow, ipcMain } from "electron";
import log from "electron-log/main";

import { SCHEMA_VERSION } from "../../shared/contracts/error";
import {
  TRANSCRIPT_PROGRESS_TOPIC,
  TranscriptExtractRequest,
  type TranscriptExtractResult,
  type TranscriptProgressEvent,
  type TranscriptStage,
} from "../../shared/contracts/transcript";
import { getSharedStore } from "../../utility/keyword-crawl/domain/library";
import { resolveDouyinVideoDownloadUrl } from "../services/douyin/resolve-video-url";
import { downloadMp4ToTemp } from "../services/transcript/download-mp4";
import { spawnUaAgentJsonStream } from "../services/transcript/spawn-python";
import { runWithTranscriptTaskLock } from "../services/transcript/task-lock";
import { getAsrStatus } from "../services/whisper/model-store";
import { resolveXhsVideoDownloadUrl } from "../services/xiaohongshu/resolve-video-url";

const CHANNEL = "transcript:extract";

function pushProgress(event: TranscriptProgressEvent): void {
  for (const bw of BrowserWindow.getAllWindows()) {
    try {
      bw.webContents.send(TRANSCRIPT_PROGRESS_TOPIC, event);
    } catch (err) {
      log.warn(
        `webContents.send threw for ${TRANSCRIPT_PROGRESS_TOPIC}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

function emitProgress(post_id: string, stage: TranscriptStage, percent: number, message?: string): void {
  pushProgress({ post_id, stage, percent, ...(message !== undefined ? { message } : {}) });
}

function failure(
  code:
    | "INVALID_INPUT"
    | "ASR_MODEL_MISSING"
    | "DOUYIN_VIDEO_RESOLVE_FAILED"
    | "VIDEO_RESOLVE_FAILED"
    | "TRANSCRIPT_DOWNLOAD_FAILED"
    | "TRANSCRIPT_DECODE_FAILED"
    | "TRANSCRIPT_NO_AUDIO"
    | "TRANSCRIPT_FAILED"
    | "TRANSCRIPT_BUSY"
    | "INTERNAL",
  message: string,
): TranscriptExtractResult {
  return {
    schema_version: SCHEMA_VERSION,
    ok: false,
    error: {
      code,
      message: message.length > 1024 ? `${message.slice(0, 1021)}...` : message,
    },
  };
}

interface PythonLineUnion {
  event: "progress" | "result" | "error";
  stage?: "loading_model" | "transcribing";
  percent?: number;
  text?: string;
  language?: string;
  duration_s?: number;
  code?: string;
  message?: string;
}

/**
 * TranscribeError — thrown by `transcribeLocalMp4`. The `code` matches the
 * `failure()` discriminator above so callers can re-emit the same envelope.
 */
export class TranscribeError extends Error {
  code:
    | "ASR_MODEL_MISSING"
    | "TRANSCRIPT_NO_AUDIO"
    | "TRANSCRIPT_DECODE_FAILED"
    | "TRANSCRIPT_FAILED";
  constructor(code: TranscribeError["code"], message: string) {
    super(message);
    this.code = code;
  }
}

/**
 * Spawn the bundled Python transcribe command against a *local* mp4 path and
 * return the transcript text + detected language + audio duration. No SQLite
 * writes; no progress IPC events. This is the reusable core of the
 * `transcript:extract` IPC, also used by `blogger:analyze`.
 *
 * Pre-flight: requires the FunASR-Nano model installed; throws ASR_MODEL_MISSING
 * if not.
 *
 * @param onPythonProgress optional — called with the raw {stage, percent} from
 *   the Python child, so callers can fan it out to their own progress topic.
 */
export async function transcribeLocalMp4(
  localMp4Path: string,
  postIdHint: string,
  onPythonProgress?: (stage: "loading_model" | "transcribing", percent: number) => void,
): Promise<{ text: string; lang: string; duration_s: number }> {
  const status = await getAsrStatus();
  if (!status.installed) {
    throw new TranscribeError(
      "ASR_MODEL_MISSING",
      "语音识别模型未安装，请前往 设置 → 语音识别 下载",
    );
  }

  let resultText = "";
  let resultLang = "";
  let resultDuration = 0;
  let pythonError: { code: string; message: string } | null = null;
  let sawResult = false;

  const outcome = await spawnUaAgentJsonStream(
    [
      "transcript",
      "run",
      "--post-id",
      postIdHint,
      "--media-path",
      localMp4Path,
      "--json",
    ],
    (line) => {
      let parsed: PythonLineUnion | null = null;
      try {
        parsed = JSON.parse(line) as PythonLineUnion;
      } catch {
        log.warn(`transcript: non-JSON stdout line ignored: ${line.slice(0, 200)}`);
        return;
      }
      if (parsed.event === "progress" && parsed.stage) {
        const rawPct = typeof parsed.percent === "number" ? parsed.percent : 0;
        if (onPythonProgress) onPythonProgress(parsed.stage, rawPct);
      } else if (parsed.event === "result") {
        sawResult = true;
        resultText = String(parsed.text ?? "");
        resultLang = String(parsed.language ?? "");
        resultDuration = Number(parsed.duration_s ?? 0);
      } else if (parsed.event === "error") {
        pythonError = {
          code: String(parsed.code ?? "INTERNAL"),
          message: String(parsed.message ?? "transcribe failed"),
        };
      }
    },
  );

  if (pythonError !== null) {
    const { code: errCode, message: errMsg } = pythonError as {
      code: string;
      message: string;
    };
    const code: TranscribeError["code"] =
      errCode === "ASR_MODEL_MISSING"
        ? "ASR_MODEL_MISSING"
        : errCode === "TRANSCRIPT_NO_AUDIO"
          ? "TRANSCRIPT_NO_AUDIO"
          : errCode === "TRANSCRIPT_DECODE_FAILED"
            ? "TRANSCRIPT_DECODE_FAILED"
            : "TRANSCRIPT_FAILED";
    throw new TranscribeError(code, errMsg);
  }
  if (!sawResult || outcome.exitCode !== 0) {
    const tail = outcome.stderr.split(/\r?\n/).slice(-3).join(" | ");
    throw new TranscribeError(
      "TRANSCRIPT_FAILED",
      `transcribe exited code=${outcome.exitCode ?? "?"} ${tail || ""}`.trim(),
    );
  }
  if (resultText.length === 0) {
    throw new TranscribeError("TRANSCRIPT_NO_AUDIO", "转写结果为空（可能视频无人声）");
  }
  return { text: resultText, lang: resultLang || "zh", duration_s: resultDuration };
}

async function runOne(
  post_id: string,
  share_url: string,
  platform: "douyin" | "xiaohongshu",
): Promise<TranscriptExtractResult> {
  emitProgress(post_id, "resolving_url", 5);
  const mp4Url =
    platform === "xiaohongshu"
      ? await resolveXhsVideoDownloadUrl(share_url)
      : await resolveDouyinVideoDownloadUrl(share_url);
  if (!mp4Url) {
    return failure("VIDEO_RESOLVE_FAILED", "无法解析视频下载链接（可能视频已下架或链接失效）");
  }

  emitProgress(post_id, "downloading_mp4", 10);
  let dl: Awaited<ReturnType<typeof downloadMp4ToTemp>>;
  try {
    dl = await downloadMp4ToTemp(mp4Url, (bytes, total) => {
      const pct = total > 0 ? 10 + (bytes / total) * 20 : 10; // 10..30
      emitProgress(post_id, "downloading_mp4", Math.min(30, pct));
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return failure("TRANSCRIPT_DOWNLOAD_FAILED", `下载视频失败：${msg}`);
  }

  try {
    let result: { text: string; lang: string; duration_s: number };
    try {
      result = await transcribeLocalMp4(dl.path, post_id, (stage, rawPct) => {
        // 30..95 reserved for Python-side progress (loading_model + transcribing)
        const overall =
          stage === "loading_model"
            ? 30 + (rawPct / 100) * 10 // 30..40
            : 40 + (rawPct / 100) * 55; // 40..95
        emitProgress(post_id, stage, Math.min(95, Math.max(30, overall)));
      });
    } catch (err) {
      if (err instanceof TranscribeError) {
        return failure(err.code, err.message);
      }
      const msg = err instanceof Error ? err.message : String(err);
      return failure("TRANSCRIPT_FAILED", msg);
    }

    const transcribedAt = new Date().toISOString();
    try {
      getSharedStore().updateMaterialTranscript(post_id, result.text, transcribedAt);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`transcript: SQLite UPDATE failed for ${post_id}: ${msg}`);
      return failure("INTERNAL", `保存转写结果失败：${msg}`);
    }

    emitProgress(post_id, "transcribing", 100);
    return {
      schema_version: SCHEMA_VERSION,
      ok: true,
      post_id,
      transcript: result.text,
      transcribed_at: transcribedAt,
      language: result.lang,
      duration_s: result.duration_s,
    };
  } finally {
    await dl.cleanup();
  }
}

export function registerTranscriptExtractHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, rawArgs: unknown): Promise<TranscriptExtractResult> => {
    const start = Date.now();
    const parsed = TranscriptExtractRequest.safeParse(rawArgs);
    if (!parsed.success) {
      return failure("INVALID_INPUT", `invalid request: ${parsed.error.message}`);
    }
    const { post_id, share_url, platform } = parsed.data;

    try {
      const locked = await runWithTranscriptTaskLock(
        `transcript:extract:${post_id}:${start}`,
        `提取文案 ${post_id}`,
        async () => runOne(post_id, share_url, platform),
      );
      if (!locked.ok) {
        log.warn(
          `${CHANNEL} busy (${Date.now() - start} ms) post=${post_id} active=${locked.active.label}`,
        );
        return failure("TRANSCRIPT_BUSY", "已有语音转文本任务处理中，请稍后再试");
      }

      const result = locked.value;
      log.info(
        `${CHANNEL} ${result.ok ? "ok" : `err=${result.error.code}`} (${Date.now() - start} ms) post=${post_id}`,
      );
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error(`${CHANNEL} threw (${Date.now() - start} ms): ${msg}`);
      return failure("INTERNAL", msg);
    }
  });
}

export function unregisterTranscriptExtractHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
