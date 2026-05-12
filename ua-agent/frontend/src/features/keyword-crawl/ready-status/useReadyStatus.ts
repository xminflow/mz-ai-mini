import { useQuery } from "@tanstack/react-query";

import {
  sessionStatusResultSchema,
  type Prereqs,
  type SessionStatusResult,
} from "@/shared/contracts/keyword/session-status";

export const SESSION_STATUS_QUERY_KEY = ["sessionStatus"] as const;

export interface UseReadyStatusOutcome {
  prereqs: Prereqs | null;
  isReady: boolean;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
}

const DEFAULT_PREREQS: Prereqs = {
  browser_installed: false,
  session_running: false,
  douyin_reachable: "unknown",
  signed_in: "unknown",
};

export function useReadyStatus(): UseReadyStatusOutcome {
  const query = useQuery<SessionStatusResult>({
    queryKey: SESSION_STATUS_QUERY_KEY,
    queryFn: async () => {
      if (window.api?.keyword?.sessionStatus === undefined) {
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: { code: "INTERNAL" as const, message: "preload 未注入 keyword 接口" },
        };
      }
      const raw = await window.api.keyword.sessionStatus();
      const parsed = sessionStatusResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "sessionStatus 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  });

  const data = query.data;
  const prereqs = data !== undefined && data.ok === true ? data.prereqs : null;
  const isReady = prereqs !== null && prereqs.browser_installed && prereqs.session_running;
  return {
    prereqs: prereqs ?? DEFAULT_PREREQS,
    isReady,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
