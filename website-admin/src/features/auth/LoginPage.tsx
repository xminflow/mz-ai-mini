import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/apiClient'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/users', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? '用户名或密码错误' : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={onSubmit} className="w-80 space-y-4 rounded-lg border p-6">
        <h1 className="text-lg font-semibold">管理端登录</h1>
        <Input placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '登录中…' : '登录'}
        </Button>
      </form>
    </div>
  )
}
