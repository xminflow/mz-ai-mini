'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { Button, Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'

export default function NotFoundPage({ basePath, locale }: SiteTemplatePageProps) {
  const { t } = useCopy(locale)
  return <Shell basePath={basePath} locale={locale}><div className="vl-main-container vl-subpage" style={{ textAlign: 'center' }}><p className="vl-kicker">404</p><h1>{t('这个页面不存在', 'Whoops, that page does not exist')}</h1><p className="vl-subpage-intro" style={{ marginInline: 'auto' }}>{t('回到首页，继续探索 微域生光。', 'Go back home and keep exploring 微域生光.')}</p><div style={{ marginTop: 35 }}><Button href={basePath}>{t('回到首页', 'Go home')}</Button></div></div></Shell>
}
