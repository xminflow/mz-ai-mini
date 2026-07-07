# 官网「软件定制服务」落地页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在官网新增 `/custom` 软件定制服务落地页（Hero + 11 项服务矩阵 + 差异化 + 合作流程 + 技术栈背书 + 底部 CTA），并在导航（TopNav + SiteFooter）注册第三个入口「软件定制」。

**Architecture:** 完全复用 `AiCodingCampContent` 已验证的组合模式：`page.tsx` 只导出 `metadata` 并渲染一个 `'use client'` 内容组件；内容组件堆叠 section 组件；纯数据集中在同目录 `data.ts`；视觉原语（`Reveal`/`GradientText`/`SectionEyebrow`/`EnrollButton`/`ContactQrCodeModal`）全部从 `@/components/motion` 与 `ai-coding-camp/primitives` 直接复用，不新建设计体系。

**Tech Stack:** Next.js App Router (`(site)` 路由组) + React + TypeScript + Tailwind CSS v4（`@theme` token，无 `tailwind.config`）+ framer-motion（经 `Reveal`/`motion.span` 复用）。

## Global Constraints

- 前端不要求组件级测试（CLAUDE.md）；每个任务的验证方式统一为：`tsc`/`next build` 类型与编译检查 + `pnpm dev` 本地启动 + 浏览器实际渲染核对（截图或人工核对布局/配色/交互）。
- 禁止新增依赖；只使用仓库已有的 `framer-motion`、`next/link`、Tailwind 已有 token。
- TypeScript 禁止滥用 `any`；所有数据结构必须有明确类型标注。
- 视觉必须与 `ai-coding-camp` 页面同源：`bg-canvas` 近黑背景、`rounded-md` 无边框玻璃卡片、`font-serif-zh` 标题、`font-mono` 标签/编号、`Reveal` 交错入场（`delay={i*0.06}`）。
- section 外壳统一 `className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28"`。
- 「为什么选我们」「合作流程」两节必须用线+圆点+文字（复用 `UpcomingCoursesSection` 的视觉语言），禁止卡片堆叠/嵌套容器。
- CTA 统一复用 `ContactQrCodeModal`（不做留资表单，不接后端接口）。
- 不修改 `AiCodingCampContent.tsx`、`ai-coding-camp/` 目录下任何既有文件、`product/page.tsx` 或其它无关路由。
- 文案基调：营销钩子式短句 + 具体收益，面向零技术背景老板/自媒体人，用大众能听懂的中文；禁止政治敏感词与不必要的英文品牌堆砌。

---

## File Structure Overview

| 文件 | 状态 | 职责 |
|---|---|---|
| `website/src/components/pages/custom-software/data.ts` | 新建 | 类型定义 + 11 服务数据 + 差异化点 + 流程步骤 + 技术栈 + 主题色映射 |
| `website/src/components/pages/custom-software/Hero.tsx` | 新建 | 首屏大标题 + 副标题 + 主/次 CTA |
| `website/src/components/pages/custom-software/ServiceGrid.tsx` | 新建 | 11 服务卡矩阵（`id="services"`） |
| `website/src/components/pages/custom-software/WhyUsSection.tsx` | 新建 | 差异化 4 点（线+圆点） |
| `website/src/components/pages/custom-software/ProcessSection.tsx` | 新建 | 合作流程 5 步（线+圆点） |
| `website/src/components/pages/custom-software/TechStackSection.tsx` | 新建 | 技术栈 Marquee 背书 |
| `website/src/components/pages/custom-software/BottomCta.tsx` | 新建 | 底部 CTA 面板 |
| `website/src/components/pages/CustomSoftwareContent.tsx` | 新建 | 组合所有 section + 弹窗状态 |
| `website/src/app/(site)/custom/page.tsx` | 新建 | 路由 + metadata |
| `website/src/components/layout/TopNav.tsx` | 修改 | `NAV_LINKS` 新增「软件定制」 |
| `website/src/components/layout/SiteFooter.tsx` | 修改 | `FOOTER_GROUPS` 新增「软件定制」 |

---

### Task 1: 数据层 `custom-software/data.ts`

**Files:**
- Create: `website/src/components/pages/custom-software/data.ts`

**Interfaces:**
- Produces: `type Theme = { label: string; hex: string; rgb: string; gradientFrom: string; gradientTo: string }`；`type ThemeKey` (10 个 key)；`THEMES: Record<ThemeKey, Theme>`；`type ServiceItem = { code: string; title: string; hook: string; points: string[]; theme: ThemeKey }`；`SERVICES: ServiceItem[]`（11 项）；`type Advantage = { title: string; body: string; theme: ThemeKey }`；`ADVANTAGES: Advantage[]`（4 项）；`type ProcessStep = { code: string; title: string; body: string; theme: ThemeKey }`；`PROCESS_STEPS: ProcessStep[]`（5 项）；`TECH_STACK: string[]`。

- [ ] **Step 1: 编写 `data.ts`**

```ts
// 软件定制服务页的数据与类型层：集中存放主题色、服务矩阵、差异化卖点、
// 合作流程、技术栈背书等纯数据定义。本模块不含 JSX 与客户端逻辑。

export type ThemeKey =
  | "cognition"
  | "frontend"
  | "backend"
  | "agent"
  | "launch"
  | "mobile"
  | "mindset"
  | "advance"
  | "enterprise"
  | "career";

export type Theme = {
  label: string;
  hex: string;
  rgb: string;
  gradientFrom: string;
  gradientTo: string;
};

// 复用官网既有品牌色板（与 ai-coding-camp/data.ts 的 THEMES / STAGE2_THEMES 数值一致），
// 保持视觉同源；本页独立维护一份，避免跨 feature 页面互相引用。
export const THEMES: Record<ThemeKey, Theme> = {
  cognition: { label: "官网 · 品牌", hex: "#0099ff", rgb: "0, 153, 255", gradientFrom: "#7dadff", gradientTo: "#155eef" },
  frontend: { label: "小程序 · 应用", hex: "#01aef0", rgb: "1, 174, 240", gradientFrom: "#57beff", gradientTo: "#0284c7" },
  backend: { label: "企业系统", hex: "#8c5eff", rgb: "140, 94, 255", gradientFrom: "#af53ff", gradientTo: "#4a1fb8" },
  agent: { label: "智能体", hex: "#d42672", rgb: "212, 38, 114", gradientFrom: "#ff52b7", gradientTo: "#d1157a" },
  launch: { label: "数据 · 洞察", hex: "#f8ec1d", rgb: "248, 236, 29", gradientFrom: "#fff652", gradientTo: "#eaaa08" },
  mobile: { label: "交易 · 电商", hex: "#ff5a1f", rgb: "255, 90, 31", gradientFrom: "#ff7a4d", gradientTo: "#ff4405" },
  mindset: { label: "桌面 · 客户端", hex: "#bafa77", rgb: "186, 250, 119", gradientFrom: "#d4ff9e", gradientTo: "#16b364" },
  advance: { label: "SaaS 平台", hex: "#155eef", rgb: "21, 94, 239", gradientFrom: "#7dadff", gradientTo: "#175cd3" },
  enterprise: { label: "集成 · 自动化", hex: "#eaaa08", rgb: "234, 170, 8", gradientFrom: "#f8ec1d", gradientTo: "#92600E" },
  career: { label: "内容 · AIGC", hex: "#16b364", rgb: "22, 179, 100", gradientFrom: "#bafa77", gradientTo: "#0f766e" },
};

export type ServiceItem = {
  code: string;
  title: string;
  hook: string;
  points: string[];
  theme: ThemeKey;
};

export const SERVICES: ServiceItem[] = [
  {
    code: "01",
    title: "企业官网 & 品牌落地页",
    hook: "会自己获客的官网，3 秒抓住客户",
    points: ["品牌官网 / 营销活动页", "SEO 结构与移动端自适应", "内容与转化路径一体设计"],
    theme: "cognition",
  },
  {
    code: "02",
    title: "企业级管理系统",
    hook: "把 Excel 和微信群里的生意，装进一套系统",
    points: ["CRM / ERP / OA", "进销存 / 后台管理平台", "多角色权限与审批流"],
    theme: "backend",
  },
  {
    code: "03",
    title: "小程序 & 移动应用",
    hook: "客户在哪，你的入口就在哪",
    points: ["微信小程序 / H5", "原生 / 跨端 App", "复用已有后端，快速上线"],
    theme: "frontend",
  },
  {
    code: "04",
    title: "AI 智能体 / 数字员工",
    hook: "7×24 不下班的员工，一次培训永久上岗",
    points: ["智能客服 / 业务自动化 Agent", "多轮对话与长期记忆", "接入企业真实业务流程"],
    theme: "agent",
  },
  {
    code: "05",
    title: "AI 知识库 & 智能问答",
    hook: "让公司多年的经验，随问随答",
    points: ["RAG 检索增强问答", "企业知识库 / 文档助手", "私有数据不出企业"],
    theme: "agent",
  },
  {
    code: "06",
    title: "数据分析 & BI 看板",
    hook: "经营看板一屏看懂，决策不再靠拍脑袋",
    points: ["经营数据大屏", "自动化报表", "异常与趋势自动提醒"],
    theme: "launch",
  },
  {
    code: "07",
    title: "SaaS 产品 / 平台开发",
    hook: "从 0 到 1，把想法做成能收费的产品",
    points: ["多租户架构", "订阅计费体系", "从产品原型到规模化上线"],
    theme: "advance",
  },
  {
    code: "08",
    title: "电商 & 交易系统",
    hook: "下单、支付、履约，一条龙跑通",
    points: ["商城 / 预约 / 分销", "支付与订单履约", "会员与营销活动"],
    theme: "mobile",
  },
  {
    code: "09",
    title: "桌面客户端",
    hook: "Windows / Mac 一套代码，双端上线",
    points: ["Electron 跨平台桌面应用", "本地化工具与离线能力", "自动更新与安装包分发"],
    theme: "mindset",
  },
  {
    code: "10",
    title: "系统集成 & 流程自动化",
    hook: "让各个软件自己对话，人只管收结果",
    points: ["第三方 API 打通", "跨系统工作流自动化", "定时任务与异步处理"],
    theme: "enterprise",
  },
  {
    code: "11",
    title: "AIGC 内容工具",
    hook: "一个人，干出一个内容团队的产量",
    points: ["自动化内容生产", "营销素材批量生成", "呼应自媒体获客场景"],
    theme: "career",
  },
];

export type Advantage = {
  title: string;
  body: string;
  theme: ThemeKey;
};

export const ADVANTAGES: Advantage[] = [
  {
    title: "AI 原生全栈自研",
    body: "自己写代码、自己交付，不做外包转包的二传手，问题第一时间闭环。",
    theme: "cognition",
  },
  {
    title: "软件 + 内容一起交付",
    body: "独有的自媒体获客闭环——软件做出来，还帮你想清楚怎么被客户看见。",
    theme: "career",
  },
  {
    title: "真实可交付、可运维",
    body: "交付即上线，不是 demo；上线之后遇到问题，找得到人、改得动代码。",
    theme: "launch",
  },
  {
    title: "长期陪跑",
    body: "不是做完就走，业务在变、系统也要跟着迭代升级。",
    theme: "agent",
  },
];

export type ProcessStep = {
  code: string;
  title: string;
  body: string;
  theme: ThemeKey;
};

export const PROCESS_STEPS: ProcessStep[] = [
  { code: "01", title: "聊需求", body: "先搞清楚你要解决什么问题，而不是急着报价。", theme: "cognition" },
  { code: "02", title: "出方案报价", body: "给一份看得懂的方案和明确报价，没有隐藏收费。", theme: "frontend" },
  { code: "03", title: "敏捷开发", body: "分阶段推进，随时可看进度，不做黑箱交付。", theme: "backend" },
  { code: "04", title: "验收交付", body: "对照方案逐项验收，确认没问题再上线。", theme: "agent" },
  { code: "05", title: "持续运维", body: "上线只是开始，后续迭代与维护持续跟进。", theme: "launch" },
];

export const TECH_STACK: string[] = [
  "React",
  "Next.js",
  "Electron",
  "微信小程序",
  "FastAPI",
  "SQLAlchemy",
  "LangChain",
  "RAG",
  "Agent",
];
```

- [ ] **Step 2: 类型检查**

Run: `cd website && npx tsc --noEmit -p tsconfig.json`
Expected: 无新增类型错误（此时其余组件尚未创建，`data.ts` 本身应零错误；若报错提示未使用的 export，属正常，因为尚无消费方）。

- [ ] **Step 3: Commit**

```bash
git add website/src/components/pages/custom-software/data.ts
git commit -m "feat(website): 软件定制页数据层(11 服务/差异化/流程/技术栈)"
```

---

### Task 2: Hero 首屏 `custom-software/Hero.tsx`

**Files:**
- Create: `website/src/components/pages/custom-software/Hero.tsx`

**Interfaces:**
- Consumes: `Reveal`, `GradientText` from `../../motion`；`EnrollButton` from `../ai-coding-camp/primitives`。
- Produces: `export function Hero({ onContact }: { onContact: () => void }): JSX.Element`。次 CTA 为锚点 `<a href="#services">`，无需额外接口。

- [ ] **Step 1: 编写 Hero 组件**

```tsx
'use client'

import { GradientText, Reveal } from '../../motion'
import { EnrollButton } from '../ai-coding-camp/primitives'

export function Hero({ onContact }: { onContact: () => void }) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-12 pt-20 text-center sm:px-6 sm:pb-16 sm:pt-28 lg:pt-32">
        <Reveal delay={0.08}>
          <h1 className="font-serif-zh mt-7 max-w-4xl text-balance leading-[1.32] tracking-[-0.005em] text-ink sm:mt-8 sm:leading-[1.22] lg:leading-[1.15]">
            <span className="hero-shine mb-2 block text-[18px] font-bold tracking-[0.18em] sm:mb-2.5 sm:text-[22px] lg:text-[26px]">
              软件定制服务
            </span>
            <span className="block text-[28px] font-bold sm:text-[42px] lg:text-[52px]">
              从<GradientText className="font-bold">想法</GradientText>到
              <GradientText className="font-bold">上线</GradientText>，一个团队全包
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-6 max-w-3xl sm:mt-7">
            <p className="text-balance text-[15px] font-medium leading-[1.75] text-ink-soft sm:text-[18px] lg:text-[20px]">
              官网、企业系统、小程序、AI 智能体——
              <span className="font-semibold text-ink">AI 原生全栈自研，真实交付、可长期运维</span>
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-col items-center gap-4 sm:mt-10 sm:flex-row sm:gap-5">
            <EnrollButton label="免费聊聊需求" onClick={onContact} />
            <a
              href="#services"
              className="text-[13px] font-medium text-ink-soft underline decoration-hairline-strong underline-offset-4 transition-colors hover:text-ink sm:text-sm"
            >
              看看我们能做什么 ↓
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 类型检查**

Run: `cd website && npx tsc --noEmit -p tsconfig.json`
Expected: 无新增类型错误。

- [ ] **Step 3: Commit**

```bash
git add website/src/components/pages/custom-software/Hero.tsx
git commit -m "feat(website): 软件定制页 Hero 首屏"
```

---

### Task 3: 服务矩阵 `custom-software/ServiceGrid.tsx`

**Files:**
- Create: `website/src/components/pages/custom-software/ServiceGrid.tsx`

**Interfaces:**
- Consumes: `SERVICES`, `THEMES` from `./data`；`Reveal`, `GradientText` from `../../motion`；`SectionEyebrow` from `../ai-coding-camp/primitives`。
- Produces: `export function ServiceGrid(): JSX.Element`，section 挂 `id="services"`。

- [ ] **Step 1: 编写 ServiceGrid 组件**

```tsx
'use client'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { SERVICES, THEMES } from './data'

export function ServiceGrid() {
  return (
    <section id="services" className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:scroll-mt-24 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#0099ff">服务矩阵</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">11 类软件定制，一站全包</GradientText>
            </span>
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
            不管你要做的是官网、内部系统，还是一个 AI 智能体，都能在这里找到对应的团队和经验。
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-2">
        {SERVICES.map((item, i) => {
          const t = THEMES[item.theme]
          return (
            <Reveal key={item.code} delay={Math.min(i, 6) * 0.06}>
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
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-2 right-2 select-none font-mono text-[100px] font-black leading-none tabular sm:right-3 sm:text-[140px]"
                  style={{ color: t.hex, opacity: 0.06 }}
                >
                  {item.code}
                </span>

                <div className="relative flex h-full flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[12px] font-bold text-canvas sm:h-10 sm:w-10 sm:text-[13px]"
                      style={{
                        background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`,
                        boxShadow: `0 4px 16px -2px ${t.hex}66`,
                      }}
                    >
                      {item.code}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px]"
                      style={{
                        borderColor: `rgba(${t.rgb}, 0.35)`,
                        color: t.hex,
                        background: `rgba(${t.rgb}, 0.08)`,
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.hex }} />
                      {t.label}
                    </span>
                  </div>

                  <h3 className="font-serif-zh text-[18px] font-semibold leading-[1.35] text-ink sm:text-[20px]">
                    {item.title}
                  </h3>
                  <p className="text-[12.5px] font-medium leading-[1.6] sm:text-[13px]" style={{ color: t.hex }}>
                    {item.hook}
                  </p>

                  <ul className="mt-1 flex flex-col gap-1.5">
                    {item.points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-[12px] leading-[1.6] text-ink-soft sm:text-[12.5px]">
                        <span
                          aria-hidden
                          className="mt-1.5 inline-flex h-1.5 w-1.5 flex-none rounded-full"
                          style={{ background: `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})` }}
                        />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 类型检查**

Run: `cd website && npx tsc --noEmit -p tsconfig.json`
Expected: 无新增类型错误。

- [ ] **Step 3: Commit**

```bash
git add website/src/components/pages/custom-software/ServiceGrid.tsx
git commit -m "feat(website): 软件定制页服务矩阵(11 卡)"
```

---

### Task 4: 差异化 `custom-software/WhyUsSection.tsx`

**Files:**
- Create: `website/src/components/pages/custom-software/WhyUsSection.tsx`

**Interfaces:**
- Consumes: `ADVANTAGES`, `THEMES` from `./data`；`Reveal`, `GradientText` from `../../motion`；`SectionEyebrow` from `../ai-coding-camp/primitives`。
- Produces: `export function WhyUsSection(): JSX.Element`。

- [ ] **Step 1: 编写 WhyUsSection（线+圆点+文字，禁止卡片堆叠）**

```tsx
'use client'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { ADVANTAGES, THEMES } from './data'

export function WhyUsSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#d42672">为什么选我们</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">不是找个外包，是找个能长期合作的团队</GradientText>
            </span>
          </h2>
        </div>
      </Reveal>

      <div className="relative mt-10 sm:mt-14">
        <span
          aria-hidden
          className="absolute left-[19px] top-2 bottom-2 w-px sm:left-[23px]"
          style={{
            background: `linear-gradient(to bottom, ${ADVANTAGES.map((a) => THEMES[a.theme].hex).join(', ')})`,
            opacity: 0.45,
          }}
        />
        <ol className="flex flex-col gap-8 sm:gap-10">
          {ADVANTAGES.map((item, i) => {
            const t = THEMES[item.theme]
            return (
              <Reveal key={item.title} delay={i * 0.06}>
                <li className="relative pl-11 sm:pl-14">
                  <span
                    aria-hidden
                    className="absolute left-[11px] top-1 h-[18px] w-[18px] rounded-full sm:left-[15px]"
                    style={{
                      background: `radial-gradient(circle, ${t.gradientFrom} 0%, ${t.gradientTo} 80%)`,
                      boxShadow: `0 0 18px ${t.hex}66`,
                    }}
                  />
                  <h3 className="font-serif-zh text-[16px] font-semibold leading-[1.35] text-ink sm:text-[19px]">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-[12.5px] leading-[1.75] text-ink-soft sm:text-[13.5px]">
                    {item.body}
                  </p>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 类型检查**

Run: `cd website && npx tsc --noEmit -p tsconfig.json`
Expected: 无新增类型错误。

- [ ] **Step 3: Commit**

```bash
git add website/src/components/pages/custom-software/WhyUsSection.tsx
git commit -m "feat(website): 软件定制页差异化 4 点(线+圆点)"
```

---

### Task 5: 合作流程 `custom-software/ProcessSection.tsx`

**Files:**
- Create: `website/src/components/pages/custom-software/ProcessSection.tsx`

**Interfaces:**
- Consumes: `PROCESS_STEPS`, `THEMES` from `./data`；`Reveal`, `GradientText` from `../../motion`；`SectionEyebrow` from `../ai-coding-camp/primitives`。
- Produces: `export function ProcessSection(): JSX.Element`。

- [ ] **Step 1: 编写 ProcessSection（同 WhyUsSection 的线+圆点语言，横向 5 步）**

```tsx
'use client'

import { GradientText, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { PROCESS_STEPS, THEMES } from './data'

export function ProcessSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#f8ec1d">合作流程</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">5 步，从聊需求到持续运维</GradientText>
            </span>
          </h2>
        </div>
      </Reveal>

      <div className="relative mt-10 sm:mt-14">
        <span
          aria-hidden
          className="absolute left-[19px] top-2 bottom-2 w-px sm:left-[23px]"
          style={{
            background: `linear-gradient(to bottom, ${PROCESS_STEPS.map((s) => THEMES[s.theme].hex).join(', ')})`,
            opacity: 0.45,
          }}
        />
        <ol className="flex flex-col gap-8 sm:gap-10">
          {PROCESS_STEPS.map((step, i) => {
            const t = THEMES[step.theme]
            return (
              <Reveal key={step.code} delay={i * 0.06}>
                <li className="relative pl-11 sm:pl-14">
                  <span
                    aria-hidden
                    className="absolute left-[11px] top-1 h-[18px] w-[18px] rounded-full sm:left-[15px]"
                    style={{
                      background: `radial-gradient(circle, ${t.gradientFrom} 0%, ${t.gradientTo} 80%)`,
                      boxShadow: `0 0 18px ${t.hex}66`,
                    }}
                  />
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <span
                      className="font-mono text-[11px] font-semibold tabular"
                      style={{ color: t.hex }}
                    >
                      {step.code}
                    </span>
                    <h3 className="font-serif-zh text-[16px] font-semibold leading-[1.35] text-ink sm:text-[19px]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-2 max-w-2xl text-[12.5px] leading-[1.75] text-ink-soft sm:text-[13.5px]">
                    {step.body}
                  </p>
                </li>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: 类型检查**

Run: `cd website && npx tsc --noEmit -p tsconfig.json`
Expected: 无新增类型错误。

- [ ] **Step 3: Commit**

```bash
git add website/src/components/pages/custom-software/ProcessSection.tsx
git commit -m "feat(website): 软件定制页合作流程 5 步(线+圆点)"
```

---

### Task 6: 技术栈背书 `custom-software/TechStackSection.tsx`

**Files:**
- Create: `website/src/components/pages/custom-software/TechStackSection.tsx`

**Interfaces:**
- Consumes: `TECH_STACK` from `./data`；`Reveal` from `../../motion`；`Marquee` from `../../motion`；`SectionEyebrow` from `../ai-coding-camp/primitives`。
- Produces: `export function TechStackSection(): JSX.Element`。

- [ ] **Step 1: 编写 TechStackSection**

```tsx
'use client'

import { Marquee, Reveal } from '../../motion'
import { SectionEyebrow } from '../ai-coding-camp/primitives'
import { TECH_STACK } from './data'

export function TechStackSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-28">
      <Reveal>
        <SectionEyebrow color="#01aef0">技术栈</SectionEyebrow>
      </Reveal>
      <Reveal delay={0.06}>
        <div className="mt-6">
          <Marquee speed={28}>
            {TECH_STACK.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center whitespace-nowrap rounded-full border border-hairline px-4 py-2 font-mono text-[12px] text-ink-soft"
              >
                {tech}
              </span>
            ))}
          </Marquee>
        </div>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: 类型检查**

Run: `cd website && npx tsc --noEmit -p tsconfig.json`
Expected: 无新增类型错误。

- [ ] **Step 3: Commit**

```bash
git add website/src/components/pages/custom-software/TechStackSection.tsx
git commit -m "feat(website): 软件定制页技术栈背书"
```

---

### Task 7: 底部 CTA `custom-software/BottomCta.tsx`

**Files:**
- Create: `website/src/components/pages/custom-software/BottomCta.tsx`

**Interfaces:**
- Consumes: `GradientText`, `Reveal` from `../../motion`；`EnrollButton` from `../ai-coding-camp/primitives`；`motion` from `framer-motion`。
- Produces: `export function BottomCta({ onContact }: { onContact: () => void }): JSX.Element`。

- [ ] **Step 1: 编写 BottomCta（复用训练营页 BottomCta 视觉，文案改为软件定制场景）**

```tsx
'use client'

import { motion } from 'framer-motion'

import { GradientText, Reveal } from '../../motion'
import { EnrollButton } from '../ai-coding-camp/primitives'

export function BottomCta({ onContact }: { onContact: () => void }) {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 sm:pb-28 lg:pb-32">
      <Reveal>
        <div
          className="relative overflow-hidden rounded-md p-7 text-center sm:p-12 lg:p-16"
          style={{
            background: 'rgba(5,5,7,0.65)',
            boxShadow: '0 14px 36px -22px rgba(0,0,0,0.85)',
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 40% 55% at 0% 0%, rgba(0,153,255,0.36), transparent 60%), radial-gradient(ellipse 40% 55% at 100% 0%, rgba(1,174,240,0.28), transparent 60%), radial-gradient(ellipse 40% 55% at 100% 100%, rgba(248,236,29,0.26), transparent 60%), radial-gradient(ellipse 40% 55% at 0% 100%, rgba(212,38,114,0.24), transparent 60%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 70% at 50% 50%, rgba(5,5,7,0.62) 0%, rgba(5,5,7,0.25) 50%, transparent 80%)',
            }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-[8%] top-[18%] h-16 w-16 rounded-full sm:h-20 sm:w-20"
            style={{ background: 'radial-gradient(circle, rgba(0,153,255,0.62) 0%, transparent 58%)' }}
            animate={{ y: [0, -16, 0], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute right-[10%] bottom-[16%] h-14 w-14 rounded-full sm:h-16 sm:w-16"
            style={{ background: 'radial-gradient(circle, rgba(248,236,29,0.55) 0%, transparent 58%)' }}
            animate={{ y: [0, 14, 0], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <div className="relative flex flex-col items-center gap-5">
            <h2 className="font-serif-zh max-w-2xl text-balance text-[24px] font-semibold leading-[1.35] sm:text-[30px] sm:leading-[1.3] lg:text-[38px]">
              想清楚要做什么了？
              <GradientText className="font-semibold">先聊聊</GradientText>
            </h2>
            <p className="max-w-xl text-[13px] leading-[1.85] text-ink-soft sm:text-sm">
              扫码联系，我们会按你的实际业务给出方案思路与报价范围，不满意不强推。
            </p>
            <div className="mt-2">
              <EnrollButton label="免费咨询报价" onClick={onContact} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
```

- [ ] **Step 2: 类型检查**

Run: `cd website && npx tsc --noEmit -p tsconfig.json`
Expected: 无新增类型错误。

- [ ] **Step 3: Commit**

```bash
git add website/src/components/pages/custom-software/BottomCta.tsx
git commit -m "feat(website): 软件定制页底部 CTA"
```

---

### Task 8: 组合内容组件 + 路由 + metadata

**Files:**
- Create: `website/src/components/pages/CustomSoftwareContent.tsx`
- Create: `website/src/app/(site)/custom/page.tsx`

**Interfaces:**
- Consumes: `Hero`, `ServiceGrid`, `WhyUsSection`, `ProcessSection`, `TechStackSection`, `BottomCta`（均来自 `./custom-software/*`）；`ContactQrCodeModal` from `./layout`（即 `../layout` 相对路径，与 `AiCodingCampContent.tsx` 一致）。
- Produces: `export function CustomSoftwareContent(): JSX.Element`；`page.tsx` 默认导出 `CustomSoftwarePage` + `export const metadata`。

- [ ] **Step 1: 编写 `CustomSoftwareContent.tsx`**

```tsx
"use client";

import { useState } from "react";

import { ContactQrCodeModal } from "../layout";
import { BottomCta } from "./custom-software/BottomCta";
import { Hero } from "./custom-software/Hero";
import { ProcessSection } from "./custom-software/ProcessSection";
import { ServiceGrid } from "./custom-software/ServiceGrid";
import { TechStackSection } from "./custom-software/TechStackSection";
import { WhyUsSection } from "./custom-software/WhyUsSection";

export function CustomSoftwareContent() {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  return (
    <div className="relative">
      <Hero onContact={openContact} />
      <ServiceGrid />
      <WhyUsSection />
      <ProcessSection />
      <TechStackSection />
      <BottomCta onContact={openContact} />

      <ContactQrCodeModal open={contactOpen} onClose={closeContact} />
    </div>
  );
}
```

- [ ] **Step 2: 编写 `website/src/app/(site)/custom/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { CustomSoftwareContent } from '@/components/pages/CustomSoftwareContent'

export const metadata: Metadata = {
  title: '软件定制服务 · 微域生光',
  description:
    '官网、企业级管理系统、小程序、AI 智能体、AI 知识库、数据分析看板、SaaS 平台、电商系统、桌面客户端、系统集成——AI 原生全栈自研，真实交付、可长期运维。',
  openGraph: {
    title: '软件定制服务 · 微域生光',
    description: '从想法到上线，一个团队全包：官网、企业系统、AI 智能体等 11 类软件定制服务。',
  },
}

export default function CustomSoftwarePage() {
  return <CustomSoftwareContent />
}
```

- [ ] **Step 3: 类型检查**

Run: `cd website && npx tsc --noEmit -p tsconfig.json`
Expected: 无类型错误。

- [ ] **Step 4: 生产构建验证**

Run: `cd website && pnpm run build`
Expected: 构建成功，输出中包含 `/custom` 路由（静态或动态均可），无 error。

- [ ] **Step 5: Commit**

```bash
git add website/src/components/pages/CustomSoftwareContent.tsx website/src/app/\(site\)/custom/page.tsx
git commit -m "feat(website): 新增 /custom 软件定制服务落地页"
```

---

### Task 9: 导航注册（TopNav + SiteFooter）

**Files:**
- Modify: `website/src/components/layout/TopNav.tsx:24-29`（`NAV_LINKS` 数组）
- Modify: `website/src/components/layout/SiteFooter.tsx:3-14`（`FOOTER_GROUPS` 数组）

**Interfaces:**
- Consumes: 无新增类型，沿用既有 `NavLink` 与 `FOOTER_GROUPS` 结构。
- Produces: 无新导出；导航新增一条可点击链接 `/custom`。

- [ ] **Step 1: 修改 `TopNav.tsx` 的 `NAV_LINKS`**

将：
```ts
const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'AI架构师训练营', exact: true },
  { href: '/course', label: 'VIP课程', matchPrefix: '/course' },
  { href: '/community', label: 'AI学习社区', matchPrefix: '/community' },
  { href: '/product', label: '产品', matchPrefix: '/product' },
]
```
改为：
```ts
const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'AI架构师训练营', exact: true },
  { href: '/course', label: 'VIP课程', matchPrefix: '/course' },
  { href: '/community', label: 'AI学习社区', matchPrefix: '/community' },
  { href: '/custom', label: '软件定制', matchPrefix: '/custom' },
  { href: '/product', label: '产品', matchPrefix: '/product' },
]
```

- [ ] **Step 2: 修改 `SiteFooter.tsx` 的 `FOOTER_GROUPS`**

将：
```ts
const FOOTER_GROUPS: Array<{
  title: string;
  links: Array<{ label: string; href: string }>;
}> = [
  {
    title: "浏览",
    links: [
      { label: "AI架构师训练营", href: "/" },
      { label: "产品", href: "/product" },
    ],
  },
];
```
改为：
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
      { label: "产品", href: "/product" },
    ],
  },
];
```

- [ ] **Step 3: 类型检查**

Run: `cd website && npx tsc --noEmit -p tsconfig.json`
Expected: 无类型错误。

- [ ] **Step 4: Commit**

```bash
git add website/src/components/layout/TopNav.tsx website/src/components/layout/SiteFooter.tsx
git commit -m "feat(website): 导航新增「软件定制」入口(TopNav + Footer)"
```

---

### Task 10: 本地运行验证（浏览器实测）

**Files:** 无新增/修改文件（纯验证任务）。

**Interfaces:** 无。

- [ ] **Step 1: 启动本地开发服务器**

Run: `cd website && pnpm run dev`
Expected: 终端输出 `Local: http://localhost:3000`（或配置的端口），无编译错误。

- [ ] **Step 2: 浏览器核对首页导航**

打开 `http://localhost:3000/`，确认顶部导航出现「软件定制」入口（桌面端 + 缩窄窗口模拟移动端），点击后跳转到 `/custom` 且该项高亮（active pill）。

- [ ] **Step 3: 浏览器核对 `/custom` 页面**

直接访问 `http://localhost:3000/custom`，核对：
- Hero 大标题渐变高亮正常显示，无排版溢出。
- 滚动到「服务矩阵」，11 张卡片按 `lg:grid-cols-2` 双栏排布，无边框、`rounded-md`、每卡有主题色光晕与巨大淡编号。
- 「为什么选我们」「合作流程」为线+圆点+文字纵向列表，无卡片堆叠感。
- 技术栈 Marquee 横向滚动流畅、不撑破容器宽度。
- 点击 Hero 主按钮与底部 CTA 按钮，`ContactQrCodeModal` 正常弹出与关闭。
- 缩窄浏览器宽度到移动端尺寸，确认无横向溢出，栅格降级为单列。

- [ ] **Step 4: 核对 Footer**

滚动到页面底部，确认 Footer「浏览」分组中出现「软件定制」链接且可点击跳转。

- [ ] **Step 5: 记录验证结果**

若以上核对全部通过，无需额外提交（本任务不产生代码变更）；若发现视觉/交互问题，回到对应 Task 的组件文件修复并重新走该组件的类型检查 + commit 流程。

---

## Self-Review Notes

- **spec 覆盖**：Hero(3.1)→Task2；服务矩阵(3.2)→Task1+3；差异化(3.3)→Task1+4；流程(3.4)→Task1+5；技术栈(3.5)→Task1+6；底部 CTA(3.6)→Task7；路由/组合/metadata(2)→Task8；导航注册(2)→Task9；验收标准(5)→Task10 全部覆盖。
- **占位符扫描**：无 TBD/TODO；所有 11 项服务、4 项差异化、5 步流程均为完整文案，非占位。
- **类型一致性**：`ThemeKey`/`Theme`/`ServiceItem`/`Advantage`/`ProcessStep` 在 Task1 定义后，Task3–7 引用字段名（`hex`/`rgb`/`gradientFrom`/`gradientTo`/`code`/`title`/`hook`/`points`/`body`/`theme`）全部保持一致。
- **依赖方向**：`custom-software/*` 只读取 `ai-coding-camp/primitives`（无状态纯展示组件，允许跨 feature 复用），不导入 `ai-coding-camp/data.ts`，保持数据层独立、符合 feature-based 结构。
