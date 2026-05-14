import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  type AgentAuthState,
} from "../../shared/contracts/agent-auth";
import { SCHEMA_VERSION } from "../../shared/contracts/error";
import {
  clearAgentAuthSession,
  readAgentAuthSession,
  saveAgentAuthSession,
  toAuthenticatedState,
} from "../services/auth/session-store";
import {
  createRemoteWechatLoginSession,
  exchangeRemoteWechatLoginSession,
  getRemoteWechatLoginSessionStatus,
  isRemoteAuthError,
  logoutRemoteAgentSession,
  requestRemoteEmailLoginChallenge,
  refreshRemoteAgentSession,
  type RemoteAuthError,
  verifyRemoteEmailLoginChallenge,
} from "../services/auth/remote";

const CHANNEL_GET_STATE = "agent-auth:get-state";
const CHANNEL_REQUEST_EMAIL_LOGIN_CHALLENGE = "agent-auth:request-email-login-challenge";
const CHANNEL_VERIFY_EMAIL_LOGIN_CHALLENGE = "agent-auth:verify-email-login-challenge";
const CHANNEL_START_WECHAT_LOGIN = "agent-auth:start-wechat-login";
const CHANNEL_GET_WECHAT_LOGIN_SESSION = "agent-auth:get-wechat-login-session";
const CHANNEL_EXCHANGE_WECHAT_LOGIN = "agent-auth:exchange-wechat-login";
const CHANNEL_LOGOUT = "agent-auth:logout";

function success(state: AgentAuthState) {
  return {
    schema_version: SCHEMA_VERSION,
    ok: true as const,
    state,
  };
}

function failure(code: string, message: string) {
  return {
    schema_version: SCHEMA_VERSION,
    ok: false as const,
    error: { code, message: message.slice(0, 1024) },
  };
}

function isExpired(iso: string): boolean {
  const timestamp = parseTimestamp(iso);
  if (!Number.isFinite(timestamp)) {
    return true;
  }
  return timestamp <= Date.now();
}

function parseTimestamp(value: string): number {
  const normalized = value.trim();
  if (normalized === "") {
    return Number.NaN;
  }
  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(normalized)) {
    return Date.parse(normalized);
  }
  return Date.parse(`${normalized}Z`);
}

function isSessionExpiredError(error: RemoteAuthError): boolean {
  return error.errorCode === "AGENT_AUTH.REFRESH_TOKEN_EXPIRED";
}

function isSessionRevokedError(error: RemoteAuthError): boolean {
  return error.errorCode === "AGENT_AUTH.SESSION_REVOKED";
}

async function resolveState(): Promise<ReturnType<typeof success> | ReturnType<typeof failure>> {
  let session = null;
  try {
    session = await readAgentAuthSession();
    if (session === null) {
      return success({ authenticated: false, reason: "missing_session" });
    }
    if (!isExpired(session.access_token_expires_at)) {
      return success(toAuthenticatedState(session));
    }
    if (isExpired(session.refresh_token_expires_at)) {
      await clearAgentAuthSession();
      return success({ authenticated: false, reason: "expired" });
    }
    const refreshed = await refreshRemoteAgentSession(session.refresh_token);
    await saveAgentAuthSession(refreshed);
    return success(toAuthenticatedState(await readAgentAuthSession().then((value) => value!)));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "AUTH_STORAGE_UNAVAILABLE") {
      return failure("AUTH_STORAGE_UNAVAILABLE", "当前系统不支持安全加密存储。");
    }
    if (isRemoteAuthError(error) && (isSessionExpiredError(error) || isSessionRevokedError(error))) {
      await clearAgentAuthSession();
      return success({
        authenticated: false,
        reason: isSessionExpiredError(error) ? "expired" : "revoked",
      });
    }
    if (session !== null) {
      log.warn(`agent-auth resolveState refresh failed; keeping session. message=${message}`);
      return success(toAuthenticatedState(session));
    }
    return failure("AUTH_FETCH_FAILED", message);
  }
}

export function registerAgentAuthHandlers(): void {
  ipcMain.handle(CHANNEL_GET_STATE, async () => {
    const result = await resolveState();
    log.info(`${CHANNEL_GET_STATE} invoked -> exit ${result.ok ? 0 : 1}`);
    return result;
  });

  ipcMain.handle(CHANNEL_REQUEST_EMAIL_LOGIN_CHALLENGE, async (_event, rawArgs: unknown) => {
    const email =
      rawArgs && typeof rawArgs === "object" && typeof (rawArgs as { email?: unknown }).email === "string"
        ? (rawArgs as { email: string }).email.trim()
        : "";
    if (email === "") {
      return failure("INVALID_INPUT", "email is required.");
    }
    try {
      const challenge = await requestRemoteEmailLoginChallenge(email);
      log.info(`${CHANNEL_REQUEST_EMAIL_LOGIN_CHALLENGE} invoked -> exit 0 email=${email}`);
      return {
        schema_version: SCHEMA_VERSION,
        ok: true as const,
        challenge,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`${CHANNEL_REQUEST_EMAIL_LOGIN_CHALLENGE} invoked -> exit 1 email=${email} message=${message}`);
      return failure("AUTH_FETCH_FAILED", message);
    }
  });

  ipcMain.handle(CHANNEL_VERIFY_EMAIL_LOGIN_CHALLENGE, async (_event, rawArgs: unknown) => {
    const args =
      rawArgs && typeof rawArgs === "object"
        ? (rawArgs as { loginChallengeId?: unknown; verificationCode?: unknown })
        : {};
    const loginChallengeId =
      typeof args.loginChallengeId === "string" ? args.loginChallengeId.trim() : "";
    const verificationCode =
      typeof args.verificationCode === "string" ? args.verificationCode.trim() : "";
    if (loginChallengeId === "" || verificationCode === "") {
      return failure("INVALID_INPUT", "loginChallengeId and verificationCode are required.");
    }
    try {
      const payload = await verifyRemoteEmailLoginChallenge(loginChallengeId, verificationCode);
      await saveAgentAuthSession(payload);
      log.info(`${CHANNEL_VERIFY_EMAIL_LOGIN_CHALLENGE} invoked -> exit 0 loginChallengeId=${loginChallengeId}`);
      return success(toAuthenticatedState((await readAgentAuthSession())!));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`${CHANNEL_VERIFY_EMAIL_LOGIN_CHALLENGE} invoked -> exit 1 loginChallengeId=${loginChallengeId} message=${message}`);
      return failure("AUTH_FETCH_FAILED", message);
    }
  });

  ipcMain.handle(CHANNEL_START_WECHAT_LOGIN, async () => {
    try {
      const session = await createRemoteWechatLoginSession();
      return {
        schema_version: SCHEMA_VERSION,
        ok: true as const,
        session,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return failure("AUTH_FETCH_FAILED", message);
    }
  });

  ipcMain.handle(CHANNEL_GET_WECHAT_LOGIN_SESSION, async (_event, rawArgs: unknown) => {
    const loginSessionId = typeof rawArgs === "string" ? rawArgs.trim() : "";
    if (loginSessionId === "") {
      return failure("INVALID_INPUT", "login_session_id is required.");
    }
    try {
      const session = await getRemoteWechatLoginSessionStatus(loginSessionId);
      return {
        schema_version: SCHEMA_VERSION,
        ok: true as const,
        session,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return failure("AUTH_FETCH_FAILED", message);
    }
  });

  ipcMain.handle(CHANNEL_EXCHANGE_WECHAT_LOGIN, async (_event, rawArgs: unknown) => {
    const loginSessionId = typeof rawArgs === "string" ? rawArgs.trim() : "";
    if (loginSessionId === "") {
      return failure("INVALID_INPUT", "login_session_id is required.");
    }
    try {
      const payload = await exchangeRemoteWechatLoginSession(loginSessionId);
      await saveAgentAuthSession(payload);
      return success(toAuthenticatedState((await readAgentAuthSession())!));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return failure("AUTH_FETCH_FAILED", message);
    }
  });

  ipcMain.handle(CHANNEL_LOGOUT, async () => {
    try {
      const session = await readAgentAuthSession();
      if (session !== null) {
        await logoutRemoteAgentSession(session.refresh_token);
      }
      await clearAgentAuthSession();
      return success({ authenticated: false, reason: "missing_session" });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return failure("AUTH_FETCH_FAILED", message);
    }
  });
}

export function unregisterAgentAuthHandlers(): void {
  ipcMain.removeHandler(CHANNEL_GET_STATE);
  ipcMain.removeHandler(CHANNEL_REQUEST_EMAIL_LOGIN_CHALLENGE);
  ipcMain.removeHandler(CHANNEL_VERIFY_EMAIL_LOGIN_CHALLENGE);
  ipcMain.removeHandler(CHANNEL_START_WECHAT_LOGIN);
  ipcMain.removeHandler(CHANNEL_GET_WECHAT_LOGIN_SESSION);
  ipcMain.removeHandler(CHANNEL_EXCHANGE_WECHAT_LOGIN);
  ipcMain.removeHandler(CHANNEL_LOGOUT);
}

export const __internal__ = {
  parseTimestamp,
  resolveState,
};
