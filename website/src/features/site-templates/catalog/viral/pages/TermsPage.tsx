'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'

export default function TermsPage({ basePath, locale }: SiteTemplatePageProps) {
  const { t } = useCopy(locale)
  return <Shell basePath={basePath} locale={locale}><div className="vl-main-container vl-subpage vl-article"><p className="vl-kicker">{t('法律', 'Legal')}</p><h1>{t('服务条款', 'Terms of service')}</h1><p className="vl-subpage-intro">{t('本页面用于展示模板的政策信息架构。正式项目上线前，请由业务方补充适用地区、服务范围和数据处理条款。', 'This page demonstrates the policy information architecture. Before launch, replace it with terms for the applicable region, scope, and data processing.')}</p><h2>{t('使用范围', 'Use of this site')}</h2><p>{t('你可以浏览、分享和评估这套模板。页面中的案例与图片仅用于内部演示。', 'You may browse, share, and evaluate this template. Case studies and images are presented for internal demonstration.')}</p><h2>{t('内容准确性', 'Content accuracy')}</h2><p>{t('示例指标、品牌名和联系方式均为演示内容，正式发布前应由业务方确认。', 'Example metrics, brand names, and contact details are demo content and should be confirmed before publication.')}</p></div></Shell>
}
