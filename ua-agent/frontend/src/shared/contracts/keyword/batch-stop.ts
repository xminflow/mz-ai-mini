// Runtime copy of specs/004-douyin-keyword-crawl/contracts/batch-stop.zod.txt

import { z } from "zod";

import { errorEnvelopeSchema } from "../error";

export const SCHEMA_VERSION = "1" as const;

export const batchStopInputSchema = z.object({}).strict();
export type BatchStopInput = z.infer<typeof batchStopInputSchema>;

export const batchStopSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    batch_id: z.union([z.string().uuid(), z.null()]),
    was_running: z.boolean(),
  })
  .strict();
export type BatchStopSuccess = z.infer<typeof batchStopSuccessSchema>;

export const batchStopResultSchema = z.discriminatedUnion("ok", [
  batchStopSuccessSchema,
  errorEnvelopeSchema,
]);
export type BatchStopResult = z.infer<typeof batchStopResultSchema>;
