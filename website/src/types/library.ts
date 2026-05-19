export const LIBRARY_TYPES = {
  BREAKDOWN: 'breakdown',
  BLOGGER: 'blogger',
  TRACK: 'track',
  PLAYBOOK: 'playbook',
} as const

export type LibraryType = (typeof LIBRARY_TYPES)[keyof typeof LIBRARY_TYPES]

export const LIBRARY_TYPE_LABELS: Record<LibraryType, string> = {
  breakdown: '爆款拆解',
  blogger: '博主洞察',
  track: '赛道分析',
  playbook: '百万粉博主运营方法论精炼',
}

export const LIBRARY_TYPE_TAGLINES: Record<LibraryType, string> = {
  breakdown: '把一条爆款的钩子、结构、节奏完全拆开',
  blogger: '一个博主的矩阵布局与成长路径',
  track: '一个赛道的玩家、机会与天花板',
  playbook: '百万级博主背后的可复用打法',
}

export const LIBRARY_TYPE_UNIT: Record<LibraryType, string> = {
  breakdown: '篇',
  blogger: '个',
  track: '个',
  playbook: '篇',
}

export interface BreakdownPayload {
  sourceUrl: string
  sourcePlatform: string
  oneLine: string
  hook: string[]
  structure: string[]
  rhythm: string[]
  template: string[]
  audience: string
}

export interface BloggerPayload {
  profile: {
    nickname: string
    platform: string
    fans: string
    positioning: string
  }
  oneLine: string
  matrix: Array<{ name: string; role: string }>
  timeline: Array<{ when: string; what: string }>
  methodology: string[]
  monetization: string[]
  borrowable: string[]
  notReplicable: string[]
}

export interface TrackPayload {
  portrait: {
    industry: string
    platforms: string[]
    stage: string
  }
  oneLine: string
  landscape: Array<{ tier: string; players: string }>
  opportunities: string[]
  ceiling: string[]
  monetization: string[]
  startupStrategy: string[]
}

export interface PlaybookPayload {
  audience: string
  steps: Array<{ title: string; detail: string }>
  checklist: string[]
  downloads?: Array<{ label: string; href: string }>
}

export type LibraryItemPayload =
  | { type: 'breakdown'; data: BreakdownPayload }
  | { type: 'blogger'; data: BloggerPayload }
  | { type: 'track'; data: TrackPayload }
  | { type: 'playbook'; data: PlaybookPayload }

export interface LibraryItem {
  id: string
  type: LibraryType
  title: string
  summary: string
  coverEmoji?: string
  tags: string[]
  platforms: string[]
  industries: string[]
  publishedAt: string
  readTime: number
  payload: LibraryItemPayload
  // type-specific display hints
  hint?: {
    interactions?: string
    fanCount?: string
    matrixCount?: number
    industry?: string
    platform?: string
    keyDataPoints?: string[]
    difficulty?: string
    hasDownload?: boolean
  }
}
