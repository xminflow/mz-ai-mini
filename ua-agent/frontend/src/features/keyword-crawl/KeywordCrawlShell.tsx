import { Outlet, useLocation } from "react-router-dom";

import type { Platform } from "@/shared/contracts/capture";

import { BatchProgressCard } from "./batch/BatchProgressCard";
import { useBatchEventStream } from "./batch/useBatchEventStream";
import { useBatchStatus } from "./batch/useBatchStatus";
import { useBatchStop } from "./batch/useBatchStop";
import { useSchedulerEventStream } from "./scheduling/useSchedulerEventStream";

export interface ShellContext {
  isRunning: boolean;
  runningPlatform: Platform | null;
}

export function KeywordCrawlShell(): JSX.Element {
  const { batch: snapshotBatch } = useBatchStatus();
  const { batch, isRunning } = useBatchEventStream(snapshotBatch);
  const stopBatch = useBatchStop();
  useSchedulerEventStream();
  const location = useLocation();
  const currentPlatform: Platform | null = location.pathname.endsWith("/douyin")
    ? "douyin"
    : location.pathname.endsWith("/xiaohongshu")
      ? "xiaohongshu"
      : null;
  const showProgress = batch !== null && currentPlatform !== null && batch.platform === currentPlatform;

  const context: ShellContext = {
    isRunning,
    runningPlatform: batch?.platform ?? null,
  };

  return (
    <div className="app-shell-page max-w-6xl bg-muted/30">
      {showProgress ? (
        <div
          className="sticky top-0 z-20 -mx-6 bg-background px-6 py-2"
          data-testid="batch-progress-banner"
        >
          <BatchProgressCard
            batch={batch}
            onStop={isRunning ? () => stopBatch.mutate() : undefined}
          />
        </div>
      ) : null}
      <Outlet context={context} />
    </div>
  );
}
