import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  keywordDeleteResultSchema,
  type KeywordDeleteInput,
  type KeywordDeleteResult,
} from "@/shared/contracts/keyword/keyword-delete";

import { keywordsStrings } from "./strings";
import { KEYWORDS_QUERY_KEY } from "./useKeywordsList";

function messageForCode(code: string, fallback: string): string {
  switch (code) {
    case "KEYWORD_NOT_FOUND":
      return keywordsStrings.notFoundError;
    case "BATCH_BUSY":
      return "该关键词正在运行中，请先停止整批";
    default:
      return fallback;
  }
}

export function useKeywordDelete() {
  const qc = useQueryClient();
  return useMutation<KeywordDeleteResult, Error, KeywordDeleteInput>({
    mutationFn: async (input) => {
      const raw = await window.api.keyword.delete(input);
      const parsed = keywordDeleteResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "keyword:delete 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
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
