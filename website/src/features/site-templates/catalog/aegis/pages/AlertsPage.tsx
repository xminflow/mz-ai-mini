import type { SiteTemplatePageProps } from '../../../types'
import { ACTIVE_ALERTS, ALERT_METRICS, ALERT_TIMELINE } from '../data'
import { SeverityDonutChart } from '../charts/AlertCharts'
import { ConsoleShell, ToolbarChips } from '../components/ConsoleShell'
import { Panel } from '../components/Panel'
import { StatTile } from '../components/StatTile'
import { SeverityBadge, SeverityBar, healthColor } from '../components/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '../components/DataTable'
import '../theme.css'

/** 告警处理状态的配色。与严重度分开：一条严重告警也可能已经在处理中。 */
const STATE_STYLE: Record<string, string> = {
  待认领: 'var(--tpl-crit)',
  处理中: 'var(--tpl-warn)',
  已抑制: 'var(--tpl-fg-faint)',
  已恢复: 'var(--tpl-ok)',
}

export default function AlertsPage({ basePath }: SiteTemplatePageProps) {
  const unclaimed = ACTIVE_ALERTS.filter((alert) => alert.state === '待认领').length

  return (
    <ConsoleShell
      basePath={basePath}
      activeSlug="alerts"
      title="告警中心"
      subtitle={`${ACTIVE_ALERTS.length} 条未关闭告警 · ${unclaimed} 条待认领`}
      toolbar={<ToolbarChips items={['全部', '未恢复', '已抑制']} />}
    >
      <div className="space-y-5">
        <section className="grid gap-4 xl:grid-cols-3">
          <Panel title="严重度构成" hint="当前未关闭告警" bodyClassName="px-3 pb-3 pt-2">
            <SeverityDonutChart />
          </Panel>

          <div className="grid grid-cols-2 gap-3 xl:col-span-2 xl:content-start">
            {ALERT_METRICS.map((metric) => (
              <StatTile
                key={metric.label}
                label={metric.label}
                value={metric.value}
                unit={metric.unit}
                hint={metric.hint}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <Panel title="活跃告警" hint="按触发时间倒序" className="xl:col-span-2" bodyClassName="">
            <Table minWidth={860}>
              <THead>
                <TH>严重度</TH>
                <TH>告警</TH>
                <TH>项目</TH>
                <TH>触发</TH>
                <TH align="right">持续</TH>
                <TH>负责人</TH>
                <TH>状态</TH>
              </THead>
              <TBody>
                {ACTIVE_ALERTS.map((alert) => (
                  <TR key={alert.id}>
                    <TD nowrap>
                      <span className="flex items-center gap-2">
                        <SeverityBar severity={alert.severity} />
                        <SeverityBadge severity={alert.severity} />
                      </span>
                    </TD>
                    <TD>
                      <p className="font-medium">{alert.title}</p>
                      <p className="mt-0.5 font-[family-name:var(--tpl-font-mono)] text-[10px] text-[var(--tpl-fg-faint)]">
                        {alert.id} · {alert.rule}
                      </p>
                    </TD>
                    {/* 项目下方标出类型：跨 6 种类型的告警混在一张表里时，
                        类型标签是最快分辨"这该找谁看"的线索 */}
                    <TD nowrap>
                      <span className="block">{alert.project}</span>
                      <span className="mt-0.5 block text-[10px] text-[var(--tpl-fg-faint)]">{alert.kindLabel}</span>
                    </TD>
                    <TD mono dim nowrap>
                      {alert.firedAt}
                    </TD>
                    <TD align="right" mono dim nowrap>
                      {alert.duration}
                    </TD>
                    <TD dim nowrap>
                      {alert.assignee}
                    </TD>
                    <TD nowrap>
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium"
                        style={{ color: STATE_STYLE[alert.state] }}
                      >
                        <span
                          className="inline-block size-1.5 rounded-full"
                          style={{ backgroundColor: STATE_STYLE[alert.state] }}
                          aria-hidden
                        />
                        {alert.state}
                      </span>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Panel>

          <Panel title="处理时间线" hint="ALT-20418 · 平台-统一支付网关 上游依赖超时率突增">
            <ol className="relative ml-1 border-l border-[var(--tpl-rule)] pl-5">
              {ALERT_TIMELINE.map((event) => (
                <li key={event.time} className="relative pb-4 last:pb-0">
                  <span
                    className="absolute -left-[25px] top-1 size-2 rounded-full ring-4 ring-[var(--tpl-bg)]"
                    style={{
                      backgroundColor:
                        event.tone === 'neutral' ? 'var(--tpl-rule-strong)' : healthColor(event.tone),
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

            <div className="mt-4 rounded-md border border-[var(--tpl-rule)] bg-[var(--tpl-subtle)] px-3 py-2.5">
              <p className="text-[11px] text-[var(--tpl-fg-dim)]">
                确认耗时 <span className="font-[family-name:var(--tpl-font-mono)] tabular-nums text-[var(--tpl-fg)]">2 分 26 秒</span>
                　恢复耗时 <span className="font-[family-name:var(--tpl-font-mono)] tabular-nums text-[var(--tpl-fg)]">51 分 14 秒</span>
              </p>
            </div>
          </Panel>
        </section>
      </div>
    </ConsoleShell>
  )
}
