# 完整版本发布（2026-10-25）

版本 `release-20261025-full`，用户要求发布所有代码并包含最近更新模板。

## 范围与验收

官网包含 Rescale、Portfolica、OfferSuite、Shelta、Noter 的宿主适配、注册、固定模板包、依赖锁、模板锁、COS 源码 ZIP 和交付记录。保留原有 `listed=false` 及素材授权状态，不自动上架。沿用既有生产发布范围：官网、后端、AI 营；后两者无源码变化，复用原镜像。无数据库升级。

Studio Kit 删除记录、`.claude` 调度状态、开发自动生成类型配置、未引用旧模板包保留本地，不纳入业务服务产物。

Noter 已补齐真实源码仓库 https://github.com/weelume/noter-template ，分支 `codex/noter`，提交 `5cbccf1bd2bf9acbf7bc875ef309f8eb7e74125a`，远端 SHA 一致。更新 Git 元数据后，本地 WSL 冻结安装、类型、lint、3 项合同测试、生产构建与协议格式检查通过。其 stage 保持 scaffold，未声称完整视觉/动效验收通过。

Noter 与 Portfolica 本次通过既有 `pnpm template:release --ids noter,portfolica` 生成完整已提交源码 ZIP、上传 COS、匿名下载并验证 SHA256 和 ZIP CRC。其余新增模板沿用已验证的 ZIP 发布记录。所有模板的源码提交与快照清单检查已通过。

## 构建、切换与回滚

构建位置为本地 WSL Ubuntu Linux 文件系统 `/home/xmin/workspace/weelume-releases/release-20261025-full/website`。只从冻结提交构建，不读取本机模板源码映射。生产镜像在本地构建、验收和导出后，流式传输至服务器。服务器只接收、加载、启动候选实例、检查、切换和回滚，不构建。

正式切换前验证本地成品的首页、五个模板详情和双语示例页、模板截图，以及生产候选实例的健康状态。上线后验证三个服务的可用性与发布版本。保留旧容器和镜像以便回滚，不恢复数据库覆盖新数据。构建摘要、传输结果和上线结果待实际完成后补记。

## 当前状态

发布准备中，尚未切换生产。过程记录：`artifacts/releases/release-20261025-full/`。

模板完整原站动效逐帧对照、素材商业再分发许可等已有未完成项沿用各交付文档。本次发布检查不代表这些项目已完成。
