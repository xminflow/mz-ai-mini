import { z } from "zod";

import { errorEnvelopeSchema, SCHEMA_VERSION } from "./error";
import { DEFAULT_SCHEDULING, schedulingSettingsSchema } from "./scheduling";

export const providerIdSchema = z.enum(["claude-code", "codex", "kimi"]);
export type ProviderIdContract = z.infer<typeof providerIdSchema>;

export const claudeCodeProviderSettingsSchema = z.object({
  binPath: z.string().optional(),
  apiKey: z.string().optional(),
  defaultCwd: z.string().optional(),
});

export const codexProviderSettingsSchema = z.object({
  binPath: z.string().optional(),
  apiKey: z.string().optional(),
});

export const kimiProviderSettingsSchema = z.object({
  binPath: z.string().optional(),
});

export const networkSettingsSchema = z.object({
  httpsProxy: z.string().optional(),
  httpProxy: z.string().optional(),
  noProxy: z.string().optional(),
});

export const themeSchema = z.enum(["light", "dark", "system"]);

export const appSettingsSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  llm: z.object({
    provider: providerIdSchema,
    claudeCode: claudeCodeProviderSettingsSchema,
    codex: codexProviderSettingsSchema,
    kimi: kimiProviderSettingsSchema,
  }),
  network: networkSettingsSchema,
  theme: themeSchema,
  scheduling: schedulingSettingsSchema,
});

export type AppSettingsContract = z.infer<typeof appSettingsSchema>;

// `update` accepts a deep-partial patch; we keep the validation lenient on the
// renderer side and let the main process merge against defaults.
export const appSettingsPatchSchema = z
  .object({
    llm: z
      .object({
        provider: providerIdSchema.optional(),
        claudeCode: claudeCodeProviderSettingsSchema.partial().optional(),
        codex: codexProviderSettingsSchema.partial().optional(),
        kimi: kimiProviderSettingsSchema.partial().optional(),
      })
      .partial()
      .optional(),
    network: networkSettingsSchema.partial().optional(),
    theme: themeSchema.optional(),
    scheduling: z
      .object({
        douyin: schedulingSettingsSchema.shape.douyin.partial().optional(),
        xiaohongshu: schedulingSettingsSchema.shape.xiaohongshu.partial().optional(),
      })
      .partial()
      .optional(),
  })
  .partial();

export type AppSettingsPatch = z.infer<typeof appSettingsPatchSchema>;

export const settingsGetSuccessSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  settings: appSettingsSchema,
});

export const settingsGetResultSchema = z.union([settingsGetSuccessSchema, errorEnvelopeSchema]);
export type SettingsGetResult = z.infer<typeof settingsGetResultSchema>;

export const settingsUpdateSuccessSchema = settingsGetSuccessSchema;
export const settingsUpdateResultSchema = z.union([
  settingsUpdateSuccessSchema,
  errorEnvelopeSchema,
]);
export type SettingsUpdateResult = z.infer<typeof settingsUpdateResultSchema>;

export const llmAvailabilitySchema = z.object({
  ok: z.boolean(),
  version: z.string().optional(),
  reason: z.string().optional(),
});
export type LlmAvailability = z.infer<typeof llmAvailabilitySchema>;

export const settingsTestLlmSuccessSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  ok: z.literal(true),
  provider: providerIdSchema,
  availability: llmAvailabilitySchema,
});

export const settingsTestLlmResultSchema = z.union([
  settingsTestLlmSuccessSchema,
  errorEnvelopeSchema,
]);
export type SettingsTestLlmResult = z.infer<typeof settingsTestLlmResultSchema>;

const DEFAULT_NORMALIZED_SETTINGS: AppSettingsContract = {
  schema_version: SCHEMA_VERSION,
  llm: {
    provider: "claude-code",
    claudeCode: {},
    codex: {},
    kimi: {},
  },
  network: {},
  theme: "system",
  scheduling: DEFAULT_SCHEDULING,
};

export function normalizeAppSettings(raw: unknown): AppSettingsContract {
  const parsed = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const llm = parsed["llm"];
  const llmRecord = llm && typeof llm === "object" ? (llm as Record<string, unknown>) : {};
  const scheduling = parsed["scheduling"];
  const schedulingRecord =
    scheduling && typeof scheduling === "object"
      ? (scheduling as Record<string, unknown>)
      : {};
  return appSettingsSchema.parse({
    ...DEFAULT_NORMALIZED_SETTINGS,
    ...parsed,
    llm: {
      ...DEFAULT_NORMALIZED_SETTINGS.llm,
      ...llmRecord,
    },
    network:
      parsed["network"] && typeof parsed["network"] === "object"
        ? {
            ...DEFAULT_NORMALIZED_SETTINGS.network,
            ...(parsed["network"] as Record<string, unknown>),
          }
        : DEFAULT_NORMALIZED_SETTINGS.network,
    scheduling: {
      ...DEFAULT_NORMALIZED_SETTINGS.scheduling,
      ...schedulingRecord,
      douyin: {
        ...DEFAULT_NORMALIZED_SETTINGS.scheduling.douyin,
        ...(schedulingRecord["douyin"] && typeof schedulingRecord["douyin"] === "object"
          ? (schedulingRecord["douyin"] as Record<string, unknown>)
          : {}),
      },
      xiaohongshu: {
        ...DEFAULT_NORMALIZED_SETTINGS.scheduling.xiaohongshu,
        ...(schedulingRecord["xiaohongshu"] &&
        typeof schedulingRecord["xiaohongshu"] === "object"
          ? (schedulingRecord["xiaohongshu"] as Record<string, unknown>)
          : {}),
      },
    },
  });
}
