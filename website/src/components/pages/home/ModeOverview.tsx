import Link from 'next/link'

import {
  MODE_CHECKLIST,
  MODE_COMPARISON,
  MODE_ITERATIVE,
} from '@/components/pages/service-models/data'
import { buttonClassName, SectionHeading } from '@/components/ui'

// 首页只放模式概览，完整流程在 /service-models。
// 概览只取「适合你如果」和「什么是固定的」两行——这两条决定客户选哪个模式，其余留给详情页。
const OVERVIEW_LABELS = ['适合你如果', '什么是固定的'] as const

const overviewRows = MODE_COMPARISON.filter((row) =>
  OVERVIEW_LABELS.includes(row.label as (typeof OVERVIEW_LABELS)[number]),
)

const MODES = [
  { name: MODE_CHECKLIST, pick: (row: (typeof MODE_COMPARISON)[number]) => row.checklist },
  { name: MODE_ITERATIVE, pick: (row: (typeof MODE_COMPARISON)[number]) => row.iterative },
]

export const ModeOverview = () => (
  <section id="service-models" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
    <SectionHeading
      eyebrow="How we work"
      title="两种合作模式"
      description="需求清楚不清楚，走的路不一样。选错了双方都难受。"
      align="left"
    />
    <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
      {MODES.map((mode) => (
        <div key={mode.name} className="border-t border-rule pt-5">
          <h3 className="text-[18px] font-semibold tracking-[-0.01em] text-graphite">{mode.name}</h3>
          <dl className="mt-4 flex flex-col gap-3.5">
            {overviewRows.map((row) => (
              <div key={row.label}>
                <dt className="text-[12px] text-graphite-dim">{row.label}</dt>
                <dd className="mt-1 text-[15px] leading-[1.7] text-graphite-soft">
                  {mode.pick(row)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
    <div className="mt-10">
      <Link href="/service-models" className={buttonClassName('secondary')}>
        看完整服务模式与七步流程
      </Link>
    </div>
  </section>
)
