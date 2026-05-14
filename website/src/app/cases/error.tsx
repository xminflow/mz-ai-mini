'use client'

import { useEffect } from 'react'

interface CasesErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CasesError({ error, reset }: CasesErrorProps) {
  useEffect(() => {
    console.error('[cases] route error boundary caught:', error)
  }, [error])

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-hairline bg-surface/60 p-10 text-center backdrop-blur-xl">
        <h2 className="text-lg font-medium text-ink">行业报告加载失败</h2>
        <p className="text-sm text-muted">
          页面遇到未预料的错误，请稍后再试。
        </p>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-canvas transition-transform hover:-translate-y-0.5"
        >
          重新加载
        </button>
      </div>
    </section>
  )
}
