import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import type { Platform } from "@/shared/contracts/capture";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

import { KeywordEditDialog } from "./KeywordEditDialog";
import { KeywordRow } from "./KeywordRow";
import { keywordsStrings } from "./strings";
import { useKeywordsList } from "./useKeywordsList";

export interface KeywordsListProps {
  /** 006 — Platform Tab this list belongs to. Defaults to Douyin. */
  platform?: Platform;
  isReady?: boolean;
  isBatchRunning?: boolean;
  /** Mutation in flight: covers the gap between click and isBatchRunning flipping true. */
  isStartingBatch?: boolean;
  isStoppingBatch?: boolean;
  notReadyReason?: string | null;
  /** Called when "开始采集" clicked. Executor reads enabled keywords from the store. */
  onStartBatch?: () => void;
  onStopBatch?: () => void;
}

export function KeywordsList({
  platform = "douyin",
  isReady = false,
  isBatchRunning = false,
  isStartingBatch = false,
  isStoppingBatch = false,
  notReadyReason = null,
  onStartBatch,
  onStopBatch,
}: KeywordsListProps): JSX.Element {
  const { keywords, isLoading, isError, error } = useKeywordsList(platform);
  const [addOpen, setAddOpen] = useState(false);

  const enabledCount = keywords.filter((k) => k.enabled).length;
  const startDisabled =
    !isReady || isBatchRunning || isStartingBatch || enabledCount === 0;
  const startTooltip = !isReady
    ? `${keywordsStrings.notReadyTooltipPrefix}${notReadyReason ?? ""}`
    : isBatchRunning
      ? keywordsStrings.batchBusyTooltip
      : enabledCount === 0
        ? keywordsStrings.noEnabledTooltip
        : "";

  return (
    <section className="flex flex-col gap-4" data-testid="keywords-list">
      <Card className="shadow-sm">
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">关键词列表</CardTitle>
              <Badge variant="secondary">{keywords.length} 条</Badge>
              <Badge variant="outline">{enabledCount} 条开启</Badge>
            </div>
            <CardDescription>编辑每条关键词的采集目标、发布时间和筛选策略。</CardDescription>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isBatchRunning ? (
              <Button
                variant="destructive"
                disabled={isStoppingBatch}
                onClick={() => onStopBatch?.()}
                data-testid="stop-batch-button"
              >
                {isStoppingBatch ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    {keywordsStrings.stopBatchPendingLabel}
                  </>
                ) : (
                  keywordsStrings.stopBatchLabel
                )}
              </Button>
            ) : (
              <Button
                disabled={startDisabled}
                title={startTooltip || undefined}
                onClick={() => onStartBatch?.()}
                data-testid="start-batch-button"
                variant="outline"
              >
                {isStartingBatch ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    {keywordsStrings.startBatchPendingLabel}
                  </>
                ) : (
                  keywordsStrings.startBatchLabel
                )}
              </Button>
            )}
            <Button
              onClick={() => setAddOpen(true)}
              disabled={isBatchRunning}
              data-testid="add-keyword-button"
            >
              <Plus className="mr-1 h-4 w-4" />
              {keywordsStrings.addButtonLabel}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">加载中…</p>
          ) : isError ? (
            <div
              className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              data-testid="keywords-load-error"
            >
              <p className="font-medium">{keywordsStrings.loadErrorTitle}</p>
              <p className="mt-1">{error?.ok === false ? error.error.message : keywordsStrings.loadErrorFallback}</p>
            </div>
          ) : keywords.length === 0 ? (
            <p
              className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground"
              data-testid="keywords-empty"
            >
              {keywordsStrings.emptyListGuidance}
            </p>
          ) : (
            <ul className="flex flex-col gap-3" data-testid="keywords-rows">
              {keywords.map((row) => (
                <KeywordRow
                  key={row.id}
                  keyword={row}
                  disabled={isBatchRunning}
                />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <KeywordEditDialog open={addOpen} onOpenChange={setAddOpen} platform={platform} />
    </section>
  );
}
