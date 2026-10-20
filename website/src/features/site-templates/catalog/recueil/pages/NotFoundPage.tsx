import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import { asset, images, t } from '../data'
import { Reveal, Shell } from '../components/Shell'

export default function NotFoundPage({basePath,locale='zh'}:SiteTemplatePageProps){
  return <Shell basePath={basePath} locale={locale}><section className="rc-not-found rc-container"><div className="rc-error-orb" aria-hidden="true"><img src={asset(images.halo)} alt="" width="700" height="700" /></div><Reveal><span className="rc-eyebrow">{t(locale,'页面未找到','Page not found')}</span><span className="rc-404" aria-hidden="true">404</span><h1>{t(locale,'这一缕香气','This scent has')}<br /><em>{t(locale,'暂时迷了路','wandered away.')}</em></h1><p>{t(locale,'你寻找的页面也许已移至别处。回到工坊，重新发现一份值得停留的气味。','The page you wanted may have moved. Return to the atelier and begin a fresh discovery.')}</p><Link className="rc-button" href={basePath}>{t(locale,'返回工坊首页','Back to the atelier')}</Link></Reveal></section></Shell>
}
