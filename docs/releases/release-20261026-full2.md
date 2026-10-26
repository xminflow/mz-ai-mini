# 完整版本最终发布（2026-10-26）

**最终版本 release-20261026-full2 已上线，正式域名完整验收通过。** 首轮 release-20261026-full 成功上线后，用户明确要求将发布期间新产生的 Habitline 1.0.5 补入；因此重新冻结、构建并验证同一组八套模板，最终切换三个服务。首轮详细过程保留在 release-20261026-full.md。

## 发布范围

七套首次随完整版本上线：Alex、CreationAI、Habitline、StockLens、Kelo Marketing、LearnAI、Playora；另更新 Velara，共八套。包括 CreationAI/LearnAI 最新滚动条增量、Playora 宿主滚动条和精确设备视口、Habitline 1.0.5 的 html/body 暖橙滚动条作用域修复。CryptoCalc 路径永久跳转至 StockLens，保留后续路径和查询。

| 模板 | 最终版本 | 独立源码提交 |
| --- | --- | --- |
| alex | 1.0.1 | 484e32640c5ba9a34a67daaf7b11e348884a5ebf |
| creationai | 1.0.0 | 1872381385dbfc51b8e2c157dc73ae81c9f07a00 |
| habitline | 1.0.5 | 9c11596f1a19ebd3de5e1c24a5e5739f6bd08285 |
| stocklens | 1.2.0 | e4030078a2be3b47d614ea74fde6d28028857790 |
| kelo-marketing | 1.0.0 | 1a9701db76cdf1a573a5ffd4b12079953e2f55a4 |
| learnai | 1.0.1 | e97fc8db0fa81a4fd8deae3b0f73741280819c5e |
| playora | 1.0.1 | 94a6ea8177edc23f08dfeabfb0632d00dc4657a3 |
| velara | 1.0.2 | f89ac86092e9443f440a41633e6e97d6b2d3b790 |

八套真实Git地址、远端提交和固定包关系已核对。CreationAI和LearnAI未提交增量在本次任务中完成本地WSL检查、匹配摘要的报告、源码提交和推送；Alex同步最新1.0.1。Habitline 1.0.5的干净克隆严格协议检查通过，报告摘要fc698c38ce82ac1b1151b08ee0f8ac49111e1c11af15a32a8f99d3963d2fa233匹配，远端为上表提交。其既有独立和宿主验收由对应交付文档记录，不以协议检查冒充重新执行全部浏览器交互。

全部完整源码ZIP均使用既有COS专用目录，八套在最终冻结后再次匿名完整下载，SHA256、大小和ZIP CRC通过。发布清单与固定快照一致，不回退Git下载、不覆盖或删除旧对象。保留各模板既有listed和素材权利状态，未自动市场上架。后端与AI营无源码变化，复用既有镜像；无数据库升级。

## 本地构建与同产物部署

冻结主站提交 3020a622e4f4048ab6434eeda0f41f0576c9b0a4 已正常推送origin/dev并核对远端。仅提交追加版本相关固定包、依赖声明/锁、模板锁和源码ZIP清单；其他工作未提交修改保留，不进入冻结镜像。

实际构建位置为本机WSL Ubuntu Linux文件系统 /home/xmin/workspace/weelume-releases/release-20261026-full2/website，Docker daemon为本机LAPTOP-MRD00VO0。冻结依赖安装、完整生产build、内置类型/Lint、全部共享模板快照与ZIP门禁通过。服务器只接收成品、加载镜像、启动候选、检查和切换，不构建、不安装依赖。

- 官网镜像：weelume-website:release-20261026-full2。
- 镜像配置ID：sha256:3b04ceb28bbcab3bebf87bb8abfb5bfc50d09c1d30f093b6a0e62e6d049c9d42。
- 成品归档大小：1261817302字节。
- 归档SHA256：480cd3a178a7a9ea23a334df53ccc0f2d6c6d7727d351c0146f1cf80106a8843。

本地最终镜像、服务器候选和正式域名https://weelume.com分别通过293项HTTP检查：八套全部双语页面、详情、三端实际WebP截图内容摘要、首页/目录与API代理，另含EstayMart关于页回归。三处分别通过11项检查：CryptoCalc的3条308跳转及八套未知页面404。候选仅监听127.0.0.1:33028，服务端镜像配置ID和冻结源码标签与本地归档一致，生产使用同一成品。

## 生产结果与回滚

脚本以ALL_SERVICES_RELEASED结束，未触发回滚。官网、后端、AI营均运行release-20261026-full2，重启策略always；官网/AI营healthy，后端公网健康接口production/ok，AI营公网首页200，官网启动日志正常。

后端镜像ID仍为sha256:809939ba75654914abcb31af1616ac0a7a7fafcf16ec9fd4203117da90695002，AI营仍为sha256:160eba83679867ef23d6adb37e0ebbb0e7caa10c3c2302bfa2aa93f79477e971。

直接回滚点为首轮已验收版本：website-previous-20261026-full2、weelume-backend-previous-20261026-full2、ai-camp-previous-20261026-full2均停止保留，策略no；更早版本容器/镜像继续保留。失败时脚本按逆序恢复原容器。人工回滚先停止并移开新容器，核对previous-image记录，恢复旧容器原名及always策略后启动并检查，不覆盖数据库。服务器候选已移除，没有清理服务器镜像、缓存、卷、数据库或其他项目。

## 限制与证据

未重新执行所有模板三端逐帧动效及系统减少动态矩阵；素材商业再分发权利尚有未核实项，沿用各交付记录。构建保留既有Lint/打包警告；Alex和LearnAI中文字体URL导入位于已展开滚动条规则之后，存在CSS导入顺序警告，可能影响中文字体，尚未做最终字体视觉验证，建议在独立源码修复并重新打包发布。未以构建/HTTP通过宣称完整视觉或素材授权验收通过。

证据位于artifacts/releases/release-20261026-full2/：source-commit.txt、website-build.log、image-verification.json、zip-verification.json、local-http.json、candidate-http.json、public-http.json、三份compatibility.json、stream-load.log、candidate.log、deploy.log、production-status.log。首轮独立模板增量检查及审计证据位于对应release-20261026-full目录。本任务临时本地镜像验收容器完成后移除，原有预览服务保留。
