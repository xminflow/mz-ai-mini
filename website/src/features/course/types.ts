// 课程仅控登录，不分会员等级，故不含 tier 字段
export interface Section {
  id: string
  title: string
  file: string
}

export interface Chapter {
  id: string
  title: string
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

// 传给客户端侧栏的精简数据
export interface SidebarSection {
  id: string
  title: string
}

export interface SidebarChapter {
  id: string
  title: string
  sections: SidebarSection[]
}

export interface SidebarData {
  title: string
  chapters: SidebarChapter[]
}
