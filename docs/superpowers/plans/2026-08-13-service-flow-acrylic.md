# 服务流程手风琴 Acrylic 质感改造实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把首页服务流程七步手风琴从近黑实心面板改造成 Windows 11 Acrylic 风格的毛玻璃器物，并补齐版式与四项动效。

**Architecture:** 在 `globals.css` 新增两档 Acrylic utility 作为全站唯一来源；`ServiceFlow.tsx` 的七个 `li` 分别套用深/浅两档，`ul` 只作圆角与阴影容器（绝不能开 `backdrop-filter`）；`AuroraField` 流程区光团提亮为玻璃提供采样对象。

**Tech Stack:** Next.js 15.5 / React / Tailwind CSS v4（`@utility` 语法）/ 原生 CSS transition，不引入动画库。

**Spec:** `docs/superpowers/specs/2026-08-13-service-flow-acrylic-design.md`

## Global Constraints

- **验证方式替代 TDD**：项目 CLAUDE.md 规定「前端不要求编写组件级测试，前端改动必须至少通过页面运行、关键交互或浏览器日志验证」。因此每个任务的循环是**改 → 截图 → 核对 → 提交**，不写组件单测。
- **禁止各 section 自行发明玻璃参数**（`globals.css:187`）。所有玻璃参数只能来自 `globals.css` 的 utility。
- **不得修改** `@utility glass`（`globals.css:178`），它供已隐藏的深色页面使用。
- **`ul` 绝不能开 `backdrop-filter`**：父级一旦有它就成为子元素的 backdrop root，七个 `li` 的玻璃全部失效（同类事故见 `ServiceTypes.tsx:264`）。
- **不跑 `next build`**：该项目实测 build 会挂掉正在运行的 dev server，且 standalone 输出在 Windows 必 EPERM 失败。
- **dev server 端口 3100**（用户已在运行）。不要另起 3000，那是后端 uvicorn。
- 复杂逻辑与非显然设计必须写**中文注释**；不为简单赋值写低价值注释。
- 橙色配额只留给「免费」标记，新增元素一律不得用 `text-ember` / `bg-ember`。

---

### Task 1: 外形对齐与光域提亮

先做这一步是因为它不依赖玻璃，且能独立验证光团提亮的效果——玻璃是否有东西可采样，取决于这一步。

**Files:**
- Modify: `website/src/components/layout/AuroraField.tsx`（流程区光团 alpha）
- Modify: `website/src/components/pages/home/ServiceFlow.tsx`（`ul` 的圆角、阴影、高度）

**Interfaces:**
- Consumes: 无
- Produces: `ul` 具备 `rounded-card` + `shadow-soft-lg` + `h-[32rem]`；流程区光团 alpha 为 `0.22`。Task 2 的玻璃依赖这个光团。

- [ ] **Step 1: 提亮流程区光团**

在 `AuroraField.tsx` 中找到「流程区：淡紫」那一团，把 alpha 从 `0.16` 改为 `0.22`：

```tsx
background:
  'radial-gradient(ellipse at center, rgb(150 105 240 / 0.22), transparent 70%)',
```

同时把该团上方的注释改为（原注释说「强度压到最低，这一区主体是近黑面板」，已不成立）：

```tsx
{/* 流程区：淡紫。手风琴改成 Acrylic 玻璃后，这团光是深面板唯一的采样对象——
    真玻璃只搬运背后的信息，alpha 压回 0.16 会让 backdrop-filter 变成零效果。
    但也不能提到服务区蓝那一档（0.34）：深玻璃的 saturate 会把透过来的紫再加浓一档，
    到那个强度面板边缘会泛出脏色。0.22 只做色温底噪，明暗结构交给面板内部的渐层光。 */}
```

- [ ] **Step 2: 改 `ul` 的外形与高度**

在 `ServiceFlow.tsx` 中把 `ul` 的 className 从：

```tsx
className="hidden h-[30rem] overflow-hidden rounded-[3px] border border-rule lg:flex"
```

改为：

```tsx
className="hidden h-[32rem] overflow-hidden rounded-card border border-rule shadow-soft-lg lg:flex"
```

在 `ul` 上方补一条中文注释：

```tsx
{/* 这一层只负责圆角、描边、投影，绝不能加 backdrop-filter——父级一旦有它就会成为
    子元素的 backdrop root，七条 li 的玻璃会全部失效（同类事故见 ServiceTypes 的 maskImage）。
    高度 32rem 而非 30rem：图标放大到 h-36 后，最长的第 06 步文案在 30rem 下会溢出 11px。 */}
```

- [ ] **Step 3: 截图核对**

用 chrome-devtools 打开 `http://localhost:3100/#process`，`resize_page` 到 1440×900，滚到板块后截图。

预期：整块手风琴有大圆角和浮起的软阴影；背后紫光比改动前明显。
此时面板仍是近黑实心，玻璃尚未接入——这是正常的。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/layout/AuroraField.tsx website/src/components/pages/home/ServiceFlow.tsx
git commit -m "feat(website): 流程区外形对齐设计系统并提亮光团

为 Acrylic 玻璃改造做准备：ul 改用 rounded-card + shadow-soft-lg，
高度提到 32rem 容纳放大后的图标；流程区光团 0.16→0.22 提供采样对象。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: 新增两档 Acrylic utility 并接入七条竖条

**Files:**
- Modify: `website/src/app/globals.css`（在浅色三档之后新增两档）
- Modify: `website/src/components/pages/home/ServiceFlow.tsx`（`li` 的背景类与过渡属性）

**Interfaces:**
- Consumes: Task 1 的光团 `0.22`
- Produces: utility 类名 `glass-acrylic`（浅色，折叠条）与 `glass-acrylic-dark`（深色，展开面板）。Task 5 的悬停提亮依赖 `glass-acrylic` 的 `background-color` 可被 Tailwind 任意值覆盖这一点。

- [ ] **Step 1: 在 `globals.css` 新增两档 utility**

插入到 `@utility glass-thick { … }` 之后、`@utility scrollbar-hide` 之前：

```css
/* ===== Acrylic：两档深浅毛玻璃 =====
   供首页服务流程手风琴使用。与上面三档的区别只有一处——多一层噪点。
   噪点是「毛」感的唯一来源：只有半透明底色与模糊的话，得到的是透明塑料而不是磨砂玻璃。

   Windows 11 Acrylic 的配方是四层：背景模糊 → 亮度层 → 色调层 → 噪点纹理。
   CSS 没有与 luminosity blend 直接对应的能力，这里用色调层 + saturate 近似，
   因此结果是接近而非像素级一致。

   噪点通过多重 background + background-blend-mode 实现，不引入任何额外 DOM 节点。
   图案沿用 noise-layer 的 feTurbulence 参数，但强度必须大幅调低——noise-layer 的
   0.35 是给别处用的，Acrylic 的噪点只有 2-4%，直接套会变成砂纸。

   两档都不含外投影，也不含 border：这七条嵌在 overflow-hidden 的 ul 内部，
   外投影会被直接裁掉；描边由组件的 border-l 分隔线承担，utility 再加一层会成双线。
   这是相对上面三档「四项配套」的有意偏离，原因是使用场景不同，不是遗漏。 */
@utility glass-acrylic {
  background:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><filter id='ac'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.16 0'/></filter><rect width='100%' height='100%' filter='url(%23ac)' opacity='0.5'/></svg>")
      repeat,
    rgba(255, 255, 255, 0.5);
  background-blend-mode: overlay, normal;
  backdrop-filter: saturate(180%) blur(30px);
  -webkit-backdrop-filter: saturate(180%) blur(30px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    inset 0 -1px 0 rgba(14, 14, 14, 0.04);

  @media (prefers-reduced-transparency: reduce) {
    background: rgba(255, 255, 255, 0.94);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}

@utility glass-acrylic-dark {
  background:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><filter id='ad'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.22 0'/></filter><rect width='100%' height='100%' filter='url(%23ad)' opacity='0.5'/></svg>")
      repeat,
    rgba(14, 14, 14, 0.82);
  background-blend-mode: overlay, normal;
  /* saturate 取 150% 而非浅色档的 180%：深底上放大色彩更容易发脏 */
  backdrop-filter: saturate(150%) blur(30px);
  -webkit-backdrop-filter: saturate(150%) blur(30px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.14),
    inset 0 -1px 0 rgba(0, 0, 0, 0.5);

  @media (prefers-reduced-transparency: reduce) {
    background: rgba(14, 14, 14, 0.97);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

- [ ] **Step 2: 把两档接到 `li` 上**

在 `ServiceFlow.tsx` 中，把 `li` 的 className 从：

```tsx
className={[
  'relative min-w-0 overflow-hidden border-l border-rule first:border-l-0',
  open ? 'bg-graphite' : 'bg-paper-raised',
].join(' ')}
```

改为：

```tsx
className={[
  'group relative min-w-0 overflow-hidden border-l border-rule first:border-l-0',
  open ? 'glass-acrylic-dark' : 'glass-acrylic',
].join(' ')}
```

`group` 是给 Task 5 的悬停微反馈用的，这里一并加上。

- [ ] **Step 3: 扩展 `li` 的过渡属性，让深浅玻璃切换不跳变**

深浅两档之间切换的是 class，`background-color`、`box-shadow`、`backdrop-filter` 三者都需要显式声明过渡才会平滑插值（`backdrop-filter` 两档的函数列表同构，`saturate` + `blur` 都在，可插值）。

把 `li` style 里的 transition 数组从：

```tsx
transition: [
  `flex ${PANEL_MS}ms ${PANEL_EASE}`,
  `background-color ${PANEL_MS}ms ${PANEL_EASE}`,
  `opacity ${enterMs}ms ease-out ${reduce ? 0 : index * ENTER_STEP_MS}ms`,
  `transform ${enterMs}ms ${PANEL_EASE} ${reduce ? 0 : index * ENTER_STEP_MS}ms`,
].join(', '),
```

改为：

```tsx
// 深浅两档玻璃之间切换的是 class，这三个属性必须各自声明过渡才会插值而不是跳变。
// backdrop-filter 两档的函数列表同构（都是 saturate + blur），可以平滑插值。
transition: [
  `flex ${PANEL_MS}ms ${PANEL_EASE}`,
  `background-color ${PANEL_MS}ms ${PANEL_EASE}`,
  `box-shadow ${PANEL_MS}ms ${PANEL_EASE}`,
  `backdrop-filter ${PANEL_MS}ms ${PANEL_EASE}`,
  `-webkit-backdrop-filter ${PANEL_MS}ms ${PANEL_EASE}`,
  `opacity ${enterMs}ms ease-out ${reduce ? 0 : index * ENTER_STEP_MS}ms`,
  `transform ${enterMs}ms ${PANEL_EASE} ${reduce ? 0 : index * ENTER_STEP_MS}ms`,
].join(', '),
```

- [ ] **Step 4: 截图核对玻璃与噪点**

截图后放大观察展开面板与折叠条。预期：面板不再是平涂死黑，能看到颗粒感与上缘高光；折叠条呈半透明，背后紫光的色温可辨。

- [ ] **Step 5: 调噪点强度（这一步必须做，不能跳过）**

噪点强度靠手感，纸上定不准。对比截图判断：
- 颗粒明显到像砂纸 → 调低两个 utility 里 `feColorMatrix` 的 alpha（第四行第四个值，当前浅色 `0.16` / 深色 `0.22`）
- 完全看不出颗粒、和普通半透明无区别 → 调高

每次调整后重新截图，直到深色面板上能看出细腻颗粒但不刺眼为止。把最终值连同「调过一轮」的结论写进 utility 注释。

- [ ] **Step 6: 提交**

```bash
git add website/src/app/globals.css website/src/components/pages/home/ServiceFlow.tsx
git commit -m "feat(website): 新增两档 Acrylic 毛玻璃并接入服务流程手风琴

噪点通过多重 background + background-blend-mode 实现，不加额外 DOM。
深浅两档切换需显式声明 background-color/box-shadow/backdrop-filter 过渡才不跳变。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: 版式改造——图标放大当主角

**Files:**
- Modify: `website/src/components/pages/home/ServiceFlow.tsx`（`ExpandedFace` 与窄屏列表的图标尺寸）

**Interfaces:**
- Consumes: Task 1 的 `h-[32rem]` 容器高度
- Produces: `ExpandedFace` 内图标为 `h-36` 且带背光层。Task 4 的分层进场把这个背光层与图标视为同一级。

- [ ] **Step 1: 放大图标并加背光**

`StepDiagram` 的 viewBox 是 `200×132`、`stroke-width: 1.5`。`h-16`(64px) 时缩放比 0.485，线宽实际只有 0.73px——这是它显得单薄的根因。`h-36`(144px) 时缩放比 1.09，线宽约 1.64px，不改 SVG 本体即有分量。

把 `ExpandedFace` 里的这一行：

```tsx
<StepDiagram code={step.code} className="mb-6 h-16 w-auto text-paper/70" />
```

替换为：

```tsx
{/* 图标放大到 h-36 当主角，但不从标题组里拆出去单独居中——
    单独居中会让它悬在半空、和文字断开（这一条是之前踩过的）。
    背光让它在深玻璃上像个发光体，而不是贴上去的线框贴纸。 */}
<div className="relative mb-6 w-fit">
  <span
    aria-hidden
    className="pointer-events-none absolute -inset-8 rounded-full"
    style={{
      background:
        'radial-gradient(circle at 50% 50%, rgb(200 215 255 / 0.10), transparent 70%)',
    }}
  />
  <StepDiagram code={step.code} className="relative h-36 w-auto text-paper/75" />
</div>
```

- [ ] **Step 2: 窄屏图标同步放大**

窄屏列表保持朴素列表形态不做玻璃，但图标同步放大一档。把窄屏 `ol` 内的：

```tsx
<StepDiagram code={step.code} className="h-12 w-auto shrink-0 text-graphite-dim" />
```

改为：

```tsx
<StepDiagram code={step.code} className="h-16 w-auto shrink-0 text-graphite-dim" />
```

- [ ] **Step 3: 逐条截图核对是否溢出（这一步必须做）**

高度核算是按字号行高推算的：顶部编号组 35 + 图标 144 + 间距 24 + 标题 34 + 间距 12 + 最长文案 162 = 411px，可用高 432px，余量 21px。中文换行受字重与标点影响，算得再准也得看。

用 chrome-devtools 依次点击七条竖条，每条截一张图，确认：
- 正文没有被面板底边裁切
- 图标没有和顶部编号组挤在一起

第 06 步文案最长（约 150 字），是最容易溢出的一条，重点看它。

若有溢出：优先把图标降到 `h-32`(128px)，而不是缩小正文字号——正文是 `14.5px`，再小会掉到舒适阅读线以下。

- [ ] **Step 4: 提交**

```bash
git add website/src/components/pages/home/ServiceFlow.tsx
git commit -m "feat(website): 流程图标放大当主角并加背光

h-16 时 stroke 实际只有 0.73px，是图标单薄的根因；h-36 时约 1.64px。
图标仍与标题同组，不单独居中。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: 动效——内容分层进场 + 光随展开流动

**Files:**
- Modify: `website/src/components/pages/home/ServiceFlow.tsx`（`ExpandedFace` 组件签名与光层）

**Interfaces:**
- Consumes: Task 3 的图标背光层结构
- Produces: `ExpandedFace` 新增 `reduce: boolean` prop；新增模块级常量 `LAYER_STEP_MS = 55`；`PANEL_GLOW` 值被替换。Task 5 不依赖本任务产物。

- [ ] **Step 1: 增强面板内部渐层光**

方案 B 中，面板内部的渐层光负责主要明暗结构，透光只做色温底噪。当前 `PANEL_GLOW` 的 alpha `0.085` 渲染后不可见。

把 `PANEL_GLOW` 常量及其注释替换为：

```tsx
/**
 * 展开面板内部的渐层光。落点压在图标与标题那一组上，让深玻璃有一处亮起来的地方。
 *
 * 方案 B 的分工：背后透进来的紫光只做色温底噪，明暗结构由这一层负责，
 * 所以强度比改造前（0.085，实际渲染不可见）显著提高。
 * 色相取极淡的冷白偏蓝，与背后透过来的紫属同一冷色族，叠加不会泛脏色。
 */
const PANEL_GLOW =
  'radial-gradient(70% 60% at 26% 62%, rgb(190 210 255 / 0.14), transparent 72%)'
```

- [ ] **Step 2: 让光随展开流动**

把 `li` 内那个光层 `span` 的整段替换为：

```tsx
{/* 底光挂在 li 上而不是面板内容里：内容宽度写死 34rem，光晕跟着它会在
    过渡途中被裁出一道硬边；挂在这里则始终铺满当前宽度，随伸缩自然缩放。
    scaleX 与 flex 共用同一组时长和缓动，否则光会跟不上面板边缘。 */}
<span
  aria-hidden
  className="pointer-events-none absolute inset-0"
  style={{
    backgroundImage: PANEL_GLOW,
    opacity: open ? 1 : 0,
    transform: open ? 'scaleX(1)' : 'scaleX(0.55)',
    transformOrigin: 'left',
    transition: reduce
      ? 'none'
      : [
          `opacity ${open ? 600 : 200}ms ease-out`,
          `transform ${PANEL_MS}ms ${PANEL_EASE}`,
        ].join(', '),
  }}
/>
```

- [ ] **Step 3: 新增分层进场常量**

在 `CONTENT_DELAY_MS` 常量下方加：

```tsx
/** 面板内容逐级进场的级间隔。五级（编号→短线→图标→标题→正文）共 220ms，收得住 */
const LAYER_STEP_MS = 55
```

- [ ] **Step 4: 改造 `ExpandedFace` 为分层进场**

把整个 `ExpandedFace` 组件替换为：

```tsx
/** 展开面板：顶部编号，底部「图标 → 标题 → 正文」一组，五级逐级进场 */
const ExpandedFace = ({
  step,
  open,
  reduce,
}: {
  step: EngagementStep
  open: boolean
  reduce: boolean
}) => {
  /**
   * 逐级进场。收起时刻意不错开、200ms 齐落：错开只在展开时是「层次展开」，
   * 收起时会变成拖沓的余音。
   */
  const layer = (index: number) => {
    if (reduce) return { opacity: open ? 1 : 0 }
    const delay = CONTENT_DELAY_MS + index * LAYER_STEP_MS
    return {
      opacity: open ? 1 : 0,
      transform: open ? 'none' : 'translateY(10px)',
      transition: open
        ? [
            `opacity 420ms ease-out ${delay}ms`,
            `transform 420ms ${PANEL_EASE} ${delay}ms`,
          ].join(', ')
        : 'opacity 200ms ease-out, transform 200ms ease-out',
    }
  }

  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between p-10"
      style={{ width: PANEL_CONTENT_WIDTH }}
    >
      <div>
        <p
          className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-paper/45"
          style={layer(0)}
        >
          STEP {step.code} / {TOTAL}
          {step.tag && (
            <>
              <span aria-hidden className="h-3 w-px bg-paper/20" />
              <span className="tracking-[0.1em] text-ember">{step.tag}</span>
            </>
          )}
        </p>
        {/* 编号下一条短横线：顶部原本只有孤零零一行小字，加条线才压得住这片留白 */}
        <span
          aria-hidden
          className="mt-5 block h-px w-10 bg-paper/25"
          style={layer(1)}
        />
      </div>

      <div className="max-w-[25rem]">
        {/* 图标放大到 h-36 当主角，但不从标题组里拆出去单独居中——
            单独居中会让它悬在半空、和文字断开（这一条是之前踩过的）。 */}
        <div className="relative mb-6 w-fit" style={layer(2)}>
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-8 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgb(200 215 255 / 0.10), transparent 70%)',
            }}
          />
          <StepDiagram code={step.code} className="relative h-36 w-auto text-paper/75" />
        </div>
        <h3
          className="text-[1.65rem] font-semibold leading-[1.3] tracking-[-0.02em] text-paper"
          style={layer(3)}
        >
          {step.title}
        </h3>
        <p className="mt-3 text-[14.5px] leading-[1.85] text-paper/65" style={layer(4)}>
          {step.lead}
        </p>
      </div>
    </div>
  )
}
```

注意外层容器已去掉原来的 `transition-opacity` 与 `opacity-*` 类：整体淡入与逐级进场同时存在会互相打架。

- [ ] **Step 5: 传入 `reduce`**

在 `li` 内找到 `<ExpandedFace step={step} open={open} />`，改为：

```tsx
<ExpandedFace step={step} open={open} reduce={Boolean(reduce)} />
```

`useReducedMotion()` 返回 `boolean | null`，`Boolean()` 收敛掉 `null`。

- [ ] **Step 6: 截图核对**

刷新后观察自动播放。预期：面板展开时编号先出现，随后短线、图标、标题、正文依次上浮；光从左侧向右铺开，与面板边缘同步；收起时内容整齐齐落，不拖沓。

用 `emulate` 打开 `prefers-reduced-motion: reduce` 再看一次，预期内容直接切换、无位移。

- [ ] **Step 7: 提交**

```bash
git add website/src/components/pages/home/ServiceFlow.tsx
git commit -m "feat(website): 面板内容分层进场与光随展开流动

五级逐级 55ms 错开；收起时不错开以免拖沓。
光层 scaleX 与 flex 共用时长缓动，避免跟不上面板边缘。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: 动效——自动播放进度条 + 折叠条悬停微反馈

**Files:**
- Modify: `website/src/app/globals.css`（新增 `flowProgress` keyframes）
- Modify: `website/src/components/pages/home/ServiceFlow.tsx`（进度条元素、`CollapsedFace` 悬停态）

**Interfaces:**
- Consumes: Task 2 在 `li` 上加的 `group` 类；Task 2 的 `glass-acrylic` 背景色可被覆盖
- Produces: 无下游依赖，本任务是最后一项功能改动

- [ ] **Step 1: 新增 keyframes**

在 `globals.css` 末尾的 `@keyframes shimmerText` 之后加：

```css
/* 服务流程自动播放进度条。用 transform 而不是 width：width 动画每帧触发布局，
   这一条要在玻璃面板上连续跑 3 秒，不能让它拖累合成 */
@keyframes flowProgress {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}
```

- [ ] **Step 2: 加进度条元素**

在 `li` 内、`button` 之前插入：

```tsx
{/* 自动播放进度条。key 绑 active：不重建元素的话 CSS 动画不会重头跑，
    第二步之后进度条会停在满格。用户接管后整个元素卸载，进度条随之消失。
    用白色不用品牌橙：橙色配额已给「免费」标记，两条橙线会打架。 */}
{open && phase === 'live' && !userTookOver && !reduce && (
  <span
    key={active}
    aria-hidden
    className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[2px] origin-left bg-paper/70"
    style={{ animation: `flowProgress ${AUTOPLAY_MS}ms linear forwards` }}
  />
)}
```

- [ ] **Step 3: 折叠条悬停微反馈**

把 `li` 的 className 数组改为（在 Task 2 的基础上追加未展开时的悬停类）：

```tsx
className={[
  'group relative min-w-0 overflow-hidden border-l border-rule first:border-l-0',
  open
    ? 'glass-acrylic-dark'
    : 'glass-acrylic transition-colors duration-[240ms] hover:bg-[rgb(255_255_255_/_0.62)]',
].join(' ')}
```

`hover:bg-[…]` 覆盖的是 `glass-acrylic` 里 `background` shorthand 的颜色层，噪点层保留不受影响。

- [ ] **Step 4: 竖排字的悬停反馈**

把 `CollapsedFace` 里的竖排字那一段：

```tsx
<span className="[writing-mode:vertical-rl] text-[17px] tracking-[0.25em] text-graphite-soft">
  {step.short}
</span>
```

改为：

```tsx
{/* 悬停时字色加深并微微上移，鼠标扫过一排时每一条都在响应。
    位移只给 2px：再多会让竖排字在窄条里看起来在跳。 */}
<span className="[writing-mode:vertical-rl] text-[17px] tracking-[0.25em] text-graphite-soft transition-[color,transform] duration-[240ms] group-hover:-translate-y-0.5 group-hover:text-graphite">
  {step.short}
</span>
```

- [ ] **Step 5: 截图核对**

预期：
- 自动播放时展开条底部有一条白线 3 秒走满，切到下一条时从头开始
- 鼠标悬停任一折叠条，玻璃提亮、竖排字加深并上移 2px
- 鼠标接管后进度条消失，不再出现

用 `emulate` 打开 `prefers-reduced-motion: reduce`，确认进度条不渲染。

- [ ] **Step 6: 提交**

```bash
git add website/src/app/globals.css website/src/components/pages/home/ServiceFlow.tsx
git commit -m "feat(website): 自动播放进度条与折叠条悬停微反馈

进度条用 transform 而非 width 避免逐帧布局；key 绑 active 才能让动画重头跑。
reduced-motion 下不渲染进度条。

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: 降级验证、对比度实测与文档回填

**Files:**
- Modify: `docs/superpowers/specs/2026-08-12-website-light-glass-design.md`（改造清单末行）

**Interfaces:**
- Consumes: Task 1-5 的全部产物
- Produces: 无

- [ ] **Step 1: 类型检查与 lint**

```bash
cd website && npx tsc --noEmit && pnpm run lint
```

预期：`tsc` 退出码 0；lint 无新增告警。不跑 `next build`（会挂掉 dev server，且 standalone 在 Windows 必 EPERM）。

- [ ] **Step 2: 实测深色面板正文对比度**

设计里 5.4:1 的核算基于纯 `paper` 底，实际背后有光会抬高合成底亮度。用 chrome-devtools 的 `evaluate_script` 取展开面板正文所在位置的实际渲染色，与正文色算对比度。

判定：正文 ≥ 4.5:1。若不足，提高 `glass-acrylic-dark` 的色调层 alpha（`0.82 → 0.86`），不要改文字色——文字色是全站 token。

- [ ] **Step 3: 两种偏好下的降级验证**

用 `emulate` 分别打开 `prefers-reduced-transparency: reduce` 与 `prefers-reduced-motion: reduce`，各截一张图。

预期：
- 减少透明度下，七条退回近实心、无噪点、无模糊，文字依然清晰可读
- 减少动态下，无位移动画、无进度条，切换为直接显示

- [ ] **Step 4: 窄屏回归**

`resize_page` 到 375×812，滚到流程板块截图。

预期：窄屏仍是七步顺排的朴素列表（无玻璃卡），图标已放大到 `h-16`，未出现横向溢出。

- [ ] **Step 5: 回填上一轮玻璃设计文档**

`docs/superpowers/specs/2026-08-12-website-light-glass-design.md` 的改造清单末行当前是：

```
| `ServiceFlow` 深色面板 | 近黑实心 | 保持不变 | 深面玻璃是另一套配方，本轮不做 |
```

改为：

```
| `ServiceFlow` 深色面板 | 近黑实心 | `glass-acrylic-dark` | 已于 2026-08-13 兑现，见 2026-08-13-service-flow-acrylic-design.md |
```

注意：`docs/superpowers/specs` 被 `.gitignore:16` 的 `specs` 规则忽略，该文件不在版本库中，改完不需要也无法提交。

- [ ] **Step 6: 提交收尾**

若前几步产生了参数微调，一并提交。**必须指定文件路径**：工作树里有数十处与本次
无关的未提交改动，`git add -A` 会把它们全部卷进来。

```bash
git add website/src/app/globals.css website/src/components/pages/home/ServiceFlow.tsx
git commit -m "fix(website): Acrylic 改造的降级与对比度实测修正

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

若无改动则跳过本步。

---

## 附：本计划未覆盖的既有问题

以下是实施中会看到但**不属于本次范围**的东西，不要顺手改：

- `Card.tsx` 是死代码（全站无使用处），上一轮玻璃改造已判定「改它零收益，是否清理另议」。
- `custom-software/data.ts` 里的 `PROCESS_STEPS` 是旧版四步流程，与本板块无关，保留未动。
- `@utility glass`（深色旧档）供已隐藏的深色页面使用，不得修改。
