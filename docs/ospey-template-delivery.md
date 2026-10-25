# Ospey 模板交付记录

参考：[Jiro Ospey](https://jiro.build/templates/real-estate-construction/real-estate-landing-page-ospey)。交付日期：2026-10-25。

## 源码与产物

- 独立工程：`D:/code/code-tpl/ospey-template`。
- Git：[weelume/ospey-template](https://github.com/weelume/ospey-template)，分支 `codex/ospey-template`，提交 `7b3a395982232b06382b292b572019581467607a`。正常推送，`ls-remote` 与本地 SHA 一致，工作区干净。
- 固定运行包：`website/vendor/ospey-template-1.0.0-648d4f58c955.tgz`；SHA256：`648d4f58c95517a44034684b3fae52a4c568f8e4da27a275728e43324fc3259e`。
- [完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/ospey/1.0.0-7b3a395982232b06382b292b572019581467607a/f99f48eeab67f641c7216e3040fc7a9e963479a2c231976ed17510d73dfc5ec2.zip)，26,583,153 字节；SHA256：`f99f48eeab67f641c7216e3040fc7a9e963479a2c231976ed17510d73dfc5ec2`。本地 WSL Linux 文件系统生成，复用既有 COS SDK 上传；匿名完整下载、SHA256 及 ZIP CRC 校验通过后切换发布清单。
- 用户已分别明确授权创建仓库和上传源码 ZIP；没有推送主站、部署或市场上架。

## 实现与验收标准

参考站为单页，导航使用锚点；没有独立博客、文章或联系路由。实现中文默认与 `/en` 两条路径，覆盖首屏、关于、施工进度、精选房源、服务、全部房源、评价、FAQ、联系及隐私说明。三端每端四张真实截图覆盖首页、关于、房源和联系区块，不虚构内页。

保留天空视频与透明建筑叠层、3.2秒独立入场、2秒计数、滚动逐词点亮与视差、5秒轮换的9阶段进度、4项视频房源轮播、四方向服务卡片入场、房源粘性栏、预约弹窗、10条评价38秒循环、FAQ与页脚入场。六个视频与全部图片、字体本地托管。中文及英文首屏字号按本项目28–44px令牌调整；未加入装饰箭头。预约和订阅明确仅本地校验，不发送或保存。

主站仅保留注册与宿主适配，通用实现由独立包提供；注入微域生光品牌、模板市场入口和共享示例备案。本地 `ospey.local` 引用独立源码；生产只使用固定包和摘要，不读取本机源码路径。

可检查标准：类型、改动文件lint、相关合同测试及构建通过；双语路由、未知路由404、运行素材可访问；三端及320px无横向溢出和破图；菜单、轮播、语言切换、FAQ和演示表单可操作。

## 已执行检查

独立工程验收位置：本机 WSL `/home/xmin/workspace/ospey-20261025/package-source`，由本地已提交工程独立克隆。

- `pnpm typecheck`、`pnpm lint`、`pnpm test`（3项合同测试）、`pnpm build` 通过。
- 生产服务验证 `/`、`/en` 为200，未知路由为404；229项本地运行素材完整读取通过；本轮生产验收服务已停止。
- `.tpl/tools/check.mjs --require-verified` 通过；源码摘要 `f00f1d68780d31c9bb9a4511e06e168d640a4842ea7e7fc6fc1e35eeaff4be7a` 与报告一致。报告的源码基线提交早于仅增加报告的最终提交，符合协议。
- 1440×1000、834×1180、390×844实际截图共12张，另检查320px中英文无溢出；抽查图片无破图。
- 手机菜单、房源轮播、预约本地校验、FAQ和订阅提示通过；语言切换保留查询参数和锚点；抽查控制台无错误。
- 构建有既有 ESLint 配置未检测到 Next 插件提示，独立 ESLint 与构建检查均通过。

主站隔离验收位置：本机 WSL `/home/xmin/workspace/ospey-20261025/website`，使用本次固定运行包与当前接入源码，不影响其他本地服务。

- `template:check --id ospey`、`tsc --noEmit`、新增宿主适配文件 ESLint、`template:release:check` 通过。
- `WEBSITE_BUILD_DIR=.next-ospey-build pnpm build` 通过，Build ID：`qYVqkd1WMgWtIMIEXJa0_`。实际编译、依赖安装与打包均在上述本地 WSL Linux 文件系统完成。
- 使用同一构建启动生产服务：中文、英文、模板详情与平板预览返回200，未知模板内页返回404；241项生成素材均返回200。
- 主站生产包三端首页实测无溢出、无破图，天空视频实际播放，英文手机字号28px；语言切换、手机菜单、FAQ通过，控制台无错误或警告。主站微域生光品牌、市场入口与共享示例备案显示正确。
- 主站三端截图：`assets/ospey/host-{desktop,tablet,mobile}-home.jpg`。本地生产预览：[Ospey](http://127.0.0.1:43485/templates/ospey/site)，为便于审阅保留运行；没有部署至服务器。
- 构建仅有既有 playbook 文件无用 ESLint 禁用注释及 Next 插件提示，未修改无关文件。当前 `pnpm start` 使用既有包装器，Next 提示部署时应使用 standalone/server.js；本地预览实际HTTP检查通过，本次未制作或部署主站服务器发布包。

## 边界与后续

- 原站全部三端逐帧视觉、精确曲线及各时刻对照尚未完成，不能宣称完整像素或完整动效复刻验收通过；减少动态效果的系统偏好尚未实测。
- `.tpl/docs/MOTION.md` 保存参考清单，`.tpl/docs/ASSETS.json` 与 `FONTS.md` 保存来源及许可边界。图片、视频、参考设计和 MiSans 的商业再分发权尚未完整核实，保持 `listed=false`。
- 本任务未新增外部依赖版本。保留其他模板及用户已有改动；未提交或推送主站仓库。
- 后续回滚需将 Ospey vendor、`templates/ospey.lock.json`、包依赖、pnpm锁及发布清单作为一组恢复，再在本地 WSL 构建；保留旧 COS 内容寻址对象，不在服务器构建。
