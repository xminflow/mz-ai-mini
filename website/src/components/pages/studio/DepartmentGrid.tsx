'use client'

import { Reveal, GradientText } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { THEMES } from '../ai-coding-camp/data'
import { DEPARTMENTS, type Department } from './data'

const DIFFICULTY_LABEL: Record<Department['difficulty'], string> = {
  1: '入门',
  2: '基础进阶',
  3: '中阶',
  4: '进阶',
  5: '高阶',
}

// 5 个岗位位置：主管 1 + 学员 4，本轮全部渲染为统一"虚位以待"占位态
const ROSTER_SLOTS: Array<{ role: string }> = [
  { role: '研发主管' },
  { role: '学员' },
  { role: '学员' },
  { role: '学员' },
  { role: '学员' },
]

function DifficultyStars({ level }: { level: Department['difficulty'] }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`难度 ${level} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: i <= level ? 'currentColor' : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </span>
  )
}

function DepartmentCard({ dept, index, onApply }: { dept: Department; index: number; onApply: () => void }) {
  const t = THEMES[dept.theme]
  return (
    <Reveal delay={index * 0.06}>
      <article
        className="group relative h-full overflow-hidden rounded-md p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:p-7"
        style={{
          background: `linear-gradient(150deg, rgba(${t.rgb}, 0.16) 0%, rgba(${t.rgb}, 0.05) 100%)`,
          boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`,
            filter: 'blur(24px)',
          }}
        />

        <div className="relative flex h-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[12px] font-bold text-canvas sm:h-10 sm:w-10 sm:text-[13px]"
              style={{
                background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                boxShadow: `0 4px 16px -2px ${t.hex}66`,
              }}
            >
              {dept.code}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px]"
              style={{
                borderColor: `rgba(${t.rgb}, 0.35)`,
                color: t.hex,
                background: `rgba(${t.rgb}, 0.08)`,
              }}
            >
              <DifficultyStars level={dept.difficulty} />
              难度 · {DIFFICULTY_LABEL[dept.difficulty]}
            </span>
          </div>

          <h3 className="font-serif-zh text-[19px] font-semibold leading-[1.35] text-ink sm:text-[22px]">
            {dept.name}
          </h3>
          <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
            {dept.project}
          </p>

          {/* 人员名单：主管 + 4 学员，全部虚位以待 */}
          <ul className="mt-1 flex flex-col gap-2 border-t pt-3" style={{ borderColor: `rgba(${t.rgb}, 0.15)` }}>
            {ROSTER_SLOTS.map((slot, i) => (
              <li key={i} className="flex items-center gap-2.5 text-[12.5px] text-ink-soft">
                <span
                  aria-hidden
                  className="flex h-6 w-6 flex-none items-center justify-center rounded-full border text-[10px]"
                  style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.4)' }}
                >
                  ?
                </span>
                <span>
                  {slot.role} · <span className="text-muted">虚位以待</span>
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onApply}
            className="mt-auto flex items-center gap-1.5 self-start text-[12.5px] font-semibold transition-colors"
            style={{ color: t.hex }}
          >
            申请加入这个部门 →
          </button>
        </div>
      </article>
    </Reveal>
  )
}

export function DepartmentGrid({ onApply }: { onApply: () => void }) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#01aef0">研发部门</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[-0.02em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="block">每个部门 5 人编制，</span>
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">负责一个真实研发项目</GradientText>
            </span>
          </h2>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5">
        {DEPARTMENTS.map((dept, i) => (
          <DepartmentCard key={dept.code} dept={dept} index={i} onApply={onApply} />
        ))}
      </div>
    </section>
  )
}
