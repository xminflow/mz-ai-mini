'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { Reveal } from '../../../shared/Reveal'
import { cases } from '../cases'
import { asset, team, type Copy } from '../data'
import { useCopy } from './Locale'
import { Button, CaseCards, ContactSection, Heading, Partners, Rating, SiteShell, Title } from './Shared'

const stats: { value: string; label: Copy; description: Copy }[] = [
  { value: '100+', label: ['支持项目', 'Projects supported'], description: ['帮助团队更快地从想法走向执行', 'Helping teams move from idea to execution faster'] },
  { value: '98%', label: ['客户留存率', 'Client retention rate'], description: ['让长期合作建立在真实改进之上', 'Long-term partnerships built on real results'] },
  { value: '99%', label: ['客户满意度', 'Client satisfaction'], description: ['用持续反馈打磨每次交付', 'Consistently high ratings across industries'] },
  { value: '50+', label: ['支持工具集成', 'Integrations supported'], description: ['连接团队熟悉的工具与平台', 'Connect with your favorite tools and platforms'] },
]

function AboutContent() {
  const { t, copy } = useCopy()
  return <><header className="gv-page-header gv-container"><Reveal><span className="gv-eyebrow">{t('关于微域生光', 'ABOUT WEELUME')}</span><h1><Title>{t('陪伴初创团队\n更聪明地成长', 'We empower startups to\nscale smarter and faster')}</Title></h1><p>{t('我们是一支由战略顾问与工程师组成的团队。共同的目标，是帮助有想法的创业者充满信心地向前。', 'We are a team of strategists and engineers driven by one goal — helping ambitious startups to grow with confidence.')}</p><Rating /></Reveal></header>
    <section className="gv-container gv-about-gallery" aria-label={t('团队协作空间', 'Collaborative team spaces')}><Reveal><img src={asset('WmptpjOQ7AAV1kkdaX6Ql6ry33M')} alt={t('明亮的团队协作办公空间', 'A bright collaborative workspace')} width="1000" height="750" /></Reveal><div><Reveal><img src={asset('ryPJs4WSeoVoKS8oNI5ey7QWZIY')} alt={t('团队交流与讨论', 'Team conversation and collaboration')} width="600" height="357" /></Reveal><Reveal><img src={asset('2PHM8ecHJSZH6E3oZSABvo2AOw')} alt={t('共同构思下一步计划', 'Planning the next milestone together')} width="600" height="400" /></Reveal></div></section>
    <section className="gv-section gv-container"><div className="gv-mission"><Heading left title={['我们的使命', 'Our mission']} /><p>{t('为初创企业与成长型业务提供合适的工具、洞察和支持，让团队更聪明地扩展、更敏捷地行动，建立经得起时间的成功。', 'Empower startups and growing businesses with the tools, insights, and support they need to scale smarter, move faster, and build lasting success.')}</p></div><div className="gv-stats">{stats.map(stat => <Reveal className="gv-stat gv-glass" key={stat.value}><strong>{stat.value}</strong><h3>{copy(stat.label)}</h3><p>{copy(stat.description)}</p></Reveal>)}</div><p className="gv-demo-caption">{t('以上为模板演示指标', 'Illustrative template metrics')}</p><Partners /></section>
    <section className="gv-section gv-container" id="team"><Heading title={['认识我们的团队', 'Meet the team']} description={['将行业经验与实践能力放在一起，为每个成长阶段提供清晰方向。', 'Our team combines deep industry knowledge with hands-on experience to help startups grow smarter and faster.']} /><div className="gv-team-grid">{team.map((person, i) => <Reveal key={person.image} delay={i * 0.07}><article className="gv-team-card gv-glass"><img src={asset(person.image)} alt={copy(person.name)} width="400" height="500" loading="lazy" /><h3>{copy(person.name)}</h3><p>{copy(person.role)}</p></article></Reveal>)}</div></section><ContactSection /></>
}

export function AboutView(props: SiteTemplatePageProps) {
  return <SiteShell {...props}><AboutContent /></SiteShell>
}

function CaseIndexContent({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <><header className="gv-page-header gv-container"><Reveal><span className="gv-eyebrow">{t('客户案例', 'CASE STUDIES')}</span><h1><Title>{t('每一段增长\n都有值得分享的故事', 'Success stories from\nfast-growing startups')}</Title></h1><p>{t('探索团队如何克服挑战、建立高效协作，并在清晰的方向中走向下一阶段。', 'Explore how Weelume has helped startups and growing businesses overcome challenges, scale faster, and build high-performing teams.')}</p></Reveal></header><section className="gv-container gv-case-index" aria-label={t('全部六篇案例', 'All six case studies')}><CaseCards basePath={basePath} /></section></>
}

export function CasesView(props: SiteTemplatePageProps) {
  return <SiteShell {...props}><CaseIndexContent basePath={props.basePath} /></SiteShell>
}

function CaseContent({ basePath, slug }: { basePath: string; slug: string }) {
  const { copy, t } = useCopy()
  const item = cases.find(candidate => candidate.slug === slug)
  if (!item) throw new Error(`[grovia] Case is not registered: ${slug}`)
  return <><header className="gv-case-header gv-container"><LinkBack basePath={basePath} /><Reveal><div className="gv-case-hero-image"><img src={asset(item.cover)} alt={t(`${item.name} 项目封面`, `${item.name} project cover`)} width="1440" height="810" fetchPriority="high" /><span>{item.year}</span></div><div className="gv-case-summary gv-glass"><div><h1>{item.name}</h1><p>{copy(item.summary)}</p></div><div className="gv-author"><img src={asset(item.avatar)} alt="" width="56" height="56" /><strong>{copy(item.author)}</strong><small>{copy(item.role)}</small></div></div></Reveal></header>
    <article className="gv-article gv-container" aria-label={t(`${item.name} 案例正文`, `${item.name} case study`)}><div className="gv-article-content">{item.body.map((block, i) => block.kind === 'heading' ? <h2 key={i}>{copy(block.copy)}</h2> : <p key={i}>{copy(block.copy)}</p>)}<p className="gv-demo-caption">{t('本文为参考站案例的模板演示内容，不代表微域生光的实际项目或业绩。', 'Adapted reference-site content for template demonstration; not a claim about Weelume projects or results.')}</p></div><div className="gv-article-gallery">{item.gallery.map((image, index) => <Reveal key={image}><img src={asset(image)} alt={t(`${item.name} 项目视觉 ${index + 1}`, `${item.name} project visual ${index + 1}`)} width="1200" height="800" loading="lazy" /></Reveal>)}</div></article>
    <section className="gv-section gv-container"><Heading title={['探索更多增长故事', 'More insights to explore']} description={['发现更多协作方法与业务洞察，为下一步行动找到灵感。', 'Discover additional case studies, tips, and strategies to help your business grow and innovate faster.']} /><CaseCards basePath={basePath} items={cases.filter(candidate => candidate.slug !== slug).slice(0, 2)} /></section></>
}

function LinkBack({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <div className="gv-back"><Button href={`${basePath}/case-studies`} outline>{t('← 全部案例', '← All case studies')}</Button></div>
}

export function CaseView(props: SiteTemplatePageProps & { slug: string }) {
  return <SiteShell {...props}><CaseContent basePath={props.basePath} slug={props.slug} /></SiteShell>
}

function DesignSystemContent({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  const sections: { title: Copy; description: Copy }[] = [
    { title: ['形状与表面', 'Shape and surface'], description: ['输入框圆角 12px，卡片 24px，大区块 32px，按钮采用胶囊形。玻璃卡片统一使用半透明渐变、背景模糊、高光边框和柔和阴影。', 'Inputs use a 12px radius, cards 24px, bands 32px and buttons a pill shape. Glass panels share translucent gradients, backdrop blur, highlighted borders and soft shadows.'] },
    { title: ['容器与布局', 'Container and layout'], description: ['标准容器最大宽度 1120px。PC、iPad、H5 检查视口分别为 1440×1000、834×1180、390×844，补测 320px；手机单列，平板按内容双列。', 'The content container is capped at 1120px. Review at 1440×1000, 834×1180 and 390×844, plus 320px. Phone layouts stack; tablet grids adapt to the content.'] },
    { title: ['页面模式', 'Section patterns'], description: ['首页依次呈现首屏、工作看板、三步流程、功能、集成、定价、案例、评价、FAQ 与联系。子页复用导航、标题、内容容器和页脚。', 'Home follows the hero, workspace, process, features, integrations, pricing, cases, reviews, FAQ and contact patterns. Subpages share navigation, headings, containers and footer.'] },
    { title: ['深色通栏', 'Full width bands'], description: ['定价与联系区使用本地背景图、深色遮罩与半透明面板。正文保持高对比度，手机缩小横向内边距并将内容堆叠。', 'Pricing and contact use local image backgrounds, dark overlays and translucent panels. Keep text readable and stack content with smaller gutters on phones.'] },
    { title: ['动效', 'Motion'], description: ['入场、悬浮、数据柱、菜单、标签与 FAQ 使用 Framer Motion。系统开启减少动态效果后，取消漂浮、位移与循环动画。', 'Framer Motion handles reveals, floating panels, chart bars, menus, tabs and FAQs. Reduced-motion preferences disable floating, transforms and repeated animations.'] },
    { title: ['素材与品牌', 'Assets and brand'], description: ['参考站图片转换为本地 WebP，来源记录在 sources.json。导航、页脚和浮动入口统一使用微域生光 Logo。中文 MiSans、英文 Poppins 复用项目本地字体。', 'Reference images are stored locally as WebP with provenance in sources.json. Navigation, footer and market links use Weelume assets. MiSans and Poppins are served locally.'] },
    { title: ['组件与交互', 'Components and interactions'], description: ['复用按钮、标题、案例卡片、联系区、表单与导航。功能标签支持方向键；菜单支持 Escape；演示表单只执行本地校验并明确提示状态。', 'Reuse buttons, headings, case cards, contact blocks, forms and navigation. Tabs support arrow keys; menus support Escape. Demo forms validate locally and report their status explicitly.'] },
  ]
  return <><header className="gv-page-header gv-container"><span className="gv-eyebrow">WEELUME / GROVIA</span><h1>{t('设计系统', 'Design system')}</h1><p>{t('将颜色、排版、组件与响应式规则集中管理，让每个新页面延续一致的体验。', 'A shared inventory of colors, typography, components and responsive rules for a consistent experience.')}</p></header><div className="gv-container gv-design-system"><section id="colors"><Heading left eyebrow={['01 / 色彩', '01 / COLORS']} title={['温暖底色与清晰层次', 'Color guide']} /><div className="gv-color-grid">{[['gv-swatch-bg', '#F4F2EE', t('暖灰背景', 'Warm background')], ['gv-swatch-panel', '#F0ECE6', t('次级表面', 'Inset surface')], ['gv-swatch-ink', '#1A1A1A', t('主文字', 'Primary text')], ['gv-swatch-yellow', '#FEF7AF', t('黄色强调', 'Yellow accent')], ['gv-swatch-pink', '#F7A49E', t('珊瑚粉', 'Coral pink')], ['gv-swatch-blue', '#84E6F6', t('天空蓝', 'Sky blue')]].map(([className, hex, label]) => <div className="gv-glass gv-swatch" key={hex}><i className={className} /><strong>{label}</strong><small>{hex}</small></div>)}</div></section><section id="typography"><Heading left eyebrow={['02 / 排版', '02 / TYPOGRAPHY']} title={['为双语阅读调整比例', 'Typography guide']} /><div className="gv-type-demo gv-glass"><span className="gv-type-display">{t('让增长更有方向', 'Make room for growth')}</span><span className="gv-type-heading">MiSans / Poppins</span><p>{t('正文 16–17px，行高 1.8。首屏 28–44px，章节 24–36px，文章 26–36px。中文展示标题按语义分行，行末省略标点。', 'Body: 16–17px / 1.8. Hero: 28–44px. Sections: 24–36px. Articles: 26–36px. Use real 400/700 Chinese weights and 400/600/700 Latin weights.')}</p></div></section>{sections.map((section, i) => <section id={`system-${i + 3}`} key={section.title[1]}><Heading left eyebrow={[`0${i + 3} / 规范`, `0${i + 3} / GUIDELINES`]} title={section.title} description={section.description} /></section>)}<div className="gv-design-buttons gv-glass"><Button href={`${basePath}#pricing`}>{t('主要操作', 'Primary action')}</Button><Button href={`${basePath}#feature`} outline>{t('次要操作', 'Secondary action')}</Button><Button>{t('下载应用', 'Download app')}</Button></div></div></>
}

export function DesignSystemView(props: SiteTemplatePageProps) {
  return <SiteShell {...props}><DesignSystemContent basePath={props.basePath} /></SiteShell>
}

