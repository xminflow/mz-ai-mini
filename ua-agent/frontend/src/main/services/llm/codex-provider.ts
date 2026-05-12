import { cancelCodex, detectCodex, runCodexStreaming } from "./codex-runner";
import { type Provider, registerProvider } from "./provider";

export const codexProvider: Provider = {
  id: "codex",
  async available(force = false) {
    const r = await detectCodex(force);
    if (r.available) {
      return r.version
        ? ({ ok: true, version: r.version } as const)
        : ({ ok: true } as const);
    }
    return { ok: false, reason: "codex CLI not detected on PATH or via settings.binPath" } as const;
  },
  async run(opts, win) {
    await runCodexStreaming(
      {
        runId: opts.runId,
        prompt: opts.prompt,
        cwd: opts.cwd,
        ...(opts.resumeSessionId !== undefined ? { resumeSessionId: opts.resumeSessionId } : {}),
        ...(opts.env !== undefined ? { env: opts.env } : {}),
        ...(opts.onSessionId !== undefined ? { onSessionId: opts.onSessionId } : {}),
        ...(opts.onChunk !== undefined ? { onChunk: opts.onChunk } : {}),
        ...(opts.onStreamEvent !== undefined ? { onStreamEvent: opts.onStreamEvent } : {}),
        ...(opts.onClose !== undefined ? { onClose: opts.onClose } : {}),
      },
      win,
    );
  },
  cancel(runId) {
    return cancelCodex(runId);
  },
};

export function registerCodexProvider(): void {
  registerProvider(codexProvider);
}
