# Latte 模板实现与主站接入验收

## 交付与访问

- 独立主维护工程：`D:/code/code-tpl/latte-template`，参考 code-tpl 的 UIUXfolio 与 git-template 0.2.0 结构。
- 主站适配：`website/src/features/site-templates/catalog/latte/`，仅保留包引用、Provider 与接入说明；通用页面不复制进主站。
- 本机主站已接入并运行于 `http://127.0.0.1:3000`。首页、`/templates` 均显示 Latte；详情 `/templates/latte`，整站 `/templates/latte/site`，英文 `/templates/latte/site/en`。
- 固定部署包为 `website/vendor/latte-template-1.0.0-d38b81861d24.tgz`；SHA256、版本与来源状态见 `website/templates/latte.lock.json`。package.json 与 pnpm 锁已由包管理器更新，未升级第三方版本。
- 开发由忽略的 `latte.local` 引用独立源码并同步素材。生产引用随仓包，不读取本机模板路径。源码尚未提交，sourceCommit=null、sourceDirty=true。

## 范围

11 页、22 条中英文路由：首页、新闻列表、五篇新闻、联系页、隐私、Cookie 与使用条款。照片轮播、四组图文交替菜单、新闻轮播、本地演示表单，支持桌面、iPad、手机与 320px 窄屏。默认中文；语言切换保留页面、查询与锚点。字体与图片本地托管，图片来源和 SHA256 随独立工程保留。

独立工程显示 Latte 品牌；主站注入微域生光中英文品牌、Logo、市场入口与示例备案。三端各四张真实截图覆盖首页、菜单、新闻和联系，共 12 张。文章按原站五个主题重新编写双语文案，不冒充逐字译文。表单不发送、不保存、不创建预约；地址、菜单、评分等为演示。

## 问题根因与处理

上一轮只完成源码与接入草稿，未实际登记主站 registry、安装运行包或生成截图，所以主站不会显示。此次补齐这些步骤，新增共享模板标识与 Next 包转译，执行素材同步和固定快照校验。

运行时还发现本机两个开发服务共写 `.next-templates-dev`，配置重载后出现 500。开发启动器现将显式端口传给配置，按端口隔离缓存；重启 3000 主服务后，使用 `.next-templates-dev-3000`。保留另一预览服务。相关 Next 自动生成类型入口已更新。

## 已执行验证

| 项目 | 结果 |
| --- | --- |
| 独立 `pnpm install --offline`，再 `--offline --frozen-lockfile` | 通过；固定既有版本 |
| 独立 `pnpm typecheck`、`pnpm lint`、`pnpm test` | 通过；3 项合同测试，包括真实截图文件存在性 |
| 独立 `pnpm build` | 通过；双语注册页生成 |
| 独立 `pnpm verify:browser` | 88 个页面/语言/视口组合和 10 项交互通过 |
| 菜单两张照片对应关系修正 | 重建后在三端实际复查并刷新首页、菜单截图；对应关系和溢出检查通过 |
| 主站 `pnpm exec tsc --noEmit`、改动 TS 文件 ESLint | 通过；配置重载时首次检查遇到生成类型文件被重建，稳定后复跑通过 |
| 主站 `node --test scripts/tests/deformo-package.test.mjs` | 2 项通过；先复现未登记 Latte，再验证修复 |
| 主站 `template:check --id latte` | 固定归档摘要、已安装版本、依赖路径一致 |
| 主站页面巡检 | 88 组合中 87 项首次通过；平板中文 Cookie 页首次出现浏览器 Uncaught，单独复查通过，连续复查结果见 tablet-repeat-report.json；原始失败记录保留 |
| 首页、市场、详情与真实预览操作 | 13 项通过：Latte 可见、三端各四图、实际点击新标签页、834×1180 / 390×844 框内视口、菜单与语言、演示表单、Deformo / UIUXfolio 回归 |
| 固定生产包本地运行 | 显式设置现有 `TEMPLATES_MODULE_ENABLED=true` 后，目录、详情、中文首页、英文新闻和联系页实际路径与内容通过 |
| 主站 `pnpm build` | 编译、类型、页面生成通过；Windows standalone 归档阶段 EPERM，完整生产归档未通过 |

原始证据：`artifacts/latte/host-report.json`、`marketplace-report.json`、`production-runtime-report.json`、`tablet-cookies-recheck.json`、`tablet-repeat-report.json`；主站截图与运行日志在 `artifacts/latte/host/`、`main.stdout.log`、`main.stderr.log`。独立浏览器报告、照片修正报告与截图在其 `.tpl/reports/`、`.tpl/assets/`。

生产验证使用本地 43273 专用端口与已编译页面，验证固定包能被加载；不代表 standalone 产物或部署已通过。未设置模块开关时，现有生产逻辑会 307 返回首页，不能把返回 200 的首页误判成模板可访问。本次未改变该开关的默认策略。

## 限制与后续

1. 未部署到公网，线上主站尚不包含本次本地变更。
2. Windows 符号链接权限导致 standalone 归档失败；Linux/Docker 完整归档未验证。
3. 未提供实际 Git 地址，gitUrl=null、stage=scaffold，完整协议验收仍受限；未创建远端、提交、推送。
4. 参考素材再分发许可未确认，listed=false；不影响本地模板目录显示，不公开上架或出售。
5. 完整巡检的一项首次浏览器异常保留为证据，不能将原始报告表述为零失败。独立页面、主站定点复查与市场操作结果分别记录。

修改通用模板继续在独立工程维护；主站接入命令见 catalog/latte/README.md。模板包、SHA256 锁、package.json 与 pnpm 锁一起交付。
