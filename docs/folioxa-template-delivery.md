# Folioxa 模板实现与接入验收

## 当前交付状态

已实现可运行的双语模板并接入主站，尚不能标记为“完整复刻验收通过”。独立工程的类型、lint、测试、生产构建和源码绑定协议检查通过；主站类型、改动文件 lint、固定快照及实际页面检查通过。本轮已按原站公开组件参数补齐多类动效并实测三端核心交互，完整逐帧对照仍未完成。用户于 2026-10-24（Asia/Shanghai）明确授权后，COS 源码 ZIP 已上传并通过匿名下载 SHA256 与 ZIP 完整性校验，发布清单已切换。Folioxa 自身发布校验通过；全局检查和主站构建现因另一模板 ilse-moreno 尚未发布 ZIP 停止，未部署、未上架。

## 位置与范围

- 参考站：<https://folioxa.framer.website/>。
- 主维护工程：`D:/code/code-tpl/folioxa-template/`，Git：<https://github.com/weelume/folioxa-template>。
- 实际分支 `main`，提交 `242e687dd2b7b18c96579aaaccfb3b8adf88d57f`，`git ls-remote` 返回同一 SHA，工作区干净。
- 主站仅保留 `website/src/features/site-templates/catalog/folioxa/meta.ts`、`weelume.tsx` 与接入说明；页面、主题、内容、交互及素材来自独立共享包。
- 首页、作品列表、4 个案例、联系、隐私政策、服务条款，共 9 页、18 条双语路由。参考站没有博客，三端截图采用首页、作品列表、案例和联系页，各 4 张。
- 默认中文，英文位于端路径后的 `/en`。已验证切换保留查询参数与锚点。主站注入微域生光 / Weelume、既有 Logo、模板市场按钮及 `TemplateFiling` 示例备案；独立模板保留自身品牌。
- 图片、字体和原站合作品牌 SVG 本地托管；字体使用 MiSans 400/700、Poppins 400/600/700。SVG 已展开原站页面内符号引用，避免独立图片加载失败。
- 原站仅四个项目，列表明确展示全部数量；通用 cal.com 预约入口改为联系页。表单仅本地校验，明确说明不发送、不保存、不预约。

## 本地构建与产物

安装、编译、构建、截图转换及包归档均在本机 WSL Ubuntu Linux 文件系统中执行，未在服务器构建。

- 独立构建目录：`/home/xmin/workspace/folioxa-20261023/folioxa-template`。
- 主站检查目录：`/home/xmin/workspace/folioxa-20261023/website`。
- 共享包：`website/vendor/folioxa-template-1.0.0-70add1d628ad.tgz`。
- 包 SHA256：`70add1d628adcf385ed20eb5d2d75183dfaa4e77c00d5b1dc91523e9be7b5649`。
- `website/templates/folioxa.lock.json` 记录上述干净提交，`sourceDirty=false`。
- `website/package.json`、pnpm 生成的 `pnpm-lock.yaml`、共享包和快照锁一并交付。未升级既有第三方库；锁文件同时保留工作区并行加入的其他模板。
- 当前本地完整源码 ZIP：`artifacts/folioxa/source-zip/folioxa-1.0.0-242e687dd2b7b18c96579aaaccfb3b8adf88d57f.zip`，10,311,157 字节，SHA256 `1d701dcfb2a9660338903a7240a89a4d308725d6ddf44880dc5c149a3d4f3167`；仅本地 WSL 打包与完整性检查，未上传。

## 已执行检查

| 检查 | 结果 |
| --- | --- |
| 独立 `pnpm install --offline --frozen-lockfile` | 通过，复用已有工具版本 |
| 独立 `pnpm typecheck`、`pnpm lint`、`pnpm test` | 通过，3 项内容、路由及本地素材合同测试 |
| 独立 `pnpm build` | 通过，生成 18 条语言路由 |
| 独立 `node .tpl/tools/check.mjs . --require-verified` | 通过，报告与源码摘要匹配；不等于所有原站动效通过 |
| 独立浏览器页面 | 1440×1000、834×1180、390×844、320×844，中英文 9 页共 72 组合，无横向溢出或损坏图片 |
| 独立交互 | 菜单、FAQ、语言切换查询和锚点、演示表单本地校验通过 |
| 案例最新作品 | 本轮纠正为原站三列响应式网格，移除上一轮误加的连续循环 |
| 实际截图 | 12 张，按入场动画完成状态采集，最终编码 WebP，尺寸分别为 1440×1000、834×1180、390×844 |
| 主站 `pnpm install --offline --frozen-lockfile` | 通过；新增依赖的锁生成阶段补取了缺失包元数据 |
| 主站 `pnpm exec tsc --noEmit` | 通过 |
| 主站改动文件 `pnpm exec eslint …` | 通过，覆盖 Folioxa 适配、注册表和 Next 配置 |
| 主站 `pnpm template:check --id folioxa` | 通过，固定包与版本、SHA256 一致 |
| 主站实际页面 | 同样 72 个组合通过，无横向溢出或损坏图片 |
| 主站交互与品牌 | 菜单、FAQ、双语切换、查询/锚点、表单、品牌与市场按钮通过 |
| 模板详情与设备预览 | 三端各 4 张截图、设备切换、新标签页、834×1180 和 390×844 iframe 真实 CSS 尺寸、框内菜单及导航通过 |
| 主站浏览器日志 | 新建模板详情页无警告或异常；复用标签中独立实例停止后的旧预取错误按来源端口隔离，不当作主站故障 |
| `pnpm build` | 本轮在本地 WSL 重跑，因 `ilse-moreno: 源码 ZIP 尚未发布` 停止；Folioxa 发布阻塞已解除，未绕过检查 |
| COS 源码 ZIP 上传与匿名下载 | 用户明确授权后通过：指定桶及目录、匿名 GET、SHA256、ZIP CRC 与禁止文件检查通过 |

独立命令原始记录保存在其 `.tpl/reports/verification.json`，浏览器结果保存在 `.tpl/reports/browser-routes.json` 和 `browser-motion.json`。本工程证据在 `artifacts/folioxa/`，包括 `host-routes.json`、截图和本地 ZIP 摘要。

## 尚未完成与后续步骤

1. 原站全部页面三端逐帧对照未完成。已核对公开组件脚本并修正标题整体入场、像素速度 ticker、奖项翻折、价格旋转、评价整体入场、FAQ 和页面切换；仍有 Lenis 滚轮惯性、菜单与按钮细节、FAQ 图标、部分插画和遮罩语义差异，细目见独立工程 `.tpl/docs/MOTION.md`。
2. 原始作品图中的英文尚未全部汉化。素材商业再分发许可未确认，维持 `listed=false`、`redistributionAllowed=false`。
3. 已完成授权后的 Folioxa 源码 ZIP 发布；正式清单由现有发布工具在匿名下载校验通过后写入，未手填下载地址或绕过门禁。
4. 发布清单已同步至本地 WSL，Folioxa 范围的一致性校验通过；全局 `template:release:check` 及主站 `pnpm build` 均因 ilse-moreno 缺少源码 ZIP 停止。本次未替其他任务上传。
5. 本任务未推送主站仓库、未部署服务器、未公开上架。

## 本轮动效补齐与复核

- 源码提交 `242e687dd2b7b18c96579aaaccfb3b8adf88d57f` 已推送，远端一致；独立工作区干净。包 SHA256 `70add1d628adcf385ed20eb5d2d75183dfaa4e77c00d5b1dc91523e9be7b5649`，`sourceDirty=false`。源码报告摘要 `f44e40b51f1a32da2efea5706ba95df698fff2cde2c1a7bbbfb6d0c5244c1da4`。
- 本轮在 WSL 执行独立 typecheck、lint、3 项合同测试、build 全部通过，严格源码摘要协议检查通过。
- 本轮三端动态检查为工具循环、聚焦暂停与恢复、45°奖项翻折和FAQ；桌面另记录价格卡±20°初始状态及结束无变换，手机另操作菜单、作品跳转；双语切换保留锚点。数据在 `artifacts/folioxa/motion-recheck.json`，这不等于全站逐帧对照。
- 页面切换改用独立整页时间线；修复区块动画继承与手机菜单事件顺序对导航的影响。开发日志记录退场开始及完成，不输出查询或表单内容。
- 主站 `pnpm exec tsc --noEmit --incremental false`、改动文件 eslint、`template:check --id folioxa` 通过。首次普通 tsc 使用旧 Next 生成类型的增量缓存失败，关闭增量后通过；未修改类型检查规则。
- pnpm 生成锁已回填；与本轮前文件比较只变化 Folioxa 本地归档项，保留并行模板、未升级第三方依赖。
- 表格中的 72+72 全路由检查及12张展示截图为上一轮结果；本轮没有重复宣称全路由重验。

本轮主站运行复核：1440、834、390、320 CSS 视口均无横向溢出；新包包含5张翻折卡及两组bento；实际Tab焦点记录了翻折运行矩阵与45°终态。手机菜单及FAQ展开、主站品牌注入、作品页跳转与退出日志通过，浏览器错误日志为空。截图 `artifacts/folioxa/host-motion-final.jpg`。未重复执行上一轮完整72条主站路由矩阵。

本轮再次执行主站 `pnpm build`，依旧在发布前检查以 `folioxa: 源码 ZIP 尚未发布` 停止。自动审批此前拒绝将完整源码公开上传COS，本轮未重试上传、未绕过门禁、未部署。

## 2026-10-24 授权上传与公开下载验证

用户明确授权将当前已提交 Folioxa 完整源码 ZIP 上传到既有公开 COS 指定目录，并验证长期公开下载。上传前再次确认独立工程工作区干净，HEAD 和主站快照均为 `242e687dd2b7b18c96579aaaccfb3b8adf88d57f`，COS 配置的桶与区域同授权一致。

- 执行入口：`node scripts/template-release.mjs --ids folioxa`（website 目录，沿用 template:release 脚本）；本地 WSL 在 `/home/xmin/workspace/folioxa-20261023/source-zip-authorized` 完成打包，已有服务端 COS SDK 上传。未新增依赖、未改变桶 ACL。
- [完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/folioxa/1.0.0-242e687dd2b7b18c96579aaaccfb3b8adf88d57f/1d701dcfb2a9660338903a7240a89a4d308725d6ddf44880dc5c149a3d4f3167.zip)，10,311,157 字节。
- ZIP SHA256：`1d701dcfb2a9660338903a7240a89a4d308725d6ddf44880dc5c149a3d4f3167`。
- 固定快照 SHA256：`70add1d628adcf385ed20eb5d2d75183dfaa4e77c00d5b1dc91523e9be7b5649`；源码提交、快照与 ZIP 发布清单一致。
- 发布工具匿名 GET 下载完整字节，SHA256、ZIP CRC、必需源码文件及禁止文件检查全部通过后才原子更新 `website/templates/releases.json`。相对主站 HEAD 的发布清单仅新增 Folioxa，其余条目逐一比较不变。
- Folioxa 专项 `verifyTemplateReleases(undefined, ['folioxa'])` 通过；证据：`artifacts/folioxa/authorized-release-verification.json`。全局发布检查遇到 `ilse-moreno: 源码 ZIP 尚未发布`，该项不属于本次上传授权。
- 本地 WSL `/home/xmin/workspace/folioxa-20261023/website` 执行 `pnpm build`，同样因 ilse-moreno 发布门禁停止，未生成可部署的新主站产物；没有绕过、部署或上架。

前文“本轮再次执行主站构建”段落是上传前的历史记录；当前发布状态以本节及文首为准。完整原站动效逐帧验收和素材许可的既有未完成项不因 ZIP 发布而改变。

## 2026-10-24 主站接入复核

用户要求“接入主站”后，复核当前工作区的 Folioxa 注册、固定包、路由、宿主品牌与源码下载接线。已有接入结构完整，本次没有复制模板业务源码或新增依赖；补充了宿主 README 的入口、固定版本和验收说明。

- 本地 WSL 执行 `pnpm exec tsc --noEmit --incremental false`、Folioxa 适配/注册表/Next 配置 ESLint、`pnpm template:check --id folioxa` 全部通过。
- Folioxa 范围的发布清单与快照一致性检查通过。
- `/templates`、`/templates/folioxa`、`/templates/folioxa/site`、`/templates/folioxa/site/en`、`/templates/folioxa/site/projects` 实际 HTTP 检查均返回 200；模板列表存在详情入口，详情存在预览入口，其实际客户端页面包包含当前已验证的 COS ZIP 地址。
- 下载教程登录后展开，本次核对配置接线，没有登录账号重测展开和复制，也未重复完整三端动效巡检。证据保存在 `artifacts/folioxa/host-integration.json`。
- 本次未改变案例展示的 `listed` 状态、未推送主站仓库、未部署生产；主站正式构建仍受 `ilse-moreno: 源码 ZIP 尚未发布` 阻塞，沿用上节实际构建记录。

## 2026-10-24 本地模板列表可见性排查

用户反馈本地 `/templates` 看不到 Folioxa。本次直接检查浏览器，原有 43338 标签页均显示连接被拒绝；WSL `ss -lptn sport = :43338` 无监听，确认当时预览服务已停止，未发现列表注册遗漏。未修改 listed 或列表筛选规则。

使用独立后台进程会话恢复本任务 WSL 主站预览，日志位于 `/home/xmin/workspace/folioxa-20261023/folioxa-host-dev.log`。实际浏览器打开 `http://localhost:43338/templates`，“全部模板”下第二张为“Folioxa · 微域生光创意作品集”；实际点击进入详情后返回列表通过，服务日志记录列表和详情请求均为 200，端口持续监听。页面已留在列表并聚焦 Folioxa 卡片，截图 `artifacts/folioxa/market-card-restored.jpg`。本次仅恢复本地服务与核对入口，未部署或改动模板业务源码。
