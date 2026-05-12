import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import type { LibraryListResult } from "@/shared/contracts/library";
import type { LibraryListQuery } from "@/shared/types/api";

export const LIBRARY_PAGE_SIZE = 60;

export type LibraryFilters = Omit<LibraryListQuery, "limit" | "offset">;

/**
 * Infinite-scroll wrapper around the `library:list` IPC. Each page requests
 * `LIBRARY_PAGE_SIZE` rows starting at the cursor offset; pagination ends
 * when the cumulative row count reaches the server-reported `total` for the
 * applied filter set, or when a page returns an `ErrorEnvelope`.
 */
export function useLibraryListInfinite(filters: LibraryFilters) {
  return useInfiniteQuery({
    queryKey: ["library", "list", "infinite", filters],
    queryFn: async ({ pageParam }) => {
      return window.api.libraryList({
        ...filters,
        limit: LIBRARY_PAGE_SIZE,
        offset: pageParam,
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages): number | undefined => {
      if (!lastPage.ok) return undefined;
      const loaded = allPages.reduce(
        (acc, p) => acc + (p.ok ? p.entries.length : 0),
        0,
      );
      return loaded < lastPage.total ? loaded : undefined;
    },
    placeholderData: keepPreviousData,
    staleTime: 5_000,
  });
}

export type { LibraryListResult };
