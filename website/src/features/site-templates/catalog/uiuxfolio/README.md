# UIUXfolio 主站接入

通用源码的主维护工程为 `D:/code/code-tpl/uiuxfolio-template`。本目录仅保留共享包的 meta 与宿主 Provider 适配，不复制页面、样式、文案或运行素材。独立工程使用 UIUXfolio 品牌；主站注入微域生光品牌、市场入口与示例备案，宿主内容不得回写独立工程。

开发连接：在 website 执行 `node scripts/deformo-package.mjs local D:/code/code-tpl/uiuxfolio-template --id uiuxfolio`，再运行 `pnpm dev`。本地源码热更新，素材由同步器监听。`uiuxfolio.local` 不提交。

生产更新：先在独立工程检查、截图，再执行 `pnpm bundle`；主站运行 `node scripts/deformo-package.mjs snapshot <运行包.tgz> --id uiuxfolio`、`pnpm install`、`node scripts/deformo-package.mjs check --id uiuxfolio` 和 `pnpm build`。生产只引用 vendor 中带 SHA256 的固定运行包，不读取本机源码路径。运行包、templates/uiuxfolio.lock.json、package.json 与 pnpm-lock.yaml 一起交付。

独立工程 `.tpl/assets` 映射到主站 `public/templates/uiuxfolio/screenshots`。截图反映独立模板的 UIUXfolio 品牌，主站运行预览显示宿主品牌。不要手工修改生成素材或将宿主截图回写独立模板。参考站无博客，因此截图以首页、作品区、案例详情、联系区覆盖三端四张，不虚构博客内容。

真实 Git 地址尚未提供，独立元数据 gitUrl=null；完整模板协议检查因此不通过。参考素材再分发许可未确认，保持 listed=false，不推送或部署。案例图像中的原始英文保留，页面与操作提示支持中英文。
