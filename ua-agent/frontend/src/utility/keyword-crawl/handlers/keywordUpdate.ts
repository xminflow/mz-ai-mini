import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  keywordUpdateInputSchema,
  keywordUpdateSuccessSchema,
  type KeywordUpdateResult,
} from "@/shared/contracts/keyword/keyword-update";

import { getKeywordsStore, KeywordValidationError } from "../domain/keywordsStore";
import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";

export async function keywordUpdateHandler(args: unknown): Promise<KeywordUpdateResult | ErrorEnvelope> {
  const log = getLogger();
  const parsed = keywordUpdateInputSchema.safeParse(args);
  if (!parsed.success) {
    log.warn("keyword.update.invalid_input", {
      issues: parsed.error.issues.map((i) => i.message),
    });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "KEYWORD_INVALID", message: parsed.error.issues[0]?.message ?? "无效输入" },
    };
  }
  try {
    const row = getKeywordsStore().update(parsed.data.id, {
      text: parsed.data.text,
      enabled: parsed.data.enabled,
      target_cap: parsed.data.target_cap,
      health_cap: parsed.data.health_cap,
      metric_filter_mode: parsed.data.metric_filter_mode,
      min_like_follower_ratio: parsed.data.min_like_follower_ratio,
      publish_time_range: parsed.data.publish_time_range,
      author_follower_count_op: parsed.data.author_follower_count_op,
      author_follower_count_value: parsed.data.author_follower_count_value,
      like_count_op: parsed.data.like_count_op,
      like_count_value: parsed.data.like_count_value,
    });
    if (row === null) {
      log.warn("keyword.update.not_found", { id: parsed.data.id });
      return {
        schema_version: "1",
        ok: false,
        error: { code: "KEYWORD_NOT_FOUND", message: "关键词不存在" },
      };
    }
    const payload = {
      schema_version: "1" as const,
      ok: true as const,
      keyword: row,
    };
    const result = validateEnvelope(keywordUpdateSuccessSchema, payload, {
      method: "keywordUpdate",
    });
    log.info("keyword.update.ok", { id: row.id });
    return result;
  } catch (err) {
    if (err instanceof KeywordValidationError) {
      const code = err.kind === "DUPLICATE" ? "KEYWORD_DUPLICATE" : "KEYWORD_INVALID";
      log.warn("keyword.update.rejected", { kind: err.kind });
      return {
        schema_version: "1",
        ok: false,
        error: { code, message: err.message.slice(0, 1024) },
      };
    }
    const message = err instanceof Error ? err.message : String(err);
    log.error("keyword.update.failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}
