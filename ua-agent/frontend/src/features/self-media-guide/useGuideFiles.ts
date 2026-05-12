import { useQuery } from "@tanstack/react-query";

import {
  SelfMediaGuideListResult,
  type SelfMediaGuideListResult as SelfMediaGuideListResultType,
} from "@/shared/contracts/self-media-guide";

function errorResult(message: string): SelfMediaGuideListResultType {
  return {
    schema_version: "1",
    ok: false,
    error: { code: "INTERNAL", message },
  };
}

export function useGuideFiles(): {
  result: SelfMediaGuideListResultType | undefined;
  isLoading: boolean;
} {
  const query = useQuery<SelfMediaGuideListResultType>({
    queryKey: ["self-media-guide-files"],
    queryFn: async () => {
      if (window.api?.selfMediaGuide?.list === undefined) {
        return errorResult("preload 未注入 selfMediaGuide.list");
      }
      try {
        const raw = await window.api.selfMediaGuide.list();
        const parsed = SelfMediaGuideListResult.safeParse(raw);
        if (!parsed.success) {
          return errorResult("self-media-guide:list 响应未通过 Zod 校验");
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return errorResult(`IPC 调用失败：${message}`);
      }
    },
  });

  return {
    result: query.data,
    isLoading: query.isLoading,
  };
}
