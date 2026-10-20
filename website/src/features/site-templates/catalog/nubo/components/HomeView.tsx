'use client'

import { useState } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { Reveal } from './Motion'
import { OpeningSequence } from './OpeningSequence'
import { Capabilities } from './Capabilities'
import { photo, rooms } from '../data'
import { Button, CTA, FAQ, Heading, RoomCards, SiteShell, Testimonials, Title, useCopy } from './Shared'

export function Signals() {
  const { t } = useCopy()
  return <section className="nb-section nb-signals">
    <div className="nb-container">
      <Heading eyebrow={['最初的信号', 'Early signals']} title={['来自最初的家庭\n一些诚实的数字', 'The first numbers\nfrom the first homes']} description={['内测阶段的生活观察，随着产品与家庭一起成长；以下数据均为模板演示', 'Early observations from beta homes, growing with the program. All figures are illustrative.']} />
      <div className="nb-signal-grid">
        <Reveal className="nb-signal-photo">
          <img src={photo('Xx2LmnG1YXgOw3GPqhbOj30qJQ')} alt={t('使用家中的圆形控制面板', 'Using the circular home control panel')} loading="lazy" />
          <div>
            <strong>94<span>%</span>
            </strong>
            <p>{t('四周后仍每天使用', 'Still running daily after four weeks')}</p>
          </div>
        </Reveal>
        <div className="nb-signal-cards">{[['87%', '自主完成', 'Self-sufficiency', '学习日常规律，在你开口之前行动', 'Learns the routine and acts before being asked'], ['9.2/10', '愿意推荐', 'Word of mouth', '来自内测家庭的体验反馈', 'Feedback from the homes living with it'], ['6.4h', '时间归还', 'Time returned', '每周腾出更多属于自己的时间', 'More time returned to your week']].map(([number, zh, en, bodyZh, bodyEn]) => <Reveal className="nb-stat nb-glass" key={number}>
          <span className="nb-eyebrow">{t(zh, en)}</span>
          <strong>{number}</strong>
          <p>{t(bodyZh, bodyEn)}</p>
          <small>{t('演示数据 · 140 个内测家庭', 'DEMO DATA · 140 BETA HOMES')}</small>
        </Reveal>)}</div>
      </div>
      <details className="nb-measure">
        <summary>{t('这些数字如何衡量', 'How we measure')} +</summary>
        <p>{t('活跃指设备每天自主完成至少一项任务；推荐度来自内测反馈，节省时间来自家庭自述。以上数值用于展示页面设计，未接入真实遥测或调研服务。', 'Activity means completing at least one task autonomously each day. Recommendation comes from beta feedback; time returned is self-reported. Figures demonstrate the design and are not connected to live telemetry or surveys.')}</p>
      </details>
    </div>
  </section>
}

function Materials({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  const [active, setActive] = useState(0)
  const materials = [
    { image: 'nyO5Isu6JYyNy1MMnr3MbKvguo', name: t('触感样本', 'Fabric swatch') },
    { image: 'E2n5khFlJdULm3BD8fX00lMpFo0', name: t('无缝织物', 'Seamless knit') },
    { image: 'S4oLeqj0sxUIqgM2rpSfZv66U', name: t('磁吸连接', 'Magnetic connector') },
    { image: 'YetUAup4jptITWPYGrWTFFSrdhY', name: t('背部细节', 'Back detail') },
  ]
  return <section className="nb-section nb-container nb-materials">
    <div>
      <Heading left eyebrow={['材质与工艺', 'Materials & craft']} title={['在科莫织就\n像熟悉的针织衫', 'Made in Como\nWorn like a favorite jumper']} description={['棉与再生尼龙混纺，一体无缝针织外衣。贴近生活的触感，也经得起日常相处。', 'A seamless knit shell in a cotton and recycled nylon blend. Soft to live with, simple to care for.']} />
      <div className="nb-chips">{[t('可机洗', 'Machine washable'), t('可更换', 'Replaceable'), t('五种色调', 'Five tones'), t('再生纱线', 'Recycled yarn')].map(s => <span key={s}>{s}</span>)}</div>
      <dl className="nb-spec-list">{[[t('织物', 'Shell'), t('精细针织 · 18GG', 'Fine-gauge knit · 18GG')], [t('克重', 'Weight'), '540 g/m²'], [t('配色', 'Color'), t('云白 / 亚麻 / 石墨', 'Chalk / Flax / Graphite')], [t('护理', 'Care'), t('可拆卸 · 30°C 水洗', 'Removable · 30°C wash')], [t('产地', 'Origin'), t('意大利 · 科莫', 'Como, Italy')]].map(([key, value]) => <div key={key}>
        <dt>{key}</dt>
        <dd>{value}</dd>
      </div>)}</dl>
      <Button href={`${basePath}/contact`}>{t('申请触感样本', 'Request a swatch')}</Button>
    </div>
    <div>
      <div className="nb-material-image nb-glass">
        <img src={photo(materials[active].image)} alt={materials[active].name} loading="lazy" width="1000" height="750" />
      </div>
      <div className="nb-material-tabs" role="group" aria-label={t('选择材质细节', 'Select a material detail')}>{materials.map((item, i) => <button key={item.image} type="button" aria-pressed={active === i} onClick={() => setActive(i)}>
        <img src={photo(item.image)} alt="" loading="lazy" />{item.name}</button>)}</div>
    </div>
  </section>
}

function Specifications({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <section className="nb-section nb-container" id="specifications">
    <Heading eyebrow={['简单相处，复杂留给内部', 'Simple to live with']} title={['表面安静\n内在不简单', 'Simple to live with\nNot simple inside']} description={['走过地毯、爬上楼梯、理解房间；那些藏在安静背后的能力，日久才能体会', 'The things you only notice once it is living with you. Walking, balancing, learning the room.']} />
    <div className="nb-bento">
      <Reveal className="nb-bento-tall nb-glass">
        <img src={photo('If4pRssEcvthH3fHnvDMdCuvCY')} loading="lazy" alt={t('机器人抱着花束走上楼梯', 'Robot carrying flowers up the stairs')} />
        <div>
          <span className="nb-eyebrow">{t('稳定行走', 'On its feet')}</span>
          <h3>{t('和家人一样，自然走过楼梯', 'Takes the stairs like the family')}</h3>
          <p>{t('越过门槛，绕开鞋子，把生活中的每一步走稳', 'Thresholds, rugs, and a shoe in the hall. One steady step at a time.')}</p>
        </div>
      </Reveal>
      <Reveal className="nb-bento-dark nb-glass">
        <span className="nb-eyebrow">{t('本地智能', 'On-device intelligence')}</span>
        <img src={photo('VvAV5s1odu91BXUwqucczGPJrOg')} alt={t('本地神经引擎示意', 'Illustration of local intelligence')} loading="lazy" />
        <h3>{t('家的隐私，留在家里', 'Your home stays your home')}</h3>
        <p>{t('感知与决策在设备端完成', 'Perception and decisions stay on-device')}</p>
      </Reveal>
      <Reveal className="nb-glass nb-power">
        <span className="nb-eyebrow">{t('全天候续航', 'All-day power')}</span>
        <strong>23<small>hrs</small>
        </strong>
        <img src={photo('S2FubOroGW9HrPJVkBaF3N2AEM')} loading="lazy" alt={t('机器人电池单元', 'Robot battery unit')} />
        <h3>{t('忙完一天，自己充电', 'A full day, then it charges itself')}</h3>
      </Reveal>
      <Reveal className="nb-glass nb-bento-wide">
        <img src={photo('wDnx0a64qhbvVP3gO7VIbLt37pU')} loading="lazy" alt={t('灵巧的机械手臂', 'Articulated robotic arm')} />
        <div>
          <span className="nb-eyebrow">{t('自如触达', 'Range of motion')}</span>
          <h3>{t('高处的架子，低处的抽屉', 'The top shelf. The bottom drawer.')}</h3>
          <p>{t('以轻柔而准确的动作，照顾生活中的小事', 'Soft, precise movement for the little things')}</p>
          <Button href={`${basePath}/contact`}>{t('了解完整规格', 'Full spec sheet')}</Button>
        </div>
      </Reveal>
    </div>
  </section>
}

function Pricing({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  const plans = [
    { name: t('微域生光', 'Weelume'), label: t('日常之选', 'Essentials'), price: '€3,290', body: t('多数家庭所需的一切', 'Everything most homes need'), features: [t('日常任务协助', 'Routine support'), t('家庭环境感知', 'Home awareness'), t('三种外观选择', '3 finishes'), t('18 小时续航', '18-hour battery'), t('两年保修', '2-year warranty')] },
    { name: 'Weelume Pro', label: t('人气之选', 'Most popular'), price: '€4,490', body: t('更广阔的感知，更长久的陪伴', 'Extended sensing. Longer battery.'), features: [t('包含标准版全部功能', 'Everything in standard'), t('搬运与取物', 'Carries and fetches'), t('五种外观选择', '5 finishes'), t('23 小时续航', '23-hour battery'), t('三年保修与优先支持', '3-year warranty & priority support')] },
    { name: 'Weelume Care', label: t('可选服务', 'Optional cover'), price: '€14', body: t('软件更新、维修与替换支持', 'Updates, repair and replacement'), features: [t('年度家庭检查', 'Annual home check'), t('意外损坏保障', 'Damage cover'), t('软件更新', 'Software updates'), t('维修期间替代设备', 'Replacement loan unit'), t('随时添加，随时取消', 'Add or cancel anytime')] },
  ]
  return <section className="nb-section nb-pricing" id="pricing">
    <div className="nb-container">
      <Heading eyebrow={['价格方案', 'Pricing']} title={['选一种方式\n让它成为家的一员', 'Choose how you\nbring it home']} description={['一次购买，长久陪伴；Care 服务按需选择。价格仅用于模板演示。', 'One purchase. A quieter home. Care is optional. Prices are illustrative demo content.']} />
      <div className="nb-pricing-grid">{plans.map((plan, i) => <Reveal key={plan.name} delay={i * .08}>
        <article className={`nb-plan nb-glass ${i === 1 ? 'nb-plan-featured' : ''}`}>
          <span className="nb-pill">{plan.label}</span>
          <h3>{plan.name}</h3>
          <p>{plan.body}</p>
          <div className="nb-price">{plan.price}{i === 2 && <small>/{t('月', 'month')}</small>}</div>
          <small>{i === 2 ? t('适用于任意设备', 'ADD TO ANY DEVICE') : t('一次购买 · 免运费', 'ONE-TIME · FREE SHIPPING')}</small>
          <ul>{plan.features.map(f => <li key={f}>
            <span aria-hidden="true">✓</span>{f}</li>)}</ul>
          <Button href={`${basePath}/waitlist?plan=${['standard', 'pro', 'care'][i]}`}>{t('选择方案', 'Choose plan')}</Button>
        </article>
      </Reveal>)}</div>
      <div className="nb-integrations">
        <span>{t('与你已有的智能生活相连', 'Works with what you already have')}</span>
        <div>◎ Matter <span>◉ Alexa</span>⌂ Google Home <span>◈ HomeKit</span>
        </div>
      </div>
    </div>
  </section>
}

function HomeContent({ basePath }: { basePath: string }) {
  const { t } = useCopy()
  return <OpeningSequence basePath={basePath}>
    <Capabilities />
    <section className="nb-section nb-container nb-home-rooms">
      <Heading eyebrow={['在家里的每一处', 'At home']} title={['一个帮手\n每一个房间', 'One robot\nEvery room']} description={['从厨房到门口，从车库到校车站，看看它能接过哪些日常', 'From the kitchen to the front door, the garage to the school run.']} />
      <RoomCards basePath={basePath} items={rooms.slice(0, 3)} />
      <div className="nb-center">
        <Button href={`${basePath}/cases`}>{t('探索全部场景', 'All use cases')}</Button>
      </div>
    </section>
    <Signals />
    <Materials basePath={basePath} />
    <Specifications basePath={basePath} />
    <FAQ />
    <section className="nb-listening nb-container">
      <img src={photo('YRQ6KPzA3mnznHpTGnPS2O8dk')} alt={t('机器人头部与感知波纹', 'Robot head with perception rings')} loading="lazy" />
      <div>
        <span className="nb-eyebrow">{t('先理解，再回应', 'Understands before you finish')}</span>
        <h2>
          <Title>{t('听懂房间的需要\n也听懂你的日常', 'Hears the room\nand your everyday rhythm')}</Title>
        </h2>
        <div className="nb-quick-stats">
          <div>
            <strong>23h</strong>
            <p>{t('一整天的安静陪伴', 'A full waking day of help')}</p>
          </div>
          <div>
            <strong>42min</strong>
            <p>{t('从拆箱到第一个任务', 'From box to first task')}</p>
          </div>
        </div>
        <small>{t('规格与数据均为产品演示', 'Illustrative specifications and data')}</small>
      </div>
    </section>
    <Pricing basePath={basePath} />
    <Testimonials />
    <CTA basePath={basePath} />
  </OpeningSequence>
}

export function HomeView(props: SiteTemplatePageProps) {
  return <SiteShell {...props}>
    <HomeContent basePath={props.basePath} />
  </SiteShell>
}
