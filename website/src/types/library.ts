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
  playbook: '章',
}
