'use client'

import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui'
import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'
import { EN_ADVANTAGES } from './home.en'
import { ADVANTAGES as ZH_ADVANTAGES } from './advantage-data'

const ADVANTAGE_ICONS = ['reference', 'doughnut-chart', 'server', 'comment-text', 'api-brackets', 'kanban', 'pen-line', 'laptop-mobile']

export const Advantages = () => {
  const { locale, copy } = useSiteLocale()
  const advantages = locale === 'en' ? EN_ADVANTAGES : ZH_ADVANTAGES
  return (
    <section id="advantages" className="home-advantages mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal><SectionHeading eyebrow="The Weelume difference" title={copy.advantages} /></Reveal>
      {/* 主卡突出完整服务；其余卡片先呈现承诺摘要，再保留同一问题的两种完整回答。 */}
      <div className="home-advantage-grid" role="list">
        {advantages.map((item, index) => (
          <Reveal key={item.question} role="listitem" delay={(index % 3) * 0.06} className={`home-advantage-card${index === 0 ? ' home-advantage-featured' : ''}`}>
            <div className="home-advantage-topline">
              <h3>{item.question}</h3>
              <span className="home-advantage-icon" aria-hidden="true">
                <img src={`/home/icons/overflow/${ADVANTAGE_ICONS[index]}.svg`} alt="" width={36} height={36} />
              </span>
            </div>
            <p className="home-advantage-highlight">{item.highlight}</p>
            <div className="home-advantage-comparison">
              <p className="home-advantage-theirs"><span>{copy.commonPractice}</span>{item.theirs}</p>
              <p className="home-advantage-ours"><span><i aria-hidden="true" />{copy.brand}</span>{item.ours}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
