import {
  ITERATIVE_PREMISE,
  MODE_CHECKLIST,
  MODE_COMPARISON,
  MODE_ITERATIVE,
} from './engagement-data'
import { SectionHeading } from './ui'

const MODES = [MODE_CHECKLIST, MODE_ITERATIVE] as const

// 行标签 + 两列取值的三栏网格。桌面与移动共用同一份数据、两套排布：
// 真对比表在窄屏上必然挤爆，移动端改成两块纵向铺开、各自带标签。
const GRID_CLASS = 'grid grid-cols-[minmax(0,11em)_minmax(0,1fr)_minmax(0,1fr)] gap-x-10'

export const EngagementModes = () => (
  <section id="process" className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
    <SectionHeading
      eyebrow="How we work"
      title="先选一种合作模式"
      description="需求清楚不清楚，走的路不一样。选错了双方都难受。"
      align="left"
    />

    <div className="mt-12 hidden md:block">
      <div className={`${GRID_CLASS} border-b border-rule pb-4`}>
        <span />
        {MODES.map((mode) => (
          <span key={mode} className="text-[17px] font-semibold tracking-[-0.01em] text-graphite">
            {mode}
          </span>
        ))}
      </div>
      {MODE_COMPARISON.map((row) => (
        <div key={row.label} className={`${GRID_CLASS} border-b border-rule py-5`}>
          <span className="text-[13px] leading-[1.7] text-graphite-dim">{row.label}</span>
          <span className="text-[15px] leading-[1.7] text-graphite-soft">{row.checklist}</span>
          <span className="text-[15px] leading-[1.7] text-graphite-soft">{row.iterative}</span>
        </div>
      ))}
    </div>

    <div className="mt-10 flex flex-col gap-9 md:hidden">
      {MODES.map((mode) => (
        <div key={mode} className="border-t border-rule pt-5">
          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-graphite">{mode}</h3>
          <dl className="mt-4 flex flex-col gap-3.5">
            {MODE_COMPARISON.map((row) => (
              <div key={row.label}>
                <dt className="text-[12px] text-graphite-dim">{row.label}</dt>
                <dd className="mt-1 text-[14px] leading-[1.7] text-graphite-soft">
                  {mode === MODE_CHECKLIST ? row.checklist : row.iterative}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>

    {/* 「边做边定」的地基句单独拎出来强调：客户漏掉这句就会把范围理解成无边界 */}
    <div className="mt-10 border-l-2 border-graphite pl-5 sm:mt-12">
      <span className="text-[12px] font-medium tracking-[0.08em] text-graphite-dim">
        {MODE_ITERATIVE}
      </span>
      <p className="mt-2 max-w-[40em] text-[15px] leading-[1.85] text-graphite sm:text-[16px]">
        {ITERATIVE_PREMISE}
      </p>
    </div>
  </section>
)
