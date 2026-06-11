import { Outlet, useOutletContext } from 'react-router-dom'
import { useManifest } from '../lib/useManifest'
import type { Manifest } from '../types'
import Sidebar from './Sidebar'

export default function Layout() {
  const { manifest, error, loading } = useManifest()

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted">加载目录中…</div>
  }
  if (error || !manifest) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <p className="font-semibold text-ink">目录加载失败</p>
        <p className="text-sm text-accent-3">{error ?? 'manifest 为空'}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <aside className="scrollbar-thin w-72 shrink-0 overflow-y-auto border-r border-hairline bg-surface/40 backdrop-blur-xl">
        <Sidebar manifest={manifest} />
      </aside>
      <main className="flex-1 overflow-hidden">
        <Outlet context={manifest} />
      </main>
    </div>
  )
}

// 供子路由读取 Layout 通过 <Outlet context> 传入的 manifest，集中类型断言到一处
export function useLayoutManifest(): Manifest {
  return useOutletContext<Manifest>()
}
