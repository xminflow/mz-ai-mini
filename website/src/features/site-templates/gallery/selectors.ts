import { SITE_TEMPLATES } from '../registry'
import { TEMPLATE_SCENES } from '../taxonomy'
import type { SiteTemplate } from '../types'

/**
 * 侧栏用的场景条目。刻意只含可序列化字段：侧栏是客户端组件（要用 usePathname 做高亮），
 * 而 TemplateScene 带着 load 函数，整个对象跨 Server/Client 边界传不过去。
 */
export interface SidebarScene {
  id: string
  name: string
  count: number
}

export interface SidebarGroup {
  id: string
  name: string
  scenes: SidebarScene[]
}

export interface EmptyScene {
  id: string
  name: string
  /** 所属一级分类名，「其他场景」页要连着一级一起显示才看得懂 */
  groupName: string
}

export function getTemplatesByScene(sceneId: string): SiteTemplate[] {
  return SITE_TEMPLATES.filter((template) => template.sceneId === sceneId)
}

/**
 * 侧栏导航数据：只保留有模板的分支。
 * 空场景剔除，下属场景全空的一级分类整组剔除——15 个场景里目前只有 2 个有货，
 * 全量渲染会让侧栏铺满计数为 0 的死条目，第一眼就是废弃站点的观感。
 * 被剔掉的场景不会消失，它们统一在「其他场景」页里露出。
 */
export function getSidebarNav(): SidebarGroup[] {
  const result: SidebarGroup[] = []

  for (const group of TEMPLATE_SCENES) {
    const scenes: SidebarScene[] = []
    for (const scene of group.scenes) {
      const count = getTemplatesByScene(scene.id).length
      if (count > 0) {
        scenes.push({ id: scene.id, name: scene.name, count })
      }
    }
    if (scenes.length > 0) {
      result.push({ id: group.id, name: group.name, scenes })
    }
  }

  return result
}

export function getEmptyScenes(): EmptyScene[] {
  const result: EmptyScene[] = []

  for (const group of TEMPLATE_SCENES) {
    for (const scene of group.scenes) {
      if (getTemplatesByScene(scene.id).length === 0) {
        result.push({ id: scene.id, name: scene.name, groupName: group.name })
      }
    }
  }

  return result
}
