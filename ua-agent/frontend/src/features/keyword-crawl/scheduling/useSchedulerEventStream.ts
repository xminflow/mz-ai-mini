import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  type SchedulerEvent,
  schedulerEventSchema,
} from "@/shared/contracts/scheduling";

import { SCHEDULER_STATUS_QUERY_KEY } from "./useSchedulerStatus";

const PLATFORM_LABEL: Record<SchedulerEvent["platform"], string> = {
  douyin: "抖音",
  xiaohongshu: "小红书",
};

function describeOutcome(event: SchedulerEvent): string {
  switch (event.kind) {
    case "queued":
      return `${PLATFORM_LABEL[event.platform]}：定时任务已排队，等待当前批次结束`;
    case "fired":
    case "drained": {
      const verb = event.kind === "drained" ? "排队执行" : "定时执行";
      switch (event.outcome) {
        case "ok":
          return `${PLATFORM_LABEL[event.platform]}：${verb} ✓ 已开始`;
        case "skip:busy":
          return `${PLATFORM_LABEL[event.platform]}：${verb}跳过（已有批次进行中）`;
        case "skip:session_not_ready":
          return `${PLATFORM_LABEL[event.platform]}：${verb}跳过（浏览器会话未就绪）`;
        case "skip:empty":
          return `${PLATFORM_LABEL[event.platform]}：${verb}跳过（无启用关键词）`;
        case "error":
        default:
          return `${PLATFORM_LABEL[event.platform]}：${verb}失败${event.detail !== null ? `（${event.detail}）` : ""}`;
      }
    }
    case "skipped":
      return `${PLATFORM_LABEL[event.platform]}：定时任务被跳过${event.detail !== null ? `（${event.detail}）` : ""}`;
    default:
      return "";
  }
}

export function useSchedulerEventStream(): void {
  const qc = useQueryClient();
  useEffect(() => {
    const sched = window.api?.scheduler;
    if (sched === undefined || typeof sched.onEvent !== "function") {
      return;
    }
    const id = sched.onEvent((rawEvent) => {
      const parsed = schedulerEventSchema.safeParse(rawEvent);
      if (!parsed.success) return;
      const event = parsed.data;
      const message = describeOutcome(event);
      if (message !== "") {
        if (event.kind === "fired" || event.kind === "drained") {
          if (event.outcome === "ok") toast.success(message);
          else toast.warning(message);
        } else if (event.kind === "queued") {
          toast.info(message);
        } else {
          toast.warning(message);
        }
      }
      void qc.invalidateQueries({ queryKey: SCHEDULER_STATUS_QUERY_KEY });
    });
    return () => {
      window.api?.scheduler?.offEvent?.(id);
    };
  }, [qc]);
}
