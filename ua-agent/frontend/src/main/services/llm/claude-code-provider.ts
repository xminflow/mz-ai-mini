import { runClaudeStreaming, cancelClaude, detectClaude } from './claude-runner'
import { type Provider, registerProvider } from './provider'

export const claudeCodeProvider: Provider = {
  id: 'claude-code',
  async available(force = false) {
    const r = await detectClaude(force)
    if (r.available) {
      return r.version
        ? ({ ok: true, version: r.version } as const)
        : ({ ok: true } as const)
    }
    return { ok: false, reason: 'claude CLI not detected on PATH or via settings.binPath' } as const
  },
  async run(opts, win) {
    await runClaudeStreaming(
      {
        runId: opts.runId,
        prompt: opts.prompt,
        cwd: opts.cwd,
        ...(opts.resumeSessionId !== undefined && { resumeSessionId: opts.resumeSessionId }),
        ...(opts.env !== undefined && { env: opts.env }),
        ...(opts.onSessionId !== undefined && { onSessionId: opts.onSessionId }),
        ...(opts.onChunk !== undefined && { onChunk: opts.onChunk }),
        ...(opts.onStreamEvent !== undefined && { onStreamEvent: opts.onStreamEvent }),
        ...(opts.onClose !== undefined && { onClose: opts.onClose }),
      },
      win,
    )
  },
  cancel(runId) {
    return cancelClaude(runId)
  },
}

export function registerClaudeCodeProvider(): void {
  registerProvider(claudeCodeProvider)
}
