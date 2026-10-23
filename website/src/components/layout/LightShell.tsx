'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'

import { SiteLocaleProvider } from '@/features/site-i18n/SiteLocaleProvider'
import type { SiteLocale } from '@/features/site-i18n/copy'
import { AccountProfileModal } from '@/features/account/AccountProfileModal'
import type { AuthAccount } from '@/features/auth/types'
import { CommunityInvitationModal } from '@/features/site-community/CommunityInvitationModal'

import { ContactContext } from './contact-context'
import { GlowField } from './GlowField'
import { LightContactModal } from './LightContactModal'
import { LightFooter } from './LightFooter'
import { LightNav } from './LightNav'

type GlowVariant = 'home' | 'simple' | 'none'

type LightShellProps = {
  children: ReactNode
  /**
   * 背景蓝光的铺法。长页面（首页）用 home 铺两片，分别对应服务区与流程区；
   * 短页面（案例页）用 simple 只铺一片；none 供采用纯色纹理背景的首页使用。
   */
  glow?: GlowVariant
  locale?: SiteLocale
  className?: string
}

// 浅色站点的共用外壳：背景光挂载点、导航、底部 CTA、页脚、咨询弹窗，
// 以及弹窗开关的唯一持有者。每个对外开放的页面套一层即可，页面自身只负责自己的 section。
export const LightShell = ({ children, glow = 'simple', locale = 'zh', className = '' }: LightShellProps) => {
  // 共用互斥状态，避免入群邀请与商务联系同时覆盖页面。
  const [activeDialog, setActiveDialog] = useState<'contact' | 'community' | 'profile' | null>(null)
  const [profileAccount, setProfileAccount] = useState<AuthAccount | null>(null)
  const openProfile = useCallback((account: AuthAccount) => {
    setProfileAccount(account)
    setActiveDialog('profile')
  }, [])
  const openContact = useCallback(() => setActiveDialog('contact'), [])
  const openCommunity = useCallback(() => setActiveDialog('community'), [])
  const closeDialog = useCallback(() => setActiveDialog(null), [])
  const contactValue = useMemo(() => ({ openContact }), [openContact])

  return (
    <SiteLocaleProvider locale={locale}>
    <ContactContext.Provider value={contactValue}>
      {/* relative isolate：给 GlowField 的 -z-10 建立独立层叠上下文，
          让光只压在本外壳内部，不会钻到其他层之下 */}
      <div lang={locale === 'en' ? 'en' : 'zh-CN'} className={`relative isolate flex min-h-screen flex-col bg-paper text-graphite ${className}`}>
        {glow !== 'none' && <GlowField variant={glow} />}
        <LightNav onOpenCommunity={openCommunity} onOpenProfile={openProfile} />
        <main className="flex-1">{children}</main>
        <LightFooter />
        <LightContactModal open={activeDialog === 'contact'} onClose={closeDialog} />
        {activeDialog === 'profile' && profileAccount && <AccountProfileModal account={profileAccount} onClose={closeDialog} />}
        <CommunityInvitationModal open={activeDialog === 'community'} onClose={closeDialog} />
      </div>
    </ContactContext.Provider>
    </SiteLocaleProvider>
  )
}
