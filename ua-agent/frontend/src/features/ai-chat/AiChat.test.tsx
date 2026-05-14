import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AiChat } from "./index";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function renderAiChat() {
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <AiChat />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("AiChat", () => {
  beforeEach(() => {
    window.api = {
      ...window.api,
      settings: {
        get: vi.fn().mockResolvedValue({
          schema_version: "1",
          ok: true,
          settings: {
            schema_version: "1",
            llm: {
              provider: "codex",
              claudeCode: {},
              codex: {},
              kimi: {},
            },
            network: {},
            theme: "system",
            scheduling: {
              douyin: { enabled: false, time: "09:00" },
              xiaohongshu: { enabled: false, time: "09:00" },
            },
          },
        }),
        update: vi.fn(),
        testLlm: vi.fn(),
      },
      aiChat: {
        getState: vi.fn().mockResolvedValue({
          schema_version: "1",
          ok: true,
          provider: "codex",
          workspace_path: "D:\\workspace",
          workspace_valid: true,
          snapshot: {
            provider: "codex",
            workspace_path: "D:\\workspace",
            session_id: null,
            run_status: "idle",
            last_error: null,
            updated_at: "2026-05-12T12:00:00.000Z",
            messages: [],
          },
        }),
        send: vi.fn(),
        cancel: vi.fn(),
        reset: vi.fn(),
        onEvent: vi.fn().mockReturnValue(1),
        offEvent: vi.fn(),
      },
    };
  });

  it("renders redesigned empty-state guidance", async () => {
    renderAiChat();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "AI 对话" })).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "今天想聊什么？" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("向 AI 发送消息")).toBeInTheDocument();
  });

  it("shows prominent running feedback while AI is thinking", async () => {
    const onEvent = vi.fn().mockImplementation((handler: (event: unknown) => void) => {
      queueMicrotask(() => {
        handler({
          schema_version: "1",
          provider: "codex",
          workspace_path: "D:\\workspace",
          phase: "thinking",
          text: "正在整理执行步骤",
        });
      });
      return 1;
    });

    window.api.aiChat.getState = vi.fn().mockResolvedValue({
      schema_version: "1",
      ok: true,
      provider: "codex",
      workspace_path: "D:\\workspace",
      workspace_valid: true,
      snapshot: {
        provider: "codex",
        workspace_path: "D:\\workspace",
        session_id: "session-1",
        run_status: "running",
        last_error: null,
        updated_at: "2026-05-12T12:00:00.000Z",
        messages: [
          {
            id: "user-1",
            role: "user",
            content: "给我一个执行方案",
            created_at: "2026-05-12T12:00:00.000Z",
            tool_traces: [],
          },
          {
            id: "assistant-1",
            role: "assistant",
            content: "",
            created_at: "2026-05-12T12:00:01.000Z",
            tool_traces: [],
          },
        ],
      },
    });
    window.api.aiChat.onEvent = onEvent;

    renderAiChat();

    await waitFor(() => {
      expect(screen.getAllByText("正在整理执行步骤").length).toBeGreaterThan(0);
    });
  });

  it("keeps showing inline thinking feedback after partial assistant output appears", async () => {
    window.api.aiChat.getState = vi.fn().mockResolvedValue({
      schema_version: "1",
      ok: true,
      provider: "codex",
      workspace_path: "D:\\workspace",
      workspace_valid: true,
      snapshot: {
        provider: "codex",
        workspace_path: "D:\\workspace",
        session_id: "session-2",
        run_status: "running",
        last_error: null,
        updated_at: "2026-05-12T12:02:00.000Z",
        messages: [
          {
            id: "user-2",
            role: "user",
            content: "帮我拆需求",
            created_at: "2026-05-12T12:01:00.000Z",
            tool_traces: [],
          },
          {
            id: "assistant-2",
            role: "assistant",
            content: "我先从目标和范围开始拆解。",
            created_at: "2026-05-12T12:01:05.000Z",
            tool_traces: [],
          },
        ],
      },
    });

    renderAiChat();

    expect(await screen.findByTestId("ai-chat-running-inline")).toHaveTextContent("思考中");
  });

  it("does not render tool execution details in assistant messages", async () => {
    window.api.aiChat.getState = vi.fn().mockResolvedValue({
      schema_version: "1",
      ok: true,
      provider: "codex",
      workspace_path: "D:\\workspace",
      workspace_valid: true,
      snapshot: {
        provider: "codex",
        workspace_path: "D:\\workspace",
        session_id: "session-3",
        run_status: "idle",
        last_error: null,
        updated_at: "2026-05-12T12:03:00.000Z",
        messages: [
          {
            id: "user-3",
            role: "user",
            content: "分析这个需求",
            created_at: "2026-05-12T12:02:00.000Z",
            tool_traces: [],
          },
          {
            id: "assistant-3",
            role: "assistant",
            content: "我已经整理出需求重点。",
            created_at: "2026-05-12T12:02:05.000Z",
            tool_traces: [
              {
                id: "tool-1",
                name: "search_codebase",
                input: { query: "ai chat" },
                content: "matched files",
                is_error: false,
                started_at: "2026-05-12T12:02:06.000Z",
                ended_at: "2026-05-12T12:02:07.000Z",
              },
            ],
          },
        ],
      },
    });

    renderAiChat();

    expect(await screen.findByText("我已经整理出需求重点。")).toBeInTheDocument();
    expect(screen.queryByText("search_codebase")).toBeNull();
    expect(screen.queryByText("matched files")).toBeNull();
  });
});
