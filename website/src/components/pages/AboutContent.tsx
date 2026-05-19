'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AuroraBackground, GradientText, Reveal } from '../motion'
import { ContactQrCodeModal } from '../layout'
import {
  LIBRARY_TYPES,
  LIBRARY_TYPE_LABELS,
  LIBRARY_TYPE_TAGLINES,
  type LibraryType,
} from '@/types/library'

const SERVE = [
  {
    label: '一人公司 / 自由职业',
    description:
      '你已经决定把自媒体当作主要的获客通路。比起方法论，你需要的是一份按周可执行的进度表，和能复用的真实信息。',
  },
  {
    label: '小微企业 / 早期创业者',
    description:
      '你不追风口、也不想做快钱生意——手里有一件想认真做下去的事。希望从第一天起，就把内容和获客当成生意的一部分去经营。',
  },
]

const WEEKLY: Array<{ type: LibraryType; verb: string }> = [
  { type: LIBRARY_TYPES.BREAKDOWN, verb: '拆一批新的爆款' },
  { type: LIBRARY_TYPES.BLOGGER, verb: '追一组值得长期看的博主' },
  { type: LIBRARY_TYPES.TRACK, verb: '更新一份赛道地图' },
  { type: LIBRARY_TYPES.PLAYBOOK, verb: '总结一份百万博主的打法' },
]

export const AboutContent = () => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
          <Reveal y={16}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-3 py-1 text-[11px] text-ink-soft backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
              关于微域生光
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-serif-zh mt-6 max-w-3xl text-balance text-[30px] font-semibold leading-[1.3] tracking-[0.01em] sm:mt-7 sm:text-[44px] sm:leading-[1.25] lg:text-[56px] lg:leading-[1.2]">
              我们只研究一件事——
              <GradientText className="font-semibold">真实的信息</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-7 flex flex-col gap-1.5 text-[15px] font-medium leading-[1.8] text-ink-soft sm:mt-9 sm:text-[16.5px]">
              <p>自媒体是当下最大的获客通路。</p>
              <p>内容是建立信任的最佳纽带。</p>
              <p>AI 时代里，真实的信息越来越稀缺——</p>
              <p>我们做的，就是把它变成你能用的产能。</p>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex max-w-2xl flex-col gap-6 text-left text-[14px] leading-[1.95] text-ink-soft sm:mt-12 sm:gap-7 sm:text-[15.5px]">
              <p>
                <span className="font-semibold text-ink">我们做的就是一件事——</span>
                帮已经决定把自媒体当作获客通路的人，把别人验证过的真实信息（爆款、百万博主、赛道）一条条拆开看清楚，再用 AI 工具放大成你能用的产能。
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 我们每周在做的事 */}
      <section className="relative mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="flex flex-col gap-4 sm:gap-5">
            <span className="text-[15px] font-semibold uppercase tracking-[0.22em] text-muted sm:text-[16px]">
              · 我们每周在做的事 ·
            </span>
            <h2 className="font-serif-zh max-w-2xl text-balance text-[24px] font-semibold leading-[1.35] tracking-[0.005em] sm:text-[30px] sm:leading-[1.3] lg:text-[36px] lg:leading-[1.25]">
              四件具体的事，
              <GradientText className="font-semibold">每一件都长期做下去</GradientText>
            </h2>
            <p className="max-w-xl text-[13.5px] leading-[1.9] text-muted sm:text-[14.5px]">
              我们的所有产出，最终都沉淀在信息库里——可读、可搜、可导航。
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WEEKLY.map((item, index) => (
            <Reveal key={item.type} delay={index * 0.06}>
              <Link
                href={item.type === LIBRARY_TYPES.PLAYBOOK ? '/playbook' : `/library?type=${item.type}`}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-hairline bg-surface/60 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-hairline-strong sm:rounded-[22px] sm:p-6"
              >
                <span className="font-mono text-[11px] text-muted sm:text-[12px]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-serif-zh text-[16.5px] font-semibold leading-[1.4] text-ink sm:text-[18px]">
                  {item.verb}
                </h3>
                <p className="text-[12.5px] leading-[1.85] text-muted sm:text-[13px]">
                  {LIBRARY_TYPE_TAGLINES[item.type]}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 text-[12px] font-medium text-ink-soft transition-colors group-hover:text-ink">
                  {LIBRARY_TYPE_LABELS[item.type]}
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                  </svg>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 我们是谁 */}
      <section className="relative mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="flex flex-col gap-4 sm:gap-5">
            <span className="text-[15px] font-semibold uppercase tracking-[0.22em] text-muted sm:text-[16px]">
              · 我们是谁 ·
            </span>
            <div className="flex flex-col gap-4 text-[14px] leading-[1.95] text-ink-soft sm:gap-5 sm:text-[15.5px]">
              <p>
                我们是一个专注内容获客与真实信息研究的团队，背景覆盖内容策略、平台研究、产品开发——把研究的部分做到位，让你把更多时间留给做内容本身。
              </p>
              <p>
                AI 在批量生产解读、方法论、二手观点——我们只看真实跑出来的爆款、百万博主、赛道，把它们拆透，再用 AI 工具放大成可复用的产能。让你的判断不被噪音淹没，不被流量逻辑扭曲，也不被所谓的「风口」推着走。
              </p>
              <p>
                我们不假装成熟，但在每一次合作里，我们都愿意把问题想透、把事情做完。
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 我们想认识的人 */}
      <section className="relative mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6 sm:pb-24">
        <Reveal>
          <div className="flex flex-col gap-4 sm:gap-5">
            <span className="text-[15px] font-semibold uppercase tracking-[0.22em] text-muted sm:text-[16px]">
              · 我们想认识的人 ·
            </span>
            <h2 className="font-serif-zh max-w-2xl text-balance text-[26px] font-semibold leading-[1.35] tracking-[0.005em] sm:text-3xl sm:leading-[1.3] lg:text-4xl lg:leading-[1.25]">
              已经决定把
              <GradientText className="font-semibold">自媒体当作获客通路</GradientText>
              的人
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 md:grid-cols-2">
          {SERVE.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.08}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-hairline-strong sm:rounded-[22px] sm:p-7">
                <span className="font-mono text-[11px] text-muted sm:text-[12px]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="font-serif-zh text-[17px] font-semibold leading-[1.45] text-ink sm:text-[19px]">
                  {item.label}
                </h3>
                <p className="text-[13.5px] leading-[1.9] text-muted sm:text-[14.5px]">
                  {item.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-[13.5px] leading-[1.95] text-muted sm:mt-10 sm:text-[14px]">
            让我们想深入合作的，不是你做到多大，而是你
            <span className="font-medium text-ink-soft">愿意把内容当成长期资产</span>
            ——而不是一次性的流量动作。
          </p>
        </Reveal>
      </section>

      <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] border border-hairline bg-surface/40 p-8 backdrop-blur-xl sm:rounded-[32px] sm:p-12 lg:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(circle at 80% 0%, rgba(34,211,238,0.24), transparent 55%), radial-gradient(circle at 10% 100%, rgba(167,139,250,0.24), transparent 55%)',
              }}
            />
            <div className="relative flex flex-col items-start gap-6 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex max-w-xl flex-col gap-3 sm:gap-4">
                <h2 className="font-serif-zh text-balance text-2xl font-semibold leading-[1.35] tracking-[0.005em] sm:text-3xl sm:leading-[1.3]">
                  从一次 60 分钟开始
                </h2>
                <p className="text-[14px] leading-[1.9] text-ink-soft sm:text-[15.5px]">
                  把你眼下的卡点讲清楚，我们一起拆——给到结构化结论与下一步建议。
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={openContact}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:px-6 sm:py-3 sm:text-sm"
                >
                  预约付费咨询
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                  </svg>
                </button>
                <Link
                  href="/library"
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong sm:px-6 sm:py-3 sm:text-sm"
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
