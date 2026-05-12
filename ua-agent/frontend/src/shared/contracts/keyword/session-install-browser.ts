// Runtime copy of specs/004-douyin-keyword-crawl/contracts/session-install-browser.zod.txt

import { z } from "zod";

import { errorEnvelopeSchema } from "../error";

export const SCHEMA_VERSION = "1" as const;

export const installBrowserInputSchema = z.object({}).strict();
export type InstallBrowserInput = z.infer<typeof installBrowserInputSchema>;

export const installBrowserSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    installed_path: z.string().min(1).max(4096),
    version: z.string().min(1).max(64),
    was_already_installed: z.boolean(),
    took_ms: z.number().int().min(0),
  })
  .strict();
export type InstallBrowserSuccess = z.infer<typeof installBrowserSuccessSchema>;

export const installBrowserResultSchema = z.discriminatedUnion("ok", [
  installBrowserSuccessSchema,
  errorEnvelopeSchema,
]);
export type InstallBrowserResult = z.infer<typeof installBrowserResultSchema>;
