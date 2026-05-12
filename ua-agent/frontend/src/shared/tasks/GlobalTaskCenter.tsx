import { useMemo, useState } from "react";
import { Activity, AudioLines, Loader2, Search, SquareTerminal, StopCircle, UserRoundSearch } from "lucide-react";
import { toast } from "sonner";

import { bloggerAnalyzeCancelResultSchema } from "@/shared/contracts/blogger";
import { batchStopResultSchema } from "@/shared/contracts/keyword/batch-stop";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Progress } from "@/shared/ui/progress";
import { cn } from "@/shared/lib/utils";

import { getSortedGlobalTasks, useGlobalTaskCenterStore, type GlobalTaskItem } from "./store";

function iconForTask(task: GlobalTaskItem): JSX.Element {
  if (task.kind === "transcript") return <AudioLines className="size-4" />;
  if (task.kind === "keyword-batch") return <Search className="size-4" />;
  if (task.kind === "blogger-analyze") return <SquareTerminal className="size-4" />;
  return <UserRoundSearch className="size-4" />;
}

function formatStartedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function GlobalTaskCenter(): JSX.Element {
  const tasksMap = useGlobalTaskCenterStore((state) => state.tasks);
  const tasks = useMemo(() => getSortedGlobalTasks(tasksMap), [tasksMap]);
  const [stoppingKeys, setStoppingKeys] = useState<string[]>([]);
  const runningCount = tasks.length;

  async function handleStop(task: GlobalTaskItem): Promise<void> {
    if (task.stopAction === null || stoppingKeys.includes(task.key)) return;
    setStoppingKeys((prev) => [...prev, task.key]);
    try {
      if (task.stopAction.type === "keyword-batch") {
        const raw = await window.api.keyword.batchStop();
        const parsed = batchStopResultSchema.safeParse(raw);
        if (!parsed.success) {
          toast.error("停止批任务失败：响应未通过校验");
          return;
        }
        if (!parsed.data.ok) {
          toast.error(parsed.data.error.message);
          return;
        }
        toast.success("已请求停止关键词采集");
        return;
      }

      const raw = await window.api.blogger.analyzeCancel({ id: task.stopAction.bloggerId });
      const parsed = bloggerAnalyzeCancelResultSchema.safeParse(raw);
      if (!parsed.success) {
        toast.error("停止博主拆解失败：响应未通过校验");
        return;
      }
      if (!parsed.data.ok) {
        toast.error(parsed.data.error.message);
        return;
      }
      if (parsed.data.cancelled) {
        toast.success("已请求停止博主拆解");
      } else {
        toast.info("任务已结束或未在运行");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    } finally {
      setStoppingKeys((prev) => prev.filter((key) => key !== task.key));
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "app-no-drag relative flex h-8 items-center gap-2 rounded-sm px-2 text-[11px] text-muted-foreground transition-colors hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            runningCount > 0 ? "task-center-active task-center-float text-sidebar-foreground" : "",
          )}
          aria-label="打开任务中心"
        >
          <span className="h-4 w-px bg-border/80" />
          {runningCount > 0 ? (
            <>
              <span className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(90deg,rgba(245,158,11,0.08),rgba(251,191,36,0.18),rgba(245,158,11,0.08))] opacity-90" />
              <span className="task-center-highlight pointer-events-none absolute inset-y-0 left-0 w-16 -skew-x-12 rounded-full bg-white/35" />
              <span className="task-center-halo pointer-events-none absolute left-8 top-1/2 size-8 -translate-y-1/2 rounded-full bg-amber-400/25 blur-md" />
              <span className="pointer-events-none absolute right-1.5 top-1.5">
                <span className="absolute inset-0 size-2 rounded-full bg-emerald-500/70 animate-ping" />
                <span className="block size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
              </span>
            </>
          ) : null}
          <span className="relative flex items-center gap-1.5">
            <span
              className={cn(
                "relative grid size-5 place-items-center rounded-full transition-colors",
                runningCount > 0 ? "bg-amber-500/15 text-amber-700" : "",
              )}
            >
              <Activity className={cn("size-3.5", runningCount > 0 ? "task-center-icon-pulse" : "")} />
            </span>
          </span>
          {runningCount > 0 ? (
            <span className="flex items-end gap-0.5">
              <span className="task-center-dot size-1 rounded-full bg-amber-600/90" />
              <span className="task-center-dot task-center-dot-delay-1 size-1 rounded-full bg-amber-600/90" />
              <span className="task-center-dot task-center-dot-delay-2 size-1 rounded-full bg-amber-600/90" />
            </span>
          ) : null}
          {runningCount > 0 ? (
            <span
              className="inline-flex min-w-4 items-center justify-center rounded-full bg-amber-500/15 px-1 text-[10px] font-medium leading-4 text-sidebar-foreground"
            >
              {runningCount}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0" sideOffset={8}>
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">任务中心</p>
              <p className="text-xs text-muted-foreground">显示当前仍在执行中的长任务</p>
            </div>
            <Badge variant="outline">{runningCount}</Badge>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            当前没有进行中的任务
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto p-2">
            {tasks.map((task) => {
              const isStopping = stoppingKeys.includes(task.key);
              return (
                <div
                  key={task.key}
                  data-testid={`global-task-item-${task.key}`}
                  className="relative overflow-hidden rounded-lg border border-border px-3 py-3 shadow-sm"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_45%)] opacity-70" />
                  <div className="pointer-events-none absolute right-3 top-3">
                    <span className="absolute inset-0 size-2 rounded-full bg-emerald-500/80 animate-ping" />
                    <span className="block size-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 text-muted-foreground">{iconForTask(task)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{task.subtitle}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatStartedAt(task.startedAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-foreground/80">{task.detail}</p>
                      {task.progressPercent !== null ? (
                        <div className="relative mt-2 overflow-hidden rounded-full">
                          <Progress
                            value={task.progressPercent}
                            className="h-1.5 bg-primary/10 [&_[data-state]]:bg-primary"
                          />
                          <span className="task-center-sheen pointer-events-none absolute inset-y-0 left-0 w-14 -skew-x-12 bg-white/25 dark:bg-white/15" />
                        </div>
                      ) : null}
                    </div>
                  </div>
                  {task.stopAction !== null ? (
                    <div className="mt-3 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          void handleStop(task);
                        }}
                        disabled={isStopping}
                        data-testid={`global-task-stop-${task.key}`}
                      >
                        {isStopping ? <Loader2 className="size-3.5 animate-spin" /> : <StopCircle className="size-3.5" />}
                        停止
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
