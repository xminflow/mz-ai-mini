# 官网整站模板模块 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 website 仓库内建一个仅开发环境可见的整站模板模块，含开关门禁、模板注册表、工作台列表、iframe 预览与 1 套样板模板，将来改一个环境变量即可整体上架。

**Architecture:** 复用 middleware 既有的路径白名单机制做生产隐藏（不新造隐藏机制、不改构建配置）；模板以 feature 目录 + 注册表组织，一个可选 catch-all 路由承载所有模板的所有页面，新增模板只需建目录并在注册表加一行；每套模板自带作用域化的设计令牌，不复用官网组件与令牌。

**Tech Stack:** Next.js 15.3 App Router、React 19、Tailwind CSS v4、TypeScript。**不新增任何依赖。**

**Spec:** `docs/superpowers/specs/2026-08-14-site-templates-module-design.md`

## Global Constraints

以下约束适用于每一个任务，不再逐任务重复：

- **不新增任何依赖**，不修改 `package.json`。
- **不修改这些文件**：`src/app/layout.tsx`、`src/app/globals.css`、`next.config.ts`、`src/app/sitemap.ts`。
- 唯一允许修改的既有文件是 `src/middleware.ts`（仅 Task 1）。
- **禁止使用 `any`**。`tsconfig.json` 开了 `noUnusedLocals` / `noUnusedParameters`，未使用的变量与参数会直接报错。
- 路径别名为 `@/*` → `./src/*`。
- 复杂业务逻辑、架构边界、非显然设计**必须加中文注释**；简单赋值与直观流程不加。
- **不执行 `next build`**：已知本项目 `next build` 会挂掉 dev server，且 `output: 'standalone'` 在 Windows 上必然 EPERM 失败，与本次改动无关。类型检查改用 `npx tsc --noEmit`。
- 模板**不复用**官网的 `components/ui`、`components/layout` 与 `globals.css` 里的设计令牌（`--color-paper` / `--color-graphite` / 三原色）。共享的只有模板运行时（开关、类型、注册表、工作台、预览、路由）。
- **`preview` 是保留 slug**，模板不得定义同名页面（与静态路由段冲突，Next.js 静态段优先级高于 catch-all）。
- Next.js 15 起 `params` 与 `searchParams` 都是 Promise，**必须 await**。
- 工作区存在与本任务无关的未提交改动（`Advantages.tsx`、`HomeContent.tsx` 等）。**每次提交只 `git add` 本任务明确列出的文件**，禁止 `git add -A` / `git add .`。
- 当前分支为 `dev`，直接在该分支提交，不新建分支。
- **每个任务提交时 `npx tsc --noEmit` 必须是干净的**，不允许留下"下个任务再补"的类型错误。

## 关于测试方式的说明

website 未引入任何测试框架（`package.json` 无测试依赖），CLAUDE.md 规定前端不要求组件测试、改动须通过页面运行验证。因此本计划的红→绿循环由这三类**真实可执行的断言**构成，不引入测试框架：

- `curl -s -o /dev/null -w "%{http_code}"` 断言 HTTP 状态码与重定向 —— 门禁行为的验证靠它，完全确定性。
- `npx tsc --noEmit` 断言类型正确。
- chrome-devtools MCP 断言页面真实渲染与交互。

每个任务都先执行"预期失败"的断言并确认失败，再实现，再确认通过。

## 前置：启动开发服务器

后续所有任务都假定 dev server 已在 3000 端口运行。

```bash
cd /d/code/weelume-base/website && pnpm dev
```

在后台运行。若 3000 被占用，Next 会换端口，需把后续命令里的端口一并替换。

---

### Task 1: 门禁开关与 middleware 接入

**Files:**
- Create: `website/src/features/site-templates/config.ts`
- Modify: `website/src/middleware.ts:11`

**Interfaces:**
- Consumes: 无
- Produces: `isTemplatesModuleEnabled(): boolean` —— Task 2 的 `(templates)/layout.tsx` 会再次调用它做第二道门禁。

- [ ] **Step 1: 断言当前行为（预期失败）**

确认 `/templates` 现在是被拦截的（这是实现前的基线）：

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/templates
```

Expected: `307 http://localhost:3000/` —— 说明白名单尚未放行 `/templates`。

- [ ] **Step 2: 创建开关判定函数**

Create `website/src/features/site-templates/config.ts`:

```ts
/**
 * 模板模块的可见性开关。判定只此一处：middleware 与页面都从这里取，禁止各判各的。
 *
 * 默认行为：开发环境开、生产环境关。
 * 显式覆盖：TEMPLATES_MODULE_ENABLED=true|false 两个方向都能强制指定。
 *   - 将来整体上架：生产环境设 true 即可，代码零改动。
 *   - 本地复现生产拦截：website/.env.local 里设 false 后重启 dev。
 *
 * 之所以把默认值写在代码里而不是靠 .env.development：.gitignore 忽略了 /website/.env.*，
 * 环境文件无法入库，纯环境变量方案会让任何人克隆仓库后模板模块默认不可见。
 *
 * 注意：本函数会在 Edge runtime 的 middleware 中执行，因此只能读取
 * process.env.X 这种静态字面量形式（Next.js 构建时内联），不能动态拼 key。
 */
export function isTemplatesModuleEnabled(): boolean {
  const raw = process.env.TEMPLATES_MODULE_ENABLED
  if (raw === 'true') return true
  if (raw === 'false') return false
  return process.env.NODE_ENV !== 'production'
}
```

- [ ] **Step 3: 接入 middleware 白名单**

Modify `website/src/middleware.ts`。在文件顶部的 import 区加入：

```ts
import { isTemplatesModuleEnabled } from '@/features/site-templates/config'
```

把第 11 行的常量定义整体替换为：

```ts
// 模板模块只在开关打开时放行（默认仅开发环境）。关闭时走下面统一的 307 回首页逻辑——
// 路由与入口一起消失，不需要额外的隐藏机制。
//
// 这里在模块顶层求值，即每个 middleware 冷启动只算一次。改了环境变量必须重启 dev 才生效。
const PUBLIC_PATH_PREFIXES: string[] = isTemplatesModuleEnabled() ? ['/', '/templates'] : ['/']
```

原第 3-10 行的注释块保持不动。

- [ ] **Step 4: 断言放行生效**

dev server 会自动重编译 middleware，等几秒后：

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/templates
```

Expected: `404` —— 不再是 307，说明白名单放行成功；404 是因为路由页面还没建（Task 3 建）。

- [ ] **Step 5: 断言关闭开关后重新被拦截**

```bash
cd /d/code/weelume-base/website && echo "TEMPLATES_MODULE_ENABLED=false" >> .env.local
```

重启 dev server（Ctrl+C 后重新 `pnpm dev`），然后：

```bash
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://localhost:3000/templates
```

Expected: `307 http://localhost:3000/` —— 这就等价复现了生产环境的拦截行为。

- [ ] **Step 6: 恢复开关并确认**

从 `website/.env.local` 中删掉刚加的 `TEMPLATES_MODULE_ENABLED=false` 这一行，重启 dev server：

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/templates
```

Expected: `404`

- [ ] **Step 7: 类型检查**

```bash
cd /d/code/weelume-base/website && npx tsc --noEmit
```

Expected: 无输出（通过）。

- [ ] **Step 8: 提交**

```bash
cd /d/code/weelume-base && git add website/src/features/site-templates/config.ts website/src/middleware.ts && git commit -m "feat(website): 模板模块门禁开关与 middleware 白名单接入"
```

---

### Task 2: 模板模型与 Meridian 样板模板

本任务一次交付完整可访问的模板站点：类型、注册表、样板模板的元数据/令牌/页面、路由组容器、模板站点路由。之所以不把类型和注册表单独拆成一个任务：注册表引用模板页面组件，页面不存在时 `tsc` 必然报错，拆开会留下类型不干净的中间提交。

**Files:**
- Create: `website/src/features/site-templates/types.ts`
- Create: `website/src/features/site-templates/registry.ts`
- Create: `website/src/features/site-templates/catalog/meridian/meta.ts`
- Create: `website/src/features/site-templates/catalog/meridian/theme.css`
- Create: `website/src/features/site-templates/catalog/meridian/pages/HomePage.tsx`
- Create: `website/src/features/site-templates/catalog/meridian/pages/TeamPage.tsx`
- Create: `website/src/app/(templates)/layout.tsx`
- Create: `website/src/app/(templates)/templates/[id]/[[...slug]]/page.tsx`

**Interfaces:**
- Consumes: `isTemplatesModuleEnabled()` from `@/features/site-templates/config`
- Produces:
  - `interface SiteTemplatePageProps { basePath: string }`
  - `interface SiteTemplatePage { slug: string; title: string; load: () => Promise<{ default: ComponentType<SiteTemplatePageProps> }> }`
  - `interface SiteTemplate { id: string; name: string; industry: string; tags: string[]; summary: string; accentColor: string; cover: string; pages: SiteTemplatePage[] }`
  - `SITE_TEMPLATES: SiteTemplate[]`
  - `getTemplateById(id: string): SiteTemplate | undefined`
  - `getTemplatePage(template: SiteTemplate, slug: string): SiteTemplatePage | undefined`
  - `meridianTemplate: SiteTemplate`，`id` 为 `meridian`，`cover` 为 `/templates/meridian/cover.svg`（该图由 Task 3 创建，本任务不依赖它渲染），`pages` 为 slug `''` 与 `team`
  - 可访问路由 `/templates/<id>` 与 `/templates/<id>/<slug>`

- [ ] **Step 1: 断言模板路由不存在（预期失败）**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/templates/meridian
```

Expected: `404`

- [ ] **Step 2: 定义类型**

Create `website/src/features/site-templates/types.ts`:

```ts
import type { ComponentType } from 'react'

export interface SiteTemplatePageProps {
  /**
   * 模板站点在当前挂载点下的根路径，如 `/templates/meridian`。
   *
   * 模板内部所有站内链接都必须基于它拼接，禁止硬编码 `/templates` 前缀——
   * 将来模板换挂载点（独立域名、上架后的预览页）时才不用逐套改。
   */
  basePath: string
}

/** 模板内的单个页面。slug 为空串代表模板首页。 */
export interface SiteTemplatePage {
  slug: string
  title: string
  /**
   * 用 import() 缩略函数而非直接引用组件：Next.js 能静态分析这种写法，
   * 为每套模板独立分包，模板数量增长时不会互相拖累首屏体积。
   */
  load: () => Promise<{ default: ComponentType<SiteTemplatePageProps> }>
}

/**
 * 模板元数据。字段按「将来上架的模板列表页需要什么」来定，
 * 而不是按「现在开发调试需要什么」——上架时不该再改一遍数据结构。
 */
export interface SiteTemplate {
  id: string
  name: string
  /** 适用行业，列表页展示与将来的筛选维度 */
  industry: string
  /** 风格标签，将来的筛选维度 */
  tags: string[]
  summary: string
  /** 主色，列表页用一个色点标识 */
  accentColor: string
  /** 封面图路径，位于 public/templates/<id>/ 下 */
  cover: string
  pages: SiteTemplatePage[]
}
```

- [ ] **Step 3: 编写模板设计令牌**

Create `website/src/features/site-templates/catalog/meridian/theme.css`:

```css
/* Meridian 模板的设计令牌，作用域锁在 [data-template='meridian'] 子树内。
   官网根 layout 已经在 <body> 上写死了浅色底与深色字，模板必须在自己的容器里覆盖；
   同时令牌不能提到 :root，否则会污染全站并与其它模板串色。
   令牌一律以 --tpl- 开头，与官网的 --color-* 令牌命名完全不重叠。 */
[data-template='meridian'] {
  --tpl-bg: #0d1420;
  --tpl-surface: #131c2b;
  --tpl-fg: #e8e6e1;
  --tpl-fg-dim: #9aa3b0;
  --tpl-accent: #c8a45c;
  --tpl-rule: rgb(232 230 225 / 0.12);
  --tpl-font-display: "Noto Serif SC", "Source Han Serif SC", "STSong", "Songti SC", Georgia, serif;
  --tpl-font-body: "Inter", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;

  background: var(--tpl-bg);
  color: var(--tpl-fg);
  font-family: var(--tpl-font-body);
}
```

- [ ] **Step 4: 编写模板首页**

Create `website/src/features/site-templates/catalog/meridian/pages/HomePage.tsx`:

```tsx
import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import '../theme.css'

const PRACTICE_AREAS = [
  { title: '公司与并购', desc: '股权架构、投融资交易、并购重组的全流程法律支持。' },
  { title: '争议解决', desc: '商事诉讼与仲裁，覆盖合同、股东、知识产权纠纷。' },
  { title: '合规与风控', desc: '数据合规、劳动用工、反舞弊制度的建立与审查。' },
]

export default function HomePage({ basePath }: SiteTemplatePageProps) {
  return (
    <div>
      <header className="border-b border-[var(--tpl-rule)]">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <span className="text-lg tracking-wide" style={{ fontFamily: 'var(--tpl-font-display)' }}>
            Meridian
          </span>
          <div className="flex gap-8 text-sm text-[var(--tpl-fg-dim)]">
            <Link href={basePath} className="text-[var(--tpl-fg)]">
              首页
            </Link>
            <Link href={`${basePath}/team`} className="transition hover:text-[var(--tpl-fg)]">
              团队
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="py-24">
          <p className="text-xs tracking-[0.3em] text-[var(--tpl-accent)]">EST. 2009</p>
          <h1
            className="mt-6 text-4xl leading-[1.35] sm:text-5xl sm:leading-[1.3]"
            style={{ fontFamily: 'var(--tpl-font-display)' }}
          >
            以审慎与克制
            <br />
            处理每一件重要的事
          </h1>
          <p className="mt-8 max-w-xl text-sm leading-relaxed text-[var(--tpl-fg-dim)] sm:text-base">
            Meridian 是一家专注商事领域的律师事务所。十六年来我们只做一件事：
            在关键节点上，给出经得起推敲的判断。
          </p>
          <Link
            href={`${basePath}/team`}
            className="mt-10 inline-block bg-[var(--tpl-accent)] px-7 py-3 text-sm text-[#0d1420] transition hover:opacity-90"
          >
            认识我们的团队
          </Link>
        </section>

        <section className="border-t border-[var(--tpl-rule)] py-20">
          <h2 className="text-xs tracking-[0.3em] text-[var(--tpl-fg-dim)]">专业领域</h2>
          <div className="mt-12 grid gap-12 sm:grid-cols-3">
            {PRACTICE_AREAS.map((area) => (
              <div key={area.title}>
                <span className="block h-px w-8 bg-[var(--tpl-accent)]" />
                <h3 className="mt-5 text-xl" style={{ fontFamily: 'var(--tpl-font-display)' }}>
                  {area.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--tpl-fg-dim)]">{area.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--tpl-rule)]">
        <div className="mx-auto max-w-5xl px-6 py-10 text-xs text-[var(--tpl-fg-dim)]">
          Meridian 律师事务所 · 上海市静安区南京西路 1266 号
        </div>
      </footer>
    </div>
  )
}
```

- [ ] **Step 5: 编写模板内页**

Create `website/src/features/site-templates/catalog/meridian/pages/TeamPage.tsx`:

```tsx
import Link from 'next/link'
import type { SiteTemplatePageProps } from '../../../types'
import '../theme.css'

const MEMBERS = [
  { name: '沈砚舟', role: '创始合伙人', focus: '公司与并购 · 投融资' },
  { name: '陆确', role: '权益合伙人', focus: '商事诉讼 · 仲裁' },
  { name: '周宛清', role: '资深律师', focus: '数据合规 · 劳动用工' },
  { name: '许知远', role: '资深律师', focus: '知识产权 · 反不正当竞争' },
]

export default function TeamPage({ basePath }: SiteTemplatePageProps) {
  return (
    <div>
      <header className="border-b border-[var(--tpl-rule)]">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <Link
            href={basePath}
            className="text-lg tracking-wide"
            style={{ fontFamily: 'var(--tpl-font-display)' }}
          >
            Meridian
          </Link>
          <div className="flex gap-8 text-sm text-[var(--tpl-fg-dim)]">
            <Link href={basePath} className="transition hover:text-[var(--tpl-fg)]">
              首页
            </Link>
            <span className="text-[var(--tpl-fg)]">团队</span>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-3xl sm:text-4xl" style={{ fontFamily: 'var(--tpl-font-display)' }}>
          团队
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--tpl-fg-dim)]">
          四位合伙人与律师，各自守着一个方向，不做超出能力边界的承诺。
        </p>

        <ul className="mt-16 divide-y divide-[var(--tpl-rule)] border-y border-[var(--tpl-rule)]">
          {MEMBERS.map((member) => (
            <li key={member.name} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-6">
              <span className="text-xl" style={{ fontFamily: 'var(--tpl-font-display)' }}>
                {member.name}
              </span>
              <span className="text-xs tracking-widest text-[var(--tpl-accent)]">{member.role}</span>
              <span className="ml-auto text-sm text-[var(--tpl-fg-dim)]">{member.focus}</span>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
```

- [ ] **Step 6: 编写样板模板元数据**

Create `website/src/features/site-templates/catalog/meridian/meta.ts`:

```ts
import type { SiteTemplate } from '../../types'

export const meridianTemplate: SiteTemplate = {
  id: 'meridian',
  name: 'Meridian 律师事务所',
  industry: '专业服务',
  tags: ['深色', '衬线', '克制'],
  summary: '深色底配衬线标题的律所官网，强调资历与专业领域，适合律所、会计事务所与咨询机构。',
  accentColor: '#c8a45c',
  cover: '/templates/meridian/cover.svg',
  pages: [
    { slug: '', title: '首页', load: () => import('./pages/HomePage') },
    { slug: 'team', title: '团队', load: () => import('./pages/TeamPage') },
  ],
}
```

- [ ] **Step 7: 编写注册表与结构校验**

Create `website/src/features/site-templates/registry.ts`:

```ts
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
```

- [ ] **Step 8: 创建模板路由组的容器布局**

Create `website/src/app/(templates)/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { isTemplatesModuleEnabled } from '@/features/site-templates/config'

/**
 * 第二道门禁。middleware 已经在开关关闭时把 /templates 挡回首页，这里再挡一次：
 * middleware 的 matcher 将来若被改动，模板模块不应该跟着悄悄暴露出去。
 *
 * 同时这一层负责剥掉根 layout 对 <body> 做的官网视觉断言
 * （bg-paper / text-graphite）——根 layout 是全站唯一的，模板无法绕开，只能在这里覆盖。
 * 这里刻意不加任何页面骨架（导航、边距、最大宽度）：模板站点的真实路由也在这个 layout 之下，
 * 任何骨架都会渗进模板页面里。
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  if (!isTemplatesModuleEnabled()) {
    notFound()
  }

  return <div className="min-h-screen bg-neutral-950 text-neutral-100">{children}</div>
}
```

- [ ] **Step 9: 编写模板站点路由**

Create `website/src/app/(templates)/templates/[id]/[[...slug]]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTemplateById, getTemplatePage } from '@/features/site-templates/registry'

interface RouteParams {
  id: string
  slug?: string[]
}

/** catch-all 拿到的是路径片段数组，注册表里存的是完整 slug 字符串，这里做一次归一。 */
function resolveSlug(slug: string[] | undefined): string {
  return slug?.join('/') ?? ''
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { id, slug } = await params
  const template = getTemplateById(id)
  if (!template) return {}

  const page = getTemplatePage(template, resolveSlug(slug))

  return {
    // 用 absolute 覆盖根 layout 的 title.template：模板站点不该被追加「· 微域生光」后缀。
    title: { absolute: page ? `${page.title} · ${template.name}` : template.name },
    robots: { index: false, follow: false },
  }
}

export default async function TemplateSitePage({ params }: { params: Promise<RouteParams> }) {
  const { id, slug } = await params

  const template = getTemplateById(id)
  if (!template) notFound()

  const page = getTemplatePage(template, resolveSlug(slug))
  if (!page) notFound()

  const { default: PageComponent } = await page.load()

  // data-template 是该模板 theme.css 的作用域锚点：令牌与底色只在这个子树内生效。
  // basePath 交给模板自己拼站内链接，模板内部不感知自己被挂在 /templates 下。
  return (
    <div data-template={template.id} className="min-h-screen">
      <PageComponent basePath={`/templates/${template.id}`} />
    </div>
  )
}
```

- [ ] **Step 10: 断言路由行为**

```bash
curl -s -o /dev/null -w "home=%{http_code}\n" http://localhost:3000/templates/meridian
curl -s -o /dev/null -w "team=%{http_code}\n" http://localhost:3000/templates/meridian/team
curl -s -o /dev/null -w "missing=%{http_code}\n" http://localhost:3000/templates/meridian/nope
curl -s -o /dev/null -w "badtpl=%{http_code}\n" http://localhost:3000/templates/nosuch
```

Expected: `home=200`、`team=200`、`missing=404`、`badtpl=404`

- [ ] **Step 11: 类型检查**

```bash
cd /d/code/weelume-base/website && npx tsc --noEmit
```

Expected: 无输出。

- [ ] **Step 12: 浏览器验证样式隔离与内页跳转**

用 chrome-devtools MCP：

1. 打开 `http://localhost:3000/templates/meridian`，截图。断言：整页是深蓝底（`#0d1420`）、浅色字、衬线标题、金色强调色 —— 完全不是官网的浅色 `bg-paper`。**这一条是本任务的核心验收**，证明样式隔离真的成立。
2. 点击「认识我们的团队」，断言跳转到 `/templates/meridian/team` 且团队页正常渲染，点导航能跳回首页。
3. 控制台无报错。

- [ ] **Step 13: 提交**

```bash
cd /d/code/weelume-base && git add website/src/features/site-templates/types.ts website/src/features/site-templates/registry.ts website/src/features/site-templates/catalog "website/src/app/(templates)/layout.tsx" "website/src/app/(templates)/templates/[id]" && git commit -m "feat(website): 模板注册表与 Meridian 样板模板"
```

---

### Task 3: 工作台列表页

**Files:**
- Create: `website/src/features/site-templates/workbench/TemplateCard.tsx`
- Create: `website/src/app/(templates)/templates/page.tsx`
- Create: `website/public/templates/meridian/cover.svg`

**Interfaces:**
- Consumes: `SITE_TEMPLATES`（`@/features/site-templates/registry`）、`SiteTemplate`（`@/features/site-templates/types`）
- Produces: 路由 `/templates`；`TemplateCard` 组件链向 `/templates/<id>/preview`（该路由由 Task 4 创建，本任务只验证链接存在，不点进去）

- [ ] **Step 1: 断言列表页不存在（预期失败）**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/templates
```

Expected: `404` —— 路由组 layout 已存在，但 `/templates` 本身还没有 page。

- [ ] **Step 2: 绘制封面图**

先建目录 `website/public/templates/meridian/`，再 create `website/public/templates/meridian/cover.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400" role="img" aria-label="Meridian 律师事务所模板封面">
  <rect width="640" height="400" fill="#0d1420"/>
  <rect x="0" y="0" width="640" height="52" fill="#131c2b"/>
  <circle cx="34" cy="26" r="7" fill="#c8a45c"/>
  <rect x="50" y="22" width="62" height="8" rx="4" fill="#e8e6e1" opacity="0.85"/>
  <rect x="452" y="23" width="36" height="6" rx="3" fill="#9aa3b0" opacity="0.7"/>
  <rect x="500" y="23" width="36" height="6" rx="3" fill="#9aa3b0" opacity="0.7"/>
  <rect x="548" y="23" width="36" height="6" rx="3" fill="#9aa3b0" opacity="0.7"/>
  <rect x="56" y="120" width="300" height="18" rx="4" fill="#e8e6e1"/>
  <rect x="56" y="150" width="228" height="18" rx="4" fill="#e8e6e1"/>
  <rect x="56" y="192" width="336" height="7" rx="3.5" fill="#9aa3b0" opacity="0.6"/>
  <rect x="56" y="208" width="280" height="7" rx="3.5" fill="#9aa3b0" opacity="0.6"/>
  <rect x="56" y="244" width="112" height="30" rx="2" fill="#c8a45c"/>
  <line x1="56" y1="312" x2="584" y2="312" stroke="#e8e6e1" stroke-opacity="0.12"/>
  <rect x="56" y="336" width="30" height="14" rx="2" fill="#c8a45c" opacity="0.9"/>
  <rect x="56" y="360" width="120" height="6" rx="3" fill="#9aa3b0" opacity="0.5"/>
  <rect x="232" y="336" width="30" height="14" rx="2" fill="#c8a45c" opacity="0.9"/>
  <rect x="232" y="360" width="120" height="6" rx="3" fill="#9aa3b0" opacity="0.5"/>
  <rect x="408" y="336" width="30" height="14" rx="2" fill="#c8a45c" opacity="0.9"/>
  <rect x="408" y="360" width="120" height="6" rx="3" fill="#9aa3b0" opacity="0.5"/>
</svg>
```

- [ ] **Step 3: 编写列表项组件**

Create `website/src/features/site-templates/workbench/TemplateCard.tsx`:

```tsx
import Link from 'next/link'
import type { SiteTemplate } from '../types'

export function TemplateCard({ template }: { template: SiteTemplate }) {
  return (
    <Link href={`/templates/${template.id}/preview`} className="group block">
      {/* 封面用原生 img：next/image 处理 SVG 需要打开 dangerouslyAllowSVG，
          为一个开发期工具改全局配置不值得。 */}
      <img
        src={template.cover}
        alt={`${template.name} 封面`}
        className="aspect-[16/10] w-full rounded-lg object-cover opacity-85 transition group-hover:opacity-100"
      />
      <div className="mt-4 flex items-baseline gap-2">
        <span
          className="size-2 shrink-0 translate-y-px rounded-full"
          style={{ backgroundColor: template.accentColor }}
          aria-hidden
        />
        <h2 className="text-base font-medium text-neutral-100">{template.name}</h2>
        <span className="text-xs text-neutral-500">{template.industry}</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{template.summary}</p>
      <p className="mt-2 font-mono text-xs text-neutral-600">
        {template.tags.join(' · ')} · {template.pages.length} 页
      </p>
    </Link>
  )
}
```

- [ ] **Step 4: 编写工作台列表页**

Create `website/src/app/(templates)/templates/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { SITE_TEMPLATES } from '@/features/site-templates/registry'
import { TemplateCard } from '@/features/site-templates/workbench/TemplateCard'

export const metadata: Metadata = {
  title: { absolute: '模板工作台' },
}

export default function TemplatesWorkbenchPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <header className="border-b border-white/10 pb-8">
        <p className="font-mono text-xs tracking-[0.2em] text-neutral-500">
          DEV ONLY · {SITE_TEMPLATES.length} TEMPLATES
        </p>
        <h1 className="mt-3 text-3xl font-semibold">整站模板工作台</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
          这里的全部内容只在开发环境可见。生产环境未设置 TEMPLATES_MODULE_ENABLED=true 时，
          /templates 会被 middleware 直接挡回首页。
        </p>
      </header>

      <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {SITE_TEMPLATES.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </main>
  )
}
```

- [ ] **Step 5: 断言列表页可访问**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/templates
curl -s http://localhost:3000/templates | grep -c "Meridian 律师事务所"
curl -s -o /dev/null -w "cover=%{http_code}\n" http://localhost:3000/templates/meridian/cover.svg
```

Expected: 第一条 `200`，第二条输出大于 0，第三条 `cover=200`。

- [ ] **Step 6: 类型检查**

```bash
cd /d/code/weelume-base/website && npx tsc --noEmit
```

Expected: 无输出。

- [ ] **Step 7: 浏览器验证**

用 chrome-devtools MCP 打开 `http://localhost:3000/templates`，截图确认：

1. 页面是中性深灰底（`bg-neutral-950`），**不是**官网的浅色 `bg-paper`，也**没有**被 Meridian 的深蓝令牌污染 —— 后者证明 `theme.css` 的作用域锁定生效。
2. 封面图正常显示，下方有金色圆点、模板名、行业、简介、标签行。
3. 控制台无报错。

- [ ] **Step 8: 提交**

```bash
cd /d/code/weelume-base && git add website/src/features/site-templates/workbench/TemplateCard.tsx "website/src/app/(templates)/templates/page.tsx" website/public/templates && git commit -m "feat(website): 模板工作台列表页"
```

---

### Task 4: 预览页与视口切换

**Files:**
- Create: `website/src/features/site-templates/workbench/PreviewFrame.tsx`
- Create: `website/src/app/(templates)/templates/[id]/preview/page.tsx`

**Interfaces:**
- Consumes: `getTemplateById`、`getTemplatePage`（`@/features/site-templates/registry`）
- Produces: 路由 `/templates/<id>/preview`，支持 `?page=<slug>` 切换预览的页面。Task 3 的 `TemplateCard` 已经链到这里。

- [ ] **Step 1: 断言预览页不存在（预期失败）**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/templates/meridian/preview
```

Expected: `404` —— 此时 `preview` 会落到 Task 2 的 catch-all 上，注册表里没有这个 slug，所以是 404。

- [ ] **Step 2: 编写视口切换组件**

Create `website/src/features/site-templates/workbench/PreviewFrame.tsx`:

```tsx
'use client'

import { useState } from 'react'

const VIEWPORTS = [
  { id: 'desktop', label: '桌面', width: 1440 },
  { id: 'tablet', label: '平板', width: 834 },
  { id: 'mobile', label: '手机', width: 390 },
] as const

type ViewportId = (typeof VIEWPORTS)[number]['id']

export function PreviewFrame({ src, title }: { src: string; title: string }) {
  const [viewport, setViewport] = useState<ViewportId>('desktop')
  const active = VIEWPORTS.find((item) => item.id === viewport) ?? VIEWPORTS[0]

  return (
    <div>
      <div className="flex items-center gap-6 border-b border-white/10 pb-3">
        {VIEWPORTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setViewport(item.id)}
            className={
              item.id === viewport
                ? 'text-sm text-neutral-100'
                : 'text-sm text-neutral-500 transition hover:text-neutral-300'
            }
          >
            {item.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-xs text-neutral-600">{active.width}px</span>
      </div>

      {/* 切视口是真的改 iframe 宽度，不是 CSS 缩放：只有真实宽度才会触发模板内部的响应式断点，
          缩放方案看着像但验证不出任何东西。
          外层 overflow-x-auto：桌面档在窄屏下横向滚动查看，而不是把 iframe 压窄导致失真。 */}
      <div className="mt-6 overflow-x-auto pb-4">
        <iframe
          src={src}
          title={title}
          style={{ width: active.width }}
          className="h-[760px] max-w-none border-0"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 编写预览页**

Create `website/src/app/(templates)/templates/[id]/preview/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTemplateById, getTemplatePage } from '@/features/site-templates/registry'
import { PreviewFrame } from '@/features/site-templates/workbench/PreviewFrame'

interface RouteParams {
  id: string
}

interface PreviewSearchParams {
  page?: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>
}): Promise<Metadata> {
  const { id } = await params
  const template = getTemplateById(id)
  return { title: { absolute: template ? `预览 · ${template.name}` : '预览' } }
}

export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<PreviewSearchParams>
}) {
  const { id } = await params
  const { page: requestedSlug } = await searchParams

  const template = getTemplateById(id)
  if (!template) notFound()

  // 不带 ?page 时预览首页（slug 为空串）。
  const activeSlug = requestedSlug ?? ''
  const activePage = getTemplatePage(template, activeSlug)
  if (!activePage) notFound()

  const previewSrc = `/templates/${template.id}${activeSlug ? `/${activeSlug}` : ''}`

  return (
    <main className="mx-auto w-full max-w-[1600px] px-6 py-10">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <Link
          href="/templates"
          className="text-sm text-neutral-500 transition hover:text-neutral-300"
        >
          ← 工作台
        </Link>
        <h1 className="text-xl font-medium">{template.name}</h1>
        <span className="text-xs text-neutral-500">{template.industry}</span>
        <a
          href={previewSrc}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-sm text-neutral-500 transition hover:text-neutral-300"
        >
          新标签打开 ↗
        </a>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        {template.pages.map((page) => {
          const href = page.slug
            ? `/templates/${template.id}/preview?page=${page.slug}`
            : `/templates/${template.id}/preview`
          return (
            <Link
              key={page.slug}
              href={href}
              className={
                page.slug === activeSlug
                  ? 'text-sm text-neutral-100'
                  : 'text-sm text-neutral-500 transition hover:text-neutral-300'
              }
            >
              {page.title}
            </Link>
          )
        })}
      </div>

      <div className="mt-8">
        <PreviewFrame src={previewSrc} title={`${template.name} - ${activePage.title}`} />
      </div>
    </main>
  )
}
```

- [ ] **Step 4: 断言预览页可访问**

```bash
curl -s -o /dev/null -w "preview=%{http_code}\n" http://localhost:3000/templates/meridian/preview
curl -s -o /dev/null -w "preview-team=%{http_code}\n" "http://localhost:3000/templates/meridian/preview?page=team"
curl -s -o /dev/null -w "preview-bad=%{http_code}\n" "http://localhost:3000/templates/meridian/preview?page=nope"
```

Expected: `preview=200`、`preview-team=200`、`preview-bad=404`

- [ ] **Step 5: 类型检查**

```bash
cd /d/code/weelume-base/website && npx tsc --noEmit
```

Expected: 无输出。

- [ ] **Step 6: 浏览器验证视口切换真实生效**

用 chrome-devtools MCP 打开 `http://localhost:3000/templates/meridian/preview`：

1. 截图确认 iframe 内渲染出 Meridian 首页（深蓝底）。
2. 点击「手机」，用 `evaluate_script` 读取 iframe 宽度断言：

```js
document.querySelector('iframe').getBoundingClientRect().width
```

Expected: 390。再点「平板」应为 834，「桌面」应为 1440。这一步验证的是**宽度真的变了**，而不是视觉上看起来变了。

3. 截图确认手机档下 Meridian 首页的三栏「专业领域」已堆叠成单列 —— 证明真实宽度触发了模板内部的响应式断点。
4. 点击页面顶部的「团队」切换，断言 URL 变为 `?page=team` 且 iframe 内容变为团队页。
5. 从工作台列表页点击封面能进到本页。
6. 控制台无报错。

- [ ] **Step 7: 提交**

```bash
cd /d/code/weelume-base && git add website/src/features/site-templates/workbench/PreviewFrame.tsx "website/src/app/(templates)/templates/[id]/preview" && git commit -m "feat(website): 模板预览页与真实视口切换"
```

---

### Task 5: 收尾验证与文档

**Files:**
- Create: `website/src/features/site-templates/README.md`
- Modify: 无代码改动（本任务只做验证与文档）

**Interfaces:**
- Consumes: 前四个任务的全部产物
- Produces: 无代码接口

- [ ] **Step 1: 全量 lint**

```bash
cd /d/code/weelume-base/website && pnpm lint
```

Expected: 通过。若报出本次新增文件的问题，修完再继续；**不要修与本模块无关的既有告警**。

- [ ] **Step 2: 全量类型检查**

```bash
cd /d/code/weelume-base/website && npx tsc --noEmit
```

Expected: 无输出。

- [ ] **Step 3: 确认 sitemap 未收录模板路径**

```bash
curl -s http://localhost:3000/sitemap.xml
```

Expected: 只有首页一条 `<loc>`，不含任何 `/templates` 路径。`sitemap.ts` 本身应保持未修改。

- [ ] **Step 4: 门禁复验（本计划最关键的一条）**

```bash
cd /d/code/weelume-base/website && echo "TEMPLATES_MODULE_ENABLED=false" >> .env.local
```

重启 dev server，然后：

```bash
curl -s -o /dev/null -w "list=%{http_code} %{redirect_url}\n" http://localhost:3000/templates
curl -s -o /dev/null -w "site=%{http_code} %{redirect_url}\n" http://localhost:3000/templates/meridian
curl -s -o /dev/null -w "preview=%{http_code} %{redirect_url}\n" http://localhost:3000/templates/meridian/preview
curl -s -o /dev/null -w "home=%{http_code}\n" http://localhost:3000/
```

Expected: 前三条全部 `307 http://localhost:3000/`，第四条 `200` —— 官网首页不受影响。

这一步等价复现了生产环境行为，替代了无法执行的 `next build` 验证。

- [ ] **Step 5: 恢复开关**

从 `website/.env.local` 删除 `TEMPLATES_MODULE_ENABLED=false` 这一行，重启 dev server：

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/templates
```

Expected: `200`

- [ ] **Step 6: 编写模块说明文档**

Create `website/src/features/site-templates/README.md`:

```markdown
# 整站模板模块

仅开发环境可见的整站模板工作台。设计文档见
`docs/superpowers/specs/2026-08-14-site-templates-module-design.md`。

## 可见性

`config.ts` 的 `isTemplatesModuleEnabled()` 是唯一判定入口：

- 默认：开发环境开、生产环境关
- `TEMPLATES_MODULE_ENABLED=true` / `false` 可两个方向强制覆盖
- 关闭时 `middleware.ts` 把 `/templates` 307 回首页，`(templates)/layout.tsx` 再兜一道 404

**将来整体上架**：生产环境设 `TEMPLATES_MODULE_ENABLED=true` 即可，代码零改动。

改了这个环境变量**必须重启 dev server**——白名单在 middleware 模块顶层求值，热更新不会重算。

## 新增一套模板

1. 建目录 `catalog/<template-id>/`，内含 `meta.ts`、`theme.css`、`pages/`
2. `theme.css` 里的令牌**必须**挂在 `[data-template='<template-id>']` 选择器下，禁止提到 `:root`，否则会污染全站并与其它模板串色；令牌一律以 `--tpl-` 开头
3. 每个页面组件 `export default` 一个接收 `SiteTemplatePageProps` 的组件，并在文件顶部 `import '../theme.css'`
4. 站内链接一律基于 props 传入的 `basePath` 拼接，**禁止硬编码 `/templates` 前缀**
5. 封面图放 `public/templates/<template-id>/`
6. 在 `registry.ts` 的 `SITE_TEMPLATES` 里加一行

不需要新建任何路由文件。

## 约束

- `preview` 是保留 slug，模板不能定义同名页面（与工作台的静态路由段冲突）。注册表会在加载时直接抛错
- 每套模板必须有一个 `slug: ''` 的首页，注册表会校验
- 模板**不复用**官网的 `components/ui`、`components/layout` 与 `globals.css` 的设计令牌。整站模板的价值就在于各有各的设计语言，共用会让所有模板收敛成一个样子

## 已知遗留

- 模板页面的 `<head>` 里仍带着根 layout 注入的微域生光 JSON-LD（根 layout 全站唯一，无法绕开），上架前需处理
- `public/templates/` 下的封面图不经过 middleware，知道 URL 即可直接访问；这些图本就是将来要公开的资产
```

- [ ] **Step 7: 提交**

```bash
cd /d/code/weelume-base && git add website/src/features/site-templates/README.md && git commit -m "docs(website): 模板模块说明与新增模板流程"
```

---

## 完成标准

全部任务完成后，下面每条都应为真：

1. dev 下 `/templates` 返回 200，工作台列出 Meridian 模板（封面、主色点、行业、简介、标签）
2. `/templates/meridian/preview` 三档视口切换使 iframe 宽度真实变为 1440 / 834 / 390，手机档下模板内部三栏堆叠成单列
3. `/templates/meridian` 与 `/templates/meridian/team` 直接可访问，深蓝底衬线视觉，互相跳转正常，且不影响工作台自身的中性深灰底
4. `.env.local` 设 `TEMPLATES_MODULE_ENABLED=false` 重启后，三个模板路径全部 307 回首页，官网首页 200 不受影响
5. `pnpm lint` 与 `npx tsc --noEmit` 通过
6. `sitemap.xml` 只含首页
7. `git status` 中除本模块文件外，`Advantages.tsx` 等既有未提交改动仍保持未提交、未被修改
