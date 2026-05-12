// Daily scheduled crawl — settings + status + event contracts.
//
// User stores `{ enabled, time }` per platform; SchedulerService in main fires
// `batchStart` at the configured local time once per day, queues if a batch is
// already running, drains on `batch-ended`. UI inline in each platform's
// collect page (`pages/{Douyin,Xiaohongshu}CollectPage.tsx`) consumes the
// `scheduler:status` query + `scheduler:event` stream below.

import { z } from "zod";

import { Platform } from "./capture";
import { errorEnvelopeSchema, SCHEMA_VERSION } from "./error";

export const SCHEDULER_EVENT_TOPIC = "scheduler:event" as const;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleEntrySchema = z
  .object({
    enabled: z.boolean(),
    time: z.string().regex(TIME_REGEX),
  })
  .strict();
export type ScheduleEntry = z.infer<typeof scheduleEntrySchema>;

export const schedulingSettingsSchema = z
  .object({
    douyin: scheduleEntrySchema,
    xiaohongshu: scheduleEntrySchema,
  })
  .strict();
export type SchedulingSettings = z.infer<typeof schedulingSettingsSchema>;

export const DEFAULT_SCHEDULING: SchedulingSettings = Object.freeze({
  douyin: { enabled: false, time: "09:00" },
  xiaohongshu: { enabled: false, time: "09:00" },
}) as SchedulingSettings;

export const fireOutcomeSchema = z.enum([
  "ok",
  "skip:busy",
  "skip:session_not_ready",
  "skip:empty",
  "error",
]);
export type FireOutcome = z.infer<typeof fireOutcomeSchema>;

const isoMs = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

export const lastFireRecordSchema = z
  .object({
    outcome: fireOutcomeSchema,
    at: isoMs,
    detail: z.string().max(512).nullable(),
  })
  .strict();
export type LastFireRecord = z.infer<typeof lastFireRecordSchema>;

export const schedulerStatusSchema = z
  .object({
    schedules: schedulingSettingsSchema,
    nextRuns: z.object({
      douyin: isoMs.nullable(),
      xiaohongshu: isoMs.nullable(),
    }),
    lastFires: z.object({
      douyin: lastFireRecordSchema.nullable(),
      xiaohongshu: lastFireRecordSchema.nullable(),
    }),
    queue: z.array(Platform),
    isBatchRunning: z.boolean(),
  })
  .strict();
export type SchedulerStatus = z.infer<typeof schedulerStatusSchema>;

export const schedulerStatusSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    status: schedulerStatusSchema,
  })
  .strict();

export const schedulerStatusResultSchema = z.union([
  schedulerStatusSuccessSchema,
  errorEnvelopeSchema,
]);
export type SchedulerStatusResult = z.infer<typeof schedulerStatusResultSchema>;

export const schedulerEventSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    kind: z.enum(["fired", "queued", "drained", "skipped"]),
    platform: Platform,
    outcome: fireOutcomeSchema.nullable(),
    detail: z.string().max(512).nullable(),
    at: isoMs,
  })
  .strict();
export type SchedulerEvent = z.infer<typeof schedulerEventSchema>;
