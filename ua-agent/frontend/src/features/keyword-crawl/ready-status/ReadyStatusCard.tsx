import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  Loader2,
  MoreVertical,
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { Prereqs } from "@/shared/contracts/keyword/session-status";

import { ResetSessionDialog } from "./ResetSessionDialog";
import { useInstallBrowser } from "./useInstallBrowser";
import { useReadyStatus } from "./useReadyStatus";
import { useStartSession } from "./useStartSession";

type RowState = "ok" | "fail" | "unknown" | "loading";

interface RowDescriptor {
  label: string;
  state: RowState;
  message: string;
  action?: { label: string; onClick: () => void; loading: boolean } | null;
}

function StatusIcon({ state }: { state: RowState }): JSX.Element {
  switch (state) {
    case "ok":
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-label="已就绪" />;
    case "fail":
      return <CircleAlert className="h-5 w-5 text-red-600" aria-label="未就绪" />;
    case "loading":
      return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="加载中" />;
    case "unknown":
    default:
      return <Circle className="h-5 w-5 text-muted-foreground/70" aria-label="未知" />;
  }
}

function rowsFromPrereqs(
  prereqs: Prereqs,
  install: ReturnType<typeof useInstallBrowser>,
  start: ReturnType<typeof useStartSession>,
): RowDescriptor[] {
  const browserState: RowState = prereqs.browser_installed ? "ok" : "fail";
  const sessionState: RowState = prereqs.session_running ? "ok" : "fail";
  let reachState: RowState;
  switch (prereqs.douyin_reachable) {
    case "reachable":
      reachState = "ok";
      break;
    case "blocked_by_anti_bot":
    case "unreachable":
      reachState = "fail";
      break;
    default:
      reachState = "unknown";
  }

  return [
    {
      label: "浏览器",
      state: browserState,
      message: prereqs.browser_installed ? "已安装" : "未安装 — 请安装浏览器",
      action: prereqs.browser_installed
        ? null
        : {
            label: "安装浏览器",
            onClick: () => install.mutate(),
            loading: install.isPending,
          },
    },
    {
      label: "会话",
      state: prereqs.browser_installed ? sessionState : "unknown",
      message: prereqs.session_running ? "运行中" : "未启动",
      action:
        prereqs.browser_installed && !prereqs.session_running
          ? {
              label: "启动会话",
              onClick: () => start.mutate(),
              loading: start.isPending,
            }
          : null,
    },
    {
      label: "抖音可达性",
      state: reachState,
      message:
        prereqs.douyin_reachable === "reachable"
          ? "可达"
          : prereqs.douyin_reachable === "blocked_by_anti_bot"
            ? "可能被反爬阻断"
            : prereqs.douyin_reachable === "unreachable"
              ? "无法访问"
              : "未知（首次采集后回填）",
      action: null,
    },
  ];
}

export function ReadyStatusCard(): JSX.Element {
  const { prereqs } = useReadyStatus();
  const install = useInstallBrowser();
  const start = useStartSession();
  const [resetOpen, setResetOpen] = useState(false);

  const rows = rowsFromPrereqs(
    prereqs ?? {
      browser_installed: false,
      session_running: false,
      douyin_reachable: "unknown",
      signed_in: "unknown",
    },
    install,
    start,
  );

  return (
    <Card data-testid="ready-status-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">就绪状态</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="更多操作">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setResetOpen(true)}>清除登录态</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                void window.api.keyword.openLogsDir();
              }}
            >
              打开日志目录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li
              key={row.label}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 px-3.5 py-3"
              data-testid={`ready-status-row-${row.label}`}
            >
              <StatusIcon state={row.state} />
              <div className="flex-1">
                <p className="text-sm font-medium">{row.label}</p>
                <p className="text-xs leading-6 text-muted-foreground">{row.message}</p>
              </div>
              {row.action !== null && row.action !== undefined ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={row.action.onClick}
                  disabled={row.action.loading}
                >
                  {row.action.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : row.action.label}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </CardContent>
      <ResetSessionDialog open={resetOpen} onOpenChange={setResetOpen} />
    </Card>
  );
}
