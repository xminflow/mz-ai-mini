# Grovia 主站接入

通用源码：D:/code/code-tpl/grovia-template。Git：https://github.com/weelume/grovia-template。此目录只保留注册和宿主适配。

开发：在 website 执行 node scripts/deformo-package.mjs local D:/code/code-tpl/grovia-template --id grovia。生产使用 vendor 固定包；更新时先独立验证和 bundle，再执行 template:update、pnpm install、template:check 和 build。

运行素材由包生成到 public/templates/grovia，不能手工修改。独立截图 .tpl/assets 映射至 screenshots。主站品牌、市场入口、示例备案在 weelume.tsx 注入；迁移与验收资料见 docs/template-migrations。
