# 完整版本发布（2026-10-26，首轮）

版本 `release-20261026-full` 已成功上线，正式域名验收通过。发布期间又产生 Habitline 1.0.5，用户明确要求追加发布；最终版本状态另见 `release-20261026-full2.md`，本记录保留首轮实际交付信息。

## 范围与源码

共八套：Alex 1.0.1、CreationAI 1.0.0、Habitline 1.0.4、StockLens 1.2.0、Kelo Marketing 1.0.0、LearnAI 1.0.1、Playora 1.0.1、Velara 1.0.2。前七套首次随完整版本上线，Velara 更新；包括 CreationAI、LearnAI 最新滚动条改动及 Playora 宿主滚动条与精确设备视口适配。StockLens 旧 CryptoCalc 地址永久跳转并保留路径和查询参数。保持既有上架与素材权利状态，不自动上架。

八套独立工程工作树、源码提交、远端 SHA、固定包及 ZIP 一致性已核对。CreationAI 滚动条增量提交 `1872381385dbfc51b8e2c157dc73ae81c9f07a00`，LearnAI 增量提交 `e97fc8db0fa81a4fd8deae3b0f73741280819c5e`，均已推送各自既有分支并核对远端。两套在本地 WSL 隔离克隆执行 typecheck、lint、test、build、全部双语生产路由和未知路径404，分别通过25项和31项HTTP检查，报告源码摘要匹配。LearnAI 新增CSS在隔离克隆登记Git后重新完成严格交付检查。

Alex 固定包同步已提交的1.0.1。Alex、CreationAI、LearnAI 本次使用既有 `pnpm template:release --ids ...` 在本地 WSL 打包完整已提交源码，上传COS专用目录并匿名下载校验；其余五套沿用匹配的已发布对象。八套全部重新匿名下载检查，SHA256、大小和ZIP CRC通过。所有共享模板发布门禁和发布清单合同测试通过。

主站冻结提交 `b5c7a4efc1cd1fbbef3ef6873c078fb1c8def1cd`，已正常推送 `origin/dev` 并核对远端。构建输入从明确提交只读导出，不包含工具调度状态、开发生成类型配置、未引用旧包、采集素材或未提交修改。后端和AI营无源码变更，复用既有镜像，无数据库升级。

## 构建与验收

实际构建位置：本机 WSL Ubuntu Linux 文件系统 `/home/xmin/workspace/weelume-releases/release-20261026-full/website`，本机 Docker daemon `LAPTOP-MRD00VO0`。冻结安装、完整生产构建、内置类型/Lint、模板快照与ZIP门禁通过；保留既有无效eslint-disable等警告，无构建错误。成品镜像整理后使用最终归档对应的同一镜像执行验收。

- 镜像：`weelume-website:release-20261026-full`。
- 配置ID：`sha256:de2a8e0fc734045400b1e31c6cbc6ee70e8990a5d5d87382fc712dda4024340c`。
- 归档：1,261,827,778字节；SHA256 `93fdb0bcc310dfe6ccea283f44b07d29d99a066679a47b56f3707541995425ef`。
- 本地最终镜像、服务器候选、公网 `https://weelume.com` 各通过293项页面、API代理及截图摘要检查，含八套全部双语路径、三端实际WebP截图及既有EstayMart关于页回归。
- 三处各通过11项兼容检查：3条CryptoCalc永久跳转和8套模板未知路径404。

Habitline包未携带template.json，验收脚本明确从固定包对应源码提交导出元数据并验证提交一致，不读取未冻结工作树。最初沿用上一版脚本的EstayMart专属断言被错误应用于其他about页，已限定到EstayMart；Windows UTF-8读取也已显式修正，以上统计均来自修正后的完整通过记录。

服务器仅加载成品、启动候选和切换，不安装依赖、不构建。候选只绑定127.0.0.1:33027，镜像配置与源码标签均匹配本地产物。正式脚本以 `ALL_SERVICES_RELEASED` 结束，没有回滚。

## 服务与回滚

官网和AI营healthy，后端公网健康响应production/ok；三者运行本版本且重启策略always。后端镜像ID `sha256:809939ba75654914abcb31af1616ac0a7a7fafcf16ec9fd4203117da90695002`，AI营 `sha256:160eba83679867ef23d6adb37e0ebbb0e7caa10c3c2302bfa2aa93f79477e971`。

旧容器以 `<原名>-previous-20261026-full` 停止保留，重启策略no，旧镜像及历史归档保留。自动回滚按切换逆序恢复旧容器；人工回滚应先停止并移开新容器，再恢复对应旧名称、always策略并启动，核对previous-image记录，不覆盖数据库。服务器候选已移除；本轮未清理缓存、镜像、卷、数据库或其他项目，结束时可用空间约9.5GB。

证据：`artifacts/releases/release-20261026-full/` 的template-audit.json、独立源码检查日志/报告、zip-verification.json、website-build.log、image-verification.json、local-http.json、candidate-http.json、public-http.json、三份compatibility.json、deploy.log及production-status.log。

本轮不重做全部原站三端动效逐帧与系统减少动态偏好矩阵，沿用各模板交付记录的未完成项；公开源码和部署不代表取得素材商业再分发授权。构建还存在Alex和LearnAI中文字体导入顺序警告：滚动条CSS先展开后，MiSans的URL导入位于普通规则之后，可能影响中文字体加载，尚未做最终字体视觉验证；建议在独立源码中修复导入顺序，重新验证、打包和发布。
