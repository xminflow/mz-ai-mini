import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AI_CHAT_QUERY_KEY } from "@/features/ai-chat/hooks";
import {
  appSettingsSchema,
  normalizeAppSettings,
  type AppSettingsContract,
  type AppSettingsPatch,
  settingsGetResultSchema,
  settingsUpdateResultSchema,
} from "@/shared/contracts/settings";

export const SETTINGS_QUERY_KEY = ["settings"] as const;

export function useSettings() {
  return useQuery<AppSettingsContract, Error>({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: async () => {
      const raw = await window.api.settings.get();
      const parsed = settingsGetResultSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(`settings:get 响应未通过 Zod 校验：${JSON.stringify(raw).slice(0, 200)}`);
      }
      if (!parsed.data.ok) {
        throw new Error(parsed.data.error.message);
      }
      return normalizeAppSettings(parsed.data.settings);
    },
    staleTime: Infinity,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation<AppSettingsContract, Error, AppSettingsPatch>({
    mutationFn: async (patch) => {
      let raw: unknown;
      try {
        raw = await window.api.settings.update(patch);
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : String(err));
      }
      const parsed = settingsUpdateResultSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(`settings:update 响应未通过 Zod 校验：${JSON.stringify(raw).slice(0, 200)}`);
      }
      if (!parsed.data.ok) {
        throw new Error(parsed.data.error.message);
      }
      return normalizeAppSettings(parsed.data.settings);
    },
    onSuccess: (next) => {
      qc.setQueryData<AppSettingsContract>(SETTINGS_QUERY_KEY, next);
      void qc.invalidateQueries({ queryKey: AI_CHAT_QUERY_KEY });
      toast.success("设置已保存");
    },
    onError: (err) => {
      toast.error(`保存失败：${err.message}`);
    },
  });
}
