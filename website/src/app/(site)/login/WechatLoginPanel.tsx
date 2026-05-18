'use client'

import { useEffect, useRef, useState } from 'react'

import type {
  ApiErrorPayload,
  AuthState,
  WechatLoginSession,
  WechatLoginSessionStatus,
} from '@/features/auth/types'

type SessionResponse = { session: WechatLoginSession }
type StatusResponse = { status: WechatLoginSessionStatus }
type ExchangeResponse = { state: AuthState }

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    'error' in value &&
    typeof (value as ApiErrorPayload).error?.message === 'string'
  )
}

async function parseApiError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as unknown
    if (isApiErrorPayload(payload)) return payload.error.message
  } catch {
    return '请求失败，请稍后重试'
  }
  return '请求失败，请稍后重试'
}

type PanelState =
  | { phase: 'loading' }
  | { phase: 'ready'; session: WechatLoginSession; secondsLeft: number }
  | { phase: 'exchanging' }
  | { phase: 'done' }
  | { phase: 'error'; message: string }

type WechatLoginPanelProps = {
  onSuccess: (state: AuthState) => void
}

export function WechatLoginPanel({ onSuccess }: WechatLoginPanelProps) {
  const [sessionKey, setSessionKey] = useState(0)
  const [panelState, setPanelState] = useState<PanelState>({ phase: 'loading' })
  const [isMobile, setIsMobile] = useState(false)

  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])

  // 每次 sessionKey 变化时启动一个新会话（含首次挂载）
  useEffect(() => {
    const ctrl = new AbortController()
    const { signal } = ctrl
    let pollTimer: ReturnType<typeof setTimeout> | null = null
    let countdownTimer: ReturnType<typeof setInterval> | null = null
    let pollFailures = 0

    const cleanup = () => {
      ctrl.abort()
      if (pollTimer !== null) clearTimeout(pollTimer)
      if (countdownTimer !== null) clearInterval(countdownTimer)
    }

    const doExchange = async (sessionId: string) => {
      if (pollTimer !== null) clearTimeout(pollTimer)
      if (countdownTimer !== null) clearInterval(countdownTimer)
      if (signal.aborted) return
      setPanelState({ phase: 'exchanging' })
      try {
        const resp = await fetch(
          `/api/auth/wechat-login/sessions/${encodeURIComponent(sessionId)}/exchange`,
          { method: 'POST', signal },
        )
        if (signal.aborted) return
        if (!resp.ok) {
          let errorCode = ''
          let errorMessage = '登录失败，请重试'
          try {
            const body = (await resp.json()) as unknown
            if (isApiErrorPayload(body)) {
              errorCode = body.error.code
              errorMessage = body.error.message
            }
          } catch {
            // ignore parse failures, use defaults
          }
          if (errorCode === 'AGENT_AUTH.WECHAT_IDENTITY_NOT_SUBSCRIBED') {
            setSessionKey((k) => k + 1)
            return
          }
          if (errorCode === 'USER.DISABLED') {
            setPanelState({ phase: 'error', message: '账户已被禁用，请联系客服' })
            return
          }
          setPanelState({ phase: 'error', message: errorMessage })
          return
        }
        const { state: authState } = (await resp.json()) as ExchangeResponse
        setPanelState({ phase: 'done' })
        onSuccessRef.current(authState)
      } catch {
        if (signal.aborted) return
        setPanelState({ phase: 'error', message: '登录失败，请重试' })
      }
    }

    void (async () => {
      setPanelState({ phase: 'loading' })
      pollFailures = 0
      try {
        const resp = await fetch('/api/auth/wechat-login/sessions', {
          method: 'POST',
          signal,
        })
        if (signal.aborted) return
        if (!resp.ok) {
          setPanelState({ phase: 'error', message: await parseApiError(resp) })
          return
        }
        const { session } = (await resp.json()) as SessionResponse
        const secondsLeft = Math.max(
          10,
          Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000),
        )
        setPanelState({ phase: 'ready', session, secondsLeft })

        // 倒计时：每秒递减，归零时触发新会话
        countdownTimer = setInterval(() => {
          setPanelState((prev) => {
            if (prev.phase !== 'ready') return prev
            const next = prev.secondsLeft - 1
            if (next <= 0) {
              setSessionKey((k) => k + 1)
              return { phase: 'loading' }
            }
            return { ...prev, secondsLeft: next }
          })
        }, 1000)

        // 轮询：按后端返回的间隔检查会话状态
        const poll = async () => {
          if (signal.aborted) return
          try {
            const pollResp = await fetch(
              `/api/auth/wechat-login/sessions/${encodeURIComponent(session.login_session_id)}`,
              { signal },
            )
            if (signal.aborted) return
            if (!pollResp.ok) {
              pollFailures++
              if (pollFailures >= 3) {
                setPanelState({ phase: 'error', message: '网络连接不稳定，请刷新二维码' })
                return
              }
            } else {
              pollFailures = 0
              const { status } = (await pollResp.json()) as StatusResponse
              if (status.status === 'authenticated') {
                await doExchange(session.login_session_id)
                return
              }
              if (status.status === 'consumed' || status.status === 'expired') {
                setSessionKey((k) => k + 1)
                return
              }
            }
          } catch {
            if (signal.aborted) return
            pollFailures++
            if (pollFailures >= 3) {
              setPanelState({ phase: 'error', message: '网络连接不稳定，请刷新二维码' })
              return
            }
          }
          if (!signal.aborted) {
            pollTimer = setTimeout(poll, session.poll_interval_ms)
          }
        }
        pollTimer = setTimeout(poll, session.poll_interval_ms)
      } catch {
        if (signal.aborted) return
        setPanelState({ phase: 'error', message: '服务暂时不可用，请重试' })
      }
    })()

    return cleanup
  }, [sessionKey])

  const bizmid = process.env.NEXT_PUBLIC_WECHAT_OFFICIAL_BIZMID

  return (
    <div>
      {panelState.phase === 'loading' && (
        <div className="flex h-44 items-center justify-center">
          <p className="text-sm text-muted">正在生成二维码...</p>
        </div>
      )}

      {panelState.phase === 'ready' && (
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-sm text-ink-soft">扫码关注公众号即可登录</p>
          {isMobile && bizmid ? (
            <a
              href={`https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=${encodeURIComponent(bizmid)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full items-center justify-center rounded-[6px] bg-[#07C160] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              在微信中打开
            </a>
          ) : (
            <img
              src={panelState.session.qr_code_url}
              alt="微信登录二维码"
              width={144}
              height={144}
              className="rounded-[6px]"
            />
          )}
          <p className="text-xs text-muted">二维码将在 {panelState.secondsLeft} 秒后刷新</p>
        </div>
      )}

      {panelState.phase === 'exchanging' && (
        <div className="flex h-44 items-center justify-center">
          <p className="text-sm text-muted">正在登录...</p>
        </div>
      )}

      {panelState.phase === 'error' && (
        <div className="flex h-44 flex-col items-center justify-center gap-3">
          <p className="text-sm text-red-100">{panelState.message}</p>
          <button
            type="button"
            onClick={() => setSessionKey((k) => k + 1)}
            className="inline-flex h-9 items-center rounded-[6px] border border-hairline px-4 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            重新获取二维码
          </button>
        </div>
      )}
    </div>
  )
}
