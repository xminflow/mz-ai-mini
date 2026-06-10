'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { ContactQrCodeModal } from '../layout'
import { GradientText, Reveal } from '../motion'
import {
  THEMES, STAGE1_CHAPTERS as CHAPTERS, STAGE1_DELIVERABLES as DELIVERABLES,
  STAGE1_SERVICE_STAGES as SERVICE_STAGES,
  PROJECT_TIMELINE, OVERVIEW_CARDS, TIMELINE_NODES_XY, buildSmoothPath,
} from './ai-coding-camp/data'
import { SectionEyebrow } from './ai-coding-camp/primitives'
import { Hero } from './ai-coding-camp/Hero'
import { InstructorSection } from './ai-coding-camp/InstructorSection'
import { BottomCta } from './ai-coding-camp/BottomCta'

/* ─────────────────────────  能力主线 SVG  ───────────────────────── */

const CapabilityTimeline = () => {
  const pathD = useMemo(() => buildSmoothPath(), [])

  return (
    <>
      {/* 桌面端：横向 SVG 时间线 */}
      <div className="relative hidden lg:block">
        <div className="relative h-[360px] w-full">
          <svg
            viewBox="0 0 1200 260"
            className="absolute inset-x-0 top-6 h-[260px] w-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="timeline-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={THEMES.cognition.hex} stopOpacity="0.9" />
                <stop offset="0.3" stopColor={THEMES.frontend.hex} stopOpacity="0.9" />
                <stop offset="0.55" stopColor={THEMES.backend.hex} stopOpacity="0.9" />
                <stop offset="0.72" stopColor={THEMES.agent.hex} stopOpacity="0.9" />
                <stop offset="0.85" stopColor={THEMES.launch.hex} stopOpacity="0.9" />
                <stop offset="1" stopColor={THEMES.mindset.hex} stopOpacity="0.9" />
              </linearGradient>
              <filter id="timeline-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {PROJECT_TIMELINE.map((node) => {
                const t = THEMES[node.theme]
                return (
                  <radialGradient key={node.theme + '_' + node.chapter} id={`node-${node.chapter}`} cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0" stopColor={t.gradientFrom} stopOpacity="1" />
                    <stop offset="0.6" stopColor={t.hex} stopOpacity="0.95" />
                    <stop offset="1" stopColor={t.gradientTo} stopOpacity="0.2" />
                  </radialGradient>
                )
              })}
            </defs>

            {/* 底层虚化线 */}
            <path d={pathD} stroke="url(#timeline-line)" strokeWidth="2.2" fill="none" opacity="0.45" />
            {/* 流光线（dash 动画） */}
            <path
              d={pathD}
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeDasharray="40 1400"
              strokeLinecap="round"
              opacity="0.85"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-1440" dur="6s" repeatCount="indefinite" />
            </path>

            {/* 节点 */}
            {PROJECT_TIMELINE.map((node, i) => {
              const { x, y } = TIMELINE_NODES_XY[i]
              return (
                <g key={node.chapter} filter="url(#timeline-glow)">
                  <circle cx={x} cy={y} r="18" fill={`url(#node-${node.chapter})`} opacity="0.55" />
                  <circle cx={x} cy={y} r="9" fill={THEMES[node.theme].hex} />
                  <circle cx={x} cy={y} r="4" fill="#F5F5F7" />
                </g>
              )
            })}
          </svg>

          {/* 标签：上下交替 */}
          {PROJECT_TIMELINE.map((node, i) => {
            const { x, y } = TIMELINE_NODES_XY[i]
            const above = i % 2 === 0
            const leftPct = (x / 1200) * 100
            const topPx = above ? 24 + (y / 260) * 260 - 130 : 24 + (y / 260) * 260 + 30
            const t = THEMES[node.theme]
            return (
              <motion.div
                key={node.chapter}
                initial={{ opacity: 0, y: above ? 12 : -12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                className="absolute w-[130px] -translate-x-1/2 text-center"
                style={{ left: `${leftPct}%`, top: topPx }}
              >
                <span
                  className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
                  style={{ color: t.hex }}
                >
                  {node.chapter}
                </span>
                <h4 className="font-serif-zh mt-1 text-[14px] font-semibold leading-[1.3] text-ink">
                  {node.milestone}
                </h4>
                <p className="mt-1 text-[11px] leading-[1.55] text-muted">{node.detail}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 移动端：竖向时间线 */}
      <div className="relative lg:hidden">
        <div
          aria-hidden
          className="absolute left-[18px] top-2 bottom-2 w-px"
          style={{
            background:
              `linear-gradient(to bottom, ${THEMES.cognition.hex}, ${THEMES.frontend.hex}, ${THEMES.backend.hex}, ${THEMES.agent.hex}, ${THEMES.launch.hex}, ${THEMES.mobile.hex}, ${THEMES.mindset.hex})`,
            opacity: 0.55,
          }}
        />
        <ol className="flex flex-col gap-5">
          {PROJECT_TIMELINE.map((node, i) => {
            const t = THEMES[node.theme]
            return (
              <Reveal key={node.chapter} delay={i * 0.04}>
                <li className="relative pl-12">
                  <span
                    aria-hidden
                    className="absolute left-[10px] top-1.5 h-[18px] w-[18px] rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${t.gradientFrom} 0%, ${t.gradientTo} 80%)`,
                      boxShadow: `0 0 18px ${t.hex}66`,
                    }}
                  />
                  <span
                    className="font-mono text-[10.5px] uppercase tracking-[0.18em]"
                    style={{ color: t.hex }}
                  >
                    {node.chapter}
                  </span>
                  <h4 className="font-serif-zh mt-1 text-[15px] font-semibold leading-[1.35] text-ink">
                    {node.milestone}
                  </h4>
                  <p className="mt-1 text-[12px] leading-[1.7] text-ink-soft">{node.detail}</p>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </>
  )
}

/* ─────────────────────────  主组件  ───────────────────────── */

export function AiCodingCampContent() {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      {/* 1. Hero */}
      <Hero />

      {/* 2. 四大成果：你将拿到什么 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#FDA4AF">你将拿到</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[36px] lg:leading-[1.25]">
              <span className="block">学完，你手里会有</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">4 件你自己亲手做出来的交付成果</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              不是看老师演示的截图，不是跑一遍 demo——是亲手做出来、能扫码访问、能发给朋友看的产品。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2">
          {DELIVERABLES.map((item, i) => {
            const t = THEMES[item.theme]
            return (
              <Reveal key={item.code} delay={i * 0.06}>
                <article
                  className="group relative h-full overflow-hidden rounded-[22px] border p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[26px] sm:p-7"
                  style={{
                    borderColor: `rgba(${t.rgb}, 0.28)`,
                    background: `linear-gradient(135deg, rgba(${t.rgb}, 0.12) 0%, rgba(13,13,18,0.6) 60%)`,
                    boxShadow: `inset 0 0 0 1px rgba(${t.rgb}, 0.06)`,
                  }}
                >
                  {/* 主题色光晕 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`,
                      filter: 'blur(24px)',
                    }}
                  />
                  {/* 巨大半透明序号 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-2 right-2 select-none font-mono text-[120px] font-black leading-none tabular sm:right-3 sm:text-[160px]"
                    style={{ color: t.hex, opacity: 0.06 }}
                  >
                    {item.code}
                  </span>

                  <div className="relative flex h-full flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[12px] font-bold text-canvas sm:h-10 sm:w-10 sm:text-[13px]"
                        style={{
                          background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                          boxShadow: `0 4px 16px -2px ${t.hex}66`,
                        }}
                      >
                        {item.code}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px]"
                        style={{
                          borderColor: `rgba(${t.rgb}, 0.35)`,
                          color: t.hex,
                          background: `rgba(${t.rgb}, 0.08)`,
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.hex }} />
                        交付物 · DELIVERABLE
                      </span>
                    </div>

                    <h3 className="font-serif-zh text-[19px] font-semibold leading-[1.35] text-ink sm:text-[22px]">
                      {item.title}
                    </h3>
                    <p
                      className="text-[12.5px] font-medium leading-[1.6] sm:text-[13px]"
                      style={{ color: t.hex }}
                    >
                      {item.subtitle}
                    </p>
                    <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                      {item.body}
                    </p>

                    <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                      {item.badges.map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px]"
                          style={{
                            borderColor: `rgba(${t.rgb}, 0.25)`,
                            background: `rgba(${t.rgb}, 0.05)`,
                            color: `rgba(${t.rgb}, 1)`,
                          }}
                        >
                          ✓ {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* 3. 讲师介绍：行明 */}
      <InstructorSection />

      {/* 4. 课程总览：三张卡片（带主题色光晕） */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow>课程总览</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">不是教你「用 AI 写两段代码」，</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">而是带你做一个真正能用的产品</GradientText>
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3">
          {OVERVIEW_CARDS.map((card, i) => {
            const t = THEMES[card.theme]
            return (
              <Reveal key={card.eyebrow} delay={i * 0.08}>
                <div
                  className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[22px] sm:p-7"
                  style={{
                    borderColor: `rgba(${t.rgb}, 0.22)`,
                    background: `linear-gradient(135deg, rgba(${t.rgb}, 0.10) 0%, rgba(13,13,18,0.55) 65%)`,
                    boxShadow: `inset 0 0 0 1px rgba(${t.rgb}, 0.06)`,
                  }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full opacity-50 transition-opacity duration-500 group-hover:opacity-90"
                    style={{ background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`, filter: 'blur(20px)' }}
                  />
                  <span
                    className="font-mono text-[12px] font-semibold tracking-[0.18em]"
                    style={{ color: t.hex }}
                  >
                    {card.eyebrow}
                  </span>
                  <h3 className="font-serif-zh text-[17px] font-semibold leading-[1.4] text-ink sm:text-[19px]">
                    {card.title}
                  </h3>
                  <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">{card.body}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* 5. 能力主线 SVG 时间线 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-32">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#67E8F9">能力主线</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">从认识工具到独立上线，</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">一脉相承的成长曲线</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              九个关键节点串成一条彩色主线——每章的交付物建立在前一章能力之上，最终把你带到能独立上线产品的位置。
            </p>
          </div>
        </Reveal>

        <div className="relative mt-10 overflow-hidden rounded-[24px] border border-hairline bg-canvas/30 p-5 backdrop-blur-xl sm:mt-14 sm:p-8 lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(circle at 12% 20%, rgba(167,139,250,0.18), transparent 50%), radial-gradient(circle at 88% 80%, rgba(34,211,238,0.16), transparent 50%)',
            }}
          />
          <div className="relative">
            <CapabilityTimeline />
          </div>
        </div>
      </section>

      {/* 6. 十章大纲：差异化主题色 + 超大背景序号 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#F0ABFC">十章大纲</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">每一章都有看得见、</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">摸得着的产出物</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              每章都有看得见、摸得着的交付物——前一章的能力承接后一章。
            </p>
          </div>
        </Reveal>

        <div className="mt-10 flex flex-col gap-5 sm:mt-12 sm:gap-6">
          {CHAPTERS.map((chapter, i) => {
            const t = THEMES[chapter.theme]
            return (
              <Reveal key={chapter.index} delay={Math.min(i, 4) * 0.04}>
                <article
                  className="group relative overflow-hidden rounded-[22px] border p-5 backdrop-blur-xl transition-all duration-500 sm:rounded-[28px] sm:p-7 lg:p-8"
                  style={{
                    borderColor: `rgba(${t.rgb}, 0.22)`,
                    background: `linear-gradient(120deg, rgba(${t.rgb}, 0.08) 0%, rgba(13,13,18,0.55) 60%)`,
                    boxShadow: `inset 1px 0 0 0 rgba(${t.rgb}, 0.5), inset 0 0 0 1px rgba(${t.rgb}, 0.04)`,
                  }}
                >
                  {/* 左侧主题色光晕条 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-0 top-0 h-full w-1.5"
                    style={{ background: `linear-gradient(to bottom, ${t.gradientFrom}, ${t.gradientTo})` }}
                  />
                  {/* 右下角超大半透明章节号 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-4 -right-2 select-none font-mono text-[120px] font-black leading-none tabular sm:-bottom-6 sm:-right-4 sm:text-[180px] lg:text-[220px]"
                    style={{
                      color: t.hex,
                      opacity: 0.06,
                      WebkitTextStroke: `1px ${t.hex}33`,
                    }}
                  >
                    {String(chapter.index).padStart(2, '0')}
                  </span>

                  <div className="relative flex flex-col gap-5">
                    {/* 顶部：章号 + 标题 + 主题标签 */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <span
                          className="flex h-12 w-12 flex-none items-center justify-center rounded-xl font-mono text-[15px] font-bold text-canvas sm:h-14 sm:w-14 sm:text-[17px]"
                          style={{
                            background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                            boxShadow: `0 6px 18px -4px ${t.hex}66`,
                          }}
                        >
                          {String(chapter.index).padStart(2, '0')}
                        </span>
                        <div className="flex flex-col gap-2">
                          <span
                            className="font-mono text-[10.5px] font-medium uppercase tracking-[0.22em]"
                            style={{ color: t.hex }}
                          >
                            第 {chapter.index} 章 · {t.label}
                          </span>
                          <h3 className="font-serif-zh text-[19px] font-semibold leading-[1.4] text-ink sm:text-[22px] lg:text-[25px]">
                            {chapter.title}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* 交付物 + 引言 */}
                    <div
                      className="flex flex-col gap-3 rounded-xl border p-4 sm:p-5"
                      style={{
                        borderColor: `rgba(${t.rgb}, 0.18)`,
                        background: `linear-gradient(135deg, rgba(${t.rgb}, 0.06) 0%, rgba(5,5,7,0.5) 100%)`,
                      }}
                    >
                      <div className="flex flex-col gap-1.5">
                        <span
                          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
                          style={{ color: t.hex }}
                        >
                          交付物
                        </span>
                        <p className="text-[13.5px] font-medium leading-[1.7] text-ink sm:text-[14.5px]">
                          {chapter.deliverable}
                        </p>
                      </div>
                      <p className="text-[12.5px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                        {chapter.intro}
                      </p>
                    </div>

                    {/* 提示色块 */}
                    {chapter.warning && (
                      <div
                        className="flex flex-col gap-1.5 rounded-xl border p-4 sm:p-5"
                        style={{
                          borderColor: `rgba(${t.rgb}, 0.35)`,
                          background: `rgba(${t.rgb}, 0.08)`,
                        }}
                      >
                        <span
                          className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                          style={{ color: t.hex }}
                        >
                          {chapter.warning.label}
                        </span>
                        <p className="text-[12.5px] leading-[1.85] text-ink-soft sm:text-[13px]">
                          {chapter.warning.body}
                        </p>
                      </div>
                    )}

                    {/* 子章节列表 */}
                    <ul className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2">
                      {chapter.lessons.map((lesson) => (
                        <li
                          key={lesson.code}
                          className="flex items-start gap-3 rounded-xl border p-3.5 transition-colors hover:border-hairline-strong sm:gap-3.5 sm:p-4"
                          style={{
                            borderColor: 'rgba(255,255,255,0.07)',
                            background: 'rgba(5,5,7,0.45)',
                          }}
                        >
                          <span
                            className="flex h-7 min-w-[2.5rem] flex-none items-center justify-center rounded-md px-2 font-mono text-[11px] font-semibold tabular sm:h-8 sm:text-[11.5px]"
                            style={{
                              background: `linear-gradient(135deg, rgba(${t.rgb}, 0.18), rgba(${t.rgb}, 0.08))`,
                              border: `1px solid rgba(${t.rgb}, 0.22)`,
                              color: t.hex,
                            }}
                          >
                            {lesson.code}
                          </span>
                          <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-semibold text-ink sm:text-[13.5px]">
                              {lesson.title}
                            </span>
                            <span className="text-[12px] leading-[1.75] text-muted sm:text-[12.5px]">
                              {lesson.brief}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* 7. 服务模式：怎么交付 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#FCD34D">服务模式</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[36px] lg:leading-[1.25]">
              <span className="block">1 个月线上直播 ·</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">最长 6 个月持续陪跑</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              用一个月把十章系统化课程结构化交付给你，再用最长 6 个月把能力真正稳住——边学边做，结业时 4 件你自己亲手做出来的交付成果同步产出；课程之外的真实问题，6 个月内都可以继续来问。
            </p>
          </div>
        </Reveal>

        {/* 2 大对等阶段：直播 + 6 月陪跑 */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:gap-6 lg:grid-cols-2">
          {SERVICE_STAGES.map((stage, i) => {
            const t = THEMES[stage.theme]
            const isCompanion = stage.code === '02'
            return (
              <Reveal key={stage.code} delay={i * 0.1}>
                <article
                  className="group relative h-full overflow-hidden rounded-[24px] border p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:rounded-[28px] sm:p-8 lg:p-9"
                  style={{
                    borderColor: `rgba(${t.rgb}, ${isCompanion ? 0.4 : 0.28})`,
                    background: `linear-gradient(135deg, rgba(${t.rgb}, ${isCompanion ? 0.14 : 0.10}) 0%, rgba(13,13,18,0.55) 60%)`,
                    boxShadow: isCompanion
                      ? `inset 0 0 0 1px rgba(${t.rgb}, 0.18), 0 20px 50px -20px ${t.hex}55`
                      : `inset 0 0 0 1px rgba(${t.rgb}, 0.06)`,
                  }}
                >
                  {/* 主题色光晕 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-60"
                    style={{
                      background: `radial-gradient(circle, ${t.hex}66 0%, transparent 65%)`,
                      filter: 'blur(28px)',
                    }}
                  />
                  {/* 巨号背景序号 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-6 -right-2 select-none font-mono text-[180px] font-black leading-none tabular sm:text-[220px]"
                    style={{ color: t.hex, opacity: 0.05 }}
                  >
                    {stage.code}
                  </span>

                  <div className="relative flex h-full flex-col gap-4">
                    {/* 顶部标签 + 时长徽标 */}
                    <div className="flex items-center justify-between">
                      <span
                        className="font-mono text-[11px] font-semibold tracking-[0.18em]"
                        style={{ color: t.hex }}
                      >
                        STAGE · {stage.code} · {stage.stage}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold tabular text-canvas"
                        style={{
                          background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                          boxShadow: `0 6px 18px -4px ${t.hex}66`,
                        }}
                      >
                        {stage.duration}
                      </span>
                    </div>

                    <h3 className="font-serif-zh text-[22px] font-semibold leading-[1.3] text-ink sm:text-[26px] lg:text-[28px]">
                      {stage.title}
                    </h3>
                    <p
                      className="text-[13.5px] font-medium leading-[1.6] sm:text-[14.5px]"
                      style={{ color: t.hex }}
                    >
                      {stage.highlight}
                    </p>
                    <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                      {stage.body}
                    </p>

                    {/* 详细服务清单 */}
                    <ul className="mt-2 flex flex-col gap-2.5 border-t pt-4 sm:gap-3 sm:pt-5"
                      style={{ borderColor: `rgba(${t.rgb}, 0.15)` }}
                    >
                      {stage.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-[1.6] text-ink-soft sm:text-[13px]">
                          <span
                            aria-hidden
                            className="mt-1.5 inline-flex h-1.5 w-1.5 flex-none rounded-full"
                            style={{
                              background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                              boxShadow: `0 0 8px ${t.hex}88`,
                            }}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {isCompanion && (
                      <div
                        className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] sm:text-[11px]"
                        style={{
                          borderColor: `rgba(${t.rgb}, 0.45)`,
                          background: `rgba(${t.rgb}, 0.10)`,
                          color: t.hex,
                        }}
                      >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: t.hex }} />
                        训练营独家承诺
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>

        {/* 时间轴条 */}
        <Reveal delay={0.18}>
          <div
            className="relative mt-6 overflow-hidden rounded-2xl border p-5 backdrop-blur-xl sm:mt-8 sm:rounded-[22px] sm:p-6"
            style={{
              borderColor: 'rgba(167,139,250,0.22)',
              background:
                'linear-gradient(110deg, rgba(167,139,250,0.10) 0%, rgba(251,113,133,0.08) 50%, rgba(251,191,36,0.10) 100%)',
            }}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
                  TIMELINE · 服务节奏
                </span>
                <p className="text-[14px] font-semibold text-ink sm:text-[15px]">
                  1 个月集中授课 · 边学边交付 · 最长 6 个月持续答疑陪跑
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] tabular text-ink-soft sm:text-[12px]">
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(167,139,250,0.18)', color: '#C4B5FD' }}
                >
                  第 1 月 · 直播
                </span>
                <span className="text-muted">→</span>
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(251,113,133,0.15)', color: '#FDA4AF' }}
                >
                  实操产出
                </span>
                <span className="text-muted">→</span>
                <span
                  className="rounded-full px-3 py-1.5"
                  style={{ background: 'rgba(251,191,36,0.15)', color: '#FCD34D' }}
                >
                  6 月陪跑
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 8. 底部 CTA */}
      <BottomCta onContact={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
