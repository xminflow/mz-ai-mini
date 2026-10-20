'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { Button, Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'

export default function AboutPage({ basePath, locale }: SiteTemplatePageProps) {
  const { t } = useCopy(locale)
  return <Shell basePath={basePath} locale={locale}><div className="vl-main-container vl-subpage"><p className="vl-kicker">{t('关于 微域生光', 'About 微域生光')}</p><h1>{t('把社交媒体变成真正的增长渠道', 'Social media that becomes a real growth channel')}</h1><p className="vl-subpage-intro">{t('我们是一支小而专注的社交媒体团队，帮助创作者、企业与品牌找到自己的声音，持续出现在受众面前，并把关注转化为业务。', 'We are a focused social media team helping creators, businesses, and brands find their voice, show up consistently, and turn attention into business.')}</p><div className="vl-subpage-grid"><article className="vl-card vl-subpage-card"><p className="vl-kicker">01</p><h2>{t('有目的地创作', 'Create with purpose')}</h2><p>{t('每条内容都从目标、受众和品牌语气出发，不追逐没有意义的趋势。', 'Every piece starts with a goal, an audience, and a clear brand voice instead of chasing empty trends.')}</p></article><article className="vl-card vl-subpage-card"><p className="vl-kicker">02</p><h2>{t('持续复盘', 'Improve consistently')}</h2><p>{t('我们用清晰的指标了解什么有效，再把经验变成下一轮内容。', 'We use clear signals to understand what works, then turn that learning into the next round of content.')}</p></article></div><div style={{ marginTop: 45 }}><Button href={`${basePath}/book-a-call`}>{t('聊聊你的品牌', 'Talk about your brand')}</Button></div></div></Shell>
}
