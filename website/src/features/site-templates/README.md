# 整站模板模块

仅开发环境可见的整站模板工作台。设计文档见
`docs/superpowers/specs/2026-08-14-site-templates-module-design.md`。

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
   - `templates/page.tsx`（工作台列表页）的文案写着「DEV ONLY · N TEMPLATES」，以及
     「这里的全部内容只在开发环境可见。生产环境未设置 TEMPLATES_MODULE_ENABLED=true 时……」——
     开关一开，这段面向开发者的说明就会展示给外部访客，还把门禁机制和环境变量名一并暴露了，
     需要替换成面向客户的文案
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
   页面会静默继承工作台的底色，而不是报错。深色模板（如 Meridian）尤其明显
3. 每个页面组件 `export default` 一个接收 `SiteTemplatePageProps` 的组件，并在文件顶部
   `import '../theme.css'`
4. 站内链接一律基于 props 传入的 `basePath` 拼接，**禁止硬编码 `/templates` 前缀**
5. 封面图放 `public/templates/<template-id>/`
6. 在 `meta.ts` 里填 `sceneId`，取值必须是 `taxonomy.ts` 里已有的场景 id
7. 在 `meta.ts` 里填 `listed: false`。**新模板一律先写 false**，它只在内部工作台可见；
   等这套模板确认可以给客户看了，再单独改成 `true` 上架到 `/cases`（见「案例页」一节）
8. 在 `registry.ts` 的 `SITE_TEMPLATES` 里加一行

不需要新建任何路由文件。

## 模板里画图表

`aegis` 模板引入了 `echarts`（Apache-2.0，可商用），它是目前唯一为模板而加的依赖。
新模板要画图时照它的做法，不要另起炉灶：

- 图表组件必须是 `'use client'`，页面本身保持服务端组件
- **不要把 echarts 的 option 对象从页面以 props 传给图表组件**：option 里的
  `formatter` 是函数，跨 Server/Client 边界不可序列化，会直接报错。让图表组件自己
  `import` 数据模块并在内部用 `useMemo` 构造 option
- echarts 按需注册（`echarts/core` + 用到的 charts/components）。**漏注册不会报错，
  只是那部分静默不渲染**——本模板就踩过一次：`graphic` 忘了注册，环形图中心的总数
  整个不显示。新用一种图或组件时记得回 `charts/EChart.tsx` 补注册
- 图表配色只能写字面量十六进制。canvas 拿不到 CSS 自定义属性，写 `var(--tpl-*)`
  画不出颜色，因此 `chartTheme.ts` 与 `theme.css` 需要手工保持一致
- 演示数据禁止 `Math.random()` / `Date.now()` / `new Date()`：同一份数据服务端与
  客户端各算一次，取值不确定会导致 hydration 报错。要"看起来随机"就用固定种子的生成器
- **不要从 `'use client'` 模块导出常量给服务端页面 import**。Next 会把客户端模块的
  所有导出换成客户端引用代理，常量到了服务端就变成一个不能调用的函数，症状是页面上
  直接渲染出一段 `Attempted to call X() from the server`。共享常量放数据层这类普通模块里

## 模板里做交互

`aegis` 的「项目监控」页是目前唯一带交互的模板页面（可切换被监控项目）。它的做法是
**服务端页面壳 + 一个客户端视图组件**，而不是把整页标成 `'use client'`：

- `pages/ProjectPage.tsx` 保持服务端组件，只渲染 `<ProjectMonitorView basePath={...} />`
- 交互状态、数据选择、图表全在 `components/ProjectMonitorView.tsx` 里
- 图表组件此时必须**接收 props** 而不是自己 import 固定数据，否则切换项目图不会变

其余四个页面仍是纯服务端组件。交互只在"不做就说不清楚"的地方做——比如"同一套监控
形态能罩住六种项目类型"这件事，静态截图证明不了，必须能点。

## 案例页（/cases）

`/cases` 是模板模块对外的陈列面，与 `/templates` 工作台共用同一个
`isTemplatesModuleEnabled()` 开关，要么一起可达要么一起 307 回首页。

**上架是一次明确的点头，不是新建模板的副作用。** `SiteTemplate.listed` 必填：
只有 `listed: true` 的模板会出现在 `/cases`。收录进注册表与对外展示是两件事——
`/templates` 工作台不看这个字段，始终全量显示，它是内部调试入口。
新建模板时一律先写 `listed: false`，等这套模板确认可以给客户看了再改成 `true`。

- 场景清单的唯一来源是 `taxonomy.ts`，数组顺序即左侧导航顺序
- **侧栏原样列出三个一级分类与全部 15 个场景，不按有无模板过滤，也不显示模板数量。**
  它表达的是业务范围而不是当前库存：访客带着「我要做个进销存」进来，那一项必须能找到，
  哪怕它下面暂时没有可公开的成品。因此每个场景都点得开，没有已上架模板不是错误状态，
  只有场景 id 不在清单里才 404
- 场景的介绍区是组件插槽而不是数据字段：`scenes/<scene-id>/Section.tsx` 默认导出一个
  接收 `SceneSectionProps` 的组件，想放什么放什么。只写两段话的场景套
  `scenes/_shared/SceneIntro.tsx` 即可
- 还没写 `Section.tsx` 的场景走 `scenes/_shared/SceneFallback.tsx`——通用说明加联系入口。
  这不是静默兜底而是一个明确状态：15 个场景个个成页，而介绍文案是逐个确认后才填的，
  没填的那些需要一个说得过去的样子。填了自己的 Section 之后这个兜底就不再出现
- 侧栏是客户端组件（要 `usePathname` 做高亮），因此 `selectors.ts` 返回的都是可序列化数据，
  不要把带 `load` 函数的 `TemplateScene` 整个传过去
- `SceneSidebar` 的高亮用 `pathname === href` 精确匹配，前提是 `next.config.ts` 没开
  `trailingSlash`（默认 false）。若将来开成 `true`，路径会被框架 308 到带斜杠的形式，
  精确匹配会立刻失效、所有高亮消失，届时需要同步改成归一化比较（去掉尾部斜杠再比）
- 案例页的模板陈列**复用**了 `workbench/TemplateRow.tsx`，而不是另做一套浅色卡片：
  两个页面陈列的是同一批对象，做两份是重复实现。代价是跨了 `workbench/` 与 `gallery/`
  的目录边界——`TemplateRow` 将来若要为工作台单独演进，需要先把它拆成两份再改

## 约束

- `preview` 是保留 slug，模板不能定义同名页面（与工作台的静态路由段冲突）。注册表会在加载时直接抛错
- 每套模板必须有一个 `slug: ''` 的首页，注册表会校验
- `template.id` 必须是 kebab-case（不含 `/`），非空的 `page.slug` 必须是 kebab-case
  （可用 `/` 做多级分隔）；注册表会校验，格式不对的 id/slug 会在加载时直接抛错，
  而不是留到运行时静默 404
- 模板**不复用**官网的 `components/ui`、`components/layout` 与 `globals.css` 的设计令牌。整站模板的价值就在于各有各的设计语言，共用会让所有模板收敛成一个样子

## 已知遗留

- **元数据泄漏**：模板页面的 `<head>` 从根 layout 继承下来一整套官网身份，而不只是
  JSON-LD 一项。实测 `/templates/meridian` 的输出，以下全是微域生光的官网信息，
  noindex 摘掉之前必须逐项处理：
  - JSON-LD 结构化数据
  - `meta description`
  - `canonical`——**每个模板页面都对外声明自己的规范 URL 是官网首页**，noindex
    一旦摘掉，这会直接误导搜索引擎把模板页当成官网首页的重复内容，属于自伤 SEO
  - `og:*` / `twitter:*` 社交分享卡片信息
  - favicon / apple-touch-icon
  - 根 layout 在生产环境注入的百度统计：上架后 iframe 里加载的模板真实路由（如
    `/templates/meridian/team`）会各自触发一次 pageview，污染官网的真实流量数据
- **注册表校验会炸掉整个官网的生产构建**：`assertRegistryValid` 在 `registry.ts`
  模块顶层执行，而 `registry.ts` 被三个 page 模块 import，这些 page 在 `next build`
  时会被收集进构建图。也就是说，某人新增第七套模板时写错一个 slug（比如没按
  kebab-case），会让整个 weelume.com 的生产构建直接失败——即便生产环境这个模块当时
  是关闭的、访客完全看不到它。fail-fast 本身是有意为之、不应该改成静默跳过，但这个
  爆炸半径必须写清楚：改的是 dev-only 的模板代码，挂的是官网发布流水线，第一次撞上
  的人不看这条会完全摸不着头脑
  新增的 `sceneId` 校验（场景不存在、场景没配 `load`）同样在这个位置执行，
  因此它们也在这个爆炸半径内。
- **「每套模板独立分包」是未验证的假设**：`types.ts` 里 `load: () => import(...)`
  的注释断言这种写法能让模板数量增长时不互相拖累首屏体积。这是整个架构在「很多套
  模板」规模下不会劣化的关键假设，但从未被验证过——dev 模式的模块加载策略和生产
  环境的 chunk 划分不是一回事，只有 `next build` 的产物能证实。而本项目已知
  `next build` 会挂掉 dev server，且 standalone 输出在 Windows 上必然 EPERM 失败，
  所以本地暂时无法验证。等将来有机会在别的环境（如 CI 或非 Windows 机器）跑一次
  生产构建时，应确认 `.next/static/chunks` 里各模板确实是分开的 chunk，再把这条从
  「已知遗留」移除
- `public/templates/` 下的封面图不经过 middleware，知道 URL 即可直接访问；这些图本就是将来要公开的资产
- **案例页无导航入口**：`/cases` 只能直接输 URL 访问。上架时需要按门禁条件渲染导航项——
  无条件加进 `LightNav` 的 `NAV_ITEMS` 会在生产环境留下死链
- **`sitemap.ts` 不含 `/cases`**：与模板路径同属上架待办
