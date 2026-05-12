// Runtime copy of specs/004-douyin-keyword-crawl/contracts/batch-start.zod.txt
// Extended in 006 with `platform` so the executor knows which platform to run.

import { z } from "zod";

import { Platform } from "../capture";
import { errorEnvelopeSchema } from "../error";

export const SCHEMA_VERSION = "1" as const;

// The executor selects all currently-enabled keywords for the requested
// platform from the store and pulls each keyword's per-row caps + ratio.
// The renderer no longer carries either piece of state, but MUST tell the
// executor which platform's enabled keywords to run.
export const batchStartInputSchema = z.object({ platform: Platform }).strict();
export type BatchStartInput = z.infer<typeof batchStartInputSchema>;

export const batchStartSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    batch_id: z.string().uuid(),
    started_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
  })
  .strict();
export type BatchStartSuccess = z.infer<typeof batchStartSuccessSchema>;

export const batchStartResultSchema = z.discriminatedUnion("ok", [
  batchStartSuccessSchema,
  errorEnvelopeSchema,
]);
export type BatchStartResult = z.infer<typeof batchStartResultSchema>;
