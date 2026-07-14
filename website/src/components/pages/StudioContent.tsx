// src/components/pages/StudioContent.tsx
'use client'

import { useState } from 'react'

import { ContactQrCodeModal } from '../layout'
import { CtoSection } from './studio/CtoSection'
import { ProjectShowcase } from './studio/ProjectShowcase'
import { CourseOutline } from './studio/CourseOutline'

export function StudioContent() {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      {/* 1. CTO 组织顶点：完整个人简介（复用训练营页讲师资历） */}
      <CtoSection />

      {/* 2. 实战项目库：20 个课程项目，按难度分三档 */}
      <ProjectShowcase />

      {/* 3. 赠送课程大纲：往期课程可展开层级树 + 报名 CTA */}
      <CourseOutline onEnroll={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
