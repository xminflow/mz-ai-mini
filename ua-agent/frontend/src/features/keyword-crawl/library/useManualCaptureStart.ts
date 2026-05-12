import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  manualCaptureStartResultSchema,
  type ManualCaptureStartResult,
} from "@/shared/contracts/manual-capture";

function messageForCode(code: string, fallback: string): string {
  switch (code) {
    case "BROWSER_BUSY":
      return "已有其他采集任务进行中";
    case "MANUAL_CAPTURE_BUSY":
      return "已有手动采集任务进行中";
    case "INVALID_INPUT":
      return fallback;
    case "UNSUPPORTED_URL":
      return fallback;
    default:
      return fallback;
  }
}

export function useManualCaptureStart() {
  return useMutation<ManualCaptureStartResult, Error, { url: string }>({
    mutationFn: async ({ url }) => {
      const raw = await window.api.manualCapture.start({ url });
      const parsed = manualCaptureStartResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "manualCaptureStart 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
    onSuccess: (result) => {
      if (!result.ok) toast.error(messageForCode(result.error.code, result.error.message));
    },
  });
}
