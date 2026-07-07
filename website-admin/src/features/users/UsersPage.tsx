import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ApiError } from '@/lib/apiClient'
import { useAuth } from '@/features/auth/AuthContext'
import { usersApi } from './api'
import type { AccountStatus, CampAccountAdmin } from './types'

const PAGE_SIZE = 20

export function UsersPage() {
  const { token, logout } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [appliedKeyword, setAppliedKeyword] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<CampAccountAdmin[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    try {
      const data = await usersApi.list({ keyword: appliedKeyword, status, page, pageSize: PAGE_SIZE, token })
      setRows(data.items)
      setTotal(data.total)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }
      setError('加载失败')
    }
  }, [token, appliedKeyword, status, page, logout])

  useEffect(() => {
    void load()
  }, [load])

  // 提交搜索：将草稿关键词应用为生效过滤条件，并重置到第一页；
  // 仅通过 state 变化触发上面的 effect 重新拉取，禁止在此手动调用 load()
  const applySearch = () => {
    setAppliedKeyword(keyword.trim())
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">用户管理</h1>
        <Button variant="outline" onClick={logout}>退出登录</Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="搜索用户名 / 邮箱"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { applySearch() } }}
          className="max-w-xs"
        />
        <select
          className="h-9 rounded-md border px-2 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value as AccountStatus | ''); setPage(1) }}
        >
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="disabled">已禁用</option>
        </select>
        <Button onClick={applySearch}>搜索</Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>会员</TableHead>
            <TableHead>会员到期</TableHead>
            <TableHead>注册时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.account_id}>
              <TableCell>{r.username}</TableCell>
              <TableCell>{r.email ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={r.status === 'active' ? 'default' : 'secondary'}>
                  {r.status === 'active' ? '正常' : '已禁用'}
                </Badge>
              </TableCell>
              <TableCell>{r.membership_tier}</TableCell>
              <TableCell>{r.membership_expires_at?.slice(0, 10) ?? '—'}</TableCell>
              <TableCell>{r.created_at.slice(0, 10)}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">暂无数据</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end gap-2 text-sm">
        <span>共 {total} 条 · 第 {page}/{totalPages} 页</span>
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>下一页</Button>
      </div>
    </div>
  )
}
