// Runtime copy of specs/004-douyin-keyword-crawl/contracts/session-start.zod.txt

import { z } from "zod";

import { errorEnvelopeSchema } from "../error";

export const SCHEMA_VERSION = "1" as const;

export const sessionStartInputSchema = z.object({}).strict();
export type SessionStartInput = z.infer<typeof sessionStartInputSchema>;

export const sessionStartSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    started_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
    was_already_running: z.boolean(),
  })
  .strict();
export type SessionStartSuccess = z.infer<typeof sessionStartSuccessSchema>;

export const sessionStartResultSchema = z.discriminatedUnion("ok", [
  sessionStartSuccessSchema,
  errorEnvelopeSchema,
]);
export type SessionStartResult = z.infer<typeof sessionStartResultSchema>;
