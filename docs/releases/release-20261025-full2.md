# 完整追加版本发布（2026-10-25）

版本 `release-20261025-full2`。用户要求完整发布一个版本，包含最新更新的模板；另明确授权 Pawlio 完整源码公开至指定 GitHub 仓库和既有 COS 专用目录，以及官网、后端、AI 营三个生产服务切换，保留旧版本并在失败时回滚。

## 发布范围

包含 Benjamen、JiroNews、Ospey、Spycat、Vetala、Consutech、EstayMart、Pawlio、Zenpanda、Kittypaw、Velara、Kelo 共 12 套模板的当前固定包、宿主接入、注册、依赖锁、模板锁、源码 ZIP 与交付记录。包含 Kittypaw 和 Velara 的最新截图修复、EstayMart 关于页标题间距调整、模板目录首批 9 项及滚动分批加载、WorkBuddy / 豆包引导文案更新。保留各模板当前上架状态和素材权利声明，不自动上架。

后端和 AI 营无源码变更，复用现网已发布镜像并标记本次版本。没有数据库升级，不变更其他项目或共享网关。工具调度状态、开发自动生成类型引用、未引用旧模板包、`.work` 和采集素材不提交；其他用户修改保留。

## 模板交付

12 套独立工程的真实远端分支、提交和固定包摘要已核对。EstayMart 未提交的关于页调整已在本地 WSL 通过类型、Lint、测试、生产构建、44 条语言路由及未知路径 404（共 45 项）验证；提交 `72ab44326559ca80eb3d94b51156c6977d5f984b`，分支 `codex/estaymart`，已推送且远端一致。

Pawlio 已补真实仓库 https://github.com/weelume/pawlio-template ，分支 `codex/pawlio`，提交 `73eff1efec0f659c39e1785d0fb20a19d3368159`，已推送且远端一致；元数据更新后通过独立类型、Lint、测试、生产构建、两种语言首页及未知路径 404（共 3 项），源码摘要报告匹配。保留 scaffold 阶段与视觉/素材许可限制，不将命令检查等同完整视觉验收。

两套模板均从干净提交重新 bundle，主站通过原生 `template:update` 刷新包和来源锁，由本地 WSL 的 pnpm 更新依赖锁。Benjamen、Pawlio、EstayMart 本次通过 `pnpm template:release --ids benjamen,pawlio,estaymart` 生成完整源码 ZIP、上传 COS，并完成匿名完整下载、SHA256 和 ZIP CRC 校验；其余模板保留与当前快照一致的既有发布记录，所有共享模板发布门禁已通过。

## 构建与回滚

主站源码冻结为 `0608be05c3498894bc539f78c1d1f24a2863d23e`，已推送 `origin/dev` 并核对远端一致。只在本地 WSL Ubuntu Linux 文件系统 `/home/xmin/workspace/weelume-releases/release-20261025-full2/website` 安装依赖、构建和验收镜像。完整生产构建、内置类型检查、Lint 和全部模板快照 / ZIP 发布门禁通过；模板发布清单合同测试 1 项通过。Git 自动整理较大的模板包历史时，从已生成的明确提交只读导出独立 `source-frozen.tar` 作为构建输入，没有干预或覆盖 Git 维护。

服务器仅接收成品、加载镜像、检查候选实例、切换和回滚，不安装构建依赖或编译源码。官网归档 `images.tar.gz` 为 1,118,079,124 字节，SHA256 `8bd2db50098c0a152ddf255bf24c53226dd4cf083e414d16b92b4bc00ca5830b`，生产镜像配置 ID `sha256:bc844af6a361f50c6fdf5239750b548648d9fcde70ea1643c4f820fbbfb9cba9`。镜像标签中的源码提交与冻结输入一致，服务器加载后的镜像 ID 与本地归档配置摘要一致，实际部署为同一成品。

本地最终生产镜像在 3047 端口通过 185 项 HTTP 验收：首页、目录、API 代理、12 套模板详情 / 中英文首页、144 张三端截图，以及 EstayMart 两种语言关于页。所有截图下载字节与固定包中的 WebP SHA256 一致；首页及目录确认首批 9 张卡片和新 WorkBuddy / 豆包引导文案，关于页确认紧凑标题样式。此前滚动加载改动已执行真实浏览器滚动、分类重置及结束状态检查，本轮没有重复完整浏览器交互矩阵。

服务器候选仅绑定本机 33026 端口，通过版本摘要、API 代理、首批卡片数量、引导文案、关于页及 36 项模板详情 / 双语首页检查后才正式切换。切换完成后已移除本任务的临时候选实例。旧容器按 `<原名>-previous-20261025-full2` 保留，关闭自动重启；脚本配置错误时逆序恢复旧容器、名称和 always 策略，不覆盖数据库。人工回滚应先停止并移开新容器名称，再恢复对应旧容器原名及 always 策略，核对 previous-image 记录后启动并检查。

## 当前状态

**完整版本已成功上线**，切换脚本以 `ALL_SERVICES_RELEASED` 结束，未触发回滚。

| 服务 | 当前版本与镜像 | 验证结果 |
| --- | --- | --- |
| 官网 | `weelume-website:release-20261025-full2`，`sha256:bc844af6a361f50c6fdf5239750b548648d9fcde70ea1643c4f820fbbfb9cba9` | running / healthy，重启策略 always |
| 后端 | `weelume-backend:release-20261025-full2`，复用 `sha256:809939ba75654914abcb31af1616ac0a7a7fafcf16ec9fd4203117da90695002` | running，公网健康接口 production / ok，重启策略 always |
| AI 营 | `weelume-aicamp:release-20261025-full2`，复用 `sha256:160eba83679867ef23d6adb37e0ebbb0e7caa10c3c2302bfa2aa93f79477e971` | running / healthy，公网首页 200，重启策略 always |

正式域名 https://weelume.com 的 185 项 HTTP 检查全部通过，与本地使用同一组页面、截图摘要和文案 / 首批数量断言；https://api.weelume.com/api/v1/health 返回 production / ok，https://ai.weelume.com 返回 200。官网启动日志正常。旧版三个容器均已停止并保留，重启策略 no；旧镜像和历史归档保留。本轮没有清理服务器缓存、历史镜像、数据卷或数据库，结束时可用空间约 11 GB。

过程文件位于 `artifacts/releases/release-20261025-full2/`，包含 `template-audit.json`、两套独立源码验收和路由记录、`website-build.log`、`image-verification.json`、`local-http.json`、`public-http.json`、`stream-load.log` 和 `deploy.log`。本地常用官网 3000、后端 8001 与历史 3045 预览未在本次生产切换中替换。

本次不重做全部模板的三端逐帧动效矩阵，保留各模板已有应用验收及未完成项。源码/ZIP 公开与生产部署不代表素材获得商业再分发授权。
