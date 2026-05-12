import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/shared/ui/button";

interface TranscriptPanelProps {
  text: string;
  transcribedAt: string | null;
  testIdPrefix: string;
}

const TRANSIENT_MS = 1500;

export function TranscriptPanel({
  text,
  transcribedAt,
  testIdPrefix,
}: TranscriptPanelProps): JSX.Element {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), TRANSIENT_MS);
    } catch {
      /* swallow — clipboard denied */
    }
  };

  return (
    <div
      className="rounded-md border border-border bg-muted/40 p-2"
      data-testid={`${testIdPrefix}-panel`}
    >
      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>视频文案{transcribedAt ? ` · ${formatStamp(transcribedAt)}` : ""}</span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 gap-1 px-1.5 text-xs"
          onClick={() => {
            void handleCopy();
          }}
          data-testid={`${testIdPrefix}-copy`}
          aria-label={copied ? "已复制" : "复制全文"}
          title={copied ? "已复制" : "复制全文"}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? "已复制" : "复制全文"}</span>
        </Button>
      </div>
      <div
        className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground"
        data-testid={`${testIdPrefix}-text`}
      >
        {text || <span className="text-muted-foreground">（空）</span>}
      </div>
    </div>
  );
}

function formatStamp(iso: string): string {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return iso;
  const diffMs = Date.now() - t;
  if (diffMs < 60_000) return "刚刚";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}
