'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { values } from '../data'
import { Button, PageIntro, Shell, t } from '../components/Shell'

const interests = [
  ['AI 工具', 'AI tools', 'interest-ai.jpeg'], ['极简界面', 'Minimal interfaces', 'interest-minimal.jpeg'], ['街头摄影', 'Street photography', 'interest-street.jpeg'],
  ['设计系统', 'Design systems', 'interest-systems.jpeg'], ['抹茶', 'Matcha', 'interest-matcha.jpeg'], ['长途散步', 'Long walks', 'interest-walks.jpeg'],
  ['抹茶甜点', 'Matcha desserts', 'interest-desserts.jpeg'], ['咖啡馆速写', 'Sketching in coffee shops', 'interest-sketch.jpeg'],
  ['东京咖啡馆', 'Tokyo cafés', 'interest-cafes.jpeg'], ['氛围音乐', 'Ambient music', 'interest-ambient.jpeg'], ['室内设计', 'Interior design', 'interest-interior.jpeg'],
] as const
const books = ['book-1.jpeg', 'book-2.jpeg', 'book-3.jpeg', 'book-4.png', 'book-5.png']

export default function AboutPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  return (
    <Shell basePath={basePath} locale={locale}>
      <PageIntro locale={locale} title="Aiko Tanaka">
        <p>{t(locale, '专注清晰系统、流畅交互与有意义细节的产品与网页设计师。', 'Product & web designer focused on clean systems, smooth interactions, and meaningful details.')}</p>
        <div className="tf-button-row">
          <Button href={basePath}>{t(locale, '查看最新作品', 'My latest work')}</Button>
          <Button href="mailto:hello@aiko.com" secondary>{t(locale, '聊聊合作', "Let's chat")}</Button>
        </div>
      </PageIntro>

      <section id="about" className="tf-section tf-about-hero">
        <div>
          <div className="tf-about-media">
            <img className="tf-about-photo" src="/templates/tabfolio/assets/about-photo-source.jpeg" alt={t(locale, '在东京购物', 'Shopping in Tokyo')} loading="eager" decoding="async" />
            <span className="tf-about-dots" aria-hidden="true"><i className="is-active" /><i /><i /><i /></span>
          </div>
          <span className="tf-about-caption">{t(locale, '在东京购物', 'Shopping in Tokyo')}</span>
        </div>
        <div className="tf-about-copy">
          <h2><span>{t(locale, '你好，我是 Aiko。', 'Hi, I am Aiko.')}</span><span className="tf-about-title-muted">{t(locale, '专注清晰与真实使用场景的产品设计师', 'Product Designer focused on clarity and real-world use')}</span></h2>
          <p>{t(locale, '我在东京工作，为需要简单、可靠的团队打造网页与数字产品。大部分工作来自 SaaS 工具和内部平台，在这些地方，清晰比装饰更重要。', 'I’m based in Tokyo, working on web and digital products that need to be both simple and reliable. Most of my work lives in SaaS tools and internal platforms, where clarity matters more than decoration.')}</p>
          <p>{t(locale, '我最初设计消费类应用，很快转向更复杂的系统：仪表盘、工作流，以及团队每天使用的工具。这段经历塑造了我的思考方式：先建立结构，再考虑视觉。', 'I started my career designing consumer apps, but quickly moved into more complex systems—dashboards, workflows, and tools used daily by teams. That shift shaped how I think: structure first, visuals second.')}</p>
          <p>{t(locale, '我关心让事情变得易于理解：减少摩擦、移除噪音，帮助用户无需过度思考界面就能继续前进。', 'I care about making things understandable. Reducing friction, removing noise, and helping users move forward without thinking too much about the interface itself.')}</p>
          <p>{t(locale, '工作之外，我会探索视觉想法、摄影和一些小型个人项目，让自己更自由地实验。', 'Outside of work, I spend time exploring visual ideas, photography, and small side projects that let me experiment more freely.')}</p>
          <Button href="mailto:hello@aiko.com" secondary>{t(locale, '预约通话', 'Book a call')}</Button>
        </div>
      </section>

      <section className="tf-section">
        <h2>{t(locale, '我最近在关注什么', "What I'm into right now")}</h2>
        <div className="tf-pill-grid">{interests.map(([zh, en, image]) => <span className="tf-pill" key={en}><img src={'/templates/tabfolio/assets/' + image} alt="" />{t(locale, zh, en)}</span>)}</div>
      </section>

      <section className="tf-section">
        <h2>{t(locale, '藏在作品背后的价值观', 'The values behind my work')}</h2>
        <div className="tf-value-grid">{values.map(([zh, en, zht, ent]) => <article className="tf-value-card" key={en}><h3>{t(locale, zh, en)}</h3><p>{t(locale, zht, ent)}</p></article>)}</div>
      </section>

      <section className="tf-section">
        <h2>{t(locale, '我会反复翻看的书', 'Books I keep coming back to')}</h2>
        <div className="tf-books">{books.map((book, index) => <img key={book} src={`/templates/tabfolio/assets/${book}`} alt={t(locale, `书籍 ${index + 1}`, `Book ${index + 1}`)} />)}</div>
      </section>
    </Shell>
  )
}
