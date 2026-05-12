import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  Square,
  WandSparkles,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { useSettings } from "@/features/settings/hooks/useSettings";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

import {
  useAiChatCancel,
  useAiChatEvents,
  useAiChatReset,
  useAiChatSend,
  useAiChatState,
} from "./hooks";

const SUGGESTED_PROMPTS = [
  "帮我梳理一个短视频账号的内容定位",
  "根据当前项目给我一个执行方案",
  "把这段需求拆成开发任务和验收标准",
] as const;

function roleLabel(role: "user" | "assistant" | "system"): string {
  if (role === "user") return "你";
  if (role === "assistant") return "AI";
  return "系统";
}

function timeLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AiChat(): JSX.Element {
  const settings = useSettings();
  const state = useAiChatState();
  const send = useAiChatSend();
  const cancel = useAiChatCancel();
  const reset = useAiChatReset();
  const thinkingTrail = useAiChatEvents();
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [prompt, setPrompt] = useState("");
  const [expandedToolIds, setExpandedToolIds] = useState<Record<string, boolean>>({});

  const snapshot = state.data?.snapshot;
  const workspaceValid = state.data?.workspace_valid ?? true;
  const provider = state.data?.provider ?? settings.data?.llm.provider ?? "claude-code";
  const running = snapshot?.run_status === "running" || send.isPending || cancel.isPending;
  const hasMessages = Boolean(snapshot && snapshot.messages.length > 0);
  const lastThinking = thinkingTrail.length > 0 ? thinkingTrail[thinkingTrail.length - 1] : "";

  const canSend = useMemo(() => {
    return prompt.trim().length > 0 && workspaceValid && !running;
  }, [prompt, workspaceValid, running]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [snapshot?.messages, lastThinking]);

  if (state.isLoading || settings.isLoading) {
    return (
      <div className="app-shell-page flex h-full max-w-[1400px] flex-col bg-background">
        <div className="mx-auto w-full max-w-5xl rounded-[28px] border border-border/60 bg-card/70 px-5 py-5 text-sm text-muted-foreground shadow-sm backdrop-blur">
          正在加载 AI 对话...
        </div>
      </div>
    );
  }

  const onSubmit = () => {
    const next = prompt.trim();
    if (!canSend || next.length === 0) return;
    setPrompt("");
    send.mutate(next);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className="app-shell-page flex h-full max-w-[1400px] flex-col overflow-hidden bg-background"
        data-testid="ai-chat-screen"
      >
        <header className="flex items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/70 bg-muted/35 text-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-foreground">AI 对话</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="ghost" size="icon" className="rounded-full">
                  <Link to="/settings" aria-label="打开设置">
                    <Settings2 className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>设置</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => reset.mutate()}
                  disabled={running || reset.isPending}
                  aria-label="清空会话"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>清空重开</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col">
          <div
            ref={messagesRef}
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-1",
              hasMessages ? "pb-6 pt-4" : "pb-4 pt-8",
            )}
          >
            {!snapshot || snapshot.messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-sky-500/16 via-violet-500/14 to-emerald-500/14 ring-1 ring-border/60">
                  <WandSparkles className="h-7 w-7 text-foreground" />
                </div>
                <h2 className="text-[30px] font-semibold tracking-normal text-foreground">
                  今天想聊什么？
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  直接输入问题即可开始对话。当前会话会复用已接入的 {provider}，并在应用默认
                  userData 目录下持续保留上下文。
                </p>
                <div className="mt-8 flex w-full max-w-3xl flex-wrap justify-center gap-3">
                  {SUGGESTED_PROMPTS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPrompt(item)}
                      className="rounded-full border border-border/70 bg-card/80 px-4 py-2.5 text-sm text-foreground transition hover:border-foreground/25 hover:bg-muted/40"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
                {snapshot.messages.map((message) => {
                  const isUser = message.role === "user";
                  const isAssistant = message.role === "assistant";
                  const pendingAssistant = isAssistant && running && !message.content;
                  return (
                    <section
                      key={message.id}
                      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "flex max-w-[85%] min-w-0 flex-col gap-3",
                          isUser ? "items-end" : "items-start",
                        )}
                      >
                        <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">
                            {roleLabel(message.role)}
                          </span>
                          <span>{timeLabel(message.created_at)}</span>
                        </div>
                        <div
                          className={cn(
                            "w-full rounded-[26px] px-5 py-4 text-sm leading-7 shadow-sm",
                            isUser
                              ? "bg-foreground text-background"
                              : "border border-border/60 bg-card/80 text-foreground",
                          )}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {message.content || (pendingAssistant ? "正在生成..." : " ")}
                          </div>
                        </div>
                        {message.tool_traces.length > 0 ? (
                          <div className="w-full space-y-2 pl-1">
                            {message.tool_traces.map((trace) => {
                              const expanded = expandedToolIds[trace.id] ?? false;
                              return (
                                <div
                                  key={trace.id}
                                  className="overflow-hidden rounded-2xl border border-border/60 bg-muted/20"
                                >
                                  <button
                                    type="button"
                                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                                    onClick={() =>
                                      setExpandedToolIds((prev) => ({
                                        ...prev,
                                        [trace.id]: !expanded,
                                      }))
                                    }
                                  >
                                    <span className="flex min-w-0 items-center gap-2">
                                      <Wrench className="h-4 w-4 text-muted-foreground" />
                                      <span className="truncate text-sm text-foreground">
                                        {trace.name}
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                      <Badge variant="outline" className="rounded-full px-2 py-0.5">
                                        {trace.ended_at ? (trace.is_error ? "失败" : "完成") : "运行中"}
                                      </Badge>
                                      {expanded ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </span>
                                  </button>
                                  {expanded ? (
                                    <div className="border-t border-border/50 px-4 py-4 text-xs leading-6 text-muted-foreground">
                                      <pre className="overflow-x-auto whitespace-pre-wrap break-words">
                                        {JSON.stringify(trace.input, null, 2)}
                                      </pre>
                                      {trace.content ? (
                                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-foreground">
                                          {trace.content}
                                        </pre>
                                      ) : null}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mx-auto w-full max-w-4xl pb-2 pt-4">
            <div className="rounded-[28px] border border-border/70 bg-card/90 px-5 py-4 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="向 AI 发送消息"
                disabled={running}
                className="min-h-[104px] resize-none border-0 bg-transparent px-0 py-0 shadow-none ring-0 focus-visible:ring-0"
              />
              {snapshot?.last_error ? (
                <div className="pb-2 text-sm text-rose-600 dark:text-rose-400">
                  {snapshot.last_error}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="min-h-5 text-xs text-muted-foreground">
                  {lastThinking || "Enter 发送，Shift + Enter 换行"}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    {provider}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => cancel.mutate()}
                    disabled={!running}
                    aria-label="停止生成"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={onSubmit}
                    disabled={!canSend}
                    className="rounded-full px-5"
                  >
                    <Send className="h-4 w-4" />
                    发送
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
