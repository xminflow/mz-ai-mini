import { z } from "zod";

import { errorEnvelopeSchema, SCHEMA_VERSION } from "./error";
import { providerIdSchema } from "./settings";

export const AI_CHAT_EVENT_TOPIC = "ai-chat:event" as const;

const isoMs = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

export const aiChatRoleSchema = z.enum(["user", "assistant", "system"]);
export type AiChatRole = z.infer<typeof aiChatRoleSchema>;

export const aiChatToolTraceSchema = z
  .object({
    id: z.string().min(1).max(256),
    name: z.string().min(1).max(256),
    input: z.unknown(),
    content: z.string(),
    is_error: z.boolean(),
    started_at: isoMs,
    ended_at: z.union([isoMs, z.null()]),
  })
  .strict();
export type AiChatToolTrace = z.infer<typeof aiChatToolTraceSchema>;

export const aiChatMessageSchema = z
  .object({
    id: z.string().min(1).max(256),
    role: aiChatRoleSchema,
    content: z.string(),
    created_at: isoMs,
    tool_traces: z.array(aiChatToolTraceSchema),
  })
  .strict();
export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;

export const aiChatRunStatusSchema = z.enum(["idle", "running"]);
export type AiChatRunStatus = z.infer<typeof aiChatRunStatusSchema>;

export const aiChatSnapshotSchema = z
  .object({
    provider: providerIdSchema,
    workspace_path: z.string().min(1).max(4096),
    session_id: z.union([z.string().min(1).max(512), z.null()]),
    run_status: aiChatRunStatusSchema,
    messages: z.array(aiChatMessageSchema),
    last_error: z.union([z.string().max(1024), z.null()]),
    updated_at: isoMs,
  })
  .strict();
export type AiChatSnapshot = z.infer<typeof aiChatSnapshotSchema>;

export const aiChatStateSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    provider: providerIdSchema,
    workspace_path: z.string().min(1).max(4096),
    workspace_valid: z.boolean(),
    snapshot: aiChatSnapshotSchema,
  })
  .strict();
export const aiChatStateResultSchema = z.union([aiChatStateSuccessSchema, errorEnvelopeSchema]);
export type AiChatStateResult = z.infer<typeof aiChatStateResultSchema>;

export const aiChatSendInputSchema = z
  .object({
    prompt: z.string().trim().min(1).max(64000),
  })
  .strict();
export type AiChatSendInput = z.infer<typeof aiChatSendInputSchema>;

export const aiChatSendSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    accepted: z.literal(true),
  })
  .strict();
export const aiChatSendResultSchema = z.union([aiChatSendSuccessSchema, errorEnvelopeSchema]);
export type AiChatSendResult = z.infer<typeof aiChatSendResultSchema>;

export const aiChatCancelSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    cancelled: z.boolean(),
  })
  .strict();
export const aiChatCancelResultSchema = z.union([aiChatCancelSuccessSchema, errorEnvelopeSchema]);
export type AiChatCancelResult = z.infer<typeof aiChatCancelResultSchema>;

export const aiChatResetSuccessSchema = z
  .object({
    schema_version: z.literal(SCHEMA_VERSION),
    ok: z.literal(true),
    snapshot: aiChatSnapshotSchema,
  })
  .strict();
export const aiChatResetResultSchema = z.union([aiChatResetSuccessSchema, errorEnvelopeSchema]);
export type AiChatResetResult = z.infer<typeof aiChatResetResultSchema>;

const aiChatEventBase = {
  schema_version: z.literal(SCHEMA_VERSION),
  provider: providerIdSchema,
  workspace_path: z.string().min(1).max(4096),
} as const;

export const aiChatHydratedEventSchema = z
  .object({
    ...aiChatEventBase,
    phase: z.literal("hydrated"),
    snapshot: aiChatSnapshotSchema,
    workspace_valid: z.boolean(),
  })
  .strict();

export const aiChatRunStartedEventSchema = z
  .object({
    ...aiChatEventBase,
    phase: z.literal("run-started"),
    snapshot: aiChatSnapshotSchema,
  })
  .strict();

export const aiChatMessageDeltaEventSchema = z
  .object({
    ...aiChatEventBase,
    phase: z.literal("message-delta"),
    message_id: z.string().min(1).max(256),
    text: z.string(),
  })
  .strict();

export const aiChatThinkingEventSchema = z
  .object({
    ...aiChatEventBase,
    phase: z.literal("thinking"),
    text: z.string(),
  })
  .strict();

export const aiChatToolStartedEventSchema = z
  .object({
    ...aiChatEventBase,
    phase: z.literal("tool-started"),
    message_id: z.string().min(1).max(256),
    trace: aiChatToolTraceSchema,
  })
  .strict();

export const aiChatToolEndedEventSchema = z
  .object({
    ...aiChatEventBase,
    phase: z.literal("tool-ended"),
    message_id: z.string().min(1).max(256),
    trace: aiChatToolTraceSchema,
  })
  .strict();

export const aiChatRunEndedEventSchema = z
  .object({
    ...aiChatEventBase,
    phase: z.literal("run-ended"),
    snapshot: aiChatSnapshotSchema,
  })
  .strict();

export const aiChatResetEventSchema = z
  .object({
    ...aiChatEventBase,
    phase: z.literal("reset"),
    snapshot: aiChatSnapshotSchema,
  })
  .strict();

export const aiChatEventSchema = z.discriminatedUnion("phase", [
  aiChatHydratedEventSchema,
  aiChatRunStartedEventSchema,
  aiChatMessageDeltaEventSchema,
  aiChatThinkingEventSchema,
  aiChatToolStartedEventSchema,
  aiChatToolEndedEventSchema,
  aiChatRunEndedEventSchema,
  aiChatResetEventSchema,
]);
export type AiChatEvent = z.infer<typeof aiChatEventSchema>;
