import type { MetadataRoute } from 'next'

import { fetchTrackAnalysisList } from '@/services/track-analysis'

// Next.js 自动从这里读取 sitemap.xml；动态路由通过抓取赛道列表追加。
// 注：playbook 的章节页（/playbook/preface 等）需要登录与会员；命中后会被服务端
// 重定向到 /login 或 /pricing，因此不放入 sitemap，避免浪费爬虫预算。

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://weelume.com').replace(
  /\/+$/,
  '',
)

const STATIC_ROUTES: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
}> = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/membership', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/pricing', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/library', priority: 0.85, changeFrequency: 'weekly' },
  { path: '/bloggers', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/playbook', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/consulting', priority: 0.75, changeFrequency: 'monthly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
]

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // 拉取已发布的赛道分析；失败时降级为只输出静态路由。
  try {
    const list = await fetchTrackAnalysisList({ limit: 200 })
    for (const item of list.items) {
      const updated = parseDate(item.updated_at) ?? parseDate(item.published_at) ?? now
      entries.push({
        url: `${SITE_URL}/library/tracks/${encodeURIComponent(item.slug)}`,
        lastModified: updated,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch (error) {
    console.error({ scope: 'sitemap', event: 'fetch_tracks_failed', error })
  }

  return entries
}

function parseDate(value: string | null): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
