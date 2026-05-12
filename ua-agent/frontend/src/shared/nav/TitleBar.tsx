import { Bot } from "lucide-react";

import { GlobalTaskCenter } from "@/shared/tasks/GlobalTaskCenter";

import { WindowControls } from "./WindowControls";

export function TitleBar(): JSX.Element {
  return (
    <div className="app-drag flex h-9 shrink-0 items-center justify-between border-b border-border bg-sidebar text-sidebar-foreground">
      <div className="flex min-w-0 items-center gap-2 pl-3">
        <span className="grid size-5 shrink-0 place-items-center rounded bg-foreground text-background">
          <Bot className="size-3" />
        </span>
        <span className="truncate text-xs font-medium">AI运营获客</span>
      </div>
      <div className="flex items-center gap-1 pr-1">
        <GlobalTaskCenter />
        <WindowControls />
      </div>
    </div>
  );
}
