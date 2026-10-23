'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'

function pageTheme(pathname: string): 'light' | 'dark' | undefined {
  if (pathname === '/' || pathname === '/en') return 'dark'
  if (/^\/templates(?:\/[^/]+)?\/?$/.test(pathname)) return 'dark'
  return undefined
}

function prepareWaveMask() {
  const root = document.documentElement
  const width = window.innerWidth
  const height = window.innerHeight
  const amplitude = Math.min(width * .18, 180)
  // 三段相切的贝塞尔曲线形成不对称浪沿；按视口生成，手机和大屏都有适度起伏。
  const outline = (edge: number, offsets: number[]) => {
    const x = offsets.map(offset => Math.round(edge + offset * amplitude))
    return `path('M -1 -2 L ${x[0]} -2 C ${x[0]} ${height * .12} ${x[1]} ${height * .22} ${x[1]} ${height / 3} C ${x[1]} ${height * .45} ${x[2]} ${height * .55} ${x[2]} ${height * 2 / 3} C ${x[2]} ${height * .78} ${x[3]} ${height * .9} ${x[3]} ${height + 2} L -1 ${height + 2} Z')`
  }
  root.style.setProperty('--theme-wave-start', outline(-amplitude * 2, [-.8, .3, -.6, .1]))
  root.style.setProperty('--theme-wave-end', outline(width + amplitude * 2, [.1, .8, -.3, .6]))
}

function clearWaveMask() {
  const root = document.documentElement
  delete root.dataset.themeTransition
  root.style.removeProperty('--theme-wave-start')
  root.style.removeProperty('--theme-wave-end')
}

// 放在根布局中等待路由提交，避免旧页面卸载时提前结束截图切换。
export function ThemePageTransition() {
  const pathname = usePathname()
  const router = useRouter()
  const currentPath = useRef(pathname)
  const pending = useRef<{ destination: string; complete: () => void } | null>(null)

  useLayoutEffect(() => {
    currentPath.current = pathname
    if (pending.current?.destination !== pathname) return
    const navigation = pending.current
    pending.current = null
    // 更新回调等待期间浏览器会暂停绘制，必须在布局提交后直接释放，不能等待 rAF。
    navigation.complete()
  }, [pathname])

  useEffect(() => {
    let active: ViewTransition | undefined
    const transitionTo = (destination: string, navigate?: () => void) => {
      const sourceTheme = pageTheme(currentPath.current)
      const targetTheme = pageTheme(destination)
      if (!sourceTheme || !targetTheme || sourceTheme === targetTheme ||
        !document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) return false

      active?.skipTransition()
      pending.current?.complete()
      prepareWaveMask()
      document.documentElement.dataset.themeTransition = 'curtain'
      const transition = document.startViewTransition(() => new Promise<void>(complete => {
        // 浏览器历史导航可能已在截图回调开始前完成提交。
        if (currentPath.current === destination) {
          complete()
          return
        }
        pending.current = { destination, complete }
        navigate?.()
      }))
      active = transition
      void transition.finished.finally(() => {
        if (active !== transition) return
        clearWaveMask()
        active = undefined
      })
      void transition.updateCallbackDone.catch(error => {
        console.error('深浅主题页面切换失败', { destination, error })
      })
      return true
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download') ||
        (link.target && link.target !== '_self')) return
      const url = new URL(link.href)
      if (url.origin !== location.origin || url.pathname === currentPath.current) return
      if (transitionTo(url.pathname, () => router.push(`${url.pathname}${url.search}${url.hash}`))) {
        event.preventDefault()
      }
    }
    const onPopState = () => { transitionTo(location.pathname) }
    document.addEventListener('click', onClick, true)
    // 先于路由器的冒泡监听拍摄旧画面，前进、后退也使用同方向幕布。
    window.addEventListener('popstate', onPopState, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState, true)
      active?.skipTransition()
      pending.current?.complete()
      pending.current = null
      clearWaveMask()
    }
  }, [router])

  return null
}
