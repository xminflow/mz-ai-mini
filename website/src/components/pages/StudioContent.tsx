// src/components/pages/StudioContent.tsx
'use client'

import { useState } from 'react'

import { ContactQrCodeModal } from '../layout'
import { CtoSection } from './studio/CtoSection'
import { OrgDiagram } from './studio/OrgDiagram'
import { ProjectShowcase } from './studio/ProjectShowcase'
import { CourseOutline } from './studio/CourseOutline'

export function StudioContent() {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      {/* 1. CTO 组织顶点 */}
      <CtoSection />

      {/* 2. 组织架构图：CTO 之下可扩展的多个研发部门 + 其中一个部门的内部结构放大 */}
      <OrgDiagram />

      {/* 3. 实战项目库：20 个课程项目，按难度分三档 */}
      <ProjectShowcase />

      {/* 4. 赠送课程大纲：往期课程可展开层级树 + 报名 CTA */}
      <CourseOutline onEnroll={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
