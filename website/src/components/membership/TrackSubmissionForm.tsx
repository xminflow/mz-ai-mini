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

type TrackSubmissionFormProps = {
  quota: QuotaSnapshot | null
  loading: boolean
  onSubmitted: (quota: QuotaSnapshot) => void
}

export function TrackSubmissionForm({
  quota,
  loading,
  onSubmitted,
}: TrackSubmissionFormProps) {
  const [keyword, setKeyword] = useState('')
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
    const trimmed = keyword.trim()
    if (trimmed.length < 2 || trimmed.length > 30) {
      setMessage({
        kind: 'error',
        text: '赛道关键词长度需在 2-30 个字符之间。',
      })
      return
    }
    setSubmitting(true)
    try {
      const result = await createMemberSubmission({
        type: 'track',
        payload_text: trimmed,
        payload_meta: notes.trim() ? { notes: notes.trim() } : undefined,
      })
      onSubmitted(result.quota_after)
      setKeyword('')
      setNotes('')
      setMessage({
        kind: 'success',
        text: '已收到，赛道深度分析交付周期 5-7 个工作日，进度可在「我的提交记录」查看。',
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
          提交一个赛道关键词
        </h4>
        <MembershipQuotaBadge snapshot={quota} loading={loading} />
      </div>
      <label className="flex flex-col gap-2">
        <span className="text-[12.5px] text-muted">赛道关键词（如「家政服务」「轻食配送」「亲子营地」）</span>
        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="2-30 个字符"
          minLength={2}
          maxLength={30}
          required
          disabled={disabled || submitting}
          className="rounded-xl border border-hairline bg-canvas/50 px-4 py-2.5 text-[13.5px] text-ink placeholder:text-muted/60 focus:border-hairline-strong focus:outline-none disabled:opacity-50 sm:text-[14px]"
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-[12.5px] text-muted">备注（选填，限定地域 / 客单价 / 投入预算等）</span>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="例如：江浙沪一二线城市，单店投入 20-50 万"
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
          {submitting ? '提交中…' : exhausted ? '配额已满' : '提交赛道分析'}
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
    return (
      <span className="text-[12px] text-muted">采集公开资料 + 投研框架，输出 6 份专业报告。</span>
    )
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
