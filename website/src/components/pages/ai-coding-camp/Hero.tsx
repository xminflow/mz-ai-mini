'use client'

import { GradientText, Reveal } from '../../motion'
import { HeroAuroraLayers, FloatingOrbs, ShimmerHeading } from './primitives'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroAuroraLayers />
      <FloatingOrbs />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-28 sm:pt-28 lg:pt-32">
        <Reveal delay={0.08}>
          <h1 className="font-serif-zh mt-7 max-w-4xl text-balance text-[30px] font-bold leading-[1.32] tracking-[-0.005em] sm:mt-8 sm:text-[46px] sm:leading-[1.22] lg:text-[58px] lg:leading-[1.15]">
            <ShimmerHeading>零基础 AI 编程实战训练营</ShimmerHeading>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-6 max-w-3xl sm:mt-7">
            <p className="text-balance text-[15px] font-medium leading-[1.75] text-ink-soft sm:text-[18px] lg:text-[20px]">
              <span className="block">
                从想法到上线 ·{' '}
                <GradientText className="font-semibold">一条主线贯穿全程</GradientText>
              </span>
              <span className="mt-2 block text-[14px] sm:mt-3 sm:text-[16px] lg:text-[17px]">
                <span
                  className="font-semibold"
                  style={{ color: '#67E8F9', textShadow: '0 0 14px rgba(103,232,249,0.45)' }}
                >
                  不用担心学不会
                </span>
                <span className="text-ink-soft"> · AI 让你不需要看一行代码 </span>
                <span className="font-semibold text-ink">即可做出专属应用</span>
              </span>
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.3}>
          <div className="mt-9 flex flex-col items-center gap-4 sm:mt-11">
            {/* 价格条 */}
            <div
              className="inline-flex items-center gap-3 rounded-full border px-4 py-2 sm:gap-4 sm:px-5 sm:py-2.5"
              style={{
                borderColor: 'rgba(251,113,133,0.5)',
                background:
                  'linear-gradient(110deg, rgba(251,113,133,0.18), rgba(251,191,36,0.14))',
                boxShadow:
                  'inset 0 0 0 1px rgba(251,113,133,0.10), 0 0 28px -6px rgba(251,113,133,0.55)',
              }}
            >
              <span
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] sm:text-[11px]"
                style={{
                  background: 'linear-gradient(135deg, #FB7185, #E11D48)',
                  color: '#F5F5F7',
                  boxShadow: '0 4px 14px -2px rgba(251,113,133,0.65)',
                }}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                首批限定
              </span>
              <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="font-mono text-[11.5px] text-muted line-through tabular sm:text-[12.5px]">
                  原价 ¥2999
                </span>
              </div>
              <span aria-hidden className="text-muted">→</span>
              <div className="flex items-baseline gap-1 whitespace-nowrap">
                <span
                  className="font-mono text-[10.5px] font-medium uppercase tracking-[0.14em]"
                  style={{ color: '#FDA4AF' }}
                >
                  限时特价
                </span>
                <span
                  className="font-serif-zh text-[22px] font-bold tabular sm:text-[26px]"
                  style={{
                    color: '#FECDD3',
                    textShadow: '0 0 18px rgba(251,113,133,0.6)',
                  }}
                >
                  ¥1999
                </span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 服务承诺横条 */}
        <Reveal delay={0.4}>
          <div className="mt-10 flex flex-col items-center gap-4 sm:mt-14">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-soft sm:text-[12px]">
              · 服务承诺 · COMMITMENT ·
            </span>
            <div
              className="flex w-full max-w-[1200px] flex-col items-stretch gap-2.5 rounded-[24px] border-2 p-3.5 backdrop-blur-md sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-2.5"
              style={{
                borderColor: 'rgba(167,139,250,0.42)',
                background:
                  'linear-gradient(110deg, rgba(167,139,250,0.16), rgba(110,231,183,0.12) 33%, rgba(251,191,36,0.14) 66%, rgba(251,113,133,0.14))',
                boxShadow:
                  '0 16px 48px -12px rgba(167,139,250,0.45), 0 0 0 1px rgba(255,255,255,0.04) inset',
              }}
            >
              {/* CTO 亲自教学 */}
              <div className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap px-4 py-3 text-[14px] sm:py-2.5 sm:text-[15px]">
                <span
                  className="rounded-md border px-2 py-1 font-mono text-[11.5px] font-bold tracking-[0.1em] sm:text-[12.5px]"
                  style={{
                    color: '#F5F5F7',
                    borderColor: 'rgba(196,181,253,0.7)',
                    background: 'linear-gradient(135deg, rgba(196,181,253,0.35), rgba(167,139,250,0.20))',
                    boxShadow: '0 0 14px -2px rgba(167,139,250,0.55)',
                  }}
                >
                  CTO
                </span>
                <span className="font-semibold text-ink">亲自教学</span>
              </div>
              <span aria-hidden className="hidden h-7 w-px bg-hairline-strong sm:block" />
              {/* 交付成果：4 件你自己亲手做出来的交付成果 */}
              <div className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap px-4 py-3 text-[14px] sm:py-2.5 sm:text-[15px]">
                <span
                  className="font-mono text-[17px] font-bold tabular sm:text-[18px]"
                  style={{
                    color: '#FDA4AF',
                    textShadow: '0 0 18px rgba(251,113,133,0.55)',
                  }}
                >
                  4 件
                </span>
                <span className="font-medium text-ink">你自己亲手做出来的交付成果</span>
              </div>
              <span aria-hidden className="hidden h-7 w-px bg-hairline-strong sm:block" />
              {/* 最长 6 个月陪跑答疑（强调） */}
              <div
                className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-full px-4 py-3 text-[14px] sm:py-2.5 sm:text-[15px]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(251,191,36,0.32), rgba(251,191,36,0.14))',
                  boxShadow:
                    'inset 0 0 0 1.5px rgba(251,191,36,0.55), 0 0 24px -6px rgba(251,191,36,0.55)',
                }}
              >
                <span
                  className="font-mono text-[17px] font-bold tabular sm:text-[18px]"
                  style={{
                    color: '#FDE68A',
                    textShadow: '0 0 18px rgba(251,191,36,0.7)',
                  }}
                >
                  最长 6 个月
                </span>
                <span className="font-bold" style={{ color: '#FDE68A' }}>
                  陪跑答疑
                </span>
                <span
                  className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full"
                  style={{
                    background: '#FCD34D',
                    boxShadow: '0 0 8px rgba(252,211,77,0.9)',
                  }}
                />
              </div>
              <span aria-hidden className="hidden h-7 w-px bg-hairline-strong sm:block" />
              {/* 长期 AI 编程社区 */}
              <div className="flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap px-4 py-3 text-[14px] sm:py-2.5 sm:text-[15px]">
                <span
                  className="font-mono text-[17px] font-bold tabular sm:text-[18px]"
                  style={{
                    color: '#6EE7B7',
                    textShadow: '0 0 16px rgba(110,231,183,0.5)',
                  }}
                >
                  长期
                </span>
                <span className="font-medium text-ink">零基础 AI 编程分享社区</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
