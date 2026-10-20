'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useId, useRef, useState } from 'react'
import type { TemplateLocale } from '../../../types'
import { articles, categoryLabels, experiences, formatDate, gallery, offers, photos, pick, rooms, t, type Article, type Copy, type Experience, type Room } from '../data'
import { Button, Reveal } from './Shell'

export function RoomCard({ room, basePath, locale }: { room: Room; basePath: string; locale: TemplateLocale }) {
  return <Link className="nr-room-card nr-glass" href={`${basePath}/room/${room.slug}`}><div className="nr-card-image"><img src={photos(`/room/${room.slug}`, 1)[0]} alt={pick(locale, room.name)} loading="lazy" /></div><div className="nr-card-copy"><div className="nr-card-meta"><span>{pick(locale, categoryLabels[room.kind])}</span><span>{room.size} m² · {t(locale, `${room.guests} 人`, `${room.guests} guests`)}</span></div><h3>{pick(locale, room.name)}</h3><p className="nr-price"><span>{t(locale, '每晚起', 'From')}</span><strong>€{room.price.toLocaleString('en-US')}</strong><span>{t(locale, '/ 晚', '/ night')}</span></p></div></Link>
}

export function RoomCatalog({ basePath, locale }: { basePath: string; locale: TemplateLocale }) {
  const [category, setCategory] = useState('all')
  const items = rooms.filter(room => category === 'all' || room.kind === category)
  return <><div className="nr-filters" role="group" aria-label={t(locale, '按房型筛选', 'Filter rooms')}>{['all', 'rooms', 'suites', 'villas'].map(key => <button type="button" key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>{pick(locale, categoryLabels[key])}</button>)}</div><p className="nr-sr-only" role="status">{t(locale, `显示 ${items.length} 种房型`, `Showing ${items.length} room types`)}</p><div className="nr-room-grid" data-room-results>{items.map(room => <Reveal key={room.slug}><RoomCard room={room} basePath={basePath} locale={locale} /></Reveal>)}</div></>
}

export function ExperienceCard({ experience, basePath, locale }: { experience: Experience; basePath: string; locale: TemplateLocale }) {
  return <Link className="nr-experience-card nr-glass" href={`${basePath}/experiences/${experience.slug}`}><div className="nr-card-image"><img src={photos(`/experiences/${experience.slug}`, 1)[0]} alt={pick(locale, experience.name)} loading="lazy" /></div><div className="nr-card-copy"><p className="nr-eyebrow">{pick(locale, categoryLabels[experience.category])}</p><h3>{pick(locale, experience.name)}</h3><div className="nr-card-meta"><span>{pick(locale, experience.duration)}</span><span>{pick(locale, experience.price)}</span></div></div></Link>
}

export function JournalCard({ article, basePath, locale, featured = false }: { article: Article; basePath: string; locale: TemplateLocale; featured?: boolean }) {
  return <Link className={`nr-journal-card nr-glass${featured ? ' is-featured' : ''}`} href={`${basePath}/journal/${article.slug}`}><div className="nr-card-image"><img src={photos(`/journal/${article.slug}`, 1)[0]} alt={pick(locale, article.name)} loading="lazy" /></div><div className="nr-card-copy"><div className="nr-card-meta"><span>{pick(locale, categoryLabels[article.category])}</span>{featured && <time dateTime={article.date}>{formatDate(article.date, locale)}</time>}</div><h3>{pick(locale, article.name)}</h3>{featured && <p className="nr-muted">{pick(locale, article.intro)}</p>}<p className="nr-eyebrow">{t(locale, `${article.minutes} 分钟阅读`, `${article.minutes} minute read`)}</p></div></Link>
}

export function JournalCatalog({ basePath, locale }: { basePath: string; locale: TemplateLocale }) {
  const [category, setCategory] = useState('all')
  const items = articles.filter(article => category === 'all' || article.category === category)
  return <><div className="nr-filters" role="group" aria-label={t(locale, '日志分类', 'Journal categories')}>{['all', 'stories', 'travel', 'table', 'wellness'].map(key => <button type="button" key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>{pick(locale, categoryLabels[key])}</button>)}</div><p className="nr-sr-only" role="status">{t(locale, `${items.length} 篇日志`, `${items.length} stories`)}</p><div className="nr-journal-grid" data-journal-results>{items.map(article => <Reveal key={article.slug}><JournalCard article={article} basePath={basePath} locale={locale} /></Reveal>)}</div></>
}

export function FAQ({ items, locale }: { items: { question: Copy; answer: Copy }[]; locale: TemplateLocale }) {
  const [active, setActive] = useState<number | null>(null)
  const id = useId()
  return <div className="nr-faq">{items.map((item, index) => <div className="nr-faq-item" key={item.question[1]}><h3><button id={`${id}-button-${index}`} type="button" aria-expanded={active === index} aria-controls={`${id}-answer-${index}`} onClick={() => setActive(value => value === index ? null : index)}><span>{pick(locale, item.question)}</span><span aria-hidden="true">{active === index ? '−' : '+'}</span></button></h3><AnimatePresence initial={false}>{active === index && <motion.div id={`${id}-answer-${index}`} role="region" aria-labelledby={`${id}-button-${index}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }}><p>{pick(locale, item.answer)}</p></motion.div>}</AnimatePresence></div>)}</div>
}

export function PhotoGallery({ images, locale, title, day = false }: { images: string[]; locale: TemplateLocale; title: string; day?: boolean }) {
  const [active, setActive] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const headingId = useId()
  const caption = (index: number) => day ? `${gallery[index].time} · ${pick(locale, gallery[index].title)}` : t(locale, `${title} · 照片 ${index + 1}`, `${title} · photo ${index + 1}`)
  const open = (index: number) => { setLightboxIndex(index); dialog.current?.showModal() }
  const move = (direction: number) => setLightboxIndex(index => (index + direction + images.length) % images.length)
  return <div className={`nr-gallery${day ? ' nr-day-gallery' : ''}`}>
    {day ? <><div className="nr-day-times" role="group" aria-label={t(locale, '选择一天中的时刻', 'Choose a time of day')}>{gallery.map((item, index) => <button key={item.time} type="button" aria-pressed={active === index} onClick={() => setActive(index)}><span>{item.time}</span><small>{pick(locale, item.title)}</small></button>)}</div><button className="nr-gallery-stage" type="button" onClick={() => open(active)} aria-label={t(locale, '放大当前照片', 'Enlarge current photo')}><img src={images[active]} alt={caption(active)} loading="lazy" /><span className="nr-image-caption"><span>{caption(active)}<small>{pick(locale, gallery[active].caption)}</small></span></span></button><div className="nr-gallery-control"><button type="button" aria-label={t(locale, '上一个时刻', 'Previous time')} onClick={() => setActive(index => (index - 1 + images.length) % images.length)}>←</button><span aria-live="polite">{String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span><button type="button" aria-label={t(locale, '下一个时刻', 'Next time')} onClick={() => setActive(index => (index + 1) % images.length)}>→</button></div></> : <div className="nr-photo-grid">{images.map((src, index) => <button key={src} type="button" onClick={() => open(index)} aria-label={t(locale, `放大照片 ${index + 1}`, `Enlarge photo ${index + 1}`)}><img src={src} alt={caption(index)} loading="lazy" /></button>)}</div>}
    <dialog ref={dialog} className="nr-lightbox" aria-labelledby={headingId} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close() }} onKeyDown={event => { if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1) } if (event.key === 'ArrowRight') { event.preventDefault(); move(1) } }}><div className="nr-lightbox-inner"><button type="button" autoFocus className="nr-lightbox-close" aria-label={t(locale, '关闭照片', 'Close photo')} onClick={() => dialog.current?.close()}>×</button><img src={images[lightboxIndex]} alt={caption(lightboxIndex)} /><div className="nr-lightbox-caption"><button type="button" onClick={() => move(-1)} aria-label={t(locale, '上一张照片', 'Previous photo')}>←</button><p id={headingId} aria-live="polite">{caption(lightboxIndex)}<small>{lightboxIndex + 1} / {images.length}</small></p><button type="button" onClick={() => move(1)} aria-label={t(locale, '下一张照片', 'Next photo')}>→</button></div></div></dialog>
  </div>
}

export function ExperienceShowcase({ basePath, locale }: { basePath: string; locale: TemplateLocale }) {
  const [active, setActive] = useState(0)
  const item = experiences[active]
  return <div className="nr-experience-showcase"><div className="nr-experience-image"><img src={photos(`/experiences/${item.slug}`, 1)[0]} alt={pick(locale, item.name)} loading="lazy" /></div><div className="nr-experience-info"><div className="nr-experience-tabs" role="group" aria-label={t(locale, '切换体验', 'Choose an experience')}>{experiences.slice(0, 4).map((experience, index) => <button key={experience.slug} type="button" aria-pressed={active === index} onClick={() => setActive(index)}><small>0{index + 1}</small>{pick(locale, experience.name)}</button>)}</div><div className="nr-experience-detail" aria-live="polite"><p className="nr-eyebrow">{pick(locale, item.duration)} · {pick(locale, item.price)}</p><h3>{pick(locale, item.name)}</h3><p className="nr-muted">{pick(locale, item.intro)}</p><Button href={`${basePath}/experiences/${item.slug}`} secondary>{t(locale, '了解这段体验', 'Explore this experience')}</Button></div></div></div>
}

export function OfferShowcase({ basePath, locale }: { basePath: string; locale: TemplateLocale }) {
  const [active, setActive] = useState(0)
  return <div className="nr-offer-showcase"><img src={photos(`/offers/${offers[active].slug}`, 1)[0]} alt={pick(locale, offers[active].name)} loading="lazy" /><div>{offers.map((offer, index) => <section className={`nr-offer-item${active === index ? ' is-active' : ''}`} key={offer.slug}><button type="button" aria-expanded={active === index} aria-controls={`nr-offer-${offer.slug}`} onClick={() => setActive(index)}><span><small>{pick(locale, offer.label)}</small><span>{pick(locale, offer.name)}</span></span><span aria-hidden="true">{active === index ? '−' : '+'}</span></button>{active === index && <div id={`nr-offer-${offer.slug}`}><p>{pick(locale, offer.intro)}</p><p className="nr-eyebrow">{t(locale, '有效至', 'Until')} {formatDate(offer.end, locale)}</p><Link className="nr-text-link" href={`${basePath}/offers/${offer.slug}`}>{t(locale, '查看入住礼遇', 'View this invitation')}</Link></div>}</section>)}</div></div>
}

const quotes: { text: Copy; name: Copy }[] = [
  { text: ['原本只计划住三晚，最后把返程改了两次。我们带走的，不止是照片，还有湖边那份安静。', 'We planned a short visit, then kept finding reasons to stay. The calm of the lake came home with us.'], name: ['M. 与 L. · 双人旅行', 'M. & L. · A stay for two'] },
  { text: ['在码头吃早餐，慢慢乘船，再去做水疗。第一次觉得，一天不必被安排得满满当当。', 'Breakfast by the jetty, a gentle crossing, then the spa. It was lovely to leave space in the day.'], name: ['A. K. · 湖畔假期', 'A. K. · A lakeside escape'] },
  { text: ['孩子们回家后一直念叨那次船程。对我们来说，一家人能够真正慢下来，已经很珍贵。', 'The children are still talking about the boat. We loved having time to be together without rushing.'], name: ['H. 一家 · 家庭假期', 'The H. family · Time together'] },
]

export function Testimonials({ locale }: { locale: TemplateLocale }) {
  const [active, setActive] = useState(0)
  return <div className="nr-testimonials"><p className="nr-eyebrow">{t(locale, '06 · 他们的湖畔时光', '06 · Moments remembered')}</p><blockquote aria-live="polite"><p>“{pick(locale, quotes[active].text)}”</p><cite>{pick(locale, quotes[active].name)}</cite></blockquote><div role="group" aria-label={t(locale, '切换旅客感言', 'Choose a guest story')}>{quotes.map((quote, index) => <button type="button" key={quote.name[1]} aria-label={t(locale, `感言 ${index + 1}`, `Guest story ${index + 1}`)} aria-pressed={active === index} onClick={() => setActive(index)}><span /></button>)}</div><p className="nr-fine">{t(locale, '展示感言为模板演示文案', 'Guest stories are illustrative template copy')}</p></div>
}

export function LakeMap({ locale }: { locale: TemplateLocale }) {
  return <figure className="nr-lake-map nr-glass"><svg viewBox="0 0 560 600" role="img" aria-label={t(locale, '科莫湖示意图，标注酒店、贝拉焦和科莫', 'Illustrative map of Lake Como, the retreat, Bellagio and Como')}><defs><pattern id="nr-map-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="currentColor" strokeOpacity=".05" /></pattern></defs><rect width="560" height="600" fill="url(#nr-map-grid)" /><path d="M327 40C290 120 300 192 270 260C244 308 188 335 167 405L117 545L154 550C166 459 205 400 264 358C282 349 297 363 314 399L379 533L410 519C365 439 351 382 309 320C296 284 315 229 330 180L352 44Z" fill="#31504e" stroke="#b9966a" strokeWidth="1.5" /><g fill="none" stroke="#b9966a" strokeOpacity=".15">{[0, 1, 2, 3].map(index => <path key={index} d={`M${65 + index * 20} 60Q${200 + index * 10} 240 ${70 + index * 25} 530M${430 + index * 14} 80Q${355 + index * 12} 250 ${470 + index * 10} 530`} />)}</g><path d="M247 343L278 322" stroke="#dacbb4" strokeDasharray="4 5" /><g fill="#c6a478"><circle cx="247" cy="343" r="5" /><circle cx="278" cy="322" r="3" /><circle cx="311" cy="279" r="3" /><circle cx="137" cy="536" r="3" /><circle cx="390" cy="523" r="3" /></g><g fill="#d7d0c4" fontFamily="inherit" fontSize="12" letterSpacing="1"><text x="304" y="31">N ↑</text><text x="364" y="66">COLICO</text><text x="323" y="282">VARENNA</text><text x="290" y="327">BELLAGIO</text><text x="48" y="546">COMO</text><text x="408" y="530">LECCO</text><text x="80" y="326" fill="#c6a478">{t(locale, '微域生光', 'WEELUME')}</text><text x="85" y="348">LEZZENO</text><text x="419" y="584">5 KM</text></g><path d="M410 565H490M410 560V570M490 560V570" stroke="#aaa18f" /></svg><figcaption>{t(locale, '科莫湖位置示意 · 非导航地图', 'Lake Como location illustration · not a navigation map')}</figcaption></figure>
}
