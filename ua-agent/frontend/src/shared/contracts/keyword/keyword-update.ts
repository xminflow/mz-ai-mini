// Runtime copy of specs/004-douyin-keyword-crawl/contracts/keyword-update.zod.txt

import { z } from "zod";

import { errorEnvelopeSchema } from "../error";

import {
  keywordComparisonOpSchema,
  keywordMetricFilterModeSchema,
  keywordPublishTimeRangeSchema,
  keywordRowSchema,
} from "./keyword-list";

export const SCHEMA_VERSION = "1" as const;

/**
 * Patch shape — every field except `id` is optional. The handler applies
 * only the fields that are present, so the renderer can flip just the
 * `enabled` toggle without re-sending text/caps/ratio.
 */
export const keywordUpdateInputSchema = z
  .object({
    id: z.string().uuid(),
    text: z
      .string()
      .min(1)
      .max(100)
      .refine((s) => s.trim().length > 0, { message: "不能为空" })
      .optional(),
    enabled: z.boolean().optional(),
    target_cap: z.number().int().min(1).max(10000).optional(),
    health_cap: z.number().int().min(1).max(50000).optional(),
    metric_filter_mode: keywordMetricFilterModeSchema.optional(),
    min_like_follower_ratio: z
      .number()
      .min(0)
      .max(100)
      .multipleOf(0.1)
      .optional(),
    publish_time_range: keywordPublishTimeRangeSchema.optional(),
    author_follower_count_op: z.union([keywordComparisonOpSchema, z.null()]).optional(),
    author_follower_count_value: z.union([z.number().int().positive(), z.null()]).optional(),
    like_count_op: z.union([keywordComparisonOpSchema, z.null()]).optional(),
    like_count_value: z.union([z.number().int().positive(), z.null()]).optional(),
  })
  .strict();
export type KeywordUpdateInput = z.infer<typeof keywordUpdateInputSchema>;

export const keywordUpdateSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    keyword: keywordRowSchema,
  })
  .strict();
export type KeywordUpdateSuccess = z.infer<typeof keywordUpdateSuccessSchema>;

export const keywordUpdateResultSchema = z.discriminatedUnion("ok", [
  keywordUpdateSuccessSchema,
  errorEnvelopeSchema,
]);
export type KeywordUpdateResult = z.infer<typeof keywordUpdateResultSchema>;
