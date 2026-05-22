'use client'

import { useState } from 'react'

import {
  createMemberSubmission,
  MemberSubmissionApiError,
} from '@/features/member-submissions/api'
import type { QuotaSnapshot } from '@/features/member-submissions/types'

import { MembershipQuotaBadge } from './MembershipQuotaBadge'
import {
  classifySubmissionError,
  describeSubmissionError,
} from './submissionErrorMessages'

type BloggerSubmissionFormProps = {
  quota: QuotaSnapshot | null
  loading: boolean
  onSubmitted: (quota: QuotaSnapshot) => void
}

const URL_PATTERN = /^https?:\/\/[^\s]{6,}$/i

export function BloggerSubmissionForm({
  quota,
  loading,
  onSubmitted,
}: BloggerSubmissionFormProps) {
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<
    { kind: 'success' | 'error'; text: string } | null
  >(null)

  const exhausted = quota !== null && quota.remaining <= 0
  const disabled = loading || exhausted

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    const trimmed = url.trim()
    if (!URL_PATTERN.test(trimmed)) {
      setMessage({
        kind: 'error',
        text: '请输入完整的博主主页链接（https://...）。',
      })
      return
    }
    setSubmitting(true)
    try {
      const result = await createMemberSubmission({
        type: 'blogger',
        payload_text: trimmed,
        payload_meta: notes.trim() ? { notes: notes.trim() } : undefined,
      })
      onSubmitted(result.quota_after)
      setUrl('')
      setNotes('')
      setMessage({
        kind: 'success',
        text: '已收到，预计 3-5 个工作日内交付，可在「我的提交记录」查看进度。',
      })
    } catch (error) {
      if (error instanceof MemberSubmissionApiError) {
        const kind = classifySubmissionError(error.code, error.status)
        setMessage({ kind: 'error', text: describeSubmissionError(kind, error.message) })
      } else {
        setMessage({ kind: 'error', text: '提交失败，请稍后重试。' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-hairline bg-surface/40 p-6 backdrop-blur sm:rounded-[22px] sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="font-serif-zh text-[16px] font-semibold text-ink sm:text-[17px]">
          提交一个博主主页
        </h4>
        <MembershipQuotaBadge snapshot={quota} loading={loading} />
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-[12.5px] text-muted">博主主页 URL（抖音 / 小红书 / B 站等）</span>
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://www.douyin.com/user/..."
          required
          disabled={disabled || submitting}
          className="rounded-xl border border-hairline bg-canvas/50 px-4 py-2.5 text-[13.5px] text-ink placeholder:text-muted/60 focus:border-hairline-strong focus:outline-none disabled:opacity-50 sm:text-[14px]"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[12.5px] text-muted">备注（选填，告诉我们你关心什么角度）</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="例如：希望重点看其矩阵布局与变现链路"
          rows={3}
          maxLength={300}
          disabled={disabled || submitting}
          className="resize-none rounded-xl border border-hairline bg-canvas/50 px-4 py-2.5 text-[13px] text-ink placeholder:text-muted/60 focus:border-hairline-strong focus:outline-none disabled:opacity-50 sm:text-[13.5px]"
        />
      </label>
      <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MessageInline message={message} />
        <button
          type="submit"
          disabled={disabled || submitting}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-canvas transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? '提交中…' : exhausted ? '配额已满' : '提交博主拆解'}
        </button>
      </div>
    </form>
  )
}

type MessageInlineProps = {
  message: { kind: 'success' | 'error'; text: string } | null
}

function MessageInline({ message }: MessageInlineProps) {
  if (message === null) {
    return <span className="text-[12px] text-muted">提交后会进入工单池，由运营按顺序拆解。</span>
  }
  return (
    <span
      className={[
        'text-[12.5px]',
        message.kind === 'success' ? 'text-emerald-300' : 'text-rose-300',
      ].join(' ')}
    >
      {message.text}
    </span>
  )
}
