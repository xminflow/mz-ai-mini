import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import {
  BENEFITS,
  CLIENTS,
  EXPERTISE,
  FAQS,
  FEATURED_WORKS,
  HERO,
  PRICING,
  PROCESS,
  SERVICES,
  SITE_PHOTOS,
  TESTIMONIALS,
  TRUST_BAR,
  WHY_US,
} from '../data'
import { BenefitVisual } from '../components/BenefitVisual'
import { Icon, IconBadge } from '../components/Icons'
import { LayerStack } from '../components/LayerStack'
import { Section, SectionHeading } from '../components/SectionHeading'
import { ArrowIcon, SiteShell, hrefFor } from '../components/SiteShell'
import { WorkCard } from '../components/WorkCard'
import { AnimatedNumber, ProcessTimeline, Reveal, ScrollGroup, TitleLines } from '../components/Motion'
import '../theme.css'

export default function HomePage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  return (
    <SiteShell basePath={basePath} activeSlug="" locale={locale}>
      <Hero basePath={basePath} locale={locale} />
      <ClientStrip />
      <Benefits />
      <FeaturedWorks basePath={basePath} />
      <WhyUs />
      <Services />
      <Process />
      <Expertise />
      <Testimonials basePath={basePath} />
      <Pricing basePath={basePath} />
      <Faq />
    </SiteShell>
  )
}

/**
 * 首屏。
 *
 * 内容沿用模板统一字阶，保留人像向上溢出的构图。卡片必须 overflow-visible，
 * 图绝对定位贴右下、比卡高出一截。这一下让画面不再是"两个方块并排"，
 * 是整个首屏最有辨识度的手势，做成 overflow-hidden 就全丢了。
 */
function Hero({ basePath, locale }: { basePath: string; locale: 'zh' | 'en' }) {
  const en = locale === 'en'
  return (
    // 顶部留白 140：导航是 fixed 的（84 高），卡片要从它下面 56px 处起，
    // 再配合下面人像 -56 的上溢，人像顶边正好压在导航底边而不是盖住导航项。
    // 参考站不必这么算是因为它那张人像顶部是浅色背景，压上去也读得到字。
    <section className="tpl-home-hero px-6 pt-[104px] sm:pt-[140px]">
      <div className="mx-auto max-w-[1152px]">
        <div
          className="relative rounded-[32px] lg:overflow-visible"
          style={{
            // 横向渐变：左 60% 保持底灰、向右压深，人像正好落在深的那一侧
            backgroundImage: 'linear-gradient(90deg, #edeef1 60%, #c9cdd2 100%)',
          }}
        >
          {/* 窄屏：图在文字下方正常排版；lg 起图绝对定位、溢出卡顶 */}
          <div className="grid lg:block">
            <div className="px-7 py-10 sm:px-12 sm:py-16 lg:w-[56%] lg:p-16 xl:p-20">
              <h1 className="tpl-display tpl-display-xl">
                <TitleLines lead={en ? 'Clearer brands,' : HERO.titleLead} trail={en ? 'built to move' : HERO.titleTrail} />
              </h1>

              <Reveal delay={0.28}>
                <p className="mt-6 max-w-[480px] tpl-lead text-[var(--tpl-ink-dim)]">{en ? 'Brand, website and product design for ambitious founders and creative teams.' : HERO.description}</p>
              </Reveal>

              <Reveal delay={0.4} className="mt-10 flex flex-wrap gap-3">
                <Link href={hrefFor(basePath, 'works')} className="tpl-btn">
                  {en ? 'View our work' : HERO.primaryCta}
                  <ArrowIcon className="w-4" />
                </Link>
                {/* 首屏的次要按钮走白底：它压在卡片的灰底上，用 surface 填充会和底色同色而消失 */}
                <Link
                  href={hrefFor(basePath, 'contact')}
                  className="tpl-btn-ghost !bg-[var(--tpl-card)]"
                >
                  {en ? 'Get in touch' : HERO.secondaryCta}
                </Link>
              </Reveal>

              <dl className="mt-12 grid grid-cols-3 gap-4">
                {HERO.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="tpl-display tpl-hero-stat">
                      <AnimatedNumber value={stat.value} />
                      {stat.suffix}
                    </dd>
                    <p className="mt-2.5 text-[14px] text-[var(--tpl-ink-dim)]">
                      {en ? ['Projects delivered', 'Years of practice', 'Partner clients'][HERO.stats.indexOf(stat)] : stat.label}
                    </p>
                  </div>
                ))}
              </dl>
            </div>

            {/* 图区。lg 以下是普通块，lg 起绝对定位到卡片右下并向上溢出 */}
            <Reveal delay={0.16} className="tpl-hero-visual relative h-[360px] overflow-hidden rounded-b-[32px] lg:absolute lg:bottom-0 lg:right-0 lg:top-[-56px] lg:h-auto lg:w-[46%] lg:overflow-visible lg:rounded-none">
              <img
                src={SITE_PHOTOS.hero}
                alt="留白设计工作室主创"
                className="size-full rounded-b-[32px] object-cover object-top lg:rounded-b-[32px] lg:rounded-tr-[32px]"
                // 首屏图不能 lazy：它在视口内，延迟加载只会让第一眼是空的
                decoding="async"
                fetchPriority="high"
              />

              {/* 档期卡：白色 20% + 8px 背景模糊，压在人像深色区域上。
                  参考站用的是浅玻璃而不是深色卡——底下是深色人像，玻璃自然读成深灰，
                  换成实心深色卡会失去那层通透。 */}
              <Link href={hrefFor(basePath, 'contact')} className="tpl-availability absolute bottom-6 left-6 right-6 rounded-2xl bg-[rgb(18_18_24/0.5)] p-5 text-white backdrop-blur-md sm:left-8 sm:right-8 lg:bottom-8 lg:left-8 lg:right-8 lg:p-6">
                <p className="text-[14px] text-[rgb(255_255_255/0.66)]">{en ? 'Availability' : HERO.availability.eyebrow}</p>
                <div className="mt-2 flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="tpl-title text-[18px]">{en ? 'Taking on a few new projects' : HERO.availability.title}</p>
                    <p className="mt-2 text-[14px] leading-[22px] text-[rgb(255_255_255/0.72)]">
                      {en ? 'Share a few details and we will come back with a clear direction.' : HERO.availability.body}
                    </p>
                  </div>
                  {/* 白色圆角方块按钮，不是圆形——参考站这里是 12px 圆角的方块 */}
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--tpl-ink)]" aria-hidden>
                    <ArrowIcon className="w-5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/** 合作方名条。没有真实 logo 素材时用文字，假 logo 比没有 logo 更伤。 */
function ClientStrip() {
  return (
    <div className="px-6 pt-16">
      <ScrollGroup className="mx-auto flex max-w-[1152px] flex-wrap items-center justify-between gap-x-8 gap-y-4">
        {CLIENTS.map((client) => (
          <span key={client} className="tpl-title text-[16px] sm:text-[18px] text-[var(--tpl-ink-faint)]">
            {client}
          </span>
        ))}
      </ScrollGroup>
    </div>
  )
}

/** 三条主张的图文独立排版，插图完整呈现并与正文留出间距。 */
function Benefits() {
  return (
    <Section>
      <SectionHeading
        eyebrow="我们的优势"
        title="我们凭什么不一样"
        description="做干净、响应式的网站：把话说清楚，把访客顺畅地带到目的地，也真的服务于业务目标。"
      />

      <ScrollGroup className="mt-16 grid gap-6 md:grid-cols-3">
        {BENEFITS.map((item, index) => (
          <div key={item.title} className="tpl-card tpl-benefit-card flex flex-col">
            <div className="tpl-benefit-visual">
              <BenefitVisual index={index} className="h-auto w-full max-w-[288px]" />
            </div>
            <div className="flex-1 p-7 pt-6 sm:p-8 sm:pt-7">
              <h3 className="tpl-title text-[20px]">{item.title}</h3>
              <p className="mt-3 tpl-copy text-[var(--tpl-ink-dim)]">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </ScrollGroup>
    </Section>
  )
}

/**
 * 精选作品。**两列、六个等大的卡**——参考站就是这个排布。
 * 此前的「两张大卡 + 四张小卡」是我自己加的层级，反而把"精选"读成了"有主有次的清单"。
 */
function FeaturedWorks({ basePath }: { basePath: string }) {
  return (
    <Section>
      <SectionHeading
        eyebrow="精选作品"
        title="清清楚楚的项目"
        description="为现代团队做的品牌、网站与产品设计，从中挑出来的一组。"
      />

      <ScrollGroup className="mt-16 grid gap-6 md:grid-cols-2">
        {FEATURED_WORKS.map((work) => (
          <WorkCard key={work.id} work={work} basePath={basePath} />
        ))}
      </ScrollGroup>

      <div className="mt-16 text-center">
        <Link href={hrefFor(basePath, 'works')} className="tpl-btn-ghost">
          查看全部作品
          <ArrowIcon className="w-4" />
        </Link>
      </div>
    </Section>
  )
}

/**
 * 为什么选我们。**2+2+1 的 bento**，不是三张等大的卡：
 * 左中两列各是「一张小信息卡 + 一张大统计卡」，右列是一张通高的深色卡。
 * 参考站靠这个不规则排布让这一段不至于读成又一排卡片。
 */
function WhyUs() {
  const [first, second] = WHY_US.stats

  return (
    <Section>
      <SectionHeading
        eyebrow="为什么选我们"
        title="围绕长久的清晰做设计"
        description="把策略、视觉方向与精细执行放在一起，做出真正有意义的数字体验。"
      />

      <ScrollGroup className="mt-16 grid gap-4 lg:grid-cols-3">
        {/* 左列：小卡在上、统计卡在下 */}
        <div className="flex flex-col gap-4">
          <div className="tpl-card flex items-center gap-4 p-6">
            <AvatarStack />
            <span className="tpl-title text-[16px]">{WHY_US.clientsBadge}</span>
          </div>
          <StatCard {...first} className="flex-1" />
        </div>

        {/* 中列：统计卡在上、小卡在下 */}
        <div className="flex flex-col gap-4">
          <StatCard {...second} className="flex-1" />
          <div className="tpl-card flex items-center gap-3 p-6">
            <span className="size-2.5 shrink-0 rounded-full bg-[var(--tpl-ok)]" aria-hidden />
            <span className="tpl-title text-[16px]">{WHY_US.availability}</span>
          </div>
        </div>

        {/* 右列：通高深色卡。整段唯一的反白块，也是唯一出现星标的地方 */}
        <div className="tpl-card-dark flex flex-col justify-between p-8">
          <p className="tpl-copy text-[rgb(247_247_248/0.72)]">
            {WHY_US.highlight.body}
          </p>
          <div className="mt-16 flex items-end gap-4">
            <p className="tpl-display tpl-stat"><AnimatedNumber value={WHY_US.highlight.value} /></p>
            <div className="pb-1">
              <div className="flex gap-0.5 text-[#e0a33a]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Icon key={i} name="star" className="size-3.5" />
                ))}
              </div>
              <p className="mt-1 text-[15px] text-[rgb(247_247_248/0.72)]">
                {WHY_US.highlight.label}
              </p>
            </div>
          </div>
        </div>
      </ScrollGroup>
    </Section>
  )
}

/**
 * 服务。左列三项、右列一张示意图。
 *
 * 第一项渲染成**浮起的白卡 + 深色图标徽标**，其余两项没有卡也没有徽标底——
 * 参考站用这一组明暗差表达"当前在讲哪一项"。三项都做成卡会让这一列读成又一个卡片墙。
 * 本区块没有眉标药丸，与参考站一致。
 */
function Services() {
  return (
    <Section>
      <SectionHeading
        eyebrow={null}
        title="为数字品牌提供的创意服务"
        description="聚焦的设计与开发支持，帮品牌建立更清晰的识别、更好的网站与更精细的产品体验。"
      />

      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <ScrollGroup className="flex flex-col">
          {SERVICES.map((service, index) => {
            const active = index === 0
            return (
              <div
                key={service.title}
                className={
                  active
                    ? 'tpl-card p-8 shadow-[0_1px_2px_rgb(18_18_24/0.04),0_16px_40px_-24px_rgb(18_18_24/0.35)]'
                    : 'px-8 py-10'
                }
              >
                <IconBadge name={service.icon} tone={active ? 'dark' : 'plain'} />
                <h3 className="tpl-title mt-6 text-[20px]">{service.title}</h3>
                <p className="mt-2 max-w-[480px] tpl-copy text-[var(--tpl-ink-dim)]">
                  {service.body}
                </p>
              </div>
            )
          })}
        </ScrollGroup>

        {/* 三层爆炸图与左侧三项服务一一对应：版式 / 视觉系统 / 组件与令牌 */}
        <Reveal className="tpl-layer-visual flex items-center justify-center rounded-[24px] border border-[var(--tpl-rule)] bg-[rgb(255_255_255/0.5)] p-6">
          <LayerStack className="w-full max-w-[440px]" />
        </Reveal>
      </div>
    </Section>
  )
}

/**
 * 流程。**左侧标题吸顶 + 右侧竖线时间轴**，对应参考站的排布。
 *
 * 六步做成两列网格（之前的做法）会把"先后顺序"抹平；一条竖线穿过六张卡，
 * 顺序才是版面自己说出来的，而不是靠序号数字硬标。
 */
function Process() {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading
            eyebrow="合作流程"
            eyebrowIcon="check"
            align="left"
            title={
              <>
                流程如何
                <br />
                清清楚楚地走完
              </>
            }
            description="一条清晰且协作的工作流，把每个项目从最初的想法带到打磨完成的成品。"
          />
        </div>

        <ProcessTimeline>
          {PROCESS.map((item, index) => (
            <li key={item.title} className={`relative flex gap-6 ${index > 0 ? 'mt-4' : ''}`}>
              <IconBadge name={item.icon} tone="light" className="relative z-10 !rounded-full" />
              <Reveal className="tpl-card min-w-0 flex-1 p-7">
                <h3 className="tpl-title text-[20px]">{item.title}</h3>
                <p className="mt-2 tpl-copy text-[var(--tpl-ink-dim)]">
                  {item.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ProcessTimeline>
      </div>
    </Section>
  )
}

/**
 * 八条能力。**bento 而不是规整网格**：两条占双倍宽、其中一条走深色。
 * 参考站正是靠这两个变量把八张卡排出节奏，全等大会读成一张表格。
 *
 * 卡内是「图标徽标 → 撑开的空白 → 标题 + 正文沉到卡底」的三段式，
 * 那段刻意留出的空白是这一排卡片显得从容的全部原因。
 */
function Expertise() {
  return (
    <Section>
      <SectionHeading
        eyebrow="能力范围"
        title="方向清楚的设计支持"
        description="策略、设计与执行的一个聚焦组合，帮想法变得清晰、精细，并且真的落得了地。"
      />

      {/* **五列**而不是四列：两行各是 1+1+1+2 与 1+2+1+1，正好各占满 5 格。
          四列排不下"三张窄卡 + 一张双宽卡"这一行，宽卡会被挤到下一行，bento 的节奏就散了。 */}
      <ScrollGroup className="tpl-expertise-grid mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {EXPERTISE.map((item) => {
          const dark = 'dark' in item && item.dark
          const wide = 'wide' in item && item.wide
          return (
            <div
              key={item.title}
              className={`${dark ? 'tpl-card-dark' : 'tpl-card'} flex flex-col justify-between p-7 ${
                wide ? 'lg:col-span-2' : ''
              }`}
            >
              <IconBadge
                name={item.icon}
                tone={dark ? 'dark' : 'light'}
                className={dark ? '!bg-[rgb(247_247_248/0.1)] !text-[var(--tpl-ink-invert)]' : ''}
              />
              <div>
                <h3 className="tpl-title text-[18px]">{item.title}</h3>
                <p
                  className={`mt-2 tpl-copy ${
                    dark ? 'text-[rgb(247_247_248/0.66)]' : 'text-[var(--tpl-ink-dim)]'
                  }`}
                >
                  {item.body}
                </p>
              </div>
            </div>
          )
        })}
      </ScrollGroup>
    </Section>
  )
}

/**
 * 客户评价。标题块是**左右两栏**（左眉标+大标题、右副标题+按钮），不是居中三件套——
 * 参考站在这一节换了节奏。下面三列同样是 bento：第一列深色通高，
 * 第二列白卡 + 一张小的信任条，第三列白卡。
 */
function Testimonials({ basePath }: { basePath: string }) {
  const [first, ...rest] = TESTIMONIALS

  return (
    <Section>
      <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
        <SectionHeading eyebrow="客户评价" title="客户怎么说" align="left" />
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
          <p className="max-w-[420px] tpl-copy text-[var(--tpl-ink-dim)]">
            来自创始人与团队的真实反馈——他们信任这套流程、这个方向，以及最后交出来的东西。
          </p>
          <Link href={hrefFor(basePath, 'contact')} className="tpl-btn mt-6 shrink-0 lg:mt-0">
            {TRUST_BAR.cta}
            <ArrowIcon className="w-4" />
          </Link>
        </div>
      </div>

      <ScrollGroup className="mt-16 grid gap-4 lg:grid-cols-3">
        <TestimonialCard item={first} basePath={basePath} dark />

        <div className="flex flex-col gap-4">
          <TestimonialCard item={rest[0]} basePath={basePath} className="flex-1" />
          <div className="tpl-card flex items-center gap-3 p-6">
            <Icon name="users" className="size-5 shrink-0 text-[var(--tpl-ink-dim)]" />
            <span className="tpl-title text-[16px]">{TRUST_BAR.text}</span>
          </div>
        </div>

        <TestimonialCard item={rest[1]} basePath={basePath} />
      </ScrollGroup>
    </Section>
  )
}

/** 统计卡：一句话在上、大数字沉到卡底。两张卡高度由 grid 拉平，数字才会对齐在同一条线上。 */
function StatCard({
  body,
  value,
  unit,
  label,
  className,
}: {
  body: string
  value: string
  unit: string
  label: string
  className?: string
}) {
  return (
    <div className={`tpl-card flex flex-col justify-between p-8 ${className ?? ''}`}>
      <p className="tpl-copy text-[var(--tpl-ink-dim)]">{body}</p>
      <div className="mt-16">
        <p className="tpl-display tpl-stat">
          <AnimatedNumber value={value} />
          {unit}
        </p>
        <p className="mt-3 text-[16px] text-[var(--tpl-ink-dim)]">{label}</p>
      </div>
    </div>
  )
}

/** 客户头像堆。没有真实头像，用四个渐深的灰圆代替，比塞四张不相干的图库人脸体面。 */
function AvatarStack() {
  return (
    <div className="flex shrink-0 -space-x-2.5" aria-hidden>
      {[0.1, 0.16, 0.22, 0.28].map((op, i) => (
        <span
          key={i}
          className="size-9 rounded-full border-2 border-[var(--tpl-card)]"
          style={{ backgroundColor: `rgb(18 18 24 / ${op})` }}
        />
      ))}
    </div>
  )
}

function TestimonialCard({
  item,
  basePath,
  dark,
  className,
}: {
  item: (typeof TESTIMONIALS)[number]
  basePath: string
  dark?: boolean
  className?: string
}) {
  return (
    <figure
      className={`${dark ? 'tpl-card-dark' : 'tpl-card'} flex flex-col justify-between p-8 ${className ?? ''}`}
    >
      <blockquote
        className={`tpl-copy ${
          dark ? 'text-[rgb(247_247_248/0.86)]' : 'text-[var(--tpl-ink-dim)]'
        }`}
      >
        {item.quote}
      </blockquote>

      <figcaption className="mt-16 flex items-center gap-3">
        {/* 没有真实头像，用姓氏首字的圆形徽标；比塞一张图库人脸诚实 */}
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-full text-[16px] ${
            dark
              ? 'bg-[rgb(247_247_248/0.14)] text-[var(--tpl-ink-invert)]'
              : 'bg-[var(--tpl-surface)] text-[var(--tpl-ink-dim)]'
          }`}
        >
          {item.name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <p className="tpl-title text-[16px]">{item.name}</p>
          <p
            className={`mt-0.5 text-[14px] ${
              dark ? 'text-[rgb(247_247_248/0.6)]' : 'text-[var(--tpl-ink-faint)]'
            }`}
          >
            {item.role}
          </p>
        </div>
        <Link
          href={hrefFor(basePath, 'works')}
          className={`ml-auto shrink-0 ${dark ? 'text-[rgb(247_247_248/0.7)]' : 'text-[var(--tpl-ink-faint)]'}`}
          aria-label={`查看 ${item.project}`}
        >
          <ArrowIcon className="w-4" />
        </Link>
      </figcaption>
    </figure>
  )
}

/**
 * 收费。两档，第二档走深色——参考站的 Premium 就是一张深色卡，
 * 靠明暗而不是靠一个「推荐」标签把主推档拎出来。
 */
function Pricing({ basePath }: { basePath: string }) {
  return (
    <Section>
      <SectionHeading
        eyebrow="收费方式"
        title="简单的套餐，明确的产出"
        description="聚焦的两档打包价，覆盖设计、建站与上线。超出范围的部分单独报价，不含糊。"
      />

      <ScrollGroup className="mt-16 grid gap-4 md:grid-cols-2">
        {PRICING.map((plan) => {
          const dark = plan.featured
          return (
            <div
              key={plan.name}
              className={`${dark ? 'tpl-card-dark' : 'tpl-card'} flex flex-col p-8 sm:p-10`}
            >
              <IconBadge
                name={plan.icon}
                tone={dark ? 'dark' : 'light'}
                className={dark ? '!bg-[rgb(247_247_248/0.1)] !text-[var(--tpl-ink-invert)]' : ''}
              />

              <h3 className="tpl-title mt-6 text-[20px]">{plan.name}</h3>
              <p
                className={`mt-3 min-h-[48px] text-[15px] leading-6 ${
                  dark ? 'text-[rgb(247_247_248/0.66)]' : 'text-[var(--tpl-ink-dim)]'
                }`}
              >
                {plan.body}
              </p>

              <p className="mt-8 flex items-baseline gap-2">
                <span className="tpl-display tpl-stat"><AnimatedNumber value={plan.price} /></span>
                <span
                  className={`text-[16px] ${dark ? 'text-[rgb(247_247_248/0.66)]' : 'text-[var(--tpl-ink-dim)]'}`}
                >
                  {plan.unit}
                </span>
              </p>

              <Link
                href={hrefFor(basePath, 'contact')}
                className={`mt-8 justify-center ${
                  dark
                    ? 'tpl-btn tpl-btn-light'
                    : 'tpl-btn'
                }`}
              >
                {plan.cta}
                <ArrowIcon className="w-4" />
              </Link>

              <p
                className={`mt-10 text-[13px] tracking-[0.06em] ${
                  dark ? 'text-[rgb(247_247_248/0.5)]' : 'text-[var(--tpl-ink-faint)]'
                }`}
              >
                包含内容
              </p>
              <ul
                className={`mt-4 space-y-3 border-t pt-5 ${
                  dark ? 'border-[rgb(247_247_248/0.14)]' : 'border-[var(--tpl-rule)]'
                }`}
              >
                {plan.includes.map((line) => (
                  <li key={line} className="flex gap-3 text-[15px] leading-6">
                    <svg
                      className="mt-1 w-4 shrink-0"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="m3 8.5 3.2 3.2L13 5" />
                    </svg>
                    <span className={dark ? 'text-[rgb(247_247_248/0.78)]' : 'text-[var(--tpl-ink-dim)]'}>
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </ScrollGroup>
    </Section>
  )
}

/**
 * 常见问题。用原生 details/summary 做展开收起——
 * 为一个手风琴把整页转成客户端组件不值得，而 details 本身就带正确的键盘与无障碍语义。
 */
function Faq() {
  return (
    <Section>
      {/* 居中标题 + 单列问答，与参考站的 FAQ 一致 */}
      <div className="mx-auto max-w-[760px]">
        <SectionHeading
          eyebrow="常见问题"
          title="你可能想问的"
          description="关于流程、报价、周期与项目细节的回答。还有别的问题，直接问就好。"
        />

        <div className="mt-16 divide-y divide-[var(--tpl-rule)] border-t border-[var(--tpl-rule)]">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-6">
              <summary className="tpl-title flex cursor-pointer list-none items-center justify-between gap-6 text-[18px] [&::-webkit-details-marker]:hidden">
                {faq.q}
                {/* 加号转叉：展开状态用 rotate 表达，不换图形 */}
                <span
                  className="relative size-4 shrink-0 text-[var(--tpl-ink-faint)] transition-transform duration-200 group-open:rotate-45"
                  aria-hidden
                >
                  <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
                  <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
                </span>
              </summary>
              <p className="mt-3 tpl-copy text-[var(--tpl-ink-dim)]">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}
