'use client'

import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'

export default function BlogPage({ basePath, locale }: SiteTemplatePageProps) {
  const { t } = useCopy(locale)
  return <Shell basePath={basePath} locale={locale}><div className="vl-main-container vl-subpage"><p className="vl-kicker">{t('博客', 'Blog')}</p><h1>{t('关于内容、增长与社交媒体的想法', 'Thoughts on content, growth, and social')}</h1><div className="vl-subpage-grid"><Link className="vl-card vl-subpage-card" href={`${basePath}/blog/short-form-playbook`}><p className="vl-kicker">{t('策略 · 6 分钟', 'Strategy · 6 min')}</p><h2>{t('短视频增长方法：从第一秒开始', 'The short-form playbook: start with the first second')}</h2><p>{t('如何设计一个能让人停下来的开头，并把观看变成行动。', 'How to design an opening that stops the scroll and turns attention into action.')}</p><span aria-hidden="true">↗</span></Link><article className="vl-card vl-subpage-card"><p className="vl-kicker">{t('幕后 · 4 分钟', 'Behind the scenes · 4 min')}</p><h2>{t('为什么我们按月合作', 'Why we work month to month')}</h2><p>{t('灵活的合作关系让每一个月都必须用结果赢得信任。', 'Flexible partnerships mean earning trust with results every month.')}</p></article></div></div></Shell>
}
