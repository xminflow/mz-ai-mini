# Alex 法律顾问模板交付与验收

## 2026-10-26 补充：滚动条与动效修复 1.0.1

独立源码提交并推送至 main：`484e32640c5ba9a34a67daaf7b11e348884a5ebf`，已通过 ls-remote 核对，工作树干净。源码摘要 `09d41209be19ab4b62d9b9c603e1fd237e4f3980788913938381e4e02bcbb4b0`。

- 根因：主站全局滚动槽与浅色主题样式不适合 Alex 深色页面。新增模板作用域的原生细滚动条：深色轨道、金色滑块和悬停色；预留稳定滚动槽，弹窗与菜单防止滚动串联；离开页面自动解除作用域，高对比模式用系统配色。
- 实测主站桌面 body/site 宽度在弹窗前后均为1357.33px；320px 页面与菜单无横向溢出；离开模板后 scrollbar-color 恢复 auto。390/834/1440 三端四区块均无溢出、无破图。截图保留在 artifacts/alex/continuation/evidence 与 artifacts/alex/screenshots。
- 同批续作修复：首屏姓名随滚动收缩、文案上移淡出与徽章退出；桌面咨询按钮限界拖拽和释放回位、防止拖动误开弹窗；评价卡收缩/位移/展开时序、后方卡隐藏重定位、手动暂停和恢复。先前只检查初始/结束态，漏检触发与中间状态，已更正“无拖拽”的说明。
- 本机 WSL Linux /home/xmin/workspace/alex-20261026/template 执行 pnpm typecheck、lint、test、build 全通过，10项测试；八条独立生产路由和八条主站开发路由均200。主站本地源码模式 tsc --noEmit --incremental false 通过。干净本地克隆 scrollbar-verified 严格协议检查通过，源码报告匹配。
- 本地交付包 artifacts/alex/continuation/alex-template-1.0.1.tgz；SHA256 `07eb9cb845c0c0a8a0da7f89bfcc26c2adde9760e9e83d82592ac149e630df52`，来源提交如上，sourceDirty=false。本次未切换生产固定快照及COS下载清单；它们仍对应已发布1.0.0。3036预览直接引用最新源码，主站正式构建未针对此未发布版本重跑。
- 完整原站三端逐帧对照及系统减少动态偏好实测仍未完成。未部署、未上架、未新增依赖。临时43616服务已停止，3036保留。

---


## 2026-10-26 补充：源码 ZIP 正式发布完成

用户明确授权将 Alex 已提交源码上传既有 COS 专用目录并匿名校验，继续全站验收。只补齐交付产物，没有修改 Alex 源码、部署网站或公开上架。下文早前“尚未发布 ZIP / 构建阻塞”的描述为历史状态。

已核对独立工程干净、提交 `69ae38b76d64c71c4dd66c51a34bec4c333df061` 与固定包来源一致，并通过严格源码验收。使用主站标准 `node website/scripts/template-release.mjs --ids alex`，在本机 WSL Linux `/home/xmin/workspace/stocklens-final-20261026/alex-release` 打包，再经既有 COS SDK 上传、匿名下载校验 SHA256 和 ZIP 完整性，通过后更新 `website/templates/releases.json`。

- 版本：1.0.0；大小：11,949,236 字节。
- SHA256：`1bf56d2d0686ed120a7e738b6a8c3758c33c23374916d0567af82b9a75d09d64`。
- [已验证源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/alex/1.0.0-69ae38b76d64c71c4dd66c51a34bec4c333df061/1bf56d2d0686ed120a7e738b6a8c3758c33c23374916d0567af82b9a75d09d64.zip)。此前本地 ZIP 的不同摘要保留作历史，本次使用标准发布流程重新打包同一提交，市场引用本次已验证地址。
- 全站 `template:release:check` 和正式 `pnpm build` 已通过；实际构建位置 `/home/xmin/workspace/cryptocalc-20261026/website`，证据在 `artifacts/stocklens-rename/host-final-release-check.log`、`host-final-build.log`。

回滚时恢复先前 release 清单，不删除或覆盖 COS 旧对象。原站全动效逐帧验收、素材商业许可与公开上架边界仍按下文记录。

---


2026-10-26：已实现双语响应式律师作品集、主要动效和主站共享包接入；独立源码已提交并推送，远端与本地 SHA 一致。尚不能称“原站全部动效逐帧一致验收通过”；未进行主站部署、公开上架或 COS ZIP 发布。

## 位置与范围

- 参考：https://jiro.build/templates/portfolio/lawyer-portfolio-landing-page-alex ，实际预览 /preview/template/portfolio/lawyer-portfolio-landing-page-alex。
- 独立源码：D:/code/code-tpl/alex-template；Git https://github.com/weelume/alex-template，main，提交 69ae38b76d64c71c4dd66c51a34bec4c333df061。
- 主站中文 /templates/alex/site，英文 /templates/alex/site/en；包含三篇双语法律洞察，共八条业务路由。详情 /templates/alex。
- 源站为单页，含首屏、品牌循环、介绍、关于、五类服务、七个案例、指标、十条评价、两种方案、三篇文章入口、联系、页脚及菜单/预约/故事/服务详情弹窗。文章阅读作为独立页面接入路由。原站没有独立政策页、FAQ或视频；原先“无拖拽”的判断已由本次源码分析和实操更正。
- 品牌、双语内容、主题、共享组件、页面和路由分别维护；主站 catalog/alex 只保留 meta.ts 与 weelume.tsx 宿主适配。素材由包生成，含本地 MiSans 400/700、Poppins 400/600/700。
- 主站注入微域生光 / Weelume、既有 Logo、模板市场链接和 TemplateFiling 示例备案。默认中文，切换保留当前页面、查询与锚点。表单只本地校验，不发送或保存。

## 动效与修复

- 逐字 opacity/blur/y 揭示、不同区块错峰；关于图片按滚动进度裁剪揭示。
- 五类服务 height 展开与退出、图片错峰和 hover 缩放；详情弹窗。
- 桌面案例双纵向轨道、平板/手机横向轨道；按 ResizeObserver 测量实际长度，修复中文和断点下固定终点造成的末段留白。
- 15+、98%、$50M+ 按位上下翻动；320px 数字按列宽缩放，修复初次发现的持续横向溢出，中文和英文首页复测通过。
- 十条评价分别维护原始英文、中文、评分和头像；5.2 秒可见区自动循环，悬停/焦点暂停与手动切换。桌面五卡（中央760×380），平板三卡（834视口中央560×390），手机单卡（390视口中央358×380）。实际测量和第十条回第一条通过。
- 菜单遮罩与错峰、报价高光切换、文章图片 hover、页脚循环/悬停减速、人物入场和弹簧跟随。系统减少动态效果分支保留内容和操作，案例改为静态列表。
- Modal 统一处理滚动锁、焦点约束、Escape 与焦点恢复；真实预约弹窗键盘关闭和恢复滚动已检查。

## 构建与固定产物

所有依赖安装、编译、构建、包生成、截图转换和 ZIP 打包均在本机 WSL Linux 文件系统执行，没有服务器构建。

| 项目 | 结果/位置 |
| --- | --- |
| 独立验收 | /home/xmin/workspace/alex-20261026/template |
| 干净本地 Git 克隆 | /home/xmin/workspace/alex-20261026/delivery |
| 主站隔离验收 | /home/xmin/workspace/alex-20261026/website |
| 最终共享包 | website/vendor/alex-template-1.0.0-274fe2a2ce9b.tgz |
| 共享包 SHA256 | 274fe2a2ce9b20bc911d668aeba4d614997c43bc5bf223e40d9ea1eecbe13bf3 |
| 来源提交 | 69ae38b76d64c71c4dd66c51a34bec4c333df061，sourceDirty=false |
| 源码报告摘要 | 116906f4d005f91f5b5dd1b54179f817aafbb3f252baa5c66d98bd453c9053b8 |
| 本地完整源码 ZIP | artifacts/alex/source-zip/alex-1.0.0-source.zip |
| ZIP SHA256 | b5a382e019982e69f4e3cc1eee5f257ea7a6d9251808fddb7790fd29702255ab |

发现七个文本文件混合换行后已统一 LF，刷新源码摘要。干净 Git 克隆无需修改即可通过 check --require-verified，证明该报告摘要可由已提交源码重现。冻结安装后从干净克隆 bundle；主站 template:update 后由 pnpm 更新锁文件，没有手改锁条目。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| 独立 pnpm install --offline --frozen-lockfile | 通过，Node 24.16.0 / pnpm 9.15.4 |
| 独立 typecheck / lint / test / build | 全部通过；四项合同测试 |
| 八条独立生产路由 | 200，临时服务已停止 |
| Windows 主维护目录及 WSL 干净克隆严格协议检查 | 通过，源码摘要与报告一致 |
| 独立页面矩阵 | 1440×1000、834×1180、390×844、320×844，八路由共32组合；图片正常，320首页溢出修复后中英复测无持续溢出 |
| 三端截图 | 每端四张：首页、服务、文章、联系，共12张真实 WebP；实际像素1425×990、819×1159、375×812（工具裁去滚动条） |
| 主站 typecheck / 改动文件 lint / template:check | 通过 |
| 主站八条双语 HTTP 路由 | 全部200 |
| 主站最终四种实际视口 | 32组合，确认实际 innerWidth 为1440/834/390/320，图片均正常；三条320英文文章切页即时采样有瞬态大宽度，稳定后的单独复查恢复正常，保留原始数据；未将即时采样错误删除 |
| 模板详情与设备预览 | 三端各四图；iPad新标签页；模拟器834×1180、390×844；框内菜单、导航与服务切换通过 |
| 核心交互 | 菜单、服务、弹窗、表单校验、语言查询/锚点、评价首尾切换及案例轨道初始/中间态已实际操作 |
| 主站正式 build | 发布门禁阻止，未绕过。Alex源码ZIP尚未发布；当次全量命令还先遇到其他并行新增模板未发布ZIP |
| 完整源码 ZIP | git archive 已提交源码，python3 -m zipfile -t 通过；仅本地准备，未上传COS |

证据保留在 artifacts/alex：independent-checks.json、final-*.log、production-routes.json、host-checks.json、host-*.log、host-routes.json、browser-evidence.json、host-browser-final.json、host-stable-rechecks.json、testimonial-final.json、真实截图及 ZIP。独立报告在 .tpl/reports/verification.json。

## 边界与未完成项

- 原站全部区块三端逐帧时序、所有悬停/按压和长时间循环矩阵未完整对照，不标记全部动效一致通过。
- 浏览器接口未提供系统减少动态偏好模拟，尚未真实切换验收。
- 原站一张工地图片HTTP404，显式改用同站已有商业建筑照片，差异与来源写入ASSETS.json。
- 图片、头像和原Logo商业再分发许可未确认；listed=false，redistributionAllowed=false。字体和中文排版按规范适配，有意不照搬原站字号。
- 主站代码与锁的并行变更（CryptoCalc、CreationAI及已有其他模板）全部保留。曾因其清单尚未接齐导致隔离类型检查失败；补齐当时真实新增依赖后重跑通过，没有删注册或降低检查。主站既有 strict=false 是任务开始前状态，本任务未修改或降低类型配置。
- 源码ZIP正式上传、全量主站生产构建、部署及市场上架未执行；后续发布按 docs/template-zip-release.md 进行，使用同一份本地验收产物。
- 清理了本任务的独立临时验收进程。主站本地预览3036保留供查看；只操作本任务进程，没有停止其他工作已有服务。

## 2026-10-26 完整发布同步

同步最新提交 484e32640c5ba9a34a67daaf7b11e348884a5ebf（main），远端 SHA 一致。沿用当前提交已有匹配源码摘要的严格验收报告。固定包、依赖锁及源码 ZIP 随完整版本同步；实际生产状态及产物摘要见 docs/releases/release-20261026-full.md。本记录不撤销此前视觉、动效及素材授权限制。
