import { Heart } from "lucide-react";

import type { CommentItem } from "@/shared/contracts/capture";

interface CommentsPanelProps {
  comments: readonly CommentItem[];
  testIdPrefix: string;
}

function formatLike(n: number): string {
  if (n < 0) return "—";
  if (n < 10_000) return n.toLocaleString("zh-CN");
  return `${(n / 10_000).toFixed(1)}万`;
}

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  const palette = [
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200",
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200",
    "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-200",
  ];
  return palette[Math.abs(hash) % palette.length] ?? palette[0]!;
}

function initial(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "?";
  // Grapheme-aware first character (handles emoji + CJK).
  const first = Array.from(trimmed)[0];
  return (first ?? "?").toUpperCase();
}

export function CommentsPanel({ comments, testIdPrefix }: CommentsPanelProps): JSX.Element {
  if (comments.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-6 text-center text-xs text-muted-foreground"
        data-testid={`${testIdPrefix}-empty`}
      >
        暂无评论
      </div>
    );
  }
  return (
    <ol
      className="flex flex-col gap-2 rounded-lg border border-border/70 bg-gradient-to-b from-muted/40 to-muted/10 p-2.5 shadow-inner"
      data-testid={`${testIdPrefix}-list`}
    >
      {comments.map((c, idx) => {
        const isTop = idx === 0;
        return (
          <li
            key={`${c.author}-${idx}`}
            className="group relative flex gap-2.5 rounded-md bg-background/70 px-2.5 py-2 text-xs ring-1 ring-border/50 backdrop-blur-sm transition-colors hover:bg-background"
            data-testid={`${testIdPrefix}-item-${idx}`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full text-[11px] font-semibold ${avatarColor(c.author)}`}
              aria-hidden="true"
            >
              {initial(c.author)}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-[11px] leading-none text-muted-foreground">
                <span
                  className="truncate font-medium text-foreground"
                  title={c.author}
                >
                  @{c.author}
                </span>
                {isTop ? (
                  <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium leading-none text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                    置顶
                  </span>
                ) : null}
                {c.time_text.length > 0 ? (
                  <span className="truncate" title={c.time_text}>
                    {c.time_text}
                  </span>
                ) : null}
                <span
                  className="ml-auto inline-flex shrink-0 items-center gap-1 text-muted-foreground"
                  title={`点赞 ${c.like_count < 0 ? "未知" : c.like_count.toLocaleString("zh-CN")}`}
                >
                  <Heart className="h-3 w-3" />
                  {formatLike(c.like_count)}
                </span>
              </div>
              <p
                className="line-clamp-3 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-foreground/90"
                title={c.content}
              >
                {c.content}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
