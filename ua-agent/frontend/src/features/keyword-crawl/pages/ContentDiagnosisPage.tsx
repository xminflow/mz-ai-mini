import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { useMutation, useMutationState, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ExternalLink,
  FileText,
  Image,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  contentDiagnosisAnalyzeResultSchema,
  contentDiagnosisCreateResultSchema,
  contentDiagnosisDeleteResultSchema,
  contentDiagnosisGetReportResultSchema,
  contentDiagnosisListResultSchema,
  type ContentDiagnosis,
  type ContentDiagnosisGetReportResult,
} from "@/shared/contracts/content-diagnosis";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

const mdComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1 className="text-2xl font-semibold tracking-tight text-foreground" {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mt-8 text-xl font-semibold tracking-tight text-foreground" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-6 text-base font-semibold text-foreground" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="text-[15px] leading-8 text-foreground/90" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="list-disc space-y-2 pl-5 text-[15px] leading-7 text-foreground/90" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol
      className="list-decimal space-y-2 pl-5 text-[15px] leading-7 text-foreground/90"
      {...props}
    />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-5 border-l-4 border-border pl-4 text-base italic leading-8 text-muted-foreground"
      {...props}
    />
  ),
} as const;

const QUERY_KEY = ["content-diagnosis"] as const;
const ANALYZE_MUTATION_KEY = ["content-diagnosis", "analyze"] as const;
const SELECTED_ID_STORAGE_KEY = "content-diagnosis:selected-id";

function frameSrc(relative: string): string {
  return `userdata://${relative.replace(/^\/+/, "")}`;
}

function formatCount(n: number): string {
  if (n < 0) return "未知";
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`;
  return n.toLocaleString("zh-CN");
}

function formatDateTime(iso: string | null): string {
  if (iso === null) return "未生成";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: ContentDiagnosis["status"]): string {
  switch (status) {
    case "pending":
      return "待采集";
    case "captured":
      return "已采集";
    case "media_ready":
      return "素材已处理";
    case "report_ready":
      return "报告已生成";
    case "error":
      return "失败";
  }
}

function statusVariant(
  status: ContentDiagnosis["status"],
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "error") return "destructive";
  if (status === "report_ready") return "secondary";
  if (status === "media_ready") return "default";
  return "outline";
}

function platformLabel(platform: ContentDiagnosis["platform"]): string {
  return platform === "xiaohongshu" ? "小红书" : "抖音";
}

function readStoredSelectedId(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(SELECTED_ID_STORAGE_KEY);
}

function coverFramePath(item: ContentDiagnosis): string | null {
  return item.frames.find((frame) => frame.kind === "cover")?.path ?? item.frames[0]?.path ?? null;
}

function useContentDiagnoses() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const raw = await window.api.contentDiagnosis.list();
      const parsed = contentDiagnosisListResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: {
            code: "INTERNAL" as const,
            message: "content-diagnosis:list 响应未通过 Zod 校验",
          },
        };
      }
      return parsed.data;
    },
  });
}

function useContentDiagnosisReport(id: string | null) {
  return useQuery<ContentDiagnosisGetReportResult>({
    queryKey: ["content-diagnosis-report", id],
    enabled: id !== null,
    queryFn: async () => {
      if (id === null) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INVALID_INPUT", message: "missing id" },
        };
      }
      const raw = await window.api.contentDiagnosis.getReport({ id });
      const parsed = contentDiagnosisGetReportResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1",
          ok: false,
          error: { code: "INTERNAL", message: "content-diagnosis:get-report 响应未通过 Zod 校验" },
        };
      }
      return parsed.data;
    },
  });
}

export function ContentDiagnosisPage(): JSX.Element {
  const qc = useQueryClient();
  const [shareUrl, setShareUrl] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(() => readStoredSelectedId());
  const listQuery = useContentDiagnoses();
  const items = useMemo(() => (listQuery.data?.ok ? listQuery.data.items : []), [listQuery.data]);
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const reportQuery = useContentDiagnosisReport(selected?.id ?? null);
  const pendingAnalyzeIds = useMutationState<string>({
    filters: { mutationKey: ANALYZE_MUTATION_KEY, status: "pending" },
    select: (mutation) => {
      const variables = mutation.state.variables as { id?: unknown } | undefined;
      return typeof variables?.id === "string" ? variables.id : "";
    },
  }).filter((id) => id.length > 0);
  const isAnalyzingAny = pendingAnalyzeIds.length > 0;
  const isAnalyzingSelected = selected !== null && pendingAnalyzeIds.includes(selected.id);

  useEffect(() => {
    if (items.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    if (selectedId === null || !items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0]?.id ?? null);
    }
  }, [items, selectedId]);

  useEffect(() => {
    if (selectedId === null) {
      window.sessionStorage.removeItem(SELECTED_ID_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(SELECTED_ID_STORAGE_KEY, selectedId);
  }, [selectedId]);

  useEffect(() => {
    const id = window.api.contentDiagnosis.onEvent(() => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
      if (selected?.id !== undefined) {
        void qc.invalidateQueries({ queryKey: ["content-diagnosis-report", selected.id] });
      }
    });
    return () => window.api.contentDiagnosis.offEvent(id);
  }, [qc, selected?.id]);

  const analyzeMut = useMutation({
    mutationKey: ANALYZE_MUTATION_KEY,
    mutationFn: async (input: { id: string }) => {
      const raw = await window.api.contentDiagnosis.analyze(input);
      const parsed = contentDiagnosisAnalyzeResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: {
            code: "INTERNAL" as const,
            message: "content-diagnosis:analyze 响应未通过 Zod 校验",
          },
        };
      }
      return parsed.data;
    },
    onSettled: (_data, _error, vars) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
      void qc.invalidateQueries({ queryKey: ["content-diagnosis-report", vars.id] });
    },
    onSuccess: (result) => {
      if (!result.ok) toast.error(result.error.message);
    },
  });

  const createMut = useMutation({
    mutationFn: async (input: { share_url: string }) => {
      const raw = await window.api.contentDiagnosis.create(input);
      const parsed = contentDiagnosisCreateResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: {
            code: "INTERNAL" as const,
            message: "content-diagnosis:create 响应未通过 Zod 校验",
          },
        };
      }
      return parsed.data;
    },
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      setSelectedId(result.item.id);
      setShareUrl("");
      setCreateOpen(false);
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
      analyzeMut.mutate({ id: result.item.id });
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (input: { id: string }) => {
      const raw = await window.api.contentDiagnosis.delete(input);
      const parsed = contentDiagnosisDeleteResultSchema.safeParse(raw);
      if (!parsed.success) {
        return {
          schema_version: "1" as const,
          ok: false as const,
          error: {
            code: "INTERNAL" as const,
            message: "content-diagnosis:delete 响应未通过 Zod 校验",
          },
        };
      }
      return parsed.data;
    },
    onSettled: () => {
      setSelectedId(null);
      void qc.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onSuccess: (result) => {
      if (!result.ok) toast.error(result.error.message);
    },
  });

  const isBusy = createMut.isPending || isAnalyzingAny;

  function submit(): void {
    const trimmed = shareUrl.trim();
    if (trimmed.length === 0) return;
    createMut.mutate({ share_url: trimmed });
  }

  return (
    <div className="flex h-[calc(100vh-104px)] min-h-0 flex-col gap-5">
      <header className="page-header">
        <div className="min-w-0">
          <h1 className="page-title">内容诊断</h1>
          <p className="page-description">
            添加抖音或小红书视频链接，自动采集、提取文案、诊断内容问题并给出改进建议。
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={isBusy}>
          {createMut.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          添加诊断
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="surface-card flex min-h-0 flex-col overflow-hidden">
          <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
            <Image className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">诊断记录</h2>
            <span className="ml-auto text-xs text-muted-foreground">{items.length} 条</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {listQuery.isLoading ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                加载中…
              </div>
            ) : items.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                <FileText className="h-6 w-6" />
                暂无诊断素材
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => {
                  const coverPath = coverFramePath(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={[
                        "w-full rounded-xl border p-3 text-left transition",
                        selected?.id === item.id
                          ? "border-foreground bg-muted/70"
                          : "border-border bg-background hover:bg-muted/60",
                      ].join(" ")}
                    >
                      {coverPath !== null ? (
                        <img
                          src={frameSrc(coverPath)}
                          alt="视频封面"
                          className="mb-3 aspect-video w-full rounded-md bg-muted object-cover"
                        />
                      ) : null}
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant={statusVariant(item.status)}>
                          {statusLabel(item.status)}
                        </Badge>
                        <Badge variant="outline">{platformLabel(item.platform)}</Badge>
                        <span className="truncate text-xs text-muted-foreground">
                          {formatDateTime(
                            item.analysis_generated_at ??
                              item.media_analyzed_at ??
                              item.captured_at,
                          )}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm font-medium">
                        {(item.title ?? item.caption) || item.canonical_url}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        @{item.author_display_name ?? item.author_handle}
                      </p>
                      <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                        <span>赞 {formatCount(item.like_count)}</span>
                        <span>评 {formatCount(item.comment_count)}</span>
                        <span>藏 {formatCount(item.collect_count)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="surface-card flex min-h-0 flex-col overflow-hidden">
          {selected === null ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
              <Sparkles className="h-7 w-7" />
              <p>粘贴一个抖音或小红书视频链接开始诊断。</p>
              <Button onClick={() => setCreateOpen(true)} disabled={isBusy}>
                <Plus className="h-4 w-4" />
                添加诊断
              </Button>
            </div>
          ) : (
            <>
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">
                    {selected.title ?? "内容素材"}
                  </h2>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {selected.canonical_url}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(selected.canonical_url, "_blank", "noopener,noreferrer")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                    打开
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => analyzeMut.mutate({ id: selected.id })}
                    disabled={isAnalyzingAny}
                  >
                    {isAnalyzingSelected ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    重新诊断
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMut.mutate({ id: selected.id })}
                    disabled={deleteMut.isPending}
                  >
                    {deleteMut.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    删除
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                <section className="mb-4 rounded-md bg-muted/35 p-4">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant={statusVariant(selected.status)}>
                      {statusLabel(selected.status)}
                    </Badge>
                    <Badge variant="outline">{platformLabel(selected.platform)}</Badge>
                    <span className="text-xs text-muted-foreground">
                      作者 @{selected.author_display_name ?? selected.author_handle}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      报告 {formatDateTime(selected.analysis_generated_at)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                    {selected.caption || "（无描述）"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>点赞 {formatCount(selected.like_count)}</span>
                    <span>评论 {formatCount(selected.comment_count)}</span>
                    <span>收藏 {formatCount(selected.collect_count)}</span>
                    <span>转发 {formatCount(selected.share_count)}</span>
                    {selected.author_follower_count !== null ? (
                      <span>粉丝 {formatCount(selected.author_follower_count)}</span>
                    ) : null}
                  </div>
                </section>

                {selected.frames.length > 0 ? (
                  <section className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
                    {selected.frames.map((frame) => (
                      <div
                        key={`${frame.kind}-${frame.index}`}
                        className="overflow-hidden rounded-md bg-muted"
                      >
                        <img
                          src={frameSrc(frame.path)}
                          alt={frame.kind === "cover" ? "封面画面" : "过程画面"}
                          className="aspect-video w-full object-cover"
                        />
                      </div>
                    ))}
                  </section>
                ) : null}

                {selected.transcript !== null ? (
                  <details className="mb-4 rounded-md bg-muted/35 p-4 text-sm">
                    <summary className="cursor-pointer text-muted-foreground">视频文案</summary>
                    <p className="mt-3 whitespace-pre-wrap leading-7">{selected.transcript}</p>
                  </details>
                ) : null}

                {reportQuery.isLoading || isAnalyzingSelected ? (
                  <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isAnalyzingSelected ? "正在处理素材并生成诊断报告…" : "加载报告…"}
                  </div>
                ) : reportQuery.data?.ok ? (
                  <article className="rounded-md bg-background p-5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                      {reportQuery.data.markdown}
                    </ReactMarkdown>
                  </article>
                ) : (
                  <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
                    <FileText className="h-7 w-7 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {reportQuery.data?.error.message ?? selected.last_error ?? "尚未生成诊断报告"}
                    </p>
                    <Button
                      onClick={() => analyzeMut.mutate({ id: selected.id })}
                      disabled={isAnalyzingAny}
                    >
                      <Sparkles className="h-4 w-4" />
                      生成诊断
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加内容诊断</DialogTitle>
            <DialogDescription>
              粘贴抖音或小红书视频分享链接或整段分享文案，系统会先采集基础信息，再提取文案和画面素材生成诊断报告。
            </DialogDescription>
          </DialogHeader>
          <FormField
            label="抖音或小红书视频链接 / 分享文案"
            description="支持直接粘贴抖音或小红书视频链接，也支持整段分享文案。按 Enter 可直接提交。"
          >
            <Input
              value={shareUrl}
              onChange={(event) => setShareUrl(event.target.value)}
              placeholder="粘贴抖音或小红书视频链接"
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
              disabled={isBusy}
              autoFocus
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={isBusy}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={submit}
              disabled={isBusy || shareUrl.trim().length === 0}
            >
              {createMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              开始诊断
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
