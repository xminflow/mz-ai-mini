# AI 编程章节改为 Markdown 文件渲染 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 community 的「AI 编程学习路径」各章节内容从 `ai-coding.ts` 内联的 `LectureBlock[]` 迁移到独立的 `.md` 文件，由前端在构建期解析 frontmatter 并用 markdown 渲染，便于长期维护。

**Architecture:** 每个阶段一个 `.md` 文件（文件名即 slug，元数据在 YAML frontmatter，正文为 GFM）。新增内容加载器用 `fs` + `gray-matter` 读取并校验，对外保持 `getStages()/getStage()/...` 既有签名。一个零依赖的本地 remark 插件把 `[!NOTE]/[!WARNING]/[!TIP]` 告警块转成带 tone 标记的 blockquote，由新的 `LectureMarkdown` 组件（`react-markdown` + `remark-gfm`）映射到现有 Tailwind 样式。

**Tech Stack:** Next.js 15 (App Router, RSC), React 19, Tailwind v4, `react-markdown` + `remark-gfm` + `gray-matter`（新增，已批准）。

> **关于测试：** community 当前无测试框架，且项目规范不要求前端组件测试。本计划以「构建期校验 + 故意制造非法文件验证报错 + 页面人工验证」作为验收手段，不新增 vitest/jest。设计文档中提到的「loader 单测」据此调整为构建期验证，理由是避免新增第 4 个依赖。

参考设计文档：`docs/superpowers/specs/2026-06-01-ai-coding-markdown-content-design.md`

---

## 文件结构

- 新建 `community/src/content/ai-coding/ai-tools.md` — 第 1 阶段内容（frontmatter + 正文）
- 新建 `community/src/content/ai-coding/frontend.md` — 第 2 阶段内容
- 新建 `community/src/content/ai-coding/backend.md` — 第 3 阶段内容
- 新建 `community/src/lib/content/remark-callout.ts` — 零依赖本地 remark 插件，处理告警块
- 修改 `community/src/lib/content/ai-coding.ts` — `Stage` 类型改为 `content: string`，删除 `LectureBlock`，新增基于 `fs`+`gray-matter` 的加载与校验，保持导出函数签名
- 新建 `community/src/components/LectureMarkdown.tsx` — markdown 渲染组件（替代 `LectureBlocks.tsx`）
- 删除 `community/src/components/LectureBlocks.tsx`
- 修改 `community/src/app/(learn)/ai-coding/[stage]/page.tsx` — 改用 `LectureMarkdown`，传 `stage.content`
- 修改 `community/package.json` — 新增 3 个依赖

> 列表页 `ai-coding/page.tsx` 仅消费 `getStages()` 的元数据字段（title/tagline/objectives/accent/order），加载器保持签名后**无需改动**。

---

## Task 1: 安装依赖

**Files:**
- Modify: `community/package.json`

- [ ] **Step 1: 安装三个依赖**

Run（在 community 目录）：
```bash
cd community && pnpm add react-markdown remark-gfm gray-matter
```
Expected: `package.json` 的 `dependencies` 新增 `react-markdown` / `remark-gfm` / `gray-matter`，`pnpm-lock.yaml` 更新，无报错。

- [ ] **Step 2: 确认安装**

Run：
```bash
cd community && pnpm ls react-markdown remark-gfm gray-matter
```
Expected: 三个包各显示一个已解析版本号。

- [ ] **Step 3: Commit**

```bash
git add community/package.json community/pnpm-lock.yaml
git commit -m "build(community): 新增 markdown 渲染依赖 react-markdown/remark-gfm/gray-matter"
```

---

## Task 2: 本地 remark 告警插件

把 GFM 告警块 `> [!NOTE] / [!WARNING] / [!TIP]` 转换为带 `data-callout` 类名的 blockquote，并剥离 `[!TYPE]` 标记文本。零外部依赖，手动递归 mdast，不使用 `unist-util-visit`。

**Files:**
- Create: `community/src/lib/content/remark-callout.ts`

- [ ] **Step 1: 写插件实现**

`community/src/lib/content/remark-callout.ts`：
```ts
// 本地 remark 插件：把 GFM 告警块（> [!NOTE] 等）转成带 tone 类名的 blockquote。
// 设计取舍：手动遍历 mdast，避免引入 unist-util-visit / 第三方告警插件依赖。

// mdast 节点的最小结构描述（仅用到本插件需要的字段）
interface MdNode {
  type: string
  value?: string
  children?: MdNode[]
  data?: { hProperties?: Record<string, string> }
}

// 告警标记 → callout tone（与既有视觉一致：NOTE=info，WARNING=warn，TIP=tip）
const ALERT_TO_TONE: Record<string, 'info' | 'warn' | 'tip'> = {
  NOTE: 'info',
  WARNING: 'warn',
  TIP: 'tip',
}

const MARKER = /^\[!(NOTE|WARNING|TIP)\]\s*/

// 处理单个 blockquote：若首段以告警标记开头，则记录 tone 并剥离标记文本
function applyAlert(node: MdNode): void {
  const firstPara = node.children?.[0]
  if (!firstPara || firstPara.type !== 'paragraph') return
  const firstText = firstPara.children?.[0]
  if (!firstText || firstText.type !== 'text' || typeof firstText.value !== 'string') return

  const match = firstText.value.match(MARKER)
  if (!match) return

  const tone = ALERT_TO_TONE[match[1]]
  // 剥离标记文本；若标记后整行为空，则删掉这个空文本节点
  firstText.value = firstText.value.replace(MARKER, '')
  if (firstText.value === '') firstPara.children!.shift()
  // 若紧随的是软换行（break），一并删除，避免正文顶部空行
  if (firstPara.children![0]?.type === 'break') firstPara.children!.shift()

  node.data = node.data ?? {}
  node.data.hProperties = { ...(node.data.hProperties ?? {}), 'data-callout': tone }
}

function walk(node: MdNode): void {
  if (node.type === 'blockquote') applyAlert(node)
  node.children?.forEach(walk)
}

// remark 插件入口：返回作用于 mdast root 的 transformer
export default function remarkCallout() {
  return (tree: MdNode) => {
    walk(tree)
  }
}
```

- [ ] **Step 2: 类型检查通过**

Run：
```bash
cd community && pnpm exec tsc --noEmit
```
Expected: 无与 `remark-callout.ts` 相关的类型错误（项目 `strict: false`，下同）。

- [ ] **Step 3: Commit**

```bash
git add community/src/lib/content/remark-callout.ts
git commit -m "feat(community): 新增本地 remark 告警插件（零依赖）"
```

---

## Task 3: 内容加载器与类型改造

把 `ai-coding.ts` 的内联讲义数据替换为「读 `.md` 目录 + gray-matter 解析 + 校验」的加载器，保持对外函数签名不变。

**Files:**
- Modify: `community/src/lib/content/ai-coding.ts`

- [ ] **Step 1: 重写 ai-coding.ts**

完整替换 `community/src/lib/content/ai-coding.ts` 内容为：
```ts
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

// 冷调强调色（青→靛家族），给每个阶段一个变体
export type AccentKey = 'cyan' | 'sky' | 'indigo' | 'violet' | 'teal'

export interface Accent {
  hex: string
  rgb: string // "r, g, b" 便于在 rgba() 内插值
  from: string
  to: string
}

export const ACCENTS: Record<AccentKey, Accent> = {
  cyan: { hex: '#22d3ee', rgb: '34, 211, 238', from: '#67e8f9', to: '#0891b2' },
  sky: { hex: '#38bdf8', rgb: '56, 189, 248', from: '#7dd3fc', to: '#0284c7' },
  indigo: { hex: '#6366f1', rgb: '99, 102, 241', from: '#818cf8', to: '#4338ca' },
  violet: { hex: '#8b5cf6', rgb: '139, 92, 246', from: '#a78bfa', to: '#6d28d9' },
  teal: { hex: '#2dd4bf', rgb: '45, 212, 191', from: '#5eead4', to: '#0d9488' },
}

export interface Stage {
  slug: string
  order: number
  title: string
  tagline: string
  summary: string
  accent: AccentKey
  objectives: string[]
  content: string // 原始 markdown 正文
}

const CN_NUMERALS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'] as const

// 阶段中文序号标签：第一阶段 / 第二阶段……（超过 10 退化为数字）
export function stageLabel(order: number): string {
  return `第${CN_NUMERALS[order] ?? order}阶段`
}

const CONTENT_DIR = path.join(process.cwd(), 'src/content/ai-coding')
const ACCENT_KEYS: AccentKey[] = ['cyan', 'sky', 'indigo', 'violet', 'teal']

// 校验单个文件的 frontmatter，非法即抛错（禁止静默兜底），错误信息带文件名
function parseStageFile(filename: string): Stage {
  const slug = filename.replace(/\.md$/, '')
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8')
  const { data, content } = matter(raw)

  const where = `content/ai-coding/${filename}`
  const required = ['order', 'title', 'tagline', 'summary', 'accent', 'objectives'] as const
  for (const key of required) {
    if (data[key] === undefined || data[key] === null) {
      throw new Error(`[ai-coding] ${where} 缺少必填 frontmatter 字段：${key}`)
    }
  }
  if (typeof data.order !== 'number') {
    throw new Error(`[ai-coding] ${where} 的 order 必须是数字，实际：${typeof data.order}`)
  }
  if (!ACCENT_KEYS.includes(data.accent)) {
    throw new Error(`[ai-coding] ${where} 的 accent 非法：${data.accent}（应为 ${ACCENT_KEYS.join('|')}）`)
  }
  if (!Array.isArray(data.objectives) || data.objectives.some((o: unknown) => typeof o !== 'string')) {
    throw new Error(`[ai-coding] ${where} 的 objectives 必须是字符串数组`)
  }

  return {
    slug,
    order: data.order,
    title: String(data.title),
    tagline: String(data.tagline),
    summary: String(data.summary),
    accent: data.accent,
    objectives: data.objectives,
    content,
  }
}

// 模块级缓存：构建期/ISR 读取一次即可
let cachedStages: Stage[] | null = null

function loadStages(): Stage[] {
  if (cachedStages) return cachedStages
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'))
  if (files.length === 0) {
    throw new Error(`[ai-coding] 内容目录为空：${CONTENT_DIR}`)
  }
  const stages = files.map(parseStageFile).sort((a, b) => a.order - b.order)

  // order 冲突检查：重复 order 会让排序与「第N阶段」标签产生歧义
  const seen = new Map<number, string>()
  for (const s of stages) {
    const dup = seen.get(s.order)
    if (dup) throw new Error(`[ai-coding] order 冲突：${dup}.md 与 ${s.slug}.md 都是 order=${s.order}`)
    seen.set(s.order, s.slug)
  }

  cachedStages = stages
  return stages
}

export function getStages(): Stage[] {
  return loadStages()
}

export function getStage(slug: string): Stage | null {
  return loadStages().find((s) => s.slug === slug) ?? null
}

export function getStageSlugs(): string[] {
  return loadStages().map((s) => s.slug)
}

export function getAdjacentStages(slug: string): { prev: Stage | null; next: Stage | null } {
  const ordered = loadStages()
  const idx = ordered.findIndex((s) => s.slug === slug)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? ordered[idx - 1] : null,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : null,
  }
}
```

> 注意：此步删除了 `LectureBlock` 类型与 `STAGES` 内联数组。`LectureBlocks.tsx` 仍引用旧类型，会在此步后出现编译错误——属预期，Task 5/6 修复。

- [ ] **Step 2: 类型检查（预期 LectureBlocks 报错）**

Run：
```bash
cd community && pnpm exec tsc --noEmit
```
Expected: 仅剩 `LectureBlocks.tsx` 因引用已删除的 `LectureBlock` 而报错；`ai-coding.ts` 本身无错。该报错将在 Task 5 消除。

- [ ] **Step 3: 暂不提交**

留待 Task 4 写入 `.md` 内容、Task 5 修复组件后，于 Task 6 统一验证再提交，避免中途 build 不通过。

---

## Task 4: 迁移三个阶段内容到 .md

把 `ai-coding.ts` 原 `STAGES` 数组中三个阶段的 `lecture` 块逐条转为 GFM，元数据写入 frontmatter。源文本以本仓库改动前的 `ai-coding.ts`（git 历史 `HEAD` 版本）为准，**逐字保留，不得改写措辞**。

**块 → markdown 映射规则：**
- `{ type: 'heading', text }` → `## {text}`
- `{ type: 'paragraph', text }` → 独立成段的 `{text}`
- `{ type: 'list', items }`（无 ordered）→ 每条 `- {item}`
- `{ type: 'code', lang, code }` → ```` ```{lang} ```` 围栏包裹 `{code}`（保留换行）
- `{ type: 'callout', tone: 'info' }` → `> [!NOTE]` + 换行 `> {text}`
- `{ type: 'callout', tone: 'warn' }` → `> [!WARNING]` + 换行 `> {text}`
- `{ type: 'callout', tone: 'tip' }` → `> [!TIP]` + 换行 `> {text}`
- `{ type: 'image', src, alt, caption }` → `![{alt}]({src} "{caption}")`（无 caption 则省略引号部分）

**Files:**
- Create: `community/src/content/ai-coding/ai-tools.md`
- Create: `community/src/content/ai-coding/frontend.md`
- Create: `community/src/content/ai-coding/backend.md`

- [ ] **Step 1: 创建 ai-tools.md（派 Agent 搬运长正文）**

正文较长（原 `STAGES[0].lecture` 约 30 个块），按「大批量长文件用 Agent 写」的偏好，**派一个 Agent** 依据上面的映射规则，把改动前 `ai-coding.ts` 中 `slug: 'ai-tools'` 阶段的 `lecture` 逐块转写为 markdown，逐字保留原文。

frontmatter 固定为（与原元数据一致）：
```markdown
---
order: 1
title: AI工具篇
tagline: 认识并跑通主力 AI 编程工具，建立开发世界的认知地基。
summary: 从零认识开发世界，安装并跑通主力 AI 工具，完成第一次「描述—生成—调整」闭环。
accent: cyan
objectives:
  - 用大白话讲清前端、后端、数据库、终端的关系
  - 安装并跑通一款主力 AI 编程工具
  - 设计属于自己的 AI 编程工作流
---
```
frontmatter 之后空一行，接转写后的正文。

Agent 任务提示（dispatch 时使用）：
> 读取本仓库 `git show HEAD:community/src/lib/content/ai-coding.ts` 中 `slug: 'ai-tools'` 阶段的 `lecture` 数组，按计划文档 Task 4 的「块 → markdown 映射规则」逐块转为 GFM，逐字保留中文原文，写入 `community/src/content/ai-coding/ai-tools.md`（保留上面给定的 frontmatter）。不得增删或改写任何句子。

- [ ] **Step 2: 创建 frontend.md**

`community/src/content/ai-coding/frontend.md`：
```markdown
---
order: 2
title: 前端工程篇
tagline: 把页面从「能看」升级为「好维护」的前端工程化能力。
summary: 掌握配色、组件、主题与目录结构，做出美观、响应式、可维护的前端应用。
accent: sky
objectives:
  - 掌握配色、排版、间距等基础设计原则并传达给 AI
  - 用主题变量统一管理颜色、字体、圆角
  - 识别重复结构并抽象为可复用组件
---

（占位）本阶段讲义正文待补充。

## 一、让应用更美观

（占位）配色、排版、间距、对齐的基础原则。
```

- [ ] **Step 3: 创建 backend.md**

`community/src/content/ai-coding/backend.md`：
```markdown
---
order: 3
title: 后端服务篇
tagline: 搭起自己的后端，把前后端打通成一个真正能用的应用。
summary: 理解后端与接口，搭建后端环境，开发第一个接口并完成前后端联调。
accent: indigo
objectives:
  - 理解「数据存哪、接口是什么」
  - 搭建并跑通后端开发环境
  - 开发第一个接口并完成前后端联调排错
---

（占位）本阶段讲义正文待补充。

> [!WARNING]
> （占位）联调排错是历史劝退重灾区，本阶段会系统化拆解。
```

- [ ] **Step 4: 核对 ai-tools.md 与原文一致**

人工对照 `git show HEAD:community/src/lib/content/ai-coding.ts` 的 `ai-tools` 阶段，确认每个块都已转写且文字未被改动（尤其代码块的命令、callout 文案）。

---

## Task 5: Markdown 渲染组件与页面接线

**Files:**
- Create: `community/src/components/LectureMarkdown.tsx`
- Delete: `community/src/components/LectureBlocks.tsx`
- Modify: `community/src/app/(learn)/ai-coding/[stage]/page.tsx`

- [ ] **Step 1: 写 LectureMarkdown.tsx**

`community/src/components/LectureMarkdown.tsx`：
```tsx
import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkCallout from '@/lib/content/remark-callout'

// data-callout 取值 → callout 容器样式（与原 LectureBlocks 三色一致）
const CALLOUT_STYLES: Record<'info' | 'warn' | 'tip', string> = {
  info: 'border-sky/40 bg-sky/10',
  warn: 'border-amber/40 bg-amber/10',
  tip: 'border-line-strong bg-white/5',
}

export default function LectureMarkdown({
  content,
  accent = '#22d3ee',
}: {
  content: string
  accent?: string
}) {
  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkCallout]}
        components={{
          h2: ({ children }) => (
            <h2 className="mt-10 flex items-center gap-3 font-display text-2xl font-medium text-ink">
              <span className="h-5 w-1 flex-none rounded-pill" style={{ background: accent }} />
              {children}
            </h2>
          ),
          p: ({ children }) => <p className="mt-4 leading-relaxed text-ink-2">{children}</p>,
          ul: ({ children }) => (
            <ul className="mt-4 space-y-2 pl-5 text-ink-2 list-disc">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mt-4 space-y-2 pl-5 text-ink-2 list-decimal">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          // 代码块：react-markdown 把围栏代码渲染为 pre > code；行内代码无 pre 包裹
          pre: ({ children }) => (
            <pre className="mt-4 overflow-x-auto rounded-card border border-line bg-surface p-4 text-sm">
              {children}
            </pre>
          ),
          code: ({ children, className }) => (
            <code className={`font-mono text-ink-2 ${className ?? ''}`}>{children}</code>
          ),
          // 告警块：remarkCallout 在 blockquote 上挂了 data-callout；无则普通引用
          blockquote: (props: ComponentPropsWithoutRef<'blockquote'> & { 'data-callout'?: string }) => {
            const tone = props['data-callout'] as 'info' | 'warn' | 'tip' | undefined
            if (tone) {
              return (
                <div
                  className={`mt-4 rounded-card border p-4 text-sm leading-relaxed text-ink-2 ${CALLOUT_STYLES[tone]}`}
                >
                  {props.children}
                </div>
              )
            }
            return (
              <blockquote className="mt-4 border-l-2 border-line pl-4 text-ink-2">
                {props.children}
              </blockquote>
            )
          },
          img: ({ src, alt, title }) => (
            <figure className="mt-6">
              <img src={typeof src === 'string' ? src : ''} alt={alt ?? ''} className="w-full rounded-card border border-line" />
              {title && <figcaption className="mt-2 text-center text-xs text-mute">{title}</figcaption>}
            </figure>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
```

- [ ] **Step 2: 删除旧组件**

Run：
```bash
git rm community/src/components/LectureBlocks.tsx
```
Expected: 文件被删除并暂存。

- [ ] **Step 3: 改详情页引用**

在 `community/src/app/(learn)/ai-coding/[stage]/page.tsx`：
- 把 `import LectureBlocks from '@/components/LectureBlocks'` 改为
  `import LectureMarkdown from '@/components/LectureMarkdown'`
- 把渲染处
  ```tsx
  <LectureBlocks blocks={stage.lecture} accent={a.hex} />
  ```
  改为
  ```tsx
  <LectureMarkdown content={stage.content} accent={a.hex} />
  ```

- [ ] **Step 4: 类型检查通过**

Run：
```bash
cd community && pnpm exec tsc --noEmit
```
Expected: 无错误（`LectureBlock` 已无引用）。

---

## Task 6: 验证与提交

**Files:**（无新增，验证 Task 3–5 的产物）

- [ ] **Step 1: Lint**

Run：
```bash
cd community && pnpm lint
```
Expected: 无 error（既有 warning 可接受）。

- [ ] **Step 2: 构建通过（验证加载与静态参数）**

Run：
```bash
cd community && pnpm build
```
Expected: 构建成功；`/ai-coding/[stage]` 为三个 slug 生成静态页，无运行时报错。

- [ ] **Step 3: 故意制造非法 frontmatter，验证报错（禁止静默兜底）**

临时把 `community/src/content/ai-coding/backend.md` 的 `accent: indigo` 改为 `accent: pink`，再次构建：
```bash
cd community && pnpm build
```
Expected: 构建**失败**，错误信息含 `content/ai-coding/backend.md 的 accent 非法：pink`。确认后**还原**该字段为 `accent: indigo`。

- [ ] **Step 4: 页面人工验证**

Run：
```bash
cd community && pnpm dev
```
浏览器访问 `http://localhost:8666/ai-coding` 与 `http://localhost:8666/ai-coding/ai-tools`，确认：
- 列表页三张阶段卡片、序号、objectives 正常。
- 详情页标题左侧 accent 竖条、三色 callout、代码块、上/下阶段导航与改动前观感一致。
- `frontend`、`backend` 占位页正常渲染（backend 的 `[!WARNING]` 显示为 warn 色 callout）。

- [ ] **Step 5: Commit**

```bash
git add community/src/content community/src/lib/content/ai-coding.ts \
        community/src/components/LectureMarkdown.tsx \
        "community/src/app/(learn)/ai-coding/[stage]/page.tsx"
git add -u community/src/components/LectureBlocks.tsx
git commit -m "feat(community): AI 编程章节改为 Markdown 文件渲染"
```

---

## Self-Review（计划自检）

- **Spec 覆盖：**
  - 内容目录 / 一文件一阶段 / slug 来自文件名 → Task 4、Task 3。
  - frontmatter 元数据 + GFM 正文 + 三种告警 + 图注 title → Task 2、Task 4、Task 5。
  - react-markdown + remark-gfm + gray-matter（3 依赖）→ Task 1。
  - 加载器保持 `getStages/...` 签名、`content: string`、删除 `LectureBlock` → Task 3。
  - `LectureBlocks.tsx`→`LectureMarkdown.tsx`、页面接线 → Task 5。
  - 构建期校验非法 frontmatter、不静默兜底 → Task 3（实现）、Task 6 Step 3（验证）。
  - 内容迁移、stage-1 派 Agent → Task 4。
  - 验证（构建 + 页面）→ Task 6。
  - **偏差（已在顶部说明并获共识）：** 设计文档的「loader 单测」因 community 无测试框架、避免新增依赖，改为构建期 + 故意非法文件验证。
- **占位扫描：** 无 TBD/TODO 类计划占位；`.md` 里的「（占位）」是业务内容本身（源数据即占位），非计划缺失。
- **类型一致性：** `Stage.content`、`AccentKey`、`ACCENTS`、`getStages/getStage/getStageSlugs/getAdjacentStages`、`remarkCallout`、`data-callout`/tone 在各 Task 间命名一致。
