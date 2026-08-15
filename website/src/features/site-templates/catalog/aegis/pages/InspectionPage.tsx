import type { SiteTemplatePageProps } from '../../../types'
import type { LineOutcome } from '../data'
import {
  APPLIED_FIXES,
  INSPECTED_PROJECTS,
  INSPECTION_AGENTS,
  INSPECTION_INTERVAL,
  INSPECTION_LINES,
  INSPECTION_SUMMARY,
  PENDING_FIXES,
} from '../data'
import { ConsoleShell, ToolbarChips } from '../components/ConsoleShell'
import { Panel } from '../components/Panel'
import { StatTile } from '../components/StatTile'
import { Table, TBody, TD, TH, THead, TR } from '../components/DataTable'
import '../theme.css'

/** 巡检结论的三种颜色语义：发现问题、未见异常、仍在进行。 */
const OUTCOME_STYLE: Record<LineOutcome, { label: string; color: string; soft: string }> = {
  finding: { label: '发现', color: 'var(--tpl-crit)', soft: 'var(--tpl-crit-soft)' },
  clear: { label: '正常', color: 'var(--tpl-ok)', soft: 'var(--tpl-ok-soft)' },
  running: { label: '进行中', color: 'var(--tpl-accent)', soft: 'var(--tpl-accent-soft)' },
}

const RISK_COLOR: Record<string, string> = {
  高风险: 'var(--tpl-crit)',
  中风险: 'var(--tpl-warn)',
  低风险: 'var(--tpl-fg-dim)',
}

export default function InspectionPage({ basePath }: SiteTemplatePageProps) {
  const running = INSPECTION_AGENTS.filter((agent) => agent.status === 'running').length

  return (
    <ConsoleShell
      basePath={basePath}
      activeSlug="inspect"
      title="智能体巡检"
      subtitle={`${INSPECTION_AGENTS.length} 个巡检智能体 · ${running} 个正在工作 · ${INSPECTION_INTERVAL}`}
      toolbar={<ToolbarChips items={['本轮', '今日', '近 7 天']} />}
    >
      <div className="space-y-5">
        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <StatTile
            label="本轮巡检覆盖"
            value={`${INSPECTION_SUMMARY.covered} / ${INSPECTED_PROJECTS.length}`}
            hint="仅巡检当前有活跃告警的项目"
          />
          <StatTile
            label="本轮发现问题"
            value={String(INSPECTION_SUMMARY.findings)}
            unit="项"
            hint="四个智能体本轮合计"
            status="warning"
          />
          <StatTile
            label="待授权修复"
            value={String(INSPECTION_SUMMARY.pending)}
            unit="项"
            hint="动作有副作用，需人工确认"
            status="critical"
          />
          <StatTile
            label="今日已自动修复"
            value={String(INSPECTION_SUMMARY.applied)}
            unit="项"
            hint="预案内的低风险动作，无需等待"
            status="healthy"
          />
        </section>

        {/* 四个智能体处在不同进度（三个巡检中、一个本轮完成并给出下轮时间），
            这本身就是"流水线在转"最直白的表达——不靠动效 */}
        <Panel title="巡检智能体" hint={`${INSPECTION_INTERVAL} · 按职责分工，各查各的一类问题`}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {INSPECTION_AGENTS.map((agent) => {
              const isRunning = agent.status === 'running'
              const total = INSPECTED_PROJECTS.length
              return (
                <div key={agent.name} className="tpl-glass-card rounded-lg px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: isRunning ? 'var(--tpl-accent)' : 'var(--tpl-rule-strong)' }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{agent.name}</span>
                    <span
                      className="shrink-0 text-[10px]"
                      style={{ color: isRunning ? 'var(--tpl-accent)' : 'var(--tpl-fg-faint)' }}
                    >
                      {isRunning ? '巡检中' : '本轮完成'}
                    </span>
                  </div>

                  <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--tpl-fg-faint)]">{agent.duty}</p>

                  <dl className="mt-3 space-y-1.5 border-t border-[var(--tpl-rule)] pt-3 text-[11px]">
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-[var(--tpl-fg-faint)]">当前目标</dt>
                      <dd className="min-w-0 flex-1 truncate text-right">{agent.currentTarget ?? '—'}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-[var(--tpl-fg-faint)]">本轮进度</dt>
                      <dd className="min-w-0 flex-1 text-right font-[family-name:var(--tpl-font-mono)] tabular-nums">
                        {agent.scanned} / {total}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="shrink-0 text-[var(--tpl-fg-faint)]">发现问题</dt>
                      <dd className="min-w-0 flex-1 text-right font-[family-name:var(--tpl-font-mono)] tabular-nums">
                        {agent.findings} 项
                      </dd>
                    </div>
                  </dl>

                  {/* 进度条是静态的，宽度就是本轮已巡检的比例 */}
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[var(--tpl-surface)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(agent.scanned / total) * 100}%`,
                        backgroundColor: isRunning ? 'var(--tpl-accent)' : 'var(--tpl-ok)',
                      }}
                    />
                  </div>

                  <p className="mt-2 text-[10px] leading-relaxed text-[var(--tpl-fg-faint)]">{agent.note}</p>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel
          title="巡检输出"
          hint={`${INSPECTION_INTERVAL} · 最近 ${INSPECTION_LINES.length} 条 · 最新在最上`}
          bodyClassName=""
        >
          {/* 定宽分栏在窄屏必然放不下，由这个容器横向滚动，不让整页出现横向滚动条 */}
          <div className="tpl-scroll overflow-auto">
            <ul className="min-w-[920px] divide-y divide-[var(--tpl-rule)]">
              {INSPECTION_LINES.map((line, index) => {
                const style = OUTCOME_STYLE[line.outcome]
                return (
                  <li
                    key={`${line.time}-${index}`}
                    className="flex items-baseline gap-3 px-4 py-2 font-[family-name:var(--tpl-font-mono)] text-[11px] leading-relaxed"
                  >
                    <span className="w-16 shrink-0 tabular-nums text-[var(--tpl-fg-faint)]">{line.time}</span>
                    <span className="w-28 shrink-0 truncate text-[var(--tpl-fg-dim)]">{line.agent}</span>
                    <span className="w-44 shrink-0 truncate text-[var(--tpl-fg-dim)]">{line.target}</span>
                    <span
                      className="w-11 shrink-0 rounded px-1 py-0.5 text-center text-[10px] font-medium"
                      style={{ backgroundColor: style.soft, color: style.color }}
                    >
                      {style.label}
                    </span>
                    <span
                      className="min-w-0 flex-1 break-all"
                      style={line.outcome === 'running' ? { color: 'var(--tpl-fg-dim)' } : undefined}
                    >
                      {line.message}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </Panel>

        <section className="grid gap-4 xl:grid-cols-2">
          <Panel
            title="待授权修复"
            hint="智能体已给出动作，但执行有副作用，需人工确认"
            bodyClassName="p-4 space-y-3"
          >
            {PENDING_FIXES.map((fix) => (
              <div key={fix.id} className="tpl-glass-card rounded-lg px-3 py-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-[family-name:var(--tpl-font-mono)] text-[10px] text-[var(--tpl-fg-faint)]">
                    {fix.id}
                  </span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ color: RISK_COLOR[fix.risk], backgroundColor: 'var(--tpl-surface)' }}
                  >
                    {fix.risk}
                  </span>
                  <span className="ml-auto truncate text-[11px] text-[var(--tpl-fg-dim)]">{fix.project}</span>
                </div>

                <p className="mt-2 text-[12px] leading-relaxed">{fix.problem}</p>

                <dl className="mt-2.5 space-y-1 text-[11px] leading-relaxed">
                  <div className="flex gap-2">
                    <dt className="w-14 shrink-0 text-[var(--tpl-fg-faint)]">建议动作</dt>
                    <dd className="min-w-0 flex-1">{fix.action}</dd>
                  </div>
                  {/* 「影响」是这块面板存在的理由——没有它，"授权"就成了走过场 */}
                  <div className="flex gap-2">
                    <dt className="w-14 shrink-0 text-[var(--tpl-fg-faint)]">影响</dt>
                    <dd className="min-w-0 flex-1 text-[var(--tpl-fg-dim)]">{fix.impact}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--tpl-rule)] pt-3">
                  <span className="text-[10px] text-[var(--tpl-fg-faint)]">
                    {fix.foundBy} · {fix.foundAt}
                  </span>
                  {/* 按钮做成视觉态：模板展示的是界面形态，不实现产品逻辑 */}
                  <span className="ml-auto rounded-md bg-[var(--tpl-accent)] px-3 py-1 text-[11px] font-medium text-[var(--tpl-bg)]">
                    授权修复
                  </span>
                  <span className="rounded-md border border-[var(--tpl-rule)] px-3 py-1 text-[11px] text-[var(--tpl-fg-dim)]">
                    忽略
                  </span>
                </div>
              </div>
            ))}
          </Panel>

          {/* self-start 让它按自身内容收高，不被左栏那四张卡片拉出一大块空白 */}
          <Panel
            title="已自动修复"
            hint="预案内的低风险动作，智能体直接执行"
            className="xl:self-start"
            bodyClassName=""
          >
            <Table minWidth={560}>
              <THead>
                <TH>时间</TH>
                <TH>项目 / 动作</TH>
                <TH align="right">耗时</TH>
                <TH>结果</TH>
              </THead>
              <TBody>
                {APPLIED_FIXES.map((fix) => (
                  <TR key={`${fix.time}-${fix.project}`}>
                    <TD mono dim nowrap>
                      {fix.time}
                    </TD>
                    <TD>
                      <p className="font-medium">{fix.action}</p>
                      <p className="mt-0.5 text-[10px] text-[var(--tpl-fg-faint)]">
                        {fix.project} · {fix.agent}
                      </p>
                    </TD>
                    <TD align="right" mono dim nowrap>
                      {fix.duration}
                    </TD>
                    {/* 只写"已修复"而不给结果等于什么都没说，这一列是可核对的实测变化 */}
                    <TD nowrap>
                      <span style={{ color: 'var(--tpl-ok)' }}>{fix.result}</span>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </Panel>
        </section>
      </div>
    </ConsoleShell>
  )
}
