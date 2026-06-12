# 课程并入 website-aicamp 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `website-course` 子工程的课程展示能力并入 `website-aicamp`（Next.js App Router），接入登录 + 会员章级门禁，删除子工程。

**Architecture:** 课程领域逻辑与客户端组件放 `src/features/course/`，路由与服务端门禁放 `src/app/course/`。内容仍是 `public/courses/` 下的完整独立 HTML，经 iframe 展示；清单按「分章」存放（顶层 `manifest.json` 列章节 + 每章 `sections.json`），服务端 fs 读取并 `cache()` 去重。门禁三层：middleware 拦登录、layout 拦会员、section page 拦章级 tier。

**Tech Stack:** Next.js 15 App Router、React 19、Tailwind v4、TypeScript。**无单元测试框架**（已决定不引入 vitest）：每个任务的验证用 `pnpm exec tsc --noEmit` 类型检查，最终任务用 `pnpm build` + `pnpm dev` 运行时验证。

> 执行约定：所有命令在 `website-aicamp/` 目录下运行（除非另注）。源文件参照仓库根的 `website-course/`。导入路径用 `@/` 别名、不带扩展名，与现有 aicamp 代码一致。注意 tsconfig 开了 `noUnusedLocals`/`noUnusedParameters`，勿留未用导入。

**规格依据：** `docs/superpowers/specs/2026-06-12-course-into-aicamp-design.md`

**文件结构总览：**

| 文件 | 职责 |
|---|---|
| `public/courses/manifest.json` | 顶层清单：`{ title, chapters:[{id,title,tier}] }` |
| `public/courses/<id>/sections.json` | 该章小节：`{ sections:[{id,title,file}] }` |
| `public/courses/<id>/*.html` | 每节完整独立 HTML |
| `src/features/course/types.ts` | 领域类型 + 侧栏/导航数据类型 |
| `src/features/course/manifest.ts` | 纯函数：parse/flatten/findAdjacent |
| `src/features/course/load-manifest.ts` | 服务端 fs 读取 + 组装 + cache() |
| `src/features/course/access.ts` | 课程门禁常量 + canAccessChapter |
| `src/features/course/components/CourseSidebar.tsx` | 客户端侧栏：折叠 + 锁标 + 当前高亮 |
| `src/features/course/components/LessonViewer.tsx` | 客户端：iframe + 上/下节导航 |
| `src/app/course/layout.tsx` | 服务端：登录+会员门 + 渲染侧栏外壳 |
| `src/app/course/page.tsx` | 课程首页（Welcome） |
| `src/app/course/[chapterId]/[sectionId]/page.tsx` | 服务端：章级 tier 门 + 渲染 LessonViewer |
| `src/features/auth/protected-routes.ts` | 修改：加入 `/course` |
| `src/components/layout/TopNav.tsx` | 修改：加课程入口 |

---

### Task 1: 迁移课程内容并拆成分章清单

**Files:**
- Copy: `website-course/public/courses/01-ai-basics/*.html` → `website-aicamp/public/courses/01-ai-basics/`
- Copy: `website-course/public/courses/02-engineering/*.html` → `website-aicamp/public/courses/02-engineering/`
- Create: `website-aicamp/public/courses/manifest.json`
- Create: `website-aicamp/public/courses/01-ai-basics/sections.json`
- Create: `website-aicamp/public/courses/02-engineering/sections.json`

- [ ] **Step 1: 复制 HTML 内容文件**（在仓库根运行）

```bash
mkdir -p website-aicamp/public/courses/01-ai-basics website-aicamp/public/courses/02-engineering
cp website-course/public/courses/01-ai-basics/01-dev-world.html website-aicamp/public/courses/01-ai-basics/
cp website-course/public/courses/01-ai-basics/02-tools.html     website-aicamp/public/courses/01-ai-basics/
cp website-course/public/courses/02-engineering/01-theme.html   website-aicamp/public/courses/02-engineering/
```

- [ ] **Step 2: 写顶层 manifest.json**

`website-aicamp/public/courses/manifest.json`：

```json
{
  "title": "AI 编程课程",
  "chapters": [
    { "id": "01-ai-basics", "title": "课时 1　AI 基础工具学习", "tier": "basic" },
    { "id": "02-engineering", "title": "课时 2　AI 应用工程化", "tier": "basic" }
  ]
}
```

- [ ] **Step 3: 写各章 sections.json**

`website-aicamp/public/courses/01-ai-basics/sections.json`：

```json
{
  "sections": [
    { "id": "1.1", "title": "开发世界速览", "file": "01-dev-world.html" },
    { "id": "1.2", "title": "认识并安装主力工具", "file": "02-tools.html" }
  ]
}
```

`website-aicamp/public/courses/02-engineering/sections.json`：

```json
{
  "sections": [
    { "id": "2.1", "title": "设计应用的主题效果", "file": "01-theme.html" }
  ]
}
```

- [ ] **Step 4: 校验 JSON 合法 + 文件齐全**（在仓库根运行）

```bash
node -e "['manifest.json','01-ai-basics/sections.json','02-engineering/sections.json'].forEach(f=>JSON.parse(require('fs').readFileSync('website-aicamp/public/courses/'+f)));console.log('json ok')"
ls website-aicamp/public/courses/01-ai-basics/*.html website-aicamp/public/courses/02-engineering/*.html
```
Expected: 打印 `json ok`，并列出 3 个 HTML 文件。

- [ ] **Step 5: Commit**

```bash
git add website-aicamp/public/courses
git commit -m "feat(course): 迁移课程内容到 aicamp 并拆分章清单"
```

---

### Task 2: 领域类型与纯函数

**Files:**
- Create: `website-aicamp/src/features/course/types.ts`
- Create: `website-aicamp/src/features/course/manifest.ts`

- [ ] **Step 1: 写 types.ts**

`website-aicamp/src/features/course/types.ts`：

```ts
// 课程章节仅对会员开放，tier 不含 'none'
export type ChapterTier = 'basic' | 'premium'

export interface Section {
  id: string
  title: string
  file: string
}

export interface Chapter {
  id: string
  title: string
  tier: ChapterTier
  sections: Section[]
}

export interface Manifest {
  title: string
  chapters: Chapter[]
}

// 扁平化后的小节，附带所属章节信息，用于跨章节的上/下一节导航
export interface FlatSection extends Section {
  chapterId: string
  chapterTitle: string
}

// 传给客户端侧栏的精简数据：不下发会被门禁拦截章节的内容路径
export interface SidebarSection {
  id: string
  title: string
}

export interface SidebarChapter {
  id: string
  title: string
  locked: boolean
  sections: SidebarSection[]
}

export interface SidebarData {
  title: string
  chapters: SidebarChapter[]
}

// LessonViewer 上/下节跳转目标
export interface AdjacentLink {
  chapterId: string
  sectionId: string
}
```

- [ ] **Step 2: 写 manifest.ts（纯函数）**

`website-aicamp/src/features/course/manifest.ts`：

```ts
import type { Manifest, FlatSection, ChapterTier } from './types'

const VALID_TIERS: ChapterTier[] = ['basic', 'premium']

// 严格校验 manifest 结构，非法时抛出明确错误，禁止静默兜底
export function parseManifest(data: unknown): Manifest {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('manifest 必须是非数组对象')
  }
  const m = data as Record<string, unknown>
  if (typeof m.title !== 'string') {
    throw new Error('manifest.title 缺失或非字符串')
  }
  if (!Array.isArray(m.chapters)) {
    throw new Error('manifest.chapters 缺失或非数组')
  }
  m.chapters.forEach((ch, ci) => {
    const c = ch as Record<string, unknown>
    if (typeof c.id !== 'string' || typeof c.title !== 'string') {
      throw new Error(`chapters[${ci}] 缺少 id/title`)
    }
    if (typeof c.tier !== 'string' || !VALID_TIERS.includes(c.tier as ChapterTier)) {
      throw new Error(`chapters[${ci}].tier 非法（应为 basic/premium）`)
    }
    if (!Array.isArray(c.sections)) {
      throw new Error(`chapters[${ci}].sections 缺失或非数组`)
    }
    c.sections.forEach((sec, si) => {
      const s = sec as Record<string, unknown>
      if (typeof s.id !== 'string' || typeof s.title !== 'string' || typeof s.file !== 'string') {
        throw new Error(`chapters[${ci}].sections[${si}] 缺少 id/title/file`)
      }
    })
  })
  return data as Manifest
}

// 跨章节扁平化小节序列，保留所属章节信息
export function flattenSections(manifest: Manifest): FlatSection[] {
  return manifest.chapters.flatMap((ch) =>
    ch.sections.map((s) => ({ ...s, chapterId: ch.id, chapterTitle: ch.title })),
  )
}

export interface Adjacent {
  prev: FlatSection | null
  current: FlatSection | null
  next: FlatSection | null
}

// 在扁平序列中定位当前小节及其前后项；首尾对应项为 null
export function findAdjacent(
  flat: FlatSection[],
  chapterId: string,
  sectionId: string,
): Adjacent {
  const idx = flat.findIndex((s) => s.chapterId === chapterId && s.id === sectionId)
  if (idx === -1) {
    return { prev: null, current: null, next: null }
  }
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    current: flat[idx],
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  }
}
```

- [ ] **Step 3: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: 无报错退出（exit 0）。

- [ ] **Step 4: Commit**

```bash
git add website-aicamp/src/features/course/types.ts website-aicamp/src/features/course/manifest.ts
git commit -m "feat(course): 领域类型与 manifest 纯函数(含 tier 校验)"
```

---

### Task 3: 服务端 manifest 加载器

**Files:**
- Create: `website-aicamp/src/features/course/load-manifest.ts`

- [ ] **Step 1: 写 load-manifest.ts**

读顶层 `manifest.json`，对每章并行读 `sections.json` 并把 `file` 拼成 `<chapterId>/<file>`，组装成完整 `Manifest` 后 `parseManifest` 校验。用 React `cache()` 单请求去重。

`website-aicamp/src/features/course/load-manifest.ts`：

```ts
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'

import { parseManifest } from './manifest'
import type { Manifest } from './types'

const COURSES_DIR = path.join(process.cwd(), 'public', 'courses')

async function readJson(relativePath: string): Promise<unknown> {
  const abs = path.join(COURSES_DIR, relativePath)
  const raw = await readFile(abs, 'utf-8')
  return JSON.parse(raw) as unknown
}

// 读顶层章节清单（只含 id/title/tier），与各章 sections.json 合并成完整 manifest。
// 单请求内多次调用（layout + page）复用同一结果，避免重复 fs 读。
export const loadManifest = cache(async (): Promise<Manifest> => {
  const top = await readJson('manifest.json')
  if (!top || typeof top !== 'object' || Array.isArray(top)) {
    throw new Error('manifest.json 必须是非数组对象')
  }
  const topRecord = top as Record<string, unknown>
  if (!Array.isArray(topRecord.chapters)) {
    throw new Error('manifest.json.chapters 缺失或非数组')
  }

  const chapters = await Promise.all(
    topRecord.chapters.map(async (ch) => {
      const c = ch as Record<string, unknown>
      if (typeof c.id !== 'string') {
        throw new Error('manifest.json 存在缺少 id 的章节')
      }
      const sectionsDoc = await readJson(`${c.id}/sections.json`)
      const sd = sectionsDoc as Record<string, unknown>
      if (!Array.isArray(sd.sections)) {
        throw new Error(`${c.id}/sections.json 缺少 sections 数组`)
      }
      // file 由章内文件名拼成 <chapterId>/<file>，与 iframe 的 /courses/<...> 对齐
      const sections = sd.sections.map((sec) => {
        const s = sec as Record<string, unknown>
        if (typeof s.file !== 'string') {
          throw new Error(`${c.id}/sections.json 存在缺少 file 的小节`)
        }
        return { ...s, file: `${c.id}/${s.file}` }
      })
      return { ...c, sections }
    }),
  )

  return parseManifest({ title: topRecord.title, chapters })
})
```

- [ ] **Step 2: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/features/course/load-manifest.ts
git commit -m "feat(course): 服务端分章 manifest 加载器(fs+cache)"
```

---

### Task 4: 课程门禁工具

**Files:**
- Create: `website-aicamp/src/features/course/access.ts`

- [ ] **Step 1: 写 access.ts**

复用 `features/membership/require-tier.ts` 的 `requireTier`，不重复实现等级比较。

`website-aicamp/src/features/course/access.ts`：

```ts
import type { AuthAccount } from '@/features/auth/types'
import { requireTier } from '@/features/membership/require-tier'
import type { ChapterTier } from './types'

// 进入课程区的最低会员门槛：任意有效会员
export const COURSE_MIN_TIER = 'basic' as const

// 当前账号是否可访问指定章节（高档满足低档）
export function canAccessChapter(account: AuthAccount | null, chapterTier: ChapterTier): boolean {
  return requireTier(account, chapterTier)
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/features/course/access.ts
git commit -m "feat(course): 章级门禁工具 canAccessChapter"
```

---

### Task 5: 客户端侧栏组件 CourseSidebar

**Files:**
- Create: `website-aicamp/src/features/course/components/CourseSidebar.tsx`

- [ ] **Step 1: 写 CourseSidebar.tsx**

接收 layout 服务端算好的 `SidebarData`（每章含 `locked` 与精简 `sections`）。可访问章节渲染小节 `<Link>`；locked 章节只渲染标题 + 🔒、点击跳 `/membership`、不渲染小节链接。默认只展开当前小节所在章节，其余仅渲染章节头。

`website-aicamp/src/features/course/components/CourseSidebar.tsx`：

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import type { SidebarData } from '../types'

interface Props {
  data: SidebarData
}

// 从 /course/<chapterId>/<sectionId> 解析当前定位
function useCurrentLocation(): { chapterId: string | null; sectionPath: string } {
  const pathname = usePathname()
  const m = pathname.match(/^\/course\/([^/]+)\/([^/]+)/)
  return { chapterId: m?.[1] ?? null, sectionPath: pathname }
}

export function CourseSidebar({ data }: Props) {
  const { chapterId: currentChapterId, sectionPath } = useCurrentLocation()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    if (id === currentChapterId) return // 当前所在章节始终展开
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <nav className="p-3">
      <div className="text-gradient px-2 py-4 text-lg font-semibold tracking-tight">{data.title}</div>
      {data.chapters.map((ch) => {
        const isCollapsed = collapsed.has(ch.id) && ch.id !== currentChapterId
        return (
          <div key={ch.id} className="mb-1">
            {ch.locked ? (
              // 锁定章节：标题 + 🔒，引导升级；不下发小节链接
              <Link
                href="/membership"
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-muted transition-colors hover:bg-white/5 hover:text-ink-soft"
              >
                <span className="inline-block w-4">🔒</span>
                {ch.title}
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => toggle(ch.id)}
                  className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-ink-soft transition-colors hover:bg-white/5 hover:text-ink"
                >
                  <span className="inline-block w-4 text-muted">{isCollapsed ? '▶' : '▼'}</span>
                  {ch.title}
                </button>
                {!isCollapsed && (
                  <ul className="ml-[18px] border-l border-hairline">
                    {ch.sections.map((s) => {
                      const href = `/course/${ch.id}/${s.id}`
                      const isActive = sectionPath === href
                      return (
                        <li key={s.id}>
                          <Link
                            href={href}
                            className={`-ml-px block border-l-2 px-3 py-1.5 text-sm transition-colors ${
                              isActive
                                ? 'border-accent bg-accent/10 font-medium text-accent'
                                : 'border-transparent text-muted hover:bg-white/5 hover:text-ink-soft'
                            }`}
                          >
                            {s.id} {s.title}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </>
            )}
          </div>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/features/course/components/CourseSidebar.tsx
git commit -m "feat(course): 客户端侧栏(折叠+锁标+当前高亮)"
```

---

### Task 6: 客户端 LessonViewer 组件

**Files:**
- Create: `website-aicamp/src/features/course/components/LessonViewer.tsx`

- [ ] **Step 1: 写 LessonViewer.tsx**

当前小节与相邻节由 page 服务端算好作为 props 传入；组件不持有完整 manifest。保留 iframe + HEAD 探测 + 上/下节导航。

`website-aicamp/src/features/course/components/LessonViewer.tsx`：

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import type { AdjacentLink, Section } from '../types'

interface Props {
  current: Section
  prev: AdjacentLink | null
  next: AdjacentLink | null
}

// 右侧课程展示：顶部上/下一节导航条 + iframe 加载完整 HTML 文档
export function LessonViewer({ current, prev, next }: Props) {
  const router = useRouter()
  const [iframeError, setIframeError] = useState(false)
  const currentFile = current.file

  // iframe onError 对跨文档加载不可靠，这里用 HEAD 显式探测课程文件是否存在。
  // 依赖 currentFile 字符串，避免失败态触发无限重渲染。
  useEffect(() => {
    setIframeError(false)
    let alive = true
    fetch(`/courses/${currentFile}`, { method: 'HEAD' })
      .then((res) => {
        if (alive && !res.ok) setIframeError(true)
      })
      .catch(() => {
        if (alive) setIframeError(true)
      })
    return () => {
      alive = false
    }
  }, [currentFile])

  // 上/下一节胶囊按钮：发丝边框 + hover 紫色微光，禁用态弱化
  const navBtn =
    'rounded-full border border-hairline px-4 py-1.5 text-sm text-ink transition-all enabled:hover:border-hairline-strong enabled:hover:text-accent enabled:hover:shadow-[0_6px_20px_-6px_rgba(167,139,250,0.5)] disabled:border-transparent disabled:text-muted/40'

  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex items-center justify-between border-b border-hairline bg-canvas/60 px-4 py-2.5 backdrop-blur-xl">
        <button
          type="button"
          disabled={!prev}
          onClick={() => prev && router.push(`/course/${prev.chapterId}/${prev.sectionId}`)}
          className={navBtn}
        >
          ← 上一节
        </button>
        <span className="truncate px-3 text-sm font-medium text-ink-soft">
          {current.id} {current.title}
        </span>
        <button
          type="button"
          disabled={!next}
          onClick={() => next && router.push(`/course/${next.chapterId}/${next.sectionId}`)}
          className={navBtn}
        >
          下一节 →
        </button>
      </div>
      <div className="relative flex-1 bg-canvas">
        {iframeError ? (
          <div className="flex h-full items-center justify-center text-accent-3">
            课程文件缺失：{current.file}
          </div>
        ) : (
          <iframe
            key={current.file}
            src={`/courses/${current.file}`}
            title={current.title}
            className="h-full w-full border-0 bg-canvas"
            onError={() => setIframeError(true)}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/features/course/components/LessonViewer.tsx
git commit -m "feat(course): 客户端 LessonViewer(iframe+上下节)"
```

---

### Task 7: 课程区 layout（登录+会员门 + 侧栏外壳）

**Files:**
- Create: `website-aicamp/src/app/course/layout.tsx`

- [ ] **Step 1: 写 layout.tsx**

服务端校验会员（非会员跳 `/membership`），读 manifest，按 `effectiveTier` 给每章算 `locked`，组装 `SidebarData` 渲染侧栏。

`website-aicamp/src/app/course/layout.tsx`：

```tsx
import { redirect } from 'next/navigation'

import { effectiveTier } from '@/features/membership/require-tier'
import { getCampAuthState } from '@/features/auth/server/session'
import { canAccessChapter } from '@/features/course/access'
import { CourseSidebar } from '@/features/course/components/CourseSidebar'
import { loadManifest } from '@/features/course/load-manifest'
import type { SidebarData } from '@/features/course/types'

// 课程页依赖登录态，强制动态渲染（与 /membership 一致）
export const dynamic = 'force-dynamic'

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  const authState = await getCampAuthState()
  const account = authState.authenticated ? authState.account : null

  // 未登录由 middleware 拦到 /login；此处兜底处理非会员（含已登录 tier=none）
  if (effectiveTier(account) === 'none') {
    redirect('/membership')
  }

  const manifest = await loadManifest()
  const sidebar: SidebarData = {
    title: manifest.title,
    chapters: manifest.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      locked: !canAccessChapter(account, ch.tier),
      // 锁定章节不下发小节
      sections: canAccessChapter(account, ch.tier)
        ? ch.sections.map((s) => ({ id: s.id, title: s.title }))
        : [],
    })),
  }

  return (
    <div className="flex h-[calc(100vh-var(--topnav-h,0px))] min-h-0 flex-1">
      <aside className="scrollbar-thin w-72 shrink-0 overflow-y-auto border-r border-hairline bg-surface/40 backdrop-blur-xl">
        <CourseSidebar data={sidebar} />
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
```

> 注：高度用 `h-[calc(100vh-var(--topnav-h,0px))]`，若 TopNav 高度未以 CSS 变量暴露，执行时改用与 TopNav 实际高度匹配的固定值（如 `h-[calc(100vh-4rem)]`）；先按 `100vh` 跑通再于 Task 12 视觉校对微调。

- [ ] **Step 2: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/app/course/layout.tsx
git commit -m "feat(course): 课程 layout(会员门+侧栏外壳)"
```

---

### Task 8: 课程首页 page（Welcome）

**Files:**
- Create: `website-aicamp/src/app/course/page.tsx`

- [ ] **Step 1: 写 page.tsx**

`website-aicamp/src/app/course/page.tsx`：

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '课程 · 微域生光',
}

export default function CourseHomePage() {
  return (
    <div className="flex h-full items-center justify-center text-muted">
      请从左侧目录选择一节课程
    </div>
  )
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/app/course/page.tsx
git commit -m "feat(course): 课程首页 Welcome"
```

---

### Task 9: 小节页 page（章级 tier 门 + LessonViewer）

**Files:**
- Create: `website-aicamp/src/app/course/[chapterId]/[sectionId]/page.tsx`

- [ ] **Step 1: 写 page.tsx**

服务端解析 params，定位章节校验 tier（不满足跳 `/membership`），用 `flattenSections`/`findAdjacent` 算相邻节，找不到当前节用 `notFound()`。

`website-aicamp/src/app/course/[chapterId]/[sectionId]/page.tsx`：

```tsx
import { notFound, redirect } from 'next/navigation'

import { getCampAuthState } from '@/features/auth/server/session'
import { canAccessChapter } from '@/features/course/access'
import { loadManifest } from '@/features/course/load-manifest'
import { findAdjacent, flattenSections } from '@/features/course/manifest'
import { LessonViewer } from '@/features/course/components/LessonViewer'
import type { AdjacentLink } from '@/features/course/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ chapterId: string; sectionId: string }>
}

export default async function LessonPage({ params }: PageProps) {
  const { chapterId, sectionId } = await params
  const manifest = await loadManifest()

  const chapter = manifest.chapters.find((c) => c.id === chapterId)
  if (!chapter) {
    notFound()
  }

  // 章级门禁：当前账号等级不满足该章 tier → 跳开通会员
  const authState = await getCampAuthState()
  const account = authState.authenticated ? authState.account : null
  if (!canAccessChapter(account, chapter.tier)) {
    redirect('/membership')
  }

  const flat = flattenSections(manifest)
  const { prev, current, next } = findAdjacent(flat, chapterId, sectionId)
  if (!current) {
    notFound()
  }

  const prevLink: AdjacentLink | null = prev ? { chapterId: prev.chapterId, sectionId: prev.id } : null
  const nextLink: AdjacentLink | null = next ? { chapterId: next.chapterId, sectionId: next.id } : null

  return (
    <LessonViewer
      current={{ id: current.id, title: current.title, file: current.file }}
      prev={prevLink}
      next={nextLink}
    />
  )
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 3: Commit**

```bash
git add "website-aicamp/src/app/course/[chapterId]/[sectionId]/page.tsx"
git commit -m "feat(course): 小节页(章级 tier 门+LessonViewer)"
```

---

### Task 10: 把 /course 加入受保护路由

**Files:**
- Modify: `website-aicamp/src/features/auth/protected-routes.ts`

- [ ] **Step 1: 修改 PROTECTED_ROUTES**

把 `website-aicamp/src/features/auth/protected-routes.ts` 中：

```ts
export const PROTECTED_ROUTES: string[] = []
```

改为：

```ts
// /course 及其子路径需登录；会员等级在 course/layout 与小节页用 requireTier 进一步校验
export const PROTECTED_ROUTES: string[] = ['/course']
```

- [ ] **Step 2: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/features/auth/protected-routes.ts
git commit -m "feat(course): /course 纳入登录受保护路由"
```

---

### Task 11: TopNav 增加课程入口

**Files:**
- Modify: `website-aicamp/src/components/layout/TopNav.tsx`

- [ ] **Step 1: 读现有 TopNav，定位导航链接区**

```bash
cd website-aicamp && cat src/components/layout/TopNav.tsx
```
找到渲染站内导航链接（如首页/会员）的区域，确认其用的元素（`<Link>`/`<a>`）与类名模式。

- [ ] **Step 2: 按现有模式加一条「课程」链接指向 `/course`**

在导航链接区域内，复用与现有同级链接**完全相同的元素与类名**，新增一条：

```tsx
<Link href="/course" className={/* 与相邻导航项相同的类名 */}>
  课程
</Link>
```

> 不引入新样式；若现有链接是数组数据驱动渲染，则往该数组加 `{ href: '/course', label: '课程' }` 一项即可。具体写法以文件内既有模式为准。

- [ ] **Step 3: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 4: Commit**

```bash
git add website-aicamp/src/components/layout/TopNav.tsx
git commit -m "feat(course): TopNav 增加课程入口"
```

---

### Task 12: 整体构建 + 运行时门禁验证

**Files:** 无（验证任务）

- [ ] **Step 1: 生产构建通过**

```bash
cd website-aicamp && pnpm build
```
Expected: 构建成功，`/course` 与 `/course/[chapterId]/[sectionId]` 出现在路由清单且标为动态（ƒ）。

- [ ] **Step 2: 启动 dev 并按验收标准逐项验证**

```bash
cd website-aicamp && pnpm dev
```
逐项确认（浏览器 / 可用 chrome-devtools）：

1. **未登录** 访问 `http://localhost:3100/course` → 302/307 跳 `/login?next=%2Fcourse`。
2. **已登录非会员**（tier=none）访问 `/course` → 跳 `/membership`。
3. **basic 会员**：`/course` 正常进入；侧栏 `01-ai-basics`/`02-engineering`（basic）可展开，小节为链接；点 `1.1` 显示 iframe 课程；上/下节按钮跨章正确、首末禁用。
4. 若存在 **premium 章**：basic 会员侧栏该章带 🔒、点击跳 `/membership`；直接访问其小节 URL 也跳 `/membership`。
5. **premium 会员**：所有章节可访问。
6. 访问不存在的 `/course/01-ai-basics/9.9` → 404（notFound）。
7. 删某节 HTML 后访问该节 → 顶部导航仍在、内容区显示「课程文件缺失：…」。

> 当前内容两章均为 basic，premium 链路（4、5）可临时在 `manifest.json` 把 `02-engineering` 改 `premium` 验证后改回；或留待有 premium 内容时验证，并在此记录「premium 链路靠代码审阅 + basic/none 实测推断」。

- [ ] **Step 3: 视觉校对侧栏/正文高度与滚动**

确认侧栏可独立滚动、正文 iframe 占满、无双滚动条；如 Task 7 高度需调整，在此微调 `layout.tsx` 高度类后重验。

- [ ] **Step 4: Commit（如有微调）**

```bash
git add -A website-aicamp/src
git commit -m "fix(course): 课程区高度/滚动微调"
```

---

### Task 13: 删除 website-course 子工程

**Files:**
- Delete: `website-course/`（整目录）

- [ ] **Step 1: 确认无残留引用**（在仓库根运行）

```bash
grep -rn "website-course" --include=*.ts --include=*.tsx --include=*.json --include=*.md --include=*.mjs . | grep -v "docs/superpowers" | grep -v "node_modules"
```
Expected: 无输出（除规格/计划文档外无代码或配置引用）。若有命中，先处理引用再删除。

- [ ] **Step 2: 删除目录**

```bash
git rm -r website-course
```
若目录未全部纳入 git 跟踪（如 `dist`/`node_modules`/日志），补充：

```bash
rm -rf website-course
```

- [ ] **Step 3: 确认主站不受影响**

```bash
cd website-aicamp && pnpm build
```
Expected: 构建成功。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(course): 删除已并入的 website-course 子工程"
```

---

## 自检结论（规格覆盖）

- 目录结构 / feature-based：Task 2–9 落到 `features/course` 与 `app/course`。✓
- 分章 manifest（顶层 + sections.json）：Task 1、3。✓
- 章级 tier + 校验：types/manifest（Task 2）、access（Task 4）、加载组装（Task 3）。✓
- 三层门禁：middleware/protected-routes（Task 10）、layout 会员门（Task 7）、小节页章级门（Task 9）。✓
- 侧栏锁标 + 默认折叠 + 当前高亮：Task 5、7。✓
- iframe + HEAD 探测 + 上下节：Task 6、9。✓
- TopNav 入口：Task 11。✓
- 零新增依赖、不迁移测试：全程仅用 `tsc`/`build`/`dev` 验证。✓
- 删除子工程：Task 13。✓
- 1000+ 扩展性：分章清单 + 默认折叠 + 服务端 cache 已在结构中落实；自动生成留作未来演进（不在本计划范围）。✓
