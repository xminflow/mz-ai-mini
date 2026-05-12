import { create } from "zustand";

import { queryClient } from "@/lib/react-query";
import {
  type TranscriptExtractRequest,
  type TranscriptExtractResult,
  type TranscriptProgressEvent,
} from "@/shared/contracts/transcript";
import { useGlobalTaskCenterStore } from "@/shared/tasks/store";

import {
  defaultTranscriptSourceName,
  describeTranscriptStage,
  type TranscriptTask,
} from "./transcriptTask";

type TranscriptBridge = {
  extract: (args: TranscriptExtractRequest) => Promise<TranscriptExtractResult>;
  onProgress: (callback: (event: unknown) => void) => number;
  offProgress: (id: number) => void;
};

function bridge(): TranscriptBridge | null {
  if (typeof window === "undefined") return null;
  return window.api?.transcript ?? null;
}

function invalidateLibraryQueries(): void {
  void queryClient.invalidateQueries({ queryKey: ["library", "list"] });
}

interface StartArgs {
  postId: string;
  shareUrl: string;
  platform: "douyin" | "xiaohongshu";
  sourceName: string;
}

interface TranscriptTaskState {
  task: TranscriptTask | null;
  runExtraction: (args: StartArgs) => Promise<TranscriptExtractResult>;
  clearTask: () => void;
  _onProgress: (event: TranscriptProgressEvent) => void;
}

function runningTaskFromArgs(args: StartArgs): TranscriptTask {
  return {
    postId: args.postId,
    sourceName: args.sourceName,
    status: "running",
    stage: "queued",
    percent: 0,
    startedAt: new Date().toISOString(),
    message: describeTranscriptStage("queued", 0),
    error: null,
    transcribedAt: null,
  };
}

export const useTranscriptTaskStore = create<TranscriptTaskState>((set, get) => ({
  task: null,

  async runExtraction(args) {
    const previousTask = get().task;
    set({ task: runningTaskFromArgs(args) });
    useGlobalTaskCenterStore.getState().seedTranscriptTask({
      postId: args.postId,
      sourceName: args.sourceName,
    });

    try {
      const result = await bridge()?.extract({
        post_id: args.postId,
        share_url: args.shareUrl,
        platform: args.platform,
      });

      if (result === undefined) {
        throw new Error("transcript IPC unavailable");
      }

      if (result.ok) {
        set((state) => ({
          task: {
            ...(state.task?.postId === args.postId ? state.task : runningTaskFromArgs(args)),
            status: "success",
            stage: "transcribing",
            percent: 100,
            message: "语音转文本已完成",
            error: null,
            transcribedAt: result.transcribed_at,
          },
        }));
        useGlobalTaskCenterStore.getState().finishTranscriptTask(args.postId);
        invalidateLibraryQueries();
        return result;
      }

      if (result.error.code === "TRANSCRIPT_BUSY") {
        set({ task: previousTask });
        useGlobalTaskCenterStore.getState().finishTranscriptTask(args.postId);
        return result;
      }

      set((state) => ({
        task: {
          ...(state.task?.postId === args.postId ? state.task : runningTaskFromArgs(args)),
          status: "failed",
          stage: state.task?.postId === args.postId ? state.task.stage : "queued",
          percent: state.task?.postId === args.postId ? state.task.percent : 0,
          message: "语音转文本失败",
          error: result.error.message,
          transcribedAt: null,
        },
      }));
      useGlobalTaskCenterStore.getState().finishTranscriptTask(args.postId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      set((state) => ({
        task: {
          ...(state.task?.postId === args.postId ? state.task : runningTaskFromArgs(args)),
          status: "failed",
          message: "语音转文本失败",
          error: message,
          transcribedAt: null,
        },
      }));
      useGlobalTaskCenterStore.getState().finishTranscriptTask(args.postId);
      throw err;
    }
  },

  clearTask() {
    set((state) => (state.task?.status === "running" ? state : { task: null }));
  },

  _onProgress(event) {
    set((state) => {
      const prev = state.task;
      const sourceName =
        prev?.postId === event.post_id ? prev.sourceName : defaultTranscriptSourceName(event.post_id);
      return {
        task: {
          postId: event.post_id,
          sourceName,
          status: "running",
          stage: event.stage,
          percent: event.percent,
          startedAt: prev?.postId === event.post_id ? prev.startedAt : new Date().toISOString(),
          message: event.message ?? describeTranscriptStage(event.stage, event.percent),
          error: null,
          transcribedAt: null,
        },
      };
    });
  },
}));
