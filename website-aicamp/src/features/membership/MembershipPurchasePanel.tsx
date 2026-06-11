'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { createCampMembershipOrder, MembershipApiError } from './api'
import { PaymentQrCodeModal } from './PaymentQrCodeModal'
import type { CampMembershipSku, CreateCampOrderResponse, MyCampMembershipResponse } from './types'

type TierColumn = {
  sku: CampMembershipSku | null
  name: string
  priceYuan: number | null
  features: string[]
}

const COLUMNS: TierColumn[] = [
  { sku: null, name: '普通', priceYuan: null, features: ['注册即得', '可浏览公开内容'] },
  { sku: 'annual_basic', name: '基础', priceYuan: 1999, features: ['零基础 AI 编程全章', '一年有效期'] },
  { sku: 'annual_premium', name: '高级', priceYuan: 3999, features: ['含基础全部', 'AI 编程专家进阶', '一年有效期'] },
]

type Props = {
  authenticated: boolean
  membership: MyCampMembershipResponse | null
}

export function MembershipPurchasePanel({ authenticated, membership }: Props) {
  const router = useRouter()
  const [order, setOrder] = useState<CreateCampOrderResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submittingSku, setSubmittingSku] = useState<CampMembershipSku | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasActive = membership?.is_active === true

  const handlePurchase = async (sku: CampMembershipSku) => {
    if (!authenticated) {
      router.push('/login?next=/membership')
      return
    }
    setSubmittingSku(sku)
    setError(null)
    try {
      const created = await createCampMembershipOrder(sku)
      setOrder(created)
      setModalOpen(true)
    } catch (e) {
      if (e instanceof MembershipApiError && e.status === 401) {
        router.push('/login?next=/membership')
        return
      }
      setError(e instanceof Error ? e.message : '创建订单失败，请稍后重试')
    } finally {
      setSubmittingSku(null)
    }
  }

  const handlePaid = () => {
    setModalOpen(false)
    // 刷新 server 渲染的登录态（layout 的 getCampAuthState 重新拉 /me，带回新等级）。
    router.refresh()
  }

  return (
    <>
      <div className="grid gap-px overflow-hidden rounded-[8px] border border-hairline bg-hairline sm:grid-cols-3">
        {COLUMNS.map((col) => {
          const isCurrent =
            (col.sku === null && (!membership || membership.tier === 'none' || !hasActive)) ||
            (col.sku === 'annual_basic' && hasActive && membership?.tier === 'basic') ||
            (col.sku === 'annual_premium' && hasActive && membership?.tier === 'premium')
          return (
            <div key={col.name} className="flex flex-col gap-4 bg-canvas p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink">{col.name}</span>
                {isCurrent && <span className="text-[11px] text-accent-2">当前</span>}
              </div>
              <p className="text-3xl font-semibold text-ink">
                {col.priceYuan === null ? '免费' : `¥${col.priceYuan}`}
                {col.priceYuan !== null && <span className="ml-1 text-sm text-muted">/ 年</span>}
              </p>
              <ul className="space-y-2 text-sm text-ink-soft">
                {col.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-accent-2">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {col.sku !== null && (
                <button
                  type="button"
                  onClick={() => handlePurchase(col.sku as CampMembershipSku)}
                  disabled={hasActive || submittingSku !== null}
                  className="mt-auto inline-flex h-11 items-center justify-center rounded-[6px] bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingSku === col.sku ? '创建订单中…' : hasActive ? '会员有效期内' : '立即开通'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {hasActive && (
        <p className="mt-4 text-xs text-muted">会员有效期内不支持升级或重复购买，到期后可再次开通。</p>
      )}
      {error && (
        <p className="mt-4 rounded-[6px] border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p>
      )}

      <PaymentQrCodeModal
        open={modalOpen}
        order={order}
        onClose={() => setModalOpen(false)}
        onRetry={() => order && handlePurchase(order.sku as CampMembershipSku)}
        onPaid={handlePaid}
      />
    </>
  )
}
