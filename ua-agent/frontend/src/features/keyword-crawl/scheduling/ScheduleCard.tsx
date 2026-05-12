import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { Platform } from "@/shared/contracts/capture";
import type { LastFireRecord } from "@/shared/contracts/scheduling";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";

import { useSettings, useUpdateSettings } from "../../settings/hooks/useSettings";

import { useSchedulerStatus } from "./useSchedulerStatus";

interface ScheduleCardProps {
  platform: Platform;
}

const PLATFORM_LABEL: Record<Platform, string> = {
  douyin: "抖音",
  xiaohongshu: "小红书",
};

export function ScheduleCard({ platform }: ScheduleCardProps): JSX.Element | null {
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: status } = useSchedulerStatus();
  const update = useUpdateSettings();

  const persisted = settings?.scheduling[platform];
  const [enabled, setEnabled] = useState<boolean>(persisted?.enabled ?? false);
  const [time, setTime] = useState<string>(persisted?.time ?? "09:00");

  useEffect(() => {
    if (persisted !== undefined) {
      setEnabled(persisted.enabled);
      setTime(persisted.time);
    }
  }, [persisted?.enabled, persisted?.time]);

  if (settingsLoading || persisted === undefined) {
    return null;
  }

  const dirty = enabled !== persisted.enabled || time !== persisted.time;
  const timeValid = /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

  const onSave = (): void => {
    if (!timeValid) return;
    const entry = { enabled, time };
    update.mutate({
      scheduling: platform === "douyin" ? { douyin: entry } : { xiaohongshu: entry },
    });
  };

  const nextRunIso = status?.nextRuns[platform] ?? null;
  const lastFire = status?.lastFires[platform] ?? null;
  const isQueued = status?.queue.includes(platform) ?? false;

  return (
    <Card data-testid={`schedule-card-${platform}`}>
      <CardHeader>
        <CardTitle className="text-lg">定时采集</CardTitle>
        <CardDescription>
          每天在指定时间自动启动一次{PLATFORM_LABEL[platform]}采集。仅在AI运营获客运行时执行；错过的时间不补跑。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={enabled}
            onCheckedChange={(v) => setEnabled(v === true)}
            data-testid={`schedule-enabled-${platform}`}
          />
          <span>启用每日定时采集</span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">执行时间（24 小时制，HH:MM）</span>
          <Input
            type="time"
            value={time}
            step={60}
            onChange={(e) => setTime(e.target.value)}
            disabled={!enabled}
            className="max-w-[160px]"
            data-testid={`schedule-time-${platform}`}
          />
          {!timeValid ? (
            <span className="text-xs text-red-600">请输入合法的 HH:MM 时间</span>
          ) : null}
        </label>

        <div className="flex flex-col gap-1 rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">
          <span>
            <span className="text-slate-500">下次运行：</span>
            {enabled ? formatNextRun(nextRunIso) : "未启用"}
          </span>
          <span>
            <span className="text-slate-500">上次结果：</span>
            {formatLastFire(lastFire)}
            {isQueued ? "（当前已排队，等待批次结束）" : ""}
          </span>
        </div>

        <div className="pt-1">
          <Button onClick={onSave} disabled={!dirty || !timeValid || update.isPending}>
            {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            保存
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function formatNextRun(iso: string | null): string {
  if (iso === null) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const today = new Date();
  const sameDay =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  const hhmm = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  return sameDay ? `今日 ${hhmm}` : `明日 ${hhmm}`;
}

function formatLastFire(record: LastFireRecord | null): string {
  if (record === null) return "—";
  const date = new Date(record.at);
  const hhmm = Number.isNaN(date.getTime())
    ? ""
    : ` (${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())})`;
  switch (record.outcome) {
    case "ok":
      return `✓ 已启动${hhmm}`;
    case "skip:busy":
      return `跳过：批次进行中${hhmm}`;
    case "skip:session_not_ready":
      return `跳过：浏览器会话未就绪${hhmm}`;
    case "skip:empty":
      return `跳过：无启用关键词${hhmm}`;
    case "error":
    default:
      return `失败${record.detail !== null ? `：${record.detail}` : ""}${hhmm}`;
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
