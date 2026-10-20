'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'

export default function PrivacyPage({ basePath, locale }: SiteTemplatePageProps) {
  const { t } = useCopy(locale)
  return <Shell basePath={basePath} locale={locale}><div className="vl-main-container vl-subpage vl-article"><p className="vl-kicker">{t('法律', 'Legal')}</p><h1>{t('隐私政策', 'Privacy policy')}</h1><p className="vl-subpage-intro">{t('这是模板演示用的隐私页面。我们只在你主动提交联系表单时使用你填写的信息，不会在本地演示中保存或发送。', 'This is a template privacy page. We only use information you choose to enter in a contact form, and this local demo does not save or send it.')}</p><h2>{t('我们收集什么', 'What we collect')}</h2><p>{t('浏览页面时不会要求登录。联系表单中的姓名、邮箱和留言只用于演示确认。', 'No login is required to browse. Name, email, and message fields are used only for the demo confirmation.')}</p><h2>{t('联系我们', 'Contact')}</h2><p><a href="mailto:hello@weelume.com">hello@weelume.com</a></p></div></Shell>
}
