'use client'
import { useState } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { Button, Shell } from '../components/Shell'
import { useCopy } from '../components/Locale'

function ContactContent() {
  const { t } = useCopy()
  const [submitted, setSubmitted] = useState(false)

  return <>
    <header className="cc-page-header"><span className="cc-pill">{t('让我们聊聊', 'LET’S TALK')}</span><h1>{t('开始构建你的自动化系统。', 'Build your automation system.')}</h1><p>{t('告诉我们目前最耗时的工作，我们会一起找到高回报的自动化机会。', 'Tell us what is taking the most time. We will find the highest-ROI automation opportunities together.')}</p></header>
    <section className="cc-contact-page cc-section"><form className="cc-form" onSubmit={event => { event.preventDefault(); setSubmitted(true) }}><input required autoComplete="name" placeholder={t('姓名', 'Name')} /><input required type="email" placeholder={t('邮箱', 'Email')} /><textarea required rows={6} placeholder={t('告诉我们你的目标', 'Tell us about your goals')} /><Button type="submit">{t('发送请求', 'Send Your Request!')}</Button>{submitted && <p className="cc-form-status" role="status">{t('感谢你的留言。演示表单尚未发送。', 'Thanks — your request is ready. This demo does not send data.')}</p>}</form></section>
  </>
}

export default function ContactPage(props: SiteTemplatePageProps) {
  return <Shell {...props}><ContactContent /></Shell>
}
