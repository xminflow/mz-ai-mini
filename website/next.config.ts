import type { NextConfig } from 'next'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { API_PREFIX, LOCAL_API_ORIGIN, PRODUCTION_API_ORIGIN } = require('../app/miniprogram/core/runtime-config.js') as {
  API_PREFIX: string
  LOCAL_API_ORIGIN: string
  PRODUCTION_API_ORIGIN: string
}

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
        source: '/api/:path*',
        destination: `${target}/api/:path*`,
      },
    ]
  },
}

export default config
