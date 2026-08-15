import type { ComponentType } from 'react'

/**
 * 传给场景自定义区的场景信息，只含可序列化字段。
 *
 * 不能直接传 TemplateScene：它带着 load 函数，而自定义区的设计意图是「想放什么放什么」，
 * 第一个写成 'use client' 的 Section 会在运行时撞上函数无法跨 Server/Client 边界的报错。
 */
export interface SceneSummary {
  id: string
  name: string
}

/** 场景自定义区收到的 props。 */
export interface SceneSectionProps {
  scene: SceneSummary
  templateCount: number
}

/** 二级分类：业务场景，同时是 /cases/<id> 的 URL 片段。 */
export interface TemplateScene {
  id: string
  name: string
  /**
   * 场景自定义区：默认导出一个接收 SceneSectionProps 的组件。
   * 用 import() 缩略函数而非直接引用，与模板页保持同一套写法，便于分包。
   *
   * 之所以可选：清单里的场景多数暂时没有模板，而没有模板的场景不会单独成页，
   * 强制每个场景都建一个用不上的空文件是纯粹的浪费。反过来，「有模板却漏配 load」
   * 会被 registry.ts 的校验在加载时直接拒绝，不会静默渲染出一个没有介绍的场景页。
   */
  load?: () => Promise<{ default: ComponentType<SceneSectionProps> }>
}

/** 一级分类：产品形态。 */
export interface TemplateSceneGroup {
  id: string
  name: string
  scenes: TemplateScene[]
}

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * 场景清单。数组顺序即左侧导航顺序。
 *
 * 这份清单是完整的，而不是「当前有模板的那几个」——它同时是接下来要补哪些模板的路线图，
 * 没有模板的场景由 gallery 的选择器负责在渲染时收进「其他场景」，不在这里删。
 *
 * scene id 全局唯一且扁平（URL 是 /cases/<scene-id>，不带一级前缀），
 * 因此小程序组的场景加 mp- 前缀，避开与网站组的 online-store / online-course 同名。
 */
export const TEMPLATE_SCENES: TemplateSceneGroup[] = [
  {
    id: 'website',
    name: '网站',
    scenes: [
      {
        id: 'corporate-site',
        name: '企业官网',
        load: () => import('./scenes/corporate-site/Section'),
      },
      { id: 'landing-page', name: '产品落地页' },
      { id: 'brand-portfolio', name: '品牌 / 作品集' },
      { id: 'online-store', name: '网上商城' },
      { id: 'online-course', name: '课程 / 知识付费' },
    ],
  },
  {
    id: 'miniprogram',
    name: '小程序',
    scenes: [
      { id: 'mp-store', name: '电商商城' },
      { id: 'mp-booking', name: '预约 / 到店' },
      { id: 'mp-course', name: '课程 / 知识付费' },
      { id: 'mp-membership', name: '会员 / 积分' },
      { id: 'mp-internal', name: '企业内部工具' },
    ],
  },
  {
    id: 'admin',
    name: '管理后台',
    scenes: [
      { id: 'inventory', name: '进销存 / 库存' },
      { id: 'orders-crm', name: '订单 / 客户管理' },
      { id: 'dashboard', name: '数据看板 / 报表' },
      {
        id: 'monitoring',
        name: '监控运维',
        load: () => import('./scenes/monitoring/Section'),
      },
      { id: 'approval-oa', name: '审批 / OA' },
    ],
  },
]

/**
 * 结构性错误必须在加载时立刻炸出来，不能等到某个场景页莫名 404 才发现。
 * 与 registry.ts 的 assertRegistryValid 同一立场、同一执行时机。
 */
function assertTaxonomyValid(groups: TemplateSceneGroup[]): void {
  const seenGroupIds = new Set<string>()
  const seenSceneIds = new Set<string>()

  for (const group of groups) {
    if (!KEBAB_CASE.test(group.id)) {
      throw new Error(
        `[site-templates] 一级分类 id「${group.id}」不是合法的 kebab-case（如 mini-program）`,
      )
    }
    if (seenGroupIds.has(group.id)) {
      throw new Error(`[site-templates] 一级分类 id 重复：${group.id}`)
    }
    seenGroupIds.add(group.id)

    for (const scene of group.scenes) {
      if (!KEBAB_CASE.test(scene.id)) {
        throw new Error(
          `[site-templates] 场景 id「${scene.id}」不是合法的 kebab-case，` +
            `它是 /cases/<scene-id> 的 URL 片段，格式不对会导致路由解析失败`,
        )
      }
      if (seenSceneIds.has(scene.id)) {
        throw new Error(
          `[site-templates] 场景 id 重复：${scene.id}（scene id 需跨一级分类全局唯一）`,
        )
      }
      seenSceneIds.add(scene.id)
    }
  }
}

assertTaxonomyValid(TEMPLATE_SCENES)

export function getSceneById(sceneId: string): TemplateScene | undefined {
  for (const group of TEMPLATE_SCENES) {
    const scene = group.scenes.find((item) => item.id === sceneId)
    if (scene) return scene
  }
  return undefined
}

export function getGroupOfScene(sceneId: string): TemplateSceneGroup | undefined {
  return TEMPLATE_SCENES.find((group) => group.scenes.some((scene) => scene.id === sceneId))
}
