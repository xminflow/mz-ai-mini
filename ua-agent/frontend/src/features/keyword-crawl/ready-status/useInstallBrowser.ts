import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  installBrowserResultSchema,
  type InstallBrowserResult,
} from "@/shared/contracts/keyword/session-install-browser";

import { SESSION_STATUS_QUERY_KEY } from "./useReadyStatus";

export function useInstallBrowser() {
  const qc = useQueryClient();
  return useMutation<InstallBrowserResult, Error, void>({
    mutationFn: async () => {
      const raw = await window.api.keyword.installBrowser();
      const parsed = installBrowserResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "installBrowser 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(
          result.was_already_installed ? "浏览器已就绪" : `浏览器安装完成（${result.took_ms} ms）`,
        );
        void qc.invalidateQueries({ queryKey: SESSION_STATUS_QUERY_KEY });
      } else {
        toast.error(result.error.message);
      }
    },
  });
}
