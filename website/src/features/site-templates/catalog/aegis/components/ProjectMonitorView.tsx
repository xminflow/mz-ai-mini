'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { ProjectKind } from '../data'
import {
  PROJECTS,
  PROJECT_KINDS,
  DEFAULT_PROJECT_ID,
  formatNumber,
  getProject,
  projectInsight,
} from '../data'
import { MetricSeriesChart, ResourceChart } from '../charts/MetricCharts'
import { ConsoleShell, ToolbarChips } from './ConsoleShell'
import { Panel } from './Panel'
import { Sparkline } from './Sparkline'
import { StatTile } from './StatTile'
import { HealthBadge, StatusDot, healthColor } from './StatusBadge'

/**
 * 项目监控详情。
 *
 * 这是整套模板里唯一的客户端视图。之所以必须是客户端组件：模板要证明的核心主张是
 * 「同一套监控形态能罩住 Web 应用、API 服务、AI Agent、数据管道、定时任务、数据库」，
 * 而这件事只有在真的能点着切换、亲眼看到指标名称、单位、曲线形态、专属指标区
 * 一起跟着变的时候才成立。静态截图式的展示说服不了任何人。
 */

type KindFilter = ProjectKind | 'all'

export function ProjectMonitorView({ basePath }: { basePath: string }) {
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [projectId, setProjectId] = useState(DEFAULT_PROJECT_ID)

  // 智能体的结论随选中项目变——切到哪个项目，横幅上分析的就是哪个
  const project = getProject(projectId)
  const spec = project.spec
  const visibleProjects = kindFilter === 'all' ? PROJECTS : PROJECTS.filter((item) => item.kind === kindFilter)
  const degraded = project.services.filter((service) => service.status !== 'healthy')

  // 切换类型时把选中项目落到该类型的第一个，否则会出现「筛选了数据库、
  // 面板上却还挂着一个 API 项目」这种自相矛盾的状态
  function selectKind(next: KindFilter) {
    setKindFilter(next)
    if (next !== 'all' && project.kind !== next) {
      const first = PROJECTS.find((item) => item.kind === next)
      if (first) setProjectId(first.id)
    }
  }

  return (
    <ConsoleShell
      basePath={basePath}
      activeSlug="project"
      title={project.name}
      subtitle={`${spec.label} · ${project.role} · ${project.env} · 负责人 ${project.owner}`}
      toolbar={<ToolbarChips items={['24 小时', '7 天', '30 天']} />}
      insight={projectInsight(project)}
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Link href={basePath} className="text-[12px] text-[var(--tpl-fg-dim)] transition hover:text-[var(--tpl-fg)]">
            ← 项目总览
          </Link>
          <HealthBadge
            status={project.status}
            text={project.status === 'healthy' ? '运行正常' : project.status === 'warning' ? '存在风险' : '服务降级中'}
          />
          <span className="text-[12px] text-[var(--tpl-fg-faint)]">
            {degraded.length} 个依赖异常 · {project.activeAlerts} 条活跃告警
          </span>
        </div>

        <Panel bodyClassName="p-3">
          <div className="tpl-scroll flex gap-1 overflow-x-auto pb-1">
            <FilterChip active={kindFilter === 'all'} onClick={() => selectKind('all')}>
              全部 <span className="tabular-nums opacity-60">{PROJECTS.length}</span>
            </FilterChip>
            {PROJECT_KINDS.map((kindSpec) => {
              const count = PROJECTS.filter((item) => item.kind === kindSpec.id).length
              return (
                <FilterChip
                  key={kindSpec.id}
                  active={kindFilter === kindSpec.id}
                  onClick={() => selectKind(kindSpec.id)}
                >
                  {kindSpec.label} <span className="tabular-nums opacity-60">{count}</span>
                </FilterChip>
              )
            })}
          </div>

          <div className="tpl-scroll mt-2 flex gap-2 overflow-x-auto border-t border-[var(--tpl-rule)] pt-3">
            {visibleProjects.map((item) => {
              const active = item.id === project.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setProjectId(item.id)}
                  aria-pressed={active}
                  className={
                    active
                      ? 'flex shrink-0 items-center gap-2 rounded-md border border-[var(--tpl-accent)] bg-[var(--tpl-accent-soft)] px-3 py-1.5 text-[12px] font-medium text-[var(--tpl-accent)]'
                      : 'flex shrink-0 items-center gap-2 rounded-md border border-[var(--tpl-rule)] px-3 py-1.5 text-[12px] text-[var(--tpl-fg-dim)] transition hover:border-[var(--tpl-rule-strong)] hover:text-[var(--tpl-fg)]'
                  }
                >
                  <StatusDot status={item.status} size={6} />
                  {item.name}
                </button>
              )
            })}
          </div>
        </Panel>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {project.coreKpis.map((item) => (
            <StatTile
              key={item.label}
              label={item.label}
              value={item.value}
              unit={item.unit}
              hint={item.hint}
              status={item.status}
            />
          ))}
        </section>

        <Panel title={spec.extraTitle} hint={`${spec.label} 特有的健康信号，随项目类型变化`}>
          <div className="grid gap-3 sm:grid-cols-3">
            {project.extraKpis.map((item) => (
              <StatTile
                key={item.label}
                label={item.label}
                value={item.value}
                unit={item.unit}
                hint={item.hint}
                status={item.status}
              />
            ))}
          </div>
        </Panel>

        <Panel
          title="核心指标"
          hint={
            project.hasIncident
              ? '近 24 小时 · 三张图共用时间轴，浅红区间为 14:00–16:00 故障时段'
              : '近 24 小时 · 三张图共用时间轴'
          }
          bodyClassName="divide-y divide-[var(--tpl-rule)]"
        >
          <ChartRow label={spec.throughputLabel} unit={spec.throughputUnit}>
            <MetricSeriesChart
              series={project.throughput}
              tone="accent"
              unit={spec.throughputUnit}
              showIncident={project.hasIncident}
              ariaLabel={`${project.name} 近 24 小时${spec.throughputLabel}趋势`}
            />
          </ChartRow>

          <ChartRow label={spec.latencyLabel} unit={spec.latencyUnit}>
            <MetricSeriesChart
              series={project.latency}
              tone="warn"
              unit={spec.latencyUnit}
              threshold={project.latencyThreshold}
              thresholdLabel={`告警阈值 ${formatNumber(project.latencyThreshold)}${spec.latencyUnit}`}
              showIncident={project.hasIncident}
              ariaLabel={`${project.name} 近 24 小时${spec.latencyLabel}，告警阈值 ${project.latencyThreshold}${spec.latencyUnit}`}
            />
          </ChartRow>

          <ChartRow label="错误率" unit="%">
            <MetricSeriesChart
              series={project.errorRate}
              tone="crit"
              unit="%"
              showIncident={project.hasIncident}
              ariaLabel={`${project.name} 近 24 小时错误率`}
            />
          </ChartRow>
        </Panel>

        <Panel title="依赖服务存活" hint={`${project.services.length} 个依赖 · 健康检查间隔 15s`}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {project.services.map((node) => (
              <div key={node.name} className="tpl-glass-card rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <StatusDot status={node.status} />
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{node.name}</span>
                  <span className="shrink-0 text-[10px] text-[var(--tpl-fg-faint)]">{node.category}</span>
                </div>

                <div className="mt-2.5 flex items-end justify-between gap-2">
                  <div>
                    <p className="font-[family-name:var(--tpl-font-mono)] text-[15px] font-semibold leading-none tabular-nums">
                      {formatNumber(node.latencyMs)}
                      <span className="ml-0.5 text-[10px] font-normal text-[var(--tpl-fg-dim)]">ms</span>
                    </p>
                    <p className="mt-1 font-[family-name:var(--tpl-font-mono)] text-[10px] tabular-nums text-[var(--tpl-fg-faint)]">
                      {node.uptime}% · {node.replicas}
                    </p>
                  </div>
                  <Sparkline data={node.spark} color={healthColor(node.status)} width={72} height={24} filled={false} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <section className="grid gap-4 xl:grid-cols-2">
          <Panel title="资源占用" hint="近 24 小时 · 实例平均值" bodyClassName="px-3 pb-3 pt-2">
            <ResourceChart
              cpu={project.cpu}
              memory={project.memory}
              ariaLabel={`${project.name} 近 24 小时 CPU 与内存占用率`}
            />
          </Panel>

          <Panel title="最近事件" hint="发布、扩缩容、告警与预案执行">
            {/* 时间轴用一条竖线加圆点表达，不做卡片堆叠——事件本身只有时间、标题、说明三段信息 */}
            <ol className="relative ml-1 border-l border-[var(--tpl-rule)] pl-5">
              {project.events.map((event) => (
                <li key={event.time} className="relative pb-4 last:pb-0">
                  <span
                    className="absolute -left-[25px] top-1 size-2 rounded-full ring-4 ring-[var(--tpl-bg)]"
                    style={{
                      backgroundColor: event.tone === 'neutral' ? 'var(--tpl-rule-strong)' : healthColor(event.tone),
                    }}
                    aria-hidden
                  />
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-[family-name:var(--tpl-font-mono)] text-[11px] tabular-nums text-[var(--tpl-fg-faint)]">
                      {event.time}
                    </span>
                    <span className="text-[12px] font-medium">{event.title}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--tpl-fg-dim)]">{event.detail}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </section>
      </div>
    </ConsoleShell>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'shrink-0 rounded-md bg-[var(--tpl-surface)] px-2.5 py-1 text-[12px] font-medium text-[var(--tpl-fg)]'
          : 'shrink-0 rounded-md px-2.5 py-1 text-[12px] text-[var(--tpl-fg-dim)] transition hover:text-[var(--tpl-fg)]'
      }
    >
      {children}
    </button>
  )
}

function ChartRow({ label, unit, children }: { label: string; unit: string; children: React.ReactNode }) {
  return (
    <div className="px-3 py-3">
      <div className="mb-1 flex items-baseline gap-2 px-1">
        <span className="text-[12px] font-medium">{label}</span>
        <span className="text-[11px] text-[var(--tpl-fg-faint)]">{unit}</span>
      </div>
      {children}
    </div>
  )
}
