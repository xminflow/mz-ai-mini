import { useMemo, useState, type ComponentProps } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Image,
  Loader2,
  RefreshCw,
  Sparkles,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import type { Blogger, BloggerStatus, BloggerVideoSample } from "@/shared/contracts/blogger";
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
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

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
import {
  useBloggerAnalyze,
  useBloggerCaptureProfile,
  useBloggerDelete,
  useBloggerDeleteSample,
  useBloggerSampleVideos,
  useBloggersList,
} from "../hooks/useBloggers";
import { useBloggerReport } from "../hooks/useBloggerReport";
import { useBloggerSamples } from "../hooks/useBloggerSamples";
import { parseBloggerReport } from "../reportMarkdown";
import { bloggerStrings } from "../strings";
import { describeBloggerSampleFailure } from "@/shared/blogger/sampleFailure";
import {
  bloggerAnalyzeTaskKey,
  bloggerProfileTaskKey,
  bloggerSampleTaskKey,
  useGlobalTaskCenterStore,
} from "@/shared/tasks/store";

const mdComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1 className="text-2xl font-semibold tracking-tight text-foreground" {...props} />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2 className="mt-9 text-xl font-semibold tracking-tight text-foreground" {...props} />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3 className="mt-7 text-base font-semibold text-foreground" {...props} />
  ),
  p: (props: ComponentProps<"p">) => (
    <p className="text-[15px] leading-8 text-foreground/90" {...props} />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul className="list-disc space-y-3 pl-5 text-[15px] leading-7 text-foreground/90" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="list-decimal space-y-3 pl-5 text-[15px] leading-7 text-foreground/90" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-6 border-l-4 border-border pl-4 text-base italic leading-8 text-muted-foreground"
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
} as const;

const statusLabel: Record<BloggerStatus, string> = {
  pending: bloggerStrings.pendingBadge,
  profile_ready: "资料已采集",
  sampled: "已采样",
  error: bloggerStrings.errorBadge,
};

const detailToolbarClass = "flex flex-wrap items-center justify-end gap-1";
const detailActionBaseClass =
  "h-8 cursor-pointer rounded-md border border-transparent bg-transparent px-2.5 text-[13px] shadow-none transition-colors";
const detailSecondaryActionClass = `${detailActionBaseClass} font-medium text-muted-foreground hover:border-border/70 hover:bg-muted/60 hover:text-foreground`;
const detailDangerActionClass = `${detailActionBaseClass} font-medium text-muted-foreground hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive`;
const detailPrimaryActionClass =
  `${detailActionBaseClass} border-border/70 bg-background font-medium text-foreground hover:border-border hover:bg-muted/60`;

function formatCount(n: number | null): string {
  if (n === null) return bloggerStrings.unknown;
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}亿`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)}万`;
  return String(n);
}

function formatDateTime(iso: string | null): string {
  if (iso === null) return bloggerStrings.unknown;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function frameSrc(relative: string): string {
  return `userdata://${relative.replace(/^\/+/, "")}`;
}

function platformLabel(platform: Blogger["platform"]): string {
  return platform === "douyin" ? "抖音" : "小红书";
}

function statusVariant(status: BloggerStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "error") return "destructive";
  if (status === "sampled") return "secondary";
  if (status === "profile_ready") return "default";
  return "outline";
}

export function BloggerReportPage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const bloggerId = params.id ?? null;
  const { bloggers, isLoading: isBloggersLoading } = useBloggersList();
  const { report, isLoading: isReportLoading } = useBloggerReport(bloggerId);
  const captureMut = useBloggerCaptureProfile();
  const analyzeMut = useBloggerAnalyze();
  const deleteMut = useBloggerDelete();
  const deleteSampleMut = useBloggerDeleteSample();
  const supplementMut = useBloggerSampleVideos();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [supplementOpen, setSupplementOpen] = useState(false);
  const [supplementCount, setSupplementCount] = useState("5");
  const isCapturing = useGlobalTaskCenterStore(
    (state) => (bloggerId !== null ? state.tasks[bloggerProfileTaskKey(bloggerId)] !== undefined : false),
  );
  const isSampling = useGlobalTaskCenterStore(
    (state) => (bloggerId !== null ? state.tasks[bloggerSampleTaskKey(bloggerId)] !== undefined : false),
  );
  const isAnalyzing = useGlobalTaskCenterStore(
    (state) => (bloggerId !== null ? state.tasks[bloggerAnalyzeTaskKey(bloggerId)] !== undefined : false),
  );

  const bloggerFromList = useMemo(
    () => bloggers.find((b) => b.id === bloggerId) ?? null,
    [bloggerId, bloggers],
  );
  const blogger = report?.ok ? report.blogger : bloggerFromList;
  const samplesEnabled = blogger?.status === "sampled";
  const {
    samples,
    isLoading: isSamplesLoading,
  } = useBloggerSamples(bloggerId, samplesEnabled);

  const parsedReport = report?.ok ? parseBloggerReport(report.markdown) : null;
  const hasReport = report?.ok === true;
  const isDeleting = deleteMut.isPending && deleteMut.variables?.id === bloggerId;
  const isSupplementing = supplementMut.isPending && supplementMut.variables?.id === bloggerId;
  const isDeletingSample =
    deleteSampleMut.isPending && deleteSampleMut.variables?.blogger_id === bloggerId;
  const isBusy =
    isCapturing || isSampling || isAnalyzing || isDeleting || isSupplementing || isDeletingSample;

  const onAnalyze = async (): Promise<void> => {
    if (bloggerId === null) return;
    await analyzeMut.mutateAsync({ id: bloggerId });
  };

  const onCapture = (): void => {
    if (bloggerId === null) return;
    captureMut.mutate({ id: bloggerId });
  };

  const onDelete = (): void => {
    if (bloggerId === null) return;
    deleteMut.mutate(
      { id: bloggerId },
      {
        onSuccess: (result) => {
          if (result.ok) {
            setDeleteOpen(false);
            navigate("/blogger-analysis/douyin");
          }
        },
      },
    );
  };

  const onSupplement = async (): Promise<void> => {
    if (bloggerId === null) return;
    const parsed = Number.parseInt(supplementCount, 10);
    const k = Number.isFinite(parsed) ? parsed : 5;
    const safeK = Math.max(1, Math.min(100, k));
    const sampleResult = await supplementMut.mutateAsync({
      id: bloggerId,
      k: safeK,
      append: true,
    });
    if (!sampleResult.ok) return;
    const addedCount = Math.max(0, sampleResult.samples.length - samples.length);
    setSupplementOpen(false);
    toast.success(bloggerStrings.toastSupplemented(addedCount));
    await analyzeMut.mutateAsync({ id: bloggerId });
  };

  const primaryAction = blogger === null
    ? null
    : blogger.status === "pending" || blogger.status === "error"
      ? {
          label: bloggerStrings.detailPrimaryCapture,
          onClick: onCapture,
          icon: UserRound,
        }
      : {
          label: blogger.status === "profile_ready"
            ? bloggerStrings.detailPrimaryAnalyze
            : hasReport
              ? bloggerStrings.detailPrimaryRegenerate
              : bloggerStrings.detailPrimaryContinue,
          onClick: onAnalyze,
          icon: hasReport ? RefreshCw : Sparkles,
        };

  const title = parsedReport?.title ?? blogger?.display_name ?? bloggerStrings.detailHeading;

  return (
    <div
      className="mx-auto flex h-full min-h-0 w-full max-w-[1600px] flex-col gap-4 overflow-hidden bg-muted/30 p-6"
      data-testid="blogger-detail-screen"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold">{title}</h1>
        </div>
        <div className={detailToolbarClass}>
          <Button
            variant="ghost"
            size="sm"
            className={detailSecondaryActionClass}
            onClick={() => navigate("/blogger-analysis/douyin")}
          >
            <ArrowLeft className="h-4 w-4" />
            {bloggerStrings.detailBack}
          </Button>
          {blogger !== null ? (
            <Button
              variant="ghost"
              size="sm"
              className={detailDangerActionClass}
              onClick={() => setDeleteOpen(true)}
              disabled={isBusy}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {bloggerStrings.delete}
            </Button>
          ) : null}
          {blogger !== null && blogger.status === "sampled" ? (
            <Button
              variant="ghost"
              size="sm"
              className={detailSecondaryActionClass}
              onClick={() => setSupplementOpen(true)}
              disabled={isBusy}
            >
              {isSupplementing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
              {bloggerStrings.detailSupplement}
            </Button>
          ) : null}
          {primaryAction !== null ? (
            <Button className={detailPrimaryActionClass} onClick={primaryAction.onClick} disabled={isBusy}>
              {isBusy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <primaryAction.icon className="h-4 w-4" />
              )}
              {isBusy
                ? isCapturing
                  ? bloggerStrings.capturingProfile
                  : isSampling
                    ? bloggerStrings.samplingVideos
                    : isSupplementing
                      ? bloggerStrings.detailSupplementSubmitting
                      : bloggerStrings.generatingReport
                : primaryAction.label}
            </Button>
          ) : null}
        </div>
      </header>

      {isBloggersLoading && blogger === null ? (
        <section className="flex min-h-40 shrink-0 items-center justify-center rounded-3xl bg-card text-sm text-muted-foreground shadow-sm">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          加载中…
        </section>
      ) : blogger === null ? (
        <section className="flex min-h-40 shrink-0 flex-col items-center justify-center gap-3 rounded-3xl bg-card text-center shadow-sm">
          <p className="text-base font-medium">该博主不存在或已被删除。</p>
          <Button variant="outline" onClick={() => navigate("/blogger-analysis/douyin")}>
            <ArrowLeft className="h-4 w-4" />
            {bloggerStrings.detailBack}
          </Button>
        </section>
      ) : (
        <>
          <BloggerResumeHeader blogger={blogger} samplesCount={samples.length} hasReport={hasReport} />

          <div className="grid min-h-0 flex-1 gap-4 overflow-hidden lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
            <section
              className="flex min-h-0 flex-col overflow-hidden rounded-3xl bg-card shadow-sm"
              data-testid="blogger-samples-panel"
            >
              <PanelTitle
                icon={Image}
                title={bloggerStrings.detailSamplesSection}
                detail={`${samples.length} 条`}
              />
              <BloggerSamplesList
                samples={samples}
                isLoading={isSamplesLoading}
                onDeleteSample={(videoUrl) => {
                  if (bloggerId === null) return;
                  deleteSampleMut.mutate({ blogger_id: bloggerId, video_url: videoUrl });
                }}
                deletingVideoUrl={isDeletingSample ? (deleteSampleMut.variables?.video_url ?? null) : null}
              />
            </section>

            <section
              className="flex min-h-0 flex-col overflow-hidden rounded-3xl bg-card shadow-sm"
              data-testid="blogger-report-panel"
            >
              <PanelTitle
                icon={FileText}
                title={bloggerStrings.detailReportSection}
                detail={report?.ok ? formatDateTime(report.generated_at) : ""}
              />
              <ReportBody
                report={report}
                isLoading={isReportLoading}
                parsedReport={parsedReport}
                onAnalyze={onAnalyze}
                isAnalyzing={isAnalyzing}
              />
            </section>
          </div>
        </>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{bloggerStrings.deleteConfirmTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {bloggerStrings.deleteConfirmBody(blogger?.display_name ?? null)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{bloggerStrings.cancelButton}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                onDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {bloggerStrings.confirmDeleteButton}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={supplementOpen} onOpenChange={setSupplementOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{bloggerStrings.detailSupplementTitle}</DialogTitle>
            <DialogDescription>{bloggerStrings.detailSupplementDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="supplement-count">
              {bloggerStrings.detailSupplementLabel}
            </label>
            <Input
              id="supplement-count"
              type="number"
              min={1}
              max={100}
              value={supplementCount}
              onChange={(event) => setSupplementCount(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">{bloggerStrings.detailSupplementHint}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSupplementOpen(false)}
              disabled={isSupplementing || isAnalyzing}
            >
              {bloggerStrings.cancelButton}
            </Button>
            <Button onClick={() => void onSupplement()} disabled={isSupplementing || isAnalyzing}>
              {isSupplementing || isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {isSupplementing || isAnalyzing
                ? bloggerStrings.detailSupplementSubmitting
                : bloggerStrings.detailSupplementConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BloggerResumeHeader({
  blogger,
  samplesCount,
  hasReport,
}: {
  blogger: Blogger;
  samplesCount: number;
  hasReport: boolean;
}): JSX.Element {
  const displayName = blogger.display_name ?? bloggerStrings.unknown;

  return (
    <section
      className="grid shrink-0 gap-5 rounded-3xl bg-card p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]"
      data-testid="blogger-detail-header"
    >
      <div className="flex min-w-0 gap-4">
        <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-muted">
          {blogger.avatar_url !== null ? (
            <img
              src={blogger.avatar_url}
              alt={displayName}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold">{displayName}</h2>
            <Badge variant={statusVariant(blogger.status)}>{statusLabel[blogger.status]}</Badge>
            {hasReport ? <Badge variant="secondary">{bloggerStrings.reportReadyBadge}</Badge> : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{platformLabel(blogger.platform)}</span>
            {blogger.douyin_id !== null ? (
              <span>
                {bloggerStrings.douyinIdPrefix} {blogger.douyin_id}
              </span>
            ) : null}
          </div>
          {blogger.signature !== null ? (
            <p className="mt-3 max-w-4xl whitespace-pre-wrap break-words text-sm leading-6 text-foreground/80">
              {blogger.signature}
            </p>
          ) : null}
          <a
            href={blogger.profile_url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{blogger.profile_url}</span>
          </a>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-2">
        <ResumeStat label={bloggerStrings.followLabel} value={formatCount(blogger.follow_count)} />
        <ResumeStat label={bloggerStrings.fansLabel} value={formatCount(blogger.fans_count)} />
        <ResumeStat label={bloggerStrings.likedLabel} value={formatCount(blogger.liked_count)} />
        <ResumeStat label="采样素材" value={`${samplesCount}`} />
        <ResumeMeta label="资料采集" value={formatDateTime(blogger.profile_captured_at)} />
        <ResumeMeta label="报告生成" value={formatDateTime(blogger.analysis_generated_at)} />
      </div>
    </section>
  );
}

function ResumeStat({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="rounded-2xl bg-muted/50 px-3 py-2 shadow-sm">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ResumeMeta({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-muted/50 px-3 py-2 shadow-sm">
      <CalendarClock className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function PanelTitle({
  icon: Icon,
  title,
  detail,
}: {
  icon: LucideIcon;
  title: string;
  detail: string;
}): JSX.Element {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between px-5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-muted shadow-sm">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </span>
        <h2 className="truncate text-sm font-semibold">{title}</h2>
      </div>
      {detail.length > 0 ? <span className="text-xs text-muted-foreground">{detail}</span> : null}
    </div>
  );
}

function BloggerSamplesList({
  samples,
  isLoading,
  onDeleteSample,
  deletingVideoUrl,
}: {
  samples: BloggerVideoSample[];
  isLoading: boolean;
  onDeleteSample: (videoUrl: string) => void;
  deletingVideoUrl: string | null;
}): JSX.Element {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-b-3xl bg-muted/20 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        加载中…
      </div>
    );
  }

  if (samples.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
        <Image className="h-6 w-6" />
        <p>{bloggerStrings.detailNoSamples}</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {samples.map((sample) => (
        <BloggerSampleRow
          key={`${sample.position}-${sample.video_url}`}
          sample={sample}
          onDeleteSample={onDeleteSample}
          isDeleting={deletingVideoUrl === sample.video_url}
        />
      ))}
    </ol>
  );
}

function BloggerSampleRow({
  sample,
  onDeleteSample,
  isDeleting,
}: {
  sample: BloggerVideoSample;
  onDeleteSample: (videoUrl: string) => void;
  isDeleting: boolean;
}): JSX.Element {
  const [copied, setCopied] = useState(false);
  const coverFrame = sample.frames[0] ?? null;
  const failure = describeBloggerSampleFailure(sample.analyze_error);

  async function copyVideoUrl(): Promise<void> {
    try {
      await navigator.clipboard.writeText(sample.video_url);
      setCopied(true);
      toast.success(bloggerStrings.copyOkLabel);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`复制失败：${message}`);
    }
  }

  return (
    <li className="rounded-2xl bg-muted/30 p-4 text-sm shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-muted">
          {coverFrame !== null ? (
            <img
              src={frameSrc(coverFrame)}
              alt="sample cover"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate text-sm font-medium">
              {sample.title ?? bloggerStrings.unknown}
            </h3>
            {sample.analyzed_at !== null && failure === null ? (
              <Badge variant="secondary">已分析</Badge>
            ) : failure !== null ? (
              <Badge variant="destructive">{bloggerStrings.sampleFailedBadge}</Badge>
            ) : (
              <Badge variant="outline">待分析</Badge>
            )}
          </div>
          <a
            href={sample.video_url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 block truncate text-xs text-muted-foreground hover:text-foreground hover:underline"
          >
            {sample.video_url}
          </a>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span>采样：{formatDateTime(sample.sampled_at)}</span>
            {sample.source_index !== null ? <span>原位次 #{sample.source_index + 1}</span> : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            title={bloggerStrings.openVideoLabel}
            aria-label={bloggerStrings.openVideoLabel}
            onClick={() => window.open(sample.video_url, "_blank", "noopener,noreferrer")}
            className="h-8 w-8"
            disabled={isDeleting}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={bloggerStrings.copyLinkLabel}
            aria-label={bloggerStrings.copyLinkLabel}
            onClick={() => void copyVideoUrl()}
            className="h-8 w-8"
            disabled={isDeleting}
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={bloggerStrings.deleteSampleLabel}
            aria-label={bloggerStrings.deleteSampleLabel}
            onClick={() => onDeleteSample(sample.video_url)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {sample.transcript !== null && sample.transcript.length > 0 ? (
        <details className="mt-3 rounded-2xl bg-background/80 p-3 text-xs shadow-sm">
          <summary className="cursor-pointer text-muted-foreground">文案</summary>
          <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-foreground/90">
            {sample.transcript}
          </p>
        </details>
      ) : null}

      {failure !== null ? (
        <p className="mt-3 rounded-2xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {failure.label}
          {failure.shouldSupplement ? `，${bloggerStrings.sampleFailedSupplementHint}` : ""}
        </p>
      ) : null}
    </li>
  );
}

function ReportBody({
  report,
  isLoading,
  parsedReport,
  onAnalyze,
  isAnalyzing,
}: {
  report: ReturnType<typeof useBloggerReport>["report"];
  isLoading: boolean;
  parsedReport: ReturnType<typeof parseBloggerReport> | null;
  onAnalyze: () => Promise<void>;
  isAnalyzing: boolean;
}): JSX.Element {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-b-3xl bg-white/35 text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        加载中…
      </div>
    );
  }

  if (report?.ok !== true) {
    const message =
      report?.error.code === "BLOGGER_REPORT_NOT_FOUND"
        ? bloggerStrings.detailNoReport
        : report?.error.message ?? bloggerStrings.detailNoReport;
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <FileText className="h-7 w-7 text-muted-foreground" />
        <p className="text-base font-medium">{message}</p>
        <Button onClick={() => void onAnalyze()} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isAnalyzing ? bloggerStrings.generatingReport : bloggerStrings.detailPrimaryAnalyze}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4 md:p-5">
      <article className="flex flex-col gap-6 rounded-3xl bg-card p-5 shadow-sm md:p-7">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
          {parsedReport?.articleMarkdown ?? report.markdown}
        </ReactMarkdown>
      </article>

      {parsedReport !== null && parsedReport.appendixSections.length > 0 ? (
        <div className="mt-4 rounded-3xl bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-medium">附录</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              证据、数据缺口和样本索引保留在这里，正文阅读不会被机器信息打断。
            </p>
          </div>
          <Tabs defaultValue={parsedReport.appendixSections[0]?.id ?? "appendix-0"}>
            <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
              {parsedReport.appendixSections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                className="rounded-full bg-muted px-4 py-2 text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {parsedReport.appendixSections.map((section) => (
              <TabsContent key={section.id} value={section.id} className="mt-6">
                <article className="flex flex-col gap-4 rounded-2xl bg-muted/40 p-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                    {section.markdown}
                  </ReactMarkdown>
                </article>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      ) : null}
    </div>
  );
}
