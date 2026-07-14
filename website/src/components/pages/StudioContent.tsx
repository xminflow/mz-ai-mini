// src/components/pages/StudioContent.tsx
'use client'

import { useState } from 'react'

import { ContactQrCodeModal } from '../layout'
import { CtoSection } from './studio/CtoSection'
import { DepartmentGrid } from './studio/DepartmentGrid'

export function StudioContent() {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      {/* 1. CTO 组织顶点 */}
      <CtoSection />

      {/* 2. 部门网格：5 个研发部门，人员虚位以待，点击申请弹二维码 */}
      <DepartmentGrid onApply={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
