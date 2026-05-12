import { z } from "zod";

import { MaterialEntry, Platform } from "./capture";
import { ErrorEnvelope, SCHEMA_VERSION } from "./error";

export { MaterialEntry };

export const LibraryListFilters = z.object({
  from: z.union([z.string().datetime({ offset: false }), z.null()]),
  to: z.union([z.string().datetime({ offset: false }), z.null()]),
  author: z.union([z.string().max(256), z.null()]),
  platform: z.union([Platform, z.null()]),
  limit: z.number().int().min(1).max(200),
  offset: z.number().int().nonnegative(),
});
export type LibraryListFilters = z.infer<typeof LibraryListFilters>;

export const LibraryListSuccess = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  entries: z.array(MaterialEntry),
  total: z.number().int().nonnegative(),
  library_total: z.number().int().nonnegative(),
  applied_filters: LibraryListFilters,
});
export type LibraryListSuccess = z.infer<typeof LibraryListSuccess>;

export const LibraryListResult = z.discriminatedUnion("ok", [
  LibraryListSuccess,
  ErrorEnvelope,
]);
export type LibraryListResult = z.infer<typeof LibraryListResult>;

export const LibraryDeleteSuccess = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  deleted_post_id: z.string().min(1).max(128),
  restored: z.literal(false),
});
export type LibraryDeleteSuccess = z.infer<typeof LibraryDeleteSuccess>;

export const LibraryDeleteResult = z.discriminatedUnion("ok", [
  LibraryDeleteSuccess,
  ErrorEnvelope,
]);
export type LibraryDeleteResult = z.infer<typeof LibraryDeleteResult>;
