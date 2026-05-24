import Link from 'next/link'

import type { TrackAnalysisListItem } from '@/types/track-analysis'

interface TrackPaywallPageProps {
  detail: TrackAnalysisListItem
}

export const TrackPaywallPage = ({ detail }: TrackPaywallPageProps) => {
  const reportTitles = detail.report_metas.map((m) => m.title)

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-50 border-b border-hairline bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:h-16 sm:px-6">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-canvas/60 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:border-hairline-strong hover:text-ink-soft"
          >
            ← 返回研究库
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-hairline bg-canvas/60 px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">
            TRACK
          </span>
          {detail.industry && (
            <span className="text-[11.5px] text-muted">#{detail.industry}</span>
          )}
          <span className="rounded-full border border-amber-300/40 bg-amber-300/10 px-2.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-amber-200">
            会员
          </span>
        </div>

        <h1 className="font-serif-zh mb-4 text-[26px] font-semibold leading-[1.25] tracking-tight text-ink sm:text-[30px]">
          {detail.track_keyword}
        </h1>

        {detail.stance_summary && (
          <p className="mb-10 text-[14px] leading-[1.85] text-muted sm:text-[15px]">
            {detail.stance_summary}
          </p>
        )}

        {reportTitles.length > 0 && (
          <div className="mb-10">
            <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
              报告目录
            </div>
            <ul className="space-y-2">
              {reportTitles.map((title) => (
                <li
                  key={title}
                  className="flex items-center gap-3 rounded-xl border border-hairline bg-canvas/40 px-4 py-3"
                >
                  <span className="text-muted">🔒</span>
                  <span className="select-none text-[13.5px] text-muted/60 blur-[2px]">
                    {title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-6 sm:p-8">
          <p className="mb-2 text-[13px] font-medium text-amber-200/80">会员专属内容</p>
          <p className="mb-6 text-[14px] leading-[1.8] text-muted">
            此赛道分析报告包含执行摘要、行业研判、竞争格局、商业模式及 AI 落地操盘手册，仅对有效会员开放。
          </p>
          <Link
            href="/membership"
            className="block rounded-xl border border-amber-300/30 bg-gradient-to-br from-amber-300/20 to-rose-300/10 px-6 py-4 text-center font-semibold text-amber-100 transition-all hover:border-amber-300/50 hover:from-amber-300/30 hover:to-rose-300/20"
          >
            开通会员 · 解锁全部报告
          </Link>
          <p className="mt-4 text-center text-[11.5px] text-muted/60">
            年费 ¥199 起，解锁全部博主洞察 + 赛道分析报告
          </p>
        </div>
      </main>
    </div>
  )
}
