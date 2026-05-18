# 番外卷·行业战斗卷 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `/playbook/industry` 新增番外卷行业战斗卷页面（约 24,000 字内容），并更新主目录页 EXTRA_VOLUME 为"已开放"。

**Architecture:** 单一 page.tsx 自包含所有 UI 组件与内容，与正卷格式完全一致（ReadingNav + SideRail + Manuscript + ChapterEndNav）。内容按"现象→反共识→推导→案例→工具"五段式撰写，每节至少一个可填工具表。

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS。组件全部内联定义，与 foundations/page.tsx 保持相同模式。

---

## 关键素材数据汇总（写作时直接引用）

### X.1 本地实体（鹤·48 卖海鲜）
- **小贩海鲜**：441万粉，30天销售额1367万，日播15小时，日均约800万，年化约2亿
  - 两条爆款视频：8.16亿+1.089亿播放，单日最高3.83M/3.77M/3.03M元
  - 首条爆款：当天小推车销售额55万；第二条：90万
- **巨浪码头**：运营仅3个月（2021年11月28日起），11.5万粉，30天销售219万
  - 一次4小时36分直播：11,418元
- **贺先生海鲜批发**：1.2万粉，1小时15分直播：8,594元，月流水10万+
- **核心洞察**："新的方式，打败了旧的方式"；短视频建信任，直播做转化；标准化产品可授权他人播
- **两路径**：复制V1.0（照搬成熟玩法）vs 升级V2.0（加故事/美学/情绪）

### X.2 专业人士（鹤·49 摄影师）
- **蔡仲阳手机摄影**：运营半月，30天销售21.4万
- **小叶老师手机摄影**：30天销售37万，日均3万，主打499元手机摄影课
- **智伪首饰摄影**：30天销售53.8万，卖拍摄设备给珠宝商
- **胡楚镜（跨界卖女装）**：30天销售968万！通过"帮女生拍出明星感"的摄影技巧账号，卖女装
- **江以浩**：模特出身+摄影教学，可向男装延伸
- **核心洞察**："越是艺术类越离基础需求远，越需要话语权"；摄影=话语权≠变现；跨界才是蓝海
- **五痛点**：获客贵/信任难/产能有限/变现路窄/艺术理想被妥协 → 对应五解法

### X.3 教育培训（鹤·51英语老师 + 鹤·58少儿教育）

**英语老师：**
- **大天使英语**：30天741万，90天1860万，180天2651万；日播4.5小时，单次30-40万
- **孙志力**：发音纠正，单条33万赞
- 核心打法："用知识打架"（用正确知识纠正常见错误）；泛化选题（游戏/电影/段子+英语）

**少儿教育：**
- **冉然格书法**：63.6万粉，卖出1647单精品课（499元/单）
- **垂书（八颗花生米）**：专注力训练，靠简单道具演示
- **消费力排序（重要！）**：有钱女性 > 有钱男性 > 中产女性 > 普通女性 > 中产男性 > 普通男性
- 少儿教育是其中购买力最高的母亲群体
- **核心痛点**："老师反馈的任何小问题，对新手家长都是大问题"
- **最佳时段**：早7-9点（妈妈送孩子上学路上）
- **甜蜜期**：小学段（6-12岁），新手家长焦虑最强

### X.4 实物零售（鹤·54男装）
- **衬衫老罗**：81.6万粉，年销1.14亿，30天2000万，90天5000万；主打59-99元，25年制衣经验
- **铁血缝纫机**（龙牙军装）：30天1454万，年2.55亿；军事美学路线
- **TopUncle**：复古美式风，初期表现好，品控崩盘后流量大跌（反例！）
- **海澜之家矩阵**：多账号，5-6条/天，日播17-18小时
- **核心洞察**：男性是"效用优先购买者"（不爱逛，只要有需求就快速决策）；抖音vs淘宝：情感驱动vs理性比价

### X.5 数字产品与知识付费（鹤·43/44）
- **产品梯队**：9.9→99→999→3999元
- **美容引流案例**：39.9元手部美白→最终成交16900元全身套餐
- **饺子馆加盟课**：基础班5999/中级9999/高级19999元
- **核心洞察**："加盟的本质就是知识付费"；知识付费=最轻的生意（无库存无物流无供应链）
- **两轨模型**：直接变现（高价课）+ 引流变现（低价课→筛选高价值用户→升单）

### X.6 通用五步法（鹤·47方法论总览 + 鹤·24竞品分析）
- **海鲜类目销售数据**（头-中-尾三层验证）
- **找对标四类关键词**：行业词/用户词/问题词/产品词
- **竞品六维分析**：细分定位/优劣势/视觉锤与文字钉/价值主张/增粉驱动/双镜头（学什么+突破什么）
- **五步通用法**：定方向→找痛点→选脚本→测爆款→放大变现
- **前端看内容+后端看商业**（异常数据是关键节点）
- **工具原则**："买最贵的工具"（飞瓜数据600元/年旗舰版）

---

## Task 1: 创建页面骨架（含全部 UI 组件定义）

**Files:**
- Create: `website/src/app/(playbook)/playbook/industry/page.tsx`

- [ ] **Step 1: 创建目录并写入页面骨架**

创建文件 `website/src/app/(playbook)/playbook/industry/page.tsx`，内容如下（完整骨架，Manuscript 内容留空）：

```tsx
/* eslint-disable no-irregular-whitespace */
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '番外卷 · 行业战斗卷 — 微域生光自媒体运营实战',
  description:
    '本地实体、专业人士、教育培训、实物零售、数字产品——五大行业怎么把正卷方法论用起来。不重复方法，只讲落地。',
  openGraph: {
    title: '番外卷 · 行业战斗卷 — 微域生光自媒体运营实战',
    description: '行业案例不是抄答案，是看别人怎么做选择题。',
  },
}

const CHAPTERS = [
  { id: 'ch-x-0', no: 'X.0', label: '导读 · 读案例的四个问题' },
  { id: 'ch-x-1', no: 'X.1', label: '本地实体 · 做给街坊看' },
  { id: 'ch-x-2', no: 'X.2', label: '专业人士 · 信任前置的受益者' },
  { id: 'ch-x-3', no: 'X.3', label: '教育培训 · 成人学知识，家长怕损失' },
  { id: 'ch-x-4', no: 'X.4', label: '实物零售 · 把供应链拍成流量' },
  { id: 'ch-x-5', no: 'X.5', label: '数字产品与知识付费 · 最轻的生意' },
  { id: 'ch-x-6', no: 'X.6', label: '普通行业五步通用打法' },
  { id: 'ch-x-7', no: 'X.7', label: '练习 · 30 账号样本库' },
]

export default function PlaybookIndustryPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#050507] text-ink">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 0%, rgba(139,46,46,0.24), transparent 38%), radial-gradient(circle at 82% 8%, rgba(34,211,238,0.10), transparent 34%), linear-gradient(180deg, rgba(255,253,247,0.04), transparent 28%)',
        }}
      />
      <ReadingNav />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:grid lg:grid-cols-[200px_1fr] lg:gap-10 lg:pt-16">
        <SideRail />
        <article className="min-w-0">
          <Manuscript />
          <ChapterEndNav />
        </article>
      </div>
    </main>
  )
}

const ReadingNav = () => (
  <nav className="sticky top-0 z-30 border-b border-white/10 bg-[#050507]/80 backdrop-blur-xl">
    <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-[#d6cfc4] transition-colors hover:border-[#b8693a]/60 hover:bg-[#8b2e2e]/25 hover:text-[#fffdf7] sm:text-[12.5px]"
          aria-label="返回微域生光官网首页"
        >
          <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">←</span>
          返回微域生光主页
        </Link>
        <Link
          href="/playbook"
          className="font-serif-zh truncate text-[17px] font-semibold tracking-[0.08em] text-[#fffdf7]"
        >
          微域生光自媒体运营实战
        </Link>
        <span className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.24em] text-[#b8aa96] sm:inline">
          Creator Notes
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[#b8aa96] sm:gap-5 sm:text-[11px]">
        <Link href="/playbook#toc" className="transition-colors hover:text-[#fffdf7]">
          ← 目录
        </Link>
        <span className="hidden text-[#fffdf7] sm:inline">番外卷 · 行业战斗卷</span>
      </div>
    </div>
  </nav>
)

const SideRail = () => (
  <aside className="hidden lg:block">
    <div className="sticky top-24">
      <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#b8aa96]">
        <span className="h-px w-6 bg-[#8b2e2e]" />
        Extra Vol.
      </div>
      <div className="font-serif-zh mb-6 text-[20px] font-semibold tracking-[0.06em] text-[#fffdf7]">
        行业战斗卷
      </div>
      <ol className="space-y-2 border-l border-white/10 pl-4">
        {CHAPTERS.map((chap) => (
          <li key={chap.id}>
            <a
              href={`#${chap.id}`}
              className="group block py-1 text-[12.5px] leading-[1.5] text-[#b8aa96] transition-colors hover:text-[#fffdf7]"
            >
              <span className="mr-2 font-mono text-[11px] text-[#b8693a]">{chap.no}</span>
              <span className="group-hover:underline group-hover:decoration-[#b8693a]/60 group-hover:underline-offset-4">
                {chap.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-7 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a7e6f]">
        预计阅读 · 50 分钟
      </div>
    </div>
  </aside>
)

const Manuscript = () => (
  <div className="relative isolate">
    <div className="flex items-baseline justify-between border-b border-white/10 pb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a7e6f] sm:text-[11px]">
      <Link
        href="/playbook#toc"
        className="border-b border-dotted border-white/15 text-[#b8aa96] transition-colors hover:border-[#b8693a] hover:text-[#fffdf7]"
      >
        ← 返回目录
      </Link>
      <span className="hidden sm:inline">《微域生光自媒体运营实战》</span>
      <span>番外卷 · 行业战斗卷</span>
    </div>

    <div className="mx-auto max-w-[720px] pb-20 pt-10 sm:pb-24 sm:pt-14">
      <PartCover />
      {/* ── 章节内容将在 Task 2-9 中逐节填入 ── */}
      <PartEnd />
    </div>
  </div>
)

const PartCover = () => (
  <div className="mb-20 mt-4 border-b border-white/10 pb-16 text-center sm:mb-24 sm:pb-20">
    <div className="mb-7 text-[12px] tracking-[0.7em] text-[#b8aa96]" style={{ paddingLeft: '0.7em' }}>
      番　外　卷
    </div>
    <h1 className="font-serif-zh text-[44px] font-semibold leading-[1.2] tracking-[0.14em] text-[#fffdf7] sm:text-[60px]">
      行业战斗卷
    </h1>
    <div className="mt-6 font-mono text-[12px] tracking-[0.4em] text-[#b8693a] sm:text-[13px]">
      EXTRA　VOL.　·　INDUSTRY　BATTLES
    </div>
    <Ornament className="mx-auto mt-9" />
    <p className="mx-auto mt-12 max-w-[460px] text-[14.5px] leading-[2.05] tracking-[0.03em] text-[#cfc6b8] sm:text-[15px]">
      不重复正卷的方法论，
      <br />
      只讲五大行业怎么把前面的方法用起来。
      <br />
      行业案例不是抄答案，是看别人怎么做选择题——
      <br />
      他是谁，给谁说话，钩子是什么，变现链路是什么。
    </p>
  </div>
)

const Ornament = ({ className = '' }: { className?: string }) => (
  <div className={`relative h-px w-20 bg-[#8b2e2e] ${className}`}>
    <span className="absolute -left-3.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#8b2e2e]" />
    <span className="absolute -right-3.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#8b2e2e]" />
  </div>
)

type ChapterProps = {
  id: string
  no: string
  tag: string
  title: string
  lead: string
  first?: boolean
  children: ReactNode
}

const Chapter = ({ id, no, tag, title, lead, children }: ChapterProps) => (
  <section
    id={id}
    className="mt-24 scroll-mt-24 border-t border-white/10 pt-16 first-of-type:mt-10 first-of-type:border-t-0 first-of-type:pt-0"
  >
    <div className="mb-5 flex items-baseline justify-between font-mono text-[10.5px] uppercase tracking-[0.35em] text-[#8a7e6f] sm:text-[11.5px]">
      <span className="font-semibold text-[#b8693a]">{no}</span>
      <span>{tag}</span>
    </div>
    <h2 className="font-serif-zh text-[26px] font-semibold leading-[1.35] tracking-[0.06em] text-[#fffdf7] sm:text-[32px]">
      {title}
    </h2>
    <p className="mb-9 mt-3 text-[14.5px] italic tracking-[0.04em] text-[#8a7e6f] sm:text-[15px]">
      {lead}
    </p>
    <div
      className="text-[15px] leading-[2.05] text-[#d6cfc4] sm:text-[15.5px] [&>p]:mb-[18px] [&>p]:text-justify"
      style={{ textJustify: 'inter-ideograph' } as unknown as React.CSSProperties}
    >
      {children}
    </div>
    <div className="mt-14 text-center text-[16px] tracking-[1em] text-white/15">·　·　·</div>
  </section>
)

const SubHead = ({ children }: { children: ReactNode }) => (
  <h3 className="font-serif-zh mb-3.5 mt-11 border-l-[3px] border-[#8b2e2e] pl-3 text-[18px] font-semibold leading-[1.4] tracking-[0.04em] text-[#fffdf7] sm:text-[19px]">
    {children}
  </h3>
)

const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-[#fffdf7]">{children}</strong>
)

const Insight = ({ label, children }: { label: string; children: ReactNode }) => (
  <aside className="my-7 border-l-[3px] border-[#b8693a] bg-white/[0.04] px-6 py-5 backdrop-blur-sm sm:my-8 sm:px-7">
    <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.4em] text-[#b8693a]">
      {label}
    </div>
    <div className="text-[14.5px] leading-[1.95] text-[#e7dfd4] sm:text-[15.5px]">{children}</div>
  </aside>
)

const PullQuote = ({ children }: { children: ReactNode }) => (
  <div className="font-serif-zh relative my-10 px-2 py-8 text-center text-[20px] font-semibold leading-[1.75] tracking-[0.06em] text-[#fffdf7] sm:my-12 sm:text-[24px]">
    <span className="mx-auto mb-6 block h-px w-12 bg-[#8b2e2e]" />
    {children}
    <span className="mx-auto mt-6 block h-px w-12 bg-[#8b2e2e]" />
  </div>
)

const CaseBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="my-8 rounded-sm border border-white/10 bg-white/[0.035] px-6 py-6 backdrop-blur-sm sm:px-7 sm:py-7">
    <h4 className="mb-3 font-mono text-[11.5px] font-semibold uppercase tracking-[0.35em] text-[#b8693a]">
      {title}
    </h4>
    <div className="text-[14px] leading-[1.95] text-[#d6cfc4] sm:text-[15px] [&>p]:mb-[14px] [&>p:last-child]:mb-0">
      {children}
    </div>
  </div>
)

const ToolCard = ({
  tag,
  title,
  desc,
  children,
}: {
  tag: string
  title: string
  desc: string
  children: ReactNode
}) => (
  <div className="my-10 border-t border-[#8b2e2e]/70 pt-7">
    <div className="mb-3 flex flex-wrap items-baseline gap-3">
      <span className="bg-[#8b2e2e] px-2.5 py-1 font-mono text-[10.5px] font-semibold tracking-[0.35em] text-[#fffdf7]">
        {tag}
      </span>
      <h4 className="font-serif-zh text-[17px] font-semibold tracking-[0.04em] text-[#fffdf7]">
        {title}
      </h4>
    </div>
    <p className="mb-4 text-[13.5px] leading-[1.8] text-[#8a7e6f]">{desc}</p>
    {children}
  </div>
)

type TableProps = {
  head: string[]
  rows: string[][]
  fillRows?: string[][]
  emptyCols?: number[]
  scoreCols?: number[]
}

const Table = ({ head, rows, fillRows = [], emptyCols = [], scoreCols = [] }: TableProps) => (
  <div className="-mx-1 overflow-x-auto">
    <table className="w-full border-collapse text-left text-[13.5px] leading-[1.7]">
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              className="border-b border-white/10 bg-white/[0.04] px-3 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b8aa96]"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`r-${i}`}>
            {row.map((cell, j) => {
              const isScore = scoreCols.includes(j)
              const isEmpty = emptyCols.includes(j)
              return (
                <td
                  key={`c-${i}-${j}`}
                  className={[
                    'border-b border-white/10 px-3 py-3 align-top text-[#d6cfc4]',
                    isScore ? 'text-center font-semibold text-[#b8693a] [font-variant-numeric:tabular-nums]' : '',
                    isEmpty ? 'italic text-[#8a7e6f]' : '',
                  ].filter(Boolean).join(' ')}
                >
                  {cell}
                </td>
              )
            })}
          </tr>
        ))}
        {fillRows.map((row, i) => (
          <tr key={`f-${i}`} className="bg-[rgba(184,105,58,0.05)]">
            {row.map((cell, j) => (
              <td
                key={`fc-${i}-${j}`}
                className="border-b border-white/10 px-3 py-3 align-top italic text-[#8a7e6f] last:border-b-0"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const NumberedList = ({ items }: { items: ReactNode[] }) => (
  <ol className="my-6 list-none p-0">
    {items.map((item, i) => (
      <li
        key={i}
        className="relative border-b border-dotted border-white/10 py-2.5 pl-14 text-[14px] leading-[1.85] text-[#d6cfc4] sm:text-[14.5px]"
      >
        <span className="absolute left-0 top-3 font-mono text-[15px] font-semibold text-[#b8693a] [font-variant-numeric:tabular-nums]">
          {String(i + 1).padStart(2, '0')}
        </span>
        {item}
      </li>
    ))}
  </ol>
)

const Checklist = ({ items }: { items: ReactNode[] }) => (
  <ul className="my-6 list-none p-0">
    {items.map((item, i) => (
      <li
        key={i}
        className="relative py-2 pl-8 text-[14px] leading-[1.9] text-[#d6cfc4] sm:text-[14.5px]"
      >
        <span className="absolute left-0 top-[14px] block h-3.5 w-3.5 border-[1.5px] border-[#b8693a]" />
        {item}
      </li>
    ))}
  </ul>
)

const PartEnd = () => (
  <div className="mt-24 border-t border-white/10 pt-8 text-center font-mono text-[12px] uppercase tracking-[0.3em] text-[#8a7e6f] sm:text-[12.5px]">
    <div>—— 番外卷 完 ——</div>
    <div className="font-serif-zh mt-3 text-[13px] tracking-[0.18em] text-[#b8693a]">
      全书终篇 · 返回目录重新出发
    </div>
  </div>
)

const ChapterEndNav = () => (
  <nav className="mt-12 grid gap-3 sm:grid-cols-2">
    <Link
      href="/playbook/monetization"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#8a7e6f]">
          Previous
        </div>
        <div className="mt-1.5 font-serif-zh text-[15px] tracking-[0.06em] text-[#fffdf7]">
          ← 第七篇 · 变现与商业模式
        </div>
      </div>
    </Link>
    <Link
      href="/playbook#toc"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <div className="flex-1">
        <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#8a7e6f]">
          All Volumes
        </div>
        <div className="mt-1.5 font-serif-zh text-[15px] tracking-[0.06em] text-[#fffdf7]">
          返回全书目录 →
        </div>
      </div>
    </Link>
  </nav>
)
```

- [ ] **Step 2: 验证骨架编译通过**

```bash
cd website && pnpm tsc --noEmit
```
预期：无 TypeScript 报错。

- [ ] **Step 3: Commit 骨架**

```bash
git add website/src/app/\(playbook\)/playbook/industry/page.tsx
git commit -m "feat(playbook): 新增番外卷页面骨架（/playbook/industry）"
```

---

## Task 2: 写入 X.0 导读

**Files:** Modify `website/src/app/(playbook)/playbook/industry/page.tsx`

**内容要点：**
- 四问框架：读每个案例时都问这四个问题 → 他是谁（定位）/ 给谁说话（用户画像）/ 钩子是什么（内容策略）/ 变现链路是什么（商业模式）
- 反共识：行业案例不是"抄答案"，是"看别人如何做选择题"；同一个打法在A行业成立，在B行业未必成立
- 五类行业对应阅读路线：对号入座 + 全读通用法
- 工具：四问阅读框架卡（可打印）

- [ ] **Step 1: 在 Manuscript 的 `<PartCover />` 后插入 X.0 Chapter**

将 `{/* ── 章节内容将在 Task 2-9 中逐节填入 ── */}` 替换为 X.0 章节内容（按五段式撰写全文，约 1500 字）：

```tsx
<Chapter
  id="ch-x-0"
  no="X.0 · 导读"
  tag="Extra Volume"
  title="读案例的四个问题"
  lead="行业案例不是抄答案，是看别人怎么做选择题。"
  first
>
  {/* 按五段式撰写：
      现象：很多人看案例的方式是"他做什么我就做什么"
      反共识：同一打法跨行业失效的本质 → 底层是定位/用户/钩子/变现四维度的排列组合
      推导：为什么要用四问框架
      案例：两个反例（卖海鲜的口播vs教摄影的知识课）
      工具：四问阅读框架卡 */}
  <p>（撰写约 1500 字正文）</p>
  <ToolCard tag="工具 X.0" title="四问阅读框架卡" desc="每读一个案例都填一遍，养成习惯后自动内化。">
    <Table
      head={['问题', '本案例的答案', '对你的启发']}
      rows={[
        ['他是谁（商业定位 + 内容定位）', '/', '/'],
        ['给谁说话（目标用户具体画像）', '/', '/'],
        ['钩子是什么（让用户留下来的理由）', '/', '/'],
        ['变现链路是什么（从播放到成交几步）', '/', '/'],
      ]}
      emptyCols={[1, 2]}
    />
  </ToolCard>
</Chapter>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/app/\(playbook\)/playbook/industry/page.tsx
git commit -m "feat(playbook): 番外卷 X.0 导读"
```

---

## Task 3: 写入 X.1 本地实体

**Files:** Modify `website/src/app/(playbook)/playbook/industry/page.tsx`

**必须包含的数据与案例：**
- 小贩海鲜：441万粉 / 30天1367万 / 日播15小时 / 两条爆款合计播放约10亿 / 年化约2亿
- 巨浪码头：运营仅3个月 / 11.5万粉 / 30天219万（同样15小时日播）
- 贺先生：1.2万粉 / 月流水10万+
- 三层对比说明：同样的打法，不同起点都能跑通
- V1.0（复制成熟玩法）vs V2.0（加故事/美学/情绪）升级路径

**反共识结论：** 渠道就是命根子；短视频不是"额外来单"，而是"重新洗牌"
**工具：** 本地实体两阶段策略表（短视频选题策略 + 直播转化策略）

- [ ] **Step 1: 插入 X.1 Chapter（约 3500 字）**

```tsx
<Chapter
  id="ch-x-1"
  no="X.1"
  tag="本地实体"
  title="本地实体 · 做给街坊看，让陌生人慕名来"
  lead="渠道是命根子。短视频不是你的额外来单，而是整个行业的重新洗牌。"
>
  {/* 五段式：
      现象：本地实体老板对短视频的惯常误解（"我们是本地生意不需要"）
      反共识：渠道即命根子；新渠道颠覆旧渠道是商业史规律
      推导：三层账号数据对比（小贩/巨浪/贺先生）说明不同阶段都能跑通
      案例：小贩海鲜详细拆解（两条爆款视频播放量+带货数据）
      工具：两阶段策略表 */}
  <CaseBlock title="案例 · 小贩海鲜：两条视频撬动年销 2 亿">
    <p>小贩海鲜，441 万粉，抖音橱窗 30 天销售额 1,367 万元，日均销售约 800 万，年化接近 2 亿。账号的两条爆款视频合计播放量超过 10 亿，第一条播出当日小推车销售额 55 万，第二条带出 90 万。这不是一家上市公司，是一个从零开始把海鲜搬上抖音的团队。</p>
    <p>但小贩海鲜的数据不是这个案例的重点。这个案例真正重要的，是它身后两个规模更小的账号...</p>
  </CaseBlock>
  <ToolCard tag="工具 X.1" title="本地实体两阶段运营策略表" desc="短视频阶段解决信任，直播阶段解决转化。两个阶段目标不同，内容策略也不同。">
    <Table
      head={['阶段', '核心目标', '内容方向', '发布频次', '衡量指标']}
      rows={[
        ['第一阶段 · 短视频', '建立信任 / 扩大认知', '后厨过程 / 产品溯源 / 行业知识 / 真实日常', '3-5 条/周', '涨粉数 / 评论互动'],
        ['第二阶段 · 直播', '批量转化 / 提升客单', '现场讲解 / 促销组合 / 直播专属价', '每日 ≥ 2 小时', '直播间销售额 / 客单价'],
      ]}
      fillRows={[
        ['（填入你自己的阶段安排）', '/', '/', '/', '/'],
      ]}
    />
  </ToolCard>
</Chapter>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/app/\(playbook\)/playbook/industry/page.tsx
git commit -m "feat(playbook): 番外卷 X.1 本地实体"
```

---

## Task 4: 写入 X.2 专业人士

**Files:** Modify `website/src/app/(playbook)/playbook/industry/page.tsx`

**必须包含的数据与案例：**
- 蔡仲阳手机摄影：运营半月，30天21.4万
- 小叶老师：30天37万，499元手机摄影课
- 智伪首饰摄影：30天53.8万（卖拍摄工具给珠宝商，B端变现）
- **胡楚镜（关键！）**：30天968万，用摄影账号卖女装；内容是"帮女生拍出明星感"技巧
- 五痛点对应五解法

**反共识结论：** 专业人士的核心不是"专业"，是"话语权"；真正的蓝海不是教本行，是跨界
**工具：** 专业人士变现路径三选一决策表（2C课程 / 2B工具 / 跨界带货）

- [ ] **Step 1: 插入 X.2 Chapter（约 4000 字）**

```tsx
<Chapter
  id="ch-x-2"
  no="X.2"
  tag="专业人士"
  title="专业人士 · 信任前置的最大受益者"
  lead="越是离基础需求远的行业，越需要先把话语权立起来。"
>
  {/* 五段式：
      现象：专业人士（摄影师/医生/律师）普遍认为自媒体跟自己不相关
      反共识：信任前置对他们杠杆最大；且真正蓝海是跨界而非教同行
      推导：五痛点→五解法；三种变现模型（2C课程/2B工具/跨界带货）
      案例：胡楚镜30天968万（摄影→女装跨界的逻辑）
      工具：三路径决策表 */}
  <CaseBlock title="案例 · 胡楚镜：摄影师的 30 天 968 万">
    <p>胡楚镜是一个摄影博主，内容是教女生如何拍出明星感——在家用一个墙角、一面镜子、一个床单就能拍出杂志质感。这类内容的播放量很高，因为它解决了普遍的焦虑："我不上镜"。</p>
    <p>但她最终用来变现的不是摄影课，而是女装。她的逻辑是：懂美的人说"这件衣服穿上去会让你显高显瘦"，比任何模特都有说服力。30 天销售额 968 万元。这不是摄影变现的故事，这是"话语权跨界"的故事...</p>
  </CaseBlock>
  <ToolCard tag="工具 X.2" title="专业人士变现路径三选一" desc="三条路径不互斥，但先选最适合当前阶段的一条走通，再扩展。">
    <Table
      head={['路径', '目标客户', '产品形态', '定价范围', '适合阶段']}
      rows={[
        ['2C 知识课程', '有相关需求的普通用户', '录播课 / 直播课', '99—499 元', '账号 1—10 万粉'],
        ['2B 工具/设备', '同行业商家', '专业器材 / 解决方案', '500—5000 元', '账号 10 万粉以上'],
        ['跨界带货', '审美相关消费人群', '服装 / 家居 / 美妆', '看品类', '账号 10 万粉以上'],
      ]}
      fillRows={[
        ['（写下你目前最适合的路径）', '/', '/', '/', '/'],
      ]}
    />
  </ToolCard>
</Chapter>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/app/\(playbook\)/playbook/industry/page.tsx
git commit -m "feat(playbook): 番外卷 X.2 专业人士"
```

---

## Task 5: 写入 X.3 教育培训

**Files:** Modify `website/src/app/(playbook)/playbook/industry/page.tsx`

**必须包含的数据与案例：**
- 大天使英语：30天741万 / 90天1860万 / 180天2651万
- 冉然格书法：63.6万粉，卖出1647单精品课（499元）
- 消费力排序（直接引用）：有钱女性>有钱男性>中产女性>普通女性>中产男性>普通男性
- "早7-9点"的最佳时段逻辑（妈妈送孩子上学路上）
- 小学段（6-12岁）甜蜜期

**反共识结论：** 成人教育买的是"知识打架"，少儿教育买的是家长的"懒+怕损失"
**工具：** 教育类选题框架（痛点来源 × 学段 × 内容类型）

- [ ] **Step 1: 插入 X.3 Chapter（约 3500 字）**

```tsx
<Chapter
  id="ch-x-3"
  no="X.3"
  tag="教育培训"
  title="教育培训 · 成人买知识，家长怕损失"
  lead="成人教育的核心是用正确知识纠正错误认知；少儿教育的核心是让家长不焦虑。"
>
  {/* 五段式：
      现象：教育类账号最多但转化率差异极大
      反共识：成人vs少儿驱动力完全不同；少儿教育购买力排名第一
      推导：成人"知识打架"打法；少儿"双重人性"（懒+怕损失）打法
      案例1：大天使英语30/90/180天数据+泛化选题策略
      案例2：冉然格书法1647单
      工具：选题框架 */}
  <ToolCard tag="工具 X.3" title="教育类选题框架" desc="教育内容的选题有三个入口，不同学段优先级不同。">
    <Table
      head={['入口', '适用学段', '内容方向', '示例']}
      rows={[
        ['老师反馈的问题', '小学 6-12 岁（最强）', '写字 / 专注力 / 成绩下滑', '"老师说字太丑" → 书法课'],
        ['用户自身焦虑', '成人 / 高中', '考级 / 职场 / 兴趣技能', '"商务英语脱口而出" → 英语课'],
        ['泛化娱乐破圈', '成人 / 通用', '影视 / 段子 / 热点+知识', '"这句台词的英文怎么说" → 吸粉'],
      ]}
      fillRows={[
        ['（写下你自己行业的入口）', '/', '/', '/'],
      ]}
    />
  </ToolCard>
</Chapter>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/app/\(playbook\)/playbook/industry/page.tsx
git commit -m "feat(playbook): 番外卷 X.3 教育培训"
```

---

## Task 6: 写入 X.4 实物零售

**Files:** Modify `website/src/app/(playbook)/playbook/industry/page.tsx`

**必须包含的数据与案例：**
- 衬衫老罗：81.6万粉 / 年1.14亿 / 30天2000万 / 59-99元价格带 / 25年制衣经验 / 日播7小时
- 铁血缝纫机（龙牙军装）：30天1454万 / 年2.55亿 / 军事美学
- TopUncle：品控崩盘→流量下滑（**重要反例**）
- 海澜之家：多账号矩阵 / 5-6条/天 / 17-18小时日播

**反共识结论：** 男性是效用优先购买者；实物零售在抖音的核心优势是"情感驱动成交"而非比价
**工具：** 实物零售账号风格选择决策表（三种打法对比）

- [ ] **Step 1: 插入 X.4 Chapter（约 3500 字）**

```tsx
<Chapter
  id="ch-x-4"
  no="X.4"
  tag="实物零售"
  title="实物零售 · 把供应链拍成流量"
  lead="男人不爱逛，但你把东西拍给他看，他会比女人买得更果断。"
>
  {/* 五段式：
      现象：实物零售老板认为"我又不是网红，凭什么卖货"
      反共识：男性购物心理（效用优先）；抖音vs淘宝（情感vs理性）
      推导：三种打法（品牌矩阵型/专家IP型/亚文化型）各自逻辑
      案例：衬衫老罗详细拆解（25年经验+59元衬衫+日播7小时）；TopUncle反例
      工具：三种打法决策表 */}
  <ToolCard tag="工具 X.4" title="实物零售账号风格三选一" desc="三种路径对应不同资源禀赋，选对了事半功倍，选错了越跑越累。">
    <Table
      head={['路径', '核心逻辑', '典型案例', '适合条件', '注意事项']}
      rows={[
        ['品牌矩阵型', '多账号+高频发布+长时间直播覆盖更多用户', '海澜之家 / 铁血缝纫机', '有团队 / 供应链稳定 / 品类标准化', '品控崩盘会导致流量断崖（见 TopUncle）'],
        ['专家 IP 型', '创始人本人出镜建立专业信任', '衬衫老罗', '创始人愿意出镜 / 有行业积累 / 客单不太高', '依赖个人，不能轻易换播主'],
        ['亚文化型', '锁定小众圈层用户的强烈认同感', '龙牙军装', '产品本身有圈层属性', '圈层忠诚度高但天花板明显'],
      ]}
      fillRows={[
        ['（你适合哪条路径）', '/', '/', '/', '/'],
      ]}
    />
  </ToolCard>
</Chapter>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/app/\(playbook\)/playbook/industry/page.tsx
git commit -m "feat(playbook): 番外卷 X.4 实物零售"
```

---

## Task 7: 写入 X.5 数字产品与知识付费

**Files:** Modify `website/src/app/(playbook)/playbook/industry/page.tsx`

**必须包含的数据与案例：**
- 产品梯队：9.9→99→999→3999元
- 美容引流案例：39.9元手部美白→16900元全套（极致漏斗）
- 饺子馆加盟课：5999/9999/19999三档
- "加盟=知识付费"的本质分析

**反共识结论：** 免费等于垃圾；知识付费不是"卖信息"，是"卖确定性"
**工具：** 知识付费产品梯队设计表

- [ ] **Step 1: 插入 X.5 Chapter（约 2500 字）**

```tsx
<Chapter
  id="ch-x-5"
  no="X.5"
  tag="数字产品"
  title="数字产品与知识付费 · 最轻的生意"
  lead="无库存、无物流、无供应链、无管理——知识付费是离现金最近、离麻烦最远的生意模型。"
>
  {/* 五段式：
      现象：很多人认为知识付费只适合"大V"
      反共识：加盟本质是知识付费；任何行业有方法论的人都能做
      推导：两轨模型（直接变现+引流变现）；产品梯队设计原理
      案例：美容引流漏斗（39.9→16900）；饺子馆加盟课三档
      工具：产品梯队设计表 */}
  <ToolCard tag="工具 X.5" title="知识付费产品梯队设计表" desc="一个成熟的知识付费体系，至少需要三个价格带。低价带引流筛选，中价带主力变现，高价带拉高总收入。">
    <Table
      head={['层级', '价格带', '产品形态', '目的', '示例']}
      rows={[
        ['钩子层', '9.9—99 元', '单次课 / 试听课 / 电子手册', '筛选高意愿用户', '39.9 元手部美白体验课'],
        ['主力层', '199—999 元', '系统课 / 21 天训练营', '主力变现', '499 元手机摄影实战课'],
        ['利润层', '1999—9999 元', '1V1 私教 / 加盟培训', '提升 LTV', '5999 元饺子馆加盟基础班'],
      ]}
      fillRows={[
        ['（设计你的钩子层）', '/', '/', '/', '/'],
        ['（设计你的主力层）', '/', '/', '/', '/'],
        ['（设计你的利润层）', '/', '/', '/', '/'],
      ]}
    />
  </ToolCard>
</Chapter>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/app/\(playbook\)/playbook/industry/page.tsx
git commit -m "feat(playbook): 番外卷 X.5 数字产品与知识付费"
```

---

## Task 8: 写入 X.6 普通行业五步通用打法

**Files:** Modify `website/src/app/(playbook)/playbook/industry/page.tsx`

**必须包含的数据与案例：**
- 五步法：定方向→找痛点→选脚本→测爆款→放大变现
- 找对标四类关键词：行业词/用户词/问题词/产品词
- 竞品六维分析：细分/优劣/视觉锤文字钉/价值主张/增粉原因/双镜头
- 前端看内容+后端看商业（异常数据是关键节点）
- "先复制V1.0，再升级V2.0"的执行节奏

**反共识结论：** 分析同行不是抄，是"找到对方最关键的那把钥匙，再改成适合自己的"
**工具：** 30账号同行样本库模板表头（为X.7练习做铺垫）

- [ ] **Step 1: 插入 X.6 Chapter（约 4000 字）**

```tsx
<Chapter
  id="ch-x-6"
  no="X.6"
  tag="通用打法"
  title="普通行业五步通用打法 · 找对标"
  lead="任何行业，方法都是同一套。差别在于你有没有走完这五步。"
>
  {/* 五段式：
      现象：普通人入场后拍了几条没人看，就开始怀疑"我这行不适合做"
      反共识：不是行业问题，是没走完五步；任何行业都有人跑通
      推导：五步法详解+找对标方法（四类关键词+六维分析）
      案例：海鲜三层账号对比说明五步通用性
      工具：同行样本库表 */}
  <ToolCard tag="工具 X.6" title="同行样本库表（30 账号版本）" desc="建议每进入一个行业，先研究 30 个同行账号，各填一行，建立自己的行业地图。">
    <Table
      head={['账号名', '粉丝数', '主打内容', '视觉锤/文字钉', '爆款选题规律', '变现路径', '可学之处', '不可学之处']}
      rows={[
        ['（示例：衬衫老罗）', '81.6万', '25年制衣经验口播', '蓝衬衫+工厂背景', '衬衫选购避坑系列', '直播带货+橱窗', '专业信任建立', '过度依赖个人 IP'],
      ]}
      fillRows={[
        ['（账号 1）', '/', '/', '/', '/', '/', '/', '/'],
        ['（账号 2）', '/', '/', '/', '/', '/', '/', '/'],
        ['（账号 3...继续填至 30 个）', '/', '/', '/', '/', '/', '/', '/'],
      ]}
    />
  </ToolCard>
</Chapter>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/app/\(playbook\)/playbook/industry/page.tsx
git commit -m "feat(playbook): 番外卷 X.6 通用五步法"
```

---

## Task 9: 写入 X.7 练习

**Files:** Modify `website/src/app/(playbook)/playbook/industry/page.tsx`

**内容要点：**
- 输出物：一张 30 账号拆解表（定位 / 钩子 / 爆款元素 / 变现路径 / 可学 / 不可学）
- 执行 SOP：第一周看 10 个 / 第二周看 10 个 / 第三周看 10 个，每看完一个立刻填
- 纠错：不要看"自己喜欢的账号"，要看"你目标用户会看的账号"

- [ ] **Step 1: 插入 X.7 Chapter（约 1500 字）并保留 PartEnd**

将 X.7 Chapter 加在 X.6 之后、`<PartEnd />` 之前。

```tsx
<Chapter
  id="ch-x-7"
  no="X.7"
  tag="番外卷练习"
  title="番外卷练习 · 完成你的 30 账号样本库"
  lead="这是整本书最接地气的作业：打开抖音，老老实实看 30 个同行。"
>
  {/* 约 1500 字：
      为什么要做这个练习（而不是读更多方法论）
      执行 SOP（三周节奏）
      两个常见错误（看喜欢的vs看目标用户看的；只看内容不看后端商业）
      完成标准 */}
  <ToolCard tag="工具 X.7" title="30 账号样本库执行清单" desc="三周完成，每周 10 个，每天研究一两个。研究完每个账号后，在对应行填完所有列。">
    <Table
      head={['周次', '目标', '操作', '完成标志']}
      rows={[
        ['第一周', '熟悉行业整体格局', '搜行业词 + 用户词，找头中尾三层各 3-4 个', '填完 10 行，能说出各账号的核心差异'],
        ['第二周', '深挖爆款结构', '逐条看头部账号近 30 条视频，记录选题规律', '填完 10 行，能复述 3 个选题公式'],
        ['第三周', '找可复制的机会', '找同行里数据异常好/异常差的账号，分析原因', '填完 30 行，能识别你的差异化切入点'],
      ]}
    />
  </ToolCard>
</Chapter>
```

- [ ] **Step 2: Commit**

```bash
git add website/src/app/\(playbook\)/playbook/industry/page.tsx
git commit -m "feat(playbook): 番外卷 X.7 练习章节"
```

---

## Task 10: 更新主目录页 + 最终验证

**Files:** Modify `website/src/app/(playbook)/playbook/page.tsx`

- [ ] **Step 1: 更新 EXTRA_VOLUME**

在 `website/src/app/(playbook)/playbook/page.tsx` 中，找到 `const EXTRA_VOLUME: Volume = {` 并替换为：

```tsx
const EXTRA_VOLUME: Volume = {
  no: '番外卷',
  title: '行业战斗卷',
  meta: '24,000 字 · 8 节',
  desc: '不重复正卷方法论，只讲五大行业怎么把前面的方法用起来。',
  href: '/playbook/industry',
  status: '已开放',
  chapters: [
    { no: 'X.0', title: '导读 · 读案例的四个问题' },
    { no: 'X.1', title: '本地实体' },
    { no: 'X.2', title: '专业人士' },
    { no: 'X.3', title: '教育培训' },
    { no: 'X.4', title: '实物零售' },
    { no: 'X.5', title: '数字产品与知识付费' },
    { no: 'X.6', title: '普通行业五步通用打法' },
    { no: 'X.7', title: '同行样本库练习' },
  ],
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website && pnpm tsc --noEmit
```
预期：0 errors。

- [ ] **Step 3: 构建验证**

```bash
cd website && pnpm build
```
预期：build 成功，无报错。

- [ ] **Step 4: 最终 Commit**

```bash
git add website/src/app/\(playbook\)/playbook/page.tsx
git commit -m "feat(playbook): 番外卷集成完成，主目录更新为已开放"
```

---

## 验收标准

1. `pnpm build` 通过，无 TypeScript 错误
2. `/playbook` 主目录页番外卷状态显示"已开放"，点击可跳转 `/playbook/industry`
3. `/playbook/industry` 页面正常渲染，左侧目录 8 节均可锚点跳转
4. X.1 包含小贩海鲜、巨浪码头、贺先生三层案例数据
5. X.2 包含胡楚镜 968 万数据（摄影→女装跨界逻辑）
6. X.3 包含大天使英语 30/90/180 天数据 + 少儿购买力排序
7. X.4 包含 TopUncle 品控崩盘反例
8. 每节至少有 1 个可填工具表（X.0~X.7 共 8 个工具）
