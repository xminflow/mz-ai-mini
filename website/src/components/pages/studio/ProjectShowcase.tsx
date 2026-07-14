'use client'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { THEMES } from '../ai-coding-camp/data'
import { PROJECTS, PROJECT_TIERS, type ProjectCategory, type ProjectTierKey } from './data'

const TIER_ORDER: ProjectTierKey[] = ['basic', 'medium', 'advanced']

// 难度越高，卡片的辉光/描边越强，视觉上呼应"由浅入深"的分区叙事
const TIER_INTENSITY: Record<ProjectTierKey, { glowOpacity: number; glowSize: string; spine: string; ring: string }> = {
  basic: { glowOpacity: 0.35, glowSize: 'h-36 w-36', spine: 'w-[3px]', ring: '0.3' },
  medium: { glowOpacity: 0.55, glowSize: 'h-44 w-44', spine: 'w-[3px]', ring: '0.45' },
  advanced: { glowOpacity: 0.85, glowSize: 'h-56 w-56', spine: 'w-1', ring: '0.6' },
}

function CategoryIcon({ category }: { category: ProjectCategory }) {
  if (category.includes('AI')) {
    return (
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
        <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6" />
    </svg>
  )
}

function ProjectCard({ project, index }: { project: (typeof PROJECTS)[number]; index: number }) {
  const t = THEMES[PROJECT_TIERS[project.tier].theme]
  const stars = PROJECT_TIERS[project.tier].stars
  const intensity = TIER_INTENSITY[project.tier]
  return (
    <Reveal delay={Math.min(index, 6) * 0.05}>
      <article
        className="group relative h-full overflow-hidden rounded-md p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:p-6"
        style={{
          background: `linear-gradient(150deg, rgba(${t.rgb}, 0.16) 0%, rgba(${t.rgb}, 0.05) 100%)`,
          boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
        }}
      >
        {/* 左侧渐变主脊：难度越高越粗，替代原本平淡的纯色背景washing */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 ${intensity.spine}`}
          style={{ background: `linear-gradient(180deg, ${t.gradientFrom}, ${t.gradientTo})` }}
        />
        {/* 悬停描边：常态透明,hover 时点亮为主题色细描边 */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-md opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px rgba(${t.rgb}, ${intensity.ring})` }}
        />
        {/* 角落辉光：难度越高辉光越大越亮 */}
        <span
          aria-hidden
          className={`pointer-events-none absolute -right-16 -top-16 rounded-full transition-opacity duration-500 group-hover:opacity-100 ${intensity.glowSize}`}
          style={{
            background: `radial-gradient(circle, ${t.hex}66 0%, transparent 65%)`,
            filter: 'blur(22px)',
            opacity: intensity.glowOpacity,
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-3 right-2 select-none font-mono text-[92px] font-black leading-none tabular sm:right-3 sm:text-[124px]"
          style={{
            backgroundImage: `linear-gradient(160deg, ${t.hex}33, transparent 70%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {project.code}
        </span>

        <div className="relative flex h-full flex-col gap-3 pl-2">
          <div className="flex items-center justify-between gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10.5px] font-semibold"
              style={{
                background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                color: '#050505',
                boxShadow: `0 4px 16px -2px ${t.hex}77`,
              }}
            >
              <CategoryIcon category={project.category} />
              {project.category}
            </span>
            <span className="font-mono text-[11px] tracking-[0.1em]" style={{ color: t.hex }} title={`难度 ${stars}`}>
              {stars}
            </span>
          </div>

          <h4 className="font-serif-zh text-[16.5px] font-semibold leading-[1.4] text-ink sm:text-[18px]">
            {project.title}
          </h4>
          <span
            aria-hidden
            className="block h-[2px] w-8 rounded-full"
            style={{ background: `linear-gradient(90deg, ${t.gradientFrom}, ${t.gradientTo})` }}
          />

          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: t.hex }}>
              业务价值
            </span>
            <p className="text-[12.5px] leading-[1.8] text-ink-soft sm:text-[13px]">
              {project.businessValue}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              招聘重点
            </span>
            <p className="text-[12.5px] leading-[1.8] text-ink-soft sm:text-[13px]">
              {project.hiringFocus}
            </p>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

export function ProjectShowcase() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#01aef0">实战项目库</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[-0.02em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="block">课程完全以项目为核心，</span>
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">20 个真实项目由浅入深</GradientText>
            </span>
            <span className="mt-1 block sm:mt-1.5">挑选你需要的，直接写入简历</span>
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
            每个部门都在这些项目里选一个真刀真枪地做，从基础练手到面试顶流题材，难度由浅入深，覆盖系统架构与 AI 应用两条主线。
          </p>
        </div>
      </Reveal>

      <div className="mt-10 flex flex-col gap-14 sm:mt-12 sm:gap-16">
        {TIER_ORDER.map((tierKey) => {
          const tier = PROJECT_TIERS[tierKey]
          const tt = THEMES[tier.theme]
          const items = PROJECTS.filter((p) => p.tier === tierKey)
          return (
            <div key={tierKey} className="flex flex-col">
              <Reveal>
                <div className="flex flex-col gap-1.5">
                  <span
                    className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                    style={{ color: tt.hex }}
                  >
                    {tier.stars} {tier.label}（{items.length} 个）
                  </span>
                  <span
                    aria-hidden
                    className="mt-1.5 block h-[2px] w-12 rounded-full"
                    style={{ background: `linear-gradient(90deg, ${tt.gradientFrom}, ${tt.gradientTo})` }}
                  />
                </div>
              </Reveal>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-9 sm:gap-5 lg:grid-cols-2">
                {items.map((project, i) => (
                  <ProjectCard key={project.code} project={project} index={i} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
