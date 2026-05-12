import { CalendarDays, FileText, RefreshCcw, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  trackAnalysisListResultSchema,
  type TrackAnalysisStory,
} from "@/shared/contracts/track-analysis";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 300;

function missingApiResult(message: string) {
  return {
    schema_version: "1" as const,
    ok: false as const,
    error: { code: "INTERNAL" as const, message },
  };
}

function useDebouncedValue(value: string): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [value]);

  return debounced;
}

function ReportCard({
  story,
  onSelect,
}: {
  story: TrackAnalysisStory;
  onSelect: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-md"
    >
      <div className="grid aspect-[16/9] w-full place-items-center overflow-hidden bg-muted">
        {story.cover_image_url ? (
          <img
            src={story.cover_image_url}
            alt={story.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="h-7 w-7" />
            <span className="text-xs">AI 分析报告</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {story.industry ? <Badge variant="secondary">{story.industry}</Badge> : null}
          {story.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <h3 className="text-base font-semibold leading-6 text-foreground">{story.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {story.summary || "暂无摘要"}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {story.published_at_text ? (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {story.published_at_text}
            </span>
          ) : null}
          {story.read_time_text ? <span>{story.read_time_text}</span> : null}
        </div>
      </div>
    </button>
  );
}

function CardSkeletonGrid(): JSX.Element {
  return (
    <div className="columns-1 gap-4 md:columns-2 xl:columns-3 2xl:columns-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 break-inside-avoid rounded-xl border border-border bg-card p-4"
        >
          <Skeleton className="aspect-[16/9] w-full rounded-lg" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TrackAnalysisPage(): JSX.Element {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword);
  const [industry, setIndustry] = useState("");
  const [items, setItems] = useState<TrackAnalysisStory[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const loadList = useCallback(async () => {
    const seq = requestSeqRef.current + 1;
    requestSeqRef.current = seq;
    setListLoading(true);
    setListError(null);
    try {
      const raw =
        window.api?.trackAnalysis?.list === undefined
          ? missingApiResult("preload 未注入 trackAnalysis.list 接口")
          : await window.api.trackAnalysis.list({
              limit: PAGE_SIZE,
              industry,
              keyword: debouncedKeyword,
            });
      if (requestSeqRef.current !== seq) return;
      const parsed = trackAnalysisListResultSchema.safeParse(raw);
      if (!parsed.success) {
        setListError("track-analysis:list 响应未通过 Zod 校验");
        setItems([]);
        return;
      }
      if (!parsed.data.ok) {
        setListError(parsed.data.error.message);
        setItems([]);
        return;
      }
      setItems(parsed.data.items);
      setIndustries(parsed.data.available_industries);
    } catch (err) {
      if (requestSeqRef.current !== seq) return;
      setListError(err instanceof Error ? err.message : String(err));
      setItems([]);
    } finally {
      if (requestSeqRef.current === seq) setListLoading(false);
    }
  }, [debouncedKeyword, industry]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  return (
    <div
      className="app-shell-page h-full max-w-[1440px] overflow-hidden bg-muted/30"
      data-testid="track-analysis-page"
    >
      <header className="page-header shrink-0">
        <div>
          <h1 className="page-title">赛道分析</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            接入微域生光行业分析报告，按行业与关键词检索结构化案例。
          </p>
        </div>
      </header>

      <section className="shrink-0">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 xl:w-[360px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="搜索报告关键词"
              className="pl-9"
            />
          </div>
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
            <Button
              type="button"
              size="sm"
              variant={industry === "" ? "secondary" : "outline"}
              onClick={() => setIndustry("")}
            >
              全部
            </Button>
            {industries.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={industry === item ? "secondary" : "outline"}
                onClick={() => setIndustry((current) => (current === item ? "" : item))}
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <main className="min-h-0 flex-1 overflow-y-auto">
        {listLoading ? (
          <CardSkeletonGrid />
        ) : listError ? (
          <div className="surface-card flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl p-8 text-center text-sm text-muted-foreground">
            <p>加载失败：{listError}</p>
            <Button size="sm" variant="outline" onClick={() => void loadList()}>
              <RefreshCcw className="h-4 w-4" />
              重试
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="surface-card flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-xl p-8 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8" />
            <p>暂无符合条件的报告</p>
          </div>
        ) : (
          <div className="columns-1 gap-4 pb-2 md:columns-2 xl:columns-3 2xl:columns-4">
            {items.map((story) => (
              <ReportCard
                key={story.id}
                story={story}
                onSelect={() => navigate(`/track-analysis/track/${encodeURIComponent(story.id)}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
