import type { TranscriptStage } from "@/shared/contracts/transcript";

export type TranscriptTaskStatus = "running" | "success" | "failed";

export interface TranscriptTask {
  postId: string;
  sourceName: string;
  status: TranscriptTaskStatus;
  stage: TranscriptStage;
  percent: number;
  startedAt: string;
  message: string | null;
  error: string | null;
  transcribedAt: string | null;
}

export function describeTranscriptStage(stage: TranscriptStage, percent: number): string {
  if (stage === "queued") return "排队中…";
  if (stage === "resolving_url") return "解析链接…";
  if (stage === "downloading_mp4") return `下载视频 ${Math.round(percent)}%`;
  if (stage === "loading_model") return "加载模型…";
  return `转写中 ${Math.round(percent)}%`;
}

export function defaultTranscriptSourceName(postId: string): string {
  return `视频 ${postId.slice(0, 8)}`;
}
