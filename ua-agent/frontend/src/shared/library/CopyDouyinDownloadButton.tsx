import type { MaterialEntry } from "@/shared/contracts/library";
import { Check, Copy, Download, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { iconHints } from "@/shared/library/iconHints";
import { Button } from "@/shared/ui/button";
import { HoverHint } from "@/shared/ui/hover-hint";

type Status = "idle" | "loading" | "copied" | "failed";

interface CopyDouyinDownloadButtonProps {
  entry: MaterialEntry;
  testIdPrefix: string;
}

const TRANSIENT_MS = 1500;

export function CopyDouyinDownloadButton({
  entry,
  testIdPrefix,
}: CopyDouyinDownloadButtonProps): JSX.Element | null {
  const [status, setStatus] = useState<Status>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  if (entry.platform !== "douyin" || entry.note_type !== "video") return null;

  const scheduleReset = (): void => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), TRANSIENT_MS);
  };

  const handleClick = async (): Promise<void> => {
    setStatus("loading");
    try {
      const result = await window.api.douyinVideo.resolve({ share_url: entry.share_url });
      if (!result.ok) {
        setStatus("failed");
        scheduleReset();
        return;
      }
      await navigator.clipboard.writeText(result.download_url);
      setStatus("copied");
      scheduleReset();
    } catch {
      setStatus("failed");
      scheduleReset();
    }
  };

  let hint;
  let Icon = Download;
  if (status === "loading") {
    hint = iconHints.copyDownloadLoading;
    Icon = Copy;
  } else if (status === "copied") {
    hint = iconHints.copyDownloadDone;
    Icon = Check;
  } else if (status === "failed") {
    hint = iconHints.copyDownloadFailed;
    Icon = X;
  } else {
    hint = iconHints.copyDownload;
  }

  return (
    <HoverHint
      label={hint.label}
      sublabel={"sublabel" in hint ? hint.sublabel : undefined}
    >
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={() => {
          void handleClick();
        }}
        disabled={status === "loading"}
        aria-label={hint.label}
        data-testid={`${testIdPrefix}-copy-download-${entry.post_id}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </Button>
    </HoverHint>
  );
}
