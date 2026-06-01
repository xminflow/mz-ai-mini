'use client'

// 客户端数据访问：只打同源 /api/bff 与 /api/auth，绝不直连 community-server。
export async function bffGet<T>(resource: string): Promise<T> {
  const response = await fetch(`/api/bff/${resource}`, { method: 'GET', credentials: 'include' })
  if (!response.ok) {
    throw new Error(`bff 请求失败: ${response.status} ${resource}`)
  }
  return (await response.json()) as T
}

export async function login(account: string): Promise<void> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account }),
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('登录失败')
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
}
