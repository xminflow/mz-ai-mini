'use client'

import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import { Reveal } from './Motion'
import { photo, rooms, updates, type Room } from '../data'
import { privacy, terms } from '../legal'
import { Signals } from './HomeView'
import { Button, CTA, DemoForm, FAQ, Heading, QuickLinks, RoomCards, SiteShell, Testimonials, Title, useCopy } from './Shared'

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <header className="nb-page-intro nb-container">
    <Reveal>
      <span className="nb-eyebrow">
        <i aria-hidden="true">⠿</i>{eyebrow}</span>
      <h1>
        <Title>{title}</Title>
      </h1>{description && <p>{description}</p>}</Reveal>
  </header>
}

function CasesContent({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <>
    <PageIntro eyebrow={t('生活场景', 'Use cases')} title={t('在每一个房间\n找到它的用武之地', 'Where Weelume\nearns its keep')} description={t('一间房，一段日常。从熟悉的小事里，感受生活多出的余裕。', 'One room, one everyday story. Discover the little things that make space for living.')} />
    <section className="nb-container">
      <RoomCards basePath={basePath} />
    </section>
    <QuickLinks basePath={basePath} />
    <CTA basePath={basePath} />
  </>
}

function RoomContent({ basePath, room }: { basePath: string; room: Room }) {
  const { copy, t } = useCopy()
  return <>
    <PageIntro eyebrow={copy(room.name)} title={copy(room.title)} description={copy(room.intro)} />
    <div className="nb-container">
      <img className="nb-room-hero" src={photo(room.image)} alt={copy(room.name)} width="1400" height="850" />
      <div className="nb-room-description">
        <p>{copy(room.description)}</p>
        <dl>
          <div>
            <dt>{t('在哪里', 'Where')}</dt>
            <dd>{copy(room.name)}</dd>
          </div>
          <div>
            <dt>{t('什么时候', 'When')}</dt>
            <dd>{t('日常需要时', 'When life needs it')}</dd>
          </div>
          <div>
            <dt>{t('收获什么', 'What you get')}</dt>
            <dd>{t('更多属于你的时间', 'More time for you')}</dd>
          </div>
        </dl>
      </div>
    </div>
    <div className="nb-container nb-room-scenes">{room.scenes.map((scene, i) => <Reveal className={`nb-scene ${i % 2 ? 'nb-scene-reverse' : ''}`} key={scene.image}>
      <img src={photo(scene.image)} alt={copy(scene.title)} loading="lazy" width="1000" height="750" />
      <div>
        <span className="nb-eyebrow">0{i + 1} / {copy(room.name)}</span>
        <h2>
          <Title>{copy(scene.title)}</Title>
        </h2>
        <p>{copy(scene.body)}</p>
      </div>
    </Reveal>)}</div>
    <section className="nb-container nb-section">
      <Heading left eyebrow={['更多房间', 'More rooms']} title={['继续探索\n家的另一面', 'Another room\nAnother little help']} />
      <RoomCards basePath={basePath} items={rooms.filter(item => item.slug !== room.slug)} />
    </section>
    <QuickLinks basePath={basePath} />
    <CTA basePath={basePath} />
  </>
}

function AboutContent({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <>
    <section className="nb-about-hero">
      <img src={photo('7zvJcZFEoNeRM7azD4VctYeHHk8')} alt={t('针织机器人侧脸特写', 'Close-up of the knit-clad robot')} />
      <h1>
        <Title>{t('一个安静帮手的故事', 'The Weelume story')}</Title>
      </h1>
      <span>{t('微域生光 / 居家机器人', 'WEELUME / HOME ROBOTICS')}</span>
    </section>
    <section className="nb-section nb-container nb-about-intro">
      <Heading left eyebrow={['关于我们', 'About us']} title={['宁愿把一件事\n认真做好', 'One product\nDone right']} />
      <div>
        <p>{t('我们想设计一个能自然融入家庭的机器人。它理解一个家如何运转，默默接手那些重复的小事，让注意力回到你真正关心的人和生活。', 'We set out to design a robot that fits naturally into the home. It learns how a household runs and takes the small daily work off your hands, leaving attention for the people and moments that matter.')}</p>
        <p>{t('参考站描绘了一个跨两地工作室、14 人团队的故事：在科莫织就外衣，以行为设计打磨陪伴。这里保留这份产品理念，团队及工作室信息均作演示。', 'The reference tells the story of fourteen people across two studios: a shell knitted in Como and behavior designed around daily life. The philosophy is preserved here; team and studio details are illustrative.')}</p>
        <div className="nb-about-facts">{[['2023', '创立年份', 'Founded'], ['14', '团队成员', 'People'], ['140', '内测家庭', 'Beta homes']].map(([n, zh, en]) => <div key={n}>
          <strong>{n}</strong>
          <span>{t(zh, en)}</span>
        </div>)}</div>
      </div>
    </section>
    <section className="nb-principles nb-section">
      <div className="nb-container">
        <Heading eyebrow={['产品原则', 'Core principles']} title={['三个原则\n贯穿每个决定', 'Three principles\nEvery decision']} />
        <div className="nb-quick-grid">{[['01', '先实用，再惊艳', 'Useful before impressive', '每天真正有帮助的功能，才值得进入生活。让产品的价值，在日常使用中自然发生。', 'Features earn their place by helping every day. Useful behavior comes first; the value becomes clear through living with it.'], ['02', '先观察，再行动', 'It waits, then acts', '理解房间的节奏，在需要的时候行动。安静，是最自然的状态。', 'Observe the rhythm of the room, then act when needed. Quiet is the resting state.'], ['03', '家，始终属于你', 'The home stays the home', '感知与决策在本地进行。隐私和边界，在设计开始时就已考虑。', 'Perception and decisions happen locally. Privacy and boundaries belong in the design from the beginning.']].map(([n, zh, en, bodyZh, bodyEn]) => <Reveal className="nb-glass" key={n}>
          <span className="nb-eyebrow">P/{n}</span>
          <h3>{t(zh, en)}</h3>
          <p>{t(bodyZh, bodyEn)}</p>
        </Reveal>)}</div>
      </div>
    </section>
    <section className="nb-container nb-section">
      <Heading eyebrow={['幕后的创造者', 'The people behind it']} title={['让想法成为日常', 'The team']} description={['以下团队人物与职务为模板演示内容', 'Illustrative team profiles for this template.']} />
      <div className="nb-team-grid">{[['Elias Brunswick', '创始人', 'Founder, CEO', 'Tqh6zD7hedoY6F0tygTvJaOF35U'], ['Daniel Sato', '机器人负责人', 'Head of robotics', '9BvSPEtkD9pFd9WOAs9hZkarfA'], ['Marcus Miller', '行为与 AI 负责人', 'Head of behavior & AI', 'qERgS8RwzCF29uMNs0IqZi6dKA'], ['Anders Holt', '工业设计负责人', 'Head of industrial design', '5yLhhzdGWqIfbKXuaatpceIfays']].map(([name, zh, en, image]) => <Reveal key={name}>
        <img src={photo(image)} alt={t(`${name} 的演示肖像`, `Illustrative portrait of ${name}`)} width="450" height="600" loading="lazy" />
        <h3>{name}</h3>
        <p>{t(zh, en)}</p>
      </Reveal>)}</div>
    </section>
    <section className="nb-section nb-container">
      <Heading left eyebrow={['想法发生的地方', 'Where the work happens']} title={['在工作室里\n反复推敲每个细节', 'The lab\nEvery detail considered']} />
      <div className="nb-lab-grid">{[['kTdPeclJZi7ZYDDvtSEP6zqkfo', '在第一个零件加工之前，先画下产品的样子', 'Drawn before a single part was machined'], ['2PST26I62okWoueHV1GVacx2Mo', '每一种行为，都在进入家庭之前反复讨论', 'Every behavior discussed before it reaches a home']].map(([image, zh, en]) => <figure key={image}>
        <img src={photo(image)} alt={t(zh, en)} loading="lazy" />
        <figcaption>{t(zh, en)}</figcaption>
      </figure>)}</div>
    </section>
    <Signals />
    <CTA basePath={basePath} />
  </>
}

function UpdatesContent({ basePath }: { basePath: string }) {
  const { copy, t, locale } = useCopy()
  return <>
    <PageIntro eyebrow={t('产品更新', 'Updates')} title={t('新的进展\n细小而有意义的改变', 'What’s new\nand what changed')} description={t('产品仍在内测，让每一次改进都看得见。以下为参考站更新演示。', 'The work shows as it ships. Demonstration updates adapted from the reference site.')} />
    <section className="nb-container nb-updates-layout">
      <aside className="nb-glass">
        <h2>{t('轻轻订阅', 'Get the updates')}</h2>
        <p>{t('有了新进展，再告诉你', 'A note when something ships')}</p>
        <DemoForm kind="newsletter" />
      </aside>
      <div className="nb-updates-list">{updates.map(item => <Reveal key={item.date}>
        <article>
          <div className="nb-update-meta">
            <time dateTime={item.date}>{new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${item.date}T00:00:00Z`))}</time>
            <span className="nb-pill">{copy(item.tag)}</span>
            <span>{item.version}</span>
          </div>
          <h2>{copy(item.title)}</h2>
          <p>{copy(item.body)}</p>
        </article>
      </Reveal>)}</div>
    </section>
    <Testimonials />
    <CTA basePath={basePath} />
  </>
}

function ContactContent({ basePath, waitlist }: { basePath: string; waitlist?: boolean }) {
  const { t } = useCopy()
  return <>
    <PageIntro eyebrow={waitlist ? t('私人内测', 'Private beta') : t('打个招呼', 'Say hello')} title={waitlist ? t('让日常多一份从容\n申请你的体验名额', 'A quieter everyday\nAsk for a place') : t('每一条消息\n都值得认真回应', 'A person reads\nevery one')} description={waitlist ? t('告诉我们你家的样子，以及希望它接过的那些小事。此处仅演示申请流程。', 'Tell us a little about your home and the small things you would love a hand with. This is a demo application.') : t('从你的家、你的日常说起。我们愿意听听你的想法。', 'Tell us about your home, your daily rhythm, and what you would like a hand with.')} />
    <section className="nb-container nb-contact-layout">
      <div>{waitlist ? <>
        <img className="nb-waitlist-image" src={photo('RsmD0uXOZJYBslfUERbIV3G8gI')} alt={t('机器人推着包装箱来到家门口', 'Robot arriving at the home with a delivery box')} />
        <div className="nb-about-facts">
          <div>
            <strong>140</strong>
            <span>{t('内测家庭示例', 'Illustrative beta homes')}</span>
          </div>
          <div>
            <strong>3</strong>
            <span>{t('外观可选', 'Finishes')}</span>
          </div>
          <div>
            <strong>0</strong>
            <span>{t('当前支付', 'Payment now')}</span>
          </div>
        </div>
      </> : <>
        <Heading left eyebrow={['从一次对话开始', 'A conversation starts here']} title={['你好\n很高兴认识你', 'Hello\nGood to meet you']} description={['产品咨询、合作想法，或只是分享一种更好的生活方式', 'Product questions, a collaboration idea, or a better way to live with technology.']} />
        <div className="nb-contact-details">
          <span>{t('演示联系地址', 'Demo contact address')}</span>
          <span>hello@example.com</span>
          <p>{t('工作室示意：波士顿 / 科莫', 'Illustrative studios: Boston / Como')}</p>
          <p>{t('演示页面不发送邮件或创建支持工单', 'This page sends no email and creates no support tickets')}</p>
        </div>
        <img className="nb-contact-image" src={photo('3VIglJhUObdpgghYlY45YqNKE')} alt={t('机器人在客厅挥手', 'Robot waving in the living room')} loading="lazy" />
      </>}</div>
      <DemoForm kind={waitlist ? 'waitlist' : 'contact'} />
    </section>
    <FAQ />
    <CTA basePath={basePath} />
  </>
}

function LegalContent({ basePath, privacyPage }: { basePath: string; privacyPage: boolean }) {
  const { t, copy } = useCopy()
  const sections = privacyPage ? privacy : terms
  return <>
    <PageIntro eyebrow={t('政策说明 · 模板演示', 'Legal information · Template demo')} title={privacyPage ? t('隐私与 Cookie', 'Privacy & cookies') : t('服务条款', 'Terms of service')} description={t('更新于 2026 年 10 月 15 日 · 本说明用于模板演示', 'Updated October 15, 2026 · Information for this template demo')} />
    <div className="nb-container nb-legal-layout">
      <aside aria-label={t('文档目录', 'On this page')}>{sections.map((section, i) => <Link href={`#section-${i + 1}`} key={i}>{String(i + 1).padStart(2, '0')} / {copy(section.title)}</Link>)}</aside>
      <article>{sections.map((section, i) => <section id={`section-${i + 1}`} key={i}>
        <h2>
          <small>{String(i + 1).padStart(2, '0')}</small>{copy(section.title)}</h2>
        <p>{copy(section.body)}</p>
      </section>)}<Button href={`${basePath}/contact`}>{t('联系页面', 'Contact page')}</Button>
      </article>
    </div>
  </>
}

function MissingContent({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <>
    <PageIntro eyebrow="404" title={t('这一页\n安静得有些过头了', 'This page went quiet\nA little too quiet')} description={t('它可能去了另一个房间。回到首页，继续探索吧。', 'It may be in another room. Head home and keep exploring.')} />
    <div className="nb-center">
      <Button href={basePath}>{t('回到首页', 'Back home')}</Button>
    </div>
    <QuickLinks basePath={basePath} />
  </>
}

export type ContentKind = 'about' | 'cases' | 'updates' | 'contact' | 'waitlist' | 'privacy' | 'terms' | '404'
export function ContentView({ kind, ...props }: SiteTemplatePageProps & { kind: ContentKind }) {
  const content = kind === 'about' ? <AboutContent basePath={props.basePath} /> : kind === 'cases' ? <CasesContent basePath={props.basePath} /> : kind === 'updates' ? <UpdatesContent basePath={props.basePath} /> : kind === 'contact' || kind === 'waitlist' ? <ContactContent basePath={props.basePath} waitlist={kind === 'waitlist'} /> : kind === 'privacy' || kind === 'terms' ? <LegalContent basePath={props.basePath} privacyPage={kind === 'privacy'} /> : <MissingContent basePath={props.basePath} />
  return <SiteShell {...props}>{content}</SiteShell>
}
export function RoomView({ slug, ...props }: SiteTemplatePageProps & { slug: string }) {
  const room = rooms.find(item => item.slug === slug)
  if (!room) throw new Error(`[nubo] Unknown room: ${slug}`)
  return <SiteShell {...props}>
    <RoomContent basePath={props.basePath} room={room} />
  </SiteShell>
}
