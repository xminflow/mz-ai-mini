'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState, type FormEvent } from 'react'
import type { TemplateLocale } from '../../../types'
import { experiences, offers, pick, rooms, t } from '../data'

const today = (): string => new Date().toISOString().slice(0, 10)
const validEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const validDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value

export function BookingBar({ basePath, locale }: { basePath: string; locale: TemplateLocale }) {
  const router = useRouter()
  const form = useRef<HTMLFormElement>(null)
  const [arrival, setArrival] = useState('')
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const values = Object.fromEntries(['arrival', 'departure', 'guests', 'room'].map(key => [key, String(data.get(key) ?? '')]))
    if (!validDate(values.arrival) || values.arrival < today()) {
      setError(t(locale, '请选择今天或之后的入住日期', 'Choose an arrival date from today onwards'))
      form.current?.querySelector<HTMLInputElement>('[name="arrival"]')?.focus(); return
    }
    if (!validDate(values.departure) || values.departure <= values.arrival) {
      setError(t(locale, '离店日期必须晚于入住日期', 'Departure must be after arrival'))
      form.current?.querySelector<HTMLInputElement>('[name="departure"]')?.focus(); return
    }
    setError('')
    router.push(`${basePath}/contact?${new URLSearchParams(values)}`)
  }

  return <form ref={form} className="nr-booking" aria-label={t(locale, '计划入住日期', 'Plan your stay dates')} onSubmit={submit} noValidate>
    <div className="nr-booking-fields">
      <label><span>{t(locale, '入住日期', 'Check-in')}</span><input name="arrival" type="date" required min={today()} value={arrival} onChange={event => setArrival(event.target.value)} /></label>
      <label><span>{t(locale, '离店日期', 'Check-out')}</span><input name="departure" type="date" required min={arrival || today()} /></label>
      <label><span>{t(locale, '入住人数', 'Guests')}</span><select name="guests" defaultValue="2">{[1, 2, 3, 4, 5, 6].map(count => <option key={count} value={count}>{t(locale, `${count} 位客人`, `${count} ${count === 1 ? 'guest' : 'guests'}`)}</option>)}</select></label>
      <label><span>{t(locale, '房型', 'Room')}</span><select name="room" defaultValue=""><option value="">{t(locale, '不限房型', 'Any room')}</option>{rooms.map(room => <option key={room.slug} value={room.slug}>{pick(locale, room.name)}</option>)}</select></label>
      <button type="submit" className="nr-button">{t(locale, '查询入住', 'Enquire about dates')}<span aria-hidden="true">→</span></button>
    </div>
    {error && <p className="nr-form-error" role="alert">{error}</p>}
  </form>
}

export function Newsletter({ locale }: { locale: TemplateLocale }) {
  const [feedback, setFeedback] = useState('')
  const [invalid, setInvalid] = useState(false)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('newsletter-email') ?? '').trim()
    if (!validEmail(email)) { setInvalid(true); setFeedback(t(locale, '请输入有效的邮箱地址', 'Enter a valid email address')); return }
    setInvalid(false)
    setFeedback(t(locale, '邮箱格式校验通过。此为演示，尚未订阅或保存。', 'Email format checked. This demo has not subscribed or stored your address.'))
  }
  return <div className="nr-newsletter"><h3>{t(locale, '来自湖畔的一封信', 'A letter from the lakeside')}</h3><p className="nr-muted">{t(locale, '记录花园的时令、厨房的香气，还有下次值得停留的日子。', 'Seasonal notes from the garden and kitchen, and ideas for your next quiet escape.')}</p><form onSubmit={submit} noValidate><label className="nr-sr-only" htmlFor="nr-newsletter-email">{t(locale, '订阅邮箱', 'Newsletter email')}</label><input id="nr-newsletter-email" name="newsletter-email" type="email" placeholder={t(locale, '您的邮箱地址', 'Your email address')} autoComplete="email" aria-invalid={invalid} aria-describedby="nr-newsletter-notice" /><button type="submit" aria-label={t(locale, '校验订阅邮箱', 'Check newsletter email')}>{t(locale, '订阅', 'Subscribe')}</button></form><p id="nr-newsletter-notice" className={invalid ? 'nr-form-error' : 'nr-fine'} aria-live="polite">{feedback || t(locale, '演示订阅：仅本地校验，不会发送或保存邮箱。', 'Demo subscription: local validation only; no email is sent or stored.')}</p></div>
}

type Field = 'name' | 'email' | 'guests' | 'arrival' | 'departure' | 'message' | 'consent' | 'room'
type Errors = Partial<Record<Field, string>>
interface EnquiryProps { locale: TemplateLocale; initial: Record<string, string> }

export function ContactForm({ locale }: { locale: TemplateLocale }) {
  const params = useSearchParams()
  const initial = Object.fromEntries(['arrival', 'departure', 'guests', 'room', 'experience', 'offer', 'request'].map(key => [key, params.get(key) ?? '']))
  return <EnquiryForm key={params.toString()} locale={locale} initial={initial} />
}

function EnquiryForm({ locale, initial }: EnquiryProps) {
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState('')
  const form = useRef<HTMLFormElement>(null)
  const invalidRoom = initial.room !== '' && !rooms.some(room => room.slug === initial.room)
  const invalidDates = (initial.arrival !== '' && !validDate(initial.arrival)) || (initial.departure !== '' && !validDate(initial.departure))
  const selectedExperience = experiences.find(item => item.slug === initial.experience)
  const selectedOffer = offers.find(item => item.slug === initial.offer)
  const initialMessage = selectedExperience ? pick(locale, selectedExperience.name) : selectedOffer ? pick(locale, selectedOffer.name) : initial.request === 'floor-plan' ? t(locale, '房间平面布局', 'Room floor plan') : ''

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const value = (key: string) => String(values.get(key) ?? '').trim()
    const next: Errors = {}
    if (!value('name')) next.name = t(locale, '请填写姓名', 'Enter your name')
    if (!validEmail(value('email'))) next.email = t(locale, '请填写有效邮箱', 'Enter a valid email')
    if (!value('guests') || Number(value('guests')) < 1 || Number(value('guests')) > 6) next.guests = t(locale, '请选择一至六位客人', 'Choose one to six guests')
    if (!validDate(value('arrival')) || value('arrival') < today()) next.arrival = t(locale, '请选择今天或之后的入住日期', 'Choose an arrival date from today onwards')
    if (!validDate(value('departure')) || value('departure') <= value('arrival')) next.departure = t(locale, '离店日期必须晚于入住日期', 'Departure must be after arrival')
    if (value('room') && !rooms.some(room => room.slug === value('room'))) next.room = t(locale, '请选择有效房型', 'Choose a valid room')
    if (!value('message')) next.message = t(locale, '请填写您的需求', 'Tell us about your plans')
    if (values.get('consent') !== 'on') next.consent = t(locale, '请阅读并勾选演示说明', 'Please read and accept the demo notice')
    setErrors(next); setStatus('')
    const first = Object.keys(next)[0]
    if (first) { form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus(); return }
    setStatus(t(locale, '本地校验通过。此表单为模板演示，没有发送、保存信息或创建预订。', 'Local validation passed. This template demo has not sent or stored your details, or created a booking.'))
  }

  const error = (field: Field) => errors[field] && <span id={`nr-error-${field}`} className="nr-form-error">{errors[field]}</span>
  const fieldProps = (field: Field) => ({ 'aria-invalid': !!errors[field], 'aria-describedby': errors[field] ? `nr-error-${field}` : undefined })
  return <form ref={form} id="nr-enquiry" className="nr-enquiry nr-glass" noValidate onSubmit={submit}>
    <h2>{t(locale, '把旅程交给我们', 'Tell us about your stay')}</h2><p className="nr-demo-notice">{t(locale, '演示表单，仅进行本地校验。不会发送、保存信息或创建真实预订。', 'Demonstration form. Validation happens locally; no data is sent or stored and no real reservation is made.')}</p>
    {(invalidRoom || invalidDates) && <p className="nr-form-error" role="alert">{t(locale, '链接中的房型或日期无效，请重新选择后再校验。', 'The link contains an invalid room or date. Please select the details again.')}</p>}
    <div className="nr-form-grid">
      <label>{t(locale, '姓名', 'Full name')}<input name="name" autoComplete="name" required placeholder={t(locale, '您的姓名', 'Your name')} {...fieldProps('name')} />{error('name')}</label>
      <label>{t(locale, '邮箱', 'Email')}<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" {...fieldProps('email')} />{error('email')}</label>
      <label>{t(locale, '电话（选填）', 'Phone (optional)')}<input name="phone" type="tel" autoComplete="tel" placeholder={t(locale, '联系电话', 'Phone number')} /></label>
      <label>{t(locale, '入住人数', 'Guests')}<select name="guests" defaultValue={initial.guests || '2'} {...fieldProps('guests')}>{[1, 2, 3, 4, 5, 6].map(count => <option key={count} value={count}>{t(locale, `${count} 位客人`, `${count} ${count === 1 ? 'guest' : 'guests'}`)}</option>)}</select>{error('guests')}</label>
      <label>{t(locale, '入住日期', 'Arrival')}<input name="arrival" type="date" defaultValue={validDate(initial.arrival) ? initial.arrival : ''} min={today()} required {...fieldProps('arrival')} />{error('arrival')}</label>
      <label>{t(locale, '离店日期', 'Departure')}<input name="departure" type="date" defaultValue={validDate(initial.departure) ? initial.departure : ''} min={today()} required {...fieldProps('departure')} />{error('departure')}</label>
      <label className="nr-full">{t(locale, '房型（选填）', 'Room (optional)')}<select name="room" defaultValue={invalidRoom ? '' : initial.room} {...fieldProps('room')}><option value="">{t(locale, '不限房型', 'Any room')}</option>{rooms.map(room => <option key={room.slug} value={room.slug}>{pick(locale, room.name)}</option>)}</select>{error('room')}</label>
      <label className="nr-full">{t(locale, '希望如何度过这段时光', 'Your plans or questions')}<textarea name="message" rows={5} defaultValue={initialMessage ? t(locale, `我想咨询：${initialMessage}`, `I would like to enquire about: ${initialMessage}`) : ''} placeholder={t(locale, '日期、饮食偏好，或任何想提前告诉我们的事', 'Dates, preferences, or anything you would like us to know')} required {...fieldProps('message')} />{error('message')}</label>
      <label className="nr-checkbox nr-full"><input name="consent" type="checkbox" required {...fieldProps('consent')} /><span>{t(locale, '我已了解这是本地演示，不会创建预订或保存个人信息', 'I understand this is a local demonstration and no reservation or personal record will be created')}{error('consent')}</span></label>
    </div>
    {Object.keys(errors).length > 0 && <p className="nr-form-error" role="alert">{t(locale, '请检查标记的项目', 'Please check the highlighted fields')}</p>}
    <button className="nr-button" type="submit">{t(locale, '校验咨询信息', 'Check enquiry details')}<span aria-hidden="true">→</span></button>
    <p className="nr-form-status" role="status">{status}</p>
  </form>
}
