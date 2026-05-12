import { useQuery } from "@tanstack/react-query";

import {
  type SchedulerStatus,
  schedulerStatusResultSchema,
} from "@/shared/contracts/scheduling";

export const SCHEDULER_STATUS_QUERY_KEY = ["scheduler", "status"] as const;

export function useSchedulerStatus() {
  return useQuery<SchedulerStatus, Error>({
    queryKey: SCHEDULER_STATUS_QUERY_KEY,
    queryFn: async () => {
      const raw = await window.api.scheduler.status();
      const parsed = schedulerStatusResultSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(
          `scheduler:status 响应未通过 Zod 校验：${JSON.stringify(raw).slice(0, 200)}`,
        );
      }
      if (!parsed.data.ok) {
        throw new Error(parsed.data.error.message);
      }
      return parsed.data.status;
    },
    refetchInterval: 30_000,
    staleTime: 0,
  });
}
