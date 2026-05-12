import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { AlertCircle, BookOpen, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useLocation } from "react-router-dom";
import remarkGfm from "remark-gfm";

import { groupedFiles } from "./guideStructure";
import { useGuideFiles } from "./useGuideFiles";

const mdComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1 className="mb-2 text-3xl font-semibold tracking-tight text-foreground" {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mt-9 border-t border-border pt-7 text-xl font-semibold tracking-tight text-foreground" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-7 text-base font-semibold text-foreground" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="text-[15px] leading-8 text-foreground/90" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="list-disc space-y-2 pl-5 text-[15px] leading-8 text-foreground/90" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="list-decimal space-y-2 pl-5 text-[15px] leading-8 text-foreground/90" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-6 border-l-4 border-border bg-muted/35 py-3 pl-4 text-[15px] leading-8 text-muted-foreground"
      {...props}
    />
  ),
  table: (props: ComponentProps<"table">) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentProps<"th">) => (
    <th className="border border-border bg-muted px-3 py-2 text-left font-medium" {...props} />
  ),
  td: (props: ComponentProps<"td">) => (
    <td className="border border-border px-3 py-2 align-top" {...props} />
  ),
  code: (props: ComponentProps<"code">) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-[0.9em]" {...props} />
  ),
  a: (props: ComponentProps<"a">) => (
    <a className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground" {...props} />
  ),
} as const;

export function SelfMediaGuide(): JSX.Element {
  const location = useLocation();
  const { result, isLoading } = useGuideFiles();
  const files = result?.ok ? result.files : [];
  const [activeId, setActiveId] = useState<string | null>(null);
  const groups = useMemo(() => groupedFiles(files), [files]);
  const chapterSlug = location.pathname.startsWith("/self-media-guide/")
    ? decodeURIComponent(location.pathname.slice("/self-media-guide/".length)).split("/")[0] || null
    : null;
  const selectedGroup = chapterSlug === null ? null : groups.find((group) => group.slug === chapterSlug) ?? null;
  const visibleGroups = selectedGroup === null ? groups : [selectedGroup];
  const visibleFiles = visibleGroups.flatMap((group) => group.files);

  useEffect(() => {
    if (visibleFiles.length === 0) {
      setActiveId(null);
      return;
    }
    if (activeId === null || visibleFiles.every((file) => file.id !== activeId)) {
      setActiveId(visibleFiles[0]?.id ?? null);
    }
  }, [activeId, visibleFiles]);

  const activeFile = visibleFiles.find((file) => file.id === activeId) ?? visibleFiles[0] ?? null;

  return (
    <div
      className="mx-auto flex h-full min-h-0 w-full max-w-[1500px] flex-col gap-4 overflow-hidden bg-muted/30 p-6"
      data-testid="self-media-guide-screen"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold">百万粉博主流量实战</h1>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center rounded-md bg-card text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          正在加载文档
        </div>
      ) : result?.ok !== true ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-md bg-card p-8 text-center">
          <AlertCircle className="h-7 w-7 text-destructive" />
          <p className="text-base font-medium">文档加载失败</p>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {result?.error.message ?? "未知错误"}
          </p>
        </div>
      ) : visibleFiles.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-card p-8 text-center">
          <BookOpen className="h-7 w-7 text-muted-foreground" />
          <p className="text-base font-medium">
            {selectedGroup === null ? "目录下暂无 Markdown 文档" : "该大章节下暂无 Markdown 文档"}
          </p>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-md border border-border/60 bg-card shadow-sm">
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">目录</h2>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {visibleGroups.map((group) => (
                <section key={group.id} className="mb-5 last:mb-0">
                  <div className="mb-2 px-2">
                    <h3 className="min-w-0 truncate text-sm font-semibold text-foreground">{group.title}</h3>
                  </div>
                  <div className="space-y-0.5 border-l border-border/70 pl-2">
                    {group.files.map((file) => {
                      const isActive = activeFile?.id === file.id;
                      return (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => setActiveId(file.id)}
                          className={[
                            "group relative flex w-full items-start gap-2 rounded-md px-2 py-2 text-left transition",
                            "before:absolute before:top-1/2 before:-left-2 before:h-px before:w-2 before:bg-border/70 before:content-['']",
                            isActive
                              ? "bg-muted text-foreground before:bg-border"
                              : "text-foreground/80 hover:bg-muted hover:text-foreground",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "mt-0.5 flex h-5 w-7 shrink-0 items-center justify-center rounded text-[11px] font-medium",
                              isActive ? "bg-background text-foreground" : "bg-muted text-muted-foreground",
                            ].join(" ")}
                          >
                            {file.numberLabel}
                          </span>
                          <span className="min-w-0 flex-1 text-sm leading-5">
                            <span className="block break-words">{file.displayTitle}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </nav>
          </aside>

          <main className="flex min-h-0 flex-col overflow-hidden rounded-md bg-card shadow-sm">
            {activeFile !== null ? (
              <>
                <div className="flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{activeFile.title}</h2>
                  </div>
                </div>
                <article className="flex-1 overflow-y-auto px-6 py-6 md:px-10">
                  <div className="mx-auto flex max-w-4xl flex-col gap-5">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                      {activeFile.markdown}
                    </ReactMarkdown>
                  </div>
                </article>
              </>
            ) : null}
          </main>
        </div>
      )}
    </div>
  );
}
