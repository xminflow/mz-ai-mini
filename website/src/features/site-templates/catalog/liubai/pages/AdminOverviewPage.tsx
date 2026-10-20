import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import {
  ACTIVE_PROJECTS,
  ADMIN_KPIS,
  INQUIRY_TREND,
  INQUIRY_TREND_MAX,
  LEADS,
  LEAD_STATUS_LABEL,
} from '../data'
import { AdminPanel, AdminShell, Badge, ToolbarChips } from '../components/AdminShell'
import '../theme.css'

const TONE_CLASS = {
  ok: 'text-[var(--tpl-ok)]',
  warn: 'text-[var(--tpl-warn)]',
  plain: 'text-[var(--tpl-ink-faint)]',
} as const

export default function AdminOverviewPage({ basePath }: SiteTemplatePageProps) {
  const pending = LEADS.filter((lead) => lead.status === 'new')

  return (
    <AdminShell
      basePath={basePath}
      activeSlug=""
      title="工作台"
      subtitle={`${pending.length} 条咨询待联系，${ACTIVE_PROJECTS.length} 个项目在建`}
      toolbar={<ToolbarChips items={['本月', '本季', '全年']} />}
    >
      <div className="space-y-4">
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {ADMIN_KPIS.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-[var(--tpl-rule)] bg-[var(--tpl-card)] p-4"
            >
              <p className="text-[12px] text-[var(--tpl-ink-dim)]">{kpi.label}</p>
              <p className="tpl-num mt-2.5 text-[26px] font-medium leading-none">
                {kpi.value}
                <span className="ml-1 text-[12px] font-normal text-[var(--tpl-ink-faint)]">
                  {kpi.unit}
                </span>
              </p>
              <p className={`mt-2 text-[11.5px] ${TONE_CLASS[kpi.tone]}`}>
                较上月 {kpi.delta}
              </p>
            </div>
          ))}
        </section>

        <div className="grid gap-4 xl:grid-cols-5">
          {/* 七根柱子不值得引一个图表库，纯 CSS 的条形足够，也不用担心 canvas 拿不到设计令牌 */}
          {/* 面板与右侧的在建项目并排，grid 会把两者拉到等高。
              让面板体也 flex-1，图表就能吃掉这段高度，而不是在底下空一大片。 */}
          <AdminPanel
            title="近 7 天咨询量"
            className="flex flex-col xl:col-span-2"
            bodyClassName="flex flex-1 flex-col p-4"
          >
            {/* 列容器必须撑满整条高度（items-stretch），柱子的 flex-1 才有可分配的高度可言。
                用 items-end 会让每列收缩到内容高度，柱子算出来就是 0——图表整个消失但不报错。 */}
            <div className="flex min-h-[168px] flex-1 items-stretch gap-2">
              {INQUIRY_TREND.map((item) => (
                <div key={item.day} className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {/* 数字贴着柱顶而不是钉在图表顶部：钉在顶部时矮柱子的数字会飘在半空，读不出属于哪根 */}
                  <div className="flex flex-1 flex-col justify-end">
                    <span className="tpl-num pb-1 text-center text-[11.5px] text-[var(--tpl-ink-dim)]">
                      {item.count}
                    </span>
                    <div
                      className="w-full rounded-t-[3px] bg-[var(--tpl-accent)]"
                      style={{
                        height: `${(item.count / INQUIRY_TREND_MAX) * 88}%`,
                        opacity: item.count === INQUIRY_TREND_MAX ? 1 : 0.42,
                      }}
                    />
                  </div>
                  <span className="truncate text-center text-[11px] text-[var(--tpl-ink-faint)]">
                    {item.day.replace('周', '')}
                  </span>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel
            title="在建项目"
            className="xl:col-span-3"
            bodyClassName="divide-y divide-[var(--tpl-rule)]"
          >
            {ACTIVE_PROJECTS.map((project) => (
              <div key={project.name} className="flex items-center gap-4 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px]">{project.name}</p>
                  <p className="mt-0.5 text-[11.5px] text-[var(--tpl-ink-faint)]">
                    {project.stage} · {project.owner} · 交付 {project.due}
                  </p>
                </div>
                {/* 进度条与百分比并排：只给条读不出具体数，只给数看不出彼此差多少 */}
                <div className="hidden h-1.5 w-28 shrink-0 overflow-hidden rounded-full bg-[rgb(18_18_24/0.07)] sm:block">
                  <div
                    className="h-full rounded-full bg-[var(--tpl-ink)]"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="tpl-num w-9 shrink-0 text-right text-[12px] text-[var(--tpl-ink-dim)]">
                  {project.progress}%
                </span>
              </div>
            ))}
          </AdminPanel>
        </div>

        <AdminPanel
          title="最新咨询"
          action={
            <Link
              href={`${basePath}/leads`}
              className="text-[12px] text-[var(--tpl-accent)] hover:underline"
            >
              查看全部
            </Link>
          }
          bodyClassName="divide-y divide-[var(--tpl-rule)]"
        >
          {LEADS.slice(0, 4).map((lead) => {
            const status = LEAD_STATUS_LABEL[lead.status]
            return (
              <div key={lead.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3">
                <span className="text-[13px] font-medium">{lead.name}</span>
                <Badge tone={status.tone}>{status.label}</Badge>
                <span className="text-[12px] text-[var(--tpl-ink-dim)]">
                  {lead.company} · {lead.category} · {lead.budget}
                </span>
                <span className="tpl-num ml-auto text-[11.5px] text-[var(--tpl-ink-faint)]">
                  {lead.submittedAt}
                </span>
                <p className="w-full truncate text-[12px] text-[var(--tpl-ink-faint)]">
                  {lead.note}
                </p>
              </div>
            )
          })}
        </AdminPanel>
      </div>
    </AdminShell>
  )
}
