'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { AuthState } from '@/features/auth/types'
import { getMyMembership } from '@/features/membership/api'
import type { MyMembershipResponse } from '@/features/membership/types'
import { getMyQuota } from '@/features/member-submissions/api'
import type { QuotaSnapshot } from '@/features/member-submissions/types'

import { ContactQrCodeModal } from '../layout'
import { AuroraBackground, GradientText, Reveal } from '../motion'
import { BloggerSubmissionForm } from '../membership/BloggerSubmissionForm'
import { MembershipBenefitsTable } from '../membership/MembershipBenefitsTable'
import { MembershipServiceSection } from '../membership/MembershipServiceSection'
import { MembershipSubmissionGate } from '../membership/MembershipSubmissionGate'
import { MembershipToolShowcase } from '../membership/MembershipToolShowcase'
import { TrackSubmissionForm } from '../membership/TrackSubmissionForm'

const PLAYBOOK_HIGHLIGHTS = [
  { href: '/playbook/foundations', label: '基本盘 · 三大底层观念' },
  { href: '/playbook/positioning', label: '定位 · 一句话讲清楚你能做什么' },
  { href: '/playbook/topics', label: '选题 · 让账号持续出爆款' },
  { href: '/playbook/scripts', label: '脚本 · 写一条会被看完的视频' },
  { href: '/playbook/growth', label: '增长 · 起号、突围与平台规律' },
  { href: '/playbook/industry', label: '番外卷 · 五大行业实战拆解' },
]

export function MembershipContent() {
  const [authState, setAuthState] = useState<AuthState | null>(null)
  const [membership, setMembership] = useState<MyMembershipResponse | null>(null)
  const [quotas, setQuotas] = useState<QuotaSnapshot[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [contactOpen, setContactOpen] = useState(false)

  useEffect(() => {
    let active = true

    async function loadState() {
      setLoading(true)
      try {
        const authResponse = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!authResponse.ok) return
        const authPayload = (await authResponse.json()) as { state: AuthState }
        if (!active) return
        setAuthState(authPayload.state)
        if (!authPayload.state.authenticated) {
          setMembership(null)
          setQuotas(null)
          return
        }
        const membershipResponse = await getMyMembership().catch(() => null)
        if (!active) return
        setMembership(membershipResponse)
        if (membershipResponse?.is_active) {
          const quotaResponse = await getMyQuota().catch(() => null)
          if (!active) return
          setQuotas(quotaResponse?.quotas ?? null)
        } else {
          setQuotas(null)
        }
      } catch (error) {
        console.error({ scope: 'membership_page', event: 'load_state', error })
        if (active) setAuthState({ authenticated: false, reason: 'missing_session' })
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadState()
    return () => {
      active = false
    }
  }, [])

  function handleQuotaUpdated(snapshot: QuotaSnapshot) {
    setQuotas((current) => {
      if (current === null) return [snapshot]
      const next = current.map((q) => (q.type === snapshot.type ? snapshot : q))
      if (!next.some((q) => q.type === snapshot.type)) {
        next.push(snapshot)
      }
      return next
    })
  }

  const bloggerQuota = quotas?.find((q) => q.type === 'blogger') ?? null
  const trackQuota = quotas?.find((q) => q.type === 'track') ?? null
  const isActiveMember = membership?.is_active ?? false
  const showQuotaLoading = loading && (authState?.authenticated ?? false) && isActiveMember

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
          <Reveal y={16}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-3 py-1 text-[11px] text-ink-soft backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
              会员 · MEMBERSHIP
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-serif-zh mt-6 max-w-3xl text-balance text-[28px] font-semibold leading-[1.4] tracking-[0.01em] sm:mt-7 sm:text-[40px] sm:leading-[1.3] lg:text-[48px] lg:leading-[1.25]">
              一年 199 元起，
              <GradientText className="font-semibold">解锁四项硬核权益</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-sm leading-[1.9] text-ink-soft sm:mt-8 sm:text-base sm:leading-[1.85]">
              免费申请博主拆解 / 赛道分析，按优先级依次交付——开通会员解锁百万粉运营手册方法论版本报告，及本地素材采集智能体。
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-semibold text-canvas shadow-[0_8px_32px_rgba(167,139,250,0.3)] transition-transform hover:-translate-y-0.5 sm:text-sm"
              >
                {isActiveMember ? '续费会员' : '立即开通'}
              </Link>
              <Link
                href={authState?.authenticated ? '/account/submissions' : '/login?next=/account/submissions'}
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-6 py-3 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong sm:text-sm"
              >
                我的提交记录
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 服务一：百万粉博主运营方法论精炼 */}
      <MembershipServiceSection
        index={1}
        eyebrow="订阅服务"
        title={
          <>
            百万粉博主
            <GradientText className="font-semibold">运营方法论精炼</GradientText>
          </>
        }
        description={
          <>
            把跨百万粉博主的运营经验，凝练成一套可执行的方法论：定位、选题、文案、节奏、增长、变现，
            正卷 + 番外卷持续更新，会员期内不限次阅读。
          </>
        }
        bullets={[
          '正卷 9 个子模块覆盖完整内容操盘链路',
          '番外卷·行业战斗卷拆解五类典型行业的真实打法',
          '所有方法论从真实跑出来的案例反推，不是空话',
        ]}
      >
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PLAYBOOK_HIGHLIGHTS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface/50 px-4 py-3 transition-colors hover:border-hairline-strong"
              >
                <span className="text-[13px] text-ink sm:text-[13.5px]">{item.label}</span>
                <svg
                  viewBox="0 0 16 16"
                  className="h-3 w-3 flex-none text-muted transition-colors group-hover:text-ink"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                </svg>
              </Link>
            ))}
          </div>
          <Link
            href="/playbook"
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-4 py-2 text-[12.5px] font-medium text-ink transition-colors hover:border-hairline-strong"
          >
            查看完整 Playbook
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden>
              <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
            </svg>
          </Link>
        </div>
      </MembershipServiceSection>

      {/* 服务二：博主账号拆解 */}
      <MembershipServiceSection
        index={2}
        anchorId="submit-blogger"
        eyebrow="会员提交"
        title={
          <>
            博主账号
            <GradientText className="font-semibold">深度拆解</GradientText>
          </>
        }
        description={
          <>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/15 px-2.5 py-1 text-[11px] font-medium text-yellow-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
              每日持续更新
            </span>
            <span className="block">
              提交你想拆的博主主页 URL，我们用 14 章方法论框架做深度拆解：矩阵布局、
              增长曲线、内容方法论、可借鉴 vs 不可复制。
            </span>
          </>
        }
        bullets={[
          '抖音 / 小红书 / B 站 / 视频号等主流平台',
          '输出 HTML 全景报告，3-5 个工作日交付',
          '每月最多 10 份定制报告，按自然月重置',
        ]}
      >
        <MembershipSubmissionGate
          authState={authState}
          membership={membership}
          loading={loading}
        >
          <BloggerSubmissionForm
            quota={bloggerQuota}
            loading={showQuotaLoading}
            onSubmitted={handleQuotaUpdated}
          />
        </MembershipSubmissionGate>
      </MembershipServiceSection>

      {/* 服务三：赛道深度分析 */}
      <MembershipServiceSection
        index={3}
        anchorId="submit-track"
        eyebrow="会员提交"
        title={
          <>
            赛道
            <GradientText className="font-semibold">深度分析</GradientText>
          </>
        }
        description={
          <>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/15 px-2.5 py-1 text-[11px] font-medium text-yellow-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
              每日持续更新
            </span>
            <span className="block">
              提交你正在评估的赛道关键词，我们用投研级框架 + 微域生光方法论做赛道拆解，
              输出 6 份专业报告，帮你判断「能不能切、怎么切」。
            </span>
          </>
        }
        bullets={[
          '执行摘要 / 行业研判 / 竞争格局 / 商业模式 / AI 落地 / 操盘手册',
          '基于公开权威资料，非买报告拼接',
          '每月最多 10 份定制报告，按自然月重置',
        ]}
      >
        <MembershipSubmissionGate
          authState={authState}
          membership={membership}
          loading={loading}
        >
          <TrackSubmissionForm
            quota={trackQuota}
            loading={showQuotaLoading}
            onSubmitted={handleQuotaUpdated}
          />
        </MembershipSubmissionGate>
      </MembershipServiceSection>

      {/* 服务四：本地素材采集智能体 */}
      <MembershipServiceSection
        index={4}
        eyebrow="桌面工具"
        title={
          <>
            本地素材采集
            <GradientText className="font-semibold">智能体</GradientText>
          </>
        }
        description={
          <>
            桌面端工具，粘贴一条链接，自动完成视频下载、关键帧截取、转录与拆解诊断，
            输出钩子 / 结构 / 节奏 / 模板可复用报告，离线可控。
          </>
        }
        bullets={[
          '抖音 / 小红书等主流短视频平台',
          '自动转录字幕 + 关键帧采集',
          '本地分析诊断，资料不外传',
        ]}
      >
        <MembershipToolShowcase />
        <div className="flex flex-col gap-3 rounded-2xl border border-hairline bg-surface/40 p-6 backdrop-blur sm:rounded-[22px] sm:p-7">
          <h4 className="font-serif-zh text-[16px] font-semibold text-ink sm:text-[17px]">
            如何获取
          </h4>
          <p className="text-[13px] leading-[1.9] text-muted sm:text-[13.5px]">
            桌面端工具采用邀请制分发，开通会员后联系运营领取安装包与激活码。后续我们会在产品页放出公开下载渠道。
          </p>
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5"
          >
            联系获取
            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden>
              <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
            </svg>
          </button>
        </div>
      </MembershipServiceSection>

      {/* 汇总表 */}
      <section className="relative mx-auto w-full max-w-6xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
              一表看全
            </span>
            <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
              会员服务清单
              <GradientText className="font-semibold"> · 全景</GradientText>
            </h2>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="mt-8">
            <MembershipBenefitsTable />
          </div>
        </Reveal>
      </section>

      {/* 底部 CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[22px] border border-hairline bg-surface/40 p-7 text-center backdrop-blur-xl sm:rounded-[28px] sm:p-12 lg:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  'radial-gradient(circle at 20% 0%, rgba(167,139,250,0.28), transparent 55%), radial-gradient(circle at 80% 100%, rgba(34,211,238,0.22), transparent 55%)',
              }}
            />
            <div className="relative flex flex-col items-center gap-5">
              <h2 className="font-serif-zh max-w-2xl text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[32px]">
                把决策需要的判断、底稿、工具，
                <GradientText className="font-semibold">一次性带回家</GradientText>
              </h2>
              <div className="mt-1 flex flex-col items-center gap-2.5 sm:flex-row sm:gap-3">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:text-sm"
                >
                  立即开通 ¥199/年起
                </Link>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong sm:text-sm"
                >
                  咨询会员
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <ContactQrCodeModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  )
}
