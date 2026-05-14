import { z } from "zod";

import { errorEnvelopeSchema, SCHEMA_VERSION } from "./error";

export const personaProfileFormSchema = z.object({
  targetAudience: z.string(),
  coreProblem: z.string(),
  trustReason: z.string(),
  expectedResult: z.string(),
});

export type PersonaProfileForm = z.infer<typeof personaProfileFormSchema>;

export const strategyFormSchema = z.object({
  motivation: z.string(),
  annualGoal: z.string(),
  trackWhy: z.string(),
  platformChoice: z.string(),
  businessModel: z.string(),
  opportunityBoundary: z.string(),
  nextHypothesis: z.string(),
});

export type StrategyForm = z.infer<typeof strategyFormSchema>;

export const personaWorkspaceStateSchema = z.object({
  profile: personaProfileFormSchema,
  strategy: strategyFormSchema,
  updated_at: z.string().datetime({ offset: true }),
});

export type PersonaWorkspaceState = z.infer<typeof personaWorkspaceStateSchema>;

export const personaSavePayloadSchema = z.object({
  profile: personaProfileFormSchema.optional(),
  strategy: strategyFormSchema.optional(),
});

export type PersonaSavePayload = z.infer<typeof personaSavePayloadSchema>;

export const personaSaveSuccessSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  saved_at: z.string().datetime({ offset: true }),
  workspace_path: z.string().min(1).max(4096),
  markdown_path: z.string().min(1).max(4096),
  json_path: z.string().min(1).max(4096),
});

export const personaSaveResultSchema = z.union([
  personaSaveSuccessSchema,
  errorEnvelopeSchema,
]);

export type PersonaSaveResult = z.infer<typeof personaSaveResultSchema>;
