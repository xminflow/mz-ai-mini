import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  sessionResetResultSchema,
  type SessionResetResult,
} from "@/shared/contracts/keyword/session-reset";

import { SESSION_STATUS_QUERY_KEY } from "./useReadyStatus";

export function useResetSession() {
  const qc = useQueryClient();
  return useMutation<SessionResetResult, Error, void>({
    mutationFn: async () => {
      const raw = await window.api.keyword.resetSession();
      const parsed = sessionResetResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "sessionReset 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(
          result.profile_existed ? "已清除登录态并关闭浏览器" : "无需清理：未发现登录态",
        );
        void qc.invalidateQueries({ queryKey: SESSION_STATUS_QUERY_KEY });
      } else {
        toast.error(result.error.message);
      }
    },
  });
}
