import type { NextConfig } from 'next'

const API_PREFIX = '/api/v1'
const LOCAL_API_ORIGIN = 'http://127.0.0.1:8000'
const PRODUCTION_API_ORIGIN = 'https://api.weelume.com'

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '')

const resolveInternalApiOrigin = (): string => {
  const configuredOrigin = process.env.INTERNAL_API_URL
  if (typeof configuredOrigin === 'string' && configuredOrigin.trim() !== '') {
    return trimTrailingSlashes(configuredOrigin.trim())
  }

  if (process.env.NODE_ENV !== 'production') {
    return trimTrailingSlashes(LOCAL_API_ORIGIN)
  }

  return trimTrailingSlashes(PRODUCTION_API_ORIGIN)
}

const config: NextConfig = {
  // output: 'standalone',  // 暂时注释以在 Windows 开发环境构建通过（symlink EPERM 问题）
  env: {
    NEXT_PUBLIC_API_BASE_URL: API_PREFIX,
  },
  async rewrites() {
    const target = resolveInternalApiOrigin()
    return [
      {
        source: '/api/v1/:path*',
        destination: `${target}/api/v1/:path*`,
      },
    ]
  },
  // www.weelume.com → weelume.com 兜底重定向。优先依赖 CDN/DNS 层的 301；
  // 这里作为应用层 safety net，避免 CDN 配置漏掉时两个域名同时被搜索引擎收录。
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.weelume.com' }],
        destination: 'https://weelume.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default config
