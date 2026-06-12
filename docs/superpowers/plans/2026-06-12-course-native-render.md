# 课程内容由 iframe 改为原生内联渲染 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把课程小节从 iframe 改为原生内联渲染：服务端提取课程 HTML 的 `<style>`/`<body>`，用 postcss 把样式作用域限定到 `.course-doc`，内联进主文档 DOM。

**Architecture:** 课程 HTML 仍是完整独立文档（零迁移）。小节页（服务端）读文件 → 提取 + postcss 作用域化 → 把 `{css, html}` 传给改造为**服务端组件**的 `LessonViewer`，后者渲染 sticky 导航 + 作用域 `<style>` + `.course-doc` 内联内容，替掉 iframe。解决滚动/白闪/页内搜索/样式联动四问题，不污染全站。

**Tech Stack:** Next.js 15 App Router + React 19 + TypeScript + 新增 `postcss`（已获用户批准）。无单测框架：每任务 `pnpm exec tsc --noEmit`，最终任务 `pnpm build` + 运行时（SSR HTML 断言 + 浏览器）。

> 约定：命令在 `website-aicamp/` 下。`@/` 别名、无导入扩展名、无未用导入（tsconfig `noUnusedLocals`/`noUnusedParameters` 开）。

**规格依据：** `docs/superpowers/specs/2026-06-12-course-native-render-design.md`

**文件结构：**

| 文件 | 改动 | 职责 |
|---|---|---|
| `package.json` / `pnpm-lock.yaml` | 改 | 新增直接依赖 `postcss` |
| `src/features/course/scope-css.ts` | 建 | 纯函数 `scopeCss`：postcss 把选择器限定到 `.course-doc` |
| `src/features/course/types.ts` | 改 | 新增 `SectionContent { css; html }` |
| `src/features/course/load-section-content.ts` | 建 | 服务端：读 HTML → 提取 style/body → `scopeCss` → `{css,html}`（`cache()`） |
| `src/features/course/components/LessonViewer.tsx` | 改 | 客户端 iframe → 服务端组件：导航 + 作用域 `<style>` + `.course-doc` 内联 |
| `src/app/course/[chapterId]/[sectionId]/page.tsx` | 改 | 调 `loadSectionContent`（缺失→null）传入 LessonViewer |

---

### Task 1: 新增 postcss 依赖

**Files:** `website-aicamp/package.json`, `website-aicamp/pnpm-lock.yaml`

- [ ] **Step 1: 安装 postcss 为直接依赖**

```bash
cd website-aicamp && pnpm add postcss
```

- [ ] **Step 2: 确认可直接 import**

```bash
cd website-aicamp && node -e "console.log('postcss', require('postcss/package.json').version)"
```
Expected: 打印 `postcss <版本>`（不再 MODULE_NOT_FOUND）。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/package.json website-aicamp/pnpm-lock.yaml
git commit -m "build(aicamp): 新增 postcss 依赖(课程样式作用域化)"
```

---

### Task 2: scope-css.ts — postcss 作用域前缀器

**Files:** Create `website-aicamp/src/features/course/scope-css.ts`

- [ ] **Step 1: 写 scope-css.ts**

```ts
import postcss, { type AtRule } from 'postcss'

// 文档级选择器映射为作用域根本身；其余作后代限定，避免污染全站
const ROOT_SELECTORS = new Set([':root', 'html', 'body'])

function scopeSelector(selector: string, scope: string): string {
  const s = selector.trim()
  if (s === '') return s
  if (ROOT_SELECTORS.has(s)) return scope
  if (s === '*') return `${scope} *`
  return `${scope} ${s}`
}

// 把一段 CSS 的所有选择器限定到 scope 容器内（默认 .course-doc）。
// 用 postcss 解析 AST 可靠处理 @media（walkRules 自然递归）与 @keyframes（步进选择器不前缀）。
export function scopeCss(rawCss: string, scope = '.course-doc'): string {
  if (!rawCss.trim()) return ''
  const root = postcss.parse(rawCss)
  root.walkRules((rule) => {
    const parent = rule.parent
    // 跳过 @keyframes / @-webkit-keyframes 内的关键帧步进（0%/50%/from/to）
    if (parent && parent.type === 'atrule' && /keyframes$/i.test((parent as AtRule).name)) {
      return
    }
    rule.selectors = rule.selectors.map((sel) => scopeSelector(sel, scope))
  })
  return root.toString()
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/features/course/scope-css.ts
git commit -m "feat(course): postcss CSS 作用域前缀器 scopeCss"
```

> 行为正确性在 Task 6 经 SSR HTML 断言端到端验证（注入的 `<style>` 中无裸 `body{`/`html{`，均带 `.course-doc`）。

---

### Task 3: SectionContent 类型 + 服务端内容加载器

**Files:**
- Modify: `website-aicamp/src/features/course/types.ts`
- Create: `website-aicamp/src/features/course/load-section-content.ts`

- [ ] **Step 1: 在 types.ts 末尾加 SectionContent**

```ts
// 服务端提取 + 作用域化后的小节内容：作用域 CSS 与 body 内部 HTML
export interface SectionContent {
  css: string
  html: string
}
```

- [ ] **Step 2: 写 load-section-content.ts**

```ts
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'

import { scopeCss } from './scope-css'
import type { SectionContent } from './types'

const COURSES_DIR = path.join(process.cwd(), 'public', 'courses')

// 拼接文档内所有 <style> 内容
function extractStyles(htmlDoc: string): string {
  const styles: string[] = []
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(htmlDoc)) !== null) styles.push(m[1])
  return styles.join('\n')
}

// 取 <body> 内部；无 body 时回退为去掉 <head> 的整体。再防御性剥离 <script>。
function extractBody(htmlDoc: string): string {
  const m = htmlDoc.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const inner = m ? m[1] : htmlDoc.replace(/<head[\s\S]*?<\/head>/i, '')
  return inner.replace(/<script[\s\S]*?<\/script>/gi, '')
}

// 服务端读取课程 HTML 文件并产出作用域化内容。文件缺失时抛错（由页面捕获）。
// cache() 单请求去重（layout/page 不重复读）。
export const loadSectionContent = cache(async (file: string): Promise<SectionContent> => {
  const abs = path.join(COURSES_DIR, file)
  const raw = await readFile(abs, 'utf-8')
  const css = scopeCss(extractStyles(raw))
  const html = extractBody(raw)
  return { css, html }
})
```

- [ ] **Step 3: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 4: Commit**

```bash
git add website-aicamp/src/features/course/types.ts website-aicamp/src/features/course/load-section-content.ts
git commit -m "feat(course): 服务端课程内容加载器(提取+作用域化)"
```

---

### Task 4: LessonViewer 服务端原生渲染 + 小节页接入

> 两处改动是同一份契约（LessonViewer 新增必填 `content` prop ⇄ page 传入），合并为一个 tsc-clean 提交，避免中间态类型不过。

**Files:**
- Modify (rewrite): `website-aicamp/src/features/course/components/LessonViewer.tsx`
- Modify: `website-aicamp/src/app/course/[chapterId]/[sectionId]/page.tsx`

- [ ] **Step 1: 整体替换 LessonViewer.tsx**

把整个 `LessonViewer.tsx` 替换为（去掉 `'use client'`、`useRouter`、HEAD 探测、iframe；改 `<Link>` + 作用域 `<style>` + `.course-doc` 内联；内容区可滚）：

```tsx
import Link from 'next/link'

import type { AdjacentLink, Section, SectionContent } from '../types'

interface Props {
  current: Section
  prev: AdjacentLink | null
  next: AdjacentLink | null
  content: SectionContent | null
}

// 上/下一节胶囊按钮：发丝边框 + hover 紫色微光
const navBtn =
  'rounded-full border border-hairline px-4 py-1.5 text-sm text-ink transition-all hover:border-hairline-strong hover:text-accent hover:shadow-[0_6px_20px_-6px_rgba(167,139,250,0.5)]'
// 禁用态（首/末节）：弱化、不可点
const navBtnDisabled =
  'pointer-events-none rounded-full border border-transparent px-4 py-1.5 text-sm text-muted/40'

// 右侧课程展示：顶部上/下一节导航条 + 原生内联渲染作用域化课程内容（替代 iframe）
export function LessonViewer({ current, prev, next, content }: Props) {
  return (
    <div className="flex h-full flex-col bg-canvas">
      <div className="flex items-center justify-between border-b border-hairline bg-canvas/60 px-4 py-2.5 backdrop-blur-xl">
        {prev ? (
          <Link href={`/course/${prev.chapterId}/${prev.sectionId}`} className={navBtn}>
            ← 上一节
          </Link>
        ) : (
          <span className={navBtnDisabled}>← 上一节</span>
        )}
        <span className="truncate px-3 text-sm font-medium text-ink-soft">
          {current.id} {current.title}
        </span>
        {next ? (
          <Link href={`/course/${next.chapterId}/${next.sectionId}`} className={navBtn}>
            下一节 →
          </Link>
        ) : (
          <span className={navBtnDisabled}>下一节 →</span>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {content ? (
          <>
            {/* 作用域已限定到 .course-doc，内容为第一方自有 HTML，innerHTML 不执行脚本 */}
            <style dangerouslySetInnerHTML={{ __html: content.css }} />
            <article className="course-doc" dangerouslySetInnerHTML={{ __html: content.html }} />
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-accent-3">
            课程文件缺失：{current.file}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 调整小节页 page.tsx 的 import**

把 `[chapterId]/[sectionId]/page.tsx` 顶部 import 区改为（新增 `loadSectionContent` 与 `SectionContent`）：

```tsx
import { notFound, redirect } from 'next/navigation'

import { getCampAuthState } from '@/features/auth/server/session'
import { canAccessChapter } from '@/features/course/access'
import { loadManifest } from '@/features/course/load-manifest'
import { loadSectionContent } from '@/features/course/load-section-content'
import { findAdjacent, flattenSections } from '@/features/course/manifest'
import { LessonViewer } from '@/features/course/components/LessonViewer'
import type { AdjacentLink, SectionContent } from '@/features/course/types'
```

- [ ] **Step 3: 加载内容并把 content 传入 LessonViewer**

把 `prevLink`/`nextLink` 之后、`return` 之前插入内容加载，并修改 return：

```tsx
  const prevLink: AdjacentLink | null = prev ? { chapterId: prev.chapterId, sectionId: prev.id } : null
  const nextLink: AdjacentLink | null = next ? { chapterId: next.chapterId, sectionId: next.id } : null

  // 服务端读取并作用域化课程 HTML；文件缺失 → null（视图显示缺失提示并保留导航）
  const content: SectionContent | null = await loadSectionContent(current.file).catch(() => null)

  return (
    <LessonViewer
      current={{ id: current.id, title: current.title, file: current.file }}
      prev={prevLink}
      next={nextLink}
      content={content}
    />
  )
```

- [ ] **Step 4: 类型检查（应清零）**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0（LessonViewer 新签名与 page 调用一致）。

- [ ] **Step 5: Commit**

```bash
git add website-aicamp/src/features/course/components/LessonViewer.tsx "website-aicamp/src/app/course/[chapterId]/[sectionId]/page.tsx"
git commit -m "feat(course): LessonViewer 原生渲染 + 小节页接入(替 iframe)"
```

---

### Task 5: 构建 + 运行时验证

**Files:** 无（验证任务）

> 前置：aicamp dev 运行于 3100（**勿在 dev 运行时跑 next build**，会损坏共享 `.next`）。验证用 dev 服务即可。会员门禁：用前文 dev 登录以 basic 会员态拿 cookie 后访问课程。

- [ ] **Step 1: 生产构建通过**

先停 dev（若要 build），或单独验证类型：
```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。（如需完整 build：停 dev → `node_modules/.bin/next build` → 路由表含 `/course/[chapterId]/[sectionId]` → 重启 dev。）

- [ ] **Step 2: 取 basic 会员 cookie**

```bash
JAR=$(mktemp)
curl -s -c "$JAR" -X POST "http://localhost:3100/api/auth/dev-login" -H "Content-Type: application/json" -d '{"username":"dev_local","tier":"basic"}' -o /dev/null -w "login=%{http_code}\n"
```
Expected: `login=200`。

- [ ] **Step 3: 断言原生渲染 + 作用域（SSR HTML）**

```bash
HTML=$(curl -s -b "$JAR" "http://localhost:3100/course/01-ai-basics/1.2")
echo "$HTML" | grep -q 'class="course-doc"' && echo "OK: course-doc present" || echo "FAIL: no course-doc"
echo "$HTML" | grep -qi '<iframe' && echo "FAIL: iframe still present" || echo "OK: no iframe"
echo "$HTML" | grep -qE '\.course-doc[ ,{]' && echo "OK: scoped css present" || echo "FAIL: no scoped css"
# 注入的 style 中不应有逃逸的裸 body{/html{（作用域生效）
echo "$HTML" | grep -qE '(^|[^.-])\bbody\s*\{' && echo "WARN: bare body{ found (check scope)" || echo "OK: no bare body{"
rm -f "$JAR"
```
Expected: 三个 OK（course-doc / no iframe / scoped css），且无裸 `body{`。

- [ ] **Step 4: 浏览器人工验证（或 chrome-devtools）**

访问 `http://localhost:3100/course/01-ai-basics/1.2`（已登录 basic）：
1. 内容原生显示、无 iframe；正文随内容区自然滚动，侧栏固定，无双滚动条。
2. Ctrl+F 搜正文中的词能命中；可跨段落选中复制。
3. 切换上/下节（点导航）无 iframe 白闪。
4. 打开首页 `/` 与 `/membership`：其标题/正文样式**未被课程样式影响**（作用域未逃逸）。
5. 视觉与原 iframe 内一致（标题渐变、阅读栏居中等保留）。

- [ ] **Step 5: 文件缺失验证（可选）**

临时把某节 HTML 改名后访问该节 → 顶部导航仍在、内容区显示「课程文件缺失：…」；验证完改回。

- [ ] **Step 6: 记录验证结果（无代码改动则无需提交）**

---

## 自检结论（规格覆盖）

- 新增 postcss 依赖：Task 1。✓
- 作用域前缀器（@media 递归 / @keyframes 不前缀 / body·html·:root→scope / *）：Task 2（scope-css.ts）。✓
- 服务端提取 style/body + 剥离 script + cache：Task 3（load-section-content.ts）。✓
- LessonViewer 服务端化（去 iframe/HEAD/useRouter、`<Link>`、作用域 style + `.course-doc` 内联、内容区可滚、缺失提示）+ 小节页接入（缺失→null）：Task 4。✓
- 零迁移（仍读完整独立 HTML）：Task 3 读取逻辑保证。✓
- 四诉求 + 不污染全站 + 文件缺失：Task 5 运行时断言/人工验证。✓
- 无 schema/数据/manifest 变更：全程未涉及。✓
- 布局无需改动：LessonViewer 内容区 `min-h-0 flex-1 overflow-y-auto` 在现有 `course/layout.tsx` 的 `flex-1 overflow-hidden` 主区内即可滚动（h-full 链成立）；故不改 layout。✓
