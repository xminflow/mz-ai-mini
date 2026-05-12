import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  aiChatEventSchema,
  aiChatResetResultSchema,
  aiChatSendResultSchema,
  aiChatStateResultSchema,
  type AiChatMessage,
  type AiChatSnapshot,
} from "@/shared/contracts/ai-chat";

export const AI_CHAT_QUERY_KEY = ["ai-chat"] as const;

export function useAiChatState() {
  return useQuery({
    queryKey: AI_CHAT_QUERY_KEY,
    queryFn: async () => {
      const raw = await window.api.aiChat.getState();
      const parsed = aiChatStateResultSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(`ai-chat:get-state 响应未通过校验: ${JSON.stringify(raw).slice(0, 200)}`);
      }
      if (!parsed.data.ok) {
        throw new Error(parsed.data.error.message);
      }
      return parsed.data;
    },
    staleTime: Infinity,
  });
}

export function useAiChatEvents() {
  const qc = useQueryClient();
  const [thinkingTrail, setThinkingTrail] = useState<string[]>([]);

  const ensureAssistantMessage = (snapshot: AiChatSnapshot, messageId: string): AiChatMessage => {
    let target = snapshot.messages.find((msg) => msg.id === messageId);
    if (target) return target;
    target = {
      id: messageId,
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
      tool_traces: [],
    };
    snapshot.messages.push(target);
    return target;
  };

  useEffect(() => {
    const id = window.api.aiChat.onEvent((rawEvent) => {
      const parsed = aiChatEventSchema.safeParse(rawEvent);
      if (!parsed.success) return;
      const event = parsed.data;
      if (event.phase === "thinking") {
        setThinkingTrail((prev) => [...prev.slice(-4), event.text]);
      }
      if (
        event.phase === "hydrated" ||
        event.phase === "run-started" ||
        event.phase === "run-ended" ||
        event.phase === "reset"
      ) {
        qc.setQueryData(AI_CHAT_QUERY_KEY, {
          schema_version: event.schema_version,
          ok: true,
          provider: event.provider,
          workspace_path: event.workspace_path,
          workspace_valid: event.phase === "hydrated" ? event.workspace_valid : true,
          snapshot: event.snapshot,
        });
        if (event.phase !== "run-started") {
          setThinkingTrail([]);
        }
        return;
      }
      if (event.phase === "message-delta" || event.phase === "tool-started" || event.phase === "tool-ended") {
        qc.setQueryData<{
          schema_version: "1";
          ok: true;
          provider: AiChatSnapshot["provider"];
          workspace_path: string;
          workspace_valid: boolean;
          snapshot: AiChatSnapshot;
        } | undefined>(AI_CHAT_QUERY_KEY, (prev) => {
          if (!prev) return prev;
          const snapshot = structuredClone(prev.snapshot) as AiChatSnapshot;
          const target = ensureAssistantMessage(snapshot, event.message_id);
          if (event.phase === "message-delta") {
            target.content += event.text;
          } else {
            const idx = target.tool_traces.findIndex((trace) => trace.id === event.trace.id);
            if (idx >= 0) target.tool_traces[idx] = event.trace;
            else target.tool_traces.push(event.trace);
          }
          snapshot.updated_at = new Date().toISOString();
          return { ...prev, snapshot };
        });
      }
    });
    return () => {
      window.api.aiChat.offEvent(id);
    };
  }, [qc]);

  return useMemo(() => thinkingTrail, [thinkingTrail]);
}

export function useAiChatSend() {
  return useMutation({
    mutationFn: async (prompt: string) => {
      const raw = await window.api.aiChat.send({ prompt });
      const parsed = aiChatSendResultSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(`ai-chat:send 响应未通过校验: ${JSON.stringify(raw).slice(0, 200)}`);
      }
      if (!parsed.data.ok) {
        throw new Error(parsed.data.error.message);
      }
      return parsed.data;
    },
    onError: (err) => {
      toast.error(`发送失败：${err.message}`);
    },
  });
}

export function useAiChatCancel() {
  return useMutation({
    mutationFn: async () => {
      const raw = await window.api.aiChat.cancel();
      if (!raw.ok) throw new Error(raw.error.message);
      return raw;
    },
    onError: (err: Error) => {
      toast.error(`停止失败：${err.message}`);
    },
  });
}

export function useAiChatReset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const raw = await window.api.aiChat.reset();
      const parsed = aiChatResetResultSchema.safeParse(raw);
      if (!parsed.success) {
        throw new Error(`ai-chat:reset 响应未通过校验: ${JSON.stringify(raw).slice(0, 200)}`);
      }
      if (!parsed.data.ok) {
        throw new Error(parsed.data.error.message);
      }
      return parsed.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: AI_CHAT_QUERY_KEY });
      toast.success("已清空当前会话");
    },
    onError: (err: Error) => {
      toast.error(`重开失败：${err.message}`);
    },
  });
}

export function isRunningEventState(event: { snapshot: AiChatSnapshot } | undefined): boolean {
  return event?.snapshot.run_status === "running";
}
