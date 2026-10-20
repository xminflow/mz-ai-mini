'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { Button, PageIntro, Shell, t } from '../components/Shell'

const jobs = [
  { role: ['产品设计师', 'Product Designer'], company: 'Apple', icon: 'apple.png', date: ['2023.05 — 至今', 'May 2023 - now'], city: ['多伦多', 'Toronto'], text: ['负责 50,000+ 员工使用的内部工具重设计，提升效率并减少日常工作流摩擦。与工程和产品团队协作，建立可扩展的设计系统并简化复杂流程。', 'Led redesign of internal tools used by 50,000+ employees, improving efficiency and reducing friction across daily workflows. Collaborated with engineering and product teams to define scalable design systems and streamline complex processes.'] },
  { role: ['产品设计师', 'Product Designer'], company: 'Amazon', icon: 'amazon.png', date: ['2022.05 — 2022.08', 'May 2022 – Aug 2022'], city: ['纽约', 'New York'], text: ['支持高吞吐物流工具设计，聚焦运营场景中的可用性与清晰度。通过研究洞察和原型提升任务完成速度并减少用户错误。', 'Supported design of internal logistics tools, focusing on usability and clarity in high-volume operational environments. Delivered research insights and prototypes that improved task completion speed and reduced user errors.'] },
  { role: ['产品设计实习生', 'Product Design intern'], company: 'Perplexity', icon: 'perplexity.png', date: ['2021.01 — 2022.04', 'Jan 2021 – Apr 2022'], city: ['远程', 'Remote'], text: ['为 AI 搜索设计核心产品体验，在速度、清晰度与可用性之间取得平衡。与创始团队紧密合作，根据用户反馈快速迭代产品方向。', 'Designed core product experiences for AI-driven search, balancing speed, clarity, and usability. Worked closely with founders to shape early product direction and iterate quickly based on user feedback.'] },
] as const

const tools = [
  ['Framer', 'framer.png', 'Web design, templates'], ['Claude', 'claude.png', 'Ideation, prototyping'], ['Miro', 'miro.jpg', 'Brainstorming, workshops'],
  ['Figma', 'figma.png', 'UI Design'], ['Perplexity', 'perplexity-tool.png', 'Search'], ['Craft', 'craft.png', 'Writing'],
] as const
const skills = ['产品设计', '用户研究', '交互设计', '设计系统', '原型设计', '用户流程', '可用性测试', '视觉设计', '信息架构']
const skillsEn = ['Product design', 'UX research', 'Interaction design', 'Design systems', 'Prototyping', 'User flows', 'Usability testing', 'Visual design', 'Information architecture']

export default function ResumePage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  return (
    <Shell basePath={basePath} locale={locale}>
      <PageIntro locale={locale} title="Aiko Tanaka">
        <p>{t(locale, '专注清晰系统、流畅交互与有意义细节的产品与网页设计师。', 'Product & web designer focused on clean systems, smooth interactions, and meaningful details.')}</p>
        <div className="tf-button-row"><Button href={basePath}>{t(locale, '查看最新作品', 'My latest work')}</Button><Button href="mailto:hello@aiko.com" secondary>{t(locale, '聊聊合作', "Let's chat")}</Button></div>
      </PageIntro>

      <section className="tf-section tf-resume-experience">
        {jobs.map(job => <article className="tf-resume-job" key={job.company}><img className="tf-resume-job-logo" src={`/templates/tabfolio/assets/${job.icon}`} alt="" /><div className="tf-resume-job-body"><h2>{t(locale, job.role[0], job.role[1])}<span className="tf-resume-at"> @ </span>{job.company}</h2><div className="tf-resume-job-meta"><span>{t(locale, job.date[0], job.date[1])}</span><i aria-hidden="true">·</i><span>{t(locale, job.city[0], job.city[1])}</span></div><p>{t(locale, job.text[0], job.text[1])}</p></div></article>)}
      </section>

      <section className="tf-section"><h2>{t(locale, '支撑我工作的工具', 'Tools powering my work')}</h2><div className="tf-tools-grid">{tools.map(([name, icon, description]) => <article className="tf-tool-card" key={name}><img src={`/templates/tabfolio/assets/${icon}`} alt="" /><div><strong>{name}</strong><span>{description}</span></div></article>)}</div></section>
      <section className="tf-section"><h2>{t(locale, '技能', 'Skills')}</h2><div className="tf-skills-grid">{skills.map((skill, index) => <span key={skill}>{locale === 'en' ? skillsEn[index] : skill}</span>)}</div></section>
      <section className="tf-section tf-awards"><h2>{t(locale, '奖项', 'Awards')}</h2><article><h3>{t(locale, 'Apple Design Award · 入围', 'Apple Design Award - finalist')}</h3><p>Apple · 2023</p></article><article><h3>{t(locale, 'Product Hunt · 当日产品第一名', 'Product Hunt - #1 product of the day')}</h3><p>Product Hunt · 2021</p></article></section>
      <section className="tf-section tf-education"><h2>{t(locale, '教育经历', 'Education')}</h2><article><h3>{t(locale, '交互设计学士', 'Bachelor’s in Interaction Design')}</h3><p>{t(locale, '2017 — 2021 · 东京大学', '2017 – 2021 · University of Tokyo')}</p></article></section>
    </Shell>
  )
}

