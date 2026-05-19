import Link from 'next/link'
import { AuroraBackground, Reveal } from '../motion'
import { LibraryItemCard } from './LibraryItemCard'
import {
  type LibraryItem,
  LIBRARY_TYPE_LABELS,
  type BreakdownPayload,
  type BloggerPayload,
  type TrackPayload,
  type PlaybookPayload,
} from '@/types/library'

interface LibraryDetailProps {
  item: LibraryItem
  related: LibraryItem[]
}

export const LibraryDetail = ({ item, related }: LibraryDetailProps) => {
  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <AuroraBackground variant="subtle" />
        <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-20">
          <Reveal y={12}>
            <Link
              href={`/library?type=${item.type}`}
              className="inline-flex w-fit items-center gap-1.5 rounded-full border border-hairline bg-surface/50 px-3 py-1 text-[11.5px] text-ink-soft backdrop-blur hover:border-hairline-strong sm:text-[12px]"
            >
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                <path d="M7.78 4.22a.75.75 0 010 1.06L5.06 8h7.94a.75.75 0 010 1.5H5.06l2.72 2.72a.75.75 0 11-1.06 1.06l-4-4a.75.75 0 010-1.06l4-4a.75.75 0 011.06 0z" />
              </svg>
              {LIBRARY_TYPE_LABELS[item.type]}
            </Link>
          </Reveal>
          <Reveal delay={0.06}>
            <h1 className="font-serif-zh text-balance text-[26px] font-semibold leading-[1.35] tracking-[0.005em] sm:text-[34px] sm:leading-[1.3] lg:text-[40px] lg:leading-[1.25]">
              {item.title}
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-[14.5px] leading-[1.95] text-ink-soft sm:text-[15.5px]">
              {item.summary}
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="flex flex-wrap items-center gap-2 text-[11.5px] text-muted">
              {item.platforms.map((p) => (
                <span key={p} className="rounded-full border border-hairline px-2.5 py-0.5">
                  #{p}
                </span>
              ))}
              {item.industries.map((i) => (
                <span key={i} className="rounded-full border border-hairline px-2.5 py-0.5">
                  #{i}
                </span>
              ))}
              <span>{item.publishedAt}</span>
              <span>·</span>
              <span>{item.readTime} 分钟阅读</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20">
        {item.payload.type === 'breakdown' && <BreakdownDetail data={item.payload.data} />}
        {item.payload.type === 'blogger' && <BloggerDetail data={item.payload.data} />}
        {item.payload.type === 'track' && <TrackDetail data={item.payload.data} />}
        {item.payload.type === 'playbook' && <PlaybookDetail data={item.payload.data} />}
      </section>

      {related.length > 0 && (
        <section className="relative mx-auto w-full max-w-6xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20">
          <Reveal>
            <div className="flex flex-col gap-3">
              <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-muted sm:text-[13px]">
                · 相关内容 ·
              </span>
              <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35]">
                同一张内容网络里，还有这些
              </h2>
            </div>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {related.map((rel) => (
              <LibraryItemCard key={rel.id} item={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const Block = ({
  emoji,
  title,
  children,
}: {
  emoji?: string
  title: string
  children: React.ReactNode
}) => (
  <section className="mt-10 flex flex-col gap-3">
    <h2 className="font-serif-zh flex items-center gap-2 text-[18px] font-semibold text-ink sm:text-[20px]">
      {emoji && <span aria-hidden>{emoji}</span>}
      <span>{title}</span>
    </h2>
    <div className="flex flex-col gap-2 text-[14px] leading-[1.95] text-ink-soft sm:text-[14.5px]">
      {children}
    </div>
  </section>
)

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-2">
    {items.map((it) => (
      <li key={it} className="flex items-start gap-2.5">
        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-violet-400/70" />
        <span>{it}</span>
      </li>
    ))}
  </ul>
)

// 爆款拆解
const BreakdownDetail = ({ data }: { data: BreakdownPayload }) => (
  <div>
    <div className="rounded-2xl border border-hairline bg-surface/60 p-5 sm:rounded-[22px] sm:p-6">
      <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted">
        <span className="rounded-md border border-hairline px-2 py-0.5">
          #{data.sourcePlatform}
        </span>
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="truncate text-ink-soft underline-offset-2 hover:underline"
        >
          {data.sourceUrl}
        </a>
      </div>
      <p className="mt-4 text-[14.5px] leading-[1.9] text-ink sm:text-[15px]">
        <span className="font-semibold">一句话判断：</span>
        {data.oneLine}
      </p>
    </div>

    <Block emoji="🪝" title="钩子拆解（视觉 · 文字 · 情绪）">
      <Bullets items={data.hook} />
    </Block>
    <Block emoji="🏗️" title="结构拆解（开头 · 冲突 · 转折 · 收尾）">
      <Bullets items={data.structure} />
    </Block>
    <Block emoji="🎬" title="节奏拆解（时间线 · 镜头）">
      <Bullets items={data.rhythm} />
    </Block>
    <Block emoji="🧪" title="可复用模板（核心价值）">
      <Bullets items={data.template} />
    </Block>
    <Block emoji="🎯" title="适合谁用">
      <p>{data.audience}</p>
    </Block>
  </div>
)

// 博主洞察
const BloggerDetail = ({ data }: { data: BloggerPayload }) => (
  <div>
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-hairline bg-surface/60 p-5 sm:grid-cols-2 sm:rounded-[22px] sm:p-6">
      <Field label="昵称" value={data.profile.nickname} />
      <Field label="平台" value={data.profile.platform} />
      <Field label="粉丝量" value={data.profile.fans} />
      <Field label="定位" value={data.profile.positioning} />
    </div>
    <p className="mt-6 text-[14.5px] leading-[1.95] text-ink sm:text-[15px]">
      <span className="font-semibold">一句话判断：</span>
      {data.oneLine}
    </p>

    <Block title="内容矩阵">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {data.matrix.map((m) => (
          <div
            key={m.name}
            className="flex flex-col gap-1 rounded-xl border border-hairline bg-surface/50 p-3.5"
          >
            <span className="text-[13.5px] font-semibold text-ink">{m.name}</span>
            <span className="text-[12.5px] leading-[1.7] text-muted">{m.role}</span>
          </div>
        ))}
      </div>
    </Block>

    <Block title="成长时间线">
      <div className="flex flex-col gap-2.5 border-l border-hairline pl-5">
        {data.timeline.map((t) => (
          <div key={t.when} className="relative flex flex-col gap-1">
            <span className="absolute -left-[27px] top-1.5 h-2 w-2 rounded-full bg-cyan-300/80" />
            <span className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted">
              {t.when}
            </span>
            <span className="text-[13.5px] text-ink-soft">{t.what}</span>
          </div>
        ))}
      </div>
    </Block>

    <Block title="内容方法论">
      <Bullets items={data.methodology} />
    </Block>
    <Block title="变现路径">
      <Bullets items={data.monetization} />
    </Block>

    <Block title="可借鉴 vs 不可复制">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-surface/50 p-4">
          <h4 className="mb-2 text-[13px] font-semibold text-ink">可借鉴</h4>
          <Bullets items={data.borrowable} />
        </div>
        <div className="rounded-xl border border-hairline bg-surface/50 p-4">
          <h4 className="mb-2 text-[13px] font-semibold text-ink">不可复制</h4>
          <Bullets items={data.notReplicable} />
        </div>
      </div>
    </Block>
  </div>
)

// 赛道分析
const TrackDetail = ({ data }: { data: TrackPayload }) => (
  <div>
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-hairline bg-surface/60 p-5 sm:grid-cols-3 sm:rounded-[22px] sm:p-6">
      <Field label="行业" value={data.portrait.industry} />
      <Field label="平台" value={data.portrait.platforms.join(' · ')} />
      <Field label="阶段" value={data.portrait.stage} />
    </div>
    <p className="mt-6 text-[14.5px] leading-[1.95] text-ink sm:text-[15px]">
      <span className="font-semibold">一句话判断：</span>
      {data.oneLine}
    </p>

    <Block title="玩家地图">
      <div className="flex flex-col gap-2.5">
        {data.landscape.map((row) => (
          <div
            key={row.tier}
            className="flex flex-col gap-1 rounded-xl border border-hairline bg-surface/50 p-3.5 sm:flex-row sm:items-start sm:gap-5"
          >
            <span className="w-32 flex-none font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted">
              {row.tier}
            </span>
            <span className="text-[13.5px] leading-[1.85] text-ink-soft">{row.players}</span>
          </div>
        ))}
      </div>
    </Block>

    <Block title="机会窗口">
      <Bullets items={data.opportunities} />
    </Block>
    <Block title="天花板">
      <Bullets items={data.ceiling} />
    </Block>
    <Block title="变现模型">
      <Bullets items={data.monetization} />
    </Block>
    <Block title="起号策略">
      <Bullets items={data.startupStrategy} />
    </Block>
  </div>
)

// 百万粉博主运营方法论精炼
const PlaybookDetail = ({ data }: { data: PlaybookPayload }) => (
  <div>
    <div className="rounded-2xl border border-hairline bg-surface/60 p-5 sm:rounded-[22px] sm:p-6">
      <span className="font-mono text-[11.5px] uppercase tracking-[0.18em] text-muted">
        适合谁
      </span>
      <p className="mt-2 text-[14.5px] leading-[1.95] text-ink-soft sm:text-[15px]">
        {data.audience}
      </p>
    </div>

    <Block title="正文：可执行步骤">
      <div className="flex flex-col gap-3">
        {data.steps.map((s, idx) => (
          <div
            key={s.title}
            className="flex gap-4 rounded-xl border border-hairline bg-surface/50 p-4"
          >
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-hairline bg-canvas font-mono text-[11px] text-ink-soft">
              {String(idx + 1).padStart(2, '0')}
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="text-[14px] font-semibold text-ink">{s.title}</span>
              <span className="text-[13px] leading-[1.85] text-muted">{s.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </Block>

    <Block title="自检清单">
      <Bullets items={data.checklist} />
    </Block>

    {data.downloads && data.downloads.length > 0 && (
      <Block title="附件">
        <div className="flex flex-wrap gap-2">
          {data.downloads.map((d) => (
            <a
              key={d.label}
              href={d.href}
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5 text-[12.5px] text-ink hover:border-hairline-strong sm:text-[13px]"
            >
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M8 1.5a.75.75 0 01.75.75v7.69l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06L7.25 9.94V2.25A.75.75 0 018 1.5z" />
                <path d="M2.5 13.25a.75.75 0 011.5 0V14h8v-.75a.75.75 0 011.5 0V14a1.5 1.5 0 01-1.5 1.5h-8A1.5 1.5 0 012.5 14v-.75z" />
              </svg>
              {d.label}
            </a>
          ))}
        </div>
      </Block>
    )}
  </div>
)

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">{label}</span>
    <span className="text-[13.5px] text-ink sm:text-[14px]">{value}</span>
  </div>
)

export const _BreakdownDetail = BreakdownDetail
export const _BloggerDetail = BloggerDetail
export const _TrackDetail = TrackDetail
export const _PlaybookDetail = PlaybookDetail
