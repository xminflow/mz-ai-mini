# Goalz 模板交付与验收记录

参考站：https://goalz-template.framer.website/ 。依据本工程 AGENTS.md、docs/template-replication-guide.md、独立模板约定及 git-template 0.2.0；勘察与交互验收使用内置浏览器。

## 实现与接入

- 独立工程：D:/code/code-tpl/goalz-template，业务源码仅在此维护。主站 catalog/goalz 仅保留 meta.ts 和 weelume.tsx 宿主适配，不复制页面。
- 45 个页面 / 90 条中英路径：首页、关于、课程、教练、球员、课表、会员、博客、活动、图库、FAQ、联系、注册、政策，以及各六项课程/教练/球员/文章/赛事详情。
- 默认中文，英文 /en；切换保留页面、query、hash。联系和注册只做本地校验，明确未发送或保存。
- 独立品牌为 Goalz。宿主注入微域生光 / Weelume、现有 Logo、Next Link 模板市场入口，以及共享 TemplateFiling 的示例备案。
- MiSans 400/700、Poppins 400/600/700、图片与四段视频本地托管；来源/字节数/SHA256 见独立 .tpl/docs/ASSETS.json。没有新增或升级第三方依赖。
- .tpl 包含元数据、规则、修改指南、环境与操作合同、许可、真实截图和源码绑定验收报告。listed=false、redistributionAllowed=false。

## Git、固定包与 ZIP

用户已明确批准公开仓库创建、提交推送，以及初始和最终修复 ZIP 上传。

仓库：https://github.com/weelume/goalz-template ，分支 codex/goalz。

最终提交：fab23bd44014a3dc1d1e4f86cdb2f06802879e03。git ls-remote 与本地 HEAD 一致，独立工作树干净；未推送主站仓库。

主站包：website/vendor/goalz-template-1.0.2-c7cc461a0a02.tgz，SHA256：c7cc461a0a02618d2313a7e65659f5124d99fecdf6efcec287fa337b02696176；sourceDirty=false。配套 website/templates/goalz.lock.json、package.json 和 pnpm-lock.yaml。依赖锁由本地 WSL 的 pnpm 9.15.4 生成。goalz.local 仅供开发直接引用源码，生产只读固定 vendor 包。

[完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/goalz/1.0.2-fab23bd44014a3dc1d1e4f86cdb2f06802879e03/e4a44b5a047fa7aba76e62dbe2bf95f2d362a46ab377958bc5273c04a02bb05d.zip)

大小 38173790 bytes；SHA256：e4a44b5a047fa7aba76e62dbe2bf95f2d362a46ab377958bc5273c04a02bb05d。由本地 WSL git archive 生成，未包含依赖、构建缓存、日志、私密配置或 Git 目录。既有 COS SDK 上传后，匿名下载完整 ZIP 的摘要、路径和 CRC 校验通过，才切换 releases.json；旧对象保留。Git 与 ZIP 公开不代表素材商业授权。未部署主站或公开市场上架。

## 构建与自动检查

所有安装、编译和打包均在本机 WSL Linux 文件系统完成，没有远端构建。Node 24.16.0，pnpm 9.15.4。

独立检查目录：/home/xmin/workspace/goalz-20261026/template。通过冻结安装、pnpm typecheck、lint、test、build、.tpl/tools/check.mjs --require-verified。源摘要：3f50eab6b7cabf04a3273e76bd494f138ca30e2af3b801ccaed78d79d3472b56；逐命令真实起止时间、退出码与环境见 .tpl/reports/verification.json。随后在 release-source 独立本地 Git 克隆中冻结安装并 bundle，摘要一致。

声明的独立生产 web 服务已真实启动：90 条路径 200，未知路径 404，图片/字体/视频 Range 请求 206，随后关闭。证据：artifacts/goalz/production-checks.json。

主站检查目录：/home/xmin/workspace/goalz-20261026/host。通过固定包安装、template:check --id goalz、模板目录生成、TypeScript、Goalz 改动 ESLint、template:release:check 和完整 pnpm build。最终 BUILD_ID：dIRhilpjFYzT3G59N4OZX。主站其他页面有既有 ESLint 警告；Goalz 字体 @import 警告修复后不再出现。

主站生产服务实际检查：90 条双语路径均 200，未知路径 404；模板详情、iPad/H5 预览、截图、字体、视频均成功。证据：artifacts/goalz/host-http-checks.json。主站存在其他任务并发修改；上述隔离快照检查不代表重新验证所有无关功能。

## 浏览器、截图与动效

实际配置视口 PC 1440×1000、iPad 834×1180、H5 390×844；320px 补测中英首页、课程、英文联系、联赛详情及课表，未发现横向溢出。

首页/功能（课程）/博客/联系每端四张，共 12 张；实际 JPEG 解码尺寸为 PC 1430×993、iPad 824×1166、H5 380×822，转 WebP 没有缩放。独立 .tpl/assets 保留三端原图，主站同步到 public/templates/goalz/screenshots。协议 0.2.0 screenshot.device 不支持 tablet，纯 JSON 登记 PC/H5 八张，tablet 四张仍存 assets 并由运行时元数据正确登记，不误标设备或擅改协议。

三端已实际检查 FAQ 展开中间/结束状态与互斥、数字从零经中间值至 500+/100+/4.9★/10+、创始人文字随滚动由 blur(16px)/opacity .25 经中间值至 blur(0px)/opacity 1。平板/手机菜单背景宽度和画面保持，内部键盘滚动，关闭精确恢复原 scrollY 与内联样式；桌面和手机菜单实际切页通过。

语言切换保留查询与锚点；联系和注册的必填/格式/年龄/成功状态已操作，不记录表单值。四段视频在手机实际解码播放并暂停，PC/iPad 首段补测。导航和视频 debug 日志为单行结构化上下文，浏览器采样未捕获 warn/error。证据：artifacts/goalz/browser-checks.json。

主站生产版三端已复核品牌、市场入口、示例备案、本地字体、无破图和无横向溢出。实际计算标题和正文为 GoalzPoppins, GoalzMiSans, sans-serif。在线预览点击后开启新标签页，PC 直接进入整站；iPad 834×1180 和 H5 390×844 的设备框与 iframe 固定 CSS 尺寸实际检查，并点击切换。主站语言 query/hash 与视频播放通过。离开模板至详情页后 .gz 不存在，html scrollbar-color 回到 auto、主站标题字体恢复。证据：artifacts/goalz/host-browser-checks.json 与 screenshots/host-*.jpg。

## 问题根因与修复

- 菜单仅设置 overflow 无法保留视觉位置和焦点行为：改用 useLayoutEffect 固定 body、负 top 和内容宽度，关闭同步恢复原样式及精确 scrollY，focus 使用 preventScroll。平板 y=1021.3333、手机 y=1628 的回归恢复通过。
- 赛事详情曾共用杯赛日程：逐项核对六项赛事并分别维护规则和安排，包含多周联赛、分日期洲际杯、单日示例及两日赛。
- 主站合并 CSS 后运行时字体 @import 排序无效：独立源码改为构建期本地字体 CSS，重新检查、推送、固定包和发布 ZIP。
- 主站 base 层标题字体覆盖模板继承：仅在宿主适配的局部容器设置 --font-display，未改其他模板或主站全局字体，重新构建并检查实际计算字体通过。

## 严格复刻验收未完成项与风险

工程可运行及上述交互检查通过，**不能宣称完整原站动效等效验收通过**。

- 尚未逐项精确测量原站全部时长、缓动、轨迹与各端手势差异，没有逐动画逐帧等效证据。动效清单及实现参数见独立 .tpl/docs/MOTION.md。
- 六篇文章已逐页对照章节结构，正文使用原创双语示例，不逐句复制原文。原站部分日期范围与正文单/双日赛示例不一致，保留并说明；明显结束年份早于开始年份的错误改为 2026。教练年限冲突按卡片保留，正文避免重复冲突数值。
- 原生滑块拖动、触摸惯性、系统减少动态效果模式尚未实机验证；内置浏览器未提供减少动态效果模拟能力，代码提供对应支持。
- 视频为 720p H.264；已用 ffprobe 检查四段保留原始素材，均无音轨，没有因转码丢失源音频。原始大视频不入仓。
- 素材、设计、字体和内容的商业及再分发许可待确认；保持不上架。
- Next 的现有 start 脚本提示 standalone 配置应使用独立入口，当前按工程脚本启动后的生产 HTTP/浏览器检查通过；没有部署或验证远端服务。

初始“浏览器阻塞、未实现”记录已由本文件替换。本任务仅保留真实已执行结果，不能用代码或截图代替未完成的严格动效验收。

## 本轮继续与导航修复

1.0.1 补齐五篇文章的实际分节：青年队四个位置故事、门将反应与步法、少年技术、赛事准备/比赛/情绪/复盘、自信文章六个编号主题与两组列表。六篇文章章节数为 5/6/5/5/5/8，中英三端共36页已实际检查无横向溢出，另补测320px英文长文章。

按参考页渲染DOM读数，常规区块位移由38px改为20px，文字改为30px与透明度入场，移除额外旋转，补回四个训练行逐字显现；三端采到初始/运行/结束状态。菜单子项减少动态效果分支直接显示。

1.0.2 修复用户反馈的两个导航问题：字符⌄受字体字形与基线影响，替换为12×12对称SVG，实测与按钮垂直中心差为0；移除滚动超过40px的压缩状态、滚动订阅及尺寸规则。桌面从0滚至5007px过程中始终76px，按钮高度约41.33px、字号13px保持不变；平板与手机始终54px。英文菜单 Enter 展开、Esc收起已验证。

证据：artifacts/goalz/followup-checks.json、original-audio-checks.json，以及 screenshots/nav-before.jpg、nav-after.jpg、article-confidence-mobile.jpg。PC四张展示截图已随箭头修正更新。

1.0.2生产收尾：已在内置浏览器再次验证PC/iPad/H5滚动导航76/54/54px稳定、SVG箭头对齐、菜单展开/收起与自信文章8节及2组列表；控制台采样无warn/error。证据为artifacts/goalz/production-browser-1.0.2.json及screenshots/production-nav-1.0.2.jpg。最终QA服务43672已关闭，视口已恢复；未部署或市场上架。
