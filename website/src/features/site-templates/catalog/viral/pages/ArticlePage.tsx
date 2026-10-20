'use client'

import type { SiteTemplatePageProps } from '../../../types'
import { Button, Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'

export default function ArticlePage({ basePath, locale }: SiteTemplatePageProps) {
  const { t } = useCopy(locale)
  return <Shell basePath={basePath} locale={locale}><div className="vl-main-container vl-subpage vl-article"><p className="vl-kicker">{t('策略 · 6 分钟阅读', 'Strategy · 6 min read')}</p><h1>{t('短视频增长方法：从第一秒开始', 'The short-form playbook: start with the first second')}</h1><p className="vl-subpage-intro">{t('内容不需要更吵，它需要更清楚。下面是我们为品牌设计短视频时反复使用的四个原则。', 'Content does not need to be louder. It needs to be clearer. These are four principles we use again and again when designing short-form video for brands.')}</p><h2>{t('1. 先说观众在乎的事', '1. Start with what the audience cares about')}</h2><p>{t('第一秒不是品牌介绍，而是一个具体的承诺。让观众马上知道这条内容为什么与自己有关，再用画面和节奏兑现它。', 'The first second is not a brand introduction. It is a specific promise. Make the viewer understand why this matters to them, then use visual rhythm to deliver on it.')}</p><h2>{t('2. 一条内容只完成一个动作', '2. One piece, one action')}</h2><p>{t('关注、收藏、点击或购买都可以，但不要让一条视频同时承担所有目标。单一的行动让脚本、镜头和 CTA 都更有力量。', 'A follow, save, click, or purchase can all be valid. Asking one video to do everything makes the script and CTA weaker.')}</p><h2>{t('3. 把评论当成下一轮选题', '3. Let comments shape the next brief')}</h2><p>{t('评论区是最便宜的用户研究。记录反复出现的问题，把它们变成下一条内容，品牌会越来越贴近真实受众。', 'Comments are the cheapest form of user research. Capture repeated questions and turn them into the next brief to get closer to the real audience.')}</p><div style={{ marginTop: 40 }}><Button href={`${basePath}/book-a-call`}>{t('为你的品牌做一套策略', 'Build a strategy for your brand')}</Button></div></div></Shell>
}
