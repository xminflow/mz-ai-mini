import { useOutletContext } from "react-router-dom";

import type { ShellContext } from "../KeywordCrawlShell";
import { useBatchStart } from "../batch/useBatchStart";
import { useBatchStop } from "../batch/useBatchStop";
import { KeywordsList } from "../keywords/KeywordsList";
import { ScheduleCard } from "../scheduling/ScheduleCard";

export function DouyinCollectPage(): JSX.Element {
  const { isRunning, runningPlatform } = useOutletContext<ShellContext>();
  const startBatch = useBatchStart("douyin");
  const stopBatch = useBatchStop();

  const otherPlatformBusy =
    isRunning && runningPlatform !== null && runningPlatform !== "douyin";

  return (
    <div className="flex flex-col gap-6">
      <KeywordsList
        platform="douyin"
        isReady={!otherPlatformBusy}
        isBatchRunning={isRunning && runningPlatform === "douyin"}
        isStartingBatch={startBatch.isPending}
        isStoppingBatch={stopBatch.isPending}
        notReadyReason={otherPlatformBusy ? "已有小红书批次进行中" : null}
        onStartBatch={() => startBatch.mutate()}
        onStopBatch={() => stopBatch.mutate()}
      />
      <ScheduleCard platform="douyin" />
    </div>
  );
}
