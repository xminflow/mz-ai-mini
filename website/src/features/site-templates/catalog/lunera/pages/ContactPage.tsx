'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import type { SiteTemplatePageProps } from '../../../types'
import { getContent } from '../content'
import { getTranslator, type MessageKey } from '../messages'
import { Reveal } from '../components/Motion'
import { Faq, Icon, LuneraShell, SectionHeading, type IconName } from '../components/Shared'
import { Partners } from '../components/Partners'
import '../theme.css'

export default function ContactPage({ basePath, locale = 'zh' }: SiteTemplatePageProps) {
  const t = getTranslator(locale)
  const { contactFaq } = getContent(locale)
  const contactOptions: Array<{ icon: IconName; title: string; text: string; label: string; href: string }> = [
    { icon: 'mail', title: t("邮件联系"), text: t("告诉我们你的需求。以下为演示邮箱，上线前请配置实际联系方式。"), label: 'hello@example.com', href: 'mailto:hello@example.com' },
    { icon: 'phone', title: t("咨询销售"), text: t("欢迎与我们交流计划，服务时间为周一至周五 9:00—18:00。"), label: '+1 (800) 123-4567', href: 'tel:+18001234567' },
    { icon: 'discord', title: t("加入 Discord 社区"), text: t("结识社区伙伴，分享想法，了解产品新动态。"), label: t("点击加入"), href: 'https://discord.com/' },
  ]

  const [status, setStatus] = useState<MessageKey | ''>('')
  const reduced = useReducedMotion()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    if (!name || !message) {
      setStatus('请填写姓名和留言内容后再提交。')
      console.debug('[lunera:contact] Local validation failed', { field: !name ? 'name' : 'message' })
      return
    }
    // 模板预览只校验，不虚构发送成功，也不将联系信息写入日志或持久化。
    setStatus('内容已通过校验。当前为本地预览，留言尚未发送或保存。')
    console.debug('[lunera:contact] Local preview validated', { topic: data.get('topic'), messageLength: message.length, sent: false })
  }
  return <LuneraShell basePath={basePath} locale={locale}><section className="ln-contact-page ln-container"><SectionHeading level={1} badge={t("联系我们")} title={t("有任何问题，我们乐意为你解答。")} description={t("无论是产品咨询还是使用建议，都欢迎与我们交流。")} />
    <Reveal className="ln-contact-form-wrap"><form className="ln-contact-form" onSubmit={submit} aria-describedby="ln-contact-demo"
      onInvalid={event => {
        const field = event.target
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
          field.setCustomValidity(field.validity.typeMismatch ? t("请输入有效的电子邮箱地址。") : t("请完整填写此项内容。"))
        }
      }}
      onInput={event => {
        const field = event.target
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) field.setCustomValidity('')
      }}>
      <label htmlFor="ln-name">{t("姓名")}</label><input id="ln-name" name="name" placeholder={t("请输入你的姓名")} autoComplete="name" required maxLength={100} onChange={() => setStatus('')} />
      <label htmlFor="ln-email">{t("电子邮箱")}</label><input id="ln-email" name="email" type="email" placeholder={t("请输入常用邮箱")} autoComplete="email" required maxLength={254} onChange={() => setStatus('')} />
      <label htmlFor="ln-topic">{t("咨询主题")}</label><select id="ln-topic" name="topic" required defaultValue="" onChange={() => setStatus('')}><option value="" disabled>{t("请选择咨询主题")}</option><option value="support">{t("使用支持")}</option><option value="plan">{t("套餐咨询")}</option></select>
      <label htmlFor="ln-message">{t("留言内容")}</label><textarea id="ln-message" name="message" placeholder={t("请描述你的问题或需求")} required maxLength={5000} rows={4} onChange={() => setStatus('')} />
      <motion.button type="submit" className="ln-button" whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: 0.97 }}>{t("提交留言")}</motion.button>
      <p className="ln-form-note" id="ln-contact-demo">{t("演示表单 · 仅校验内容，留言尚未发送。")}</p>
      <AnimatePresence initial={false}>{status && <motion.p className="ln-form-status" role="status" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>{t(status)}</motion.p>}</AnimatePresence>
    </form></Reveal>
    <div className="ln-contact-options">{contactOptions.map((option, i) => <Reveal key={option.title} delay={i * 0.08}><span className="ln-contact-icon"><Icon name={option.icon} /></span><h3>{option.title}</h3><p>{option.text}</p><a href={option.href} target={option.href.startsWith('https') ? '_blank' : undefined} rel="noreferrer">{option.label}<Icon name="arrow" /></a></Reveal>)}</div>
    <Partners contact />
  </section><Faq basePath={basePath} contact items={contactFaq} /></LuneraShell>
}
