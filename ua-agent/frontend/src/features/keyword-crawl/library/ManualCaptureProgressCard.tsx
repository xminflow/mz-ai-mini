import type { ManualCaptureSnapshot } from "@/shared/contracts/manual-capture";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const PLATFORM_LABEL = {
  douyin: "抖音",
  xiaohongshu: "小红书",
} as const;

const PHASE_LABEL: Record<ManualCaptureSnapshot["current_phase"], string> = {
  validate: "校验链接",
  navigate: "打开页面",
  "open-detail": "打开详情",
  dwell: "页面稳定",
  read: "读取内容",
  record: "写入素材库",
  "close-detail": "关闭详情",
  done: "已完成",
};

const STOP_REASON_LABEL: Record<NonNullable<ManualCaptureSnapshot["stop_reason"]>, string> = {
  captured: "已采集",
  duplicate: "素材已存在",
  user: "已停止",
  "invalid-url": "链接无效",
  "unsupported-url": "链接暂不支持",
  "login-required": "需要登录",
  "capture-failed": "采集失败",
};

export function ManualCaptureProgressCard({
  task,
  onStop,
}: {
  task: ManualCaptureSnapshot | null;
  onStop?: (() => void) | undefined;
}): JSX.Element | null {
  if (task === null) return null;

  return (
    <Card data-testid="manual-capture-progress-card">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">手动链接采集</CardTitle>
          <Badge variant="outline">{PLATFORM_LABEL[task.platform]}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={task.status === "error" ? "destructive" : task.status === "running" ? "default" : "secondary"}>
            {task.status === "running"
              ? PHASE_LABEL[task.current_phase]
              : task.stop_reason !== null
                ? STOP_REASON_LABEL[task.stop_reason]
                : "已结束"}
          </Badge>
          {task.status === "running" && onStop !== undefined ? (
            <Button size="sm" variant="destructive" onClick={onStop}>
              停止
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="truncate text-sm text-muted-foreground" title={task.canonical_url}>
          {task.canonical_url}
        </p>
        <div className="grid grid-cols-4 gap-3 rounded-md bg-muted/40 p-3 dark:bg-muted/20">
          <div>
            <p className="text-xs text-muted-foreground">扫描</p>
            <p className="text-xl font-semibold">{task.scanned_count}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">采集</p>
            <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
              {task.captured_count}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">重复</p>
            <p className="text-xl font-semibold text-amber-600 dark:text-amber-400">
              {task.duplicate_count}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">错误</p>
            <p className="text-xl font-semibold text-red-600 dark:text-red-400">
              {task.error_count}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
