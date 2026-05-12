import type { ErrorEnvelope } from "@/shared/contracts/error";
import {
  keywordRowSchema,
  keywordListSuccessSchema,
  type KeywordListResult,
  type KeywordRow,
} from "@/shared/contracts/keyword/keyword-list";

import { getKeywordsStore } from "../domain/keywordsStore";
import { validateEnvelope } from "../infra/envelope";
import { getLogger } from "../infra/logger";

export async function keywordListHandler(_args: unknown): Promise<KeywordListResult | ErrorEnvelope> {
  const log = getLogger();
  try {
    const rawKeywords = getKeywordsStore().list();
    const keywords: KeywordRow[] = [];
    let skipped = 0;
    for (const row of rawKeywords) {
      const parsed = keywordRowSchema.safeParse(row);
      if (parsed.success) {
        keywords.push(parsed.data);
        continue;
      }
      skipped++;
      log.warn("keyword.list.skip_invalid_row", {
        id: row.id,
        text: row.text,
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      });
    }
    const payload = {
      schema_version: "1" as const,
      ok: true as const,
      keywords,
    };
    const result = validateEnvelope(keywordListSuccessSchema, payload, {
      method: "keywordList",
    });
    log.info("keyword.list.ok", { count: keywords.length, skipped });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error("keyword.list.failed", { message });
    return {
      schema_version: "1",
      ok: false,
      error: { code: "INTERNAL", message: message.slice(0, 1024) },
    };
  }
}
