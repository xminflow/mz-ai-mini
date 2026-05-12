import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  keywordCreateResultSchema,
  type KeywordCreateInput,
  type KeywordCreateResult,
} from "@/shared/contracts/keyword/keyword-create";

import { keywordsStrings } from "./strings";
import { KEYWORDS_QUERY_KEY } from "./useKeywordsList";

function messageForCode(code: string, fallback: string): string {
  switch (code) {
    case "KEYWORD_INVALID":
      return keywordsStrings.validationEmpty;
    case "KEYWORD_DUPLICATE":
      return keywordsStrings.validationDuplicate;
    default:
      return fallback;
  }
}

export function useKeywordCreate() {
  const qc = useQueryClient();
  return useMutation<KeywordCreateResult, Error, KeywordCreateInput>({
    mutationFn: async (input) => {
      if (window.api?.keyword?.create === undefined) {
        const w = window as unknown as { api?: unknown };
        const apiState = w.api === undefined ? "missing" : "present";
        const apiKeys =
          w.api !== undefined && typeof w.api === "object"
            ? Object.keys(w.api as Record<string, unknown>).join(",")
            : "(none)";
        const keywordKeys =
          window.api?.keyword !== undefined
            ? Object.keys(window.api.keyword as unknown as Record<string, unknown>).join(",")
            : "(missing)";
        // eslint-disable-next-line no-console
        console.error(
          `[useKeywordCreate] preload surface incomplete. window.api=${apiState}, window.api keys=[${apiKeys}], window.api.keyword keys=[${keywordKeys}]`,
        );
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: {
            code: "INTERNAL" as const,
            message: `preload 未注入 keyword.create — window.api=${apiState}, keyword keys=[${keywordKeys}]`,
          },
        };
      }
      try {
        const raw = await window.api.keyword.create(input);
        const parsed = keywordCreateResultSchema.safeParse(raw);
        if (!parsed.success) {
          // eslint-disable-next-line no-console
          console.error("[useKeywordCreate] zod parse failed", parsed.error.issues, "raw:", raw);
          return {
            schema_version: "1" as const,
            ok: false as const,
            error: {
              code: "INTERNAL" as const,
              message: `keyword:create 响应未通过 Zod 校验：${JSON.stringify(raw).slice(0, 200)}`,
            },
          };
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        // eslint-disable-next-line no-console
        console.error("[useKeywordCreate] IPC threw:", e);
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
