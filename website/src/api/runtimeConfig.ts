const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1'
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000

const isServer = typeof window === 'undefined'

export const resolveApiBaseUrl = (): string => {
  if (isServer) {
    const internalApiOrigin = process.env.INTERNAL_API_URL
    if (typeof internalApiOrigin === 'string' && internalApiOrigin.trim() !== '') {
      return `${internalApiOrigin.trim().replace(/\/+$/, '')}${DEFAULT_API_BASE_URL}`
    }
    throw new Error('INTERNAL_API_URL is required for server-side API requests.')
  }
  return DEFAULT_API_BASE_URL.trim().replace(/\/+$/, '')
}

export const resolveRequestTimeoutMs = (): number => {
  const fromEnv = process.env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    const parsed = Number.parseInt(fromEnv, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }
  return DEFAULT_REQUEST_TIMEOUT_MS
}
