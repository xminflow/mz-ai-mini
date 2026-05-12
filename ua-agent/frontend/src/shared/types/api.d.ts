import type { DouyinHotBoardKey, DouyinHotListResult } from "../contracts/douyin-hot";
import type {
  ManualCaptureEvent,
  ManualCaptureStartResult,
  ManualCaptureStatusResult,
  ManualCaptureStopResult,
} from "../contracts/manual-capture";
import type {
  DouyinVideoResolveRequest,
  DouyinVideoResolveResult,
} from "../contracts/douyin-video";
import type {
  BloggerAnalyzeCancelResult,
  BloggerAnalyzeResult,
  BloggerCaptureProfileResult,
  BloggerCreateResult,
  BloggerDeleteSampleResult,
  BloggerDeleteResult,
  BloggerEvent,
  BloggerGetReportResult,
  BloggerListResult,
  BloggerListSamplesResult,
  BloggerSampleVideosResult,
} from "../contracts/blogger";
import type {
  ContentDiagnosisAnalyzeResult,
  ContentDiagnosisCreateResult,
  ContentDiagnosisDeleteResult,
  ContentDiagnosisEvent,
  ContentDiagnosisGetReportResult,
  ContentDiagnosisListResult,
} from "../contracts/content-diagnosis";
import type {
  HotMaterialAnalyzeResult,
  HotMaterialCreateResult,
  HotMaterialDeleteResult,
  HotMaterialEvent,
  HotMaterialGetReportResult,
  HotMaterialListResult,
} from "../contracts/hot-material-analysis";
import type { LibraryDeleteResult, LibraryListResult } from "../contracts/library";
import type { PingResult } from "../contracts/ping";
import type { BatchEvent } from "../contracts/keyword/batch-event";
import type { InstallBrowserResult } from "../contracts/keyword/session-install-browser";
import type { SessionResetResult } from "../contracts/keyword/session-reset";
import type { SessionStartResult } from "../contracts/keyword/session-start";
import type { SessionStatusResult } from "../contracts/keyword/session-status";
import type { SchedulerEvent, SchedulerStatusResult } from "../contracts/scheduling";
import type { SelfMediaGuideListResult } from "../contracts/self-media-guide";
import type {
  TrackAnalysisGetReportRequest,
  TrackAnalysisGetReportResult,
  TrackAnalysisListRequest,
  TrackAnalysisListResult,
} from "../contracts/track-analysis";
import type {
  AiChatCancelResult,
  AiChatEvent,
  AiChatResetResult,
  AiChatSendResult,
  AiChatStateResult,
} from "../contracts/ai-chat";
import type {
  AppSettingsPatch,
  SettingsGetResult,
  SettingsTestLlmResult,
  SettingsUpdateResult,
} from "../contracts/settings";
import type {
  TranscriptExtractRequest,
  TranscriptExtractResult,
  TranscriptProgressEvent,
  AsrInstallProgressEvent,
  AsrInstallResult,
  AsrStatusResult,
} from "../contracts/transcript";

export interface LibraryListQuery {
  from?: string | null;
  to?: string | null;
  author?: string | null;
  platform?: Platform | null;
  limit?: number;
  offset?: number;
}

export interface OpenLogsDirResult {
  schema_version: "1";
  ok: boolean;
  error?: { code: string; message: string };
}

export type Platform = "douyin" | "xiaohongshu";

export interface KeywordCreateArgs {
  /** 006 — Platform Tab the new keyword belongs to. */
  platform: Platform;
  text: string;
  enabled?: boolean | undefined;
  target_cap?: number | undefined;
  health_cap?: number | undefined;
  min_like_follower_ratio?: number | undefined;
}

export interface KeywordUpdateArgs {
  id: string;
  text?: string | undefined;
  enabled?: boolean | undefined;
  target_cap?: number | undefined;
  health_cap?: number | undefined;
  min_like_follower_ratio?: number | undefined;
}

export interface KeywordDeleteArgs {
  id: string;
}

export interface BatchStartArgs {
  /** 006 — Platform whose enabled keywords to run. */
  platform: Platform;
}

// Forward declarations resolved at call time (Phase 3 + 5 contracts).
type KeywordListResult = unknown;
type KeywordCreateResult = unknown;
type KeywordUpdateResult = unknown;
type KeywordDeleteResult = unknown;
type BatchStartResult = unknown;
type BatchStopResult = unknown;
type BatchStatusResult = unknown;

declare global {
  interface Window {
    api: {
      window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
      };
      ping: (message?: string | null) => Promise<PingResult>;
      libraryList: (query?: LibraryListQuery) => Promise<LibraryListResult>;
      libraryDelete: (postId: string) => Promise<LibraryDeleteResult>;
      settings: {
        get: () => Promise<SettingsGetResult>;
        update: (patch: AppSettingsPatch) => Promise<SettingsUpdateResult>;
        testLlm: () => Promise<SettingsTestLlmResult>;
      };
      aiChat: {
        getState: () => Promise<AiChatStateResult>;
        send: (args: { prompt: string }) => Promise<AiChatSendResult>;
        cancel: () => Promise<AiChatCancelResult>;
        reset: () => Promise<AiChatResetResult>;
        onEvent: (callback: (event: AiChatEvent) => void) => number;
        offEvent: (id: number) => void;
      };
      keyword: {
        list: () => Promise<KeywordListResult>;
        create: (args: KeywordCreateArgs) => Promise<KeywordCreateResult>;
        update: (args: KeywordUpdateArgs) => Promise<KeywordUpdateResult>;
        delete: (args: KeywordDeleteArgs) => Promise<KeywordDeleteResult>;
        batchStart: (args: BatchStartArgs) => Promise<BatchStartResult>;
        batchStop: () => Promise<BatchStopResult>;
        batchStatus: () => Promise<BatchStatusResult>;
        installBrowser: () => Promise<InstallBrowserResult>;
        startSession: () => Promise<SessionStartResult>;
        sessionStatus: () => Promise<SessionStatusResult>;
        resetSession: () => Promise<SessionResetResult>;
        openLogsDir: () => Promise<OpenLogsDirResult>;
        onBatchEvent: (callback: (event: BatchEvent) => void) => number;
        offBatchEvent: (id: number) => void;
      };
      manualCapture: {
        start: (args: { url: string }) => Promise<ManualCaptureStartResult>;
        stop: () => Promise<ManualCaptureStopResult>;
        status: () => Promise<ManualCaptureStatusResult>;
        onEvent: (callback: (event: ManualCaptureEvent) => void) => number;
        offEvent: (id: number) => void;
      };
      scheduler: {
        status: () => Promise<SchedulerStatusResult>;
        onEvent: (callback: (event: SchedulerEvent) => void) => number;
        offEvent: (id: number) => void;
      };
      selfMediaGuide: {
        list: () => Promise<SelfMediaGuideListResult>;
      };
      douyinHot: {
        list: (args: { board: DouyinHotBoardKey }) => Promise<DouyinHotListResult>;
      };
      trackAnalysis: {
        list: (args?: TrackAnalysisListRequest) => Promise<TrackAnalysisListResult>;
        getReport: (
          args: TrackAnalysisGetReportRequest,
        ) => Promise<TrackAnalysisGetReportResult>;
      };
      douyinVideo: {
        resolve: (args: DouyinVideoResolveRequest) => Promise<DouyinVideoResolveResult>;
      };
      transcript: {
        extract: (args: TranscriptExtractRequest) => Promise<TranscriptExtractResult>;
        onProgress: (callback: (event: TranscriptProgressEvent) => void) => number;
        offProgress: (id: number) => void;
      };
      asr: {
        status: () => Promise<AsrStatusResult>;
        install: () => Promise<AsrInstallResult>;
        onInstallProgress: (callback: (event: AsrInstallProgressEvent) => void) => number;
        offInstallProgress: (id: number) => void;
      };
      blogger: {
        list: () => Promise<BloggerListResult>;
        create: (args: { profile_url: string }) => Promise<BloggerCreateResult>;
        delete: (args: { id: string }) => Promise<BloggerDeleteResult>;
        captureProfile: (args: { id: string }) => Promise<BloggerCaptureProfileResult>;
        sampleVideos: (args: { id: string; k?: number; append?: boolean }) => Promise<BloggerSampleVideosResult>;
        listSamples: (args: { id: string }) => Promise<BloggerListSamplesResult>;
        deleteSample: (args: { blogger_id: string; video_url: string }) => Promise<BloggerDeleteSampleResult>;
        getReport: (args: { id: string }) => Promise<BloggerGetReportResult>;
        analyze: (args: { id: string }) => Promise<BloggerAnalyzeResult>;
        analyzeCancel: (args: { id: string }) => Promise<BloggerAnalyzeCancelResult>;
        onEvent: (callback: (event: BloggerEvent) => void) => number;
        offEvent: (id: number) => void;
      };
      hotMaterialAnalysis: {
        list: () => Promise<HotMaterialListResult>;
        create: (args: { share_url: string }) => Promise<HotMaterialCreateResult>;
        analyze: (args: { id: string }) => Promise<HotMaterialAnalyzeResult>;
        getReport: (args: { id: string }) => Promise<HotMaterialGetReportResult>;
        delete: (args: { id: string }) => Promise<HotMaterialDeleteResult>;
        onEvent: (callback: (event: HotMaterialEvent) => void) => number;
        offEvent: (id: number) => void;
      };
      contentDiagnosis: {
        list: () => Promise<ContentDiagnosisListResult>;
        create: (args: { share_url: string }) => Promise<ContentDiagnosisCreateResult>;
        analyze: (args: { id: string }) => Promise<ContentDiagnosisAnalyzeResult>;
        getReport: (args: { id: string }) => Promise<ContentDiagnosisGetReportResult>;
        delete: (args: { id: string }) => Promise<ContentDiagnosisDeleteResult>;
        onEvent: (callback: (event: ContentDiagnosisEvent) => void) => number;
        offEvent: (id: number) => void;
      };
    };
  }
}

export {};
