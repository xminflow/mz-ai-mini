'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'

import { getSiteCopy, type SiteLocale } from './copy'

const SiteLocaleContext = createContext<SiteLocale>('zh')

export function SiteLocaleProvider({ locale, children }: { locale: SiteLocale; children: ReactNode }) {
  // 根布局不会在客户端切换路由时重建，因此同步文档语言；首个请求由服务端输出正确的 lang。
  useEffect(() => {
    document.documentElement.lang = locale === 'en' ? 'en' : 'zh-CN'
    // 离开首页时，其余中文页面恢复默认语言；双语模板由各自外壳接管。
    return () => { document.documentElement.lang = 'zh-CN' }
  }, [locale])

  return <SiteLocaleContext.Provider value={locale}>{children}</SiteLocaleContext.Provider>
}

export function useSiteLocale() {
  const locale = useContext(SiteLocaleContext)
  return { locale, copy: getSiteCopy(locale) }
}
