import { create } from "zustand";

import type { BloggerEvent } from "@/shared/contracts/blogger";
import type { BatchEvent } from "@/shared/contracts/keyword/batch-event";
import type { BatchSnapshot } from "@/shared/contracts/keyword/batch-status";
import type { TranscriptProgressEvent } from "@/shared/contracts/transcript";

import { defaultTranscriptSourceName, describeTranscriptStage } from "@/shared/library/transcriptTask";

export type GlobalTaskKind =
  | "keyword-batch"
  | "blogger-profile"
  | "blogger-sample"
  | "blogger-analyze"
  | "transcript";

export type GlobalTaskStopAction =
  | { type: "keyword-batch"; batchId: string }
  | { type: "blogger-analyze"; bloggerId: string };

export interface GlobalTaskItem {
  key: string;
  kind: GlobalTaskKind;
  entityId: string;
  title: string;
  subtitle: string;
  detail: string;
  startedAt: string;
  progressPercent: number | null;
  stopAction: GlobalTaskStopAction | null;
}

interface GlobalTaskCenterState {
  tasks: Record<string, GlobalTaskItem>;
  reset: () => void;
  seedTranscriptTask: (args: { postId: string; sourceName: string; startedAt?: string }) => void;
  finishTranscriptTask: (postId: string) => void;
  applyTranscriptProgress: (event: TranscriptProgressEvent) => void;
  applyBatchSnapshot: (batch: BatchSnapshot | null) => void;
  applyBatchEvent: (event: BatchEvent) => void;
  applyBloggerEvent: (event: BloggerEvent) => void;
}

function platformLabel(platform: "douyin" | "xiaohongshu"): string {
  return platform === "xiaohongshu" ? "小红书" : "抖音";
}

function shortId(id: string): string {
  return id.slice(0, 8);
}

export function transcriptTaskKey(postId: string): string {
  return `transcript:${postId}`;
}

export function bloggerProfileTaskKey(bloggerId: string): string {
  return `blogger-profile:${bloggerId}`;
}

export function bloggerSampleTaskKey(bloggerId: string): string {
  return `blogger-sample:${bloggerId}`;
}

export function bloggerAnalyzeTaskKey(bloggerId: string): string {
  return `blogger-analyze:${bloggerId}`;
}

function batchTaskKey(batchId: string): string {
  return `keyword-batch:${batchId}`;
}

function startedTask(
  task: Omit<GlobalTaskItem, "progressPercent"> & { progressPercent?: number | null },
): GlobalTaskItem {
  return {
    ...task,
    progressPercent: task.progressPercent ?? null,
  };
}

function withTask(
  tasks: Record<string, GlobalTaskItem>,
  task: GlobalTaskItem,
): Record<string, GlobalTaskItem> {
  return {
    ...tasks,
    [task.key]: task,
  };
}

function withoutTask(
  tasks: Record<string, GlobalTaskItem>,
  key: string,
): Record<string, GlobalTaskItem> {
  if (!(key in tasks)) return tasks;
  const next = { ...tasks };
  delete next[key];
  return next;
}

function removeKind(
  tasks: Record<string, GlobalTaskItem>,
  kind: GlobalTaskKind,
): Record<string, GlobalTaskItem> {
  let next = tasks;
  for (const task of Object.values(tasks)) {
    if (task.kind === kind) {
      next = withoutTask(next, task.key);
    }
  }
  return next;
}

function findCurrentBatchRun(batch: BatchSnapshot) {
  if (batch.current_index !== null) {
    return batch.runs[batch.current_index] ?? null;
  }
  for (let i = batch.runs.length - 1; i >= 0; i -= 1) {
    const run = batch.runs[i];
    if (run !== undefined && run.status !== "pending") return run;
  }
  return batch.runs[batch.runs.length - 1] ?? null;
}

function batchProgressPercent(batch: BatchSnapshot): number | null {
  const total = batch.runs.length;
  if (total <= 0) return null;
  const completed = batch.runs.filter((run) => run.status !== "pending" && run.status !== "running").length;
  const currentWeight = batch.status === "running" && batch.current_index !== null ? 0.5 : 0;
  return Math.max(0, Math.min(99, ((completed + currentWeight) / total) * 100));
}

function batchTaskFromSnapshot(batch: BatchSnapshot): GlobalTaskItem {
  const currentRun = findCurrentBatchRun(batch);
  const total = batch.runs.length;
  const progressPercent = batchProgressPercent(batch);
  const subtitle =
    currentRun !== null
      ? `${platformLabel(batch.platform)} · ${currentRun.keyword_text || "准备开始"}`
      : `${platformLabel(batch.platform)} · 准备开始`;
  const detail =
    currentRun !== null
      ? `${currentRun.position}/${total} · 已采集 ${currentRun.captured_count} · 重复 ${currentRun.duplicate_count} · 过滤 ${currentRun.filtered_count}`
      : "等待执行第一条关键词";
  return startedTask({
    key: batchTaskKey(batch.batch_id),
    kind: "keyword-batch",
    entityId: batch.batch_id,
    title: `${platformLabel(batch.platform)}关键词采集`,
    subtitle,
    detail,
    startedAt: batch.started_at,
    progressPercent,
    stopAction: { type: "keyword-batch", batchId: batch.batch_id },
  });
}

function bloggerLabel(bloggerId: string): string {
  return `博主 ${shortId(bloggerId)}`;
}

export const useGlobalTaskCenterStore = create<GlobalTaskCenterState>((set) => ({
  tasks: {},

  reset() {
    set({ tasks: {} });
  },

  seedTranscriptTask(args) {
    const startedAt = args.startedAt ?? new Date().toISOString();
    const key = transcriptTaskKey(args.postId);
    set((state) => ({
      tasks: withTask(
        state.tasks,
        startedTask({
          key,
          kind: "transcript",
          entityId: args.postId,
          title: "语音转文本",
          subtitle: args.sourceName,
          detail: "排队中…",
          startedAt,
          progressPercent: 0,
          stopAction: null,
        }),
      ),
    }));
  },

  finishTranscriptTask(postId) {
    set((state) => ({
      tasks: withoutTask(state.tasks, transcriptTaskKey(postId)),
    }));
  },

  applyTranscriptProgress(event) {
    const key = transcriptTaskKey(event.post_id);
    set((state) => {
      const prev = state.tasks[key];
      return {
        tasks: withTask(
          state.tasks,
          startedTask({
            key,
            kind: "transcript",
            entityId: event.post_id,
            title: "语音转文本",
            subtitle: prev?.subtitle ?? defaultTranscriptSourceName(event.post_id),
            detail: event.message ?? describeTranscriptStage(event.stage, event.percent),
            startedAt: prev?.startedAt ?? new Date().toISOString(),
            progressPercent: event.percent,
            stopAction: null,
          }),
        ),
      };
    });
  },

  applyBatchSnapshot(batch) {
    set((state) => {
      let tasks = removeKind(state.tasks, "keyword-batch");
      if (batch !== null && batch.status === "running") {
        tasks = withTask(tasks, batchTaskFromSnapshot(batch));
      }
      return { tasks };
    });
  },

  applyBatchEvent(event) {
    set((state) => {
      const key = batchTaskKey(event.batch_id);
      if (event.phase === "batch-ended") {
        return { tasks: withoutTask(state.tasks, key) };
      }

      const prev = state.tasks[key];
      if (event.phase === "batch-started") {
        return {
          tasks: withTask(
            removeKind(state.tasks, "keyword-batch"),
            startedTask({
              key,
              kind: "keyword-batch",
              entityId: event.batch_id,
              title: `${platformLabel(event.platform)}关键词采集`,
              subtitle: `${platformLabel(event.platform)} · 准备开始`,
              detail: `0/${event.selected_keyword_ids.length} · 等待执行第一条关键词`,
              startedAt: event.started_at,
              progressPercent: 0,
              stopAction: { type: "keyword-batch", batchId: event.batch_id },
            }),
          ),
        };
      }

      if (event.phase === "keyword-started") {
        const detail = `${event.position}/${event.total} · 已进入关键词采集`;
        const progressPercent = Math.max(0, Math.min(99, ((event.position - 0.5) / event.total) * 100));
        return {
          tasks: withTask(
            state.tasks,
            startedTask({
              key,
              kind: "keyword-batch",
              entityId: event.batch_id,
              title: `${platformLabel(event.platform)}关键词采集`,
              subtitle: `${platformLabel(event.platform)} · ${event.keyword_text}`,
              detail,
              startedAt: prev?.startedAt ?? event.started_at,
              progressPercent,
              stopAction: { type: "keyword-batch", batchId: event.batch_id },
            }),
          ),
        };
      }

      if (event.phase === "progress") {
        return prev === undefined
          ? { tasks: state.tasks }
          : {
              tasks: withTask(state.tasks, {
                ...prev,
                detail: `已采集 ${event.captured_count} · 重复 ${event.duplicate_count} · 过滤 ${event.filtered_count} · 错误 ${event.error_count}`,
              }),
            };
      }

      if (event.phase === "keyword-ended") {
        return prev === undefined
          ? { tasks: state.tasks }
          : {
              tasks: withTask(state.tasks, {
                ...prev,
                detail: `关键词完成 · 已采集 ${event.captured_count} · 重复 ${event.duplicate_count}`,
              }),
            };
      }

      return { tasks: state.tasks };
    });
  },

  applyBloggerEvent(event) {
    set((state) => {
      const analyzeKey = bloggerAnalyzeTaskKey(event.blogger_id);
      const profileKey = bloggerProfileTaskKey(event.blogger_id);
      const sampleKey = bloggerSampleTaskKey(event.blogger_id);

      if (event.phase === "profile-started") {
        return {
          tasks: withTask(
            state.tasks,
            startedTask({
              key: profileKey,
              kind: "blogger-profile",
              entityId: event.blogger_id,
              title: "博主资料采集",
              subtitle: bloggerLabel(event.blogger_id),
              detail: "正在采集主页资料",
              startedAt: event.started_at,
              stopAction: null,
            }),
          ),
        };
      }

      if (event.phase === "profile-ended") {
        return { tasks: withoutTask(state.tasks, profileKey) };
      }

      if (event.phase === "sample-started") {
        if (state.tasks[analyzeKey] !== undefined) {
          return {
            tasks: withTask(state.tasks, {
              ...state.tasks[analyzeKey]!,
              detail: "正在采样作品",
            }),
          };
        }
        return {
          tasks: withTask(
            state.tasks,
            startedTask({
              key: sampleKey,
              kind: "blogger-sample",
              entityId: event.blogger_id,
              title: "博主作品采样",
              subtitle: bloggerLabel(event.blogger_id),
              detail: "正在采样作品",
              startedAt: event.started_at,
              stopAction: null,
            }),
          ),
        };
      }

      if (event.phase === "sample-progress") {
        const targetKey = state.tasks[analyzeKey] !== undefined ? analyzeKey : sampleKey;
        const prev = state.tasks[targetKey];
        if (prev === undefined) return { tasks: state.tasks };
        return {
          tasks: withTask(state.tasks, {
            ...prev,
            detail: `已滚动 ${event.scroll_count} 次 · 已发现 ${event.loaded_count} 条作品`,
          }),
        };
      }

      if (event.phase === "sample-ended") {
        if (state.tasks[analyzeKey] !== undefined) {
          return {
            tasks: withTask(withoutTask(state.tasks, sampleKey), {
              ...state.tasks[analyzeKey]!,
              detail:
                event.status === "sampled"
                  ? `采样完成 · 已采集 ${event.sampled_count}/${event.total_works} 条作品`
                  : event.last_error ?? "作品采样失败",
            }),
          };
        }
        return { tasks: withoutTask(state.tasks, sampleKey) };
      }

      if (event.phase === "analyze-started") {
        return {
          tasks: withTask(
            withoutTask(state.tasks, sampleKey),
            startedTask({
              key: analyzeKey,
              kind: "blogger-analyze",
              entityId: event.blogger_id,
              title: "博主拆解",
              subtitle: bloggerLabel(event.blogger_id),
              detail: event.sample_required ? "先补采样，再拆解作品" : "准备拆解作品",
              startedAt: event.started_at,
              stopAction: { type: "blogger-analyze", bloggerId: event.blogger_id },
            }),
          ),
        };
      }

      if (event.phase === "analyze-video-started") {
        const prev = state.tasks[analyzeKey];
        if (prev === undefined) return { tasks: state.tasks };
        const current = event.processed + 1;
        const total = Math.max(event.total_to_process, 1);
        return {
          tasks: withTask(state.tasks, {
            ...prev,
            detail: `作品 ${current}/${total} · 抽帧并转写`,
            progressPercent: Math.max(0, Math.min(95, (event.processed / total) * 100)),
          }),
        };
      }

      if (event.phase === "analyze-video-ended") {
        const prev = state.tasks[analyzeKey];
        if (prev === undefined || event.status !== "error") return { tasks: state.tasks };
        return {
          tasks: withTask(state.tasks, {
            ...prev,
            detail: event.error ?? "作品拆解失败",
          }),
        };
      }

      if (event.phase === "analyze-report-started") {
        const prev = state.tasks[analyzeKey];
        if (prev === undefined) return { tasks: state.tasks };
        return {
          tasks: withTask(state.tasks, {
            ...prev,
            detail: "生成拆解报告",
            progressPercent: prev.progressPercent !== null ? Math.max(prev.progressPercent, 95) : 95,
          }),
        };
      }

      if (event.phase === "analyze-report-ended") {
        const prev = state.tasks[analyzeKey];
        if (prev === undefined || event.status !== "error") return { tasks: state.tasks };
        return {
          tasks: withTask(state.tasks, {
            ...prev,
            detail: event.last_error ?? "报告生成失败",
          }),
        };
      }

      if (event.phase === "analyze-ended") {
        return { tasks: withoutTask(state.tasks, analyzeKey) };
      }

      return { tasks: state.tasks };
    });
  },

}));

export function getSortedGlobalTasks(tasks: Record<string, GlobalTaskItem>): GlobalTaskItem[] {
  return Object.values(tasks).sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}
