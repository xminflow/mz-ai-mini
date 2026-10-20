# Cerno 模板交付记录

日期：2026-10-20。参考站：<https://cerno.framer.website/>。

## 工程与接入

- 独立主维护工程：`D:/code/code-tpl/cerno-template/`。后续已按用户明确要求创建公开源码仓库 <https://github.com/weelume/cerno-template>，首次提交为 `c33f4ef5b3009df38c5f6d68a6223f67f4c0997f`，分支 `main`。
- `docs/template-replication-guide.md` 已补充新模板源码必须位于 `code-tpl/<id>-template`、独立协议资料、共享包、宿主隔离、本地引用、固定生产包和截图映射要求。
- 主站 `website/src/features/site-templates/catalog/cerno/` 只保留 meta/weelume 适配和接入说明，业务页面不复制。独立工程使用 Cerno，主站注入微域生光 / Weelume、现有浅色 Logo、模板市场入口和 `TemplateFiling` 示例备案。
- 本地 `website/cerno.local` 忽略提交与 Docker，仅开发直接引用源码；生产使用 vendor 固定包，归档与 SHA 以 `website/templates/cerno.lock.json` 为准，配套 package.json / pnpm-lock.yaml。
- 运行素材由同步器生成到 `website/public/templates/cerno/`，十二张截图源自独立 `.tpl/assets/`，映射到 screenshots。没有改造或复制其他模板的通用业务源码。

## 页面与实现

16 个页面，中英文共 32 条路由：

- 首页、作品列表、工作室、期刊列表、联系页。
- 5 个案例：The North Face、Adidas、McLaren、New Balance、Accel。
- 4 篇文章：品牌重塑、Logo 外的识别、设计克制、首页信息设计。
- 隐私政策、使用条款。

覆盖深色山体首屏、橙色点阵、分段导航、三条设计理念、沉浸式案例、成果数据、四步流程、四类服务、三档报价、六条评价、团队横向浏览、期刊分类、九条 FAQ、图片弹窗、语言切换及本地联系表单。使用既有 Next.js / React / TypeScript strict / framer-motion / CSS 主题系统，未新增第三方技术依赖。MiSans 400/700、Poppins 400/600/700 本地托管。

品牌、文案、数据、主题、组件、页面与路由职责分离。自定义细滚动条支持滚动显示、自动隐藏、鼠标拖动和键盘，沿用单一文档滚动；图片使用原生 dialog 焦点管理。动效尊重减少动态设置。320px 英文宿主品牌展示曾溢出，已通过响应式字号修复并复验。

原参考站文章路径中的弯引号规范为 `the-homepage-doesnt-need-to-explain-everything`。英文保留参考内容结构，中文按同主题重新编写；政策依据本地演示实际行为编写，不照搬真实公司的数据处理承诺。表单服务与预算选项替换了参考站的城市占位选项。

## 实际验证

| 检查 | 结果与证据 |
| --- | --- |
| 独立 TypeScript / ESLint | `pnpm typecheck`、`pnpm lint` 通过 |
| 独立测试 | `pnpm test` 3 项通过，检查页面注册、160 份素材 SHA256 和截图契约 |
| 独立生产构建 | `pnpm build` 通过，32 条双语路由；日志 `.work/build.log` |
| 独立浏览器 | 16 页 × 2 语言 × 4 视口 = 128 组合，11 项交互通过，控制台错误 0；`artifacts/cerno/independent-browser-report.json` |
| 主站 TypeScript / ESLint | `pnpm exec tsc --noEmit`、对 Cerno 适配和 next.config.ts 执行 ESLint 通过 |
| 主站素材同步测试 | `node --test scripts/tests/deformo-package.test.mjs` 2 项通过，默认 Deformo 与新增 id 兼容 |
| 主站固定包 | `node scripts/deformo-package.mjs check --id cerno` 通过 |
| 运行包一致性 | 最终固定包 405 个源码、素材和截图文件与独立工程逐文件 SHA256 一致；`artifacts/cerno/verify-snapshot.mjs` |
| 主站浏览器 | 同样 128 组合、12 项交互通过，含市场入口和示例备案，控制台错误 0；`artifacts/cerno/host-browser-report.json` |
| 三端截图 | 1440×1000、834×1180、390×844，各 4 张，首页、作品、期刊和联系区；实际图片宽高、独立/主站文件/HTTP 的 SHA256 一致 |
| 市场预览 | 实际点击新标签页打开，iPad / 手机 iframe 的 CSS 视口为 834×1180 / 390×844，框内菜单和语言切换通过；`artifacts/cerno/marketplace-report.json` |
| 接入回归 | Deformo、UIUXfolio、Latte 页面均可访问，无本轮浏览器错误 |

浏览器检查包含图片解码、字体错误、单一标题、链接、横向溢出、首屏切换、服务键盘导航、月/年报价、评价、FAQ、分类空状态、图片方向键/Escape、手机菜单、语言保留查询与锚点、滚动条键盘操作。表单真实校验且无 POST 请求。

## 限制与未执行项

- 主站 `pnpm build` 最终重试已通过编译、类型检查和页面生成，在 Windows 的 standalone 符号链接复制阶段因 `EPERM` 失败；日志为 `artifacts/cerno/main-build.log`。这是本机符号链接权限限制，本次不修改主站部署配置规避，也不宣称整站生产打包通过。早期曾被另一模板的素材目录缺失阻塞，随后该模板包发生独立更新，最终结果以上述日志为准。
- 初次本地交付时 `gitUrl=null`，协议检查未通过。后续公开仓库创建后已填写真实 gitUrl，stage=ready，451 个文件的格式检查通过，TypeScript、ESLint 与三项测试再次通过。未生成严格 verification.json，不宣称运行过 `--require-verified` 全量流程。
- 参考图片、英文正文、人物、客户商标及荣誉的再分发授权未确认；原始图像内英文文字和商标保留。客户案例、统计、报价、联系方式均为演示，`listed=false`，未公开上架或发布。
- 表单只做当前页校验，不发送、不保存、不订阅、不创建订单。没有真实账户、支付、数据库或外部业务 API 可供验收。
- 当前主站固定包仍来自先前未提交工作树快照，sourceCommit=null、sourceDirty=true；公开源码随后独立提交。此次仓库创建不更新部署运行包；主站宿主元数据单独补充了真实 Git 地址。摘要用于一致性核对，不证明来源或授权。

## 查看与后续维护

详情：<http://localhost:3000/templates/cerno>。整站：<http://localhost:3000/templates/cerno/site>，英文在其后加 `/en`。

后续通用修改在独立工程进行，主站 local 直接引用；要更新部署快照时先验证并 bundle，再 template:update、pnpm 更新锁、template:check 与主站构建。此记录不授权发布、推送或部署。主站适配与联调记录仅在本工程维护，不写入独立模板。
