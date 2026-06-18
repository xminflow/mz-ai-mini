import type { Metadata } from 'next'
import Link from 'next/link'
import { ACCENTS, getStages, stageLabel } from '@/lib/content/ai-coding'

export const metadata: Metadata = {
  title: 'AI编程学习路径',
  description: '从认识 AI 工具到独立上线，一条纵向进阶的 AI 编程学习路径。',
}

const ArrowRight = () => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
  </svg>
)

export default function AiCodingPage() {
  const stages = getStages()
  return (
    <div className="relative">
      {/* Hero */}
      <section className="pb-6 pt-8 text-center sm:pt-10">
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.15] tracking-tight sm:text-6xl">
          <span className="text-shimmer">一条进阶路径，从工具到上线</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-mute">
          按阶段循序学习，每个阶段点开即是完整讲义。沿着这条路径一步步走，做出属于自己的 AI 应用。
        </p>
      </section>

      {/* 纵向阶段路径 */}
      <ol className="relative mx-auto mt-10 max-w-3xl space-y-7">
        {/* 串联各阶段节点的渐变竖线 */}
        <span
          aria-hidden
          className="absolute left-[27px] top-6 bottom-6 w-px"
          style={{
            background: 'linear-gradient(to bottom, #22d3ee, #38bdf8, #6366f1)',
            opacity: 0.5,
          }}
        />
        {stages.map((stage) => {
          const a = ACCENTS[stage.accent]
          return (
            <li key={stage.slug} className="relative">
              <Link href={`/ai-coding/${stage.slug}`} className="group flex gap-5">
                {/* 序号节点 */}
                <span
                  className="relative z-[1] grid h-14 w-14 flex-none place-items-center rounded-2xl font-display text-lg font-semibold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                    boxShadow: `0 8px 28px -6px ${a.hex}aa, inset 0 0 0 1px rgba(255,255,255,0.18)`,
                  }}
                >
                  {stage.order}
                </span>

                {/* 阶段卡片 */}
                <article
                  className="relative flex-1 overflow-hidden rounded-card border p-6 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1"
                  style={{
                    borderColor: `rgba(${a.rgb}, 0.28)`,
                    background: `linear-gradient(135deg, rgba(${a.rgb}, 0.12) 0%, rgba(13,13,18,0.6) 60%)`,
                    boxShadow: `inset 0 0 0 1px rgba(${a.rgb}, 0.06)`,
                  }}
                >
                  {/* 主题色光晕 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: `radial-gradient(circle, ${a.hex}55 0%, transparent 65%)`, filter: 'blur(22px)' }}
                  />
                  {/* 巨大半透明序号 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-7 right-2 select-none font-display text-[130px] font-bold leading-none"
                    style={{ color: a.hex, opacity: 0.07 }}
                  >
                    {stage.order}
                  </span>

                  <div className="relative">
                    <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: a.hex }}>
                      {stageLabel(stage.order)}
                    </span>
                    <h2 className="mt-2 font-display text-2xl font-medium text-ink">{stage.title}</h2>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{stage.tagline}</p>
                    <ul className="mt-4 space-y-1.5">
                      {stage.objectives.slice(0, 3).map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-mute">
                          <span className="mt-1.5 h-1 w-1 flex-none rounded-pill" style={{ background: a.hex }} />
                          {obj}
                        </li>
                      ))}
                    </ul>
                    <span
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-transform group-hover:translate-x-0.5"
                      style={{ color: a.hex }}
                    >
                      进入本阶段 <ArrowRight />
                    </span>
                  </div>
                </article>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
