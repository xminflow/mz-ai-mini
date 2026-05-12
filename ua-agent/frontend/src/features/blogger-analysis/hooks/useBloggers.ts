import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  bloggerAnalyzeCancelResultSchema,
  bloggerAnalyzeResultSchema,
  bloggerCaptureProfileResultSchema,
  bloggerCreateResultSchema,
  bloggerDeleteSampleResultSchema,
  bloggerDeleteResultSchema,
  bloggerListResultSchema,
  bloggerSampleVideosResultSchema,
  type Blogger,
  type BloggerAnalyzeCancelResult,
  type BloggerAnalyzeResult,
  type BloggerCaptureProfileResult,
  type BloggerCreateResult,
  type BloggerDeleteSampleResult,
  type BloggerDeleteResult,
  type BloggerListResult,
  type BloggerSampleVideosResult,
} from "@/shared/contracts/blogger";

import { bloggerStrings } from "../strings";
import { bloggerReportQueryKey } from "./useBloggerReport";

export const BLOGGERS_QUERY_KEY = ["bloggers"] as const;

function intErr(message: string): BloggerListResult {
  return {
    schema_version: "1",
    ok: false,
    error: { code: "INTERNAL", message },
  };
}

export function useBloggersList(): {
  bloggers: Blogger[];
  isLoading: boolean;
  isError: boolean;
  error: BloggerListResult | null;
  refetch: () => Promise<unknown>;
} {
  const query = useQuery<BloggerListResult>({
    queryKey: BLOGGERS_QUERY_KEY,
    queryFn: async () => {
      if (window.api?.blogger?.list === undefined) {
        return intErr("preload 未注入 blogger 接口");
      }
      try {
        const raw = await window.api.blogger.list();
        const parsed = bloggerListResultSchema.safeParse(raw);
        if (!parsed.success) {
          console.error("[useBloggersList] zod parse failed", parsed.error.issues, raw);
          return intErr(`blogger:list 响应未通过 Zod 校验`);
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return intErr(`IPC 调用失败：${message}`);
      }
    },
    staleTime: 5_000,
  });

  const data = query.data;
  return {
    bloggers: data !== undefined && data.ok ? data.bloggers : [],
    isLoading: query.isLoading,
    isError: data !== undefined && !data.ok,
    error: data ?? null,
    refetch: query.refetch,
  };
}

function showErrorToast(code: string, message: string): void {
  if (code === "BROWSER_BUSY") {
    toast.error(bloggerStrings.toastBrowserBusy);
    return;
  }
  toast.error(bloggerStrings.toastUnknownError(code, message));
}

export function useBloggerCreate() {
  const qc = useQueryClient();
  return useMutation<BloggerCreateResult, Error, { profile_url: string }>({
    mutationFn: async (input) => {
      if (window.api?.blogger?.create === undefined) {
        const w = window as unknown as { api?: Record<string, unknown> };
        const apiKeys = w.api !== undefined ? Object.keys(w.api).join(",") : "(none)";
        console.error(
          `[useBloggerCreate] preload surface incomplete. window.api keys=[${apiKeys}]`,
        );
        return {
          schema_version: "1",
          ok: false,
          error: {
            code: "INTERNAL",
            message: `preload 未注入 blogger.create — 请重启 pnpm dev (window.api keys=[${apiKeys}])`,
          },
        };
      }
      try {
        const raw = await window.api.blogger.create(input);
        const parsed = bloggerCreateResultSchema.safeParse(raw);
        if (!parsed.success) {
          console.error("[useBloggerCreate] zod parse failed", parsed.error.issues, "raw:", raw);
          return {
            schema_version: "1",
            ok: false,
            error: {
              code: "INTERNAL",
              message: `blogger:create 响应未通过 Zod 校验：${JSON.stringify(raw).slice(0, 300)}`,
            },
          };
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("[useBloggerCreate] IPC threw:", e);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: `IPC 调用失败：${message}` },
        };
      }
    },
    onSuccess: (result) => {
      if (result.ok) {
        void qc.invalidateQueries({ queryKey: BLOGGERS_QUERY_KEY });
      } else {
        showErrorToast(result.error.code, result.error.message);
      }
    },
  });
}

export function useBloggerDelete() {
  const qc = useQueryClient();
  return useMutation<BloggerDeleteResult, Error, { id: string }>({
    mutationFn: async (input) => {
      if (window.api?.blogger?.delete === undefined) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "preload 未注入 blogger.delete — 请重启 pnpm dev" },
        };
      }
      try {
        const raw = await window.api.blogger.delete(input);
        const parsed = bloggerDeleteResultSchema.safeParse(raw);
        if (!parsed.success) {
          console.error("[useBloggerDelete] zod parse failed", parsed.error.issues, raw);
          return {
            schema_version: "1",
            ok: false,
            error: { code: "INTERNAL", message: "blogger:delete 响应未通过 Zod 校验" },
          };
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("[useBloggerDelete] IPC threw:", e);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: `IPC 调用失败：${message}` },
        };
      }
    },
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(bloggerStrings.toastDeleted);
        void qc.invalidateQueries({ queryKey: BLOGGERS_QUERY_KEY });
      } else {
        showErrorToast(result.error.code, result.error.message);
      }
    },
  });
}

export function useBloggerDeleteSample() {
  const qc = useQueryClient();
  return useMutation<BloggerDeleteSampleResult, Error, { blogger_id: string; video_url: string }>({
    mutationFn: async (input) => {
      if (window.api?.blogger?.deleteSample === undefined) {
        return {
          schema_version: "1",
          ok: false,
          error: {
            code: "INTERNAL",
            message: "preload 未注入 blogger.deleteSample — 请重启 pnpm dev",
          },
        };
      }
      try {
        const raw = await window.api.blogger.deleteSample(input);
        const parsed = bloggerDeleteSampleResultSchema.safeParse(raw);
        if (!parsed.success) {
          console.error("[useBloggerDeleteSample] zod parse failed", parsed.error.issues, raw);
          return {
            schema_version: "1",
            ok: false,
            error: { code: "INTERNAL", message: "blogger:delete-sample 响应未通过 Zod 校验" },
          };
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("[useBloggerDeleteSample] IPC threw:", e);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: `IPC 调用失败：${message}` },
        };
      }
    },
    onSettled: (_data, _error, vars) => {
      void qc.invalidateQueries({ queryKey: BLOGGERS_QUERY_KEY });
      void qc.invalidateQueries({ queryKey: ["blogger-samples", vars.blogger_id] });
      void qc.invalidateQueries({ queryKey: bloggerReportQueryKey(vars.blogger_id) });
    },
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(bloggerStrings.toastSampleDeleted);
      } else {
        showErrorToast(result.error.code, result.error.message);
      }
    },
  });
}

export function useBloggerCaptureProfile() {
  const qc = useQueryClient();
  return useMutation<BloggerCaptureProfileResult, Error, { id: string }>({
    mutationFn: async (input) => {
      if (window.api?.blogger?.captureProfile === undefined) {
        return {
          schema_version: "1",
          ok: false,
          error: {
            code: "INTERNAL",
            message: "preload 未注入 blogger.captureProfile — 请重启 pnpm dev",
          },
        };
      }
      try {
        const raw = await window.api.blogger.captureProfile(input);
        const parsed = bloggerCaptureProfileResultSchema.safeParse(raw);
        if (!parsed.success) {
          console.error("[useBloggerCaptureProfile] zod parse failed", parsed.error.issues, raw);
          return {
            schema_version: "1",
            ok: false,
            error: { code: "INTERNAL", message: "blogger:capture-profile 响应未通过 Zod 校验" },
          };
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("[useBloggerCaptureProfile] IPC threw:", e);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: `IPC 调用失败：${message}` },
        };
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: BLOGGERS_QUERY_KEY });
    },
    onSuccess: (result) => {
      if (!result.ok) showErrorToast(result.error.code, result.error.message);
    },
  });
}

export function useBloggerSampleVideos() {
  const qc = useQueryClient();
  return useMutation<BloggerSampleVideosResult, Error, { id: string; k?: number; append?: boolean }>({
    mutationFn: async (input) => {
      if (window.api?.blogger?.sampleVideos === undefined) {
        return {
          schema_version: "1",
          ok: false,
          error: {
            code: "INTERNAL",
            message: "preload 未注入 blogger.sampleVideos — 请重启 pnpm dev",
          },
        };
      }
      try {
        const raw = await window.api.blogger.sampleVideos(input);
        const parsed = bloggerSampleVideosResultSchema.safeParse(raw);
        if (!parsed.success) {
          console.error("[useBloggerSampleVideos] zod parse failed", parsed.error.issues, raw);
          return {
            schema_version: "1",
            ok: false,
            error: { code: "INTERNAL", message: "blogger:sample-videos 响应未通过 Zod 校验" },
          };
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("[useBloggerSampleVideos] IPC threw:", e);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: `IPC 调用失败：${message}` },
        };
      }
    },
    onSettled: (_data, _error, vars) => {
      void qc.invalidateQueries({ queryKey: BLOGGERS_QUERY_KEY });
      void qc.invalidateQueries({ queryKey: ["blogger-samples", vars.id] });
    },
    onSuccess: (result) => {
      if (!result.ok) showErrorToast(result.error.code, result.error.message);
    },
  });
}

export function useBloggerAnalyze() {
  const qc = useQueryClient();
  return useMutation<BloggerAnalyzeResult, Error, { id: string }>({
    mutationFn: async (input) => {
      if (window.api?.blogger?.analyze === undefined) {
        return {
          schema_version: "1",
          ok: false,
          error: {
            code: "INTERNAL",
            message: "preload 未注入 blogger.analyze — 请重启 pnpm dev",
          },
        };
      }
      try {
        const raw = await window.api.blogger.analyze(input);
        const parsed = bloggerAnalyzeResultSchema.safeParse(raw);
        if (!parsed.success) {
          console.error("[useBloggerAnalyze] zod parse failed", parsed.error.issues, raw);
          return {
            schema_version: "1",
            ok: false,
            error: { code: "INTERNAL", message: "blogger:analyze 响应未通过 Zod 校验" },
          };
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        console.error("[useBloggerAnalyze] IPC threw:", e);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: `IPC 调用失败：${message}` },
        };
      }
    },
    onSettled: (_data, _error, vars) => {
      void qc.invalidateQueries({ queryKey: BLOGGERS_QUERY_KEY });
      void qc.invalidateQueries({ queryKey: ["blogger-samples", vars.id] });
    },
    onSuccess: (result) => {
      if (!result.ok) showErrorToast(result.error.code, result.error.message);
    },
  });
}

export function useBloggerAnalyzeCancel() {
  return useMutation<BloggerAnalyzeCancelResult, Error, { id: string }>({
    mutationFn: async (input) => {
      if (window.api?.blogger?.analyzeCancel === undefined) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "preload 未注入 blogger.analyzeCancel" },
        };
      }
      try {
        const raw = await window.api.blogger.analyzeCancel(input);
        const parsed = bloggerAnalyzeCancelResultSchema.safeParse(raw);
        if (!parsed.success) {
          return {
            schema_version: "1",
            ok: false,
            error: { code: "INTERNAL", message: "blogger:analyze-cancel 响应未通过 Zod 校验" },
          };
        }
        return parsed.data;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: `IPC 调用失败：${message}` },
        };
      }
    },
  });
}
