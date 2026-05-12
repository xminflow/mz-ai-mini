import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";

import type { KeywordRow as KeywordRowData } from "@/shared/contracts/keyword/keyword-list";

import { KeywordDeleteDialog } from "./KeywordDeleteDialog";
import { KeywordEditDialog } from "./KeywordEditDialog";
import { keywordsStrings } from "./strings";
import { useKeywordUpdate } from "./useKeywordUpdate";

interface KeywordRowProps {
  keyword: KeywordRowData;
  /** When true, all interactive elements are disabled (a batch is running). */
  disabled?: boolean;
}

function publishTimeLabel(raw: KeywordRowData["publish_time_range"]): string {
  switch (raw) {
    case "day":
      return keywordsStrings.publishTimeDay;
    case "week":
      return keywordsStrings.publishTimeWeek;
    case "half_year":
      return keywordsStrings.publishTimeHalfYear;
    default:
      return keywordsStrings.publishTimeAll;
  }
}

function filterSummary(keyword: KeywordRowData): string {
  if (keyword.metric_filter_mode === "ratio") {
    return `赞粉比 ≥ ${keyword.min_like_follower_ratio.toFixed(1)}`;
  }
  if (keyword.metric_filter_mode === "author_metrics") {
    const parts: string[] = [];
    if (keyword.author_follower_count_op !== null && keyword.author_follower_count_value !== null) {
      parts.push(
        `粉丝 ${
          keyword.author_follower_count_op === "gte"
            ? keywordsStrings.comparisonGte
            : keywordsStrings.comparisonLte
        } ${keyword.author_follower_count_value}`,
      );
    }
    if (keyword.like_count_op !== null && keyword.like_count_value !== null) {
      parts.push(
        `赞 ${
          keyword.like_count_op === "gte"
            ? keywordsStrings.comparisonGte
            : keywordsStrings.comparisonLte
        } ${keyword.like_count_value}`,
      );
    }
    return parts.length > 0 ? parts.join(" · ") : keywordsStrings.filterModeAuthorMetrics;
  }
  return keywordsStrings.filterModeNone;
}

export function KeywordRow({
  keyword,
  disabled = false,
}: KeywordRowProps): JSX.Element {
  const { id, text, enabled, target_cap, health_cap } = keyword;
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateMutation = useKeywordUpdate();

  function toggleEnabled(next: boolean): void {
    updateMutation.mutate({ id, enabled: next });
  }

  return (
    <li
      className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm transition-colors hover:bg-accent/30"
      data-testid="keyword-row"
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={enabled}
          onCheckedChange={(value) => toggleEnabled(value === true)}
          disabled={disabled || updateMutation.isPending}
          aria-label={enabled ? `关闭 ${text}` : `开启 ${text}`}
          id={`kw-${id}`}
          data-testid="keyword-row-enabled"
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={`kw-${id}`}
              className="cursor-pointer truncate text-sm font-medium"
              data-testid="keyword-row-text"
            >
              {text}
            </label>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">目标 {target_cap}</Badge>
            <Badge variant="outline">上限 {health_cap}</Badge>
            <Badge variant="secondary">{filterSummary(keyword)}</Badge>
            <Badge variant="secondary">{publishTimeLabel(keyword.publish_time_range)}</Badge>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditOpen(true)}
            disabled={disabled}
            title={keywordsStrings.editTooltip}
            aria-label={keywordsStrings.editTooltip}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteOpen(true)}
            disabled={disabled}
            title={keywordsStrings.deleteTooltip}
            aria-label={keywordsStrings.deleteTooltip}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <KeywordEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        editingKeyword={keyword}
      />
      <KeywordDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        keywordId={id}
        keywordText={text}
      />
    </li>
  );
}
