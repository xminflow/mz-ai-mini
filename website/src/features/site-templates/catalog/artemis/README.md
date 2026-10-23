# Artemis 宿主接入

独立主维护工程：`D:/code/code-tpl/artemis-template/`，Git：<https://github.com/weelume/artemis-template>。本目录仅保留 meta.ts / weelume.tsx，不复制通用页面。

预览 `/templates/artemis/site`，英文 `/templates/artemis/site/en`，详情 `/templates/artemis`。独立工程默认品牌 Artemis，主站注入微域生光 / Weelume、现有 Logo、市场入口与共享示例备案。

本地 `pnpm template:local --id artemis D:/code/code-tpl/artemis-template`；生产固定随仓 vendor 包和 templates/artemis.lock.json，不读取本机目录。更改源码后先在本地 WSL 验证和提交、bundle，再执行 template:update、pnpm 更新锁、template:release、template:check 和 build。源码 ZIP 发布与主站部署分别管理。

详见 `docs/artemis-template-delivery.md`。
