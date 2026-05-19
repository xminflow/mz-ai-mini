import {
  Check,
  ChevronDown,
  MessageSquare,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  Square,
  WandSparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import { Link } from "react-router-dom";
import remarkGfm from "remark-gfm";

import { useSettings } from "@/features/settings/hooks/useSettings";
import { cn } from "@/shared/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
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
  useAiChatSkills,
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

const assistantMarkdownComponents: Components = {
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => (
    <h1 className="mb-2 mt-4 text-lg font-semibold leading-snug first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-4 text-base font-semibold leading-snug first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-3 text-sm font-semibold leading-snug first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 first:mt-0 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-foreground/30 pl-3 text-foreground/80 first:mt-0 last:mb-0">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.startsWith("language-") ?? false;
    if (isBlock) {
      return (
        <code
          className={cn(
            "block overflow-x-auto rounded-md bg-muted/70 p-3 font-mono text-xs leading-6",
            className,
          )}
        >
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-muted/70 px-1.5 py-0.5 font-mono text-xs">{children}</code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto first:mt-0 last:mb-0">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-md border border-border/60 first:mt-0 last:mb-0">
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border/60 px-3 py-2 text-left font-medium">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-border/60 px-3 py-2">{children}</td>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium underline underline-offset-4"
    >
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt ?? ""}
      className="my-2 max-w-full rounded-md border border-border/60"
    />
  ),
  hr: () => <hr className="my-3 border-border/60" />,
};

function ThinkingIndicator({
  className,
  label = "思考中",
}: {
  className?: string;
  label?: string;
}): JSX.Element {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <span>{label}</span>
      <span className="flex items-center gap-1" aria-hidden="true">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
      </span>
    </div>
  );
}

export function AiChat(): JSX.Element {
  const settings = useSettings();
  const state = useAiChatState();
  const send = useAiChatSend();
  const cancel = useAiChatCancel();
  const reset = useAiChatReset();
  const skills = useAiChatSkills();
  const thinkingTrail = useAiChatEvents();
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);

  const selectedSkill = useMemo(
    () => (skills.data ?? []).find((s) => s.id === selectedSkillId) ?? null,
    [skills.data, selectedSkillId],
  );

  const snapshot = state.data?.snapshot;
  const workspaceValid = state.data?.workspace_valid ?? true;
  const provider = state.data?.provider ?? settings.data?.llm.provider ?? "claude-code";
  const running = snapshot?.run_status === "running" || send.isPending || cancel.isPending;
  const hasMessages = Boolean(snapshot && snapshot.messages.length > 0);
  const assistantMessages = snapshot?.messages.filter((message) => message.role === "assistant") ?? [];
  const lastAssistantMessage =
    assistantMessages.length > 0 ? assistantMessages[assistantMessages.length - 1] : null;
  const lastThinking = thinkingTrail.length > 0 ? thinkingTrail[thinkingTrail.length - 1] : "";

  const canSend = useMemo(() => {
    return prompt.trim().length > 0 && workspaceValid && !running;
  }, [prompt, workspaceValid, running]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [snapshot?.messages, running, lastThinking]);

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
    const skillForThisSend = selectedSkillId;
    setPrompt("");
    // Skill 选择仅对本次发送生效：发送后清空，避免后续无意识沿用。
    setSelectedSkillId(null);
    send.mutate(
      skillForThisSend ? { prompt: next, skill_id: skillForThisSend } : { prompt: next },
    );
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
                  const isLiveAssistant = isAssistant && lastAssistantMessage?.id === message.id && running;
                  const pendingAssistant = isLiveAssistant && !message.content;
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
                          {pendingAssistant ? (
                            <div className="flex min-h-20 items-center" aria-live="polite">
                              <ThinkingIndicator
                                className="text-foreground/70"
                                label={lastThinking || "思考中"}
                              />
                            </div>
                          ) : isAssistant ? (
                            <div className="break-words [overflow-wrap:anywhere]">
                              {message.content ? (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={assistantMarkdownComponents}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              ) : (
                                " "
                              )}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap break-words">
                              {message.content || " "}
                            </div>
                          )}
                        </div>
                        {isLiveAssistant && running && message.content ? (
                          <div className="w-full pl-1" data-testid="ai-chat-running-inline" aria-live="polite">
                            <ThinkingIndicator label={lastThinking || "思考中"} />
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
                <div
                  className={cn(
                    "min-h-5 text-xs",
                    running ? "text-foreground/70" : "text-muted-foreground",
                  )}
                >
                  {running ? (
                    <ThinkingIndicator
                      className="max-w-[560px] text-xs text-foreground/70"
                      label={lastThinking || "思考中"}
                    />
                  ) : (
                    "Enter 发送，Shift + Enter 换行"
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Popover open={skillPickerOpen} onOpenChange={setSkillPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={running}
                        className={cn(
                          "h-8 max-w-[240px] gap-1.5 rounded-full border-border/70 bg-card/80 px-3 text-xs",
                          selectedSkillId ? "text-foreground" : "text-muted-foreground",
                        )}
                        aria-label="选择 Skill"
                      >
                        <Sparkles className="h-3.5 w-3.5 shrink-0" />
                        {selectedSkillId ? (
                          <>
                            <span className="truncate">
                              {selectedSkill?.title ?? selectedSkillId}
                            </span>
                            <span
                              role="button"
                              aria-label="清空所选 Skill"
                              tabIndex={0}
                              className="ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full hover:bg-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setSelectedSkillId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setSelectedSkillId(null);
                                }
                              }}
                            >
                              <X className="h-3 w-3" />
                            </span>
                          </>
                        ) : (
                          <>
                            <span>选择 Skill</span>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
                          </>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      sideOffset={8}
                      className="w-[360px] p-0"
                    >
                      <div className="border-b border-border/60 px-3 py-2 text-xs text-muted-foreground">
                        手动指定本次发送使用的 Skill，发送后自动清空
                      </div>
                      <div className="max-h-[320px] overflow-y-auto p-1">
                        {skills.isLoading ? (
                          <div className="px-3 py-4 text-xs text-muted-foreground">
                            正在加载可用 Skill...
                          </div>
                        ) : skills.isError ? (
                          <div className="px-3 py-4 text-xs text-rose-600">
                            加载失败：{skills.error instanceof Error ? skills.error.message : "未知错误"}
                          </div>
                        ) : (skills.data ?? []).length === 0 ? (
                          <div className="px-3 py-4 text-xs text-muted-foreground">
                            暂无可用 Skill
                          </div>
                        ) : (
                          (skills.data ?? []).map((s) => {
                            const isSelected = selectedSkillId === s.id;
                            return (
                              <button
                                type="button"
                                key={s.id}
                                onClick={() => {
                                  setSelectedSkillId(isSelected ? null : s.id);
                                  setSkillPickerOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left transition hover:bg-muted/60",
                                  isSelected && "bg-muted/70",
                                )}
                              >
                                <Check
                                  className={cn(
                                    "mt-0.5 h-4 w-4 shrink-0",
                                    isSelected ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate text-sm font-medium text-foreground">
                                    {s.title}
                                  </div>
                                  <div className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                                    {s.id}
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
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
