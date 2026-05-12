import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";

import { describeTranscriptStage } from "./transcriptTask";
import { useTranscriptTaskStore } from "./useTranscriptTaskStore";

export function GlobalTranscriptTaskBar(): JSX.Element | null {
  const task = useTranscriptTaskStore((state) => state.task);
  const clearTask = useTranscriptTaskStore((state) => state.clearTask);

  if (task === null) return null;

  const isRunning = task.status === "running";
  const title = isRunning
    ? "语音转文本进行中"
    : task.status === "success"
      ? "语音转文本已完成"
      : "语音转文本失败";
  const detail = isRunning
    ? task.message ?? describeTranscriptStage(task.stage, task.percent)
    : task.status === "success"
      ? `${task.sourceName} 已完成`
      : task.error ?? "任务执行失败";
  const subtitle = isRunning ? `${task.sourceName} · ${detail}` : detail;

  return (
    <div className="border-b border-border bg-muted/40 px-4 py-2" data-testid="global-transcript-task-bar">
      <div className="flex items-center gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          {isRunning ? (
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-foreground" />
          ) : task.status === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {subtitle}
                </p>
              </div>
              <div className="shrink-0 text-xs text-muted-foreground">
                {isRunning ? `${Math.round(task.percent)}%` : null}
              </div>
            </div>
            {isRunning ? <Progress value={task.percent} className="mt-2 h-1.5" /> : null}
          </div>
        </div>
        {!isRunning ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 shrink-0 p-0"
            onClick={() => clearTask()}
            aria-label="关闭语音转文本任务状态"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
