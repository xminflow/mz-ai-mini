import { useState } from "react";
import { ExternalLink, Copy, Check, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import type { Blogger } from "@/shared/contracts/blogger";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

import { useBloggerSamples } from "../hooks/useBloggerSamples";
import { bloggerStrings } from "../strings";
import { describeBloggerSampleFailure } from "@/shared/blogger/sampleFailure";

interface Props {
  blogger: Blogger | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TRANSCRIPT_PREVIEW_CHARS = 200;

function frameSrc(relative: string): string {
  return `userdata://${relative.replace(/^\/+/, "")}`;
}

export function BloggerVideoSamplesDialog({ blogger, open, onOpenChange }: Props): JSX.Element {
  const id = blogger?.id ?? null;
  const { samples, isLoading } = useBloggerSamples(id, open);
  const [copiedPosition, setCopiedPosition] = useState<number | null>(null);
  const [expandedTranscripts, setExpandedTranscripts] = useState<Set<number>>(new Set());

  function toggleTranscript(position: number): void {
    setExpandedTranscripts((prev) => {
      const next = new Set(prev);
      if (next.has(position)) next.delete(position);
      else next.add(position);
      return next;
    });
  }

  async function copy(url: string, position: number): Promise<void> {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPosition(position);
      toast.success(bloggerStrings.copyOkLabel);
      window.setTimeout(() => setCopiedPosition(null), 1500);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(`复制失败：${message}`);
    }
  }

  const total = blogger?.total_works_at_sample ?? samples.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {bloggerStrings.samplesDialogTitle(blogger?.display_name ?? null, samples.length, total)}
          </DialogTitle>
          <DialogDescription>{blogger?.profile_url ?? ""}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">加载中…</p>
        ) : samples.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {bloggerStrings.samplesEmpty}
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {samples.map((s) => {
              const transcriptExpanded = expandedTranscripts.has(s.position);
              const transcriptText = s.transcript ?? "";
              const transcriptTruncated = transcriptText.length > TRANSCRIPT_PREVIEW_CHARS;
              const visibleTranscript = transcriptExpanded || !transcriptTruncated
                ? transcriptText
                : `${transcriptText.slice(0, TRANSCRIPT_PREVIEW_CHARS)}…`;
              const failure = describeBloggerSampleFailure(s.analyze_error);
              return (
                <li
                  key={s.position}
                  className="flex flex-col gap-2 rounded-md border border-border p-3 text-sm"
                  data-testid="blogger-sample-row"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 w-6 flex-shrink-0 text-right text-xs text-muted-foreground">
                      #{s.position + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="line-clamp-2">{s.title ?? bloggerStrings.unknown}</p>
                      <a
                        href={s.video_url}
                        className="mt-1 block truncate text-xs text-muted-foreground hover:underline"
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {s.video_url}
                      </a>
                    </div>
                    <div className="flex flex-shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title={bloggerStrings.openVideoLabel}
                        aria-label={bloggerStrings.openVideoLabel}
                        onClick={() => window.open(s.video_url, "_blank", "noopener,noreferrer")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title={bloggerStrings.copyLinkLabel}
                        aria-label={bloggerStrings.copyLinkLabel}
                        onClick={() => void copy(s.video_url, s.position)}
                      >
                        {copiedPosition === s.position ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {s.frames.length > 0 && (
                    <div className="ml-9 grid grid-cols-4 gap-1.5">
                      {s.frames.map((rel, idx) => (
                        <a
                          key={idx}
                          href={frameSrc(rel)}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="aspect-video overflow-hidden rounded border border-border bg-muted hover:opacity-80"
                        >
                          <img
                            src={frameSrc(rel)}
                            alt={`frame ${idx + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                  {transcriptText.length > 0 && (
                    <div className="ml-9 rounded-md bg-muted/50 p-2 text-xs leading-relaxed">
                      <button
                        type="button"
                        onClick={() => toggleTranscript(s.position)}
                        className="mb-1 flex items-center gap-1 text-muted-foreground hover:text-foreground"
                      >
                        {transcriptExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                        文案
                      </button>
                      <p className="whitespace-pre-wrap break-words">{visibleTranscript}</p>
                    </div>
                  )}
                  {failure !== null ? (
                    <p className="ml-9 rounded-md bg-destructive/10 px-2 py-1 text-xs text-destructive">
                      {failure.label}
                      {failure.shouldSupplement ? `，${bloggerStrings.sampleFailedSupplementHint}` : ""}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
