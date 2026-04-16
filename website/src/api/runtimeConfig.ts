const DEFAULT_API_BASE_URL = '/api/v1'
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000

export const resolveApiBaseUrl = (): string => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    return fromEnv.trim().replace(/\/+$/, '')
  }
  return DEFAULT_API_BASE_URL
}

export const resolveRequestTimeoutMs = (): number => {
  const fromEnv = import.meta.env.VITE_REQUEST_TIMEOUT_MS
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
    const parsed = Number.parseInt(fromEnv, 10)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
  }
  return DEFAULT_REQUEST_TIMEOUT_MS
}
