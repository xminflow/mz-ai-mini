'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { categories, projects } from '../data'
import { projectNotes } from '../project-notes'
import { ArrowLink, Media, MotionImage, useCopy } from './Shared'

const interpretation = {
  Products: ['让一个想法成为可以参与的产品，需要把目标、使用情境与反馈连成一条路径。这个案例提供了观察产品表达与交互节奏的入口。', 'Making an idea into a usable product means connecting goals, contexts and feedback. This case offers a way to explore product communication and interaction pacing.'],
  Experiences: ['把抽象的概念变成可感知的体验，让视觉、叙事与互动共同表达主题。这个案例的影像展示了数字媒介如何为一个想法建立入口。', 'Give an abstract concept a tangible form through visuals, narrative and interaction. The reference media shows how a digital experience can invite people into an idea.'],
  Branding: ['品牌不止是一个标志。色彩、字体、角色、影像与动态一起构成可持续生长的表达方式，帮助人们在不同场景中认出同一个品牌。', 'A brand extends beyond its mark. Color, type, characters, imagery and movement form an evolving language that stays recognizable across contexts.'],
  Platform: ['把丰富的内容与功能组织成清晰的路径，让不同需求的访问者都能找到自己的起点。视觉系统与信息结构需要共同服务于使用体验。', 'Organize content and features into clear paths so people with different needs can find a starting point. Visual systems and information structure work together to support usability.'],
  'E-commerce': ['从发现、了解，到比较与选择，购物体验需要把品牌的个性与清晰的决策信息放在一起，让每一步都有依据。', 'From discovery and understanding to comparison and choice, commerce brings brand character together with clear information for each decision.'],
} satisfies Record<string, readonly [string,string]>

export function ProjectView({ basePath, id }: { basePath: string; id: string }) {
  const { t,copy }=useCopy()
  const index=projects.findIndex(p=>p.id===id)
  const project=projects[index]
  const next=projects[(index+1)%projects.length]
  const dialog=useRef<HTMLDialogElement>(null)
  const trigger=useRef<HTMLButtonElement|null>(null)
  const [image,setImage]=useState(0)
  const gallery=[...new Set([project.landscape,...project.gallery])]
  const paragraph=interpretation[project.categories[0] as keyof typeof interpretation]||interpretation.Experiences
  const close=()=>{dialog.current?.close();trigger.current?.focus()}
  return <article className="hm-case hm-section"><Link className="hm-back" href={`${basePath}/work`}>← {t('全部作品','All work')}</Link><header className="hm-case-heading"><div><p className="hm-eyebrow">{t('参考项目解读','Reference project notes')} / {String(index+1).padStart(2,'0')}</p><h1>{copy(project.name)}</h1></div><dl><div><dt>{t('领域','Disciplines')}</dt><dd>{project.categories.map(category=>{const label=categories.find(c=>c[0]===category);return <Link key={category} href={`${basePath}/work?filter=${encodeURIComponent(category)}`}>{label?t(label[1][0],label[1][1]):category}</Link>})}</dd></div><div><dt>{t('案例来源','Case reference')}</dt><dd>Hello Monday</dd></div></dl></header><Media className="hm-case-cover" src={project.landscape} alt={copy(project.name)} /><div className="hm-case-summary"><h2>{t('让想法被感知','Giving an idea a tangible form')}</h2><div><p className="hm-lead">{copy(projectNotes[project.id])}</p><p>{t(paragraph[0],paragraph[1])}</p><p className="hm-reference-note">{t('这是公开参考项目的设计解读与版式演示，原作品和客户关系属于原工作室，不代表微域生光交付项目。','These are design notes and a layout demonstration based on a public reference project. The original work and client relationship belong to the reference studio.')}</p><a href={`https://www.hellomonday.com${project.path}`} target="_blank" rel="noopener noreferrer">{t('查看原始案例来源','View the original case reference')} ↗</a></div></div><div className="hm-case-gallery">{gallery.map((src,i)=><button key={src} onClick={event=>{trigger.current=event.currentTarget;setImage(i);dialog.current?.showModal()}} aria-label={t(`放大案例影像 ${i+1}`,`Enlarge case image ${i+1}`)}><MotionImage src={src} alt={t(`${copy(project.name)}：案例影像 ${i+1}`,`${copy(project.name)}: case image ${i+1}`)} loading="lazy" /><span aria-hidden="true">↗</span></button>)}</div><dialog ref={dialog} className="hm-lightbox" aria-label={t('案例影像预览','Case image preview')} onCancel={event=>{event.preventDefault();close()}} onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();setImage((image+1)%gallery.length)}if(event.key==='ArrowLeft'){event.preventDefault();setImage((image+gallery.length-1)%gallery.length)}}}><button className="hm-lightbox-close" onClick={close} aria-label={t('关闭影像预览','Close image preview')}>×</button><MotionImage src={gallery[image]} alt={copy(project.name)} /><div><button onClick={()=>setImage((image+gallery.length-1)%gallery.length)} aria-label={t('上一张','Previous image')}>←</button><span aria-live="polite">{image+1} / {gallery.length}</span><button onClick={()=>setImage((image+1)%gallery.length)} aria-label={t('下一张','Next image')}>→</button></div></dialog><div className="hm-next"><p>{t('下一个作品','Next project')}</p><ArrowLink href={`${basePath}/work/${next.id}`}>{copy(next.name)}</ArrowLink></div></article>
}
