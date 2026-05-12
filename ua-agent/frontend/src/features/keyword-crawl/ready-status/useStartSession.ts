import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  sessionStartResultSchema,
  type SessionStartResult,
} from "@/shared/contracts/keyword/session-start";

import { SESSION_STATUS_QUERY_KEY } from "./useReadyStatus";

export function useStartSession() {
  const qc = useQueryClient();
  return useMutation<SessionStartResult, Error, void>({
    mutationFn: async () => {
      const raw = await window.api.keyword.startSession();
      const parsed = sessionStartResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "sessionStart 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(result.was_already_running ? "会话已在运行" : "已启动浏览器会话");
        void qc.invalidateQueries({ queryKey: SESSION_STATUS_QUERY_KEY });
      } else {
        const codeText =
          result.error.code === "BROWSER_NOT_INSTALLED" ? "请先安装浏览器" : result.error.message;
        toast.error(codeText);
      }
    },
  });
}
