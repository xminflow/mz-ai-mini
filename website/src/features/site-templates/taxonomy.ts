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

/** 一个业务形态，同时是 /cases/<id> 的 URL 片段。 */
export interface TemplateScene {
  id: string
  name: string
  /**
   * 场景自定义区：默认导出一个接收 SceneSectionProps 的组件。
   * 用 import() 缩略函数而非直接引用，与模板页保持同一套写法，便于分包。
   *
   * 可选：介绍文案是逐个场景确认后才填的，没填的走 scenes/_shared/SceneFallback.tsx，
   * 强制每个场景都建一个文件只是为了让 tsc 通过，纯属浪费。
   */
  load?: () => Promise<{ default: ComponentType<SceneSectionProps> }>
}

const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * 业务形态清单，一层扁平结构。数组顺序即左侧导航顺序：对外获客类在前，内部管理类在后。
 *
 * 分类维度只有一个——「客户要做的是什么」。载体（小程序还是 PC 端）不进这里，
 * 它是模板自己的属性（见 types.ts 的 platform）：同一件事在不同端上做，
 * 对客户来说仍是同一件事，拆成两个分类只会让「电商商城」这类条目在目录里出现两次。
 */
export const TEMPLATE_SCENES: TemplateScene[] = [
  { id: 'corporate-site', name: '企业官网', load: () => import('./scenes/corporate-site/Section') },
  { id: 'landing-page', name: '产品落地页' },
  { id: 'brand-portfolio', name: '品牌展示 / 作品集' },
  { id: 'online-store', name: '电商商城' },
  { id: 'paid-course', name: '知识付费' },
  { id: 'booking', name: '预约到店' },
  { id: 'membership', name: '会员积分' },
  { id: 'inventory', name: '进销存' },
  { id: 'orders', name: '订单管理' },
  { id: 'crm', name: '客户管理' },
  { id: 'dashboard', name: '数据看板' },
  { id: 'approval-oa', name: '审批 / OA' },
  { id: 'internal-tools', name: '企业内部工具' },
  // 兜底项固定排在末尾：软件定制没法被十几个名字穷尽，归不到上面任何一类的项目落这里
  { id: 'other', name: '其他', load: () => import('./scenes/other/Section') },
]

/**
 * 结构性错误必须在加载时立刻炸出来，不能等到某个场景页莫名 404 才发现。
 * 与 registry.ts 的 assertRegistryValid 同一立场、同一执行时机。
 */
function assertTaxonomyValid(scenes: TemplateScene[]): void {
  const seenIds = new Set<string>()

  for (const scene of scenes) {
    if (!KEBAB_CASE.test(scene.id)) {
      throw new Error(
        `[site-templates] 场景 id「${scene.id}」不是合法的 kebab-case，` +
          `它是 /cases/<scene-id> 的 URL 片段，格式不对会导致路由解析失败`,
      )
    }
    if (seenIds.has(scene.id)) {
      throw new Error(`[site-templates] 场景 id 重复：${scene.id}`)
    }
    seenIds.add(scene.id)
  }
}

assertTaxonomyValid(TEMPLATE_SCENES)

export function getSceneById(sceneId: string): TemplateScene | undefined {
  return TEMPLATE_SCENES.find((scene) => scene.id === sceneId)
}
