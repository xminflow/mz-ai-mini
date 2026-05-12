import { useQuery } from "@tanstack/react-query";

import {
  DouyinHotListResult,
  type DouyinHotBoardKey,
  type DouyinHotItem,
} from "@/shared/contracts/douyin-hot";

export const DOUYIN_HOT_QUERY_KEY = ["douyin-hot"] as const;

export interface UseDouyinHotBoardOutcome {
  items: DouyinHotItem[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorMessage: string | null;
  fetchedAt: string | null;
  refetch: () => Promise<unknown>;
}

export function useDouyinHotBoard(board: DouyinHotBoardKey): UseDouyinHotBoardOutcome {
  const query = useQuery<DouyinHotListResult>({
    queryKey: [...DOUYIN_HOT_QUERY_KEY, board],
    queryFn: async () => {
      if (window.api?.douyinHot?.list === undefined) {
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: { code: "INTERNAL" as const, message: "preload 未注入 douyinHot 接口" },
        };
      }
      const raw = await window.api.douyinHot.list({ board });
      const parsed = DouyinHotListResult.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: {
            code: "INTERNAL" as const,
            message: "douyin-hot:list 响应未通过 Zod 校验",
          },
        };
      }
      return parsed.data;
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const data = query.data;
  const ok = data !== undefined && data.ok === true;
  return {
    items: ok ? data.items : [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: data !== undefined && data.ok === false,
    errorMessage: data !== undefined && data.ok === false ? data.error.message : null,
    fetchedAt: ok ? data.fetched_at : null,
    refetch: query.refetch,
  };
}
