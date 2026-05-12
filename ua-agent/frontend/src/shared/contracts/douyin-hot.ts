import { z } from "zod";

import { ErrorEnvelope, SCHEMA_VERSION } from "./error";

export const DouyinHotBoardKey = z.enum(["hot", "seeding", "entertainment", "society"]);
export type DouyinHotBoardKey = z.infer<typeof DouyinHotBoardKey>;

export const DouyinHotItem = z.object({
  rank: z.number().int().min(1),
  word: z.string().min(1).max(256),
  url: z.string().url().max(2048),
  hot_value: z.union([z.number().int().min(0), z.null()]),
  label: z.union([z.string().max(64), z.null()]),
});
export type DouyinHotItem = z.infer<typeof DouyinHotItem>;

export const DouyinHotListRequest = z.object({
  board: DouyinHotBoardKey,
});
export type DouyinHotListRequest = z.infer<typeof DouyinHotListRequest>;

export const DouyinHotListSuccess = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  board: DouyinHotBoardKey,
  items: z.array(DouyinHotItem).max(200),
  fetched_at: z.string().datetime({ offset: false }),
});
export type DouyinHotListSuccess = z.infer<typeof DouyinHotListSuccess>;

export const DouyinHotListResult = z.discriminatedUnion("ok", [
  DouyinHotListSuccess,
  ErrorEnvelope,
]);
export type DouyinHotListResult = z.infer<typeof DouyinHotListResult>;
