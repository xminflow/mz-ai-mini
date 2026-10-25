# JiroNews 模板实现与接入验收

## 交付状态

已实现双语新闻模板并按共享包模式接入主站，独立源码已提交、推送，完整源码 ZIP 已发布且匿名下载验证通过。**尚不能标记“完整复刻验收通过”**：原站所有动效在三端的逐时刻对照未完成，部分运行操作尚未验证；详见独立工程 `.tpl/docs/MOTION.md`。

参考入口：<https://jiro.build/templates/media-publishing/multi-categories-news-site-jironews>。实施依据为 `docs/template-replication-guide.md`。原站公开预览主要为单页，用户已明确选择补齐双语内页。

## 源码和页面

- 主维护工程：`D:/code/code-tpl/jironews-template`。
- Git：<https://github.com/weelume/jironews-template>，分支 `codex/jironews`。
- 最终提交：`eb0c78deaa0799fbffa0a25032df90979ded4426`。正常推送后通过 `git ls-remote` 核对远端一致，独立工作区干净。
- 52 个页面，104 条双语路由：新闻首页、文章列表、23 篇演示文章、分类总览和 16 个分类、关于、联系、播客、订阅及政策/样式指南/许可/更新日志/站点地图。
- 默认中文，英文在端路径后的 `/en`；站内使用 Next Link。语言切换保留当前页面、查询参数和锚点。
- 独立工程集中维护品牌、内容、主题、组件、页面及路由。主站 `catalog/jironews` 只有 `meta.ts`、`weelume.tsx`，注入微域生光、现有 Logo、市场入口与示例备案。
- 字体为本地 MiSans 400/700、Poppins 400/600/700。51 张照片本地托管；12 张三端截图已重新按正确字体拍摄，并核对 1440×1000、834×1180、390×844 原始尺寸后转换 WebP，未放大图像。

## 交互与动效

已实现长首屏 sticky、逐字标题入场、循环打字、六面 3D 新闻立方体、自转/滚动/鼠标视差/拖拽惯性与面光影、新闻跑马灯、6 秒主轮播、24ms 新闻标题输入、4.2 秒新闻列表推进及回环、分类错峰、播客卡片、编辑区和侧栏入场、底部订阅叠卡逐词入场与悬停展开、团队与影响力区块、编辑主卡x=-50/scale.96/blur5与紧凑列x=50/blur5分层入场、影响力两侧图片scale.92/blur6及38秒跑马灯、导航抽屉、搜索和本地表单校验。支持减少动态效果。

演示表单只校验，不发送、不保存字段；debug 日志仅记录步骤和结果，不记录表单值。原站未提供可播放媒体源，相关入口明确说明演示状态，不模拟已经播放。

## 固定包与源码 ZIP

- 运行包：`website/vendor/jironews-template-1.0.0-d82d3829c967.tgz`。
- 包 SHA256：`d82d3829c96793eb44cb66923eb72fe03ecf7e1f387a6e7c30a1db47263f91bf`。
- 源码提交同上，包溯源 `sourceDirty=false`。模板锁、`package.json` 和 pnpm 自动生成的依赖锁一并交付；既有依赖未升级。
- [完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/jironews/1.0.0-eb0c78deaa0799fbffa0a25032df90979ded4426/54b700e8a7309499efce03a14f640b1be5c95aa7bfe830a915d0403a3362825f.zip)。
- ZIP SHA256：`54b700e8a7309499efce03a14f640b1be5c95aa7bfe830a915d0403a3362825f`，23,624,189 字节。通过既有 COS SDK 上传，并匿名完整下载校验 SHA256 和 ZIP CRC 后切换发布清单；历史对象保留。

## 本地环境与验证

安装、编译、共享包、ZIP 打包和生产构建均在本机 WSL Ubuntu 的 Linux 文件系统完成；未在服务器构建、未部署主站。

- 独立验收目录：`/home/xmin/workspace/jironews-20261025/jironews-template`。
- 独立干净克隆及打包：`/home/xmin/workspace/jironews-20261025/package-source`。
- 主站验收目录：`/home/xmin/workspace/jironews-20261025/website`。
- Node `24.16.0`、pnpm `9.15.4`，复用现有依赖版本。

| 验证 | 实际结果 |
| --- | --- |
| 独立冻结离线安装 | 通过 |
| `pnpm typecheck`、`pnpm lint` | 通过 |
| `pnpm test` | 4 项通过：语言路径、双语内容及素材、页面注册、中文字体声明一致性 |
| 独立 `pnpm build` 和生产服务健康检查 | 通过；报告专用健康检查实例已停止 |
| 独立协议 `check --require-verified` | 通过，ready，报告与源码摘要匹配；干净独立克隆再次通过 |
| 独立 HTTP | 104 条双语路由全部 200；最终模板的根路由另随最终验收执行健康检查 |
| 主站 `pnpm template:check --id jironews` | 通过，版本、提交与 SHA256 一致 |
| 主站类型和改动文件 ESLint | 通过 |
| `pnpm template:release --ids jironews`、`template:release:check` | 最终提交已通过 |
| 最终动效版本主站生产构建 | 通过，日志见 `artifacts/jironews/host-build.log` |
| 主站 HTTP | 最终生产产物 104 条语言路由及目录、详情、H5/iPad 入口全部 200 |
| 主站实际浏览器 | 正确 MiSans 字体、微域生光、市场入口和示例备案；首页无损坏图片/横向溢出；H5框内菜单可操作，切至 iPad 后状态保留 |
| 模拟设备真实视口 | H5 390×844、iPad 834×1180；只缩放外层框 |
| 三端截图 | 12 张真实页面截图，最终字体版本已刷新，尺寸及无放大检查通过 |
| 实际浏览器 | 语言切换保留 `contact?check=1#jn-main`；联系表单返回未发送未保存；H5 菜单展开、跳转关于页后关闭；320px 无横向溢出和损坏图片 |

证据位于本工程 `artifacts/jironews/`，包括截图、HTTP 结果和最终主站构建日志。独立报告为 `.tpl/reports/verification.json`，源码摘要 `b4106b3738895e9ed10e656e697f3e5fefbed5fb133c025937125501932154c2`。该报告证明所列应用命令及服务检查，不等于完整视觉动效验收。

## 排查记录与剩余限制

1. 主站开发实例与生产构建曾共用 `.next`，造成样式请求失效和假性溢出。已停止本任务开发实例，后续使用最终生产产物验证；未修改全站缓存策略。字体栈重复拼接的问题已修复，加入回归检查并刷新全部截图。
2. 两张原站 Unsplash URL 返回 404，已使用同主题照片替换并在 `.tpl/docs/ASSETS.json` 记录原地址、实际地址和差异。其余临时 TLS/连接问题通过重试原地址恢复，未添加运行时兜底。
3. 全站三端逐时刻动效对照尚未完成。编辑区与影响力区的 blur/scale/布局和38秒跑马灯已按原组件补齐；PC/iPad/H5实际触发并读取入场前后状态通过。主轮播实际暂停、移开指针跨周期保持、恢复推进已通过；修复了悬停和手动暂停共用状态导致反向恢复的问题。完整拖拽释放、悬停、系统减少动态效果的实际操作及所有模块逐帧矩阵仍未完成（当前浏览器接口不提供对应仿真操作）；不得据静态截图或参数匹配宣称完整还原。
4. 原站媒体未提供音视频文件；展示不可播放状态属于明确限制。文章正文、团队及统计为演示内容，不作为真实新闻或真实业务指标。
5. 参考设计、原始文章标题、照片作者和逐项商业再分发权利未完整核实，保持 `listed=false`、`redistributionAllowed=false`，未进行市场上架。公开源码和 ZIP 不代表已取得商业素材授权。
6. 未推送主站仓库、未上传主站部署产物、未部署远端服务器。用户已有修改和其他模板未覆盖；本任务只交付 JiroNews 及必要注册/打包资料。

后续更新继续在独立工程修改、验证、提交并推送，再 bundle、`template:update`、pnpm 更新锁、源码 ZIP 发布与主站构建。回滚需同时回滚当前模板运行包、快照锁、依赖声明/锁及发布清单；旧 COS 对象保留。


本地生产预览：http://192.168.34.186:43381/templates/jironews/site 。服务仅在本机 WSL 运行，未部署远端。

## 动效补充验证

本次动效修正未改变既有12张市场截图所覆盖的首屏及内页；新补充的编辑区和影响力区截图单独保存在 artifacts/jironews/motion-*.png。状态证据为 motion-*-editorial.json、motion-*-impact.json 和 motion-news-runtime.json。PC 1440×1000、iPad 834×1180、H5 390×844 已实测入场触发与清晰终态，无横向溢出；未使用静态截图代替完整运动轨迹验收。原站与本地亚秒级逐帧轨迹、拖拽释放及减少动态效果实测尚未完成。

最终主站浏览器刷新后确认3组编辑布局、4张影响力图片和38秒跑马灯；实际点击标题触发滚动，首组opacity从0变1、blur从5px变0px，屏幕外组保留待入场状态。轮播恢复后已观测从1/4推进至3/4。主站最终生产版本104条双语路由、26个CSS资源、本地字体和4个模板入口检查通过。最终运行证据见 motion-host-final.json / motion-host-final.png。

## 切页顶部黑色导航闪烁修复（2026-10-25）

根因：各页面重新挂载Nav时，主导航从opacity0/y=-45、分类导航从opacity0/y=-25重复入场。原复现检查在首页、文章、联系、英文关于页均失败（nav-visibility-before.json）。修复将这两条导航改为原生nav，首帧始终可见；抽屉和正文其他动效保留。独立与主站真实生产HTTP检查均4页通过，主站浏览器验证中文联系页切英文、菜单展开并跳转英文文章页，导航opacity1/transform none，菜单正常关闭，无横向溢出。代码类型、Lint、4项既有测试、独立及主站WSL构建、严格协议和源码ZIP下载校验均通过。检查脚本为artifacts/jironews/check-nav-visibility.cjs；运行证据nav-visibility-source.json、nav-visibility.json、nav-client-navigation.json。原有全量动效逐帧与拖拽等未验证项不因本次修复变为已通过。

## 字体统一与文章搜索区修正（2026-10-25）

主站真实浏览器复现：文章标题计算字体为Inter/Noto Sans SC/HarmonyOS等宿主字体，600字重；文章数量提示上下margin均为0。根因分别是宿主标题显式font-family覆盖继承、模板.jn-root p重置的特异性高于.jn-notice。修复为模板作用域内的--jn-font显式覆盖所有标题及表单控件，中文标题400、英文600、禁用合成字形；文字与正文共用本地Poppins/MiSans。段落重置改低特异性:where，搜索和数量改为带独立间距的响应式工具栏，数量不再全宽铺底。按用户最新要求分类导航不增加首页，仍以亲子开头。12张三端截图已按1440×1000、834×1180、390×844重新拍摄、验证真实尺寸、转WebP，未放大。字体改动未触碰主站全局样式或其他模板。

最终主站实测：PC1440、iPad834、H5 390三端标题和搜索框均使用JN Poppins/JironewsMiSans，中文标题400字重；英文文章列表600字重且字体一致。搜索框与数量提示间距20/20/16px，工具栏与卡片间距32/32/28px，数量提示约91px宽，无横向溢出。复现脚本check-heading-font.cjs在修复前style-before.json上失败，在修复后通过；check-article-tools.cjs对style-desktop/tablet/mobile.json全部通过。主站构建、26样式资源、字体、4入口和4类页面导航首帧检查通过；控制台无错误，未新增首页入口。
