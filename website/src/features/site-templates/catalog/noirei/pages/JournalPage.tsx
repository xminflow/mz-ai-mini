import type { SiteTemplatePageProps } from '../../../types'
import { articles, t } from '../data'
import { PageHero, Shell } from '../components/Shell'
import { JournalCard, JournalCatalog } from '../components/collections'

export default function JournalPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  return <Shell basePath={basePath} locale={locale}><PageHero label={t(locale, '湖畔日志', 'The journal')} title={t(locale, '从这里 寄出几页生活', 'Notes from a house by the lake')} description={t(locale, '关于老宅、餐桌、手艺与季节的故事，留给慢慢阅读的时刻。', 'Stories of the house, its people, the kitchen and the changing seasons, best read without a hurry.')} /><section className="nr-container nr-journal-lead"><JournalCard article={articles[0]} basePath={basePath} locale={locale} featured /></section><section className="nr-section nr-container"><JournalCatalog basePath={basePath} locale={locale} /></section></Shell>
}
