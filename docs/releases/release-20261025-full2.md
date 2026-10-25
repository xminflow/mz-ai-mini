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

冻结源码后，只在本地 WSL Ubuntu Linux 文件系统 `/home/xmin/workspace/weelume-releases/release-20261025-full2/website` 安装依赖、构建和验收镜像。服务器仅接收成品、加载镜像、检查候选实例、切换和回滚，不安装构建依赖或编译源码。生产使用本地验收的同一份镜像归档，摘要待产物生成后记录。

正式切换前检查本地及服务器候选的首页、目录、模板详情、中英文首页、截图与静态素材、API 代理，以及 EstayMart 关于页和新引导文案。切换后验证公网入口与容器健康状态。旧容器按 `<原名>-previous-20261025-full2` 保留，关闭自动重启；切换错误时逆序恢复旧容器、名称和 always 策略，不覆盖数据库。

## 当前状态

模板源码和 ZIP 交付已准备，生产尚未切换。构建、产物摘要、部署结果和公网验收将按实际结果补记。过程文件位于 `artifacts/releases/release-20261025-full2/`。

本次不重做全部模板的三端逐帧动效矩阵，保留各模板已有应用验收及未完成项。源码/ZIP 公开与生产部署不代表素材获得商业再分发授权。
