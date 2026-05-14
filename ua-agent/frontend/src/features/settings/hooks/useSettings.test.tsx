import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AI_CHAT_QUERY_KEY } from "@/features/ai-chat/hooks";

import { useUpdateSettings } from "./useSettings";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

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

describe("useUpdateSettings", () => {
  beforeEach(() => {
    window.api = {
      ...window.api,
      settings: {
        get: vi.fn(),
        update: vi.fn().mockResolvedValue({
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
        testLlm: vi.fn(),
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("invalidates ai chat state after settings update succeeds", async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateSettings(), { wrapper });

    result.current.mutate({ llm: { provider: "codex" } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: AI_CHAT_QUERY_KEY });
  });
});
