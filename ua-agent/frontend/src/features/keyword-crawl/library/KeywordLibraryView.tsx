import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { useInfiniteScrollSentinel } from "@/shared/library/useInfiniteScrollSentinel";
import { useLibraryDelete } from "@/shared/library/useLibraryDelete";
import { useLibraryListInfinite } from "@/shared/library/useLibraryList";
import { libraryStrings as strings } from "@/shared/library/strings";
import { parseManualCaptureUrl } from "@/shared/contracts/manual-capture";
import type { Platform } from "@/shared/types/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

import { KeywordMaterialRow } from "./KeywordMaterialRow";
import { useManualCaptureEventStream } from "./useManualCaptureEventStream";
import { useManualCaptureStart } from "./useManualCaptureStart";
import { useManualCaptureStatus } from "./useManualCaptureStatus";

const KEYWORD_PREFIX = "web:keyword:";
const MANUAL_PREFIX = "web:manual:";

const SKELETON_HEIGHTS = ["h-40", "h-56", "h-44", "h-48", "h-36", "h-52"] as const;

type PlatformFilter = "all" | Platform;

const PLATFORM_FILTER_STORAGE_KEY = "keyword-library:platform-filter";

function readStoredPlatformFilter(): PlatformFilter {
  if (typeof window === "undefined") return "all";
  try {
    const raw = window.localStorage.getItem(PLATFORM_FILTER_STORAGE_KEY);
    if (raw === "xiaohongshu" || raw === "douyin" || raw === "all") return raw;
  } catch {
    /* localStorage unavailable — fall through */
  }
  return "all";
}

const PLATFORM_OPTIONS: { value: PlatformFilter; label: string; testId: string }[] = [
  { value: "all", label: "全部", testId: "keyword-library-platform-all" },
  { value: "xiaohongshu", label: "小红书", testId: "keyword-library-platform-xhs" },
  { value: "douyin", label: "抖音", testId: "keyword-library-platform-douyin" },
];

export function KeywordLibraryView(): JSX.Element {
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>(() =>
    readStoredPlatformFilter(),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(PLATFORM_FILTER_STORAGE_KEY, platformFilter);
    } catch {
      /* persistence is best-effort */
    }
  }, [platformFilter]);

  const query = useLibraryListInfinite({
    from: null,
    to: null,
    author: null,
    platform: platformFilter === "all" ? null : platformFilter,
  });
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = query;

  const sentinelRef = useInfiniteScrollSentinel({
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    fetchNextPage,
  });

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const deleteMutation = useLibraryDelete();
  const manualStart = useManualCaptureStart();
  const manualStatus = useManualCaptureStatus();
  const { task: manualTask, isRunning: manualRunning } = useManualCaptureEventStream(
    manualStatus.task,
  );

  const firstPage = data?.pages[0];
  const allEntries = useMemo(
    () => data?.pages.flatMap((p) => (p.ok ? p.entries : [])) ?? [],
    [data],
  );
  const entries = useMemo(
    () =>
      allEntries.filter(
        (e) =>
          e.captured_by_device.startsWith(KEYWORD_PREFIX) ||
          e.captured_by_device.startsWith(MANUAL_PREFIX),
      ),
    [allEntries],
  );

  async function handleSubmitManualCapture(): Promise<void> {
    const parsed = parseManualCaptureUrl(urlInput);
    if (!parsed.ok) {
      toast.error(parsed.message);
      return;
    }
    const result = await manualStart.mutateAsync({ url: urlInput.trim() });
    if (result.ok) {
      setDialogOpen(false);
      setUrlInput("");
    }
  }

  const platformSwitcher = (
    <div
      className="inline-flex items-center rounded-md border border-border bg-card p-0.5"
      data-testid="keyword-library-platform-switcher"
      role="group"
      aria-label="平台筛选"
    >
      {PLATFORM_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          type="button"
          size="sm"
          variant={platformFilter === opt.value ? "secondary" : "ghost"}
          className={cn(
            "h-7 px-2 text-xs",
            platformFilter === opt.value && "shadow-sm",
          )}
          onClick={() => setPlatformFilter(opt.value)}
          aria-pressed={platformFilter === opt.value}
          data-testid={opt.testId}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );

  if (isLoading || data === undefined) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-end">{platformSwitcher}</div>
        <div className="flex flex-col gap-2">
          {SKELETON_HEIGHTS.map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (firstPage !== undefined && !firstPage.ok) {
    return (
      <div
        role="alert"
        className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
      >
        {firstPage.error.message}
      </div>
    );
  }

  if (entries.length === 0 && !hasNextPage) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-end">{platformSwitcher}</div>
        <div
          className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground"
          data-testid="keyword-library-empty"
        >
          {platformFilter === "all" ? (
            <>
              还没有通过关键词采集到的素材。打开{" "}
              <Link to="/web-collection/douyin" className="text-foreground underline underline-offset-2">
                抖音采集
              </Link>{" "}
              或{" "}
              <Link
                to="/web-collection/xiaohongshu"
                className="text-foreground underline underline-offset-2"
              >
                小红书采集
              </Link>{" "}
              配置关键词并开始采集。
            </>
          ) : (
            <>当前筛选下没有素材。</>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="sticky top-0 z-10 -mx-6 flex items-center justify-between border-b border-border bg-background/95 px-6 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        data-testid="keyword-library-toolbar"
      >
        {platformSwitcher}
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground">
            {entries.length} 条素材{hasNextPage ? "，下拉加载更多" : ""}
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setDialogOpen(true)}
            disabled={manualRunning}
            data-testid="keyword-library-manual-capture-trigger"
            aria-label="添加链接采集"
            title="添加链接采集"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div
        className="overflow-hidden rounded-md border border-border bg-card"
        data-testid="keyword-library-list"
      >
        {entries.map((entry) => (
          <KeywordMaterialRow
            key={entry.post_id}
            entry={entry}
            onDelete={(postId) => setPendingDelete(postId)}
          />
        ))}
      </div>
      <div ref={sentinelRef} aria-hidden="true" className="h-8 w-full" />
      {isFetchingNextPage ? (
        <div className="flex flex-col gap-2">
          {SKELETON_HEIGHTS.slice(0, 3).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : null}
      {!hasNextPage && entries.length > 0 ? (
        <div className="py-4 text-center text-xs text-muted-foreground">已全部加载</div>
      ) : null}
      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{strings.confirmDeleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{strings.confirmDeleteBody}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{strings.confirmDeleteCancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  deleteMutation.mutate({ postId: pendingDelete });
                }
                setPendingDelete(null);
              }}
            >
              {strings.confirmDeleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>手动添加链接采集</DialogTitle>
            <DialogDescription>
              支持直接粘贴分享链接或整段分享文案；抖音支持作品直链、`modal_id` 链接和 `v.douyin.com` 分享短链。
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="粘贴分享链接或整段分享文案"
              autoFocus
              data-testid="keyword-library-manual-capture-input"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button
              type="button"
              onClick={() => void handleSubmitManualCapture()}
              disabled={manualStart.isPending || urlInput.trim().length === 0}
              data-testid="keyword-library-manual-capture-submit"
            >
              开始采集
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
