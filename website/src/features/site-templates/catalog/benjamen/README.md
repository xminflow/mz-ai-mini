# Benjamen 接入

通用源码主维护于 `D:/code/code-tpl/benjamen-template/`，此目录只负责注册与宿主适配，不复制模板业务源码。Git：<https://github.com/weelume/benjamen-template>。

默认中文入口 `/templates/benjamen/site`，英文 `/templates/benjamen/site/en`；另含隐私、更新记录双语页面。原站为单页作品集，作品、专长和联系均为首页锚点，无博客。

开发使用 `pnpm template:local --id benjamen <独立工程路径>`；生产使用 vendor 固定包与 `templates/benjamen.lock.json`，不得读取本机路径。宿主注入微域生光品牌、Logo、市场入口和示例备案。

实际验收、固定包与未完成项见 `docs/benjamen-template-delivery.md`。未部署、未公开上架。
