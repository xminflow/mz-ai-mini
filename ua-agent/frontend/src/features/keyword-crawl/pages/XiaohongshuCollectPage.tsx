import { useOutletContext } from "react-router-dom";

import type { ShellContext } from "../KeywordCrawlShell";
import { useBatchStart } from "../batch/useBatchStart";
import { useBatchStop } from "../batch/useBatchStop";
import { KeywordsList } from "../keywords/KeywordsList";
import { ScheduleCard } from "../scheduling/ScheduleCard";

export function XiaohongshuCollectPage(): JSX.Element {
  const { isRunning, runningPlatform } = useOutletContext<ShellContext>();
  const startBatch = useBatchStart("xiaohongshu");
  const stopBatch = useBatchStop();

  const otherPlatformBusy =
    isRunning && runningPlatform !== null && runningPlatform !== "xiaohongshu";

  return (
    <div className="flex flex-col gap-6">
      <KeywordsList
        platform="xiaohongshu"
        isReady={!otherPlatformBusy}
        isBatchRunning={isRunning && runningPlatform === "xiaohongshu"}
        isStartingBatch={startBatch.isPending}
        isStoppingBatch={stopBatch.isPending}
        notReadyReason={otherPlatformBusy ? "已有抖音批次进行中" : null}
        onStartBatch={() => startBatch.mutate()}
        onStopBatch={() => stopBatch.mutate()}
      />
      <ScheduleCard platform="xiaohongshu" />
    </div>
  );
}
