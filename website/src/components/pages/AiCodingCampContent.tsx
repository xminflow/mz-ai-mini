'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

import { ContactQrCodeModal } from '../layout'
import { GradientText, Reveal } from '../motion'
import {
  THEMES,
  PROJECT_TIMELINE, TIMELINE_NODES_XY, buildSmoothPath,
} from './ai-coding-camp/data'
import { SectionEyebrow } from './ai-coding-camp/primitives'
import { Hero } from './ai-coding-camp/Hero'
import { InstructorSection } from './ai-coding-camp/InstructorSection'
import { StageOneSection } from './ai-coding-camp/StageOneSection'
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

      {/* 3. 讲师介绍：行明 */}
      <InstructorSection />

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

      {/* 第一阶段：交付成果 / 课程总览 / 十章大纲 / 服务模式 + ¥1999 报名入口 */}
      <StageOneSection onEnroll={openContact} />

      {/* 8. 底部 CTA */}
      <BottomCta onContact={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
