'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { ContactContext } from './contact-context'
import { GlowField } from './GlowField'
import { LightContactModal } from './LightContactModal'
import { LightFooter } from './LightFooter'
import { LightNav } from './LightNav'

type GlowVariant = 'home' | 'simple'

type LightShellProps = {
  children: ReactNode
  /**
   * 背景蓝光的铺法。长页面（首页）用 home 铺两片，分别对应服务区与流程区；
   * 短页面（案例页）用 simple 只铺一片——两片挤在不到一屏的高度里会叠成一大块。
   */
  glow?: GlowVariant
}

// 浅色站点的共用外壳：背景光挂载点、导航、底部 CTA、页脚、咨询弹窗，
// 以及弹窗开关的唯一持有者。每个对外开放的页面套一层即可，页面自身只负责自己的 section。
export const LightShell = ({ children, glow = 'simple' }: LightShellProps) => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = useCallback(() => setContactOpen(true), [])
  const closeContact = useCallback(() => setContactOpen(false), [])
  const contactValue = useMemo(() => ({ openContact }), [openContact])

  return (
    <ContactContext.Provider value={contactValue}>
      {/* relative isolate：给 GlowField 的 -z-10 建立独立层叠上下文，
          让光只压在本外壳内部，不会钻到其他层之下 */}
      <div className="relative isolate flex min-h-screen flex-col bg-paper text-graphite">
        <GlowField variant={glow} />
        <LightNav />
        <main className="flex-1">{children}</main>
        <LightFooter />
        <LightContactModal open={contactOpen} onClose={closeContact} />
      </div>
    </ContactContext.Provider>
  )
}
