'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import type { AuthState } from '@/features/auth/types'
import type { MyMembershipResponse } from '@/features/membership/types'

type MembershipSubmissionGateProps = {
  authState: AuthState | null
  membership: MyMembershipResponse | null
  loading: boolean
  children: ReactNode
}

export function MembershipSubmissionGate({
  authState,
  membership,
  loading,
  children,
}: MembershipSubmissionGateProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-hairline bg-surface/40 p-6 sm:rounded-[22px]">
        <div className="h-4 w-32 animate-pulse rounded-full bg-surface-2/60" />
        <div className="mt-3 h-3 w-48 animate-pulse rounded-full bg-surface-2/40" />
      </div>
    )
  }

  if (!authState?.authenticated) {
    return (
      <GateCallout
        title="登录后即可免费提交"
        description="使用微信或邮箱登录后，将进入提交表单。"
        actionLabel="去登录"
        actionHref="/login?next=/membership"
      />
    )
  }

  if (!membership?.is_active) {
    return (
      <GateCallout
        title="会员专享 · 一年 499 元"
        description={
          membership?.tier === 'normal'
            ? '会员已到期，续费后可继续提交博主 / 赛道。'
            : '开通会员后即可每月免费提交博主拆解与赛道分析。'
        }
        actionLabel={membership?.tier === 'normal' ? '续费会员' : '开通会员'}
        actionHref="/pricing"
      />
    )
  }

  return <>{children}</>
}

type GateCalloutProps = {
  title: string
  description: string
  actionLabel: string
  actionHref: string
}

function GateCallout({ title, description, actionLabel, actionHref }: GateCalloutProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface/40 p-6 backdrop-blur sm:rounded-[22px] sm:p-7">
      <h4 className="font-serif-zh text-[16px] font-semibold text-ink sm:text-[17px]">{title}</h4>
      <p className="text-[13px] leading-[1.85] text-muted sm:text-[13.5px]">{description}</p>
      <Link
        href={actionHref}
        className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-[12.5px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:text-[13px]"
      >
        {actionLabel}
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden>
          <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
        </svg>
      </Link>
    </div>
  )
}
