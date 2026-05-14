import { z } from "zod";

import { errorEnvelopeSchema, SCHEMA_VERSION } from "./error";

export const agentAccountSchema = z.object({
  account_id: z.string().min(1),
  username: z.string().min(4).max(32),
  email: z.string().email().nullable(),
  status: z.enum(["active", "disabled"]),
  created_at: z.string().min(1),
});
export type AgentAccount = z.infer<typeof agentAccountSchema>;

export const agentTokenSetSchema = z.object({
  access_token: z.string().min(1),
  access_token_expires_at: z.string().min(1),
  refresh_token: z.string().min(1),
  refresh_token_expires_at: z.string().min(1),
});
export type AgentTokenSet = z.infer<typeof agentTokenSetSchema>;

export const agentAuthPayloadSchema = z.object({
  account: agentAccountSchema,
  tokens: agentTokenSetSchema,
});
export type AgentAuthPayload = z.infer<typeof agentAuthPayloadSchema>;

export const agentAuthStateAuthenticatedSchema = z.object({
  authenticated: z.literal(true),
  account: agentAccountSchema,
  access_token_expires_at: z.string().min(1),
  refresh_token_expires_at: z.string().min(1),
});

export const agentAuthStateAnonymousSchema = z.object({
  authenticated: z.literal(false),
  reason: z.enum(["missing_session", "expired", "revoked"]).optional(),
});

export const agentAuthStateSchema = z.discriminatedUnion("authenticated", [
  agentAuthStateAuthenticatedSchema,
  agentAuthStateAnonymousSchema,
]);
export type AgentAuthState = z.infer<typeof agentAuthStateSchema>;

export const agentAuthStateSuccessSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  state: agentAuthStateSchema,
});
export const agentAuthMutationSuccessSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  state: agentAuthStateSchema,
});

export const agentAuthStateResultSchema = z.union([
  agentAuthStateSuccessSchema,
  errorEnvelopeSchema,
]);
export type AgentAuthStateResult = z.infer<typeof agentAuthStateResultSchema>;

export const agentAuthMutationResultSchema = z.union([
  agentAuthMutationSuccessSchema,
  errorEnvelopeSchema,
]);
export type AgentAuthMutationResult = z.infer<typeof agentAuthMutationResultSchema>;

export const wechatLoginSessionSchema = z.object({
  login_session_id: z.string().min(1),
  status: z.enum(["pending", "authenticated", "expired", "consumed"]),
  qr_code_url: z.string().url(),
  expires_at: z.string().min(1),
  poll_interval_ms: z.number().int().positive(),
});
export type WechatLoginSession = z.infer<typeof wechatLoginSessionSchema>;

export const wechatLoginSessionStatusSchema = z.object({
  login_session_id: z.string().min(1),
  status: z.enum(["pending", "authenticated", "expired", "consumed"]),
  expires_at: z.string().min(1),
});
export type WechatLoginSessionStatus = z.infer<typeof wechatLoginSessionStatusSchema>;

export const wechatLoginSessionEnvelopeSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  session: wechatLoginSessionSchema,
});

export const wechatLoginSessionStatusEnvelopeSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  session: wechatLoginSessionStatusSchema,
});

export const wechatLoginSessionResultSchema = z.union([
  wechatLoginSessionEnvelopeSchema,
  errorEnvelopeSchema,
]);
export type WechatLoginSessionResult = z.infer<typeof wechatLoginSessionResultSchema>;

export const wechatLoginSessionStatusResultSchema = z.union([
  wechatLoginSessionStatusEnvelopeSchema,
  errorEnvelopeSchema,
]);
export type WechatLoginSessionStatusResult = z.infer<typeof wechatLoginSessionStatusResultSchema>;

export const emailLoginChallengeSchema = z.object({
  login_challenge_id: z.string().min(1),
  expires_at: z.string().min(1),
  cooldown_seconds: z.number().int().positive(),
});
export type EmailLoginChallenge = z.infer<typeof emailLoginChallengeSchema>;

export const emailLoginChallengeEnvelopeSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  challenge: emailLoginChallengeSchema,
});

export const emailLoginChallengeResultSchema = z.union([
  emailLoginChallengeEnvelopeSchema,
  errorEnvelopeSchema,
]);
export type EmailLoginChallengeResult = z.infer<typeof emailLoginChallengeResultSchema>;
