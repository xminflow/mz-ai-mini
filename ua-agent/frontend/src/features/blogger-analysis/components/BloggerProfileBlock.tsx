import type { Blogger } from "@/shared/contracts/blogger";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

import { bloggerStrings } from "../strings";

interface Props {
  blogger: Blogger;
}

function fmtCount(n: number | null): string {
  if (n === null) return bloggerStrings.unknown;
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}亿`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`;
  return String(n);
}

export function BloggerProfileBlock({ blogger }: Props): JSX.Element {
  const { display_name, avatar_url, douyin_id, follow_count, fans_count, liked_count, signature } =
    blogger;
  return (
    <div className="flex flex-col gap-3">
      {/* Header: avatar + name/id */}
      <div className="flex items-start gap-3">
        <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-full bg-muted">
          {avatar_url !== null ? (
            <img
              src={avatar_url}
              alt={display_name ?? "avatar"}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold leading-tight">
            {display_name ?? bloggerStrings.unknown}
          </h3>
          {douyin_id !== null ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {bloggerStrings.douyinIdPrefix} {douyin_id}
            </p>
          ) : null}
        </div>
      </div>

      {/* Signature — truncated to 3 lines inline; full text in a Radix
          tooltip on hover (no layout shift, consistent with the rest of the
          app's hover-explainers). TooltipProvider is mounted at the App
          root, so this works without any extra setup. */}
      {signature !== null ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="line-clamp-3 cursor-help text-xs text-muted-foreground">
              {signature}
            </p>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="max-w-md whitespace-pre-wrap leading-relaxed"
          >
            {signature}
          </TooltipContent>
        </Tooltip>
      ) : null}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 rounded-md bg-muted/40 px-2 py-2 text-center text-xs">
        <Stat value={fmtCount(follow_count)} label={bloggerStrings.followLabel} />
        <Stat value={fmtCount(fans_count)} label={bloggerStrings.fansLabel} />
        <Stat value={fmtCount(liked_count)} label={bloggerStrings.likedLabel} />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }): JSX.Element {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
