import { useQuery } from "@tanstack/react-query";

import {
  batchStatusResultSchema,
  type BatchSnapshot,
  type BatchStatusResult,
} from "@/shared/contracts/keyword/batch-status";

export const BATCH_STATUS_QUERY_KEY = ["batchStatus"] as const;

export interface UseBatchStatusOutcome {
  batch: BatchSnapshot | null;
  isLoading: boolean;
}

export function useBatchStatus(): UseBatchStatusOutcome {
  const query = useQuery<BatchStatusResult>({
    queryKey: BATCH_STATUS_QUERY_KEY,
    queryFn: async () => {
      if (window.api?.keyword?.batchStatus === undefined) {
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: { code: "INTERNAL" as const, message: "preload 未注入 keyword 接口" },
        };
      }
      const raw = await window.api.keyword.batchStatus();
      const parsed = batchStatusResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "batchStatus 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
  });
  const data = query.data;
  return {
    batch: data !== undefined && data.ok === true ? data.batch : null,
    isLoading: query.isLoading,
  };
}
