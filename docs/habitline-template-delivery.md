# Habitline 模板交付与滚动条优化

## 当前状态

当前独立版本 **1.0.5**。九个页面、18 条双语路径已经接入主站共享模板。根据用户选择，页面改为6px暖橙滑块、透明轨道，内部区域4px；悬停和按压加深颜色，保留原生滚动。

本次根因是主站 body 全局灰色滚动条规则仍在生效。之前只覆盖和读取 html 伪元素，导致样式读数与截图不一致。1.0.5 同时覆盖 html/body，全部受 Shell 挂载的模板专属根标记控制，卸载后恢复主站样式。未修改主站全局滚动条。

## 源码及交付

- 参考站：https://habitline-wbs.framer.website/；依据 docs/template-replication-guide.md。
- 独立主维护工程：D:/code/code-tpl/habitline-template。
- Git：https://github.com/weelume/habitline-template/tree/codex/habitline。
- 分支 codex/habitline，提交 `9c11596f1a19ebd3de5e1c24a5e5739f6bd08285`，已普通推送并读取远端核对一致，未强制推送。
- 主站只保留 catalog/habitline/meta.ts、weelume.tsx 宿主适配；通用源码由固定共享包提供。
- 固定运行包：website/vendor/habitline-template-1.0.5-aae5e65f42f2.tgz。
- 包 SHA256：`aae5e65f42f27da2c86d65e1e4cf6b98067e8eaaf8d3a3dd83b859d72a82bf5b`；sourceDirty=false。
- 配套 templates/habitline.lock.json、package.json、pnpm 生成的依赖锁一并更新。
- [完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/habitline/1.0.5-9c11596f1a19ebd3de5e1c24a5e5739f6bd08285/64fcd3cba765913f33a2e998bb5d39df132330f2cb9a0839ba0f04b64d58a7fb.zip)，50967835字节，SHA256：`64fcd3cba765913f33a2e998bb5d39df132330f2cb9a0839ba0f04b64d58a7fb`。
- 按既有用户授权复用 COS SDK 上传，匿名完整下载、SHA256及ZIP完整性检查均通过，随后更新 releases.json。旧对象保留。

页面：首页、home-2、about、waitlist、changelog、faqs、contact、legal-pages/privacy-policy、legal-pages/terms-conditions；英文位于 /en。原站无博客，没有虚构博客截图。

194个公开媒体文件本地托管，包含8段视频；来源见独立工程 .tpl/docs/ASSETS.json、LICENSE.md。MiSans 400/700和Poppins 400/600/700本地托管。主站注入微域生光品牌、市场入口、示例备案。表单只做本地校验，不发送或保存；账户、真实提醒、AI、离线同步、下载及价格为演示。

## 实际验证

所有安装、编译、运行包及ZIP打包均在本机WSL Ubuntu Linux文件系统执行，没有服务器构建或部署；Node 24.16.0、pnpm 9.15.4，未新增或升级第三方依赖。

- 独立源码：/home/xmin/workspace/habitline-20261026/source。
- 主站隔离目录：/home/xmin/workspace/habitline-20261026/host/website。
- 独立 pnpm typecheck、lint、build、test 和协议严格源码验收均通过。生产测试覆盖18条双语路径、404与媒体。
- 最新源码摘要：fc698c38ce82ac1b1151b08ee0f8ac49111e1c11af15a32a8f99d3963d2fa233。
- 主站 pnpm template:check --id habitline、pnpm exec tsc --noEmit、pnpm template:release:check 均通过。
- WEBSITE_BUILD_DIR=.next-habitline-105 pnpm build 通过；存在既有无关页面 lint 与 webpack 缓存性能警告。
- 构建标识：`1vusy9Q899y_m0uXMpP-b`；清单 .next-habitline-105/build-manifest.json SHA256：`47e52a587130a43f4107cc100daaf0a69572966aeb48db241c9f3b1ae6523f83`。
- 43570预览运行该同一产物。18条双语页面、详情、手机/iPad预览入口共21项200，未知页面404，共22项HTTP检查通过。
- 内置浏览器生产截图已目视确认暖橙色。实际窗口1367×1244，html/body均6px、rgba(222,105,47,.78)、透明轨道，内部4px，无横向溢出。
- 点击市场入口后根标记移除，html/body恢复主站10px；客户端返回模板后标记恢复，body为6px。
- Ctrl+Home已实际操作返回顶部。旧阶段键盘/滚轮及菜单、FAQ、价格、表单、语言、视频等抽样检查保留；本次未重新逐项执行。
- 本次viewport override未改变实际innerWidth，四次重复读数不计为最终响应式矩阵。此前尺寸记录缺少实际视口读数，最终多尺寸浏览器验证保留待确认。

最终证据：artifacts/habitline/host-warm-final.jpg、host-warm-final-state.json、host-http.json、host-build-105.log、warm-body-release.log。12张历史展示截图使用实际解码尺寸，没有放大伪造标准视口。既有字体导入顺序和主站标题字体/700字重修复保留。

本地预览：http://localhost:43570/templates/habitline/site 。既有start脚本有standalone启动提示，页面及资源可正常服务，未修改无关脚本。

## 限制与回滚

不能标记完整复刻验收通过：原站全站逐帧动效、精确轨迹速度、自动视频轮播、拖拽回弹和系统减少动态矩阵仍未完整对照。页面含错峰入场、浮动面板、习惯带、日程循环、SVG进度、数字滚轮、云层和手机视差，具体差异见独立 .tpl/docs/MOTION.md。原生滑块拖拽未获得可靠验证证据；其他浏览器和系统强制颜色模式本轮未实测。

部分示意、团队、法律文案及场景为演示适配。参考素材商业再分发许可未完整核实；公开Git/COS授权不等于商业许可，未执行市场上架。保留listed=false、redistributionAllowed=false的既有发布边界。

本模板独立交付时未推送主站或部署。后续完整发布任务已将1.0.5纳入 `release-20261026-full2`，主站冻结提交3020a622e4f4048ab6434eeda0f41f0576c9b0a4已推送，生产切换和正式域名验收通过，见 `docs/releases/release-20261026-full2.md`。回滚时一并恢复固定包、快照锁、依赖声明/锁和发布记录，再在本机WSL构建；不删除旧COS对象。
