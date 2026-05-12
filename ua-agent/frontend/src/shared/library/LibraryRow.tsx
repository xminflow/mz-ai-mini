import type { MaterialEntry } from "@/shared/contracts/library";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { HoverHint } from "@/shared/ui/hover-hint";

import { CopyDouyinDownloadButton } from "./CopyDouyinDownloadButton";
import {
  LOW_FOLLOWER_HIGH_LIKE_BADGE_CLASS,
  LOW_FOLLOWER_HIGH_LIKE_LABEL,
  isLowFollowerHighLike,
} from "./followerInsight";
import { iconHints, type IconHint } from "./iconHints";
import { libraryStrings as strings } from "./strings";

interface LibraryRowProps {
  entry: MaterialEntry;
  onDelete: (postId: string) => void;
}

function formatRelative(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diffMs = Date.now() - t;
  if (diffMs < 60_000) return strings.justNow;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

function openExternal(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

interface CaptureSourceBadge {
  label: string;
  className: string;
  testId: string;
  hint: IconHint;
}

/**
 * 006 — Source badge dispatch by `platform` column (preferred) with a
 * fallback to the legacy `captured_by_device` prefix scheme. The three
 * source classes (FR-033):
 *   📕 小红书网页搜索（关键词：xxx）
 *   🌐 抖音网页搜索（关键词：xxx）
 *   📱 手机采集
 */
function captureSourceBadge(
  captured_by_device: string,
  platform: "douyin" | "xiaohongshu",
): CaptureSourceBadge {
  // Phone capture (002): captured_by_device does NOT start with "web:".
  if (!captured_by_device.startsWith("web:")) {
    return {
      label: strings.badgePhone,
      className:
        "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50",
      testId: "library-row-source-phone",
      hint: iconHints.sourcePhone,
    };
  }

  // Web keyword: extract the keyword text from the structured device tag.
  // Two prefixes: "web:keyword:xhs:<text>" (XHS) and "web:keyword:<text>" (Douyin).
  let keyword: string | null = null;
  if (captured_by_device.startsWith("web:keyword:xhs:")) {
    keyword = captured_by_device.slice("web:keyword:xhs:".length);
  } else if (captured_by_device.startsWith("web:keyword:")) {
    keyword = captured_by_device.slice("web:keyword:".length);
  }

  if (platform === "xiaohongshu") {
    return {
      label: keyword !== null
        ? `📕 小红书网页搜索（关键词：${keyword}）`
        : "📕 小红书网页搜索",
      className:
        "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50",
      testId: "library-row-source-xhs-keyword",
      hint: iconHints.sourceXhsKeyword,
    };
  }

  // Douyin (default for legacy "web:" rows pre-006 schema upgrade).
  const douyinClass =
    "border-sky-300 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50";
  if (keyword !== null) {
    return {
      label: `🌐 抖音网页搜索（关键词：${keyword}）`,
      className: douyinClass,
      testId: "library-row-source-keyword",
      hint: iconHints.sourceDouyinKeyword,
    };
  }
  return {
    label: strings.badgeWeb,
    className: douyinClass,
    testId: "library-row-source-web",
    hint: iconHints.sourceDouyinWeb,
  };
}

export function LibraryRow({ entry, onDelete }: LibraryRowProps): JSX.Element {
  const sourceBadge = captureSourceBadge(entry.captured_by_device, entry.platform);
  return (
    <Card data-testid={`library-row-${entry.post_id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <span title={entry.author_handle}>@{entry.author_display_name ?? entry.author_handle}</span>
            <HoverHint label={sourceBadge.hint.label} sublabel={sourceBadge.hint.sublabel}>
              <Badge
                variant="outline"
                className={`text-xs ${sourceBadge.className}`}
                data-testid={sourceBadge.testId}
              >
                {sourceBadge.label}
              </Badge>
            </HoverHint>
            {isLowFollowerHighLike(entry) ? (
              <HoverHint
                label={iconHints.lowFollowerHighLike.label}
                sublabel={iconHints.lowFollowerHighLike.sublabel}
              >
                <Badge
                  variant="outline"
                  className={`text-xs ${LOW_FOLLOWER_HIGH_LIKE_BADGE_CLASS}`}
                  data-testid="library-row-low-follower-high-like"
                >
                  {LOW_FOLLOWER_HIGH_LIKE_LABEL}
                </Badge>
              </HoverHint>
            ) : null}
            {entry.post_id_source === "share_url_short" ? (
              <Badge variant="secondary" className="text-xs">
                {strings.shortDupHint}
              </Badge>
            ) : null}
          </div>
          <div className="text-xs text-muted-foreground">{formatRelative(entry.captured_at)}</div>
        </div>
        <div className="flex items-center gap-2">
          <CopyDouyinDownloadButton entry={entry} testIdPrefix="library-row" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => openExternal(entry.share_url)}
            data-testid={`library-row-open-${entry.post_id}`}
          >
            {strings.openInDouyin}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(entry.post_id)}
            data-testid={`library-row-delete-${entry.post_id}`}
          >
            {strings.delete}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-foreground">
        <p className="line-clamp-2">{entry.caption || ""}</p>
        {entry.hashtags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {entry.hashtags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
