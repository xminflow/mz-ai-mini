import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import type { BatchSnapshot } from "@/shared/contracts/keyword/batch-status";

import { batchStrings } from "./strings";

interface BatchProgressCardProps {
  batch: BatchSnapshot | null;
  /** 006 — When provided and batch is running, render a "停止整批" button. */
  onStop?: (() => void) | undefined;
}

const PLATFORM_LABEL: Record<BatchSnapshot["platform"], string> = {
  douyin: "抖音",
  xiaohongshu: "小红书",
};

function platformBadgeClass(platform: BatchSnapshot["platform"]): string {
  return platform === "xiaohongshu"
    ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
    : "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300";
}

function statusBadgeVariant(
  status: BatchSnapshot["status"],
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "running":
      return "default";
    case "done":
      return "secondary";
    case "stopped":
      return "outline";
    case "error":
      return "destructive";
  }
}

export function BatchProgressCard({ batch, onStop }: BatchProgressCardProps): JSX.Element | null {
  if (batch === null) return null;

  const idx = batch.current_index;
  let currentRun = idx !== null ? batch.runs[idx] ?? null : null;
  if (currentRun === null && batch.runs.length > 0) {
    // After batch-ended the executor sets current_index to null; fall back
    // to the last run with data so the card still tells the user what just
    // happened instead of pretending nothing started.
    for (let i = batch.runs.length - 1; i >= 0; i--) {
      const candidate = batch.runs[i];
      if (candidate !== undefined && candidate.status !== "pending") {
        currentRun = candidate;
        break;
      }
    }
    if (currentRun === null) {
      currentRun = batch.runs[batch.runs.length - 1] ?? null;
    }
  }

  return (
    <Card data-testid="batch-progress-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">采集进度</CardTitle>
          <Badge
            variant="outline"
            className={`text-xs ${platformBadgeClass(batch.platform)}`}
            data-testid="batch-progress-platform"
          >
            {PLATFORM_LABEL[batch.platform]}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusBadgeVariant(batch.status)}>
            {batchStrings.statusBadge[batch.status]}
          </Badge>
          {onStop !== undefined && batch.status === "running" ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={onStop}
              data-testid="batch-progress-stop"
            >
              {batchStrings.stopBatchButton ?? "停止整批"}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {currentRun !== null ? (
          <>
            <p className="text-sm">
              <span className="text-muted-foreground">{batchStrings.sectionRunning}：</span>
              <span className="font-medium" data-testid="batch-progress-current">
                {currentRun.keyword_text || "（加载中）"}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                {currentRun.position} / {batch.runs.length}
              </span>
            </p>
            <div className="grid grid-cols-5 gap-3 rounded-md bg-muted/40 p-3 dark:bg-muted/20">
              <div>
                <p className="text-xs text-muted-foreground">{batchStrings.counts.scanned}</p>
                <p className="text-xl font-semibold" data-testid="count-scanned">
                  {currentRun.scanned_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{batchStrings.counts.captured}</p>
                <p
                  className="text-xl font-semibold text-emerald-600 dark:text-emerald-400"
                  data-testid="count-captured"
                >
                  {currentRun.captured_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{batchStrings.counts.duplicate}</p>
                <p
                  className="text-xl font-semibold text-amber-600 dark:text-amber-400"
                  data-testid="count-duplicate"
                >
                  {currentRun.duplicate_count}
                </p>
              </div>
              <div title={batchStrings.filteredTooltip}>
                <p className="text-xs text-muted-foreground">{batchStrings.counts.filtered}</p>
                <p
                  className="text-xl font-semibold text-sky-600 dark:text-sky-400"
                  data-testid="count-filtered"
                >
                  {currentRun.filtered_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{batchStrings.counts.error}</p>
                <p
                  className="text-xl font-semibold text-red-600 dark:text-red-400"
                  data-testid="count-error"
                >
                  {currentRun.error_count}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">尚未开始第一条关键词。</p>
        )}
        <p className="text-xs text-muted-foreground">
          {batchStrings.summaryStartedAt}：{batch.started_at}
        </p>
      </CardContent>
    </Card>
  );
}
