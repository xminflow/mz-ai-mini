'use client'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { THEMES } from '../ai-coding-camp/data'
import { PROJECTS, PROJECT_TIERS, type ProjectTierKey } from './data'

const TIER_ORDER: ProjectTierKey[] = ['basic', 'medium', 'advanced']

function ProjectCard({ project, index }: { project: (typeof PROJECTS)[number]; index: number }) {
  const t = THEMES[PROJECT_TIERS[project.tier].theme]
  return (
    <Reveal delay={Math.min(index, 6) * 0.05}>
      <article
        className="group relative h-full overflow-hidden rounded-md p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:p-6"
        style={{
          background: `linear-gradient(150deg, rgba(${t.rgb}, 0.16) 0%, rgba(${t.rgb}, 0.05) 100%)`,
          boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`,
            filter: 'blur(24px)',
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-2 right-2 select-none font-mono text-[90px] font-black leading-none tabular sm:right-3 sm:text-[120px]"
          style={{ color: t.hex, opacity: 0.06 }}
        >
          {project.code}
        </span>

        <div className="relative flex h-full flex-col gap-3">
          <div className="flex items-center justify-between">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-[11px] font-bold text-canvas sm:h-9 sm:w-9 sm:text-[12px]"
              style={{
                background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                boxShadow: `0 4px 16px -2px ${t.hex}66`,
              }}
            >
              {project.code}
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
              {project.category}
            </span>
          </div>

          <h4 className="font-serif-zh text-[16.5px] font-semibold leading-[1.4] text-ink sm:text-[18px]">
            {project.title}
          </h4>

          <p className="text-[12.5px] leading-[1.8] text-ink-soft sm:text-[13px]">
            {project.body}
          </p>
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
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
            每个部门都在这些项目里选一个真刀真枪地做，从基础练手到面试顶流题材，难度由浅入深，覆盖传统后端架构与 LLM 应用两条主线。
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
