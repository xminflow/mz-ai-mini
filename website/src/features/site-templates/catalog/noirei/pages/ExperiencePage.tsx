import { notFound } from 'next/navigation'
import type { SiteTemplatePageProps } from '../../../types'
import { experiences, photos, pick, t } from '../data'
import { Button, PageHero, SectionTitle, Shell } from '../components/Shell'
import { ExperienceCard, PhotoGallery } from '../components/collections'

export default function ExperiencePage({ basePath, locale = 'zh', slug }: SiteTemplatePageProps & { slug: string }) {
  const experience = experiences.find(item => item.slug === slug)
  if (!experience) notFound()
  const images = photos(`/experiences/${slug}`)
  return <Shell basePath={basePath} locale={locale}><PageHero label={t(locale, '湖畔体验', 'A lakeside experience')} title={pick(locale, experience.name)} description={pick(locale, experience.intro)} image={images[0]} /><section className="nr-section nr-container nr-detail-layout"><div><p className="nr-eyebrow">{pick(locale, experience.duration)}</p><h2>{pick(locale, experience.subhead)}</h2><div className="nr-prose">{experience.body.map(item => <p key={item[1]}>{pick(locale, item)}</p>)}</div></div><aside className="nr-price-panel nr-glass"><p className="nr-eyebrow">{t(locale, '留一段时间', 'Make a little time')}</p><h3>{pick(locale, experience.name)}</h3><p>{pick(locale, experience.duration)}</p><p className="nr-price">{pick(locale, experience.price)}</p><Button href={`${basePath}/contact?experience=${slug}`}>{t(locale, '咨询这项体验', 'Enquire about this experience')}</Button><p className="nr-fine">{t(locale, '体验、价格与安排为演示内容，表单不会产生真实预约。', 'Experiences, rates and arrangements are illustrative. The enquiry form does not make a reservation.')}</p></aside></section><section className="nr-container"><PhotoGallery images={images} title={pick(locale, experience.name)} locale={locale} /></section><section className="nr-section nr-container"><SectionTitle label={t(locale, '继续发现', 'More to discover')} title={t(locale, '湖畔的日子 还有很多可能', 'Another way to spend a day')} /><div className="nr-three-grid">{experiences.filter(item => item.slug !== slug).slice(0, 3).map(item => <ExperienceCard key={item.slug} experience={item} basePath={basePath} locale={locale} />)}</div></section></Shell>
}
