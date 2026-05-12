import { useQuery } from "@tanstack/react-query";

import type { Platform } from "@/shared/contracts/capture";
import {
  keywordListResultSchema,
  type KeywordListResult,
  type KeywordRow,
} from "@/shared/contracts/keyword/keyword-list";

export const KEYWORDS_QUERY_KEY = ["keywords"] as const;

export interface UseKeywordsListOutcome {
  keywords: KeywordRow[];
  isLoading: boolean;
  isError: boolean;
  error: KeywordListResult | null;
  refetch: () => Promise<unknown>;
}

/**
 * 006 — When `platform` is supplied, only that platform's keywords are
 * returned (client-side filter). The backend currently lists all keywords;
 * we filter here so the Tab UI's per-platform view stays simple.
 */
export function useKeywordsList(platform?: Platform): UseKeywordsListOutcome {
  const query = useQuery<KeywordListResult>({
    queryKey: KEYWORDS_QUERY_KEY,
    queryFn: async () => {
      if (window.api?.keyword?.list === undefined) {
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: { code: "INTERNAL" as const, message: "preload 未注入 keyword 接口" },
        };
      }
      const raw = await window.api.keyword.list();
      const parsed = keywordListResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "keyword:list 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
  });

  const data = query.data;
  const ok = data !== undefined && data.ok === true;
  const all = ok ? data.keywords : [];
  const keywords = platform === undefined ? all : all.filter((k) => k.platform === platform);
  return {
    keywords,
    isLoading: query.isLoading,
    isError: data !== undefined && data.ok === false,
    error: data ?? null,
    refetch: query.refetch,
  };
}
