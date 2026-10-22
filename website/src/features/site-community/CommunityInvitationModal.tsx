'use client'

import { LightContactModal } from '@/components/layout/LightContactModal'
import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'

export function CommunityInvitationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { copy } = useSiteLocale()

  return (
    <LightContactModal
      open={open}
      onClose={onClose}
      content={{
        title: copy.navAiCommunity,
        imageSrc: '/ai-community/ai-group-invitation.jpg',
        imageAlt: copy.communityQrAlt,
        imageWidth: 1220,
        imageHeight: 2154,
        hint: copy.communityQrHint,
        notice: copy.communityQrNotice,
        portrait: true,
      }}
    />
  )
}
