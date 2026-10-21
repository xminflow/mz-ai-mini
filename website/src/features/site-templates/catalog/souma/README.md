# Souma 主站适配

通用源码主维护于 `D:/code/code-tpl/souma-template/`。此目录仅提供注册与 `SoumaHostProvider` 注入；页面、双语、主题和素材不复制至主站。

本地开发：`pnpm template:local --id souma D:/code/code-tpl/souma-template`。生产使用 vendor 固定包和 `templates/souma.lock.json`；更新时运行独立 `pnpm bundle`，再执行主站 `template:update --id souma <tgz>`、pnpm 安装、`template:check --id souma` 与 build。依赖锁须由 pnpm 更新。

主站默认 `/templates/souma/site`，英文 `/templates/souma/site/en`。10 页、20 条双语路由，三端共用同一业务站点。品牌、Logo、市场入口和示例备案由本适配注入。

完整范围、证据与限制见 `docs/souma-template-delivery.md`。Git 地址为 https://github.com/weelume/souma-template（已创建空仓库，未推送）；素材权利未确认，不公开上架。当前工作区同时有其他模板未完成的并行改动，Souma 隔离接入验收不代表当前工作区完整构建通过。
