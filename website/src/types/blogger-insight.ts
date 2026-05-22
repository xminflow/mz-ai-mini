export const BLOGGER_PLATFORM_LABELS: Record<string, string> = {
  douyin: '抖音',
  xiaohongshu: '小红书',
  bilibili: 'B 站',
  wechat: '微信',
  other: '其他',
}

export interface BloggerInsightListItem {
  slug: string
  platform: string
  display_name: string
  avatar_url: string | null
  fans_count: number | null
  total_works_count: number | null
  industry: string | null
  positioning: string | null
  tags: string[]
  cover_image_url: string | null
  is_free: boolean
  status: string
  captured_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface BloggerInsightDetail extends BloggerInsightListItem {
  signature: string | null
  report_html: string
  report_summary: Record<string, unknown> | null
  source_run_id: string | null
}

export interface BloggerInsightListResult {
  items: BloggerInsightListItem[]
  next_cursor: string | null
  available_platforms: string[]
  available_industries: string[]
}

export function formatBloggerFans(count: number | null): string {
  if (count === null) return '—'
  if (count >= 10000) {
    const wan = count / 10000
    return wan >= 100 ? `${Math.round(wan)} 万粉` : `${wan.toFixed(1)} 万粉`
  }
  return `${count} 粉`
}

export function bloggerPlatformLabel(platform: string): string {
  return BLOGGER_PLATFORM_LABELS[platform] ?? platform
}
