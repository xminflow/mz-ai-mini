import type { SiteTemplatePageProps } from '../../../types'
import { asset, roomFAQs, t } from '../data'
import { Button, PageHero, Reveal, SectionTitle, Shell } from '../components/Shell'
import { FAQ, RoomCatalog } from '../components/collections'

export default function RoomsPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  return <Shell basePath={basePath} locale={locale}><PageHero label={t(locale, '入住', 'Stay')} title={t(locale, '客房 套房 与别墅', 'Rooms with a little more soul')} description={t(locale, '从 1911 年老宅的一间湖景客房，到拥有独立泊位的三卧私邸。在三十八个空间里，找到自己的湖畔生活。', 'From an intimate villa room to a three-bedroom boathouse residence, find your own rhythm among thirty-eight lakeside spaces.')} image={asset('mXm5eGPfcGDMkAFhmjgtrH71M.jpg')} />
    <section className="nr-section nr-container nr-catalog-section"><RoomCatalog basePath={basePath} locale={locale} /></section>
    <section className="nr-section nr-light"><div className="nr-container"><SectionTitle label={t(locale, '每次入住', 'Included in your stay')} title={t(locale, '舒适 不必额外安排', 'The small things are already here')} /><div className="nr-inclusions">{[
      [t(locale, '睡到自然醒的早餐', 'Breakfast at your pace'), t(locale, '码头、阳台或床边，供应至 11:00', 'By the jetty, on the balcony or in bed, until eleven')],
      [t(locale, '清晨的一段船程', 'A morning on the water'), t(locale, '每次入住可安排一次指定湖区船程', 'A scheduled lake crossing during your stay')],
      [t(locale, '温热与冷泉', 'Steam, water and calm'), t(locale, '每日水疗公共区域使用', 'Daily access to the shared thermal circuit')],
      [t(locale, '安静而快速的网络', 'A quiet connection'), t(locale, '覆盖主楼、花园与船屋', 'Wi-Fi across the house, gardens and boathouse')],
      [t(locale, '停车与充电', 'Parking and charging'), t(locale, '有顶停车位及两处充电设施', 'Covered parking and two charging points')],
      [t(locale, '全天候礼宾', 'A familiar concierge'), t(locale, '协助餐桌、渡轮与出行安排', 'Help with tables, ferries and days out')],
      [t(locale, '花园厨房', 'The garden kitchen'), t(locale, '为餐桌带来新鲜香草与时蔬', 'Fresh herbs and seasonal produce close to hand')],
      [t(locale, '湖上的晨间徒步', 'A walk above the lake'), t(locale, '指定日期由向导带领出发', 'Guided walks on selected mornings')],
    ].map(([title, description], index) => <Reveal key={title}><span className="nr-eyebrow">0{index + 1}</span><h3>{title}</h3><p className="nr-muted">{description}</p></Reveal>)}</div></div></section>
    <section className="nr-section nr-container nr-faq-layout"><SectionTitle label={t(locale, '抵达之前', 'Before you arrive')} title={t(locale, '有些事 您也许想先知道', 'A few things before you come')} action={<Button href={`${basePath}/contact`} secondary>{t(locale, '还有其他问题', 'Ask us anything else')}</Button>} /><FAQ items={roomFAQs} locale={locale} /></section>
    <section className="nr-container nr-stay-cta nr-glass"><div><p className="nr-eyebrow">{t(locale, '计划旅程', 'Make a little time')}</p><h2>{t(locale, '告诉我们日期 其余慢慢安排', 'Choose the dates, leave room for the rest')}</h2><p className="nr-muted">{t(locale, '从一间合适的房开始，计划下次停留。', 'Start with a room that feels right for your next escape.')}</p></div><Button href={`${basePath}/contact`}>{t(locale, '咨询入住', 'Enquire about a stay')}</Button></section>
  </Shell>
}
