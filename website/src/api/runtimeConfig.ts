const DEFAULT_API_BASE_URL = '/api/v1'
const DEFAULT_SERVER_API_URL = 'http://127.0.0.1:8000/api/v1'
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000

const isServer = typeof window === 'undefined'

export const resolveApiBaseUrl = (): string => {
  if (isServer) {
    const serverUrl = process.env.INTERNAL_API_URL
    if (typeof serverUrl === 'string' && serverUrl.trim() !== '') {
      return serverUrl.trim().replace(/\/+$/, '')
    }
    return DEFAULT_SERVER_API_URL
  }
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.trim().replace(/\/+$/, '')
  }
  return DEFAULT_API_BASE_URL
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
