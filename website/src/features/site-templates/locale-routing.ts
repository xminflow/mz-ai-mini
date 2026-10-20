import type { TemplateLocale, TemplateSurface } from './types'

/** 语言前缀仅由声明支持该语言的端消费，其他模板的页面 slug 保持原义。 */
export function resolveSurfaceLocale(surface: TemplateSurface, pageSlug: string): { locale: TemplateLocale; pageSlug: string } {
  const segments = pageSlug.split('/')
  if (segments[0] === 'en' && surface.locales?.includes('en')) {
    return { locale: 'en', pageSlug: segments.slice(1).join('/') }
  }
  return { locale: 'zh', pageSlug }
}

export function surfaceLocalePath(basePath: string, locale: TemplateLocale): string {
  return locale === 'en' ? `${basePath}/en` : basePath
}
