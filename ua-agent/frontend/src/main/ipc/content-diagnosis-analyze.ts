import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { app, BrowserWindow, ipcMain } from "electron";
import log from "electron-log/main";

import { SCHEMA_VERSION, type ErrorEnvelope } from "../../shared/contracts/error";
import {
  CONTENT_DIAGNOSIS_EVENT_TOPIC,
  contentDiagnosisAnalyzeSuccessSchema,
  contentDiagnosisIdInputSchema,
  type ContentDiagnosisAnalyzeResult,
  type ContentDiagnosisEvent,
  type ContentDiagnosisFrame,
} from "../../shared/contracts/content-diagnosis";
import {
  extractAudioWav,
  extractTimedFrames,
  FrameExtractError,
  probeDurationSeconds,
  type TimedFrameSpec,
} from "../services/blogger/extract-frames";
import { resolveDouyinVideoDownloadUrl } from "../services/douyin/resolve-video-url";
import { buildContentDiagnosisReportPrompt } from "../services/content-diagnosis/report-prompt";
import {
  contentDiagnosisDataRoot,
  contentDiagnosisFramesDir,
  contentDiagnosisReportDraftPath,
  contentDiagnosisReportPath,
  getContentDiagnosis,
  updateContentDiagnosis,
  writeContentDiagnosisMarkdown,
  writeContentDiagnosisReadme,
} from "../services/content-diagnosis/store-fs";
import { getProvider, type ProviderId, type ProviderRunFinal } from "../services/llm/provider";
import { defaultLlmWorkspace } from "../services/llm/workspace";
import { getSettingsSync } from "../services/settings/store";
import { downloadMp4ToTemp } from "../services/transcript/download-mp4";
import { runWithTranscriptTaskLock } from "../services/transcript/task-lock";
import { resolveXhsVideoDownloadUrl } from "../services/xiaohongshu/resolve-video-url";
import { TranscribeError, transcribeLocalMp4 } from "./transcript-extract";

const CHANNEL = "content-diagnosis:analyze";
const GUIDE_ROOT = "D:\\code\\creator-notes\\notes\\book";

function nowIso(): string {
  return new Date().toISOString();
}

function errorEnvelope(
  code: ErrorEnvelope["error"]["code"],
  message: string,
): ErrorEnvelope {
  return {
    schema_version: SCHEMA_VERSION,
    ok: false,
    error: { code, message: message.length > 1024 ? `${message.slice(0, 1021)}...` : message },
  };
}

function emitEvent(event: ContentDiagnosisEvent): void {
  for (const bw of BrowserWindow.getAllWindows()) {
    try {
      bw.webContents.send(CONTENT_DIAGNOSIS_EVENT_TOPIC, event);
    } catch (err) {
      log.warn(
        `webContents.send threw for ${CONTENT_DIAGNOSIS_EVENT_TOPIC}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

function totalFrameCount(durationSecs: number): number {
  if (durationSecs <= 15) return 5;
  if (durationSecs <= 30) return 6;
  if (durationSecs <= 60) return 8;
  return 10;
}

function frameSpecs(durationSecs: number): TimedFrameSpec[] {
  const total = totalFrameCount(durationSecs);
  const samples = total - 1;
  const specs: TimedFrameSpec[] = [{ filename: "cover.jpg", timestampSecs: 0 }];
  const start = Math.max(0.1, durationSecs * 0.05);
  const end = Math.max(start, durationSecs * 0.9);
  for (let i = 0; i < samples; i += 1) {
    const ratio = samples === 1 ? 0 : i / (samples - 1);
    specs.push({
      filename: `${String(i + 1).padStart(2, "0")}.jpg`,
      timestampSecs: start + (end - start) * ratio,
    });
  }
  return specs;
}

function frameMetaFromSpecs(
  specs: TimedFrameSpec[],
  absPaths: string[],
): ContentDiagnosisFrame[] {
  const userDataRoot = app.getPath("userData");
  return specs.map((spec, index) => ({
    kind: index === 0 ? "cover" : "sample",
    path: path.relative(userDataRoot, absPaths[index] ?? "").split(path.sep).join("/"),
    index,
    timestamp_secs: spec.timestampSecs,
  }));
}

async function analyzeMedia(id: string): Promise<{
  frames: ContentDiagnosisFrame[];
  transcript: string;
  transcriptLang: string;
}> {
  const item = await getContentDiagnosis(id);
  if (item === null) throw new Error("未找到该内容诊断记录");

  const mp4Url =
    item.platform === "xiaohongshu"
      ? await resolveXhsVideoDownloadUrl(item.canonical_url)
      : await resolveDouyinVideoDownloadUrl(item.canonical_url);
  if (mp4Url === null) {
    throw new Error("无法解析视频下载链接（视频已下架或链接失效）");
  }

  const dl = await downloadMp4ToTemp(mp4Url);
  const wavPath = `${dl.path}.audio.wav`;
  let wavCreated = false;
  try {
    const duration = await probeDurationSeconds(dl.path);
    const specs = frameSpecs(duration);
    const absFrames = await extractTimedFrames(dl.path, contentDiagnosisFramesDir(id), specs);
    await extractAudioWav(dl.path, wavPath);
    wavCreated = true;
    const { text, lang } = await transcribeLocalMp4(wavPath, `content-diagnosis-${id}`);
    return {
      frames: frameMetaFromSpecs(specs, absFrames),
      transcript: text,
      transcriptLang: lang,
    };
  } finally {
    await dl.cleanup();
    if (wavCreated) {
      await fs.rm(wavPath, { force: true }).catch(() => {});
    }
  }
}

function activeProviderId(): ProviderId {
  return getSettingsSync().llm.provider;
}

async function generateReport(id: string, win: BrowserWindow): Promise<void> {
  const item = await getContentDiagnosis(id);
  if (item === null) throw new Error("未找到该内容诊断记录");

  const providerId = activeProviderId();
  const provider = getProvider(providerId);
  if (provider === null) throw new Error("LLM_NOT_CONFIGURED: 未找到当前设置的 LLM provider");

  const runId = randomUUID();
  const dataRoot = contentDiagnosisDataRoot(id);
  const reportPath = contentDiagnosisReportPath(id);
  const draftPath = contentDiagnosisReportDraftPath(id);
  const logPath = path.join(dataRoot, "analysis.log");
  const prompt = buildContentDiagnosisReportPrompt({
    dataRoot,
    guideRoot: GUIDE_ROOT,
    runId,
    platform: item.platform,
  });

  await writeContentDiagnosisReadme({ id, guideRoot: GUIDE_ROOT });
  await fs.rm(draftPath, { force: true }).catch(() => void 0);

  emitEvent({
    schema_version: SCHEMA_VERSION,
    phase: "report-started",
    analysis_id: id,
    started_at: nowIso(),
    run_id: runId,
  });

  const outcome = await new Promise<ProviderRunFinal & { code: number | null }>((resolve, reject) => {
    provider
      .run(
        {
          runId,
          prompt,
          cwd: defaultLlmWorkspace(),
          onChunk: (_kind, data) => {
            fs.appendFile(logPath, data, "utf8").catch(() => void 0);
          },
          onClose: (code, final) => resolve({ code, ...final }),
        },
        win,
      )
      .catch(reject);
  });

  let markdown: string;
  try {
    markdown = await fs.readFile(draftPath, "utf8");
  } catch (err) {
    try {
      markdown = await fs.readFile(reportPath, "utf8");
    } catch (finalErr) {
      const fallback =
        finalErr instanceof Error ? finalErr.message : err instanceof Error ? err.message : String(err);
      throw new Error(outcome.resultError?.trim() || fallback);
    }
  }

  if (outcome.code !== 0 || outcome.resultError !== null) {
    throw new Error(outcome.resultError ?? `report provider exited code=${outcome.code ?? "?"}`);
  }

  await writeContentDiagnosisMarkdown(id, markdown);
  await fs.rm(draftPath, { force: true }).catch(() => void 0);
  const stat = await fs.stat(reportPath);
  await updateContentDiagnosis(id, {
    status: "report_ready",
    analysis_generated_at: stat.mtime.toISOString(),
    last_error: null,
    updated_at: nowIso(),
  });

  emitEvent({
    schema_version: SCHEMA_VERSION,
    phase: "report-ended",
    analysis_id: id,
    status: "ok",
    error: null,
    run_id: runId,
    ended_at: nowIso(),
  });
}

async function runAnalyze(id: string, win: BrowserWindow): Promise<ContentDiagnosisAnalyzeResult> {
  const item = await getContentDiagnosis(id);
  if (item === null) return errorEnvelope("INVALID_INPUT", "未找到该内容诊断记录") as ContentDiagnosisAnalyzeResult;

  emitEvent({ schema_version: SCHEMA_VERSION, phase: "media-started", analysis_id: id, started_at: nowIso() });
  try {
    const locked = await runWithTranscriptTaskLock(
      `content-diagnosis:${id}:${Date.now()}`,
      `内容诊断 ${id}`,
      async () => analyzeMedia(id),
    );
    if (!locked.ok) {
      return errorEnvelope("TRANSCRIPT_BUSY", "已有语音转文本任务处理中，请稍后再试") as ContentDiagnosisAnalyzeResult;
    }
    await updateContentDiagnosis(id, {
      status: "media_ready",
      frames: locked.value.frames,
      transcript: locked.value.transcript,
      transcript_lang: locked.value.transcriptLang,
      media_analyzed_at: nowIso(),
      last_error: null,
      updated_at: nowIso(),
    });
    emitEvent({
      schema_version: SCHEMA_VERSION,
      phase: "media-ended",
      analysis_id: id,
      status: "ok",
      frame_count: locked.value.frames.length,
      error: null,
      ended_at: nowIso(),
    });
  } catch (err) {
    const code =
      err instanceof TranscribeError
        ? err.code
        : err instanceof FrameExtractError
          ? err.code
          : "INTERNAL";
    const message = err instanceof Error ? err.message : String(err);
    await updateContentDiagnosis(id, {
      status: "error",
      last_error: `${code}: ${message}`.slice(0, 1024),
      updated_at: nowIso(),
    });
    emitEvent({
      schema_version: SCHEMA_VERSION,
      phase: "media-ended",
      analysis_id: id,
      status: "error",
      frame_count: 0,
      error: message.slice(0, 1024),
      ended_at: nowIso(),
    });
    return errorEnvelope(code, message) as ContentDiagnosisAnalyzeResult;
  }

  try {
    await generateReport(id, win);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateContentDiagnosis(id, {
      status: "error",
      last_error: message.slice(0, 1024),
      updated_at: nowIso(),
    });
    emitEvent({
      schema_version: SCHEMA_VERSION,
      phase: "report-ended",
      analysis_id: id,
      status: "error",
      error: message.slice(0, 1024),
      run_id: randomUUID(),
      ended_at: nowIso(),
    });
    return errorEnvelope("INTERNAL", message) as ContentDiagnosisAnalyzeResult;
  }

  const updated = await getContentDiagnosis(id);
  return contentDiagnosisAnalyzeSuccessSchema.parse({
    schema_version: SCHEMA_VERSION,
    ok: true,
    item: updated ?? item,
  });
}

const inflight = new Set<string>();

export function registerContentDiagnosisAnalyzeHandler(): void {
  ipcMain.handle(CHANNEL, async (event, rawArgs: unknown): Promise<ContentDiagnosisAnalyzeResult> => {
    const parsed = contentDiagnosisIdInputSchema.safeParse(rawArgs);
    if (!parsed.success) {
      return errorEnvelope("INVALID_INPUT", parsed.error.issues[0]?.message ?? "无效输入") as ContentDiagnosisAnalyzeResult;
    }
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win === null) return errorEnvelope("INTERNAL", "未找到当前窗口") as ContentDiagnosisAnalyzeResult;

    if (inflight.has(parsed.data.id)) {
      return errorEnvelope("ANALYZE_BUSY", "该内容诊断任务分析中，请等待完成") as ContentDiagnosisAnalyzeResult;
    }
    inflight.add(parsed.data.id);
    try {
      return await runAnalyze(parsed.data.id, win);
    } finally {
      inflight.delete(parsed.data.id);
    }
  });
}

export function unregisterContentDiagnosisAnalyzeHandler(): void {
  ipcMain.removeHandler(CHANNEL);
  inflight.clear();
}
