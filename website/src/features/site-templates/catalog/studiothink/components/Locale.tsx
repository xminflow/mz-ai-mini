'use client'

import { createContext, useContext } from 'react'
import type { TemplateLocale } from '../../../types'
import type { Copy } from '../data'

export const StudioThinkLocale = createContext<TemplateLocale>('zh')

export function useCopy(explicitLocale?: TemplateLocale) {
  const contextLocale = useContext(StudioThinkLocale)
  const locale = explicitLocale ?? contextLocale
  return {
    locale,
    t: (zh: string, en: string) => locale === 'en' ? en : zh,
    copy: (value: Copy) => value[locale === 'en' ? 1 : 0],
  }
}
