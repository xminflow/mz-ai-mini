import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import type { Project } from '../data'
import {
  BUDGET_RANKING_SIZE,
  GLOBAL_KPIS,
  PROJECTS,
  formatNumber,
  getKindSpec,
  groupProjectsByKind,
} from '../data'
import { AlertTrendChart, BudgetRankingChart } from '../charts/OverviewCharts'
import { ConsoleShell, ToolbarChips } from '../components/ConsoleShell'
import { Panel } from '../components/Panel'
import { Sparkline } from '../components/Sparkline'
import { StatTile } from '../components/StatTile'
import { HealthBadge, StatusDot, healthColor } from '../components/StatusBadge'
import '../theme.css'

const GROUPS = groupProjectsByKind()

/**
 * 分组摘要只报需要处理的数量，不报"多少个正常"。
 * 正常是默认状态，把它数出来只会稀释真正要看的那个数字；一组全都正常时这里就是空的。
 */
function groupSummary(projects: Project[]): string {
  const critical = projects.filter((item) => item.status === 'critical').length
  const warning = projects.filter((item) => item.status === 'warning').length
  return [critical ? `${critical} 异常` : '', warning ? `${warning} 警告` : '']
    .filter(Boolean)
    .join(' · ')
}

export default function OverviewPage({ basePath }: SiteTemplatePageProps) {
  const alertingCount = PROJECTS.filter((project) => project.activeAlerts > 0).length

  return (
    <ConsoleShell
      basePath={basePath}
      activeSlug=""
      title="项目总览"
      subtitle={`${alertingCount} 个项目存在活跃告警`}
      toolbar={<ToolbarChips items={['24 小时', '7 天', '30 天']} />}
    >
      <div className="space-y-5">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {GLOBAL_KPIS.map((kpi) => (
            <StatTile
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
              delta={kpi.delta}
              trend={kpi.trend}
              tone={kpi.tone}
            />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-5">
          <Panel
            title="全局告警趋势"
            hint="近 24 小时 · 按严重度堆叠"
            className="xl:col-span-3"
            bodyClassName="px-3 pb-3 pt-2"
          >
            <AlertTrendChart />
          </Panel>

          <Panel
            title="SLO 误差预算消耗"
            hint={`近 7 天 · 仅列消耗最高的 ${BUDGET_RANKING_SIZE} 个（重点项目 ${PROJECTS.length} 个）`}
            className="xl:col-span-2"
            bodyClassName="px-3 pb-3 pt-2"
          >
            <BudgetRankingChart />
          </Panel>
        </section>

        {/* 二十几个项目平铺成一片卡片会读不出结构，按类型分组之后
            「这套平台什么类型都能纳管」这件事本身就成了页面上最显眼的信息 */}
        {GROUPS.map(({ kind, projects }) => {
          const spec = getKindSpec(kind)
          return (
            <section key={kind}>
              <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[var(--tpl-rule)] pb-2">
                <h2 className="text-[13px] font-semibold tracking-tight">{spec.label}</h2>
                <span className="text-[11px] text-[var(--tpl-fg-dim)]">{groupSummary(projects)}</span>
                <span className="ml-auto text-[11px] text-[var(--tpl-fg-faint)]">{spec.note}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} basePath={basePath} />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </ConsoleShell>
  )
}

function ProjectCard({ project, basePath }: { project: Project; basePath: string }) {
  const spec = project.spec
  // 用 activeIndex 而不是固定的"当前时刻"：定时任务在大多数整点没有执行，
  // 取当前值会得到 0，卡片上就成了「P95 0 分钟」这种既不真也没用的读数。
  const throughputNow = project.throughput[project.activeIndex]
  const latencyNow = project.latency[project.activeIndex]

  return (
    <Link
      href={`${basePath}/project`}
      className="tpl-glass-card group rounded-xl p-4 transition hover:border-[var(--tpl-rule-strong)]"
    >
      <div className="flex items-center gap-2">
        <StatusDot status={project.status} />
        <h3 className="min-w-0 flex-1 truncate text-[13px] font-medium">{project.name}</h3>
        <span className="shrink-0 rounded border border-[var(--tpl-rule)] px-1.5 py-0.5 text-[10px] text-[var(--tpl-fg-faint)]">
          {project.env}
        </span>
      </div>

      <p className="mt-1 truncate text-[11px] text-[var(--tpl-fg-faint)]">{project.role}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-[family-name:var(--tpl-font-mono)] text-[20px] font-semibold leading-none">
            {project.successRate}
            <span className="ml-0.5 text-[11px] font-normal text-[var(--tpl-fg-dim)]">%</span>
          </p>
          <p className="mt-1 text-[11px] text-[var(--tpl-fg-faint)]">成功率</p>
        </div>
        <Sparkline data={project.throughput} color={healthColor(project.status)} width={88} height={28} />
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--tpl-rule)] pt-3 text-[11px]">
        <div className="min-w-0">
          {/* 吞吐与延迟的名称、单位都随项目类型变，卡片上也必须照实显示，
              统一写成「调用量」会让数据库和定时任务的读数变成假的 */}
          <dt className="truncate text-[var(--tpl-fg-faint)]">{spec.throughputUnit}</dt>
          <dd className="mt-0.5 truncate font-[family-name:var(--tpl-font-mono)] tabular-nums">
            {formatNumber(throughputNow)}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="truncate text-[var(--tpl-fg-faint)]">P95</dt>
          <dd className="mt-0.5 truncate font-[family-name:var(--tpl-font-mono)] tabular-nums">
            {formatNumber(latencyNow)}
            {spec.latencyUnit}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="truncate text-[var(--tpl-fg-faint)]">告警</dt>
          <dd className="mt-0.5">
            {project.activeAlerts > 0 ? (
              <HealthBadge
                status={project.status === 'critical' ? 'critical' : 'warning'}
                text={`${project.activeAlerts} 条`}
              />
            ) : (
              <span className="font-[family-name:var(--tpl-font-mono)] tabular-nums text-[var(--tpl-fg-dim)]">0</span>
            )}
          </dd>
        </div>
      </dl>
    </Link>
  )
}
