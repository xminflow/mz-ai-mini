# Tomasfolio 主站适配

独立源码 D:/code/code-tpl/tomasfolio-template，Git：https://github.com/weelume/tomasfolio-template。本目录仅保留注册与品牌、Logo、市场入口、示例备案注入。通用源码不复制。

开发：pnpm template:local --id tomasfolio D:/code/code-tpl/tomasfolio-template。生产：本地 WSL bundle → template:update --id tomasfolio → pnpm install 更新锁 → template:check --id tomasfolio → ZIP 发布检查 → 本地 WSL build。

主站使用 /templates/tomasfolio/site 及 /en。参考站 projects/korop.co 按现有主站路由约定使用 projects/korop-co，保留作品名称 Korop.Co。详情与三端预览沿用现有模板体系，listed=false。
