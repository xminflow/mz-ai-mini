import { request } from '@/lib/apiClient'

export const authApi = {
  async login(username: string, password: string) {
    const data = await request<{ token: string; expires_at: string }>('/admin/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    return { token: data.token, expiresAt: data.expires_at }
  },
  async me(token: string) {
    return request<{ username: string }>('/admin/auth/me', { token })
  },
}
