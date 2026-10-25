# Portfolica 复刻与主站接入记录

## 交付状态

已实现可运行版本并接入模板体系；**完整原站动效三端逐项、逐时刻验收尚未完成，不能标记为完整复刻通过**。当前已实现逐字模糊、错峰弹簧、滚动触发、作品与评价循环、悬浮、菜单、FAQ 与页面淡入；Lenis 惯性滚动的新增依赖批准待用户回复，导航文字、循环精确速度、拖拽和部分页面退场仍有待对照项目。详细清单在独立工程 `.tpl/docs/MOTION.md`。

## 源码与范围

- 参考站：<https://portfolica.framer.website/>。
- 独立主维护工程：`D:/code/code-tpl/portfolica-template/`。
- Git：<https://github.com/weelume/portfolica-template>，分支 `main`。
- 本地及远端提交：`36be1597cec7e3f00ccb56840411bd60eead8ef6`；已实际 `git ls-remote` 核对一致，独立工作区干净。
- 首页、关于、全部作品、6 个案例、联系、404、隐私与条款，共13页、26条中英文路径。参考站无博客，截图使用首页、作品、案例、联系，每端4张。
- 主站 `catalog/portfolica/` 只保留 `meta.ts` 和 `weelume.tsx` 宿主适配，通用内容、主题、页面、交互、素材由共享包提供。
- 主站注入微域生光品牌、现有 Logo、模板市场入口与 `TemplateFiling` 示例备案。独立模板保留自身品牌。
- 44张原站图片、6个合作品牌SVG、4个服务图标及字体本地托管；MiSans 400/700，Poppins 400/600/700。图片内英文尚未全部中文化，商业再分发权未确认，保持 `listed=false`、`redistributionAllowed=false`。
- 联系与订阅表单只做本地校验，不发送、不保存、不预约。政策保留原站章节结构，并明确当前没有真实付款或会员服务。

## 构建位置与固定产物

安装、编译、构建与运行包归档均在本机 WSL Ubuntu 的 Linux 文件系统执行，未在服务器构建。

- 独立预览副本：`/home/xmin/workspace/portfolica-20261024/portfolica-template`；验收后已关闭独立服务。
- 独立构建副本：`/home/xmin/workspace/portfolica-20261024/build-template`，与预览缓存隔离。
- 主站当前工作区检查副本：`/home/xmin/workspace/portfolica-20261024/website`。
- 主站隔离验收副本：`/home/xmin/workspace/portfolica-20261024/host-baseline`，由主站已提交基线仅叠加 Portfolica，未删除或覆盖当前工作区其他模板的并行修改。
- 固定包：`website/vendor/portfolica-template-1.0.0-761c0087e4cb.tgz`。
- SHA256：`761c0087e4cb9fd8232c9cf324ce1f0e70e7c595a5ec414316f58b97c5e08095`。
- `website/templates/portfolica.lock.json` 记录上述已推送提交与 `sourceDirty=false`；生产使用此包，不读取本机独立工程路径。
- `package.json`、pnpm生成的 `pnpm-lock.yaml`、固定包与模板锁一并交付。锁生成读取当前最新依赖，保留并行新增的 Rescale，并在回写前检测并发修改；未升级第三方依赖。
- 本机 `website/portfolica.local` 已配置独立源码开发引用及专属素材同步，不进入生产配置。

## 验证结果

| 检查 | 结果与范围 |
| --- | --- |
| 独立 `pnpm install --offline --frozen-lockfile` | 通过，复用既有工具与依赖版本 |
| 独立 `pnpm typecheck`、`pnpm lint` | 通过 |
| 独立 `pnpm test` | 4项合同通过：双语路由唯一性、本地素材、表单边界、SVG重复命名空间回归 |
| 独立 `pnpm build` | 通过，26条双语路径 |
| 独立模板协议及摘要检查 | 通过；源码摘要 `28a827772bccb01adf5a1f5e1f6debe289c04d3355bc160e8a90743b29b33822` 与报告匹配；合同通过不等于完整原站动效通过 |
| 独立实际页面 | 13页 × 2语言 × 1440/834/390/320，共104组合，无横向溢出或损坏图片 |
| 独立交互 | 手机菜单与跳转、FAQ、本地表单校验、中英文切换保留查询与锚点通过 |
| 独立三端循环 | 1440/834/390实际记录持续位移、键盘聚焦暂停及恢复；原站精确速度、释放回弹等未全量对照 |
| 展示截图 | 12张真实WebP；1440×1000、834×1180、390×844。默认截图接口曾返回缩小尺寸，改为显式CSS视口范围重拍并逐文件核验像素尺寸 |
| SVG回归 | 发现原站内联SVG独立化时重复xmlns导致4图标损坏；修正、XML校验、实际页面及合同回归通过 |
| 当前工作区主站类型检查 | 当次被 OfferSuite、Rescale、Shelta 未安装的共享包阻塞；未修改其他任务源码。Rescale随后已由并行任务加入依赖，未宣称全工作区重验通过 |
| 主站隔离基线类型与改动文件ESLint | `pnpm exec tsc --noEmit --incremental false` 及适配、注册表、Next配置ESLint通过 |
| 主站固定快照 | WSL `pnpm template:check --id portfolica` 通过。Windows未安装新增包，不以Windows的模块缺失作为快照验收通过证据 |
| 主站26条双语HTTP路由 | 全部实际返回200且包含main；不等同于完整浏览器交互矩阵 |
| 主站首页四宽度 | 1440/834/390/320，无损坏图片、无横向溢出，市场入口为`/templates` |
| 模板详情与设备预览 | 13页登记、三端各4图、H5截图切换、`target=_blank`通过；iframe实际390×844与834×1180；H5框内菜单及联系页跳转通过 |
| 主站表单、FAQ与日志 | 手机菜单实际跳转到联系页，本地校验明确反馈未发送未保存，FAQ展开通过；恢复的新标签页error/warn日志为空 |
| 主站全路由浏览器矩阵 | 未完成：批量检查中浏览器标签页崩溃，已恢复新标签验证上述项目；不将未完成部分记为104组合通过 |
| 主站正式构建 | 当前工作区检查在`offersuite: 源码 ZIP 尚未发布`停止；隔离基线在`portfolica: 源码 ZIP 尚未发布`停止。未绕过发布门禁，未生成可部署主站产物 |

独立命令实际起止时间与退出码在 `.tpl/reports/verification.json`；浏览器104组合与循环记录在同目录。主站证据保存于 `artifacts/portfolica/host-http.json`、`host-viewports.json`、`host-home.jpg`。

## 预览与未完成项

隔离主站本地预览：<http://localhost:43347/templates/portfolica/site>；模板详情：<http://localhost:43347/templates/portfolica>。这是“已提交主站基线 + Portfolica”的验收预览，不包含其他并行任务的未完成修改。

1. 完整原站三端动效逐项、逐时刻对照尚未完成；惯性滚动需按 `AGENTS.md` 获得新增 Lenis 依赖批准后继续。
2. 原始图片中文化与商业素材许可尚未完成。
3. 未发布COS源码ZIP，未写入虚构下载地址；主站正式构建受既有发布门禁阻止。用户要求发布时再按 `docs/template-zip-release.md` 执行本地打包、授权上传与匿名摘要验证。
4. 未推送主站仓库、未部署、未公开上架。独立源码推送不等于这些操作的授权。


## 2026-10-25 发布补记

此前阻塞状态为历史记录。本轮源码 ZIP 已发布并通过匿名完整下载、SHA256 和 ZIP CRC 校验。源码提交 36be1597cec7e3f00ccb56840411bd60eead8ef6，ZIP SHA256 1bec2d270fe2b54be3868012e68513ec58a6b2a6970c266b84a01ee95729cd4d，13101604 字节。

[完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/portfolica/1.0.0-36be1597cec7e3f00ccb56840411bd60eead8ef6/1bec2d270fe2b54be3868012e68513ec58a6b2a6970c266b84a01ee95729cd4d.zip)。主站发布结果见 [本次记录](releases/release-20261025-full.md)。原有视觉、动效和许可限制继续保留。
