# Kittypaw 实现与交付记录

## 1.0.1 截图修复（当前版本）

用户指出主站截图仍为猫咪视频帧。根因是初次交付的 `screenshots[0]` 与 `cover` 都指向 `poster.jpg`，而目录卡片直接使用 `screenshots[0]`。现已改为真实网页截图 `screenshots/desktop-home.webp`；视频海报只保留给视频加载。

- 按用户指定，使用 Windows 已安装的 Chrome 与 Playwright，在专用无头进程中采集真实页面；未安装 WSL 系统库或新增项目依赖，不读取现有浏览器资料。
- PC 1440×1000、iPad 834×1180、H5 390×844，各覆盖首页、好物、手记和联系，共12张。等字体加载、入场动画结束后截图，仅转WebP，不裁切、缩放或用素材拼成网页。截图视口内无横向溢出、损坏可视图片或页面脚本异常。
- 图片保存于独立工程 `.tpl/assets`，元数据与固定包同步生成主站 `public/templates/kittypaw/screenshots`。协议阶段更新为 `ready`，保持未上架。
- 独立类型、lint、4项测试、生产构建和30条双语路由通过。新增回归检查验证12张三端资产、页面对应、WebP文件，以及市场截图不能指向视频海报。
- 打包脚本改为根据 `package.json` 的准确名称和版本选择归档，避免版本升级后误用目录中的旧包。
- 已同步实际 `localhost:3000` 开发副本；固定包和类型检查通过。Windows浏览器实测目录卡片请求新截图且原图为1440×1000，详情画廊实际切换PC/iPad/H5和全部12张图，均加载成功。
- 最终源码提交：`743e1d77b29f9e0c94dced1fa89a063c6d1df400`，正常推送后远端SHA一致。源码摘要：`79064ba5c8b6de56d8effd3355c1ba3eb0e2cb291490d70c4ef698e0ae7ae0a6`，源码绑定自动验收报告通过。
- 固定包：`website/vendor/kittypaw-template-1.0.1-b26ec8376cdb.tgz`，SHA256 `b26ec8376cdbc5e41b73fe0f2def545746db587a44405088ef9ea91c4e5ab7ab`。本地WSL Linux文件系统打包，快照绑定干净提交；锁文件由本地WSL的pnpm生成，回写前核对依赖声明与旧锁摘要未变。
- [1.0.1完整源码ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/kittypaw/1.0.1-743e1d77b29f9e0c94dced1fa89a063c6d1df400/3fa2e74aad06d07b28f39aac35de28000da18a5fcca6053270e20f427977a693.zip)，9784975字节，SHA256 `3fa2e74aad06d07b28f39aac35de28000da18a5fcca6053270e20f427977a693`。上传、匿名下载、摘要和ZIP完整性通过；专项ZIP与快照一致性检查通过。

证据：`artifacts/kittypaw/screenshots/capture-report.json`、`main-3000-screenshot-check.json` 和 `main-3000-kittypaw-card.png`。截图只验证对应可视范围，不代表全部菜单、表单、语言、视频和原站逐时刻动效已验收。全站发布检查仍因 `benjamen: 源码 ZIP 尚未发布` 停止，未绕过、未部署或上架。

以下为1.0.0首次交付的历史记录；其中“尚缺真实截图、scaffold、使用视频帧封面”的状态已由本节更新替代。

## 1.0.0 首次交付状态（历史）

已实现以原参考 Header 为首页核心的双语宠物照顾网站，并按共享包模式接入主站；独立源码已提交、推送，源码 ZIP 已上传并通过匿名完整下载、SHA256 与 ZIP 完整性验证。**尚未完成三端真实页面截图、交互与动效逐时刻验收，不能标记为完整复刻验收通过。**

参考：[Jiro Kittypaw Header](https://jiro.build/components/header/pet-care-header-section-kittypaw)。依据为 `docs/template-replication-guide.md`；用户已确认“以该 Header 为首页，补齐同风格完整网站和内页”。原参考是 Header 组件，其余区块和内页为原创同风格扩展。

## 页面与源码

- 独立工程：`D:/code/code-tpl/kittypaw-template`。
- Git：[weelume/kittypaw-template](https://github.com/weelume/kittypaw-template/tree/codex/kittypaw)。分支 `codex/kittypaw`。
- 最终源码提交：`74588dec8d138aa917854bd97f36a000aa66febc`，已通过正常推送及 `git ls-remote` 核对远端一致；没有强推。
- 15 页、30 条中英文路径：首页、关于、好物、三件好物详情、洗护、日常健康、兽医关怀、手记、两篇手记文章、联系、隐私、条款。
- 默认中文，英文在 `/en`。语言切换实现保留当前页面、查询和锚点；实际浏览器交互仍待验收。
- 品牌配置、内容、主题、公共组件、页面组合和路由分开维护。主站 `catalog/kittypaw` 仅有 `meta.ts` 与 `weelume.tsx`，由宿主注入微域生光 Logo、模板市场入口和 `TemplateFiling`。
- 运行素材由独立包生成至 `website/public/templates/kittypaw`。保留原视频、Logo、头像、本地 MiSans 400/700 与 Poppins 400/600/700。内页使用原创 SVG 产品示意图；来源与权利记录见独立工程 `.tpl/docs/ASSETS.json`。

## 动效实现

- 视频为原始 1280×720、10.005 秒文件。初始循环前 5 秒；点击场景后开启完整视频循环。提供键盘可用的场景按钮、暂停、恢复、重置及加载错误提示。
- 标题按词延迟 `.8s`、错峰 `.18s`，使用 `stiffness=70`、`damping=12` 的横向弹簧入场；描述与底行分别保留独立延迟和缓动。
- CTA 逐字使用原参考的位移与缩放关键帧，`.6s` 时长与 `.03s` 字间延迟。
- 桌面细指针场景区域使用 `damping=28`、`stiffness=280`、`mass=.4` 的跟随光标，环形文字 12 秒匀速旋转；悬停导航及按钮时不显示场景光标。
- 桌面弹簧下拉菜单、手机横向弹簧抽屉与错峰导航。实现 Escape、外部点击关闭、手机焦点循环及滚动锁。
- 扩展页面包括区块滚动入场、玻璃卡片悬停、产品分类筛选、FAQ 高度动画和仅本地校验的联系表单。表单不外发、不持久化，不产生真实交易或预约。
- 按文档将原 Braah One/Gabarito 与大字号改为 MiSans/Poppins 和 28–44px 标题；去除装饰箭头。减少动态效果时禁用入场、光标和悬停运动，视频默认暂停并允许手动播放。

这些内容是实现清单。参数来自公开加载的原参考资源，不能代替实际视频播放与三端逐时刻运动对照。详细待验收清单在独立工程 `.tpl/docs/MOTION.md`。

## 固定包与源码 ZIP

- 固定包：`website/vendor/kittypaw-template-1.0.0-e75e67145112.tgz`。
- 包 SHA256：`e75e6714511228c7249e840de83f3b272d8c1e0a628fa7d3e0fe212c1373fc3d`。
- `website/templates/kittypaw.lock.json` 绑定最终源码提交，`sourceDirty=false`；`package.json` 和 pnpm 生成的锁文件同步交付。
- [完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/kittypaw/1.0.0-74588dec8d138aa917854bd97f36a000aa66febc/c0754db6db8ef35c2a41f23635c21c546ecdd92b2d4d1e7ef40683a485fc5399.zip)。
- ZIP：9223345 字节，SHA256 `c0754db6db8ef35c2a41f23635c21c546ecdd92b2d4d1e7ef40683a485fc5399`。
- 使用既有 `template:release --ids kittypaw` 流程在 WSL Linux 文件系统打包，复用服务端 COS SDK 上传；匿名完整下载、SHA256 与 ZIP CRC 均通过后切换 `releases.json`，未覆盖或删除旧对象。
- 流程末尾全站发布检查因 `benjamen: 源码 ZIP 尚未发布` 返回失败；Kittypaw 专项 ZIP 与快照一致性检查通过。没有将全站门禁失败误报为 Kittypaw 上传失败或全站通过。

## 实际验证

构建与安装均在本机 WSL Ubuntu 的 Linux 文件系统中执行，使用 Node 24.16.0、pnpm 9.15.4。没有在远端服务器构建、部署或上架，也没有推送主站仓库。

- 独立初始验收：`/home/xmin/workspace/kittypaw-20261025/kittypaw-template`。
- 干净本地克隆：`/home/xmin/workspace/kittypaw-20261025/package-source`。
- 主站隔离接入：`/home/xmin/workspace/kittypaw-20261025/host/website`。

| 检查 | 结果 |
|---|---|
| 独立冻结安装 | 通过；未新增或升级第三方依赖版本 |
| 独立 `pnpm typecheck`、`pnpm lint` | 通过 |
| 独立 `pnpm test` | 3 项通过：页面/语言与实际模块、表单无外发/存储、本地视频与字体 |
| 独立 `pnpm build` | 通过；生产服务启动成功 |
| 独立 HTTP | 30 条中英文路径全部 200，未知路径 404，6 项媒体与字体资源通过 |
| 独立协议与绑定报告 | `check --require-verified` 通过；该报告仅覆盖列出的自动检查，不代表完整视觉验收 |
| 主站当前集成范围类型检查 | `pnpm exec tsc --noEmit` 通过 |
| 主站适配文件 ESLint | 通过 |
| Kittypaw 固定快照 | `pnpm template:check --id kittypaw` 通过 |
| Kittypaw ZIP 专项一致性 | `verifyTemplateReleases(undefined, ['kittypaw'])` 通过 |
| 主站实际路由 | 30 条中英文路径全部 200、未知路径 404；6 项媒体资源通过 |
| 主站详情与设备入口 | 详情、手机与平板预览入口 HTTP 200；不据此宣称框内真实交互验收 |
| 主站最终正式构建 | 被 `benjamen: 源码 ZIP 尚未发布` 门禁阻止，未绕过；此前一轮曾被并行模板 Velara 未发布阻止 |
| 三端真实布局、交互、截图及动效 | 未验收：电脑操作工具无法可靠识别 Windows 当前浏览器网址并停止操作，未改用其他途径绕过限制 |

自动报告：独立工程 `.tpl/reports/verification.json`。源码摘要：`038c2346f5bee46a6f2430e4198ceedfab4aa600e9422c1dc76c8d84b6856ca7`。独立报告服务使用临时端口检查后已停止；预览服务单独保留。主站证据和日志在 `artifacts/kittypaw/`。

主站锁由 pnpm 在 WSL 生成；回写前核对当前依赖声明与输入一致，并验证旧锁摘要未改变。保留并行模板已有声明及修改，未手写锁文件。

## 预览与未完成项

本机主站预览：[Kittypaw](http://localhost:43641/templates/kittypaw/site)。独立生产预览：[独立 Kittypaw](http://localhost:43640)。均为本地验收实例，未部署服务器。

### 常用本地主站 3000 端口同步修正

用户反馈 `localhost:3000/templates` 看不到 Kittypaw。根因是该端口运行于 `/home/xmin/workspace/weelume-dev-20261025/website`，此前只更新了源码主工程与 43641 隔离验收副本，遗漏了常用开发副本。

本次已先备份该开发副本的配置，再仅增量加入 Kittypaw 固定包、依赖、宿主适配、注册、素材及源码 ZIP 记录，保留其余模板和运行配置；由 WSL pnpm 更新该副本锁文件，通过快照检查与 `tsc --noEmit`。Next 自动重载后，直接验证目录的实际 HTML 含 Kittypaw 卡片链接，并确认详情、中文首页和英文首页均返回 200。

实际入口：[本地主站模板目录](http://localhost:3000/templates)、[Kittypaw 详情](http://localhost:3000/templates/kittypaw)、[Kittypaw 首页](http://localhost:3000/templates/kittypaw/site)。验证记录在 `artifacts/kittypaw/main-3000-http.json`、`main-3000-typecheck.log` 和前端日志。该修正不改变独立源码或 ZIP 版本，也不代表三端浏览器动效验收完成。

尚缺 PC 1440×1000、iPad 834×1180、H5 390×844 和 320px 的真实运行布局与交互验证。需逐项触发菜单、语言切换、筛选、FAQ、表单、视频初始循环/继续/暂停/恢复/重置、光标、标题与按钮动效、系统减少动态效果，并采集各时刻状态。

没有使用视频帧冒充页面截图。主站暂用明确标注“非页面截图”的视频帧封面；独立 `.tpl` 不登记虚假截图，阶段保持 `scaffold`。应完成真实三端截图并更新市场元数据后再推进正式展示。

参考设计与素材商业再分发许可未核实，保持 `listed=false`、`redistributionAllowed=false`。公开 Git 和 ZIP 不能代替商业素材授权。

回滚需同步恢复 Kittypaw 运行包、快照锁、依赖声明、pnpm 锁和发布记录；源码 ZIP 对象保留。后续源码修改应在独立工程验证、提交与推送，再刷新固定包和对应源码 ZIP；不复制业务页面回主站。
