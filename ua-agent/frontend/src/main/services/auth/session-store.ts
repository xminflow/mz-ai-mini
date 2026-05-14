import { app, safeStorage } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { AgentAccount, AgentAuthPayload, AgentAuthState } from "../../../shared/contracts/agent-auth";

interface PersistedAuthSession {
  account: AgentAccount;
  access_token: string;
  access_token_expires_at: string;
  refresh_token: string;
  refresh_token_expires_at: string;
}

function authSessionPath(): string {
  return path.join(app.getPath("userData"), "auth-session.bin");
}

function toPersistedSession(payload: AgentAuthPayload): PersistedAuthSession {
  return {
    account: payload.account,
    access_token: payload.tokens.access_token,
    access_token_expires_at: payload.tokens.access_token_expires_at,
    refresh_token: payload.tokens.refresh_token,
    refresh_token_expires_at: payload.tokens.refresh_token_expires_at,
  };
}

function ensureSafeStorageAvailable(): void {
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error("AUTH_STORAGE_UNAVAILABLE");
  }
}

export async function saveAgentAuthSession(payload: AgentAuthPayload): Promise<void> {
  ensureSafeStorageAvailable();
  const target = authSessionPath();
  await fs.mkdir(path.dirname(target), { recursive: true });
  const encrypted = safeStorage.encryptString(
    JSON.stringify(toPersistedSession(payload)),
  );
  await fs.writeFile(target, encrypted);
}

export async function readAgentAuthSession(): Promise<PersistedAuthSession | null> {
  ensureSafeStorageAvailable();
  try {
    const encrypted = await fs.readFile(authSessionPath());
    const decrypted = safeStorage.decryptString(encrypted);
    return JSON.parse(decrypted) as PersistedAuthSession;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function clearAgentAuthSession(): Promise<void> {
  try {
    await fs.unlink(authSessionPath());
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      throw error;
    }
  }
}

export function toAuthenticatedState(session: PersistedAuthSession): AgentAuthState {
  return {
    authenticated: true,
    account: session.account,
    access_token_expires_at: session.access_token_expires_at,
    refresh_token_expires_at: session.refresh_token_expires_at,
  };
}
