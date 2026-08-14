# 整站模板模块

仅开发环境可见的整站模板工作台。设计文档见
`docs/superpowers/specs/2026-08-14-site-templates-module-design.md`。

## 可见性

`config.ts` 的 `isTemplatesModuleEnabled()` 是唯一判定入口：

- 默认：开发环境开、生产环境关
- `TEMPLATES_MODULE_ENABLED=true` / `false` 可两个方向强制覆盖
- 关闭时 `middleware.ts` 把 `/templates` 307 回首页，`(templates)/layout.tsx` 再兜一道 404

**将来整体上架**：生产环境设 `TEMPLATES_MODULE_ENABLED=true` 即可，代码零改动。

改了这个环境变量**必须重启 dev server**——白名单在 middleware 模块顶层求值，热更新不会重算。

## 新增一套模板

1. 建目录 `catalog/<template-id>/`，内含 `meta.ts`、`theme.css`、`pages/`
2. `theme.css` 里的令牌**必须**挂在 `[data-template='<template-id>']` 选择器下，禁止提到 `:root`，否则会污染全站并与其它模板串色；令牌一律以 `--tpl-` 开头
3. 每个页面组件 `export default` 一个接收 `SiteTemplatePageProps` 的组件，并在文件顶部 `import '../theme.css'`
4. 站内链接一律基于 props 传入的 `basePath` 拼接，**禁止硬编码 `/templates` 前缀**
5. 封面图放 `public/templates/<template-id>/`
6. 在 `registry.ts` 的 `SITE_TEMPLATES` 里加一行

不需要新建任何路由文件。

## 约束

- `preview` 是保留 slug，模板不能定义同名页面（与工作台的静态路由段冲突）。注册表会在加载时直接抛错
- 每套模板必须有一个 `slug: ''` 的首页，注册表会校验
- 模板**不复用**官网的 `components/ui`、`components/layout` 与 `globals.css` 的设计令牌。整站模板的价值就在于各有各的设计语言，共用会让所有模板收敛成一个样子

## 已知遗留

- 模板页面的 `<head>` 里仍带着根 layout 注入的微域生光 JSON-LD（根 layout 全站唯一，无法绕开），上架前需处理
- `public/templates/` 下的封面图不经过 middleware，知道 URL 即可直接访问；这些图本就是将来要公开的资产
