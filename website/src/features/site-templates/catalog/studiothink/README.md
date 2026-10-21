# Studiothink 主站接入

独立源码 D:/code/code-tpl/studiothink-template，Git：https://github.com/weelume/studiothink-template。本目录仅维护宿主适配，不复制通用页面。

开发 template:local；生产本地 WSL bundle → template:update --id studiothink → pnpm 更新锁 → template:check → 本地 WSL build。运行素材与截图从包生成。验收及回滚见 docs/template-migrations/remaining-seven.md。
