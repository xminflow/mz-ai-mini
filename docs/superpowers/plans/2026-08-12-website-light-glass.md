# 官网浅色玻璃质感改造 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给官网浅色站点（首页 + 案例页）加入弥散光域与三档毛玻璃材质，把纯黑白米白的观感提升为有透光质感的高端专业观感。

**Architecture:** 分两层。底层新增页面级 `AuroraField` 弥散光域组件，为毛玻璃提供采样对象；上层在 `globals.css` 定义三档玻璃 utility（`glass-thin` / `glass-medium` / `glass-thick`）作为全站唯一来源，各面按档位替换现有实心背景。前置改造是拆掉服务轮播轨道上的 `maskImage`——它创建 backdrop root，会让内部所有 `backdrop-filter` 失效。

**Tech Stack:** Next.js 15 (App Router)、React 19、Tailwind CSS v4（`@theme` / `@utility` 语法）、framer-motion 12、TypeScript 6。

## Global Constraints

- 只改浅色站点：`LightShell` 外壳 + 首页 + 案例页。已隐藏的深色页面（playbook / membership / ai-coding-camp / studio 等）一律不动。
- `globals.css` 中现有的 `@utility glass`（`rgba(18,18,18,0.55)`）是深色版，供深色页面使用，**禁止修改或删除**。
- 深色 token（`--color-ink` / `--color-canvas` / `--color-surface` / `--color-hairline` 等）禁止修改。
- 不新增任何容器层级。玻璃改造只把现有实心面换成半透明面，不得为了玻璃效果套新的 div 包装层。
  例外仅两处，均不包裹任何内容、均为 `pointer-events-none` 的纯装饰兄弟节点：Task 2 的 `AuroraField` 光域层，
  Task 4 替代 `maskImage` 的两块淡出覆盖层。
- 背景层不得出现网格、点阵或任何图案，只允许弥散柔光。
- `ServiceFlow` 的近黑展开面板保持实心，本轮不做深面玻璃。
- `src/components/ui/Card.tsx` 全站无任何使用处（死代码），本轮不修改、不删除。
- 所有 `backdrop-filter` 必须同时写 `-webkit-backdrop-filter`。
- **禁止执行 `pnpm build` / `next build`**：该命令会挂掉正在运行的 dev server，且 standalone 输出在 Windows 上必然 EPERM 失败，与业务代码无关。类型检查用 `npx tsc --noEmit`。
- 前端不写组件级测试（项目规范）。每个任务的验收靠 lint + 类型检查 + 浏览器截图核对。
- 复杂逻辑、非显然设计、踩过的坑必须写中文注释。

## 验证环境

dev server 已在 `http://localhost:3100/` 运行。若未运行，在 `website/` 下执行 `pnpm run dev`。

每个任务的截图核对统一用 chrome-devtools MCP，流程固定为：

```
navigate_page  → http://localhost:3100/
evaluate_script → 滚到目标板块（见各任务给出的具体脚本）
take_screenshot → format: jpeg, quality: 85
```

---

# 阶段一：地基

目标是让页面先有光、并拆掉挡住玻璃的 `maskImage`。做完这一阶段页面会明显有色彩层次，但还没有任何一块玻璃。

---

### Task 1: 三档玻璃 utility

**Files:**
- Modify: `website/src/app/globals.css`（在现有 `@utility glass` 之后插入，约 176 行）

**Interfaces:**
- Consumes: 无
- Produces: 三个 Tailwind utility 类名 `glass-thin`、`glass-medium`、`glass-thick`，供 Task 5–12 使用。

- [ ] **Step 1: 在 `@utility glass { ... }` 块之后插入三档浅色玻璃**

在 `website/src/app/globals.css` 中，紧接现有的：

```css
@utility glass {
  background: rgba(18, 18, 18, 0.55);
  backdrop-filter: saturate(160%) blur(18px);
  -webkit-backdrop-filter: saturate(160%) blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

之后插入：

```css
/* ===== 浅色玻璃：三档规格 =====
   上面那个 @utility glass 是深色版，供已隐藏的深色页面使用，不要动它。
   下面三档是浅色站点唯一的玻璃来源，各 section 禁止自行发明参数。

   四项配套缺一不可。半透明底色只是把面变淡，真正让眼睛读出「一块有厚度的料」
   而不是「一张淡了的纸」的，是上缘高光线、下缘暗线和描边这三笔。只写
   background + backdrop-filter 得到的是后者。

   saturate 比 blur 更要紧：真玻璃会让透过的颜色变浓，这是它区别于半透明塑料的
   主要特征。底色平淡时 blur 几乎无效，saturate 仍然在工作。

   prefers-reduced-transparency 下整体退回近实心：backdrop-filter 在低端设备上
   开销很大，且该偏好本身就意味着用户不想要透明效果。 */
@utility glass-thin {
  background: rgba(255, 255, 255, 0.44);
  backdrop-filter: saturate(180%) blur(26px);
  -webkit-backdrop-filter: saturate(180%) blur(26px);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    inset 0 -1px 0 rgba(14, 14, 14, 0.04),
    0 20px 50px rgba(14, 14, 14, 0.06);

  @media (prefers-reduced-transparency: reduce) {
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@utility glass-medium {
  background: rgba(255, 255, 255, 0.62);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(14, 14, 14, 0.035),
    0 12px 32px rgba(14, 14, 14, 0.05);

  @media (prefers-reduced-transparency: reduce) {
    background: rgba(255, 255, 255, 0.96);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@utility glass-thick {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: saturate(170%) blur(30px);
  -webkit-backdrop-filter: saturate(170%) blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    inset 0 -1px 0 rgba(14, 14, 14, 0.03),
    0 24px 60px rgba(14, 14, 14, 0.1);

  @media (prefers-reduced-transparency: reduce) {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

- [ ] **Step 2: 确认 Tailwind 生成了这三个类**

在 `website/` 下运行：

```bash
npx tsc --noEmit
```

Expected: 无输出（通过）。

然后在浏览器里验证 utility 真的被生成（Tailwind v4 按需生成，没有用到的类不会出现在产物里，所以这一步临时挂一个类上去）：

```js
// evaluate_script
() => {
  const d = document.createElement('div');
  d.className = 'glass-medium';
  document.body.appendChild(d);
  const cs = getComputedStyle(d);
  const out = {
    background: cs.backgroundColor,
    backdrop: cs.backdropFilter || cs.webkitBackdropFilter,
    shadow: cs.boxShadow,
  };
  d.remove();
  return out;
}
```

Expected: `background` 为 `rgba(255, 255, 255, 0.62)`，`backdrop` 含 `saturate(1.8) blur(24px)`，`shadow` 非 `none`。

若 `background` 是 `rgba(0, 0, 0, 0)`，说明 Tailwind 尚未扫到该类名——这是正常的按需生成行为，等 Task 5 起真正在 tsx 里用上后会自动生成。此时只需确认 `globals.css` 无语法报错（dev server 终端无 CSS 编译错误）即可通过本步。

- [ ] **Step 3: 提交**

```bash
git add website/src/app/globals.css
git commit -m "feat(website): 新增浅色三档玻璃 utility

glass-thin/medium/thick 作为浅色站点唯一的玻璃来源。
深色版 @utility glass 保持不变，供已隐藏的深色页面使用。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: AuroraField 光域组件

**Files:**
- Create: `website/src/components/layout/AuroraField.tsx`

**Interfaces:**
- Consumes: 无
- Produces: `export const AuroraField: (props: { variant?: 'home' | 'simple' }) => JSX.Element`，供 Task 3 在 `LightShell` 中挂载。`variant` 默认 `'simple'`。

**注意：不要往 `website/src/components/layout/index.ts` 里加导出。** 该文件只导出深色组件（`ContactQrCodeModal` / `SiteFooter` / `TopNav`），`LightShell`、`LightNav`、`LightFooter`、`LightContactModal` 一律走直接路径导入，`AuroraField` 跟随这个既有约定。

- [ ] **Step 1: 创建 `website/src/components/layout/AuroraField.tsx`**

```tsx
type AuroraVariant = 'home' | 'simple'

type AuroraFieldProps = {
  /** home 铺四团光对应首页四个板块；simple 只留首屏一团，给案例页这类短页面用 */
  variant?: AuroraVariant
}

/**
 * 光域层：浅色站点唯一的背景光来源，取代原先只覆盖首屏的 WarmGlow。
 *
 * 它存在的理由不是装饰，是给毛玻璃提供采样对象。实测过：底色是一整块平米白时，
 * 给卡片加 backdrop-filter 是零效果——玻璃只搬运背后的信息，背后没信息就什么都
 * 不发生。所以这一层一旦被移除或调淡到看不见，全站的玻璃质感会同时消失，
 * 两者是一套东西的两半。
 *
 * 三条硬约束：
 *
 * 1. 光团不压在大标题正下方。首屏那团的中心刻意推到容器上边缘之外，标题所在的
 *    横带上只剩余光，正文对比度不受影响。
 *
 * 2. 不同色相的光团之间必须退到接近 0。相邻色相在交界处叠加会泛出脏色——
 *    WarmGlow 里记过同类问题：暖橙叠琥珀会在交界泛绿。这里橙、蓝、紫三团的
 *    纵向间距都在 22% 页高以上，配合 68% 的透明落点，交界处已经归零。
 *
 * 3. 尺寸随断点收窄。固定 px 宽度在窄屏上会让渐变的密集中心铺满整屏，柔光变成
 *    一层色蒙版。窄屏只保留首屏和服务区两团，且尺寸减半。
 *
 * 定位用 absolute 而不是 fixed：光要跟着页面一起滚，光团与板块的对应关系才是
 * 固定可控的。fixed 会让光停在视口上，不同板块滚过去时透出什么色相由滚动位置
 * 决定，无法预期。
 *
 * 纵向位置按页高百分比给出，锚点取自首页实测：
 * 首屏 65–625、能力条 625–784、服务 784–1674、流程 1674–2526、页脚 2526–2690。
 */
export const AuroraField = ({ variant = 'simple' }: AuroraFieldProps) => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  >
    {/* 首屏：暖橙。中心推到 -6%，标题横带上只有余光 */}
    <div
      className="absolute left-[18%] top-[-6%] h-[320px] w-[86vw] -translate-x-1/2 rounded-full blur-[60px] sm:h-[560px] sm:w-[900px] sm:blur-[80px]"
      style={{
        background:
          'radial-gradient(ellipse at center, rgb(255 88 36 / 0.26), transparent 68%)',
      }}
    />

    {variant === 'home' && (
      <>
        {/* 服务轮播区：冷蓝。玻璃卡的主要采样对象，是全页最需要有东西可透的地方 */}
        <div
          className="absolute left-[56%] top-[38%] h-[360px] w-[92vw] -translate-x-1/2 rounded-full blur-[60px] sm:h-[620px] sm:w-[1000px] sm:blur-[90px]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgb(30 120 240 / 0.24), transparent 68%)',
          }}
        />

        {/* 流程区：淡紫。强度压到最低，这一区主体是近黑面板，光只负责让四周不死板 */}
        <div
          className="absolute left-[22%] top-[68%] hidden h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-[90px] sm:block"
          style={{
            background:
              'radial-gradient(ellipse at center, rgb(150 105 240 / 0.16), transparent 70%)',
          }}
        />

        {/* 页脚：暖橙回归，与首屏呼应收尾 */}
        <div
          className="absolute left-[74%] top-[92%] hidden h-[420px] w-[760px] -translate-x-1/2 rounded-full blur-[80px] sm:block"
          style={{
            background:
              'radial-gradient(ellipse at center, rgb(255 88 36 / 0.18), transparent 70%)',
          }}
        />
      </>
    )}
  </div>
)
```

- [ ] **Step 2: 类型检查与 lint**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

Expected: 两条命令均无错误输出。

此时组件尚未被挂载，页面不应有任何视觉变化。

- [ ] **Step 3: 提交**

```bash
git add website/src/components/layout/AuroraField.tsx
git commit -m "feat(website): 新增 AuroraField 光域层组件

为毛玻璃提供采样对象。变体 home 铺四团光对应首页板块，
simple 只留首屏一团供案例页使用。尚未挂载。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 挂载光域层，下线 WarmGlow

**Files:**
- Modify: `website/src/components/layout/LightShell.tsx`
- Modify: `website/src/components/pages/home/HomeContent.tsx`
- Modify: `website/src/components/pages/home/Hero.tsx:13-14`（移除 `WarmGlow` 引用）
- Delete: `website/src/components/pages/home/WarmGlow.tsx`

**Interfaces:**
- Consumes: `AuroraField`（Task 2）
- Produces: `LightShell` 新增可选 prop `aurora?: 'home' | 'simple'`，默认 `'simple'`。

- [ ] **Step 1: 给 `LightShell` 加 `aurora` prop 并挂载光域层**

把 `website/src/components/layout/LightShell.tsx` 中的：

```tsx
type LightShellProps = {
  children: ReactNode
}
```

改为：

```tsx
type LightShellProps = {
  children: ReactNode
  /**
   * 光域层的铺法。长页面（首页）用 home 铺四团光对应各板块；
   * 短页面（案例页）用 simple 只留首屏一团——四团光挤在不到一屏的高度里会互相
   * 叠加泛出脏色，正是 AuroraField 注释里第 2 条约束要避免的情况。
   */
  aurora?: 'home' | 'simple'
}
```

把组件签名与外层容器改为：

```tsx
export const LightShell = ({ children, aurora = 'simple' }: LightShellProps) => {
  const [contactOpen, setContactOpen] = useState(false)
  const openContact = useCallback(() => setContactOpen(true), [])
  const closeContact = useCallback(() => setContactOpen(false), [])
  const contactValue = useMemo(() => ({ openContact }), [openContact])

  return (
    <ContactContext.Provider value={contactValue}>
      {/* relative isolate：给 AuroraField 的 -z-10 建立独立层叠上下文，
          让光只压在本外壳内部，不会钻到其他层之下 */}
      <div className="relative isolate flex min-h-screen flex-col bg-paper text-graphite">
        <AuroraField variant={aurora} />
        <LightNav />
        <main className="flex-1">{children}</main>
        <LightFooter />
        <LightContactModal open={contactOpen} onClose={closeContact} />
      </div>
    </ContactContext.Provider>
  )
}
```

并在文件顶部 import 区加入：

```tsx
import { AuroraField } from './AuroraField'
```

- [ ] **Step 2: 首页传 `aurora="home"`**

把 `website/src/components/pages/home/HomeContent.tsx` 中的 `<LightShell>` 改为 `<LightShell aurora="home">`（闭合标签不变）。

案例页 `CasesContent.tsx` 不改，走默认的 `simple`。

- [ ] **Step 3: 从 Hero 移除 WarmGlow**

在 `website/src/components/pages/home/Hero.tsx` 中：

- 删除 `import { WarmGlow } from './WarmGlow'` 这一行
- 删除 `<WarmGlow />` 这一行
- 把 `<section id="top" className="relative isolate">` 改为 `<section id="top" className="relative">`

同时把原来那条解释 `isolate` 的注释删掉（`isolate` 已不需要，光域层由 `LightShell` 统一提供）：

```tsx
  return (
    <section id="top" className="relative">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-32">
```

- [ ] **Step 4: 删除 WarmGlow 文件**

```bash
git rm website/src/components/pages/home/WarmGlow.tsx
```

- [ ] **Step 5: 确认没有残留引用**

```bash
cd website && grep -rn "WarmGlow" src/ || echo "无残留引用"
```

Expected: 输出 `无残留引用`。

- [ ] **Step 6: 类型检查与 lint**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

Expected: 两条命令均无错误输出。

- [ ] **Step 7: 截图核对首页四个板块**

依次执行以下四段脚本，每段之后截图一次（`take_screenshot`，`format: jpeg`，`quality: 85`）：

```js
// 首屏
() => { window.scrollTo(0, 0); return window.scrollY }
```

```js
// 服务轮播区
async () => {
  const s = document.getElementById('services');
  window.scrollTo(0, window.scrollY + s.getBoundingClientRect().top - 60);
  await new Promise(r => setTimeout(r, 2500));
  return window.scrollY;
}
```

```js
// 流程区
async () => {
  const s = document.getElementById('process');
  window.scrollTo(0, window.scrollY + s.getBoundingClientRect().top - 60);
  await new Promise(r => setTimeout(r, 2000));
  return window.scrollY;
}
```

```js
// 页脚
async () => {
  window.scrollTo(0, document.documentElement.scrollHeight);
  await new Promise(r => setTimeout(r, 1200));
  return window.scrollY;
}
```

逐张核对以下四条，任一不满足就回到 Task 2 调整对应光团的 `left` / `top` / alpha，然后重新截图：

1. 首屏大标题「把软件定制 / 做成您的专属贵宾服务」所在的横带上没有明显着色，黑字对比度看起来和改造前一致。
2. 服务轮播区能看到冷蓝调，但卡片上的正文仍然清楚。
3. 橙、蓝、紫三团之间没有出现浑浊的交界带（典型脏色表现：橙蓝交界发灰绿、蓝紫交界发脏青）。
4. 页脚区有暖调回归，与首屏呼应。

- [ ] **Step 8: 截图核对案例页**

```
navigate_page → http://localhost:3100/cases
take_screenshot
```

核对：只有一团暖橙柔光，正文「我们正在整理可公开展示的项目案例……」对比度正常，页面不显脏。

- [ ] **Step 9: 窄屏核对**

```
resize_page → width: 390, height: 844
navigate_page → http://localhost:3100/
take_screenshot
```

核对：光团没有铺满整屏变成色蒙版，首屏标题区仍然干净。核对完把窗口改回 `width: 1440, height: 900`。

- [ ] **Step 10: 提交**

```bash
git add -A website/src
git commit -m "feat(website): 挂载光域层，下线 WarmGlow

LightShell 统一提供背景光，首页四团、案例页一团。
Hero 不再自带光晕，isolate 一并移除。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 拆除轮播轨道的 maskImage

**Files:**
- Modify: `website/src/components/pages/home/ServiceTypes.tsx:99`（删除 `MASK` 常量）
- Modify: `website/src/components/pages/home/ServiceTypes.tsx:244-262`（轨道去 mask，父层加淡出覆盖层）

**Interfaces:**
- Consumes: 无
- Produces: 轨道内部不再有 backdrop root，Task 10 的玻璃卡才能生效。

- [ ] **Step 1: 删除 MASK 常量**

删除 `website/src/components/pages/home/ServiceTypes.tsx` 中这一行：

```tsx
const MASK = 'linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)'
```

- [ ] **Step 2: 从轨道 style 中移除 mask，并补上原因注释**

把轨道 div 的 `style` 从：

```tsx
        style={{
          height: cardH + 56,
          opacity: ready ? 1 : 0,
          maskImage: MASK,
          WebkitMaskImage: MASK,
          // 透视点放在这一层，十二张卡共用同一个灭点；若逐卡写 transformPerspective，
          // 每张会有各自的灭点，一排卡的透视方向就对不上了
          perspective: 1500,
        }}
```

改为：

```tsx
        style={{
          height: cardH + 56,
          opacity: ready ? 1 : 0,
          // 这里曾经挂过 maskImage 做左右淡出，已移除，不要加回来：
          // mask 会创建 backdrop root，导致轨道内部所有元素的 backdrop-filter 全部失效，
          // 十二张玻璃卡会一起变成普通半透明色块。实测过同一配置仅差 mask，结果截然不同。
          // 淡出改由父层的两块渐变覆盖层实现，见下方 EdgeFade。
          //
          // 透视点放在这一层，十二张卡共用同一个灭点；若逐卡写 transformPerspective，
          // 每张会有各自的灭点，一排卡的透视方向就对不上了
          perspective: 1500,
        }}
```

- [ ] **Step 3: 在轨道之后加两块淡出覆盖层**

在轨道 div 的闭合标签 `</div>` 之后、箭头容器 `<div className="pointer-events-none absolute inset-y-0 left-1/2 ...">` 之前，插入：

```tsx
      {/* 左右淡出。原先是轨道上的 maskImage，因为会废掉内部的 backdrop-filter 而改成
          覆盖层。z-index 必须高过卡片（卡片是 50 - distance，最高 50），否则盖不住。
          宽度取 8%：再宽会把最外侧那对卡整个吃掉，也会在底部光域上压出一条可见的
          米白带 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-[60] w-[8%] bg-gradient-to-r from-paper to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-[60] w-[8%] bg-gradient-to-l from-paper to-transparent"
      />
```

- [ ] **Step 4: 类型检查与 lint**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

Expected: 两条命令均无错误输出。

- [ ] **Step 5: 截图核对轮播区**

滚到服务区截图（脚本同 Task 3 Step 7 第二段）。核对两条：

1. 轮播左右两侧仍有淡出效果，最外侧的卡不是被硬切断的。
2. 淡出区域没有在光域上压出一条明显的米白竖带。

若出现明显米白带，改用下面这个替代方案（二选一，不要两个都留）：删掉上面两块覆盖层，改为把 `STAGE` 中 `distance === 2` 那一档的 `opacity` 从 `1` 降到 `0.55`，即：

```tsx
const STAGE = [
  { x: 0, z: 0, rotate: 0, scale: 1, dim: 0, opacity: 1 },
  { x: 0.97, z: -150, rotate: 36, scale: 0.9, dim: 0.16, opacity: 1 },
  { x: 1.71, z: -260, rotate: 40, scale: 0.84, dim: 0.26, opacity: 0.55 },
  { x: 2.35, z: -400, rotate: 46, scale: 0.76, dim: 0.32, opacity: 0 },
]
```

改完重新截图核对同样两条。

- [ ] **Step 6: 提交**

```bash
git add website/src/components/pages/home/ServiceTypes.tsx
git commit -m "fix(website): 轮播轨道拆除 maskImage，淡出改覆盖层

mask 会创建 backdrop root 使内部 backdrop-filter 全部失效，
是玻璃卡能否生效的前置条件。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

# 阶段二：外壳

把浮在内容之上的面换成玻璃。这些地方天然有东西可透（导航压标题、页脚压最后一屏、模态压整页），效果最稳。

---

### Task 5: 导航条

**Files:**
- Modify: `website/src/components/layout/LightNav.tsx:30-38`

**Interfaces:**
- Consumes: `glass-medium`（Task 1）
- Produces: 无

- [ ] **Step 1: 把滚动态的实心背景换成玻璃**

把：

```tsx
        className={[
          'transition-all duration-300',
          scrolled
            ? 'border-b border-rule bg-paper/80 backdrop-blur-xl'
            : 'border-b border-transparent',
        ].join(' ')}
```

改为：

```tsx
        // 玻璃只在滚动后出现：停在顶部时导航压着的是首屏留白，做成玻璃只会凭空
        // 多出一条横带。glass-medium 自带四周描边，但这是一条通栏，只有下缘该留线，
        // 左右和上缘用内联样式压掉——同为 utility 的 border-x-0 与 glass-medium
        // 处在同一层，谁覆盖谁取决于生成顺序，不可靠，内联样式才是确定的
        className={[
          'transition-all duration-300',
          scrolled ? 'glass-medium' : 'border-b border-transparent',
        ].join(' ')}
        style={scrolled ? { borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 } : undefined}
```

- [ ] **Step 2: 类型检查与 lint**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

Expected: 无错误输出。

- [ ] **Step 3: 截图核对**

```js
// 滚到标题正好压在导航条下方
async () => {
  window.scrollTo(0, 320);
  await new Promise(r => setTimeout(r, 800));
  return window.scrollY;
}
```

截图核对三条：

1. 导航条下方能看到被模糊化开的大标题，而不是一条不透明的米白带。
2. 导航条下缘有一道可辨的分界（来自 `glass-medium` 的下缘暗线），不是糊在一起。
3. 「首页」「案例」「联系我们」文字清晰，对比度没有下降。

再滚回顶部（`window.scrollTo(0, 0)`）截图，确认未滚动时导航条完全透明、没有多出横线。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/layout/LightNav.tsx
git commit -m "feat(website): 导航条改为 glass-medium

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: 能力条胶囊

**Files:**
- Modify: `website/src/components/pages/home/CapabilityBar.tsx:16`

**Interfaces:**
- Consumes: `glass-medium`（Task 1）
- Produces: 无

- [ ] **Step 1: 替换背景**

把：

```tsx
      <div className="flex max-w-full flex-wrap items-center justify-center gap-y-1 rounded-[22px] bg-paper-raised px-3 py-3 shadow-soft sm:rounded-full">
```

改为：

```tsx
      <div className="glass-medium flex max-w-full flex-wrap items-center justify-center gap-y-1 rounded-[22px] px-3 py-3 sm:rounded-full">
```

（`bg-paper-raised` 与 `shadow-soft` 一并去掉，两者都由 `glass-medium` 提供。）

- [ ] **Step 2: 类型检查与 lint**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

Expected: 无错误输出。

- [ ] **Step 3: 截图核对**

```js
async () => {
  window.scrollTo(0, 480);
  await new Promise(r => setTimeout(r, 800));
  return window.scrollY;
}
```

核对：胶囊有可见的上缘高光线；五项文字清楚；胶囊在首屏暖光的余光区里能看出轻微的暖调，说明玻璃在工作。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/pages/home/CapabilityBar.tsx
git commit -m "feat(website): 能力条胶囊改为 glass-medium

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: 次要按钮与轮播翻页钮

**Files:**
- Modify: `website/src/components/ui/Button.tsx:10-13`
- Modify: `website/src/components/pages/home/ServiceTypes.tsx:445`（`PagerButton` 的 className）

**Interfaces:**
- Consumes: `glass-medium`（Task 1）
- Produces: 无

- [ ] **Step 1: secondary 变体改玻璃**

把 `website/src/components/ui/Button.tsx` 中：

```tsx
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-graphite text-paper hover:bg-graphite-soft',
  secondary: 'border border-rule bg-paper-raised text-graphite hover:border-rule-strong',
}
```

改为：

```tsx
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  // primary 保持黑底实心：它是页面上对比度最高的一处落点，做成玻璃会削掉它的分量
  primary: 'bg-graphite text-paper hover:bg-graphite-soft',
  secondary: 'glass-medium text-graphite hover:bg-white/75',
}
```

（`border border-rule` 去掉，描边由 `glass-medium` 提供；hover 从改描边色改为提高白度，玻璃上后者更自然。）

- [ ] **Step 2: 翻页圆钮改玻璃**

把 `website/src/components/pages/home/ServiceTypes.tsx` 中 `PagerButton` 的 className：

```tsx
    className="pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rule bg-paper-raised text-graphite-soft shadow-soft transition-colors duration-200 hover:border-rule-strong hover:text-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
```

改为：

```tsx
    className="glass-medium pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-graphite-soft transition-colors duration-200 hover:bg-white/75 hover:text-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
```

- [ ] **Step 3: 类型检查与 lint**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

Expected: 无错误输出。

- [ ] **Step 4: 截图核对**

首屏截图（`window.scrollTo(0, 0)`）核对「看服务」按钮：有边光、文字清楚、与旁边黑底的「联系我们」形成明确主次。

服务区截图核对两个翻页圆钮：不再是实心白圆片，能看出透光。

- [ ] **Step 5: 提交**

```bash
git add website/src/components/ui/Button.tsx website/src/components/pages/home/ServiceTypes.tsx
git commit -m "feat(website): 次要按钮与翻页圆钮改为 glass-medium

primary 保持黑底实心，不削弱主 CTA 的分量。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: 页脚

**Files:**
- Modify: `website/src/components/layout/LightFooter.tsx:9`

**Interfaces:**
- Consumes: `glass-medium`（Task 1）
- Produces: 无

- [ ] **Step 1: 替换页脚背景**

把：

```tsx
    <footer className="border-t border-rule">
```

改为：

```tsx
    {/* 页脚压在最后一屏内容之上，是天然的浮层位置。原来的 border-t 去掉，
        改由 glass-medium 的描边承担；左右下三边用内联样式压掉——同为 utility 的
        border-x-0 与 glass-medium 处在同一层，覆盖顺序不可靠 */}
    <footer className="glass-medium" style={{ borderLeftWidth: 0, borderRightWidth: 0, borderBottomWidth: 0 }}>
```

- [ ] **Step 2: 类型检查与 lint**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

Expected: 无错误输出。

- [ ] **Step 3: 截图核对**

```js
async () => {
  window.scrollTo(0, document.documentElement.scrollHeight);
  await new Promise(r => setTimeout(r, 1200));
  return window.scrollY;
}
```

核对：页脚与上方内容之间有清晰的分界线；页脚里能透出页脚区那团暖光；「© 2026 微域生光」「鄂ICP备2026022946号」这两行小字仍然可读。

案例页同样核对一次（`http://localhost:3100/cases` 滚到底截图）。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/layout/LightFooter.tsx
git commit -m "feat(website): 页脚改为 glass-medium

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: 联系浮层

**Files:**
- Modify: `website/src/components/layout/LightContactModal.tsx:45`

**Interfaces:**
- Consumes: `glass-thick`（Task 1）
- Produces: 无

- [ ] **Step 1: 面板改厚玻璃**

把：

```tsx
            <div className="pointer-events-auto relative w-full max-w-sm rounded-card bg-paper-raised p-6 shadow-soft-lg">
```

改为：

```tsx
            {/* 用最厚的一档：这块面板压着整页内容，薄玻璃会让下面的文字透上来干扰阅读。
                注意二维码容器仍是实心白（下方 bg-white），不要跟着改半透——
                半透背景会降低扫码识别率 */}
            <div className="glass-thick pointer-events-auto relative w-full max-w-sm rounded-card p-6">
```

二维码容器那一行保持原样不动：

```tsx
              <div className="mx-auto mt-5 flex h-72 w-72 items-center justify-center overflow-hidden rounded-btn border border-rule bg-white p-2">
```

- [ ] **Step 2: 类型检查与 lint**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

Expected: 无错误输出。

- [ ] **Step 3: 截图核对**

```js
async () => {
  const btns = [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === '联系我们');
  btns[0].click();
  await new Promise(r => setTimeout(r, 700));
  return btns.length;
}
```

核对四条：

1. 面板有明显的玻璃边光，不是一块纯白方片。
2. 二维码是实心白底，没有透出后面的内容。
3. 「联系我们」标题与「打开微信扫一扫，添加联系人」清晰可读。
4. 遮罩层仍然把背景压暗并模糊。

按 Esc 关闭，确认关闭动画正常。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/layout/LightContactModal.tsx
git commit -m "feat(website): 联系浮层面板改为 glass-thick

二维码容器保持实心白，避免半透背景影响扫码识别。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

# 阶段三：内容卡

风险最高的一段。12 张卡同屏、3D 变换、framer-motion 动画三者叠加，且现有的暗面逻辑必须重做。

---

### Task 10: 12 张服务卡改玻璃，暗面重做

**Files:**
- Modify: `website/src/components/pages/home/ServiceTypes.tsx:53-58`（`STAGE` 的 dim 值）
- Modify: `website/src/components/pages/home/ServiceTypes.tsx:342-347`（卡面 className）
- Modify: `website/src/components/pages/home/ServiceTypes.tsx:395-404`（暗面层）

**Interfaces:**
- Consumes: `glass-thin`（Task 1）、无 mask 的轨道（Task 4）、冷蓝光团（Task 2/3）
- Produces: 无

- [ ] **Step 1: 卡面换 glass-thin**

把卡面 div 的 className 从：

```tsx
                  className={[
                    'group/card relative flex h-full w-full flex-col overflow-hidden rounded-[3px] bg-paper-raised p-5 shadow-soft-lg sm:p-6',
                    'transition-transform duration-300 ease-out',
                    isActive ? 'hover:scale-[1.04]' : 'cursor-pointer hover:scale-[1.09]',
                  ].join(' ')}
```

改为：

```tsx
                  className={[
                    'group/card glass-thin relative flex h-full w-full flex-col overflow-hidden rounded-[3px] p-5 sm:p-6',
                    'transition-transform duration-300 ease-out',
                    isActive ? 'hover:scale-[1.04]' : 'cursor-pointer hover:scale-[1.09]',
                  ].join(' ')}
```

（`bg-paper-raised` 与 `shadow-soft-lg` 去掉，均由 `glass-thin` 提供。）

- [ ] **Step 2: 暗面层从盖黑改为盖冷灰**

把暗面层从：

```tsx
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-graphite opacity-[var(--dim)] transition-opacity duration-300 ease-out group-hover/card:opacity-[var(--dim-hover)]"
                  style={
                    {
                      '--dim': stage.dim,
                      '--dim-hover': stage.dim * 0.3,
                    } as React.CSSProperties
                  }
                />
```

改为：

```tsx
                {/* 暗面：卡面转开多少就压暗多少，模拟受光。压在内容之上而不是之下，
                    否则文字仍然是纯黑、只有纸面变暗，看着像蒙了层脏东西。
                    悬停时收掉大半，等于「这一面转回来朝向你了」。

                    颜色是冷灰而不是近黑：卡面改成玻璃之后，近黑蒙层叠在半透明面上
                    会把透上来的底光一起压死，侧卡看起来像蒙了灰。冷灰蒙层压的是
                    明度、留得住色相，转开的面仍然带着底光的调子。 */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out group-hover/card:opacity-[var(--dim-hover)]"
                  style={
                    {
                      backgroundColor: 'rgb(108 118 138)',
                      opacity: 'var(--dim)',
                      '--dim': stage.dim,
                      '--dim-hover': stage.dim * 0.3,
                    } as React.CSSProperties
                  }
                />
```

- [ ] **Step 3: 重调 STAGE 的 dim 起始值**

玻璃卡本身比实心白卡读起来更暗，原来的 dim 值会压过头。把 `STAGE` 改为：

```tsx
const STAGE = [
  { x: 0, z: 0, rotate: 0, scale: 1, dim: 0, opacity: 1 },
  { x: 0.97, z: -150, rotate: 36, scale: 0.9, dim: 0.1, opacity: 1 },
  { x: 1.71, z: -260, rotate: 40, scale: 0.84, dim: 0.17, opacity: 1 },
  { x: 2.35, z: -400, rotate: 46, scale: 0.76, dim: 0.22, opacity: 0 },
]
```

同时在 `STAGE` 上方那段注释里，把描述 dim 的那一段补一句：

```
 * dim 的数值在卡面改成玻璃后重调过一轮：玻璃卡本身读起来就比实心白卡暗一档，
 * 沿用实心时代的 0.16 / 0.26 / 0.32 会把侧卡压成灰片。
```

- [ ] **Step 4: 类型检查与 lint**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

Expected: 无错误输出。

- [ ] **Step 5: 截图核对轮播**

滚到服务区截图（脚本同 Task 3 Step 7 第二段）。核对五条：

1. 中心卡明显是玻璃：能看出透光，不是一块实心白板。
2. 左右侧卡有前后层次，没有糊成一片分不出远近。
3. 侧卡是冷灰调而不是灰扑扑的脏色。
4. 卡内标题、钩子句、三条要点全部可读。
5. ~~卡片之间叠压处，后方卡透过前方卡是柔和的形体，不是能认出的文字。~~
   **此条作废。** 它是照着改造前的一个实验写的，那个实验里卡片前后叠压；当前 `STAGE.x` 的几何下，
   静止时相邻卡之间有 29–39px 间隙，并不重叠，这条判据没有可验证对象。改造前实测得出的
   「卡片自己就是彼此的背景」这一设想在当前布局下不成立——玻璃的采样对象只有底层光域。

任一条不满足，按下面顺序调整并重新截图：先调 `STAGE` 的 dim，再调 `glass-thin` 的白度（`0.44` 上下浮动 `0.04`），再调 `AuroraField` 里服务区那团冷蓝的 alpha，最后才动 blur 半径。

**Task 3 遗留下来、必须在本任务一并解决的两件事**（当时光域已挂上但还没有玻璃，无法判断，故推迟至此）：

1. **服务区冷蓝偏弱。** 桌面端 `rgb(30 120 240 / 0.24)` 在没有玻璃时读起来接近中性灰。改造前的实测结论是：0.20 的光配 64% 玻璃完全看不出，0.40 的光配 44% 玻璃成立。现在是 0.24 配 44%，落在两者之间，需要在本任务里靠截图定夺。若卡片上看不出冷调，把该团 alpha 往 `0.34` 提，逐步试，不要一次跳到 0.40 以上——那是在深色实验里的值，浅底上会显脏。
2. **窄屏服务区完全没有光。** 光团纵向位置用的是页高百分比，锚点按桌面端实测（服务区占 29%–62%）定的；移动端各板块堆叠后更高，`top-[38%]` 落到了服务区之外。本任务的窄屏截图核对必须包含这一条。修法二选一，选定后在 `AuroraField` 注释里写明原因：
   - 给服务区那团加一组 `sm:` 之前的移动端专用 `top` 值（改动最小，但等于承认百分比锚点在两种断点下要各调一次）
   - 或把该团从页面级百分比定位改为跟随 `#services` 板块定位（更稳，但要把这一团从 `AuroraField` 挪进 `ServiceTypes`，破坏「光域集中在一处」的结构）

- [ ] **Step 6: 悬停与翻页交互核对**

```js
async () => {
  const cards = [...document.querySelectorAll('div')].filter(el =>
    typeof el.className === 'string' && el.className.includes('group/card'));
  const target = cards[0];
  target.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  await new Promise(r => setTimeout(r, 500));
  return 'hovered';
}
```

截图核对：被悬停的侧卡暗面收掉大半、亮起来，像转回来朝向观者。

再点一次翻页钮截图，确认翻页动画正常、玻璃在动画过程中不闪烁。

- [ ] **Step 7: 提交**

```bash
git add website/src/components/pages/home/ServiceTypes.tsx
git commit -m "feat(website): 12 张服务卡改为 glass-thin，暗面重做

暗面从近黑改为冷灰：近黑蒙层叠在玻璃上会把透上来的底光压死。
STAGE 的 dim 值随之重调一轮。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: 轮播性能实测与按需降级

**Files:**
- Modify: `website/src/components/pages/home/ServiceTypes.tsx`（仅在实测确认掉帧时才改）

**Interfaces:**
- Consumes: Task 10 的玻璃卡
- Produces: 无

- [ ] **Step 1: 录一次轮播的 Performance trace**

用 chrome-devtools MCP：

```
performance_start_trace  → reload: false, autoStop: false
```

然后执行：

```js
async () => {
  const s = document.getElementById('services');
  window.scrollTo(0, window.scrollY + s.getBoundingClientRect().top - 60);
  await new Promise(r => setTimeout(r, 6000));
  return 'recorded';
}
```

```
performance_stop_trace
```

- [ ] **Step 2: 判读结果**

看 trace 里轮播自动播放期间的帧率。判据：

- 平均帧率 ≥ 50fps → 不需要降级，直接跳到 Step 4。
- 平均帧率 < 50fps 或出现明显长帧 → 执行 Step 3。

- [ ] **Step 3: 只给可见卡开真 blur（仅在需要时执行）**

`glass-thin` 保留在 className 上不动，另外用内联样式覆盖不可见卡的 `backdrop-filter`。目标是 Task 10 Step 1 改过的那个 `group/card glass-thin ...` 卡面 div（不是外层带 `motion.div` 位姿的那一层），给它追加 `style`：

```tsx
                  style={
                    // 只有环形距离 ≤ 2 的五张卡在舞台上可见，其余七张开 backdrop-filter
                    // 是纯粹的浪费：每帧都要重算一次背景模糊，却压根没人看得到。
                    // 用不透明度更高的纯色顶上，避免它们在绕场换位时闪一下。
                    distance <= 2
                      ? undefined
                      : {
                          backdropFilter: 'none',
                          WebkitBackdropFilter: 'none',
                          background: 'rgba(255, 255, 255, 0.7)',
                        }
                  }
```

改完重新录一次 trace，确认帧率达标。

- [ ] **Step 4: 记录结论并提交**

无论是否降级，都在 `ServiceTypes.tsx` 的 `STAGE` 注释区补一行实测结论，例如：

```
 * 性能实测（2026-08-12，1440×900）：12 张玻璃卡同屏自动播放平均 XXfps，[未做/已做]降级。
```

```bash
git add website/src/components/pages/home/ServiceTypes.tsx
git commit -m "perf(website): 轮播玻璃卡性能实测与结论记录

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: 可读性回归与收尾

**Files:**
- Modify: `website/src/app/globals.css`（仅在对比度不达标时调 `--color-graphite-dim`）

**Interfaces:**
- Consumes: 前面全部任务
- Produces: 无

- [ ] **Step 1: 量关键文字的实际对比度**

玻璃叠在光域之上，`getComputedStyle` 拿到的 `backgroundColor` 是玻璃自身的半透明值，不是屏幕上真正的背景色，直接拿它算对比度会得到偏乐观的结果。下面的脚本按层合成出实际背景再算。

> **执行前必须修正脚本的两处缺陷**（首次执行时踩过，记录在此避免重蹈）：
>
> 1. **不要用光团的峰值 alpha。** `radial-gradient(ellipse at center, ..., transparent 68%)` 是从中心线性衰减到 0 的，再叠 90px 模糊，文字根本不在峰值上。按椭圆归一化距离实测：服务区光团峰值 0.34，但中心卡三条要点所在位置的实际 alpha 只有 **0.135 / 0.096 / 0.056**，卡片几何中心也只有 0.24。用峰值算会把背景压得过暗，逼出一个过深的文字色、压平字阶。取样用 **0.135**（要点位置里最不利的一条）。
> 2. **不要用 `document.querySelector('#services li')` 取样。** 它取的是 DOM 顺序第一个 li，那是一张**侧卡**（实测 x=1338，视口中心 720），不是视觉上的中心卡。改为按到视口水平中心的距离排序取最近的：
>
> ```js
> const vcx = window.innerWidth / 2;
> const li = [...document.querySelectorAll('#services li')]
>   .map(el => ({ el, r: el.getBoundingClientRect() }))
>   .filter(o => o.r.width > 0)
>   .sort((a, b) => Math.abs(a.r.left + a.r.width/2 - vcx) - Math.abs(b.r.left + b.r.width/2 - vcx))[0].el;
> ```

滚到服务区后执行：

```js
() => {
  // WCAG 相对亮度
  const lum = ([r, g, b]) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  // src 以 alpha 叠在 dst 上
  const over = (src, alpha, dst) => dst.map((d, i) => alpha * src[i] + (1 - alpha) * d);
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  const parse = (css) => css.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number);

  const PAPER = [247, 247, 245];          // --color-paper
  const AURORA_BLUE = [30, 120, 240];     // 服务区光团，峰值 alpha 0.24
  const AURORA_ORANGE = [255, 88, 36];    // 首屏/页脚光团，峰值 alpha 0.26
  const WHITE = [255, 255, 255];

  // 背景 = 光叠在纸上，再叠一层玻璃白
  const bg = (aurora, auroraAlpha, glassAlpha) =>
    over(WHITE, glassAlpha, over(aurora, auroraAlpha, PAPER));

  const samples = [
    { name: '卡内要点小字', sel: '#services li', bg: bg(AURORA_BLUE, 0.24, 0.44), min: 4.5 },
    { name: '卡内钩子句', sel: '#services p', bg: bg(AURORA_BLUE, 0.24, 0.44), min: 4.5 },
    { name: '导航链接', sel: 'header nav a', bg: bg(AURORA_ORANGE, 0.26, 0.62), min: 4.5 },
    { name: '页脚备案号', sel: 'footer a', bg: bg(AURORA_ORANGE, 0.26, 0.62), min: 4.5 },
    { name: '能力条文字', sel: 'section a[href], section span', bg: bg(AURORA_ORANGE, 0.26, 0.62), min: 4.5 },
  ];

  return samples.map((s) => {
    const el = document.querySelector(s.sel);
    if (!el) return { ...s, error: '未找到元素' };
    const cs = getComputedStyle(el);
    const fg = parse(cs.color);
    const r = ratio(fg, s.bg.map(Math.round));
    return {
      name: s.name,
      size: cs.fontSize,
      color: cs.color,
      contrast: Number(r.toFixed(2)),
      pass: r >= s.min,
    };
  });
}
```

判据：所有 `pass` 为 `true`。装饰性文字（`SECTIONS` / `SERVICES` 这类 eyebrow）不在取样表内，它们只需 ≥ 3:1，肉眼确认可辨即可。

任一项 `pass` 为 `false` 时执行 Step 2；全部通过则跳到 Step 3。

- [ ] **Step 2: 不达标时加深 graphite-dim（仅在需要时执行）**

把 `website/src/app/globals.css` 中：

```css
  --color-graphite-dim: #8a8a80;
```

改为：

```css
  /* 玻璃改造后加深：44% 白度的玻璃叠在冷蓝光域上，原来的 #8a8a80 压 12.5px 小字
     只有 3.06:1，远低于 WCAG 对正文的 4.5:1。
     取值依据是实测而非峰值估算——服务区光团 alpha 0.34 只存在于渐变中心，
     按椭圆归一化距离算，中心卡三条要点所在位置的实际 alpha 是 0.135/0.096/0.056，
     卡片几何中心也只有 0.24。#64645b 在这两个位置分别是 5.25:1 和 4.86:1，
     都过 4.5 且留有余量；再深（如 #5c5c54 的 5.92:1）会把「钩子句 > 要点」的
     字阶压平，得不偿失。 */
  --color-graphite-dim: #64645b;
```

**注意：初版计划这里写的是 `#78786e`，那个值不够**——按实测 alpha 只有 3.92:1，仍不达标。
它是照着峰值估算反推的，与上面 Step 1 那两处缺陷同源。实际取值为 `#64645b`。

各候选值在两个实测位置的对比度（供后续调整参考）：

| 候选 | 要点位置 a=0.135 | 卡中心 a=0.24 |
|---|---|---|
| `#8a8a80`（原值） | 3.06 | 2.84 |
| `#78786e`（初版计划值） | 3.92 | 3.63 |
| `#6b6b62` | 4.72 | 4.38 |
| **`#64645b`（采用）** | **5.25** | **4.86** |
| `#5c5c54` | 5.92 | 5.49 |

改完重新执行 Step 1 核算，并全站截图确认没有别处因此变得过重，尤其看「钩子句 > 要点」的字阶是否还在。

- [ ] **Step 2.5: 清理前序任务累积的三条注释/结构漂移**

这三条在各自任务的评审里被记为 deferred minor，统一在收尾时处理：

1. `website/src/components/layout/AuroraField.tsx` 文件顶部的长注释里，「纵向位置按页高百分比给出，锚点取自首页实测：
   首屏 65–625、能力条 625–784、服务 784–1674、流程 1674–2526、页脚 2526–2690」这段现在不准确了——
   服务区那一团在 Task 10 改成了两个断点各给一次锚点。补一句说明窄屏的实测值（页高 3673、服务区中心 28.1%），
   并指出服务区是唯一需要分断点锚定的一团。

2. `website/src/components/layout/LightShell.tsx` 的文件级注释「浅色站点的共用外壳：导航、底部 CTA、页脚、
   咨询弹窗，以及弹窗开关的唯一持有者」没有把新增的光域层挂载点写进职责枚举。补上。

3. `website/src/components/layout/LightFooter.tsx` 里为放置 JSX 注释新增了 Fragment 包裹。把注释移到
   `return` 语句之上，去掉 Fragment——它不产生 DOM 节点，但没有存在的必要。

- [ ] **Step 3: 全站回归截图**

依次截图并核对，任一处异常则回到对应任务修正：

1. `http://localhost:3100/` 首屏
2. 同页能力条
3. 同页服务轮播
4. 同页流程区（近黑面板应完全未受影响）
5. 同页页脚
6. 联系浮层打开态
7. `http://localhost:3100/cases` 全页
8. `http://localhost:3100/nonexistent.html`（带扩展名的路径才走得到 404 页，不被 middleware 307 回首页）——该页不套 `LightShell`，因此没有光域和玻璃，只需确认「回到首页」按钮仍是黑底 primary、未受 Task 7 的 secondary 改动波及
9. 窄屏 390×844 下的首页首屏与服务区

- [ ] **Step 4: 确认深色页面未受波及**

```bash
cd website && git diff main --stat -- src/ | grep -v "layout/Light\|layout/Aurora\|pages/home\|pages/cases\|ui/Button\|app/globals.css" || echo "改动范围正确"
```

Expected: 输出 `改动范围正确`。若列出了其他文件，说明误改，需回退。

再确认深色 token 与深色 glass 未被动过：

```bash
cd website && git diff main -- src/app/globals.css | grep -E "^-" | grep -E "color-ink|color-canvas|color-surface|color-hairline|rgba\(18, 18, 18" || echo "深色 token 未被修改"
```

Expected: 输出 `深色 token 未被修改`。

- [ ] **Step 5: 最终检查与提交**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

Expected: 两条命令均无错误输出。

```bash
git add -A website/src
git commit -m "feat(website): 玻璃改造可读性回归与收尾

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

## 完成判据

全部任务完成后，以下条件必须同时成立：

- `npx tsc --noEmit` 与 `pnpm run lint` 均通过。
- 首页五个板块、案例页、联系浮层、窄屏视图截图核对全部通过。
- 服务轮播自动播放平均帧率 ≥ 50fps（或已按 Task 11 降级后达标）。
- 关键文字对比度达标（12–13px 小字 ≥ 4.5:1）。
- `git diff` 显示改动仅落在 `layout/Light*`、`layout/AuroraField`、`pages/home`、`pages/cases`、`ui/Button`、`app/globals.css` 范围内。
- `globals.css` 中深色 token 与 `@utility glass` 未被修改。
- `ServiceFlow` 的近黑面板视觉上完全未变。
