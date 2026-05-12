import { Minus, Square, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";

interface WindowControlsProps {
  className?: string;
}

export function WindowControls({ className }: WindowControlsProps): JSX.Element {
  return (
    <div className={cn("app-no-drag flex h-full items-center", className)}>
      <button
        type="button"
        aria-label="最小化"
        onClick={() => window.api.window.minimize()}
        className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <Minus className="size-4" />
      </button>
      <button
        type="button"
        aria-label="最大化"
        onClick={() => window.api.window.maximize()}
        className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        <Square className="size-3.5" />
      </button>
      <button
        type="button"
        aria-label="关闭"
        onClick={() => window.api.window.close()}
        className="flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-red-500 hover:text-white"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
