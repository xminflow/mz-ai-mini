# 案例页按场景分类的模板陈列 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `/cases` 改造成按场景两级分类陈列整站模板的页面：左侧场景导航，右侧是场景自定义内容区加该场景下的模板列表。

**Architecture:** 新增 `features/site-templates/taxonomy.ts` 作为场景清单的唯一来源，`SiteTemplate` 通过 `sceneId` 引用它；`gallery/selectors.ts` 由 taxonomy 与 registry 推导出可序列化的视图数据；`app/(site)/cases/` 下用 layout 承载左侧栏，三个页面（全部 / 单场景 / 其他场景）共用它。场景的介绍区是一个动态引入的 React 组件插槽而不是数据字段，将来能塞任意内容。

**Tech Stack:** Next.js 15 App Router（`params` 是 Promise）、React 19、Tailwind v4（`@theme` 令牌写在 `src/app/globals.css`）、TypeScript。无新增依赖。

**Spec:** `docs/superpowers/specs/2026-08-14-cases-scene-gallery-design.md`

## Global Constraints

- **不新增任何依赖。**
- **本项目前端不写组件级测试**（`CLAUDE.md` 明文：「前端不要求编写组件级测试。前端改动必须至少通过页面运行、关键交互或浏览器日志验证」）。因此每个任务的验证环节是：`pnpm lint` + `pnpm exec tsc --noEmit` + dev server 实际访问页面，而不是单元测试。计划中的「验证」步骤按此执行。
- **dev server 常驻 `http://localhost:3100`，不要另起实例。** 两个 dev 共用 `.next` 会互相打成 500 或卡死。若未运行，用 `pnpm --dir website run dev -- -p 3100` 起一个并保持。
- **不要跑 `next build`。** 本项目已知 `next build` 会挂掉 dev server，且 standalone 输出在 Windows 上必然 EPERM 失败，与业务代码无关。
- **禁止 `any`**，禁止静默兜底、静默降级，异常必须显式抛出并带可定位的上下文。
- **复杂逻辑与非显然设计写中文注释**；简单赋值不写注释。
- 浅色页面只用浅色令牌：`paper` / `paper-raised` / `graphite` / `graphite-soft` / `graphite-dim` / `rule` / `rule-strong` / `blue` / `red` / `yellow` / `rounded-btn`。**不得使用深色令牌**（`ink` / `canvas` / `surface` / `hairline`）或 `neutral-*` 系列。
- 圆角一律 `rounded-btn`，全站不出现 `rounded-full` 形态的按钮（圆点等装饰性圆形除外）。
- 视觉风格：线 + 文字为主，**不要卡片堆叠、不要嵌套容器**。
- 每个任务结束时提交一次，提交信息用中文 conventional commit，结尾附
  `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`。

---

### Task 1: 场景分类数据层

建立场景清单与它的结构性校验。本任务不引用任何尚不存在的文件，完成后 `tsc` 必须干净通过。

**Files:**
- Create: `website/src/features/site-templates/taxonomy.ts`

**Interfaces:**
- Consumes: 无
- Produces:
  - `interface SceneSectionProps { scene: TemplateScene; templateCount: number }`
  - `interface TemplateScene { id: string; name: string; load?: () => Promise<{ default: ComponentType<SceneSectionProps> }> }`
  - `interface TemplateSceneGroup { id: string; name: string; scenes: TemplateScene[] }`
  - `const TEMPLATE_SCENES: TemplateSceneGroup[]`
  - `function getSceneById(sceneId: string): TemplateScene | undefined`
  - `function getGroupOfScene(sceneId: string): TemplateSceneGroup | undefined`

- [ ] **Step 1: 建 `website/src/features/site-templates/taxonomy.ts`**

```ts
import type { ComponentType } from 'react'

/** 场景自定义区收到的 props。 */
export interface SceneSectionProps {
  scene: TemplateScene
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

/**
 * 与 app/(site)/cases/other 这个静态路由段冲突的 scene id。
 * Next.js 静态段优先级高于动态段，场景若取这个名字会被静默吞掉，
 * 表现为「场景配了却打不开」，因此在 taxonomy 层直接拒绝，
 * 与 registry.ts 拒绝保留 slug `preview` 是同一个坑、同一种处理。
 */
const RESERVED_SCENE_IDS: string[] = ['other']

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
      { id: 'corporate-site', name: '企业官网' },
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
      { id: 'monitoring', name: '监控运维' },
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
      if (RESERVED_SCENE_IDS.includes(scene.id)) {
        throw new Error(
          `[site-templates] 场景 id「${scene.id}」是保留值，该路径被案例页的静态路由段占用`,
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
```

- [ ] **Step 2: 类型与 lint 检查**

```bash
cd website && pnpm exec tsc --noEmit && pnpm run lint
```

预期：两条都通过，无报错。

- [ ] **Step 3: 负向校验（保留 id）**

临时把 `corporate-site` 改成 `other`，然后：

```bash
cd website && pnpm exec tsx --version 2>/dev/null || true
node --experimental-strip-types -e "import('./src/features/site-templates/taxonomy.ts')" 2>&1 | head -5
```

若上面的 node 方式在本机不可用，改用页面路径验证：保持修改，刷新 `http://localhost:3100/templates`，dev server 终端应打出
`[site-templates] 场景 id「other」是保留值…`。

预期：抛出保留 id 错误。**验证后必须还原为 `corporate-site`。**

- [ ] **Step 4: 负向校验（重复 id）**

临时把 `mp-course` 改成 `online-course`（与网站组重名），重复 Step 3 的验证方式。

预期：抛出 `场景 id 重复：online-course`。**验证后必须还原为 `mp-course`。**

- [ ] **Step 5: 确认已还原并提交**

```bash
cd website && git diff --stat src/features/site-templates/taxonomy.ts
git add src/features/site-templates/taxonomy.ts
git commit -m "feat(website): 模板场景分类清单与结构校验

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

提交前确认 `TEMPLATE_SCENES` 里是 `corporate-site` 和 `mp-course`，没有留下负向验证的临时值。

---

### Task 2: `SiteTemplate` 接入 `sceneId`，删除 `industry`

把模板挂到场景上，并把 `industry` 这条冗余的分类轴合并进 `tags`。

**Files:**
- Modify: `website/src/features/site-templates/types.ts`
- Modify: `website/src/features/site-templates/registry.ts`
- Modify: `website/src/features/site-templates/catalog/meridian/meta.ts`
- Modify: `website/src/features/site-templates/catalog/aegis/meta.ts`
- Modify: `website/src/features/site-templates/workbench/TemplateCard.tsx`
- Modify: `website/src/features/site-templates/README.md`

**Interfaces:**
- Consumes: `getSceneById` from Task 1
- Produces: `SiteTemplate` 新增必填 `sceneId: string`，移除 `industry`

- [ ] **Step 1: 改 `types.ts` 的 `SiteTemplate`**

把现有的 `industry` 字段整段替换为 `sceneId`：

```ts
export interface SiteTemplate {
  id: string
  name: string
  /**
   * 所属场景，取值必须是 taxonomy.ts 里定义的 scene id，注册表会校验。
   * 它决定模板出现在案例页的哪个分类下。
   *
   * 这里刻意不再保留独立的 industry 字段：sceneId 已经表达了「这是什么类型的项目」，
   * 再留一条近似的行业轴会让新增模板的人不知道该往哪填，行业信息一律进 tags。
   */
  sceneId: string
  /** 风格与行业标签，卡片上平铺展示 */
  tags: string[]
  summary: string
  /** 主色，列表页用一个色点标识 */
  accentColor: string
  /** 封面图路径，位于 public/templates/<id>/ 下 */
  cover: string
  pages: SiteTemplatePage[]
}
```

- [ ] **Step 2: 改 `registry.ts`：校验 sceneId 引用有效**

在文件顶部加 import：

```ts
import { getSceneById } from './taxonomy'
```

在 `assertRegistryValid` 的 `for (const template of templates)` 循环里，紧跟在 `seenIds.add(template.id)` 之后插入：

```ts
    // 场景填错当场炸，不留到运行时让案例页静默少一套模板
    if (!getSceneById(template.sceneId)) {
      throw new Error(
        `[site-templates] 模板 ${template.id} 的 sceneId「${template.sceneId}」` +
          `不在 taxonomy.ts 的场景清单里`,
      )
    }
```

- [ ] **Step 3: 改两套模板的 meta**

`catalog/meridian/meta.ts`：删掉 `industry: '专业服务',`，加上 `sceneId: 'corporate-site',`，并把原 industry 的值并进 tags：

```ts
  sceneId: 'corporate-site',
  tags: ['深色', '衬线', '克制', '专业服务'],
```

`catalog/aegis/meta.ts`：删掉 `industry: '云原生 / 可观测性',`，加上：

```ts
  sceneId: 'monitoring',
  tags: ['浅色', '控制台', '图表', '数据密集', '云原生 / 可观测性'],
```

- [ ] **Step 4: 改 `workbench/TemplateCard.tsx`**

删掉这一行（`industry` 已不存在，不删会编译失败）：

```tsx
        <span className="text-xs text-neutral-500">{template.industry}</span>
```

- [ ] **Step 5: 类型与 lint 检查**

```bash
cd website && pnpm exec tsc --noEmit && pnpm run lint
```

预期：通过。若报 `Property 'industry' does not exist`，说明还有引用没清干净，全局搜 `industry` 补掉。

- [ ] **Step 6: 页面验证**

浏览器打开 `http://localhost:3100/templates`，确认两套模板卡片仍正常渲染，只是少了原来那行行业小字，标签行里多了行业词。检查 dev server 终端无报错。

- [ ] **Step 7: 负向校验**

临时把 `meridian/meta.ts` 的 `sceneId` 改成 `'not-a-scene'`，刷新 `/templates`，dev server 终端应打出
`[site-templates] 模板 meridian 的 sceneId「not-a-scene」不在 taxonomy.ts 的场景清单里`。
**验证后还原为 `'corporate-site'`。**

- [ ] **Step 8: 更新 README**

在 `README.md` 的「新增一套模板」小节，把第 6 条改成两条：

```markdown
6. 在 `meta.ts` 里填 `sceneId`，取值必须是 `taxonomy.ts` 里已有的场景 id；
   若该场景是第一次有模板，还需要在 `taxonomy.ts` 给它补上 `load`，
   并在 `scenes/<scene-id>/Section.tsx` 写它的自定义区（见「案例页」一节）
7. 在 `registry.ts` 的 `SITE_TEMPLATES` 里加一行
```

在「已知遗留」的「注册表校验会炸掉整个官网的生产构建」那一条末尾追加一句：

```markdown
  新增的 `sceneId` 校验（场景不存在、场景没配 `load`）同样在这个位置执行，
  因此它们也在这个爆炸半径内。
```

- [ ] **Step 9: 提交**

```bash
cd website && git add src/features/site-templates
git commit -m "refactor(website): 模板改用 sceneId 挂载场景，industry 并入 tags

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 门禁放行与案例页骨架

`/cases` 变得可达，左侧栏与「全部模板」页跑起来。

**Files:**
- Create: `website/src/features/site-templates/gallery/selectors.ts`
- Create: `website/src/features/site-templates/gallery/SceneSidebar.tsx`
- Create: `website/src/app/(site)/cases/layout.tsx`
- Modify: `website/src/middleware.ts`
- Modify: `website/src/app/(site)/cases/page.tsx`
- Delete: `website/src/components/pages/cases/CasesContent.tsx`（及其空掉的父目录）

**Interfaces:**
- Consumes: `TEMPLATE_SCENES`、`TemplateScene`（Task 1）；`SiteTemplate.sceneId`（Task 2）
- Produces:
  - `interface SidebarScene { id: string; name: string; count: number }`
  - `interface SidebarGroup { id: string; name: string; scenes: SidebarScene[] }`
  - `interface EmptyScene { id: string; name: string; groupName: string }`
  - `function getTemplatesByScene(sceneId: string): SiteTemplate[]`
  - `function getSidebarNav(): SidebarGroup[]`
  - `function getEmptyScenes(): EmptyScene[]`
  - `function SceneSidebar(props: { groups: SidebarGroup[]; totalCount: number }): JSX.Element`

**不要新建模板卡片组件。** 陈列用的是已有的 `features/site-templates/workbench/TemplateRow.tsx`
（整行式布局，浅色，签名 `TemplateRow({ template }: { template: SiteTemplate })`，
内部已用 taxonomy 渲染「一级分类 / 场景」眉标，并链到 `/templates/<id>/preview`）。
直接 import 它，不要复制一份、不要改它。

- [ ] **Step 1: 建 `gallery/selectors.ts`**

```ts
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
```

- [ ] **Step 2: 建 `gallery/SceneSidebar.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { SidebarGroup } from './selectors'

type SceneSidebarProps = {
  groups: SidebarGroup[]
  totalCount: number
}

const ITEM_BASE =
  'flex items-baseline justify-between gap-3 py-1.5 text-[14px] leading-[1.6] transition-colors'

/**
 * 案例页的场景导航。用线加文字而不是卡片：侧栏是导航不是内容，
 * 给每一项加边框和底色会让它比右侧真正的模板还重。
 *
 * 移动端不折叠成横向选择条，仍是同一份纵向列表放在内容上方——
 * 当前可点项只有四个，横向滚动条是给不存在的规模做设计。
 */
export function SceneSidebar({ groups, totalCount }: SceneSidebarProps) {
  const pathname = usePathname()

  const itemClass = (href: string) =>
    `${ITEM_BASE} ${pathname === href ? 'text-graphite' : 'text-graphite-soft hover:text-graphite'}`

  return (
    <nav
      aria-label="案例场景"
      className="lg:sticky lg:top-28 lg:w-52 lg:shrink-0 lg:self-start"
    >
      <Link href="/cases" className={itemClass('/cases')}>
        <span>全部模板</span>
        <span className="text-[12.5px] text-graphite-dim">{totalCount}</span>
      </Link>

      {groups.map((group) => (
        <div key={group.id} className="mt-6 border-t border-rule pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-graphite-dim">
            {group.name}
          </p>
          <div className="mt-2">
            {group.scenes.map((scene) => (
              <Link
                key={scene.id}
                href={`/cases/${scene.id}`}
                className={itemClass(`/cases/${scene.id}`)}
              >
                <span>{scene.name}</span>
                <span className="text-[12.5px] text-graphite-dim">{scene.count}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-6 border-t border-rule pt-4">
        <Link href="/cases/other" className={itemClass('/cases/other')}>
          <span>其他场景</span>
        </Link>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: 确认复用已有的 `TemplateRow`，本步不写新组件**

陈列直接用 `features/site-templates/workbench/TemplateRow.tsx`，它已经是浅色整行式布局，
签名 `TemplateRow({ template }: { template: SiteTemplate })`，内部用 taxonomy 渲染
「一级分类 / 场景」眉标并链到 `/templates/<id>/preview`。打开读一遍确认签名即可进入下一步。

**不要复制一份、不要改它、不要给它加 props。** 案例页与工作台陈列的是同一批对象，
再造一个近似的浅色卡片属于重复实现；整行式布局也恰好避开「只有两套模板时网格留空列」的问题。

- [ ] **Step 4: 建 `app/(site)/cases/layout.tsx`**

```tsx
import type { ReactNode } from 'react'

import { LightShell } from '@/components/layout/LightShell'
import { SceneSidebar } from '@/features/site-templates/gallery/SceneSidebar'
import { getSidebarNav } from '@/features/site-templates/gallery/selectors'
import { SITE_TEMPLATES } from '@/features/site-templates/registry'

// 左侧栏放在 layout 而不是各页面里：切换场景时侧栏不重新挂载，滚动位置与高亮态都稳定。
export default function CasesLayout({ children }: { children: ReactNode }) {
  return (
    <LightShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-16 sm:px-6 lg:flex-row lg:gap-16 lg:pt-24">
        <SceneSidebar groups={getSidebarNav()} totalCount={SITE_TEMPLATES.length} />
        {/* min-w-0：不加的话内部网格的最小内容宽度会把 flex 项撑破，右侧溢出容器 */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </LightShell>
  )
}
```

- [ ] **Step 5: 重写 `app/(site)/cases/page.tsx`**

```tsx
import type { Metadata } from 'next'

import { SectionHeading } from '@/components/ui'
import { TemplateRow } from '@/features/site-templates/workbench/TemplateRow'
import { SITE_TEMPLATES } from '@/features/site-templates/registry'

// 与首页同理：不定义 openGraph，避免整体替换掉根 layout 的 images 等字段。
export const metadata: Metadata = {
  title: '案例',
  description: '微域生光按业务场景整理的项目样板：官网、小程序、管理后台，按你要做的东西挑。',
}

export default function CasesPage() {
  return (
    <>
      <SectionHeading
        as="h1"
        eyebrow="Cases"
        title="按你要做的东西挑"
        description="左侧按业务场景分类。每个场景下是我们做过的同类项目样板，点开可以直接翻完整页面。"
        align="left"
      />

      {/* 整行式陈列，不用网格：TemplateRow 自带上边细线做行分隔 */}
      <div className="mt-12">
        {SITE_TEMPLATES.map((template) => (
          <TemplateRow key={template.id} template={template} />
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 6: 删除旧占位组件**

```bash
cd website && rm src/components/pages/cases/CasesContent.tsx && rmdir src/components/pages/cases
```

若 `rmdir` 报目录非空，说明该目录还有别的文件，保留目录即可，不要删其他文件。
然后全局确认没有残留引用：

```bash
cd website && grep -rn "CasesContent" src || echo "无残留引用"
```

- [ ] **Step 7: 改 `middleware.ts` 放行 `/cases`**

把这一行：

```ts
const TEMPLATE_PATH_PREFIXES: string[] = isTemplatesModuleEnabled() ? ['/templates'] : []
```

改成：

```ts
// /cases 与 /templates 共用同一个开关，不新增第二个门禁：
// 前者是模板模块对外的陈列面，后者是内部调试用的工作台，两者要么一起可达要么一起消失。
const TEMPLATE_PATH_PREFIXES: string[] = isTemplatesModuleEnabled()
  ? ['/templates', '/cases']
  : []
```

- [ ] **Step 8: 重启 dev server 并验证**

改 middleware 白名单必须重启 dev（白名单在模块顶层求值，热更新不会重算）。重启后：

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/cases
```

预期：`200`。

- [ ] **Step 9: 浏览器验证侧栏渲染**

打开 `http://localhost:3100/cases`，逐项确认：

- 左侧依次是：`全部模板 2` → `网站 / 企业官网 1` → `管理后台 / 监控运维 1` → `其他场景`
- **不出现**「小程序」这个一级分类，**不出现**任何计数为 0 的条目
- 右侧两张浅色卡片，整页无深色残留
- 缩到 375px 宽时侧栏移到内容上方、页面不横向溢出
- 浏览器控制台与 dev server 终端均无报错

- [ ] **Step 10: 验证门禁关闭时的行为**

在 `website/.env.local` 写入 `TEMPLATES_MODULE_ENABLED=false`，重启 dev server：

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/cases
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/templates
```

预期：两条都是 `307`。验证后**删掉这行环境变量并重启**，恢复可访问。

- [ ] **Step 11: 类型与 lint 检查，然后提交**

```bash
cd website && pnpm exec tsc --noEmit && pnpm run lint
git add src/middleware.ts src/features/site-templates/gallery "src/app/(site)/cases" src/components/pages
git commit -m "feat(website): 案例页骨架与场景侧栏，/cases 纳入模板模块门禁

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 场景页与自定义区

单个场景成页，场景介绍改由可自由发挥的组件插槽承担。

**Files:**
- Create: `website/src/features/site-templates/scenes/_shared/SceneIntro.tsx`
- Create: `website/src/features/site-templates/scenes/corporate-site/Section.tsx`
- Create: `website/src/features/site-templates/scenes/monitoring/Section.tsx`
- Create: `website/src/app/(site)/cases/[scene]/page.tsx`
- Modify: `website/src/features/site-templates/taxonomy.ts`（给两个场景补 `load`）
- Modify: `website/src/features/site-templates/registry.ts`（校验有模板的场景必须配 `load`）

**Interfaces:**
- Consumes: `SceneSectionProps`、`getSceneById`、`getGroupOfScene`（Task 1）；`getTemplatesByScene`（Task 3）；`TemplateRow`（已有组件，勿改）
- Produces: `function SceneIntro(props: { description: string; approach: string }): JSX.Element`

- [ ] **Step 1: 建 `scenes/_shared/SceneIntro.tsx`**

```tsx
type SceneIntroProps = {
  /** 这个场景解决的是什么问题，讲客户的处境而不是我们的能力 */
  description: string
  /** 「这类项目我们通常怎么做」，讲具体做法、周期、分工 */
  approach: string
}

/**
 * 场景自定义区的默认版式：只想写两段话的场景直接套它。
 *
 * 它是一个可选的便利组件，不是场景内容的统一渲染器——场景要放对比表、
 * 报价区间、流程图或客户问答时，直接在自己的 Section.tsx 里写，不必迁就这个版式。
 */
export const SceneIntro = ({ description, approach }: SceneIntroProps) => (
  <div className="mt-8 border-l-2 border-blue/40 pl-5">
    <p className="max-w-[34em] text-[15px] leading-[1.9] text-graphite-soft">{description}</p>
    <p className="mt-3 max-w-[34em] text-[14px] leading-[1.85] text-graphite-dim">
      <span className="text-graphite">通常怎么做：</span>
      {approach}
    </p>
  </div>
)
```

- [ ] **Step 2: 建两个场景的 Section**

`scenes/corporate-site/Section.tsx`：

```tsx
import { SceneIntro } from '../_shared/SceneIntro'

export default function CorporateSiteSection() {
  return (
    <SceneIntro
      description="企业官网要解决的是「别人搜到你之后，凭什么信你」。它不需要花哨，重点是把业务范围、过往履历和联系方式讲清楚，让对方在几分钟内判断要不要跟你聊。"
      approach="先定五到八个页面的信息结构，再定视觉调性，最后接入表单与访问统计。文字素材由你提供，排版与改写我们做，通常两到三周上线。"
    />
  )
}
```

`scenes/monitoring/Section.tsx`：

```tsx
import { SceneIntro } from '../_shared/SceneIntro'

export default function MonitoringSection() {
  return (
    <SceneIntro
      description="监控运维平台面向的是「服务半夜挂了没人知道」。它把分散在各处的服务存活、日志异常、资源水位和告警规则收进一个界面，出问题时能一眼看出是哪个环节。"
      approach="先梳理要纳管的服务清单与各自的健康判据，再定告警规则和通知渠道，最后接数据源。图表用 ECharts，数据接口按你现有的采集方式适配。"
    />
  )
}
```

- [ ] **Step 3: 给 `taxonomy.ts` 的两个场景补 `load`**

`corporate-site` 那一行改成：

```ts
      {
        id: 'corporate-site',
        name: '企业官网',
        load: () => import('./scenes/corporate-site/Section'),
      },
```

`monitoring` 那一行改成：

```ts
      {
        id: 'monitoring',
        name: '监控运维',
        load: () => import('./scenes/monitoring/Section'),
      },
```

其余 13 个场景保持不带 `load`。

- [ ] **Step 4: 给 `registry.ts` 加「有模板必须配自定义区」校验**

把 Task 2 加的那段 sceneId 校验替换为：

```ts
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
```

- [ ] **Step 5: 建 `app/(site)/cases/[scene]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SectionHeading } from '@/components/ui'
import { TemplateRow } from '@/features/site-templates/workbench/TemplateRow'
import { getTemplatesByScene } from '@/features/site-templates/gallery/selectors'
import { getGroupOfScene, getSceneById } from '@/features/site-templates/taxonomy'

// Next.js 15：动态段参数是 Promise，必须 await
type ScenePageProps = { params: Promise<{ scene: string }> }

export async function generateMetadata({ params }: ScenePageProps): Promise<Metadata> {
  const { scene: sceneId } = await params
  const scene = getSceneById(sceneId)
  if (!scene) return {}

  const group = getGroupOfScene(sceneId)
  return {
    title: scene.name,
    description: `微域生光的${group ? `${group.name} · ` : ''}${scene.name}项目样板。`,
  }
}

export default async function ScenePage({ params }: ScenePageProps) {
  const { scene: sceneId } = await params
  const scene = getSceneById(sceneId)
  if (!scene) notFound()

  const templates = getTemplatesByScene(sceneId)
  // 没有模板的场景不单独成页，只在「其他场景」里露出名字——
  // 一个只有介绍、下面空着的场景页比 404 更让人困惑
  if (templates.length === 0) notFound()

  // 有模板的场景必配 load，这条由 registry.ts 在加载时保证。
  // 这里仍显式抛错而不是用非空断言：真出现时要的是能定位的报错，不是 undefined is not a function
  if (!scene.load) {
    throw new Error(`[site-templates] 场景 ${sceneId} 有模板却没有自定义区 load`)
  }
  const { default: Section } = await scene.load()

  const group = getGroupOfScene(sceneId)

  return (
    <>
      <SectionHeading
        as="h1"
        eyebrow={group ? `Cases · ${group.name}` : 'Cases'}
        title={scene.name}
        align="left"
      />

      <Section scene={scene} templateCount={templates.length} />

      <div className="mt-12">
        {templates.map((template) => (
          <TemplateRow key={template.id} template={template} />
        ))}
      </div>
    </>
  )
}
```

- [ ] **Step 6: 类型与 lint 检查**

```bash
cd website && pnpm exec tsc --noEmit && pnpm run lint
```

- [ ] **Step 7: 路由行为验证**

```bash
for p in corporate-site monitoring landing-page mp-store nonexistent; do
  printf "%-16s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/cases/$p)"
done
```

预期：

```
corporate-site   200
monitoring       200
landing-page     404
mp-store         404
nonexistent      404
```

- [ ] **Step 8: 浏览器验证**

打开 `http://localhost:3100/cases/corporate-site`：标题是「企业官网」、eyebrow 是 `Cases · 网站`、
下面是蓝色竖线的两段介绍、再下面是 Meridian 一张卡；左侧栏「企业官网」为高亮态。
再打开 `/cases/monitoring` 确认同样结构、卡片是 Aegis。控制台与终端无报错。

- [ ] **Step 9: 负向校验**

临时删掉 `taxonomy.ts` 里 `monitoring` 的 `load` 行，刷新 `/cases`，dev server 终端应打出
`[site-templates] 模板 aegis 所属场景「monitoring」没有配置自定义区…`。**验证后还原。**

- [ ] **Step 10: 提交**

```bash
cd website && git add src/features/site-templates "src/app/(site)/cases"
git commit -m "feat(website): 案例场景页与可自定义的场景内容区

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: 其他场景页与文档收尾

把 13 个暂无样板的场景变成一个对话入口，并把案例页写进模块文档。

**Files:**
- Create: `website/src/features/site-templates/gallery/OtherScenesContact.tsx`
- Create: `website/src/app/(site)/cases/other/page.tsx`
- Modify: `website/src/features/site-templates/README.md`

**Interfaces:**
- Consumes: `getEmptyScenes`（Task 3）；`useContact`（`@/components/layout/contact-context`）；`Button`（`@/components/ui`）
- Produces: `function OtherScenesContact(): JSX.Element`

- [ ] **Step 1: 建 `gallery/OtherScenesContact.tsx`**

```tsx
'use client'

import { useContact } from '@/components/layout/contact-context'
import { Button } from '@/components/ui'

/**
 * 单独拆成客户端组件，只为拿 useContact 这一个 hook。
 * 页面本身保持服务端组件，不为一个按钮把整页降级成客户端渲染。
 */
export function OtherScenesContact() {
  const { openContact } = useContact()

  return (
    <div className="mt-10">
      <Button onClick={openContact}>说说你的业务</Button>
    </div>
  )
}
```

- [ ] **Step 2: 建 `app/(site)/cases/other/page.tsx`**

```tsx
import type { Metadata } from 'next'

import { SectionHeading } from '@/components/ui'
import { OtherScenesContact } from '@/features/site-templates/gallery/OtherScenesContact'
import { getEmptyScenes } from '@/features/site-templates/gallery/selectors'

export const metadata: Metadata = {
  title: '其他场景',
  description: '电商、知识付费、进销存、预约到店等场景的项目样板正在陆续补齐，可先直接沟通。',
}

export default function OtherScenesPage() {
  const scenes = getEmptyScenes()

  return (
    <>
      <SectionHeading
        as="h1"
        eyebrow="Cases"
        title="其他场景"
        description="下面这些场景我们都做过，只是可以公开展示的样板还在补。与其等我们补齐，不如直接说说你的业务——我们会拿最接近的项目跟你讲具体做法。"
        align="left"
      />

      {/* 用一列细线分隔的清单而不是标签墙：这里是「我们还能做什么」的说明，
          不是可点击的筛选项，做成一堆可点样式的色块会误导访客去点 */}
      <ul className="mt-10 max-w-md">
        {scenes.map((scene) => (
          <li
            key={scene.id}
            className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5"
          >
            <span className="text-[15px] text-graphite-soft">{scene.name}</span>
            <span className="text-[12.5px] text-graphite-dim">{scene.groupName}</span>
          </li>
        ))}
      </ul>

      <OtherScenesContact />
    </>
  )
}
```

- [ ] **Step 3: 类型与 lint 检查**

```bash
cd website && pnpm exec tsc --noEmit && pnpm run lint
```

- [ ] **Step 4: 浏览器验证**

打开 `http://localhost:3100/cases/other`，确认：

- 清单共 **13** 行（15 个场景减去已有模板的 `corporate-site` 与 `monitoring`）
- 左侧「其他场景」为高亮态
- 点「说说你的业务」弹出咨询弹窗，能正常关闭；控制台无 `useContact 必须在 LightShell 内部使用` 报错

- [ ] **Step 5: 给 README 补「案例页」一节**

在 `README.md` 的「模板里画图表」与「约束」之间插入：

```markdown
## 案例页（/cases）

`/cases` 是模板模块对外的陈列面，与 `/templates` 工作台共用同一个
`isTemplatesModuleEnabled()` 开关，要么一起可达要么一起 307 回首页。

- 场景清单的唯一来源是 `taxonomy.ts`，数组顺序即左侧导航顺序。清单是**完整**的，
  包含还没有模板的场景——它同时是接下来要补哪些模板的路线图
- `gallery/selectors.ts` 负责推导视图数据：侧栏只渲染有模板的分支，空场景统一进
  `/cases/other`。没有模板的场景不单独成页，直接 404
- 场景的介绍区是组件插槽而不是数据字段：`scenes/<scene-id>/Section.tsx` 默认导出一个
  接收 `SceneSectionProps` 的组件，想放什么放什么。只写两段话的场景套
  `scenes/_shared/SceneIntro.tsx` 即可
- `other` 是保留 scene id，被 `/cases/other` 这个静态路由段占用，taxonomy 校验会拒绝
- 侧栏是客户端组件（要 `usePathname` 做高亮），因此 `selectors.ts` 返回的都是可序列化数据，
  不要把带 `load` 函数的 `TemplateScene` 整个传过去
```

在「已知遗留」小节追加三条：

```markdown
- **预览壳不一致**：案例页的浅色卡片点进去仍是深色工作台预览页（`/templates/<id>/preview`）。
  现在为它单独做一套浅色预览壳等于给还没定的上架形态提前买单，推迟到上架前处理
- **案例页无导航入口**：`/cases` 只能直接输 URL 访问。上架时需要按门禁条件渲染导航项——
  无条件加进 `LightNav` 的 `NAV_ITEMS` 会在生产环境留下死链
- **`sitemap.ts` 不含 `/cases`**：与模板路径同属上架待办
```

- [ ] **Step 6: 全链路回归**

```bash
cd website
for p in /cases /cases/corporate-site /cases/monitoring /cases/other /cases/landing-page /templates; do
  printf "%-26s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100$p)"
done
```

预期：`/cases/landing-page` 是 `404`，其余全部 `200`。

- [ ] **Step 7: 截图核对**

用 chrome-devtools 分别在 1440px 与 375px 宽度下截 `/cases` 与 `/cases/corporate-site`，
自己看一遍再交付。核对点：整页无深色残留、无横向滚动条、侧栏与正文的间距和官网其他浅色页一致、
移动端侧栏在正文上方且不挤压正文。

- [ ] **Step 8: 提交**

```bash
cd website && git add src/features/site-templates "src/app/(site)/cases"
git commit -m "feat(website): 其他场景页与模板模块文档补记

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## 自查记录

**与 spec 的两处偏离**（spec 已同步更新）：

1. spec 里 `TemplateScene.load` 是必填。改成可选：15 个场景全部建 Section 文件才能让 `tsc` 通过，
   而其中 13 个永远不会被渲染，纯属浪费。改由 `registry.ts` 校验「有模板的场景必须配 load」，
   漏配依然当场炸，安全性不降。
2. spec 里移动端侧栏是「顶部横向场景选择条」。改成纵向列表：当前可点项只有 4 个，
   横向滚动条是给不存在的规模做设计。

**spec 覆盖检查**：门禁（Task 3 Step 7/10）、分类体系 15 项（Task 1）、空分类与其他场景
（Task 3 selectors + Task 5）、路由四个文件（Task 3/4/5）、`other` 保留 id（Task 1）、
数据模型 `sceneId` 与删 `industry`（Task 2）、组件结构（Task 3/4/5）、
验收标准 7 条（Task 1 Step 3-4、Task 2 Step 5/7、Task 3 Step 9/10、Task 4 Step 7、Task 5 Step 4/7）、
已知遗留写入 README（Task 5 Step 5）。无遗漏项。
