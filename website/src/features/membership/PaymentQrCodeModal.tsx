'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

import { usePollMembershipOrder } from './usePollMembershipOrder'
import type { CreateOrderResponse } from './types'

type PaymentQrCodeModalProps = {
  open: boolean
  order: CreateOrderResponse | null
  onClose: () => void
  onRetry: () => void
}

function formatCurrency(amountFen: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(amountFen / 100)
}

function formatCountdown(expiresAt: string | null, nowMs: number): string {
  if (!expiresAt) return '00:00'
  const remainingMs = Math.max(0, new Date(expiresAt).getTime() - nowMs)
  const totalSeconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function PaymentQrCodeModal({
  open,
  order,
  onClose,
  onRetry,
}: PaymentQrCodeModalProps) {
  const router = useRouter()
  const [nowMs, setNowMs] = useState(() => Date.now())
  const pollState = usePollMembershipOrder({
    orderNo: order?.order_no ?? null,
    qrExpiresAt: order?.qr_expires_at ?? null,
    enabled: open && Boolean(order),
  })

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !order) return
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [open, order])

  useEffect(() => {
    if (pollState.status !== 'paid') return
    const timeoutId = window.setTimeout(() => {
      router.push('/account')
    }, 1500)
    return () => window.clearTimeout(timeoutId)
  }, [pollState.status, router])

  const countdown = formatCountdown(order?.qr_expires_at ?? null, nowMs)

  const stateLabel = useMemo(() => {
    if (!order) return '正在创建订单'
    if (pollState.status === 'paid') return '支付成功'
    if (pollState.status === 'closed') return '订单已关闭'
    if (pollState.status === 'expired') return '二维码已过期'
    if (pollState.status === 'error') return '查询失败'
    return '等待微信支付'
  }, [order, pollState.status])

  const terminalMessage =
    pollState.status === 'paid'
      ? '会员已开通，可前往账户页查看有效期。'
      : pollState.status === 'closed' || pollState.status === 'expired' || pollState.status === 'error'
        ? pollState.error
        : null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="membership-payment-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-canvas/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="membership-payment-panel"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md rounded-[8px] border border-hairline bg-surface p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] sm:p-6">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface/80 text-muted transition-colors hover:text-ink"
                aria-label="关闭"
              >
                <span aria-hidden className="text-lg leading-none">
                  ×
                </span>
              </button>

              <div className="pr-8">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent-2">
                  WeChat Pay
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-ink">{stateLabel}</h2>
                {order && (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    订单 {order.order_no} · {formatCurrency(order.amount_fen)}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <div className="flex h-64 w-64 items-center justify-center rounded-[8px] border border-hairline bg-white p-4">
                  {order?.code_url && pollState.status !== 'paid' ? (
                    <QRCodeSVG value={order.code_url} size={220} level="M" includeMargin />
                  ) : (
                    <div className="text-center text-sm text-muted">
                      {pollState.status === 'paid' ? '支付已完成' : '订单生成中'}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 min-h-14 rounded-[8px] border border-hairline bg-canvas/45 px-4 py-3">
                {terminalMessage ? (
                  <p className="text-sm leading-6 text-ink-soft">{terminalMessage}</p>
                ) : (
                  <div className="flex items-center justify-between gap-4 text-sm text-ink-soft">
                    <span>请使用微信扫码支付</span>
                    <span className="font-mono tabular text-accent-2">{countdown}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {pollState.status === 'paid' ? (
                  <a
                    href="/account"
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-[6px] bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90"
                  >
                    查看会员
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={onRetry}
                    disabled={pollState.status === 'polling'}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-[6px] border border-hairline-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    重新生成
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 flex-1 items-center justify-center rounded-[6px] border border-hairline bg-canvas px-4 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  关闭
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
