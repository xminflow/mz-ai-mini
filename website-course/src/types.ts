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
