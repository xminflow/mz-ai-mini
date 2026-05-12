import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  keywordUpdateResultSchema,
  type KeywordUpdateInput,
  type KeywordUpdateResult,
} from "@/shared/contracts/keyword/keyword-update";

import { keywordsStrings } from "./strings";
import { KEYWORDS_QUERY_KEY } from "./useKeywordsList";

function messageForCode(code: string, fallback: string): string {
  switch (code) {
    case "KEYWORD_INVALID":
      return keywordsStrings.validationEmpty;
    case "KEYWORD_DUPLICATE":
      return keywordsStrings.validationDuplicate;
    case "KEYWORD_NOT_FOUND":
      return keywordsStrings.notFoundError;
    default:
      return fallback;
  }
}

export function useKeywordUpdate() {
  const qc = useQueryClient();
  return useMutation<KeywordUpdateResult, Error, KeywordUpdateInput>({
    mutationFn: async (input) => {
      if (window.api?.keyword?.update === undefined) {
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: { code: "INTERNAL" as const, message: "preload 未注入 keyword.update 接口" },
        };
      }
      try {
        const raw = await window.api.keyword.update(input);
        const parsed = keywordUpdateResultSchema.safeParse(raw);
        if (!parsed.success) {
          // eslint-disable-next-line no-console
          console.error("[useKeywordUpdate] zod parse failed", parsed.error.issues, "raw:", raw);
          return {
            schema_version: "1" as const,
            ok: false as const,
            error: {
              code: "INTERNAL" as const,
              message: `keyword:update 响应未通过 Zod 校验：${JSON.stringify(raw).slice(0, 200)}`,
            },
          };
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        // eslint-disable-next-line no-console
        console.error("[useKeywordUpdate] IPC threw:", e);
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: { code: "INTERNAL" as const, message: `IPC 调用失败：${message}` },
        };
      }
    },
    onSuccess: (result) => {
      if (result.ok) {
        void qc.invalidateQueries({ queryKey: KEYWORDS_QUERY_KEY });
      } else {
        toast.error(messageForCode(result.error.code, result.error.message));
      }
    },
  });
}
