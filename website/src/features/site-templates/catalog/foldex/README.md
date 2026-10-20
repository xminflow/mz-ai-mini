# Foldex 宿主接入

通用页面、双语内容、主题、组件及运行素材维护在独立工程 `D:/code/code-tpl/foldex-template/`。本目录仅有元数据转发和微域生光品牌、市场入口、示例备案注入。

- 开发：`pnpm template:local --id foldex D:/code/code-tpl/foldex-template`，随后 `pnpm dev`。`foldex.local` 只用于本地且已忽略。
- 生产：独立工程 `pnpm bundle`，主站 `pnpm template:update --id foldex <归档路径>`、`pnpm install`、`pnpm template:check --id foldex`、`pnpm build`。
- 预览：`/templates/foldex/site`，英文 `/templates/foldex/site/en`；详情 `/templates/foldex`。
- 远端：用户确认未配置，不生成仓库链接；`listed: false`，没有提交、推送或发布。

完整交付与验证记录见 `docs/foldex-template-delivery.md`。素材目录由共享包同步器生成，不手工修改。
