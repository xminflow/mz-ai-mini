'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/api/client'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  async function handleLogout() {
    await logout()
    router.push('/')
    router.refresh()
  }
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <nav className="flex items-center gap-1">
            <Link href="/feed" className="rounded-pill px-3 py-1.5 text-sm font-medium text-ink">信息流</Link>
            <Link href="/new" className="rounded-pill px-3 py-1.5 text-sm font-medium text-mute hover:text-ink">发帖</Link>
            <Link href="/me" className="rounded-pill px-3 py-1.5 text-sm font-medium text-mute hover:text-ink">我的</Link>
          </nav>
          <button onClick={handleLogout} className="text-sm text-mute hover:text-ink">退出登录</button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">{children}</main>
    </div>
  )
}
