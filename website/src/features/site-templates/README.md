# 整站模板模块

默认仅开发环境可见的整站模板目录。设计文档见
`docs/superpowers/specs/2026-08-14-site-templates-module-design.md`。

## WorkBuddy 使用教程

详情页的“如何在 WorkBuddy 中使用”由 workbench/WorkBuddyGuide.tsx 统一提供，默认收起，展开后仅展示“提示词”和“如何修改”两部分。提示词支持一键复制，使用当前模板名称，具体命令由工程自身说明决定。

已确认的独立工程地址填在 SiteTemplate.gitUrl，提示词固定为“使用（实际 Git 地址），按照项目要求启动工程，并给我实际访问地址。”；未配置地址时显示未配置提示并禁用复制，不生成猜测的仓库链接。当前 Deformo 地址在宿主适配中声明。此教程属于市场展示，不回写到独立模板的页面代码。

## 可见性

`config.ts` 的 `isTemplatesModuleEnabled()` 是唯一判定入口：

- 默认：开发环境开、生产环境关
- `TEMPLATES_MODULE_ENABLED=true` / `false` 可两个方向强制覆盖
- 关闭时 `middleware.ts` 把 `/templates` 307 回首页，`(templates)/layout.tsx` 再兜一道 404

**将来整体上架，分两步，不要只做第一步就以为完事**：

1. 生产环境设 `TEMPLATES_MODULE_ENABLED=true`，模块立刻变得**可达**——这一步代码零改动。
2. 但「可达」不等于「适合对外」，上架前还需要额外处理（见下方「已知遗留」）：
   - `(templates)/layout.tsx` 与 catch-all 路由的 `generateMetadata` 都写死了
     `robots: { index: false, follow: false }`，开关打开后模板页面对搜索引擎依然全部
     noindex，作为要给客户挑选的商品目录这是不成立的，需要按套改成可索引
   - `sitemap.ts` 不含模板路径，需要一并补上

改了这个环境变量**必须重启 dev server**——白名单在 middleware 模块顶层求值，热更新不会重算。

## 新增一套模板

1. 建目录 `catalog/<template-id>/`，内含 `meta.ts`、`theme.css`、`pages/`；模板内部
   如需拆分组件，可以自建 `components/` 子目录，不限于这三项
2. `theme.css` 里的令牌**必须**挂在 `[data-template='<template-id>']` 选择器下，禁止提到
   `:root`，否则会污染全站并与其它模板串色；令牌一律以 `--tpl-` 开头。
   **该选择器下必须同时显式设置 `background` 与 `color`，不能只放令牌**——
   `(templates)/layout.tsx` 给整个路由组套了工作台的底色（`bg-paper text-graphite`，
   与官网一致）。模板若只定义了令牌而没有在根选择器上覆盖背景色和文字色，
   页面会静默继承工作台的底色，而不是报错。深色调性的模板尤其明显
3. 每个页面组件 `export default` 一个接收 `SiteTemplatePageProps` 的组件，并在文件顶部
   `import '../theme.css'`
4. 站内链接一律基于 props 传入的 `basePath` 拼接，**禁止硬编码 `/templates` 前缀**。
   `basePath` 指向的是**端**而不是模板（`/templates/<模板 id>/<端 id>`）
5. 封面图放 `public/templates/<template-id>/`；模板内容用的照片放同目录的 `photos/` 下。
   实际页面截图放 `screenshots/` 下，并在 `meta.ts` 的 `screenshots` 中登记 `src`、`alt`、
   `device`、`width` 与 `height`。响应式官网需分别提供 PC、iPad、H5 的实际适配与截图，
   三组视口统一取自 `devices.ts`：1440×1000、834×1180、390×844。
   截图隐藏开发工具浮标，按真实设备视口拍摄，首张用于目录封面；页面设计更新后需重新截图。
   未标注设备的既有截图仍按 PC 展示，后续更新时补齐设备与尺寸。
6. 在 `meta.ts` 里把页面组织进 `surfaces`：一套交付里的每个独立站点是一个端，
   各有 `id`（URL 片段）、`name`（展示名，如「官网」「管理后台」）、`platform`
   （`pc` / `miniprogram` / `mobile`）和自己的 `pages`。只有一个站也要写成单元素数组，
   端片段不省略（见「多端」一节）
7. 在 `meta.ts` 里填 `sceneId`，取值必须是 `taxonomy.ts` 里已有的场景 id
8. 在 `meta.ts` 里填 `listed: false`。**新模板一律先写 false**，它只在内部工作台可见；
   等这套模板确认可以给客户看了，再单独改成 `true` 上架到 `/cases`（见「案例页」一节）
9. 在 `registry.ts` 的 `SITE_TEMPLATES` 里加一行

不需要新建任何路由文件。

## 模板里画图表

项目已安装 `echarts`（Apache-2.0，可商用）。模板需要图表时优先复用该依赖：

- 图表组件必须是 `'use client'`，页面本身保持服务端组件
- **不要把 echarts 的 option 对象从页面以 props 传给图表组件**：option 里的
  `formatter` 是函数，跨 Server/Client 边界不可序列化，会直接报错。让图表组件自己
  `import` 数据模块并在内部用 `useMemo` 构造 option
- echarts 按需注册（`echarts/core` + 用到的 charts/components）。**漏注册不会报错，
  只是那部分静默不渲染**，新增图表组件时必须检查所需模块是否完整注册
- 图表配色只能写字面量十六进制。canvas 拿不到 CSS 自定义属性，写 `var(--tpl-*)`
  画不出颜色，因此图表配色与 `theme.css` 需要手工保持一致
- 演示数据禁止 `Math.random()` / `Date.now()` / `new Date()`：同一份数据服务端与
  客户端各算一次，取值不确定会导致 hydration 报错。要"看起来随机"就用固定种子的生成器
- **不要从 `'use client'` 模块导出常量给服务端页面 import**。Next 会把客户端模块的
  所有导出换成客户端引用代理，常量到了服务端就变成一个不能调用的函数，症状是页面上
  直接渲染出一段 `Attempted to call X() from the server`。共享常量放数据层这类普通模块里

## 模板里用照片

`liubai` 是第一套用实拍照的模板（Pexels License，可免费商用、无需署名），做法照它：

- 图**下载到 `public/templates/<template-id>/photos/` 本地托管**，不要外链
  `images.pexels.com`：外链让模板依赖第三方站点可用性，也绕过本地缓存拖慢预览
- 用原生 `<img>` 而不是 `next/image`——官网其余部分一律是原生 `<img>`，跟着现有写法走
- 文件名与数据里的 id 一一对应（`workPhoto(id)` 直接拼路径），不要再单独维护一张路径表
- 图源 id 记在数据文件的注释里，将来换图或核对授权时能查得到
- 十几张来自不同摄影师的照片色温不一，直接铺上去版面会变成一盘杂色。
  统一在一个 CSS 类里降饱和、提对比（见 `theme.css` 的 `.tpl-photo`），
  比逐张修图可控，也比一刀切转黑白留得住材料质感
- 封面 SVG 里若要放照片，必须内嵌成 `data:` URI。封面是被 `<img src>` 当图片加载的，
  这种情况下 SVG 拿不到任何外部资源，写相对路径只会得到一块空白

## 模板里做交互

交互采用**服务端页面壳 + 客户端视图组件**：页面保留服务端渲染，将交互状态和事件处理
集中到客户端组件中。需要跟随用户选择更新的数据通过 props 传给视图组件。

## 案例页（/cases）

`/cases` 是模板模块对外的陈列面，与 `/templates` 工作台共用同一个
`isTemplatesModuleEnabled()` 开关，要么一起可达要么一起 307 回首页。

**上架是一次明确的点头，不是新建模板的副作用。** `SiteTemplate.listed` 必填：
只有 `listed: true` 的模板会出现在 `/cases`。收录进注册表与对外展示是两件事——
`/templates` 工作台不看这个字段，始终全量显示，它是内部调试入口。
新建模板时一律先写 `listed: false`，等这套模板确认可以给客户看了再改成 `true`。

- 场景清单的唯一来源是 `taxonomy.ts`，**一层扁平结构**，数组顺序即左侧导航顺序
- **分类维度只有一个：客户要做的是什么**（企业官网、进销存、客户管理……）。
  载体不进分类，它是每个端的属性 `platform`（见「多端」一节）。
  同一件事在不同端上做，对客户来说仍是同一件事，拆成两个分类只会让「电商商城」
  这类条目在目录里出现两次。卡片眉标只写业务形态，端信息在下方按端分组的清单里给出
- **侧栏原样列出全部场景，不按有无模板过滤，也不显示模板数量。**
  它表达的是业务范围而不是当前库存：访客带着「我要做个进销存」进来，那一项必须能找到，
  哪怕它下面暂时没有可公开的成品。因此每个场景都点得开，没有已上架模板不是错误状态，
  只有场景 id 不在清单里才 404
- 场景的介绍区是组件插槽而不是数据字段：`scenes/<scene-id>/Section.tsx` 默认导出一个
  接收 `SceneSectionProps` 的组件，想放什么放什么。只写两段话的场景套
  `scenes/_shared/SceneIntro.tsx` 即可
- 还没写 `Section.tsx` 的场景走 `scenes/_shared/SceneFallback.tsx`——通用说明加联系入口。
  这不是静默兜底而是一个明确状态：每个场景都成页，而介绍文案是逐个确认后才填的，
  没填的那些需要一个说得过去的样子。填了自己的 Section 之后这个兜底就不再出现
- 侧栏是客户端组件（要 `usePathname` 做高亮），因此 `selectors.ts` 返回的都是可序列化数据，
  不要把带 `load` 函数的 `TemplateScene` 整个传过去
- `SceneSidebar` 的高亮用 `pathname === href` 精确匹配，前提是 `next.config.ts` 没开
  `trailingSlash`（默认 false）。若将来开成 `true`，路径会被框架 308 到带斜杠的形式，
  精确匹配会立刻失效、所有高亮消失，届时需要同步改成归一化比较（去掉尾部斜杠再比）
- 案例页继续使用浅色 `workbench/TemplateRow.tsx`。内部模板目录与详情页采用深色陈列，
  共用 `TemplateCard`；展示数据由 `presentation.ts` 从注册表映射，只传可序列化字段。
- 详情页「在线预览」与案例页「查看预览」在新标签页打开第一个端的真实首页，支持整站浏览；
  多端模板可从详情页的「包含的页面」进入其他端。详情画廊按截图的 `device` 分组，
  每组有独立的新标签页预览入口：PC 直接打开整站，iPad / H5 打开带设备边框的 `/preview`。

## 多端

**一套模板 = 一套交付，里面可以有多个独立站点。** 企业官网通常配一个管理后台，
商城小程序背后还有一套订单后台——它们页面集完全不同、设计语言往往也不同。
所以模板不直接持有 `pages`，而是持有 `surfaces`，每个端各有自己的 `pages`。

```
SiteTemplate
  └─ surfaces[]        端：官网 / 管理后台 / 商城小程序
       ├─ platform     该端跑在什么设备形态上
       └─ pages[]      该端的页面，必须含一个 slug 为空串的首页
```

- URL 是 `/templates/<模板 id>/<端 id>/<页面 slug>`。**端片段不省略**，哪怕只有一个端——
  省略会让 catch-all 出现两种解析分支（第一段可能是端也可能是页面），
  一旦某个端 id 与某个页面 slug 同名就必然误判
- `/templates/<模板 id>` 展示模板详情（截图画廊、页面清单、模板信息）；
  `/templates` 是支持搜索与场景筛选的目录。详情路由复用现有 optional catch-all 的空 slug 分支，
  不新增与端 id 冲突的静态路由段。未知模板、端、页面仍返回 404。
- `basePath` 传给页面组件的是**端根路径**（`/templates/liubai/site`），不是模板根路径
- 预览页有一层端切换，只在多端时出现。端之间是彼此独立的站点，模板内部不会有跨端的导航，
  所以这一层必须由工作台提供——它和页面切换不是一回事
- 响应式适配使用 `TemplateDevice`，与独立业务站点 `surface` 分开管理；同一个官网适配
  PC、iPad 和 H5 时仍只注册一个 `surface`，不复制路由或业务页面。
- `/templates/<id>/preview?viewport=tablet` 与 `viewport=mobile` 分别打开 iPad / H5 模拟设备；
  `viewport=desktop` 使用 PC。设备按钮同步 URL，刷新保留选择。未知设备值进入 404。
  iframe 始终使用预设的真实 CSS 宽高，外壳按可用空间等比缩放；页面可滚动并使用自身导航、
  菜单、语言切换和表单。切换设备只改变视口，保留当前页面与文档。
- 预览页保持独立的深色取景器设计：不显示模板名、
  不做页面骨架、整页锁在一屏内不滚动，模板在暗背景上成为画面里唯一的光源。
  控制条上唯一的彩色是模板自己的 `accentColor`
- 列表卡片按端分组列页面名，否则两个站的页面名会混成一排读不出归属

## 约束

- **每个端必须自带能走到它全部页面的站内导航**（官网的顶部菜单、控制台的侧边栏）。
  预览页**不提供页面切换**：模板自己就有导航，工作台顶上再列一遍是同一件事说两遍；
  更重要的是客户要判断的恰恰是「这套东西自己好不好用」，让他用模板自己的导航翻页
  才是真实体验。代价是导航漏了哪个页面，那个页面在预览里就点不到——
  这条没法自动校验，新增模板时自己对一遍 `pages` 与导航项
- `preview` 是保留**端 id**，模板不能定义同名端（与工作台的静态路由段冲突）。
  注意保留的是端 id 而不是页面 slug：端 id 才是 `/templates/<模板>/` 之后的第一段。
  注册表会在加载时直接抛错
- 每套模板至少要有一个端，每个端必须有一个 `slug: ''` 的首页，注册表会校验
- `template.id` 与 `surface.id` 必须是 kebab-case（不含 `/`），非空的 `page.slug` 必须是
  kebab-case（可用 `/` 做多级分隔）；注册表会校验，格式不对的会在加载时直接抛错，
  而不是留到运行时静默 404
- 模板**不复用**官网的 `components/ui`、`components/layout` 与 `globals.css` 的设计令牌。整站模板的价值就在于各有各的设计语言，共用会让所有模板收敛成一个样子

## 已知遗留

- **元数据泄漏**：模板页面的 `<head>` 从根 layout 继承下来一整套官网身份，而不只是
  JSON-LD 一项。实测模板页面的输出，以下全是微域生光的官网信息，
  noindex 摘掉之前必须逐项处理：
  - JSON-LD 结构化数据
  - `meta description`
  - `canonical`——**每个模板页面都对外声明自己的规范 URL 是官网首页**，noindex
    一旦摘掉，这会直接误导搜索引擎把模板页当成官网首页的重复内容，属于自伤 SEO
  - `og:*` / `twitter:*` 社交分享卡片信息
  - favicon / apple-touch-icon
  - 根 layout 在生产环境注入的百度统计：上架后 iframe 里加载的模板真实路由（如
    `/templates/liubai/site`）会各自触发一次 pageview，污染官网的真实流量数据
- **注册表校验会炸掉整个官网的生产构建**：`assertRegistryValid` 在 `registry.ts`
  模块顶层执行，而 `registry.ts` 被三个 page 模块 import，这些 page 在 `next build`
  时会被收集进构建图。也就是说，某人新增第七套模板时写错一个 slug（比如没按
  kebab-case），会让整个 weelume.com 的生产构建直接失败——即便生产环境这个模块当时
  是关闭的、访客完全看不到它。fail-fast 本身是有意为之、不应该改成静默跳过，但这个
  爆炸半径必须写清楚：改的是 dev-only 的模板代码，挂的是官网发布流水线，第一次撞上
  的人不看这条会完全摸不着头脑
  新增的 `sceneId` 校验与端结构校验同样在这个位置执行，
  因此它们也在这个爆炸半径内。
- **「每套模板独立分包」是未验证的假设**：`types.ts` 里 `load: () => import(...)`
  的注释断言这种写法能让模板数量增长时不互相拖累首屏体积。这是整个架构在「很多套
  模板」规模下不会劣化的关键假设，但从未被验证过——dev 模式的模块加载策略和生产
  环境的 chunk 划分不是一回事，只有 `next build` 的产物能证实。而本项目已知
  `next build` 会挂掉 dev server，且 standalone 输出在 Windows 上必然 EPERM 失败，
  所以本地暂时无法验证。等将来有机会在别的环境（如 CI 或非 Windows 机器）跑一次
  生产构建时，应确认 `.next/static/chunks` 里各模板确实是分开的 chunk，再把这条从
  「已知遗留」移除
- `public/templates/` 下的封面图与模板照片不经过 middleware，知道 URL 即可直接访问；这些图本就是将来要公开的资产
- **案例页无导航入口**：`/cases` 只能直接输 URL 访问。上架时需要按门禁条件渲染导航项——
  无条件加进 `LightNav` 的 `NAV_ITEMS` 会在生产环境留下死链
- **`sitemap.ts` 不含 `/cases`**：与模板路径同属上架待办
