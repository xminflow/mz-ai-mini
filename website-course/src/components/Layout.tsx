import { Outlet } from 'react-router-dom'
import { useManifest } from '../lib/useManifest'

export default function Layout() {
  const { manifest, error, loading } = useManifest()

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">加载目录中…</div>
  }
  if (error || !manifest) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-red-600">
        <p className="font-semibold">目录加载失败</p>
        <p className="text-sm text-red-500">{error ?? 'manifest 为空'}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar 在 Task 6 接入，这里先占位以验证布局 */}
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50">
        <div className="p-4 font-semibold">{manifest.title}</div>
      </aside>
      <main className="flex-1 overflow-hidden">
        <Outlet context={manifest} />
      </main>
    </div>
  )
}
