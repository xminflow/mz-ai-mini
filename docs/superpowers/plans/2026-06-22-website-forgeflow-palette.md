# Website Forgeflow 配色改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 website 现有「紫/青/粉」暗色配色 100% 替换为 Forgeflow 实测调色板,并叠加 Forgeflow 结构气质(编号小节/彩色虚线描边/胶囊按钮/大圆角/紧字距),全站 token 自动继承、首页重点打磨。

**Architecture:** 配色集中在两层 —— (1) 全站 `globals.css` 的 `@theme` token + 3 个渐变 `@utility`;(2) 首页 per-item 色彩全部由 `data.ts` 的 `THEMES`(7)+`STAGE2_THEMES`(3)共 10 个主题条目驱动。改这两处覆盖 90%,剩余少量 section 内联色与 `primitives.tsx` 的 Hero 视觉逐处替换。仅改样式,不动 DOM 结构与数据流。

**Tech Stack:** Next.js 15 (App Router) · Tailwind CSS v4 (`@theme` in `globals.css`) · framer-motion · TypeScript

## Global Constraints

- 唯一调色板来源 = Forgeflow 实测值(见下「Forgeflow 五/七色族」),新增/保留的任何内联色必须出自该色族 + 中性色,**不得引入色族外新色**。
- **禁止修改** `globals.css` 第 304–334 行的 Prism 代码高亮 token(`.token.*`,One Dark 配色,服务于课程 Markdown 代码块,与品牌配色无关)。
- 不改文案、不改业务逻辑、不重排 DOM 结构、不动数据流;结构特征只通过「替换/新增样式类」实现。
- dev 启动用 `node node_modules/next/dist/bin/next dev`(本机 `pnpm run dev` 有 verify-deps-before-run 死循环);若 standalone 软链接报错,删 `.next` 重启。
- 前端不写组件测试;每个 Task 的验收 = grep 校验 + 编译无 error + chrome-devtools 截图自检(用户偏好:涉视觉必须自己截图核对,不盲改)。
- 中文注释解释非显然设计;不为直观赋值加注释。
- 提交信息格式遵循仓库约定(`feat(website): …`)。

### Forgeflow 调色板(唯一事实来源)

中性:canvas `#050505` · surface `#121212` · surface-2 `#1c1b1b` · ink `#f0f0f0` · ink-soft `#dddddf` · muted `#757575` · hairline `rgba(255,255,255,.1)`

强调色族(均取自 Forgeflow 线上源码):

| 族 | 主 hex / rgb | 浅(from) | 深(to) |
|---|---|---|---|
| 蓝 blue | `#0099ff` / `0,153,255` | `#7dadff` | `#155eef` |
| 青 cyan | `#01aef0` / `1,174,240` | `#57beff` | `#0284c7` |
| 紫 purple | `#8c5eff` / `140,94,255` | `#af53ff` | `#4a1fb8` |
| 品红 magenta | `#d42672` / `212,38,114` | `#ff52b7` | `#d1157a` |
| 柠绿 lime | `#bafa77` / `186,250,119` | `#d4ff9e` | `#16b364` |
| 黄 yellow | `#f8ec1d` / `248,236,29` | `#fff652` | `#eaaa08` |
| 橙 orange | `#ff5a1f` / `255,90,31` | `#ff7a4d` | `#ff4405` |

---

## File Structure

| 文件 | 职责 | 本计划改动 |
|---|---|---|
| `website/src/app/globals.css` | 全站 `@theme` token + `@utility` 渐变光效 | Task 1:换 9 token + 加 2 token + 3 utility(不碰 Prism) |
| `website/src/components/pages/ai-coding-camp/data.ts` | 10 个主题条目,驱动首页全部 per-item 色 | Task 2:重映射 `THEMES` + `STAGE2_THEMES` |
| `website/src/components/pages/ai-coding-camp/primitives.tsx` | Hero 视觉 + 报名按钮 + 价格条 + eyebrow | Task 3:换内联色;Task 6:eyebrow 编号 |
| `…/BottomCta.tsx`、`…/InstructorSection.tsx` | 全/半硬编码色的 section | Task 4:逐处换内联色 |
| `…/StageOneSection.tsx`、`JourneyMap.tsx`、`UpcomingCoursesSection.tsx`、`StageTwoSection.tsx` | 主要引用 `theme.*`,少量 stray 内联色 | Task 5:清剩余 stray 色 + 结构样式 |

---

## Task 1: 全站 `@theme` token 与渐变 utility

**Files:**
- Modify: `website/src/app/globals.css:3-27`(`@theme` 块)、`:79-82`(`::selection`)、`:115-144`(`text-gradient` / `hero-shine`)

**Interfaces:**
- Produces: token 名不变(`--color-canvas/surface/surface-2/ink/ink-soft/muted/accent/accent-2/accent-3`),仅改值;新增 `--color-accent-lime` / `--color-accent-yellow`。后续 Task 通过 Tailwind 类(`text-accent` 等)或 `var(--color-accent*)` 消费。

- [ ] **Step 1: 改 `@theme` 中性色与强调色(globals.css:4-15)**

把:
```css
  --color-ink: #F5F5F7;
  --color-ink-soft: #D4D4D8;
  --color-muted: #8A8A94;
  --color-canvas: #000000;
  --color-surface: #0D0D12;
  --color-surface-2: #141420;
  --color-hairline: rgb(255 255 255 / 0.08);
  --color-hairline-strong: rgb(255 255 255 / 0.16);

  --color-accent: #A78BFA;
  --color-accent-2: #22D3EE;
  --color-accent-3: #F472B6;
```
改为:
```css
  --color-ink: #f0f0f0;
  --color-ink-soft: #dddddf;
  --color-muted: #757575;
  --color-canvas: #050505;
  --color-surface: #121212;
  --color-surface-2: #1c1b1b;
  --color-hairline: rgb(255 255 255 / 0.1);
  --color-hairline-strong: rgb(255 255 255 / 0.18);

  --color-accent: #0099ff;   /* Forgeflow 电光蓝,主功能色 */
  --color-accent-2: #01aef0;  /* 青 */
  --color-accent-3: #d42672;  /* 品红 */
  --color-accent-lime: #bafa77;
  --color-accent-yellow: #f8ec1d;
```

- [ ] **Step 2: 改 `::selection`(globals.css:79-82)**

`background-color: rgba(167, 139, 250, 0.35);` → `background-color: rgba(0, 153, 255, 0.35);`

- [ ] **Step 3: 改 `text-gradient`(globals.css:115-127)**

把 `#F5F5F7 0% / #A78BFA 40% / #22D3EE 70% / #F5F5F7 100%` 改为:
```css
    #f0f0f0 0%,
    #0099ff 40%,
    #01aef0 70%,
    #f0f0f0 100%
```

- [ ] **Step 4: 改 `hero-shine`(globals.css:129-144)**

把 `#a78bfa / #22d3ee / #f472b6 / #a78bfa / #22d3ee` 序列改为 `#0099ff / #01aef0 / #bafa77 / #d42672 / #0099ff`;`drop-shadow` 的 `rgba(167,139,250,0.5)` → `rgba(0,153,255,0.5)`。

- [ ] **Step 5: 验证 —— 编译 + grep**

Run: `cd website && node node_modules/next/dist/bin/next dev`(已在跑则看终端热更新)
Expected: 无编译 error。

Run: `grep -nE "A78BFA|a78bfa|22D3EE|22d3ee|F472B6|f472b6|167, ?139, ?250" website/src/app/globals.css`
Expected: 仅可能命中 Prism 区(304-334)以外**无残留**(Prism 不含这些紫青粉值,应为空)。

- [ ] **Step 6: 截图自检**

用 chrome-devtools 打开 `http://localhost:3000`,截图。
Expected: 全站底色变 `#050505`、主功能色变电光蓝;首页 per-item 色此时仍是旧值(Task 2 处理),不算回归。

- [ ] **Step 7: Commit**

```bash
git add website/src/app/globals.css
git commit -m "style(website): @theme token 与渐变 utility 换为 Forgeflow 调色板"
```

---

## Task 2: `data.ts` 主题条目重映射(驱动首页全部 per-item 色)

**Files:**
- Modify: `website/src/components/pages/ai-coding-camp/data.ts:21-71`(`THEMES`)、`:651-673`(`STAGE2_THEMES`)

**Interfaces:**
- Consumes: 无。
- Produces: `Theme` 结构不变(`label/hex/rgb/gradientFrom/gradientTo` 五字段),仅改色值。所有 section 通过 `theme.hex/rgb/gradientFrom/gradientTo` 消费,自动生效。

- [ ] **Step 1: 重映射 `THEMES`(7 主题,保持七彩区分,全部取 Forgeflow 色)**

逐主题改 `hex/rgb/gradientFrom/gradientTo`(`label` 不变):
```
cognition  hex #0099ff  rgb "0, 153, 255"    from #7dadff  to #155eef   // 蓝
frontend   hex #01aef0  rgb "1, 174, 240"    from #57beff  to #0284c7   // 青
backend    hex #8c5eff  rgb "140, 94, 255"   from #af53ff  to #4a1fb8   // 紫
agent      hex #d42672  rgb "212, 38, 114"   from #ff52b7  to #d1157a   // 品红
launch     hex #f8ec1d  rgb "248, 236, 29"   from #fff652  to #eaaa08   // 黄
mobile     hex #ff5a1f  rgb "255, 90, 31"    from #ff7a4d  to #ff4405   // 橙
mindset    hex #bafa77  rgb "186, 250, 119"  from #d4ff9e  to #16b364   // 柠绿
```

- [ ] **Step 2: 重映射 `STAGE2_THEMES`(3 主题,延续「比第一阶段更深」的定位,取 Forgeflow 深色变体)**

```
advance     hex #155eef  rgb "21, 94, 239"    from #7dadff  to #175cd3   // 深蓝
enterprise  hex #eaaa08  rgb "234, 170, 8"    from #f8ec1d  to #92600e   // 暗金(Forgeflow 黄的深色端)
career      hex #16b364  rgb "22, 179, 100"   from #bafa77  to #0f766e   // 翡翠绿
```
保留 651 行注释「与第一阶段明快七彩区分」语义不变(stage2 仍整体更深)。

- [ ] **Step 3: 验证 —— grep data.ts 无旧色**

Run:
```bash
grep -niE "A78BFA|C4B5FD|7C3AED|22D3EE|67E8F9|0891B2|E879F9|F0ABFC|A21CAF|FB7185|FDA4AF|E11D48|FBBF24|FCD34D|D97706|38BDF8|7DD3FC|0284C7|34D399|6EE7B7|047857|60A5FA|93C5FD|1E40AF|D4A24E|E8C77A|92600E|2DD4BF|5EEAD4|0F766E" website/src/components/pages/ai-coding-camp/data.ts
```
Expected: 空(注意 `#0284c7` 现作为 frontend 新 `to` 值会命中 —— 属预期,确认该命中行是 frontend 的新值即可)。

- [ ] **Step 4: 截图自检(首页全屏 + 各 section)**

chrome-devtools 打开 `http://localhost:3000`,`fullPage` 截图 + 分别截 StageOne/StageTwo/JourneyMap/Instructor。
Expected: 章节色卡呈 Forgeflow 七色(蓝/青/紫/品红/黄/橙/柠绿);stage2 三簇呈深蓝/暗金/翡翠;无紫(#A78BFA)/玫红(#FB7185)残影。

- [ ] **Step 5: Commit**

```bash
git add website/src/components/pages/ai-coding-camp/data.ts
git commit -m "style(website): data.ts 10 个主题重映射为 Forgeflow 七色族"
```

---

## Task 3: `primitives.tsx` Hero 视觉与按钮/价格条换色

**Files:**
- Modify: `website/src/components/pages/ai-coding-camp/primitives.tsx`(`SectionEyebrow` 默认色 11 行、`EnrollButton` 阴影/流光 32/39 行、`PriceChip` 72-119 行、`HeroAuroraLayers` 137 行、`HERO_ORBS` 173-178 行、`ShimmerHeading` 211 行)

**Interfaces:**
- Consumes: Forgeflow 色族(Global Constraints)。
- Produces: 组件 props 签名不变;`SectionEyebrow` 在 Task 6 再扩展 `index`。

- [ ] **Step 1: `SectionEyebrow` 默认色(11 行)**

`color = '#A78BFA'` → `color = '#0099ff'`。

- [ ] **Step 2: `EnrollButton`(29-43 行)**

- 阴影 `boxShadow: '0 12px 40px -8px rgba(167,139,250,0.55)'` → `rgba(0,153,255,0.55)`。
- 悬停流光 `linear-gradient(120deg, #C4B5FD, #67E8F9, #F0ABFC, #FCD34D)` → `linear-gradient(120deg, #57beff, #01aef0, #bafa77, #f8ec1d)`(蓝→青→柠绿→黄)。

- [ ] **Step 3: `PriceChip` 玫红族 → 品红+黄(70-122 行)**

逐处替换(玫红族归并到 magenta + 少量 yellow):
```
borderColor rgba(251,113,133,0.5)                         → rgba(212,38,114,0.5)
背景 linear-gradient(rgba(251,113,133,.18),rgba(251,191,36,.14)) → linear-gradient(rgba(212,38,114,.18), rgba(248,236,29,.14))
boxShadow rgba(251,113,133,.10)/.55                       → rgba(212,38,114,.10)/.55
badge 背景 #FB7185→#E11D48                                → #ff52b7 → #d1157a
badge boxShadow rgba(251,113,133,0.65)                    → rgba(212,38,114,0.65)
specialLabel/「立即报名」文字 #FDA4AF                      → #ff52b7
价格数字 color #FECDD3 + textShadow rgba(251,113,133,0.6)  → #ffd6ec + rgba(212,38,114,0.6)
```

- [ ] **Step 4: `HeroAuroraLayers` 三焦点 radial(137 行)**

`rgba(167,139,250,0.52)` → `rgba(0,153,255,0.52)`;`rgba(34,211,238,0.45)` → `rgba(1,174,240,0.45)`;`rgba(232,121,249,0.30)` → `rgba(212,38,114,0.30)`。

- [ ] **Step 5: `HERO_ORBS` 六色(173-178 行)**

```
rgba(167,139,250,0.65) → rgba(0,153,255,0.65)    // 蓝
rgba(34,211,238,0.62)  → rgba(1,174,240,0.62)    // 青
rgba(232,121,249,0.62) → rgba(212,38,114,0.62)   // 品红
rgba(251,191,36,0.5)   → rgba(248,236,29,0.5)    // 黄
rgba(56,189,248,0.58)  → rgba(140,94,255,0.58)   // 紫
rgba(52,211,153,0.5)   → rgba(186,250,119,0.5)   // 柠绿
```

- [ ] **Step 6: `ShimmerHeading` 渐变(211 行)**

`#F5F5F7 0% / #C4B5FD 20% / #67E8F9 40% / #F0ABFC 60% / #FDA4AF 78% / #F5F5F7 100%`
→ `#f0f0f0 0% / #57beff 20% / #01aef0 40% / #8c5eff 60% / #d42672 78% / #f0f0f0 100%`(白→蓝→青→紫→品红→白)。

- [ ] **Step 7: 验证 —— grep primitives.tsx 无旧色**

Run:
```bash
grep -niE "A78BFA|C4B5FD|67E8F9|F0ABFC|FDA4AF|FECDD3|FB7185|E11D48|FCD34D|167,139,250|34,211,238|232,121,249|251,191,36|56,189,248|52,211,153|251,113,133" website/src/components/pages/ai-coding-camp/primitives.tsx
```
Expected: 空。

- [ ] **Step 8: 截图自检 Hero**

chrome-devtools 截 `http://localhost:3000` 首屏(Hero)。
Expected: Hero 光球/极光/流光标题呈 Forgeflow 蓝青紫品红黄柠绿;报名按钮阴影偏蓝;价格条呈品红+黄,数字可读、对比度足够。

- [ ] **Step 9: Commit**

```bash
git add website/src/components/pages/ai-coding-camp/primitives.tsx
git commit -m "style(website): primitives Hero 视觉与按钮价格条换 Forgeflow 色"
```

---

## Task 4: 全/半硬编码 section —— `BottomCta.tsx` 与 `InstructorSection.tsx`

**Files:**
- Modify: `website/src/components/pages/ai-coding-camp/BottomCta.tsx`、`…/InstructorSection.tsx`

**Interfaces:**
- Consumes: Forgeflow 色族。Produces: 无对外签名变化。

- [ ] **Step 1: `BottomCta.tsx`(全硬编码,按色族映射逐处替换)**

先定位:`grep -nE "167,139,250|232,121,249|251,191,36|34,211,238" BottomCta.tsx`。逐处按下表替换(`5,5,7` 背景与 box-shadow 偏移数值如 `0 8px…` 不动):
```
167,139,250  → 0,153,255    (紫→蓝)
34,211,238   → 1,174,240    (青→青)
232,121,249  → 212,38,114   (粉→品红)
251,191,36   → 248,236,29   (琥珀→黄)
```

- [ ] **Step 2: `InstructorSection.tsx`(半硬编码,按色族映射)**

定位:`grep -nE "#67E8F9|#C4B5FD|#FDA4AF|103,232,249|167,139,250|196,181,253|232,121,249|251,113,133|253,164,175|34,211,238" InstructorSection.tsx`。逐处替换(`13,13,18` surface 保留):
```
#C4B5FD / 196,181,253 / 167,139,250  → #57beff / 87,173,255 / 0,153,255   (紫→蓝)
#67E8F9 / 103,232,249 / 34,211,238   → #57beff / 87,190,255 / 1,174,240   (青→青)
232,121,249                          → 212,38,114                          (粉→品红)
#FDA4AF / 253,164,175 / 251,113,133  → #ff52b7 / 255,82,183 / 212,38,114   (玫红→品红)
```

- [ ] **Step 3: 验证 —— grep 两文件无旧色**

Run:
```bash
grep -niE "A78BFA|C4B5FD|67E8F9|F0ABFC|FDA4AF|FB7185|167,139,250|196,181,253|34,211,238|103,232,249|232,121,249|251,113,133|253,164,175|251,191,36" website/src/components/pages/ai-coding-camp/BottomCta.tsx website/src/components/pages/ai-coding-camp/InstructorSection.tsx
```
Expected: 空。

- [ ] **Step 4: 截图自检**

chrome-devtools 滚动到「讲师」与页面底部 CTA,截图。
Expected: 讲师卡光晕与底部 CTA 呈 Forgeflow 蓝/青/品红/黄;无紫/玫红残影。

- [ ] **Step 5: Commit**

```bash
git add website/src/components/pages/ai-coding-camp/BottomCta.tsx website/src/components/pages/ai-coding-camp/InstructorSection.tsx
git commit -m "style(website): BottomCta 与 InstructorSection 内联色换 Forgeflow 色"
```

---

## Task 5: 清剩余 stray 内联色(StageOne / JourneyMap / UpcomingCourses / StageTwo)

**Files:**
- Modify: `…/StageOneSection.tsx`、`…/JourneyMap.tsx`、`…/UpcomingCoursesSection.tsx`、`…/StageTwoSection.tsx`

**Interfaces:**
- Consumes: Forgeflow 色族。这些文件大部分走 `theme.*`(Task 2 已覆盖),此处只清少量未走 theme 的 stray 字面色。

- [ ] **Step 1: `StageOneSection.tsx` stray 色**

定位 `grep -nE "#C4B5FD|#FCD34D|#FDA4AF|167,139,250|251,113,133|251,191,36" StageOneSection.tsx`,逐处:
```
#C4B5FD / 167,139,250  → #57beff / 0,153,255    (紫→蓝)
#FCD34D / 251,191,36   → #fff652 / 248,236,29    (琥珀→黄)
#FDA4AF / 251,113,133  → #ff52b7 / 212,38,114    (玫红→品红)
```
（`13,13,18` 保留。）

- [ ] **Step 2: `JourneyMap.tsx` stray 色**

`#F5F5F7` → `#f0f0f0`(或改用 `text-ink`);`#FECDD3` → `#ffd6ec`(玫红→品红浅)。

- [ ] **Step 3: `UpcomingCoursesSection.tsx` stray 色**

`#FBBF24` → `#f8ec1d`(琥珀→黄)。

- [ ] **Step 4: `StageTwoSection.tsx` 中性 stray**

`148,163,184`(slate-400)→ 改用 `text-muted` 或 `117,117,117`(Forgeflow muted);`13,13,18` 保留。

- [ ] **Step 5: 验证 —— 全首页目录 grep 旧色族(总验收)**

Run:
```bash
grep -rniE "A78BFA|C4B5FD|7C3AED|22D3EE|67E8F9|E879F9|F0ABFC|A21CAF|FB7185|FDA4AF|FECDD3|E11D48|FBBF24|FCD34D|D97706|38BDF8|7DD3FC|34D399|6EE7B7|2DD4BF|5EEAD4|167,?139,?250|34,?211,?238|232,?121,?249|251,?113,?133|251,?191,?36|52,?211,?153|196,?181,?253|56,?189,?248|148,?163,?184" website/src/components/pages/ai-coding-camp/
```
Expected: 空(`#0284c7`/`#155eef`/`#16b364` 等若命中需确认是 Task 2 引入的新 Forgeflow 值)。

- [ ] **Step 6: 截图自检(整页)**

chrome-devtools `fullPage` 截 `http://localhost:3000`,逐屏核对无旧色残影。

- [ ] **Step 7: Commit**

```bash
git add website/src/components/pages/ai-coding-camp/StageOneSection.tsx website/src/components/pages/ai-coding-camp/JourneyMap.tsx website/src/components/pages/ai-coding-camp/UpcomingCoursesSection.tsx website/src/components/pages/ai-coding-camp/StageTwoSection.tsx
git commit -m "style(website): 清理各 section 残余 stray 内联色"
```

---

## Task 6: Forgeflow 结构特征叠加(编号小节 / 虚线描边 / 大圆角 / 紧字距)

**Files:**
- Modify: `…/primitives.tsx`(`SectionEyebrow`)、首页各 section(应用样式类)

**Interfaces:**
- Consumes: Task 3 后的 `SectionEyebrow`。
- Produces: `SectionEyebrow` 新增可选 `index?: number`;调用方传 `index` 渲染 `01/02…` 序号,序号色循环蓝/青/柠绿/品红。

- [ ] **Step 1: `SectionEyebrow` 扩展编号(primitives.tsx:11-19)**

加可选 `index?: number`,有值时在文字前渲染两位序号(`String(index).padStart(2,'0')`),序号用 `tabular` + 序号色按 `index % 4` 取 `['#0099ff','#01aef0','#bafa77','#d42672']`。无 `index` 时行为不变(保持向后兼容)。

```tsx
export const SectionEyebrow = ({ children, color = '#0099ff', index }: { children: React.ReactNode; color?: string; index?: number }) => {
  // 编号小节:Forgeflow 招牌的 01/02 序号,序号色循环四色,正文沿用 muted
  const seqColors = ['#0099ff', '#01aef0', '#bafa77', '#d42672']
  const seq = typeof index === 'number' ? String(index).padStart(2, '0') : null
  return (
    <span className="flex items-center gap-2.5 font-mono text-[15px] font-medium uppercase tracking-[0.24em] text-muted sm:text-[16px]">
      {seq && <span className="tabular font-semibold" style={{ color: seqColors[index! % 4] }}>{seq}</span>}
      <span className="h-px w-5 sm:w-6" style={{ background: `linear-gradient(to right, transparent, ${color}99)` }} />
      {children}
    </span>
  )
}
```

- [ ] **Step 2: 给主 section 的 eyebrow 传 `index`**

在 StageOne / StageTwo / JourneyMap / Instructor / Upcoming 的 `SectionEyebrow` 调用处按出现顺序传 `index={1..N}`(具体调用点用 `grep -n SectionEyebrow` 定位)。仅加 prop,不改文案。

- [ ] **Step 3: 关键卡片彩色虚线描边 + 大圆角**

挑选阶段卡 / 交付物卡(StageOne/StageTwo 的卡片容器),把实色描边类替换为 Forgeflow 招牌虚线:`border border-dashed`,边色用该卡 `theme.hex`(`style={{ borderColor: \`${theme.hex}80\` }}`),圆角对齐 `rounded-[40px]`(主卡)/ `rounded-xl`(次卡)。逐卡核对原 className,只替换 border/radius 相关类,不动布局。

- [ ] **Step 4: 紧字距**

大标题容器加 `tracking-[-0.03em]`,大写小标签加 `tracking-[0.07em]`(若已有 tracking 类则替换为该值)。

- [ ] **Step 5: 验证 —— 编译 + 截图核对结构**

Run: 确认 dev 无编译 error。
chrome-devtools 截图:Expected: 小节出现 `01/02…` 彩色序号;关键卡片为彩色虚线描边 + 更大圆角;标题字距更紧。与 https://forgeflow.framer.website/ 并排观感一致(气质而非像素级)。

- [ ] **Step 6: Commit**

```bash
git add website/src/components/pages/ai-coding-camp/
git commit -m "style(website): 叠加 Forgeflow 结构特征(编号小节/虚线描边/大圆角/紧字距)"
```

---

## Task 7: 全站回归验证(非首页页面 + 构建)

**Files:** 无改动,仅验证。

- [ ] **Step 1: 非首页页面截图(token 继承回归)**

chrome-devtools 依次截 `http://localhost:3000/login`、`/membership`(或 `/pricing`)、一个课程页。
Expected: token 继承后配色统一为 Forgeflow,无对比度过低、无紫/粉残影、无不可读文字。发现问题记录到清单,定位是「该页有自己的硬编码色」还是「token 问题」,小步修复并 commit。

- [ ] **Step 2: 生产构建验证**

Run: `cd website && node node_modules/next/dist/bin/next build`
Expected: 构建成功(0 error)。若因 standalone 软链接报错,先删 `.next` 再重试。

- [ ] **Step 3: 最终总验收 grep**

Run(重复 Task 5 Step 5 的全目录 grep,并加 globals 非 Prism 区):
Expected: 全空(除已确认的 Forgeflow 新值)。

- [ ] **Step 4: 收尾说明**

按 CLAUDE.md 输出:完成了什么、验证方式(grep + build + 截图)、遗留项与建议(如某非首页页面有独立硬编码色未在本计划范围,需单独评估)。

---

## Self-Review(against spec)

- spec §3 全站 token → Task 1 ✅;§4 内联色清理 → Task 2/3/4/5 ✅;§5 结构特征 → Task 6 ✅;§6 光效换色 → Task 3(aurora/orbs/shimmer)✅;§7 验收(grep+build+截图+非首页抽查)→ Task 1-7 各 verify + Task 7 ✅;§8 风险(内联色广/价格条对比度/dev 启动/.next)→ Global Constraints + 各 Task 截图 gate ✅。
- 占位符扫描:无 TBD/TODO;每个改动均给出确切文件/行号/前后值。
- 类型一致性:`Theme` 五字段名全程一致;`SectionEyebrow` 新增 `index?: number` 在 Task 6 定义、调用处一致;token 名不变。
- Prism 禁改约束在 Global Constraints 与 Task 1 双重声明。
