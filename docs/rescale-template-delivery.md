# Rescale 模板复刻与接入记录

日期：2026-10-24。参考站：<https://rescale.framer.ai/>。依据 `docs/template-replication-guide.md` 实现。没有部署主站或公开市场上架；不声明完整原站动效精确验收通过。

## 实现范围

独立源码：`D:/code/code-tpl/rescale-template/`。主站 `website/src/features/site-templates/catalog/rescale/` 只保留注册与品牌适配，页面、双语内容、主题、组件与运行素材由独立共享包提供。

覆盖首页、联系页、期刊列表、6 篇文章和 404，共 10 页、20 条双语路径。页面范围来自原站 sitemap 与实际公开链接，未虚构原站没有的政策页面。中文默认；英文端路径后加 `/en`，切换保留对应页面、查询参数与锚点。

实现蓝紫动态视频背景、玻璃卡片、悬浮导航和展开菜单、标题 Y 轴翻转与错峰、看板滚动透视、环形路径绘制与计数、报告文件轮换、伙伴环绕、棋盘翻转、流程滑块、集成节点、指标计数、团队两秒自动轮播与拖拽回弹、悬停暂停、客户视频、双列反向评价循环、月年价格切换、FAQ 高度过渡、按钮文字滚动、桌面跟随光标和页脚关键词轮换。

原站公开模块确认六项指标为 6K+、34K、200K、180K、92%、36K，系统可靠性 99%。团队配置为 2 秒间隔、允许拖拽、spring stiffness=200 / damping=40。详细清单与未完成对照见独立 `.tpl/docs/MOTION.md`；首屏原始参数保存在 `reference-appear.json`。

联系、订阅为演示表单，仅本地校验；明确提示不发送、不保存，不记录姓名、邮箱、电话与正文。未新增后端、数据库或外部业务服务。

## 素材与品牌

90 项原站素材本地托管，来源见独立 `public/templates/rescale/sources.json`。首屏实际使用 `9f3YOJWd8t3cibP1iqPDR1mCMro.mp4`；客户视频使用 `mzEJrfIah6lDBrFElC0qZbQTJ2o.mp4`，保留真实播放。字体为本地 MiSans 400 / 700 与 Poppins 400 / 600 / 700，保留许可文件。

独立工程保留 Rescale 品牌。主站注入微域生光 / Weelume、既有 Logo、深色固定市场入口和 `TemplateFiling` 示例备案；不把宿主信息写入通用模板。主站 `public/templates/rescale/` 为包同步生成目录。

独立 `.tpl/assets/` 包含首页、功能、期刊和联系页三端共 12 张真实截图。CSS 视口为 1440×1000、834×1180、390×844；浏览器工具输出图片的实际像素分别为 1425×990、819×1159、375×812，元数据按真实像素登记。

## 已验证内容

| 项目 | 结果与方式 |
| --- | --- |
| 独立冻结安装 | 本地 WSL Linux 干净 Git 克隆，离线缓存安装通过 |
| 独立类型 / Lint / 测试 / 构建 | `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 通过；3 项合同检查覆盖素材完整性、公开文章与页面路径、宿主隔离 |
| 独立生产 HTTP | 20 条路径、未知路由 404、90 项素材 HEAD 通过 |
| 独立生产浏览器 | 10 页 × 双语 × 1440 / 834 / 390 / 320，共 80 组，无页面横向溢出或关键损坏图片 |
| 实际交互 | 语言切换保留页面 / query / hash、有效演示表单、菜单与 Escape、年付切换、FAQ、加载第 6 篇文章、手机翻页、团队自动轮播、暂停 / 恢复通过 |
| 动效状态 | 环形数值实际达到 73% / 67% / 54%；流程滑块前后 transform 不同；伙伴循环暂停恢复；客户视频实际播放至 6 秒以上；桌面实际拖拽从 Zane 切换到 Ethan，释放后 transform 回到 none |
| 协议 | `.tpl/tools/check.mjs --require-verified` 通过，报告匹配最终应用源码摘要 |
| 主站适配 | Rescale 快照检查、类型及适配文件 ESLint 通过；既有素材同步和发布检查 3 项测试通过 |
| 主站隔离构建 | `template:check --id rescale`、`template:release:check`、`tsc --noEmit`、`pnpm build` 通过 |
| 主站生产 HTTP | 20 条双语路径、未知路由 404、90 项运行素材通过 |
| 主站生产浏览器 | 80 组双语 / 视口组合通过，市场入口均为 `/templates` |
| 详情及设备预览 | PC / H5 / iPad 各 4 张图；新标签页链接 `_blank`；iframe 真实 `innerWidth/innerHeight` 为 390×844、834×1180，框内菜单可展开 |

生产浏览器批量连续导航时曾观察到预取请求被后续导航取消和图片请求中断；改为等待页面加载完成后复查，最终 80 组通过。没有通过吞异常或增加静默兜底处理这些验收过程中的取消请求。

开发服务与生产构建曾共用 `.next`，造成一次预览模块缓存冲突。已停止本任务残留进程，最终验收改在独立 Git 克隆构建并启动生产产物；未以该次开发缓存错误作为生产验收结果。

## 主站构建范围

当前原工作区另有 Offersuite、Portfolica、Shelta 的并行草稿。首次整仓类型检查因这些模板尚缺包而失败；随后部分并行任务已补充依赖。本任务不修改、回滚或删除这些改动。

本次主站验收副本采用“主站已提交注册表及共享包清单 + Rescale 接入”。仅在验收副本移出未交付的并行模板目录，原工作区完整保留。隔离检查通过不代表这些并行草稿已整仓验收通过。最终主站构建、HTTP、浏览器与产物记录见 `artifacts/rescale/`。

交付末次原工作区全量 `template:release:check` 仍因并行的 `noter: 源码 ZIP 尚未发布` 而失败；Rescale 自身的 ZIP 与快照一致性已通过。未绕过原工作区的全量发布检查。

实际构建位置均为本地 WSL Ubuntu Linux 文件系统：

- 独立生产：`/home/xmin/workspace/rescale-20261024/delivery`。
- 主站隔离副本：`/home/xmin/workspace/rescale-20261024/website`。

没有在远端服务器构建、安装依赖或部署。主站锁文件由既有 pnpm 9.15.4 生成，未升级第三方依赖；更新时检查并保留并行任务对依赖声明和锁文件的修改。

最终主站构建 ID：`uw3NsKNxqFFbPRxhgoMnW`；build-manifest SHA256：`5cf1b8699c1c31bfecfe73cf1ebaf1a97fc24fae8e353f6f2c362481103845c4`。完整记录见 `artifacts/rescale/production-build.json`。

本机交付预览：<http://localhost:43413/templates/rescale/site>；详情：<http://localhost:43413/templates/rescale>。地址依赖本次保留的本地生产预览进程。开发与独立验收辅助服务已停止。

## 源码与固定产物

- Git：<https://github.com/weelume/rescale-template>。
- 分支：`main`；已推送并核对远端 SHA：`42189255ab22f070794a25ddb48d089c1cda58e1`。
- 应用验收基线：`75c510d`；随后仅更新验收报告。源码摘要：`032930ef0c2047c34804b0d345ba18ae3c55ade7cc072f1cd7e3d65fbfd53838`。
- 固定包：`website/vendor/rescale-template-1.0.0-05698db9bc3e.tgz`。
- 包 SHA256：`05698db9bc3eb32fee1dd045fc86bd9ab81a39a7c7ec11d1e5b7ff0f6e77489d`，sourceDirty=false。
- [完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/rescale/1.0.0-42189255ab22f070794a25ddb48d089c1cda58e1/15a32034362e96cb64afaafbfa151183759bba26dcf64dab964686223cd758eb.zip)。18075038 字节，SHA256：`15a32034362e96cb64afaafbfa151183759bba26dcf64dab964686223cd758eb`。本地 WSL `git archive` 打包，既有 COS SDK 上传，匿名下载 SHA256 和 ZIP CRC 校验通过。

模板锁、依赖声明、pnpm 锁与 releases.json 配套更新。保留旧 COS 内容寻址对象。主站未提交、推送或部署。

## 明确限制

1. 原站全部页面在三端的逐项、逐时刻精确动效对照尚未完成；手机真实拖拽释放回弹、系统减少动态效果偏好仍未完成实际验收，不能标记完整动效复刻通过。
2. 图形示意素材中仍有原站英文文字；第三方品牌、图片、视频与英文文案的商业及再分发权利未核实，维持 listed=false。
3. 未验证登录后教程提示词复制链路；演示表单不连接真实服务。并行模板的未完成状态不由本任务修复。

回滚时同时恢复 Rescale vendor、模板锁、依赖声明、pnpm 锁和发布清单至同一已验收版本，使用相同本地构建产物流程；不删除旧 COS 对象，不覆盖其他模板或用户改动。
