import Link from 'next/link'

import { ENGAGEMENT_STEPS } from '@/components/pages/service-models/data'
import { buttonClassName, SectionHeading } from '@/components/ui'

// 首页只放七步的骨架，完整内容在 /service-models。
// 刻意不用卡片：首页上方已经有 11 张服务卡，这里再堆一排会让整页变成卡片墙。
export const ProcessTeaser = () => (
  <section id="process" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
    <SectionHeading
      eyebrow="How we work"
      title="合作怎么走，七步说清"
      description="每一步都写明你能拿到什么、多久、要不要付钱。"
      align="left"
    />

    {/* 桌面端横排成一条流程线；窄屏排不下七格，退化为两列 */}
    <div className="relative mt-14 hidden sm:block">
      {/* 连线只在首尾节点之间，两端各让出半格，避免线头突出 */}
      <div
        aria-hidden
        className="absolute top-[13px] h-px bg-rule"
        style={{ left: `${100 / ENGAGEMENT_STEPS.length / 2}%`, right: `${100 / ENGAGEMENT_STEPS.length / 2}%` }}
      />
      <ol className="relative grid grid-cols-7 gap-2">
        {ENGAGEMENT_STEPS.map((step) => (
          <li key={step.code} className="flex flex-col items-center text-center">
            <span className="tabular flex h-[27px] w-[27px] items-center justify-center rounded-full border border-rule-strong bg-paper text-[11px] font-medium text-graphite-dim">
              {step.code}
            </span>
            <span className="mt-3 text-[13.5px] leading-[1.5] text-graphite-soft">
              {step.short}
            </span>
          </li>
        ))}
      </ol>
    </div>

    <ol className="mt-10 grid grid-cols-2 gap-x-5 gap-y-4 sm:hidden">
      {ENGAGEMENT_STEPS.map((step) => (
        <li key={step.code} className="flex items-center gap-2.5">
          <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-rule-strong text-[10px] font-medium text-graphite-dim">
            {step.code}
          </span>
          <span className="text-[13.5px] leading-[1.5] text-graphite-soft">{step.short}</span>
        </li>
      ))}
    </ol>

    <div className="mt-12">
      <Link href="/service-models" className={buttonClassName('secondary')}>
        看每一步的细节
      </Link>
    </div>
  </section>
)
