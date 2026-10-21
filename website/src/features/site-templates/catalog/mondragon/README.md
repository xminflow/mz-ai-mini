# Mondragon 宿主接入

通用源码主维护位置：`D:/code/code-tpl/mondragon-template/`。本目录只维护注册转发和微域生光品牌、Logo、模板市场入口及 `TemplateFiling` 示例备案注入。

- 本地开发：`pnpm template:local --id mondragon D:/code/code-tpl/mondragon-template`，随后 `pnpm dev`。`mondragon.local` 仅供本机开发，已由既有忽略规则排除。
- 更新生产快照：独立工程验证后执行 `pnpm bundle`；主站执行 `pnpm template:update --id mondragon <tgz>`、`pnpm install`、`pnpm template:check --id mondragon`、`pnpm build`。
- 生产只读 `vendor` 固定版本、SHA256 和包管理器锁，不使用本机独立工程路径。运行素材与十二张截图由包同步，不手工改生成目录。
- 详情 `/templates/mondragon`，中文 `/templates/mondragon/site`，英文 `/templates/mondragon/site/en`。
- 真实仓库为 <https://github.com/weelume/mondragon-template>；当前仅按授权创建公开空仓库，源码未提交或推送。模板 `listed=false`，素材授权待确认。

实际验收与已知差异见本工程 `docs/mondragon-template-delivery.md`。独立 `.tpl` 只保存模板自己的规则与验收，不保存宿主接入记录。
