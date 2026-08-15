import type { SiteTemplatePageProps } from '../../../types'
import { ERROR_CLUSTERS, LOGS_INSIGHT, LOG_ENTRIES, LOG_LEVEL_COUNTS } from '../data'
import { LOG_LEVEL_COLORS } from '../charts/chartTheme'
import { LogErrorChart, LogVolumeChart } from '../charts/LogCharts'
import { ConsoleShell, ToolbarChips } from '../components/ConsoleShell'
import { Panel } from '../components/Panel'
import { Sparkline } from '../components/Sparkline'
import { Table, TBody, TD, TH, THead, TR } from '../components/DataTable'
import '../theme.css'

const TOTAL_LOGS = LOG_LEVEL_COUNTS.reduce((sum, item) => sum + item.count, 0)

export default function LogsPage({ basePath }: SiteTemplatePageProps) {
  return (
    <ConsoleShell
      basePath={basePath}
      activeSlug="logs"
      title="日志与异常"
      subtitle={`近 24 小时共 ${(TOTAL_LOGS / 10000).toFixed(1)} 万条 · 异常聚类 ${ERROR_CLUSTERS.length} 组`}
      toolbar={<ToolbarChips items={['全部等级', 'ERROR', 'WARN']} />}
      insight={LOGS_INSIGHT}
    >
      <div className="space-y-5">
        {/* 等级统计既是概览也是上面两张图的表格视图：图表的读数不能只存在于提示层里 */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LOG_LEVEL_COUNTS.map((item) => (
            <div
              key={item.level}
              className="tpl-glass-card flex items-center gap-3 rounded-xl px-4 py-3"
            >
              <span
                className="h-8 w-[3px] shrink-0 rounded-full"
                style={{ backgroundColor: LOG_LEVEL_COLORS[item.level] }}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="font-[family-name:var(--tpl-font-mono)] text-[11px] tracking-wide text-[var(--tpl-fg-dim)]">
                  {item.level}
                </p>
                <p className="mt-0.5 text-[18px] font-semibold leading-none">
                  {item.count.toLocaleString('en-US')}
                </p>
              </div>
              <span className="ml-auto shrink-0 font-[family-name:var(--tpl-font-mono)] text-[11px] tabular-nums text-[var(--tpl-fg-faint)]">
                {((item.count / TOTAL_LOGS) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <Panel title="日志总量" hint="近 24 小时 · 四个等级合计" bodyClassName="px-3 pb-3 pt-2">
            <LogVolumeChart />
          </Panel>
          <Panel title="异常日志" hint="WARN 与 ERROR 单独计量" bodyClassName="px-3 pb-3 pt-2">
            <LogErrorChart />
          </Panel>
        </section>

        <Panel
          title="异常聚类"
          hint="按错误签名归一后排序 · 近 24 小时"
          bodyClassName=""
        >
          <Table minWidth={960}>
            <THead>
              <TH>错误签名</TH>
              <TH>来源</TH>
              <TH align="right">出现次数</TH>
              <TH align="right">环比</TH>
              <TH>趋势</TH>
              <TH>首次 / 末次</TH>
              <TH align="right">影响量</TH>
            </THead>
            <TBody>
              {ERROR_CLUSTERS.map((cluster) => (
                <TR key={cluster.signature}>
                  <TD>
                    <span className="font-[family-name:var(--tpl-font-mono)] text-[11px]">
                      {cluster.signature}
                    </span>
                  </TD>
                  {/* 项目在上、服务在下：14 个项目跨 6 种类型之后，
                      "这条异常属于哪个项目"比"属于哪个进程"更先被问到 */}
                  <TD nowrap>
                    <span className="block">{cluster.project}</span>
                    <span className="mt-0.5 block font-[family-name:var(--tpl-font-mono)] text-[10px] text-[var(--tpl-fg-faint)]">
                      {cluster.service}
                    </span>
                  </TD>
                  <TD align="right" mono>
                    {cluster.count.toLocaleString('en-US')}
                  </TD>
                  <TD align="right" mono>
                    <span
                      style={{
                        color:
                          cluster.trend === 'up'
                            ? 'var(--tpl-crit)'
                            : cluster.trend === 'down'
                              ? 'var(--tpl-ok)'
                              : 'var(--tpl-fg-dim)',
                      }}
                    >
                      {cluster.delta}
                    </span>
                  </TD>
                  <TD>
                    <Sparkline
                      data={cluster.spark}
                      color={
                        cluster.trend === 'down'
                          ? 'var(--tpl-ok)'
                          : cluster.trend === 'flat'
                            ? 'var(--tpl-fg-faint)'
                            : LOG_LEVEL_COLORS.ERROR
                      }
                      width={72}
                      height={20}
                    />
                  </TD>
                  <TD mono dim nowrap>
                    {cluster.firstSeen} / {cluster.lastSeen}
                  </TD>
                  <TD align="right" mono>
                    {cluster.impacted.toLocaleString('en-US')}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Panel>

        <Panel
          title="日志流"
          hint="实时尾随 · 最近 18 条"
          action={
            <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--tpl-fg-dim)]">
              <span className="tpl-pulse inline-block size-1.5 rounded-full bg-[var(--tpl-ok)]" aria-hidden />
              跟随最新
            </span>
          }
          bodyClassName=""
        >
          {/* 日志行是定宽分栏，窄屏必然放不下——由这个容器横向滚动，
              而不是让分栏塌掉或把整页撑出横向滚动条 */}
          <div className="tpl-scroll max-h-[420px] overflow-auto">
            <ul className="min-w-[860px] divide-y divide-[var(--tpl-rule)]">
              {LOG_ENTRIES.map((entry, index) => (
                <li
                  key={`${entry.time}-${index}`}
                  className="flex items-start gap-3 px-4 py-2 font-[family-name:var(--tpl-font-mono)] text-[11px] leading-relaxed transition hover:bg-[var(--tpl-subtle)]"
                >
                  <span className="shrink-0 tabular-nums text-[var(--tpl-fg-faint)]">{entry.time}</span>
                  <span
                    className="w-12 shrink-0 font-medium"
                    style={{ color: LOG_LEVEL_COLORS[entry.level] }}
                  >
                    {entry.level}
                  </span>
                  <span className="w-40 shrink-0 truncate text-[var(--tpl-fg-dim)]">{entry.service}</span>
                  <span className="w-20 shrink-0 text-[var(--tpl-fg-faint)]">{entry.traceId}</span>
                  <span className="min-w-0 flex-1 break-all">{entry.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </ConsoleShell>
  )
}
