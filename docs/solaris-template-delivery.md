# Solaris 模板复刻交付

日期：2026-10-26（Asia/Shanghai）。参考站：<https://solaris-energy.framer.website/>。依据 `docs/template-replication-guide.md` 与独立模板协议 0.2.0 实施，参考站观察和本地页面验收均使用内置浏览器。

## 1.0.3 滚动条优化与重新截图

统一 theme.css 中重复的页面/内部滚动条令牌。旧版 scrollbar-width/color 标准属性优先于 Chromium 伪元素，导致宽度、圆角和悬停绘制被原生样式覆盖；现按浏览器能力选择绘制规则。页面轨道宽 10px、内部 8px，浅中性灰轨道、灰绿圆角滑块、2px 透明边距，悬停和按下加深，移除原生方向按钮。保留标准属性兼容和高对比模式原生配色。根节点使用 stable gutter；菜单开关实测内容及固定导航宽度均为 380px，没有横向跳动。

- PC 1440×1000、iPad 834×1180、H5 390×844 实际滚动检查通过，无横向溢出；滑块圆角及颜色的计算样式生效。手机菜单背景锁定和关闭恢复通过；主站返回模板市场后 html/body 模板标记清除。
- 首页、方案、日志、联系共 12 张真实截图重新拍摄并替换 .tpl/assets，使用已有 sharp 转 WebP、不缩放。输出分别为 1430×993、824×1166、380×822；元数据对应实际编码尺寸。独立截图保留模板品牌，主站效果另存 main-desktop.jpg / main-mobile.jpg。
- 独立类型、lint、5 项既有测试、构建、18 条路由及严格摘要检查通过。隔离主站类型、适配 lint、快照、ZIP 清单、生产构建和 18 条双语生产路由通过；本轮构建在本地 WSL Linux 文件系统，产物 .next-solaris-1.0.3，构建 ID XjwmQ-VtwfguTnWJ58KID。
- 独立 main 提交 a647481884cf3812f630aaef99e0d5097a8bc6ad，已正常追加推送并验证远端一致，源码工作树干净；固定包 vendor/solaris-template-1.0.3-22387658309e.tgz，SHA256 22387658309e2247090ad08919a950ed25f7f25cf6a950c0e082d64e5f7ab4d5。
- [1.0.3 完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/solaris/1.0.3-a647481884cf3812f630aaef99e0d5097a8bc6ad/05057c2dcad7b662f7b6c4b6b27763d446c3a720425575ca4ebb3d1f2bbd4742.zip)，12944918 字节，SHA256 05057c2dcad7b662f7b6c4b6b27763d446c3a720425575ca4ebb3d1f2bbd4742；既有 COS 上传、匿名下载、SHA256 与 ZIP 完整性验证通过。旧版本保留。
- 实际 3000 主站已经只更新 Solaris 1.0.3 并重启；独立/主站目录及 HTTP 实际返回的 12 张图片摘要全部一致。锁文件先在隔离目录生成，经现有 js-yaml 逐对象证明非 Solaris 锁数据完全不变，再通过 manifest/lock 双哈希守卫写回，离线冻结安装且禁用脚本。

过程说明：第一次实际主站安装被自动审批拦截，原因是缺少并行锁文件保护；改为上述有数据比较和哈希守卫的方案后获准执行。重启曾因既有 Windows 前端日志文件不可写而中断，已用原开发命令恢复；当前日志在 /home/xmin/workspace/solaris-20261026/main-1.0.3.log，主站页面及 /api/auth/me 实际请求返回 200。首次编译等待导致内置浏览器超时，日志确认编译后恢复正常。

当前工作区全量 template:release:check 被并行 Goalz 快照/ZIP 不一致阻断；Solaris 单项和隔离主站全量清单通过，不表示其他并行源码已验收。页面滑块的原生鼠标拖动仍处于浏览器工具不可交互区域；系统覆盖式滚动条、高对比模式和真实触摸惯性未模拟。不声称这些项目已验证。素材许可限制沿用基线，未部署线上或推送主站。证据目录：artifacts/solaris/scrollbar-1.0.3/。

## 实际主站接入核对

2026-10-26 再次核对用户使用的主站开发服务 `http://127.0.0.1:3000`，运行工程为本地 WSL `/home/xmin/workspace/weelume-dev-20261025/website`。已安装 Solaris 1.0.2，其固定包 SHA256 和来源提交与下文交付一致。

内置浏览器从主站首页实际点击 Solaris 卡片进入 `/templates/solaris`，确认详情页展示 9 个页面入口、PC/iPad/H5 预览和四张 PC 截图；再点击“在线预览”成功新开 `/templates/solaris/site`，显示微域生光品牌与模板导航。这次为既有接入的实际主站联调确认，没有重新安装依赖或修改通用模板源码。证据截图为 `artifacts/solaris/continuation/main-integration.jpg`。此记录仅确认本地主站接入，不表示线上部署。

## 1.0.2 继续验收与修正（本轮最终版本）

根因：旧版把普通鼠标点击产生的按钮焦点也作为暂停条件，点击暂停再播放后，即使鼠标移出，保留的焦点仍阻止进度运行。旧验收只覆盖暂停和切换，遗漏保留焦点后的恢复分支。

现将手动暂停和键盘焦点分别建模；只有可见键盘焦点触发焦点暂停，明确播放操作允许保留焦点恢复。同步完善按钮无障碍状态、减少动态效果说明、空/单项集合、方向键及触摸取消处理，没有增加依赖。

- 本地 WSL 独立工程的冻结安装、类型检查、lint、5 项测试、生产构建和 18 条双语路由通过，严格协议源码摘要匹配。
- 内置浏览器实际采样鼠标暂停→播放→保留焦点移出，修复前进度不变，修复后持续推进；键盘进入暂停、Enter 恢复及平板/手机视口采样通过。
- 主站隔离副本的固定包、ZIP 清单、TypeScript、适配文件 ESLint、完整生产构建通过；18 条双语生产路由均 200。内置浏览器验证主站保留焦点恢复、代表三端布局和品牌，未记录控制台错误。本轮未重跑旧版全部 72 组矩阵。
- 初次主站构建被本地 WSL OOM 终止（内核日志确认），以 Node 3GB 堆限制重试成功，没有关闭其他工程服务。成功产物目录为 .next-solaris-1.0.2，构建 ID BwonfI8hXox3Jwtc_zm1E；已将同一产物切换到 [原预览地址](http://127.0.0.1:43421/templates/solaris/site)。
- 独立 Git main 提交 17cf25c63e171954391171c534418a547b3fbe3c，远端 SHA 一致、工作树干净；固定包 vendor/solaris-template-1.0.2-562239bd7a12.tgz，SHA256 562239bd7a12f91c04ef1228be801882bc59e60b4a3dc44861f37e50f86d7155。
- [完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/solaris/1.0.2-17cf25c63e171954391171c534418a547b3fbe3c/d824dac7d2391d2daa7689cdec96101e53bfaa663b83c97c571f4675c9f361a0.zip)，12925947 字节，SHA256 d824dac7d2391d2daa7689cdec96101e53bfaa663b83c97c571f4675c9f361a0；既有 COS SDK 上传、匿名完整下载、摘要与 ZIP 完整性检查通过，旧版本保留。
- 主站锁文件在独立 WSL 目录以离线、仅生成锁、不执行脚本模式更新，写回前保护 manifest/lock 哈希；Solaris 三处锁条目与已安装验收副本一致。没有安装当前主站并行新增的模板依赖。

验收证据在 artifacts/solaris/continuation/；独立源码的播放回归记录在 .tpl/reports/playback-regression.json。当前主站全量 template:release:check 因并行 Rhys 缺少源码 ZIP 记录失败；Solaris 单项检查和既有 51 模板隔离副本的全量清单通过，不宣称当前全部并行源码已构建验收。

本轮同步最初因批量覆盖风险被自动审批拦截，随后先只读核对目标仅有本轮修改，再经审批精确同步 8 个文件。系统减少动态效果的实际模拟、真实触摸惯性、原生滚动条滑块拖动和完整页面过渡对照仍未验证；滚动条坐标被浏览器控制接口排除在可交互内容视口之外。素材商业再分发许可仍未确认，保持未上架；未部署线上、未推送主站。

以下保留 1.0.1 基线交付历史：

## 页面与实现

独立源码位于 `D:/code/code-tpl/solaris-template/`，采用现有 React、Next.js、TypeScript 和 framer-motion，没有新增第三方运行库。品牌、双语内容、主题、组件、页面与路由分别维护；主站 `catalog/solaris/` 只保留共享包注册和宿主适配。

原站有首页与联系页。首页包含住宅首屏、资质循环带、关于和项目 Reel、统计、安装品牌、六项方案、收益折叠区、四个项目、服务区域、四步安装流程、五条评价、FAQ 和页脚。联系页的原始医疗行业误用文案改为太阳能咨询文案。另依规范补充独立方案页、日志、三篇演示知识文章、隐私政策和条款，共 9 页、18 条中英文路由；补充文章和政策不冒充原站内容。

主站注入微域生光 / Weelume、既有 Logo、右下角模板市场入口和共享 `TemplateFiling` 示例备案。运行图片与字体本地托管；地图保留 Google Maps 嵌入。联系表单只有本地校验，不发送或保存。

## 动效及交互

- 按公开页面配置实现标题和正文逐词模糊入场、20px 位移、50ms 英文错峰、0.7s 缓动，按钮延迟进入；中文按字符调整错峰。
- 房屋进入及滚动位移/缩放；各区块按原站参数使用 80/100px 弹簧入场与分列错峰；导航和手机菜单进入，手机关闭背景滚动并管理键盘焦点。
- 10+、500+、20 年统计计数约 2s。原站信任带同时写 25 年质保，属于原站内容不一致，本次保留原值并记录。
- 四张项目 Reel 每 4s 切换、0.8s 图片交叉过渡、进度条、文字进入、悬停暂停、播放/暂停及方向控制；手机按原站隐藏文字浮层。该区块实际使用图片轮播，不是视频。
- 资质轨道按 40px/s 计算周期，保留原站悬停速度，并支持焦点暂停与离屏停止；方案/项目悬浮效果、收益折叠、FAQ 高度动画、流程 sticky、评价图文切换和按钮按压。

参数清单与维护入口在独立工程 `.tpl/docs/MOTION.md`。不以统一淡入替代所有区域动效；未完整对照的项目列于限制中。

## 独立验证

实际安装、编译、打包与构建验收位置为本地 WSL Linux 文件系统：`/home/xmin/workspace/solaris-20261026/solaris-template`，Node 24.16.0、pnpm 9.15.4。

- `pnpm install --frozen-lockfile`、`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 通过。
- 严格协议 `node .tpl/tools/check.mjs . --require-verified` 通过；源码摘要 `2115c8bf766a01dd0c4539ab390a762fcc5e3846b2a0a900f7018a2c87571fa0`。
- 生产实例的 18 条双语路由均 HTTP 200；验收用候选实例结束后已停止。
- 9 页 × 2 种语言 × 1440/834/390/320，共 72 组实际浏览器页面检查，无横向溢出、重复主标题或已加载损坏图片。
- 三端实际触发并采样入场初态、计数、滚动变换、轮播暂停前后、手动切换、FAQ 和评价。手机额外验证三个计数终态、菜单焦点进入及 Escape 恢复。
- 三端双语表单校验共 6 组，确认错误和“未发送或保存”提示；语言切换保留对应页面、查询参数和锚点。
- 12 张真实截图已交付，每端首页/方案/日志/联系四张。内置浏览器输出尺寸与 CSS 视口不同，按实际解码结果登记；WebP 转换没有二次缩放。

| 设备 | CSS 视口 | 截图真实尺寸 |
| --- | --- | --- |
| PC | 1440×1000 | 1430×993 |
| iPad | 834×1180 | 824×1166 |
| H5 | 390×844 | 380×822 |

结构化证据在独立工程 `.tpl/reports/`；主站侧过程记录和原始截图在本工程 `artifacts/solaris/`。

## Git、固定包与源码 ZIP

Git：<https://github.com/weelume/solaris-template>，分支 `main`，最终提交 `911133a1a73b31531e6dcd178e224cebfa14e905`，正常追加提交并核对远端一致，没有强制推送。

版本 1.0.1 的固定包为 `website/vendor/solaris-template-1.0.1-7772ea9229f5.tgz`，SHA256 `7772ea9229f5bed6000f08c690edb31185797ccff2ba788d9257f79ea61bcc38`，来源工作树干净。

[完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/solaris/1.0.1-911133a1a73b31531e6dcd178e224cebfa14e905/8a8f844275505c6bffe1ad2458650ba92fa1b57c2332e0a61a4e8dd7280b4779.zip)，12,922,732 字节，SHA256 `8a8f844275505c6bffe1ad2458650ba92fa1b57c2332e0a61a4e8dd7280b4779`。通过既有 COS SDK 上传、匿名完整下载、SHA256 和 ZIP CRC 检查后更新发布清单。旧对象保留。

主站配套变更包含 vendor、模板锁、package.json、pnpm-lock.yaml、releases.json、注册和本地源码适配。生产只使用固定包，不读取本机独立源码路径。

## 主站验证

主站 WSL 验收工程：`/home/xmin/workspace/solaris-20261026/website`，构建目录 `.next-solaris`。完整生产构建退出 0，构建 ID 为 yLFt9c-RsbP-8Sliolw9i，同一份 standalone 产物在本机 43421 端口验收。

主站目录生成器原有的元数据转换遗漏 CSS 副作用导入和无导入属性的 JSON 数据读取，导致 Node 拒绝生成目录。本次先用真实 CSS/JSON fixture 复现，再在目录工具明确剔除无绑定 CSS 导入、按数据语义读取 JSON，并保留浏览器实际源码。另在 JSON 展示数据边界检查截图非空，修正 JSON 导入丢失元组信息导致的类型错误。没有移除其他模板的运行样式。

- 主站 template:check、template:release:check、TypeScript、改动文件 ESLint 和完整 build 通过。
- 独立模板 72 组检查之外，主站再完成 72 组中英文/四视口检查；品牌、示例备案、市场入口、标题字体、html/body 滚动条主题均通过，未发现横向溢出或已加载损坏图片。
- 实际验证轮播进度持续运行、FAQ、主站路径下的本地表单及英文路由；从右下角入口返回模板市场后，html/body 的模板标记移除、滚动条恢复主站主题。
- 市场三端各显示 4 张真实截图，三种入口实际打开新标签；iPad/H5 内层 CSS 视口为 834×1180 / 390×844；H5 iframe 内菜单和语言切换通过。
- 目录生成器回归测试先失败再通过；项目已有首页资源回归检查通过，未将模板运行资源带入首页。
- 本地预览：[整站](http://127.0.0.1:43421/templates/solaris/site)、[英文](http://127.0.0.1:43421/templates/solaris/site/en)、[详情](http://127.0.0.1:43421/templates/solaris)。

验收副本生成后，并行工作在主站新增 Newcomer 依赖。本任务没有安装或验收 Newcomer，也未覆盖该更新；现有 pnpm 锁文件中 Solaris 的 importer、package、snapshot 三处条目与已验收副本一致，归档 SHA512 校验通过。完整构建记录对应上述隔离副本，不扩展为对随后并行变更的验证。

自动审批曾拒绝包含 Newcomer 的依赖重新安装，理由为该依赖未经本任务批准且涉及覆盖验收副本文件。该动作未执行；随后只读核对现有锁文件已足够完成 Solaris 交付，未绕过审批或重试该安装。

## 限制与交付边界

1. 原站图片商业再分发许可未确认，保持 `listed=false`、`redistributionAllowed=false`。公开 Git/COS 不构成素材商业授权。
2. 减少动态效果已在实现中支持，但系统偏好的实际模拟尚未验证。
3. 页面切换过渡、滑块鼠标拖动和触控惯性尚未做完整原站三端对照；不标记“所有动效逐像素完整验收”。
4. Google Maps 依赖外部服务可达性；表单没有真实提交服务。
5. 仅交付独立模板 Git、源码 ZIP 和主站本地接入，没有提交/推送主站仓库，没有部署官网或市场上架。
6. 主站完整构建保留了生成 CSS 的优化警告和其他文件既有的无效 eslint-disable 警告，未为消除提示修改无关模板；实际日志保存在 `artifacts/solaris/host-build.log`。
7. 内置浏览器曾出现连接资源不足及页面读取超时，已用本任务的新标签继续未完成项；失败尝试未计入 72 组通过记录，未换用其他浏览器。
