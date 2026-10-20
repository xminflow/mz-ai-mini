'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { asset } from '../data'
import { useCopy } from './Locale'

const people = [
  { name: ['玛吉·约翰逊', 'Maggie Johnson'], company: 'Oasis Organic Inc.', image: 'DpVLrc4ydDENH7Z3XC0cKzA6Y8' },
  { name: ['克里斯·弗里德利', 'Chris Friedkly'], company: 'Supermarket Villanova', image: 'yH9xkXhZMdMzsKt4c6ybgHCFhsI' },
  { name: ['盖尔·哈里', 'Gael Harry'], company: 'New York Finest Fruits', image: '5JOZsibBgQ896ZHozxgNAzUBVR4' },
]

export function CustomersCard({ compact = false }: { compact?: boolean }) {
  const { t, locale } = useCopy()
  return <div className={`gv-customers gv-glass ${compact ? 'gv-compact' : ''}`}><div className="gv-visual-top"><strong>{t('客户', 'Customers')}</strong><small>{t('按最新排序', 'Sort by newest')} ⌄</small></div>
    {people.map((person, i) => <div className={`gv-person ${i === 0 ? 'gv-person-active' : ''}`} key={person.company}><img src={asset(person.image)} alt="" width="36" height="36" /><div><strong>{person.name[locale === 'en' ? 1 : 0]}</strong><small>{person.company}</small></div><span aria-hidden="true">{i === 0 ? '☆ ···' : '↗'}</span></div>)}<small className="gv-all-customers">{t('全部客户', 'All customers')} ⊕</small>
  </div>
}

export function ChartCard() {
  const { t } = useCopy()
  const reduced = useReducedMotion()
  return <div className="gv-chart gv-glass"><div className="gv-visual-top"><small>{t('日均专注', 'Daily average')}</small><small><em>+30m</em> {t('本周', 'this week')}</small></div><strong className="gv-chart-value">{t('2 小时 20 分', '2h 20m')}</strong>
    <div className="gv-bars" aria-label={t('一周工作时长示意图', 'Illustrative weekly activity chart')}>{[42, 84, 68, 91, 70, 59, 54].map((height, i) => <div className="gv-bar-column" key={i}><div className="gv-bar-track"><motion.div className="gv-bar" initial={reduced ? false : { height: 0 }} whileInView={{ height: `${height}%` }} viewport={{ once: true }} transition={{ duration: reduced ? 0 : 0.9, delay: i * 0.07 }} /></div><small>{t(['一', '二', '三', '四', '五', '六', '日'][i], ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i])}</small></div>)}</div>
  </div>
}

export function WorkflowCard() {
  const { t } = useCopy()
  return <div className="gv-workflow gv-glass"><div className="gv-visual-top"><strong>{t('自动化工作流', 'Workflow automation')}</strong><span className="gv-status-dot" /></div>{[[t('收到新的项目需求', 'New project request'), '↙'], [t('自动分配负责人', 'Assign an owner'), '⇢'], [t('同步团队并创建任务', 'Notify team & create task'), '✓']].map(([label, icon], i) => <div className="gv-workflow-step" key={label}><span>{icon}</span><div><small>0{i + 1}</small><strong>{label}</strong></div><span aria-hidden="true">↗</span></div>)}<small>{t('工作流已准备就绪 · 示意', 'Your workflow is ready · Demo')}</small></div>
}

export function TeamCard() {
  const { t, locale } = useCopy()
  return <div className="gv-team-visual gv-glass"><div className="gv-visual-top"><strong>{t('你的团队', 'Your team')}</strong><span>+ {t('邀请', 'Invite')}</span></div>{people.map((person, i) => <div className="gv-person" key={person.company}><img src={asset(person.image)} alt="" width="36" height="36" /><div><strong>{person.name[locale === 'en' ? 1 : 0]}</strong><small>{t(['产品设计', '工程研发', '项目运营'][i], ['Product design', 'Engineering', 'Operations'][i])}</small></div><span className="gv-status-dot" /></div>)}<div className="gv-team-progress"><span>{t('项目进度', 'Project progress')}</span><strong>82%</strong><i /></div></div>
}

export function Dashboard() {
  const { t } = useCopy()
  return <div className="gv-dashboard gv-glass"><div className="gv-dashboard-head"><span><img src="/logo/weiyu-logo-web-dark.svg" alt="" width="20" height="20" />{t('微域生光', 'Weelume')}</span><small>{t('搜索项目、成员或任务', 'Search projects, people, or tasks')} ⌕</small><span className="gv-dashboard-profile">{t('我的工作空间', 'My workspace')} ⌄</span></div><div className="gv-dashboard-body"><aside><strong>{t('工作空间', 'Workspace')}</strong>{[t('概览', 'Overview'), t('消息', 'Messages'), t('项目', 'Projects'), t('成员', 'Members'), t('设置', 'Settings')].map((label, i) => <span key={label}>{['◫', '◌', '▦', '♧', '⚙'][i]}　{label}</span>)}</aside><div className="gv-board"><div className="gv-board-title"><h3>{t('应用设计', 'App design')}</h3><span>{t('邀请成员', 'Invite team')} ↗</span></div><p>{t('从想法到落地，让每个环节清晰有序', 'Bring every part of the project into focus')}</p><div className="gv-board-columns">{[t('待开始', 'To do'), t('进行中', 'In progress'), t('已完成', 'Done')].map((label, i) => <div key={label}><h4><span className={`gv-board-dot gv-dot-${i}`} />{label} <small>{[4, 3, 6][i]}</small></h4>{[0, 1].map(j => <div className="gv-task" key={j}><small className="gv-tag">{t(['产品', '设计', '增长'][i], ['Product', 'Design', 'Growth'][i])}</small><strong>{t([['规划下一阶段路线', '梳理用户反馈'], ['完善移动端体验', '打磨产品交互'], ['完成团队调研', '发布设计规范']][i][j], [['Plan the next milestone', 'Review user feedback'], ['Refine mobile experience', 'Polish interactions'], ['Complete team research', 'Publish design system']][i][j])}</strong><div className="gv-task-progress" /><small>◷ {t('6 月', 'Jun')} {12 + i * 3 + j} <span>◌ {i + j + 2}</span></small></div>)}</div>)}</div></div></div></div>
}
