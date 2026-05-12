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
    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <AiChat />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "AI 对话" })).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "今天想聊什么？" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("向 AI 发送消息")).toBeInTheDocument();
  });
});
