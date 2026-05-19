'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { AuthState } from '@/features/auth/types'
import { getMyMembership } from '@/features/membership/api'
import { MembershipPurchaseCard } from '@/features/membership/MembershipPurchaseCard'
import type { MyMembershipResponse } from '@/features/membership/types'
import { AuroraBackground, GradientText, Reveal } from '../motion'
import { ContactQrCodeModal } from '../layout'

const CORE_FEATURES = [
  {
    title: '素材拆解',
    detail:
      '粘贴一条链接（小红书 / 抖音 / 公众号 / 视频号 / B 站…），10 秒输出钩子、结构、节奏、可复用模板。',
    keys: ['平台覆盖：主流 8+ 平台', '输出：钩子 / 结构 / 节奏 / 模板 / 适合谁'],
  },
  {
    title: '博主洞察',
    detail:
      '输入一个博主主页，自动梳理矩阵布局、增长曲线、内容方法论、可借鉴 vs 不可复制。',
    keys: ['输出：矩阵图 / 时间线 / 方法论', '识别：账号矩阵与漏斗角色'],
  },
  {
    title: '选题灵感',
    detail:
      '告知赛道与目标读者，输出已被验证的选题方向与示例——不是「随机生成」，而是从历史爆款里反推。',
    keys: ['基于真实爆款样本', '输出按结构分类，可直接落地'],
  },
]

const AUX = [
  {
    title: '定制分析',
    price: '¥39 / 份',
    description:
      '把某个博主或赛道做成专属报告。适合决策前需要结构化底稿的场景。',
    detail: '交付：24 小时内 PDF + Markdown 双格式',
  },
  {
    title: '爆款素材包',
    price: '¥49 / 包',
    description: '按主题打包的爆款样本与拆解笔记，复用钩子与模板。',
    detail: '主题：起号 / 转化 / 选题 / 情绪类爆款',
  },
  {
    title: '本地知识库 + AI 创作',
    price: '¥1599 – 2499',
    description: '一套部署在本地的知识库与 AI 创作工作流，把团队既有资产变成可复用引擎。',
    detail: '场景：稳态产出 / 团队多人协作 / 隐私敏感场景',
  },
]

const FAQ = [
  {
    q: '工具支持哪些平台？',
    a: '主流 8+ 平台：小红书、抖音、视频号、B 站、快手、公众号、知乎、微博，以及 YouTube。后续按需扩展。',
  },
  {
    q: '退款政策？',
    a: '所有付费产品支持「7 天内不满意可退」。',
  },
  {
    q: '与定制分析、咨询服务的区别？',
    a: '产品 = 你自己拆解；定制分析 = 我们替你做一份专属报告；咨询服务 = 和有经验的人一对一坐下来聊。',
  },
]

export const ProductContent = () => {
  const [contactOpen, setContactOpen] = useState(false)
  const [authState, setAuthState] = useState<AuthState | null>(null)
  const [membership, setMembership] = useState<MyMembershipResponse | null>(null)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  useEffect(() => {
    let active = true

    const loadMembershipState = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' })
        if (!response.ok) return
        const payload = (await response.json()) as { state: AuthState }
        if (!active) return
        setAuthState(payload.state)
        if (payload.state.authenticated) {
          try {
            setMembership(await getMyMembership())
          } catch (membershipError) {
            console.error({ scope: 'membership', endpoint: 'me', error: membershipError })
          }
        }
      } catch (loadError) {
        console.error({ scope: 'membership', endpoint: 'auth_state', error: loadError })
        if (active) setAuthState({ authenticated: false, reason: 'missing_session' })
      }
    }

    void loadMembershipState()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="relative">
      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
          <Reveal y={16}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-3 py-1 text-[11px] text-ink-soft backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
              产品 · PRODUCTS
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-serif-zh mt-6 max-w-3xl text-balance text-[28px] font-semibold leading-[1.4] tracking-[0.01em] sm:mt-7 sm:text-[40px] sm:leading-[1.3] lg:text-[48px] lg:leading-[1.25]">
              把「看懂别人」
              <GradientText className="font-semibold">变成「自己能做」</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-2xl text-sm leading-[1.9] text-ink-soft sm:mt-8 sm:text-base sm:leading-[1.85]">
              真实的案例 + AI 工具——粘贴一条链接，10 秒看懂它为什么火；按你关心的赛道，持续给你同类的拆解。
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={openContact}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-semibold text-canvas shadow-[0_8px_32px_rgba(167,139,250,0.3)] transition-transform hover:-translate-y-0.5 sm:text-sm"
              >
                了解产品
              </button>
              <Link
                href="/library"
                className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-6 py-3 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong sm:text-sm"
              >
                浏览信息库
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. 核心能力（左文 + 右截图） */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start lg:gap-14">
          <Reveal className="lg:col-span-5">
            <div className="flex flex-col gap-4">
              <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
                <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
                核心能力
              </span>
              <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
                三个动作，
                <GradientText className="font-semibold">覆盖内容获客的全链路</GradientText>
              </h2>
              <p className="max-w-md text-[13.5px] leading-[1.9] text-ink-soft sm:text-[14.5px]">
                从单点拆解，到博主级别的洞察，再到选题的灵感来源——工具基于真实跑出来的案例，围绕「我下一条该写什么」这件事来设计。
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="flex flex-col gap-3">
              {CORE_FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="flex flex-col gap-2 rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur transition-all hover:border-hairline-strong sm:rounded-[22px] sm:p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-hairline bg-canvas font-mono text-[11px] text-ink-soft">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-serif-zh text-[16px] font-semibold text-ink sm:text-[17px]">
                      {f.title}
                    </h3>
                  </div>
                  <p className="text-[13.5px] leading-[1.85] text-muted sm:text-[14px]">{f.detail}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11.5px] text-ink-soft">
                    {f.keys.map((k) => (
                      <span key={k} className="rounded-full border border-hairline px-2.5 py-0.5">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3. 会员购买 */}
      <section className="relative mx-auto w-full max-w-6xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-cyan-300/60 sm:w-6" />
              会员订阅
            </span>
            <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
              购买会员，
              <GradientText className="font-semibold">499 元 / 年</GradientText>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.9] text-ink-soft sm:text-[14.5px]">
              点击购买后生成微信支付二维码，使用微信扫码完成支付。支付成功后会员立即生效，有效期 365 天。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <Reveal delay={0.04}>
            <div className="grid gap-3 sm:grid-cols-3">
              {['拆解 / 洞察 / 选题全部能力', '8+ 主流内容平台', '支付后即时开通'].map((item) => (
                <div key={item} className="rounded-2xl border border-hairline bg-surface/50 p-5">
                  <p className="text-[13.5px] leading-[1.8] text-ink-soft">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <MembershipPurchaseCard
              authState={authState}
              membership={membership}
              actionLabel={membership?.is_active ? '立即续费' : membership?.tier === 'normal' ? '重新开通' : '购买会员'}
              variant="compact"
            />
          </Reveal>
        </div>
      </section>

      {/* 4. 定制分析（按需） */}
      <section className="relative mx-auto w-full max-w-6xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
              定制分析（按需）
            </span>
            <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
              把某个博主 / 赛道，做成
              <GradientText className="font-semibold">你的专属报告</GradientText>
            </h2>
          </div>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          <Reveal>
            <Detail title="适合场景" body="决策前需要结构化底稿；想看清一个赛道再下注的人。" />
          </Reveal>
          <Reveal delay={0.05}>
            <Detail title="交付物" body="24 小时内交付 PDF + Markdown 双格式；包含洞察、数据、可执行建议。" />
          </Reveal>
          <Reveal delay={0.1}>
            <Detail title="价格" body="¥39 / 份起，可叠加私域 / 矩阵深度选项。" cta onCta={openContact} />
          </Reveal>
        </div>
      </section>

      {/* 6. 配套 */}
      <section className="relative mx-auto w-full max-w-6xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-cyan-300/60 sm:w-6" />
              配套
            </span>
            <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
              低门槛素材 + 高门槛系统，
              <GradientText className="font-semibold">按需接入</GradientText>
            </h2>
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {AUX.map((a, idx) => (
            <Reveal key={a.title} delay={idx * 0.06}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-hairline bg-surface/60 p-5 transition-all hover:-translate-y-1 hover:border-hairline-strong sm:rounded-[22px] sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-zh text-[16px] font-semibold text-ink sm:text-[17px]">
                    {a.title}
                  </h3>
                  <span className="font-mono text-[11px] text-muted">{a.price}</span>
                </div>
                <p className="text-[13px] leading-[1.85] text-muted sm:text-[13.5px]">
                  {a.description}
                </p>
                <p className="text-[12.5px] text-ink-soft">{a.detail}</p>
                <button
                  type="button"
                  onClick={openContact}
                  className="mt-auto inline-flex w-fit items-center gap-1 text-[12.5px] text-ink-soft transition-colors hover:text-ink"
                >
                  了解详情
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                  </svg>
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 7. FAQ */}
      <section className="relative mx-auto w-full max-w-3xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
            常见问题
          </h2>
        </Reveal>
        <div className="mt-8 flex flex-col gap-2">
          {FAQ.map((f, idx) => (
            <Reveal key={f.q} delay={idx * 0.04}>
              <FaqRow q={f.q} a={f.a} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 8. 底部 CTA */}
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
                下一步：
                <GradientText className="font-semibold">把工具用起来</GradientText>
              </h2>
              <div className="mt-1 flex flex-col items-center gap-2.5 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={openContact}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:text-sm"
                >
                  了解产品
                </button>
                <Link
                  href="/library"
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong sm:text-sm"
                >
                  浏览信息库
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}

const Detail = ({
  title,
  body,
  cta,
  onCta,
}: {
  title: string
  body: string
  cta?: boolean
  onCta?: () => void
}) => (
  <div className="flex h-full flex-col gap-3 rounded-2xl border border-hairline bg-surface/60 p-5 sm:rounded-[22px] sm:p-6">
    <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">{title}</span>
    <p className="text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14px]">{body}</p>
    {cta && (
      <button
        type="button"
        onClick={onCta}
        className="mt-auto inline-flex w-fit items-center gap-1 text-[12.5px] text-ink transition-colors hover:underline"
      >
        联系定制
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
          <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
        </svg>
      </button>
    )}
  </div>
)

const FaqRow = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-surface/50 transition-all hover:border-hairline-strong">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[13.5px] font-medium text-ink sm:text-[14px]"
      >
        <span>{q}</span>
        <svg
          viewBox="0 0 12 12"
          className={['h-3 w-3 flex-none text-muted transition-transform', open ? 'rotate-180' : ''].join(' ')}
          fill="currentColor"
        >
          <path d="M2.5 4.25a.6.6 0 01.85 0L6 6.9l2.65-2.65a.6.6 0 11.85.85l-3.08 3.08a.6.6 0 01-.85 0L2.5 5.1a.6.6 0 010-.85z" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-hairline px-5 pb-5 pt-3 text-[13px] leading-[1.9] text-muted sm:text-[13.5px]">
          {a}
        </div>
      )}
    </div>
  )
}
