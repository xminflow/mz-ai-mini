// 服务端配置读取。注意：所有变量都不带 NEXT_PUBLIC_ 前缀，确保不泄漏到客户端产物。
const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '')

export function getInternalApiBaseUrl(): string {
  const configured = process.env.COMMUNITY_API_INTERNAL_URL
  if (configured && configured.trim() !== '') {
    return trimTrailingSlashes(configured.trim())
  }
  if (process.env.NODE_ENV !== 'production') {
    return 'http://127.0.0.1:8001'
  }
  // 生产环境必须显式配置，禁止静默兜底到本地地址
  throw new Error('COMMUNITY_API_INTERNAL_URL 未配置（生产环境必填）。')
}
