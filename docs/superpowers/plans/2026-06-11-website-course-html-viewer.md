# website-course 课程 HTML 展示工程 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新建独立 Vite 子工程 `website-course`，以「侧边目录 + 右侧 iframe」展示按章节/小节两层级组织的完整 HTML 课程文档。

**Architecture:** 课程是自带样式脚本的完整 HTML 文档，放在 `public/courses/` 静态托管，通过 iframe 加载，与 React 壳工程完全隔离。一个手动维护的 `manifest.json` 描述两层级结构；壳工程加载并校验它，扁平化成跨章节顺序用于上/下一节导航。React + react-router 提供目录导航与独立 URL。

**Tech Stack:** Vite, React 19, TypeScript, react-router v7, Tailwind CSS v4（`@tailwindcss/vite`），vitest（仅用于纯逻辑单测），pnpm。

> **测试策略（遵循仓库 CLAUDE.md）：** 前端不要求组件级测试。纯逻辑（manifest 解析 / 扁平化 / 上下节）用 vitest 做 TDD；UI 组件通过运行应用验证。

---

### Task 1: 脚手架与可运行的空工程

**Files:**
- Create: `website-course/package.json`
- Create: `website-course/vite.config.ts`
- Create: `website-course/tsconfig.json`
- Create: `website-course/tsconfig.node.json`
- Create: `website-course/index.html`
- Create: `website-course/src/main.tsx`
- Create: `website-course/src/App.tsx`
- Create: `website-course/.gitignore`

- [ ] **Step 1: 创建 package.json**

`website-course/package.json`:
```json
{
  "name": "website-course",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 5180",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 5180",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.1.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.2",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.2.2",
    "typescript": "~5.7.2",
    "vite": "^6.0.7",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: 创建 TS 与 Vite 配置**

`website-course/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`website-course/tsconfig.node.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

`website-course/vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

- [ ] **Step 3: 创建入口 HTML 与 React 根**

`website-course/index.html`:
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>课程目录</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`website-course/src/main.tsx`:
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`website-course/src/App.tsx`（占位，后续任务替换）:
```tsx
export default function App() {
  return <div>website-course 占位首页</div>
}
```

- [ ] **Step 4: 创建 .gitignore**

`website-course/.gitignore`:
```
node_modules
dist
*.log
```

- [ ] **Step 5: 安装依赖并启动验证**

Run:
```bash
cd website-course && pnpm install && pnpm dev
```
Expected: Vite 在 `http://localhost:5180` 启动，浏览器显示「website-course 占位首页」。确认后 Ctrl+C 停止。

- [ ] **Step 6: 提交**

```bash
git add website-course
git commit -m "feat(website-course): scaffold vite+react+ts 工程"
```

---

### Task 2: Tailwind CSS v4 接入

**Files:**
- Create: `website-course/src/index.css`
- Modify: `website-course/src/main.tsx`

- [ ] **Step 1: 创建全局样式入口**

`website-course/src/index.css`:
```css
@import "tailwindcss";
```

- [ ] **Step 2: 在入口引入样式**

`website-course/src/main.tsx` 顶部新增一行（在 import App 之前）:
```tsx
import './index.css'
```

- [ ] **Step 3: 用 Tailwind class 验证生效**

将 `website-course/src/App.tsx` 临时改为:
```tsx
export default function App() {
  return <div className="p-6 text-2xl font-bold text-blue-600">Tailwind 已生效</div>
}
```

- [ ] **Step 4: 运行验证**

Run: `cd website-course && pnpm dev`
Expected: 页面显示蓝色、加粗、带内边距的「Tailwind 已生效」。确认后停止。

- [ ] **Step 5: 提交**

```bash
git add website-course/src/index.css website-course/src/main.tsx website-course/src/App.tsx
git commit -m "feat(website-course): 接入 Tailwind CSS v4"
```

---

### Task 3: 示例课程文档与 manifest

**Files:**
- Create: `website-course/public/courses/manifest.json`
- Create: `website-course/public/courses/01-ai-basics/01-tools.html`
- Create: `website-course/public/courses/01-ai-basics/02-domestic.html`
- Create: `website-course/public/courses/02-engineering/01-theme.html`

- [ ] **Step 1: 创建 manifest.json**

`website-course/public/courses/manifest.json`:
```json
{
  "title": "AI 编程课程",
  "chapters": [
    {
      "id": "01-ai-basics",
      "title": "课时 1　AI 基础工具学习",
      "sections": [
        { "id": "1.1", "title": "用好最强 AI 编程工具", "file": "01-ai-basics/01-tools.html" },
        { "id": "1.2", "title": "国内 AI 编程工具", "file": "01-ai-basics/02-domestic.html" }
      ]
    },
    {
      "id": "02-engineering",
      "title": "课时 2　AI 应用工程化",
      "sections": [
        { "id": "2.1", "title": "设计应用的主题效果", "file": "02-engineering/01-theme.html" }
      ]
    }
  ]
}
```

- [ ] **Step 2: 创建 3 个完整独立的示例 HTML 文档**

`website-course/public/courses/01-ai-basics/01-tools.html`:
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>1.1 用好最强 AI 编程工具</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; line-height: 1.7; color: #1a1a1a; }
      h1 { color: #2563eb; }
    </style>
  </head>
  <body>
    <h1>1.1 用好最强 AI 编程工具</h1>
    <p>这是小节 1.1 的示例内容：Codex、Claude Code 的基本使用。</p>
  </body>
</html>
```

`website-course/public/courses/01-ai-basics/02-domestic.html`:
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>1.2 国内 AI 编程工具</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; line-height: 1.7; color: #1a1a1a; }
      h1 { color: #16a34a; }
    </style>
  </head>
  <body>
    <h1>1.2 国内 AI 编程工具</h1>
    <p>这是小节 1.2 的示例内容：kimi、qoder 的上手。</p>
  </body>
</html>
```

`website-course/public/courses/02-engineering/01-theme.html`:
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>2.1 设计应用的主题效果</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; line-height: 1.7; color: #1a1a1a; }
      h1 { color: #db2777; }
    </style>
  </head>
  <body>
    <h1>2.1 设计应用的主题效果</h1>
    <p>这是小节 2.1 的示例内容：统一视觉风格。</p>
  </body>
</html>
```

- [ ] **Step 3: 提交**

```bash
git add website-course/public/courses
git commit -m "feat(website-course): 示例课程 HTML 与 manifest"
```

---

### Task 4: 类型与 manifest 解析/扁平化逻辑（TDD）

**Files:**
- Create: `website-course/src/types.ts`
- Create: `website-course/src/lib/manifest.ts`
- Test: `website-course/src/lib/manifest.test.ts`

- [ ] **Step 1: 定义类型**

`website-course/src/types.ts`:
```ts
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
```

- [ ] **Step 2: 写失败测试**

`website-course/src/lib/manifest.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { parseManifest, flattenSections, findAdjacent } from './manifest'

const valid = {
  title: '课程',
  chapters: [
    { id: 'c1', title: '章1', sections: [
      { id: '1.1', title: 's11', file: 'c1/1.html' },
      { id: '1.2', title: 's12', file: 'c1/2.html' },
    ] },
    { id: 'c2', title: '章2', sections: [
      { id: '2.1', title: 's21', file: 'c2/1.html' },
    ] },
  ],
}

describe('parseManifest', () => {
  it('接受合法结构', () => {
    expect(parseManifest(valid).chapters.length).toBe(2)
  })
  it('结构非法时抛错', () => {
    expect(() => parseManifest({ title: 'x' })).toThrow()
    expect(() => parseManifest({ title: 'x', chapters: [{ id: 'c', title: 't' }] })).toThrow()
    expect(() => parseManifest(null)).toThrow()
  })
})

describe('flattenSections', () => {
  it('按章节顺序扁平化，并带上 chapterId', () => {
    const flat = flattenSections(parseManifest(valid))
    expect(flat.map((s) => s.id)).toEqual(['1.1', '1.2', '2.1'])
    expect(flat[2].chapterId).toBe('c2')
  })
})

describe('findAdjacent', () => {
  const flat = flattenSections(parseManifest(valid))
  it('首项无上一节', () => {
    const r = findAdjacent(flat, 'c1', '1.1')
    expect(r.prev).toBeNull()
    expect(r.next?.id).toBe('1.2')
    expect(r.current?.id).toBe('1.1')
  })
  it('中间项前后都有', () => {
    const r = findAdjacent(flat, 'c1', '1.2')
    expect(r.prev?.id).toBe('1.1')
    expect(r.next?.id).toBe('2.1')
  })
  it('末项无下一节', () => {
    const r = findAdjacent(flat, 'c2', '2.1')
    expect(r.prev?.id).toBe('1.2')
    expect(r.next).toBeNull()
  })
  it('未找到时 current 为 null', () => {
    const r = findAdjacent(flat, 'c9', '9.9')
    expect(r.current).toBeNull()
  })
})
```

- [ ] **Step 3: 运行测试确认失败**

Run: `cd website-course && pnpm test`
Expected: FAIL，提示 `parseManifest`/`flattenSections`/`findAdjacent` 未定义或模块不存在。

- [ ] **Step 4: 实现 manifest.ts**

`website-course/src/lib/manifest.ts`:
```ts
import type { Manifest, FlatSection } from '../types'

// 严格校验 manifest 结构，非法时抛出明确错误，禁止静默兜底
export function parseManifest(data: unknown): Manifest {
  if (!data || typeof data !== 'object') {
    throw new Error('manifest 必须是对象')
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
    if (typeof c.id !== 'string' || typeof c.title !== 'string' || !Array.isArray(c.sections)) {
      throw new Error(`chapters[${ci}] 缺少 id/title/sections`)
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

// 运行时加载并校验 manifest；网络或格式错误向上抛出
export async function loadManifest(): Promise<Manifest> {
  const res = await fetch('/courses/manifest.json')
  if (!res.ok) {
    throw new Error(`加载 manifest 失败：HTTP ${res.status}`)
  }
  const json = (await res.json()) as unknown
  return parseManifest(json)
}
```

- [ ] **Step 5: 运行测试确认通过**

Run: `cd website-course && pnpm test`
Expected: PASS，全部用例通过。

- [ ] **Step 6: 提交**

```bash
git add website-course/src/types.ts website-course/src/lib/manifest.ts website-course/src/lib/manifest.test.ts
git commit -m "feat(website-course): manifest 解析/扁平化/上下节逻辑(含单测)"
```

---

### Task 5: manifest 加载 Hook 与路由骨架

**Files:**
- Create: `website-course/src/lib/useManifest.ts`
- Modify: `website-course/src/App.tsx`
- Create: `website-course/src/components/Layout.tsx`
- Create: `website-course/src/components/Welcome.tsx`

- [ ] **Step 1: 创建 manifest 加载 Hook**

`website-course/src/lib/useManifest.ts`:
```ts
import { useEffect, useState } from 'react'
import type { Manifest } from '../types'
import { loadManifest } from './manifest'

interface State {
  manifest: Manifest | null
  error: string | null
  loading: boolean
}

// 应用级一次性加载 manifest，暴露 loading/error/数据三态
export function useManifest(): State {
  const [state, setState] = useState<State>({ manifest: null, error: null, loading: true })
  useEffect(() => {
    let alive = true
    loadManifest()
      .then((m) => alive && setState({ manifest: m, error: null, loading: false }))
      .catch((e: unknown) => {
        const msg = e instanceof Error ? e.message : String(e)
        if (alive) setState({ manifest: null, error: msg, loading: false })
      })
    return () => {
      alive = false
    }
  }, [])
  return state
}
```

- [ ] **Step 2: 创建欢迎页占位**

`website-course/src/components/Welcome.tsx`:
```tsx
export default function Welcome() {
  return (
    <div className="flex h-full items-center justify-center text-gray-400">
      请从左侧目录选择一节课程
    </div>
  )
}
```

- [ ] **Step 3: 创建布局组件（含 loading/error 处理）**

`website-course/src/components/Layout.tsx`:
```tsx
import { Outlet } from 'react-router-dom'
import { useManifest } from '../lib/useManifest'

export default function Layout() {
  const { manifest, error, loading } = useManifest()

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">加载目录中…</div>
  }
  if (error || !manifest) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 text-red-600">
        <p className="font-semibold">目录加载失败</p>
        <p className="text-sm text-red-500">{error ?? 'manifest 为空'}</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar 在 Task 6 接入，这里先占位以验证布局 */}
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50">
        <div className="p-4 font-semibold">{manifest.title}</div>
      </aside>
      <main className="flex-1 overflow-hidden">
        <Outlet context={manifest} />
      </main>
    </div>
  )
}
```

- [ ] **Step 4: 配置路由**

`website-course/src/App.tsx`（整体替换）:
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Welcome from './components/Welcome'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Welcome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 5: 运行验证**

Run: `cd website-course && pnpm dev`
Expected: 左侧灰色栏显示 manifest 标题「AI 编程课程」，右侧显示「请从左侧目录选择一节课程」。若把 manifest.json 改坏（临时删一个引号）刷新应显示「目录加载失败」+ 原因，验证后改回。

- [ ] **Step 6: 提交**

```bash
git add website-course/src/lib/useManifest.ts website-course/src/App.tsx website-course/src/components/Layout.tsx website-course/src/components/Welcome.tsx
git commit -m "feat(website-course): manifest 加载 hook 与路由骨架"
```

---

### Task 6: 侧边目录（章节折叠/展开 + 小节导航）

**Files:**
- Create: `website-course/src/components/Sidebar.tsx`
- Modify: `website-course/src/components/Layout.tsx`

- [ ] **Step 1: 实现 Sidebar**

`website-course/src/components/Sidebar.tsx`:
```tsx
import { useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import type { Manifest } from '../types'

interface Props {
  manifest: Manifest
}

// 侧边目录：章节可折叠/展开，小节为路由链接；默认展开当前小节所在章节
export default function Sidebar({ manifest }: Props) {
  const { chapterId } = useParams()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <nav className="p-2">
      <div className="px-2 py-3 text-lg font-semibold text-gray-800">{manifest.title}</div>
      {manifest.chapters.map((ch) => {
        const isCollapsed = collapsed.has(ch.id) && ch.id !== chapterId
        return (
          <div key={ch.id} className="mb-1">
            <button
              type="button"
              onClick={() => toggle(ch.id)}
              className="flex w-full items-center gap-1 rounded px-2 py-1.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <span className="inline-block w-4 text-gray-400">{isCollapsed ? '▶' : '▼'}</span>
              {ch.title}
            </button>
            {!isCollapsed && (
              <ul className="ml-5 border-l border-gray-200">
                {ch.sections.map((s) => (
                  <li key={s.id}>
                    <NavLink
                      to={`/c/${ch.id}/s/${s.id}`}
                      className={({ isActive }) =>
                        `block rounded px-3 py-1.5 text-sm ${
                          isActive ? 'bg-blue-100 font-medium text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                        }`
                      }
                    >
                      {s.id} {s.title}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: 在 Layout 中接入 Sidebar**

`website-course/src/components/Layout.tsx` 中把占位 `<aside>...</aside>` 整体替换为:
```tsx
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50">
        <Sidebar manifest={manifest} />
      </aside>
```
并在文件顶部新增导入:
```tsx
import Sidebar from './Sidebar'
```

- [ ] **Step 3: 运行验证**

Run: `cd website-course && pnpm dev`
Expected: 左侧显示 2 个章节、各自小节；点击章节标题可折叠/展开；点击小节 URL 变为 `/c/01-ai-basics/s/1.1`（右侧暂为欢迎页，下一任务接入 iframe）。

- [ ] **Step 4: 提交**

```bash
git add website-course/src/components/Sidebar.tsx website-course/src/components/Layout.tsx
git commit -m "feat(website-course): 侧边目录(章节折叠/展开)"
```

---

### Task 7: 课程展示（iframe + 上/下一节导航）

**Files:**
- Create: `website-course/src/components/LessonViewer.tsx`
- Modify: `website-course/src/App.tsx`

- [ ] **Step 1: 实现 LessonViewer**

`website-course/src/components/LessonViewer.tsx`:
```tsx
import { useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import type { Manifest } from '../types'
import { flattenSections, findAdjacent } from '../lib/manifest'

// 右侧课程展示：顶部上/下一节导航条 + iframe 加载完整 HTML 文档
export default function LessonViewer() {
  const manifest = useOutletContext<Manifest>()
  const { chapterId = '', sectionId = '' } = useParams()
  const navigate = useNavigate()
  const [iframeError, setIframeError] = useState(false)

  const flat = flattenSections(manifest)
  const { prev, current, next } = findAdjacent(flat, chapterId, sectionId)

  if (!current) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
        <p>未找到该课程</p>
        <button type="button" className="text-blue-600 underline" onClick={() => navigate('/')}>
          返回目录
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <button
          type="button"
          disabled={!prev}
          onClick={() => prev && navigate(`/c/${prev.chapterId}/s/${prev.id}`)}
          className="rounded px-3 py-1 text-sm text-blue-600 enabled:hover:bg-blue-50 disabled:text-gray-300"
        >
          ← 上一节
        </button>
        <span className="truncate px-2 text-sm font-medium text-gray-700">
          {current.id} {current.title}
        </span>
        <button
          type="button"
          disabled={!next}
          onClick={() => next && navigate(`/c/${next.chapterId}/s/${next.id}`)}
          className="rounded px-3 py-1 text-sm text-blue-600 enabled:hover:bg-blue-50 disabled:text-gray-300"
        >
          下一节 →
        </button>
      </div>
      <div className="relative flex-1">
        {iframeError ? (
          <div className="flex h-full items-center justify-center text-red-600">
            课程文件缺失：{current.file}
          </div>
        ) : (
          <iframe
            key={current.file}
            src={`/courses/${current.file}`}
            title={current.title}
            className="h-full w-full border-0"
            onError={() => setIframeError(true)}
          />
        )}
      </div>
    </div>
  )
}
```

> 注：`onError` 对跨文档 iframe 触发不稳定；本任务用文件存在的正常路径验证主流程，文件缺失场景在 Task 8 用显式探测兜底。

- [ ] **Step 2: 注册课程路由**

`website-course/src/App.tsx` 中 `<Route index .../>` 同级新增一行子路由，并在顶部导入 LessonViewer:
```tsx
import LessonViewer from './components/LessonViewer'
```
```tsx
        <Route index element={<Welcome />} />
        <Route path="c/:chapterId/s/:sectionId" element={<LessonViewer />} />
```

- [ ] **Step 3: 运行验证**

Run: `cd website-course && pnpm dev`
Expected: 点击小节 1.1，右侧 iframe 显示蓝色标题示例页；顶部「上一节」禁用、「下一节」可点；点「下一节」依次跳到 1.2 → 2.1，到 2.1 时「下一节」禁用；刷新页面停留在当前节。

- [ ] **Step 4: 提交**

```bash
git add website-course/src/components/LessonViewer.tsx website-course/src/App.tsx
git commit -m "feat(website-course): iframe 课程展示与上/下一节导航"
```

---

### Task 8: 缺失文件的显式探测兜底

**Files:**
- Modify: `website-course/src/components/LessonViewer.tsx`

- [ ] **Step 1: 用 HEAD 请求显式探测文件存在性**

在 `LessonViewer.tsx` 中，将 `useState`/`flat` 之间补充一个探测 effect，并把顶部 import 改为:
```tsx
import { useEffect, useState } from 'react'
```
在 `const flat = ...` 之前新增:
```tsx
  // iframe 的 onError 对跨文档加载不可靠，这里用 HEAD 显式探测课程文件是否存在
  useEffect(() => {
    setIframeError(false)
    if (!current) return
    let alive = true
    fetch(`/courses/${current.file}`, { method: 'HEAD' })
      .then((res) => {
        if (alive && !res.ok) setIframeError(true)
      })
      .catch(() => alive && setIframeError(true))
    return () => {
      alive = false
    }
  }, [current])
```

> 说明：`current` 在此 effect 后才声明会导致引用错误。实现时把 `const flat`/`findAdjacent`/`current` 的计算移动到 `useState` 之后、`useEffect` 之前，确保 `current` 在 effect 中可用。最终顺序为：`useOutletContext` → `useParams` → `useNavigate` → `useState` → 计算 `flat`/`prev`/`current`/`next` → 探测 `useEffect` → 渲染。

- [ ] **Step 2: 运行验证（正常 + 缺失两种情况）**

Run: `cd website-course && pnpm dev`
Expected:
1. 正常小节：iframe 正常显示课程内容。
2. 临时把 manifest 某节 `file` 改成不存在的路径（如 `01-ai-basics/none.html`）刷新该节：右侧显示「课程文件缺失：01-ai-basics/none.html」。验证后改回 manifest。

- [ ] **Step 3: 提交**

```bash
git add website-course/src/components/LessonViewer.tsx
git commit -m "feat(website-course): 缺失课程文件显式探测兜底"
```

---

### Task 9: 构建验证与 README

**Files:**
- Create: `website-course/README.md`

- [ ] **Step 1: 编写 README**

`website-course/README.md`:
```markdown
# website-course

课程 HTML 展示工程：侧边目录 + iframe 展示完整独立的课程 HTML 文档。

## 开发

```bash
pnpm install
pnpm dev      # http://localhost:5180
pnpm test     # 运行 manifest 逻辑单测
pnpm build    # 产物输出到 dist/
```

## 新增课程

1. 在 `public/courses/<章节目录>/` 放入完整 HTML 文档。
2. 在 `public/courses/manifest.json` 对应章节的 `sections` 加一条记录：
   `{ "id": "x.y", "title": "标题", "file": "<章节目录>/<文件>.html" }`
3. 无需改动代码。

## 结构

- `public/courses/` 课程文档与 `manifest.json`（两层级：章节 → 小节）
- `src/lib/manifest.ts` manifest 加载/校验/扁平化/上下节
- `src/components/` Sidebar（目录）、LessonViewer（iframe+导航）、Layout
```

- [ ] **Step 2: 构建验证**

Run: `cd website-course && pnpm build`
Expected: `tsc -b` 与 `vite build` 均无错误；`dist/courses/manifest.json` 与各 HTML 文件存在于产物中。

- [ ] **Step 3: 预览产物验证**

Run: `cd website-course && pnpm preview`
Expected: 访问 `http://localhost:5180`，目录、折叠/展开、iframe 课程展示、上/下一节均与 dev 一致。

- [ ] **Step 4: 提交**

```bash
git add website-course/README.md
git commit -m "docs(website-course): README 与构建验证"
```

---

## 验收标准（对应 spec）

- `pnpm install && pnpm dev` 起得来，根路径展示目录（Task 1/5）
- manifest 含 2 章节 / 3 小节示例，目录正确渲染、折叠/展开正常（Task 3/6）
- 点击小节 → iframe 正确加载、URL 变化、刷新后停留在该节（Task 7）
- 上/下一节按跨章节扁平顺序正确跳转，首尾禁用（Task 4/7）
- manifest 加载失败/格式错误展示明确错误，不静默兜底（Task 5）
- 路由命中不存在的小节展示「未找到该课程」（Task 7）
- iframe 文件缺失展示「课程文件缺失」（Task 8）
- `pnpm build` 产物中 `courses/` 静态资源完整、可正常打开（Task 9）
