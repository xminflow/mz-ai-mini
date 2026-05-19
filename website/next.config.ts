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
  output: 'standalone',
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
}

export default config
