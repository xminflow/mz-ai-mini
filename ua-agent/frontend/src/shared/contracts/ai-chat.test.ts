import { describe, expect, it } from "vitest";

import { aiChatStateResultSchema } from "./ai-chat";

describe("ai-chat contracts", () => {
  it("accepts a hydrated state payload", () => {
    const parsed = aiChatStateResultSchema.safeParse({
      schema_version: "1",
      ok: true,
      provider: "codex",
      workspace_path: "D:\\workspace",
      workspace_valid: true,
      snapshot: {
        provider: "codex",
        workspace_path: "D:\\workspace",
        session_id: "session-1",
        run_status: "idle",
        last_error: null,
        updated_at: "2026-05-12T12:00:00.000Z",
        messages: [
          {
            id: "m1",
            role: "user",
            content: "hello",
            created_at: "2026-05-12T12:00:00.000Z",
            tool_traces: [],
          },
        ],
      },
    });

    expect(parsed.success).toBe(true);
  });
});
