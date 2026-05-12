import type { BrowserWindow } from "electron";

export type ProviderId = "claude-code" | "codex" | "kimi";

export type ProviderStreamEvent =
  | { type: "text"; text: string }
  | { type: "thinking"; text: string }
  | { type: "tool-use"; id: string; name: string; input: unknown }
  | { type: "tool-result"; toolUseId: string; content: string; isError?: boolean };

export interface ProviderRunFinal {
  resultText: string;
  resultError: string | null;
  sessionId: string | null;
  resumeFailed: boolean;
}

export interface ProviderRunOptions {
  runId: string;
  prompt: string;
  cwd: string;
  resumeSessionId?: string;
  env?: Record<string, string>;
  onStreamEvent?: (evt: ProviderStreamEvent) => void;
  onSessionId?: (sessionId: string) => void;
  onChunk?: (kind: "stdout" | "stderr", data: string) => void;
  onClose?: (code: number | null, final: ProviderRunFinal) => void;
}

export interface ProviderAvailability {
  ok: boolean;
  version?: string;
  reason?: string;
}

export interface Provider {
  readonly id: ProviderId;
  available(force?: boolean): Promise<ProviderAvailability>;
  run(opts: ProviderRunOptions, win: BrowserWindow): Promise<void>;
  cancel(runId: string): boolean;
}

const registry = new Map<ProviderId, Provider>();

export function registerProvider(provider: Provider): void {
  registry.set(provider.id, provider);
}

export function getProvider(id: ProviderId): Provider | null {
  return registry.get(id) ?? null;
}

export function listProviders(): readonly Provider[] {
  return Array.from(registry.values());
}
