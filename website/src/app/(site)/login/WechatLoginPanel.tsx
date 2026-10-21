'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Button, buttonClassName } from '@/components/ui'

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
    if (isApiErrorPayload(payload)) {
      // 公众号的配置、IP 和请求追踪信息留在服务日志；页面只提供可操作的错误提示。
      console.error('[wechat-login] QR session request failed', { status: response.status, code: payload.error.code })
      return '请稍后重试，或联系我们获取帮助。'
    }
  } catch {
    console.error('[wechat-login] invalid QR session error response', { status: response.status })
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
  // 使用惰性初始化读取 UA，避免在 effect 体内同步调用 setState。
  // SSR 环境 navigator 未定义，守卫返回 false，客户端 hydration 后同步为真实值。
  const [isMobile] = useState(() => typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent))

  const onSuccessRef = useRef(onSuccess)
  // 每次渲染后同步最新回调，确保 effect 内调用时始终拿到最新引用，避免闭包过期。
  useLayoutEffect(() => {
    onSuccessRef.current = onSuccess
  })

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
        // expires_at 从后端返回时不带时区标记（naive UTC），必须追加 Z 按 UTC 解析，
        // 否则中国用户（UTC+8）会把它当本地时间，导致倒计时计算提前 8 小时到期。
        const expiresAtUtc = session.expires_at.endsWith('Z') || session.expires_at.includes('+')
          ? session.expires_at
          : `${session.expires_at}Z`
        const secondsLeft = Math.max(
          30,
          Math.floor((new Date(expiresAtUtc).getTime() - Date.now()) / 1000),
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
    <div aria-live="polite" aria-atomic="true" aria-busy={panelState.phase === 'loading' || panelState.phase === 'exchanging'} className="mt-6 flex min-h-[244px] items-center justify-center">
      {panelState.phase === 'loading' && (
        <div className="flex h-44 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <span aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-2 border-rule border-t-graphite motion-reduce:animate-none" />
            <p className="text-xs text-graphite-soft">正在生成二维码…</p>
          </div>
        </div>
      )}

      {panelState.phase === 'ready' && (
        <div className="flex w-full flex-col items-center gap-4">
          {isMobile && bizmid ? (
            <a
              href={`https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=${encodeURIComponent(bizmid)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName('primary', 'min-h-11')}
            >
              在微信中打开
            </a>
          ) : (
            <img
              src={panelState.session.qr_code_url}
              alt="微信登录二维码"
              width={200}
              height={200}
              className="h-[200px] w-[200px] max-w-full bg-white object-contain"
            />
          )}
          <p className="text-xs tabular-nums text-graphite-dim">{panelState.secondsLeft} 秒后自动刷新</p>
        </div>
      )}

      {panelState.phase === 'exchanging' && (
        <div className="flex h-44 items-center justify-center">
          <p className="text-sm text-graphite-soft">扫码成功，正在登录…</p>
        </div>
      )}

      {panelState.phase === 'error' && (
        <div className="flex min-w-0 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-medium text-graphite">二维码暂时无法加载</p>
          <p role="alert" className="w-full break-words text-xs leading-relaxed text-red-700">{panelState.message}</p>
          <Button
            variant="outline"
            onClick={() => setSessionKey((k) => k + 1)}
          >
            重新获取二维码
          </Button>
        </div>
      )}
    </div>
  )
}
