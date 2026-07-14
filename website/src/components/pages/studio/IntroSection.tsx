'use client'

import { CourseHighlights } from './CourseHighlights'
import { CtoSection } from './CtoSection'

// 左：课程核心价值(招聘视角三大亮点) / 右：CTO 个人简介名片
export function IntroSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-[1.55fr_1fr] lg:items-stretch">
        <CourseHighlights />
        <CtoSection />
      </div>
    </section>
  )
}
