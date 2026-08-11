import type { MetadataRoute } from 'next'

// 官网当前只对外开放首页（见 middleware.ts），其余路径会 307 回首页，
// 因此这里只申报首页，避免向搜索引擎申报会被重定向的 URL、浪费爬虫预算。
// 恢复某个板块时把它的路径加回下面的数组。
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://weelume.com').replace(
  /\/+$/,
  '',
)

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]
}
