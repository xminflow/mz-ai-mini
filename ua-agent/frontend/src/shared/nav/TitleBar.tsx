import { Bot } from "lucide-react";

import { useAgentAuthState, useLogoutAgentAuth } from "@/features/agent-auth/hooks";
import { GlobalTaskCenter } from "@/shared/tasks/GlobalTaskCenter";
import { Button } from "@/shared/ui/button";

import { WindowControls } from "./WindowControls";

export function TitleBar(): JSX.Element {
  const authState = useAgentAuthState();
  const logout = useLogoutAgentAuth();
  const username = authState.data?.authenticated
    ? authState.data.account.email || authState.data.account.username
    : "";

  return (
    <div className="app-drag flex h-9 shrink-0 items-center justify-between border-b border-border bg-sidebar text-sidebar-foreground">
      <div className="flex min-w-0 items-center gap-2 pl-3">
        <span className="grid size-5 shrink-0 place-items-center rounded bg-foreground text-background">
          <Bot className="size-3" />
        </span>
        <span className="truncate text-xs font-medium">AI运营获客</span>
      </div>
      <div className="flex items-center gap-1 pr-1">
        {username ? (
          <div className="app-no-drag flex items-center gap-2 pr-2">
            <span className="max-w-40 truncate text-xs text-sidebar-foreground/80">{username}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              退出
            </Button>
          </div>
        ) : null}
        <GlobalTaskCenter />
        <WindowControls />
      </div>
    </div>
  );
}
