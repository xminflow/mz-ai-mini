import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("electron", () => ({
  app: {
    isPackaged: false,
  },
}));

import {
  __internal__,
  RemoteAuthError,
  requestRemoteEmailLoginChallenge,
  refreshRemoteAgentSession,
} from "./remote";

const originalApiBaseUrl = process.env["UA_AGENT_API_BASE_URL"];

afterEach(() => {
  if (originalApiBaseUrl === undefined) {
    delete process.env["UA_AGENT_API_BASE_URL"];
  } else {
    process.env["UA_AGENT_API_BASE_URL"] = originalApiBaseUrl;
  }
  vi.restoreAllMocks();
});

describe("auth remote api base url", () => {
  it("uses local dev api origin by default when running unpackaged", () => {
    delete process.env["UA_AGENT_API_BASE_URL"];

    expect(__internal__.resolveApiBaseUrl()).toBe("http://127.0.0.1:8001/api/v1");
  });

  it("uses production api origin by default when running packaged", async () => {
    delete process.env["UA_AGENT_API_BASE_URL"];

    vi.resetModules();
    vi.doMock("electron", () => ({
      app: {
        isPackaged: true,
      },
    }));
    const { __internal__: packagedInternal } = await import("./remote");

    expect(packagedInternal.resolveApiBaseUrl()).toBe("https://api.weelume.com/api/v1");
  });

  it("uses UA_AGENT_API_BASE_URL override when provided", () => {
    process.env["UA_AGENT_API_BASE_URL"] = "http://127.0.0.1:8001/api/v1";

    expect(__internal__.resolveApiBaseUrl()).toBe("http://127.0.0.1:8001/api/v1");
  });

  it("requests email login challenge against the resolved api base url", async () => {
    process.env["UA_AGENT_API_BASE_URL"] = "http://127.0.0.1:8001/api/v1";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: "COMMON.SUCCESS",
        message: "success",
        data: {
          login_challenge_id: "9001",
          expires_at: "2026-05-14T10:00:00Z",
          cooldown_seconds: 60,
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await requestRemoteEmailLoginChallenge("demo@example.com");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://127.0.0.1:8001/api/v1/agent-auth/email-login/challenges",
    );
  });

  it("preserves upstream auth error code and http status for refresh failures", async () => {
    process.env["UA_AGENT_API_BASE_URL"] = "http://127.0.0.1:8001/api/v1";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          code: "AGENT_AUTH.REFRESH_TOKEN_EXPIRED",
          message: "Refresh token is expired or invalid.",
          data: null,
        }),
      }),
    );

    await expect(refreshRemoteAgentSession("refresh-token")).rejects.toMatchObject<RemoteAuthError>({
      name: "RemoteAuthError",
      errorCode: "AGENT_AUTH.REFRESH_TOKEN_EXPIRED",
      httpStatus: 401,
    });
  });
});
