// Runtime copy of specs/004-douyin-keyword-crawl/contracts/keyword-list.zod.txt

import { z } from "zod";

import { Platform } from "../capture";
import { errorEnvelopeSchema } from "../error";

export const SCHEMA_VERSION = "1" as const;

export const keywordMetricFilterModeSchema = z.enum(["none", "ratio", "author_metrics"]);
export type KeywordMetricFilterMode = z.infer<typeof keywordMetricFilterModeSchema>;

export const keywordComparisonOpSchema = z.enum(["gte", "lte"]);
export type KeywordComparisonOp = z.infer<typeof keywordComparisonOpSchema>;

export const keywordPublishTimeRangeSchema = z.enum(["all", "day", "week", "half_year"]);
export type KeywordPublishTimeRange = z.infer<typeof keywordPublishTimeRangeSchema>;

function normalizeNullableNumber(value: number | null): number | null {
  return value === null ? null : Number(value);
}

function refineKeywordFilterConfig(
  value: {
    metric_filter_mode: KeywordMetricFilterMode;
    min_like_follower_ratio: number;
    author_follower_count_op: KeywordComparisonOp | null;
    author_follower_count_value: number | null;
    like_count_op: KeywordComparisonOp | null;
    like_count_value: number | null;
  },
  ctx: z.RefinementCtx,
): void {
  const followerValue = normalizeNullableNumber(value.author_follower_count_value);
  const likeValue = normalizeNullableNumber(value.like_count_value);
  const followerEnabled =
    value.author_follower_count_op !== null || followerValue !== null;
  const likeEnabled = value.like_count_op !== null || likeValue !== null;

  if (followerEnabled) {
    if (value.author_follower_count_op === null || followerValue === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["author_follower_count_value"],
        message: "粉丝量筛选需要同时设置比较方式和数值",
      });
    }
  }
  if (likeEnabled) {
    if (value.like_count_op === null || likeValue === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["like_count_value"],
        message: "点赞数筛选需要同时设置比较方式和数值",
      });
    }
  }
  if (value.metric_filter_mode === "ratio" && value.min_like_follower_ratio <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["min_like_follower_ratio"],
      message: "粉赞比模式下最小点赞/粉丝比必须大于 0",
    });
  }
  if (value.metric_filter_mode === "author_metrics" && !followerEnabled && !likeEnabled) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["metric_filter_mode"],
      message: "粉丝量/点赞数模式至少需要配置一个阈值",
    });
  }
}

export const keywordRowSchema = z
  .object({
    id: z.string().uuid(),
    /** Platform tag (006). 004 historical rows are backfilled to "douyin". */
    platform: Platform,
    text: z.string().min(1).max(100),
    position: z.number().int().nonnegative(),
    /** Whether this keyword participates in the next batch run. Default true. */
    enabled: z.boolean(),
    /** Per-keyword cap on captured material. Default 10. */
    target_cap: z.number().int().min(1).max(10000),
    /** Per-keyword cap on scanned videos (safety brake). Default 500. */
    health_cap: z.number().int().min(1).max(50000),
    /** Whether to disable metric filtering, use ratio, or use direct thresholds. */
    metric_filter_mode: keywordMetricFilterModeSchema,
    /** 1-decimal-precision min(like_count / author_follower_count). 0 disables the F-key author-card lookup. */
    min_like_follower_ratio: z.number().min(0).max(100).multipleOf(0.1),
    /** Independent publish-time filter applied on the Douyin search page before crawl starts. */
    publish_time_range: keywordPublishTimeRangeSchema,
    author_follower_count_op: z.union([keywordComparisonOpSchema, z.null()]),
    author_follower_count_value: z.union([z.number().int().positive(), z.null()]),
    like_count_op: z.union([keywordComparisonOpSchema, z.null()]),
    like_count_value: z.union([z.number().int().positive(), z.null()]),
    created_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
    updated_at: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
  })
  .strict()
  .superRefine(refineKeywordFilterConfig);
export type KeywordRow = z.infer<typeof keywordRowSchema>;

export const keywordListSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    keywords: z.array(keywordRowSchema),
  })
  .strict();
export type KeywordListSuccess = z.infer<typeof keywordListSuccessSchema>;

export const keywordListResultSchema = z.discriminatedUnion("ok", [
  keywordListSuccessSchema,
  errorEnvelopeSchema,
]);
export type KeywordListResult = z.infer<typeof keywordListResultSchema>;
