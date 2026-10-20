import type { SiteTemplatePageProps } from '../../../types'
import { asset, t, type Copy, pick } from '../data'
import { Button, PageHero, Reveal, SectionTitle, Shell } from '../components/Shell'

const history: { year: string; title: Copy; text: Copy }[] = [
  { year: '1911', title: ['湖边的夏日住宅', 'A summer home'], text: ['丝绸商人在水边建起三层别墅、船屋与石窖，同年种下通往花园的柏树。', 'A silk merchant builds the villa, boathouse and cellar, and plants the cypress path beside his summer home.'] },
  { year: '1968', title: ['第一次向旅客开门', 'The first hotel guests'], text: ['家族后人把住宅改成十二间客房的旅馆。客人乘船抵达，在皮面登记簿上写下名字。', 'The family opens a twelve-room hotel. Guests arrive by boat and sign their names in a leather-bound register.'] },
  { year: '2019', title: ['一石一瓦地修复', 'A careful restoration'], text: ['四年修复保留了水磨石、原有船屋与老宅的比例，旧蓄水池成为安静的水疗空间。', 'Four years of work restore the terrazzo, boathouse and original proportions, while the old cisterns become a tranquil spa.'] },
  { year: 'TODAY', title: ['三十八种停留方式', 'Thirty-eight ways to stay'], text: ['主楼、旧柠檬温室、花园别墅与船屋私邸，依然安静得可以先听见船，再看见它。', 'Rooms now reach across the villa, lemon house, garden and boathouse, while the shoreline keeps its familiar calm.'] },
]

export default function AboutPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  return <Shell basePath={basePath} locale={locale}><PageHero label={t(locale, '老宅的故事', 'The house story')} title={t(locale, '一座为夏天而建的房子', 'A house made for long summers')} description={t(locale, '1911 年，湖湾迎来一座夏日别墅。一个世纪后，我们再次打开百叶窗，也打开一段新的湖畔生活。', 'A summer villa appeared on this quiet bend in 1911. A century later, its shutters opened to a new chapter by the lake.')} image={asset('mDRYVAxXtT9jT3pjQAs5cpHOOVA.jpg')} />
    <section className="nr-section nr-container"><SectionTitle label={t(locale, '始于 1911', 'Since 1911')} title={t(locale, '四个时刻 同一座老宅', 'Four moments in one long story')} description={t(locale, '墙壁没有变，夏天有了新的故事。', 'The walls remain, and each summer leaves a different story.')} /><div className="nr-timeline">{history.map(item => <Reveal key={item.year}><span>{item.year}</span><h3>{pick(locale, item.title)}</h3><p className="nr-muted">{pick(locale, item.text)}</p></Reveal>)}</div><figure className="nr-wide-photo"><img src={asset('eBgxLbUNu1RiZsigMIUbKkLCwI.jpg')} alt={t(locale, '老宅的黑白历史照片', 'An archival view of the historic house')} loading="lazy" /><figcaption>{t(locale, '老宅档案 · 保留原来的生活尺度', 'From the archive · a house kept at a human scale')}</figcaption></figure></section>
    <section className="nr-section nr-light"><div className="nr-container"><SectionTitle label={t(locale, '我们的方式', 'Our approach')} title={t(locale, '有三件事 我们一直保留', 'Three things we choose to keep')} /><div className="nr-three-grid">{[
      [t(locale, '安静，自有设计', 'Room for quiet'), t(locale, '走廊不放背景音乐，花园没有屏幕，把声音留给风、脚步和远处的渡轮。', 'No corridor soundtrack or garden screens; leave room for the wind, footsteps and a distant ferry.')],
      [t(locale, '从近处而来', 'From our neighbours'), t(locale, '本地湖鱼、邻近山谷的米、科莫的亚麻与石材。能从附近找到的，就不必远行。', 'Local fish, regional rice, Como linen and nearby stone: thoughtful choices begin close to home.')],
      [t(locale, '服务，也懂留白', 'Care with a little space'), t(locale, '记住名字和咖啡偏好，然后把时间还给客人。需要时出现，不需要时安静退后。', 'Learn a name and a coffee order, then give guests their time back. Be present when needed and discreet when not.')],
    ].map(([title, description], index) => <Reveal className="nr-glass nr-value-card" key={title}><span className="nr-eyebrow">0{index + 1}</span><h3>{title}</h3><p className="nr-muted">{description}</p></Reveal>)}</div></div></section>
    <section className="nr-section nr-container nr-split-section"><Reveal><p className="nr-eyebrow">{t(locale, '老宅里的人', 'The people')}</p><h2>{t(locale, '像主人一样招待', 'Hospitality with a familiar face')}</h2><p className="nr-muted">{t(locale, '厨房里的 Matteo、水疗空间的 Sofia，以及手写渡轮时刻表的 Luca。许多人就来自这片湖岸，他们分享的不只是服务，也是自己熟悉的生活。', 'Meet Matteo in the kitchen, Sofia in the spa and Luca at the concierge desk. Many of the people who care for the house grew up along this shore; their local knowledge is part of every welcome.')}</p><Button href={`${basePath}/journal`} secondary>{t(locale, '读读他们的故事', 'Meet them through the journal')}</Button></Reveal><img src={asset('KTdQuh9pBdokmGEz5larM5o3vU.jpg')} alt={t(locale, '老宅里的湖畔生活', 'Life around the lakeside house')} loading="lazy" /></section>
    <section id="sustainability" className="nr-section nr-container"><SectionTitle label={t(locale, '可持续生活', 'A lighter footprint')} title={t(locale, '轻一点地 住在湖边', 'Care for the place that holds us')} description={t(locale, '从每天真正能做到的小事开始。以下为参考酒店的可持续主题演示。', 'Small practical choices, shown here as the retreat’s sample sustainability programme.')} /><div className="nr-two-grid">{[
      [t(locale, '玻璃瓶里的山泉', 'Spring water in glass'), t(locale, '可重复使用的玻璃瓶，替代客房中的一次性塑料。', 'Refillable glass bottles replace disposable plastic in the rooms.')],
      [t(locale, '船屋上的太阳能', 'Sunlight above the boathouse'), t(locale, '把屋顶的阳光，用于温暖水疗与泳池。', 'Rooftop solar supports heating for the spa and pool.')],
      [t(locale, '从菜园到厨房', 'From the beds to the kitchen'), t(locale, '夏天的香草与蔬菜，在山坡花园里生长。', 'Summer herbs and vegetables grow in hillside garden beds.')],
      [t(locale, '更安静的船程', 'A quieter lake crossing'), t(locale, '为修复的木船更新动力，留住木材，也降低声响。', 'A restored wooden boat pairs traditional craft with a quieter modern motor.')],
    ].map(([title, description]) => <Reveal className="nr-sustain-card nr-glass" key={title}><span aria-hidden="true">✧</span><h3>{title}</h3><p className="nr-muted">{description}</p></Reveal>)}</div></section>
  </Shell>
}
