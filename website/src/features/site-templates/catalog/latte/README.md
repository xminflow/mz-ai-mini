# Latte 主站接入

对应独立源码工程为 `D:/code/code-tpl/latte-template`。本目录只保留包引用与宿主 Provider 适配；通用页面、样式、内容与运行素材由独立工程维护，不复制业务页面。主站注入微域生光中英文品牌、Logo、市场入口与示例备案。

开发：在 website 执行 `node scripts/deformo-package.mjs local D:/code/code-tpl/latte-template --id latte`，再 `pnpm dev`。`latte.local` 是忽略的本机配置。开发读取源码并监听素材；生产只使用固定 vendor 包，不依赖本机路径。

生产快照：独立工程执行检查、截图与 `pnpm bundle`，然后在 website 执行 `node scripts/deformo-package.mjs snapshot <运行包.tgz> --id latte`、`pnpm install`、`node scripts/deformo-package.mjs check --id latte`、类型检查和构建。归档、`templates/latte.lock.json`、`package.json` 与 pnpm 锁文件一并交付。

独立 `.tpl/assets` 的三端真实截图映射到主站 `public/templates/latte/screenshots`；运行素材由同步器生成，不手工编辑。根 `/templates/latte` 为详情，`/templates/latte/site` 为中文整站，`/templates/latte/site/en` 为英文。共 11 页，包括五篇新闻。

未配置真实 Git 地址，完整独立协议验收受限。参考素材再分发许可待确认，保持 `listed=false`；该标记不会隐藏本地 `/templates` 目录，只限制对外案例陈列。本次本地接入不等于线上部署。
