# community「AI编程」阶段式学习页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 community 顶部导航新增「AI编程」tab，进入一个纵向路径形态的阶段列表页，每个阶段可点进讲义详情页。

**Architecture:** 静态内容（`src/lib/content/ai-coding.ts`，结构化讲义块）+ 新建 `(learn)` 路由组下的列表页与 `[stage]` 详情页（服务端组件）+ 复用 `SiteShell` 与现有设计令牌。零新依赖、不改 middleware、不接后端。

**Tech Stack:** Next.js 15 App Router、React 19、Tailwind v4（`@theme` 令牌）、TypeScript。

> 验证策略：community 为前端项目，按 CLAUDE.md「前端不要求组件级测试」，本计划以 `pnpm lint` + `pnpm build`（验证类型与 `generateStaticParams`）+ `pnpm dev` 页面运行作为验收，不写单元测试。
> 所有命令在 `D:/code/weelume-base/community` 目录下执行。
> commit 步骤按需执行：当前分支 `001-website-membership` 有大量无关暂存改动，提交前需 `git add` 仅本计划新增/修改的文件，避免裹挟无关变更。

---

### Task 1: 阶段内容数据模块

**Files:**
- Create: `community/src/lib/content/ai-coding.ts`

- [ ] **Step 1: 创建数据模块**

写入 `community/src/lib/content/ai-coding.ts`：

```ts
// AI 编程阶段式学习内容（静态）。
// 阶段划分与讲义正文为占位示例，待用户后续替换为真实内容。

export type LectureBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered?: boolean; items: string[] }
  | { type: 'code'; lang?: string; code: string }
  | { type: 'callout'; tone?: 'info' | 'warn' | 'tip'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }

export interface Stage {
  slug: string
  order: number
  title: string
  tagline: string
  summary: string
  objectives: string[]
  lecture: LectureBlock[]
}

const CN_NUMERALS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'] as const

// 阶段中文序号标签：第一阶段 / 第二阶段……（超过 10 退化为数字）
export function stageLabel(order: number): string {
  return `第${CN_NUMERALS[order] ?? order}阶段`
}

const STAGES: Stage[] = [
  {
    slug: 'ai-tools',
    order: 1,
    title: 'AI工具篇',
    tagline: '认识并跑通主力 AI 编程工具，建立开发世界的认知地基。',
    summary: '从零认识开发世界，安装并跑通主力 AI 工具，完成第一次「描述—生成—调整」闭环。',
    objectives: [
      '用大白话讲清前端、后端、数据库、终端的关系',
      '安装并跑通一款主力 AI 编程工具',
      '设计属于自己的 AI 编程工作流',
    ],
    lecture: [
      { type: 'paragraph', text: '（占位）本阶段讲义正文待补充。以下为版式示例，后续替换为真实教学内容。' },
      { type: 'heading', text: '一、开发世界速览' },
      { type: 'paragraph', text: '（占位）用大白话讲清前端、后端、数据库、终端，为后面所有内容打地基。' },
      { type: 'list', items: ['前端：用户看得见的界面', '后端：处理数据与逻辑的服务', '数据库：数据的存放处'] },
      { type: 'callout', tone: 'tip', text: '（占位）零基础提示：本节是整门课的地基，宁可慢一点。' },
      { type: 'heading', text: '二、安装主力工具' },
      { type: 'code', lang: 'bash', code: '# （占位）示例命令\nnpm install -g some-ai-tool' },
    ],
  },
  {
    slug: 'frontend',
    order: 2,
    title: '前端工程篇',
    tagline: '把页面从「能看」升级为「好维护」的前端工程化能力。',
    summary: '掌握配色、组件、主题与目录结构，做出美观、响应式、可维护的前端应用。',
    objectives: [
      '掌握配色、排版、间距等基础设计原则并传达给 AI',
      '用主题变量统一管理颜色、字体、圆角',
      '识别重复结构并抽象为可复用组件',
    ],
    lecture: [
      { type: 'paragraph', text: '（占位）本阶段讲义正文待补充。' },
      { type: 'heading', text: '一、让应用更美观' },
      { type: 'paragraph', text: '（占位）配色、排版、间距、对齐的基础原则。' },
    ],
  },
  {
    slug: 'backend',
    order: 3,
    title: '后端服务篇',
    tagline: '搭起自己的后端，把前后端打通成一个真正能用的应用。',
    summary: '理解后端与接口，搭建后端环境，开发第一个接口并完成前后端联调。',
    objectives: [
      '理解「数据存哪、接口是什么」',
      '搭建并跑通后端开发环境',
      '开发第一个接口并完成前后端联调排错',
    ],
    lecture: [
      { type: 'paragraph', text: '（占位）本阶段讲义正文待补充。' },
      { type: 'callout', tone: 'warn', text: '（占位）联调排错是历史劝退重灾区，本阶段会系统化拆解。' },
    ],
  },
]

export function getStages(): Stage[] {
  return [...STAGES].sort((a, b) => a.order - b.order)
}

export function getStage(slug: string): Stage | null {
  return STAGES.find((s) => s.slug === slug) ?? null
}

export function getStageSlugs(): string[] {
  return STAGES.map((s) => s.slug)
}

export function getAdjacentStages(slug: string): { prev: Stage | null; next: Stage | null } {
  const ordered = getStages()
  const idx = ordered.findIndex((s) => s.slug === slug)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? ordered[idx - 1] : null,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : null,
  }
}
```

- [ ] **Step 2: 类型检查**

Run（在 `community` 目录）: `pnpm exec tsc --noEmit`
Expected: 无错误输出（退出码 0）。

---

### Task 2: 讲义块渲染组件

**Files:**
- Create: `community/src/components/LectureBlocks.tsx`

- [ ] **Step 1: 创建块渲染器**

写入 `community/src/components/LectureBlocks.tsx`（服务端组件，无交互，无需 `'use client'`）：

```tsx
import type { LectureBlock } from '@/lib/content/ai-coding'

const CALLOUT_STYLES: Record<'info' | 'warn' | 'tip', string> = {
  info: 'border-sky/40 bg-sky/10',
  warn: 'border-amber/40 bg-amber/10',
  tip: 'border-line-strong bg-white/5',
}

function Block({ block }: { block: LectureBlock }) {
  switch (block.type) {
    case 'heading':
      return <h2 className="mt-10 font-display text-2xl font-medium text-ink">{block.text}</h2>
    case 'paragraph':
      return <p className="mt-4 leading-relaxed text-ink-2">{block.text}</p>
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      const listStyle = block.ordered ? 'list-decimal' : 'list-disc'
      return (
        <Tag className={`mt-4 space-y-2 pl-5 text-ink-2 ${listStyle}`}>
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </Tag>
      )
    }
    case 'code':
      return (
        <pre className="mt-4 overflow-x-auto rounded-card border border-line bg-surface p-4 text-sm">
          <code className="font-mono text-ink-2">{block.code}</code>
        </pre>
      )
    case 'callout':
      return (
        <div
          className={`mt-4 rounded-card border p-4 text-sm leading-relaxed text-ink-2 ${CALLOUT_STYLES[block.tone ?? 'info']}`}
        >
          {block.text}
        </div>
      )
    case 'image':
      return (
        <figure className="mt-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.src} alt={block.alt} className="w-full rounded-card border border-line" />
          {block.caption && (
            <figcaption className="mt-2 text-center text-xs text-mute">{block.caption}</figcaption>
          )}
        </figure>
      )
  }
}

export default function LectureBlocks({ blocks }: { blocks: LectureBlock[] }) {
  return (
    <div>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: 类型检查**

Run: `pnpm exec tsc --noEmit`
Expected: 无错误输出。

---

### Task 3: `(learn)` 路由组 layout + 阶段列表页（纵向路径）

**Files:**
- Create: `community/src/app/(learn)/layout.tsx`
- Create: `community/src/app/(learn)/ai-coding/page.tsx`

- [ ] **Step 1: 创建路由组 layout**

写入 `community/src/app/(learn)/layout.tsx`：

```tsx
import SiteShell from '@/components/SiteShell'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
```

- [ ] **Step 2: 创建阶段列表页**

写入 `community/src/app/(learn)/ai-coding/page.tsx`：

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { getStages, stageLabel } from '@/lib/content/ai-coding'

export const metadata: Metadata = {
  title: 'AI编程学习路径',
  description: '从认识 AI 工具到独立上线，一条纵向进阶的 AI 编程学习路径。',
}

export default function AiCodingPage() {
  const stages = getStages()
  return (
    <section>
      <div className="text-center">
        <span className="glass rounded-pill px-3.5 py-1.5 text-xs font-medium tracking-wide text-ink-2">
          AI 编程 · 阶段式学习
        </span>
        <h1 className="mt-6 font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
          一条<span className="text-fusion">进阶路径</span>，从工具到上线
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-mute">
          按阶段循序学习，每个阶段点开即是完整讲义。沿着这条路径一步步走，做出属于自己的 AI 应用。
        </p>
      </div>

      <ol className="relative mt-16 space-y-6">
        {/* 纵向竖线（串联各阶段节点珠子） */}
        <span aria-hidden className="absolute left-[19px] top-2 bottom-2 w-px bg-line-strong" />
        {stages.map((stage) => (
          <li key={stage.slug} className="relative">
            <Link href={`/ai-coding/${stage.slug}`} className="group flex gap-5">
              {/* 序号节点珠子 */}
              <span className="bg-fusion glow-amber relative z-[1] grid h-10 w-10 flex-none place-items-center rounded-pill text-sm font-semibold text-white">
                {stage.order}
              </span>
              {/* 阶段卡片 */}
              <div className="glass flex-1 rounded-card p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-line-strong group-hover:bg-white/[0.06]">
                <span className="text-xs font-medium text-mute">{stageLabel(stage.order)}</span>
                <h2 className="mt-1.5 font-display text-xl font-medium text-ink">{stage.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{stage.tagline}</p>
                <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-mute">
                  {stage.objectives.slice(0, 3).map((obj, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-pill bg-amber" />
                      {obj}
                    </li>
                  ))}
                </ul>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-fusion">
                  进入本阶段
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
```

- [ ] **Step 3: 类型检查**

Run: `pnpm exec tsc --noEmit`
Expected: 无错误输出。

---

### Task 4: 阶段详情页（讲义阅读版式）

**Files:**
- Create: `community/src/app/(learn)/ai-coding/[stage]/page.tsx`

- [ ] **Step 1: 创建详情页**

写入 `community/src/app/(learn)/ai-coding/[stage]/page.tsx`：

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LectureBlocks from '@/components/LectureBlocks'
import { getAdjacentStages, getStage, getStageSlugs, stageLabel } from '@/lib/content/ai-coding'

// ISR：与公开内容页一致，每小时再生
export const revalidate = 3600

export function generateStaticParams() {
  return getStageSlugs().map((stage) => ({ stage }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ stage: string }> },
): Promise<Metadata> {
  const { stage: slug } = await params
  const stage = getStage(slug)
  if (!stage) return {}
  return {
    title: `${stageLabel(stage.order)} · ${stage.title}`,
    description: stage.summary,
  }
}

export default async function StageDetailPage(
  { params }: { params: Promise<{ stage: string }> },
) {
  const { stage: slug } = await params
  const stage = getStage(slug)
  if (!stage) notFound()
  const { prev, next } = getAdjacentStages(slug)

  return (
    <article className="mx-auto max-w-3xl">
      <Link href="/ai-coding" className="text-sm text-mute transition-colors hover:text-ink">
        ← 返回学习路径
      </Link>

      <header className="mt-6">
        <span className="text-sm font-medium text-fusion">{stageLabel(stage.order)}</span>
        <h1 className="mt-2 font-display text-4xl font-medium text-ink">{stage.title}</h1>
        <p className="mt-3 leading-relaxed text-mute">{stage.tagline}</p>
      </header>

      <section className="glass mt-8 rounded-card p-6">
        <h2 className="font-display text-base font-medium text-ink">学完你能做到</h2>
        <ul className="mt-3 space-y-2">
          {stage.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-ink-2">
              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-pill bg-amber" />
              {obj}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <LectureBlocks blocks={stage.lecture} />
      </div>

      <nav className="mt-16 flex items-center justify-between gap-4 border-t border-line pt-6">
        {prev ? (
          <Link href={`/ai-coding/${prev.slug}`} className="group flex-1">
            <span className="text-xs text-mute">上一阶段</span>
            <span className="mt-1 block text-sm font-medium text-ink-2 transition-colors group-hover:text-ink">
              ← {prev.title}
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next ? (
          <Link href={`/ai-coding/${next.slug}`} className="group flex-1 text-right">
            <span className="text-xs text-mute">下一阶段</span>
            <span className="mt-1 block text-sm font-medium text-ink-2 transition-colors group-hover:text-ink">
              {next.title} →
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </article>
  )
}
```

- [ ] **Step 2: 类型检查**

Run: `pnpm exec tsc --noEmit`
Expected: 无错误输出。

---

### Task 5: 导航增加「AI编程」tab

**Files:**
- Modify: `community/src/components/SiteHeader.tsx:7-10`

- [ ] **Step 1: 在 NAV_LINKS 增加 AI编程 链接**

将 `community/src/components/SiteHeader.tsx` 中：

```ts
const NAV_LINKS = [
  { label: '首页', to: '/' },
  { label: '标签', to: '/tags' },
]
```

改为：

```ts
const NAV_LINKS = [
  { label: '首页', to: '/' },
  { label: 'AI编程', to: '/ai-coding' },
  { label: '标签', to: '/tags' },
]
```

> 现有 `isActive` 逻辑：`link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)`，对 `/ai-coding` 及其详情页 `/ai-coding/[slug]` 均能正确高亮，无需改动逻辑。

- [ ] **Step 2: 类型检查**

Run: `pnpm exec tsc --noEmit`
Expected: 无错误输出。

---

### Task 6: 集成验证（lint + build + 页面运行）

**Files:** 无（仅验证）

- [ ] **Step 1: Lint**

Run（在 `community` 目录）: `pnpm lint`
Expected: 无 error（无 `any`、无未用变量、无 `no-img-element` 报错——已用 eslint-disable 注释）。

- [ ] **Step 2: Build（验证类型与 generateStaticParams）**

Run: `pnpm build`
Expected: 构建成功；输出中 `/ai-coding` 为静态页，`/ai-coding/[stage]` 预生成 3 个路径（ai-tools / frontend / backend）。

- [ ] **Step 3: 页面运行验证**

Run: `pnpm dev`（端口 8666），浏览器访问 `http://localhost:8666`，逐项确认：

  - 顶部导航出现「AI编程」tab；点击进入 `/ai-coding`，该 tab 高亮。
  - 列表页为纵向路径形态：左侧竖线串联序号珠子，右侧玻璃卡片显示 阶段序号/标题/定位/目标。
  - 点击任一阶段进入 `/ai-coding/{slug}`：讲义正文（标题/段落/列表/代码/提示框）渲染正常，「学完你能做到」块显示，底部上一/下一阶段导航正确（首阶段无「上一」，末阶段无「下一」）。
  - 访问不存在的 slug（如 `/ai-coding/nope`）显示 404。
  - 暗色主题与 fusion 渐变风格与站内一致；窄屏（移动端）版式正常。

- [ ] **Step 4（可选）: 提交**

仅添加本计划涉及的文件，避免裹挟无关暂存改动：

```bash
git add community/src/lib/content/ai-coding.ts \
        community/src/components/LectureBlocks.tsx \
        "community/src/app/(learn)/layout.tsx" \
        "community/src/app/(learn)/ai-coding/page.tsx" \
        "community/src/app/(learn)/ai-coding/[stage]/page.tsx" \
        community/src/components/SiteHeader.tsx
git commit -m "feat(community): 新增 AI编程 阶段式学习页（纵向路径 + 讲义详情）"
```

---

## 自检（Self-Review）

- **Spec 覆盖**：导航 tab（Task 5）、`(learn)` 路由组+列表页（Task 3）、详情页（Task 4）、数据模型（Task 1）、讲义块渲染（Task 2）、错误处理 `notFound`（Task 4）、验收标准（Task 6）——spec 各项均有对应任务。
- **占位符扫描**：计划内代码均为完整可运行代码；数据中的「（占位）」是设计上有意保留、待用户填充的内容（spec 第 9 节已声明），非计划缺口。
- **类型一致性**：`Stage` / `LectureBlock` 字段在各任务间一致；getter 名称 `getStages` / `getStage` / `getStageSlugs` / `getAdjacentStages` / `stageLabel` 在 Task 3/4 引用与 Task 1 定义一致；详情页动态段名 `[stage]` 与 `generateStaticParams` 返回的 `{ stage }` 键一致。
