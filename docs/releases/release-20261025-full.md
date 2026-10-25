# 完整版本发布（2026-10-25）

版本 `release-20261025-full`，用户要求发布所有代码并包含最近更新模板。

## 范围与验收

官网包含 Rescale、Portfolica、OfferSuite、Shelta、Noter 的宿主适配、注册、固定模板包、依赖锁、模板锁、COS 源码 ZIP 和交付记录。保留原有 `listed=false` 及素材授权状态，不自动上架。沿用既有生产发布范围：官网、后端、AI 营；后两者无源码变化，复用原镜像。无数据库升级。

用户补充明确授权纳入 Studio Kit 删除，164 个已有删除文件已提交并推送，提交 `ad260fbad6d848402fe5040515424ba805f19102`。其不属于三个生产服务的构建上下文，官网运行代码与已验收镜像保持一致。`.claude` 调度状态、开发自动生成类型配置和未引用旧模板包继续保留本地，不发布工具配置。

Noter 已补齐真实源码仓库 https://github.com/weelume/noter-template ，分支 `codex/noter`，提交 `5cbccf1bd2bf9acbf7bc875ef309f8eb7e74125a`，远端 SHA 一致。更新 Git 元数据后，本地 WSL 冻结安装、类型、lint、3 项合同测试、生产构建与协议格式检查通过。其 stage 保持 scaffold，未声称完整视觉/动效验收通过。

Noter 与 Portfolica 本次通过既有 `pnpm template:release --ids noter,portfolica` 生成完整已提交源码 ZIP、上传 COS、匿名下载并验证 SHA256 和 ZIP CRC。其余新增模板沿用已验证的 ZIP 发布记录。所有模板的源码提交与快照清单检查已通过。

## 构建、切换与回滚

构建位置为本地 WSL Ubuntu Linux 文件系统 `/home/xmin/workspace/weelume-releases/release-20261025-full/website`。只从冻结提交构建，不读取本机模板源码映射。生产镜像在本地构建、验收和导出后，流式传输至服务器。服务器只接收、加载、启动候选实例、检查、切换和回滚，不构建。

完整生产构建、类型和模板快照检查均通过。为减少服务器加载空间，在本地 WSL 对完整成品和现网同版基础镜像逐文件比较后构建增量镜像，复用的两个基础层摘要与生产一致；新增层约 197 MB。增量成品与完整构建的 12,923 个应用文件项列表、内容、权限和归属均一致。镜像准备与加载阶段没有清理服务器缓存或历史产物；后续按用户单独授权执行的缓存清理见下文。

官网镜像归档 939,292,596 字节，SHA256 `1465a7b81ee553d1d016a988bebace9a2220eaa14887919ff900427ca71c5d06`。生产配置摘要 / 镜像 ID 为 `sha256:37dc7e2ec96c1c23f16cc5f6f17e46ae5a49b446efce13247e0dd7a4d5725205`；服务器已加载并核对一致。业务源码提交 `a5a24f5960d0c29782a5c9b0293ef1ec7fde1513` 已推送至 `origin/dev` 并核对远端 SHA。

最终镜像在本地 3046 端口通过 22 项 HTTP 检查：首页、API 代理、五个模板详情、中英文首页及实际 WebP 截图。正式切换前，服务器候选实例 `website-candidate-20261025-full` 仅绑定 `127.0.0.1:33025`，其首页、API 代理和同样的 20 项模板页面 / 截图检查全部通过。浏览器交互和完整模板页面矩阵未在本轮重复验收，保留各模板既有验收记录及其限制。

正式切换脚本已执行成功：保留旧容器为 `<原名>-previous-20261025-full`，逐服务切换并执行健康检查；脚本配置错误时逆序恢复旧容器。旧镜像、数据库及发布归档保留，不恢复数据库覆盖新数据。切换完成后已移除本任务的临时候选实例。

## 当前状态

**已完成生产发布**。自动审批最初拒绝停止并替换三个生产容器，要求明确授权；用户随后明确授权官网、后端、AI 营切换，保留旧版本并失败回滚，之后正式执行成功。三个服务均运行 `release-20261025-full`，重启策略 `always`；官网和 AI 营为 `healthy`，后端健康接口返回 `status: ok`。

用户同时单独授权仅清理未使用的 Docker 构建缓存。执行 `docker builder prune --all --force`，Docker 报告回收 17.8 GB 缓存，文件系统实际可用空间由约 1.7 GB 增至约 13 GB；没有删除镜像、历史容器、数据卷、数据库或发布归档，没有在服务器构建。

公网 https://weelume.com 的 22 项 HTTP 检查全部返回 200，含五套新增模板详情、中英文首页和实际 WebP 截图；https://api.weelume.com/api/v1/health 与 https://ai.weelume.com 均返回 200。官网 API 代理也通过真实生产调用。官网启动日志正常，未发现本轮启动错误。

回滚容器 `website-previous-20261025-full`、`weelume-backend-previous-20261025-full`、`ai-camp-previous-20261025-full` 已停止并保留，重启策略 `no`。回滚时先停止新容器并移开其名称，再将对应旧容器恢复原名、恢复 `always` 并启动；使用旧镜像前核对本目录的 previous-image 记录，不覆盖业务数据库。

过程记录：`artifacts/releases/release-20261025-full/`，包括 `image-verification.json`、`local-http.json`、`public-http.json`、`candidate.log`、`stream-load.log`、`build-cache-prune.log` 和 `deploy.log`。

模板完整原站动效逐帧对照、素材商业再分发许可等已有未完成项沿用各交付文档。本次发布检查不代表这些项目已完成。
