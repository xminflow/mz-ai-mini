'use client'

import { createContext, useContext } from 'react'
import type { TemplateLocale } from '../../../types'
import type { Copy } from '../data'

export const ConicornLocale = createContext<TemplateLocale>('en')
export function useCopy() {
  const locale = useContext(ConicornLocale)
  const copy = (value: Copy) => value[locale === 'zh' ? 0 : 1]
  const t = (zh: string, en: string) => locale === 'zh' ? zh : en
  return { locale, copy, t }
}
