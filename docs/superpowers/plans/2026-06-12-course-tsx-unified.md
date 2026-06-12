# 课件改为 TSX 全代码 · 与站点一套标准 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把课件从内嵌 HTML 改为 TSX 全代码：建一套共享内容组件库，课件以 TSX 编写、按路由 dynamic import 进现有壳渲染，拆除旧内嵌渲染机制。

**Architecture:** 共享组件库 `src/components/content/`（排版 + 内容块 + Figure）= 课件与站点统一标准。课件 `src/content/courses/<章>/<slug>.tsx` 默认导出组件，用该库书写。小节页（壳不变：路由/manifest/会员门禁/侧栏）在 tier 门禁后 `loadLesson(file)` 动态加载课件组件并渲染。拆除 `scope-css`/`load-section-content`/`public HTML`/`postcss`。

**Tech Stack:** Next.js 15 App Router + React 19 + Tailwind v4 + TypeScript。**零新增运行时依赖**（净减 postcss）。无单测框架：`pnpm exec tsc --noEmit` + 运行时（浏览器/chrome-devtools 截图）。

> 约定：命令在 `website-aicamp/`。`@/`=`src/`，无导入扩展名，无未用导入。**dev server 在 3100 运行，勿跑 `next build`/`next dev`**（共享 `.next` 会损坏），验证用 `tsc` + 现有 dev server。门禁验证用前文 dev 登录拿 basic cookie。
> **执行次序保证 app 始终可用**：先建库（加法）→ 迁移 3 篇 TSX（加法，与旧 HTML 共存）→ 原子切换（壳/页/manifest，此时 3 篇 TSX 已就绪）→ 拆除旧机制。
> Task 1 与 Task 3 是**设计/内容密集**任务（视觉需对照现有 HTML 并截图核对），建议用强模型；接口契约见各任务，视觉以现有 HTML 的 `<style>` 为准。

**规格依据：** `docs/superpowers/specs/2026-06-12-course-tsx-unified-design.md`

**文件结构：**

| 文件 | 改动 | 职责 |
|---|---|---|
| `src/components/content/*` | 建 | 共享内容组件库（排版/块/Figure）+ `index.ts` 桶导出 |
| `src/features/course/load-lesson.ts` | 建 | 按 `file` 键 dynamic import 课件组件 |
| `src/content/courses/<章>/<slug>.tsx` | 建 ×3 | 三篇课件（迁移自 HTML） |
| `src/features/course/components/LessonViewer.tsx` | 改 | `content` 入参 → `children`（渲染课件组件） |
| `src/app/course/[chapterId]/[sectionId]/page.tsx` | 改 | 用 `loadLesson` 取课件传入 LessonViewer |
| `public/courses/<章>/sections.json` | 改 | `file` 由 `xx.html` → `xx` slug |
| `src/features/course/scope-css.ts` | 删 | 旧 CSS 作用域器 |
| `src/features/course/load-section-content.ts` | 删 | 旧 HTML 提取器 |
| `src/features/course/types.ts` | 改 | 删 `SectionContent` |
| `public/courses/<章>/*.html` | 删 | 旧内嵌 HTML |
| `package.json` | 改 | 移除 `postcss` 直接依赖 |

---

### Task 1: 共享内容组件库

**Files:** Create `website-aicamp/src/components/content/` 下若干文件 + `index.ts`

> 设计密集任务。视觉以现有课件 `<style>` 为准：参照 `public/courses/01-ai-basics/01-dev-world.html`、`02-tools.html`（含 `.eyebrow/.lead/.goals/.terms/.gloss/.analogy/.bridge/.closing/.toc/.rule/.gh/.ico/.cmd` 等及手写 SVG 角色类 `.svg-title/.svg-label/.svg-sub/.svg-mono/.flow-line/.arrow/.dot/.c-*`），用 Tailwind + 主题 token（`text-ink/ink-soft/muted`、`text-accent/accent-2/accent-3`、`border-hairline` 等）实现等价视觉。可用 frontend-design 技能。

- [ ] **Step 1: 建组件，锁定 props 契约（按职责分文件）**

`src/components/content/typography.tsx`（排版原语）—— 实现以下导出，props 契约固定，视觉对照参照文件：
```tsx
import type { ReactNode } from 'react'
export function Eyebrow(props: { chapter?: string; index?: string; children?: ReactNode }): React.JSX.Element
export function LessonTitle(props: { children: ReactNode }): React.JSX.Element      // 渐变大标题(原 h1)
export function Lead(props: { children: ReactNode }): React.JSX.Element             // 导语
export function Section(props: { id?: string; icon?: ReactNode; title: ReactNode; children: ReactNode }): React.JSX.Element  // h2(可带 ico) + 内容
export function KeyPoints(props: { title?: string; items: ReactNode[] }): React.JSX.Element  // goals 要点清单
export function Summary(props: { title?: string; items: ReactNode[] }): React.JSX.Element     // 本节速读(toc)
export function Rule(): React.JSX.Element                                            // 分隔线
export function Highlight(props: { children: ReactNode }): React.JSX.Element         // gh 渐变强调(inline)
export function Cmd(props: { children: ReactNode }): React.JSX.Element               // 命令/行内代码样式
```
`src/components/content/blocks.tsx`（内容块）：
```tsx
import type { ReactNode } from 'react'
// 术语表：term + 释义
export function Terms(props: { items: { term: string; gloss: ReactNode }[] }): React.JSX.Element
// 叙事/提示块：label 标签 + 内容。analogy/bridge/closing 用不同 tone 复用此组件
export function Callout(props: { tone?: 'analogy' | 'bridge' | 'closing' | 'note'; label?: string; children: ReactNode }): React.JSX.Element
```
`src/components/content/figure.tsx`（图示）：
```tsx
import type { ReactNode } from 'react'
// 手写 SVG 容器：可选标题/脚注；children 为内联 JSX <svg>
export function Figure(props: { title?: string; caption?: string; children: ReactNode }): React.JSX.Element
```
> 实现要点：每个组件单一职责、用语义标签（`<h1>/<h2>/<p>/<ul>/<figure>` 等，利于页内搜索/选中/锚点）。SVG 文本/线条角色（title/label/sub/mono/flow-line/arrow/dot）用 Tailwind 工具类直接写在课件的 SVG 元素上；若有高复用角色，可在本目录加 `figure.css`（`@utility` 或类）。允许按真实内容增删组件——契约是起点不是冻结。

- [ ] **Step 2: 桶导出**

`src/components/content/index.ts`：
```ts
export * from './typography'
export * from './blocks'
export * from './figure'
```

- [ ] **Step 3: 临时 demo 路由核对视觉（截图）**

临时建 `src/app/_content-demo/page.tsx` 用每个组件渲染一屏样例（含一个小 SVG 放进 `Figure`），`pnpm exec tsc --noEmit` 通过后，浏览器访问 `http://localhost:3100/_content-demo` 截图核对：排版层级、渐变标题、要点清单、术语、callout、figure 视觉与现有课件风格一致、用的是主题色。
> 核对后**删除该 demo 路由**（仅用于视觉验证，不进产物）。

- [ ] **Step 4: 类型检查 + Commit**

```bash
cd website-aicamp && pnpm exec tsc --noEmit   # expect exit 0
git add website-aicamp/src/components/content
git commit -m "feat(content): 共享内容组件库(排版/块/Figure)"
```

---

### Task 2: 课件动态加载器（验证机制）

**Files:**
- Create: `website-aicamp/src/features/course/load-lesson.ts`
- Temp: `website-aicamp/src/content/courses/_probe/_probe.tsx`（验证后删除）

- [ ] **Step 1: 写 load-lesson.ts**

```ts
import type { ComponentType } from 'react'

// 按 manifest 的 file 键（<chapterId>/<slug>）动态加载课件 TSX 组件。
// webpack 对 ../../content/courses/** 建动态 context 解析 .tsx；缺失/无默认导出返回 null。
export async function loadLesson(file: string): Promise<ComponentType | null> {
  try {
    const mod = (await import(`../../content/courses/${file}`)) as { default?: ComponentType }
    return mod.default ?? null
  } catch {
    return null
  }
}
```

- [ ] **Step 2: 放一个探针课件，临时验证动态 import 机制**

`src/content/courses/_probe/_probe.tsx`：
```tsx
export default function Probe() {
  return <div data-probe="ok">probe-loaded</div>
}
```
在 section page 顶部（临时，仅本步）或一个临时脚本验证 `loadLesson('_probe/_probe')` 能取到组件。最简：临时在 `app/_content-demo/page.tsx`（若已删则新建临时）里 `const C = await loadLesson('_probe/_probe')` 渲染 `<C/>`，访问页面确认出现 `probe-loaded`。
> **若动态 import 解析失败**（webpack 动态 context 对该相对模板不生效）：回退方案——改 `load-lesson.ts` 为生成式注册表 `Record<string, () => Promise<{default: ComponentType}>>`（手维护或 `course:gen` 生成），并在本计划记录该偏离。先用探针确认走哪条路再继续。

- [ ] **Step 3: 删除探针与临时验证代码**

删 `src/content/courses/_probe/`，移除临时验证页/代码。`pnpm exec tsc --noEmit` 通过。

- [ ] **Step 4: Commit**

```bash
git add website-aicamp/src/features/course/load-lesson.ts
git commit -m "feat(course): 课件 TSX 动态加载器 loadLesson"
```

---

### Task 3: 迁移三篇课件为 TSX

**Files:** Create `website-aicamp/src/content/courses/01-ai-basics/01-dev-world.tsx`、`.../02-tools.tsx`、`website-aicamp/src/content/courses/02-engineering/01-theme.tsx`

> 内容密集任务。每篇默认导出一个组件，用 Task 1 的组件库书写；视觉/信息以对应 HTML 为准（逐篇截图核对）。**旧 HTML 暂不删**（与 TSX 共存，切换前保留可用）。

- [ ] **Step 1: 迁移 lesson 3（stub，最简，先打通编写闭环）**

`src/content/courses/02-engineering/01-theme.tsx`（原 HTML 仅 h1 + 一段）：
```tsx
import { LessonTitle, Lead } from '@/components/content'

export default function Lesson() {
  return (
    <>
      <LessonTitle>设计应用的主题效果</LessonTitle>
      <Lead>这是小节 2.1 的示例内容：统一视觉风格。</Lead>
    </>
  )
}
```

- [ ] **Step 2: 迁移 lesson 1（`01-dev-world`，22 个 SVG，富结构）**

读 `public/courses/01-ai-basics/01-dev-world.html` 全文，转为 `src/content/courses/01-ai-basics/01-dev-world.tsx`：
- 正文结构套组件库（Eyebrow/LessonTitle/Lead/Section/KeyPoints/Terms/Callout/Summary 等）。
- 每个内联 `<svg>` 转 JSX：`class`→`className`、kebab 属性（`stroke-width`→`strokeWidth`、`text-anchor`→`textAnchor`、`stroke-linecap` 等）→ camelCase、`style="a:b;c:d"`→`style={{ a: 'b', c: 'd' }}`、自闭合标签补全、用 `Figure` 包裹、SVG 角色样式用 Tailwind/主题色。
- **体量大，派 Agent 批量改写**，人工抽检关键图示。

- [ ] **Step 3: 迁移 lesson 2（`02-tools`，14 个 SVG + 21 处 code）**

同上，读 `public/courses/01-ai-basics/02-tools.html` → `src/content/courses/01-ai-basics/02-tools.tsx`；行内命令/代码用 `Cmd`/`<code>`。Agent 批量 + 抽检。

- [ ] **Step 4: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0（三篇课件类型正确；此时尚未接入路由，仅作为模块存在）。

- [ ] **Step 5: Commit**

```bash
git add website-aicamp/src/content/courses
git commit -m "feat(content): 三篇课件迁移为 TSX"
```

---

### Task 4: 原子切换 — 壳/页/ manifest 接入 TSX

**Files:**
- Modify: `website-aicamp/src/features/course/components/LessonViewer.tsx`
- Modify: `website-aicamp/src/app/course/[chapterId]/[sectionId]/page.tsx`
- Modify: `website-aicamp/public/courses/01-ai-basics/sections.json`、`website-aicamp/public/courses/02-engineering/sections.json`

> 一次提交完成切换：三篇 TSX 已就绪，切换后 app 仍可用。

- [ ] **Step 1: LessonViewer 改为 children 壳**

整体替换 `LessonViewer.tsx`：
```tsx
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { AdjacentLink, Section } from '../types'

interface Props {
  current: Section
  prev: AdjacentLink | null
  next: AdjacentLink | null
  children: ReactNode
}

const navBtn =
  'rounded-full border border-hairline px-4 py-1.5 text-sm text-ink transition-all hover:border-hairline-strong hover:text-accent hover:shadow-[0_6px_20px_-6px_rgba(167,139,250,0.5)]'
const navBtnDisabled =
  'pointer-events-none rounded-full border border-transparent px-4 py-1.5 text-sm text-muted/40'

// 课程展示壳：上/下节导航 + 可滚动阅读区；课件组件作为 children 原生渲染
export function LessonViewer({ current, prev, next, children }: Props) {
  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex items-center justify-between border-b border-hairline bg-canvas/60 px-4 py-2.5 backdrop-blur-xl">
        {prev ? (
          <Link href={`/course/${prev.chapterId}/${prev.sectionId}`} className={navBtn}>← 上一节</Link>
        ) : (
          <span className={navBtnDisabled}>← 上一节</span>
        )}
        <span className="truncate px-3 text-sm font-medium text-ink-soft">{current.id} {current.title}</span>
        {next ? (
          <Link href={`/course/${next.chapterId}/${next.sectionId}`} className={navBtn}>下一节 →</Link>
        ) : (
          <span className={navBtnDisabled}>下一节 →</span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* 统一阅读栏：居中、最大宽度、留白（对应原 body 排版） */}
        <article className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8">{children}</article>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 小节页用 loadLesson 取课件**

把 `[chapterId]/[sectionId]/page.tsx` 的 import 与 return 改为（移除 `loadSectionContent`/`SectionContent`，新增 `loadLesson`）：
```tsx
import { notFound, redirect } from 'next/navigation'

import { getCampAuthState } from '@/features/auth/server/session'
import { canAccessChapter } from '@/features/course/access'
import { loadManifest } from '@/features/course/load-manifest'
import { loadLesson } from '@/features/course/load-lesson'
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

  // 按 file 键动态加载课件 TSX 组件；缺失 → 显示缺失提示（保留导航）
  const Lesson = await loadLesson(current.file)

  return (
    <LessonViewer
      current={{ id: current.id, title: current.title, file: current.file }}
      prev={prevLink}
      next={nextLink}
    >
      {Lesson ? <Lesson /> : <p className="text-accent-3">课件缺失：{current.file}</p>}
    </LessonViewer>
  )
}
```

- [ ] **Step 3: sections.json 改 slug**

`public/courses/01-ai-basics/sections.json`：
```json
{
  "sections": [
    { "id": "1.1", "title": "开发世界速览", "file": "01-dev-world" },
    { "id": "1.2", "title": "认识并安装主力工具", "file": "02-tools" }
  ]
}
```
`public/courses/02-engineering/sections.json`：
```json
{
  "sections": [
    { "id": "2.1", "title": "设计应用的主题效果", "file": "01-theme" }
  ]
}
```

- [ ] **Step 4: 类型检查 + 运行时冒烟**

```bash
cd website-aicamp && pnpm exec tsc --noEmit   # expect exit 0
```
dev 服务热重载后，用 basic cookie 访问 `http://localhost:3100/course/01-ai-basics/1.1`、`/1.2`、`/course/02-engineering/2.1`：均原生渲染、DOM 无 iframe、内容正确。

- [ ] **Step 5: Commit**

```bash
git add website-aicamp/src/features/course/components/LessonViewer.tsx "website-aicamp/src/app/course/[chapterId]/[sectionId]/page.tsx" website-aicamp/public/courses/01-ai-basics/sections.json website-aicamp/public/courses/02-engineering/sections.json
git commit -m "feat(course): 切换为 TSX 课件渲染(壳/页/manifest)"
```

---

### Task 5: 拆除旧内嵌 HTML 机制

**Files:** 删除 `scope-css.ts`、`load-section-content.ts`、`public/courses/**/*.html`；改 `types.ts`、`package.json`

- [ ] **Step 1: 删旧渲染机制与静态 HTML**

```bash
cd website-aicamp
git rm src/features/course/scope-css.ts src/features/course/load-section-content.ts
git rm public/courses/01-ai-basics/01-dev-world.html public/courses/01-ai-basics/02-tools.html public/courses/02-engineering/01-theme.html
```

- [ ] **Step 2: 删 SectionContent 类型**

从 `src/features/course/types.ts` 删除 `SectionContent` 接口（及其注释）。确认无其它文件 import 它：
```bash
cd website-aicamp && grep -rn "SectionContent" src || echo "no refs"
```
Expected: `no refs`。

- [ ] **Step 3: 移除 postcss 直接依赖**

```bash
cd website-aicamp && grep -rn "from 'postcss'\|require('postcss')\|\"postcss\"" src || echo "no direct postcss import in src"
pnpm remove postcss
```
Expected: src 无 postcss 直接引用；`package.json` dependencies 不再含 `postcss`（tailwind 的传递依赖不受影响）。

- [ ] **Step 4: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 5: Commit**

```bash
git add -A website-aicamp
git commit -m "chore(course): 拆除内嵌 HTML 渲染机制(scope-css/load-section-content/postcss/HTML)"
```

---

### Task 6: 构建 + 运行时验证

**Files:** 无（验证任务）

- [ ] **Step 1: 生产构建（先停 dev）**

```bash
# 停 dev → 构建 → 重启 dev（避免 .next 冲突）
cd website-aicamp && node_modules/.bin/next build 2>&1 | tail -30
```
Expected: 构建成功；路由表含 `ƒ /course/[chapterId]/[sectionId]`；无 postcss 相关报错。完后重启 dev。

- [ ] **Step 2: 逐篇截图核对（chrome-devtools，basic 登录）**

basic dev 登录后访问三节，逐一截图，与原 HTML 视觉/信息核对：标题渐变、要点清单、术语、手写 SVG 图示、命令样式等等价；与站点主题联动。

- [ ] **Step 3: 四诉求 + 门禁断言**

```bash
JAR=$(mktemp)
curl -s -c "$JAR" -X POST "http://localhost:3100/api/auth/dev-login" -H "Content-Type: application/json" -d '{"username":"dev_local","tier":"basic"}' -o /dev/null -w "login=%{http_code}\n"
HTML=$(curl -s -b "$JAR" "http://localhost:3100/course/01-ai-basics/1.2")
printf %s "$HTML" | grep -qi '<iframe' && echo "FAIL iframe" || echo "OK no iframe"
printf %s "$HTML" | grep -q 'dangerouslySetInnerHTML' && echo "FAIL dsi" || echo "OK no dangerouslySetInnerHTML marker"
# premium 泄露面消除：原 HTML 路径不再可取
curl -s -o /dev/null -w "html-asset=%{http_code}\n" "http://localhost:3100/courses/01-ai-basics/02-tools.html"   # expect 404
rm -f "$JAR"
```
Expected: no iframe、原 `/courses/*.html` 返回 404（内容已不在 public/）。
浏览器人工：随内容区自然滚动、Ctrl+F 命中正文、可跨段选中复制、切上/下节无白闪；首页/会员页样式未受影响（无全局污染）。门禁：未登录→/login、非会员→/membership、premium 章对 basic 仍拦。

- [ ] **Step 4: 记录结果（无代码改动则无需提交）**

---

## 自检结论（规格覆盖）

- 共享组件库（排版/块/Figure，主题 token）= 一套标准：Task 1。✓
- 课件 TSX + dynamic import：Task 2（loadLesson）、Task 3（三篇）。✓
- 壳不变 + tier 门禁 + 渲染接入：Task 4。✓
- manifest `file`→slug：Task 4 Step 3。✓
- 拆除 scope-css/load-section-content/SectionContent/HTML/postcss：Task 5。✓
- 原生渲染、无 iframe/无 dangerouslySetInnerHTML、四诉求、与站点联动：Task 6。✓
- premium 泄露面消除（内容入 bundle、HTML 不在 public/）：Task 5 删 HTML + Task 6 Step 3 断言 404。✓
- 零新增依赖（净减 postcss）：Task 5 Step 3。✓
- 次序保证 app 始终可用（库→迁移→原子切换→拆除）：Task 1–5 排序。✓
- dynamic import 机制风险：Task 2 Step 2 探针验证 + 注册表回退。✓
- 侧栏美化：正交、本计划不含（规格已注明，后续单独做）。
