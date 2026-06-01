'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '@/lib/api/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [account, setAccount] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await login(account)
      router.push(searchParams.get('redirect') || '/feed')
      router.refresh()
    } catch {
      setError('登录失败，请重试')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto mt-24 w-full max-w-sm rounded-card p-8">
      <h1 className="font-display text-2xl font-medium text-ink">登录知识汇</h1>
      <p className="mt-2 text-sm text-mute">本期为占位登录，输入任意账号即可进入。</p>
      <input
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        placeholder="账号"
        className="mt-6 w-full rounded-btn border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-line-strong"
      />
      {error && <p className="mt-2 text-sm text-amber">{error}</p>}
      <button type="submit" className="btn-fusion mt-5 w-full py-2.5 text-sm font-semibold">
        登录
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
