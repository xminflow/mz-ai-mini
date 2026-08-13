'use client'

import type { ReactNode } from 'react'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { Marquee } from './Marquee'
import { INDUSTRIES, SERVICES, THEMES } from './data'

// 行业胶囊循环品牌色板，避免单一色显得单调
const PALETTE = Object.values(THEMES)

export function ServiceGrid({ onContact }: { onContact: () => void }) {
  // 行业单行彩色文字流：品牌色词 + 「·」分隔，无边框无底色，文字为主
  const industryFlow: ReactNode[] = []
  INDUSTRIES.forEach((name, i) => {
    const c = PALETTE[i % PALETTE.length]
    industryFlow.push(
      <span
        key={`w-${name}`}
        className="whitespace-nowrap text-[15px] font-medium sm:text-[17px]"
        style={{ color: c.hex }}
      >
        {name}
      </span>,
    )
    industryFlow.push(
      <span key={`s-${i}`} aria-hidden className="text-[13px] text-muted/60">
        ·
      </span>,
    )
  })

  return (
    <section id="services" className="relative w-full scroll-mt-20 pb-20 sm:scroll-mt-24 sm:pb-24 lg:pb-28">
      {/* 主 · 按行业：彩色胶囊持续横向滚动，滚不完即「行业不限」 */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#0099ff">服务矩阵</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">全行业覆盖</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              无论你在哪个行业，我们都有对应的解决方案，绝不套用模板，
              <span className="font-semibold text-ink">只为你的真实业务量身定制</span>。
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.08}>
        <div className="mx-auto mt-8 w-full max-w-6xl px-2 sm:px-4">
          <Marquee gapClass="gap-4" speed={0.35}>
            {industryFlow}
          </Marquee>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
          <button
            type="button"
            onClick={onContact}
            className="text-[13.5px] font-medium text-[#0099ff] underline decoration-[#0099ff]/40 underline-offset-4 transition-colors hover:decoration-[#0099ff] sm:text-[14px]"
          >
            没找到你的行业？直接聊 →
          </button>
        </div>
      </Reveal>

      {/* 次 · 按软件类型：玻璃卡片横向跑马灯，能力枚举可浏览 */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Reveal delay={0.12}>
          <div className="mt-14 flex flex-col gap-2 sm:mt-16">
            <SectionEyebrow color="#8c5eff">具体能交付这些软件形态</SectionEyebrow>
            <p className="text-[13px] leading-[1.8] text-muted sm:text-[13.5px]">
              无论哪个行业，落到实处都是下面这些软件——拖动浏览，挑你需要的，或几样组合。
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.16}>
        <div className="mx-auto mt-7 w-full max-w-6xl px-2 sm:mt-8 sm:px-4">
          <Marquee gapClass="gap-4" speed={0.45}>
            {SERVICES.map((item) => {
              const t = THEMES[item.theme]
              return (
                <article
                  key={item.code}
                  className="group relative flex h-full min-h-[236px] w-[264px] flex-col overflow-hidden rounded-lg p-5 backdrop-blur-xl transition-transform duration-500 hover:-translate-y-1 sm:min-h-[248px] sm:w-[288px] sm:p-6"
                  style={{
                    background: `linear-gradient(150deg, rgba(${t.rgb}, 0.16) 0%, rgba(${t.rgb}, 0.05) 100%)`,
                    boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`, filter: 'blur(22px)' }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-3 right-1 select-none font-mono text-[96px] font-black leading-none"
                    style={{ color: t.hex, opacity: 0.06 }}
                  >
                    {item.code}
                  </span>

                  <div className="relative flex h-full flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[12px] font-bold text-canvas"
                        style={{
                          background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                          boxShadow: `0 4px 16px -2px ${t.hex}66`,
                        }}
                      >
                        {item.code}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px]"
                        style={{ borderColor: `rgba(${t.rgb}, 0.35)`, color: t.hex, background: `rgba(${t.rgb}, 0.08)` }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.hex }} />
                        {t.label}
                      </span>
                    </div>

                    <h4 className="font-serif-zh text-[17px] font-semibold leading-[1.35] text-ink sm:text-[18px]">
                      {item.title}
                    </h4>
                    <p className="text-[12px] font-medium leading-[1.5]" style={{ color: t.hex }}>
                      {item.hook}
                    </p>

                    <ul className="mt-auto flex flex-col gap-1.5 pt-1">
                      {item.points.map((p) => (
                        <li key={p} className="flex items-start gap-2 text-[11.5px] leading-[1.5] text-ink-soft">
                          <span
                            aria-hidden
                            className="mt-1.5 inline-flex h-1.5 w-1.5 flex-none rounded-full"
                            style={{ background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})` }}
                          />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              )
            })}
          </Marquee>
        </div>
      </Reveal>
    </section>
  )
}
