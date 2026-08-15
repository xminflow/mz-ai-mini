import type { SiteTemplate, SiteTemplatePage } from './types'
import { aegisTemplate } from './catalog/aegis/meta'
import { meridianTemplate } from './catalog/meridian/meta'
import { getSceneById } from './taxonomy'

/**
 * 与 app/(templates)/templates/[id]/preview 这个静态路由段冲突的 slug。
 * Next.js 静态段优先级高于 catch-all，模板若定义同名页面会被静默吞掉，
 * 表现为「页面写了却打不开」，因此在注册表层直接拒绝而不是让它悄悄失效。
 */
const RESERVED_SLUGS: string[] = ['preview']

/** kebab-case，不含 `/`：用于 template.id，它同时是 URL 片段和目录名。 */
const KEBAB_CASE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** kebab-case，允许 `/` 作为多级分隔：用于非空的 page.slug。 */
const KEBAB_CASE_SLUG = /^[a-z0-9]+(?:[-/][a-z0-9]+)*$/

/** 新增模板的唯一注册入口：建好 catalog/<id>/ 目录后在这里加一行。 */
export const SITE_TEMPLATES: SiteTemplate[] = [aegisTemplate, meridianTemplate]

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

    // 场景填错、或场景有模板却漏配自定义区，都当场炸，不留到运行时让案例页缺内容
    const scene = getSceneById(template.sceneId)
    if (!scene) {
      throw new Error(
        `[site-templates] 模板 ${template.id} 的 sceneId「${template.sceneId}」` +
          `不在 taxonomy.ts 的场景清单里`,
      )
    }
    if (!scene.load) {
      throw new Error(
        `[site-templates] 模板 ${template.id} 所属场景「${template.sceneId}」没有配置自定义区：` +
          `请在 taxonomy.ts 给它补上 load，并新建 scenes/${template.sceneId}/Section.tsx`,
      )
    }

    if (!KEBAB_CASE_ID.test(template.id)) {
      throw new Error(
        `[site-templates] 模板 id「${template.id}」不是合法的 kebab-case（如 my-template），` +
          `它同时被用作 URL 片段和 catalog 目录名，格式不对会导致路由或目录解析失败`,
      )
    }

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

      if (page.slug !== '' && !KEBAB_CASE_SLUG.test(page.slug)) {
        throw new Error(
          `[site-templates] 模板 ${template.id} 的页面 slug「${page.slug}」不是合法的 kebab-case` +
            `（如 team 或 about/team，多级用 / 分隔），格式不对的 slug 在运行时会静默 404`,
        )
      }
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
