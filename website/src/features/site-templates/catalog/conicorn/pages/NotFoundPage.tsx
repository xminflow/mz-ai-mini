'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { Button, Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'
import '../theme.css'

function NotFoundContent({ basePath }: SiteTemplatePageProps) {
  const { t } = useCopy()
  return <header className="cc-page-header cc-error-page"><span className="cc-pill">404 / {t('页面不存在', 'PAGE NOT FOUND')}</span><h1>{t('这条路径还没有内容。', 'This path is still a blank canvas.')}</h1><p>{t('返回首页，继续探索 Conicorn 的自动化系统。', 'Return home and keep exploring Conicorn’s automation systems.')}</p><Button href={basePath}>{t('返回首页', 'Back Home')}</Button></header>
}

export default function NotFoundPage(props: SiteTemplatePageProps) {
  return <Shell {...props}><NotFoundContent {...props} /></Shell>
}
