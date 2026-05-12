import { useEffect } from "react";

import { batchStatusResultSchema } from "@/shared/contracts/keyword/batch-status";
import { batchEventSchema } from "@/shared/contracts/keyword/batch-event";
import { TranscriptProgressEvent as transcriptProgressEventSchema } from "@/shared/contracts/transcript";
import { useTranscriptTaskStore } from "@/shared/library/useTranscriptTaskStore";

import { useGlobalTaskCenterStore } from "./store";

export function useGlobalTaskRuntime(): void {
  useEffect(() => {
    let cancelled = false;
    const keyword = window.api?.keyword;
    if (keyword === undefined || typeof keyword.batchStatus !== "function") return;

    void keyword.batchStatus().then((raw) => {
      if (cancelled) return;
      const parsed = batchStatusResultSchema.safeParse(raw);
      if (!parsed.success || !parsed.data.ok) return;
      useGlobalTaskCenterStore.getState().applyBatchSnapshot(parsed.data.batch);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const keyword = window.api?.keyword;
    if (keyword === undefined || typeof keyword.onBatchEvent !== "function") return;

    const id = keyword.onBatchEvent((rawEvent) => {
      const parsed = batchEventSchema.safeParse(rawEvent);
      if (!parsed.success) return;
      useGlobalTaskCenterStore.getState().applyBatchEvent(parsed.data);
    });

    return () => {
      window.api?.keyword?.offBatchEvent?.(id);
    };
  }, []);

  useEffect(() => {
    const transcript = window.api?.transcript;
    if (transcript === undefined || typeof transcript.onProgress !== "function") return;

    const id = transcript.onProgress((rawEvent) => {
      const parsed = transcriptProgressEventSchema.safeParse(rawEvent);
      if (!parsed.success) {
        console.warn("[transcript] dropping malformed progress event", parsed.error.format());
        return;
      }
      useTranscriptTaskStore.getState()._onProgress(parsed.data);
      useGlobalTaskCenterStore.getState().applyTranscriptProgress(parsed.data);
    });

    return () => {
      window.api?.transcript?.offProgress?.(id);
    };
  }, []);

}
