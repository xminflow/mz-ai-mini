# 完整版本发布（2026-10-26，full3）

**release-20261026-full3 已上线，正式域名完整验收通过。**

## 发布范围与冻结输入

新增六套独立模板：Solaris、Newcomer、Rhys、Hydrowell、Goalz、Designfast；更新 Rescale 1.0.1；发布首页模板运行资源隔离、默认可见首屏和自动目录生成机制。官网目录共 56 套模板。沿用既有 listed 和素材权利标记，没有以源码发布或部署代替商业素材授权确认。

| 模板 | 版本 | 独立源码提交 |
| --- | --- | --- |
| solaris | 1.0.3 | a647481884cf3812f630aaef99e0d5097a8bc6ad |
| newcomer | 1.0.1 | e15b0e49342c829e038000081cfaa9c226f18114 |
| rhys | 1.0.2 | d7a544b84b46a25aeeeb8e24a863ff99b15f0b81 |
| hydrowell | 1.0.1 | 14f42dbe25dc6796de8cd8d2c1ed00fb8d5a3891 |
| goalz | 1.0.2 | fab23bd44014a3dc1d1e4f86cdb2f06802879e03 |
| designfast | 1.0.0 | 15decf989c0c0d0cafb4f49c2235a61289c5064a |
| rescale | 1.0.1 | 06bd7fb6a9a580a05198d05a7351f00eb0351f7d |

七套独立工程工作树与远端分支已核对，提交与固定包、源码 ZIP 清单一致。七份 COS ZIP 已重新匿名完整下载，大小、SHA256 与 ZIP CRC 全部通过；不覆盖或删除历史对象。

主站冻结提交 `dea305ab474c3d22078d37c0dd2d2c87253c2dd2` 已正常推送 origin/dev 并核对远端。仅提交本次模板与首页优化、固定包、锁文件和配套文档；UA 工程删除、调度状态、开发生成配置、未引用旧包和后续未冻结工作不进入此版本。后端、AI 营没有源码变更，使用已验收镜像；无数据库升级。

## 本地构建和成品

实际构建位置为本机 WSL Ubuntu Linux 文件系统 `/home/xmin/workspace/weelume-releases/release-20261026-full3/website`，Docker daemon 为本机 `LAPTOP-MRD00VO0`，使用本地 Unix socket，未使用远端 builder。基于既有已验收 Alpine/Node 22 镜像执行冻结安装、模板快照校验、ZIP 门禁、完整生产 build、内置类型/Lint，再按既有流程整理成独立运行镜像。

- 镜像：`weelume-website:release-20261026-full3`。
- 生产镜像配置 ID：`sha256:4dbc903431665ab8bcf7474c19772d7cc6128f15cb0f3e9860a77ebe12964ca3`。
- 成品归档：1,371,235,396 字节。
- 归档 SHA256：`0ebc52c224a538f5d2a60b6abbc4186147a6a8e5fa0dbc6370c8abda30fc624d`。

本地最终镜像通过 342 项 HTTP 检查：七套全部中英文页面、详情、84 张真实 WebP 截图字节摘要、首页/市场首批九张卡片、API 代理、Habitline/Deformo 双语入口和 EstayMart 关于页回归。另通过 12 项 CryptoCalc 的 308 兼容跳转与模板未知页面 404 检查。

最终镜像首页资源预算通过：3 个 CSS，解压合计 329,960 字节；HTML 引用的 JS gzip 估算合计 207,065 字节（含旧浏览器 polyfill）。首屏默认可见，未检出已确认的模板运行代码标记。前一性能验收使用本地开发配置，数字与此处冻结 Docker 生产产物有差异；发布以本条记录为准，不将资源体积对比冒充浏览器 FCP/LCP 测量。

## 部署与回滚

服务器只接收同一成品流、加载镜像、运行候选、健康检查和切换；不安装构建依赖、不编译源码、不生成镜像。镜像采用流式上传加载，不额外在服务器保存压缩归档。

候选仅绑定 `127.0.0.1:33029`。切换前已核对镜像配置 ID 与冻结提交标签，并通过同一份 342 项 HTTP 清单和 12 项兼容检查。切换脚本以 `ALL_SERVICES_RELEASED` 结束，未触发回滚；候选容器已移除。

正式域名 `https://weelume.com` 完成 342 项全量 HTTP 检查和 12 项兼容检查，资源预算与本地最终镜像一致。首次公网巡检有一条 Designfast 关于页请求读取超时，未计作完整通过；该页随后单独复查返回 200，gzip 传输约 0.18 秒，生产容器保持 healthy、无应用异常日志。保留首次失败日志后，按浏览器 gzip 请求语义重新执行完整清单，全部通过，没有跳过检查项或放宽正文及截图摘要断言。

三个服务均运行 full3 且重启策略为 always。官网与 AI 营容器 healthy；后端没有容器级 HEALTHCHECK，公网健康接口返回 production/ok，AI 营公网首页返回 200。后端镜像 ID 仍为 `sha256:809939ba75654914abcb31af1616ac0a7a7fafcf16ec9fd4203117da90695002`，AI 营仍为 `sha256:160eba83679867ef23d6adb37e0ebbb0e7caa10c3c2302bfa2aa93f79477e971`。官网新入口 JS 返回唯一的 `public, max-age=31536000, immutable` 缓存策略，之前的 Caddy 缓存修复继续生效。

直接回滚版本为 `release-20261026-full2`。旧容器已停止保留为 `website-previous-20261026-full3`、`weelume-backend-previous-20261026-full3`、`ai-camp-previous-20261026-full3`，重启策略为 no；没有删除旧镜像、历史版本、卷或数据库。切换失败时脚本会按逆序恢复。人工回滚需先核对上一版本镜像记录，停止并移开新容器，再恢复旧容器原名、always 策略并启动，检查公网与 API 健康，不覆盖数据库或后续业务数据。切换结束后服务器可用空间约 6.5 GB。

## 限制与证据

沿用独立模板已有交付验收，不宣称本次重新完成所有断点的动效逐帧、真实触控设备和减少动态偏好矩阵。LearnAI/Alex 字体导入顺序、已有无效 eslint-disable 等告警继续保留，不阻止构建；详见各模板交付记录。

证据位于 `artifacts/releases/release-20261026-full3/`：冻结源码、template-audit.json、zip-verification.json、构建/打包日志、image-verification.json、http-plan.json、local-http.json、candidate-http.json、public-http.json、三份兼容检查、local-resources.json、public-resources.json、stream-load.log、candidate.log、deploy.log、production-status.log 以及上一版镜像身份记录。首次公网失败日志保存在 public-http-attempt1.log，最终 public-http.log 对应完整通过结果。本任务本地镜像验收容器在完成后清理，镜像及发布产物保留。
