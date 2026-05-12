import { z } from "zod";

import { ErrorEnvelope, SCHEMA_VERSION } from "./error";

export const SelfMediaGuideFile = z.object({
  id: z.string().min(1).max(512),
  relative_path: z.string().min(1).max(512),
  title: z.string().min(1).max(256),
  directory: z.string().max(512),
  markdown: z.string(),
  updated_at: z.string().datetime({ offset: false }),
});
export type SelfMediaGuideFile = z.infer<typeof SelfMediaGuideFile>;

export const SelfMediaGuideListSuccess = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  root: z.string().min(1).max(1024),
  files: z.array(SelfMediaGuideFile),
  loaded_at: z.string().datetime({ offset: false }),
});
export type SelfMediaGuideListSuccess = z.infer<typeof SelfMediaGuideListSuccess>;

export const SelfMediaGuideListResult = z.discriminatedUnion("ok", [
  SelfMediaGuideListSuccess,
  ErrorEnvelope,
]);
export type SelfMediaGuideListResult = z.infer<typeof SelfMediaGuideListResult>;
