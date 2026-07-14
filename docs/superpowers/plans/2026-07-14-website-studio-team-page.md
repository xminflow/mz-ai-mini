# 官网「研发团队」页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在官网新增 `/studio` 页面第一部分：顶部 CTO 组织顶点 + 下方 5 个研发部门网格（数据驱动、人员全部"虚位以待"），并接入导航。

**Architecture:** 沿用训练营页/软件定制页的成熟模式——`page.tsx` 只导出 metadata 并渲染一个 `'use client'` 内容组件；内容组件堆叠 section 组件；纯数据抽到 `data.ts`。部门网格用 CSS grid（`grid-cols-1 sm:grid-cols-2`）实现，新增部门只需往数据数组追加一项，不使用坐标定位的 SVG 连线图。

**Tech Stack:** Next.js 15（App Router）、React 19、TypeScript、Tailwind CSS、framer-motion（经由现有 `Reveal`/`GradientText` 封装）。不引入新依赖。

## Global Constraints

- 严格复用现有暗色主题、`font-serif-zh`/`font-mono`、`rounded-md` 圆角、`Reveal` 交错入场、`SectionEyebrow`；不新增设计体系、不引入新依赖。
- 部门配色复用 `src/components/pages/ai-coding-camp/data.ts` 导出的 `THEMES`（`ThemeKey`），不新建色值。
- 人员位置（主管 + 4 学员）本轮**全部**渲染为统一的"虚位以待"占位态，不出现任何真实姓名。
- CTO 展示信息取自 `InstructorSection.tsx` 中的真实资料（姓名"十一 / SHI YI"、头像 URL、"创业公司 CTO"头衔），仅复用数据本身，不复制整个组件。
- section 外壳统一 `className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28"`。
- 本项目前端约定（AGENTS.md）：前端不要求组件级单元测试；改动通过 `next build`/`next lint` 类型检查 + 本地 `dev` 页面运行验证。因此每个任务的验证步骤是"类型检查通过"，最后一个任务追加"启动 dev server 人工核对页面"。
- 禁止修改本计划涉及文件之外的任何文件（`TopNav.tsx`、`SiteFooter.tsx` 的改动仅限追加一行导航项，不改动其余逻辑）。

---

### Task 1: 部门数据模型与内容（`studio/data.ts`）

**Files:**
- Create: `website/src/components/pages/studio/data.ts`

**Interfaces:**
- Consumes: `THEMES`, `ThemeKey` from `@/components/pages/ai-coding-camp/data`（已存在，导出 7 个主题色：`cognition`/`frontend`/`backend`/`agent`/`launch`/`mobile`/`mindset`）
- Produces:
  - `export type Department = { code: string; name: string; project: string; difficulty: 1 | 2 | 3 | 4 | 5; theme: ThemeKey }`
  - `export const DEPARTMENTS: Department[]`（5 项）
  - `export const CTO_PROFILE: { name: string; nameEn: string; title: string; avatarUrl: string; avatarPosition: string; quote: string }`

- [ ] **Step 1: 编写 `data.ts`**

```ts
// src/components/pages/studio/data.ts
// 研发团队页的纯数据层：CTO 资料 + 部门清单。不含 JSX 与客户端逻辑。

import type { ThemeKey } from '../ai-coding-camp/data'

export type Department = {
  code: string
  name: string
  project: string
  difficulty: 1 | 2 | 3 | 4 | 5
  theme: ThemeKey
}

// 部门清单按难度升序排列，后续新增部门直接往数组追加一项即可，不影响布局
export const DEPARTMENTS: Department[] = [
  {
    code: 'D1',
    name: 'OA 审批系统组',
    project: '企业审批流程线上化，最适合入门练手',
    difficulty: 1,
    theme: 'mindset',
  },
  {
    code: 'D2',
    name: 'CRM 客户关系管理组',
    project: '客户全生命周期管理系统，基础业务建模',
    difficulty: 2,
    theme: 'frontend',
  },
  {
    code: 'D3',
    name: 'AI 智能客服项目组',
    project: '7×24 自动应答的智能客服，接入真实对话场景',
    difficulty: 3,
    theme: 'agent',
  },
  {
    code: 'D4',
    name: 'AI 数据分析项目组',
    project: '经营数据看板与智能洞察，考验数据建模能力',
    difficulty: 4,
    theme: 'backend',
  },
  {
    code: 'D5',
    name: 'OpenClaw 项目组',
    project: 'Agent 自动化方向，团队里技术难度最高的项目',
    difficulty: 5,
    theme: 'launch',
  },
]

export const CTO_PROFILE = {
  name: '十一',
  nameEn: 'SHI YI',
  title: '创业公司 CTO',
  avatarUrl:
    'https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/instructor/shiyi.jpg',
  avatarPosition: '50% 22%',
  quote: '这里的每个部门，我都会亲自参与关键决策。',
}
```

- [ ] **Step 2: 类型检查**

Run: `pnpm --dir website exec tsc --noEmit`
Expected: 无与 `studio/data.ts` 相关的报错（此时其余任务未完成，若已有历史报错以改动前基线为准，只需确认没有新增的 `studio/data.ts` 相关错误）。

- [ ] **Step 3: Commit**

```bash
git add website/src/components/pages/studio/data.ts
git commit -m "feat(website): 新增研发团队页部门数据模型"
```

---

### Task 2: CTO 顶点组件（`CtoSection.tsx`）

**Files:**
- Create: `website/src/components/pages/studio/CtoSection.tsx`

**Interfaces:**
- Consumes: `CTO_PROFILE` from `./data`；`Reveal`, `GradientText` from `@/components/motion`
- Produces: `export function CtoSection(): JSX.Element`（无 props，纯展示组件，供 `StudioContent` 直接渲染）

- [ ] **Step 1: 编写组件**

```tsx
// src/components/pages/studio/CtoSection.tsx
'use client'

import { Reveal, GradientText } from '../../motion'
import { CTO_PROFILE } from './data'

export function CtoSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6 sm:pt-20 lg:pt-24">
      <Reveal>
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-md p-6 backdrop-blur-xl sm:p-7"
            style={{
              background:
                'linear-gradient(150deg, rgba(0,153,255,0.16) 0%, rgba(0,153,255,0.05) 100%)',
              boxShadow: '0 16px 48px -16px rgba(0,153,255,0.4)',
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-70"
              style={{
                background:
                  'radial-gradient(circle, rgba(87,190,255,0.5) 0%, transparent 65%)',
              }}
            />
            <div className="relative flex flex-col items-center gap-4">
              <img
                src={CTO_PROFILE.avatarUrl}
                alt={`CTO ${CTO_PROFILE.name}`}
                loading="lazy"
                className="h-20 w-20 flex-none rounded-md object-cover sm:h-24 sm:w-24"
                style={{
                  objectPosition: CTO_PROFILE.avatarPosition,
                  boxShadow:
                    '0 12px 28px -8px rgba(0,153,255,0.65), inset 0 0 0 1px rgba(255,255,255,0.2)',
                }}
              />
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em]"
                  style={{ color: '#57beff' }}
                >
                  组织顶点 · CTO
                </span>
                <h2 className="font-serif-zh text-[24px] font-bold leading-none text-ink sm:text-[28px]">
                  <GradientText>{CTO_PROFILE.name}</GradientText>
                  <span className="ml-2 align-middle font-mono text-[12px] font-medium text-ink-soft sm:text-[13px]">
                    {CTO_PROFILE.nameEn}
                  </span>
                </h2>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-[11.5px]"
                  style={{
                    borderColor: 'rgba(87,190,255,0.45)',
                    background: 'rgba(0,153,255,0.10)',
                    color: '#57beff',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#57beff' }} />
                  {CTO_PROFILE.title}
                </span>
              </div>
              <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
                「{CTO_PROFILE.quote}」
              </p>
            </div>
          </div>

          {/* 装饰性连接：竖线 → 横向分隔线，寓意 CTO 统领全部部门；不逐个部门连线 */}
          <div className="flex flex-col items-center">
            <span
              aria-hidden
              className="h-10 w-px sm:h-12"
              style={{
                background: 'linear-gradient(to bottom, rgba(87,190,255,0.7), transparent)',
              }}
            />
            <span
              aria-hidden
              className="h-px w-full max-w-xs"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(87,190,255,0.55), transparent)',
              }}
            />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: 类型检查**

Run: `pnpm --dir website exec tsc --noEmit`
Expected: 无 `CtoSection.tsx` 相关报错。

- [ ] **Step 3: Commit**

```bash
git add website/src/components/pages/studio/CtoSection.tsx
git commit -m "feat(website): 新增研发团队页 CTO 顶点组件"
```

---

### Task 3: 部门网格组件（`DepartmentGrid.tsx`）

**Files:**
- Create: `website/src/components/pages/studio/DepartmentGrid.tsx`

**Interfaces:**
- Consumes: `DEPARTMENTS`, `Department` from `./data`；`THEMES` from `@/components/pages/ai-coding-camp/data`；`Reveal`, `GradientText` from `@/components/motion`；`SectionEyebrow` from `@/components/pages/ai-coding-camp/primitives`
- Produces: `export function DepartmentGrid({ onApply }: { onApply: () => void }): JSX.Element`
  - `onApply` 由 `StudioContent` 传入，点击任一部门"申请加入"链接时调用，用于打开 `ContactQrCodeModal`

- [ ] **Step 1: 编写组件**

```tsx
// src/components/pages/studio/DepartmentGrid.tsx
'use client'

import { Reveal, GradientText } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { THEMES } from '../ai-coding-camp/data'
import { DEPARTMENTS, type Department } from './data'

const DIFFICULTY_LABEL: Record<Department['difficulty'], string> = {
  1: '入门',
  2: '基础进阶',
  3: '中阶',
  4: '进阶',
  5: '高阶',
}

// 5 个岗位位置：主管 1 + 学员 4，本轮全部渲染为统一"虚位以待"占位态
const ROSTER_SLOTS: Array<{ role: string }> = [
  { role: '研发主管' },
  { role: '学员' },
  { role: '学员' },
  { role: '学员' },
  { role: '学员' },
]

function DifficultyStars({ level }: { level: Department['difficulty'] }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`难度 ${level} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: i <= level ? 'currentColor' : 'rgba(255,255,255,0.15)',
          }}
        />
      ))}
    </span>
  )
}

function DepartmentCard({ dept, index, onApply }: { dept: Department; index: number; onApply: () => void }) {
  const t = THEMES[dept.theme]
  return (
    <Reveal delay={index * 0.06}>
      <article
        className="group relative h-full overflow-hidden rounded-md p-5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 sm:p-7"
        style={{
          background: `linear-gradient(150deg, rgba(${t.rgb}, 0.16) 0%, rgba(${t.rgb}, 0.05) 100%)`,
          boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle, ${t.hex}55 0%, transparent 65%)`,
            filter: 'blur(24px)',
          }}
        />

        <div className="relative flex h-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[12px] font-bold text-canvas sm:h-10 sm:w-10 sm:text-[13px]"
              style={{
                background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                boxShadow: `0 4px 16px -2px ${t.hex}66`,
              }}
            >
              {dept.code}
            </span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px]"
              style={{
                borderColor: `rgba(${t.rgb}, 0.35)`,
                color: t.hex,
                background: `rgba(${t.rgb}, 0.08)`,
              }}
            >
              <DifficultyStars level={dept.difficulty} />
              难度 · {DIFFICULTY_LABEL[dept.difficulty]}
            </span>
          </div>

          <h3 className="font-serif-zh text-[19px] font-semibold leading-[1.35] text-ink sm:text-[22px]">
            {dept.name}
          </h3>
          <p className="text-[13px] leading-[1.85] text-ink-soft sm:text-[13.5px]">
            {dept.project}
          </p>

          {/* 人员名单：主管 + 4 学员，全部虚位以待 */}
          <ul className="mt-1 flex flex-col gap-2 border-t pt-3" style={{ borderColor: `rgba(${t.rgb}, 0.15)` }}>
            {ROSTER_SLOTS.map((slot, i) => (
              <li key={i} className="flex items-center gap-2.5 text-[12.5px] text-ink-soft">
                <span
                  aria-hidden
                  className="flex h-6 w-6 flex-none items-center justify-center rounded-full border text-[10px]"
                  style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.4)' }}
                >
                  ?
                </span>
                <span>
                  {slot.role} · <span className="text-muted">虚位以待</span>
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={onApply}
            className="mt-auto flex items-center gap-1.5 self-start text-[12.5px] font-semibold transition-colors"
            style={{ color: t.hex }}
          >
            申请加入这个部门 →
          </button>
        </div>
      </article>
    </Reveal>
  )
}

export function DepartmentGrid({ onApply }: { onApply: () => void }) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#01aef0">研发部门</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[-0.02em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="block">每个部门 5 人编制，</span>
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">负责一个真实研发项目</GradientText>
            </span>
          </h2>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5">
        {DEPARTMENTS.map((dept, i) => (
          <DepartmentCard key={dept.code} dept={dept} index={i} onApply={onApply} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 类型检查**

Run: `pnpm --dir website exec tsc --noEmit`
Expected: 无 `DepartmentGrid.tsx` 相关报错。

- [ ] **Step 3: Commit**

```bash
git add website/src/components/pages/studio/DepartmentGrid.tsx
git commit -m "feat(website): 新增研发团队页部门网格组件"
```

---

### Task 4: 页面内容组件（`StudioContent.tsx`）+ 路由 `page.tsx`

**Files:**
- Create: `website/src/components/pages/StudioContent.tsx`
- Create: `website/src/app/(site)/studio/page.tsx`

**Interfaces:**
- Consumes: `CtoSection` from `./studio/CtoSection`；`DepartmentGrid` from `./studio/DepartmentGrid`；`ContactQrCodeModal` from `../layout`
- Produces: `export function StudioContent(): JSX.Element`；`page.tsx` 默认导出 `StudioPage` 并导出 `metadata`

- [ ] **Step 1: 编写 `StudioContent.tsx`**

```tsx
// src/components/pages/StudioContent.tsx
'use client'

import { useState } from 'react'

import { ContactQrCodeModal } from '../layout'
import { CtoSection } from './studio/CtoSection'
import { DepartmentGrid } from './studio/DepartmentGrid'

export function StudioContent() {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = () => setContactOpen(true)
  const closeContact = () => setContactOpen(false)

  return (
    <div className="relative">
      {/* 1. CTO 组织顶点 */}
      <CtoSection />

      {/* 2. 部门网格：5 个研发部门，人员虚位以待，点击申请弹二维码 */}
      <DepartmentGrid onApply={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  )
}
```

- [ ] **Step 2: 确认 `../layout` 导出 `ContactQrCodeModal`**

Run: `grep -n "ContactQrCodeModal" website/src/components/layout/index.ts`
Expected: 该文件（或等价 barrel 导出）中包含 `ContactQrCodeModal` 的 re-export；若不存在同名 barrel 文件，改为直接从 `'../layout/ContactQrCodeModal'` 导入（与 `AiCodingCampContent.tsx:5` 的写法保持一致，此前已确认它从 `'../layout'` 导入且可用，说明 barrel 已存在）。

- [ ] **Step 3: 编写 `page.tsx`**

```tsx
// src/app/(site)/studio/page.tsx
import type { Metadata } from 'next'
import { StudioContent } from '@/components/pages/StudioContent'

export const metadata: Metadata = {
  title: '研发团队 · 微域生光',
  description:
    '一家模拟公司的研发团队：CTO 亲自带队，5 个研发部门各自负责一个真实项目，每个部门 5 人编制，欢迎加入。',
  openGraph: {
    title: '研发团队 · 微域生光',
    description: 'CTO 带队的模拟研发团队，5 个部门、5 个真实项目，虚位以待你的加入。',
  },
}

export default function StudioPage() {
  return <StudioContent />
}
```

- [ ] **Step 4: 类型检查**

Run: `pnpm --dir website exec tsc --noEmit`
Expected: 无报错。

- [ ] **Step 5: Commit**

```bash
git add website/src/components/pages/StudioContent.tsx website/src/app/\(site\)/studio/page.tsx
git commit -m "feat(website): 新增 /studio 研发团队页路由与内容组件"
```

---

### Task 5: 导航注册（TopNav + Footer）

**Files:**
- Modify: `website/src/components/layout/TopNav.tsx:24-30`（`NAV_LINKS` 数组）
- Modify: `website/src/components/layout/SiteFooter.tsx:3-15`（`FOOTER_GROUPS` 数组）

**Interfaces:**
- Consumes: 无新接口，仅追加数据项
- Produces: 无（导航是叶子改动，后续任务不依赖它）

- [ ] **Step 1: 修改 `TopNav.tsx`**

在 `NAV_LINKS` 数组的 `{ href: '/product', ... }` 之前插入一项：

```ts
const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'AI架构师训练营', exact: true },
  { href: '/course', label: 'VIP课程', matchPrefix: '/course' },
  { href: '/community', label: 'AI学习社区', matchPrefix: '/community' },
  { href: '/custom', label: '软件定制', matchPrefix: '/custom' },
  { href: '/studio', label: '研发团队', matchPrefix: '/studio' },
  { href: '/product', label: '产品', matchPrefix: '/product' },
]
```

- [ ] **Step 2: 修改 `SiteFooter.tsx`**

在 `FOOTER_GROUPS[0].links` 的 `{ label: "产品", href: "/product" }` 之前插入一项：

```ts
const FOOTER_GROUPS: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "浏览",
    links: [
      { label: "AI架构师训练营", href: "/" },
      { label: "软件定制", href: "/custom" },
      { label: "研发团队", href: "/studio" },
      { label: "产品", href: "/product" },
    ],
  },
];
```

- [ ] **Step 3: 类型检查**

Run: `pnpm --dir website exec tsc --noEmit`
Expected: 无报错。

- [ ] **Step 4: Commit**

```bash
git add website/src/components/layout/TopNav.tsx website/src/components/layout/SiteFooter.tsx
git commit -m "feat(website): 导航新增「研发团队」入口"
```

---

### Task 6: 构建验证 + 本地页面走查

**Files:** 无新文件，仅验证前 5 个任务的综合结果。

- [ ] **Step 1: Lint**

Run: `pnpm --dir website lint`
Expected: 无新增 lint 报错（若仓库已有历史 lint 告警，与改动前基线对比，确认无 `studio/` 相关新增项）。

- [ ] **Step 2: Build**

Run: `pnpm --dir website build`
Expected: 构建成功，输出中包含 `/studio` 路由；无 TypeScript 报错。

- [ ] **Step 3: 启动 dev server 人工核对**

Run: `pnpm --dir website dev`
打开浏览器访问 `http://localhost:3000/studio`，核对：
- CTO 顶点区块正常渲染（头像、姓名、头衔、连接线）
- 5 个部门区块全部可见，编号 D1–D5、难度星级、简介、5 个"虚位以待"人员位置、"申请加入这个部门"链接均正确显示
- 点击任一"申请加入"链接，`ContactQrCodeModal` 正常弹出且可关闭
- 桌面端两列、移动端（缩窄浏览器或用响应式模式）单列，无横向溢出
- 顶部导航栏与页脚「研发团队」链接可点击跳转，且在 `/studio` 页面时导航项高亮

- [ ] **Step 4: 记录验证结果**

若发现问题，回到对应任务修复后重新执行本任务的 Step 1–3。全部通过后，本功能视为完成，无需额外 commit（除非修复了问题）。

---

## Self-Review 摘要

- **Spec 覆盖**：路由与文件结构（Task 4/5）、CTO 顶点视觉（Task 2）、部门网格与数据模型（Task 1/3）、部门清单 5 项内容（Task 1）、导航注册（Task 5）、验收标准中的 build/lint/dev 运行/点击弹窗/响应式/视觉走查（Task 6）均已覆盖。
- **占位符扫描**：无 TBD/TODO，`DIFFICULTY_LABEL`、`ROSTER_SLOTS`、`DEPARTMENTS` 均为完整字面量数据。
- **类型一致性**：`Department.theme: ThemeKey` 与 `THEMES[dept.theme]` 用法一致；`DepartmentGrid` 的 `onApply` 与 `StudioContent` 传入的 `openContact` 签名一致（均为 `() => void`）；`ContactQrCodeModal` 的 `open`/`onClose` 与现有用法一致。
