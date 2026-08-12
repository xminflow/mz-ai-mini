'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { AuroraField } from './AuroraField'
import { ContactContext } from './contact-context'
import { LightContactModal } from './LightContactModal'
import { LightFooter } from './LightFooter'
import { LightNav } from './LightNav'

type LightShellProps = {
  children: ReactNode
  /**
   * 光域层的铺法。长页面（首页）用 home 铺四团光对应各板块；
   * 短页面（案例页）用 simple 只留首屏一团——四团光挤在不到一屏的高度里会互相
   * 叠加泛出脏色，正是 AuroraField 注释里第 2 条约束要避免的情况。
   */
  aurora?: 'home' | 'simple'
}

// 浅色站点的共用外壳：光域层挂载点、导航、底部 CTA、页脚、咨询弹窗，
// 以及弹窗开关的唯一持有者。每个对外开放的页面套一层即可，页面自身只负责自己的 section。
export const LightShell = ({ children, aurora = 'simple' }: LightShellProps) => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = useCallback(() => setContactOpen(true), [])
  const closeContact = useCallback(() => setContactOpen(false), [])
  const contactValue = useMemo(() => ({ openContact }), [openContact])

  return (
    <ContactContext.Provider value={contactValue}>
      {/* relative isolate：给 AuroraField 的 -z-10 建立独立层叠上下文，
          让光只压在本外壳内部，不会钻到其他层之下 */}
      <div className="relative isolate flex min-h-screen flex-col bg-paper text-graphite">
        <AuroraField variant={aurora} />
        <LightNav />
        <main className="flex-1">{children}</main>
        <LightFooter />
        <LightContactModal open={contactOpen} onClose={closeContact} />
      </div>
    </ContactContext.Provider>
  )
}
