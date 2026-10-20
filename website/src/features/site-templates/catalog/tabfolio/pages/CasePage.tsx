'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { SiteTemplatePageProps } from '../../../types'
import { Shell, t } from '../components/Shell'

const content = {
  aviera: { zh: '让金融数据更容易理解', en: 'Making financial data easier to understand', introZh: '我重新设计了金融看板的关键部分，改善交易可见性、简化导航，并帮助用户在日常工作流中更快理解财务状况。', introEn: 'I redesigned key parts of a financial dashboard to improve transaction visibility, simplify navigation, and help users understand their finances faster during everyday workflows.', image: '/templates/tabfolio/assets/aviera.png', company: 'AVIERA' },
  music: { zh: '打造音乐发现应用', en: 'Creating a music discovery app', introZh: '一个让人通过氛围、歌词和视觉线索发现下一首歌的移动体验。', introEn: 'A mobile experience that helps people find their next song through mood, lyrics, and visual cues.', image: '/templates/tabfolio/assets/lumix.png', company: 'LUMIX' },
  portfolio: { zh: '设计一个作品集系统', en: 'Designing a portfolio', introZh: '探索如何把作品、观点与个人节奏组织成一套安静而有表现力的作品集系统。', introEn: 'An exploration of turning work, perspective, and personal rhythm into a quiet but expressive portfolio system.', image: '/templates/tabfolio/assets/values.png', company: 'PERSONAL PROJECT' },
  teams: { zh: '为财务团队扩展 Aviera', en: 'Expanding Aviera for finance teams', introZh: '为不断壮大的财务团队设计审批工作流，让每次决策都有上下文。', introEn: 'Extending Aviera for growing finance teams with approval workflows that keep context close to every decision.', image: '/templates/tabfolio/assets/workflow.png', company: 'AVIERA' },
} as const

type CaseKey = keyof typeof content

const sections = [
  ['overview', '概览', 'Overview'], ['problem', '问题', 'Problem'], ['research', '研究', 'Research'], ['ideation', '构思', 'Ideation'], ['designs', '设计', 'Designs'], ['lessons', '经验', 'Lessons'],
] as const

export default function CasePage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  const pathname = usePathname() ?? ''
  const key: CaseKey = pathname.includes('music-discovery') ? 'music' : pathname.includes('portfolio-system') ? 'portfolio' : pathname.includes('expanding-aviera') ? 'teams' : 'aviera'
  const item = content[key]
  const title = t(locale, item.zh, item.en)
  return <Shell basePath={basePath} locale={locale}>
    <nav className="tf-case-nav"><Link href={basePath}>← {t(locale, '返回项目', 'Projects')}</Link>{sections.map(([id, zh, en]) => <a href={'#' + id} key={id}>{t(locale, zh, en)}</a>)}</nav>
    <article className="tf-case-content">
      <header className="tf-case-hero" id="overview"><div className="tf-case-kicker"><span>{item.company}</span><span>·</span><span>2026</span></div><h1>{title}</h1><p>{t(locale, item.introZh, item.introEn)}</p></header>
      <img className="tf-case-art" src={item.image} alt={title} />
      <div className="tf-case-meta"><span>{t(locale, '产品设计师', 'Product Designer')}</span><span>{t(locale, '2025 年 7 月', 'July 2025')}</span><span>{t(locale, '3 位设计师', '3 Designers')}</span><span>{t(locale, 'Web 应用', 'Web application')}</span></div>
      <CaseBlock locale={locale} id="overview-copy" label={t(locale, '概览', 'Overview')} title={title} text={t(locale, 'Aviera 是一个帮助小型企业团队理解支出活动和日常财务流程的金融看板概念。此次重设计通过更清晰的层级、更好的交易可见性和更有结构的布局，减少平台中的使用摩擦。', 'Aviera is a financial dashboard concept focused on helping small business teams better understand spending activity and everyday financial workflows. The redesign explored how clearer hierarchy, improved transaction visibility, and more structured layouts could reduce friction across the platform.')} />
      <section className="tf-case-block"><h3>{t(locale, '成果影响', 'The Impact')}</h3><p>{t(locale, '通过更好的层级、更整洁的间距和更明显的交易细节，日常财务流程变得更容易扫描和导航。', 'The redesign focused on improving clarity through better hierarchy, cleaner spacing, and more visible transaction details.')}</p><div className="tf-impact-grid"><Metric value="+32%" label={t(locale, '余额检查速度', 'Balance check speed')} detail="2.5 min 至 1.7 min" /><Metric value="+41%" label={t(locale, '交易清晰度', 'Transaction clarity')} detail="34% 至 48% confidence" /><Metric value="−25%" label={t(locale, '导航步骤', 'Navigation steps')} detail="4 steps 至 3 steps" /></div></section>
      <CaseBlock locale={locale} id="problem" label={t(locale, '问题', 'Problem')} title={t(locale, '理解财务活动不应该这么困难', 'Understanding financial activity felt unnecessarily difficult')} text={t(locale, '大量财务数据、薄弱的层级和密集布局，让余额、交易和操作在日常使用中变得难以理解。用户经常停下来比较余额、重新打开交易详情，并反复扫描页面。', 'The existing dashboard contained large amounts of financial data, but weak hierarchy and dense layouts made balances, transactions, and actions harder to interpret during everyday use.')} image={item.image} cards={[t(locale, '层级太弱', 'Weak hierarchy'), t(locale, '间距不一致', 'Inconsistent spacing'), t(locale, '工作流有摩擦', 'Workflow friction')]} />
      <CaseBlock locale={locale} id="research" label={t(locale, '研究', 'Research')} title={t(locale, '从数字之外寻找线索', 'Looking beyond the numbers')} text={t(locale, '我回顾了金融工作流，并访谈经常管理交易、余额和支付活动的人，重点观察他们如何扫描信息、理解上下文以及完成日常任务。', 'I reviewed financial workflows and conducted interviews with people regularly managing transactions, balances, and payment activity. The research focused on how users scanned information, interpreted context, and navigated everyday tasks.')} cards={[t(locale, '5 位用户', '5 users'), t(locale, '45 分钟访谈', '45 minute sessions'), t(locale, '3 个任务', '3 tasks')]} quote={t(locale, '大多数时候我理解这些数字，只是不知道什么最需要我的注意。', 'Most of the time, I understood the numbers — I just didn’t understand what needed my attention first.')} />
      <CaseBlock locale={locale} id="ideation" label={t(locale, '构思', 'Ideation')} title={t(locale, '探索界面的不同方向', 'Exploring interface directions')} text={t(locale, '我探索了围绕余额可见性、交易上下文和工作流清晰度的多种布局方向，测试不同的信息分组、导航和扫描方式。', 'I explored multiple layout directions focused on balance visibility, transaction context, and workflow clarity. Each concept tested different approaches to grouping information, simplifying navigation, and helping users scan important details faster.')} image={item.image} cards={[t(locale, '聚焦概览', 'Focused overview'), t(locale, '模块化布局', 'Modular layouts'), t(locale, '任务导向流程', 'Task-oriented flows')]} />
      <CaseBlock locale={locale} id="designs" label={t(locale, '设计', 'Designs')} title={t(locale, '让复杂工作流变得清晰', 'Making complex workflows feel clear')} text={t(locale, '最终方案使用更强的层级、可预测的布局和上下文反馈，让余额更容易比较、操作更容易找到、活动流更容易理解。', 'The final redesign used stronger hierarchy, predictable layouts, and contextual feedback so balances were easier to compare, actions were easier to find, and activity flows were easier to understand at a glance.')} image={item.image} cards={[t(locale, '清晰的余额层级', 'Clearer balance hierarchy'), t(locale, '有上下文的活动', 'Contextual activity'), t(locale, '简化的导航', 'Simplified navigation')]} />
      <CaseBlock locale={locale} id="lessons" label={t(locale, '经验', 'Lessons')} title={t(locale, '为清晰、信心和真实使用而设计', 'Designing for clarity, confidence, and everyday workflows')} text={t(locale, '这个项目再次证明，用户信心往往由界面清晰度塑造，而不是由领域复杂度决定。分组、间距和操作位置等小决定，会改变人们理解信息和继续前进的方式。', 'This project reinforced how strongly confidence is shaped by interface clarity rather than domain complexity. Small choices in grouping, spacing, and action placement can change how people interpret information and move forward.')} cards={[t(locale, '更清晰的层级', 'Clearer hierarchy'), t(locale, '更快的扫描', 'Faster scanning'), t(locale, '可复用的系统', 'Scalable system')]} />
      <section className="tf-case-next"><span className="tf-case-label">{t(locale, '更多项目', 'More projects')}</span><h2>{t(locale, '继续探索其他工作', 'Keep exploring the work')}</h2><Link href={basePath}>{t(locale, '返回项目列表', 'Back to projects')}</Link></section>
    </article>
  </Shell>
}

function Metric({ value, label, detail }: { value: string; label: string; detail: string }) { return <article className="tf-metric"><strong>{value}</strong><span>{label}</span><small>{detail}</small></article> }
function CaseBlock({ locale, id, label, title, text, cards, image, quote }: { locale: 'zh' | 'en'; id: string; label: string; title: string; text: string; cards?: string[]; image?: string; quote?: string }) { return <section className="tf-case-block" id={id}><span className="tf-case-label">{label}</span><h2>{title}</h2><p>{text}</p>{quote && <blockquote>“{quote}”</blockquote>}{image && <img className="tf-case-inline-art" src={image} alt="" />}{cards && <div className="tf-case-list">{cards.map((card, index) => <article key={card}><b>{String(index + 1).padStart(2, '0')}</b><h3>{card}</h3><p>{t(locale, '让内容更容易理解，帮助人们更快完成任务。', 'Make the content easier to understand and help people complete tasks faster.')}</p></article>)}</div>}</section> }
