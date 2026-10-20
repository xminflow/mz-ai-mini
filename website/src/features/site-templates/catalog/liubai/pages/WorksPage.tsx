import type { SiteTemplatePageProps } from '../../../types'
import { WORKS, groupWorksByCategory } from '../data'
import { Section } from '../components/SectionHeading'
import { SiteShell } from '../components/SiteShell'
import { ScrollGroup } from '../components/Motion'
import { WorkCard } from '../components/WorkCard'
import '../theme.css'

const GROUPS = groupWorksByCategory()

export default function WorksPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  return (
    <SiteShell basePath={basePath} activeSlug="works" locale={locale}>
      <PageHero locale={locale} />

      {/* 按类型静态分组陈列，不做筛选交互：
          十二个项目一屏能扫完，加一层筛选只是多一次点击，并不让人更快找到东西。 */}
      {GROUPS.map(({ spec, works }) => (
        <Section key={spec.id}>
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b border-[var(--tpl-rule)] pb-4">
            <h2 className="tpl-display text-[28px]">{spec.label}</h2>
            <span className="tpl-num text-[14px] text-[var(--tpl-ink-faint)]">
              {works.length} 个项目
            </span>
            <p className="ml-auto max-w-[420px] text-[14px] text-[var(--tpl-ink-dim)]">{spec.note}</p>
          </div>

          <ScrollGroup className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} basePath={basePath} variant="detail" />
            ))}
          </ScrollGroup>
        </Section>
      ))}
    </SiteShell>
  )
}

function PageHero({ locale }: { locale: 'zh' | 'en' }) {
  const en = locale === 'en'
  const years = WORKS.map((work) => work.year)
  const earliest = Math.min(...years)
  const latest = Math.max(...years)
  // 客户数按客户名去重：同一个客户的两个项目不该数成两家
  const clientCount = new Set(WORKS.map((work) => work.client)).size

  return (
    <section className="tpl-page-hero px-6 pb-4">
      <div className="mx-auto max-w-[1152px]">
        <span className="tpl-pill">{en ? 'Selected work' : '作品'}</span>
        <h1 className="tpl-display tpl-display-xl mt-6">
          {en ? 'Twelve projects,' : '十二个项目，'}
          <br />
          <span className="text-[var(--tpl-ink-faint)]">{en ? 'organised by kind' : '按类型排开'}</span>
        </h1>
        <p className="mt-6 max-w-[560px] tpl-lead text-[var(--tpl-ink-dim)]">
          全部为已交付并上线的项目。每个项目下面那句话，是它真正解决的问题；
          完整过程稿可在沟通时提供。
        </p>

        <dl className="mt-12 flex flex-wrap gap-x-14 gap-y-6 border-t border-[var(--tpl-rule)] pt-8">
          <div>
            <dt className="text-[15px] text-[var(--tpl-ink-dim)]">收录项目</dt>
            <dd className="tpl-display tpl-num mt-2 text-[32px] leading-none">{WORKS.length}</dd>
          </div>
          <div>
            <dt className="text-[15px] text-[var(--tpl-ink-dim)]">服务客户</dt>
            <dd className="tpl-display tpl-num mt-2 text-[32px] leading-none">{clientCount}</dd>
          </div>
          <div>
            <dt className="text-[15px] text-[var(--tpl-ink-dim)]">项目年份</dt>
            <dd className="tpl-display tpl-num mt-2 text-[32px] leading-none">
              {earliest}–{latest}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
