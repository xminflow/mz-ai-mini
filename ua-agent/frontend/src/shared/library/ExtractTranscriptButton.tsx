import type { MaterialEntry } from "@/shared/contracts/library";
import type {
  AsrStatusResult,
  TranscriptExtractResult,
} from "@/shared/contracts/transcript";
import { FileText, Loader2, RefreshCw, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { iconHints } from "@/shared/library/iconHints";
import { describeTranscriptStage } from "@/shared/library/transcriptTask";
import { useTranscriptTaskStore } from "@/shared/library/useTranscriptTaskStore";
import { Button } from "@/shared/ui/button";
import { HoverHint } from "@/shared/ui/hover-hint";

interface ExtractTranscriptButtonProps {
  entry: MaterialEntry;
  onSuccess: (transcript: string, transcribedAtIso: string) => void;
  testIdPrefix: string;
}

function promptInstallModel(navigate: ReturnType<typeof useNavigate>): void {
  toast.error("语音识别模型未安装", {
    description: "请先在设置页下载语音识别模型，再来提取文案。",
    duration: 8000,
    action: {
      label: "前往设置",
      onClick: () => navigate("/settings?tab=asr"),
    },
  });
}

export function ExtractTranscriptButton({
  entry,
  onSuccess,
  testIdPrefix,
}: ExtractTranscriptButtonProps): JSX.Element | null {
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const task = useTranscriptTaskStore((state) => state.task);
  const runExtraction = useTranscriptTaskStore((state) => state.runExtraction);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (
    entry.note_type !== "video" ||
    (entry.platform !== "douyin" && entry.platform !== "xiaohongshu")
  ) {
    return null;
  }
  const hasTranscript = entry.transcript !== null;
  const isCurrentTask = task?.status === "running" && task.postId === entry.post_id;
  const isBlockedByOtherTask = task?.status === "running" && task.postId !== entry.post_id;

  const handleClick = async (): Promise<void> => {
    if (isBlockedByOtherTask) {
      toast.error("已有语音转文本任务处理中，请稍后再试", {
        description: task?.sourceName ? `当前任务：${task.sourceName}` : undefined,
      });
      return;
    }

    try {
      const raw = await window.api.asr.status();
      const status = raw as AsrStatusResult;
      if (!status.installed) {
        promptInstallModel(navigate);
        return;
      }
    } catch {
      // Fall through to the extract call; if it really is missing it'll
      // surface as ASR_MODEL_MISSING below.
    }

    try {
      const raw = await runExtraction({
        postId: entry.post_id,
        shareUrl: entry.share_url,
        platform: entry.platform,
        sourceName:
          entry.author_display_name ?? entry.author_handle ?? `视频 ${entry.post_id.slice(0, 8)}`,
      });
      const result = raw as TranscriptExtractResult;
      if (result.ok) {
        if (mountedRef.current) {
          onSuccess(result.transcript, result.transcribed_at);
        }
        if (hasTranscript) toast.success("文案已重新生成");
        return;
      }

      const err = result.error;
      if (err.code === "ASR_MODEL_MISSING") {
        promptInstallModel(navigate);
        return;
      }
      if (err.code === "TRANSCRIPT_BUSY") {
        toast.error("已有语音转文本任务处理中，请稍后再试", {
          description: task?.sourceName ? `当前任务：${task.sourceName}` : undefined,
        });
        return;
      }
      toast.error(err.message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg);
    }
  };

  let label: string;
  let sublabel: string | undefined;
  let Icon = FileText;
  if (isCurrentTask && task !== null) {
    label = task.message ?? describeTranscriptStage(task.stage, task.percent);
    sublabel = "等待 ASR 结果回写";
    Icon = Loader2;
  } else if (isBlockedByOtherTask && task !== null) {
    label = "任务进行中";
    sublabel = `${task.sourceName} 正在转写`;
    Icon = Loader2;
  } else if (task?.status === "failed" && task.postId === entry.post_id) {
    label = iconHints.extractTranscriptFailed.label;
    sublabel = task.error ?? undefined;
    Icon = X;
  } else if (hasTranscript) {
    label = iconHints.extractTranscriptAgain.label;
    sublabel = iconHints.extractTranscriptAgain.sublabel;
    Icon = RefreshCw;
  } else {
    label = iconHints.extractTranscript.label;
    sublabel = iconHints.extractTranscript.sublabel;
  }

  return (
    <HoverHint label={label} sublabel={sublabel}>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 gap-1 px-2 text-xs"
        onClick={() => {
          void handleClick();
        }}
        disabled={task?.status === "running"}
        aria-label={label}
        data-testid={`${testIdPrefix}-extract-transcript-${entry.post_id}`}
      >
        <Icon className={`h-3.5 w-3.5 ${task?.status === "running" ? "animate-spin" : ""}`} />
        <span>{label}</span>
      </Button>
    </HoverHint>
  );
}
