'use client'

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { buttonClassName } from '@/components/ui'
import type { AuthState } from '@/features/auth/types'

interface WorkBuddyGuideProps {
  templateName: string
  downloadUrl?: string
}

/** 所有模板详情共用教程；工作目录和启动命令由实际工程的规则决定。 */
export function WorkBuddyGuide({ templateName, downloadUrl }: WorkBuddyGuideProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [checking, setChecking] = useState(false)
  const [authError, setAuthError] = useState('')
  const requestRef = useRef<AbortController | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [copyStatus, setCopyStatus] = useState('')
  const prompt = downloadUrl ? `下载并解压 ${downloadUrl}，阅读工程中的 AGENTS.md 和 .tpl/README.md，按照项目要求启动工程，并给我实际访问地址。` : ''

  useEffect(() => {
    if (!expanded || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const content = contentRef.current
    if (!content) return
    const animation = content.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 300, easing: 'cubic-bezier(.2, .7, .3, 1)', fill: 'backwards' },
    )
    return () => animation.cancel()
  }, [expanded])

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyStatus('已复制，可以粘贴到 WorkBuddy 中。')
    } catch {
      setCopyStatus('未能自动复制，请选中下方提示词并手动复制。')
    }
  }

  const openGuide = useCallback(async (redirectToLogin: boolean) => {
    if (requestRef.current) return
    const controller = new AbortController()
    requestRef.current = controller
    setChecking(true)
    setAuthError('')
    try {
      // 每次展开都由服务端验证会话，不能只依赖可伪造或已过期的客户端 Cookie 标记。
      const response = await fetch('/api/auth/me', { cache: 'no-store', signal: controller.signal })
      if (!response.ok) throw new Error(`Auth check failed: ${response.status}`)
      const payload = await response.json() as { state?: AuthState }
      if (!payload.state || typeof payload.state.authenticated !== 'boolean') throw new Error('Invalid auth response')
      if (!payload.state.authenticated) {
        if (redirectToLogin) {
          const returnPath = `${pathname}${window.location.search}#workbuddy-guide`
          router.push(`/login?next=${encodeURIComponent(returnPath)}`)
        }
        return
      }
      setExpanded(true)
    } catch (error) {
      if (controller.signal.aborted) return
      console.error('[workbuddy-guide] auth check failed', { templateName, errorType: error instanceof Error ? error.name : 'UnknownError' })
      setAuthError('暂时无法验证登录状态，请稍后点击重试。')
    } finally {
      if (!controller.signal.aborted) setChecking(false)
      if (requestRef.current === controller) requestRef.current = null
    }
  }, [pathname, router, templateName])

  useEffect(() => {
    let cancelled = false
    // 登录返回地址已有该锚点；仍须验证会话，不能仅凭 URL 展开，也不能形成登录重定向循环。
    if (window.location.hash === '#workbuddy-guide') {
      void Promise.resolve().then(() => {
        if (!cancelled) return openGuide(false)
      })
    }
    return () => {
      cancelled = true
      requestRef.current?.abort()
      requestRef.current = null
    }
  }, [openGuide])

  function toggleGuide(event: MouseEvent<HTMLElement>) {
    event.preventDefault()
    if (expanded) {
      setExpanded(false)
      setCopyStatus('')
      return
    }
    void openGuide(true)
  }

  return <>
  <details id="workbuddy-guide" open={expanded} className="market-workbuddy-guide">
    <summary className="market-workbuddy-trigger" onClick={toggleGuide} aria-busy={checking} aria-describedby={authError ? 'workbuddy-auth-error' : undefined}>
      <span className="market-workbuddy-ai" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m8 1 1.8 4.9L15 8l-5.2 2.1L8 15l-1.8-4.9L1 8l5.2-2.1L8 1Z" fill="currentColor" /></svg></span>
      <span>{checking ? '正在验证登录状态…' : '如何在 WorkBuddy 中使用'}</span>
      <span className="market-workbuddy-trigger-mark" aria-hidden="true" />
    </summary>
    {expanded && <div ref={contentRef} className="market-workbuddy-content">
      <section className="market-workbuddy-prompt" aria-label="提示词">
        <div className="market-workbuddy-prompt-header"><h2>提示词</h2><button type="button" onClick={copyPrompt} disabled={!downloadUrl} aria-label={`复制${templateName}的提示词`} className={buttonClassName('secondary', 'market-secondary')}>复制提示词</button></div>
        <p className="market-workbuddy-hint">{downloadUrl ? '复制后发给 WorkBuddy，按它返回的地址打开预览。' : '该模板尚未发布源码 ZIP，发布后即可复制使用。'}</p>
        {downloadUrl && <pre tabIndex={0} aria-label="WorkBuddy 启动提示词">{prompt}</pre>}
        <p role="status" aria-live="polite" className="market-workbuddy-copy-status">{copyStatus}</p>
      </section>
      <section className="market-workbuddy-edit" aria-label="如何修改">
        <h2>如何修改</h2>
        <p>在同一个对话里，直接说出你的想法，例如：</p>
        <ul><li>“品牌改成山间设计，主色改成森林绿。”</li><li>“去掉首页报价模块，换上我提供的作品图片。”</li></ul>
      </section>
    </div>}
  </details>
  {authError && <p id="workbuddy-auth-error" role="alert" className="mt-3 text-sm text-red-400">{authError}</p>}
  </>
}
