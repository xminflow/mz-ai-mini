import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  manualCaptureStopResultSchema,
  type ManualCaptureStopResult,
} from "@/shared/contracts/manual-capture";

export function useManualCaptureStop() {
  return useMutation<ManualCaptureStopResult, Error, void>({
    mutationFn: async () => {
      const raw = await window.api.manualCapture.stop();
      const parsed = manualCaptureStopResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "manualCaptureStop 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
    onSuccess: (result) => {
      if (!result.ok) toast.error(result.error.message);
    },
  });
}
