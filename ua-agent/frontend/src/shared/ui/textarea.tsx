import * as React from "react";

import { cn } from "@/shared/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[112px] w-full rounded-lg border border-input/90 bg-background px-3.5 py-3 text-sm leading-7 text-foreground shadow-xs transition-[border-color,box-shadow,background-color] outline-none",
          "placeholder:text-muted-foreground/90 hover:border-border focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15",
          "disabled:cursor-not-allowed disabled:opacity-55",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
