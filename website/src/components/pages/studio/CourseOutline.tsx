'use client'

import { useState } from 'react'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { THEMES } from '../ai-coding-camp/data'
import type { Theme } from '../ai-coding-camp/data'
import { COURSE_OUTLINE, COURSE_OUTLINE_TITLE, type CourseNode } from './data'

// 13 个章节按站内既有主题色轮转配色，不新增色值
const CHAPTER_THEMES: Theme[] = [
  THEMES.cognition,
  THEMES.frontend,
  THEMES.backend,
  THEMES.agent,
  THEMES.launch,
  THEMES.mobile,
  THEMES.mindset,
]

function ChevronIcon({ open, color }: { open: boolean; color: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-3 w-3 flex-none transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 2.5 8 6l-4 3.5" />
    </svg>
  )
}

// 递归渲染子树：有 children 的节点渲染为带子线的小节标题，纯叶子节点渲染为线+圆点+文字
function OutlineBranch({ node, theme }: { node: CourseNode; theme: Theme }) {
  if (!node.children || node.children.length === 0) {
    return (
      <li className="flex items-start gap-2.5 border-l py-1.5 pl-4" style={{ borderColor: `${theme.hex}22` }}>
        <span
          aria-hidden
          className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full"
          style={{ background: theme.hex, boxShadow: `0 0 6px ${theme.hex}66` }}
        />
        <span className="text-[12.5px] leading-[1.7] text-ink-soft sm:text-[13px]">{node.title}</span>
      </li>
    )
  }
  return (
    <li className="border-l pl-4" style={{ borderColor: `${theme.hex}30` }}>
      <div className="flex items-center gap-2 py-1.5">
        <span aria-hidden className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: theme.hex }} />
        <span className="text-[13px] font-medium text-ink sm:text-[13.5px]">{node.title}</span>
      </div>
      <ul className="flex flex-col">
        {node.children.map((child, i) => (
          <OutlineBranch key={i} node={child} theme={theme} />
        ))}
      </ul>
    </li>
  )
}

function ChapterRow({ chapter, theme, index }: { chapter: CourseNode; theme: Theme; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="relative pl-11 sm:pl-14">
      <span
        aria-hidden
        className="absolute left-[11px] top-1 h-[18px] w-[18px] rounded-full sm:left-[15px]"
        style={{
          background: `radial-gradient(circle, ${theme.gradientFrom} 0%, ${theme.gradientTo} 80%)`,
          boxShadow: `0 0 18px ${theme.hex}66`,
        }}
      />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] font-semibold tabular" style={{ color: theme.hex }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="font-serif-zh text-[15px] font-semibold leading-[1.35] text-ink sm:text-[17px]">
            {chapter.title}
          </h3>
        </span>
        <ChevronIcon open={open} color={theme.hex} />
      </button>

      {open && chapter.children && (
        <ul className="mt-3 flex flex-col pb-1">
          {chapter.children.map((child, i) => (
            <OutlineBranch key={i} node={child} theme={theme} />
          ))}
        </ul>
      )}
    </li>
  )
}

export function CourseOutline({ onEnroll }: { onEnroll: () => void }) {
  return (
    <section className="relative mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <span
            className="inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{
              borderColor: 'rgba(248,236,29,0.45)',
              background: 'rgba(248,236,29,0.10)',
              color: '#f8ec1d',
            }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: '#f8ec1d' }} />
            赠送课程 · GIFT
          </span>
          <SectionEyebrow color="#f8ec1d">往期课程大纲</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[-0.02em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="block">报名即赠，</span>
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">全套录播视频 + 针对性答疑</GradientText>
            </span>
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
            {COURSE_OUTLINE_TITLE}，全部章节完整录制，报名后免费赠送观看权限，遇到问题还可以针对性答疑。点击章节标题展开详细大纲。
          </p>
        </div>
      </Reveal>

      <div className="relative mt-10 sm:mt-12">
        <span
          aria-hidden
          className="absolute left-[19px] top-2 bottom-2 w-px sm:left-[23px]"
          style={{
            background: `linear-gradient(to bottom, ${CHAPTER_THEMES.map((t) => t.hex).join(', ')})`,
            opacity: 0.4,
          }}
        />
        <ol className="flex flex-col gap-5 sm:gap-6">
          {COURSE_OUTLINE.map((chapter, i) => (
            <Reveal key={chapter.title} delay={Math.min(i, 6) * 0.04}>
              <ChapterRow chapter={chapter} theme={CHAPTER_THEMES[i % CHAPTER_THEMES.length]} index={i} />
            </Reveal>
          ))}
        </ol>
      </div>

      <Reveal delay={0.1}>
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={onEnroll}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:px-8 sm:py-3.5 sm:text-sm"
            style={{ background: '#f0f0f0', boxShadow: '0 12px 40px -8px rgba(248,236,29,0.45)' }}
          >
            <span
              aria-hidden
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: 'linear-gradient(120deg, #fff652, #f8ec1d, #57beff, #01aef0)',
                backgroundSize: '200% 200%',
                animation: 'shimmerText 4s linear infinite',
              }}
            />
            <span className="relative z-10">咨询报名领取</span>
          </button>
        </div>
      </Reveal>
    </section>
  )
}
