# 官网首页重构实施计划（隐藏全部旧页面 + 浅色单页首页）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal：** 把 `website` 官网除首页外的全部页面（含登录）对外隐藏且代码保留，同时把首页重做为参考 trillo.framer.ai 的浅色暖白单页，业务主题仍为软件定制服务。

**Architecture：** 在 `globals.css` 追加一套与深色 token 完全不重名的浅色 token；新建 `components/pages/home/` 目录，先落 4 个 UI 原子把圆角/阴影/按钮规格固化，再用原子组装 9 个 section；`(site)/layout.tsx` 精简为只渲染 children，首页自带浅色导航与页脚；`middleware.ts` 精简为「非 `/` 路径 307 回首页」。旧页面与旧组件文件一个都不删。

**Tech Stack：** Next.js 15.5.15（App Router）、React 19、Tailwind CSS 4.2.2、framer-motion、TypeScript、pnpm

**对应设计文档：** `docs/superpowers/specs/2026-08-11-website-home-refactor-design.md`

## Global Constraints

- **工作目录**：所有命令都在 `website/` 下执行（`cd D:\code\weelume-base\website`）。
- **不写组件级测试**：项目 `CLAUDE.md` 明确「前端不要求编写组件级测试」，「前端改动必须至少通过页面运行、关键交互或浏览器日志验证」。因此本计划的每个任务用 `npx tsc --noEmit` + `npx eslint` + 浏览器实际渲染核对代替 TDD 红绿循环。**不要为本计划创建任何前端测试文件。**
- **禁止修改的文件**：`src/components/pages/custom-software/` 目录下全部文件、`src/components/layout/TopNav.tsx`、`src/components/layout/SiteFooter.tsx`、`src/components/layout/ContactQrCodeModal.tsx`、`src/features/auth/` 下全部文件。这些要原样保留供将来恢复板块时使用。
- **禁止删除**任何现有页面目录或组件文件。
- **禁止新增依赖**，包括字体包。`--font-sans` / `--font-display` 字体栈保持原样不改。
- **深色 token 不改名不删除**：`--color-ink` / `--color-canvas` / `--color-surface` / `--color-hairline` 等全部保留原值。
- **橙色配额（硬约束）**：`ember` 橙色只允许出现在三处——服务卡片编号数字、合作流程当前态节点圆点、页脚状态点。主按钮一律用 `graphite` 黑底。
- **阴影配额（硬约束）**：只允许用 `shadow-soft` 与 `shadow-soft-lg` 两个 token，禁止在 section 里手写 `shadow-[...]`。
- **注释语言为中文**，只给非显然的设计决策与架构边界加注释，不给简单赋值加注释。
- **禁止 `any`**。
- **标题字距**：中文标题一律 `tracking-[-0.02em]`，**不要**照抄参考站的 `-4px`。
- **明确不做（YAGNI）**：不做客户 logo 墙、客户评价、定价表、FAQ（无真实素材，不硬造），不做暗色模式切换。参考站有这几段，但本站没有对应素材。
- **工作区已有未提交改动**：本计划开始前，`website/` 与 `server/` 下已存在大量用户未提交的改动。因此每个任务的 `git add` 都**只列举明确路径**，禁止 `git add -A` / `git add .`。若某个待改文件本身已带用户未提交改动（已知 `src/app/(site)/page.tsx` 就是这种情况），提交前必须先向用户确认是否连带提交，不得自行决定。
- **提交信息格式**：`<type>(website): <中文描述>`，结尾附 `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`。

---

### Task 1: 浅色设计令牌 + UI 原子层

**Files:**
- Modify: `src/app/globals.css`（在 `@theme` 块内追加，约 33 行前）
- Create: `src/components/pages/home/ui/Button.tsx`
- Create: `src/components/pages/home/ui/Pill.tsx`
- Create: `src/components/pages/home/ui/SectionHeading.tsx`
- Create: `src/components/pages/home/ui/Card.tsx`
- Create: `src/components/pages/home/ui/index.ts`

**Interfaces:**
- Consumes: 无（首个任务）
- Produces:
  - Tailwind 工具类：`bg-paper` / `bg-paper-raised` / `text-graphite` / `text-graphite-soft` / `text-graphite-dim` / `border-rule` / `border-rule-strong` / `text-ember` / `bg-ember` / `rounded-btn` / `rounded-card` / `shadow-soft` / `shadow-soft-lg`
  - `Button({ variant?: 'primary' | 'secondary', className?: string, children: ReactNode, ...ButtonHTMLAttributes })`
  - `ButtonLink({ href: string, variant?: 'primary' | 'secondary', className?: string, children: ReactNode, ...AnchorHTMLAttributes })`
  - `Pill({ children: ReactNode, className?: string })`
  - `SectionHeading({ eyebrow?: string, title: ReactNode, description?: string, align?: 'center' | 'left', className?: string })`
  - `Card({ children: ReactNode, className?: string, interactive?: boolean })`
  - 全部从 `@/components/pages/home/ui` barrel 导出

- [ ] **Step 1: 在 `globals.css` 的 `@theme` 块内追加浅色令牌**

打开 `src/app/globals.css`，找到 `--radius-pill: 9999px;` 这一行（约第 32 行，`@theme` 块的最后一个声明），在它**之后**、闭合的 `}` 之前插入：

```css

  /* ===== 浅色首页令牌（参考 trillo.framer.ai）=====
     命名与深色 token（ink / canvas / surface / hairline）完全不重叠，两套共存。
     被隐藏但保留的旧页面继续用深色 token，不受影响。 */
  --color-paper: #f7f7f5;
  --color-paper-raised: #ffffff;
  --color-graphite: #0e0e0e;
  --color-graphite-soft: #44443f;
  --color-graphite-dim: #8a8a80;
  --color-rule: rgb(14 14 14 / 0.09);
  --color-rule-strong: rgb(14 14 14 / 0.16);
  --color-ember: #ff3c00;

  --radius-btn: 12px;
  --radius-card: 24px;

  /* 阴影只开放这两档，杜绝各 section 自行发明阴影导致规格漂移 */
  --shadow-soft: 0 1px 2px rgb(14 14 14 / 0.04), 0 8px 24px rgb(14 14 14 / 0.05);
  --shadow-soft-lg: 0 2px 4px rgb(14 14 14 / 0.05), 0 16px 40px rgb(14 14 14 / 0.08);
```

**不要**改动 `@theme` 块里已有的任何一行。

- [ ] **Step 2: 创建 `Button.tsx`**

创建 `src/components/pages/home/ui/Button.tsx`：

```tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary'

// 按钮规格集中在此：圆角与内边距取自参考站实测值（radius 12px / padding 14px 22px）。
// primary 走黑底，橙色不用于按钮——橙色配额只留给编号、流程节点与状态点。
const BASE_CLASS =
  'inline-flex items-center justify-center gap-2 rounded-btn px-[22px] py-[14px] text-[14px] font-medium leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember'

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-graphite text-paper hover:bg-graphite-soft',
  secondary: 'border border-rule bg-paper-raised text-graphite hover:border-rule-strong',
}

type SharedProps = {
  variant?: ButtonVariant
  className?: string
  children: ReactNode
}

type ButtonProps = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>

type ButtonLinkProps = SharedProps & { href: string } &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'>

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  type = 'button',
  ...rest
}: ButtonProps) => (
  <button type={type} className={`${BASE_CLASS} ${VARIANT_CLASS[variant]} ${className}`} {...rest}>
    {children}
  </button>
)

// 页内锚点跳转用原生 a，不走 next/link：next/link 对 hash 锚点没有额外价值。
export const ButtonLink = ({
  variant = 'primary',
  className = '',
  children,
  href,
  ...rest
}: ButtonLinkProps) => (
  <a href={href} className={`${BASE_CLASS} ${VARIANT_CLASS[variant]} ${className}`} {...rest}>
    {children}
  </a>
)
```

- [ ] **Step 3: 创建 `Pill.tsx`**

创建 `src/components/pages/home/ui/Pill.tsx`：

```tsx
import type { ReactNode } from 'react'

type PillProps = {
  children: ReactNode
  className?: string
}

export const Pill = ({ children, className = '' }: PillProps) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full bg-paper-raised px-4 py-2 text-[13px] text-graphite-soft shadow-soft ${className}`}
  >
    {children}
  </span>
)
```

- [ ] **Step 4: 创建 `SectionHeading.tsx`**

创建 `src/components/pages/home/ui/SectionHeading.tsx`：

```tsx
import type { ReactNode } from 'react'

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  description?: string
  align?: 'center' | 'left'
  className?: string
}

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeadingProps) => {
  const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <div className={`flex flex-col ${alignClass} ${className}`}>
      {eyebrow && (
        <span className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-graphite-dim">
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-[24ch] text-[clamp(1.75rem,3.6vw,2.75rem)] font-semibold leading-[1.18] tracking-[-0.02em] text-graphite">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.75] text-graphite-soft">
          {description}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 5: 创建 `Card.tsx`**

创建 `src/components/pages/home/ui/Card.tsx`：

```tsx
import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  interactive?: boolean
}

// 全站唯一的卡片规格。interactive 时 hover 微抬一档，阴影只在 shadow-soft / shadow-soft-lg 之间切换。
export const Card = ({ children, className = '', interactive = false }: CardProps) => (
  <div
    className={[
      'rounded-card bg-paper-raised p-6 shadow-soft',
      interactive
        ? 'transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-soft-lg'
        : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    {children}
  </div>
)
```

- [ ] **Step 6: 创建 barrel `index.ts`**

创建 `src/components/pages/home/ui/index.ts`：

```ts
export { Button, ButtonLink } from './Button'
export { Card } from './Card'
export { Pill } from './Pill'
export { SectionHeading } from './SectionHeading'
```

- [ ] **Step 7: 类型检查**

Run: `npx tsc --noEmit`
Expected: 无输出（退出码 0）

- [ ] **Step 8: Lint 检查**

Run: `npx eslint src/components/pages/home`
Expected: 无输出（退出码 0）

- [ ] **Step 9: 提交**

```bash
git add src/app/globals.css src/components/pages/home/ui
git commit -m "$(cat <<'EOF'
feat(website): 新增浅色设计令牌与首页 UI 原子层

追加 paper/graphite/rule/ember 一组浅色 token 与 radius/shadow 规格，
与深色 token 不重名、两套共存；落 Button/Pill/SectionHeading/Card 四个原子，
把圆角、阴影、按钮内边距固化在原子内部，避免各 section 手写样式漂移。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: 全局基础样式转浅色 + 导航/页脚/首页骨架

**Files:**
- Modify: `src/app/globals.css`（`html, body` 规则约 45-58 行、`::selection` 约 85-88 行、`::-webkit-scrollbar-thumb` 约 98-107 行）
- Modify: `src/app/layout.tsx`（`<body>` 的 className，约 131 行）
- Modify: `src/app/(site)/layout.tsx`（整个文件重写）
- Modify: `src/app/(site)/page.tsx`（改 import 与渲染目标，metadata 保持不动）
- Create: `src/components/pages/home/HomeNav.tsx`
- Create: `src/components/pages/home/HomeFooter.tsx`
- Create: `src/components/pages/home/ContactModal.tsx`
- Create: `src/components/pages/home/HomeContent.tsx`

**Interfaces:**
- Consumes: Task 1 的 `Button`（从 `./ui` 导入）与 `bg-paper` / `text-graphite` / `border-rule` / `bg-ember` / `rounded-card` / `shadow-soft-lg` 工具类
- Produces:
  - `HomeNav({ onContact: () => void })` — sticky 浅色导航，含锚点 `#services` / `#why-us` / `#process`
  - `HomeFooter()` — 无 props
  - `ContactModal({ open: boolean, onClose: () => void })` — 浅色咨询二维码弹窗
  - `HomeContent()` — 无 props，内部持有 `contactOpen` 状态与 `openContact` / `closeContact` 回调；后续任务往 `<main>` 里按顺序插 section，并把新的咨询入口接到 `openContact`
  - 页面锚点 id 约定：Hero 为 `#top`，服务为 `#services`，优势为 `#why-us`，流程为 `#process`

- [ ] **Step 1: `globals.css` 的 `html, body` 底色换成浅色**

在 `src/app/globals.css` 中找到：

```css
html,
body {
  margin: 0;
  padding: 0;
  min-height: 100%;
  background-color: var(--color-canvas);
  color: var(--color-ink);
```

把其中两行改为：

```css
  background-color: var(--color-paper);
  color: var(--color-graphite);
```

其余行保持不动。

- [ ] **Step 2: `::selection` 与滚动条换成浅色**

在同一文件中找到 `::selection` 规则并整块替换为：

```css
::selection {
  background-color: rgb(255 60 0 / 0.18);
  color: var(--color-graphite);
}
```

再找到全局滚动条那三条规则（注释为 `/* Global scrollbar — subtle, matches the dark surface */`），把注释与两个 thumb 规则替换为：

```css
/* Global scrollbar — 浅色底上的低对比滑块 */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgb(14 14 14 / 0.14);
  border-radius: 9999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover {
  background: rgb(14 14 14 / 0.26);
  background-clip: padding-box;
}
```

**注意**：`@utility scrollbar-thin` 里的白色滑块保持不动——那是课程页等隐藏页面在用的作用域工具类。

- [ ] **Step 3: 根 `layout.tsx` 的 `<body>` 换色**

在 `src/app/layout.tsx` 中把：

```tsx
      <body className="relative min-h-screen bg-canvas font-sans text-ink">{children}</body>
```

改为：

```tsx
      <body className="relative min-h-screen bg-paper font-sans text-graphite">{children}</body>
```

本步只改这一行，metadata 与 JSON-LD 留给 Task 8。

- [ ] **Step 4: 重写 `(site)/layout.tsx`**

把 `src/app/(site)/layout.tsx` 整个文件替换为：

```tsx
// 官网当前只对外开放首页（见 middleware.ts）。首页自带浅色导航与页脚
// （components/pages/home/HomeNav.tsx、HomeFooter.tsx），因此这里不再渲染
// 全站深色 TopNav / SiteFooter，也不再读取登录态。
//
// 恢复 studio / ai-coding-camp 等板块时，把下面三样接回来即可（文件都保留未删）：
//   import { SiteFooter } from '@/components/layout/SiteFooter'
//   import { TopNav } from '@/components/layout/TopNav'
//   import { getWebsiteAuthState } from '@/features/auth/server/session'
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative flex min-h-screen flex-col">{children}</div>
}
```

- [ ] **Step 5: 创建 `HomeNav.tsx`**

创建 `src/components/pages/home/HomeNav.tsx`：

```tsx
'use client'

import { useEffect, useState } from 'react'

import { Button } from './ui'

// 单页站的导航即页内锚点。无登录入口——登录已随其他板块一并隐藏。
const ANCHORS: Array<{ label: string; href: string }> = [
  { label: '服务', href: '#services' },
  { label: '优势', href: '#why-us' },
  { label: '流程', href: '#process' },
]

type HomeNavProps = {
  onContact: () => void
}

export const HomeNav = ({ onContact }: HomeNavProps) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-30 w-full">
      <div
        className={[
          'transition-all duration-300',
          scrolled
            ? 'border-b border-rule bg-paper/80 backdrop-blur-xl'
            : 'border-b border-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2">
            <img src="/logo/weiyu-logo-primary.svg" alt="微域生光" className="h-9 w-9" />
            <span className="text-[15px] font-semibold tracking-tight text-graphite">微域生光</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {ANCHORS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-1.5 text-[14px] text-graphite-soft transition-colors hover:text-graphite"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <Button onClick={onContact} className="px-4 py-2.5 text-[13px]">
            聊聊需求
          </Button>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 6: 创建 `HomeFooter.tsx`**

创建 `src/components/pages/home/HomeFooter.tsx`：

```tsx
export const HomeFooter = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <img src="/logo/weiyu-logo-primary.svg" alt="微域生光" className="h-8 w-8" />
          <span className="text-[14px] font-semibold tracking-tight text-graphite">微域生光</span>
        </div>
        <div className="flex flex-col gap-2 text-[12px] text-graphite-dim sm:flex-row sm:items-center sm:gap-6">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-ember" />
            正在接收新的合作申请
          </span>
          <span>© {year} 微域生光</span>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 7: 创建 `ContactModal.tsx`**

创建 `src/components/pages/home/ContactModal.tsx`。交互逻辑（ESC 关闭、点遮罩关闭、`/contact.jpg` 二维码）与现有深色弹窗一致，只是换成浅色着色：

```tsx
'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ContactModalProps = {
  open: boolean
  onClose: () => void
}

// 浅色版咨询弹窗。深色版 components/layout/ContactQrCodeModal.tsx 原样保留供旧页面恢复时使用，
// 这里不复用它是因为它整体按深色 token 着色，在浅色首页上会弹出一个黑色面板。
export const ContactModal = ({ open, onClose }: ContactModalProps) => {
  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="contact-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-graphite/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="contact-panel"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="pointer-events-auto relative w-full max-w-sm rounded-card bg-paper-raised p-6 shadow-soft-lg">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-rule text-graphite-dim transition-colors hover:text-graphite"
                aria-label="关闭"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                </svg>
              </button>

              <h2 className="text-center text-[17px] font-semibold text-graphite">联系我们</h2>

              <div className="mx-auto mt-5 flex h-72 w-72 items-center justify-center overflow-hidden rounded-btn border border-rule bg-white p-2">
                <img
                  src="/contact.jpg"
                  alt="微信联系人二维码"
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>

              <p className="mt-4 text-center text-[12px] text-graphite-dim">
                打开微信扫一扫，添加联系人
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

面板容器加 `pointer-events-none`、面板本体加 `pointer-events-auto`，这样点击面板外的空白能穿透到下层遮罩触发关闭。

- [ ] **Step 8: 创建 `HomeContent.tsx` 骨架**

创建 `src/components/pages/home/HomeContent.tsx`。本任务挂上导航、页脚与咨询弹窗（导航的「聊聊需求」立刻可用），`<main>` 里先放一个占位段落，后续任务逐个替换为真实 section：

```tsx
'use client'

import { useState } from 'react'

import { ContactModal } from './ContactModal'
import { HomeFooter } from './HomeFooter'
import { HomeNav } from './HomeNav'

export const HomeContent = () => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-paper text-graphite">
      <HomeNav onContact={openContact} />
      <main className="flex-1">
        <p className="mx-auto max-w-6xl px-4 py-32 text-center text-graphite-dim sm:px-6">
          骨架占位：Task 3 起替换为真实 section
        </p>
      </main>
      <HomeFooter />
      <ContactModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
```

- [ ] **Step 9: `(site)/page.tsx` 指向新首页**

修改 `src/app/(site)/page.tsx`：把第 2 行的 import 与 `HomePage` 的返回值改掉，**`metadata` 整块保持原样不动**：

```tsx
import type { Metadata } from 'next'
import { HomeContent } from '@/components/pages/home/HomeContent'
```

```tsx
export default function HomePage() {
  return <HomeContent />
}
```

- [ ] **Step 10: 类型检查与 lint**

Run: `npx tsc --noEmit && npx eslint src/components/pages/home "src/app/(site)" src/app/layout.tsx`
Expected: 无输出（退出码 0）

- [ ] **Step 11: 起开发服务器，浏览器核对**

Run: `pnpm dev`（后台运行，默认 http://localhost:3000）

在浏览器打开 http://localhost:3000 ，确认：
1. 页面底色是暖白（不是黑色）
2. 顶部有 logo「微域生光」+ 服务/优势/流程三个锚点 + 右侧黑色胶囊「聊聊需求」
3. **导航里没有「登录」入口**
4. 向下滚动后导航出现毛玻璃与底部细线
5. 页脚有 logo、橙色状态点「正在接收新的合作申请」、版权
6. logo 在浅底上清晰可见（深色菱形），不是糊掉的米色
7. 点导航「聊聊需求」弹出**浅色**面板、二维码图片正常显示；ESC、点遮罩、点右上角 × 三种方式都能关闭
8. 浏览器控制台无报错

- [ ] **Step 12: 提交**

`src/app/(site)/page.tsx` 在本计划开始前就带有用户未提交的改动。**提交前先向用户确认是否连带提交该文件**（见 Global Constraints）。确认后：

```bash
git add src/app/globals.css src/app/layout.tsx "src/app/(site)/layout.tsx" "src/app/(site)/page.tsx" src/components/pages/home
git commit -m "$(cat <<'EOF'
feat(website): 全局基础样式转浅色，首页改为自带浅色导航、页脚与咨询弹窗

html/body 底色、滚动条、::selection 与 body class 由深色改为 paper/graphite；
(site)/layout.tsx 精简为只渲染 children 并去掉登录态读取，TopNav/SiteFooter
文件原样保留；新增 HomeNav（锚点导航、无登录入口）、HomeFooter、浅色 ContactModal
与 HomeContent 骨架。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Hero + 暖光渐变 + 能力条

**Files:**
- Create: `src/components/pages/home/WarmGlow.tsx`
- Create: `src/components/pages/home/Hero.tsx`
- Create: `src/components/pages/home/CapabilityBar.tsx`
- Modify: `src/components/pages/home/HomeContent.tsx`（用真实 section 替换占位段落）

**Interfaces:**
- Consumes: Task 1 的 `Button` / `ButtonLink`；Task 2 的 `HomeContent` 骨架与 `openContact` 回调
- Produces:
  - `WarmGlow()` — 无 props，纯装饰层，需放在 `position: relative` 的父级内
  - `Hero({ onContact: () => void })` — 提供锚点 `id="top"`
  - `CapabilityBar()` — 无 props

- [ ] **Step 1: 创建 `WarmGlow.tsx`**

创建 `src/components/pages/home/WarmGlow.tsx`：

```tsx
// Hero 背景装饰层：三块橙/琥珀色径向渐变 + 大模糊，纯装饰不接收指针事件。
// 刻意不使用卡片或容器——首屏靠留白与光晕撑场，不靠方块结构。
export const WarmGlow = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute left-1/2 top-[-18%] h-[560px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgb(255_60_0/0.14),transparent_68%)] blur-[60px]" />
    <div className="absolute left-[6%] top-[26%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle_at_center,rgb(234_170_8/0.13),transparent_66%)] blur-[70px]" />
    <div className="absolute right-[4%] top-[14%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgb(255_138_76/0.12),transparent_66%)] blur-[70px]" />
  </div>
)
```

- [ ] **Step 2: 创建 `Hero.tsx`**

创建 `src/components/pages/home/Hero.tsx`：

```tsx
import { Button, ButtonLink } from './ui'
import { WarmGlow } from './WarmGlow'

type HeroProps = {
  onContact: () => void
}

export const Hero = ({ onContact }: HeroProps) => (
  // isolate 建立独立层叠上下文，让 WarmGlow 的 -z-10 只压在本 section 内部
  <section id="top" className="relative isolate">
    <WarmGlow />
    <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-32">
      <h1 className="text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-graphite">
        把你的生意
        <br />
        做成一套自己的系统
      </h1>
      <p className="mt-7 max-w-[34ch] text-[16px] leading-[1.8] text-graphite-soft sm:text-[17px]">
        从聊需求到上线运营，全流程由同一支团队闭环交付。官网、企业系统、小程序、AI 智能体，11 类软件定制。
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onContact}>聊聊需求</Button>
        <ButtonLink href="#services" variant="secondary">
          看服务
        </ButtonLink>
      </div>
    </div>
  </section>
)
```

- [ ] **Step 3: 创建 `CapabilityBar.tsx`**

创建 `src/components/pages/home/CapabilityBar.tsx`。注意这是**一整颗胶囊内含三项**（对齐参考站的 trust badge 条），不是三颗独立 Pill，所以不复用 `Pill` 原子：

```tsx
const CAPABILITIES: string[] = ['全栈自研', '长期可扩展', '不黑箱交付']

export const CapabilityBar = () => (
  <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
    <div className="flex justify-center">
      <div className="flex flex-wrap items-center justify-center rounded-full bg-paper-raised px-3 py-3 shadow-soft">
        {CAPABILITIES.map((item, index) => (
          <span key={item} className="flex items-center">
            {index > 0 && (
              <span aria-hidden className="mx-1 h-1 w-1 rounded-full bg-graphite-dim/50 sm:mx-2" />
            )}
            <span className="px-3 text-[14px] text-graphite-soft sm:px-4 sm:text-[15px]">
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  </section>
)
```

- [ ] **Step 4: 把两个 section 挂进 `HomeContent.tsx`**

修改 `src/components/pages/home/HomeContent.tsx`：删掉占位 `<p>`，改为渲染 Hero 与 CapabilityBar。改完后整个文件是：

```tsx
'use client'

import { useState } from 'react'

import { CapabilityBar } from './CapabilityBar'
import { ContactModal } from './ContactModal'
import { Hero } from './Hero'
import { HomeFooter } from './HomeFooter'
import { HomeNav } from './HomeNav'

export const HomeContent = () => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-paper text-graphite">
      <HomeNav onContact={openContact} />
      <main className="flex-1">
        <Hero onContact={openContact} />
        <CapabilityBar />
      </main>
      <HomeFooter />
      <ContactModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
```

- [ ] **Step 5: 类型检查与 lint**

Run: `npx tsc --noEmit && npx eslint src/components/pages/home`
Expected: 无输出（退出码 0）

- [ ] **Step 6: 浏览器核对**

开发服务器仍在运行，刷新 http://localhost:3000 ，确认：
1. 首屏是巨型两行中文标题，字号明显大（1440 宽下约 80px 以上）
2. 标题背后有暖橙/琥珀色柔光晕，**没有**任何卡片或方块边框
3. 标题下方是副文案，再下方是「聊聊需求」黑胶囊 +「看服务」白底描边按钮
4. 点「看服务」页面滚动（此时 `#services` 还不存在，不跳转也正常，不应报错）
5. 再下方是一整颗白色胶囊，内含「全栈自研 · 长期可扩展 · 不黑箱交付」三项，中间是小圆点
6. 把窗口拉窄到 390px，标题不溢出、无横向滚动条
7. 控制台无报错

- [ ] **Step 7: 提交**

```bash
git add src/components/pages/home
git commit -m "$(cat <<'EOF'
feat(website): 首页 Hero、暖光渐变与能力条

Hero 用巨型中文标题（clamp 2.4-5.5rem、字距 -0.02em）+ 双 CTA + 大面积留白，
背景走 WarmGlow 三块径向渐变柔光，不做产品截图大卡；能力条按参考站 trust badge
做成单颗胶囊内含三项。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 服务矩阵 + 行业清单

**Files:**
- Create: `src/components/pages/home/ServiceGrid.tsx`
- Create: `src/components/pages/home/IndustryStrip.tsx`
- Modify: `src/components/pages/home/HomeContent.tsx`

**Interfaces:**
- Consumes:
  - Task 1 的 `Card` / `SectionHeading` / `Pill`
  - 现有数据 `SERVICES: ServiceItem[]` 与 `INDUSTRIES: string[]`，从 `../custom-software/data` 导入。`ServiceItem` 的字段为 `{ code: string; title: string; hook: string; points: string[]; theme: ThemeKey }`，本任务只用前四个字段，**不使用 `theme`**（那份多彩色板不属于新设计）
- Produces:
  - `ServiceGrid()` — 无 props，提供锚点 `id="services"`
  - `IndustryStrip({ onContact: () => void })` — 无锚点

- [ ] **Step 1: 创建 `ServiceGrid.tsx`**

创建 `src/components/pages/home/ServiceGrid.tsx`：

```tsx
import { SERVICES } from '../custom-software/data'
import { Card, SectionHeading } from './ui'

export const ServiceGrid = () => (
  <section id="services" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
    <SectionHeading
      eyebrow="Services"
      title="11 类软件定制，覆盖你会用到的场景"
      description="从一个官网到一整套企业系统。需求不在列表里也可以直接聊，底层能力是通的。"
    />
    <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((service) => (
        <Card key={service.code} interactive className="flex flex-col">
          <span className="text-[13px] font-medium tracking-[0.08em] text-ember">
            {service.code}
          </span>
          <h3 className="mt-4 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-graphite">
            {service.title}
          </h3>
          <p className="mt-2 text-[14px] leading-relaxed text-graphite-soft">{service.hook}</p>
          <ul className="mt-5 flex flex-col gap-2 border-t border-rule pt-4">
            {service.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-[13px] leading-relaxed text-graphite-dim"
              >
                <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-graphite-dim" />
                {point}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  </section>
)
```

`SectionHeading` 默认 `align="center"`，内部已是 `items-center text-center`，不需要额外传对齐参数。

- [ ] **Step 2: 创建 `IndustryStrip.tsx`**

创建 `src/components/pages/home/IndustryStrip.tsx`。末尾「+ 你的行业」是虚线描边按钮，点击开咨询弹窗，作为「需求不在列表里」的兜底入口：

```tsx
'use client'

import { INDUSTRIES } from '../custom-software/data'
import { Pill, SectionHeading } from './ui'

type IndustryStripProps = {
  onContact: () => void
}

export const IndustryStrip = ({ onContact }: IndustryStripProps) => (
  <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
    <SectionHeading eyebrow="Industries" title="已经在这些行业里落过地" />
    <div className="mt-12 flex flex-wrap justify-center gap-3">
      {INDUSTRIES.map((industry) => (
        <Pill key={industry}>{industry}</Pill>
      ))}
      <button
        type="button"
        onClick={onContact}
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-rule-strong px-4 py-2 text-[13px] text-graphite transition-colors hover:border-ember hover:text-ember"
      >
        + 你的行业
      </button>
    </div>
  </section>
)
```

- [ ] **Step 3: 挂进 `HomeContent.tsx`**

在 `src/components/pages/home/HomeContent.tsx` 中加两个 import：

```tsx
import { IndustryStrip } from './IndustryStrip'
import { ServiceGrid } from './ServiceGrid'
```

并把 `<main>` 内容改为：

```tsx
      <main className="flex-1">
        <Hero onContact={openContact} />
        <CapabilityBar />
        <ServiceGrid />
        <IndustryStrip onContact={openContact} />
      </main>
```

import 按现有字母序插入（`CapabilityBar`、`Hero`、`HomeFooter`、`HomeNav`、`IndustryStrip`、`ServiceGrid`）。

- [ ] **Step 4: 类型检查与 lint**

Run: `npx tsc --noEmit && npx eslint src/components/pages/home`
Expected: 无输出（退出码 0）

- [ ] **Step 5: 浏览器核对**

刷新 http://localhost:3000 ，确认：
1. 服务区共 **11 张**白色卡片，1440 宽下 3 列、768 宽下 2 列、390 宽下 1 列
2. 每张卡片左上角是**橙色**两位编号（01…11），标题、hook、一条细分隔线、三条要点
3. 鼠标悬停卡片时微微上抬且阴影加深
4. 点导航「服务」能平滑滚动到服务区；点 Hero 的「看服务」同样生效
5. 行业区共 **12 颗**白色胶囊 + 末尾一颗虚线描边的「+ 你的行业」
6. 悬停「+ 你的行业」时描边与文字变橙色
7. 控制台无报错

- [ ] **Step 6: 提交**

```bash
git add src/components/pages/home
git commit -m "$(cat <<'EOF'
feat(website): 首页服务矩阵与行业清单

11 类服务走白卡网格（3/2/1 列响应式），编号用橙色、其余走 graphite；
12 个行业以胶囊墙呈现并附「+ 你的行业」兜底入口。数据复用现有
custom-software/data.ts，该目录未作任何修改。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: 优势 + 合作流程 + 技术栈

**Files:**
- Create: `src/components/pages/home/WhyUs.tsx`
- Create: `src/components/pages/home/Process.tsx`
- Create: `src/components/pages/home/TechStack.tsx`
- Modify: `src/components/pages/home/HomeContent.tsx`

**Interfaces:**
- Consumes:
  - Task 1 的 `SectionHeading`
  - 现有数据 `ADVANTAGES: Advantage[]`（字段 `{ title: string; body: string; theme: ThemeKey }`，只用前两个）、`PROCESS_STEPS: ProcessStep[]`（字段 `{ code: string; title: string; body: string; theme: ThemeKey }`，只用前三个）、`TECH_STACK: string[]`，全部从 `../custom-software/data` 导入
- Produces:
  - `WhyUs()` — 无 props，提供锚点 `id="why-us"`
  - `Process()` — 无 props，提供锚点 `id="process"`
  - `TechStack()` — 无 props

- [ ] **Step 1: 创建 `WhyUs.tsx`**

创建 `src/components/pages/home/WhyUs.tsx`。刻意用「左标题右正文」的宽行式加细分隔线，**不用卡片**——5 条长文案堆成卡片会变成视觉噪音：

```tsx
import { ADVANTAGES } from '../custom-software/data'
import { SectionHeading } from './ui'

export const WhyUs = () => (
  <section id="why-us" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
    <SectionHeading eyebrow="Why us" title="为什么把系统交给我们" align="left" />
    <div className="mt-12 flex flex-col">
      {ADVANTAGES.map((advantage) => (
        <div
          key={advantage.title}
          className="grid grid-cols-1 gap-3 border-t border-rule py-7 md:grid-cols-[minmax(0,22ch)_minmax(0,1fr)] md:gap-10"
        >
          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.01em] text-graphite">
            {advantage.title}
          </h3>
          <p className="text-[15px] leading-[1.85] text-graphite-soft">{advantage.body}</p>
        </div>
      ))}
    </div>
  </section>
)
```

- [ ] **Step 2: 创建 `Process.tsx`**

创建 `src/components/pages/home/Process.tsx`。桌面端一条贯穿的水平细线 + 四个圆点，移动端转成纵向线；首个节点用橙色（橙色配额之一）：

```tsx
import { PROCESS_STEPS } from '../custom-software/data'
import { SectionHeading } from './ui'

export const Process = () => (
  <section id="process" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
    <SectionHeading eyebrow="Process" title="合作怎么走" description="四步，每一步你都看得见进度。" />
    <div className="relative mt-16">
      {/* 贯穿线：桌面横向、移动纵向。圆点用 border-paper punch 出白边压在线上 */}
      <div
        aria-hidden
        className="absolute bottom-2 left-[7px] top-2 w-px bg-rule md:bottom-auto md:left-0 md:right-0 md:top-[7px] md:h-px md:w-auto"
      />
      <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
        {PROCESS_STEPS.map((step, index) => (
          <li key={step.code} className="relative pl-8 md:pl-0 md:pt-8">
            <span
              aria-hidden
              className={[
                'absolute left-0 top-[3px] h-[15px] w-[15px] rounded-full border-[3px] border-paper md:top-0',
                index === 0 ? 'bg-ember' : 'bg-graphite-dim',
              ].join(' ')}
            />
            <span className="text-[12px] font-medium tracking-[0.12em] text-graphite-dim">
              {step.code}
            </span>
            <h3 className="mt-2 text-[16px] font-semibold tracking-[-0.01em] text-graphite">
              {step.title}
            </h3>
            <p className="mt-2 max-w-[28ch] text-[14px] leading-relaxed text-graphite-soft">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </div>
  </section>
)
```

- [ ] **Step 3: 创建 `TechStack.tsx`**

创建 `src/components/pages/home/TechStack.tsx`。刻意做弱化处理——技术栈是背书不是卖点：

```tsx
import { TECH_STACK } from '../custom-software/data'

export const TechStack = () => (
  <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
    <div className="flex flex-col items-center gap-6 border-t border-rule pt-12">
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-graphite-dim">
        Tech stack
      </span>
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
        {TECH_STACK.map((tech) => (
          <span key={tech} className="text-[15px] text-graphite-soft">
            {tech}
          </span>
        ))}
      </div>
    </div>
  </section>
)
```

- [ ] **Step 4: 挂进 `HomeContent.tsx`**

加三个 import（按字母序并入现有 import 块）：

```tsx
import { Process } from './Process'
import { TechStack } from './TechStack'
import { WhyUs } from './WhyUs'
```

`<main>` 内容改为：

```tsx
      <main className="flex-1">
        <Hero onContact={openContact} />
        <CapabilityBar />
        <ServiceGrid />
        <IndustryStrip onContact={openContact} />
        <WhyUs />
        <Process />
        <TechStack />
      </main>
```

- [ ] **Step 5: 类型检查与 lint**

Run: `npx tsc --noEmit && npx eslint src/components/pages/home`
Expected: 无输出（退出码 0）

- [ ] **Step 6: 浏览器核对**

刷新 http://localhost:3000 ，确认：
1. 优势区共 **5 行**，桌面端左侧标题右侧正文、行间有细分隔线，**没有卡片边框或阴影**
2. 点导航「优势」能滚动到该区
3. 流程区共 **4 步**，桌面端是一条水平细线穿过四个圆点，第一个圆点是**橙色**、其余是灰色
4. 圆点上有白色描边把贯穿线断开，不是压在线上糊成一团
5. 窗口拉到 390px 时流程线变成左侧纵向线，四步纵向排列
6. 点导航「流程」能滚动到该区
7. 技术栈区是一行灰色小字 `Tech stack` + 9 个技术名，视觉明显弱于上面各区
8. 控制台无报错

- [ ] **Step 7: 提交**

```bash
git add src/components/pages/home
git commit -m "$(cat <<'EOF'
feat(website): 首页优势、合作流程与技术栈

优势用左标题右正文的宽行式加细分隔线，不做卡片堆叠；合作流程走线+圆点
（桌面横向、移动纵向，首节点橙色）；技术栈弱化为文字带。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: 底部深色 CTA + 咨询入口全量接线

**Files:**
- Create: `src/components/pages/home/BottomCta.tsx`
- Modify: `src/components/pages/home/HomeContent.tsx`

**Interfaces:**
- Consumes: Task 1 的 `Button`；Task 2 的 `ContactModal` 与 `contactOpen` / `openContact` / `closeContact`
- Produces:
  - `BottomCta({ onContact: () => void })`
  - `HomeContent` 至此完成，四个咨询入口（导航按钮、Hero 主按钮、行业「+ 你的行业」、底部 CTA）全部接到同一个弹窗

- [ ] **Step 1: 创建 `BottomCta.tsx`**

创建 `src/components/pages/home/BottomCta.tsx`。这是全站唯一的深色块，用来给整页收尾做对比：

```tsx
import { Button } from './ui'

type BottomCtaProps = {
  onContact: () => void
}

export const BottomCta = ({ onContact }: BottomCtaProps) => (
  <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-28">
    <div className="relative overflow-hidden rounded-card bg-graphite px-6 py-16 text-center sm:px-12 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(255_60_0/0.22),transparent_62%)]"
      />
      <div className="relative flex flex-col items-center">
        <h2 className="max-w-[24ch] text-[clamp(1.6rem,3.2vw,2.5rem)] font-semibold leading-[1.2] tracking-[-0.02em] text-paper">
          先聊清楚要解决什么问题，再谈怎么做
        </h2>
        <p className="mt-5 max-w-[40ch] text-[15px] leading-[1.8] text-paper/70">
          不急着报价。加微信说清你的业务现状，我们给一份看得懂的方案。
        </p>
        {/* 深色底上用 secondary（白底）反而是正确的主按钮 */}
        <Button onClick={onContact} variant="secondary" className="mt-9">
          加微信聊聊
        </Button>
      </div>
    </div>
  </section>
)
```

- [ ] **Step 2: 完成 `HomeContent.tsx`**

把 `src/components/pages/home/HomeContent.tsx` 整个文件替换为最终版：

```tsx
'use client'

import { useState } from 'react'

import { BottomCta } from './BottomCta'
import { CapabilityBar } from './CapabilityBar'
import { ContactModal } from './ContactModal'
import { Hero } from './Hero'
import { HomeFooter } from './HomeFooter'
import { HomeNav } from './HomeNav'
import { IndustryStrip } from './IndustryStrip'
import { Process } from './Process'
import { ServiceGrid } from './ServiceGrid'
import { TechStack } from './TechStack'
import { WhyUs } from './WhyUs'

export const HomeContent = () => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-paper text-graphite">
      <HomeNav onContact={openContact} />
      <main className="flex-1">
        <Hero onContact={openContact} />
        <CapabilityBar />
        <ServiceGrid />
        <IndustryStrip onContact={openContact} />
        <WhyUs />
        <Process />
        <TechStack />
        <BottomCta onContact={openContact} />
      </main>
      <HomeFooter />
      <ContactModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
```

- [ ] **Step 3: 类型检查与 lint**

Run: `npx tsc --noEmit && npx eslint src/components/pages/home`
Expected: 无输出（退出码 0）

- [ ] **Step 4: 浏览器核对四个咨询入口**

刷新 http://localhost:3000 ，逐个点击并确认每次都弹出**浅色**面板、面板里二维码图片正常显示：
1. 导航右上「聊聊需求」
2. Hero 的「聊聊需求」
3. 行业区的「+ 你的行业」
4. 底部 CTA 的「加微信聊聊」

再确认关闭方式：
5. 按 ESC 能关
6. 点面板外的遮罩能关
7. 点面板右上角 × 能关

并确认底部 CTA 区是黑色大圆角块、顶部中央有一层橙色柔光、白色按钮，是**全页唯一**的深色块。控制台无报错。

- [ ] **Step 5: 提交**

```bash
git add src/components/pages/home
git commit -m "$(cat <<'EOF'
feat(website): 首页底部深色 CTA 与咨询入口全量接线

底部 CTA 做成全页唯一深色块收尾（黑底大圆角 + 顶部橙色柔光 + 白色按钮）；
导航、Hero、行业兜底、底部四处入口统一接到同一个咨询弹窗状态。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: middleware 隐藏旧路由 + sitemap 裁剪

**Files:**
- Modify: `src/middleware.ts`（整个文件重写）
- Modify: `src/app/sitemap.ts`（整个文件重写）

**Interfaces:**
- Consumes: 无（与前面任务解耦）
- Produces:
  - `PUBLIC_PATH_PREFIXES: string[]` 常量作为将来放开板块的唯一开关
  - middleware 行为：命中白名单放行，其余 307 到 `/`
  - `/sitemap.xml` 只含首页一条

- [ ] **Step 1: 重写 `middleware.ts`**

把 `src/middleware.ts` 整个文件替换为：

```ts
import { NextResponse, type NextRequest } from 'next/server'

// 官网当前只对外开放首页，其余路径统一 307 回首页。页面与组件代码均保留未删。
//
// 恢复某个板块时：
//   1. 把它的路径前缀加进 PUBLIC_PATH_PREFIXES，例如 '/studio'
//   2. 若该板块需要登录，把 token 静默续签与受保护路由判断接回本文件
//      （续签实现保留在 features/auth/server/backend.ts，受保护路由判断保留在
//       features/auth/protected-routes.ts，两者都未删除）
//   3. 同步更新 app/sitemap.ts 的路径清单与 (site)/layout.tsx 的导航渲染
const PUBLIC_PATH_PREFIXES: string[] = ['/']

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) => {
    // '/' 只按精确匹配，否则会把所有路径都放行
    if (prefix === '/') return pathname === '/'
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}

export function middleware(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  // Next.js 15 的 middleware adapter 会用 new URL(Location) 解析响应头，相对路径会抛 Invalid URL → 500。
  // 走 request.nextUrl.clone() 保证是绝对地址，host 由 Next.js 按 x-forwarded-host 解析。
  const target = request.nextUrl.clone()
  target.pathname = '/'
  target.search = ''
  return NextResponse.redirect(target, 307)
}

// 排除 /api、/_next，以及任何带扩展名的路径——后者覆盖 public 下的静态资源
// （/logo/*.svg、/og/cover.png、/contact.jpg、/favicon.svg）与 robots.txt、sitemap.xml。
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

- [ ] **Step 2: 重写 `sitemap.ts`**

把 `src/app/sitemap.ts` 整个文件替换为：

```ts
import type { MetadataRoute } from 'next'

// 官网当前只对外开放首页（见 middleware.ts），其余路径会 307 回首页，
// 因此这里只申报首页，避免向搜索引擎申报会被重定向的 URL、浪费爬虫预算。
// 恢复某个板块时把它的路径加回下面的数组。
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://weelume.com').replace(
  /\/+$/,
  '',
)

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]
}
```

原文件里的 `fetchTrackAnalysisList` 导入、`parseDate` 辅助函数、`dynamic` / `revalidate` 导出全部删掉——它们只为动态赛道页服务，那些页面已隐藏。`src/services/track-analysis.ts` 本身保留不动。

- [ ] **Step 3: 类型检查与 lint**

Run: `npx tsc --noEmit && npx eslint src/middleware.ts src/app/sitemap.ts`
Expected: 无输出（退出码 0）

- [ ] **Step 4: 重启开发服务器**

middleware 改动需要重启才生效。停掉正在跑的 `pnpm dev`，重新执行 `pnpm dev`。

- [ ] **Step 5: 验证旧路径全部 307 回首页**

Run（PowerShell）：

```powershell
$paths = @('/studio','/ai-coding-camp','/login','/course','/playbook/preface','/library','/account','/pricing','/membership','/about','/consulting','/bloggers','/product','/tracks','/community')
foreach ($p in $paths) {
  $r = try { Invoke-WebRequest -Uri "http://localhost:3000$p" -MaximumRedirection 0 -SkipHttpErrorCheck -UseBasicParsing } catch { $null }
  "{0,-22} {1} -> {2}" -f $p, $r.StatusCode, $r.Headers.Location
}
```

Expected: 每一行都是 `307` 且 Location 指向 `http://localhost:3000/`

- [ ] **Step 6: 验证放行清单未被误伤**

Run（PowerShell）：

```powershell
$paths = @('/','/api/auth/me','/logo/weiyu-logo-primary.svg','/og/cover.png','/contact.jpg','/sitemap.xml','/robots.txt')
foreach ($p in $paths) {
  $r = try { Invoke-WebRequest -Uri "http://localhost:3000$p" -MaximumRedirection 0 -SkipHttpErrorCheck -UseBasicParsing } catch { $null }
  "{0,-32} {1}" -f $p, $r.StatusCode
}
```

Expected: 全部**不是** 307。`/`、静态资源、`/sitemap.xml`、`/robots.txt` 应为 200；`/api/auth/me` 未登录时返回 200 或 401 都算通过（关键是没被重定向）。

- [ ] **Step 7: 验证 sitemap 只含首页**

Run: `Invoke-WebRequest -Uri http://localhost:3000/sitemap.xml -UseBasicParsing | Select-Object -ExpandProperty Content`
Expected: 输出只含一个 `<url>` 节点，`<loc>` 为 `https://weelume.com/`（或 `NEXT_PUBLIC_SITE_URL` 配置值），且**不含** `/membership`、`/pricing`、`/library`、`/playbook`、`/bloggers`、`/consulting`、`/about`、`/library/tracks/` 任何一项

- [ ] **Step 8: 提交**

```bash
git add src/middleware.ts src/app/sitemap.ts
git commit -m "$(cat <<'EOF'
feat(website): 除首页外全部路径 307 回首页，sitemap 收敛到首页

middleware 精简为白名单判断 + 307 重定向，停用 token 静默续签与受保护路由
判断（续签实现与 protected-routes 均保留未删，恢复板块时接回即可）；
sitemap 去掉 8 条已隐藏路径与赛道列表的后端调用，只申报首页。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: 根 layout 的站点文案改为软件定制口径

**Files:**
- Modify: `src/app/layout.tsx`（`SITE_TITLE_DEFAULT` 约 12 行、`SITE_DESCRIPTION` 约 13-14 行、`keywords` 约 24-37 行、`openGraph.images[0].alt` 约 64 行、`ORGANIZATION_JSON_LD.slogan` 约 88 行）

**Interfaces:**
- Consumes: 无
- Produces: 全站默认 metadata 与 JSON-LD 改为软件定制口径。`(site)/page.tsx` 自身的 metadata 覆盖首页 title/description，本任务不动它。

- [ ] **Step 1: 替换默认标题与描述**

在 `src/app/layout.tsx` 中把：

```tsx
const SITE_TITLE_DEFAULT = 'AI × 自媒体，让客户源源不断地找上门 · 微域生光'
const SITE_DESCRIPTION =
  '自媒体营销获客不要再做无效尝试。微域生光提供真实的赛道分析、一线博主拆解、可落地的百万级大V运营实战精炼方法论，加上能上手的 AI 信息工具，助你消除信息差、实现流量与客源的极速增长。'
```

替换为：

```tsx
const SITE_TITLE_DEFAULT = '软件定制开发 —— 官网、企业系统、小程序、AI 智能体 · 微域生光'
const SITE_DESCRIPTION =
  '微域生光提供软件定制开发服务：企业官网、企业级管理系统、小程序与移动应用、AI 智能体与知识库、数据分析看板、SaaS 平台、电商系统、桌面客户端、系统集成。从需求梳理到上线运营，由同一支团队全流程闭环交付。'
```

- [ ] **Step 2: 替换 keywords**

把 `keywords` 数组整块替换为：

```tsx
  keywords: [
    '软件定制',
    '软件定制开发',
    '企业官网开发',
    '企业管理系统',
    '小程序开发',
    'AI 智能体',
    'AI 知识库',
    'RAG 智能问答',
    '数据分析看板',
    'SaaS 开发',
    '电商系统开发',
    '桌面客户端开发',
    '系统集成',
    '流程自动化',
    '微域生光',
  ],
```

- [ ] **Step 3: 替换 OG 图 alt**

把 `openGraph.images[0]` 里的：

```tsx
        alt: 'AI × 自媒体，让客户源源不断地找上门 · 微域生光',
```

替换为：

```tsx
        alt: '软件定制开发 · 微域生光',
```

- [ ] **Step 4: 替换 JSON-LD 的 slogan**

把 `ORGANIZATION_JSON_LD` 里的：

```tsx
  slogan: 'AI × 自媒体，让客户源源不断地找上门',
```

替换为：

```tsx
  slogan: '把你的生意，做成一套自己的系统',
```

- [ ] **Step 5: 类型检查与 lint**

Run: `npx tsc --noEmit && npx eslint src/app/layout.tsx`
Expected: 无输出（退出码 0）

- [ ] **Step 6: 浏览器核对**

刷新 http://localhost:3000 ，确认：
1. 浏览器标签页标题是「软件定制服务 · 微域生光」（来自 `(site)/page.tsx` 的 metadata，说明页面级覆盖仍然生效）
2. 在开发者工具 Elements 面板搜索 `自媒体`，`<head>` 内**应无命中**
3. 在 Elements 面板确认两段 `application/ld+json` 内容为软件定制口径

- [ ] **Step 7: 提交**

```bash
git add src/app/layout.tsx
git commit -m "$(cat <<'EOF'
fix(website): 站点默认 metadata 与 JSON-LD 改为软件定制口径

默认 title/description、keywords、OG 图 alt 与 Organization slogan 原为
自媒体获客口径，与软件定制首页不符，一并改掉。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: 全量验收

**Files:**
- 无代码改动（若发现问题，回到对应任务的文件修复）

**Interfaces:**
- Consumes: Task 1-8 的全部产物
- Produces: 对照设计文档 §9 的六项验收结论

- [ ] **Step 1: 生产构建**

停掉 `pnpm dev`，然后 Run: `pnpm build`
Expected: 构建成功，无 TypeScript 错误、无 ESLint 错误。Route 列表中 `/` 存在。

- [ ] **Step 2: 起生产服务**

Run: `pnpm start`（默认 http://localhost:3000）

- [ ] **Step 3: 三个宽度截图核对**

用 Chrome DevTools 依次把视口设为 1440×900、768×1024、390×844，每个宽度对首页做整页截图，逐一确认：

1. 页面无横向滚动条
2. 版块顺序为：Hero → 能力条 → 服务矩阵 → 行业清单 → 优势 → 流程 → 技术栈 → 底部深色 CTA → 页脚
3. 全页只有底部 CTA 一个深色块
4. 橙色只出现在：服务卡片编号、流程第一个节点圆点、页脚状态点、底部 CTA 的柔光。**若在别处看到橙色，是违反橙色配额，需修回。**
5. 卡片阴影深浅一致（只有 hover 时会变深一档）
6. 滚动条滑块在浅色底上可见

- [ ] **Step 4: 控制台检查**

在每个宽度下打开控制台，确认无 error 级别输出（Next.js 的 dev 提示与 hydration 警告都不应出现）。

- [ ] **Step 5: 重跑旧路径重定向验证**

重复 Task 7 Step 5 与 Step 6 的两段 PowerShell 脚本（此时跑在生产模式下）。
Expected: 与 Task 7 一致——旧路径全 307 回首页，白名单路径全部未被重定向。

- [ ] **Step 6: 咨询弹窗回归**

在生产模式下再点一遍四个咨询入口（导航、Hero、`+ 你的行业`、底部 CTA），确认弹窗正常、二维码图片加载成功、三种关闭方式都有效。

- [ ] **Step 7: 确认禁改文件确实未被改动**

本计划的 Task 1-8 共产生 8 个提交。先确认提交范围：

Run: `git log --oneline -10`

找到 Task 1 的提交（信息为「新增浅色设计令牌与首页 UI 原子层」），把它的**父提交** SHA 记为 `<BASE>`，然后：

Run: `git diff --name-only <BASE>..HEAD`

（若 8 个提交都在且中间没有其他提交，`git diff --name-only HEAD~8..HEAD` 等价。）

Expected: 输出中**不包含**以下任何路径：
- `src/components/pages/custom-software/` 下任何文件
- `src/components/layout/TopNav.tsx`
- `src/components/layout/SiteFooter.tsx`
- `src/components/layout/ContactQrCodeModal.tsx`
- `src/features/auth/` 下任何文件

若有命中，说明违反了约束，需要 revert 该文件。

- [ ] **Step 8: 输出验收结论**

对照设计文档 §9 的六项验收标准逐条写出结论（通过/未通过 + 依据），并列出遗留风险。不要在任何一项未验证的情况下宣称完成。

---

## 附：任务依赖关系

```
Task 1 (令牌 + 原子)
  └─> Task 2 (基础样式 + 导航/页脚/弹窗/骨架 + page 接线)
        ├─> Task 3 (Hero + 光晕 + 能力条)
        │     └─> Task 4 (服务 + 行业)
        │           └─> Task 5 (优势 + 流程 + 技术栈)
        │                 └─> Task 6 (底部 CTA + 咨询入口全量接线)
        └─> Task 8 (根 layout 文案)   ← 与 3-6 无依赖，可并行

Task 7 (middleware + sitemap)  ← 与 1-6、8 无依赖，可并行

Task 9 (全量验收)  ← 依赖全部前置任务
```

Task 3-6 必须串行：它们都要改同一个 `HomeContent.tsx`。Task 7 与 Task 8 可以在 Task 2 完成后任意时机插入。
