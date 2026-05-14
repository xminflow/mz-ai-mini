import { app } from "electron";
import { type AgentAccount, type AgentAuthPayload } from "../../../shared/contracts/agent-auth";

const DEFAULT_DEV_API_BASE_URL = "http://127.0.0.1:8001/api/v1";
const DEFAULT_PRODUCTION_API_BASE_URL = "https://api.weelume.com/api/v1";
const FETCH_TIMEOUT_MS = 15_000;
const UPSTREAM_SUCCESS_CODE = "COMMON.SUCCESS";

interface UpstreamEnvelope<T> {
  code?: unknown;
  message?: unknown;
  data?: T;
}

interface UpstreamAuthAccount {
  account_id?: unknown;
  username?: unknown;
  email?: unknown;
  status?: unknown;
  created_at?: unknown;
}

interface UpstreamAuthTokens {
  access_token?: unknown;
  access_token_expires_at?: unknown;
  refresh_token?: unknown;
  refresh_token_expires_at?: unknown;
}

interface UpstreamAuthPayload {
  account?: unknown;
  tokens?: unknown;
}

interface UpstreamWechatLoginSession {
  login_session_id?: unknown;
  status?: unknown;
  qr_code_url?: unknown;
  expires_at?: unknown;
  poll_interval_ms?: unknown;
}

interface UpstreamWechatLoginSessionStatus {
  login_session_id?: unknown;
  status?: unknown;
  expires_at?: unknown;
}

interface UpstreamEmailLoginChallenge {
  login_challenge_id?: unknown;
  expires_at?: unknown;
  cooldown_seconds?: unknown;
}

interface RemoteAuthErrorOptions {
  errorCode?: string | null;
  httpStatus?: number | null;
  cause?: unknown;
}

export class RemoteAuthError extends Error {
  readonly errorCode: string | null;
  readonly httpStatus: number | null;

  constructor(message: string, options: RemoteAuthErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "RemoteAuthError";
    this.errorCode = options.errorCode ?? null;
    this.httpStatus = options.httpStatus ?? null;
  }
}

export function isRemoteAuthError(error: unknown): error is RemoteAuthError {
  return error instanceof RemoteAuthError;
}

function resolveApiBaseUrl(): string {
  const override = process.env["UA_AGENT_API_BASE_URL"]?.trim();
  if (override && override.length > 0) {
    return override;
  }
  return app.isPackaged ? DEFAULT_PRODUCTION_API_BASE_URL : DEFAULT_DEV_API_BASE_URL;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeAccount(raw: UpstreamAuthAccount): AgentAccount {
  return {
    account_id: asString(raw.account_id),
    username: asString(raw.username),
    email: asString(raw.email) || null,
    status: raw.status === "disabled" ? "disabled" : "active",
    created_at: asString(raw.created_at),
  };
}

function normalizePayload(raw: UpstreamAuthPayload): AgentAuthPayload {
  const accountRaw =
    raw.account && typeof raw.account === "object"
      ? (raw.account as UpstreamAuthAccount)
      : {};
  const tokensRaw =
    raw.tokens && typeof raw.tokens === "object"
      ? (raw.tokens as UpstreamAuthTokens)
      : {};
  return {
    account: normalizeAccount(accountRaw),
    tokens: {
      access_token: asString(tokensRaw.access_token),
      access_token_expires_at: asString(tokensRaw.access_token_expires_at),
      refresh_token: asString(tokensRaw.refresh_token),
      refresh_token_expires_at: asString(tokensRaw.refresh_token_expires_at),
    },
  };
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${resolveApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "upstream auth request failed before response";
    throw new RemoteAuthError(message, { cause: error });
  }

  let envelope: UpstreamEnvelope<T>;
  try {
    envelope = (await response.json()) as UpstreamEnvelope<T>;
  } catch (error) {
    throw new RemoteAuthError(
      `upstream auth response was not valid json (status ${response.status})`,
      { httpStatus: response.status, cause: error },
    );
  }

  if (!response.ok || envelope.code !== UPSTREAM_SUCCESS_CODE || envelope.data === undefined) {
    const message =
      typeof envelope.message === "string"
        ? envelope.message
        : `upstream auth request failed with status ${response.status}`;
    throw new RemoteAuthError(message, {
      errorCode: typeof envelope.code === "string" ? envelope.code : null,
      httpStatus: response.status,
    });
  }
  return envelope.data;
}

export async function registerRemoteAgentAccount(
  credentials: { username: string; password: string },
): Promise<AgentAuthPayload> {
  const payload = await requestJson<UpstreamAuthPayload>("/agent-auth/register", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return normalizePayload(payload);
}

export async function loginRemoteAgentAccount(
  credentials: { username: string; password: string },
): Promise<AgentAuthPayload> {
  const payload = await requestJson<UpstreamAuthPayload>("/agent-auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return normalizePayload(payload);
}

export async function refreshRemoteAgentSession(
  refreshToken: string,
): Promise<AgentAuthPayload> {
  const payload = await requestJson<UpstreamAuthPayload>("/agent-auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return normalizePayload(payload);
}

export async function logoutRemoteAgentSession(refreshToken: string): Promise<void> {
  await requestJson("/agent-auth/logout", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function createRemoteWechatLoginSession(): Promise<{
  login_session_id: string;
  status: "pending" | "authenticated" | "expired" | "consumed";
  qr_code_url: string;
  expires_at: string;
  poll_interval_ms: number;
}> {
  const payload = await requestJson<UpstreamWechatLoginSession>(
    "/agent-auth/wechat-official/login-sessions",
    { method: "POST", body: JSON.stringify({}) },
  );
  return {
    login_session_id: asString(payload.login_session_id),
    status:
      payload.status === "authenticated" ||
      payload.status === "expired" ||
      payload.status === "consumed"
        ? payload.status
        : "pending",
    qr_code_url: asString(payload.qr_code_url),
    expires_at: asString(payload.expires_at),
    poll_interval_ms:
      typeof payload.poll_interval_ms === "number" && Number.isFinite(payload.poll_interval_ms)
        ? payload.poll_interval_ms
        : 2000,
  };
}

export async function getRemoteWechatLoginSessionStatus(loginSessionId: string): Promise<{
  login_session_id: string;
  status: "pending" | "authenticated" | "expired" | "consumed";
  expires_at: string;
}> {
  const payload = await requestJson<UpstreamWechatLoginSessionStatus>(
    `/agent-auth/wechat-official/login-sessions/${loginSessionId}`,
    { method: "GET" },
  );
  return {
    login_session_id: asString(payload.login_session_id),
    status:
      payload.status === "authenticated" ||
      payload.status === "expired" ||
      payload.status === "consumed"
        ? payload.status
        : "pending",
    expires_at: asString(payload.expires_at),
  };
}

export async function exchangeRemoteWechatLoginSession(
  loginSessionId: string,
): Promise<AgentAuthPayload> {
  const payload = await requestJson<UpstreamAuthPayload>(
    `/agent-auth/wechat-official/login-sessions/${loginSessionId}/exchange`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
  return normalizePayload(payload);
}

export async function requestRemoteEmailLoginChallenge(email: string): Promise<{
  login_challenge_id: string;
  expires_at: string;
  cooldown_seconds: number;
}> {
  const payload = await requestJson<UpstreamEmailLoginChallenge>("/agent-auth/email-login/challenges", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  return {
    login_challenge_id: asString(payload.login_challenge_id),
    expires_at: asString(payload.expires_at),
    cooldown_seconds:
      typeof payload.cooldown_seconds === "number" && Number.isFinite(payload.cooldown_seconds)
        ? payload.cooldown_seconds
        : 60,
  };
}

export async function verifyRemoteEmailLoginChallenge(
  loginChallengeId: string,
  verificationCode: string,
): Promise<AgentAuthPayload> {
  const payload = await requestJson<UpstreamAuthPayload>(
    `/agent-auth/email-login/challenges/${loginChallengeId}/verify`,
    {
      method: "POST",
      body: JSON.stringify({ verification_code: verificationCode }),
    },
  );
  return normalizePayload(payload);
}

export const __internal__ = {
  resolveApiBaseUrl,
};

export type { RemoteAuthErrorOptions };
