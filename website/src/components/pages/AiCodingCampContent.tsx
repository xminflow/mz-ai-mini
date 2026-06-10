'use client'

import { useState } from 'react'

import { ContactQrCodeModal } from '../layout'
import { GradientText, Reveal } from '../motion'
import { SectionEyebrow } from './ai-coding-camp/primitives'
import { Hero } from './ai-coding-camp/Hero'
import { JourneyMap } from './ai-coding-camp/JourneyMap'
import { InstructorSection } from './ai-coding-camp/InstructorSection'
import { StageOneSection } from './ai-coding-camp/StageOneSection'
import { StageTwoSection } from './ai-coding-camp/StageTwoSection'
import { BottomCta } from './ai-coding-camp/BottomCta'

/* ─────────────────────────  主组件  ───────────────────────── */

export function AiCodingCampContent() {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      {/* 1. Hero */}
      <Hero />

      {/* 2. 全景学习路径：纵向主线 + 嵌套购买覆盖框（外层 ¥3999 含内层 ¥1999） */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-32">
        <Reveal>
          <div className="flex flex-col gap-4">
            <SectionEyebrow color="#67E8F9">完整学习路径</SectionEyebrow>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
              <span className="block">两门课，</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">覆盖从零基础到职业进阶</GradientText>
              </span>
            </h2>
            <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
              一条纵向主线串起全部里程碑：前段是第一阶段「零基础 AI 编程」，后段是第二阶段「职业开发者进阶」。外层 ¥3999 含第一阶段全部、覆盖整条路径，内层 ¥1999 仅覆盖第一阶段。
            </p>
          </div>
        </Reveal>

        <div className="relative mt-10 overflow-hidden rounded-[24px] border border-hairline bg-canvas/30 p-5 backdrop-blur-xl sm:mt-14 sm:p-8 lg:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                'radial-gradient(circle at 12% 20%, rgba(167,139,250,0.18), transparent 50%), radial-gradient(circle at 88% 80%, rgba(96,165,250,0.16), transparent 50%)',
            }}
          />
          <div className="relative">
            <JourneyMap />
          </div>
        </div>
      </section>

      {/* 3. 讲师介绍：行明 */}
      <InstructorSection />

      {/* 第一阶段：交付成果 / 课程总览 / 课时大纲 / 服务模式 + ¥1999 报名入口 */}
      <StageOneSection onEnroll={openContact} />

      {/* 第二阶段：收获墙 / 三段 14 课大纲 / 服务拟稿 + ¥3999 报名入口 */}
      <StageTwoSection onEnroll={openContact} />

      {/* 8. 底部 CTA */}
      <BottomCta onContact={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
