import { app, BrowserWindow, net, protocol, shell } from "electron";
import log from "electron-log/main";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { BLOGGER_EVENT_TOPIC } from "../shared/contracts/blogger";
import { HOT_MATERIAL_EVENT_TOPIC } from "../shared/contracts/hot-material-analysis";
import { MANUAL_CAPTURE_EVENT_TOPIC } from "../shared/contracts/manual-capture";
import { BATCH_EVENT_TOPIC } from "../shared/contracts/keyword/batch-event";
import { SCHEDULER_EVENT_TOPIC } from "../shared/contracts/scheduling";

import { registerBatchStartHandler, unregisterBatchStartHandler } from "./ipc/batch-start";
import { registerBatchStatusHandler, unregisterBatchStatusHandler } from "./ipc/batch-status";
import { registerBatchStopHandler, unregisterBatchStopHandler } from "./ipc/batch-stop";
import {
  registerBloggerCaptureProfileHandler,
  unregisterBloggerCaptureProfileHandler,
} from "./ipc/blogger-capture-profile";
import {
  registerBloggerCreateHandler,
  unregisterBloggerCreateHandler,
} from "./ipc/blogger-create";
import {
  registerBloggerDeleteHandler,
  unregisterBloggerDeleteHandler,
} from "./ipc/blogger-delete";
import {
  registerBloggerDeleteSampleHandler,
  unregisterBloggerDeleteSampleHandler,
} from "./ipc/blogger-delete-sample";
import {
  registerBloggerGetReportHandler,
  unregisterBloggerGetReportHandler,
} from "./ipc/blogger-get-report";
import {
  registerBloggerListHandler,
  unregisterBloggerListHandler,
} from "./ipc/blogger-list";
import {
  registerBloggerListSamplesHandler,
  unregisterBloggerListSamplesHandler,
} from "./ipc/blogger-list-samples";
import {
  registerBloggerSampleVideosHandler,
  unregisterBloggerSampleVideosHandler,
} from "./ipc/blogger-sample-videos";
import {
  abortAllInflightAnalyze,
  registerBloggerAnalyzeHandlers,
  unregisterBloggerAnalyzeHandlers,
} from "./ipc/blogger-analyze";
import { registerAiChatHandlers, unregisterAiChatHandlers } from "./ipc/ai-chat";
import { registerPersonaHandlers, unregisterPersonaHandlers } from "./ipc/persona";
import {
  registerAgentAuthHandlers,
  unregisterAgentAuthHandlers,
} from "./ipc/agent-auth";
import {
  registerContentDiagnosisAnalyzeHandler,
  unregisterContentDiagnosisAnalyzeHandler,
} from "./ipc/content-diagnosis-analyze";
import {
  registerContentDiagnosisCreateHandler,
  unregisterContentDiagnosisCreateHandler,
} from "./ipc/content-diagnosis-create";
import {
  registerContentDiagnosisDeleteHandler,
  unregisterContentDiagnosisDeleteHandler,
} from "./ipc/content-diagnosis-delete";
import {
  registerContentDiagnosisGetReportHandler,
  unregisterContentDiagnosisGetReportHandler,
} from "./ipc/content-diagnosis-get-report";
import {
  registerContentDiagnosisListHandler,
  unregisterContentDiagnosisListHandler,
} from "./ipc/content-diagnosis-list";
import {
  registerHotMaterialAnalyzeHandler,
  unregisterHotMaterialAnalyzeHandler,
} from "./ipc/hot-material-analyze";
import { ensureDouyinContentDiagnosisReportSkill } from "./services/content-diagnosis/report-skill";
import {
  registerHotMaterialCreateHandler,
  unregisterHotMaterialCreateHandler,
} from "./ipc/hot-material-create";
import {
  registerHotMaterialDeleteHandler,
  unregisterHotMaterialDeleteHandler,
} from "./ipc/hot-material-delete";
import {
  registerHotMaterialGetReportHandler,
  unregisterHotMaterialGetReportHandler,
} from "./ipc/hot-material-get-report";
import {
  registerHotMaterialListHandler,
  unregisterHotMaterialListHandler,
} from "./ipc/hot-material-list";
import {
  registerKeywordCreateHandler,
  unregisterKeywordCreateHandler,
} from "./ipc/keyword-create";
import {
  registerKeywordDeleteHandler,
  unregisterKeywordDeleteHandler,
} from "./ipc/keyword-delete";
import { registerKeywordListHandler, unregisterKeywordListHandler } from "./ipc/keyword-list";
import {
  registerKeywordUpdateHandler,
  unregisterKeywordUpdateHandler,
} from "./ipc/keyword-update";
import { registerLibraryDeleteHandler, unregisterLibraryDeleteHandler } from "./ipc/library-delete";
import { registerLibraryListHandler, unregisterLibraryListHandler } from "./ipc/library-list";
import {
  registerManualCaptureStartHandler,
  unregisterManualCaptureStartHandler,
} from "./ipc/manual-capture-start";
import {
  registerManualCaptureStatusHandler,
  unregisterManualCaptureStatusHandler,
} from "./ipc/manual-capture-status";
import {
  registerManualCaptureStopHandler,
  unregisterManualCaptureStopHandler,
} from "./ipc/manual-capture-stop";
import { registerDouyinHotHandler, unregisterDouyinHotHandler } from "./ipc/douyin-hot";
import {
  registerDouyinVideoHandler,
  unregisterDouyinVideoHandler,
} from "./ipc/douyin-video";
import {
  registerTranscriptExtractHandler,
  unregisterTranscriptExtractHandler,
} from "./ipc/transcript-extract";
import {
  registerAsrHandlers,
  unregisterAsrHandlers,
} from "./ipc/whisper-install";
import { registerPingHandler, unregisterPingHandler } from "./ipc/ping";
import {
  registerSessionInstallBrowserHandler,
  unregisterSessionInstallBrowserHandler,
} from "./ipc/session-install-browser";
import {
  registerSessionResetHandler,
  unregisterSessionResetHandler,
} from "./ipc/session-reset";
import {
  registerSessionStartHandler,
  unregisterSessionStartHandler,
} from "./ipc/session-start";
import {
  registerSessionStatusHandler,
  unregisterSessionStatusHandler,
} from "./ipc/session-status";
import {
  registerSchedulerStatusHandler,
  unregisterSchedulerStatusHandler,
} from "./ipc/scheduler-status";
import {
  registerSelfMediaGuideListHandler,
  unregisterSelfMediaGuideListHandler,
} from "./ipc/self-media-guide-list";
import {
  registerTrackAnalysisHandlers,
  unregisterTrackAnalysisHandlers,
} from "./ipc/track-analysis";
import { registerSettingsHandlers, unregisterSettingsHandlers } from "./ipc/settings";
import { registerClaudeCodeProvider } from "./services/llm/claude-code-provider";
import { registerCodexProvider } from "./services/llm/codex-provider";
import { registerKimiProvider } from "./services/llm/kimi-provider";
import { ensureBundledAgentsFile } from "./services/agents-file/bootstrap-data";
import { ensureBundledBloggerData } from "./services/blogger/bootstrap-data";
import { ensureDouyinBloggerReportSkill } from "./services/blogger/report-skill";
import { ensureDouyinHotMaterialReportSkill } from "./services/hot-material/report-skill";
import { resetClaudeCache } from "./services/llm/claude-runner";
import { resetCodexCache } from "./services/llm/codex-runner";
import { resetKimiCache } from "./services/llm/kimi-runner";
import { ensurePersonaWorkspaceFiles } from "./services/persona/workspace-store";
import { registerShellOpenLogsHandler, unregisterShellOpenLogsHandler } from "./ipc/shell-open-logs";
import {
  registerWindowControlHandlers,
  unregisterWindowControlHandlers,
} from "./ipc/window-controls";
import { initScheduler, shutdownScheduler } from "./services/scheduler/scheduler";
import { getSettings, onSettingsChange } from "./services/settings/store";
import { getUtilityHost, shutdownUtilityHost } from "./utility-host";

// Packaged: point patchright at the bundled browsers under extraResources/playwright-browsers.
// Must run before any utility process is forked so the env propagates.
if (app.isPackaged) {
  process.env["PLAYWRIGHT_BROWSERS_PATH"] = path.join(process.resourcesPath, "playwright-browsers");
}

// `userdata://` — a custom protocol that maps URLs like
// `userdata://blogger-frames/<bloggerId>/<awemeId>/<n>.jpg` onto absolute paths
// under `app.getPath('userData')`. Must be registered as privileged BEFORE
// `app.ready` so renderer <img src> requests bypass mixed-content / CSP rules
// (the protocol is treated as a secure origin).
protocol.registerSchemesAsPrivileged([
  {
    scheme: "userdata",
    privileges: { secure: true, supportFetchAPI: true, standard: true, bypassCSP: true },
  },
]);

log.initialize();
log.transports.file.level = "info";
log.transports.console.level = process.env["NODE_ENV"] === "production" ? false : "info";

/**
 * Decide whether `targetUrl` (the destination of a click / window.open inside
 * the renderer) should be handed off to the system browser instead of opening
 * an Electron child window. We treat any http(s) URL whose origin differs
 * from the renderer's loaded origin as external. When the renderer is loaded
 * over `file://` (production build), every http(s) URL is external.
 */
function isExternalNavigation(targetUrl: string, currentUrl: string): boolean {
  if (!/^https?:/i.test(targetUrl)) return false;
  try {
    const target = new URL(targetUrl);
    const current = new URL(currentUrl);
    if (current.protocol === "file:") return true;
    return target.origin !== current.origin;
  } catch {
    return false;
  }
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1560,
    height: 960,
    minWidth: 1120,
    minHeight: 720,
    title: "AI运营获客",
    frame: false,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "../preload/index.cjs"),
    },
  });

  // Route external links to the OS default browser instead of spawning an
  // Electron child window. Two paths to cover:
  //   - `window.open(url)` / `<a target="_blank">` → setWindowOpenHandler
  //   - direct top-level navigation (`location.href = url`, plain `<a href>`
  //     without `target`) → will-navigate
  // Same-origin navigations (HMR reloads, SPA route loads) must pass through.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (isExternalNavigation(url, win.webContents.getURL())) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });

  const devUrl = process.env["ELECTRON_RENDERER_URL"];
  if (devUrl) {
    void win.loadURL(devUrl);
  } else {
    void win.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}

let unsubscribeBatchEvents: (() => void) | null = null;
let unsubscribeManualCaptureEvents: (() => void) | null = null;
let unsubscribeBloggerEvents: (() => void) | null = null;
let unsubscribeHotMaterialEvents: (() => void) | null = null;
let unsubscribeSettingsForScheduler: (() => void) | null = null;
let unsubscribeSchedulerEvents: (() => void) | null = null;

let unsubscribeClaudeCacheInvalidation: (() => void) | null = null;

app.whenReady().then(async () => {
  // Map `userdata://<rest>` → an absolute file under app.getPath('userData').
  // Refuses anything that escapes the userData root.
  const userDataRoot = app.getPath("userData");
  protocol.handle("userdata", async (request) => {
    try {
      const u = new URL(request.url);
      const rel = decodeURIComponent(`${u.host}${u.pathname}`).replace(/^\/+/, "");
      const abs = path.normalize(path.join(userDataRoot, rel));
      if (!abs.startsWith(userDataRoot)) {
        return new Response("forbidden", { status: 403 });
      }
      return await net.fetch(pathToFileURL(abs).toString());
    } catch (err) {
      log.warn(
        `userdata:// handler failed for ${request.url}: ${err instanceof Error ? err.message : String(err)}`,
      );
      return new Response("not found", { status: 404 });
    }
  });

  registerClaudeCodeProvider();
  registerCodexProvider();
  registerKimiProvider();

  // Invalidate the claude binary detection cache when binPath changes in Settings.
  let lastClaudeBinPath: string | undefined;
  let lastCodexBinPath: string | undefined;
  let lastKimiBinPath: string | undefined;
  unsubscribeClaudeCacheInvalidation = onSettingsChange((next) => {
    const claudeBin = next.llm.claudeCode.binPath?.trim() ?? '';
    if (claudeBin !== (lastClaudeBinPath ?? '')) {
      lastClaudeBinPath = claudeBin;
      resetClaudeCache();
    }
    const codexBin = next.llm.codex.binPath?.trim() ?? '';
    if (codexBin !== (lastCodexBinPath ?? '')) {
      lastCodexBinPath = codexBin;
      resetCodexCache();
    }
    const kimiBin = next.llm.kimi.binPath?.trim() ?? '';
    if (kimiBin !== (lastKimiBinPath ?? '')) {
      lastKimiBinPath = kimiBin;
      resetKimiCache();
    }
  });

  registerPingHandler();
  registerAgentAuthHandlers();
  registerAiChatHandlers();
  registerPersonaHandlers();
  registerLibraryListHandler();
  registerLibraryDeleteHandler();
  registerManualCaptureStartHandler();
  registerManualCaptureStopHandler();
  registerManualCaptureStatusHandler();
  registerShellOpenLogsHandler();
  registerKeywordListHandler();
  registerKeywordCreateHandler();
  registerKeywordUpdateHandler();
  registerKeywordDeleteHandler();
  registerSessionInstallBrowserHandler();
  registerSessionStartHandler();
  registerSessionStatusHandler();
  registerSessionResetHandler();
  registerBatchStartHandler();
  registerBatchStopHandler();
  registerBatchStatusHandler();
  registerBloggerListHandler();
  registerBloggerGetReportHandler();
  registerBloggerCreateHandler();
  registerBloggerDeleteHandler();
  registerBloggerDeleteSampleHandler();
  registerBloggerCaptureProfileHandler();
  registerBloggerSampleVideosHandler();
  registerBloggerListSamplesHandler();
  registerBloggerAnalyzeHandlers();
  registerContentDiagnosisListHandler();
  registerContentDiagnosisCreateHandler();
  registerContentDiagnosisAnalyzeHandler();
  registerContentDiagnosisGetReportHandler();
  registerContentDiagnosisDeleteHandler();
  registerHotMaterialListHandler();
  registerHotMaterialCreateHandler();
  registerHotMaterialAnalyzeHandler();
  registerHotMaterialGetReportHandler();
  registerHotMaterialDeleteHandler();
  registerWindowControlHandlers();
  registerSettingsHandlers();
  registerSchedulerStatusHandler();
  registerSelfMediaGuideListHandler();
  registerTrackAnalysisHandlers();
  registerDouyinHotHandler();
  registerDouyinVideoHandler();
  registerTranscriptExtractHandler();
  registerAsrHandlers();
  await ensurePersonaWorkspaceFiles();
  await ensureBundledAgentsFile();
  await ensureBundledBloggerData();
  await ensureDouyinBloggerReportSkill();
  await ensureDouyinContentDiagnosisReportSkill();
  await ensureDouyinHotMaterialReportSkill();

  // Fan out batch events from utility → all renderer windows.
  unsubscribeBatchEvents = getUtilityHost().subscribe(BATCH_EVENT_TOPIC, (payload: unknown) => {
    for (const bw of BrowserWindow.getAllWindows()) {
      try {
        bw.webContents.send(BATCH_EVENT_TOPIC, payload);
      } catch (err) {
        log.warn(
          `webContents.send threw for ${BATCH_EVENT_TOPIC}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  });
  unsubscribeManualCaptureEvents = getUtilityHost().subscribe(
    MANUAL_CAPTURE_EVENT_TOPIC,
    (payload: unknown) => {
      for (const bw of BrowserWindow.getAllWindows()) {
        try {
          bw.webContents.send(MANUAL_CAPTURE_EVENT_TOPIC, payload);
        } catch (err) {
          log.warn(
            `webContents.send threw for ${MANUAL_CAPTURE_EVENT_TOPIC}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    },
  );

  unsubscribeBloggerEvents = getUtilityHost().subscribe(
    BLOGGER_EVENT_TOPIC,
    (payload: unknown) => {
      for (const bw of BrowserWindow.getAllWindows()) {
        try {
          bw.webContents.send(BLOGGER_EVENT_TOPIC, payload);
        } catch (err) {
          log.warn(
            `webContents.send threw for ${BLOGGER_EVENT_TOPIC}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    },
  );
  unsubscribeHotMaterialEvents = getUtilityHost().subscribe(
    HOT_MATERIAL_EVENT_TOPIC,
    (payload: unknown) => {
      for (const bw of BrowserWindow.getAllWindows()) {
        try {
          bw.webContents.send(HOT_MATERIAL_EVENT_TOPIC, payload);
        } catch (err) {
          log.warn(
            `webContents.send threw for ${HOT_MATERIAL_EVENT_TOPIC}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    },
  );
  // Initialise the daily scheduler. Must happen after settings handlers are
  // registered (so the on-disk config is read once) and after the utility-host
  // module is imported (the scheduler uses it lazily). The scheduler subscribes
  // to BATCH_EVENT_TOPIC internally for batch-running detection + queue drain.
  const initialSettings = await getSettings();
  const scheduler = initScheduler(initialSettings.scheduling);
  unsubscribeSettingsForScheduler = onSettingsChange((next) => {
    scheduler.reload(next.scheduling);
  });
  unsubscribeSchedulerEvents = scheduler.onEvent((event) => {
    for (const bw of BrowserWindow.getAllWindows()) {
      try {
        bw.webContents.send(SCHEDULER_EVENT_TOPIC, event);
      } catch (err) {
        log.warn(
          `webContents.send threw for ${SCHEDULER_EVENT_TOPIC}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  });
  scheduler.start();

  log.info(`ua-agent main process ready (logs: ${log.transports.file.getFile().path})`);
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", () => {
  if (unsubscribeClaudeCacheInvalidation !== null) {
    unsubscribeClaudeCacheInvalidation();
    unsubscribeClaudeCacheInvalidation = null;
  }
  unregisterPingHandler();
  unregisterAgentAuthHandlers();
  unregisterAiChatHandlers();
  unregisterPersonaHandlers();
  unregisterLibraryListHandler();
  unregisterLibraryDeleteHandler();
  unregisterManualCaptureStartHandler();
  unregisterManualCaptureStopHandler();
  unregisterManualCaptureStatusHandler();
  unregisterShellOpenLogsHandler();
  unregisterKeywordListHandler();
  unregisterKeywordCreateHandler();
  unregisterKeywordUpdateHandler();
  unregisterKeywordDeleteHandler();
  unregisterSessionInstallBrowserHandler();
  unregisterSessionStartHandler();
  unregisterSessionStatusHandler();
  unregisterSessionResetHandler();
  unregisterBatchStartHandler();
  unregisterBatchStopHandler();
  unregisterBatchStatusHandler();
  unregisterBloggerListHandler();
  unregisterBloggerGetReportHandler();
  unregisterBloggerCreateHandler();
  unregisterBloggerDeleteHandler();
  unregisterBloggerDeleteSampleHandler();
  unregisterBloggerCaptureProfileHandler();
  unregisterBloggerSampleVideosHandler();
  unregisterBloggerListSamplesHandler();
  abortAllInflightAnalyze();
  unregisterBloggerAnalyzeHandlers();
  unregisterContentDiagnosisListHandler();
  unregisterContentDiagnosisCreateHandler();
  unregisterContentDiagnosisAnalyzeHandler();
  unregisterContentDiagnosisGetReportHandler();
  unregisterContentDiagnosisDeleteHandler();
  unregisterHotMaterialListHandler();
  unregisterHotMaterialCreateHandler();
  unregisterHotMaterialAnalyzeHandler();
  unregisterHotMaterialGetReportHandler();
  unregisterHotMaterialDeleteHandler();
  unregisterWindowControlHandlers();
  unregisterSettingsHandlers();
  unregisterSchedulerStatusHandler();
  unregisterSelfMediaGuideListHandler();
  unregisterTrackAnalysisHandlers();
  unregisterDouyinHotHandler();
  unregisterDouyinVideoHandler();
  unregisterTranscriptExtractHandler();
  unregisterAsrHandlers();
  if (unsubscribeSchedulerEvents !== null) {
    unsubscribeSchedulerEvents();
    unsubscribeSchedulerEvents = null;
  }
  if (unsubscribeSettingsForScheduler !== null) {
    unsubscribeSettingsForScheduler();
    unsubscribeSettingsForScheduler = null;
  }
  shutdownScheduler();
  if (unsubscribeBatchEvents !== null) {
    unsubscribeBatchEvents();
    unsubscribeBatchEvents = null;
  }
  if (unsubscribeManualCaptureEvents !== null) {
    unsubscribeManualCaptureEvents();
    unsubscribeManualCaptureEvents = null;
  }
  if (unsubscribeBloggerEvents !== null) {
    unsubscribeBloggerEvents();
    unsubscribeBloggerEvents = null;
  }
  if (unsubscribeHotMaterialEvents !== null) {
    unsubscribeHotMaterialEvents();
    unsubscribeHotMaterialEvents = null;
  }
  shutdownUtilityHost();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
