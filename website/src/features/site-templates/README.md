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
   `(templates)/layout.tsx` 给整个路由组套了工作台的深色底
   （`bg-neutral-950 text-neutral-100`），已有的 Meridian 恰好也是深色模板，看不出问题；
   一旦有模板是浅色调性，若 `theme.css` 只定义了令牌而没有在根选择器上覆盖背景色和文字色，
   页面会静默继承工作台的深色底，而不是报错
3. 每个页面组件 `export default` 一个接收 `SiteTemplatePageProps` 的组件，并在文件顶部
   `import '../theme.css'`
4. 站内链接一律基于 props 传入的 `basePath` 拼接，**禁止硬编码 `/templates` 前缀**
5. 封面图放 `public/templates/<template-id>/`
6. 在 `registry.ts` 的 `SITE_TEMPLATES` 里加一行

不需要新建任何路由文件。

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
- **「每套模板独立分包」是未验证的假设**：`types.ts` 里 `load: () => import(...)`
  的注释断言这种写法能让模板数量增长时不互相拖累首屏体积。这是整个架构在「很多套
  模板」规模下不会劣化的关键假设，但从未被验证过——dev 模式的模块加载策略和生产
  环境的 chunk 划分不是一回事，只有 `next build` 的产物能证实。而本项目已知
  `next build` 会挂掉 dev server，且 standalone 输出在 Windows 上必然 EPERM 失败，
  所以本地暂时无法验证。等将来有机会在别的环境（如 CI 或非 Windows 机器）跑一次
  生产构建时，应确认 `.next/static/chunks` 里各模板确实是分开的 chunk，再把这条从
  「已知遗留」移除
- `public/templates/` 下的封面图不经过 middleware，知道 URL 即可直接访问；这些图本就是将来要公开的资产
