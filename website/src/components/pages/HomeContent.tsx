'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AuroraBackground, GradientText, Marquee, Reveal } from '../motion'
import { ContactQrCodeModal } from '../layout'
import {
  LIBRARY_TYPES,
  LIBRARY_TYPE_LABELS,
  LIBRARY_TYPE_TAGLINES,
  LIBRARY_TYPE_UNIT,
  type LibraryType,
} from '@/types/library'

const PLATFORMS = [
  '小红书',
  '抖音',
  '视频号',
  'B站',
  '快手',
  '公众号',
  '知乎',
  '微博',
  'YouTube',
  '即刻',
]

const CATEGORY_ORDER: LibraryType[] = [
  LIBRARY_TYPES.BREAKDOWN,
  LIBRARY_TYPES.BLOGGER,
  LIBRARY_TYPES.TRACK,
  LIBRARY_TYPES.PLAYBOOK,
]

const INSIGHTS = [
  {
    index: '01',
    title: '自媒体已经是最大的获客通路',
    body: '用户的注意力都在那里，决策也从那里开始。这里是当下最大的获客战场。',
  },
  {
    index: '02',
    title: '内容与 IP，是建立信任的最佳纽带',
    body: '信任很难买，但能靠内容长出来——你看的不是广告，是一个人长期讲过的话、做过的事。',
  },
  {
    index: '03',
    title: 'AI 让内容变得廉价，真实案例反而稀缺',
    body: 'AI 让解读、方法论、二手观点过剩，能在真实市场里跑出来的案例与数据，反而成了稀缺资源。',
  },
]

const TOOL_FEATURES = [
  {
    title: '素材拆解',
    detail: '粘贴一条链接，自动输出钩子、结构、节奏、可复用模板。',
  },
  {
    title: '博主洞察',
    detail: '输入主页，自动输出矩阵布局、增长曲线、内容方法论。',
  },
  {
    title: '选题灵感',
    detail: '告知赛道，输出已被验证的选题方向与示例。',
  },
]

const CONSULTING_STEPS = [
  { step: '01', title: '预约付费咨询', detail: '提交背景与问题，3 天内安排时间。' },
  { step: '02', title: '60min 深聊', detail: '问题归类、结构化梳理、3-5 条结论。' },
  { step: '03', title: '下一步建议', detail: '把结论沉淀成可执行清单，必要时再约下一次。' },
]

interface HomeContentProps {
  counts: Record<LibraryType, number>
}

export const HomeContent = ({ counts }: HomeContentProps) => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.38em] text-muted sm:mb-9 sm:text-[11px]"
          >
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-violet-400/70 sm:w-8" />
            REAL · DATA · VALUE
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-cyan-300/70 sm:w-8" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif-zh max-w-4xl text-balance text-[26px] font-semibold leading-[1.5] tracking-[0.01em] sm:text-[38px] sm:leading-[1.4] lg:text-[48px] lg:leading-[1.35]"
            style={{ fontFeatureSettings: '"palt", "pkna", "calt"' }}
          >
            <span className="block">AI × 自媒体</span>
            <span className="mt-2 block sm:mt-3">
              <GradientText className="font-semibold">让客户源源不断地找上门</GradientText>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-[680px] text-[15px] leading-[1.9] text-ink-soft sm:mt-10 sm:max-w-[760px] sm:text-base sm:leading-[1.85]"
          >
            <span className="block">
              自媒体营销获客，不要再做无效尝试，我们提供真实的赛道分析、一线博主拆解、可落地的百万级大V运营实战精炼方法论，加上能上手的 AI 信息工具，助你实现流量与客源的极速增长
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row"
          >
            <Link
              href="/membership"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas shadow-[0_8px_32px_rgba(167,139,250,0.3)] transition-transform hover:-translate-y-0.5 sm:px-6 sm:py-3 sm:text-sm"
            >
              <span
                aria-hidden
                className="absolute inset-0 -z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: 'linear-gradient(120deg, #A78BFA, #22D3EE, #F472B6)',
                }}
              />
              <span className="relative z-10 flex items-center gap-2">
                了解产品
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                </svg>
              </span>
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/40 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong hover:bg-surface sm:px-6 sm:py-3 sm:text-sm"
            >
              浏览信息库
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. Platform marquee */}
      <section className="relative border-y border-hairline bg-surface/30 py-5 sm:py-6">
        <Marquee speed={45}>
          {PLATFORMS.map((tag) => (
            <span
              key={tag}
              className="whitespace-nowrap text-[12px] font-medium tracking-[0.02em] text-muted/70 transition-colors hover:text-ink sm:text-[13px]"
            >
              <span className="mr-10 sm:mr-12">· {tag} ·</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* 3. 三个判断 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
              我们看见的
            </span>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[32px] lg:leading-[1.35]">
              <span className="block">为什么是现在，</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">为什么是这件事</GradientText>
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 md:grid-cols-3">
          {INSIGHTS.map((item, index) => (
            <Reveal key={item.index} delay={index * 0.06}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur-xl sm:rounded-[22px] sm:p-6">
                <span className="font-mono text-[11px] text-muted sm:text-[12px]">
                  {item.index}
                </span>
                <h3 className="font-serif-zh text-[16.5px] font-semibold leading-[1.45] text-ink sm:text-[18px]">
                  {item.title}
                </h3>
                <p className="text-[13px] leading-[1.85] text-muted sm:text-[13.5px]">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4. 信息库 4 类入口墙 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
              信息库
            </span>
            <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[32px] lg:leading-[1.35]">
              <span className="block">把别人验证过的东西，</span>
              <span className="mt-1 block sm:mt-1.5">
                <GradientText className="font-semibold">拆给你看</GradientText>
              </span>
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_ORDER.map((type, index) => (
            <Reveal key={type} delay={index * 0.06}>
              <Link
                href={
                  type === LIBRARY_TYPES.PLAYBOOK
                    ? '/playbook'
                    : type === LIBRARY_TYPES.BLOGGER
                      ? '/bloggers'
                      : type === LIBRARY_TYPES.TRACK
                        ? '/tracks'
                        : `/library?type=${type}`
                }
                className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-hairline-strong sm:rounded-[22px] sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-muted sm:text-[12px]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
                    {counts[type] > 0 ? `已有 ${counts[type]} ${LIBRARY_TYPE_UNIT[type]}` : '准备中'}
                  </span>
                </div>
                <h3 className="font-serif-zh text-[18px] font-semibold leading-[1.4] text-ink sm:text-[20px]">
                  {LIBRARY_TYPE_LABELS[type]}
                </h3>
                {(type === LIBRARY_TYPES.BLOGGER || type === LIBRARY_TYPES.TRACK) && (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-yellow-400/40 bg-yellow-400/15 px-2.5 py-1 text-[10.5px] font-medium text-yellow-300">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                    每日持续更新
                  </span>
                )}
                <p className="text-[13px] leading-[1.85] text-muted sm:text-[13.5px]">
                  {LIBRARY_TYPE_TAGLINES[type]}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-soft transition-colors group-hover:text-ink">
                  进入
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4. 产品 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <Reveal className="lg:col-span-5">
            <div className="flex flex-col gap-5">
              <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
                <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
                产品
              </span>
              <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
                把「看懂别人」
                <GradientText className="font-semibold">变成「自己能做」</GradientText>
              </h2>
              <p className="max-w-md text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
                真实的案例 + AI 工具——粘贴一条链接，10 秒看懂它为什么火；按你关心的赛道，持续给你同类的拆解。
              </p>
              <div className="mt-2 flex flex-col gap-3">
                {TOOL_FEATURES.map((f, i) => (
                  <div key={f.title} className="flex items-start gap-3 rounded-xl border border-hairline bg-surface/50 p-4 sm:gap-4">
                    <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md border border-hairline bg-canvas font-mono text-[11px] text-ink-soft">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex flex-col gap-1">
                      <h3 className="text-[14px] font-semibold text-ink sm:text-[14.5px]">{f.title}</h3>
                      <p className="text-[12.5px] leading-[1.8] text-muted sm:text-[13px]">{f.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/membership"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:text-sm"
                >
                  了解工具
                </Link>
                <Link
                  href="/membership"
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong sm:text-sm"
                >
                  了解产品
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <ToolMockup />
          </Reveal>
        </div>
      </section>

      {/* 6. 赛道地图（即将上线） */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] border border-hairline bg-canvas/40 p-7 backdrop-blur-xl sm:rounded-[28px] sm:p-10 lg:p-12">
            <TrackMapIllustration />
            <div className="relative flex flex-col items-center gap-5 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted sm:text-[11.5px]">
                · 即将上线 ·
              </span>
              <h2 className="font-serif-zh max-w-2xl text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[32px]">
                一份正在被持续打磨的
                <GradientText className="font-semibold">自媒体赛道地图</GradientText>
              </h2>
              <p className="max-w-xl text-[13.5px] leading-[1.9] text-ink-soft sm:text-[14.5px]">
                上线时，你会第一个知道。
              </p>
              <WaitlistInput onSubmit={openContact} />
            </div>
          </div>
        </Reveal>
      </section>

      {/* 8. 咨询服务 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start lg:gap-14">
          <Reveal>
            <div className="flex flex-col gap-4">
              <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
                <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
                咨询服务
              </span>
              <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
                需要一个能聊的人？
                <br />
                <GradientText className="font-semibold">坐下来，先把问题想透</GradientText>
              </h2>
              <p className="max-w-md text-[13.5px] leading-[1.9] text-ink-soft sm:text-[14.5px]">
                60 分钟的单次连麦咨询——针对你眼下的卡点，给到结构化结论。
              </p>
              <button
                type="button"
                onClick={openContact}
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:text-sm"
              >
                预约付费咨询
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                </svg>
              </button>
            </div>
          </Reveal>

          <div className="flex flex-col gap-2.5 sm:gap-3">
            {CONSULTING_STEPS.map((item, index) => (
              <Reveal key={item.step} delay={index * 0.06}>
                <div className="group flex items-start gap-3.5 rounded-xl border border-transparent bg-surface/40 p-4 transition-all hover:border-hairline hover:bg-surface/70 sm:gap-4 sm:rounded-2xl sm:p-5">
                  <div className="flex h-8 w-8 flex-none items-center justify-center rounded border border-hairline bg-canvas font-mono text-[10px] text-ink-soft sm:h-9 sm:w-9 sm:rounded-md sm:text-[11px]">
                    {item.step}
                  </div>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <h3 className="text-[14px] font-semibold text-ink sm:text-[15px]">{item.title}</h3>
                    <p className="text-[13px] leading-[1.8] text-muted sm:text-[13.5px]">{item.detail}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 9. 底部 CTA */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[22px] border border-hairline bg-surface/40 p-7 text-center backdrop-blur-xl sm:rounded-[28px] sm:p-12 lg:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  'radial-gradient(circle at 20% 0%, rgba(167,139,250,0.28), transparent 55%), radial-gradient(circle at 80% 100%, rgba(34,211,238,0.22), transparent 55%)',
              }}
            />
            <div className="relative flex flex-col items-center gap-5">
              <h2 className="font-serif-zh max-w-2xl text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[32px]">
                下一步：
                <GradientText className="font-semibold">直接动手</GradientText>
              </h2>
              <p className="max-w-xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm">
                AI 时代，真实的案例才更有价值。你可以现在就开始浏览拆解，或者直接预约一次付费咨询。
              </p>
              <div className="mt-1 flex flex-col items-center gap-2.5 sm:flex-row sm:gap-3">
                <button
                  type="button"
                  onClick={openContact}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-[12px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-[13px]"
                >
                  预约付费咨询
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                  </svg>
                </button>
                <Link
                  href="/library"
                  className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface/60 px-5 py-2 text-[12px] font-medium text-ink transition-colors hover:border-hairline-strong sm:px-5 sm:py-2.5 sm:text-[13px]"
                >
                  浏览信息库
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

const ToolMockup = () => (
  <div className="relative overflow-hidden rounded-2xl border border-hairline bg-canvas/60 p-4 sm:rounded-[22px] sm:p-5">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-60"
      style={{
        background:
          'radial-gradient(circle at 80% 10%, rgba(167,139,250,0.18), transparent 60%)',
      }}
    />
    <div className="relative flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-xl border border-hairline bg-surface/70 px-3 py-2.5 font-mono text-[11.5px] text-ink-soft sm:text-[12.5px]">
        <span className="text-muted">{'>'}</span>
        <span className="truncate">https://xiaohongshu.com/note/abc...</span>
        <span className="ml-auto rounded-md bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-200">
          拆解中…
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: '钩子', value: '反预期数字 + 身份反差' },
          { label: '结构', value: '光鲜 → 代价 → 模板 → 留问题' },
          { label: '节奏', value: '0-3s · 30% 完读率分水岭' },
          { label: '模板', value: '[年龄] + [非标准身份] + [反预期]' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-1 rounded-xl border border-hairline bg-surface/60 p-3"
          >
            <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
              {item.label}
            </span>
            <span className="text-[12px] leading-[1.6] text-ink-soft sm:text-[12.5px]">
              {item.value}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-hairline bg-surface/60 p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted">
            适合谁用
          </span>
          <span className="h-px flex-1 bg-hairline" />
        </div>
        <p className="mt-2 text-[12.5px] leading-[1.8] text-ink-soft">
          想做自由职业 / 一人公司的小红书创作者；想拆解「身份反差类」选题的内容操盘手。
        </p>
      </div>
    </div>
  </div>
)

const TrackMapIllustration = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0">
    <div
      className="absolute inset-0 opacity-60"
      style={{
        background:
          'radial-gradient(circle at 20% 30%, rgba(167,139,250,0.22), transparent 55%), radial-gradient(circle at 80% 70%, rgba(34,211,238,0.18), transparent 60%)',
      }}
    />
    <svg
      className="absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 800 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.6"
      style={{ color: 'rgba(167,139,250,0.6)' }}
    >
      <defs>
        <radialGradient id="dot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
        </radialGradient>
      </defs>
      {[
        [120, 80],
        [240, 160],
        [380, 90],
        [520, 200],
        [660, 130],
        [200, 280],
        [420, 310],
        [600, 290],
        [720, 220],
      ].map(([x, y], i, arr) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="3" fill="url(#dot)" />
          {arr[i + 1] && (
            <line x1={x} y1={y} x2={arr[i + 1][0]} y2={arr[i + 1][1]} strokeDasharray="3 4" />
          )}
        </g>
      ))}
    </svg>
  </div>
)

const WaitlistInput = ({ onSubmit }: { onSubmit: () => void }) => (
  <form
    className="mt-1 flex w-full max-w-md flex-col gap-2 sm:flex-row"
    onSubmit={(e) => {
      e.preventDefault()
      onSubmit()
    }}
  >
    <input
      type="email"
      required
      placeholder="留下你的邮箱"
      className="flex-1 rounded-full border border-hairline bg-canvas/60 px-4 py-2.5 text-[13px] text-ink placeholder:text-muted focus:border-hairline-strong focus:outline-none sm:text-sm"
    />
    <button
      type="submit"
      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:text-sm"
    >
      上线通知我
    </button>
  </form>
)
