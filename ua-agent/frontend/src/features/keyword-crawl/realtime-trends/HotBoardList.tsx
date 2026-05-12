import { ExternalLink } from "lucide-react";

import type { DouyinHotBoardKey } from "@/shared/contracts/douyin-hot";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";

import { realtimeTrendsStrings as strings } from "./strings";
import { useDouyinHotBoard } from "./useDouyinHotBoard";

interface HotBoardListProps {
  board: DouyinHotBoardKey;
}

function formatCount(n: number): string {
  if (n < 0) return "—";
  if (n < 10_000) return n.toLocaleString("zh-CN");
  return `${(n / 10_000).toFixed(1)}万`;
}

function rankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-red-500 text-white dark:bg-red-600";
  if (rank === 2) return "bg-orange-500 text-white dark:bg-orange-600";
  if (rank === 3) return "bg-amber-500 text-white dark:bg-amber-600";
  return "bg-muted text-muted-foreground";
}

export function HotBoardList({ board }: HotBoardListProps): JSX.Element {
  const { items, isLoading, isError, errorMessage } = useDouyinHotBoard(board);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2" data-testid={`hot-board-${board}-loading`}>
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        data-testid={`hot-board-${board}-error`}
      >
        {strings.errorPrefix}
        {errorMessage ?? "未知错误"}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground"
        data-testid={`hot-board-${board}-empty`}
      >
        {strings.emptyState}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2" data-testid={`hot-board-${board}-list`}>
      <ul className="flex flex-col divide-y divide-border rounded-md border border-border">
        {items.map((item) => (
          <li
            key={`${item.rank}-${item.word}`}
            data-testid={`hot-board-${board}-item-${item.rank}`}
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${strings.openItemPrefix}${item.word}`}
              className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
            >
              <span
                className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${rankBadgeClass(item.rank)}`}
              >
                {item.rank}
              </span>
              <span
                className="flex-1 truncate text-foreground"
                title={item.word}
                data-testid={`hot-board-${board}-word-${item.rank}`}
              >
                {item.word}
              </span>
              {item.label !== null && item.label.length > 0 ? (
                <Badge variant="secondary" className="shrink-0">
                  {item.label}
                </Badge>
              ) : null}
              {item.hot_value !== null && item.hot_value > 0 ? (
                <span
                  className="shrink-0 text-xs tabular-nums text-muted-foreground"
                  data-testid={`hot-board-${board}-hot-${item.rank}`}
                >
                  {formatCount(item.hot_value)}
                </span>
              ) : null}
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
