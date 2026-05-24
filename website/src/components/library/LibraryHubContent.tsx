'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuroraBackground, GradientText, Reveal } from '../motion'
import { ContactQrCodeModal } from '../layout'
import {
  bloggerPlatformLabel,
  formatBloggerFans,
} from '@/types/blogger-insight'
import type {
  LibraryBloggerPreview,
  LibraryHubData,
  LibraryTrackPreview,
} from '@/services/library'

interface LibraryHubContentProps {
  data: LibraryHubData
}

interface SectionCard {
  key: 'blogger' | 'playbook' | 'breakdown' | 'track'
  label: string
  title: string
  tagline: string
  promise: string[]
  href: string | null
  ctaLabel: string
  status: 'live' | 'upcoming'
  badge: string
  accent: string
}

export const LibraryHubContent = ({ data }: LibraryHubContentProps) => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  const sections: SectionCard[] = [
    {
      key: 'playbook',
      label: '01 · PLAYBOOK',
      title: '百万粉博主运营方法论精炼',
      tagline: '把百万级博主背后的打法做成可上手的章节',
      promise: [
        '从定位、选题、文案、镜头到变现，按章节系统拆',
        '每章都收口到「可执行清单」，不是道理堆叠',
        '持续更新，跟着真实跑出来的案例迭代',
      ],
      href: '/playbook',
      ctaLabel: `阅读全部 ${data.playbook.chapters} 章`,
      status: 'live',
      badge: `已上线 · ${data.playbook.chapters} 章`,
      accent: 'from-amber-300/80 to-rose-300/70',
    },
    {
      key: 'blogger',
      label: '02 · BLOGGER',
      title: '博主洞察',
      tagline: '一个博主，一份从画像到打法的深度拆解',
      promise: [
        '抓取主页，自动还原账号画像、粉丝结构、定位演变',
        '把矩阵布局、内容方法论、变现路径串成一条线',
        '基于真实数据，不是 AI 二手解读',
      ],
      href: '/bloggers',
      ctaLabel: data.blogger.totalCount > 0 ? '浏览博主洞察' : '进入博主洞察',
      status: 'live',
      badge:
        data.blogger.totalCount > 0
          ? `已上线 · ${data.blogger.totalCount}+ 位真实博主`
          : '已上线',
      accent: 'from-violet-400/70 to-cyan-300/70',
    },
    {
      key: 'breakdown',
      label: '03 · BREAKDOWN',
      title: '爆款拆解',
      tagline: '粘贴一条链接，10 秒看懂它为什么火',
      promise: [
        '钩子 · 结构 · 节奏 · 模板，四个维度逐条拆',
        '锁定可复用的模板，避免被"灵感型解读"带走',
        '团队正在把每周新案例沉淀进信息库',
      ],
      href: null,
      ctaLabel: '上线时通知我',
      status: 'upcoming',
      badge: '筹备中',
      accent: 'from-sky-300/70 to-violet-400/70',
    },
    {
      key: 'track',
      label: '04 · TRACK',
      title: '赛道分析',
      tagline: '一个赛道的玩家、机会窗口与天花板',
      promise: [
        '6 份子报告：执行摘要 / 行业研判 / 竞争格局 / 商业模式 / AI 落地 / 操盘手册',
        '基于公开权威数据，用投研级框架还原',
        '立场明确，告诉你「能不能切、什么时候切、怎么切」',
      ],
      href: '/tracks',
      ctaLabel:
        data.track.totalCount > 0 ? '浏览赛道分析' : '进入赛道分析',
      status: 'live',
      badge:
        data.track.totalCount > 0
          ? `已上线 · ${data.track.totalCount}+ 个赛道`
          : '已上线',
      accent: 'from-emerald-300/70 to-cyan-300/70',
    },
  ]

  return (
    <div className="relative">
      {/* Hero + 板块卡片墙：合并为同一个视觉段 */}
      <section className="relative overflow-hidden">
        <AuroraBackground variant="subtle" />
        <div className="relative mx-auto w-full max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
          <div className="flex flex-col gap-5 sm:gap-6">
            <Reveal y={16}>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-hairline bg-surface/50 px-3 py-1 text-[11px] text-ink-soft backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
                信息库 · CONTENT LIBRARY
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="font-serif-zh max-w-3xl text-balance text-[26px] font-semibold leading-[1.4] tracking-[0.005em] sm:text-[36px] sm:leading-[1.3] lg:text-[44px] lg:leading-[1.25]">
                把别人验证过的东西，
                <GradientText className="font-semibold">拆给你看</GradientText>
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="max-w-2xl text-[14px] leading-[1.95] text-ink-soft sm:text-[15.5px]">
                4 个板块、4 个具体的问题——每一份都来自真实数据，每一份都收口到可上手的动作。
              </p>
            </Reveal>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2">
            {sections.map((sec, idx) => (
              <Reveal key={sec.key} delay={0.2 + idx * 0.06}>
                <SectionCardView
                  section={sec}
                  onUpcomingCta={openContact}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 博主洞察真实预览 */}
      {data.blogger.available && (
        <section className="relative mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <Reveal>
            <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted sm:text-[12px]">
                  · LIVE · 来自博主洞察
                </span>
                <h2 className="font-serif-zh text-[19px] font-semibold leading-[1.45] sm:text-[24px]">
                  最近分析过的真实博主
                </h2>
              </div>
              <Link
                href="/bloggers"
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-hairline-strong hover:text-ink sm:text-[13px]"
              >
                查看全部
                <ArrowRight small />
              </Link>
            </div>
          </Reveal>

          {data.blogger.errorMessage ? (
            <div className="rounded-2xl border border-hairline bg-surface/40 p-5 text-[13px] text-muted sm:text-[13.5px]">
              {data.blogger.errorMessage}
            </div>
          ) : data.blogger.previews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-hairline bg-surface/30 p-6 text-center text-[13px] text-muted sm:text-[13.5px]">
              第一批博主拆解正在加紧整理，稍后回来看看。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {data.blogger.previews.map((blogger) => (
                <BloggerPreviewCard key={blogger.slug} blogger={blogger} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 赛道分析真实预览 */}
      {data.track.available && (
        <section className="relative mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
          <Reveal>
            <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="flex flex-col gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted sm:text-[12px]">
                  · LIVE · 来自赛道分析
                </span>
                <h2 className="font-serif-zh text-[19px] font-semibold leading-[1.45] sm:text-[24px]">
                  最近拆过的真实赛道
                </h2>
              </div>
              <Link
                href="/tracks"
                className="inline-flex w-fit items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5 text-[12.5px] font-medium text-ink-soft transition-colors hover:border-hairline-strong hover:text-ink sm:text-[13px]"
              >
                查看全部
                <ArrowRight small />
              </Link>
            </div>
          </Reveal>

          {data.track.errorMessage ? (
            <div className="rounded-2xl border border-hairline bg-surface/40 p-5 text-[13px] text-muted sm:text-[13.5px]">
              {data.track.errorMessage}
            </div>
          ) : data.track.previews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-hairline bg-surface/30 p-6 text-center text-[13px] text-muted sm:text-[13.5px]">
              第一批赛道分析正在加紧整理，稍后回来看看。
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {data.track.previews.map((track) => (
                <TrackPreviewCard key={track.slug} track={track} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 底部 CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[22px] border border-hairline bg-surface/40 p-6 text-center backdrop-blur-xl sm:rounded-[28px] sm:p-10 lg:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  'radial-gradient(circle at 20% 0%, rgba(167,139,250,0.24), transparent 55%), radial-gradient(circle at 80% 100%, rgba(34,211,238,0.20), transparent 55%)',
              }}
            />
            <div className="relative flex flex-col items-center gap-4 sm:gap-5">
              <h2 className="font-serif-zh max-w-2xl text-balance text-[20px] font-semibold leading-[1.4] sm:text-[26px] lg:text-[30px]">
                还没找到适合你的入口？
                <br className="hidden sm:inline" />
                <GradientText className="font-semibold">直接聊一次</GradientText>
              </h2>
              <p className="max-w-xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm">
                60 分钟连麦咨询，把你的赛道、阶段、卡点说清楚，我们再决定从哪个板块切进去。
              </p>
              <div className="mt-1 flex flex-col items-center gap-2.5 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={openContact}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-[13.5px]"
                >
                  预约付费咨询
                  <ArrowRight small />
                </button>
                <Link
                  href="/bloggers"
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong sm:px-5 sm:py-2.5 sm:text-[13.5px]"
                >
                  浏览博主洞察
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}

interface SectionCardViewProps {
  section: SectionCard
  onUpcomingCta: () => void
}

const SectionCardView = ({ section, onUpcomingCta }: SectionCardViewProps) => {
  const isLive = section.status === 'live'

  const Body = (
    <div
      className={[
        'group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border bg-surface/60 p-5 backdrop-blur-xl transition-all sm:rounded-[22px] sm:p-6',
        isLive
          ? 'border-hairline hover:-translate-y-1 hover:border-hairline-strong'
          : 'border-hairline/70',
      ].join(' ')}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br ${section.accent} opacity-[0.18] blur-2xl sm:h-40 sm:w-40`}
      />

      <div className="relative flex items-center justify-between gap-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted sm:text-[11px]">
          {section.label}
        </span>
        <span
          className={[
            'rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] sm:text-[10.5px]',
            isLive
              ? 'border-violet-300/40 bg-violet-500/10 text-violet-200'
              : 'border-hairline bg-canvas/60 text-muted',
          ].join(' ')}
        >
          {section.badge}
        </span>
      </div>

      <div className="relative flex flex-col gap-2">
        <h3 className="font-serif-zh text-[18px] font-semibold leading-[1.4] text-ink sm:text-[20px]">
          {section.title}
        </h3>
        <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
          {section.tagline}
        </p>
      </div>

      <ul className="relative mt-1 flex flex-col gap-2 text-[12.5px] leading-[1.8] text-muted sm:text-[13px]">
        {section.promise.map((p) => (
          <li key={p} className="flex items-start gap-2.5">
            <span className="mt-2 h-1 w-1 flex-none rounded-full bg-violet-400/70" />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-auto pt-2">
        <span
          className={[
            'inline-flex items-center gap-1.5 text-[12.5px] font-medium transition-colors sm:text-[13px]',
            isLive
              ? 'text-ink-soft group-hover:text-ink'
              : 'text-muted group-hover:text-ink-soft',
          ].join(' ')}
        >
          {section.ctaLabel}
          <ArrowRight small />
        </span>
      </div>
    </div>
  )

  if (isLive && section.href) {
    return (
      <Link href={section.href} className="block h-full">
        {Body}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onUpcomingCta}
      className="block h-full w-full text-left"
    >
      {Body}
    </button>
  )
}

interface BloggerPreviewCardProps {
  blogger: LibraryBloggerPreview
}

const BloggerPreviewCard = ({ blogger }: BloggerPreviewCardProps) => {
  const fansLabel = formatBloggerFans(blogger.fansCount)
  const platformLabel = bloggerPlatformLabel(blogger.platform)
  const fallbackInitial = blogger.displayName?.trim().charAt(0) ?? '·'

  return (
    <Link
      href={`/bloggers/${encodeURIComponent(blogger.slug)}`}
      className="group flex h-full items-center gap-3.5 rounded-2xl border border-hairline bg-surface/60 p-4 transition-all hover:-translate-y-0.5 hover:border-hairline-strong sm:gap-4 sm:p-5"
    >
      {blogger.avatarUrl ? (
        <img
          src={blogger.avatarUrl}
          alt={`${blogger.displayName} 头像`}
          className="h-14 w-14 shrink-0 rounded-full border border-hairline object-cover sm:h-16 sm:w-16"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-hairline bg-canvas/60 font-serif-zh text-[20px] font-semibold text-ink-soft sm:h-16 sm:w-16 sm:text-[22px]">
          {fallbackInitial}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span>#{platformLabel}</span>
          <span>·</span>
          <span>{fansLabel}</span>
        </div>
        <h3 className="font-serif-zh truncate text-[15px] font-semibold leading-[1.4] text-ink sm:text-[15.5px]">
          {blogger.displayName}
        </h3>
        {blogger.positioning && (
          <p className="line-clamp-1 text-[12px] leading-[1.7] text-muted sm:text-[12.5px]">
            {blogger.positioning}
          </p>
        )}
      </div>

      <ArrowRight small className="shrink-0 text-muted transition-colors group-hover:text-ink" />
    </Link>
  )
}

interface TrackPreviewCardProps {
  track: LibraryTrackPreview
}

const TrackPreviewCard = ({ track }: TrackPreviewCardProps) => {
  return (
    <Link
      href={`/library/tracks/${encodeURIComponent(track.slug)}`}
      className="group flex h-full flex-col gap-2.5 rounded-2xl border border-hairline bg-surface/60 p-4 transition-all hover:-translate-y-0.5 hover:border-hairline-strong sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
        {track.stance && (
          <span className="rounded-full border border-hairline bg-canvas/60 px-2 py-0.5 text-[11px] text-ink">
            {track.stance}
          </span>
        )}
        {track.industry && <span>#{track.industry}</span>}
        <span>· {track.reportCount} 份子报告</span>
      </div>
      <h3 className="font-serif-zh line-clamp-2 text-[15.5px] font-semibold leading-[1.4] text-ink sm:text-[16px]">
        {track.trackKeyword}
      </h3>
      {track.stanceSummary && (
        <p className="line-clamp-2 text-[12px] leading-[1.75] text-muted sm:text-[12.5px]">
          {track.stanceSummary}
        </p>
      )}
      <div className="mt-auto flex items-center justify-end text-[11.5px] text-muted">
        <ArrowRight
          small
          className="shrink-0 text-muted transition-colors group-hover:text-ink"
        />
      </div>
    </Link>
  )
}

const ArrowRight = ({
  small,
  className,
}: {
  small?: boolean
  className?: string
}) => (
  <svg
    viewBox="0 0 16 16"
    fill="currentColor"
    className={[small ? 'h-3 w-3' : 'h-3.5 w-3.5', className ?? ''].join(' ')}
  >
    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
  </svg>
)
