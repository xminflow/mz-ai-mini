# website 课程板块 + Markdown 阅读器 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `website` 新增「课程」板块：多章节左侧目录 + 渲染作者用 Typora 编写的 Markdown（对齐 Typora Night 深色主题），仅需登录可访问。

**Architecture:** 新建独立路由组 `app/(course)/`，仿 aicamp 的全屏阅读壳但渲染 Markdown。内容为 `public/courses/` 下的 `manifest.json` + 各章 `sections.json` + `.md` 静态文件，由 `features/course/` 模块读取与渲染。鉴权复用现有 middleware（把 `/course` 加入受保护路径）。

**Tech Stack:** Next.js 15 App Router、React 19、Tailwind v4、`react-markdown` + `remark-gfm`（已装）、`remark-math` + `rehype-katex`（数学公式）、`rehype-prism-plus`（代码高亮，Prism）。

## Global Constraints

- 工作目录：所有命令在 `website/`（独立 pnpm 项目，无根 `package.json`）执行，如 `cd website && pnpm <cmd>`。
- 网络代理（`pnpm add` 安装依赖时可能需要）：`HTTPS_PROXY=http://192.168.32.1:7078`。
- **测试约定（覆盖 writing-plans 的 TDD 默认）**：`website` 是前端应用，**无测试框架**（不引入），CLAUDE.md 规定前端不要求组件级测试。每个任务的「验证」用 **类型检查 / 构建 / lint / dev 浏览器观察**，而非单元测试。不得为此新增测试框架依赖。
- TypeScript：`tsconfig` `strict: false`，**布尔字面量负向收窄不可靠**，判别联合用 `'key' in obj` 守卫（本计划中鉴权交给 middleware，页面不做联合收窄）。
- 不滥用 `any`；新代码需明确类型。
- 复杂/非显然逻辑加**中文注释**，简单流程不加低价值注释。
- 主题：课程区**整体深色**，复用全站 token（`--color-canvas #050507` 等），Markdown 渲染**对齐 Typora Night**；**不**做「深壳套浅纸」的浅色卡片。
- Markdown **不启用 `rehype-raw`**（不渲染原始 HTML）。
- manifest **不含 `tier` 字段**（仅控登录，不分会员等级）。
- 新增依赖已获用户批准：`rehype-prism-plus`、`remark-math`、`rehype-katex`、`katex`。

---

## File Structure

新建：
- `website/public/courses/manifest.json` — 顶层章节清单
- `website/public/courses/01-demo/sections.json` — 示例章小节清单
- `website/public/courses/01-demo/01-welcome.md` — 示例 Markdown（占位，作者替换）
- `website/src/features/course/types.ts` — 领域类型
- `website/src/features/course/manifest.ts` — 结构校验 + 扁平化 + 相邻定位
- `website/src/features/course/load-manifest.ts` — 读 manifest（fs + cache）
- `website/src/features/course/load-section.ts` — 读单节 MD + 上/下节
- `website/src/features/course/components/CourseSidebar.tsx` — 客户端目录侧栏
- `website/src/features/course/components/CourseMarkdown.tsx` — 服务端 Markdown 渲染器
- `website/src/app/(course)/layout.tsx` — 课程壳（TopNav + 侧栏 + 内容）
- `website/src/app/(course)/course/page.tsx` — `/course` 落地页
- `website/src/app/(course)/course/[chapterId]/[sectionId]/page.tsx` — 单节页

修改：
- `website/src/components/layout/TopNav.tsx` — 加「课程」导航项
- `website/src/features/auth/protected-routes.ts` — 保护 `/course`
- `website/src/app/globals.css` — `.typora-md` 深色排版 + Prism 深色 token
- `website/package.json` — 新增依赖（由 `pnpm add` 自动写入）

---

## Task 1: 安装依赖

**Files:**
- Modify: `website/package.json`（由 `pnpm add` 写入）

**Interfaces:**
- Consumes: 无
- Produces: 运行时模块 `rehype-prism-plus`、`remark-math`、`rehype-katex`、`katex`（供 Task 4 使用）

- [ ] **Step 1: 安装四个依赖**

Run（如装包失败先设代理 `export HTTPS_PROXY=http://192.168.32.1:7078`）：
```bash
cd website && pnpm add rehype-prism-plus remark-math rehype-katex katex
```

- [ ] **Step 2: 确认 package.json 已写入**

Run:
```bash
cd website && node -e "const d=require('./package.json').dependencies; console.log(['rehype-prism-plus','remark-math','rehype-katex','katex'].map(k=>k+'='+(d[k]||'MISSING')).join('\n'))"
```
Expected: 四个均打印版本号，无 `MISSING`。

- [ ] **Step 3: 构建仍通过（尚无使用）**

Run:
```bash
cd website && pnpm build
```
Expected: 构建成功（仅新增依赖、未使用，不应报错）。

- [ ] **Step 4: Commit**

```bash
git add website/package.json website/pnpm-lock.yaml
git commit -m "build(website): 新增 Markdown 渲染依赖(prism/math/katex)"
```

---

## Task 2: 课程领域层（类型 + manifest 逻辑 + 加载 + 示例内容）

**Files:**
- Create: `website/src/features/course/types.ts`
- Create: `website/src/features/course/manifest.ts`
- Create: `website/src/features/course/load-manifest.ts`
- Create: `website/public/courses/manifest.json`
- Create: `website/public/courses/01-demo/sections.json`
- Create: `website/public/courses/01-demo/01-welcome.md`

**Interfaces:**
- Consumes: 无
- Produces:
  - 类型 `Section`、`Chapter`、`Manifest`、`FlatSection`、`SidebarSection`、`SidebarChapter`、`SidebarData`
  - `parseManifest(data: unknown): Manifest`
  - `flattenSections(m: Manifest): FlatSection[]`
  - `findAdjacent(flat: FlatSection[], chapterId: string, sectionId: string): { prev: FlatSection|null; current: FlatSection|null; next: FlatSection|null }`
  - `loadManifest(): Promise<Manifest>`

- [ ] **Step 1: 写领域类型**

Create `website/src/features/course/types.ts`:
```ts
// 课程仅控登录，不分会员等级，故不含 tier 字段
export interface Section {
  id: string
  title: string
  file: string
}

export interface Chapter {
  id: string
  title: string
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

// 传给客户端侧栏的精简数据
export interface SidebarSection {
  id: string
  title: string
}

export interface SidebarChapter {
  id: string
  title: string
  sections: SidebarSection[]
}

export interface SidebarData {
  title: string
  chapters: SidebarChapter[]
}
```

- [ ] **Step 2: 写 manifest 校验/扁平化/相邻定位**

Create `website/src/features/course/manifest.ts`:
```ts
import type { Manifest, FlatSection } from './types'

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

- [ ] **Step 3: 写 load-manifest（fs + cache）**

Create `website/src/features/course/load-manifest.ts`:
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

// 读顶层章节清单（id/title），与各章 sections.json 合并成完整 manifest。
// 单请求内多次调用（layout + page）复用同一结果，避免重复 fs 读。
export const loadManifest = cache(async (): Promise<Manifest> => {
  // 下面内联 guard 仅为"组装阶段"安全访问 c.id / s.file（拼路径要先用到它们），
  // 不是完整校验；结构合法性由末尾 parseManifest 权威校验，勿删。
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
      // file 由章内文件名拼成 <chapterId>/<file>，与 public/courses 下真实路径对齐
      const sections = sd.sections.map((sec) => {
        const s = sec as Record<string, unknown>
        if (typeof s.file !== 'string') {
          throw new Error(`${c.id}/sections.json 存在缺少 file 的小节`)
        }
        return { ...s, file: `${c.id}/${s.file}` }
      })
      return { ...c, title: c.title, sections }
    }),
  )

  return parseManifest({ title: topRecord.title, chapters })
})
```

- [ ] **Step 4: 写示例内容（manifest + sections + md）**

Create `website/public/courses/manifest.json`:
```json
{
  "title": "课程",
  "chapters": [
    { "id": "01-demo", "title": "示例章节" }
  ]
}
```

Create `website/public/courses/01-demo/sections.json`:
```json
{
  "sections": [
    { "id": "01-welcome", "title": "欢迎与渲染自检", "file": "01-welcome.md" }
  ]
}
```

Create `website/public/courses/01-demo/01-welcome.md`（覆盖标题/列表/任务列表/表格/引用/行内+围栏代码/数学公式，供渲染自检；作者后续替换为真实内容）:
````markdown
# 欢迎来到课程

这是一个**示例小节**，用来自检 Markdown 渲染是否对齐 Typora Night。作者可直接用 Typora（Night 主题）编辑本文件后替换。

## 文本与列表

正文支持 *斜体*、**加粗**、`行内代码` 与 [链接](https://example.com)。

- 无序列表项一
- 无序列表项二
  - 嵌套项

1. 有序列表项一
2. 有序列表项二

## 任务列表

- [x] 已完成项
- [ ] 待办项

## 引用

> 这是一段引用，用于检查左竖线与次级字色。

## 表格

| 名称 | 说明 |
| --- | --- |
| 字段 A | 描述 A |
| 字段 B | 描述 B |

## 代码块（语法高亮）

```ts
function greet(name: string): string {
  // 检查 Prism 深色高亮
  return `Hello, ${name}`
}
```

## 数学公式（KaTeX）

行内公式 $E = mc^2$，独立公式：

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$
````

- [ ] **Step 5: 类型检查通过**

Run:
```bash
cd website && pnpm exec tsc --noEmit
```
Expected: 无错误（领域层类型自洽）。

- [ ] **Step 6: Commit**

```bash
git add website/src/features/course/types.ts website/src/features/course/manifest.ts website/src/features/course/load-manifest.ts website/public/courses
git commit -m "feat(website): 课程领域层(类型/manifest/加载)与示例内容"
```

---

## Task 3: 单节加载 + 目录侧栏组件

**Files:**
- Create: `website/src/features/course/load-section.ts`
- Create: `website/src/features/course/components/CourseSidebar.tsx`

**Interfaces:**
- Consumes: `loadManifest`、`flattenSections`、`findAdjacent`、类型 `FlatSection`/`SidebarData`
- Produces:
  - `loadSection(chapterId: string, sectionId: string): Promise<{ current: FlatSection; content: string; prev: FlatSection|null; next: FlatSection|null }>`（不存在则 `notFound()`）
  - `loadSidebar(): Promise<SidebarData>`
  - 组件 `CourseSidebar({ data }: { data: SidebarData })`

- [ ] **Step 1: 写 load-section + load-sidebar**

Create `website/src/features/course/load-section.ts`:
```ts
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { notFound } from 'next/navigation'

import { loadManifest } from './load-manifest'
import { flattenSections, findAdjacent } from './manifest'
import type { FlatSection, SidebarData } from './types'

const COURSES_DIR = path.join(process.cwd(), 'public', 'courses')

export interface SectionPayload {
  current: FlatSection
  content: string
  prev: FlatSection | null
  next: FlatSection | null
}

// 读取单节：先在 manifest（受信来源）中定位 current，再用其 file 字段读取 MD。
// chapterId/sectionId 仅用于查表，不直接拼进文件路径，避免路径穿越。
export async function loadSection(
  chapterId: string,
  sectionId: string,
): Promise<SectionPayload> {
  const manifest = await loadManifest()
  const flat = flattenSections(manifest)
  const { prev, current, next } = findAdjacent(flat, chapterId, sectionId)
  if (!current) {
    notFound()
  }
  const abs = path.join(COURSES_DIR, current.file)
  let content: string
  try {
    content = await readFile(abs, 'utf-8')
  } catch {
    // manifest 声明了该节但磁盘缺文件：按 404 处理，不静默兜底为空白
    notFound()
  }
  return { current, content, prev, next }
}

// 侧栏数据：章节 + 小节（id/title），不下发文件路径
export async function loadSidebar(): Promise<SidebarData> {
  const manifest = await loadManifest()
  return {
    title: manifest.title,
    chapters: manifest.chapters.map((ch) => ({
      id: ch.id,
      title: ch.title,
      sections: ch.sections.map((s) => ({ id: s.id, title: s.title })),
    })),
  }
}
```

- [ ] **Step 2: 写 CourseSidebar（客户端，移植 aicamp 并去掉锁定逻辑）**

Create `website/src/features/course/components/CourseSidebar.tsx`:
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

// 折角箭头：展开时旋转 90°
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-3 w-3 shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4.5 3 8 6 4.5 9" />
    </svg>
  )
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
    <nav className="px-3 py-5">
      <div className="text-gradient px-2 pb-5 text-[15px] font-semibold tracking-tight">
        {data.title}
      </div>

      <div className="space-y-0.5">
        {data.chapters.map((ch) => {
          const isOpen = !(collapsed.has(ch.id) && ch.id !== currentChapterId)
          return (
            <div key={ch.id}>
              <button
                type="button"
                onClick={() => toggle(ch.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                <Chevron open={isOpen} />
                <span className="truncate">{ch.title}</span>
              </button>

              {isOpen && (
                // 单条引导线 + 当前小节用实心圆点标在线上
                <ul className="mb-1.5 ml-[15px] mt-0.5 border-l border-hairline">
                  {ch.sections.map((s) => {
                    const href = `/course/${ch.id}/${s.id}`
                    const isActive = sectionPath === href
                    return (
                      <li key={s.id} className="relative">
                        <span
                          className={`absolute -left-[3px] top-1/2 h-[6px] w-[6px] -translate-y-1/2 rounded-full ring-2 ring-canvas transition-colors ${
                            isActive ? 'bg-accent' : 'bg-transparent ring-0'
                          }`}
                          aria-hidden="true"
                        />
                        <Link
                          href={href}
                          aria-current={isActive ? 'page' : undefined}
                          className={`block py-[7px] pl-5 pr-2 text-[13px] leading-snug transition-colors ${
                            isActive ? 'font-medium text-accent' : 'text-muted hover:text-ink-soft'
                          }`}
                        >
                          {s.title}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: 类型检查通过**

Run:
```bash
cd website && pnpm exec tsc --noEmit
```
Expected: 无错误。

- [ ] **Step 4: Commit**

```bash
git add website/src/features/course/load-section.ts website/src/features/course/components/CourseSidebar.tsx
git commit -m "feat(website): 课程单节加载与目录侧栏组件"
```

---

## Task 4: Markdown 渲染器 + Typora Night 深色样式

**Files:**
- Create: `website/src/features/course/components/CourseMarkdown.tsx`
- Modify: `website/src/app/globals.css`（追加 `.typora-md` + Prism 深色 token，文件末尾）

**Interfaces:**
- Consumes: `react-markdown`、`remark-gfm`、`remark-math`、`rehype-katex`、`rehype-prism-plus`
- Produces: 组件 `CourseMarkdown({ source }: { source: string })`（服务端组件，输出 `<article class="typora-md">…</article>`）

- [ ] **Step 1: 写 CourseMarkdown（服务端组件，无 'use client'）**

Create `website/src/features/course/components/CourseMarkdown.tsx`:
```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypePrism from 'rehype-prism-plus'

interface Props {
  source: string
}

// 课程 Markdown 渲染：GFM(表格/任务列表/删除线) + 数学公式(KaTeX) + 代码高亮(Prism)。
// 不启用 rehype-raw：默认不渲染原始 HTML，避免不必要的 XSS 面。
export function CourseMarkdown({ source }: Props) {
  return (
    <article className="typora-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, [rehypePrism, { ignoreMissing: true }]]}
      >
        {source}
      </ReactMarkdown>
    </article>
  )
}
```

- [ ] **Step 2: 追加 Typora Night 深色排版 + Prism token 到 globals.css**

在 `website/src/app/globals.css` **文件末尾**追加：
```css
/* ===== 课程 Markdown：对齐 Typora Night（深色），复用全站 token，不另起浅色卡片 ===== */
.typora-md {
  max-width: 800px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 6rem;
  color: var(--color-ink-soft);
  font-size: 16px;
  line-height: 1.75;
  word-wrap: break-word;
}

.typora-md h1,
.typora-md h2,
.typora-md h3,
.typora-md h4,
.typora-md h5,
.typora-md h6 {
  color: var(--color-ink);
  font-weight: 600;
  line-height: 1.3;
  margin: 1.8em 0 0.9em;
}
.typora-md h1 { font-size: 2em; margin-top: 0; padding-bottom: 0.3em; border-bottom: 1px solid var(--color-hairline); }
.typora-md h2 { font-size: 1.6em; padding-bottom: 0.25em; border-bottom: 1px solid var(--color-hairline); }
.typora-md h3 { font-size: 1.3em; }
.typora-md h4 { font-size: 1.1em; }
.typora-md h5 { font-size: 1em; }
.typora-md h6 { font-size: 0.95em; color: var(--color-muted); }

.typora-md p { margin: 0 0 1.1em; }
.typora-md a { color: var(--color-accent); text-decoration: none; }
.typora-md a:hover { text-decoration: underline; }
.typora-md strong { color: var(--color-ink); font-weight: 600; }
.typora-md hr { border: none; border-top: 1px solid var(--color-hairline); margin: 2em 0; }

.typora-md ul,
.typora-md ol { margin: 0 0 1.1em; padding-left: 1.6em; }
.typora-md li { margin: 0.3em 0; }
.typora-md li > ul,
.typora-md li > ol { margin: 0.3em 0; }
/* GFM 任务列表：去掉项目符号，勾选框左对齐 */
.typora-md li.task-list-item { list-style: none; margin-left: -1.4em; }
.typora-md li.task-list-item input { margin-right: 0.5em; }

.typora-md blockquote {
  margin: 0 0 1.1em;
  padding: 0.2em 1em;
  border-left: 3px solid var(--color-hairline-strong);
  color: var(--color-muted);
}
.typora-md blockquote p:last-child { margin-bottom: 0; }

/* 行内代码 */
.typora-md code {
  font-family: var(--font-mono);
  font-size: 0.88em;
  background: var(--color-surface-2);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}
/* 围栏代码块：深底 + 细描边 + 横向滚动；清掉行内 code 的内边距/底色 */
.typora-md pre {
  margin: 0 0 1.2em;
  padding: 1em 1.1em;
  background: var(--color-surface);
  border: 1px solid var(--color-hairline);
  border-radius: 8px;
  overflow-x: auto;
  line-height: 1.6;
}
.typora-md pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: 0.875em;
  color: var(--color-ink-soft);
}

.typora-md table {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 1.2em;
  font-size: 0.95em;
}
.typora-md th,
.typora-md td {
  border: 1px solid var(--color-hairline);
  padding: 0.5em 0.8em;
  text-align: left;
}
.typora-md th { background: var(--color-surface); color: var(--color-ink); font-weight: 600; }

.typora-md img { max-width: 100%; height: auto; border-radius: 6px; }

/* KaTeX 块级公式横向可滚动，避免长公式溢出 */
.typora-md .katex-display { overflow-x: auto; overflow-y: hidden; padding: 0.4em 0; }

/* ----- Prism 深色 token（One Dark 风，对齐 Typora Night 代码观感）----- */
.typora-md .token.comment,
.typora-md .token.prolog,
.typora-md .token.doctype,
.typora-md .token.cdata { color: #7f848e; font-style: italic; }
.typora-md .token.punctuation { color: #abb2bf; }
.typora-md .token.property,
.typora-md .token.tag,
.typora-md .token.boolean,
.typora-md .token.number,
.typora-md .token.constant,
.typora-md .token.symbol,
.typora-md .token.deleted { color: #d19a66; }
.typora-md .token.selector,
.typora-md .token.attr-name,
.typora-md .token.string,
.typora-md .token.char,
.typora-md .token.builtin,
.typora-md .token.inserted { color: #98c379; }
.typora-md .token.operator,
.typora-md .token.entity,
.typora-md .token.url { color: #56b6c2; }
.typora-md .token.atrule,
.typora-md .token.attr-value,
.typora-md .token.keyword { color: #c678dd; }
.typora-md .token.function,
.typora-md .token.class-name { color: #61afef; }
.typora-md .token.regex,
.typora-md .token.important,
.typora-md .token.variable { color: #e06c75; }
```

- [ ] **Step 3: 类型检查通过**

Run:
```bash
cd website && pnpm exec tsc --noEmit
```
Expected: 无错误（若 `rehype-prism-plus` 无内置类型导致报错，按下方备注处理后重跑通过）。

> 备注：若 `tsc` 报 `rehype-prism-plus` 找不到类型声明，在 `website/src/global.d.ts` 追加：
> ```ts
> declare module 'rehype-prism-plus'
> ```
> 并在本任务的 commit 中一并加入该文件。

- [ ] **Step 4: Commit**

```bash
git add website/src/features/course/components/CourseMarkdown.tsx website/src/app/globals.css
git commit -m "feat(website): Markdown 渲染器与 Typora Night 深色样式"
```

---

## Task 5: 路由组（壳 + 落地页 + 单节页）

**Files:**
- Create: `website/src/app/(course)/layout.tsx`
- Create: `website/src/app/(course)/course/page.tsx`
- Create: `website/src/app/(course)/course/[chapterId]/[sectionId]/page.tsx`

**Interfaces:**
- Consumes: `getWebsiteAuthState`、`TopNav`、`loadSidebar`、`loadSection`、`CourseSidebar`、`CourseMarkdown`、`katex/dist/katex.min.css`
- Produces: 路由 `/course`、`/course/<chapterId>/<sectionId>`

- [ ] **Step 1: 写课程壳 layout（TopNav + 侧栏 + 内容，全屏高度，导入 KaTeX CSS）**

Create `website/src/app/(course)/layout.tsx`:
```tsx
import 'katex/dist/katex.min.css'

import { TopNav } from '@/components/layout/TopNav'
import { getWebsiteAuthState } from '@/features/auth/server/session'
import { CourseSidebar } from '@/features/course/components/CourseSidebar'
import { loadSidebar } from '@/features/course/load-section'

// 课程页依赖登录态，强制动态渲染
export const dynamic = 'force-dynamic'

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  const authState = await getWebsiteAuthState()
  const sidebar = await loadSidebar()

  // 顶栏 sticky 高度 h-14/sm:h-16，课程区占满其下视口，侧栏与正文各自独立滚动
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav initialAuthState={authState} />
      <div className="flex h-[calc(100vh-3.5rem)] min-h-0 sm:h-[calc(100vh-4rem)]">
        <aside className="scrollbar-thin w-72 shrink-0 overflow-y-auto border-r border-hairline bg-canvas">
          <CourseSidebar data={sidebar} />
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto bg-canvas">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 写落地页**

Create `website/src/app/(course)/course/page.tsx`:
```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '课程',
}

export default function CourseHomePage() {
  return (
    <div className="flex h-full items-center justify-center text-muted">
      请从左侧目录选择一节课程
    </div>
  )
}
```

- [ ] **Step 3: 写单节页（渲染 MD + 上/下一节导航 + 动态标题）**

Create `website/src/app/(course)/course/[chapterId]/[sectionId]/page.tsx`:
```tsx
import type { Metadata } from 'next'
import Link from 'next/link'

import { CourseMarkdown } from '@/features/course/components/CourseMarkdown'
import { loadSection } from '@/features/course/load-section'

interface Params {
  params: Promise<{ chapterId: string; sectionId: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { chapterId, sectionId } = await params
  const { current } = await loadSection(chapterId, sectionId)
  return { title: current.title }
}

export default async function SectionPage({ params }: Params) {
  const { chapterId, sectionId } = await params
  const { content, prev, next } = await loadSection(chapterId, sectionId)

  return (
    <div className="mx-auto max-w-[800px] px-6">
      <CourseMarkdown source={content} />
      <nav className="mb-16 grid gap-3 border-t border-hairline pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/course/${prev.chapterId}/${prev.id}`}
            className="rounded-lg border border-hairline bg-surface px-4 py-3 transition-colors hover:border-hairline-strong"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">上一节</div>
            <div className="mt-1 text-[14px] text-ink-soft">← {prev.title}</div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/course/${next.chapterId}/${next.id}`}
            className="rounded-lg border border-hairline bg-surface px-4 py-3 text-right transition-colors hover:border-hairline-strong"
          >
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted">下一节</div>
            <div className="mt-1 text-[14px] text-ink-soft">{next.title} →</div>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  )
}
```

> 注：`CourseMarkdown` 内已有 `max-w-[800px] mx-auto`；外层 `max-w-[800px]` 仅用于约束底部上/下节导航与正文同宽，二者不冲突。

- [ ] **Step 4: 构建通过**

Run:
```bash
cd website && pnpm build
```
Expected: 构建成功，输出包含 `/course` 与 `/course/[chapterId]/[sectionId]` 路由。

- [ ] **Step 5: Commit**

```bash
git add "website/src/app/(course)"
git commit -m "feat(website): 课程路由组(壳/落地页/单节页)"
```

---

## Task 6: 导航入口 + 鉴权保护 + 端到端验证

**Files:**
- Modify: `website/src/components/layout/TopNav.tsx:24-27`（`NAV_LINKS` 数组）
- Modify: `website/src/features/auth/protected-routes.ts:3-10`（`isProtectedPath`）

**Interfaces:**
- Consumes: 前序所有任务的路由
- Produces: 顶部「课程」入口；`/course*` 登录保护

- [ ] **Step 1: 在 NAV_LINKS 加「课程」（训练营与产品之间）**

Modify `website/src/components/layout/TopNav.tsx`，将：
```ts
const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'AI架构师训练营', exact: true },
  { href: '/product', label: '产品', matchPrefix: '/product' },
]
```
改为：
```ts
const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'AI架构师训练营', exact: true },
  { href: '/course', label: '课程', matchPrefix: '/course' },
  { href: '/product', label: '产品', matchPrefix: '/product' },
]
```

- [ ] **Step 2: 保护 /course 路径**

Modify `website/src/features/auth/protected-routes.ts`，将 `isProtectedPath` 改为：
```ts
export const PROTECTED_ROUTES: string[] = ['/account']

export function isProtectedPath(pathname: string): boolean {
  // 章节子页（/playbook/xxx）需要登录；主目录页 /playbook 本身保持公开
  if (pathname.startsWith('/playbook/')) return true
  // 课程板块（含落地页）需要登录
  if (pathname === '/course' || pathname.startsWith('/course/')) return true
  return PROTECTED_ROUTES.some((route) => {
    if (route === '/') return pathname === '/'
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}
```

- [ ] **Step 3: 构建 + lint 通过**

Run:
```bash
cd website && pnpm build && pnpm lint
```
Expected: 均通过。

- [ ] **Step 4: dev 浏览器端到端验证**

Run:
```bash
cd website && pnpm dev
```
在浏览器（建议用 chrome-devtools）依次验证，并确认控制台无报错：
1. 顶部导航出现「课程」，位于「训练营」与「产品」之间。
2. **未登录**访问 `http://localhost:3000/course` → 307 跳转到 `/login?next=%2Fcourse`。
3. 登录后访问 `/course` → 显示「请从左侧目录选择一节课程」；左侧目录显示「示例章节 / 欢迎与渲染自检」。
4. 点击「欢迎与渲染自检」→ URL 变 `/course/01-demo/01-welcome`，正文渲染：
   - 标题层级 + h1/h2 底部细线；引用块左竖线；表格边框 + 表头底色；任务列表勾选框。
   - 代码块**深色语法高亮**（关键字/字符串/函数等不同颜色）。
   - 行内公式 $E=mc^2$ 与独立积分公式由 **KaTeX 正确排版**。
   - 整体为**深底浅字**，与 Typora Night 观感一致；无浅色卡片。
5. 底部「上一节/下一节」：本示例仅一节，两侧均无链接（占位空白），不报错。
6. 访问不存在的 `/course/01-demo/不存在` → 返回 404 页。

- [ ] **Step 5: Commit**

```bash
git add website/src/components/layout/TopNav.tsx website/src/features/auth/protected-routes.ts
git commit -m "feat(website): 顶部课程入口与 /course 登录保护"
```

---

## Self-Review（已核对）

- **Spec 覆盖**：导航入口(Task6) / 登录保护(Task6) / 落地页(Task5) / 单节渲染(Task5) / Typora Night 样式(Task4) / 代码高亮+公式(Task1 装依赖,Task4 接入) / manifest+示例内容(Task2) / 404(Task3 load-section) / 上下节(Task3+Task5) / 构建+lint+浏览器验证(Task1/5/6) 均有任务承载。
- **类型一致**：`loadSection` 返回 `{ current, content, prev, next }`，Task5 解构使用一致；`FlatSection` 含 `chapterId`/`id`/`title`，导航链接拼接一致；`SidebarData`/`SidebarChapter`/`SidebarSection` 在 Task2 定义、Task3 组件与 `loadSidebar` 使用一致。
- **占位扫描**：无 TBD/TODO；每个代码步给出完整代码。
- **YAGNI**：不做右侧 TOC、不做 tier、不做 frontmatter 解析、不做 `/course` 自动跳第一节。
