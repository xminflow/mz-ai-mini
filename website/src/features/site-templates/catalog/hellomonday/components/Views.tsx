'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ProjectImage } from './ProjectImage'
import { articles, categories, extras, projects, services, team, values, type Project } from '../data'
import { ArrowLink, Media, MotionImage, Reveal, useCopy, useMotionPreference } from './Shared'

export function Home({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useMotionPreference()
  const words = [t('数字体验', 'Experiences'), t('数字产品', 'Products'), t('品牌设计', 'Branding')]
  useEffect(() => {
    if (paused || reduced) return
    const timer = setInterval(()=>setSlide(s=>(s+1)%3),5500)
    return ()=>clearInterval(timer)
  }, [paused, reduced])
  return <>
    <section className="hm-hero"><div className="hm-hero-art"><Media src={extras.hero} alt={t('黑白手绘人物的创意动画', 'Playful black and white character animation')} /></div><p>{t('让数字创意有一点魔法', 'A little magic in everything digital')}</p><div className="hm-hero-word"><AnimatePresence mode="wait"><motion.h1 key={slide} initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -16 }} transition={{duration:reduced?0:.35}}>{words[slide]}</motion.h1></AnimatePresence></div><div className="hm-slide-controls" aria-label={t('首屏轮播', 'Hero carousel')}>{words.map((word,i)=><button key={i} className="hm-dot" aria-label={`${t('切换到', 'Show')} ${word}`} aria-pressed={slide===i} onClick={()=>setSlide(i)} />)}<button className="hm-carousel-pause" aria-label={paused?t('继续标题轮播','Resume title carousel'):t('暂停标题轮播','Pause title carousel')} aria-pressed={paused} onClick={()=>setPaused(p=>!p)}>{paused?'▷':'Ⅱ'}</button></div><a className="hm-scroll-hint" href="#selected-work">{t('往下探索', 'Explore below')} ↓</a></section>
    <section id="selected-work" className="hm-section"><div className="hm-section-caption"><span>01 / {t('精选作品','Selected work')}</span><Link href={`${basePath}/work`}>{t('查看全部 70 个案例', 'View all 70 projects')} ↗</Link></div><ProjectGrid basePath={basePath} items={projects.filter(p=>['gemini-developer-competition','zipline','gemini','bang-and-olufsen','strava-year-in-sport-2023','netflix-kids-and-family','fingerspelling','google-kids-space-branding','aurorasolar'].includes(p.id))} /></section>
    <section className="hm-product-teaser hm-section"><div className="hm-doodle" aria-hidden="true">↑<br />to the<br />moon.</div><div><span>02 / {t('产品伙伴', 'Product partners')}</span><h2>{t('给好想法\n一枚助推火箭', 'A little rocket fuel\nfor your next idea')}</h2><p>{t('和初创团队、产品部门一起，把纸上的灵感变成真实可用的产品。保持好奇，也保持一点大胆。', 'We work alongside founders and product teams to turn sketches into products. Stay curious. Be a little bold.')}</p><ArrowLink href={`${basePath}/product`}>{t('探索产品合作', 'Explore product partnerships')}</ArrowLink></div></section>
  </>
}

export function ProjectGrid({ basePath, items }: { basePath: string; items: Project[] }) {
  const { t, copy } = useCopy()
  return <div className="hm-project-grid">{items.map((project,i)=><Reveal key={project.id} className={`hm-project hm-project-${i%3}`}><Link href={`${basePath}/work/${project.id}`} data-project-card className="hm-project-link"><ProjectImage src={i%3===0?project.landscape:project.image} alt={copy(project.name)} /><h3>{copy(project.name)}</h3></Link><div className="hm-tags">{project.categories.map(category=><Link key={category} href={`${basePath}/work?filter=${encodeURIComponent(category)}`}>{categoryLabel(category,t)}</Link>)}</div></Reveal>)}</div>
}
function categoryLabel(category: string, t: (zh:string,en:string)=>string) {
  const entry=categories.find(c=>c[0]===category)
  return entry?t(entry[1][0],entry[1][1]):category
}
export function Work({ basePath, initialFilter = 'all' }: { basePath: string; initialFilter?: string }) {
  const { t } = useCopy()
  const [filter,setFilter]=useState(initialFilter)
  const [query,setQuery]=useState('')
  const filtered=projects.filter(p=>(filter==='all'||p.categories.includes(filter))&&`${p.name[0]} ${p.name[1]}`.toLowerCase().includes(query.toLowerCase()))
  const choose=(value:string)=>{
    setFilter(value)
    const url=new URL(location.href)
    if(value==='all')url.searchParams.delete('filter'); else url.searchParams.set('filter',value)
    window.history.replaceState(null,'',url)
  }
  return <section className="hm-section hm-work"><div className="hm-work-top"><h1>{t('让想法\n变成作品', 'Ideas\nmade real')}</h1><div><p>{t('保持好奇 认真玩耍', 'Curiosity at work. Playfully serious.')}</p><label className="hm-search"><span>{t('搜索作品', 'Search projects')}</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('品牌、项目或灵感…', 'A brand, a project, an idea…')} /></label></div></div><div className="hm-filters" aria-label={t('作品分类', 'Project categories')}>{categories.map(([id,label])=><button key={id} aria-pressed={filter===id} onClick={()=>choose(id)}>{t(label[0],label[1])}</button>)}<span role="status">{filtered.length} {t('个案例', 'projects')}</span></div>{filtered.length?<ProjectGrid basePath={basePath} items={filtered} />:<div className="hm-empty"><p>{t('还没有找到这个灵感', 'No projects match this search')}</p><button className="hm-pill" onClick={()=>{setQuery('');choose('all')}}>{t('查看全部作品', 'Show all work')}</button></div>}</section>
}
export function WorkRoute({ basePath }: { basePath: string }) {
  const params=useSearchParams()
  const filter=params.get('filter')||'all'
  return <Work key={filter} basePath={basePath} initialFilter={filter} />
}

export function Services({ basePath }: { basePath: string }) {
  const { t, copy }=useCopy()
  return <><JumpLinks items={[...services.map(s=>[s.id,copy(s.title)]),['awards',t('闪光时刻','Shiny things')]]} /><section className="hm-intro hm-section hm-warm"><p className="hm-eyebrow">01 / {t('创意与技术', 'Design meets technology')}</p><h1>{t('我们擅长什么', 'What we do')}</h1><p className="hm-intro-text">{t('让想法被看见\n让产品被喜爱\n让品牌与人真正相遇', 'Ideas that invite curiosity.\nProducts people love.\nBrands that connect.')}</p></section>{services.map((service,i)=><section key={service.id} id={service.id} className="hm-service hm-section"><div className="hm-service-illustration"><Media src={extras.services[i*3]} alt={copy(service.title)} /><span>0{i+2}</span></div><div><p className="hm-eyebrow">{t('我们创造', 'We make')}</p><h2>{copy(service.title)}</h2><p className="hm-lead">{copy(service.intro)}</p><ul className="hm-capabilities">{service.items.map(item=><li key={item[1]}>{copy(item)}</li>)}</ul><ArrowLink href={`${basePath}/work?filter=${['Products','Experiences','Branding'][i]}`}>{t('看看相关作品', 'Explore related work')}</ArrowLink><div className="hm-service-projects">{projects.filter(p=>p.categories.includes(['Products','Experiences','Branding'][i])).slice(0,2).map(p=><Link key={p.id} href={`${basePath}/work/${p.id}`}><MotionImage src={p.landscape} alt={copy(p.name)} loading="lazy" /><span>{copy(p.name)} ↗</span></Link>)}</div></div></section>)}<section id="awards" className="hm-awards hm-section"><p className="hm-eyebrow">{t('参考工作室的创意足迹', 'Reference studio milestones')}</p><h2>{t('一些闪光时刻', 'A few shiny things')}</h2><p>{t('以下为 Hello Monday 参考站列出的奖项记录，用于还原信息布局，不代表微域生光获奖记录。', 'Awards listed by the Hello Monday reference website, included to demonstrate the layout. These are not Weelume awards.')}</p><div>{[['Cannes Lions','8'],['Webby Awards','14'],['D&AD','5'],['Creative Circle','48'],['Awwwards','58'],['FWA SOTD','121']].map(([name,count])=><article key={name} className="hm-glass"><span>{name}</span><strong>{count}</strong><span aria-hidden="true">✷</span></article>)}</div></section></>
}
function JumpLinks({ items }: { items: string[][] }) {
  const { t }=useCopy()
  return <nav className="hm-jump" aria-label={t('本页章节', 'On this page')}><span>{t('直接前往', 'Jump ahead')}</span><div>{items.map(([id,label])=><a key={id} href={`#${id}`}>{label} ↘</a>)}</div></nav>
}

function TeamPortrait({ person }: { person: (typeof team)[number] }) {
  const { t }=useCopy()
  const [age,setAge]=useState(0)
  const city=person.city==='New York'?t('纽约','New York'):person.city==='Copenhagen'?t('哥本哈根','Copenhagen'):t('奥胡斯','Aarhus')
  return <figure><button className="hm-team-switch" onClick={()=>setAge((age+1)%person.images.length)} aria-label={t(`切换 ${person.name} 的成长照片`, `Change ${person.name}'s portrait`)}><MotionImage src={person.images[age]} alt={t(`${person.name} 的${['现在','青少年','童年'][age]}照片`,`${person.name}: ${['present day','teenage','childhood'][age]} portrait`)} loading="lazy" /><span aria-hidden="true">↻</span></button><figcaption><strong>{person.name}</strong><span>{city}</span></figcaption></figure>
}
export function About({ basePath }: { basePath: string }) {
  const { t,copy }=useCopy()
  return <><JumpLinks items={[["studios",t('工作室','Studios')],["values",t('共同的信念','Our values')],["team",t('创意伙伴','The team')]]} /><section className="hm-intro hm-section hm-warm"><p className="hm-eyebrow">01 / {t('关于我们', 'About the studio')}</p><h1>{t('认真创造\n也认真快乐', 'Who we are')}</h1><p className="hm-intro-text">{t('我们相信\n设计可以让日常更美好\n技术可以让想象更自由\n而好的合作从人与人开始', 'Design can make everyday life better.\nTechnology can give imagination room.\nGood collaboration starts with people.')}</p></section><section id="studios" className="hm-section"><div className="hm-section-caption"><span>02 / {t('跨越时区的创意', 'Ideas across time zones')}</span><ArrowLink href={`${basePath}/contact`}>{t('与我们聊聊', 'Say hello')}</ArrowLink></div><div className="hm-studios">{[['纽约','New York'],['哥本哈根','Copenhagen'],['奥胡斯','Aarhus']].map(([zh,en],i)=><article key={en} className="hm-glass"><span className="hm-hand-icon" aria-hidden="true">{['☀','☁','✳'][i]}</span><h2>{t(zh,en)}</h2><p>{t('参考工作室的所在地', 'A reference studio location')}</p><a href={`https://www.google.com/maps/search/${encodeURIComponent(en)}`} target="_blank" rel="noopener noreferrer">{t('在地图上查看城市', 'Explore the city on maps')} ↗</a></article>)}</div></section><section id="values" className="hm-section hm-warm"><p className="hm-eyebrow">03 / {t('共同的信念', 'Our shared values')}</p><h2>{t('创意有自由\n合作有默契', 'A little code\nof good company')}</h2><div className="hm-values">{values.map((value,i)=><Reveal className="hm-glass" key={value[1]}><span>0{i+1}</span><h3>{copy(value)}</h3><p>{t(['尊重每一位伙伴，让善意成为沟通的起点。','把专业用在值得做的事上，为人和环境创造积极影响。','分享真实的想法，及时表达问题，也尊重不同的判断。','对未知保持好奇，让实验和探索成为工作的一部分。','给每个人表达的空间，认真听取不同领域的意见。','从共同目标出发，不让职位限制解决问题的方式。','遇到困难可以求助，也主动支持需要帮助的伙伴。','一起承担挑战，分享经验，也分享完成作品的快乐。'][i],['Respect every collaborator and begin conversations with kindness.','Use creative skills to make a positive difference for people and the planet.','Share honest thoughts and raise concerns while respecting different judgments.','Stay curious and make room for experiments in everyday work.','Make space for every voice and listen across disciplines.','Start from a shared goal and look beyond job titles when solving problems.','Ask for help when needed and offer support when others need it.','Face challenges together and share both knowledge and the joy of making.'][i])}</p></Reveal>)}</div></section><section id="team" className="hm-section"><p className="hm-eyebrow">04 / {t('参考站团队', 'The reference studio team')}</p><h2>{t('好作品背后的\n有趣的人', 'Good people.\nInteresting minds.')}</h2><p>{t('参考 Hello Monday 的团队展示形式与公开人物素材，正式交付时替换为你的团队。', 'A team gallery based on Hello Monday’s public reference. Replace this with your own team before delivery.')}</p><div className="hm-team">{team.map((person,i)=><TeamPortrait key={`${person.name}-${i}`} person={person} />)}</div></section></>
}

export function Stories({ basePath }: { basePath: string }) {
  const { t,copy }=useCopy()
  return <section className="hm-stories hm-section hm-warm"><div className="hm-section-caption"><span>{t('工作室手记', 'Notes from the studio')}</span><span>07 / {t('故事', 'Stories')}</span></div><h1 className="hm-stories-title">{t('一些故事\n一些新想法', 'Stories &\nnew perspectives')}</h1>{articles.map((article,i)=><Reveal className="hm-story-row" key={article.id}><Link href={`${basePath}/stories/${article.id}`}><div className="hm-story-info"><span>{copy(article.category)}</span><span>♧ {article.minutes} {t('分钟阅读', 'min read')}</span></div><div className="hm-story-heading"><h2>{copy(article.title)}</h2><span aria-hidden="true">↗</span></div><p>{t('继续阅读', 'Read the story')} <span aria-hidden="true">→</span></p>{article.gallery[0]&&<MotionImage src={article.gallery[0]} alt={copy(article.title)} className="hm-story-preview" loading="lazy" />}<span className="hm-story-number" aria-hidden="true">0{i+1}</span></Link></Reveal>)}</section>
}

export function Story({ basePath, id }: { basePath: string; id: string }) {
  const { t,copy }=useCopy()
  const index=articles.findIndex(a=>a.id===id)
  const article=articles[index]
  const next=articles[(index+1)%articles.length]
  return <article className="hm-article hm-section"><Link className="hm-back" href={`${basePath}/stories`}>← {t('所有故事', 'All stories')}</Link><p className="hm-eyebrow">{copy(article.category)} / {article.minutes} {t('分钟阅读','min read')}</p><h1>{copy(article.title)}</h1><p className="hm-reference-note">{t('根据参考主题重新撰写的模板手记', 'An original template essay inspired by the reference topic')}</p>{article.gallery[0]&&<Media className="hm-article-cover" src={article.gallery[0]} alt={copy(article.title)} />}<div className="hm-article-body">{article.paragraphs.map((paragraph,i)=><section key={i}><h2>{t(['从一个问题开始','把想法带入实践','让体验更进一步'][i],['Start with a question','Put ideas into practice','Take the experience further'][i])}</h2><p>{copy(paragraph)}</p>{article.gallery[i+1]&&<Media src={article.gallery[i+1]} alt={t(`${copy(article.title)}：参考图 ${i+2}`,`${copy(article.title)}: reference image ${i+2}`)} />}</section>)}</div><div className="hm-next"><p>{t('下一个故事', 'Up next')}</p><ArrowLink href={`${basePath}/stories/${next.id}`}>{copy(next.title)}</ArrowLink></div></article>
}

export function Product({ basePath }: { basePath: string }) {
  const { t,copy }=useCopy()
  const [quote,setQuote]=useState(0)
  const quotes=[['用小而清晰的原型，让大想法有一个可以开始的地方。','A small, clear prototype gives a big idea somewhere to begin.'],['把设计和技术放在同一张桌子上，答案往往来得更早。','Bring design and technology to the same table and find answers sooner.'],['保持好奇，也让每个决定回到真实的用户需求。','Stay curious and bring every decision back to real user needs.']]
  return <><JumpLinks items={[["collaborations",t('合作案例','Collaborations')],["perspectives",t('合作观点','Perspectives')],["ready",t('开始合作','Let’s collaborate')]]} /><section className="hm-product-hero hm-section"><div className="hm-product-visual"><Media src={extras.productHero} alt={t('创意团队合作过程的影像', 'A creative team collaborating')} /><div><span>{t('产品创意加速器', 'Ideas need a little rocket fuel')}</span><h1>{t('为产品团队\n点燃下一步', 'A booster for\nproduct teams')}</h1></div></div><div className="hm-product-intro"><p>{t('从草图到原型\n从第一位用户到下一次成长', 'From the first sketch to a prototype.\nFrom the first user to the next chapter.')}</p><p>{t('研究、构思、设计与开发一起推进。围绕真实的问题，找到值得投入的方向，让创意既有想象力，也有落地的路径。', 'Research, concept, design and engineering move together. Start with a real problem, explore promising directions and give imagination a practical path.')}</p></div></section><section id="collaborations" className="hm-section"><p className="hm-eyebrow">01 / {t('参考合作案例', 'Reference collaborations')}</p><h2>{t('一起走得更远', 'Better, together')}</h2><div className="hm-partners">{[['Google','google-kids-space-branding'],['Strava','strava-year-in-sport-2023'],['YouTube','youtube-kids-01'],['T-Mobile','nomo'],['OPPO','oppo'],['NASA','nasa-genelab']].map(([name,id])=>{const p=projects.find(p=>p.id===id)!;return <Link key={id} className="hm-glass" href={`${basePath}/work/${id}`}><strong>{name}<span aria-hidden="true">↗</span></strong><p>{copy(p.name)}</p></Link>})}</div><ArrowLink href={`${basePath}/work?filter=Products`}>{t('查看数字产品案例', 'View product projects')}</ArrowLink></section><section id="perspectives" className="hm-section hm-quotes"><span className="hm-quote-mark" aria-hidden="true">“</span><p className="hm-eyebrow">{t('微域生光 · 合作理念', 'Weelume · Our approach')}</p><AnimatePresence mode="wait"><motion.blockquote key={quote} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{t(quotes[quote][0],quotes[quote][1])}</motion.blockquote></AnimatePresence><div className="hm-quote-controls"><button aria-label={t('上一条观点','Previous perspective')} onClick={()=>setQuote((quote+2)%3)}>←</button><span>{quote+1} / 3</span><button aria-label={t('下一条观点','Next perspective')} onClick={()=>setQuote((quote+1)%3)}>→</button></div></section><section id="ready" className="hm-section hm-ready"><span className="hm-hand-icon" aria-hidden="true">✳</span><h2>{t('下一站\n一起创造', 'What could we\nmake together?')}</h2><ArrowLink href={`${basePath}/contact`}>{t('告诉我们你的想法','Tell us your idea')}</ArrowLink></section></>
}

export function Contact({ kind = 'project' }: { kind?: 'project'|'career'|'internship' }) {
  const { t }=useCopy()
  const [sent,setSent]=useState(false)
  const form=useRef<HTMLFormElement>(null)
  const submit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault()
    if(!event.currentTarget.reportValidity())return
    setSent(true)
    if(process.env.NODE_ENV==='development')console.debug('[hellomonday/contact] 本地校验完成，未发送请求、未保存个人信息', {kind})
  }
  const title=kind==='career'?t('一起做些\n值得骄傲的事','Make something\nworth caring about'):kind==='internship'?t('让好奇心\n成为你的起点','Let curiosity\nbe your starting point'):t('你好\n新的可能','Hello,\nnew possibilities')
  return <section className="hm-contact hm-section"><div className="hm-contact-intro"><p className="hm-eyebrow">{kind==='project'?t('从一个想法开始','Start with an idea'):t('成为创意伙伴','Join the creative journey')}</p><h1>{title}</h1><p>{kind==='project'?t('无论是一个完整的计划，还是刚刚萌芽的灵感，我们都愿意认真听听。','A detailed plan or the beginning of an idea: every good conversation starts somewhere.'):t('带上你的作品、问题和热情。我们关心你如何思考，也关心你想创造什么。','Bring your work, questions and enthusiasm. We care about how you think and what you want to make.')}</p><div className="hm-contact-sketch" aria-hidden="true">hello!<br /><span>☺ & ☺</span></div><div className="hm-demo-note">{t('模板演示：表单只做浏览器本地校验，不会发送或保存信息。','Template demo: this form validates locally in your browser. It does not send or save information.')}</div></div><div><form ref={form} className="hm-form hm-glass" onSubmit={submit} onChange={()=>setSent(false)}><label>{t('怎么称呼你','Your name')}<input name="name" required autoComplete="name" maxLength={80} placeholder={t('你的名字','Your name')} /></label><label>{t('联系邮箱','Email address')}<input name="email" type="email" required autoComplete="email" maxLength={160} placeholder="you@example.com" /></label><label>{kind==='project'?t('聊些什么','What is on your mind?'):t('感兴趣的方向','Your area of interest')}<select name="service" required defaultValue=""><option disabled value="">{t('请选择一个方向','Select an area')}</option>{services.map(s=><option key={s.id} value={s.id}>{t(s.title[0],s.title[1])}</option>)}<option value="hello">{t('打个招呼','Just saying hello')}</option></select></label>{kind!=='project'&&<label>{t('作品集链接','Portfolio URL')}<input name="portfolio" type="url" required placeholder="https://" /></label>}<label>{t('多说一点','Tell us a little more')}<textarea name="message" required minLength={10} maxLength={4000} rows={5} placeholder={t('你的目标、想法与期待…','Your goals, ideas and ambitions…')} /></label><label className="hm-consent"><input name="consent" type="checkbox" required /><span>{t('我了解这只是本地演示，信息不会发送或保存。','I understand this is a local demo and my information will not be sent or saved.')}</span></label><button className="hm-submit" type="submit">{t('校验这份想法','Validate this idea')} <span aria-hidden="true">↗</span></button><p className="hm-form-status" role="status">{sent?t('本地校验通过。信息尚未发送或保存。','Local validation passed. Your information has not been sent or saved.'):t('带 * 的要求由浏览器检查，所有字段均需填写。','All fields are required and checked by your browser.')}</p></form><div className="hm-faq"><h2>{t('你可能也想知道','A few useful answers')}</h2>{[[t('可以从一个早期想法开始吗？','Can we start with an early idea?'),t('可以。先梳理目标、用户与约束，再通过小规模原型判断方向。','Yes. Clarify goals, users and constraints, then test the direction with a small prototype.')],[t('可以只合作一个阶段吗？','Can we work on a single phase?'),t('可以围绕研究、品牌、原型或产品设计明确阶段边界与交付标准。','A phase can focus on research, branding, prototyping or product design with clear scope and deliverables.')],[t('填写后会有人联系我吗？','Will someone contact me after I submit?'),t('这是模板演示，没有接入发送服务，不会收到表单回访。正式项目需要配置真实服务。','This is a template demo without a sending service. There will be no form follow-up. A live project needs an actual service integration.')]].map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></div></section>
}

export function Policy({ kind }: { kind:'privacy'|'terms' }) {
  const { t }=useCopy()
  return <article className="hm-policy hm-section"><p className="hm-eyebrow">{t('模板使用说明','About this template')}</p><h1>{kind==='privacy'?t('隐私说明','Privacy information'):t('使用条款','Terms of use')}</h1><p>{t('更新日期：2026 年 10 月 19 日','Updated: 19 October 2026')}</p>{(kind==='privacy'?[
    [t('表单只在本地校验','Local form validation'),t('联系、求职和实习表单没有发送接口，也不会写入浏览器存储。输入仅保留在当前页面内存中，离开或刷新页面会清空。请勿在演示表单中填写敏感信息。','Contact, career and internship forms have no sending endpoint and do not write to browser storage. Inputs remain in the current page memory and clear when you leave or reload. Avoid sensitive information in this demo.')],
    [t('本地素材与外部链接','Local media and external links'),t('模板的图片、视频与字体由当前站点托管。地图、参考站和备案链接是外部页面，主动点击后会离开本站。','Images, video and fonts are served by this site. Maps, reference sources and filing information link to external websites when you choose to open them.')],
    [t('宿主网站与正式部署','Host website and live deployment'),t('模板未添加分析与广告追踪脚本。宿主网站和部署服务可能有独立日志策略。正式上线前，应根据真实业务、服务与数据处理方式完善隐私政策。','This template adds no analytics or advertising trackers. The host website and hosting service may apply separate logging policies. Complete the policy for actual services and data practices before launch.')],
  ]:[
    [t('内部预览范围','Internal preview'),t('本模板参考 Hello Monday 的页面结构和交互形式，采用微域生光品牌与双语原创说明，用于内部演示与评估。案例、客户、人物和奖项不代表微域生光真实业绩。','This internal template references Hello Monday’s site structure and interaction patterns with Weelume branding and original bilingual commentary. Reference projects, clients, people and awards do not represent Weelume credentials.')],
    [t('素材来源与许可','Asset sources and licensing'),t('参考影像的权利归 Hello Monday、其客户或其他权利人所有；未发现允许商用再分发的公开许可。对外交付或发布前，必须取得授权或替换为已获许可的素材。来源记录见模板素材清单。','Reference media belongs to Hello Monday, its clients or other rights holders. No public commercial redistribution licence has been identified. Obtain permission or replace the media before external delivery or publication. See the template asset manifest for sources.')],
    [t('字体与演示功能','Fonts and demo features'),t('MiSans 和 Poppins 复用项目本地字体与已有许可记录。表单仅做本地校验，不构成真实业务提交。模板默认未上架，正式启用需要核对品牌内容、业务接口与政策文本。','MiSans and Poppins reuse the project’s local fonts and existing licence records. Forms validate locally and are not real submissions. The template is unlisted by default; review branding, services and policy text before enabling it.')],
  ]).map(([title,paragraph])=><section key={title}><h2>{title}</h2><p>{paragraph}</p></section>)}</article>
}
