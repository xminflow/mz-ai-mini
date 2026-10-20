import type { SiteTemplatePageProps } from '../../../types'
import { SITE_SETTINGS } from '../data'
import { AdminPanel, AdminShell } from '../components/AdminShell'
import '../theme.css'

export default function AdminSettingsPage({ basePath }: SiteTemplatePageProps) {
  return (
    <AdminShell
      basePath={basePath}
      activeSlug="settings"
      title="站点设置"
      subtitle="改动保存后约 1 分钟同步到官网"
      toolbar={
        <button
          type="button"
          className="shrink-0 rounded-lg bg-[var(--tpl-ink)] px-3 py-1.5 text-[12.5px] text-[var(--tpl-ink-invert)]"
        >
          保存改动
        </button>
      }
    >
      {/* 设置项做成只读的视觉态：模板展示的是界面形态，不实现表单逻辑。
          两列排布，每组一个面板——四组挤成一列会让页面变得很长而没有信息增量。 */}
      <div className="grid gap-4 xl:grid-cols-2">
        {SITE_SETTINGS.map((group) => (
          <AdminPanel
            key={group.group}
            title={group.group}
            bodyClassName="divide-y divide-[var(--tpl-rule)]"
          >
            {group.items.map((item) => (
              <div key={item.label} className="px-4 py-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="text-[12.5px] text-[var(--tpl-ink-dim)]">{item.label}</span>
                  <span className="text-[13px]">{item.value}</span>
                </div>
                <p className="mt-1.5 text-[11.5px] text-[var(--tpl-ink-faint)]">{item.hint}</p>
              </div>
            ))}
          </AdminPanel>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-[var(--tpl-crit-soft)] bg-[var(--tpl-crit-soft)] px-4 py-3.5">
        <p className="text-[12.5px] font-medium text-[var(--tpl-crit)]">危险操作</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--tpl-ink-dim)]">
          关闭站点将立即下线全部页面，访客会看到一个维护中的提示页。已发布的内容不会被删除。
        </p>
        <span className="mt-3 inline-flex rounded-lg border border-[var(--tpl-crit)] px-3 py-1.5 text-[12px] text-[var(--tpl-crit)]">
          关闭站点
        </span>
      </div>
    </AdminShell>
  )
}
