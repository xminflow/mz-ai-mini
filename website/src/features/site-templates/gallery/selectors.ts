import { SITE_TEMPLATES } from '../registry'
import { TEMPLATE_SCENES } from '../taxonomy'
import type { SiteTemplate } from '../types'

/**
 * 侧栏用的场景条目。刻意只含可序列化字段：侧栏是客户端组件（要用 usePathname 做高亮），
 * 而 TemplateScene 带着 load 函数，整个对象跨 Server/Client 边界传不过去。
 *
 * 这里不带模板计数：侧栏是「我们能做哪些类型的项目」的目录，不是库存清单，
 * 挂上数字会把读者的注意力引到「这个场景只有 1 个」而不是「有没有我要的场景」。
 */
export interface SidebarScene {
  id: string
  name: string
}

export interface SidebarGroup {
  id: string
  name: string
  scenes: SidebarScene[]
}

/**
 * 已上架到案例页的模板。`listed` 为 false 的模板只在内部工作台 /templates 可见。
 *
 * 上架是一个需要逐套确认的动作，不是新建模板的副作用：注册表收录 ≠ 对外展示，
 * 因此这里按 listed 过滤，而不是直接用 SITE_TEMPLATES。
 */
export function getListedTemplates(): SiteTemplate[] {
  return SITE_TEMPLATES.filter((template) => template.listed)
}

export function getTemplatesByScene(sceneId: string): SiteTemplate[] {
  return getListedTemplates().filter((template) => template.sceneId === sceneId)
}

/**
 * 侧栏导航数据：三个一级分类与全部 15 个场景原样列出，不按有无模板过滤。
 *
 * 侧栏表达的是业务范围而不是当前库存——访客是带着「我要做个进销存」进来的，
 * 那一项必须在目录里能找到，哪怕它下面暂时还没有可公开的样板。
 */
export function getSidebarNav(): SidebarGroup[] {
  return TEMPLATE_SCENES.map((group) => ({
    id: group.id,
    name: group.name,
    scenes: group.scenes.map((scene) => ({ id: scene.id, name: scene.name })),
  }))
}
