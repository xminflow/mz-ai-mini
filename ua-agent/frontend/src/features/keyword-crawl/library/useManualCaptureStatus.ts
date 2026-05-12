import { useQuery } from "@tanstack/react-query";

import {
  manualCaptureStatusResultSchema,
  type ManualCaptureSnapshot,
  type ManualCaptureStatusResult,
} from "@/shared/contracts/manual-capture";

export const MANUAL_CAPTURE_STATUS_QUERY_KEY = ["manualCaptureStatus"] as const;

export function useManualCaptureStatus(): { task: ManualCaptureSnapshot | null; isLoading: boolean } {
  const query = useQuery<ManualCaptureStatusResult>({
    queryKey: MANUAL_CAPTURE_STATUS_QUERY_KEY,
    queryFn: async () => {
      const raw = await window.api.manualCapture.status();
      const parsed = manualCaptureStatusResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL" as const, message: "manualCaptureStatus 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
  });

  return {
    task: query.data !== undefined && query.data.ok ? query.data.task : null,
    isLoading: query.isLoading,
  };
}
