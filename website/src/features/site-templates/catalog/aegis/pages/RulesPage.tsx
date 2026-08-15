import type { SiteTemplatePageProps } from '../../../types'
import { ALERT_RULES, NOTIFY_CHANNELS, THRESHOLD_PREVIEW } from '../data'
import { ThresholdPreviewChart } from '../charts/RuleCharts'
import { ConsoleShell, ToolbarChips } from '../components/ConsoleShell'
import { Panel } from '../components/Panel'
import { SeverityBadge } from '../components/StatusBadge'
import { Table, TBody, TD, TH, THead, TR } from '../components/DataTable'
import '../theme.css'

/**
 * 表单控件的基础样式里刻意不含宽度：Tailwind 的 `w-full` 与 `w-20` 同时出现在
 * class 串里时，谁生效取决于 CSS 产物中的先后顺序而不是书写顺序，
 * 结果就是"明明写了 w-20 却还是占满一行"。宽度一律由调用处单独给。
 */
const FIELD_BASE =
  'rounded-md border border-[var(--tpl-rule)] bg-[var(--tpl-bg)] px-2.5 py-1.5 text-[12px] text-[var(--tpl-fg)] outline-none transition focus:border-[var(--tpl-accent)]'
const FIELD_CLASS = `w-full ${FIELD_BASE}`

/** 指标下拉里混排通用指标与类型专属指标，说明两者用的是同一套规则引擎。 */
const METRIC_OPTIONS = [
  'latency.p95',
  'task.success_rate',
  'upstream.timeout_rate',
  'service.replicas_ready',
  'pipeline.backlog',
  'job.missed_schedule',
  'db.replica_lag',
  'web.js_error_rate',
  'llm.context_exceeded',
]

const SCOPE_OPTIONS = [
  '全部项目',
  '全部生产项目',
  'Web 应用类',
  'API 服务类',
  'AI Agent 类',
  '数据管道类',
  '定时任务类',
  '数据库类',
  '支付网关',
]

export default function RulesPage({ basePath }: SiteTemplatePageProps) {
  const enabledCount = ALERT_RULES.filter((rule) => rule.enabled).length

  return (
    <ConsoleShell
      basePath={basePath}
      activeSlug="rules"
      title="告警规则配置"
      subtitle={`${ALERT_RULES.length} 条规则 · ${enabledCount} 条已启用 · ${NOTIFY_CHANNELS.length} 个通知渠道`}
      toolbar={<ToolbarChips items={['全部规则', '已启用', '已停用']} />}
    >
      <div className="space-y-5">
        {/* 规则表有 7 列且「触发条件」「作用范围」都是长文本，挤在两栏里会把右侧的
            启停开关顶出可视区——它独占一整行，编辑面板改与阈值预览同行。 */}
        <Panel title="规则列表" hint="近 7 天触发次数可用于判断规则是否过于灵敏" bodyClassName="">
          <Table minWidth={1000}>
              <THead>
                <TH>规则</TH>
                <TH>作用范围</TH>
                <TH>触发条件</TH>
                <TH>严重度</TH>
                <TH>通知渠道</TH>
                <TH align="right">7 日触发</TH>
                <TH align="right">状态</TH>
              </THead>
              <TBody>
                {ALERT_RULES.map((rule) => (
                  <TR key={rule.id}>
                    <TD>
                      <p className="font-medium">{rule.name}</p>
                      <p className="mt-0.5 font-[family-name:var(--tpl-font-mono)] text-[10px] text-[var(--tpl-fg-faint)]">
                        {rule.id} · {rule.metric}
                      </p>
                    </TD>
                    <TD dim nowrap>
                      {rule.scope}
                    </TD>
                    <TD mono nowrap>
                      {rule.condition}
                    </TD>
                    <TD nowrap>
                      <SeverityBadge severity={rule.severity} />
                    </TD>
                    {/* 渠道最多列两个，其余折成 +N：这一列若放开写，整张表会宽到把右侧的启停开关挤出可视区 */}
                    <TD dim nowrap>
                      {rule.channels.slice(0, 2).join(' · ')}
                      {rule.channels.length > 2 ? ` +${rule.channels.length - 2}` : ''}
                    </TD>
                    <TD align="right" mono dim>
                      {rule.fired7d}
                    </TD>
                    <TD align="right" nowrap>
                      {/* 开关做成视觉态：模板展示的是界面形态，不实现产品逻辑 */}
                      <span
                        className={`inline-flex h-4 w-7 items-center rounded-full p-0.5 transition ${
                          rule.enabled ? 'bg-[var(--tpl-accent)]' : 'bg-[var(--tpl-rule-strong)]'
                        }`}
                        role="img"
                        aria-label={rule.enabled ? '已启用' : '已停用'}
                      >
                        <span
                          className={`size-3 rounded-full bg-white transition ${rule.enabled ? 'translate-x-3' : ''}`}
                        />
                      </span>
                    </TD>
                  </TR>
                ))}
              </TBody>
          </Table>
        </Panel>

        <section className="grid gap-4 xl:grid-cols-3">
          <Panel
            title="阈值预览"
            hint={`${THRESHOLD_PREVIEW.projectName} · ${THRESHOLD_PREVIEW.metricLabel} · 按当前阈值，过去 24 小时会触发 ${THRESHOLD_PREVIEW.breachCount} 次`}
            className="xl:col-span-2 xl:self-start"
            bodyClassName="px-3 pb-3 pt-2"
          >
            <ThresholdPreviewChart />

            {/* 越界明细既补齐了图表的读数通路，也让"改了阈值会多告警几次"变成可核对的清单 */}
            <div className="mt-3 border-t border-[var(--tpl-rule)] pt-3">
              <p className="px-1 text-[11px] text-[var(--tpl-fg-dim)]">越界时段</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {THRESHOLD_PREVIEW.breaches.map((breach) => (
                  <li
                    key={breach.hour}
                    className="flex items-baseline gap-2 rounded-md bg-[var(--tpl-crit-soft)] px-2.5 py-1.5"
                  >
                    <span className="font-[family-name:var(--tpl-font-mono)] text-[11px] tabular-nums text-[var(--tpl-fg-dim)]">
                      {breach.hour}
                    </span>
                    <span className="font-[family-name:var(--tpl-font-mono)] text-[12px] font-medium tabular-nums text-[var(--tpl-crit)]">
                      {breach.value.toLocaleString('en-US')} {THRESHOLD_PREVIEW.unit}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 px-1 text-[11px] leading-relaxed text-[var(--tpl-fg-faint)]">
                {/* 对照次数由曲线现算，不是写死的文案——手填的数字一旦和图对不上，
                    这个面板最有说服力的地方反而变成破绽 */}
                {THRESHOLD_PREVIEW.alternatives
                  .map(
                    (item) =>
                      `阈值改为 ${item.threshold.toLocaleString('en-US')}${THRESHOLD_PREVIEW.unit} 则触发 ${item.count} 次`,
                  )
                  .join('；')}
                。
              </p>
            </div>
          </Panel>

          <Panel title="编辑规则" hint="RULE-002 · 支付网关 P95 响应耗时劣化">
            <div className="space-y-3.5">
              <label className="block">
                <span className="mb-1 block text-[11px] text-[var(--tpl-fg-dim)]">规则名称</span>
                <input className={FIELD_CLASS} defaultValue="P95 响应耗时劣化" />
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] text-[var(--tpl-fg-dim)]">作用范围</span>
                <select className={FIELD_CLASS} defaultValue="支付网关">
                  {SCOPE_OPTIONS.map((scope) => (
                    <option key={scope}>{scope}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-[11px] text-[var(--tpl-fg-dim)]">监控指标</span>
                <select className={`${FIELD_CLASS} font-[family-name:var(--tpl-font-mono)]`} defaultValue="latency.p95">
                  {METRIC_OPTIONS.map((metric) => (
                    <option key={metric}>{metric}</option>
                  ))}
                </select>
              </label>

              <div>
                <span className="mb-1 block text-[11px] text-[var(--tpl-fg-dim)]">触发条件</span>
                <div className="flex gap-2">
                  <select className={`${FIELD_BASE} w-16 shrink-0`} defaultValue=">">
                    <option>&gt;</option>
                    <option>≥</option>
                    <option>&lt;</option>
                    <option>≤</option>
                  </select>
                  <input className={`${FIELD_CLASS} font-[family-name:var(--tpl-font-mono)]`} defaultValue="1500" />
                  <span className="flex shrink-0 items-center text-[11px] text-[var(--tpl-fg-faint)]">ms</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] text-[var(--tpl-fg-dim)]">持续时间</span>
                  <select className={FIELD_CLASS} defaultValue="10 分钟">
                    <option>1 分钟</option>
                    <option>5 分钟</option>
                    <option>10 分钟</option>
                    <option>30 分钟</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-[var(--tpl-fg-dim)]">静默期</span>
                  <select className={FIELD_CLASS} defaultValue="30 分钟">
                    <option>不静默</option>
                    <option>15 分钟</option>
                    <option>30 分钟</option>
                    <option>1 小时</option>
                  </select>
                </label>
              </div>

              <fieldset>
                <legend className="mb-1 text-[11px] text-[var(--tpl-fg-dim)]">严重度</legend>
                <div className="flex gap-4">
                  {(['critical', 'warning', 'info'] as const).map((severity) => (
                    <label key={severity} className="flex cursor-pointer items-center gap-1.5">
                      <input
                        type="radio"
                        name="severity"
                        defaultChecked={severity === 'critical'}
                        className="accent-[var(--tpl-accent)]"
                      />
                      <SeverityBadge severity={severity} />
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1.5 text-[11px] text-[var(--tpl-fg-dim)]">通知渠道</legend>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {NOTIFY_CHANNELS.map((channel) => (
                    <label key={channel.name} className="flex cursor-pointer items-center gap-1.5 text-[12px]">
                      <input
                        type="checkbox"
                        defaultChecked={channel.name === '企业微信' || channel.name === '钉钉'}
                        className="accent-[var(--tpl-accent)]"
                      />
                      {channel.name}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="flex gap-2 border-t border-[var(--tpl-rule)] pt-3.5">
                <span className="rounded-md bg-[var(--tpl-accent)] px-3.5 py-1.5 text-[12px] font-medium text-white">
                  保存规则
                </span>
                <span className="rounded-md border border-[var(--tpl-rule)] px-3.5 py-1.5 text-[12px] text-[var(--tpl-fg-dim)]">
                  取消
                </span>
              </div>
            </div>
          </Panel>
        </section>

        <Panel title="通知渠道" hint="渠道级开关优先于规则配置">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {NOTIFY_CHANNELS.map((channel) => (
              <div key={channel.name} className="rounded-md border border-[var(--tpl-rule)] px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{channel.name}</span>
                  <span
                    className="inline-flex h-4 w-7 shrink-0 items-center rounded-full bg-[var(--tpl-accent)] p-0.5"
                    role="img"
                    aria-label="已启用"
                  >
                    <span className="size-3 translate-x-3 rounded-full bg-white" />
                  </span>
                </div>
                <p className="mt-1.5 truncate font-[family-name:var(--tpl-font-mono)] text-[10px] text-[var(--tpl-fg-faint)]">
                  {channel.target}
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--tpl-fg-dim)]">{channel.hint}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </ConsoleShell>
  )
}
