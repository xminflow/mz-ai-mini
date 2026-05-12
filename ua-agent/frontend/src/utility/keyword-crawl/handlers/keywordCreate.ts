import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  keywordCreateInputSchema,
  keywordCreateSuccessSchema,
  type KeywordCreateResult,
} from "@/shared/contracts/keyword/keyword-create";

import { getKeywordsStore, KeywordValidationError } from "../domain/keywordsStore";
import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";

export async function keywordCreateHandler(args: unknown): Promise<KeywordCreateResult | ErrorEnvelope> {
  const log = getLogger();
  const parsed = keywordCreateInputSchema.safeParse(args);
  if (!parsed.success) {
    log.warn("keyword.create.invalid_input", {
      issues: parsed.error.issues.map((issue: { message: string }) => issue.message),
    });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "KEYWORD_INVALID", message: parsed.error.issues[0]?.message ?? "无效输入" },
    };
  }
  try {
    const row = getKeywordsStore().create(parsed.data.text, parsed.data.platform, {
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
    const payload = {
      schema_version: "1" as const,
      ok: true as const,
      keyword: row,
    };
    const result = validateEnvelope(keywordCreateSuccessSchema, payload, {
      method: "keywordCreate",
    });
    log.info("keyword.create.ok", { id: row.id });
    return result;
  } catch (err) {
    if (err instanceof KeywordValidationError) {
      const code = err.kind === "DUPLICATE" ? "KEYWORD_DUPLICATE" : "KEYWORD_INVALID";
      log.warn("keyword.create.rejected", { kind: err.kind });
      return {
        schema_version: "1",
        ok: false,
        error: { code, message: err.message.slice(0, 1024) },
      };
    }
    const message = err instanceof Error ? err.message : String(err);
    log.error("keyword.create.failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}
