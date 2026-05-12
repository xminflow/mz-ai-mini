import { useEffect, useReducer, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  manualCaptureEventSchema,
  type ManualCaptureEvent,
  type ManualCaptureSnapshot,
} from "@/shared/contracts/manual-capture";

import { MANUAL_CAPTURE_STATUS_QUERY_KEY } from "./useManualCaptureStatus";

interface State {
  task: ManualCaptureSnapshot | null;
}

type Action =
  | { type: "set"; task: ManualCaptureSnapshot | null }
  | { type: "event"; event: ManualCaptureEvent };

function reducer(state: State, action: Action): State {
  if (action.type === "set") return { task: action.task };
  const event = action.event;
  switch (event.phase) {
    case "task-started":
      return {
        task: {
          task_id: event.task_id,
          platform: event.platform,
          source_type: "manual_url",
          canonical_url: event.canonical_url,
          status: "running",
          stop_reason: null,
          started_at: event.started_at,
          ended_at: null,
          scanned_count: 0,
          captured_count: 0,
          duplicate_count: 0,
          error_count: 0,
          filtered_count: 0,
          current_phase: "validate",
          result_post_id: null,
        },
      };
    case "progress":
      if (state.task === null || state.task.task_id !== event.task_id) return state;
      return {
        task: {
          ...state.task,
          scanned_count: event.scanned_count,
          captured_count: event.captured_count,
          duplicate_count: event.duplicate_count,
          error_count: event.error_count,
          filtered_count: event.filtered_count,
          current_phase: event.current_phase,
        },
      };
    case "task-ended":
      if (state.task === null || state.task.task_id !== event.task_id) return state;
      return {
        task: {
          ...state.task,
          status: event.status,
          stop_reason: event.stop_reason,
          ended_at: event.ended_at,
          scanned_count: event.scanned_count,
          captured_count: event.captured_count,
          duplicate_count: event.duplicate_count,
          error_count: event.error_count,
          filtered_count: event.filtered_count,
          current_phase: "done",
          result_post_id: event.result_post_id,
        },
      };
    default:
      return state;
  }
}

export function useManualCaptureEventStream(initialTask: ManualCaptureSnapshot | null): {
  task: ManualCaptureSnapshot | null;
  isRunning: boolean;
} {
  const [state, dispatch] = useReducer(reducer, { task: initialTask });
  const qc = useQueryClient();
  const initialisedRef = useRef(false);

  useEffect(() => {
    if (!initialisedRef.current && initialTask !== null) {
      dispatch({ type: "set", task: initialTask });
      initialisedRef.current = true;
    }
  }, [initialTask]);

  useEffect(() => {
    const api = window.api?.manualCapture;
    if (api === undefined) return;
    const id = api.onEvent((rawEvent) => {
      const parsed = manualCaptureEventSchema.safeParse(rawEvent);
      if (!parsed.success) return;
      dispatch({ type: "event", event: parsed.data });
      if (parsed.data.phase === "task-ended") {
        void qc.invalidateQueries({ queryKey: MANUAL_CAPTURE_STATUS_QUERY_KEY });
        void qc.invalidateQueries({ queryKey: ["library", "list"] });
      }
    });
    return () => {
      window.api?.manualCapture?.offEvent(id);
    };
  }, [qc]);

  return {
    task: state.task,
    isRunning: state.task !== null && state.task.status === "running",
  };
}
