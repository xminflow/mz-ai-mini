'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

import { usePollMembershipOrder } from './usePollMembershipOrder'
import type { CreateCampOrderResponse } from './types'

type PaymentQrCodeModalProps = {
  open: boolean
  order: CreateCampOrderResponse | null
  onClose: () => void
  onRetry: () => void
  onPaid: () => void
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
  const ts = expiresAt.endsWith('Z') || expiresAt.includes('+') ? expiresAt : `${expiresAt}Z`
  const remainingMs = Math.max(0, new Date(ts).getTime() - nowMs)
  const totalSeconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function PaymentQrCodeModal({ open, order, onClose, onRetry, onPaid }: PaymentQrCodeModalProps) {
  const [nowMs, setNowMs] = useState(() => Date.now())
  // qr_expires_at 为 naive UTC，轮询 hook 与倒计时都需按 UTC 解析；统一加 Z。
  const qrExpiresAtUtc = order?.qr_expires_at
    ? order.qr_expires_at.endsWith('Z') || order.qr_expires_at.includes('+')
      ? order.qr_expires_at
      : `${order.qr_expires_at}Z`
    : null
  const pollState = usePollMembershipOrder({
    orderNo: order?.order_no ?? null,
    qrExpiresAt: qrExpiresAtUtc,
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
    const id = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [open, order])

  // 支付成功：刷新登录态（拉取带新等级的 /me），由父组件 onPaid 处理。
  useEffect(() => {
    if (pollState.status !== 'paid') return
    const id = window.setTimeout(() => onPaid(), 1200)
    return () => window.clearTimeout(id)
  }, [pollState.status, onPaid])

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
      ? '会员已开通，正在刷新登录状态…'
      : pollState.status === 'closed' || pollState.status === 'expired' || pollState.status === 'error'
        ? pollState.error
        : null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="camp-payment-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-canvas/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="camp-payment-panel"
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
                <span aria-hidden className="text-lg leading-none">×</span>
              </button>

              <div className="pr-8">
                <h2 className="text-2xl font-semibold text-ink">{stateLabel}</h2>
                {order && (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    订单 {order.order_no} · {formatCurrency(order.amount_fen)}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <div className="flex h-64 w-64 items-center justify-center rounded-[8px] border border-hairline bg-white p-4">
                  {order?.code_url && pollState.status !== 'paid' ? (
                    <QRCodeSVG value={order.code_url} size={220} level="M" />
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

              {pollState.status !== 'paid' && (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={onRetry}
                    disabled={pollState.status === 'polling'}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-[6px] border border-hairline-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    重新生成
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-[6px] border border-hairline bg-canvas px-4 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                  >
                    关闭
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
