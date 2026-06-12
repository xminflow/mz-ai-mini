import type { AuthAccount } from '@/features/auth/types'
import { requireTier } from '@/features/membership/require-tier'
import type { ChapterTier } from './types'

// 进入课程区的最低会员门槛：任意有效会员
export const COURSE_MIN_TIER = 'basic' as const

// 当前账号是否可访问指定章节（高档满足低档）
export function canAccessChapter(account: AuthAccount | null, chapterTier: ChapterTier): boolean {
  return requireTier(account, chapterTier)
}
