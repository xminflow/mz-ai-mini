import type { MaterialEntry } from "@/shared/contracts/library";
import { Check, Link2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { iconHints } from "@/shared/library/iconHints";
import { Button } from "@/shared/ui/button";
import { HoverHint } from "@/shared/ui/hover-hint";

type Status = "idle" | "copied" | "failed";

interface CopyShareUrlButtonProps {
  entry: MaterialEntry;
  testIdPrefix: string;
}

const TRANSIENT_MS = 1500;

export function CopyShareUrlButton({
  entry,
  testIdPrefix,
}: CopyShareUrlButtonProps): JSX.Element {
  const [status, setStatus] = useState<Status>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    },
    [],
  );

  const scheduleReset = (): void => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setStatus("idle"), TRANSIENT_MS);
  };

  const handleClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(entry.share_url);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    scheduleReset();
  };

  let hint;
  let Icon = Link2;
  if (status === "copied") {
    hint = iconHints.copyShareUrlDone;
    Icon = Check;
  } else if (status === "failed") {
    hint = iconHints.copyShareUrlFailed;
    Icon = X;
  } else {
    // For the idle state, show the actual URL as the sublabel so the user
    // can preview what they're about to copy.
    hint = { label: iconHints.copyShareUrl.label, sublabel: entry.share_url };
    Icon = Link2;
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
        aria-label={hint.label}
        data-testid={`${testIdPrefix}-copy-share-${entry.post_id}`}
      >
        <Icon className="h-3.5 w-3.5" />
      </Button>
    </HoverHint>
  );
}
