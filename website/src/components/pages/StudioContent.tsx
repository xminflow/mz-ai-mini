// src/components/pages/StudioContent.tsx
'use client'

import { useState } from 'react'

import { ContactQrCodeModal } from '../layout'
import { IntroSection } from './studio/IntroSection'
import { WordCloudSection } from './studio/WordCloudSection'
import { ProjectShowcase } from './studio/ProjectShowcase'
import { CourseOutline } from './studio/CourseOutline'
import { FoundationBasics } from './studio/FoundationBasics'

export function StudioContent() {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      {/* 1. 左：课程核心价值(招聘视角三亮点) / 右：CTO 个人简介 */}
      <IntroSection />

      {/* 2. 词云：项目优势与课程价值关键词 */}
      <WordCloudSection />

      {/* 3. 基础巩固：做 10 个项目前必学的 6 块地基（作为实战项目的前置铺垫，放在项目库之前） */}
      <FoundationBasics />

      {/* 4. 实战项目库：10 个课程项目，按难度分三档 */}
      <ProjectShowcase />

      {/* 5. 赠送课程大纲：往期课程可展开层级树 + 报名 CTA */}
      <CourseOutline onEnroll={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
