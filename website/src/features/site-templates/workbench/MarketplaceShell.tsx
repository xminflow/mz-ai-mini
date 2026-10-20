import type { ReactNode } from 'react'
import { LightShell } from '@/components/layout/LightShell'
import './marketplace.css'

// 复用官网导航、咨询和页脚，仅在市场外壳内切换为深色令牌。
export function MarketplaceShell({ children }: { children: ReactNode }) {
  return (
    <LightShell glow="none" className="home-typography template-market">
      {children}
    </LightShell>
  )
}
