# Kelo Marketing 独立模板交付与验收

按 `docs/template-replication-guide.md` 新增独立 AI 营销模板，保留已有 `kelo` AI 客服模板。参考为 <https://jiro.build/templates/marketing-sales/ai-marketing-landing-page-kelo>；实际原站是单页。详情标签中的月/年付开关、评价并非当前预览已实现区块，不据此额外扩展。

不能标记全部动效逐帧复刻验收通过。系统减少动态设置未真实切换；全部三端悬停、按压、逐帧时序和长时间循环矩阵未完整对照。应用检查通过与完整动效一致性分开记录。

## 源码与接入

- 独立工程：`D:/code/code-tpl/kelo-marketing-template`。
- Git：<https://github.com/weelume/kelo-marketing-template/tree/codex/kelo-marketing>。
- 分支：`codex/kelo-marketing`；最终提交：`1a9701db76cdf1a573a5ffd4b12079953e2f55a4`。正常推送，`git ls-remote` 核对远端 SHA 一致，独立工作区干净。
- 14 页、28 条双语路径：首页、功能、解决方案、集成、价格、关于、帮助、博客、三篇原创文章、联系、隐私、条款。原站之外的内页及文章为同风格原创扩展。
- 品牌、双语内容、主题令牌、公共区块、页面组合和路由分离。主站 `catalog/kelo-marketing` 仅有 `meta.ts` 与 `weelume.tsx`，注入微域生光品牌、Logo、模板市场入口和 `TemplateFiling` 示例备案。
- 已登记共享模板、生产转译、开发源码别名与路由注册。生产只读取随仓 vendor 固定包；未复制业务页面到主站。
- 运行素材、字体和 12 张真实展示图由包生成器同步到 `website/public/templates/kelo-marketing`。独立市场截图在 `.tpl/assets`；实际像素分别为 PC 1425×990、iPad 819×1159、H5 375×812，CSS 视口为 1440×1000、834×1180、390×844，未放大或伪造。
- 未新增第三方库；复用既有 React、Next、framer-motion 和固定工具链。

## 动效与交互

原 Hero 2 Video.mp4 本地托管，0.6 倍速、静音、inline、循环。视区外或隐藏页面时暂停，减少动态时提供手动控制；播放失败显式记录错误并提供原生控件。保留视频，不以静态图片替代。

导航 y=-20/0.8s；标题、说明和 CTA y=16/0.6s/.1/.2/.3 错峰；深色面板 y=40/.8s/.4delay 与卡片错峰、悬停；分段进度 60/25/10%；折线 pathLength 绘制、节点和延迟提示；销售柱与回访进度。实时分析 24 柱/1.5s 无限反向/.05i，三项指标切换；自动化行横向入场；API 光标循环；团队双环 10/15s 反向旋转与头像错峰。

四阶段包含独立文案、场景和线索/草稿/流程/洞察示意。保留 wait 切换、x=20→0→-20/.4s/.22/1/.36/1、标签图标 2s 缩放循环、玻璃块 y=0/-10/0 的 4s 浮动、背景 3s 悬停缩放及各示意错峰。支持触控和方向键。集成为八项网格，未虚构跑马灯或拖拽。成果面板、价格错峰、FAQ 高度/透明度与控件旋转分别实现。原站动画参数与有意差异详见独立 `.tpl/docs/MOTION.md`。

字体、字号、中文语义、玻璃质感、宿主品牌、市场按钮和页脚依项目规范调整。移除装饰箭头；原站无真实业务的按钮连接明确演示路径；表单仅本地校验，明确不发送、不保存，不接真实账户、支付或营销系统。

模拟手机框曾复现成果说明初始 x=20px 撑出 2px。根因为动画位移超出手机页边距；仅将成果区动效画布裁剪，保留动画。使用 `documentElement.scrollWidth <= documentElement.clientWidth` 复验，避免含滚动条的 `innerWidth` 掩盖差异；修复已进入最终提交、固定包及 ZIP，未沿用旧快照。

## 构建位置与验证

所有依赖安装、编译、运行包构建和源码 ZIP 打包均在本机 WSL Ubuntu 的 Linux 文件系统完成，未使用远端构建。

- 独立应用：`/home/xmin/workspace/kelo-marketing-20261026/template`。
- 干净包源码：`/home/xmin/workspace/kelo-marketing-20261026/package-source`。
- 主站集成：`/home/xmin/workspace/kelo-marketing-20261026/host/website`。
- Node 24.16.0、pnpm 9.15.4。Windows 仅执行元数据接入、Git 和既有 COS SDK 上传，不在 Windows 编译。

| 检查 | 结果 |
| --- | --- |
| 独立冻结离线安装 | 通过 |
| `pnpm typecheck` / `pnpm lint` | 最终修复通过 |
| `pnpm test` | 4 项通过：路由合同、表单不外发/持久化、本地素材/无装饰箭头、动效和视频行为合同 |
| 独立 `pnpm build` | 通过，生成 28 条双语业务路径 |
| 独立生产服务 | 实际启动、HTTP 200、停止；报告 stopped=true |
| 协议 `check --require-verified` | 主工程与干净包源码均通过，报告摘要与源码一致 |
| 独立 HTTP | 28 路径、22 顶层运行素材 200；未知路径 404 |
| 三端与 320px | 首页/功能/博客/联系共 16 次严格内容视口检查，无横向溢出或损坏图片 |
| 真实交互 | 四阶段、FAQ、手机菜单、指标切换、本地表单通过 |
| 动效时间状态 | 三端实际记录面板初始 y40/opacity0、运行、结束；进度 0→60%；视频时间增长、0.6 倍速 |
| 主站类型 / 适配 lint | `pnpm exec tsc --noEmit --incremental false`、适配目录 ESLint 通过 |
| 固定包 | `pnpm template:check --id kelo-marketing` 通过 |
| 主站 HTTP | 最终包的 28 双语路径、22 运行素材 200；未知路径 404 |
| 主站浏览器 | 品牌、市场入口、示例备案、原视频正常；检查时无控制台 error |
| 主站语言 | contact?check=host#km-main 实际进入 site/en/contact?check=host#km-main |
| 模拟设备 | H5 iframe 390px、iPad 834×1180，框内菜单和导航可用；最终 H5 内容宽度与滚动宽度均 380px，无横向溢出 |
| 依赖锁 | WSL pnpm 生成；保留并行新增 LearnAI 等模板依赖，并冻结安装验证 |
| 源码 ZIP | 最终提交上传、匿名完整下载、SHA256、ZIP 完整性通过；专项快照一致性检查通过 |
| 完整主站构建 | 未通过：正式入口先后遇到 Alex、Playora 的未发布 ZIP 门禁；交付前重新读取当前清单，Playora 已由并行工作发布，当前仍为 `alex: 源码 ZIP 尚未发布`，未绕过或代改其他模板 |

独立报告 `.tpl/reports/verification.json`，最终源码摘要 `5155657ad4e98fae4d3ed511418d0088e50ac7859781a3a96e7949a2d6a8cbd7`。原始日志、HTTP、三端截图与时间状态证据在 `artifacts/kelo-marketing/`。报告的应用通过不代表视觉动效逐帧一致。

## 最终固定包与源码 ZIP

- 固定包：`website/vendor/kelo-marketing-template-1.0.0-9f9c768be7dd.tgz`。
- SHA256：`9f9c768be7dd518b05ec7f0fcee50d9c87c3ca679614ed3a3a5bbd1c0299ac8b`。
- sourceCommit：`1a9701db76cdf1a573a5ffd4b12079953e2f55a4`，sourceDirty=false。
- 配套：`website/templates/kelo-marketing.lock.json`、`website/package.json`、pnpm 生成的 `website/pnpm-lock.yaml`、`website/templates/releases.json`。
- [完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/kelo-marketing/1.0.0-1a9701db76cdf1a573a5ffd4b12079953e2f55a4/39ccabc10f0349f1007b650a82c818ddb81b0c41331c87de7221027f21245f09.zip)：9,934,898 字节，SHA256 `39ccabc10f0349f1007b650a82c818ddb81b0c41331c87de7221027f21245f09`。

用户已明确批准本模板公开仓库创建、推送与 COS ZIP 上传。沿用内容寻址路径，旧包与旧 ZIP 保留。发布脚本运行时全站检查因 Playora 失败，交付前当前清单检查仍因 Alex 未发布失败，不影响已实际验证的新模板 ZIP；未将脚本整体退出失败描述为全部检查通过。

## 预览、限制与回滚

主站预览：<http://localhost:43630/templates/kelo-marketing/site>；详情：<http://localhost:43630/templates/kelo-marketing>。这是本地 WSL 专用验收实例，未宣称已接入其他正在运行的端口或部署环境。

原设计、图片、视频及第三方标记的商业再分发许可未完整核实，保持 listed=false、redistributionAllowed=false，未市场上架。未推送主站仓库、未部署服务器。完整动效对照和减少动态设置切换仍有未验证项。

回滚时共同恢复 Kelo Marketing 的 vendor 引用、快照锁、依赖声明/锁及 releases 记录；旧对象不删除。独立源码后续在自身工程修改、验证和提交，主站仅更新包与宿主适配，不建立双向源码复制。

## 常用主站 3000 接入补充

用户要求接入主站后，确认仓库已有适配，但常用 `/home/xmin/workspace/weelume-dev-20261025/website` 工作区未接入，且 3000 当时未运行。已先备份该工作区的配置及依赖锁，仅补入 Kelo Marketing 的适配、注册、转译、共享包、固定快照和该模板发布记录，保留原 Kelo、其他模板和已有本地配置；没有用专用验收目录的完整配置覆盖主站。

备份：主站 `.work/kelo-marketing-integration-2026-10-26T01-44-57-890Z`。由本地 WSL pnpm 更新锁，素材生成器同步 241 项文件。`pnpm exec tsc --noEmit --incremental false`、适配 ESLint、`pnpm template:check --id kelo-marketing` 均通过。

实际启动 3000 后，内置浏览器确认 `/templates` 同时展示原 Kelo 客服和新 AI 营销模板；实际点击列表进入详情，再点击在线预览打开新标签页。28 条双语路径、22 项运行素材均 HTTP 200，未知路径 404；首屏视频实际以 0.6 倍速播放，微域生光品牌和模板市场入口正常，无损坏图片或横向溢出。

当前主站入口：<http://localhost:3000/templates/kelo-marketing>；整站预览：<http://localhost:3000/templates/kelo-marketing/site>。不再以 43630 专用预览代替常用主站验收。证据在 `artifacts/kelo-marketing/main-3000-*`。

该常用主站工作区的整体 `pnpm build` 仍被既有 `benjamen: 源码 ZIP 尚未发布` 门禁阻止，未绕过；此工作区已有共享模板数组重复项，本次未扩大范围清理。未部署生产、未推送主站仓库、未市场上架。

## 主站滚动条优化

用户反馈滚动条需优化后，实际检查发现主站全局 `scrollbar-gutter: stable` 与 10px 原生滚动条为视频首屏留出浅色边条。Kelo Marketing 宿主适配现复用已有 `shared/PageScrollbar` 和共享样式，移除原生预留槽，使用 4px 绿色浮动滑块，悬停/聚焦时 6px，闲置 1.2 秒后淡出。保持 document 为滚动来源，不新增嵌套滚动容器。

改动仅为主站适配 `catalog/kelo-marketing/weelume.tsx` 与 `host.css`，同步到常用 3000 与专用 43630 工作区；未改通用源码、固定包或源码 ZIP。英文无障碍名称为 Page scroll，中文为页面滚动，关联真实的 km-main。

本地 WSL 类型检查、改动文件 ESLint 通过。内置浏览器确认桌面原生槽从 10px 变为 0，`scrollbar-width:none`、gutter=auto、内容宽度等于视口；390px 手机与 834px 平板无横向溢出。实际验证 PageDown、Home/End、点击轨道定位、ARIA 与滑块位置同步，以及失焦闲置后 opacity=0。点击轨道后滚动位置与 ARIA 均为 3132（最大 6260），悬停滑块为 6px。复用组件的拖拽逻辑未修改，本次未单独进行拖拽或系统减少动态设置切换验收。

验收时 3000 开发服务曾中断，已恢复同一工作区并通过 HTTP 200 检查；截图及状态证据保存在 `artifacts/kelo-marketing/scrollbar-*`。仅本地主站生效，未部署生产。
