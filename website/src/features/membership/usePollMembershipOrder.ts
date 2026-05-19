'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { getMembershipOrder } from './api'
import type { OrderStatusResponse } from './types'

const DELAYS_MS = [1000, 1000, 2000, 2000, 3000, 5000]

type PollState =
  | { status: 'idle' | 'polling'; error: null; orderNo: string | null }
  | { status: 'paid'; error: null; result: OrderStatusResponse; orderNo: string }
  | { status: 'closed' | 'expired' | 'error'; error: string; orderNo: string }

type Options = {
  orderNo: string | null
  qrExpiresAt: string | null
  enabled: boolean
}

export function usePollMembershipOrder({ orderNo, qrExpiresAt, enabled }: Options): PollState {
  const [state, setState] = useState<PollState>({ status: 'idle', error: null, orderNo: null })
  const attemptsRef = useRef(0)
  const shouldPoll = enabled && Boolean(orderNo) && Boolean(qrExpiresAt)

  const visibleState = useMemo<PollState>(() => {
    if (!shouldPoll) return { status: 'idle', error: null, orderNo: null }
    if (state.status === 'idle' || state.orderNo !== orderNo) {
      return { status: 'polling', error: null, orderNo }
    }
    return state
  }, [orderNo, shouldPoll, state])

  useEffect(() => {
    if (!shouldPoll || !orderNo || !qrExpiresAt) return

    let cancelled = false
    let timeoutId: number | null = null
    let consecutiveErrors = 0
    attemptsRef.current = 0

    const tick = async () => {
      if (cancelled) return
      if (Date.now() >= new Date(qrExpiresAt).getTime()) {
        setState({ status: 'expired', error: '二维码已过期，请重新生成', orderNo })
        return
      }

      try {
        const result = await getMembershipOrder(orderNo)
        consecutiveErrors = 0
        if (result.status === 'paid') {
          setState({ status: 'paid', error: null, result, orderNo })
          return
        }
        if (result.status === 'closed') {
          setState({ status: 'closed', error: '订单已关闭，请重新生成二维码', orderNo })
          return
        }
      } catch (error) {
        consecutiveErrors += 1
        console.error({ scope: 'membership', endpoint: 'order_status', error })
        if (consecutiveErrors >= 3) {
          setState({ status: 'error', error: '网络异常，请刷新页面重试', orderNo })
          return
        }
      }

      const delay = DELAYS_MS[Math.min(attemptsRef.current, DELAYS_MS.length - 1)]
      attemptsRef.current += 1
      timeoutId = window.setTimeout(tick, delay)
    }

    timeoutId = window.setTimeout(tick, DELAYS_MS[0])
    return () => {
      cancelled = true
      if (timeoutId !== null) window.clearTimeout(timeoutId)
    }
  }, [orderNo, qrExpiresAt, shouldPoll])

  return visibleState
}
