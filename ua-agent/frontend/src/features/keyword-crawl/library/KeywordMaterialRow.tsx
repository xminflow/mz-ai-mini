import type { MaterialEntry } from "@/shared/contracts/library";
import { Bookmark, ChevronDown, ChevronUp, FileText, Heart, MessageCircle, Repeat2, Trash2, Users } from "lucide-react";
import { useState } from "react";

import { CopyDouyinDownloadButton } from "@/shared/library/CopyDouyinDownloadButton";
import { CopyShareUrlButton } from "@/shared/library/CopyShareUrlButton";
import { ExtractTranscriptButton } from "@/shared/library/ExtractTranscriptButton";
import {
  LOW_FOLLOWER_HIGH_LIKE_BADGE_CLASS,
  LOW_FOLLOWER_HIGH_LIKE_LABEL,
  isLowFollowerHighLike,
} from "@/shared/library/followerInsight";
import { iconHints, keywordHint, statHint } from "@/shared/library/iconHints";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { HoverHint } from "@/shared/ui/hover-hint";

import { CommentsPanel } from "./CommentsPanel";
import { TranscriptPanel } from "./TranscriptPanel";

interface KeywordMaterialRowProps {
  entry: MaterialEntry;
  onDelete: (postId: string) => void;
}

const XHS_KEYWORD_PREFIX = "web:keyword:xhs:";
const DOUYIN_KEYWORD_PREFIX = "web:keyword:";
const XHS_MANUAL_PREFIX = "web:manual:xiaohongshu";
const DOUYIN_MANUAL_PREFIX = "web:manual:douyin";

interface PlatformBadge {
  label: string;
  className: string;
}

function platformBadge(platform: MaterialEntry["platform"]): PlatformBadge {
  if (platform === "xiaohongshu") {
    return {
      label: "小红书",
      className:
        "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
    };
  }
  return {
    label: "抖音",
    className:
      "border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-300",
  };
}

function formatCount(n: number): string {
  if (n < 0) return "—";
  if (n < 10_000) return n.toLocaleString("zh-CN");
  return `${(n / 10_000).toFixed(1)}万`;
}

function formatRelative(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diffMs = Date.now() - t;
  if (diffMs < 60_000) return "刚刚";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

function extractKeyword(capturedByDevice: string): string | null {
  if (capturedByDevice.startsWith(XHS_KEYWORD_PREFIX)) {
    const text = capturedByDevice.slice(XHS_KEYWORD_PREFIX.length);
    return text.length > 0 ? text : null;
  }
  if (capturedByDevice.startsWith(DOUYIN_KEYWORD_PREFIX)) {
    const text = capturedByDevice.slice(DOUYIN_KEYWORD_PREFIX.length);
    return text.length > 0 ? text : null;
  }
  return null;
}

function sourceLabel(capturedByDevice: string): string | null {
  if (capturedByDevice === XHS_MANUAL_PREFIX || capturedByDevice === DOUYIN_MANUAL_PREFIX) {
    return "手动链接采集";
  }
  return null;
}

export function KeywordMaterialRow({ entry, onDelete }: KeywordMaterialRowProps): JSX.Element {
  const keyword = extractKeyword(entry.captured_by_device);
  const manualSource = sourceLabel(entry.captured_by_device);
  const badge = platformBadge(entry.platform);
  const hasComments = entry.comments.length > 0;
  const [expanded, setExpanded] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(entry.transcript);
  const [transcribedAt, setTranscribedAt] = useState<string | null>(entry.transcribed_at);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);
  return (
    <div
      className="flex items-start gap-3 border-b border-border px-3 py-3 hover:bg-muted/50"
      data-testid={`keyword-material-row-${entry.post_id}`}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <HoverHint
            label={
              entry.platform === "xiaohongshu"
                ? iconHints.platformXiaohongshu.label
                : iconHints.platformDouyin.label
            }
            sublabel={
              entry.platform === "xiaohongshu"
                ? iconHints.platformXiaohongshu.sublabel
                : iconHints.platformDouyin.sublabel
            }
          >
            <Badge
              variant="outline"
              className={badge.className}
              data-testid="keyword-material-row-platform"
            >
              {badge.label}
            </Badge>
          </HoverHint>
          {keyword !== null ? (
            <HoverHint {...keywordHint(keyword)}>
              <Badge
                variant="outline"
                className="border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
                data-testid="keyword-material-row-keyword"
              >
                关键词：{keyword}
              </Badge>
            </HoverHint>
          ) : null}
          {manualSource !== null ? (
            <Badge
              variant="outline"
              className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              data-testid="keyword-material-row-manual-source"
            >
              {manualSource}
            </Badge>
          ) : null}
          {isLowFollowerHighLike(entry) ? (
            <HoverHint
              label={iconHints.lowFollowerHighLike.label}
              sublabel={iconHints.lowFollowerHighLike.sublabel}
            >
              <Badge
                variant="outline"
                className={LOW_FOLLOWER_HIGH_LIKE_BADGE_CLASS}
                data-testid="keyword-material-row-low-follower-high-like"
              >
                {LOW_FOLLOWER_HIGH_LIKE_LABEL}
              </Badge>
            </HoverHint>
          ) : null}
          <span
            className="truncate text-foreground"
            data-testid="keyword-material-row-author"
            title={entry.author_handle}
          >
            @{entry.author_display_name ?? entry.author_handle}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{formatRelative(entry.captured_at)}</span>
        </div>
        <p
          className="line-clamp-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground"
          data-testid="keyword-material-row-caption"
          title={entry.caption || undefined}
        >
          {entry.caption ? entry.caption : <span className="text-muted-foreground">（无描述）</span>}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <HoverHint {...statHint("likes", entry.like_count)}>
            <span className="inline-flex items-center gap-1" data-testid="keyword-material-row-likes">
              <Heart className="h-3.5 w-3.5" />
              {formatCount(entry.like_count)}
            </span>
          </HoverHint>
          <HoverHint {...statHint("comments", entry.comment_count)}>
            <span className="inline-flex items-center gap-1" data-testid="keyword-material-row-comments">
              <MessageCircle className="h-3.5 w-3.5" />
              {formatCount(entry.comment_count)}
            </span>
          </HoverHint>
          <HoverHint {...statHint("shares", entry.share_count)}>
            <span className="inline-flex items-center gap-1" data-testid="keyword-material-row-shares">
              <Repeat2 className="h-3.5 w-3.5" />
              {formatCount(entry.share_count)}
            </span>
          </HoverHint>
          <HoverHint {...statHint("collects", entry.collect_count)}>
            <span className="inline-flex items-center gap-1" data-testid="keyword-material-row-collects">
              <Bookmark className="h-3.5 w-3.5" />
              {formatCount(entry.collect_count)}
            </span>
          </HoverHint>
          <HoverHint {...statHint("followers", entry.author_follower_count ?? -1)}>
            <span className="inline-flex items-center gap-1" data-testid="keyword-material-row-followers">
              <Users className="h-3.5 w-3.5" />
              {formatCount(entry.author_follower_count ?? -1)}
            </span>
          </HoverHint>
          {hasComments ? (
            <HoverHint
              label={expanded ? iconHints.collapseComments.label : iconHints.expandComments.label}
              sublabel={expanded ? undefined : iconHints.expandComments.sublabel}
            >
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 gap-1 px-1.5 text-xs"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                data-testid={`keyword-material-row-comments-toggle-${entry.post_id}`}
              >
                {expanded ? "收起评论" : "查看评论"}
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            </HoverHint>
          ) : null}
          {transcript !== null ? (
            <HoverHint
              label={transcriptExpanded ? iconHints.collapseTranscript.label : iconHints.expandTranscript.label}
              sublabel={transcriptExpanded ? undefined : iconHints.expandTranscript.sublabel}
            >
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 gap-1 px-1.5 text-xs"
                onClick={() => setTranscriptExpanded((v) => !v)}
                aria-expanded={transcriptExpanded}
                data-testid={`keyword-material-row-transcript-toggle-${entry.post_id}`}
              >
                <FileText className="h-3.5 w-3.5" />
                {transcriptExpanded ? "收起文案" : "查看文案"}
                {transcriptExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            </HoverHint>
          ) : null}
        </div>
        {hasComments && expanded ? (
          <CommentsPanel
            comments={entry.comments}
            testIdPrefix={`keyword-material-row-comments-${entry.post_id}`}
          />
        ) : null}
        {transcript !== null && transcriptExpanded ? (
          <TranscriptPanel
            text={transcript}
            transcribedAt={transcribedAt}
            testIdPrefix={`keyword-material-row-transcript-${entry.post_id}`}
          />
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <CopyShareUrlButton entry={entry} testIdPrefix="keyword-material-row" />
        <CopyDouyinDownloadButton entry={entry} testIdPrefix="keyword-material-row" />
        <ExtractTranscriptButton
          entry={transcript === null ? entry : { ...entry, transcript, transcribed_at: transcribedAt }}
          onSuccess={(t, at) => {
            setTranscript(t);
            setTranscribedAt(at);
            setTranscriptExpanded(true);
          }}
          testIdPrefix="keyword-material-row"
        />
        <HoverHint
          label={iconHints.deleteEntry.label}
          sublabel={iconHints.deleteEntry.sublabel}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(entry.post_id)}
            data-testid={`keyword-material-row-delete-${entry.post_id}`}
            aria-label="删除"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </HoverHint>
      </div>
    </div>
  );
}
