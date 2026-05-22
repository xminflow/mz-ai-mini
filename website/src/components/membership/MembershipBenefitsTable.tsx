type BenefitRow = {
  name: string
  description: string
  delivery: string
  quota: string
}

const ROWS: BenefitRow[] = [
  {
    name: '01 · 百万粉博主运营方法论精炼',
    description: '微域生光运营方法论正卷 + 番外卷，覆盖定位、选题、文案、爆款节奏、增长与变现。',
    delivery: '在线长文 + 工具卡片，持续更新',
    quota: '会员期内不限次阅读',
  },
  {
    name: '02 · 博主账号拆解',
    description: '提交博主主页 URL，由运营按百万粉运营手册方法论框架完成 14 章深度拆解（矩阵布局 / 增长曲线 / 内容方法论）；开通后可访问历史报告库查阅同类拆解案例。',
    delivery: 'HTML 全景报告，3-5 个工作日交付',
    quota: '每月最多 10 份定制报告 · 含历史报告库访问',
  },
  {
    name: '03 · 赛道深度分析',
    description: '提交赛道关键词，由运营按百万粉运营手册方法论框架输出 6 份专业报告（执行摘要 / 行业研判 / 竞争格局 / 商业模式 / AI 落地 / 操盘手册）；开通后可访问历史报告库查阅同类赛道案例。',
    delivery: 'HTML 报告组合，5-7 个工作日交付',
    quota: '每月最多 10 份定制报告 · 含历史报告库访问',
  },
  {
    name: '04 · 本地素材采集智能体',
    description: '桌面端工具，粘贴链接自动采集视频、关键帧、转录，并对内容做钩子 / 结构 / 节奏拆解诊断。',
    delivery: '桌面端应用，联系获取下载渠道',
    quota: '会员期内无限次本地使用',
  },
]

export function MembershipBenefitsTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface/40 backdrop-blur sm:rounded-[22px]">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline">
            <th className="px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              服务名称
            </th>
            <th className="px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              内容描述
            </th>
            <th className="px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              交付形式
            </th>
            <th className="px-5 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
              会员权益
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, idx) => (
            <tr
              key={row.name}
              className={idx === ROWS.length - 1 ? '' : 'border-b border-hairline/60'}
            >
              <td className="px-5 py-5 align-top">
                <span className="font-serif-zh text-[14px] font-semibold text-ink sm:text-[14.5px]">
                  {row.name}
                </span>
              </td>
              <td className="px-5 py-5 align-top text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                {row.description}
              </td>
              <td className="px-5 py-5 align-top text-[13px] leading-[1.85] text-muted sm:text-[13.5px]">
                {row.delivery}
              </td>
              <td className="px-5 py-5 align-top text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                {row.quota}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
