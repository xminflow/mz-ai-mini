# Newcomer 模板交付与验收记录

记录日期：2026 年 10 月 26 日。当前版本：1.0.1。

## 工程与入口

- 参考站：https://newcomer.framer.website/ ，已使用内置浏览器检查。
- 独立工程：`D:/code/code-tpl/newcomer-template/`。
- Git：https://github.com/weelume/newcomer-template ，实际默认分支与交付分支均为 `codex/newcomer`。
- 已推送提交：`e15b0e49342c829e038000081cfaa9c226f18114`。推送后已核对远端分支 SHA；GitHub API 已确认仓库非空及默认分支。
- 主站适配：`website/src/features/site-templates/catalog/newcomer/`，只保留包引用、品牌和宿主注入。
- 主站模板路径：`/templates/newcomer/site`；英文为 `/templates/newcomer/site/en`。
- 本地已验收生产候选：http://127.0.0.1:43630/templates/newcomer/site 。模板详情为 http://127.0.0.1:43630/templates/newcomer 。
- 开发映射：`website/newcomer.local` 指向独立工程；生产只消费 vendor 固定包，不读取本机独立工程路径。

## 实现范围

首页、更新列表、4 篇更新详情、隐私政策，共 7 个页面、14 条双语路径。参考站的联系入口是 mailto，没有独立联系页、博客或 FAQ，因此没有虚构这些页面。截图分别覆盖首页、功能区、更新列表、候补区。

实现首屏上移入场、头像和人数弹簧错峰、五处手机滚动视差、两行反向应用循环、可拖拽的更新卡片循环、暂停与恢复、悬停反馈、菜单开合、CTA 入场及页面淡入。保留减少动态效果的代码分支。原站动效参数与尚存差异见独立工程 `.tpl/docs/MOTION.md`。

默认中文，英文通过 `/en` 切换。已实测文章页切换后保留当前页面、查询参数和锚点。Poppins 负责英文和数字，MiSans 使用真实 400/700 字重；英文展示标题保留参考站衬线风格。图片、字体、应用图标本地托管；手机示意图提供中文标签层。

主站注入微域生光 / Weelume 品牌、既有 Logo、右下角模板市场入口和 `TemplateFiling` 示例备案。独立工程保持自己的品牌与使用说明。候补表单仅本地校验，明确提示不发送、不保存邮箱。

## 固定包与源码 ZIP

| 项目 | 值 |
| --- | --- |
| 共享包 | `website/vendor/newcomer-template-1.0.1-5e648ca799b8.tgz` |
| 包 SHA256 | `5e648ca799b8e1972f180a2b9fcd1e94e4acb3f2c3e29541c8f9cb4fb0d50b99` |
| 源码提交 | `e15b0e49342c829e038000081cfaa9c226f18114` |
| 源码工作树 | 干净；快照记录 `sourceDirty=false` |
| 源码 ZIP 大小 | 6,989,044 字节 |
| ZIP SHA256 | `f6f0a42a1f2464e0686c2a2b7ea2c7b7c515367d9c70394c2eddf9de18d72959` |

[长期公开源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/newcomer/1.0.1-e15b0e49342c829e038000081cfaa9c226f18114/f6f0a42a1f2464e0686c2a2b7ea2c7b7c515367d9c70394c2eddf9de18d72959.zip) 已完成匿名下载、SHA256 及 ZIP 完整性校验，再切换 `website/templates/releases.json`。市场使用说明已在内置浏览器中确认引用该 1.0.1 地址。旧版内容寻址对象保留。

`templates/newcomer.lock.json`、`package.json`、包管理器生成的 `pnpm-lock.yaml` 和 vendor 包同步交付。锁文件保留了主站已声明的其他模板依赖，没有手工编辑解析结果。

## 实际构建位置与验证

所有安装、编译、打包和构建均在本地 WSL Linux 文件系统完成，没有在远端服务器构建或部署。

- 独立验收克隆：`/home/xmin/workspace/newcomer-release-20261026`。
- 主站验收副本：`/home/xmin/workspace/newcomer-host-20261026`。
- 源码 ZIP：`/tmp/weelume-newcomer-release-20261026`。
- Node：24.16.0；pnpm：9.15.4。

独立工程实际执行并通过：

```text
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
node .tpl/tools/check.mjs . --require-verified
pnpm run bundle
```

3 项检查覆盖素材引用、表单不发送/保存数据，以及三端截图解码尺寸与元数据的一致性。生产构建实际启动后，14 条双语路径全部返回 200，未知页面返回 404；该项临时候选已停止。源码摘要报告位于独立工程 `.tpl/reports/verification.json`，浏览器实测说明位于 `.tpl/reports/browser-qa.json`。

主站实际执行并通过：

```text
pnpm install --lockfile-only
pnpm install --frozen-lockfile
pnpm template:catalog
pnpm template:check --id newcomer
pnpm exec tsc --noEmit
pnpm exec eslint next.config.ts src/features/site-templates/registry.ts src/features/site-templates/catalog/newcomer
pnpm template:release:check
pnpm build
```

主站最终生产实例验证了 14 条双语路径、模板详情、iPad / H5 预览入口，共 17 条路径；12 张截图均实际下载、解码并核对尺寸。内置浏览器另实测：市场入口导航、离开模板后专属滚动样式清理、市场说明中的 ZIP 地址、新标签页设备预览、iframe 内菜单锁定 / Escape 关闭及语言切换。最终主站会话控制台未发现错误或警告。

主站 Build ID：`SebWlaKlkWdpKIW_Z9g5W`。关键构建产物摘要：

| 产物 | SHA256 |
| --- | --- |
| `.next/build-manifest.json` | `dd163fe2381a3bf9ab22caed1e663d46f8b4fe168dee8e17735dede34bbe6335` |
| `.next/app-build-manifest.json` | `5dcac2b617672864c104423002656652534554f29f8ad296282d6ed8d8c8d669` |
| `.next/standalone/server.js` | `114a0179971f23520bd8b95624fdcc51486945428070e442cccb33be28e90a51` |

## 三端与交互实测

| 配置视口 | 实测内容宽度 | 截图实际像素 | 数量 |
| --- | --- | --- | --- |
| PC 1440 × 1000 | 1430 | 1430 × 993 | 4 |
| iPad 834 × 1180 | 824 | 824 × 1166 | 4 |
| H5 390 × 844 | 380 | 380 × 822 | 4 |
| 窄屏 320 × 844 | 310 | 补测，无市场截图 | — |

以上差异为浏览器捕获与原生滚动条的实际结果，元数据采用解码尺寸，没有放大成配置视口。三端均已实际滚动，未发现横向溢出。模拟设备 iframe 保持真实 834 × 1180 / 390 × 844 CSS 尺寸，仅外层设备框缩放。

已触发并检查：手机菜单与滚动恢复；无效邮箱错误及有效邮箱的本地成功提示；文章双语切换保留查询和锚点；两行反向循环的位移；更新轮播暂停时位置保持、280px 拖拽、释放后不误跳转、恢复后继续运动。实际拖拽发现并修复了原生链接拖拽干扰和释放误触导航。

## 尚存差异、未验证项与边界

- 这是一套已运行、已接入的复刻版本，**尚未达到所有页面、语言和三端动效逐帧完整对照验收**，不标记为“完整逐帧复刻完成”。参考站的部分内置浏览器操作多次超时，已有源码参数清单不能代替实际动效比较。
- 使用原生滚动及 CSS 平滑滚动，没有引入参考站 Lenis 引擎，普通滚轮的惯性行为与原站存在差异。视差触发阈值、拖拽释放惯性尚需进一步逐帧对照；悬停减速与系统减少动态效果设置没有完成逐项实际切换验收。
- 页面中文化、主题规范及宿主适配存在有意差异。表单是本地演示，不含真实邮件、AI 服务、数据库或持久化。
- 主站完整构建仍有既有模板的 CSS `@import` 顺序、构建缓存及 playbook 无用 ESLint 指令警告；构建退出码为 0。本任务新增适配文件 lint 通过，未扩展修改其他模板。
- 参考设计及图片的商业再分发授权尚未核实，来源与许可状态已记录；公开 Git / ZIP 交付不等于商业授权。`listed=false`，没有执行公开案例上架、主站仓库推送或远端部署。

后续若更新生产版本，应先在独立工程修改和验收，提交 / 推送后 bundle，再同步固定包、依赖锁、ZIP 清单与主站构建。回滚须一并恢复旧版 vendor、模板锁、依赖锁及 ZIP 清单；保留已发布旧对象。

## 常用主站入口辨识修复（2026-10-26）

用户反馈当前主站入口不可见。核实常用开发实例 `http://127.0.0.1:3000/` 后，确认注册、依赖和生成目录均已包含 Newcomer，首页首批卡片及“产品落地页”分类均可找到它。原展示名称仅为“微域生光 · 随身 AI 助手”，缺少 Newcomer 标识；上轮交付又集中提供了 43630 验收实例，未突出常用主站入口。

本轮仅调整宿主展示名称为“Newcomer · 微域生光随身 AI 助手”（英文为 `Newcomer · Weelume AI Companion`），同步当前 Windows 工作区与运行 3000 的本地 WSL 工程 `/home/xmin/workspace/weelume-dev-20261025/website`。没有新增注册、改变上架状态或重新发布独立模板。

在实际 3000 工程执行 `pnpm template:catalog`、`pnpm exec eslint src/features/site-templates/catalog/newcomer`、`pnpm template:check --id newcomer`、`pnpm exec tsc --noEmit`，均通过。内置浏览器确认首页及分类中可见具名卡片，点击进入 `/templates/newcomer` 后，再点击“在线预览”打开 `/templates/newcomer/site`，页面、品牌及图片正常显示；预览会话未捕获错误或警告。详情截图：`.work/newcomer-reference/main-entry-detail.jpg`。

本轮没有重新执行完整生产构建；改动仅涉及两处展示字符串，已通过类型、定向 lint、模板检查与实际开发实例链路验收。未部署正式站。
