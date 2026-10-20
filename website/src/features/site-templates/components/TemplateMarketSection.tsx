import Link from 'next/link'
import { getSiteCopy, type SiteLocale } from '@/features/site-i18n/copy'

import { Reveal } from '@/components/motion/Reveal'
import { buttonClassName, SectionHeading } from '@/components/ui'

import { getTemplatesNewestFirst } from '../registry'
import { getSceneById } from '../taxonomy'

const HOME_TEMPLATE_LIMIT = 9

// 与模板市场共用注册表；首页只展示最近登记的模板，其余通过下方入口查看。
const featuredTemplates = getTemplatesNewestFirst().slice(0, HOME_TEMPLATE_LIMIT)

const EN_SCENES: Record<string, string> = {
  'corporate-site': 'Business website',
  'landing-page': 'Product landing page',
  'brand-portfolio': 'Brand & portfolio',
  other: 'Other',
}

export function TemplateMarketSection({ locale = 'zh' }: { locale?: SiteLocale }) {
  const copy = getSiteCopy(locale)
  return (
    <section id="template-market" aria-label={copy.market} className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Template marketplace"
            title={copy.market}
            description={copy.marketDescription}
          />
        </Reveal>

        <div className="home-template-wall">
          {featuredTemplates.map((template, index) => {
            const name = locale === 'en' ? template.localizedNames?.en : template.name
            const category = locale === 'en' ? EN_SCENES[template.sceneId] : getSceneById(template.sceneId)!.name
            if (!name || !category) throw new Error(`[home] Missing ${locale} translation for template ${template.id}`)
            const shot = template.screenshots[0]
            const detailPath = `/templates/${template.id}`

            return (
              <Reveal key={template.id} delay={(index % 3) * 0.1} className="home-template-wall-item" y={24} blur={3} duration={0.65} once={false}>
                <article className="home-template-wall-card">
                  <Link
                    href={detailPath}
                    aria-label={`${copy.templateDetails}: ${name}`}
                    className="home-template-wall-image"
                  >
                      <img
                        src={shot.src}
                        alt={locale === 'en' ? `${name} website preview` : shot.alt}
                        width={shot.width ?? 1440}
                        height={shot.height ?? 1000}
                        loading="lazy"
                      />
                  </Link>
                  <div className="home-template-wall-caption">
                    <div>
                      <h3><Link href={detailPath}>{name}</Link></h3>
                      <p>{category}</p>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </div>
        <Reveal className="mt-10 flex justify-center sm:mt-12">
          <Link href="/templates" data-button-variant="primary" className={buttonClassName('primary')}>
            {copy.viewMoreTemplates} 
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
