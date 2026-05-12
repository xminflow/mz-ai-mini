import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  keywordDeleteInputSchema,
  keywordDeleteSuccessSchema,
  type KeywordDeleteResult,
} from "@/shared/contracts/keyword/keyword-delete";

import { getKeywordsStore } from "../domain/keywordsStore";
import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";

/**
 * Returns true iff the given keyword id is currently being executed by the
 * batch executor. Replaced in Phase 5 (T106) by the real introspection.
 */
type IsRunningCheck = (keywordId: string) => boolean;

let isRunningCheck: IsRunningCheck = (_id) => false;

export function setKeywordRunningCheck(fn: IsRunningCheck): void {
  isRunningCheck = fn;
}

export async function keywordDeleteHandler(args: unknown): Promise<KeywordDeleteResult | ErrorEnvelope> {
  const log = getLogger();
  const parsed = keywordDeleteInputSchema.safeParse(args);
  if (!parsed.success) {
    return {
      schema_version: "1",
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: parsed.error.issues[0]?.message ?? "无效输入",
      },
    };
  }
  if (isRunningCheck(parsed.data.id)) {
    log.warn("keyword.delete.batch_busy", { id: parsed.data.id });
    return {
      schema_version: "1",
      ok: false,
      error: {
        code: "BATCH_BUSY",
        message: "该关键词正在运行中，请先停止整批",
      },
    };
  }
  try {
    const removed = getKeywordsStore().delete(parsed.data.id);
    if (!removed) {
      log.warn("keyword.delete.not_found", { id: parsed.data.id });
      return {
        schema_version: "1",
        ok: false,
        error: { code: "KEYWORD_NOT_FOUND", message: "关键词不存在" },
      };
    }
    const payload = {
      schema_version: "1" as const,
      ok: true as const,
      deleted_id: parsed.data.id,
    };
    const result = validateEnvelope(keywordDeleteSuccessSchema, payload, {
      method: "keywordDelete",
    });
    log.info("keyword.delete.ok", { id: parsed.data.id });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("keyword.delete.failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}
