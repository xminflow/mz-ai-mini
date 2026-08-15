import type { SiteTemplate, SiteTemplatePage, TemplateSurface } from './types'
import { aegisTemplate } from './catalog/aegis/meta'
import { getSceneById } from './taxonomy'

/**
 * 与 app/(templates)/templates/[id]/preview 这个静态路由段冲突的端 id。
 * Next.js 静态段优先级高于 catch-all，模板若定义同名端会被静默吞掉，
 * 表现为「端配了却打不开」，因此在注册表层直接拒绝而不是让它悄悄失效。
 *
 * 注意保留的是**端 id** 而不是页面 slug：端 id 才是 /templates/<模板>/ 之后的第一段。
 */
const RESERVED_SURFACE_IDS: string[] = ['preview']

/** kebab-case，不含 `/`：用于 template.id 与 surface.id，两者都是单段 URL 片段。 */
const KEBAB_CASE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** kebab-case，允许 `/` 作为多级分隔：用于非空的 page.slug。 */
const KEBAB_CASE_SLUG = /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/

/** 新增模板的唯一注册入口：建好 catalog/<id>/ 目录后在这里加一行。 */
export const SITE_TEMPLATES: SiteTemplate[] = [aegisTemplate]

/** 校验单个端的结构。抽出来是因为端内的规则与模板级规则是两回事，混在一个循环里读不清。 */
function assertSurfaceValid(templateId: string, surface: TemplateSurface): void {
  if (!KEBAB_CASE_ID.test(surface.id)) {
    throw new Error(
      `[site-templates] 模板 ${templateId} 的端 id「${surface.id}」不是合法的 kebab-case` +
        `（如 admin），它是 URL 的一段，格式不对会导致路由解析失败`,
    )
  }

  if (RESERVED_SURFACE_IDS.includes(surface.id)) {
    throw new Error(
      `[site-templates] 模板 ${templateId} 使用了保留端 id「${surface.id}」，该路径被工作台占用`,
    )
  }

  if (!surface.pages.some((page) => page.slug === '')) {
    throw new Error(
      `[site-templates] 模板 ${templateId} 的端「${surface.id}」缺少首页（slug 为空串的页面）`,
    )
  }

  const seenSlugs = new Set<string>()
  for (const page of surface.pages) {
    if (seenSlugs.has(page.slug)) {
      throw new Error(
        `[site-templates] 模板 ${templateId} 的端「${surface.id}」页面 slug 重复：` +
          `${page.slug || '(首页)'}`,
      )
    }
    seenSlugs.add(page.slug)

    if (page.slug !== '' && !KEBAB_CASE_SLUG.test(page.slug)) {
      throw new Error(
        `[site-templates] 模板 ${templateId} 的端「${surface.id}」页面 slug「${page.slug}」` +
          `不是合法的 kebab-case（如 team 或 about/team，多级用 / 分隔），` +
          `格式不对的 slug 在运行时会静默 404`,
      )
    }
  }
}

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

    // 场景填错当场炸，不留到运行时让案例页静默少一套模板。
    // 这里不要求场景配了自定义区：没写 Section.tsx 的场景会走 SceneFallback，
    // 与该场景有没有模板无关，两者不互为前提。
    if (!getSceneById(template.sceneId)) {
      throw new Error(
        `[site-templates] 模板 ${template.id} 的 sceneId「${template.sceneId}」` +
          `不在 taxonomy.ts 的场景清单里`,
      )
    }

    if (!KEBAB_CASE_ID.test(template.id)) {
      throw new Error(
        `[site-templates] 模板 id「${template.id}」不是合法的 kebab-case（如 my-template），` +
          `它同时被用作 URL 片段和 catalog 目录名，格式不对会导致路由或目录解析失败`,
      )
    }

    if (template.surfaces.length === 0) {
      throw new Error(`[site-templates] 模板 ${template.id} 没有任何端，至少要有一个`)
    }

    const seenSurfaceIds = new Set<string>()
    for (const surface of template.surfaces) {
      if (seenSurfaceIds.has(surface.id)) {
        throw new Error(`[site-templates] 模板 ${template.id} 的端 id 重复：${surface.id}`)
      }
      seenSurfaceIds.add(surface.id)
      assertSurfaceValid(template.id, surface)
    }
  }
}

assertRegistryValid(SITE_TEMPLATES)

export function getTemplateById(id: string): SiteTemplate | undefined {
  return SITE_TEMPLATES.find((template) => template.id === id)
}

export function getSurfaceById(
  template: SiteTemplate,
  surfaceId: string,
): TemplateSurface | undefined {
  return template.surfaces.find((surface) => surface.id === surfaceId)
}

export function getSurfacePage(
  surface: TemplateSurface,
  slug: string,
): SiteTemplatePage | undefined {
  return surface.pages.find((page) => page.slug === slug)
}
