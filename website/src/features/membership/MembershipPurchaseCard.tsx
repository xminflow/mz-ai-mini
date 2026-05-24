'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import type { AuthState } from '@/features/auth/types'

import { createMembershipOrder, MembershipApiError } from './api'
import { PaymentQrCodeModal } from './PaymentQrCodeModal'
import type { CreateOrderResponse, MyMembershipResponse } from './types'

export const ANNUAL_PRICE_YUAN = 499

type MembershipPurchaseCardProps = {
  authState: AuthState | null
  membership: MyMembershipResponse | null
  actionLabel: string
  sku?: 'annual_normal' | 'annual_premium'
  priceYuan?: number
  priceNote?: string
  tierLabel?: string
  features?: string[]
  className?: string
  showStatus?: boolean
  variant?: 'pricing' | 'compact'
  locked?: boolean
  lockedNote?: string
}

function formatDate(value: string | null): string {
  if (!value) return '未开通'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

function resolveStatusLabel(membership: MyMembershipResponse | null): string {
  if (membership?.is_active) return '有效中'
  if (membership?.tier === 'normal' || membership?.tier === 'premium') return '已过期'
  return '未开通'
}

export function MembershipPurchaseCard({
  authState,
  membership,
  actionLabel,
  sku = 'annual_premium',
  priceYuan = ANNUAL_PRICE_YUAN,
  priceNote,
  tierLabel = '年度会员',
  features,
  className = '',
  showStatus = true,
  variant = 'pricing',
  locked = false,
  lockedNote = '已升级至更高等级，无需购买此档',
}: MembershipPurchaseCardProps) {
  const router = useRouter()
  const [order, setOrder] = useState<CreateOrderResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    if (authState?.authenticated !== true) {
      router.push('/login?next=/pricing')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const createdOrder = await createMembershipOrder(sku)
      setOrder(createdOrder)
      setModalOpen(true)
    } catch (purchaseError) {
      if (purchaseError instanceof MembershipApiError && purchaseError.status === 401) {
        router.push('/login?next=/pricing')
        return
      }
      console.error({ scope: 'membership', endpoint: 'create_order', error: purchaseError })
      setError(
        purchaseError instanceof Error ? purchaseError.message : '创建订单失败，请稍后重试',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const isCompact = variant === 'compact'

  return (
    <>
      <aside
        className={[
          'rounded-[8px] border border-hairline bg-surface/80 shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl',
          isCompact ? 'p-5 sm:p-6' : 'p-5 sm:p-6',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="flex items-end justify-between gap-4">
          <div>
            <span
              className={[
                'inline-flex items-center rounded-full px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.14em]',
                sku === 'annual_premium'
                  ? 'border border-amber-300/40 bg-amber-300/10 text-amber-200'
                  : 'border border-hairline bg-canvas/60 text-ink-soft',
              ].join(' ')}
            >
              {tierLabel}
            </span>
            <p className="mt-3 text-4xl font-semibold text-ink">¥{priceYuan}</p>
          </div>
          <p className="pb-1 text-sm text-muted">/ 年</p>
        </div>

        {priceNote && (
          <p className="mt-2 text-xs leading-5 text-accent-2">{priceNote}</p>
        )}

        {features && features.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-hairline pt-4">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-0.5 shrink-0 text-accent-2">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {showStatus && (
          <div className="mt-6 space-y-3 border-t border-hairline pt-5 text-sm text-ink-soft">
            <div className="flex justify-between gap-4">
              <span>当前状态</span>
              <span className="text-ink">{resolveStatusLabel(membership)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>到期时间</span>
              <span className="text-ink">{formatDate(membership?.expires_at ?? null)}</span>
            </div>
          </div>
        )}

        {locked ? (
          <div className="mt-6 flex h-12 w-full items-center justify-center rounded-[6px] border border-hairline bg-surface/40 px-5 text-sm text-muted">
            {lockedNote}
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handlePurchase}
              disabled={submitting}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-[6px] bg-ink px-5 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? '正在创建订单...' : actionLabel}
            </button>

            {error && (
              <p className="mt-4 rounded-[6px] border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            )}

            <p className="mt-4 text-xs leading-5 text-muted">
              微信扫码支付。二维码有效期 15 分钟，支付成功后页面会自动确认订单状态。
            </p>
          </>
        )}
      </aside>

      <PaymentQrCodeModal
        open={modalOpen}
        order={order}
        onClose={() => setModalOpen(false)}
        onRetry={handlePurchase}
      />
    </>
  )
}
