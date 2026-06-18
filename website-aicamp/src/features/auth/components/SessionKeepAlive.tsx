'use client'

import { useEffect, useRef } from 'react'

import { ACCESS_EXPIRES_COOKIE } from '@/features/auth/cookie-names'

// 客户端自动续签：长驻页面（课程区 SPA）里在 access 临近过期前主动 POST /api/auth/refresh，
// 让 access 始终新鲜，从而 SSR 渲染永远不会在只读上下文里被迫轮换而掉线。
// 续签权威仍在服务端：本组件失败时只重排重试、绝不主动登出，避免多标签并发轮换互相作废时误登出，
// 真正的失效由 SSR 自愈跳转 / middleware 统一判定。

const REFRESH_LEAD_MS = 60_000 // 过期前 60s 续签
const MIN_DELAY_MS = 5_000
const MAX_DELAY_MS = 25 * 60 * 1000
const RETRY_DELAY_MS = 30_000 // 续签失败后的退避重试

function readCookie(name: string): string | null {
  const prefix = `${name}=`
  for (const part of document.cookie.split('; ')) {
    if (part.startsWith(prefix)) return decodeURIComponent(part.slice(prefix.length))
  }
  return null
}

function accessExpiresAtMs(): number {
  const raw = readCookie(ACCESS_EXPIRES_COOKIE)
  if (!raw) return Number.NaN
  return new Date(raw).getTime()
}

export function SessionKeepAlive() {
  const inFlight = useRef(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    const clearTimer = () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }

    const schedule = (delayMs: number) => {
      clearTimer()
      if (cancelled) return
      const delay = Math.max(MIN_DELAY_MS, Math.min(MAX_DELAY_MS, delayMs))
      timer.current = setTimeout(refresh, delay)
    }

    const scheduleFromCookie = () => {
      const expMs = accessExpiresAtMs()
      if (!Number.isFinite(expMs)) {
        // 没有可读过期时间（未登录或异常）：拉长轮询，避免空转
        schedule(MAX_DELAY_MS)
        return
      }
      schedule(expMs - Date.now() - REFRESH_LEAD_MS)
    }

    async function refresh() {
      if (cancelled || inFlight.current) return
      // access 还很充裕（可能被其它标签/导航刚续过）：不轮换，按 cookie 重排
      if (accessExpiresAtMs() - Date.now() > REFRESH_LEAD_MS) {
        scheduleFromCookie()
        return
      }
      inFlight.current = true
      try {
        await fetch('/api/auth/refresh', { method: 'POST', cache: 'no-store' })
        // 成功/失败都不在此登出：成功后 cookie 已更新，按新过期重排；失败则退避重试。
      } catch {
        // 网络异常：退避重试
      } finally {
        inFlight.current = false
        if (!cancelled) {
          const expMs = accessExpiresAtMs()
          if (Number.isFinite(expMs) && expMs - Date.now() > REFRESH_LEAD_MS) {
            scheduleFromCookie()
          } else {
            schedule(RETRY_DELAY_MS)
          }
        }
      }
    }

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      // 回到前台：若已过期或临近过期立即续签，否则按 cookie 重排
      if (accessExpiresAtMs() - Date.now() <= REFRESH_LEAD_MS) {
        void refresh()
      } else {
        scheduleFromCookie()
      }
    }

    scheduleFromCookie()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      clearTimer()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return null
}
