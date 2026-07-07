import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi } from './api'
import { tokenStore } from './token'

type AuthValue = {
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStore.get())

  const value = useMemo<AuthValue>(
    () => ({
      token,
      async login(username, password) {
        const { token: next } = await authApi.login(username, password)
        tokenStore.set(next)
        setToken(next)
      },
      logout() {
        tokenStore.clear()
        setToken(null)
      },
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
