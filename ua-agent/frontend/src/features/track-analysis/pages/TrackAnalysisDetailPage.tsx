import { ArrowLeft, CalendarDays, FileText, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { useNavigate, useParams } from "react-router-dom";
import remarkGfm from "remark-gfm";

import {
  trackAnalysisGetReportResultSchema,
  type TrackAnalysisDocument,
  type TrackAnalysisStoryDetail,
} from "@/shared/contracts/track-analysis";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-8 text-2xl font-semibold leading-snug first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-7 text-xl font-semibold leading-snug">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-5 text-lg font-semibold leading-snug">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 text-sm leading-7 text-muted-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm leading-7 text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1.5 pl-5 text-sm leading-7 text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-foreground/70 pl-4 text-sm text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.startsWith("language-") ?? false;
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-lg bg-muted p-4 font-mono text-xs leading-7 text-muted-foreground">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="mb-4">{children}</pre>,
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-border px-3 py-2 text-left">{children}</th>,
  td: ({ children }) => (
    <td className="border-b border-border/60 px-3 py-2 text-muted-foreground">{children}</td>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-foreground underline underline-offset-4"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img src={src} alt={alt ?? ""} className="my-4 max-w-full rounded-lg border border-border" />
  ),
};

type ReportTab = {
  value: string;
  label: string;
  title: string;
  content: string;
};

const documentTabConfig: Array<{
  key: keyof TrackAnalysisStoryDetail["documents"];
  label: string;
}> = [
  { key: "business_case", label: "商业案例" },
  { key: "market_research", label: "市场调研" },
  { key: "business_model", label: "商业模式" },
  { key: "ai_business_upgrade", label: "AI商业升级" },
  { key: "how_to_do", label: "怎么做" },
];

function missingApiResult(message: string) {
  return {
    schema_version: "1" as const,
    ok: false as const,
    error: { code: "INTERNAL" as const, message },
  };
}

function hasMarkdown(document: TrackAnalysisDocument | null): document is TrackAnalysisDocument {
  return typeof document?.markdown_content === "string" && document.markdown_content.trim().length > 0;
}

function buildReportTabs(detail: TrackAnalysisStoryDetail): ReportTab[] {
  const tabs: ReportTab[] = [];

  if (detail.summary_markdown.trim().length > 0) {
    tabs.push({
      value: "summary",
      label: "摘要",
      title: "摘要",
      content: detail.summary_markdown,
    });
  }

  for (const config of documentTabConfig) {
    if (config.key === "how_to_do" && detail.type !== "project") continue;
    const document = detail.documents[config.key];
    if (!hasMarkdown(document)) continue;
    tabs.push({
      value: config.key,
      label: config.label,
      title: document.title || config.label,
      content: document.markdown_content,
    });
  }

  if (tabs.length === 0 && detail.summary.trim().length > 0) {
    tabs.push({
      value: "summary",
      label: "摘要",
      title: "摘要",
      content: detail.summary,
    });
  }

  return tabs;
}

function DetailSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <Skeleton className="h-11 w-full max-w-3xl" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

export function TrackAnalysisDetailPage(): JSX.Element {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<TrackAnalysisStoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!id) {
      setError("缺少报告 ID");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const raw =
        window.api?.trackAnalysis?.getReport === undefined
          ? missingApiResult("preload 未注入 trackAnalysis.getReport 接口")
          : await window.api.trackAnalysis.getReport({ id });
      const parsed = trackAnalysisGetReportResultSchema.safeParse(raw);
      if (!parsed.success) {
        setError("track-analysis:get-report 响应未通过 Zod 校验");
        setDetail(null);
        return;
      }
      if (!parsed.data.ok) {
        setError(parsed.data.error.message);
        setDetail(null);
        return;
      }
      setDetail(parsed.data.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const tabs = useMemo(() => (detail ? buildReportTabs(detail) : []), [detail]);
  const defaultTab = tabs[0]?.value ?? "empty";

  return (
    <div
      className="app-shell-page h-full max-w-[1440px] overflow-hidden bg-muted/30"
      data-testid="track-analysis-detail-page"
    >
      <header className="page-header shrink-0">
        <div className="min-w-0">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="-ml-2 mb-3"
            onClick={() => navigate("/track-analysis/track")}
          >
            <ArrowLeft className="h-4 w-4" />
            返回赛道分析
          </Button>
          <h1 className="page-title truncate">{detail?.title ?? "赛道分析报告"}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {detail?.industry ? <Badge variant="secondary">{detail.industry}</Badge> : null}
            {detail?.published_at_text ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {detail.published_at_text}
              </span>
            ) : null}
            {detail?.read_time_text ? <span>{detail.read_time_text}</span> : null}
          </div>
          {detail?.tags.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {detail.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">
        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <div className="surface-card flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl p-8 text-center text-sm text-muted-foreground">
            <p>报告加载失败：{error}</p>
            <Button size="sm" variant="outline" onClick={() => void loadDetail()}>
              <RefreshCcw className="h-4 w-4" />
              重试
            </Button>
          </div>
        ) : detail && tabs.length > 0 ? (
          <Tabs defaultValue={defaultTab} className="flex h-full min-w-0 flex-col overflow-hidden">
            <div className="shrink-0 overflow-x-auto pb-2">
              <TabsList className="justify-start">
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="min-h-0 flex-1 overflow-y-auto pr-1"
              >
                <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h2 className="mb-5 text-xl font-semibold leading-7">{tab.title}</h2>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {tab.content}
                  </ReactMarkdown>
                </article>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="surface-card flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl p-8 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8" />
            <p>暂无详情内容</p>
          </div>
        )}
      </main>
    </div>
  );
}
