'use client'

import { useState, type FormEvent } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'

export default function ContactPage({ basePath, locale }: SiteTemplatePageProps) {
  const { t } = useCopy(locale)
  const [submitted, setSubmitted] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSubmitted(true) }
  return <Shell basePath={basePath} locale={locale}><div className="vl-main-container vl-subpage vl-contact-page"><p className="vl-kicker">{t('开始合作', 'Get started')}</p><h1>{t('你的增长之旅，就从这里开始', 'Your growth journey starts right here')}</h1><p className="vl-subpage-intro">{t('预约一次免费的 30 分钟策略通话，我们会一起找到最值得先做的事。', 'Book a free 30-minute strategy call and we will find the best place to start.')}</p><form className="vl-form" onSubmit={submit}><label>{t('姓名', 'Name')}<input name="name" required autoComplete="name" /></label><label>{t('邮箱', 'Email')}<input name="email" type="email" required autoComplete="email" /></label><label>{t('告诉我们你的目标', 'Tell us about your goals')}<textarea name="message" required /></label><button className="vl-button" type="submit">{t('提交请求', 'Send request')}<span aria-hidden="true">↗</span></button>{submitted && <p className="vl-form-status" role="status">{t('谢谢，演示表单已完成本地校验，尚未发送数据。', 'Thanks. This demo form passed local validation and does not send data.')}</p>}</form></div></Shell>
}
