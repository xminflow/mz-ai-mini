import type { MetadataRoute } from 'next'

// 官网当前开放中英文首页（见 middleware.ts），其余路径会 307 回首页，
// 因此这里只申报这两个首页，避免向搜索引擎申报会被重定向的 URL、浪费爬虫预算。
// 恢复某个板块时把它的路径加回下面的数组。
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://weelume.com').replace(
  /\/+$/,
  '',
)

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/en'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1.0 : 0.9,
    alternates: { languages: { 'zh-CN': `${SITE_URL}/`, en: `${SITE_URL}/en` } },
  }))
}
