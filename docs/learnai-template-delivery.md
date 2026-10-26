# LearnAI 模板交付与接入记录

## 2026-10-26 滚动条本地优化（未发布）

独立源码新增 `scrollbars.css`，通过主题变量统一整页 9px、内部容器 8px 的薄荷绿圆角滑块，包含悬停／按压配色、浅色轨道与深色区域配色；移除评价区原有分散配置。使用原生滚动，触控与强制高对比模式保留系统表现。整页通过 `html:has(.la-root)` 限定作用域，模板离开后自动恢复主站样式。

已在独立预览与主站源码引用预览验证：价格页计算样式正确；抽屉打开和关闭时内容宽度、导航右缘与固定按钮位置一致；抽屉内部为 8px，滚动边界不带动背景；评价区方向键可横向滚动；离开模板后主题变量清空、主站原滚动条恢复；834 / 390 / 320px 价格页无横向溢出。独立模板类型检查与本机 WSL 构建通过，证据见 `artifacts/learnai/scrollbar-*.json`、`scrollbar-*.log` 及 `scrollbar-pricing-after.jpg`。真实触控设备与系统高对比模式尚未实机检查。

当前本地地址仍为 <http://localhost:43581/pricing> 与 <http://localhost:43584/templates/learnai/site/pricing>。本次是源码和本地预览更新，未生成新版本固定包、提交推送或上传源码 ZIP；以下 1.0.1 信息及其验收报告、市场截图对应此前已发布基线，不作为本次未发布改动的完整验收结论。

## 状态

已完成独立模板、主站共享包接入、真实 Git 提交推送及最终源码 ZIP 发布。原站实际为九区块单页，用户明确批准补齐规范要求的内页。当前共15页面、30条双语路由。默认中文，英文在端路径后的 /en。**全量原站三端逐帧对照尚未完成；主站生产构建被现有 Alex 未发布源码 ZIP 的全局门禁阻塞，不能据独立构建通过宣称主站生产构建或完整视觉动效验收通过。**

参考：<https://jiro.build/templates/education-careers/ai-english-learning-tutor-landing-page-learnai>。依据 docs/template-replication-guide.md，通过内置浏览器读取与检查预览，逐区核对公开脚本参数；未执行下载的 JavaScript，工具 SVG 使用静态 AST 解析提取。

## 源码、包与公开下载

- 独立工程：D:/code/code-tpl/learnai-template。
- Git：<https://github.com/weelume/learnai-template>，实际默认分支与交付分支均为 codex/learnai。
- 最终版本：1.0.1，提交 43b4fde106e32faf2650be793caf65e3fa491c85；git ls-remote 已确认远端一致，源码工作树干净。
- 协议：git-template / 0.2.0，ready；严格协议在 Windows 及 WSL 干净打包克隆通过，源码摘要 fe59492cbd6047c132e2454596c9a5c31333f4eae36029322cd3e1585515c7bb。
- 固定包：website/vendor/learnai-template-1.0.1-3a772cb57ce8.tgz；SHA256 3a772cb57ce8546239899a1e6d8eb2deaa65c3a08ed7a7ddc4ff6223b5a045a2，sourceDirty=false。
- 配套交付 templates/learnai.lock.json、package.json 和 pnpm 自动生成的 pnpm-lock.yaml。剔除 LearnAI 记录后，与更新前其他依赖记录逐字节相同；并发的 Kelo Marketing、Playora、StockLens、Alex 等变更保留。
- catalog/learnai 仅 meta.ts 与 weelume.tsx，复用独立包，不复制业务页面。

[长期公开源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/learnai/1.0.1-43b4fde106e32faf2650be793caf65e3fa491c85/dffb1c0920a5a3caf86a42044d16b02c7aea040206c91850dcf1a1f9966573a5.zip)

- ZIP 大小：19657049 字节；SHA256 dffb1c0920a5a3caf86a42044d16b02c7aea040206c91850dcf1a1f9966573a5。
- 由本机 WSL Linux 文件系统 git archive 已提交源码生成，使用既有 COS SDK 上传，匿名完整下载的 SHA256 与 ZIP CRC 校验通过后更新 releases.json。
- 用户分别批准初版和最终字体修正版的公开 COS 上传。旧1.0.0对象保留，最终主站记录指向1.0.1；不覆盖或删除旧对象。
- 发布命令末尾的全局检查因 alex 缺少源码 ZIP 退出1；LearnAI 上传、下载及本模板提交/快照一致性均已通过。此退出既不代表 LearnAI 上传失败，也不代表全局检查通过。

## 页面与交互

首页、功能、如何开始、情境练习、价格、博客、三篇学习文章、联系、关于、隐私、条款、使用规范、Cookie设置。Next Link 站内导航，语言切换保留当前页面、查询参数和锚点。

复刻首屏手机和背景、四向功能卡片、语言搜索/清空/空态、40种母语入口、四情境抽屉、1.2秒本地回复、可选浏览器语音识别与朗读、七层同心环、选项按压和选中反馈、三步流程、原站10个工具SVG、评价原生横向滚动和曲线裁切、FAQ分组错峰/弹簧入场/展开旋转及手机菜单。

MiSans400/700与Poppins400/600/700本地托管，英文数字优先Poppins、中文回落MiSans；中文示意界面同步翻译。品牌、市场入口与示例备案在宿主注入；独立模板保持Learn.AI品牌。原站无可播放video元素；未用静态图替代视频。完整参数和差异见独立 .tpl/docs/MOTION.md。

对话、评分、价格、评价和统计均为明确演示；无真实AI、计费、邮件、持久化或工具集成。语音由用户主动点击后通过浏览器服务开启，可能由浏览器提供方处理音频；不支持或失败时明确显示提示。关闭抽屉清理定时器、识别与播放。debug日志仅事件、枚举与计数，不记录输入内容。

## 实际构建位置与检查

依赖安装、编译、bundle和ZIP均在**本机WSL Ubuntu的Linux文件系统**执行；未在远端服务器或远端Docker构建。

- 独立验收：/home/xmin/workspace/learnai-20261026/learnai-template。
- 最终干净打包克隆：/home/xmin/workspace/learnai-20261026/package-source-v1.0.1。
- 主站隔离验收：/home/xmin/workspace/learnai-20261026/website。
- Node24.16.0、pnpm9.15.4，复用既有依赖，无新增通用库。

| 检查 | 结果 |
| --- | --- |
| 独立冻结离线安装 | 通过 |
| pnpm typecheck / lint / test / build | 通过；路由测试覆盖独立及宿主语言路径、查询与锚点 |
| 独立生产请求 | 30条页面200、未知页404、全部275份运行素材200；专用验收实例停止 |
| check --require-verified | Windows及WSL干净打包克隆通过，摘要一致 |
| 主站冻结安装 / template:check --id learnai | 通过，1.0.1来源提交与包SHA一致 |
| 主站 tsc --noEmit / 改动文件ESLint | 通过；隔离副本检查，保留源工作区并发修改 |
| LearnAI发布关系校验 | 通过，最终Git提交、固定快照、ZIP记录一致 |
| 全局 template:release:check / 主站 pnpm build | 被 alex: 源码 ZIP 尚未发布 阻塞；未绕过 |
| 最终主站开发请求 | 30条页面200、4类入口200、未知页404、287份运行素材和截图200 |
| 浏览器布局 | 中英文PC1440×1000、iPad834×1180、H5390×844，以及320窄屏检查；稳定页面无横向溢出或已加载图片损坏 |
| 实际交互 | 搜索与空态、抽屉/焦点归还、咖啡馆本地回复、手机菜单跳转、FAQ、表单未发送提示、语言保留查询和锚点通过 |
| 实际动效 | 三端可见入场初始/结束记录，FAQ展开、同心环触发/运行/停止；桌面首次过早操作未触发，稳定后补测选中和运行矩阵通过 |
| 宿主适配 | 微域生光、市场/templates、示例ICP备00000000号存在；最终手机联系语言切换保留?check=1#la-main；控制台错误/警告为空 |
| 模拟设备 | 手机iframe390×844、平板834×1180，内容宽度扣除滚动条；外层缩放，保持真实CSS视口 |

12张独立截图覆盖四类页面、三种设备。配置视口如上；解码实际尺寸为1425×990、819×1159、375×812，未放大，元数据记录真实像素。独立 .tpl/assets 映射到主站生成 screenshots 目录；宿主截图另存本项目证据目录。

证据：artifacts/learnai/ 中 final-checks.log、typecheck.log、lint.log、test.log、build.log、independent-checks.json、independent-http.json、final-screenshots.json、entrance-states.json、responsive-en.json、motion-browser.json、desktop-rings-recheck.json、interaction-results.json、empty-focus.json、host-update.log、host-http.json、host-browser-final.json、host-build.log、zip-release-final.log 和 delivery-integrity.json。

## 限制与后续

1. 原站全部三端逐帧、全部hover/滚动轨迹和每个区块的运行矩阵尚未全部对照；不宣称完整视觉动效逐帧一致。
2. 真实浏览器语音识别、朗读未实际授权验收；系统减少动态效果未切换实测。代码已提供减少动态配置和明确错误语义。
3. 主站生产构建等待Alex的既有ZIP门禁解除后重新运行。当前宿主为开发预览，独立模板已完成生产构建验收。
4. 参考设计、图片及字体商业再分发许可尚未完整核实，保持listed=false / redistributionAllowed=false；源码公开及ZIP上传不等于素材商业授权。
5. 未部署、未市场上架、未推送主站仓库。后续更新按验证/报告→提交推送→WSL bundle→template:update→pnpm锁→ZIP→主站build顺序；回滚固定包、模板锁、依赖及发布记录须一并恢复，保留COS旧对象。

最终宿主预览：<http://localhost:43584/templates/learnai/site>。
独立源码预览：<http://localhost:43581>。均为本机WSL服务。

## 2026-10-26 完整发布同步

同步最新提交 e97fc8db0fa81a4fd8deae3b0f73741280819c5e（codex/learnai），远端 SHA 一致。滚动条增量已在本地 WSL Linux 隔离工程通过 typecheck、lint、test、build、全部双语生产路由及未知路径404；刷新验收报告并提交推送。固定包、依赖锁及源码 ZIP 随完整版本同步；实际生产状态及产物摘要见 docs/releases/release-20261026-full.md。本记录不撤销此前视觉、动效及素材授权限制。
