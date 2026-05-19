'use client'

import { useState } from 'react'
import { AuroraBackground, GradientText, Reveal } from '../motion'
import { ContactQrCodeModal } from '../layout'

const AUDIENCE = [
  {
    label: '准备进自媒体获客',
    detail:
      '已经决定把自媒体当作获客通路，但不知道选哪个赛道、怎么起号、第一条内容怎么发。',
  },
  {
    label: '已经在做但卡住了',
    detail:
      '内容更新了一阵子，遇到一个具体的卡点——选题不灵、起号停滞、变现路径不顺、生产周转跟不上。',
  },
]

const TOPICS = [
  '你应该做哪个赛道？为什么？',
  '你的内容为什么不爆？',
  '起号阶段怎么熬过冷启动？',
  '涨粉了不变现怎么办？',
  '内容生产周转不过来怎么办？',
  '一个人公司怎么把自媒体当生意做？',
]

const TIERS = [
  {
    tier: '单次咨询',
    price: '¥299 / 60 分钟',
    suit: '决策点支持',
    includes: [
      '问卷收敛：你的背景、问题、目标',
      '60 分钟连麦深聊',
      '针对性结论 + 下一步建议',
    ],
    note: '3 天内安排时间。',
  },
]

const FLOW = [
  { step: '01', title: '预约付费咨询', detail: '提交背景与问题，3 天内安排时间。' },
  { step: '02', title: '方案共识', detail: '问题归类与目标对齐，形成书面共识后再启动。' },
  { step: '03', title: '交付推进', detail: '按约定路径执行，关键节点同步进度与产出。' },
  { step: '04', title: '长期协同', detail: '把每次咨询沉淀为可复用的资产，必要时再约下一次。' },
]

export const ConsultingContent = () => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      {/* 1. Hero */}
      <section className="relative overflow-hidden">
        <AuroraBackground variant="hero" />
        <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
          <Reveal y={16}>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/50 px-3 py-1 text-[11px] text-ink-soft backdrop-blur sm:px-3.5 sm:py-1.5 sm:text-xs">
              咨询服务 · CONSULTING
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="font-serif-zh mt-6 max-w-3xl text-balance text-[26px] font-semibold leading-[1.4] tracking-[0.01em] sm:mt-7 sm:text-[36px] sm:leading-[1.3] lg:text-[46px] lg:leading-[1.25]">
              当工具帮不到、内容看不够——
              <br />
              <GradientText className="font-semibold">和一个能聊的人坐下来</GradientText>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-7 max-w-2xl text-sm leading-[1.9] text-ink-soft sm:mt-8 sm:text-base sm:leading-[1.85]">
              60 分钟单次连麦咨询，针对你眼下的卡点，给到结构化结论。
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <button
              type="button"
              onClick={openContact}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[13px] font-semibold text-canvas shadow-[0_8px_32px_rgba(167,139,250,0.3)] transition-transform hover:-translate-y-0.5 sm:text-sm"
            >
              预约付费咨询
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
              </svg>
            </button>
          </Reveal>
        </div>
      </section>

      {/* 2. 适合谁 */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
              适合谁
            </span>
            <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
              两种状态，
              <GradientText className="font-semibold">都能找到对应的对话</GradientText>
            </h2>
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {AUDIENCE.map((a, idx) => (
            <Reveal key={a.label} delay={idx * 0.08}>
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:border-hairline-strong sm:rounded-[22px] sm:p-7">
                <span className="font-mono text-[11px] text-muted sm:text-[12px]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <h3 className="font-serif-zh text-[17px] font-semibold leading-[1.45] text-ink sm:text-[19px]">
                  {a.label}
                </h3>
                <p className="text-[13.5px] leading-[1.9] text-muted sm:text-[14.5px]">{a.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. 我们能聊什么 */}
      <section className="relative mx-auto w-full max-w-6xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-cyan-300/60 sm:w-6" />
              我们能聊什么
            </span>
            <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
              全部是
              <GradientText className="font-semibold">真问题</GradientText>
            </h2>
          </div>
        </Reveal>
        <div className="mt-8 flex flex-wrap gap-2.5">
          {TOPICS.map((t) => (
            <span
              key={t}
              className="rounded-full border border-hairline bg-surface/60 px-3.5 py-1.5 text-[12.5px] text-ink-soft sm:text-[13.5px]"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* 4. 服务档位 */}
      <section className="relative mx-auto w-full max-w-6xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
              <span className="h-px w-5 bg-gradient-to-r from-transparent to-violet-400/60 sm:w-6" />
              服务档位
            </span>
            <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
              一次 60 分钟的
              <GradientText className="font-semibold">单点决策咨询</GradientText>
            </h2>
          </div>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-xl grid-cols-1 gap-5">
          {TIERS.map((t, idx) => (
            <Reveal key={t.tier} delay={idx * 0.08}>
              <div className="flex h-full flex-col gap-4 rounded-2xl border border-hairline bg-surface/60 p-6 backdrop-blur transition-all hover:border-hairline-strong sm:rounded-[22px] sm:p-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-zh text-[18px] font-semibold text-ink sm:text-[20px]">
                    {t.tier}
                  </h3>
                  <span className="font-mono text-[11.5px] text-muted">{t.price}</span>
                </div>
                <p className="text-[13.5px] text-ink-soft sm:text-[14px]">{t.suit}</p>
                <ul className="flex flex-col gap-2 text-[13px] text-muted sm:text-[13.5px]">
                  {t.includes.map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-2 h-1 w-1 flex-none rounded-full bg-violet-400/70" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex items-center justify-between border-t border-hairline pt-4">
                  <span className="text-[11.5px] text-muted">{t.note}</span>
                  <button
                    type="button"
                    onClick={openContact}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:text-[13px]"
                  >
                    预约付费咨询
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5. 合作流程 */}
      <section className="relative mx-auto w-full max-w-6xl border-t border-hairline px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-start lg:gap-14">
          <Reveal>
            <div className="flex flex-col gap-4">
              <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
                <span className="h-px w-5 bg-gradient-to-r from-transparent to-cyan-300/60 sm:w-6" />
                合作流程
              </span>
              <h2 className="font-serif-zh text-balance text-[22px] font-semibold leading-[1.4] sm:text-[26px] sm:leading-[1.35] lg:text-[30px]">
                先形成共识，
                <br />
                <GradientText className="font-semibold">再落地执行</GradientText>
              </h2>
              <p className="max-w-md text-[13.5px] leading-[1.9] text-ink-soft sm:text-[14.5px]">
                每一步都给出书面共识与明确产出，合作全程透明、可追溯。
              </p>
            </div>
          </Reveal>
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {FLOW.map((item, index) => (
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

      {/* 6. 底部 CTA */}
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
                <GradientText className="font-semibold">预约付费咨询</GradientText>
              </h2>
              <button
                type="button"
                onClick={openContact}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 sm:text-sm"
              >
                预约付费咨询
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor">
                  <path d="M8.22 3.22a.75.75 0 011.06 0l4 4a.75.75 0 010 1.06l-4 4a.75.75 0 01-1.06-1.06l2.72-2.72H3a.75.75 0 010-1.5h7.94L8.22 4.28a.75.75 0 010-1.06z" />
                </svg>
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
