import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { Platform } from "@/shared/contracts/capture";
import {
  batchStartResultSchema,
  type BatchStartInput,
  type BatchStartResult,
} from "@/shared/contracts/keyword/batch-start";

function messageForCode(code: string, fallback: string): string {
  switch (code) {
    case "BATCH_BUSY":
      return "已有批次进行中";
    case "BROWSER_NOT_INSTALLED":
      return "请先安装浏览器";
    case "BROWSER_SESSION_DEAD":
      return "浏览器会话未启动";
    case "KEYWORD_NOT_FOUND":
      return "选中的关键词已被删除，请刷新后重试";
    case "INVALID_ARGUMENT":
      return fallback; // surface utility's exact reason (e.g. XHS not yet wired)
    default:
      return fallback;
  }
}

/**
 * 006 — `useBatchStart()` defaults to the Douyin platform so existing
 * call sites work unchanged. PR 3 wires the platform Tab to pass the
 * current Tab's value through.
 */
export function useBatchStart(platform: Platform = "douyin") {
  return useMutation<BatchStartResult, Error, void>({
    mutationFn: async () => {
      const input: BatchStartInput = { platform };
      const raw = await window.api.keyword.batchStart(input);
      const parsed = batchStartResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "batchStart 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(messageForCode(result.error.code, result.error.message));
      }
    },
  });
}
