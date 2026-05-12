import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { app, BrowserWindow, ipcMain } from "electron";
import log from "electron-log/main";

import { SCHEMA_VERSION } from "../../shared/contracts/error";
import {
  BLOGGER_EVENT_TOPIC,
  bloggerAnalyzeCancelInputSchema,
  bloggerAnalyzeCancelSuccessSchema,
  bloggerAnalyzeInputSchema,
  bloggerAnalyzeSuccessSchema,
  type Blogger,
  type BloggerAnalyzeCancelResult,
  type BloggerAnalyzeResult,
  type BloggerEvent,
  type BloggerVideoSample,
} from "../../shared/contracts/blogger";
import type { ErrorEnvelope } from "../../shared/contracts/error";
import {
  blogger4FramesDir,
  extract4Frames,
  extractAudioWav,
  FrameExtractError,
} from "../services/blogger/extract-frames";
import { buildBloggerReportPrompt } from "../services/blogger/report-prompt";
import {
  bloggerAnalysisPath,
  bloggerAnalysisDraftPath,
  bloggerDataRoot,
  getBlogger,
  listBloggerSamples,
  updateBloggerReportState,
  updateBloggerSampleAnalysis,
  writeBloggerAnalysisMarkdown,
} from "../services/blogger/store-fs";
import { resolveDouyinVideoDownloadUrl } from "../services/douyin/resolve-video-url";
import { defaultLlmWorkspace } from "../services/llm/workspace";
import {
  getProvider,
  type ProviderId,
  type ProviderRunFinal,
} from "../services/llm/provider";
import { getSettingsSync } from "../services/settings/store";
import { downloadMp4ToTemp } from "../services/transcript/download-mp4";
import { runWithTranscriptTaskLock } from "../services/transcript/task-lock";
import { describeBloggerSampleFailure } from "../../shared/blogger/sampleFailure";

import { runBloggerSampleVideos } from "./blogger-sample-videos";
import { TranscribeError, transcribeLocalMp4 } from "./transcript-extract";

const ANALYZE_CHANNEL = "blogger:analyze";
const CANCEL_CHANNEL = "blogger:analyze-cancel";

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

function rawErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function isFileBusyError(err: unknown): boolean {
  const code =
    err && typeof err === "object" && "code" in err ? String((err as { code?: unknown }).code ?? "") : "";
  const message = rawErrorMessage(err);
  const pathHint = /analysis(\.generated)?\.md/i.test(message);
  const busyHint =
    code === "EPERM" ||
    code === "EBUSY" ||
    /(?:EPERM|EBUSY)/i.test(message) ||
    /operation not permitted/i.test(message) ||
    /resource busy or locked/i.test(message);
  return pathHint && busyHint;
}

function normalizeAnalyzeErrorMessage(err: unknown): string {
  if (isFileBusyError(err)) {
    return "报告文件正在被其他程序占用，请关闭正在查看、编辑或同步该报告的程序后重试。";
  }
  return rawErrorMessage(err);
}

function emitEvent(event: BloggerEvent): void {
  for (const bw of BrowserWindow.getAllWindows()) {
    try {
      bw.webContents.send(BLOGGER_EVENT_TOPIC, event);
    } catch (err) {
      log.warn(
        `webContents.send threw for ${BLOGGER_EVENT_TOPIC}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

class CancelledError extends Error {
  constructor() {
    super("analyze cancelled");
  }
}

interface InflightRun {
  abort: AbortController;
  providerId: ProviderId | null;
  providerRunId: string | null;
}

const inflight = new Map<string, InflightRun>();

function checkAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new CancelledError();
}

function activeProviderId(): ProviderId {
  return getSettingsSync().llm.provider;
}

async function analyzeOneVideo(
  bloggerId: string,
  sample: BloggerVideoSample,
  signal: AbortSignal,
): Promise<{ transcript: string; transcript_lang: string; frames: string[] }> {
  checkAborted(signal);
  const mp4Url = await resolveDouyinVideoDownloadUrl(sample.video_url);
  if (mp4Url === null) {
    throw new Error("无法解析视频下载链接（视频已下架或链接失效）");
  }
  checkAborted(signal);

  const dl = await downloadMp4ToTemp(mp4Url);
  const wavPath = `${dl.path}.audio.wav`;
  let wavCreated = false;
  try {
    checkAborted(signal);
    const outDir = blogger4FramesDir(bloggerId, sample.video_url);
    const frames = await extract4Frames(dl.path, outDir);
    checkAborted(signal);
    await extractAudioWav(dl.path, wavPath);
    wavCreated = true;
    checkAborted(signal);
    const { text, lang } = await transcribeLocalMp4(
      wavPath,
      `blogger-${bloggerId}-${sample.position}`,
    );
    return { transcript: text, transcript_lang: lang, frames };
  } finally {
    await dl.cleanup();
    if (wavCreated) {
      await fs.rm(wavPath, { force: true }).catch(() => {});
    }
  }
}

async function processAnalyzeTodo(
  bloggerId: string,
  todo: BloggerVideoSample[],
  baseProcessed: number,
  totalSamples: number,
  signal: AbortSignal,
): Promise<{ okCount: number; errCount: number; supplementCount: number }> {
  let okCount = 0;
  let errCount = 0;
  let supplementCount = 0;

  for (let i = 0; i < todo.length; i += 1) {
    const sample = todo[i];
    if (sample === undefined) continue;
    checkAborted(signal);
    emitEvent({
      schema_version: SCHEMA_VERSION,
      phase: "analyze-video-started",
      blogger_id: bloggerId,
      video_url: sample.video_url,
      position: sample.position,
      processed: baseProcessed + i,
      total_to_process: totalSamples,
    });
    const videoStart = Date.now();
    log.info(
      `blogger.analyze.video_start id=${bloggerId} pos=${sample.position} (${baseProcessed + i + 1}/${totalSamples}) url=${sample.video_url}`,
    );

    try {
      const out = await analyzeOneVideo(bloggerId, sample, signal);
      log.info(
        `blogger.analyze.video_ok id=${bloggerId} pos=${sample.position} (${Date.now() - videoStart} ms) frames=${out.frames.length} transcript_len=${out.transcript.length}`,
      );
      const userDataRoot = app.getPath("userData");
      const relFrames = out.frames.map((abs) =>
        path.relative(userDataRoot, abs).split(path.sep).join("/"),
      );
      const analyzedAt = nowIso();
      await updateBloggerSampleAnalysis(bloggerId, sample.video_url, {
        transcript: out.transcript,
        transcript_lang: out.transcript_lang,
        frames: relFrames,
        analyzed_at: analyzedAt,
        analyze_error: null,
      });

      const videoDir = path.dirname(out.frames[0] ?? "");
      if (videoDir.length > 0) {
        try {
          await fs.writeFile(
            path.join(videoDir, "transcript.txt"),
            out.transcript,
            "utf8",
          );
        } catch (err) {
          log.warn(
            `blogger.analyze.transcript_txt_failed id=${bloggerId} url=${sample.video_url} ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }

      okCount += 1;
      emitEvent({
        schema_version: SCHEMA_VERSION,
        phase: "analyze-video-ended",
        blogger_id: bloggerId,
        video_url: sample.video_url,
        position: sample.position,
        status: "ok",
        error: null,
      });
    } catch (err) {
      if (err instanceof CancelledError) {
        throw err;
      }
      const code =
        err instanceof TranscribeError
          ? err.code
          : err instanceof FrameExtractError
            ? err.code
            : "INTERNAL";
      const msg = err instanceof Error ? err.message : String(err);
      const failure = describeBloggerSampleFailure(`${code}: ${msg}`);
      log.warn(
        `blogger.analyze.video_failed id=${bloggerId} url=${sample.video_url} code=${code} ${msg}`,
      );
      await updateBloggerSampleAnalysis(bloggerId, sample.video_url, {
        analyze_error: `${code}: ${msg}`.slice(0, 1024),
      });
      errCount += 1;
      if (failure?.shouldSupplement === true) supplementCount += 1;
      emitEvent({
        schema_version: SCHEMA_VERSION,
        phase: "analyze-video-ended",
        blogger_id: bloggerId,
        video_url: sample.video_url,
        position: sample.position,
        status: "error",
        error: msg.slice(0, 1024),
      });
    }
  }

  return { okCount, errCount, supplementCount };
}

async function generateReport(
  bloggerId: string,
  signal: AbortSignal,
  win: BrowserWindow,
): Promise<void> {
  checkAborted(signal);
  const providerId = activeProviderId();
  const provider = getProvider(providerId);
  if (provider === null) {
    throw new Error("LLM_NOT_CONFIGURED: 未找到当前设置的 LLM provider");
  }

  const runId = randomUUID();
  const reportPath = bloggerAnalysisPath(bloggerId);
  const reportDraftPath = bloggerAnalysisDraftPath(bloggerId);
  const reportLogPath = path.join(bloggerDataRoot(bloggerId), "analysis.log");
  const prompt = buildBloggerReportPrompt({
    dataRoot: bloggerDataRoot(bloggerId),
    runId,
    focusCount: 4,
  });

  const inflightRun = inflight.get(bloggerId);
  if (inflightRun !== undefined) {
    inflightRun.providerId = providerId;
    inflightRun.providerRunId = runId;
  }

  emitEvent({
    schema_version: SCHEMA_VERSION,
    phase: "analyze-report-started",
    blogger_id: bloggerId,
    started_at: nowIso(),
    run_id: runId,
  });

  await fs.rm(reportDraftPath, { force: true }).catch(() => void 0);

  const outcome = await (async (): Promise<ProviderRunFinal & { code: number | null }> => {
    try {
      return await new Promise((resolve, reject) => {
        provider.run(
          {
            runId,
            prompt,
            cwd: defaultLlmWorkspace(),
            onChunk: (_kind, data) => {
              fs.appendFile(reportLogPath, data, "utf8").catch(() => void 0);
            },
            onClose: (code, final) => {
              resolve({ code, ...final });
            },
          },
          win,
        ).catch(reject);
      });
    } finally {
      if (inflightRun !== undefined) {
        inflightRun.providerId = null;
        inflightRun.providerRunId = null;
      }
    }
  })();

  checkAborted(signal);

  let reportMarkdown: string;
  try {
    reportMarkdown = await fs.readFile(reportDraftPath, "utf8");
  } catch (err) {
    try {
      reportMarkdown = await fs.readFile(reportPath, "utf8");
    } catch (finalErr) {
      const baseMessage = outcome.resultError?.trim();
      const fallback =
        finalErr instanceof Error ? finalErr.message : err instanceof Error ? err.message : String(err);
      throw new Error(baseMessage && baseMessage.length > 0 ? baseMessage : fallback);
    }
  }

  if (outcome.code !== 0 || outcome.resultError !== null) {
    throw new Error(outcome.resultError ?? `report provider exited code=${outcome.code ?? "?"}`);
  }

  await writeBloggerAnalysisMarkdown(bloggerId, reportMarkdown);
  await fs.rm(reportDraftPath, { force: true }).catch(() => void 0);

  const reportStat = await fs.stat(reportPath);

  await updateBloggerReportState(bloggerId, {
    analysis_generated_at: reportStat.mtime.toISOString(),
    analysis_error: null,
    updated_at: nowIso(),
  });

  emitEvent({
    schema_version: SCHEMA_VERSION,
    phase: "analyze-report-ended",
    blogger_id: bloggerId,
    status: "ok",
    last_error: null,
    report_path: reportPath,
    run_id: runId,
    ended_at: nowIso(),
  });
}

async function runAnalyze(
  bloggerId: string,
  signal: AbortSignal,
  win: BrowserWindow,
): Promise<BloggerAnalyzeResult> {
  const blogger = await getBlogger(bloggerId);
  if (blogger === null) {
    return errorEnvelope("INVALID_INPUT", "未找到该博主") as BloggerAnalyzeResult;
  }
  if (blogger.status !== "profile_ready" && blogger.status !== "sampled") {
    return errorEnvelope(
      "INVALID_INPUT",
      "请先完成「采集资料」再分析作品",
    ) as BloggerAnalyzeResult;
  }

  const sampleRequired = blogger.status === "profile_ready";
  emitEvent({
    schema_version: SCHEMA_VERSION,
    phase: "analyze-started",
    blogger_id: bloggerId,
    started_at: nowIso(),
    sample_required: sampleRequired,
  });

  if (sampleRequired) {
    const sampleResult = await runBloggerSampleVideos({ id: bloggerId });
    if (!sampleResult.ok) {
      emitEvent({
        schema_version: SCHEMA_VERSION,
        phase: "analyze-ended",
        blogger_id: bloggerId,
        ok_count: 0,
        error_count: 0,
        ended_at: nowIso(),
      });
      return sampleResult as BloggerAnalyzeResult;
    }
    checkAborted(signal);
  }

  const samples = await listBloggerSamples(bloggerId);
  const analyzedAlready = samples.filter(
    (s) => s.analyzed_at !== null && (s.analyze_error ?? "") === "",
  ).length;
  const todo = samples.filter((s) => s.transcript === null || s.frames.length < 4);

  let okCount = 0;
  let errCount = 0;
  let supplementCount = 0;
  if (todo.length > 0) {
    const locked = await runWithTranscriptTaskLock(
      `blogger:analyze:${bloggerId}:${Date.now()}`,
      `博主拆解 ${bloggerId}`,
      async () => processAnalyzeTodo(bloggerId, todo, analyzedAlready, samples.length, signal),
    );
    if (!locked.ok) {
      return errorEnvelope(
        "TRANSCRIPT_BUSY",
        "已有语音转文本任务处理中，请稍后再试",
      ) as BloggerAnalyzeResult;
    }
    okCount = locked.value.okCount;
    errCount = locked.value.errCount;
    supplementCount = locked.value.supplementCount;
  }

  if (supplementCount > 0) {
    const supplemental = await runBloggerSampleVideos({
      id: bloggerId,
      k: supplementCount,
      append: true,
      markFailureAsError: false,
    });
    if (supplemental.ok) {
      checkAborted(signal);
      const refreshed = await listBloggerSamples(bloggerId);
      const knownUrls = new Set(samples.map((s) => s.video_url));
      const newTodo = refreshed.filter(
        (s) => !knownUrls.has(s.video_url) && (s.transcript === null || s.frames.length < 4),
      );
      if (newTodo.length > 0) {
        const locked = await runWithTranscriptTaskLock(
          `blogger:analyze:${bloggerId}:${Date.now()}:supplement`,
          `博主拆解补样 ${bloggerId}`,
          async () =>
            processAnalyzeTodo(
              bloggerId,
              newTodo,
              analyzedAlready + todo.length,
              refreshed.length,
              signal,
            ),
        );
        if (!locked.ok) {
          return errorEnvelope(
            "TRANSCRIPT_BUSY",
            "已有语音转文本任务处理中，请稍后再试",
          ) as BloggerAnalyzeResult;
        }
        okCount += locked.value.okCount;
        errCount += locked.value.errCount;
      }
    }
  }

  try {
    await generateReport(bloggerId, signal, win);
  } catch (err) {
    const message = normalizeAnalyzeErrorMessage(err);
    if (!(err instanceof CancelledError)) {
      await updateBloggerReportState(bloggerId, {
        analysis_generated_at: null,
        analysis_error: message.slice(0, 1024),
        updated_at: nowIso(),
      });
      emitEvent({
        schema_version: SCHEMA_VERSION,
        phase: "analyze-report-ended",
        blogger_id: bloggerId,
        status: "error",
        last_error: message.slice(0, 1024),
        report_path: bloggerAnalysisPath(bloggerId),
        run_id: inflight.get(bloggerId)?.providerRunId ?? randomUUID(),
        ended_at: nowIso(),
      });
    }
    emitEvent({
      schema_version: SCHEMA_VERSION,
      phase: "analyze-ended",
      blogger_id: bloggerId,
      ok_count: okCount,
      error_count: errCount,
      ended_at: nowIso(),
    });
    return errorEnvelope(
      "INTERNAL",
      err instanceof CancelledError ? "analyze cancelled" : message,
    ) as BloggerAnalyzeResult;
  }

  emitEvent({
    schema_version: SCHEMA_VERSION,
    phase: "analyze-ended",
    blogger_id: bloggerId,
    ok_count: okCount,
    error_count: errCount,
    ended_at: nowIso(),
  });

  const updated = await getBlogger(bloggerId);
  const finalBlogger: Blogger = updated ?? blogger;
  return bloggerAnalyzeSuccessSchema.parse({
    schema_version: SCHEMA_VERSION,
    ok: true,
    blogger: finalBlogger,
    ok_count: okCount,
    error_count: errCount,
  });
}

export function registerBloggerAnalyzeHandlers(): void {
  ipcMain.handle(ANALYZE_CHANNEL, async (event, rawArgs: unknown): Promise<BloggerAnalyzeResult> => {
    const start = Date.now();
    const parsed = bloggerAnalyzeInputSchema.safeParse(rawArgs);
    if (!parsed.success) {
      return errorEnvelope(
        "INVALID_INPUT",
        parsed.error.issues[0]?.message ?? "无效输入",
      ) as BloggerAnalyzeResult;
    }

    const win = BrowserWindow.fromWebContents(event.sender);
    if (win === null) {
      return errorEnvelope("INTERNAL", "未找到当前窗口") as BloggerAnalyzeResult;
    }

    const { id } = parsed.data;
    if (inflight.has(id)) {
      return errorEnvelope("ANALYZE_BUSY", "该博主拆解中，请等待完成") as BloggerAnalyzeResult;
    }

    const controller = new AbortController();
    inflight.set(id, { abort: controller, providerId: null, providerRunId: null });
    try {
      const result = await runAnalyze(id, controller.signal, win);
      log.info(
        `${ANALYZE_CHANNEL} ${result.ok ? `ok ok=${result.ok_count} err=${result.error_count}` : `err=${result.error.code}`} (${Date.now() - start} ms) id=${id}`,
      );
      return result;
    } catch (err) {
      const msg = normalizeAnalyzeErrorMessage(err);
      log.error(`${ANALYZE_CHANNEL} threw (${Date.now() - start} ms): ${msg}`);
      return errorEnvelope("INTERNAL", msg) as BloggerAnalyzeResult;
    } finally {
      inflight.delete(id);
    }
  });

  ipcMain.handle(CANCEL_CHANNEL, async (_event, rawArgs: unknown): Promise<BloggerAnalyzeCancelResult> => {
    const parsed = bloggerAnalyzeCancelInputSchema.safeParse(rawArgs);
    if (!parsed.success) {
      return errorEnvelope(
        "INVALID_INPUT",
        parsed.error.issues[0]?.message ?? "无效输入",
      ) as BloggerAnalyzeCancelResult;
    }
    const run = inflight.get(parsed.data.id);
    if (run === undefined) {
      return bloggerAnalyzeCancelSuccessSchema.parse({
        schema_version: SCHEMA_VERSION,
        ok: true,
        cancelled: false,
      });
    }
    run.abort.abort();
    if (run.providerId !== null && run.providerRunId !== null) {
      getProvider(run.providerId)?.cancel(run.providerRunId);
    }
    return bloggerAnalyzeCancelSuccessSchema.parse({
      schema_version: SCHEMA_VERSION,
      ok: true,
      cancelled: true,
    });
  });
}

export function unregisterBloggerAnalyzeHandlers(): void {
  ipcMain.removeHandler(ANALYZE_CHANNEL);
  ipcMain.removeHandler(CANCEL_CHANNEL);
}

export function abortAllInflightAnalyze(): void {
  for (const run of inflight.values()) {
    run.abort.abort();
    if (run.providerId !== null && run.providerRunId !== null) {
      getProvider(run.providerId)?.cancel(run.providerRunId);
    }
  }
}
