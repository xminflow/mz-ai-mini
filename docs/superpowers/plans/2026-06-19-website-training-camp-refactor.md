# website 精简为「训练营 + 产品」实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `website` 对外暴露的板块收敛为「训练营(首页)」+「产品(空占位)」两项，其余板块只去入口、保留代码。

**Architecture:** 复用现有 `AiCodingCampContent` 作为首页 `/`，旧 `/ai-coding-camp` 重定向到 `/`，新增 `/product` 空占位页；导航与页脚由各自的常量数组驱动，收敛数组即同步收敛桌面端/移动端入口。

**Tech Stack:** Next.js App Router、React、Tailwind CSS、framer-motion；包管理 `pnpm`（在 `website/` 目录下运行）。

## Global Constraints

- 工作目录：所有命令在 `website/` 下执行（如 `cd website && pnpm ...`）。
- **只去入口、不删代码**：不得删除信息库/会员/咨询/关于/博主/赛道/playbook 及其页面、API、`features` 代码。
- 视觉层只允许出现「微域生光」，禁止英文品牌名/`weelume.com`。
- 前端不写组件测试；每个任务以 `pnpm exec tsc --noEmit`（类型）通过为门槛，最终任务以 `pnpm build` + 起 dev server 实际访问验证。
- 复用现有排版与主题色（`text-ink`/`text-muted`/`max-w-6xl` 等），不引入新组件体系或新依赖。
- TypeScript 禁止滥用 `any`。

---

### Task 1: 首页 `/` 改为训练营内容

**Files:**
- Modify: `website/src/app/(site)/page.tsx`（整文件替换）

**Interfaces:**
- Consumes: `AiCodingCampContent`（来自 `@/components/pages/AiCodingCampContent`，默认导出为命名导出 `AiCodingCampContent`，无 props）。
- Produces: 首页路由渲染训练营页；后续 Task 2 依赖「首页已是训练营内容」这一事实来做重定向。

- [ ] **Step 1: 用训练营内容替换首页**

把 `website/src/app/(site)/page.tsx` 整个文件替换为：

```tsx
import type { Metadata } from 'next'
import { AiCodingCampContent } from '@/components/pages/AiCodingCampContent'

export const metadata: Metadata = {
  title: 'AI 编程实战训练营 · 零基础入门 + AI 编程专家',
  description:
    '两门课覆盖两类人群:零基础 AI 编程(¥1999)带你从零做出能上线的网页与小程序;AI 编程专家(¥3999,含第一阶段全部)带你打通企业级 AI 工程、两套实战系统与求职面试。',
  openGraph: {
    title: 'AI 编程实战训练营 · 微域生光',
    description: '零基础入门 + AI 编程专家,两门课各得其所,完整学习路径与收获一目了然。',
  },
}

export default function HomePage() {
  return <AiCodingCampContent />
}
```

说明：删除了原 `fetchLibraryHubData()` 调用、`force-dynamic` 与 `HomeContent` 引用；`HomeContent.tsx` 文件本身保留不动。

- [ ] **Step 2: 类型检查**

Run: `cd website && pnpm exec tsc --noEmit`
Expected: 通过（无与本文件相关的报错）。

- [ ] **Step 3: 提交**

```bash
git add website/src/app/(site)/page.tsx
git commit -m "refactor(website): 首页改为复用训练营页内容"
```

---

### Task 2: 旧路由 `/ai-coding-camp` 重定向到首页

**Files:**
- Modify: `website/src/app/(site)/ai-coding-camp/page.tsx`（整文件替换）

**Interfaces:**
- Consumes: `redirect` from `next/navigation`。
- Produces: 访问 `/ai-coding-camp` 永久跳转 `/`。`AiCodingCampContent` 组件文件不动，仍被 Task 1 的首页引用。

- [ ] **Step 1: 改为重定向**

把 `website/src/app/(site)/ai-coding-camp/page.tsx` 整个文件替换为：

```tsx
import { redirect } from 'next/navigation'

export default function AiCodingCampPage() {
  redirect('/')
}
```

- [ ] **Step 2: 类型检查**

Run: `cd website && pnpm exec tsc --noEmit`
Expected: 通过。

- [ ] **Step 3: 提交**

```bash
git add "website/src/app/(site)/ai-coding-camp/page.tsx"
git commit -m "refactor(website): /ai-coding-camp 重定向到首页避免内容重复"
```

---

### Task 3: 新增 `/product` 空占位页

**Files:**
- Create: `website/src/app/(site)/product/page.tsx`

**Interfaces:**
- Produces: 新增 `/product` 路由，落在 `(site)` 布局内（自带 `TopNav` + `SiteFooter`）。Task 4/5 的导航与页脚会链接到此路由。

- [ ] **Step 1: 创建占位页**

新建 `website/src/app/(site)/product/page.tsx`：

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '产品 · 微域生光',
  description: '微域生光产品，敬请期待。',
}

export default function ProductPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-6xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <h1 className="font-serif-zh text-[28px] font-semibold leading-[1.3] tracking-[0.005em] text-ink sm:text-[36px]">
        产品
      </h1>
      <p className="mt-4 text-[15px] leading-[1.8] text-muted sm:text-[16px]">
        敬请期待。
      </p>
    </section>
  )
}
```

说明：仅用现有排版/主题类（`text-ink`/`text-muted`/`font-serif-zh`/`max-w-6xl`），不引入新组件或依赖。

- [ ] **Step 2: 类型检查**

Run: `cd website && pnpm exec tsc --noEmit`
Expected: 通过。

- [ ] **Step 3: 提交**

```bash
git add "website/src/app/(site)/product/page.tsx"
git commit -m "feat(website): 新增产品页空占位"
```

---

### Task 4: 顶部导航收敛为两项

**Files:**
- Modify: `website/src/components/layout/TopNav.tsx`（仅替换 `NAV_LINKS` 常量）

**Interfaces:**
- Consumes: 已有的 `NavLink` 类型与 `isActive`/渲染逻辑（桌面端 + 移动端均遍历 `NAV_LINKS`）。
- Produces: 导航只显示「训练营」「产品」；登录入口、`AccountMenu`、「咨询」按钮、Logo→`/` 均不变。

- [ ] **Step 1: 替换 `NAV_LINKS`**

把 `website/src/components/layout/TopNav.tsx` 中现有的 `NAV_LINKS` 数组（从 `const NAV_LINKS: NavLink[] = [` 到其闭合 `]`）整体替换为：

```tsx
const NAV_LINKS: NavLink[] = [
  { href: '/', label: '训练营', exact: true },
  { href: '/product', label: '产品', matchPrefix: '/product' },
]
```

说明：移除首页、信息库（含 dropdown）、会员、咨询服务、关于。`NavLink` 类型、dropdown 渲染逻辑、登录/咨询控件均保留不动。

- [ ] **Step 2: 类型检查**

Run: `cd website && pnpm exec tsc --noEmit`
Expected: 通过（`NavLink` 类型仍被引用，无未使用告警阻断）。

- [ ] **Step 3: 提交**

```bash
git add "website/src/components/layout/TopNav.tsx"
git commit -m "refactor(website): 顶部导航收敛为训练营+产品两项"
```

---

### Task 5: 页脚收敛并删除旧品牌文案

**Files:**
- Modify: `website/src/components/layout/SiteFooter.tsx`（替换 `FOOTER_GROUPS` 常量 + 删除品牌简介段落）

**Interfaces:**
- Consumes: 现有 `FOOTER_GROUPS` 渲染逻辑（遍历分组渲染链接）。
- Produces: 页脚仅「浏览(训练营/产品)」一组，无旧信息库叙事文案。

- [ ] **Step 1: 替换 `FOOTER_GROUPS`**

把 `website/src/components/layout/SiteFooter.tsx` 中 `FOOTER_GROUPS` 数组（从 `const FOOTER_GROUPS: ... = [` 到其闭合 `];`）整体替换为：

```tsx
const FOOTER_GROUPS: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "浏览",
    links: [
      { label: "训练营", href: "/" },
      { label: "产品", href: "/product" },
    ],
  },
];
```

- [ ] **Step 2: 删除品牌简介段落**

删除品牌区里那段旧叙事 `<p>`（完整移除以下整段元素）：

```tsx
            <p className="max-w-sm text-[13px] leading-[1.8] text-muted">
              AI 时代，真实的案例才更有价值。内容是内核，AI 是生产工具——我们拆解爆款、追踪博主、读懂赛道，把研究的部分做到位。
            </p>
```

保留其上方的 logo + 「微域生光」名称块，以及下方版权行 / 「正在接收新的合作申请」状态行不动。

- [ ] **Step 3: 类型检查**

Run: `cd website && pnpm exec tsc --noEmit`
Expected: 通过。

- [ ] **Step 4: 提交**

```bash
git add "website/src/components/layout/SiteFooter.tsx"
git commit -m "refactor(website): 页脚收敛为训练营+产品并移除旧品牌文案"
```

---

### Task 6: 构建与运行验证

**Files:**
- 无（仅验证）。

- [ ] **Step 1: 生产构建**

Run: `cd website && pnpm build`
Expected: 构建成功；输出含 `/`、`/product` 路由；无类型/编译错误。

- [ ] **Step 2: 起 dev server 实地验证**

Run: `cd website && pnpm run dev`（后台），然后访问校验：
- `/` → 训练营页内容（Hero/讲师/学习路径等），导航高亮「训练营」。
- `/product` → 「产品 / 敬请期待」，含顶部导航与页脚。
- `/ai-coding-camp` → 跳转回 `/`。
- 顶部导航：桌面端与移动端均只有「训练营」「产品」，右侧保留「登录」与「咨询」。
- 页脚：仅「浏览(训练营/产品)」一组，无旧品牌叙事段落。
- 直接访问 `/library`、`/membership`、`/about` 仍能打开（代码未删）。

可用 chrome-devtools 截图核对视觉（线+点风格、深色+品牌色，无英文品牌名）。

- [ ] **Step 3: 收尾说明**

汇报：完成内容、验证方式（build + dev 访问结果/截图）、遗留风险（被隐藏板块仍可直达；后续如需彻底下线再单独处理）。

---

## Self-Review

**Spec coverage：**
- 首页=训练营 → Task 1 ✓
- 旧 `/ai-coding-camp` 重定向 → Task 2 ✓
- `/product` 空占位 → Task 3 ✓
- 导航收敛(保留登录/咨询) → Task 4 ✓
- 页脚收敛 + 删品牌文案 → Task 5 ✓
- 只去入口不删代码 → 全程未删被隐藏板块代码（Global Constraints + 各任务说明）✓
- 验收(build/起服务) → Task 6 ✓

**Placeholder scan：** 无 TBD/TODO；每个改文件步骤均给出完整代码块。

**Type consistency：** 复用现有 `NavLink` 类型与 `FOOTER_GROUPS` 内联类型；`AiCodingCampContent` 为无 props 命名导出，与 Task 1 引用一致；metadata 字段与现 `ai-coding-camp/page.tsx` 逐字一致。
