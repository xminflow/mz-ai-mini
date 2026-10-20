'use client'

import { createContext, useContext } from 'react'
import type { TemplateLocale } from '../../../types'
import { getTranslator } from '../messages'

export const LocaleContext = createContext<TemplateLocale>('zh')
export function useLuneraLocale() {
  const locale = useContext(LocaleContext)
  return { locale, t: getTranslator(locale) }
}
