import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  type LlmAvailability,
  settingsTestLlmResultSchema,
} from "@/shared/contracts/settings";

export function useTestLlmConnection() {
  return useMutation<LlmAvailability, Error, void>({
    mutationFn: async () => {
      const raw = await window.api.settings.testLlm();
      const parsed = settingsTestLlmResultSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `settings:test-llm 响应未通过 Zod 校验：${JSON.stringify(raw).slice(0, 200)}`,
        );
      }
      if (!parsed.data.ok) {
        throw new Error(parsed.data.error.message);
      }
      return parsed.data.availability;
    },
    onSuccess: (availability) => {
      if (availability.ok) {
        toast.success(`连接成功${availability.version ? `：${availability.version}` : ""}`);
      } else {
        toast.error(availability.reason ?? "连接失败");
      }
    },
    onError: (err) => {
      toast.error(`测试失败：${err.message}`);
    },
  });
}
