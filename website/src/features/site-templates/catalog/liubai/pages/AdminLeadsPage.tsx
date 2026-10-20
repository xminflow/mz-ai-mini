import type { SiteTemplatePageProps } from '../../../types'
import { LEADS, LEAD_STATUS_LABEL } from '../data'
import type { LeadStatus } from '../data'
import { AdminPanel, AdminShell, Badge, ToolbarChips } from '../components/AdminShell'
import '../theme.css'

/** 状态分布摘要。只报需要动作的那几档，「已关闭」不进摘要——它不需要任何人再看一眼。 */
const SUMMARY_STATUSES: LeadStatus[] = ['new', 'contacted', 'quoted']

export default function AdminLeadsPage({ basePath }: SiteTemplatePageProps) {
  const counts = SUMMARY_STATUSES.map((status) => ({
    status,
    label: LEAD_STATUS_LABEL[status].label,
    tone: LEAD_STATUS_LABEL[status].tone,
    count: LEADS.filter((lead) => lead.status === status).length,
  }))

  return (
    <AdminShell
      basePath={basePath}
      activeSlug="leads"
      title="客户咨询"
      subtitle={`共 ${LEADS.length} 条 · ${counts[0].count} 条待联系`}
      toolbar={<ToolbarChips items={['全部', '待联系', '已沟通', '已报价']} />}
    >
      <div className="space-y-4">
        <section className="grid grid-cols-3 gap-3">
          {counts.map((item) => (
            <div
              key={item.status}
              className="rounded-xl border border-[var(--tpl-rule)] bg-[var(--tpl-card)] p-4"
            >
              <div className="flex items-center gap-2">
                <Badge tone={item.tone}>{item.label}</Badge>
              </div>
              <p className="tpl-num mt-2.5 text-[24px] font-medium leading-none">{item.count}</p>
            </div>
          ))}
        </section>

        {/* 线索用卡片列表而不是表格：每条都带一段自由文本的备注，
            塞进表格单元格里要么被截断、要么把行高撑得参差不齐。 */}
        <AdminPanel
          title="咨询记录"
          action={
            <span className="text-[11.5px] text-[var(--tpl-ink-faint)]">按提交时间倒序</span>
          }
          bodyClassName="divide-y divide-[var(--tpl-rule)]"
        >
          {LEADS.map((lead) => {
            const status = LEAD_STATUS_LABEL[lead.status]
            return (
              <article key={lead.id} className="px-4 py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="tpl-num text-[11.5px] text-[var(--tpl-ink-faint)]">
                    {lead.id}
                  </span>
                  <span className="text-[13.5px] font-medium">{lead.name}</span>
                  <span className="tpl-num text-[12.5px] text-[var(--tpl-ink-dim)]">
                    {lead.phone}
                  </span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <span className="tpl-num ml-auto text-[11.5px] text-[var(--tpl-ink-faint)]">
                    {lead.submittedAt}
                  </span>
                </div>

                <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-[12.5px]">
                  {[
                    { label: '公司', value: lead.company },
                    { label: '类型', value: lead.category },
                    { label: '预算', value: lead.budget },
                    { label: '来源', value: lead.source },
                  ].map((field) => (
                    <div key={field.label} className="flex gap-1.5">
                      <dt className="text-[var(--tpl-ink-faint)]">{field.label}</dt>
                      <dd className="text-[var(--tpl-ink-dim)]">{field.value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-3 rounded-lg bg-[var(--tpl-paper-admin)] px-3 py-2 text-[12.5px] leading-relaxed text-[var(--tpl-ink-dim)]">
                  {lead.note}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {['标记已联系', '转为项目', '分配给…', '关闭'].map((action) => (
                    <span
                      key={action}
                      className="rounded-lg border border-[var(--tpl-rule-strong)] px-2.5 py-1 text-[12px] text-[var(--tpl-ink-dim)]"
                    >
                      {action}
                    </span>
                  ))}
                </div>
              </article>
            )
          })}
        </AdminPanel>
      </div>
    </AdminShell>
  )
}
