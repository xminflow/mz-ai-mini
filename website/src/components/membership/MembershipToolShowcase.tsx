'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'

type ShowcaseFeature = {
  id: string
  label: string
  src: string
  alt: string
  caption: string
}

const FEATURES: ShowcaseFeature[] = [
  {
    id: 'material',
    label: '素材库',
    src: '/tool/material.png',
    alt: '本地素材库自动采集低粉爆款素材',
    caption: '全自动采集低粉爆款素材，帮你快速找到模仿素材。',
  },
  {
    id: 'chat',
    label: 'AI 对话',
    src: '/tool/chat.png',
    alt: 'AI 与自媒体运营实战方法论结合的对话能力',
    caption: '结合 AI 与自媒体运营实战方法论完美融合，随时激发创作灵感。',
  },
  {
    id: 'diagnosis',
    label: '内容诊断',
    src: '/tool/content_diagnosis.png',
    alt: '针对自有素材的深度诊断报告',
    caption: '对你的素材进行深度诊断，提出针对性改善意见。',
  },
  {
    id: 'hot',
    label: '爆款拆解',
    src: '/tool/hot_analysis.png',
    alt: '爆款素材的底层结构拆解',
    caption: '对爆款素材进行底层结构拆解，深度剖析其内部爆款逻辑。',
  },
  {
    id: 'blogger',
    label: '博主洞察',
    src: '/tool/blogger.png',
    alt: '博主主页与内容洞察',
    caption: '一键拆解某位博主的内容矩阵、节奏与高频选题。',
  },
]

const AUTO_ADVANCE_MS = 4500

export function MembershipToolShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (isPaused) {
      clearTimer()
      return
    }
    clearTimer()
    timerRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURES.length)
    }, AUTO_ADVANCE_MS)
    return clearTimer
  }, [activeIndex, isPaused, clearTimer])

  const activeFeature = FEATURES[activeIndex]

  return (
    <div
      className="flex flex-col gap-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 顶部 tab 条 */}
      <div className="relative -mx-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center gap-1.5 px-1">
          {FEATURES.map((feature, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative isolate rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors sm:text-[12.5px] ${
                  isActive ? 'text-ink' : 'text-muted hover:text-ink-soft'
                }`}
                aria-pressed={isActive}
              >
                {isActive && (
                  <motion.span
                    layoutId="tool-tab-pill"
                    className="absolute inset-0 -z-10 rounded-full border border-hairline-strong bg-surface-2/80 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                {feature.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 主图区域 */}
      <div className="relative overflow-hidden rounded-2xl border border-hairline bg-surface/60 backdrop-blur sm:rounded-[22px]">
        {/* 背景光晕 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 12% 0%, rgba(167,139,250,0.18), transparent 55%), radial-gradient(circle at 88% 100%, rgba(34,211,238,0.14), transparent 55%)',
          }}
        />

        {/* 图片容器 */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeFeature.id}
              src={activeFeature.src}
              alt={activeFeature.alt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
          </AnimatePresence>

          {/* 底部渐隐 + 描述 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas/85 via-canvas/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-3.5">
            <AnimatePresence mode="wait">
              <motion.p
                key={`caption-${activeFeature.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-[12px] leading-[1.7] text-ink-soft sm:text-[12.5px]"
              >
                {activeFeature.caption}
              </motion.p>
            </AnimatePresence>
            <span className="hidden shrink-0 font-mono text-[10.5px] tracking-[0.18em] text-muted sm:inline">
              {String(activeIndex + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}
            </span>
          </div>

          {/* 进度条 */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-hairline">
            <motion.div
              key={`progress-${activeIndex}-${isPaused ? 'paused' : 'running'}`}
              className="h-full bg-gradient-to-r from-violet-300/80 via-fuchsia-300/70 to-cyan-300/80"
              initial={{ width: '0%' }}
              animate={{ width: isPaused ? '100%' : '100%' }}
              transition={{
                duration: isPaused ? 0 : AUTO_ADVANCE_MS / 1000,
                ease: 'linear',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
