'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
const ProjectLink = motion.create(Link)
import type { SiteTemplatePageProps } from '../../../types'
import { projects, copy } from '../data'
import { Button, PageIntro, Shell, t } from '../components/Shell'
export default function HomePage({ basePath, locale = 'zh' }: SiteTemplatePageProps) { return <Shell basePath={basePath} locale={locale}><PageIntro locale={locale} title="Aiko Tanaka"><p>{t(locale, '专注清晰系统、流畅交互与有意义细节的产品与网页设计师。', 'Product & web designer focused on clean systems, smooth interactions, and meaningful details.')}</p><div className="tf-button-row"><Button href="#projects">{t(locale, '查看最新作品', 'My latest work')}</Button><Button href="mailto:hello@aiko.com" secondary>{t(locale, '聊聊合作', "Let's chat")}</Button></div></PageIntro><section id="projects" className="tf-project-grid">{projects.map((project, index) => <ProjectLink key={project.slug} className="tf-project-card" href={`${basePath}/${project.slug}`} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: index * .08 }}><div className="tf-project-image"><img src={project.image} alt={copy(project.title, locale)} /></div><div className="tf-project-meta"><strong>{copy(project.title, locale)}</strong><span>{copy(project.client, locale)} · {project.year}</span></div></ProjectLink>)}</section></Shell> }
