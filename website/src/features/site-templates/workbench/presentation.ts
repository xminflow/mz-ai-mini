import type { SiteTemplate, TemplatePresentation } from '../types'
import { getSceneById } from '../taxonomy'

/** 只向展示组件传可序列化字段；页面懒加载逻辑留在服务端注册表中。 */
export function toTemplatePresentation(template: SiteTemplate): TemplatePresentation {
  return {
    ...template,
    category: getSceneById(template.sceneId)!.name,
    surfaces: template.surfaces.map((surface) => ({
      ...surface,
      pages: surface.pages.map(({ slug, title }) => ({ slug, title })),
    })),
  }
}
