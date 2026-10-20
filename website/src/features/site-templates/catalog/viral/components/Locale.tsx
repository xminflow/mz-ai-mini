'use client'

import { createContext, useContext } from 'react'
import type { TemplateLocale } from '../../../types'
import type { Copy } from '../data'

export const ViralLocale = createContext<TemplateLocale>('zh')

export function useCopy(overrideLocale?: TemplateLocale) {
  const contextLocale = useContext(ViralLocale)
  const locale = overrideLocale ?? contextLocale
  return { locale, t: (zh: string, en: string) => locale === 'zh' ? zh : en, copy: (value: Copy) => value[locale === 'zh' ? 0 : 1] }
}
