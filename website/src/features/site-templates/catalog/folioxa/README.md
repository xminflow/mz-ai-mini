# Folioxa 宿主接入

通用源码：D:/code/code-tpl/folioxa-template；Git：https://github.com/weelume/folioxa-template。此处只保留 meta.ts 与 weelume.tsx 宿主适配，注入微域生光品牌、Logo、模板市场入口和示例备案。不要复制页面源码。

开发：node scripts/deformo-package.mjs local D:/code/code-tpl/folioxa-template --id folioxa，然后 pnpm dev。生产固定 vendor 快照，更新采用 template:update --id folioxa，pnpm 更新锁，template:check --id folioxa，template:release --ids folioxa，template:release:check 与 build。构建在本地 WSL Linux 文件系统。

真实三端截图来自独立模板，由素材同步器生成；宿主页面另行验收。详见 docs/folioxa-template-delivery.md。

## 主站入口与固定版本

- 模板列表：`/templates`；详情：`/templates/folioxa`。
- 中文预览：`/templates/folioxa/site`；英文预览：`/templates/folioxa/site/en`。
- 当前源码提交：`242e687dd2b7b18c96579aaaccfb3b8adf88d57f`；生产包：`vendor/folioxa-template-1.0.0-70add1d628ad.tgz`。
- 源码 ZIP 已在用户授权后发布，详情页教程通过 `templates/releases.json` 读取经过匿名下载校验的 COS 地址，不能回退为 Git 地址。教程保留主站既有登录校验。
- `listed=false` 保持现有案例展示状态，不影响内部模板列表、详情与预览入口。

2026-10-24 接入复核：本地 WSL 类型检查（关闭增量缓存）、宿主适配及注册表 lint、`template:check --id folioxa`、Folioxa 发布清单与快照一致性检查均通过。上述列表、详情、双语预览及作品页 HTTP 检查均为 200，实际客户端详情包包含已发布 ZIP 地址。本次没有登录账号重测教程展开及复制操作，也没有重复完整原站动效验收。

主站正式构建仍受另一模板 `ilse-moreno` 未发布源码 ZIP 的全局门禁阻塞；不删除其他模板、不绕过门禁。接入工作区不表示已部署生产。
