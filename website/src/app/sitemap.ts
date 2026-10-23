import type { MetadataRoute } from 'next'

// 只申报作为正式首页的模板市场，原中英文软件定制首页暂时隐藏。
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://weelume.com').replace(
  /\/+$/,
  '',
)

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/'].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1.0 : 0.9,
  }))
}
