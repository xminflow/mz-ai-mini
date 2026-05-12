import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

interface HoverHintProps {
  /** Main, bold first line. */
  label: string;
  /** Optional gray sub-line giving the "why" behind the icon. */
  sublabel?: string | undefined;
  /** Trigger element. Must be a single forwardRef-capable child. */
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

/**
 * Friendly hover hint used across the material-library views: shows a bold
 * label plus an optional gray explainer beneath. Built on Radix Tooltip.
 *
 * The TooltipProvider must be mounted higher in the tree (App root).
 */
export function HoverHint({
  label,
  sublabel,
  children,
  side = "top",
  align = "center",
}: HoverHintProps): JSX.Element {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} align={align} className="max-w-xs leading-snug">
        <div className="font-medium">{label}</div>
        {sublabel ? (
          <div className="mt-0.5 text-xs opacity-70">{sublabel}</div>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}
