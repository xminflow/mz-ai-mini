'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

// 把标题文本转成稳定锚点 id（去除空白与符号，保留中英数字与连字符）
function slugify(text: string, index: number): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
  return base ? `sec-${index}-${base}` : `sec-${index}`
}

/**
 * 右栏「本节目录」：按 Markdown 标题等级（h2/h3）自动生成。
 * - 客户端从已渲染文章扫描 h2/h3，无需在 MD 里手动维护目录；h3 缩进体现层级
 * - 标题缺锚点时就地写回 id，点击平滑滚动到对应标题
 * - 跟随滚动高亮当前小节（与左栏一致的「竖线 rail + 实心圆点」观感）
 * - 路由切换（切换小节）时按 pathname 重新扫描
 * 依赖：阅读区滚动容器需带 data-lesson-scroll 标记（见 (course)/layout.tsx）
 */
export function LessonToc(): React.JSX.Element | null {
  const pathname = usePathname()
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // 1) 从文章 DOM 提取 h2/h3 标题（随路由切换重扫）
  // 统一在末尾单次 setItems：文章不存在时 collected 为空数组，等价于清空目录
  useEffect(() => {
    const article = document.querySelector('article.typora-md')
    const collected: TocItem[] = []
    if (article) {
      article.querySelectorAll('h2, h3').forEach((node, i) => {
        const h = node as HTMLElement
        const text = (h.textContent || '').trim()
        if (!text) return
        if (!h.id) h.id = slugify(text, i)
        collected.push({ id: h.id, text, level: Number(h.tagName.slice(1)) })
      })
    }
    // 目录源自「已渲染文章 DOM」，render 阶段无法获得，必须在 effect 中读取后 setState。
    // 此处无 render 期替代方案，故就地关闭 set-state-in-effect 规则
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(collected)
  }, [pathname])

  // 2) 跟随滚动高亮（命中「已滚过且最靠上」的标题）
  useEffect(() => {
    if (items.length === 0) return
    const scroller = document.querySelector('[data-lesson-scroll]') as HTMLElement | null
    if (!scroller) return

    let raf = 0
    const update = () => {
      // 滚到底部时直接高亮最后一节：末尾短小节无法滚到顶部阈值内，否则永远不会被选中
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4) {
        setActiveId(items[items.length - 1].id)
        return
      }
      const scrollerTop = scroller.getBoundingClientRect().top
      let current = items[0].id
      for (const it of items) {
        const el = document.getElementById(it.id)
        if (!el) continue
        // 标题进入滚动容器顶部 ~120px 内即视为当前小节
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

  // 少于 2 个标题时无需目录
  if (items.length < 2) return null

  return (
    <nav aria-label="本节目录" className="px-3 py-5">
      <div className="px-2 pb-5 text-[15px] font-semibold tracking-tight text-ink-soft">本节目录</div>
      {/* 单条引导线（rail）+ 当前小节实心圆点，h3 文字额外缩进体现层级 */}
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
                className={`block py-[7px] pr-2 text-[13px] leading-snug transition-colors ${
                  it.level >= 3 ? 'pl-9' : 'pl-5'
                } ${active ? 'font-medium text-accent' : 'text-muted hover:text-ink-soft'}`}
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
