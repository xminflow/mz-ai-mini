import type { MaterialEntry } from "@/shared/contracts/library";

export function isLowFollowerHighLike(entry: MaterialEntry): boolean {
  const f = entry.author_follower_count;
  if (f === null) return false;
  if (f <= 0) return false;
  return entry.like_count >= f;
}

export const LOW_FOLLOWER_HIGH_LIKE_LABEL = "低粉高赞";
export const LOW_FOLLOWER_HIGH_LIKE_BADGE_CLASS =
  "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
