'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import type { TemplateLocale } from '../../../types'
import { asset, faqs, images, materials, pick, plans, t } from '../data'

export function HeroMedia() {
  const [playing, setPlaying] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => { if (media.matches) { video.current?.pause(); setPlaying(false) } else video.current?.play().then(() => setPlaying(true)).catch((error: unknown) => { console.debug('[recueil] 背景视频未自动播放，保留静态海报', { reason: error instanceof Error ? error.name : 'unknown' }); setPlaying(false) }) }
    change(); media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])
  return <div className="rc-hero-media" aria-hidden="true"><img src={asset(images.hero)} alt="" fetchPriority="high" /><video ref={video} muted loop playsInline preload="metadata" poster={asset(images.hero)} style={{ opacity: playing ? 1 : 0 }}><source src={asset(images.heroVideo)} type="video/mp4" /></video></div>
}

export function Palette({ locale }: { locale: TemplateLocale }) {
  const [active, setActive] = useState(0)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const current = materials[active]
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next: number
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % materials.length
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i + materials.length - 1) % materials.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = materials.length - 1
    else return
    e.preventDefault(); setActive(next); buttons.current[next]?.focus()
  }
  return <div className="rc-palette"><div className="rc-material-tabs" role="tablist" aria-label={t(locale, '香氛原料', 'Fragrance materials')} aria-orientation="vertical">{materials.map((material, i) => <button key={material.latin} ref={e => { buttons.current[i] = e }} id={`rc-material-${i}`} role="tab" type="button" aria-selected={active === i} aria-controls="rc-material-panel" tabIndex={active === i ? 0 : -1} onClick={() => setActive(i)} onKeyDown={e => onKey(e, i)}><span>0{i + 1}</span>{pick(locale, material.name)}</button>)}</div><div id="rc-material-panel" className="rc-glass rc-material-panel" role="tabpanel" aria-labelledby={`rc-material-${active}`} tabIndex={0}><AnimatePresence mode="wait"><motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}><img src={asset(current.image)} alt={pick(locale, current.name)} width="800" height="600" /><div className="rc-material-copy"><h3>{pick(locale, current.name)}</h3><span className="rc-eyebrow">{current.latin}</span><p>{pick(locale, current.description)}</p><dl>{[[t(locale, '香调位置', 'Position'), current.position], [t(locale, '来源', 'Origin'), current.origin], [t(locale, '工艺', 'Method'), current.method]].map(([label, value]) => <div key={label as string}><dt>{label as string}</dt><dd>{pick(locale, value as readonly [string, string])}</dd></div>)}</dl></div></motion.div></AnimatePresence></div></div>
}

export function FAQ({ locale }: { locale: TemplateLocale }) {
  const [open, setOpen] = useState<number | null>(null)
  return <div className="rc-faq">{faqs.map((faq, i) => <div className="rc-faq-item" key={i}><h3><button type="button" aria-expanded={open === i} aria-controls={`rc-answer-${i}`} onClick={() => setOpen(open === i ? null : i)}><small>0{i + 1}</small><span>{pick(locale, faq.question)}</span><span className="rc-plus" aria-hidden="true">{open === i ? '−' : '+'}</span></button></h3><AnimatePresence>{open === i && <motion.div id={`rc-answer-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .2 }}><p>{pick(locale, faq.answer)}</p></motion.div>}</AnimatePresence></div>)}</div>
}

export function Newsletter({ locale }: { locale: TemplateLocale }) {
  const [message, setMessage] = useState('')
  const [invalid, setInvalid] = useState(false)
  const email = useRef<HTMLInputElement>(null)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.current?.value.trim() ?? '')
    setInvalid(!valid)
    setMessage(valid ? t(locale, '邮箱格式已通过本地校验，尚未发送、保存或订阅。', 'Email validated locally. Nothing was sent, saved or subscribed.') : t(locale, '请输入有效的电子邮箱。', 'Enter a valid email address.'))
    if (!valid) email.current?.focus()
  }
  return <form className="rc-newsletter-form" onSubmit={submit} noValidate><label htmlFor="rc-letter-email">{t(locale, '电子邮箱', 'Email address')}</label><div className="rc-email-row"><input ref={email} id="rc-letter-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required aria-invalid={invalid} aria-describedby="rc-letter-result rc-letter-note" onChange={() => { setMessage(''); setInvalid(false) }} /><button className="rc-button" type="submit">{t(locale, '订阅来信', 'Join the letters')}</button></div><p id="rc-letter-note" className="rc-form-note">{t(locale, '本地演示 · 不发送或保存邮箱', 'Local demo · No email is sent or saved')}</p><p id="rc-letter-result" className={invalid ? 'rc-error' : 'rc-success'} role="status">{message}</p></form>
}

export function Pricing({ locale }: { locale: TemplateLocale }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState('')
  const [invalid, setInvalid] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLButtonElement | null>(null)
  const first = useRef<HTMLInputElement>(null)
  const plan = plans.find(p => p.id === selected)
  // 方案变化会重建表单；待新表单挂载后再打开弹窗并聚焦，避免焦点落在已卸载的输入上。
  useEffect(() => { if (selected) { dialog.current?.showModal(); first.current?.focus() } }, [selected])
  function open(id: string, button: HTMLButtonElement) {
    opener.current = button; setSelected(id); setResult(''); setInvalid(false)
  }
  function close() { dialog.current?.close(); opener.current?.focus() }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get('name') ?? '').trim(), email = String(data.get('email') ?? '').trim()
    const valid = name.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && data.get('consent') === 'on'
    setInvalid(!valid)
    setResult(valid ? t(locale, '本地校验完成，未发送或保存，也未创建订阅、订单或扣款。', 'Validated locally. Nothing was sent or saved. No subscription, order or payment was created.') : t(locale, '请填写姓名、有效邮箱，并确认演示说明。', 'Enter your name, a valid email, and confirm the demo notice.'))
    if (!valid) { const target = !name ? '[name="name"]' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '[name="email"]' : '[name="consent"]'; e.currentTarget.querySelector<HTMLElement>(target)?.focus() }
  }
  return <><div className="rc-plans">{plans.map((p, i) => <motion.article key={p.id} className={`rc-glass rc-plan${i === 1 ? ' is-featured' : ''}`} whileHover={{ y: -5 }} transition={{ duration: .2 }}>{i === 1 && <span className="rc-plan-badge">{t(locale, '每月一点新鲜', 'A monthly discovery')}</span>}<h3>{pick(locale, p.name)}</h3><p className="rc-plan-cadence">{pick(locale, p.cadence)}</p><p className="rc-price"><small>€</small>{p.price}<span>{t(locale, '/ 月', '/ month')}</span></p><ul>{p.features.map((feature, j) => <li key={j}>{pick(locale, feature)}</li>)}</ul><button className="rc-button" type="button" data-plan={p.id} onClick={e => open(p.id, e.currentTarget)}>{t(locale, '选择此方案', 'Choose this plan')}</button></motion.article>)}</div><p className="rc-demo-note">{t(locale, '方案与欧元价格为演示参考，不提供交易或自动续费。双月方案按月展示示意均价。', 'Plans and euro prices are illustrative. No transactions or renewals. The bi-monthly example shows an illustrative monthly equivalent.')}</p><dialog aria-labelledby="rc-plan-title" className="rc-dialog" ref={dialog} onClose={() => { setSelected(null); opener.current?.focus() }} onClick={e => { if (e.target === dialog.current) close() }}><div className="rc-dialog-inner"><button className="rc-dialog-close" type="button" onClick={close} aria-label={t(locale, '关闭方案演示', 'Close plan demo')}>×</button><span className="rc-eyebrow">{t(locale, '订阅方案 · 本地演示', 'Subscription · Local demo')}</span><h2 id="rc-plan-title">{plan ? pick(locale, plan.name) : t(locale, '选择香气', 'Choose a scent')}</h2><p>{t(locale, '试着留下你的香气偏好。此表单仅做本地校验，不会发送、保存、下单或扣款。', 'Try the preference form. It validates locally without sending, saving, ordering or charging.')}</p><form key={selected} onSubmit={submit} noValidate><label htmlFor="rc-plan-name">{t(locale, '姓名', 'Name')} *</label><input ref={first} id="rc-plan-name" name="name" autoComplete="name" required aria-invalid={invalid} aria-describedby="rc-plan-result" onChange={() => { setResult(''); setInvalid(false) }} /><label htmlFor="rc-plan-email">{t(locale, '电子邮箱', 'Email')} *</label><input id="rc-plan-email" name="email" type="email" autoComplete="email" required aria-invalid={invalid} aria-describedby="rc-plan-result" onChange={() => { setResult(''); setInvalid(false) }} /><label htmlFor="rc-plan-scent">{t(locale, '喜欢的香调', 'Scent preference')}</label><select id="rc-plan-scent" name="scent"><option value="fresh">{t(locale, '清新与水感', 'Fresh & airy')}</option><option value="floral">{t(locale, '柔和花香', 'Soft floral')}</option><option value="woody">{t(locale, '温暖木质', 'Warm & woody')}</option></select><label className="rc-checkbox"><input name="consent" type="checkbox" required aria-invalid={invalid} aria-describedby="rc-plan-result" />{t(locale, '我了解这是本地演示，不会创建真实订阅。', 'I understand this is a local demo with no real subscription.')}</label><button className="rc-button" type="submit">{t(locale, '体验本地校验', 'Try local validation')}</button><p id="rc-plan-result" className={invalid ? 'rc-error' : 'rc-success'} role="status">{result}</p></form></div></dialog></>
}


