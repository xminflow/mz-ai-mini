import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { bloggerEventSchema } from "@/shared/contracts/blogger";

import { BLOGGERS_QUERY_KEY } from "./useBloggers";
import { bloggerReportQueryKey } from "./useBloggerReport";
import { useGlobalTaskCenterStore } from "@/shared/tasks/store";

/**
 * Subscribe to `blogger:event` from the utility process and refresh the
 * bloggers list query whenever a phase ends. Also invalidates the per-blogger
 * samples cache when a sample run finishes.
 */
export function useBloggerEvents(): void {
  const qc = useQueryClient();
  useEffect(() => {
    if (window.api?.blogger?.onEvent === undefined) return;
    const id = window.api.blogger.onEvent((raw: unknown) => {
      const parsed = bloggerEventSchema.safeParse(raw);
      if (!parsed.success) return;
      const ev = parsed.data;
      useGlobalTaskCenterStore.getState().applyBloggerEvent(ev);
      if (
        ev.phase === "profile-ended" ||
        ev.phase === "sample-ended" ||
        ev.phase === "analyze-report-ended" ||
        ev.phase === "analyze-ended"
      ) {
        void qc.invalidateQueries({ queryKey: BLOGGERS_QUERY_KEY });
      }
      if (
        ev.phase === "sample-ended" ||
        ev.phase === "analyze-video-ended" ||
        ev.phase === "analyze-report-ended" ||
        ev.phase === "analyze-ended"
      ) {
        void qc.invalidateQueries({
          queryKey: ["blogger-samples", ev.blogger_id],
        });
        void qc.invalidateQueries({
          queryKey: bloggerReportQueryKey(ev.blogger_id),
        });
      }
    });
    return () => {
      if (window.api?.blogger?.offEvent !== undefined) {
        window.api.blogger.offEvent(id);
      }
    };
  }, [qc]);
}
