import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LectureMarkdown from '@/components/LectureMarkdown'
import { ACCENTS, getAdjacentStages, getStage, getStageSlugs, stageLabel } from '@/lib/content/ai-coding'

// ISR：与公开内容页一致，每小时再生
export const revalidate = 3600

export function generateStaticParams() {
  return getStageSlugs().map((stage) => ({ stage }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ stage: string }> },
): Promise<Metadata> {
  const { stage: slug } = await params
  const stage = getStage(slug)
  if (!stage) return {}
  return {
    title: `${stageLabel(stage.order)} · ${stage.title}`,
    description: stage.summary,
  }
}

export default async function StageDetailPage(
  { params }: { params: Promise<{ stage: string }> },
) {
  const { stage: slug } = await params
  const stage = getStage(slug)
  if (!stage) notFound()
  const a = ACCENTS[stage.accent]
  const { prev, next } = getAdjacentStages(slug)

  return (
    <div className="relative">
      {/* 头部 */}
      <section className="relative overflow-hidden pb-2">
        {/* 顶部主题色光晕 */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${a.hex}33 0%, transparent 70%)`, filter: 'blur(34px)' }}
        />
        <div className="relative mx-auto max-w-3xl">
          <Link href="/ai-coding" className="inline-flex items-center gap-1 text-sm text-mute transition-colors hover:text-ink">
            ← 返回学习路径
          </Link>
          <div className="mt-6 flex items-center gap-4">
            <span
              className="grid h-14 w-14 flex-none place-items-center rounded-2xl font-display text-lg font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${a.from}, ${a.to})`,
                boxShadow: `0 8px 28px -6px ${a.hex}aa, inset 0 0 0 1px rgba(255,255,255,0.18)`,
              }}
            >
              {stage.order}
            </span>
            <div>
              <span className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: a.hex }}>
                {stageLabel(stage.order)}
              </span>
              <h1 className="mt-1 font-display text-4xl font-medium text-ink">{stage.title}</h1>
            </div>
          </div>
          <p className="mt-4 leading-relaxed text-ink-2">{stage.tagline}</p>
        </div>
      </section>

      <article className="mx-auto mt-8 max-w-3xl">
        {/* 学习目标卡片 */}
        <section
          className="relative overflow-hidden rounded-card border p-6"
          style={{
            borderColor: `rgba(${a.rgb}, 0.28)`,
            background: `linear-gradient(135deg, rgba(${a.rgb}, 0.1) 0%, rgba(13,13,18,0.6) 60%)`,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full"
            style={{ background: `radial-gradient(circle, ${a.hex}44 0%, transparent 65%)`, filter: 'blur(22px)' }}
          />
          <h2 className="relative font-display text-base font-medium text-ink">学完你能做到</h2>
          <ul className="relative mt-3 space-y-2">
            {stage.objectives.map((obj, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-2">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-pill" style={{ background: a.hex }} />
                {obj}
              </li>
            ))}
          </ul>
        </section>

        {/* 讲义正文 */}
        <div className="mt-10">
          <LectureMarkdown content={stage.content} accent={a.hex} />
        </div>

        {/* 上一阶段 / 下一阶段 */}
        <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-line pt-8">
          {prev ? (
            <Link
              href={`/ai-coding/${prev.slug}`}
              className="group rounded-card border border-line p-4 transition-colors hover:border-line-strong hover:bg-white/[0.04]"
            >
              <span className="text-xs text-mute">← 上一阶段</span>
              <span className="mt-1 block font-display text-sm font-medium text-ink-2 transition-colors group-hover:text-ink">
                {prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/ai-coding/${next.slug}`}
              className="group rounded-card border border-line p-4 text-right transition-colors hover:border-line-strong hover:bg-white/[0.04]"
            >
              <span className="text-xs text-mute">下一阶段 →</span>
              <span className="mt-1 block font-display text-sm font-medium text-ink-2 transition-colors group-hover:text-ink">
                {next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  )
}
