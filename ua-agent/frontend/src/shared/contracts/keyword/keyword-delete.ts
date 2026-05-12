// Runtime copy of specs/004-douyin-keyword-crawl/contracts/keyword-delete.zod.txt

import { z } from "zod";

import { errorEnvelopeSchema } from "../error";

export const SCHEMA_VERSION = "1" as const;

export const keywordDeleteInputSchema = z
  .object({ id: z.string().uuid() })
  .strict();
export type KeywordDeleteInput = z.infer<typeof keywordDeleteInputSchema>;

export const keywordDeleteSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    deleted_id: z.string().uuid(),
  })
  .strict();
export type KeywordDeleteSuccess = z.infer<typeof keywordDeleteSuccessSchema>;

export const keywordDeleteResultSchema = z.discriminatedUnion("ok", [
  keywordDeleteSuccessSchema,
  errorEnvelopeSchema,
]);
export type KeywordDeleteResult = z.infer<typeof keywordDeleteResultSchema>;
