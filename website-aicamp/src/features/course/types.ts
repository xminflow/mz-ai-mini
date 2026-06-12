// 课程章节仅对会员开放，tier 不含 'none'
export type ChapterTier = 'basic' | 'premium'

export interface Section {
  id: string
  title: string
  file: string
}

export interface Chapter {
  id: string
  title: string
  tier: ChapterTier
  sections: Section[]
}

export interface Manifest {
  title: string
  chapters: Chapter[]
}

// 扁平化后的小节，附带所属章节信息，用于跨章节的上/下一节导航
export interface FlatSection extends Section {
  chapterId: string
  chapterTitle: string
}

// 传给客户端侧栏的精简数据：不下发会被门禁拦截章节的内容路径
export interface SidebarSection {
  id: string
  title: string
}

export interface SidebarChapter {
  id: string
  title: string
  locked: boolean
  sections: SidebarSection[]
}

export interface SidebarData {
  title: string
  chapters: SidebarChapter[]
}

// LessonViewer 上/下节跳转目标
export interface AdjacentLink {
  chapterId: string
  sectionId: string
}

// 服务端提取 + 作用域化后的小节内容：作用域 CSS 与 body 内部 HTML
export interface SectionContent {
  css: string
  html: string
}
