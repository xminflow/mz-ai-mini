import { useState } from 'react'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthContext'
import { ApiError } from '@/lib/apiClient'
import { usersApi } from './api'
import type { CampAccountAdmin, MembershipTier } from './types'

type Props = {
  account: CampAccountAdmin
  onClose: () => void
  onChanged: () => void
  onDeleted: () => void
}

export function UserDetailDialog({ account, onClose, onChanged, onDeleted }: Props) {
  const { token } = useAuth()
  const [tier, setTier] = useState<MembershipTier>(account.membership_tier)
  const [expiresAt, setExpiresAt] = useState<string>(account.membership_expires_at?.slice(0, 10) ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function run(fn: () => Promise<unknown>, after: () => void) {
    if (!token) return
    setBusy(true); setError(null)
    try {
      await fn()
      after()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '操作失败')
    } finally {
      setBusy(false)
    }
  }

  const toggleStatus = () =>
    run(
      () => usersApi.updateStatus(account.account_id, account.status === 'active' ? 'disabled' : 'active', token!),
      onChanged,
    )

  const saveMembership = () => {
    if (tier !== 'none' && !expiresAt) {
      setError('非 none 会员必须填写到期日期')
      return
    }
    const iso = tier === 'none' ? null : new Date(`${expiresAt}T00:00:00Z`).toISOString()
    return run(() => usersApi.updateMembership(account.account_id, tier, iso, token!), onChanged)
  }

  const doDelete = () => run(() => usersApi.remove(account.account_id, token!), onDeleted)

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>用户：{account.username}</DialogTitle></DialogHeader>

        <div className="space-y-3 text-sm">
          <div>邮箱：{account.email ?? '—'}</div>
          <div>状态：{account.status === 'active' ? '正常' : '已禁用'}</div>
          <div>注册：{account.created_at.slice(0, 19).replace('T', ' ')}</div>

          <div className="flex items-center gap-2 pt-2">
            <span>会员等级</span>
            <select
              className="h-9 rounded-md border px-2"
              value={tier}
              onChange={(e) => setTier(e.target.value as MembershipTier)}
            >
              <option value="none">none</option>
              <option value="basic">basic</option>
              <option value="premium">premium</option>
            </select>
            <Input
              type="date"
              value={expiresAt}
              disabled={tier === 'none'}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="max-w-[10rem]"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" disabled={busy} onClick={toggleStatus}>
            {account.status === 'active' ? '禁用账号' : '启用账号'}
          </Button>
          <Button disabled={busy} onClick={saveMembership}>保存会员</Button>
          {confirmDelete ? (
            <Button variant="destructive" disabled={busy} onClick={doDelete}>确认删除</Button>
          ) : (
            <Button variant="destructive" disabled={busy} onClick={() => setConfirmDelete(true)}>删除</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
