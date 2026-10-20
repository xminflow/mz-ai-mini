import type { SiteTemplatePageProps } from '../../../types'
import { WORK_RECORDS, WORK_STATUS_LABEL, workPhoto } from '../data'
import { AdminPanel, AdminShell, Badge, ToolbarChips } from '../components/AdminShell'
import '../theme.css'

export default function AdminWorksPage({ basePath }: SiteTemplatePageProps) {
  const published = WORK_RECORDS.filter((record) => record.status === 'published').length
  const drafts = WORK_RECORDS.filter((record) => record.status === 'draft').length

  return (
    <AdminShell
      basePath={basePath}
      activeSlug="works"
      title="作品管理"
      subtitle={`共  个作品 · ${published} 个已发布 · ${drafts} 个草稿`}
      toolbar={
        <div className="flex items-center gap-2">
          <ToolbarChips items={['全部', '已发布', '草稿', '已下架']} />
          <button
            type="button"
            className="shrink-0 rounded-lg bg-[var(--tpl-ink)] px-3 py-1.5 text-[12.5px] text-[var(--tpl-ink-invert)]"
          >
            新建作品
          </button>
        </div>
      }
    >
      <AdminPanel
        title="作品列表"
        action={
          <span className="text-[11.5px] text-[var(--tpl-ink-faint)]">
            拖拽行可调整官网陈列顺序
          </span>
        }
        bodyClassName="p-0"
      >
        {/* 表格在窄屏一定会溢出，让它自己横向滚动，不要把整页撑宽 */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--tpl-rule)] text-[11.5px] text-[var(--tpl-ink-faint)]">
                <th className="px-4 py-2.5 font-normal">作品</th>
                <th className="px-4 py-2.5 font-normal">类型</th>
                <th className="px-4 py-2.5 font-normal">状态</th>
                <th className="px-4 py-2.5 text-right font-normal">图片</th>
                <th className="px-4 py-2.5 text-right font-normal">浏览</th>
                <th className="px-4 py-2.5 font-normal">首页精选</th>
                <th className="px-4 py-2.5 text-right font-normal">更新</th>
                <th className="px-4 py-2.5 text-right font-normal">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--tpl-rule)]">
              {WORK_RECORDS.map((record) => {
                const status = WORK_STATUS_LABEL[record.status]

                return (
                  <tr key={record.workId} className="hover:bg-[var(--tpl-paper-admin)]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        {/* 缩略图用官网同一张照片，客户能对上「后台这一条就是官网那一屏」 */}
                        <img
                          src={workPhoto(record.workId)}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-9 w-12 shrink-0 rounded-md bg-[var(--tpl-paper-2)] object-cover"
                        />
                        <span className="text-[13px]">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[12.5px] text-[var(--tpl-ink-dim)]">
                      {record.category}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </td>
                    <td className="tpl-num px-4 py-2.5 text-right text-[12.5px] text-[var(--tpl-ink-dim)]">
                      {record.photos}
                    </td>
                    <td className="tpl-num px-4 py-2.5 text-right text-[12.5px] text-[var(--tpl-ink-dim)]">
                      {record.views.toLocaleString('en-US')}
                    </td>
                    <td className="px-4 py-2.5">
                      {/* 开关做成视觉态：模板展示界面形态，不实现交互逻辑 */}
                      <span
                        className={`inline-flex h-[18px] w-[32px] items-center rounded-full p-0.5 ${
                          record.featured
                            ? 'justify-end bg-[var(--tpl-accent)]'
                            : 'justify-start bg-[rgb(18_18_24/0.12)]'
                        }`}
                        role="img"
                        aria-label={record.featured ? '已加入首页精选' : '未加入首页精选'}
                      >
                        <span className="block size-[14px] rounded-full bg-white" />
                      </span>
                    </td>
                    <td className="tpl-num px-4 py-2.5 text-right text-[12px] text-[var(--tpl-ink-faint)]">
                      {record.updatedAt}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="text-[12.5px] text-[var(--tpl-accent)]">编辑</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <p className="mt-3 text-[11.5px] text-[var(--tpl-ink-faint)]">
        已下架的作品仍保留全部图片与文案，随时可以重新发布。
      </p>
    </AdminShell>
  )
}
