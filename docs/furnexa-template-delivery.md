# Furnexa 模板交付记录

日期：2026-10-20。参考站：<https://furnexa.framer.website/>。

## 实现与边界

- 独立主维护工程：`D:/code/code-tpl/furnexa-template/`，已初始化独立 Git，未提交、推送或发布。
- 按 `docs/template-replication-guide.md` 接入共享包，主站 `website/src/features/site-templates/catalog/furnexa/` 只保留 meta 与宿主适配。
- 本地 `furnexa.local` 引用独立源码；生产使用 `vendor/furnexa-template-1.0.0-f70639083640.tgz`，完整 SHA256 见 `website/templates/furnexa.lock.json`。依赖锁由 pnpm 生成。
- 分类为既有 `online-store`（电商商城），一套响应式站点，PC / iPad / H5 共用业务路由。
- 独立品牌 Furnexa；主站通过 Provider 注入微域生光 / Weelume、现有 Logo、模板市场入口与 `TemplateFiling` 示例备案，覆盖导航、首屏品牌、内页眉题、文章作者和页脚。
- 用户明确选择交互演示：购物车在当前浏览会话内存中维护；表单只做本地校验，不发送、不保存，不接入真实支付、会员、物流或订单后台。

## 页面与视觉

37 个页面、74 条中英文路由：

- 首页、商店、关于、期刊列表、联系、FAQ。
- 5 个空间集合：客厅、餐厅、办公、卧室、灯具；无商品的集合保留明确空状态。
- 14 个商品详情：现代休闲椅、双人床、茶几、边柜、衣架、床头柜、摇椅、地毯、置物架、Luxe 沙发、Ivory 曲线椅、极简扶手椅、Terra 餐椅、经典餐椅。
- 8 篇空间与家具文章。
- 配送、退换、隐私与使用条款。

保留全屏家具轮播、超大品牌字、暖灰色调、家具透明素材、空间分类、品牌故事、优惠区、畅销商品、品牌数据、评价、期刊、社交陈设与会员引导。关于页包含自然材料、设计理念、团队与制作过程弹窗。中文文章按对应主题重新编写，政策依据真实演示行为编写，不照搬原站的支付、账户和物流承诺。

原站 `home-décor-inspiration` 路径规范为 `home-decor-inspiration`。原站部分商品链接指向根路径 404，模板统一指向已注册的 `shop/<slug>`。商品图库只取商品自身图片，排除参考页后续的评价头像与推荐商品。

132 份参考素材本地托管并登记来源与 SHA256；MiSans 400/700、Poppins 400/600/700 本地托管。主题、卡片、响应式与减少动态效果由模板 CSS 令牌和既有 framer-motion 管理，未增加第三方技术栈。

## 已执行验证

| 检查 | 结果 |
| --- | --- |
| 独立 `pnpm typecheck` / `pnpm lint` | 通过，最终品牌注入修正后复验通过 |
| 独立 `pnpm test` | 3 项通过：双语数据、素材摘要、路由覆盖 |
| 独立 `pnpm build` | 最终源码通过，74 条中英文业务路由生成成功 |
| 独立浏览器 | 全部页面双语在桌面、iPad、H5 巡检；320px 检查全部英文页面。最终品牌文字修正后以独立构建及主站页面补充复验，不声称执行完整严格验收矩阵 |
| 主要交互 | 轮播、商品筛选/排序/搜索/重置/空状态/加载更多、颜色与图库、购物车增删数量和金额、演示结算、手机菜单、FAQ、文章分类、联系/订阅校验、语言切换及制作过程弹窗通过 |
| 主站 TypeScript / ESLint | `pnpm exec tsc --noEmit` 与 Furnexa 适配、next.config.ts 的 ESLint 通过；最终生产构建也通过类型检查 |
| 共享素材同步测试 | `node --test scripts/tests/deformo-package.test.mjs` 2 项通过 |
| 固定包 | `node scripts/deformo-package.mjs check --id furnexa` 通过 |
| 包与源码一致性 | `node artifacts/furnexa/verify-snapshot.mjs`：406 个包文件与独立工程逐文件 SHA256 一致，12 张展示截图与主站素材一致 |
| 主站浏览器 | 保存 106 条页面/语言/设备检查，0 个坏图、横向溢出或重复主标题；其中 320px 覆盖全部 74 条双语路由，大尺寸为代表页面，未宣称完整四视口矩阵 |
| 三端实拍 | 独立 `.tpl/assets/` 各 4 张：首页、商店、期刊、联系；PC 1440×1000、iPad 834×1180、H5 390×844，实际像素与登记尺寸一致 |
| 详情与预览 | 三端画廊切换、点击新标签页打开预览通过；iframe 实际 CSS 视口为 834×1180 / 390×844，框内菜单、语言、商品导航、购物车通过 |

主站浏览器记录：`artifacts/furnexa/host-browser-report.json`。模拟设备记录：`artifacts/furnexa/marketplace-report.json`。独立验收与源码摘要位于独立工程 `.tpl/reports/acceptance-summary.json`，并未执行严格 `verification.json / --require-verified` 流程。

## 未完成项与限制

- **公开远端未创建**。按项目文档尝试检查并创建空公开仓库时，自动审批在执行前拒绝：认为读取本机 GitHub 凭据并创建公开远端与上级 `AGENTS.md` 的限制冲突，缺少明确授权。因此未读取凭据、未创建远端，也未虚构地址。`.tpl/template.json` 的 `gitUrl=null`，格式检查明确失败，`stage=scaffold`；不宣称模板已满足市场导入协议。需要用户明确批准创建 `weelume/furnexa-template` 空公开仓库，或提供实际仓库地址。
- **主站完整生产打包未通过**。最终固定包执行 `pnpm build` 已通过编译、类型和页面生成，在 Windows standalone 的符号链接复制阶段以 `EPERM` 失败，日志 `artifacts/furnexa/main-build-final.log`。未修改主站部署配置绕过权限，也不宣称整体部署产物生成成功。
- 共享开发服务曾因其他并行模板截图写入时的 `EBUSY` 停止。本次保留错误并使用已同步素材直接启动 Next 完成 Furnexa 验收，未改写共享监听逻辑。已有的其他模板源代码、包及配置修改继续保留。
- 图片、人物、商标与英文参考正文的再分发授权未确认，独立许可记录为受限，`listed=false`；未公开上架或部署。字体许可单独记录。
- 固定包来自未提交工作树，`sourceCommit=null`、`sourceDirty=true`；SHA256 只证明文件一致性。

## 查看与维护

- 当前主站预览：<http://127.0.0.1:3014/templates/furnexa/site>。
- 模板详情：<http://127.0.0.1:3014/templates/furnexa>。
- 独立开发：在 `D:/code/code-tpl/furnexa-template/` 执行 `pnpm dev`，默认 43286，英文 `/en`。
- 主站英文位于 `/templates/furnexa/site/en`；业务修改维护独立工程，宿主适配保留在本工程。
- 后续部署快照更新使用独立 `pnpm bundle`、主站 `template:update --id furnexa`、pnpm 更新锁、`template:check --id furnexa` 与构建；不要手工复制页面源码或编辑生成素材。

本记录不授权提交、推送、部署或公开上架。
