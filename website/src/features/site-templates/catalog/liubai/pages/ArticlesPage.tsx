import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import type { Article } from '../data'
import { FEATURED_ARTICLE, REST_ARTICLES, workPhoto } from '../data'
import { Reveal, ScrollGroup } from '../components/Motion'
import { Section } from '../components/SectionHeading'
import { ArrowIcon, SiteShell, hrefFor } from '../components/SiteShell'
import '../theme.css'

/**
 * 文章页，对应参考站导航里的 Articles。
 *
 * 结构是「一篇头条大卡 + 其余按两列排开」，而不是一排等大的卡片：
 * 没有主次的博客列表读起来像一张目录，谁都不会点第一篇。
 *
 * 配图复用作品照片：这套模板没有为文章单独准备图，
 * 与其为六篇文章各配一张不相干的图库照，不如让文章指回它谈论的那个项目。
 */
const ARTICLE_PHOTO: Record<string, string> = {
  'design-system-first': 'yuntu',
  'why-clients-ask-for-more-options': 'chaoxi',
  'handoff-that-does-not-need-explaining': 'zhiliao',
  'typography-for-chinese-ui': 'jianshan',
  'a-brand-is-not-a-logo': 'shiguang',
  'saying-no-to-projects': 'fangtang',
}

function photoFor(article: Article): string {
  // 映射写错时不该静默变成 404 图，直接落到一张确定存在的图上
  return workPhoto(ARTICLE_PHOTO[article.id] ?? 'chaoxi')
}

export default function ArticlesPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  return (
    <SiteShell basePath={basePath} activeSlug="articles" locale={locale}>
      <PageHero locale={locale} />
      <FeaturedArticle basePath={basePath} />
      <ArticleGrid basePath={basePath} />
    </SiteShell>
  )
}

function PageHero({ locale }: { locale: 'zh' | 'en' }) {
  const en = locale === 'en'
  return (
    <section className="tpl-page-hero px-6 pb-4">
      <div className="mx-auto max-w-[1152px]">
        <span className="tpl-pill">{en ? 'Journal' : '文章'}</span>
        <h1 className="tpl-display tpl-display-xl mt-6">
          {en ? 'Things we think through,' : '做项目时想清楚的事，'}
          <br />
          <span className="text-[var(--tpl-ink-faint)]">{en ? 'written down' : '写下来'}</span>
        </h1>
        <p className="mt-6 max-w-[560px] tpl-lead text-[var(--tpl-ink-dim)]">
          不写行业趋势，也不写工具测评。只写我们在真实项目里踩过、想明白了、
          并且下一个项目还会继续用的那些判断。
        </p>
      </div>
    </section>
  )
}

/** 头条：一整行的横向大卡，左图右文。 */
function FeaturedArticle({ basePath }: { basePath: string }) {
  const article = FEATURED_ARTICLE

  return (
    <Section>
      <Link href={hrefFor(basePath, 'articles')} className="group block">
        <Reveal className="tpl-card grid overflow-hidden lg:grid-cols-[1.1fr_1fr]">
          <div className="aspect-[16/10] overflow-hidden bg-[var(--tpl-paper-2)] lg:aspect-auto">
            <img
              src={photoFor(article)}
              alt=""
              loading="lazy"
              decoding="async"
              className="tpl-photo"
            />
          </div>

          <div className="flex flex-col justify-center p-8 sm:p-12">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--tpl-ink-faint)]">
              <span className="rounded-full bg-[var(--tpl-surface)] px-2.5 py-1 text-[var(--tpl-ink-dim)]">
                {article.category}
              </span>
              <span className="tpl-num">{article.date}</span>
              <span aria-hidden>·</span>
              <span>{article.readTime}</span>
            </div>

            <h2 className="tpl-display mt-6 text-[28px] sm:text-[34px]">{article.title}</h2>
            <p className="mt-4 tpl-copy text-[var(--tpl-ink-dim)]">
              {article.excerpt}
            </p>

            <span className="mt-8 inline-flex items-center gap-2 text-[16px] font-medium">
              读这一篇
              <ArrowIcon className="w-4" />
            </span>
          </div>
        </Reveal>
      </Link>
    </Section>
  )
}

/** 其余文章：两列，图在上、信息在下。 */
function ArticleGrid({ basePath }: { basePath: string }) {
  return (
    <Section>
      <div className="flex flex-wrap items-baseline gap-x-5 border-b border-[var(--tpl-rule)] pb-4">
        <h2 className="tpl-display text-[28px]">更多文章</h2>
        <span className="tpl-num text-[14px] text-[var(--tpl-ink-faint)]">
          {REST_ARTICLES.length} 篇
        </span>
      </div>

      <ScrollGroup className="mt-12 grid gap-x-6 gap-y-14 sm:grid-cols-2">
        {REST_ARTICLES.map((article) => (
          <Link key={article.id} href={hrefFor(basePath, 'articles')} className="group block">
            <div className="aspect-[16/9] overflow-hidden rounded-[24px] bg-[var(--tpl-paper-2)]">
              <img
                src={photoFor(article)}
                alt=""
                loading="lazy"
                decoding="async"
                className="tpl-photo"
              />
            </div>

            <div className="mt-5 flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-[var(--tpl-ink-faint)]">
                  <span>{article.category}</span>
                  <span aria-hidden>·</span>
                  <span className="tpl-num">{article.date}</span>
                  <span aria-hidden>·</span>
                  <span>{article.readTime}</span>
                </div>
                <h3 className="tpl-title mt-2 text-[20px]">{article.title}</h3>
                <p className="mt-2 tpl-copy text-[var(--tpl-ink-dim)]">
                  {article.excerpt}
                </p>
              </div>

              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--tpl-surface)] text-[var(--tpl-ink-dim)] transition-colors group-hover:bg-[var(--tpl-ink)] group-hover:text-[var(--tpl-ink-invert)]">
                <ArrowIcon className="w-4" />
              </span>
            </div>
          </Link>
        ))}
      </ScrollGroup>
    </Section>
  )
}
