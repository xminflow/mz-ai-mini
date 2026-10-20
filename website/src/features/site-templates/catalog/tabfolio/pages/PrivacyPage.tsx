'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { PageIntro, Shell, t } from '../components/Shell'
export default function PrivacyPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) { return <Shell basePath={basePath} locale={locale}><PageIntro locale={locale} title={t(locale, '隐私政策', 'Privacy policy')} /><section className="tf-section tf-legal"><p>{t(locale, '本模板仅用于作品集展示。演示表单不会发送或保存个人信息；站点不主动收集访问者的姓名、邮箱或浏览记录。', 'This template is for portfolio presentation. The demo form does not send or store personal information, and the site does not actively collect names, emails, or browsing history.')}</p><p>{t(locale, '如需了解模板实现或删除本地演示数据，请联系 hello@aiko.com。', 'For questions about the template or local demo data, contact hello@aiko.com.')}</p></section></Shell> }

