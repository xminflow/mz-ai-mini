# Shelta 模板交付记录

参考站：https://shelta.framer.website/ 。交付日期：2026-10-24。

## 源码与产物

- 独立工程：D:/code/code-tpl/shelta-template。
- Git：https://github.com/weelume/shelta-template，main，提交 `39429e01130c34a588f85e260cf6df736edd959a`。最终远端 SHA 已复核一致，独立工程工作区干净。
- 固定包：website/vendor/shelta-template-1.0.0-78e3129ff581.tgz；SHA256：`78e3129ff581772865bfe1c0a190d839b7cf992d95c29280d529e34650f86d2b`。
- [完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/shelta/1.0.0-39429e01130c34a588f85e260cf6df736edd959a/885a87c44a176d5156270baacdda51eccc48c908a45c19f8b4306b660117d19e.zip)，86125168 字节；SHA256：`885a87c44a176d5156270baacdda51eccc48c908a45c19f8b4306b660117d19e`。由已提交源码在本地 WSL Linux 文件系统生成，已有 COS SDK 上传，匿名完整下载、摘要及 ZIP CRC 校验通过。
- 主站只保留宿主适配，通用页面、文案、样式和交互由独立包维护；中文默认，英文 /en，宿主注入微域生光品牌、模板市场入口和示例备案。

## 实现范围与验收标准

33 个页面、66 条双语路径：主页、房源列表与 8 个详情、关于、服务、顾问、文章列表与 12 个详情、联系、3 个工具页、条款、隐私和 404。原站 chaneglog 路径拼写保留。12 篇原站文章共用正文的关系保留。

已实现菜单遮罩与焦点约束、语言切换保留路径/查询/锚点、滚动入场、计数器、粘性流程卡、服务手风琴、7 视频滚动墙及离屏暂停、Logo 跑马灯、逐字悬停、评价拖动切换、FAQ、图片画廊、演示表单本地校验。表单不发送、不保存。原始媒体保留在 media，网页派生图片与视频位于 web-media。

可检查标准为路由与素材可访问、构建和类型检查通过、抽查视口无溢出和破图、关键已列交互可操作。全站逐帧视觉一致性未作为已通过项目。

## 验证结果

独立验收位置：本地 WSL /home/xmin/workspace/shelta-20261024/template。

- pnpm typecheck、pnpm lint、pnpm test（3 项合同测试）、pnpm build 均通过。
- scripts/smoke.mjs：66 条路由、182 项原件与网页素材、未知路由 404 通过。独立中文 /404 为 Next 保留错误页，状态 404；英文演示页状态 200。
- tpl-format --require-verified 通过，源码摘要 adc34072cd40aa1cd10e41156843568cb7a56524131d651bf4a50cefbf3af00b。
- 首页、服务、文章列表、联系页三端共 12 张实际截图；另抽查 10 个 320px 路径，无溢出。菜单、联系表单、语言切换、FAQ、画廊、视频播放及离屏暂停抽查通过。最终控制台无错误。
- 独立协议与自身验收详见工程 .tpl/reports/verification.json；独立验收服务已停止。

主站隔离验收位置：本地 WSL /home/xmin/workspace/shelta-20261024/baseline/website，仅已提交主站基线加 Shelta 接入。

- template:check --id shelta、tsc --noEmit、接入文件 ESLint、template:release:check、WEBSITE_BUILD_DIR=.next-shelta-build pnpm build 通过。
- Build ID：KrRS6FRK-8Yrlgrg-LDsE；66 条生产路径与未知路径 404 通过。主站中文/英文演示 404 均为模板页面，状态 200。
- 主站最终包首页 1440×1000、834×1180、390×844 无溢出与破图，标题字重 700。截图：assets/shelta/host-{desktop,tablet,mobile}-home.png。
- 预览：http://localhost:43452/templates/shelta/site 。该服务是本地 WSL 开发预览。

当前完整工作区还包含其他任务未提交改动，其全局发布检查停在 Noter 缺少源码 ZIP；本记录不宣称完整工作区构建通过。既有 playbook 文件有无用 ESLint 禁用注释警告，未修改无关文件。未在任何远端服务器构建，未部署主站，未提交或推送主站仓库。

## 未完成与风险

- 原站全部页面、全部三端、逐帧动效和精确曲线对照尚未完成；不能宣称完整像素或动效复刻验收通过。评价目前为 3 条，数量少于原站。
- 减少动态效果已有实现，但未在系统偏好下实测。
- 图片、视频和字体的商业再分发许可未逐项核实；模板保持 listed=false，未上架。
- Git 和 COS 的公开交付均已获得用户明确授权；该授权不包含主站部署或市场上架。
