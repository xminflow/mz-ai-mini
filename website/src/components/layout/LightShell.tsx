'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { ContactContext } from './contact-context'
import { LightContactModal } from './LightContactModal'
import { LightFooter } from './LightFooter'
import { LightNav } from './LightNav'

type LightShellProps = {
  children: ReactNode
}

// 浅色站点的共用外壳：导航、底部 CTA、页脚、咨询弹窗，以及弹窗开关的唯一持有者。
// 每个对外开放的页面套一层即可，页面自身只负责自己的 section。
//
// 这里曾经挂过一层背景光域（AuroraField），前后试过圆斑、全页渐变、极光带、垂落光幕
// 四种形态，最终整体移除——见 globals.css 玻璃档注释里关于采样对象的说明。
export const LightShell = ({ children }: LightShellProps) => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = useCallback(() => setContactOpen(true), [])
  const closeContact = useCallback(() => setContactOpen(false), [])
  const contactValue = useMemo(() => ({ openContact }), [openContact])

  return (
    <ContactContext.Provider value={contactValue}>
      <div className="relative isolate flex min-h-screen flex-col bg-paper text-graphite">
        <LightNav />
        <main className="flex-1">{children}</main>
        <LightFooter />
        <LightContactModal open={contactOpen} onClose={closeContact} />
      </div>
    </ContactContext.Provider>
  )
}
