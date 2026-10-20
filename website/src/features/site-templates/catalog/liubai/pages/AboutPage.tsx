import type { SiteTemplatePageProps } from '../../../types'
import {
  CREDENTIALS,
  MILESTONES,
  SITE_PHOTOS,
  STUDIO,
  STUDIO_INTRO,
  STUDIO_METRICS,
  TEAM,
} from '../data'
import { Section, SectionHeading } from '../components/SectionHeading'
import { ScrollGroup } from '../components/Motion'
import { SiteShell } from '../components/SiteShell'
import '../theme.css'

export default function AboutPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  return (
    <SiteShell basePath={basePath} activeSlug="about" locale={locale}>
      <PageHero locale={locale} />
      <Team />
      <Timeline />
      <Credentials />
    </SiteShell>
  )
}

/** 内页首屏：比首页轻一档——不用大卡，只用一段统一字阶的大标题压住顶部的留白。 */
function PageHero({ locale }: { locale: 'zh' | 'en' }) {
  const en = locale === 'en'
  return (
    <section className="tpl-page-hero px-6 pb-4">
      <div className="mx-auto max-w-[1152px]">
        <span className="tpl-pill">{en ? 'About us' : '关于我们'}</span>
        {/* 两段各占一行：让浏览器自己折行会把最后一个「目」字甩到第二行成为孤字 */}
        <h1 className="tpl-display tpl-display-xl mt-6">
          {en ? 'Nine people,' : '九个人，'}
          <br />
          <span className="text-[var(--tpl-ink-faint)]">{en ? 'a dozen projects a year' : '一年做十几个项目'}</span>
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <div className="space-y-5">
            {STUDIO_INTRO.map((paragraph) => (
              <p key={paragraph} className="tpl-copy text-[var(--tpl-ink-dim)]">
                {paragraph}
              </p>
            ))}
            <p className="tpl-copy text-[var(--tpl-ink-dim)]">
              工作室在{STUDIO.city}，{STUDIO.address}。老厂房改的，第一版平面是我们自己画的。
              欢迎来坐坐，来之前发个消息。
            </p>
          </div>

          <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-[var(--tpl-paper-2)]">
            <img
              src={SITE_PHOTOS.studio}
              alt="留白设计工作室内景"
              loading="lazy"
              decoding="async"
              className="tpl-photo"
            />
          </div>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-[var(--tpl-rule)] pt-10 sm:grid-cols-4">
          {STUDIO_METRICS.map((metric) => (
            <div key={metric.label}>
              <dt className="sr-only">{metric.label}</dt>
              <dd className="tpl-display tpl-num text-[36px] leading-none">
                {metric.value}
                <span className="ml-1 text-[15px] text-[var(--tpl-ink-faint)]">{metric.unit}</span>
              </dd>
              <p className="mt-2.5 tpl-copy text-[var(--tpl-ink-dim)]">{metric.label}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

/** 主创团队。没有真实头像，用姓名首字的圆形徽标代替——比灰色人头占位体面。 */
function Team() {
  return (
    <Section>
      <SectionHeading
        eyebrow="主创团队"
        title="项目从头到尾，是这几个人在做"
        description="没有中途换人，也没有签完合同就消失的对接人。名字写在这里，出了问题找得到人。"
      />

      <ScrollGroup className="mt-16 grid gap-4 sm:grid-cols-2">
        {TEAM.map((member) => (
          <div key={member.name} className="tpl-card flex gap-5 p-8">
            <span className="tpl-display flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--tpl-accent-soft)] text-[22px] text-[var(--tpl-accent)]">
              {member.initial}
            </span>
            <div className="min-w-0">
              <h3 className="tpl-title text-[22px]">{member.name}</h3>
              <p className="mt-1 text-[14px] text-[var(--tpl-accent)]">
                {member.role}
              </p>
              <p className="mt-3 tpl-copy text-[var(--tpl-ink-dim)]">
                {member.bio}
              </p>
            </div>
          </div>
        ))}
      </ScrollGroup>
    </Section>
  )
}

/**
 * 发展历程。一条竖线加圆点，不用卡片。
 * 时间轴的意义在于"看得出前后顺序"，一堆并排的卡片恰恰把顺序抹掉了。
 */
function Timeline() {
  return (
    <Section>
      <SectionHeading eyebrow="一路走来" title="八年，五个节点" align="left" />

      <ol className="relative mt-12 max-w-2xl">
        {/* 竖线画在列表容器上而不是每一项上，末项之后线要断掉，所以高度收到最后一个圆点 */}
        <span
          className="absolute bottom-8 left-[5px] top-2 w-px bg-[var(--tpl-rule-strong)]"
          aria-hidden
        />
        {MILESTONES.map((milestone) => (
          <li key={milestone.year} className="relative pb-10 pl-8 last:pb-0">
            <span
              className="absolute left-0 top-[7px] size-[11px] rounded-full border-2 border-[var(--tpl-accent)] bg-[var(--tpl-paper)]"
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline gap-x-4">
              <span className="tpl-display tpl-num text-[19px] text-[var(--tpl-accent)]">
                {milestone.year}
              </span>
              <h3 className="tpl-title text-[22px]">{milestone.title}</h3>
            </div>
            <p className="mt-2 tpl-copy text-[var(--tpl-ink-dim)]">
              {milestone.body}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

function Credentials() {
  return (
    <Section>
      <SectionHeading eyebrow="资质与获奖" title="拿得出来的那几项" align="left" />

      <ul className="mt-10 divide-y divide-[var(--tpl-rule)] border-y border-[var(--tpl-rule)]">
        {CREDENTIALS.map((item) => (
          <li
            key={item.name}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5"
          >
            <span className="text-[15px]">{item.name}</span>
            <span className="text-[13px] text-[var(--tpl-ink-faint)]">
              {item.org}
              <span className="tpl-num ml-3">{item.year}</span>
            </span>
          </li>
        ))}
      </ul>
    </Section>
  )
}
