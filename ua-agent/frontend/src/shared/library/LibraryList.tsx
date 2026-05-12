import { useMemo } from "react";

import type { LibraryListQuery } from "@/shared/types/api";
import { Skeleton } from "@/shared/ui/skeleton";

import { libraryStrings as strings } from "./strings";
import { LibraryRow } from "./LibraryRow";
import { useInfiniteScrollSentinel } from "./useInfiniteScrollSentinel";
import { useLibraryListInfinite } from "./useLibraryList";

interface LibraryListProps {
  filters: LibraryListQuery;
  onClearFilters: () => void;
  onDelete: (postId: string) => void;
}

function hasActiveFilters(filters: LibraryListQuery): boolean {
  return Boolean(filters.from || filters.to || filters.author);
}

export function LibraryList({
  filters,
  onClearFilters,
  onDelete,
}: LibraryListProps): JSX.Element {
  const query = useLibraryListInfinite({
    from: filters.from ?? null,
    to: filters.to ?? null,
    author: filters.author ?? null,
  });
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  const sentinelRef = useInfiniteScrollSentinel({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const firstPage = data?.pages[0];
  const entries = useMemo(
    () => data?.pages.flatMap((p) => (p.ok ? p.entries : [])) ?? [],
    [data],
  );

  if (isLoading || data === undefined) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (firstPage !== undefined && !firstPage.ok) {
    return (
      <div
        role="alert"
        className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
      >
        {firstPage.error.message}
      </div>
    );
  }

  if (firstPage !== undefined && firstPage.ok && firstPage.library_total === 0) {
    return (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        {strings.emptyLibrary}
      </div>
    );
  }

  if (entries.length === 0 && !hasNextPage) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        <span>{strings.emptyMatches}</span>
        {hasActiveFilters(filters) ? (
          <button
            type="button"
            className="text-foreground underline"
            onClick={onClearFilters}
          >
            {strings.clearFilters}
          </button>
        ) : null}
      </div>
    );
  }

  const filterTotal = firstPage !== undefined && firstPage.ok ? firstPage.total : entries.length;

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs text-muted-foreground">{strings.resultCount(filterTotal)}</div>
      <ul className="flex flex-col gap-3">
        {entries.map((entry) => (
          <li key={entry.post_id}>
            <LibraryRow entry={entry} onDelete={onDelete} />
          </li>
        ))}
      </ul>
      <div ref={sentinelRef} aria-hidden="true" className="h-8 w-full" />
      {isFetchingNextPage ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : null}
      {!hasNextPage && entries.length > 0 ? (
        <div className="py-2 text-center text-xs text-muted-foreground">已全部加载</div>
      ) : null}
    </div>
  );
}
