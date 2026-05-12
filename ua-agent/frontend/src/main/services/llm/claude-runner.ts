import { execFile, spawn, type ChildProcess } from 'node:child_process'
import { promisify } from 'node:util'
import { BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { getSettingsSync } from '../settings/store'

const execFileAsync = promisify(execFile)

// Inline progress event shape — keeps this file self-contained.
type ClaudeRunProgressEvent = {
  runId: string
  kind: 'stdout' | 'stderr' | 'exit'
  data?: string
  code?: number | null
}

function claudeBin(): string {
  const override = getSettingsSync().llm.claudeCode.binPath?.trim()
  return override && override.length > 0 ? override : 'claude'
}

function useShell(): boolean {
  return process.platform === 'win32'
}

function networkEnv(): Record<string, string> {
  const { network, llm } = getSettingsSync()
  const env: Record<string, string> = {}
  if (network.httpsProxy) env.HTTPS_PROXY = network.httpsProxy
  if (network.httpProxy) env.HTTP_PROXY = network.httpProxy
  if (network.noProxy) env.NO_PROXY = network.noProxy
  if (llm.claudeCode.apiKey) env.ANTHROPIC_API_KEY = llm.claudeCode.apiKey
  return env
}

let claudeCache: { available: boolean; version?: string } | null = null

export function resetClaudeCache(): void {
  claudeCache = null
}

export async function detectClaude(
  force = false
): Promise<{ available: boolean; version?: string }> {
  if (claudeCache && !force) return claudeCache
  try {
    const { stdout } = await execFileAsync(claudeBin(), ['--version'], {
      windowsHide: true,
      shell: useShell()
    })
    claudeCache = { available: true, version: stdout.trim() }
  } catch (err) {
    claudeCache = { available: false }
    log.warn('[claude-runner] detect failed', String(err))
  }
  log.info('[claude-runner] cli detected', {
    available: claudeCache.available,
    version: claudeCache.version,
    authMode: getSettingsSync().llm.claudeCode.apiKey ? 'api-key' : 'claude-login-or-other'
  })
  return claudeCache
}

const runningProcs = new Map<string, ChildProcess>()

/** Structured timeline events parsed from claude's stream-json output. */
export type ClaudeStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'thinking'; text: string }
  | { type: 'tool-use'; id: string; name: string; input: unknown }
  | { type: 'tool-result'; toolUseId: string; content: string; isError?: boolean }

export interface ClaudeRunOptions {
  runId: string
  prompt: string
  cwd: string
  /** Extra CLI args appended after the built-in ones. */
  extraArgs?: string[]
  env?: Record<string, string>
  /** When set, launches the turn with `--resume <id>` to continue an existing Claude session. */
  resumeSessionId?: string
  /**
   * When true (default), forwards assistant text deltas as `stdout` progress events so callers
   * can show a live log. ai-chat sets this to false — it consumes `onStreamEvent` instead.
   */
  emitAssistantText?: boolean
  onChunk?: (kind: 'stdout' | 'stderr', data: string) => void
  /** Called with the Claude session_id parsed out of the stream-json init event. */
  onSessionId?: (sessionId: string) => void
  /** Called for each parsed timeline block (text/thinking/tool-use/tool-result). */
  onStreamEvent?: (evt: ClaudeStreamEvent) => void
  onClose?: (code: number | null, final: ClaudeRunFinal) => void
}

export interface ClaudeRunFinal {
  /** Final assistant text extracted from the `result` event. Empty when the turn errored. */
  resultText: string
  /** Human-readable error message captured from `result.is_error` or an equivalent signal. */
  resultError: string | null
  /** Session id captured from the `system.init` event (may be absent on failure). */
  sessionId: string | null
  /** True when the runner detected a "resume failed" signal (stale / unknown session id). */
  resumeFailed: boolean
}

interface StreamJsonContentBlock {
  type: string
  text?: string
  thinking?: string
  // tool_use
  id?: string
  name?: string
  input?: unknown
  // tool_result
  tool_use_id?: string
  content?: string | Array<{ type: string; text?: string }>
  is_error?: boolean
}

interface StreamJsonMessage {
  type: string
  subtype?: string
  session_id?: string
  is_error?: boolean
  errors?: string[]
  result?: string
  message?: { content?: StreamJsonContentBlock[] }
}

function textFromContent(content?: StreamJsonContentBlock[]): string {
  if (!content) return ''
  const parts: string[] = []
  for (const block of content) {
    if (block.type === 'text' && typeof block.text === 'string') parts.push(block.text)
  }
  return parts.join('')
}

function toolResultText(content: StreamJsonContentBlock['content']): string {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  const parts: string[] = []
  for (const block of content) {
    if (block && typeof block === 'object' && typeof block.text === 'string') {
      parts.push(block.text)
    }
  }
  return parts.join('')
}

const RESUME_FAIL_PATTERNS = [
  /no such session/i,
  /session .* not found/i,
  /could not (?:find|resume)/i,
  /invalid session/i
]

function looksLikeResumeFailure(text: string): boolean {
  if (!text) return false
  return RESUME_FAIL_PATTERNS.some((re) => re.test(text))
}

export async function runClaudeStreaming(
  opts: ClaudeRunOptions,
  win: BrowserWindow
): Promise<void> {
  const detected = await detectClaude()
  if (!detected.available) {
    throw new Error(
      'claude CLI 未检测到。请先安装 Claude Code CLI 并确保 `claude --version` 能在命令行执行。'
    )
  }
  const { cwd } = opts
  const netEnv = networkEnv()

  const emitAssistantText = opts.emitAssistantText !== false
  const send = (evt: ClaudeRunProgressEvent): void => {
    if (!win.isDestroyed()) win.webContents.send('claude-run-progress', evt)
  }
  const emitStdout = (data: string): void => {
    if (!data) return
    opts.onChunk?.('stdout', data)
    if (emitAssistantText) send({ runId: opts.runId, kind: 'stdout', data })
  }
  const emitStderr = (data: string): void => {
    if (!data) return
    opts.onChunk?.('stderr', data)
    send({ runId: opts.runId, kind: 'stderr', data })
  }

  const args = [
    '-p',
    '--dangerously-skip-permissions',
    '--output-format',
    'stream-json',
    '--verbose',
    ...(opts.resumeSessionId ? ['--resume', opts.resumeSessionId] : []),
    ...(opts.extraArgs ?? [])
  ]

  log.info('[claude-runner] spawn', {
    runId: opts.runId,
    cwd,
    bin: claudeBin(),
    proxy: netEnv.HTTPS_PROXY ?? netEnv.HTTP_PROXY ?? null
  })

  const child = spawn(claudeBin(), args, {
    cwd,
    env: { ...process.env, ...netEnv, ...(opts.env ?? {}) },
    windowsHide: true,
    shell: useShell()
  })
  runningProcs.set(opts.runId, child)

  if (child.stdin) {
    child.stdin.end(opts.prompt)
  }

  let stdoutBuf = ''
  let resultText = ''
  let resultErr: string | null = null
  let capturedSessionId: string | null = null
  let resumeFailed = false

  const emitStreamEvent = (evt: ClaudeStreamEvent): void => {
    opts.onStreamEvent?.(evt)
  }

  const processLine = (line: string): void => {
    const trimmed = line.trim()
    if (!trimmed) return
    try {
      const msg = JSON.parse(trimmed) as StreamJsonMessage
      if (msg.type === 'system' && msg.subtype === 'init') {
        if (typeof msg.session_id === 'string' && msg.session_id) {
          capturedSessionId = msg.session_id
          opts.onSessionId?.(msg.session_id)
        }
        log.debug('[claude-runner] system', {
          runId: opts.runId,
          subtype: msg.subtype,
          sessionId: msg.session_id
        })
      } else if (msg.type === 'assistant') {
        const blocks = msg.message?.content ?? []
        for (const block of blocks) {
          if (block.type === 'text' && typeof block.text === 'string' && block.text) {
            emitStreamEvent({ type: 'text', text: block.text })
          } else if (block.type === 'thinking' && typeof block.thinking === 'string') {
            emitStreamEvent({ type: 'thinking', text: block.thinking })
          } else if (block.type === 'tool_use' && typeof block.id === 'string') {
            emitStreamEvent({
              type: 'tool-use',
              id: block.id,
              name: typeof block.name === 'string' ? block.name : 'tool',
              input: block.input ?? {}
            })
          }
        }
        const text = textFromContent(blocks)
        if (text) emitStdout(text)
      } else if (msg.type === 'user') {
        // Tool results come back wrapped as a synthetic user message.
        const blocks = msg.message?.content ?? []
        for (const block of blocks) {
          if (block.type === 'tool_result' && typeof block.tool_use_id === 'string') {
            emitStreamEvent({
              type: 'tool-result',
              toolUseId: block.tool_use_id,
              content: toolResultText(block.content),
              isError: block.is_error === true
            })
          }
        }
      } else if (msg.type === 'result') {
        if (typeof msg.result === 'string') resultText = msg.result
        if (msg.is_error) {
          resultErr =
            msg.errors && msg.errors.length
              ? msg.errors.join('\n')
              : msg.subtype === 'error_max_turns'
                ? 'max turns reached'
                : 'claude CLI returned error result'
          if (opts.resumeSessionId && looksLikeResumeFailure(resultErr)) {
            resumeFailed = true
          }
        }
      } else {
        log.debug('[claude-runner] event', { runId: opts.runId, type: msg.type })
      }
    } catch {
      // Not JSON — emit as stderr so callers can still see raw diagnostics.
      emitStderr(line.endsWith('\n') ? line : line + '\n')
    }
  }

  child.stdout?.setEncoding('utf8')
  child.stdout?.on('data', (chunk: string) => {
    stdoutBuf += chunk
    let idx: number
    while ((idx = stdoutBuf.indexOf('\n')) !== -1) {
      const line = stdoutBuf.slice(0, idx)
      stdoutBuf = stdoutBuf.slice(idx + 1)
      processLine(line)
    }
  })

  child.stderr?.setEncoding('utf8')
  child.stderr?.on('data', (chunk: string) => {
    if (opts.resumeSessionId && looksLikeResumeFailure(chunk)) resumeFailed = true
    emitStderr(chunk)
  })

  let spawnErr: Error | null = null
  child.on('error', (err) => {
    spawnErr = err
    emitStderr(String(err))
    log.error('[claude-runner] spawn error', { runId: opts.runId, err: String(err) })
  })

  const exitCode: number | null = await new Promise<number | null>((resolve) => {
    child.on('close', (code) => {
      if (stdoutBuf.length > 0) {
        processLine(stdoutBuf)
        stdoutBuf = ''
      }
      runningProcs.delete(opts.runId)
      resolve(code)
    })
  })

  if (resultErr) emitStderr(resultErr)
  const finalCode = spawnErr ? null : exitCode
  send({ runId: opts.runId, kind: 'exit', code: finalCode })
  opts.onClose?.(finalCode, {
    resultText,
    resultError: resultErr,
    sessionId: capturedSessionId,
    resumeFailed
  })
}

export function cancelClaude(runId: string): boolean {
  const child = runningProcs.get(runId)
  if (!child) return false
  try {
    child.kill('SIGTERM')
  } catch (err) {
    log.warn('[claude-runner] cancel failed', { runId, err: String(err) })
  }
  runningProcs.delete(runId)
  return true
}
