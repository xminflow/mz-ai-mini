import { contextBridge, ipcRenderer } from "electron";

// Inlined to keep the preload bundle minimal and avoid pulling in zod via the
// contracts barrel from a sandboxed preload context. Must stay in sync with
// frontend/src/shared/contracts/keyword/batch-event.ts.
const BATCH_EVENT_TOPIC = "keyword:batch:event" as const;
const MANUAL_CAPTURE_EVENT_TOPIC = "manual-capture:event" as const;
// Same — must stay in sync with frontend/src/shared/contracts/scheduling.ts.
const SCHEDULER_EVENT_TOPIC = "scheduler:event" as const;
// Same — must stay in sync with frontend/src/shared/contracts/transcript.ts.
const TRANSCRIPT_PROGRESS_TOPIC = "transcript:progress" as const;
const ASR_INSTALL_PROGRESS_TOPIC = "asr:install-progress" as const;
// Same — must stay in sync with frontend/src/shared/contracts/blogger.ts.
const BLOGGER_EVENT_TOPIC = "blogger:event" as const;
const HOT_MATERIAL_EVENT_TOPIC = "hot-material:event" as const;
const CONTENT_DIAGNOSIS_EVENT_TOPIC = "content-diagnosis:event" as const;
const AI_CHAT_EVENT_TOPIC = "ai-chat:event" as const;

type Platform = "douyin" | "xiaohongshu";

interface KeywordCreateArgs {
  /** 006 — Platform Tab the new keyword belongs to. */
  platform: Platform;
  text: string;
  enabled?: boolean | undefined;
  target_cap?: number | undefined;
  health_cap?: number | undefined;
  min_like_follower_ratio?: number | undefined;
}

interface KeywordUpdateArgs {
  id: string;
  text?: string | undefined;
  enabled?: boolean | undefined;
  target_cap?: number | undefined;
  health_cap?: number | undefined;
  min_like_follower_ratio?: number | undefined;
}

interface KeywordDeleteArgs {
  id: string;
}

interface BatchStartArgs {
  /** 006 — Platform whose enabled keywords to run. */
  platform: Platform;
}

// Renderer-side fan-out for the batch event topic. We register exactly one
// `ipcRenderer.on` listener at preload load time, then dispatch each event
// to every callback in this map. This avoids the Electron contextBridge
// limitation where exposed functions cannot return functions.
const batchEventCallbacks = new Map<number, (event: unknown) => void>();
let batchEventNextId = 1;
const manualCaptureEventCallbacks = new Map<number, (event: unknown) => void>();
let manualCaptureEventNextId = 1;

ipcRenderer.on(BATCH_EVENT_TOPIC, (_event, payload: unknown) => {
  for (const cb of batchEventCallbacks.values()) {
    try {
      cb(payload);
    } catch {
      /* swallow — never let a bad callback break the dispatch loop */
    }
  }
});

ipcRenderer.on(MANUAL_CAPTURE_EVENT_TOPIC, (_event, payload: unknown) => {
  for (const cb of manualCaptureEventCallbacks.values()) {
    try {
      cb(payload);
    } catch {
      /* swallow */
    }
  }
});

const schedulerEventCallbacks = new Map<number, (event: unknown) => void>();
let schedulerEventNextId = 1;

ipcRenderer.on(SCHEDULER_EVENT_TOPIC, (_event, payload: unknown) => {
  for (const cb of schedulerEventCallbacks.values()) {
    try {
      cb(payload);
    } catch {
      /* swallow */
    }
  }
});

const transcriptProgressCallbacks = new Map<number, (event: unknown) => void>();
let transcriptProgressNextId = 1;

ipcRenderer.on(TRANSCRIPT_PROGRESS_TOPIC, (_event, payload: unknown) => {
  for (const cb of transcriptProgressCallbacks.values()) {
    try { cb(payload); } catch { /* swallow */ }
  }
});

const asrInstallProgressCallbacks = new Map<number, (event: unknown) => void>();
let asrInstallProgressNextId = 1;

ipcRenderer.on(ASR_INSTALL_PROGRESS_TOPIC, (_event, payload: unknown) => {
  for (const cb of asrInstallProgressCallbacks.values()) {
    try { cb(payload); } catch { /* swallow */ }
  }
});

const bloggerEventCallbacks = new Map<number, (event: unknown) => void>();
let bloggerEventNextId = 1;

ipcRenderer.on(BLOGGER_EVENT_TOPIC, (_event, payload: unknown) => {
  for (const cb of bloggerEventCallbacks.values()) {
    try { cb(payload); } catch { /* swallow */ }
  }
});

const hotMaterialEventCallbacks = new Map<number, (event: unknown) => void>();
let hotMaterialEventNextId = 1;
const contentDiagnosisEventCallbacks = new Map<number, (event: unknown) => void>();
let contentDiagnosisEventNextId = 1;
const aiChatEventCallbacks = new Map<number, (event: unknown) => void>();
let aiChatEventNextId = 1;

ipcRenderer.on(HOT_MATERIAL_EVENT_TOPIC, (_event, payload: unknown) => {
  for (const cb of hotMaterialEventCallbacks.values()) {
    try { cb(payload); } catch { /* swallow */ }
  }
});

ipcRenderer.on(CONTENT_DIAGNOSIS_EVENT_TOPIC, (_event, payload: unknown) => {
  for (const cb of contentDiagnosisEventCallbacks.values()) {
    try { cb(payload); } catch { /* swallow */ }
  }
});

ipcRenderer.on(AI_CHAT_EVENT_TOPIC, (_event, payload: unknown) => {
  for (const cb of aiChatEventCallbacks.values()) {
    try { cb(payload); } catch { /* swallow */ }
  }
});

const api = {
  window: {
    minimize: (): void => ipcRenderer.send("window:minimize"),
    maximize: (): void => ipcRenderer.send("window:maximize"),
    close: (): void => ipcRenderer.send("window:close"),
  },
  ping: (message?: string | null): Promise<unknown> =>
    ipcRenderer.invoke("ping", message ?? null),
  agentAuth: {
    getState: (): Promise<unknown> => ipcRenderer.invoke("agent-auth:get-state"),
    requestEmailLoginCode: (email: string): Promise<unknown> =>
      ipcRenderer.invoke("agent-auth:request-email-login-challenge", { email }),
    verifyEmailLoginCode: (
      loginChallengeId: string,
      verificationCode: string,
    ): Promise<unknown> =>
      ipcRenderer.invoke("agent-auth:verify-email-login-challenge", {
        loginChallengeId,
        verificationCode,
      }),
    startWechatLogin: (): Promise<unknown> => ipcRenderer.invoke("agent-auth:start-wechat-login"),
    getWechatLoginSession: (loginSessionId: string): Promise<unknown> =>
      ipcRenderer.invoke("agent-auth:get-wechat-login-session", loginSessionId),
    exchangeWechatLogin: (loginSessionId: string): Promise<unknown> =>
      ipcRenderer.invoke("agent-auth:exchange-wechat-login", loginSessionId),
    logout: (): Promise<unknown> => ipcRenderer.invoke("agent-auth:logout"),
  },
  libraryList: (
    query: {
      from?: string | null;
      to?: string | null;
      author?: string | null;
      platform?: Platform | null;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<unknown> => ipcRenderer.invoke("library:list", query),
  libraryDelete: (postId: string): Promise<unknown> =>
    ipcRenderer.invoke("library:delete", postId),
  settings: {
    get: (): Promise<unknown> => ipcRenderer.invoke("settings:get"),
    update: (patch: unknown): Promise<unknown> => ipcRenderer.invoke("settings:update", patch),
    testLlm: (): Promise<unknown> => ipcRenderer.invoke("settings:test-llm"),
  },
  aiChat: {
    getState: (): Promise<unknown> => ipcRenderer.invoke("ai-chat:get-state"),
    send: (args: { prompt: string }): Promise<unknown> => ipcRenderer.invoke("ai-chat:send", args),
    cancel: (): Promise<unknown> => ipcRenderer.invoke("ai-chat:cancel"),
    reset: (): Promise<unknown> => ipcRenderer.invoke("ai-chat:reset"),
    onEvent: (callback: (event: unknown) => void): number => {
      const id = aiChatEventNextId++;
      aiChatEventCallbacks.set(id, callback);
      return id;
    },
    offEvent: (id: number): void => {
      aiChatEventCallbacks.delete(id);
    },
  },
  persona: {
    save: (payload: unknown): Promise<unknown> => ipcRenderer.invoke("persona:save", payload),
  },
  keyword: {
    list: (): Promise<unknown> => ipcRenderer.invoke("keyword:list"),
    create: (args: KeywordCreateArgs): Promise<unknown> =>
      ipcRenderer.invoke("keyword:create", args),
    update: (args: KeywordUpdateArgs): Promise<unknown> =>
      ipcRenderer.invoke("keyword:update", args),
    delete: (args: KeywordDeleteArgs): Promise<unknown> =>
      ipcRenderer.invoke("keyword:delete", args),
    batchStart: (args: BatchStartArgs): Promise<unknown> =>
      ipcRenderer.invoke("keyword:batch-start", args),
    batchStop: (): Promise<unknown> => ipcRenderer.invoke("keyword:batch-stop"),
    batchStatus: (): Promise<unknown> => ipcRenderer.invoke("keyword:batch-status"),
    installBrowser: (): Promise<unknown> => ipcRenderer.invoke("keyword:install-browser"),
    startSession: (): Promise<unknown> => ipcRenderer.invoke("keyword:session-start"),
    sessionStatus: (): Promise<unknown> => ipcRenderer.invoke("keyword:session-status"),
    resetSession: (): Promise<unknown> => ipcRenderer.invoke("keyword:session-reset"),
    openLogsDir: (): Promise<unknown> => ipcRenderer.invoke("keyword:open-logs-dir"),
    /** Returns a numeric subscription id; use it with `offBatchEvent` to clean up. */
    onBatchEvent: (callback: (event: unknown) => void): number => {
      const id = batchEventNextId++;
      batchEventCallbacks.set(id, callback);
      return id;
    },
    offBatchEvent: (id: number): void => {
      batchEventCallbacks.delete(id);
    },
  },
  manualCapture: {
    start: (args: { url: string }): Promise<unknown> =>
      ipcRenderer.invoke("manual-capture:start", args),
    stop: (): Promise<unknown> => ipcRenderer.invoke("manual-capture:stop"),
    status: (): Promise<unknown> => ipcRenderer.invoke("manual-capture:status"),
    onEvent: (callback: (event: unknown) => void): number => {
      const id = manualCaptureEventNextId++;
      manualCaptureEventCallbacks.set(id, callback);
      return id;
    },
    offEvent: (id: number): void => {
      manualCaptureEventCallbacks.delete(id);
    },
  },
  scheduler: {
    status: (): Promise<unknown> => ipcRenderer.invoke("scheduler:status"),
    onEvent: (callback: (event: unknown) => void): number => {
      const id = schedulerEventNextId++;
      schedulerEventCallbacks.set(id, callback);
      return id;
    },
    offEvent: (id: number): void => {
      schedulerEventCallbacks.delete(id);
    },
  },
  selfMediaGuide: {
    list: (): Promise<unknown> => ipcRenderer.invoke("self-media-guide:list"),
  },
  douyinHot: {
    list: (args: { board: "hot" | "seeding" | "entertainment" | "society" }): Promise<unknown> =>
      ipcRenderer.invoke("douyin-hot:list", args),
  },
  trackAnalysis: {
    list: (args: {
      cursor?: string;
      limit?: number;
      industry?: string;
      keyword?: string;
    } = {}): Promise<unknown> => ipcRenderer.invoke("track-analysis:list", args),
    getReport: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("track-analysis:get-report", args),
  },
  douyinVideo: {
    resolve: (args: { share_url: string }): Promise<unknown> =>
      ipcRenderer.invoke("douyin-video:resolve", args),
  },
  transcript: {
    extract: (args: { post_id: string; share_url: string }): Promise<unknown> =>
      ipcRenderer.invoke("transcript:extract", args),
    onProgress: (callback: (event: unknown) => void): number => {
      const id = transcriptProgressNextId++;
      transcriptProgressCallbacks.set(id, callback);
      return id;
    },
    offProgress: (id: number): void => {
      transcriptProgressCallbacks.delete(id);
    },
  },
  asr: {
    status: (): Promise<unknown> => ipcRenderer.invoke("asr:status"),
    install: (): Promise<unknown> => ipcRenderer.invoke("asr:install"),
    onInstallProgress: (callback: (event: unknown) => void): number => {
      const id = asrInstallProgressNextId++;
      asrInstallProgressCallbacks.set(id, callback);
      return id;
    },
    offInstallProgress: (id: number): void => {
      asrInstallProgressCallbacks.delete(id);
    },
  },
  blogger: {
    list: (): Promise<unknown> => ipcRenderer.invoke("blogger:list"),
    create: (args: { profile_url: string }): Promise<unknown> =>
      ipcRenderer.invoke("blogger:create", args),
    delete: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("blogger:delete", args),
    captureProfile: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("blogger:capture-profile", args),
    sampleVideos: (args: { id: string; k?: number; append?: boolean }): Promise<unknown> =>
      ipcRenderer.invoke("blogger:sample-videos", args),
    listSamples: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("blogger:list-samples", args),
    deleteSample: (args: { blogger_id: string; video_url: string }): Promise<unknown> =>
      ipcRenderer.invoke("blogger:delete-sample", args),
    getReport: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("blogger:get-report", args),
    analyze: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("blogger:analyze", args),
    analyzeCancel: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("blogger:analyze-cancel", args),
    onEvent: (callback: (event: unknown) => void): number => {
      const id = bloggerEventNextId++;
      bloggerEventCallbacks.set(id, callback);
      return id;
    },
    offEvent: (id: number): void => {
      bloggerEventCallbacks.delete(id);
    },
  },
  hotMaterialAnalysis: {
    list: (): Promise<unknown> => ipcRenderer.invoke("hot-material:list"),
    create: (args: { share_url: string }): Promise<unknown> =>
      ipcRenderer.invoke("hot-material:create", args),
    analyze: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("hot-material:analyze", args),
    getReport: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("hot-material:get-report", args),
    delete: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("hot-material:delete", args),
    onEvent: (callback: (event: unknown) => void): number => {
      const id = hotMaterialEventNextId++;
      hotMaterialEventCallbacks.set(id, callback);
      return id;
    },
    offEvent: (id: number): void => {
      hotMaterialEventCallbacks.delete(id);
    },
  },
  contentDiagnosis: {
    list: (): Promise<unknown> => ipcRenderer.invoke("content-diagnosis:list"),
    create: (args: { share_url: string }): Promise<unknown> =>
      ipcRenderer.invoke("content-diagnosis:create", args),
    analyze: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("content-diagnosis:analyze", args),
    getReport: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("content-diagnosis:get-report", args),
    delete: (args: { id: string }): Promise<unknown> =>
      ipcRenderer.invoke("content-diagnosis:delete", args),
    onEvent: (callback: (event: unknown) => void): number => {
      const id = contentDiagnosisEventNextId++;
      contentDiagnosisEventCallbacks.set(id, callback);
      return id;
    },
    offEvent: (id: number): void => {
      contentDiagnosisEventCallbacks.delete(id);
    },
  },
};

try {
  contextBridge.exposeInMainWorld("api", api);
  console.log("[preload] window.api exposed; keyword surface ready");
} catch (err) {
  console.error("[preload] contextBridge.exposeInMainWorld failed:", err);
}
