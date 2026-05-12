// Runtime copy of specs/004-douyin-keyword-crawl/contracts/session-status.zod.txt
//
// CHANGED vs 003: this trimmed schema does NOT include `current_page` block.

import { z } from "zod";

import { errorEnvelopeSchema } from "../error";

export const SCHEMA_VERSION = "1" as const;

export const sessionStatusInputSchema = z.object({}).strict();
export type SessionStatusInput = z.infer<typeof sessionStatusInputSchema>;

export const douyinReachableSchema = z.enum([
  "reachable",
  "unreachable",
  "blocked_by_anti_bot",
  "unknown",
]);
export type DouyinReachable = z.infer<typeof douyinReachableSchema>;

export const signedInSchema = z.enum(["signed_in", "signed_out", "unknown"]);
export type SignedIn = z.infer<typeof signedInSchema>;

export const prereqsSchema = z
  .object({
    browser_installed: z.boolean(),
    session_running: z.boolean(),
    douyin_reachable: douyinReachableSchema,
    signed_in: signedInSchema,
  })
  .strict();
export type Prereqs = z.infer<typeof prereqsSchema>;

export const sessionStatusSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    prereqs: prereqsSchema,
  })
  .strict();
export type SessionStatusSuccess = z.infer<typeof sessionStatusSuccessSchema>;

export const sessionStatusResultSchema = z.discriminatedUnion("ok", [
  sessionStatusSuccessSchema,
  errorEnvelopeSchema,
]);
export type SessionStatusResult = z.infer<typeof sessionStatusResultSchema>;
