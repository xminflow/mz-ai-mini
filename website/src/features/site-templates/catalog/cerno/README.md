# Cerno 主站接入

独立业务源码主维护工程为 `D:/code/code-tpl/cerno-template/`，本目录仅提供包引用与宿主适配。主站注入微域生光双语品牌、Logo、市场入口及示例备案，不复制通用页面。

开发：在 website 执行 `node scripts/deformo-package.mjs local D:/code/code-tpl/cerno-template --id cerno`，再 `pnpm dev`。忽略的 cerno.local 仅用于本地；生产只读取 vendor 固定包。

交付：独立工程检查、截图、bundle 后，在 website 执行 `node scripts/deformo-package.mjs snapshot <包路径> --id cerno`、`pnpm install`、`node scripts/deformo-package.mjs check --id cerno`、类型检查与 build。归档、templates/cerno.lock.json、package.json 和 pnpm-lock.yaml 一并交付。

运行素材和截图由同步器生成到 public/templates/cerno，只管理该模板。独立截图源在 .tpl/assets。详情 `/templates/cerno`，整站 `/templates/cerno/site`，英文 `/templates/cerno/site/en`。16 页 / 32 条双语路由。

公开源码仓库：<https://github.com/weelume/cerno-template>。已按用户要求创建并上传独立模板；主站直接登记真实 Git 地址，部署快照仍保持原版本。参考素材商用与再分发许可仍需核实，listed=false，不代表网站已经部署或市场已经上架。
