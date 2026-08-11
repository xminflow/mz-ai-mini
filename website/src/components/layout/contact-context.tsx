'use client'

import { createContext, useContext } from 'react'

// 咨询弹窗的开关由 LightShell 统一持有。用 context 而非逐层传 onContact：
// 页面里有四五处入口散在不同深度的 section 里，透传 prop 会污染每一层的签名。
type ContactContextValue = {
  openContact: () => void
}

export const ContactContext = createContext<ContactContextValue | null>(null)

export function useContact(): ContactContextValue {
  const value = useContext(ContactContext)
  // 显式抛错而不是静默返回空实现：漏套 LightShell 时按钮点了没反应最难查
  if (!value) {
    throw new Error('useContact 必须在 LightShell 内部使用')
  }
  return value
}
