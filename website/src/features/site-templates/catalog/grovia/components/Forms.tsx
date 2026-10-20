'use client'

import { useId, useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useCopy } from './Locale'

export function DemoForm({ newsletter = false }: { newsletter?: boolean }) {
  const { t } = useCopy()
  const [status, setStatus] = useState<'idle' | 'invalid' | 'validated'>('idle')
  const id = useId()
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const email = String(data.get('email') ?? '').trim()
    const name = String(data.get('name') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    const valid = form.checkValidity() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (newsletter || (name.length >= 2 && message.length >= 10))
    setStatus(valid ? 'validated' : 'invalid')
    // 只记录校验路径与状态，姓名、邮箱和留言内容均不写入日志。
    console.debug('[grovia] demo-form', { form: newsletter ? 'newsletter' : 'contact', state: valid ? 'validated' : 'invalid', persisted: false })
  }
  return <form className={newsletter ? 'gv-newsletter' : 'gv-form gv-dark-glass'} onSubmit={submit} noValidate aria-label={newsletter ? t('订阅演示', 'Newsletter demo') : t('联系演示', 'Contact demo')} aria-describedby={`${id}-status`} onChange={() => { if (status !== 'idle') setStatus('idle') }}>
    {!newsletter && <label htmlFor={`${id}-name`}>{t('姓名', 'Name')}<input id={`${id}-name`} name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder={t('你的姓名', 'Your name')} /></label>}
    <label htmlFor={`${id}-email`} className={newsletter ? 'gv-newsletter-label' : ''}>{newsletter ? <span className="gv-sr-only">{t('邮箱地址', 'Email address')}</span> : t('邮箱', 'Email')}<input id={`${id}-email`} name="email" type="email" required maxLength={254} autoComplete="email" placeholder="name@example.com" /></label>
    {!newsletter && <label htmlFor={`${id}-message`}>{t('留言', 'Message')}<textarea id={`${id}-message`} name="message" required minLength={10} maxLength={3000} rows={4} placeholder={t('聊聊你的团队与目标（至少 10 个字）', 'Tell us about your team and goals (at least 10 characters)')} /></label>}
    <motion.button type="submit" className="gv-button gv-yellow" whileTap={{ scale: 0.98 }}>{newsletter ? t('订阅', 'Subscribe') : t('提交留言', 'Submit message')}<span aria-hidden="true">↗</span></motion.button>
    <p id={`${id}-status`} role="status" className={`gv-form-status ${status === 'invalid' ? 'gv-error' : ''}`}>{status === 'validated' ? t('内容已通过本地校验，尚未发送或保存。', 'Validated locally. Nothing has been sent or saved.') : status === 'invalid' ? newsletter ? t('请输入有效的邮箱地址。', 'Enter a valid email address.') : t('请填写姓名（至少 2 个字）、有效邮箱和留言（至少 10 个字）。', 'Enter a name (2+ characters), a valid email and a message (10+ characters).') : t('演示表单仅做本地校验，内容尚未发送或保存。', 'Demo form: local validation only. Nothing is sent or saved.')}</p>
  </form>
}
