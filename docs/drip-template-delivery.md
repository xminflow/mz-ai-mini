# Drip 品牌手册复刻与交付

日期：2026-10-23。参考站：<https://minimal-monstera-959750.framer.app/>。依据 `docs/template-replication-guide.md` 与独立模板协议 0.2.0 实施。

## 内容与维护入口

独立主维护工程为 `D:/code/code-tpl/drip-template/`，默认品牌 Drip。完整覆盖原站九个锚点章节：封面、目录、品牌介绍、标志、色彩、字体、摄影、品牌应用与资源。按用户确认保留单页手册结构，没有增加博客、联系表单或政策页。中文默认 `/`，英文 `/en`。原站字体按本项目规范改用本地 MiSans 400/700 与 Poppins 400/600/700，标题控制在 28–44px。

通用模块位于独立工程 `src/features/site-templates/catalog/drip/`：`config/brand.ts` 管理品牌与联系方式，`content.ts` 管理双语章节和色彩，`media.ts` 管理图片、真实尺寸和双语说明，`tokens.css` 与 `theme.css` 管理视觉，`components/` 管理目录、章节和图片，`pages/ManualPage.tsx` 组合九章节。

主站 `website/src/features/site-templates/catalog/drip/` 仅保留元数据导出及宿主适配，通过 Provider 注入微域生光 / Weelume、现有 Logo、右下角模板市场入口和共享 `TemplateFiling`。独立源码、素材、规则和验收资料没有混入宿主接入记录。原始品牌作品图片和正文仍以 Drip 品牌为演示内容。

交互包含桌面当前章节提示、原生锚点、手机覆盖式目录、Escape 收起菜单、保留查询参数及锚点的语言切换。资源下载仅展示，不下载、不跳转、不发送或保存数据。没有后端、数据库或异步任务变更。

## 已修正的问题

1. 图片没有预留固有尺寸会导致懒加载后布局变化；所有运行图片补齐真实宽高。
2. 语言切换后正文高度变化会使旧锚点偏移；字体就绪后重新对齐对应章节，保留查询和锚点。
3. 手机目录展开挤动文档流；改为覆盖式目录，收起后章节位置保持稳定。
4. 宿主全局样式改变标题字重；在模板内明确标题字重，注入品牌导航使用 24px Logo / 18px 文字。
5. bundle 误调用系统其他版本的 pnpm；改用当前固定包管理器运行时。

## Git、固定包与源码 ZIP

| 项目 | 结果 |
| --- | --- |
| 源码仓库 | <https://github.com/weelume/drip-template> |
| 分支 | `main` |
| 本地与远端一致提交 | `c1a48e1f3f66723944a6578f834303a60bba33ed` |
| 模板版本 | `1.0.0` |
| 固定包 | `website/vendor/drip-template-1.0.0-00a0704bb381.tgz` |
| 固定包 SHA256 | `00a0704bb3815efab799e6af78f5222d731a7a58c579be88ca768f03e58d18e0` |
| 来源状态 | `sourceDirty=false` |
| 严格验收源码摘要 | `4c179d987804b54e4542649d7a3f2079e3c87e0b13b844bd4990e92b0d3d7ce6` |
| 源码 ZIP 大小 | 14,666,136 字节 |
| 源码 ZIP SHA256 | `a2623a25f57927166806f1cdcbd80f401f1c8d449826454c102dde5d0f621cd4` |

[已验证的完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/drip/1.0.0-c1a48e1f3f66723944a6578f834303a60bba33ed/a2623a25f57927166806f1cdcbd80f401f1c8d449826454c102dde5d0f621cd4.zip)。用户明确授权公开仓库创建、推送及 COS ZIP 上传。通过既有 `template_release.py` 在 WSL Linux 文件系统打包，用现有服务端 COS SDK 上传，匿名下载后检查 SHA256 和 ZIP 完整性，成功后合并 `website/templates/releases.json`。没有改存储桶权限、覆盖旧对象或部署主站。

标准 `template:release` 的默认 WSL 启动调用超时，随后按 `docs/template-zip-release.md` 的分步流程使用显式 Ubuntu 完成相同打包与发布逻辑，没有更换构建平台。

配套改动为模板锁、`website/package.json`、pnpm 生成的 `website/pnpm-lock.yaml`、发布记录、注册表、共享包配置和仓库清单。本地 `website/drip.local` 引用独立源码；生产只消费固定包。运行素材和展示截图由同步器生成到 `website/public/templates/drip/`。

## 验证结果

依赖安装、编译、共享包与 ZIP 打包均在本地 WSL Ubuntu 的 Linux 文件系统完成，没有在远端服务器或 Windows 文件系统构建。Node 24.16.0，pnpm 9.15.4；只增加用户批准的内部 `drip-template` 包，没有新增第三方库。

| 检查 | 结果 |
| --- | --- |
| 独立冻结安装 | `pnpm install --offline --frozen-lockfile` 通过 |
| 独立应用 | `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 通过；3 项合同检查素材真实字节、源码边界及资源展示限制 |
| 独立协议 | `node .tpl/tools/check.mjs . --require-verified` 通过，ready，报告摘要匹配 |
| 真实服务 | `/`、`/en` 为 200，未知路径为 404；严格报告中的生产验收服务已停止 |
| 独立浏览器 | 中英文 × 1440 / 834 / 390 / 320，共 8 组无横向溢出；九章节完整，已加载图片没有损坏 |
| 交互 | 语言保留查询和锚点、菜单展开、导航后收起、资源展示按钮共 4 项通过；无控制台 error/warn |
| 展示截图 | 三端各封面、色彩、摄影、资源四张，共 12 张真实截图；原站没有博客或联系页，按确认的九章节结构选取对应内容 |
| 主站应用 | WSL 类型检查、改动文件 ESLint、`template:check --id drip` 与 3 项共享包/发布合同测试通过 |
| 主站浏览器 | 双语 × 四种宽度，共 8 组通过，验证品牌、标题字重、示例备案、市场链接、图片与横向溢出 |
| 市场预览 | 每端四张截图，PC / iPad / H5 入口实际打开新标签页；iframe 的 CSS 视口分别为 834×1180、390×844 |
| Drip 发布记录 | ZIP 已通过匿名下载验证，源码提交与固定包一致；针对 Drip 的发布清单校验通过 |
| 共享工作区生产构建 | 被并行 Graybeam 模板尚未发布源码 ZIP 的门禁拦截；没有绕过门禁或覆盖另一任务修改 |
| 独立主站构建 | 基于主站 Git 基线 `09c79357f63b20da65894379e33098138f1231c4` 加 Drip 改动，标准 `pnpm build` 通过；编译、类型、37 个静态页面及运行文件收集完成 |

生产产物构建 ID：`Z4JQrfrLjL1bpv8sfbQ61`；standalone 入口 SHA256：`e13644941e7270e2ba6fed0c99ef4d624615614d912279212a89fe76a184cb7f`。同一构建的正式 standalone 入口在本地端口 43316 运行，中文、英文、详情、三端预览、图片、字体、截图及 Next 静态资源全部 HTTP 200；生产浏览器验证语言锚点、Escape 关闭菜单、24px Logo / 18px 品牌文字、700 标题字重，无控制台 error/warn。冻结依赖安装复验通过。

本地生产产物预览：<http://127.0.0.1:43316/templates/drip/site>；英文：<http://127.0.0.1:43316/templates/drip/site/en>；详情：<http://127.0.0.1:43316/templates/drip>。保留此预览服务，旧的 43313 开发预览已停止。该预览没有部署到远端。

独立构建目录：`/home/xmin/workspace/drip-20261023/drip-template`；共享状态的主站副本：`/home/xmin/workspace/drip-20261023/website`；Git 基线加 Drip 的独立验收副本：`/home/xmin/workspace/drip-20261023/isolated/website`。证据保存在独立工程 `.tpl/reports/` 和本工程 `artifacts/drip/`。

## 限制与风险

- 原站品牌图片和标志的商业及公开再分发许可未确认；来源和摘要已登记，保持 `listed=false` 与 `redistributionAllowed=false`。公开源码和 ZIP 不构成素材商业授权。
- 原始品牌图片中的英文未重绘成中文。字体章节按本项目规范采用 MiSans / Poppins，与参考站 Rubik / Geist Mono 有意不同。
- CSS 验收视口严格使用 1440×1000、834×1180、390×844。浏览器截图接口返回图片分别为 1425×990、819×1159、375×812；元数据登记真实编码尺寸，没有拉伸或补造像素，精确导出尺寸未满足规范建议。
- 登录后的教程提示词复制未做浏览器操作验收；发布清单中的 COS 下载地址已校验。
- 未进行远端全新克隆后的再次应用启动；已在隔离 Linux 目录冻结安装、构建和运行。减少动态效果仅检查实现，没有模拟操作系统偏好。
- Next.js 构建有未注册 Next ESLint 插件提示；没有通过降低检查规则忽略错误。
- 主站工作区有其他任务的并行修改，未提交、推送或部署主站；共享工作区整体发布门禁尚需其他模板完成各自交付。

## 后续更新与回退

通用修改在独立模板验证、提交及推送，再在本地 WSL bundle。主站执行 `template:update --id drip <tgz>`，由 pnpm 更新锁，执行 `template:release --ids drip`、模板与发布检查和本地 WSL 构建。生产产物必须与本地验收产物一致，服务器只接收及运行。

首次接入尚未部署，无线上切换需要回滚。撤回时只撤回 Drip 注册、适配、配置、依赖、固定包、模板锁和发布记录；保留其他任务改动及已公开的内容寻址 COS 对象。以后回退须同时恢复固定包、依赖锁、模板锁与对应源码发布记录，再在本地 WSL 构建验收。
