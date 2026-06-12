'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
}

/**
 * 本节文章目录（右栏，镜像左侧课程栏）
 * - 客户端从已渲染文章里扫描各小节标题（h2）自动生成，无需各课件手动维护
 * - 锚点优先取标题最近的祖先 id（Section/Callout 的 id）；没有则就地生成并写回
 * - 跟随滚动高亮当前小节（用左栏同款"竖线 rail + 实心圆点"路径观感），点击平滑滚动到锚点
 * - 路由切换时按 pathname 重新扫描
 * 依赖：阅读区滚动容器需带 data-lesson-scroll 标记（见 LessonViewer）
 */
export function LessonToc(): React.JSX.Element | null {
  const pathname = usePathname()
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // 1) 从文章 DOM 提取小节标题（随路由切换重扫）
  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) {
      setItems([])
      return
    }
    const collected: TocItem[] = []
    article.querySelectorAll('h2').forEach((h, i) => {
      // 最近的可锚点祖先，且必须在文章子树内，避免误命中外层布局元素
      let anchor = h.closest('[id]') as HTMLElement | null
      if (anchor && !article.contains(anchor)) anchor = null
      let id = anchor?.id
      if (!id) {
        id = `sec-${i}`
        h.id = id
      }
      const text = (h.textContent || '').trim()
      if (text) collected.push({ id, text })
    })
    setItems(collected)
  }, [pathname])

  // 2) 跟随滚动高亮（读阅读区滚动容器，命中"已滚过且最靠上"的小节）
  useEffect(() => {
    if (items.length === 0) return
    const scroller = document.querySelector('[data-lesson-scroll]') as HTMLElement | null
    if (!scroller) return

    let raf = 0
    const update = () => {
      const scrollerTop = scroller.getBoundingClientRect().top
      let current = items[0].id
      for (const it of items) {
        const el = document.getElementById(it.id)
        if (!el) continue
        // 标题进入视口顶部 ~120px 内即视为当前小节
        if (el.getBoundingClientRect().top - scrollerTop <= 120) current = it.id
        else break
      }
      setActiveId(current)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    update()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [items])

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    const scroller = document.querySelector('[data-lesson-scroll]') as HTMLElement | null
    if (!el || !scroller) return
    const top =
      el.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 16
    scroller.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
    history.replaceState(null, '', `#${id}`)
  }

  if (items.length < 2) return null

  return (
    <nav aria-label="本节目录" className="px-3 py-5">
      <div className="px-2 pb-5 text-[15px] font-semibold tracking-tight text-ink-soft">本节目录</div>
      {/* 单条引导线（rail）+ 当前小节用实心圆点标在线上，与左栏路径观感一致 */}
      <ul className="ml-[15px] list-none border-l border-hairline p-0">
        {items.map((it) => {
          const active = it.id === activeId
          return (
            <li key={it.id} className="relative m-0">
              <span
                className={`absolute -left-[3px] top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full ring-2 ring-canvas transition-colors ${
                  active ? 'bg-accent' : 'bg-transparent ring-0'
                }`}
                aria-hidden="true"
              />
              <a
                href={`#${it.id}`}
                aria-current={active ? 'true' : undefined}
                onClick={(e) => handleClick(e, it.id)}
                className={`block py-[7px] pl-5 pr-2 text-[13px] leading-snug transition-colors ${
                  active ? 'font-medium text-accent' : 'text-muted hover:text-ink-soft'
                }`}
              >
                {it.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
