'use client'

import { Reveal, GradientText } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'

// 抽象部门节点：不写具体项目名，只表达"这是一个部门"；数量固定为可视化占位，
// 真实部门数量与内容由业务侧决定，不在此处枚举。
const NODE_COUNT = 4
// 高亮的那个节点用于引出下方"部门内部结构"放大图，其余节点保持通用外观
const FEATURED_INDEX = 1

function DeptNodeIcon({ featured }: { featured: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke={featured ? '#57beff' : 'rgba(240,240,240,0.55)'}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="7.5" r="2.5" />
      <circle cx="5.5" cy="9" r="1.8" />
      <circle cx="18.5" cy="9" r="1.8" />
      <path d="M7 19c0-3 2.2-5 5-5s5 2 5 5" />
      <path d="M2 17.5c0-2.2 1.5-3.7 3.5-3.9" />
      <path d="M22 17.5c0-2.2-1.5-3.7-3.5-3.9" />
    </svg>
  )
}

function RosterSlot({ role, highlight }: { role: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full border text-[11px] sm:h-11 sm:w-11"
        style={
          highlight
            ? {
                borderColor: 'rgba(87,190,255,0.6)',
                background: 'rgba(0,153,255,0.14)',
                color: '#57beff',
                boxShadow: '0 0 16px -4px rgba(0,153,255,0.7)',
              }
            : {
                borderColor: 'rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.4)',
              }
        }
      >
        ?
      </div>
      <span
        className="text-[11px]"
        style={{ color: highlight ? '#57beff' : undefined }}
      >
        {role}
      </span>
    </div>
  )
}

export function OrgDiagram() {
  return (
    <section className="relative mx-auto w-full max-w-3xl px-4 pb-8 sm:px-6 sm:pb-10">
      <Reveal>
        <div className="flex flex-col items-center gap-2 text-center">
          <SectionEyebrow color="#01aef0">组织架构</SectionEyebrow>
          <h2 className="font-serif-zh text-[18px] font-semibold leading-[1.4] tracking-[-0.02em] sm:text-[21px]">
            <span className="block">CTO 之下，</span>
            <span className="mt-0.5 block">
              <GradientText className="font-semibold">可以有很多个研发部门</GradientText>
            </span>
          </h2>
        </div>
      </Reveal>

      {/* 抽象部门节点行：数量可持续增加，不逐个枚举具体项目 */}
      <Reveal delay={0.08}>
        <div className="mt-6 flex items-start justify-center gap-4 sm:gap-6">
          {Array.from({ length: NODE_COUNT }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-lg border"
                style={
                  i === FEATURED_INDEX
                    ? {
                        borderColor: 'rgba(87,190,255,0.55)',
                        background: 'rgba(0,153,255,0.12)',
                        boxShadow: '0 0 20px -6px rgba(0,153,255,0.6)',
                      }
                    : {
                        borderColor: 'rgba(255,255,255,0.14)',
                        background: 'rgba(255,255,255,0.03)',
                      }
                }
              >
                <DeptNodeIcon featured={i === FEATURED_INDEX} />
              </div>
              <span
                className="text-[11px]"
                style={{ color: i === FEATURED_INDEX ? '#57beff' : undefined }}
              >
                研发部门
              </span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed text-[18px]"
              style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.35)' }}
            >
              ···
            </div>
            <span className="text-[11px] text-muted">更多部门</span>
          </div>
        </div>
      </Reveal>

      {/* 引导箭头：说明下方是"其中一个部门"内部结构的放大展示 */}
      <Reveal delay={0.14}>
        <div className="mt-3 flex flex-col items-center gap-0.5 text-muted">
          <span aria-hidden className="text-[13px]">↓</span>
          <span className="text-[11.5px]">以其中一个部门为例，内部是这样的</span>
        </div>
      </Reveal>

      {/* 部门内部结构放大：1 名主管 + 4 名学员，纯展示不含行动入口 */}
      <Reveal delay={0.2}>
        <div
          className="mt-3 flex flex-col items-center gap-3 rounded-md p-4 backdrop-blur-md sm:p-5"
          style={{
            background: 'linear-gradient(150deg, rgba(1,174,240,0.10) 0%, rgba(1,174,240,0.03) 100%)',
          }}
        >
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em] text-muted">
            部门内部结构 · 5 人编制
          </span>
          <div className="flex items-center gap-4 sm:gap-5">
            <RosterSlot role="研发主管" highlight />
            <RosterSlot role="学员" />
            <RosterSlot role="学员" />
            <RosterSlot role="学员" />
            <RosterSlot role="学员" />
          </div>
          <p className="max-w-md text-[12.5px] leading-[1.8] text-ink-soft">
            每个部门都是这样的 5 人小队：1 名主管带 4 名学员，负责一个真实研发项目。
          </p>
        </div>
      </Reveal>
    </section>
  )
}
