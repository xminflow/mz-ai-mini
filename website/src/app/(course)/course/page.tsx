import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '课程',
}

export default function CourseHomePage() {
  return (
    <div className="flex h-full items-center justify-center text-muted">
      请从左侧目录选择一节课程
    </div>
  )
}
