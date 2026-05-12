import { useEffect, useReducer, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  batchEventSchema,
  type BatchEvent,
} from "@/shared/contracts/keyword/batch-event";
import type {
  BatchSnapshot,
  KeywordRunSnapshot,
} from "@/shared/contracts/keyword/batch-status";

import { BATCH_STATUS_QUERY_KEY } from "./useBatchStatus";

interface State {
  batch: BatchSnapshot | null;
}

type Action =
  | { type: "set"; batch: BatchSnapshot | null }
  | { type: "event"; event: BatchEvent };

function emptyRun(
  keywordId: string,
  keywordText: string,
  position: number,
  platform: BatchSnapshot["platform"],
): KeywordRunSnapshot {
  return {
    keyword_id: keywordId,
    platform,
    keyword_text: keywordText,
    position,
    status: "pending",
    stop_reason: null,
    started_at: null,
    ended_at: null,
    scanned_count: 0,
    captured_count: 0,
    duplicate_count: 0,
    error_count: 0,
    filtered_count: 0,
    representative_errors: [],
  };
}

function reducer(state: State, action: Action): State {
  if (action.type === "set") {
    return { batch: action.batch };
  }
  const event = action.event;
  switch (event.phase) {
    case "batch-started": {
      const runs: KeywordRunSnapshot[] = event.selected_keyword_ids.map((kid, idx) =>
        emptyRun(kid, "", idx + 1, event.platform),
      );
      const next: BatchSnapshot = {
        batch_id: event.batch_id,
        platform: event.platform,
        status: "running",
        stop_reason: null,
        started_at: event.started_at,
        ended_at: null,
        selected_keyword_ids: [...event.selected_keyword_ids],
        runs,
        current_index: null,
      };
      return { batch: next };
    }
    case "keyword-started": {
      if (state.batch === null) return state;
      const idx = event.position - 1;
      const runs = state.batch.runs.slice();
      runs[idx] = {
        ...emptyRun(event.keyword_id, event.keyword_text, event.position, event.platform),
        status: "running",
        started_at: event.started_at,
      };
      return {
        ...state,
        batch: { ...state.batch, runs, current_index: idx },
      };
    }
    case "progress": {
      if (state.batch === null) return state;
      const idx = state.batch.current_index;
      if (idx === null || state.batch.runs[idx]?.keyword_id !== event.keyword_id) return state;
      const runs = state.batch.runs.slice();
      runs[idx] = {
        ...runs[idx]!,
        scanned_count: event.scanned_count,
        captured_count: event.captured_count,
        duplicate_count: event.duplicate_count,
        error_count: event.error_count,
        filtered_count: event.filtered_count,
      };
      return { ...state, batch: { ...state.batch, runs } };
    }
    case "keyword-ended": {
      if (state.batch === null) return state;
      const idx = state.batch.runs.findIndex((r) => r.keyword_id === event.keyword_id);
      if (idx < 0) return state;
      const runs = state.batch.runs.slice();
      runs[idx] = {
        ...runs[idx]!,
        status:
          event.stop_reason === "user"
            ? "stopped"
            : event.stop_reason === "session-failure" ||
                event.stop_reason === "error-threshold" ||
                event.stop_reason === "layout-switch-failure"
              ? "error"
              : "done",
        stop_reason: event.stop_reason,
        ended_at: event.ended_at,
        scanned_count: event.scanned_count,
        captured_count: event.captured_count,
        duplicate_count: event.duplicate_count,
        error_count: event.error_count,
        filtered_count: event.filtered_count,
        representative_errors: event.representative_errors,
      };
      return { ...state, batch: { ...state.batch, runs } };
    }
    case "batch-ended": {
      if (state.batch === null) return state;
      const next: BatchSnapshot = {
        ...state.batch,
        status:
          event.stop_reason === "user"
            ? "stopped"
            : event.stop_reason === "batch-session-dead"
              ? "error"
              : "done",
        stop_reason: event.stop_reason,
        ended_at: event.ended_at,
        current_index: null,
      };
      return { batch: next };
    }
    default:
      return state;
  }
}

export interface UseBatchEventStreamOutcome {
  batch: BatchSnapshot | null;
  isRunning: boolean;
}

export function useBatchEventStream(
  initialBatch: BatchSnapshot | null,
): UseBatchEventStreamOutcome {
  const [state, dispatch] = useReducer(reducer, {
    batch: initialBatch,
  });
  const qc = useQueryClient();
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (!initialisedRef.current && initialBatch !== null) {
      dispatch({ type: "set", batch: initialBatch });
      initialisedRef.current = true;
    }
  }, [initialBatch]);

  useEffect(() => {
    const kw = window.api?.keyword;
    if (kw === undefined || typeof kw.onBatchEvent !== "function") {
      // eslint-disable-next-line no-console
      console.warn(
        "[useBatchEventStream] window.api.keyword.onBatchEvent unavailable — preload may not be loaded",
      );
      return;
    }
    const id = kw.onBatchEvent((rawEvent) => {
      const parsed = batchEventSchema.safeParse(rawEvent);
      if (!parsed.success) return;
      dispatch({ type: "event", event: parsed.data });
      if (parsed.data.phase === "batch-ended") {
        void qc.invalidateQueries({ queryKey: BATCH_STATUS_QUERY_KEY });
      }
    });
    return () => {
      window.api?.keyword?.offBatchEvent?.(id);
    };
  }, [qc]);

  return {
    batch: state.batch,
    isRunning: state.batch !== null && state.batch.status === "running",
  };
}
