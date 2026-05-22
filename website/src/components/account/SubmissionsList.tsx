'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import {
  deleteMemberSubmission,
  listMySubmissions,
  MemberSubmissionApiError,
} from '@/features/member-submissions/api'
import type {
  MemberSubmissionItem,
  MemberSubmissionStatus,
  MemberSubmissionType,
  QuotaSnapshot,
} from '@/features/member-submissions/types'

const STATUS_LABEL: Record<MemberSubmissionStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  done: '已交付',
  rejected: '已拒绝',
  cancelled: '已取消',
}

const STATUS_BADGE_CLASS: Record<MemberSubmissionStatus, string> = {
  pending: 'border-amber-300/40 bg-amber-300/10 text-amber-200',
  processing: 'border-cyan-300/40 bg-cyan-300/10 text-cyan-200',
  done: 'border-emerald-300/40 bg-emerald-300/10 text-emerald-200',
  rejected: 'border-rose-400/40 bg-rose-400/10 text-rose-200',
  cancelled: 'border-hairline bg-surface/40 text-muted',
}

const TYPE_LABEL: Record<MemberSubmissionType, string> = {
  blogger: '博主拆解',
  track: '赛道分析',
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function SubmissionsList() {
  const [items, setItems] = useState<MemberSubmissionItem[]>([])
  const [quotas, setQuotas] = useState<QuotaSnapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const response = await listMySubmissions({ limit: 50, offset: 0 })
      setItems(response.items)
      setQuotas(response.quotas)
      setError(null)
    } catch (err) {
      if (err instanceof MemberSubmissionApiError) {
        setError(err.message || '加载提交记录失败')
      } else {
        setError('加载提交记录失败')
      }
    }
  }, [])

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      await reload()
      if (active) setLoading(false)
    }
    void load()
    return () => {
      active = false
    }
  }, [reload])

  const handleDelete = useCallback(
    async (submissionId: string) => {
      // confirm 是浏览器原生交互，简单可靠；后续若要做更精致的 modal 再换。
      if (!window.confirm('确定删除这条待处理的工单吗？删除后本月配额会立刻退回。')) return
      setDeletingId(submissionId)
      setDeleteError(null)
      try {
        await deleteMemberSubmission(submissionId)
        await reload()
      } catch (err) {
        if (err instanceof MemberSubmissionApiError) {
          // 状态不匹配 (409) / 不属于当前用户 (404) 都走这里；显示后端 message。
          setDeleteError(err.message || '删除失败，请刷新页面后重试')
        } else {
          setDeleteError('删除失败，请刷新页面后重试')
        }
      } finally {
        setDeletingId(null)
      }
    },
    [reload],
  )

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase text-accent-2">My Submissions</p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          我的提交记录
        </h1>
        <p className="mt-5 text-base leading-8 text-ink-soft">
          这里汇总了你提交的博主拆解和赛道分析。运营按工单顺序处理，状态会同步更新到下表。
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {quotas.map((quota) => (
          <div
            key={quota.type}
            className="rounded-2xl border border-hairline bg-surface/60 px-5 py-4"
          >
            <p className="text-[12.5px] text-muted">{TYPE_LABEL[quota.type]}</p>
            <p className="mt-2 text-[20px] font-semibold text-ink">
              本月剩 {quota.remaining}/{quota.limit}
            </p>
            <p className="mt-1 text-[12px] text-muted">
              已用 {quota.consumed} · 周期 {quota.period_key}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        {loading && (
          <div className="rounded-2xl border border-hairline bg-surface/40 p-6 text-[13px] text-muted">
            正在加载提交记录…
          </div>
        )}
        {!loading && error !== null && (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-400/10 p-6 text-[13px] text-rose-200">
            {error}
          </div>
        )}
        {!loading && error === null && items.length === 0 && (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-hairline bg-surface/40 p-6">
            <p className="text-[14px] text-ink">还没有提交过工单。</p>
            <Link
              href="/membership"
              className="inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-semibold text-canvas transition-transform hover:-translate-y-0.5"
            >
              去会员页提交
            </Link>
          </div>
        )}
        {!loading && error === null && items.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-hairline bg-surface/40">
            {deleteError !== null && (
              <div className="border-b border-hairline bg-rose-400/10 px-5 py-3 text-[12.5px] text-rose-200">
                {deleteError}
              </div>
            )}
            <table className="w-full min-w-[820px] border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    提交时间
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    类型
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    内容
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    状态
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    备注
                  </th>
                  <th className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr
                    key={item.submission_id}
                    className={idx === items.length - 1 ? '' : 'border-b border-hairline/60'}
                  >
                    <td className="px-4 py-4 align-top text-[12.5px] text-muted whitespace-nowrap">
                      {formatDateTime(item.created_at)}
                    </td>
                    <td className="px-4 py-4 align-top text-[13px] text-ink">
                      {TYPE_LABEL[item.type]}
                    </td>
                    <td className="max-w-[360px] px-4 py-4 align-top text-[13px] text-ink-soft">
                      <span className="break-all">{item.payload_text}</span>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={[
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px]',
                          STATUS_BADGE_CLASS[item.status],
                        ].join(' ')}
                      >
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-[12.5px] text-muted">
                      {item.processed_note ?? '—'}
                    </td>
                    <td className="px-4 py-4 align-top whitespace-nowrap">
                      {item.status === 'pending' ? (
                        <button
                          type="button"
                          onClick={() => void handleDelete(item.submission_id)}
                          disabled={deletingId === item.submission_id}
                          className="inline-flex h-7 items-center rounded-full border border-rose-400/40 bg-rose-400/10 px-3 text-[11.5px] font-medium text-rose-200 transition-colors hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === item.submission_id ? '删除中…' : '删除'}
                        </button>
                      ) : (
                        <span className="text-[12px] text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
