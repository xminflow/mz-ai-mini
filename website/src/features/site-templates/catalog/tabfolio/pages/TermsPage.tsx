'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { PageIntro, Shell, t } from '../components/Shell'
export default function TermsPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) { return <Shell basePath={basePath} locale={locale}><PageIntro locale={locale} title={t(locale, '服务条款', 'Terms of service')} /><section className="tf-section tf-legal"><p>{t(locale, '本页面及其素材用于展示 Tabfolio Pro 风格的本地模板。页面中的项目名称、数字和联系人均为演示内容。', 'This page and its assets are a local template inspired by Tabfolio Pro. Project names, metrics, and contact details are demonstration content.')}</p><p>{t(locale, '使用模板时请替换为你自己的品牌、作品和联系方式，并遵守相关素材的许可要求。', 'When using the template, replace the brand, work, and contact details with your own and follow the licenses for any assets you add.')}</p></section></Shell> }

