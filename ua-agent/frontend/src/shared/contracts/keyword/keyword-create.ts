// Runtime copy of specs/004-douyin-keyword-crawl/contracts/keyword-create.zod.txt

import { z } from "zod";

import { Platform } from "../capture";
import { errorEnvelopeSchema } from "../error";

import {
  keywordComparisonOpSchema,
  keywordMetricFilterModeSchema,
  keywordPublishTimeRangeSchema,
  keywordRowSchema,
} from "./keyword-list";

export const SCHEMA_VERSION = "1" as const;

export const keywordCreateInputSchema = z
  .object({
    /** Platform the new keyword belongs to (006). */
    platform: Platform,
    text: z
      .string()
      .min(1)
      .max(100)
      .refine((s) => s.trim().length > 0, { message: "不能为空" }),
    /** Defaults to `true` server-side when omitted. */
    enabled: z.boolean().optional(),
    /** Defaults to 10 server-side when omitted. */
    target_cap: z.number().int().min(1).max(10000).optional(),
    /** Defaults to 500 server-side when omitted. */
    health_cap: z.number().int().min(1).max(50000).optional(),
    /** Defaults to ratio mode server-side when omitted. */
    metric_filter_mode: keywordMetricFilterModeSchema.optional(),
    /** Defaults to 1.0 when ratio mode is used server-side. */
    min_like_follower_ratio: z.number().min(0).max(100).multipleOf(0.1).optional(),
    /** Defaults to "all" server-side when omitted. */
    publish_time_range: keywordPublishTimeRangeSchema.optional(),
    author_follower_count_op: z.union([keywordComparisonOpSchema, z.null()]).optional(),
    author_follower_count_value: z.union([z.number().int().positive(), z.null()]).optional(),
    like_count_op: z.union([keywordComparisonOpSchema, z.null()]).optional(),
    like_count_value: z.union([z.number().int().positive(), z.null()]).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const metricMode = value.metric_filter_mode ?? "ratio";
    const ratio = value.min_like_follower_ratio ?? (metricMode === "ratio" ? 1 : 0);
    const followerOp = value.author_follower_count_op ?? null;
    const followerValue = value.author_follower_count_value ?? null;
    const likeOp = value.like_count_op ?? null;
    const likeValue = value.like_count_value ?? null;

    const followerEnabled = followerOp !== null || followerValue !== null;
    const likeEnabled = likeOp !== null || likeValue !== null;

    if (followerEnabled && (followerOp === null || followerValue === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["author_follower_count_value"],
        message: "粉丝量筛选需要同时设置比较方式和数值",
      });
    }
    if (likeEnabled && (likeOp === null || likeValue === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["like_count_value"],
        message: "点赞数筛选需要同时设置比较方式和数值",
      });
    }
    if (metricMode === "ratio" && ratio <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["min_like_follower_ratio"],
        message: "粉赞比模式下最小点赞/粉丝比必须大于 0",
      });
    }
    if (metricMode === "author_metrics" && !followerEnabled && !likeEnabled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["metric_filter_mode"],
        message: "粉丝量/点赞数模式至少需要配置一个阈值",
      });
    }
  });
export type KeywordCreateInput = z.infer<typeof keywordCreateInputSchema>;

export const keywordCreateSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    keyword: keywordRowSchema,
  })
  .strict();
export type KeywordCreateSuccess = z.infer<typeof keywordCreateSuccessSchema>;

export const keywordCreateResultSchema = z.discriminatedUnion("ok", [
  keywordCreateSuccessSchema,
  errorEnvelopeSchema,
]);
export type KeywordCreateResult = z.infer<typeof keywordCreateResultSchema>;
