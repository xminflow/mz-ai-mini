import Link from 'next/link'
import type { Work } from '../data'
import { getCategoryLabel, workPhoto } from '../data'
import { ArrowIcon, hrefFor } from './SiteShell'

/**
 * 作品卡。
 *
 * 两种形态：
 * - `compact`（首页精选）：**整张是一块白卡**——图片满宽在上，下面一条只有项目名与箭头的行。
 *   参考站就是这个构造：图和名字属于同一张卡，而不是"图片下面跟一段文字"。
 * - `detail`（作品页）：多一行元信息、一句话与交付内容，读者到了作品页就是来看细节的。
 *
 * 整张卡链接到作品页而不是作品详情页——本端没有详情页，
 * 指向不存在的 slug 会被 catch-all 直接 404。
 */
interface WorkCardProps {
  work: Work
  basePath: string
  variant?: 'compact' | 'detail'
}

export function WorkCard({ work, basePath, variant = 'compact' }: WorkCardProps) {
  const alt = `${work.name}｜${getCategoryLabel(work.category)}`

  if (variant === 'compact') {
    return (
      <Link href={hrefFor(basePath, 'works')} className="tpl-card group block overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden bg-[var(--tpl-paper-2)]">
          <img
            src={workPhoto(work.id)}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="tpl-photo"
          />
        </div>

        <div className="flex items-center gap-4 px-7 py-5">
          <h3 className="tpl-title min-w-0 flex-1 truncate text-[20px]">{work.name}</h3>
          <span className="shrink-0 text-[var(--tpl-ink-faint)] transition-colors group-hover:text-[var(--tpl-ink)]">
            <ArrowIcon className="w-4" />
          </span>
        </div>
      </Link>
    )
  }

  return (
    <Link href={hrefFor(basePath, 'works')} className="group block">
      {/* overflow-hidden 必须在框上：hover 时缩放的是 <img>，由这一层裁掉溢出部分 */}
      <div className="aspect-[4/3] overflow-hidden rounded-[24px] bg-[var(--tpl-paper-2)]">
        <img
          src={workPhoto(work.id)}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="tpl-photo"
        />
      </div>

      <div className="mt-6 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-[var(--tpl-ink-faint)]">
            <span>{getCategoryLabel(work.category)}</span>
            <span aria-hidden>·</span>
            <span>{work.client}</span>
            <span aria-hidden>·</span>
            <span className="tpl-num">{work.year}</span>
          </div>

          {/* 作品名走无衬线：衬线在这套版面里是稀缺资源，只留给 h1 与 section 大标题 */}
          <h3 className="tpl-title mt-2 text-[20px]">{work.name}</h3>

          <p className="mt-2 tpl-copy text-[var(--tpl-ink-dim)]">
            {work.brief}
          </p>
          <p className="mt-3 text-[13px] text-[var(--tpl-ink-faint)]">{work.scope}</p>
        </div>

        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--tpl-surface)] text-[var(--tpl-ink-dim)] transition-colors group-hover:bg-[var(--tpl-ink)] group-hover:text-[var(--tpl-ink-invert)]">
          <ArrowIcon className="w-4" />
        </span>
      </div>
    </Link>
  )
}
