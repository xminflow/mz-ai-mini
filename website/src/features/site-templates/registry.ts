import type { SiteTemplate, SiteTemplatePage } from './types'
import { meridianTemplate } from './catalog/meridian/meta'

/**
 * 与 app/(templates)/templates/[id]/preview 这个静态路由段冲突的 slug。
 * Next.js 静态段优先级高于 catch-all，模板若定义同名页面会被静默吞掉，
 * 表现为「页面写了却打不开」，因此在注册表层直接拒绝而不是让它悄悄失效。
 */
const RESERVED_SLUGS: string[] = ['preview']

/** 新增模板的唯一注册入口：建好 catalog/<id>/ 目录后在这里加一行。 */
export const SITE_TEMPLATES: SiteTemplate[] = [meridianTemplate]

/**
 * 注册表的结构性错误必须在开发时立刻炸出来，不能等到某个页面莫名 404 才发现。
 * 模块加载即执行，任何引用注册表的路由都会触发。
 */
function assertRegistryValid(templates: SiteTemplate[]): void {
  const seenIds = new Set<string>()

  for (const template of templates) {
    if (seenIds.has(template.id)) {
      throw new Error(`[site-templates] 模板 id 重复：${template.id}`)
    }
    seenIds.add(template.id)

    if (!template.pages.some((page) => page.slug === '')) {
      throw new Error(`[site-templates] 模板 ${template.id} 缺少首页（slug 为空串的页面）`)
    }

    const seenSlugs = new Set<string>()
    for (const page of template.pages) {
      if (RESERVED_SLUGS.includes(page.slug)) {
        throw new Error(
          `[site-templates] 模板 ${template.id} 使用了保留 slug「${page.slug}」，该路径被工作台占用`,
        )
      }
      if (seenSlugs.has(page.slug)) {
        throw new Error(
          `[site-templates] 模板 ${template.id} 页面 slug 重复：${page.slug || '(首页)'}`,
        )
      }
      seenSlugs.add(page.slug)
    }
  }
}

assertRegistryValid(SITE_TEMPLATES)

export function getTemplateById(id: string): SiteTemplate | undefined {
  return SITE_TEMPLATES.find((template) => template.id === id)
}

export function getTemplatePage(
  template: SiteTemplate,
  slug: string,
): SiteTemplatePage | undefined {
  return template.pages.find((page) => page.slug === slug)
}
