import { getInternalApiBaseUrl } from '@/lib/config'

// 在 RSC / Route Handler 内向 community-server 取数的统一封装。
// 本期公开内容用 mock（见 lib/mock），该函数预留给后续真实接口（如 /api/v1/posts/{slug}）。
export async function fetchFromApi<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getInternalApiBaseUrl()
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!response.ok) {
    throw new Error(`community-server 请求失败: ${response.status} ${path}`)
  }
  return (await response.json()) as T
}
