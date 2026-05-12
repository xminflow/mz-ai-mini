// Runtime copy of specs/004-douyin-keyword-crawl/contracts/session-reset.zod.txt

import { z } from "zod";

import { errorEnvelopeSchema } from "../error";

export const SCHEMA_VERSION = "1" as const;

export const sessionResetInputSchema = z.object({}).strict();
export type SessionResetInput = z.infer<typeof sessionResetInputSchema>;

export const sessionResetSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    was_running: z.boolean(),
    profile_existed: z.boolean(),
  })
  .strict();
export type SessionResetSuccess = z.infer<typeof sessionResetSuccessSchema>;

export const sessionResetResultSchema = z.discriminatedUnion("ok", [
  sessionResetSuccessSchema,
  errorEnvelopeSchema,
]);
export type SessionResetResult = z.infer<typeof sessionResetResultSchema>;
