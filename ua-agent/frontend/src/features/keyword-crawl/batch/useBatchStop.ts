import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  batchStopResultSchema,
  type BatchStopResult,
} from "@/shared/contracts/keyword/batch-stop";

export function useBatchStop() {
  return useMutation<BatchStopResult, Error, void>({
    mutationFn: async () => {
      const raw = await window.api.keyword.batchStop();
      const parsed = batchStopResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "batchStop 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error.message);
      }
    },
  });
}
