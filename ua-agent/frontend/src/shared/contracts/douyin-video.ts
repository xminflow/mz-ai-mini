import { z } from "zod";

import { ErrorEnvelope, SCHEMA_VERSION } from "./error";

export const DouyinVideoResolveRequest = z.object({
  share_url: z.string().min(1).max(2048),
});
export type DouyinVideoResolveRequest = z.infer<typeof DouyinVideoResolveRequest>;

export const DouyinVideoResolveSuccess = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  download_url: z.string().min(1).max(4096),
  resolved_at: z.string().datetime({ offset: false }),
});
export type DouyinVideoResolveSuccess = z.infer<typeof DouyinVideoResolveSuccess>;

export const DouyinVideoResolveResult = z.discriminatedUnion("ok", [
  DouyinVideoResolveSuccess,
  ErrorEnvelope,
]);
export type DouyinVideoResolveResult = z.infer<typeof DouyinVideoResolveResult>;
