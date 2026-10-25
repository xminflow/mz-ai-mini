# Noter 宿主适配

页面、组件、双语内容、主题和运行素材由 `D:/code/code-tpl/noter-template/` 维护，本目录仅保留注册与宿主注入。

- 详情：`/templates/noter`。
- 中文：`/templates/noter/site`，英文：`/templates/noter/site/en`。
- 共16页、32条双语路由；默认中文，三端共用一个 site。
- 本地 `template:local --id noter` 指向独立源码；生产只使用 vendor 内按版本与摘要固定的共享包。
- 原站没有独立“功能”页，截图采用首页、设计分类、文章和联系页，每端各4张。
- `listed=false`；源码仓库为 https://github.com/weelume/noter-template ，分支 `codex/noter`；源码 ZIP 已通过匿名下载、SHA256 和 ZIP CRC 校验，地址记录于 `website/templates/releases.json`。

验收与限制见 `docs/noter-template-delivery.md`，本次主站发布见 `docs/releases/release-20261025-full.md`；发布不改变模板未上架状态。
