# community 前端 SSR 化改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `community/` 前端从 Vite CSR 原地迁移为 Next.js App Router 的 SSR/CSR 混合架构（公开页 SSG/SSR、登录后 App CSR、Next.js 做 BFF + httpOnly Cookie），仅搭渲染架构骨架，内容/登录用 mock。

**Architecture:** App Router 按渲染层用 route group 切分：`(marketing)` 静态拉新页、`(public-content)` SSR/ISR 公开内容（带分享卡 meta）、`(app)` 受 `middleware` 保护的 CSR 登录后区。浏览器永不直连 FastAPI——公开页在 RSC 内经 `lib/api/server.ts` 服务端取数，登录态经 `/api/auth/*` 与 `/api/bff/*` Route Handler 代理，会话存 httpOnly cookie。

**Tech Stack:** Next.js `^15.3.3`（App Router）、React 19、TypeScript、Tailwind v4（`@tailwindcss/postcss`）、pnpm。对齐现有 `website/` 工程约定。

**参考规格：** `docs/superpowers/specs/2026-06-01-community-frontend-ssr-design.md`

**测试约定：** 依据 CLAUDE.md「前端不要求组件级测试，但必须通过页面运行/关键交互/日志验证」，本计划用 `next build` 产物标注 + `curl` 断言 HTTP 行为 + 客户端产物 grep 作为验证手段，每步给出确切命令与期望输出。所有命令在 `community/` 目录下执行（PowerShell 环境，curl 用 `curl.exe`）。

---

## 文件结构总览

```
community/
  package.json              # 改：换 Next.js 依赖与 scripts
  next.config.ts            # 新
  postcss.config.mjs        # 新：@tailwindcss/postcss
  tsconfig.json             # 改：Next.js TS 约定 + paths @/*
  eslint.config.js          # 改：对齐 website flat config
  .gitignore                # 改：加 .next/、next-env.d.ts、.env*.local
  .env.example / .env.local # 新（.env.local gitignore）
  public/fonts/*            # 保留不动
  src/
    middleware.ts           # 新：保护 (app) 路由
    app/
      layout.tsx            # 新：根布局 <html>/<body>/metadata/globals.css
      globals.css           # 新：迁移 index.css 全部令牌+工具类
      (marketing)/layout.tsx, page.tsx, about/page.tsx
      (public-content)/layout.tsx, posts/[slug]/page.tsx, columns/[slug]/page.tsx
      (app)/layout.tsx, feed/page.tsx, new/page.tsx, me/page.tsx
      login/page.tsx
      api/auth/login/route.ts, api/auth/logout/route.ts, api/auth/me/route.ts
      api/bff/[...path]/route.ts
    components/SiteHeader.tsx, SiteFooter.tsx, SiteShell.tsx
    lib/config.ts, api/server.ts, api/client.ts, auth/session.ts
    lib/mock/content.ts, mock/feed.ts
  删除：index.html, src/main.tsx, src/App.tsx, vite.config.ts,
        src/index.css, src/components/Layout.tsx, src/pages/Home.tsx,
        tsconfig.app.json, tsconfig.node.json, src/vite-env.d.ts(若有)
```

---

## Task 1: 切换构建工具链与依赖

**Files:**
- Modify: `community/package.json`
- Create: `community/next.config.ts`, `community/postcss.config.mjs`, `community/.env.example`, `community/.env.local`
- Modify: `community/tsconfig.json`, `community/eslint.config.js`, `community/.gitignore`
- Delete: `community/tsconfig.app.json`, `community/tsconfig.node.json`, `community/vite.config.ts`, `community/index.html`, `community/src/main.tsx`, `community/src/App.tsx`

- [ ] **Step 1: 改写 `community/package.json`**

```json
{
  "name": "community",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev -p 8666",
    "build": "next build",
    "start": "next start -p 8666",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.3.3",
    "react": "^19.2.6",
    "react-dom": "^19.2.6"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@tailwindcss/postcss": "^4.3.0",
    "@types/node": "^24.12.3",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "eslint": "^9.39.4",
    "eslint-config-next": "^15.3.3",
    "eslint-plugin-react-hooks": "^7.1.1",
    "globals": "^17.6.0",
    "tailwindcss": "^4.3.0",
    "typescript": "~6.0.2",
    "typescript-eslint": "^8.59.2"
  }
}
```

> 说明：`eslint` 从现脚手架的 `^10` 降到 `^9.39.4`，与 `eslint-config-next@^15` 及 `website` 对齐（eslint-config-next 不支持 eslint 10）。移除 `react-router-dom`、`vite`、`@vitejs/plugin-react`、`@tailwindcss/vite`。

- [ ] **Step 2: 创建 `community/next.config.ts`**

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  // 与 website 一致，便于容器化部署
  output: 'standalone',
}

export default config
```

- [ ] **Step 3: 创建 `community/postcss.config.mjs`**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- [ ] **Step 4: 改写 `community/tsconfig.json`（对齐 website）**

```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "preserve",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "incremental": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }],
    "allowJs": true,
    "strict": false
  },
  "include": ["src", "next-env.d.ts", ".next/types/**/*.ts", "next.config.ts", "postcss.config.mjs"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: 改写 `community/eslint.config.js`（对齐 website）**

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['.next', 'out']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'no-irregular-whitespace': [
        'error',
        { skipStrings: true, skipTemplates: true, skipJSXText: true },
      ],
    },
  },
])
```

- [ ] **Step 6: 改写 `community/.gitignore`**

```
# dependencies
node_modules/

# next.js
.next/
out/
next-env.d.ts

# production
build/
dist/

# env
.env*.local

# misc
*.log
.DS_Store
```

- [ ] **Step 7: 创建 `community/.env.example`**

```
# Next.js 服务端访问 community-server（FastAPI）的内部地址；浏览器不直连
COMMUNITY_API_INTERNAL_URL=http://127.0.0.1:8001
# 站点对外地址，用于 generateMetadata 的 metadataBase / 分享卡绝对链接
COMMUNITY_SITE_URL=http://localhost:8666
```

- [ ] **Step 8: 创建 `community/.env.local`（被 gitignore，本地开发用）**

```
COMMUNITY_API_INTERNAL_URL=http://127.0.0.1:8001
COMMUNITY_SITE_URL=http://localhost:8666
```

- [ ] **Step 9: 删除 Vite 时代文件**

Run:
```bash
git rm -f community/index.html community/src/main.tsx community/src/App.tsx community/vite.config.ts community/tsconfig.app.json community/tsconfig.node.json
git rm -f community/src/vite-env.d.ts 2>/dev/null || true
```
（`src/index.css`、`src/components/Layout.tsx`、`src/pages/Home.tsx` 在后续 Task 迁移后再删，暂留作参考。）

- [ ] **Step 10: 安装依赖**

Run: `pnpm install`
Expected: 安装成功，无 peer 冲突报错；`pnpm exec next --version` 输出 `Next.js v15.3.x`。

- [ ] **Step 11: Commit**

```bash
git add community/package.json community/next.config.ts community/postcss.config.mjs community/tsconfig.json community/eslint.config.js community/.gitignore community/.env.example
git commit -m "chore(community): 切换前端工具链 Vite→Next.js（依赖与配置）"
```

---

## Task 2: 根布局 + 主题迁移 + 共享 chrome + 落地页（首个可构建里程碑）

**Files:**
- Create: `community/src/app/layout.tsx`, `community/src/app/globals.css`
- Create: `community/src/components/SiteHeader.tsx`, `SiteFooter.tsx`, `SiteShell.tsx`
- Create: `community/src/app/(marketing)/layout.tsx`, `community/src/app/(marketing)/page.tsx`
- Delete: `community/src/index.css`, `community/src/components/Layout.tsx`, `community/src/pages/Home.tsx`

- [ ] **Step 1: 创建 `community/src/app/globals.css`（逐字迁移现 `src/index.css`）**

```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");
@import "tailwindcss";

/* 阿里巴巴普惠体 3.0（GB2312 子集，本地托管，见 public/fonts） */
@font-face {
  font-family: "Alibaba PuHuiTi 3.0";
  src: url("/fonts/PuHuiTi-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Alibaba PuHuiTi 3.0";
  src: url("/fonts/PuHuiTi-Medium.woff2") format("woff2");
  font-weight: 500 700;
  font-style: normal;
  font-display: swap;
}

@theme {
  --color-bg: #000000;
  --color-surface: #0b0b0d;
  --color-surface-2: #161616;
  --color-glass: rgba(255, 255, 255, 0.03);
  --color-line: rgba(255, 255, 255, 0.08);
  --color-line-strong: rgba(255, 255, 255, 0.16);
  --color-ink: #ffffff;
  --color-ink-2: rgba(255, 255, 255, 0.82);
  --color-mute: rgba(255, 255, 255, 0.55);
  --color-amber: #ff8918;
  --color-amber-deep: #a22904;
  --color-sky: #0098f3;
  --color-brand: #1f77f6;
  --color-brand-dark: #1560d0;
  --font-display: "Alibaba PuHuiTi 3.0", "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Alibaba PuHuiTi 3.0", "Inter", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 20px;
  --radius-btn: 10px;
  --radius-pill: 999px;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    margin: 0;
    min-height: 100vh;
    color: var(--color-ink-2);
    font-family: var(--font-sans);
    background-color: var(--color-bg);
    background-image:
      radial-gradient(60% 50% at 78% -8%, rgba(0, 152, 243, 0.22), transparent 70%),
      radial-gradient(55% 45% at 12% 4%, rgba(255, 137, 24, 0.16), transparent 68%);
    background-attachment: fixed;
    background-repeat: no-repeat;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  h1, h2, h3, h4 {
    font-family: var(--font-display);
    font-weight: 500;
    color: var(--color-ink);
    letter-spacing: -0.01em;
  }
}

@layer utilities {
  .bg-fusion {
    background-image: linear-gradient(163deg, #ff8918 28%, #a22904 54%, #000000 68%, #0098f3 100%);
  }
  .text-fusion {
    background-image: linear-gradient(100deg, #ff8918 0%, #ffb877 38%, #6cc6ff 72%, #0098f3 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .glass {
    background-color: var(--color-glass);
    border: 1px solid var(--color-line);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .glow-amber { box-shadow: 0 0 80px rgba(255, 137, 24, 0.25); }
  .glow-sky { box-shadow: 0 0 120px rgba(0, 152, 243, 0.22); }
  .btn-fusion {
    background-image: linear-gradient(135deg, #ff8918 0%, #ff6a00 100%);
    color: #1a0c00;
    border-radius: var(--radius-btn);
    box-shadow: 0 0 0 1px rgba(255, 137, 24, 0.4), 0 8px 30px rgba(255, 122, 0, 0.28);
    transition: filter 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  }
  .btn-fusion:hover {
    filter: brightness(1.08);
    box-shadow: 0 0 0 1px rgba(255, 137, 24, 0.6), 0 10px 40px rgba(255, 122, 0, 0.4);
    transform: translateY(-1px);
  }
}
```

- [ ] **Step 2: 创建 `community/src/app/layout.tsx`（根布局 + 站点级 metadata）**

```tsx
import type { Metadata } from 'next'
import './globals.css'

const SITE_URL = process.env.COMMUNITY_SITE_URL?.trim() || 'http://localhost:8666'
const SITE_TITLE = '知识汇 —— 通用知识问答社区'
const SITE_DESCRIPTION =
  '知识汇 —— 通用知识问答社区。在这里提问、分享见解、沉淀知识，与好奇的人一起把问题聊透。'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: '%s · 知识汇' },
  description: SITE_DESCRIPTION,
  applicationName: '知识汇',
  openGraph: {
    siteName: '知识汇',
    locale: 'zh_CN',
    type: 'website',
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: 创建 `community/src/components/SiteHeader.tsx`（client，迁移 Layout 头部，激活态用 usePathname）**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: '首页', to: '/' },
  { label: '提问', to: '/new' },
  { label: '标签', to: '/tags' },
]

export default function SiteHeader() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="bg-fusion glow-amber grid h-8 w-8 place-items-center rounded-xl text-sm font-semibold text-white">
            知
          </span>
          <span className="font-display text-lg font-medium tracking-tight text-ink">知识汇</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                href={link.to}
                className={`rounded-pill px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/8 text-ink' : 'text-mute hover:text-ink hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          <Link href="/new" className="btn-fusion ml-2 px-4 py-1.5 text-sm font-semibold">
            提问
          </Link>
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: 创建 `community/src/components/SiteFooter.tsx`（server）**

```tsx
export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm text-mute">
        <span>知识汇 · 通用知识问答社区</span>
        <span>© 2026</span>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: 创建 `community/src/components/SiteShell.tsx`（server，公开页共享外壳，DRY）**

```tsx
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">{children}</main>
      <SiteFooter />
    </div>
  )
}
```

- [ ] **Step 6: 创建 `community/src/app/(marketing)/layout.tsx`**

```tsx
import SiteShell from '@/components/SiteShell'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
```

- [ ] **Step 7: 创建 `community/src/app/(marketing)/page.tsx`（迁移 Home，默认 SSG）**

```tsx
export default function HomePage() {
  return (
    <section className="relative flex flex-col items-center py-20 text-center">
      <span className="glass mb-6 rounded-pill px-3.5 py-1.5 text-xs font-medium tracking-wide text-ink-2">
        通用知识问答社区
      </span>
      <h1 className="max-w-2xl font-display text-5xl font-medium leading-[1.1] tracking-tight text-ink sm:text-6xl">
        把每一个问题，
        <br className="hidden sm:block" />
        聊到<span className="text-fusion">通透</span>
      </h1>
      <p className="mt-6 max-w-xl text-base leading-relaxed text-mute">
        在这里提问、分享见解、沉淀知识，与好奇的人一起寻找答案。
      </p>
      <div className="mt-9 flex items-center gap-3">
        <button className="btn-fusion px-6 py-2.5 text-sm font-semibold">开始提问</button>
        <button className="glass rounded-btn px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-white/8">
          浏览内容
        </button>
      </div>
      <div className="glass glow-sky mt-20 w-full max-w-xl rounded-card p-10 text-sm text-mute">
        首页内容流（Feed）占位 —— 后续在此展示最新提问与热门分享。
      </div>
    </section>
  )
}
```

- [ ] **Step 8: 删除旧文件**

Run:
```bash
git rm -f community/src/index.css community/src/components/Layout.tsx community/src/pages/Home.tsx
```

- [ ] **Step 9: 构建并验证（首个可构建里程碑）**

Run: `pnpm build`
Expected: 构建成功；输出路由表中 `/` 标记为静态（`○ (Static)` 或 `●`），无类型错误。

- [ ] **Step 10: 启动并验证 SSR 首屏含内容**

Run（后台启动，校验后停止）：
```bash
pnpm start &
# 等待端口就绪后：
curl.exe -s http://localhost:8666/ | findstr "通透"
```
Expected: 输出含「通透」的 HTML 行，证明落地页内容在服务端渲染进首屏（非空壳）。

- [ ] **Step 11: Commit**

```bash
git add community/src/app community/src/components
git commit -m "feat(community): Next.js 根布局、主题迁移与落地页（SSG）"
```

---

## Task 3: 星球简介页 /about（SSG）

**Files:**
- Create: `community/src/app/(marketing)/about/page.tsx`

- [ ] **Step 1: 创建 `community/src/app/(marketing)/about/page.tsx`**

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于知识汇',
  description: '知识汇是一个把问题聊到通透的通用知识问答社区。了解我们的理念与玩法。',
}

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-2xl py-12">
      <h1 className="font-display text-4xl font-medium text-ink">关于知识汇</h1>
      <p className="mt-6 leading-relaxed text-ink-2">
        知识汇是一个通用知识问答社区。我们相信，每一个好问题都值得被认真讨论、被沉淀成可复用的知识。
      </p>
      <p className="mt-4 leading-relaxed text-mute">
        在这里，你可以提问、分享见解、加入感兴趣的专栏，与一群好奇的人一起把问题聊透。
      </p>
    </section>
  )
}
```

- [ ] **Step 2: 构建验证渲染类型**

Run: `pnpm build`
Expected: 路由表中 `/about` 标记为静态（`○`）。

- [ ] **Step 3: 启动验证 SSR 内容与标题模板**

Run:
```bash
pnpm start &
curl.exe -s http://localhost:8666/about | findstr "关于知识汇"
```
Expected: 输出含「关于知识汇」的 HTML；`<title>` 含「关于知识汇 · 知识汇」（模板生效）。

- [ ] **Step 4: Commit**

```bash
git add community/src/app/(marketing)/about
git commit -m "feat(community): 星球简介页 /about（SSG）"
```

---

## Task 4: 服务端数据层与 mock 内容

**Files:**
- Create: `community/src/lib/config.ts`, `community/src/lib/api/server.ts`, `community/src/lib/mock/content.ts`

- [ ] **Step 1: 创建 `community/src/lib/config.ts`（服务端 env 读取）**

```ts
// 服务端配置读取。注意：所有变量都不带 NEXT_PUBLIC_ 前缀，确保不泄漏到客户端产物。
const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '')

export function getInternalApiBaseUrl(): string {
  const configured = process.env.COMMUNITY_API_INTERNAL_URL
  if (configured && configured.trim() !== '') {
    return trimTrailingSlashes(configured.trim())
  }
  if (process.env.NODE_ENV !== 'production') {
    return 'http://127.0.0.1:8001'
  }
  // 生产环境必须显式配置，禁止静默兜底到本地地址
  throw new Error('COMMUNITY_API_INTERNAL_URL 未配置（生产环境必填）。')
}
```

- [ ] **Step 2: 创建 `community/src/lib/api/server.ts`（服务端取数封装，公开内容用）**

```ts
import { getInternalApiBaseUrl } from '@/lib/config'

// 在 RSC / Route Handler 内向 community-server 取数的统一封装。
// 本期公开内容用 mock（见 lib/mock），该函数预留给后续真实接口（如 /api/v1/posts/{slug}）。
export async function fetchFromApi<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getInternalApiBaseUrl()
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!response.ok) {
    throw new Error(`community-server 请求失败: ${response.status} ${path}`)
  }
  return (await response.json()) as T
}
```

- [ ] **Step 3: 创建 `community/src/lib/mock/content.ts`（公开内容 mock）**

```ts
export interface PublicPost {
  slug: string
  title: string
  excerpt: string
  body: string
  author: string
  publishedAt: string
}

const POSTS: Record<string, PublicPost> = {
  'welcome-to-zhihui': {
    slug: 'welcome-to-zhihui',
    title: '欢迎来到知识汇',
    excerpt: '一个把问题聊到通透的通用知识问答社区。',
    body: '这里是公开精华帖的正文占位。后续接入 community-server 后，正文将由服务端取数渲染。',
    author: '知识汇',
    publishedAt: '2026-06-01',
  },
}

export function getPublicPost(slug: string): PublicPost | null {
  return POSTS[slug] ?? null
}

export function getPublicPostSlugs(): string[] {
  return Object.keys(POSTS)
}

export interface PublicColumn {
  slug: string
  title: string
  description: string
  body: string
}

const COLUMNS: Record<string, PublicColumn> = {
  'getting-started': {
    slug: 'getting-started',
    title: '新手入门专栏',
    description: '如何高效使用知识汇。',
    body: '专栏正文占位。后续接入 community-server 后由服务端取数渲染。',
  },
}

export function getPublicColumn(slug: string): PublicColumn | null {
  return COLUMNS[slug] ?? null
}

export function getPublicColumnSlugs(): string[] {
  return Object.keys(COLUMNS)
}
```

- [ ] **Step 4: 类型检查**

Run: `pnpm exec tsc --noEmit`
Expected: 无错误（命令静默退出，exit 0）。

- [ ] **Step 5: Commit**

```bash
git add community/src/lib
git commit -m "feat(community): 服务端取数封装、配置读取与公开内容 mock"
```

---

## Task 5: 公开内容页 posts/[slug] 与 columns/[slug]（SSR/ISR + 分享卡）

**Files:**
- Create: `community/src/app/(public-content)/layout.tsx`
- Create: `community/src/app/(public-content)/posts/[slug]/page.tsx`
- Create: `community/src/app/(public-content)/columns/[slug]/page.tsx`

- [ ] **Step 1: 创建 `community/src/app/(public-content)/layout.tsx`（复用公开外壳）**

```tsx
import SiteShell from '@/components/SiteShell'

export default function PublicContentLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>
}
```

- [ ] **Step 2: 创建 `community/src/app/(public-content)/posts/[slug]/page.tsx`（ISR + generateMetadata 输出 OG 分享卡）**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicPost, getPublicPostSlugs } from '@/lib/mock/content'

// ISR：每小时再生，兼顾 SEO/分享卡新鲜度与性能
export const revalidate = 3600

export function generateStaticParams() {
  return getPublicPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const post = getPublicPost(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
    },
  }
}

export default async function PostDetailPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const post = getPublicPost(slug)
  if (!post) notFound()
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl font-medium text-ink">{post.title}</h1>
      <p className="mt-3 text-sm text-mute">
        {post.author} · {post.publishedAt}
      </p>
      <div className="mt-8 leading-relaxed text-ink-2">{post.body}</div>
    </article>
  )
}
```

- [ ] **Step 3: 创建 `community/src/app/(public-content)/columns/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicColumn, getPublicColumnSlugs } from '@/lib/mock/content'

export const revalidate = 3600

export function generateStaticParams() {
  return getPublicColumnSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params
  const column = getPublicColumn(slug)
  if (!column) return {}
  return {
    title: column.title,
    description: column.description,
    openGraph: { title: column.title, description: column.description, type: 'website' },
  }
}

export default async function ColumnDetailPage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const column = getPublicColumn(slug)
  if (!column) notFound()
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="font-display text-4xl font-medium text-ink">{column.title}</h1>
      <p className="mt-3 text-sm text-mute">{column.description}</p>
      <div className="mt-8 leading-relaxed text-ink-2">{column.body}</div>
    </article>
  )
}
```

- [ ] **Step 4: 构建验证渲染类型**

Run: `pnpm build`
Expected: 路由表中 `/posts/[slug]` 与 `/columns/[slug]` 标记为 ISR（`● (SSG)` 带 `revalidate`，或 `ISR`），且 `generateStaticParams` 预生成了 `welcome-to-zhihui` / `getting-started`。

- [ ] **Step 5: 启动验证 SSR 正文 + OG 分享卡 meta**

Run:
```bash
pnpm start &
curl.exe -s http://localhost:8666/posts/welcome-to-zhihui | findstr "欢迎来到知识汇"
curl.exe -s http://localhost:8666/posts/welcome-to-zhihui | findstr "og:title"
```
Expected: 第一条输出含正文标题「欢迎来到知识汇」；第二条输出含 `<meta property="og:title" ...>`，证明分享卡 meta 在服务端注入。

- [ ] **Step 6: 验证 404 分支**

Run: `curl.exe -s -o NUL -w "%{http_code}" http://localhost:8666/posts/not-exist`
Expected: `404`。

- [ ] **Step 7: Commit**

```bash
git add community/src/app/(public-content)
git commit -m "feat(community): 公开帖/专栏详情页（ISR + OG 分享卡 meta）"
```

---

## Task 6: 会话工具与鉴权 Route Handlers（mock cookie）

**Files:**
- Create: `community/src/lib/auth/session.ts`
- Create: `community/src/app/api/auth/login/route.ts`, `logout/route.ts`, `me/route.ts`

- [ ] **Step 1: 创建 `community/src/lib/auth/session.ts`（edge 安全，供 middleware 与 Route Handler 共用）**

```ts
// 会话 cookie 工具。必须 edge 安全（middleware 在 edge 运行），故用 btoa/atob 而非 Buffer。
export const SESSION_COOKIE_NAME = 'community_session'

export interface SessionUser {
  userId: string
  name: string
}

// 本期为 mock 会话：把用户信息 base64 编码进 cookie。
// TODO(接真鉴权)：换成 community-server 签发的不透明 token，由后端校验。
export function encodeSession(user: SessionUser): string {
  return btoa(encodeURIComponent(JSON.stringify(user)))
}

export function decodeSession(value: string | undefined | null): SessionUser | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(value))) as Partial<SessionUser>
    if (typeof parsed.userId === 'string' && typeof parsed.name === 'string') {
      return { userId: parsed.userId, name: parsed.name }
    }
    return null
  } catch {
    return null
  }
}
```

- [ ] **Step 2: 创建 `community/src/app/api/auth/login/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME, encodeSession } from '@/lib/auth/session'

// 本期 mock：接受任意非空账号并签发会话 cookie。
// TODO(接真鉴权)：转调 community-server 校验凭据，换取后端 token 后写入 cookie。
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { account?: string } | null
  const account = body?.account?.trim()
  if (!account) {
    return NextResponse.json({ error: 'account is required' }, { status: 400 })
  }
  const response = NextResponse.json({ ok: true, user: { userId: account, name: account } })
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: encodeSession({ userId: account, name: account }),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
```

- [ ] **Step 3: 创建 `community/src/app/api/auth/logout/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth/session'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set({ name: SESSION_COOKIE_NAME, value: '', path: '/', maxAge: 0 })
  return response
}
```

- [ ] **Step 4: 创建 `community/src/app/api/auth/me/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/auth/session'

export async function GET() {
  const cookieStore = await cookies()
  const session = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ user: session })
}
```

- [ ] **Step 5: 构建并启动**

Run: `pnpm build && pnpm start &`
Expected: 构建成功，`/api/auth/login`、`/api/auth/logout`、`/api/auth/me` 出现在路由表（ƒ Dynamic）。

- [ ] **Step 6: 验证登录签发 httpOnly cookie**

Run:
```bash
curl.exe -i -X POST http://localhost:8666/api/auth/login -H "Content-Type: application/json" -d "{\"account\":\"tester\"}"
```
Expected: `200`，响应头含 `Set-Cookie: community_session=...; Path=/; HttpOnly; SameSite=Lax`。

- [ ] **Step 7: 验证 me 端点的有/无会话分支**

Run:
```bash
curl.exe -s -o NUL -w "%{http_code}" http://localhost:8666/api/auth/me
curl.exe -s -c cookies.txt -X POST http://localhost:8666/api/auth/login -H "Content-Type: application/json" -d "{\"account\":\"tester\"}"
curl.exe -s -b cookies.txt http://localhost:8666/api/auth/me
```
Expected: 第一条 `401`（无 cookie）；第三条返回 `{"user":{"userId":"tester","name":"tester"}}`。

- [ ] **Step 8: Commit**

```bash
git add community/src/lib/auth community/src/app/api/auth
git commit -m "feat(community): 会话工具与登录/登出/会话 Route Handlers（mock cookie）"
```

---

## Task 7: middleware 保护 (app) 路由

**Files:**
- Create: `community/src/middleware.ts`

- [ ] **Step 1: 创建 `community/src/middleware.ts`**

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/auth/session'

export function middleware(request: NextRequest) {
  const session = decodeSession(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  if (session) {
    return NextResponse.next()
  }
  const loginUrl = new URL('/login', request.url)
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
  return NextResponse.redirect(loginUrl)
}

// 只拦截登录后区路由；公开页与公开内容页不经过此 middleware
export const config = {
  matcher: ['/feed/:path*', '/new/:path*', '/me/:path*'],
}
```

- [ ] **Step 2: 构建并启动**

Run: `pnpm build && pnpm start &`
Expected: 构建成功，输出含 `ƒ Middleware`。

- [ ] **Step 3: 验证未登录访问被拦截重定向**

Run: `curl.exe -s -o NUL -w "%{http_code} %{redirect_url}" http://localhost:8666/feed`
Expected: `307 http://localhost:8666/login?redirect=%2Ffeed`（无会话 → 跳登录，带 redirect 参数）。

> 注：此时 `/login` 与 `/feed` 页面尚未创建（Task 8），重定向目标 200 与否在 Task 8 验证；本步只断言 middleware 的 307 跳转行为。

- [ ] **Step 4: Commit**

```bash
git add community/src/middleware.ts
git commit -m "feat(community): middleware 保护登录后路由，未登录跳 /login"
```

---

## Task 8: 登录页 + (app) 区 + 客户端取数 + BFF 代理

**Files:**
- Create: `community/src/lib/api/client.ts`, `community/src/lib/mock/feed.ts`
- Create: `community/src/app/api/bff/[...path]/route.ts`
- Create: `community/src/app/login/page.tsx`
- Create: `community/src/app/(app)/layout.tsx`, `feed/page.tsx`, `new/page.tsx`, `me/page.tsx`

- [ ] **Step 1: 创建 `community/src/lib/mock/feed.ts`**

```ts
export interface FeedItem {
  id: string
  title: string
  author: string
}

export function getMockFeed(): FeedItem[] {
  return [
    { id: '1', title: '示例提问：如何系统学习一个新领域？', author: '小汇' },
    { id: '2', title: '示例分享：我的知识管理工作流', author: '阿星' },
  ]
}
```

- [ ] **Step 2: 创建 `community/src/app/api/bff/[...path]/route.ts`（登录后取数代理，校验会话）**

```ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/auth/session'
import { getMockFeed } from '@/lib/mock/feed'

// 登录后取数的 BFF 代理。先校验会话 cookie，再返回数据。
// 本期返回 mock；真实化后改为携带会话向 community-server 取数（见 lib/api/server.ts）。
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const cookieStore = await cookies()
  const session = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const { path } = await params
  const resource = path.join('/')
  if (resource === 'feed') {
    return NextResponse.json({ items: getMockFeed(), viewer: session })
  }
  return NextResponse.json({ error: 'not found' }, { status: 404 })
}
```

- [ ] **Step 3: 创建 `community/src/lib/api/client.ts`（客户端只打同源 BFF）**

```ts
'use client'

// 客户端数据访问：只打同源 /api/bff 与 /api/auth，绝不直连 community-server。
export async function bffGet<T>(resource: string): Promise<T> {
  const response = await fetch(`/api/bff/${resource}`, { method: 'GET', credentials: 'include' })
  if (!response.ok) {
    throw new Error(`bff 请求失败: ${response.status} ${resource}`)
  }
  return (await response.json()) as T
}

export async function login(account: string): Promise<void> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ account }),
    credentials: 'include',
  })
  if (!response.ok) {
    throw new Error('登录失败')
  }
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
}
```

- [ ] **Step 4: 创建 `community/src/app/login/page.tsx`（CSR 表单）**

```tsx
'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { login } from '@/lib/api/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [account, setAccount] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await login(account)
      router.push(searchParams.get('redirect') || '/feed')
      router.refresh()
    } catch {
      setError('登录失败，请重试')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass mx-auto mt-24 w-full max-w-sm rounded-card p-8">
      <h1 className="font-display text-2xl font-medium text-ink">登录知识汇</h1>
      <p className="mt-2 text-sm text-mute">本期为占位登录，输入任意账号即可进入。</p>
      <input
        value={account}
        onChange={(e) => setAccount(e.target.value)}
        placeholder="账号"
        className="mt-6 w-full rounded-btn border border-line bg-transparent px-4 py-2.5 text-sm text-ink outline-none focus:border-line-strong"
      />
      {error && <p className="mt-2 text-sm text-amber">{error}</p>}
      <button type="submit" className="btn-fusion mt-5 w-full py-2.5 text-sm font-semibold">
        登录
      </button>
    </form>
  )
}

export default function LoginPage() {
  // useSearchParams 需置于 Suspense 边界内
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}
```

- [ ] **Step 5: 创建 `community/src/app/(app)/layout.tsx`（client App 壳，含登出）**

```tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/api/client'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  async function handleLogout() {
    await logout()
    router.push('/')
    router.refresh()
  }
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <nav className="flex items-center gap-1">
            <Link href="/feed" className="rounded-pill px-3 py-1.5 text-sm font-medium text-ink">信息流</Link>
            <Link href="/new" className="rounded-pill px-3 py-1.5 text-sm font-medium text-mute hover:text-ink">发帖</Link>
            <Link href="/me" className="rounded-pill px-3 py-1.5 text-sm font-medium text-mute hover:text-ink">我的</Link>
          </nav>
          <button onClick={handleLogout} className="text-sm text-mute hover:text-ink">退出登录</button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">{children}</main>
    </div>
  )
}
```

- [ ] **Step 6: 创建 `community/src/app/(app)/feed/page.tsx`（client，经 BFF 取数）**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { bffGet } from '@/lib/api/client'
import type { FeedItem } from '@/lib/mock/feed'

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bffGet<{ items: FeedItem[] }>('feed')
      .then((data) => setItems(data.items))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <h1 className="font-display text-3xl font-medium text-ink">信息流</h1>
      {loading ? (
        <p className="mt-6 text-sm text-mute">加载中…</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="glass rounded-card p-5">
              <p className="text-ink-2">{item.title}</p>
              <p className="mt-2 text-sm text-mute">{item.author}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
```

- [ ] **Step 7: 创建 `community/src/app/(app)/new/page.tsx` 与 `me/page.tsx`（client 占位）**

`new/page.tsx`:
```tsx
'use client'

export default function NewPostPage() {
  return (
    <section>
      <h1 className="font-display text-3xl font-medium text-ink">发帖</h1>
      <p className="mt-6 text-sm text-mute">发帖表单占位 —— 后续接入 community-server 内容接口。</p>
    </section>
  )
}
```

`me/page.tsx`:
```tsx
'use client'

export default function MePage() {
  return (
    <section>
      <h1 className="font-display text-3xl font-medium text-ink">我的</h1>
      <p className="mt-6 text-sm text-mute">个人中心占位 —— 后续展示会员状态、我的提问与分享。</p>
    </section>
  )
}
```

- [ ] **Step 8: 构建并启动**

Run: `pnpm build && pnpm start &`
Expected: 构建成功；`/login` 为静态/客户端页，`/feed`、`/new`、`/me` 为客户端页，`/api/bff/[...path]` 为 Dynamic。

- [ ] **Step 9: 验证 BFF 鉴权门 + 登录后可达**

Run:
```bash
curl.exe -s -o NUL -w "%{http_code}" http://localhost:8666/api/bff/feed
curl.exe -s -c cookies.txt -X POST http://localhost:8666/api/auth/login -H "Content-Type: application/json" -d "{\"account\":\"tester\"}"
curl.exe -s -b cookies.txt http://localhost:8666/api/bff/feed | findstr "知识管理"
curl.exe -s -b cookies.txt -o NUL -w "%{http_code}" http://localhost:8666/feed
```
Expected: 第一条 `401`（无会话）；第三条输出含「知识管理」（mock feed）；第四条 `200`（带会话访问受保护页放行）。

- [ ] **Step 10: 验证客户端产物不泄漏后端地址**

Run: `findstr /S /C:"127.0.0.1:8001" community\.next\static\*` 与 `findstr /S /C:"COMMUNITY_API_INTERNAL_URL" community\.next\static\*`
Expected: 两条均无匹配（exit 1 / "找不到"），证明内部 API 地址未进入客户端 bundle。

- [ ] **Step 11: Commit**

```bash
git add community/src/app/login community/src/app/(app) community/src/app/api/bff community/src/lib/api/client.ts community/src/lib/mock/feed.ts
git commit -m "feat(community): 登录页、登录后 App 区、BFF 代理与客户端取数（mock）"
```

---

## Task 9: 收尾——README 与全量验收

**Files:**
- Create: `community/README.md`（覆盖现有占位 README）

- [ ] **Step 1: 改写 `community/README.md`**

```markdown
# 知识汇 · Community（前端）

「知识汇」通用知识问答社区（知识星球）的前端，基于 **Next.js 15 App Router**，SSR/CSR 混合渲染。

## 渲染分层

- `(marketing)`：落地页 `/`、星球简介 `/about` —— SSG，面向拉新与 SEO。
- `(public-content)`：公开帖 `/posts/[slug]`、专栏 `/columns/[slug]` —— ISR（`revalidate=3600`）+ OG 分享卡 meta。
- `(app)`：登录后区 `/feed`、`/new`、`/me` —— CSR，由 `src/middleware.ts` 校验会话保护。
- `/login`：登录页（CSR 表单）。

## 数据与鉴权

浏览器**永不直连** FastAPI（community-server）：

- 公开页在 RSC 内经 `src/lib/api/server.ts` 服务端取数（本期为 `src/lib/mock`）。
- 登录/登出/会话经 `/api/auth/*`；会话存 httpOnly cookie `community_session`。
- 登录后取数经 `/api/bff/*` 代理（校验 cookie 后转发）。

> 本期为**渲染架构骨架**：内容与登录均为 mock，真实鉴权与内容接口为后续迭代。

## 运行

```bash
pnpm install
pnpm dev          # http://localhost:8666
pnpm build && pnpm start
```

环境变量见 `.env.example`（`COMMUNITY_API_INTERNAL_URL` 指向 community-server，默认 `http://127.0.0.1:8001`）。
```

- [ ] **Step 2: 全量构建 + lint**

Run: `pnpm build && pnpm lint`
Expected: 构建成功；lint 无 error（告警可接受）。

- [ ] **Step 3: 全量 curl 回归（启动后依次执行）**

Run: `pnpm start &` 然后：
```bash
curl.exe -s http://localhost:8666/ | findstr "通透"
curl.exe -s http://localhost:8666/about | findstr "关于知识汇"
curl.exe -s http://localhost:8666/posts/welcome-to-zhihui | findstr "og:title"
curl.exe -s -o NUL -w "%{http_code} %{redirect_url}\n" http://localhost:8666/feed
curl.exe -s -c cookies.txt -X POST http://localhost:8666/api/auth/login -H "Content-Type: application/json" -d "{\"account\":\"tester\"}"
curl.exe -s -b cookies.txt -o NUL -w "%{http_code}\n" http://localhost:8666/feed
```
Expected: 依次为——含「通透」；含「关于知识汇」；含 `og:title`；`307 .../login?redirect=%2Ffeed`；登录返回 `{"ok":true,...}`；`/feed` 带会话 `200`。

- [ ] **Step 4: 可选浏览器验收（agent-browser 截图）**

打开 `http://localhost:8666/`，确认视觉与迁移前一致（黑底、橙↔蓝辉光、普惠体）；未登录访问 `/feed` 被弹到 `/login`，mock 登录后进入 `/feed` 看到示例条目。截图存档。

- [ ] **Step 5: Commit**

```bash
git add community/README.md
git commit -m "docs(community): 更新前端 README（渲染分层与数据鉴权说明）"
```

---

## 自审结论（spec 覆盖核对）

- 路由与渲染分层（spec 架构一）→ Task 2/3/5/8 全覆盖（marketing/public-content/app/login）。
- BFF + 鉴权 + 数据流（spec 架构二）→ Task 4（server 取数）、Task 6（auth + cookie）、Task 7（middleware）、Task 8（bff + client）。
- 资产迁移（spec 资产迁移）→ Task 1（工具链/依赖）、Task 2（主题/Layout/Home 迁移与删除旧文件）。
- 验收（spec 验收）→ 各 Task 验证步 + Task 9 全量回归：构建渲染类型、SSR 首屏内容、OG meta、middleware 跳转、Set-Cookie、BFF 鉴权门、客户端不泄漏后端地址、lint。
- 类型一致性：`SessionUser`/`encodeSession`/`decodeSession`/`SESSION_COOKIE_NAME`（session.ts）、`bffGet`/`login`/`logout`（client.ts）、`FeedItem`/`getMockFeed`（feed.ts）、`PublicPost`/`PublicColumn` 及其 getter（content.ts）在各 Task 引用一致。
- 无占位符：所有步骤含完整代码与确切命令/期望输出。
```
