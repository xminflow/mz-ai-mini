import { useQuery } from "@tanstack/react-query";

import {
  bloggerGetReportResultSchema,
  type BloggerGetReportResult,
} from "@/shared/contracts/blogger";

function intErr(message: string): BloggerGetReportResult {
  return {
    schema_version: "1",
    ok: false,
    error: { code: "INTERNAL", message },
  };
}

export function bloggerReportQueryKey(id: string | null): readonly [string, string | null] {
  return ["blogger-report", id] as const;
}

export function useBloggerReport(id: string | null): {
  report: BloggerGetReportResult | undefined;
  isLoading: boolean;
} {
  const query = useQuery<BloggerGetReportResult>({
    queryKey: bloggerReportQueryKey(id),
    enabled: id !== null,
    queryFn: async () => {
      if (id === null) return intErr("missing blogger id");
      if (window.api?.blogger?.getReport === undefined) {
        return intErr("preload 未注入 blogger.getReport");
      }
      try {
        const raw = await window.api.blogger.getReport({ id });
        const parsed = bloggerGetReportResultSchema.safeParse(raw);
        if (!parsed.success) {
          return intErr("blogger:get-report 响应未通过 Zod 校验");
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return intErr(`IPC 调用失败：${message}`);
      }
    },
  });

  return {
    report: query.data,
    isLoading: query.isLoading,
  };
}
