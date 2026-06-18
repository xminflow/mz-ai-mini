# 训练营页面两阶段重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把官网 `/ai-coding-camp` 训练营页面从单阶段重构为两阶段(零基础 ¥1999 / 职业进阶 ¥3999),用「全景学习路径 + 双购买覆盖范围」可视化完整路径与各自收获。

**Architecture:** 先做**无行为变更的抽取重构**(把现有 ~1650 行单文件拆成 `ai-coding-camp/` 目录下的数据模块 + 子组件,页面渲染保持一致),再**新增第二阶段数据 + 全景路径图 + 第二阶段板块**,最后整合验证。共用框架(讲师 / 底部 CTA),阶段差异化(收获 / 服务 / 价格)。

**Tech Stack:** Next.js(App Router)+ React + Tailwind CSS + framer-motion + 现有主题 token(`text-ink` / `text-muted` / `font-serif-zh` 等)。不新增依赖。

**验证约定(全程适用):** 项目 `CLAUDE.md` 规定前端不写组件级测试。每个任务用 `cd website && pnpm lint && pnpm build` 通过 + `pnpm dev` 起服务后用浏览器(chrome-devtools)核对渲染与交互作为验收;不引入单测。

**关键参考文件:**
- 现有实现:`website/src/components/pages/AiCodingCampContent.tsx`(1650 行,本次拆分来源)
- 页面入口:`website/src/app/(site)/ai-coding-camp/page.tsx`
- 第二阶段数据源:仓库根 `outline.md`(第 91–244 行为第二阶段)
- 设计依据:`docs/superpowers/specs/2026-06-10-ai-coding-camp-two-stage-redesign-design.md`

**目标文件结构(最终):**

```
website/src/components/pages/
├─ AiCodingCampContent.tsx          # 改:瘦身为编排层
└─ ai-coding-camp/                  # 新建目录
   ├─ data.ts                       # 类型 + 两阶段全部数据
   ├─ primitives.tsx                # 共用小件 + Hero 视觉层
   ├─ Hero.tsx
   ├─ JourneyMap.tsx                # 全景路径(主线 + 双覆盖范围括号)
   ├─ StageOneSection.tsx
   ├─ StageTwoSection.tsx
   ├─ InstructorSection.tsx
   └─ BottomCta.tsx
```

> 抽取类任务为避免在计划里重复粘贴上千行**未改动**代码,采用「按现有 `AiCodingCampContent.tsx` 的具名定义整体迁移、保持代码不变」的方式,并指明迁移的具体定义名;新增内容(第二阶段数据、JourneyMap、StageTwoSection)给出完整代码。

---

## Task 1: 抽取数据层 `data.ts`(无行为变更)

**Files:**
- Create: `website/src/components/pages/ai-coding-camp/data.ts`
- Reference(不改动,仅复制定义): `website/src/components/pages/AiCodingCampContent.tsx`

- [ ] **Step 1: 创建 `data.ts`,把现有文件中的下列定义原样迁入(保持代码、类型、数值完全不变)**

从 `AiCodingCampContent.tsx` 迁移以下具名定义到 `data.ts` 并 `export`:
- 类型:`ThemeKey`、`Theme`、`SubLesson`、`Warning`、`Chapter`、`Deliverable`、`InstructorCredential`、`ServiceStage`、`TimelineNode`
- 常量:`THEMES`、`CHAPTERS`(重命名 `export const STAGE1_CHAPTERS = [...]`)、`DELIVERABLES`(→ `STAGE1_DELIVERABLES`)、`INSTRUCTOR_CREDENTIALS`、`SERVICE_STAGES`(→ `STAGE1_SERVICE_STAGES`)、`PROJECT_TIMELINE`、`OVERVIEW_CARDS`、`TIMELINE_NODES_XY`
- 纯函数:`buildSmoothPath`

`data.ts` 顶部加注释说明用途。`OVERVIEW_CARDS` 里 `theme` 字段保留 `as ThemeKey`。

- [ ] **Step 2: 临时让 `AiCodingCampContent.tsx` 从 `data.ts` 导入这些定义**

删除 `AiCodingCampContent.tsx` 内被迁出的定义,改为:
```ts
import {
  THEMES, STAGE1_CHAPTERS as CHAPTERS, STAGE1_DELIVERABLES as DELIVERABLES,
  INSTRUCTOR_CREDENTIALS, STAGE1_SERVICE_STAGES as SERVICE_STAGES,
  PROJECT_TIMELINE, OVERVIEW_CARDS, TIMELINE_NODES_XY, buildSmoothPath,
} from './ai-coding-camp/data'
import type { ThemeKey } from './ai-coding-camp/data'
```
(用 `as` 别名保持文件内其余代码引用名不变,减少改动面。)

- [ ] **Step 3: 校验构建与渲染**

Run: `cd website && pnpm lint && pnpm build`
Expected: 通过,无新增类型/lint 错误。
再 `pnpm dev`,浏览器打开 `/ai-coding-camp`,确认页面与改动前**视觉完全一致**。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/pages/ai-coding-camp/data.ts website/src/components/pages/AiCodingCampContent.tsx
git commit -m "refactor(website): 抽取训练营页面数据层 data.ts(无行为变更)"
```

---

## Task 2: 抽取共用小件与 Hero 视觉层 `primitives.tsx`(无行为变更)

**Files:**
- Create: `website/src/components/pages/ai-coding-camp/primitives.tsx`
- Modify: `website/src/components/pages/AiCodingCampContent.tsx`

- [ ] **Step 1: 创建 `primitives.tsx`('use client'),原样迁入下列定义并 `export`**

从 `AiCodingCampContent.tsx` 迁移(代码不变):`ArrowRight`、`SectionEyebrow`、`HeroAuroraLayers`、`Orb` 类型、`HERO_ORBS`、`FloatingOrbs`、`ShimmerHeading`。
`FloatingOrbs` / `HeroAuroraLayers` 用到 framer-motion,文件首行加 `'use client'` 并 `import { motion } from 'framer-motion'`。

- [ ] **Step 2: 在 `AiCodingCampContent.tsx` 改为导入**

删除上述定义,新增:
```ts
import {
  ArrowRight, SectionEyebrow, HeroAuroraLayers, FloatingOrbs, ShimmerHeading,
} from './ai-coding-camp/primitives'
```

- [ ] **Step 3: 校验**

Run: `cd website && pnpm lint && pnpm build`
Expected: 通过。`pnpm dev` 浏览器确认 Hero 极光层、浮动光点、Shimmer 标题动画与改动前一致。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/pages/ai-coding-camp/primitives.tsx website/src/components/pages/AiCodingCampContent.tsx
git commit -m "refactor(website): 抽取训练营页面共用小件 primitives.tsx(无行为变更)"
```

---

## Task 3: 抽取 Hero / 讲师 / 底部 CTA 子组件(无行为变更)

**Files:**
- Create: `website/src/components/pages/ai-coding-camp/Hero.tsx`
- Create: `website/src/components/pages/ai-coding-camp/InstructorSection.tsx`
- Create: `website/src/components/pages/ai-coding-camp/BottomCta.tsx`
- Modify: `website/src/components/pages/AiCodingCampContent.tsx`

- [ ] **Step 1: 创建三个子组件('use client'),把现有 JSX 段落原样搬入**

- `Hero.tsx`:导出 `export function Hero()`。内容 = 现有「1. Hero」整个 `<section>`(含价格条、服务承诺横条)。依赖从 `primitives` 导入 `HeroAuroraLayers/FloatingOrbs/ShimmerHeading`,从 `../motion` 导入 `GradientText/Reveal`。
- `InstructorSection.tsx`:导出 `export function InstructorSection()`。内容 = 现有「3. 讲师介绍」整个 `<section>`,数据从 `data` 导入 `INSTRUCTOR_CREDENTIALS`、`THEMES`。
- `BottomCta.tsx`:导出 `export function BottomCta({ onContact }: { onContact: () => void })`。内容 = 现有「8. 底部 CTA」整个 `<section>`,把内部 `onClick={openContact}` 改为 `onClick={onContact}`。依赖 `ArrowRight`(primitives)、`GradientText`(../motion)、`motion`(framer-motion)。

- [ ] **Step 2: 编排层引用子组件**

在 `AiCodingCampContent.tsx` 中,把 Hero / 讲师 / 底部 CTA 三段 `<section>` 替换为 `<Hero />`、`<InstructorSection />`、`<BottomCta onContact={openContact} />`,并 import 这三个组件。`contactOpen` 状态与 `ContactQrCodeModal` 仍留在编排层。

- [ ] **Step 3: 校验**

Run: `cd website && pnpm lint && pnpm build`
Expected: 通过。`pnpm dev` 浏览器逐段确认 Hero、讲师、底部 CTA 与改动前一致;点击底部 CTA 按钮能正常弹出 `ContactQrCodeModal`。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/pages/ai-coding-camp/
git commit -m "refactor(website): 抽取 Hero/讲师/底部CTA 子组件(无行为变更)"
```

---

## Task 4: 抽取第一阶段板块 `StageOneSection.tsx`(无行为变更)

**Files:**
- Create: `website/src/components/pages/ai-coding-camp/StageOneSection.tsx`
- Modify: `website/src/components/pages/AiCodingCampContent.tsx`

- [ ] **Step 1: 创建 `StageOneSection.tsx`('use client'),搬入现有第一阶段相关段落**

导出 `export function StageOneSection({ onEnroll }: { onEnroll: () => void })`。内容 = 现有这些 `<section>` 按顺序拼接:
- 「2. 四大成果」(`STAGE1_DELIVERABLES`)
- 「4. 课程总览」(`OVERVIEW_CARDS`)
- 「6. 十章大纲」(`STAGE1_CHAPTERS`)
- 「7. 服务模式」(`STAGE1_SERVICE_STAGES` + 时间轴条)

在「服务模式」末尾新增一个**价格条 + 报名按钮**(¥1999),按钮 `onClick={onEnroll}`。价格条复用 Hero 现有价格条样式(原价 ¥2999 → ¥1999),报名按钮复用底部 CTA 的白底 shimmer 按钮样式,文案「报名零基础 AI 编程 · ¥1999」。
数据从 `data` 导入;`GradientText/Reveal` 从 `../motion`;`SectionEyebrow/ArrowRight` 从 `primitives`。

> 注意:现有「5. 能力主线 SVG 时间线」**不搬入此组件**,它将在 Task 6 被 JourneyMap 取代;本任务暂时保留在编排层原位。

- [ ] **Step 2: 编排层引用**

把上述四段 `<section>` 从 `AiCodingCampContent.tsx` 移除,替换为 `<StageOneSection onEnroll={openContact} />`。`CapabilityTimeline` 及其「5.」section 暂留编排层。`CapabilityTimeline` 组件定义此时仍在主文件;若它依赖的 `PROJECT_TIMELINE/TIMELINE_NODES_XY/THEMES/buildSmoothPath/Reveal` 已可从 data/motion 导入,保持其工作即可。

- [ ] **Step 3: 校验**

Run: `cd website && pnpm lint && pnpm build`
Expected: 通过。`pnpm dev` 确认四大成果、课程总览、十章大纲、服务模式渲染一致,新增的 ¥1999 价格条 + 报名按钮显示正常、点击弹出联系弹窗。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/pages/ai-coding-camp/StageOneSection.tsx website/src/components/pages/AiCodingCampContent.tsx
git commit -m "refactor(website): 抽取第一阶段板块 + 下沉 ¥1999 价格报名入口"
```

---

## Task 5: 新增第二阶段与全景路径数据(`data.ts` 扩展)

**Files:**
- Modify: `website/src/components/pages/ai-coding-camp/data.ts`
- Reference: `outline.md`(第 91–244 行)

- [ ] **Step 1: 在 `data.ts` 新增第二阶段主题色**

```ts
// 第二阶段「职业硬核」深色系,与第一阶段明快七彩区分
export type Stage2ThemeKey = 'advance' | 'enterprise' | 'career'

export const STAGE2_THEMES: Record<Stage2ThemeKey, Theme> = {
  advance:    { label: '能力进阶', hex: '#60A5FA', rgb: '96, 165, 250',  gradientFrom: '#93C5FD', gradientTo: '#1E40AF' }, // 钢蓝/靛
  enterprise: { label: '企业实战', hex: '#D4A24E', rgb: '212, 162, 78',  gradientFrom: '#E8C77A', gradientTo: '#92600E' }, // 暗金/铜
  career:     { label: '求职冲刺', hex: '#2DD4BF', rgb: '45, 212, 191',  gradientFrom: '#5EEAD4', gradientTo: '#0F766E' }, // 翡翠深绿
}
```

- [ ] **Step 2: 新增第二阶段课程数据结构与数据**

子条目正文照抄 `outline.md` 对应行;`hours` 与 `output` 中标注「待确认」的为拟稿。

```ts
export type Stage2Lesson = {
  code: string          // 课号,如 'S2-1'
  title: string
  hours: string         // 拟稿待确认
  goal: string          // 本节目标(outline)
  points: string[]      // 子条目(outline 1.1/1.2…)
  output: string        // 课后产出;课1-5为拟稿待确认
  outputDraft?: boolean // true 表示该 output 为拟稿待确认
  theme: Stage2ThemeKey
}

export type Stage2Group = {
  key: Stage2ThemeKey
  title: string
  subtitle: string
  lessons: Stage2Lesson[]
}

export const STAGE2_GROUPS: Stage2Group[] = [
  {
    key: 'advance',
    title: '能力进阶',
    subtitle: '补齐企业级 AI 工程能力地图(课 1–8)',
    lessons: [
      { code: 'S2-1', title: 'Claude Code 与 Codex 进阶', hours: '待确认', theme: 'advance',
        goal: '掌握两大 agentic 编程工具的深度用法,建立一套可复用的 AI 开发工作流。',
        points: [ /* 照抄 outline.md 第 94–100 行 7 条 */ ],
        output: '一套可复用的个人 AI 开发工作流配置(CLAUDE.md / 自定义命令 / hooks)', outputDraft: true },
      { code: 'S2-2', title: 'AI 全栈进阶', hours: '待确认', theme: 'advance',
        goal: '补齐全栈知识地图,学会用 AI 快速进入任意技术栈。',
        points: [ /* outline 第 106–112 行 */ ],
        output: '一张个人全栈技术地图 + 一次陌生技术栈上手记录', outputDraft: true },
      { code: 'S2-3', title: 'AI 测试工程', hours: '待确认', theme: 'advance',
        goal: '建立企业级测试思维,用 AI 把测试做扎实,而非只凑覆盖率数字。',
        points: [ /* outline 第 118–124 行 */ ],
        output: '为一个已有项目补上分层测试并接入 CI', outputDraft: true },
      { code: 'S2-4', title: 'AI 运维工程', hours: '待确认', theme: 'advance',
        goal: '掌握应用上线后「看得见、稳得住」的运维基本功。',
        points: [ /* outline 第 130–135 行 */ ],
        output: '给应用接上监控告警 + 一条可用的 CI/CD 流水线', outputDraft: true },
      { code: 'S2-5', title: 'SDD 驱动编程与协作开发', hours: '待确认', theme: 'advance',
        goal: '从「凭感觉写」升级到「规范驱动」,让 AI 协作可控、可复现。',
        points: [ /* outline 第 141–146 行 */ ],
        output: '用 spec-kit / superpowers 跑通一次 spec → 实现 → 验收', outputDraft: true },
      { code: 'S2-6', title: '整洁架构与领域驱动设计', hours: '待确认', theme: 'advance',
        goal: '掌握让代码长期可维护的架构方法,并教会 AI 守住架构。',
        points: [ /* outline 第 152–156 行 */ ],
        output: '把一段高耦合代码重构为清晰分层,并写下一份架构约束说明' }, // outline 第157行
      { code: 'S2-7', title: '大模型应用开发 · RAG 与上下文工程', hours: '待确认', theme: 'advance',
        goal: '掌握大模型应用的核心能力——把私有知识接进模型。',
        points: [ /* outline 第 162–167 行 */ ],
        output: '搭建一个能基于自己文档问答的最小 RAG 应用' }, // outline 第168行
      { code: 'S2-8', title: '大模型应用开发 · 智能体与 harness', hours: '待确认', theme: 'advance',
        goal: '理解智能体的真实结构,能从零搭建一个可控的 agent。',
        points: [ /* outline 第 173–178 行 */ ],
        output: '实现一个带工具调用与基础记忆的智能体' }, // outline 第179行
    ],
  },
  {
    key: 'enterprise',
    title: '企业实战直播',
    subtitle: '从零搭两套可上线的企业级系统(课 9–12)',
    lessons: [
      { code: 'S2-9', title: '企业级实战直播 · 智能问数系统(上)', hours: '待确认', theme: 'enterprise',
        goal: '从零启动一个企业级 Text-to-SQL 系统,完成核心链路。',
        points: [ /* outline 第 184–188 行 */ ],
        output: '跑通「提问 → 生成 SQL → 返回结果」的最小闭环' },
      { code: 'S2-10', title: '企业级实战直播 · 智能问数系统(下)', hours: '待确认', theme: 'enterprise',
        goal: '把 demo 打磨成可上线、准确且安全的产品。',
        points: [ /* outline 第 194–198 行 */ ],
        output: '把智能问数系统部署到可访问环境,并加上权限控制' },
      { code: 'S2-11', title: '企业级实战直播 · Hermes/Openclaw 智能体系统(上)', hours: '待确认', theme: 'enterprise',
        goal: '从零搭建一个智能体系统的骨架与核心能力。',
        points: [ /* outline 第 204–208 行 */ ],
        output: '跑通智能体「接收任务 → 调用工具 → 产出结果」的主流程' },
      { code: 'S2-12', title: '企业级实战直播 · Hermes/Openclaw 智能体系统(下)', hours: '待确认', theme: 'enterprise',
        goal: '把智能体从「能跑」做到「能上线、稳定、可运营」。',
        points: [ /* outline 第 214–218 行 */ ],
        output: '把智能体系统部署上线,并接入基础监控' },
    ],
  },
  {
    key: 'career',
    title: '求职冲刺',
    subtitle: '把课程实战讲成 offer(课 13–14)',
    lessons: [
      { code: 'S2-13', title: '求职面试专题(一)· 大模型应用', hours: '待确认', theme: 'career',
        goal: '系统梳理大模型应用方向高频面试题,做到能答、能讲、能动手。',
        points: [ /* outline 第 223–231 行 */ ],
        output: '一份「大模型应用面试题库 + 个人答案稿」,并完成一次完整模拟面试' },
      { code: 'S2-14', title: '求职面试专题(二)· VibeCoding 与企业架构', hours: '待确认', theme: 'career',
        goal: '梳理 AI 编程工作流与企业级工程能力高频面试题。',
        points: [ /* outline 第 236–244 行 */ ],
        output: '一份 VibeCoding/企业架构面试题库 + 个人答案稿 + 完整模拟面试', outputDraft: true },
    ],
  },
]
```

> 实现者注意:每个 `points: [...]` 必须用 `outline.md` 对应行号区间的子条目原文逐条填入(去掉行首 `- `),不得省略或改写。

- [ ] **Step 3: 新增第二阶段收获墙、服务、价格、适合人群、全景里程碑数据**

```ts
// 第二阶段收获墙(职业级作品集 + 求职产出)
export const STAGE2_DELIVERABLES: Deliverable[] = [
  { code: '01', title: '一套企业级 AI 工程能力', subtitle: '测试 · 运维 · SDD · 整洁架构',
    body: '从有效测试、可观测运维、规范驱动开发到整洁架构与 DDD,补齐职业开发者真正缺的工程地图,并教 AI 守住架构。',
    badges: ['分层测试', 'CI/CD', '架构约束'], theme: 'frontend' /* 见下:Deliverable.theme 仍用一阶段 ThemeKey,渲染时映射到 STAGE2_THEMES,见 Step 4 备注 */ },
  // ... 其余条目见下方说明
]
```

> `Deliverable.theme` 字段类型为 `ThemeKey`(一阶段)。为不破坏既有类型,**第二阶段收获墙改用独立类型**,新增:

```ts
export type Stage2Deliverable = {
  code: string; title: string; subtitle: string; body: string; badges: string[]; theme: Stage2ThemeKey
}

export const STAGE2_DELIVERABLES: Stage2Deliverable[] = [
  { code: '01', title: '一套企业级 AI 工程能力', subtitle: '测试 · 运维 · SDD · 整洁架构',
    body: '从有效测试、可观测运维、规范驱动开发到整洁架构与 DDD,补齐职业开发者真正缺的工程地图,并教 AI 守住架构。',
    badges: ['分层测试', 'CI/CD', '架构约束'], theme: 'advance' },
  { code: '02', title: 'RAG 问答应用 + 带记忆的智能体', subtitle: '大模型应用核心能力 · 可运行',
    body: '把私有文档接进模型做出最小 RAG 问答应用,并从零实现一个带工具调用与基础记忆的可控智能体。',
    badges: ['RAG', '工具调用', '记忆系统'], theme: 'advance' },
  { code: '03', title: '智能问数系统(可上线)', subtitle: 'Text-to-SQL · 带权限与数据安全',
    body: '从「提问 → 生成 SQL → 返回结果」最小闭环,打磨到准确率优化、自校验、结果可视化、行级权限与防注入,部署到可访问环境。',
    badges: ['Text-to-SQL', '可上线', '权限隔离'], theme: 'enterprise' },
  { code: '04', title: 'Hermes/Openclaw 智能体系统(可上线)', subtitle: '引擎 · 工具 · 记忆 · 监控',
    body: '从智能体主循环、工具系统到长期记忆、多轮编排、异常降级与生产监控,搭出一套能上线、稳定、可运营的智能体系统。',
    badges: ['Agent 引擎', '生产部署', '监控告警'], theme: 'enterprise' },
  { code: '05', title: '面试题库 + 个人答案稿 + 模拟面试', subtitle: '大模型应用 / VibeCoding 与架构 两方向',
    body: '把课程里的 RAG / 智能体 / 架构实战,用 STAR 结构讲到面试官认可;沉淀两方向的高频题库与个人答案稿,并完成完整模拟面试。',
    badges: ['题库', 'STAR 讲述', '模拟面试'], theme: 'career' },
]

// 第二阶段服务模式(拟稿待确认)
export const STAGE2_SERVICE_DRAFT = {
  note: '以下服务节奏为拟稿,待确认',
  duration: '待确认',
  title: '企业级实战直播 + 长期陪跑',
  highlight: '直播带做两套企业级系统 · 课程外问题长期答疑(时长待确认)',
  body: '第二阶段以企业级实战直播为主,带你从零做出智能问数与智能体两套可上线系统;直播之外的真实项目、求职准备等问题持续陪跑(具体节奏与时长待确认)。',
  features: [
    '企业级实战直播,带做两套可上线系统',
    '求职专题 + 模拟面试陪练',
    '课程之外的真实项目与求职问题长期答疑(时长待确认)',
    '专属沟通渠道(细节待确认)',
  ],
}

// 价格
export const STAGE1_PRICE = { now: '¥1999', original: '¥2999' }
export const STAGE2_PRICE = { now: '¥3999', includes: '含第一阶段全部内容' }

// 适合人群(拟稿待确认)
export const AUDIENCES = {
  stage1: { name: '零基础 AI 编程', price: '¥1999', coverage: '第一阶段 · 10 课',
    fit: '零开发经验、想用 AI 做出自己的应用' },
  stage2: { name: '职业开发者进阶', price: '¥3999', coverage: '第一阶段 + 第二阶段 · 共 24 课',
    fit: '已有基础、想进阶到企业级 AI 工程并拿下求职 offer' },
}

// 全景路径里程碑(第二阶段 3 簇,第一阶段复用 PROJECT_TIMELINE)
export type JourneyMilestone = { label: string; gain: string; theme: Stage2ThemeKey }
export const STAGE2_MILESTONES: JourneyMilestone[] = [
  { label: '能力进阶', gain: '企业级工程能力 + RAG 应用 + 智能体', theme: 'advance' },
  { label: '企业实战', gain: '2 套可上线的企业级实战系统', theme: 'enterprise' },
  { label: '求职冲刺', gain: '面试题库 + 答案稿 + 模拟面试', theme: 'career' },
]
```

- [ ] **Step 4: 校验**

Run: `cd website && pnpm lint && pnpm build`
Expected: 通过(纯数据新增,页面暂未引用,不应有未使用导出报错;若 lint 对未使用变量报错,可暂忽略——下游任务会引用,或用 `// eslint-disable` 仅限确有规则时)。

- [ ] **Step 5: 提交**

```bash
git add website/src/components/pages/ai-coding-camp/data.ts
git commit -m "feat(website): 新增训练营第二阶段课程/收获/价格/适合人群数据(部分拟稿待确认)"
```

---

## Task 6: 全景学习路径图 `JourneyMap.tsx`(取代旧时间线)

**Files:**
- Create: `website/src/components/pages/ai-coding-camp/JourneyMap.tsx`
- Modify: `website/src/components/pages/AiCodingCampContent.tsx`(移除旧「5. 能力主线」section 与 `CapabilityTimeline` 定义,改放 `<JourneyMap />`)

设计目标(见 spec §4):上半一条完整主线(第一阶段里程碑用 `PROJECT_TIMELINE`/七彩,第二阶段 3 簇用 `STAGE2_MILESTONES`/深色),节点挂收获徽章;下半两条「购买覆盖范围」括号(¥1999 括前段、¥3999 括全程并标“含第一阶段全部”),各标适合人群;中间一道“进阶解锁”分界;移动端降级为纵向时间线 + 两张覆盖范围卡。

- [ ] **Step 1: 创建 `JourneyMap.tsx` 桌面端主线**

要点:
- 复用现有 `buildSmoothPath` / `TIMELINE_NODES_XY` 思路绘制 SVG 主线(可沿用现有流光 dash 动画 `<animate>`)。
- 节点数据:第一阶段取 `PROJECT_TIMELINE`(9 节点,沿用其 `THEMES` 颜色),第二阶段取 `STAGE2_MILESTONES`(3 簇,用 `STAGE2_THEMES` 颜色)。把两组节点沿主线从左到右排布:第一阶段占左 ~58% 宽,第二阶段占右 ~42% 宽,中间留出分界。
- 每个节点上/下交替挂「收获徽章」小卡:第一阶段用 `node.milestone`+`node.detail`,第二阶段用 `milestone.label`+`milestone.gain`。
- 分界:在两组之间画一条竖向发光分隔 + 一个「LEVEL UP · 进阶解锁」标签(用 stage1→stage2 渐变色)。

代表性骨架(具体坐标在浏览器里微调):
```tsx
'use client'
import { motion } from 'framer-motion'
import { Reveal } from '../motion'
import {
  PROJECT_TIMELINE, STAGE2_MILESTONES, THEMES, STAGE2_THEMES, AUDIENCES,
} from './data'

export function JourneyMap() {
  return (
    <>
      {/* 桌面端:主线 + 节点 + 收获徽章 + 分界 */}
      <div className="relative hidden lg:block">
        {/* SVG 主线(复用流光 dash 动画);节点用 PROJECT_TIMELINE + STAGE2_MILESTONES */}
        {/* 节点收获徽章:绝对定位,上下交替 */}
        {/* 中段竖向分界 + “LEVEL UP · 进阶解锁” 标签 */}
      </div>
      {/* 桌面端:下半两条覆盖范围括号 */}
      <CoverageBrackets />
      {/* 移动端:纵向时间线 + 两张覆盖范围卡 */}
      <div className="relative lg:hidden">{/* 见 Step 3 */}</div>
    </>
  )
}
```

- [ ] **Step 2: 桌面端「覆盖范围括号」`CoverageBrackets`**

在主线下方放两行水平括号(HTML + 边框端帽即可,不必 SVG):
- 第一条:`left: 2%`,`width: 56%`(对齐第一阶段节点跨度);标签 `AUDIENCES.stage1`:名称 + `¥1999` + 适合人群 + 覆盖「第一阶段 10 课」。
- 第二条:`left: 2%`,`width: 96%`(跨全程);标签 `AUDIENCES.stage2`:名称 + `¥3999` + 「含第一阶段全部」徽章 + 适合人群 + 覆盖「24 课」。
- 第一条用第一阶段主色(紫青系),第二条用渐变(紫→金,体现跨两段)。端帽用 `┤ ├` 风格(左右各一段竖边框)。

代表性结构:
```tsx
function CoverageBrackets() {
  const a = AUDIENCES
  return (
    <div className="relative mt-6 hidden h-[120px] lg:block">
      {/* bracket 1: 零基础 ¥1999 */}
      <div className="absolute" style={{ left: '2%', width: '56%', top: 0 }}>
        {/* 横线 + 两端竖帽;下方一张小标签卡:a.stage1.name / a.stage1.price / a.stage1.fit / a.stage1.coverage */}
      </div>
      {/* bracket 2: 职业进阶 ¥3999(含一阶段) */}
      <div className="absolute" style={{ left: '2%', width: '96%', top: 56 }}>
        {/* 同上,标签含“含第一阶段全部”徽章;a.stage2.* */}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 移动端降级**

- 纵向主线(复用现有移动端竖向时间线写法):依次渲染第一阶段 `PROJECT_TIMELINE` 节点(七彩),再渲染第二阶段 `STAGE2_MILESTONES`(深色),两段之间插一张「进阶解锁 · 第二阶段」分隔卡。
- 末尾放两张「覆盖范围卡」:分别用 `AUDIENCES.stage1` / `AUDIENCES.stage2`,每张列 名称 / 价格 / 适合谁 / 覆盖哪些阶段(stage2 标“含第一阶段全部”)。

- [ ] **Step 4: 编排层接入,移除旧时间线**

在 `AiCodingCampContent.tsx`:
- 删除 `CapabilityTimeline` 组件定义与「5. 能力主线 SVG 时间线」整个 `<section>`。
- 在讲师区块之前(spec 第 2 块位置)插入新 section,内含标题(SectionEyebrow「完整学习路径」)+ `<JourneyMap />`。
- 清理因删除而不再使用的导入(如仅 `CapabilityTimeline` 用到的 `TIMELINE_NODES_XY`/`buildSmoothPath`,若 JourneyMap 也用则保留在 JourneyMap 内导入)。

- [ ] **Step 5: 校验**

Run: `cd website && pnpm lint && pnpm build`
Expected: 通过。`pnpm dev` 浏览器(桌面宽度)确认:完整主线渲染、第一/二阶段色系分明、节点收获徽章可读、两条覆盖范围括号宽度与价格/人群正确、分界“进阶解锁”成立;再用 chrome-devtools 模拟移动端宽度,确认纵向时间线 + 两张覆盖范围卡正常。

- [ ] **Step 6: 提交**

```bash
git add website/src/components/pages/ai-coding-camp/JourneyMap.tsx website/src/components/pages/AiCodingCampContent.tsx
git commit -m "feat(website): 新增全景学习路径图(完整主线+双购买覆盖范围括号),取代旧能力时间线"
```

---

## Task 7: 第二阶段板块 `StageTwoSection.tsx`

**Files:**
- Create: `website/src/components/pages/ai-coding-camp/StageTwoSection.tsx`
- Modify: `website/src/components/pages/AiCodingCampContent.tsx`

- [ ] **Step 1: 创建 `StageTwoSection.tsx`('use client'),结构 = 定位 → 收获墙 → 三段分组课卡 → 服务(拟稿) → 价格报名**

导出 `export function StageTwoSection({ onEnroll }: { onEnroll: () => void })`。

1. **定位头**:`SectionEyebrow` 用 `STAGE2_THEMES.advance.hex`,标题「职业开发者进阶」,副文案点明面向有基础者、覆盖企业级工程 + 求职,价格 ¥3999(含第一阶段全部)。
2. **收获墙**:`STAGE2_DELIVERABLES.map(...)`,卡片复用第一阶段四大成果卡样式(`Stage2Deliverable` 字段一致:code/title/subtitle/body/badges),颜色取 `STAGE2_THEMES[item.theme]`。
3. **三段分组课卡**:`STAGE2_GROUPS.map(group => ...)`,每组先一个小节标题(`group.title` + `group.subtitle`,色取 `STAGE2_THEMES[group.key]`),组内 `group.lessons.map(lesson => ...)` 渲染课卡:
   - 课号(`lesson.code` 去掉 `S2-` 显示序号亦可)+ 标题 + `hours`(若为「待确认」加一个灰色“待确认”小标)。
   - `goal` 作引言。
   - `points` 渲染为子条目列表(复用第一阶段 lessons 列表样式)。
   - `output` 作醒目「课后产出 / 收获」徽章;`outputDraft === true` 时附一个“待确认”小标。
4. **服务(拟稿)**:渲染 `STAGE2_SERVICE_DRAFT`,顶部显著标注 `STAGE2_SERVICE_DRAFT.note`(待确认),`features` 列表逐条渲染。
5. **价格条 + 报名按钮**:¥3999,旁标“含第一阶段全部内容”;按钮文案「报名职业开发者进阶 · ¥3999」,`onClick={onEnroll}`。

样式复用约定:卡片/徽章/列表均复用第一阶段既有 class 与内联渐变写法,仅把主色换成 `STAGE2_THEMES`,保证视觉统一但色系区分。

- [ ] **Step 2: 编排层接入**

在 `AiCodingCampContent.tsx` 中,于第一阶段板块 `<StageOneSection />` 之后插入 `<StageTwoSection onEnroll={openContact} />`,并 import。

- [ ] **Step 3: 校验**

Run: `cd website && pnpm lint && pnpm build`
Expected: 通过。`pnpm dev` 浏览器确认:三段分组(能力进阶/企业实战/求职冲刺)、14 张课卡、子条目来自 outline 原文、收获墙 5 张卡、服务拟稿“待确认”标注醒目、¥3999 价格 + “含第一阶段全部” + 报名按钮可点。移动端单列正常。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/pages/ai-coding-camp/StageTwoSection.tsx website/src/components/pages/AiCodingCampContent.tsx
git commit -m "feat(website): 新增第二阶段板块(三段分组+收获墙+服务拟稿+¥3999报名)"
```

---

## Task 8: Hero 改两阶段表述 + 页面 metadata

**Files:**
- Modify: `website/src/components/pages/ai-coding-camp/Hero.tsx`
- Modify: `website/src/app/(site)/ai-coding-camp/page.tsx`

- [ ] **Step 1: Hero 标题与概览数字改两阶段并列表述**

- 主标题改为不暗示“同一人从零到职业”的并列表述,如「从零基础到职业进阶 · 两门课,各得其所」(具体文案以不误导为准)。
- 原 Hero 内 ¥2999→¥1999 单一价格条:改为**两阶段价格锚点**——并排展示 `STAGE1_PRICE`(¥1999)与 `STAGE2_PRICE`(¥3999 · 含第一阶段),点击可锚到对应板块(可用 `<a href="#stage-one">`/`#stage-two">`,并在两个板块 section 上加对应 `id`)。
- 新增一行**全程概览数字**:`2 阶段 · 24 课 · 收获里程碑`(产出件数 N 以两阶段收获合计填写:第一阶段 4 件 + 第二阶段 5 项 = 9,文案如「9+ 件可展示产出」)。
- 服务承诺横条保留。

> 若加锚点 `id`:在 `StageOneSection` 最外层 section 加 `id="stage-one"`,`StageTwoSection` 加 `id="stage-two"`。

- [ ] **Step 2: 更新 `page.tsx` metadata 为两阶段表述**

```tsx
export const metadata: Metadata = {
  title: 'AI 编程实战训练营 · 零基础入门 + 职业开发者进阶',
  description:
    '两门课覆盖两类人群:零基础 AI 编程(¥1999)带你从零做出能上线的网页与小程序;职业开发者进阶(¥3999,含第一阶段全部)带你打通企业级 AI 工程、两套实战系统与求职面试。',
  openGraph: {
    title: 'AI 编程实战训练营 · 微域生光',
    description: '零基础入门 + 职业开发者进阶,两门课各得其所,完整学习路径与收获一目了然。',
  },
}
```

- [ ] **Step 3: 校验**

Run: `cd website && pnpm lint && pnpm build`
Expected: 通过。`pnpm dev` 确认 Hero 两阶段表述、双价格锚点点击平滑滚动到对应板块、概览数字正确;查看页面 `<title>` 与 meta 已更新。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/pages/ai-coding-camp/Hero.tsx "website/src/app/(site)/ai-coding-camp/page.tsx"
git commit -m "feat(website): Hero 改两阶段并列表述+双价格锚点,更新页面 metadata"
```

---

## Task 9: 整体整合验证与收尾

**Files:**
- Verify only(必要时微调 `AiCodingCampContent.tsx` 编排顺序)

- [ ] **Step 1: 确认最终区块顺序符合 spec**

`AiCodingCampContent.tsx` 渲染顺序应为:`<Hero />` → 完整学习路径 `<JourneyMap />` → `<InstructorSection />` → `<StageOneSection id=stage-one>` → `<StageTwoSection id=stage-two>` → `<BottomCta />` → `<ContactQrCodeModal />`。

- [ ] **Step 2: 全量构建 + lint**

Run: `cd website && pnpm lint && pnpm build`
Expected: 全部通过,无类型/未使用导出/lint 错误。

- [ ] **Step 3: 浏览器全页核对(桌面 + 移动)**

`pnpm dev`,用 chrome-devtools:
- 桌面:逐区块核对 Hero / 全景路径(主线+双括号+分界)/ 讲师 / 第一阶段(4成果+总览+十章+服务+¥1999报名)/ 第二阶段(收获墙+三组14课+服务拟稿+¥3999报名)/ 底部 CTA;两阶段色系分明;两处报名 + 底部 CTA 均能弹出 `ContactQrCodeModal`。
- 移动端(模拟窄屏):全景路径纵向 + 覆盖范围卡、课卡单列、价格条不溢出。
- 控制台无报错。

- [ ] **Step 4: 确认拟稿数据可定位**

确认所有“待确认”数据集中在 `data.ts`(第二阶段 hours、课1-5 output、服务、适合人群),便于用户审稿后替换;页面上拟稿项有可见“待确认”标记。

- [ ] **Step 5: 最终提交(如有微调)**

```bash
git add website/src/components/pages/
git commit -m "chore(website): 训练营两阶段页面整合校验与区块顺序收尾"
```

---

## Self-Review(已对照 spec 自检)

- **Spec §3 区块表**:Hero(Task 8)/全景路径(Task 6)/讲师(Task 3)/第一阶段(Task 4+8)/第二阶段(Task 7)/底部 CTA(Task 3)—— 全覆盖。
- **Spec §4 全景路径(主线+双覆盖范围括号+分界+移动端降级)**:Task 6 Step 1–3 覆盖。
- **Spec §5 第一阶段(复用+下沉 ¥1999)**:Task 4 覆盖。
- **Spec §6 第二阶段(三段分组+课卡映射 outline+收获墙+服务拟稿+¥3999)**:Task 5(数据)+ Task 7(渲染)覆盖。
- **Spec §7 工程拆分(目录 + 编排层)**:Task 1–4、6、7 覆盖;`page.tsx` 入口不变,仅 metadata 更新(Task 8)。
- **Spec §8 待确认数据**:全部落在 `data.ts`,Task 5 标 `outputDraft`/`待确认`,Task 9 Step 4 复核。
- **Spec §9 验收**:每任务 `pnpm lint && pnpm build` + 浏览器核对,Task 9 总验收。
- **类型一致性**:`Stage2Lesson`/`Stage2Group`/`Stage2Deliverable`/`JourneyMilestone`/`STAGE2_THEMES`/`AUDIENCES`/`STAGE1_PRICE`/`STAGE2_PRICE` 在 Task 5 定义,Task 6/7/8 按同名引用;第一阶段沿用 `THEMES`/`ThemeKey` 不变,第二阶段用独立 `Stage2ThemeKey`,不混用。
- **无占位符**:拟稿数据为真实可上线文案并显式标“待确认”,非 TODO;抽取类任务以“迁移具名定义、保持不变 + 行号引用 outline”替代重复粘贴大段未改代码。
