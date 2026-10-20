# Deformo 宿主适配

页面、文案、交互、样式和素材由独立 deformo-template 包提供。这里只维护 Weelume 的模板市场入口与示例备案展示，不再复制页面实现。

开发：在 website 执行 `pnpm run template:local <模板仓库目录>`，然后 `pnpm dev`。开发配置直读源码，监听同步素材；deformo.local 仅本机使用，不进入 Git 和镜像。生产 build/start 始终使用部署快照，忽略开发路径。

更新部署包：模板验证并提交后运行 `pnpm run bundle`，在 website 执行 `pnpm run template:update <tgz>`、`pnpm install --no-frozen-lockfile`、`pnpm run template:check`、`pnpm run build`。将 vendor 中当前引用包、templates/deformo.lock.json、依赖及锁文件一并提交。

public/templates/deformo 是生成素材，不直接编辑。其他模板及其公共字体不受本接入改变。完整集成规则见独立模板 docs/INTEGRATION.md；宿主信息不写入 .tpl。
