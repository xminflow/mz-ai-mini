# Playora 模板实现与交付记录

## 状态与范围

已实现独立双语模板、主站共享包接入、真实本地视频及主要交互；源码已提交推送，源码 ZIP 已上传 COS 并匿名下载验证。**尚未完成原站全部动效的精确时序、悬浮轨迹和减少动态偏好的完整对照，不标记为“完整复刻验收通过”。**

参考：[Playora](https://jiro.build/templates/education-careers/kids-learning-academy-landing-page-playora)。依据本工程 template-replication-guide.md。用户已确认原站单页之外补齐功能、博客、文章、联系及政策内页，并分别授权公开 Git 创建/推送与 COS 源码 ZIP 上传。未部署服务器、未推送主站、未市场上架。

## 独立源码与固定快照

- 主维护工程：D:/code/code-tpl/playora-template。
- Git：[playora-template](https://github.com/weelume/playora-template)；分支 codex/playora。
- 提交：94a6ea8177edc23f08dfeabfb0632d00dc4657a3，已用 ls-remote 验证与远端一致，工作树干净。
- 版本：1.0.1；协议 git-template / 0.2.0。
- 固定包：website/vendor/playora-template-1.0.1-30629aeb30f4.tgz。
- 包 SHA256：30629aeb30f40933b07f5afeb3a78bec39fe74d3a2bd3bcfcd031ce0b7bef94c；sourceDirty=false。
- 严格验收源码摘要：74577e5acc40fceabd98aebf9acb0d45facf18ecd564fab5ca59dbe006f73a14，Windows 工作树和 WSL 干净克隆的协议检查均通过。

主站 catalog/playora 保留 meta.ts、weelume.tsx 和 host.css 宿主适配；通用页面、主题、内容、组件与运行素材保留在独立包。品牌注入为微域生光 / Weelume，页脚及右下角使用模板市场入口和 TemplateFiling。playora.local 引用独立源码；生产使用 vendor 固定包，不读取本机模板目录。同步交付 package.json、pnpm-lock.yaml、templates/playora.lock.json；依赖锁由本机 Linux pnpm 生成，保留工作区其他任务已有变更。

## 页面与交互

11 页面、22 条语言路由：首页、趣味学习、关于、博客、联系、隐私、条款、Cookie 说明及 3 篇文章。默认中文，英文在端路径后的 /en；语言切换保留页面、查询和锚点；Next Link 站内导航。

运行图片/视频及 MiSans400/700、Poppins400/600/700 均本地托管。18 项原站图片、SVG 和两段视频的来源、大小和摘要记录在独立 .tpl/docs/ASSETS.json。按文档调整中文标题字号和中英文字体；原站 Neucha / Bagel 的字体形态与规范字体存在有意差异。

实现首屏逐字错峰弹簧、字母悬浮旋转、句点呼吸、按钮悬浮/按压、导航翻转、下滑提示循环、原视频自动静音循环与暂停恢复、400svh 故事窗口缩放、眼睛跟随、纸片 sticky 堆叠、步骤入场、问号循环、信任卡 rotateY 翻面、评价错峰和 FAQ 互斥展开、移动菜单。

故事窗口采用现有 framer-motion 与 sticky，不引入 GSAP。运行态检查发现直接 opacity 动画通道被覆盖，仅关闭继承未解决；最终以独立 CSS 变量驱动透明度，在三端实际确认从0到1。1.0.1 为 html:has(.po) 建立本模板限定的根定位上下文，主站新页面控制台警告已消除；bundle 按当前版本选择归档，避免误选旧包。

联系及订阅只在本地校验，明确显示尚未发送/保存；下载为展示控件。没有真实儿童账户、游戏、订阅、进度追踪或客服服务；政策为演示说明，不伪称通过 COPPA 等认证。

## 实际验证

安装、编译、bundle 和 ZIP 打包均在**本机 WSL Ubuntu 的 Linux 文件系统**进行，没有远端构建。

- 独立验收：/home/xmin/workspace/playora-20261026/playora-template。
- 干净包源码：/home/xmin/workspace/playora-20261026/package-source-v101。
- 主站隔离验收：/home/xmin/workspace/playora-20261026/website。
- Node24.16.0 / pnpm9.15.4。WSL 时钟曾在测试中回退约1秒，协议拒绝倒序；已真实重跑该测试重新记录时间，没有伪改执行时间。

| 检查 | 结果 |
| --- | --- |
| 独立冻结离线安装、typecheck、lint、test、build | 通过；最终1.0.1生成22条双语页面 |
| 独立生产HTTP、404、图片视频、字体 | 22条路由200，未知页404；18项素材与5个字体入口通过 |
| 严格协议与源码摘要 | Windows与WSL干净克隆通过、摘要匹配 |
| 主站安装、template:check --id playora、类型检查、改动文件ESLint | 通过 |
| Playora ZIP/固定快照一致性 | 通过 |
| 主站完整生产构建 | 通过；释放本任务开发服务内存后，以 NODE_OPTIONS=--max-old-space-size=2304 串行重试成功，未停止其他预览。 |
| 主站生产HTTP与宿主注入 | 22条双语路由200；品牌、市场入口和示例备案存在；目录、详情、预览通过；未知页404 |
| 三端真实截图 | PC/iPad/H5 各四张：首页、功能、博客和联系，无坏图或横向溢出 |
| 320px窄屏 | 中英文首页/功能/博客/联系/政策及文章，无横向溢出或坏图 |
| 三端实际动效 | 故事窗口约1→28.4倍，文案0→1；翻卡/返回、FAQ、视频暂停恢复通过；1.0.1三端再次实际复验 |
| 语言、表单、手机菜单 | 切换保留 contact?check=1#po-main；表单返回未发送/未保存；菜单切页后关闭 |
| 设备模拟 | H5 iframe390×844，iPad834×1180；新标签页打开，设备内菜单切至博客后切换iPad仍保留该页 |

视口要求1440×1000、834×1180、390×844；截图工具实际输出 **1425×990、819×1159、375×812**，已解码并按真实尺寸登记，不放大冒充。12张独立品牌截图保存在 .tpl/assets 并映射到主站生成素材；主站实际截图另存 artifacts/playora。

独立验收服务与临时独立预览已停止；当前保留本机主站生产预览供查看：[Playora](http://localhost:43628/templates/playora/site)。主站开发预览已停止，生产实例使用本次 WSL 验收的同一份产物。

证据：artifacts/playora 的 checks.json、各项命令日志、independent-http.json、browser-checks.json、motion-checks.json、interaction-checks.json、narrow-checks.json、source-101-final-browser.json、host-http.json、device-preview-check.json、host-final-checks.json、host-build.log、host-build-retry.log、clean-clone-format.json 及实际截图。

## 源码 ZIP

[长期公开源码下载](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/playora/1.0.1-94a6ea8177edc23f08dfeabfb0632d00dc4657a3/50aadc251f3985a1cbc637c47cab7bcda81a0ffa35a8ef430f7ec7df76472590.zip)

- 版本 1.0.1；源码提交 94a6ea8177edc23f08dfeabfb0632d00dc4657a3。
- 大小 28033246 字节；SHA256 50aadc251f3985a1cbc637c47cab7bcda81a0ffa35a8ef430f7ec7df76472590。
- 本地 WSL git archive 生成完整已提交源码，复用既有 COS SDK 上传，匿名 GET 完整下载及 ZIP CRC/路径检查通过后切换发布清单。旧版本内容寻址对象保留。

## 限制与后续

1. 原站精确分段时长、全部悬浮轨迹、触屏差异和系统减少动态偏好仍未逐项完整对照；原站浏览器多次超时，不以静态截图或路由可达冒充完整动效验收。
2. 主站验证使用本任务冻结的隔离源码快照。共享工作区其他模板同时变化时，全局门禁状态可能继续变化；不回滚或代修其他模板。
3. 完整主站首次构建有内核 OOM 证据：WSL 15GB内存约14GB已用、4GB交换空间已满。未停止其他任务的预览进程；重试结果以上表及日志为准。
4. 参考设计、图片、视频和MiSans的商业/再分发许可尚未完整核实，保持 listed=false、redistributionAllowed=false。公开源码及ZIP不等于商业授权。
5. 后续更新按独立检查/报告→提交推送→bundle→template:update→pnpm锁→源码ZIP→主站构建执行。回滚固定包、快照锁、依赖声明/锁和发布清单需一起恢复，保留旧COS对象。

## 滚动条优化（2026-10-26，主站宿主适配）

- 复用既有 PageScrollbar 与 page-scrollbar.css，未重复实现滚动逻辑或添加依赖。普通状态滑块4px，悬浮/键盘聚焦时6px；透明轨道，不再占用原先10px原生预留槽，滚动后显示，停止约1.2秒后淡出。
- 保留 document 作为唯一滚动来源，支持滑块拖拽、轨道定位、方向键、PageUp/PageDown、Home/End，以及中英文无障碍标签；没有添加嵌套滚动容器。
- 高DPI下发现 PreviewStage 的1px边框实际取整为0.666667px，原100% iframe变成1440.67×1000.67，内部视口取整后是1441×1001。改为明确的像素宽高，实际复验PC1440×1000、iPad834×1180、H5390×844均准确；通用设备预览保留外层缩放方式。
- WSL隔离目录运行 tsc --noEmit、改动TSX文件ESLint和完整生产build，全部通过；构建使用2304MiB堆内存限制。已重启本机43628生产预览。
- 浏览器验证：初始透明度0；滚动时active=true；End到文档最大值，Home回0；滑块拖拽到4480px且释放后dragging=false；失焦、悬浮移出及空闲淡出后透明度0。三端框内各一根滚动条，原生滚动条隐藏，故事区文案随滚动完整显示；英文标签为Page scroll。本轮无新控制台警告或错误。
- 此次仅更新主站滚动条与预览台适配；独立模板源码、Git提交、固定包和COS源码ZIP保持1.0.1，不将宿主组件回灌到独立工程。
- 证据：artifacts/playora/scrollbar-before.json、scrollbar-interactions.json、scrollbar-frame-checks.json、scrollbar-english.json、scrollbar-console.json、scrollbar-preview.png，以及 scrollbar-typecheck.log、scrollbar-lint.log、scrollbar-build.log。
