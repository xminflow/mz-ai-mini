# Artemis 模板复刻与交付验收

交付日期：2026-10-23（Asia/Shanghai）。参考站：<https://artemis1.framer.website/>。依据 `docs/template-replication-guide.md` 和独立模板协议 0.2.0 实施。

## 完成内容

独立主维护工程为 `D:/code/code-tpl/artemis-template/`，默认品牌 Artemis。保留参考站奶油白、海军蓝、橙色按钮、旋转拼贴、作品展示、技能标签、个人介绍、评价、FAQ 与联系区。中文使用本地 MiSans 400/700，默认英文和数字使用本地 Poppins 400/600/700；英文首屏保留原站的斜体衬线装饰，首屏字号按规范调整为 28–44px。

原站 8 页：首页、作品、实验室、FinFlow、LaunchPad、HealthSync、TalentBridge 和 MarketMingle 五个案例。补充 7 页：设计日志、三篇原创演示文章、独立联系页、隐私和条款，共 15 页、30 条中英文路由。补充内容不是参考站译文。案例设计展示沿用原站共用图片；作品图片内的英文属于原始设计作品内容，没有重绘成中文图片。

交互包括手机菜单、语言切换、首页作品展开/收起、FAQ、日志筛选、图集弹窗/前后切换/键盘/退出，以及仅本地校验的联系表单。语言切换保留当前页面、查询参数和锚点；下载按钮不跳转或下载。表单不发送、不保存数据，没有真实账号、支付或消息服务。

主站仅在 `website/src/features/site-templates/catalog/artemis/` 保留注册和宿主适配，注入微域生光 / Weelume、现有 Logo、右下角模板市场入口与共享 `TemplateFiling` 示例备案。通用源码不复制到主站目录。

## 预览与维护

- 本地已构建 standalone 预览：<http://127.0.0.1:43310/templates/artemis/site>。
- 英文：<http://127.0.0.1:43310/templates/artemis/site/en>。
- 模板详情：<http://127.0.0.1:43310/templates/artemis>。
- 独立预览默认端口 43308；本次独立验收服务已停止，主站正式预览保持运行。
- 后续通用修改在独立工程的 `config/brand.ts`、`content.ts`、`tokens.css`、`theme.css`、`components/` 和 `pages/` 进行；主站品牌与市场适配继续留在主站。

本地 `website/artemis.local` 直接引用独立源码并监听素材；生产使用固定包，不读取本机目录。运行图片、字体和展示截图同步到主站 `public/templates/artemis/`，由网站通过 `/templates/artemis/...` 提供。COS 保存包含素材的完整源码 ZIP，网页不直接从 COS ZIP 加载运行素材。

## Git、固定包与 ZIP

| 项目 | 结果 |
| --- | --- |
| 真实源码地址 | <https://github.com/weelume/artemis-template> |
| 分支 | `main` |
| 本地及远端提交 | `baa54cb0733fb6888814bd080c8d11c6559f9ad1` |
| 固定版本 | `1.0.0` |
| 主站共享包 | `website/vendor/artemis-template-1.0.0-def4922ebed2.tgz` |
| 共享包 SHA256 | `def4922ebed202652c52f068604fabbc7fb7504a50eab6a90a72becea98f7735` |
| 来源状态 | `sourceDirty=false`，与上述提交一致 |
| 配套交付 | `website/templates/artemis.lock.json`、`website/package.json`、pnpm 生成的 `website/pnpm-lock.yaml`、`website/templates/releases.json` |
| 独立验收源码摘要 | `6e1f28ac871604411eae286fc24c6f60ec4eb55cd2077953ca2918d35df8e58d` |
| 源码 ZIP 大小 | 20,464,663 字节 |
| ZIP SHA256 | `c87b47ac486813390a366cc286a064e2cc8b79c4ca63c3e80ae0c5ac46fa448e` |

[完整源码 ZIP 长期公开下载](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/artemis/1.0.0-baa54cb0733fb6888814bd080c8d11c6559f9ad1/c87b47ac486813390a366cc286a064e2cc8b79c4ca63c3e80ae0c5ac46fa448e.zip)。用户分别明确授权 Git 创建/推送及 COS ZIP 上传，已完成匿名下载、SHA256 和 ZIP 完整性校验。保留旧对象，不覆盖其他模板发布记录。

## 验证结果

安装、编译、共享包和 ZIP 打包均在本地 WSL Ubuntu 的 Linux 文件系统完成。独立构建目录 `/home/xmin/workspace/artemis-20261023/artemis-template`；主站验收目录 `/home/xmin/workspace/artemis-20261023/website`，生产产物 `.next-artemis-production`，构建 ID `zOMj2pQ4VLjoi1tYIbC91`。未在远端服务器或 Windows 文件系统构建。

| 检查 | 结果与证据 |
| --- | --- |
| 独立冻结依赖及环境 | Node 24.16.0、pnpm 9.15.4，固定现有依赖版本，无新增第三方库；离线安装缺少元数据后通过项目代理安装 |
| 独立应用 | `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 全部通过，3 项合同测试检查素材摘要、通用模块隔离和表单不发送/不持久化 |
| 独立协议 | `node .tpl/tools/check.mjs . --require-verified` 通过，ready，报告摘要匹配；Git 归档在 WSL 恢复后摘要仍一致 |
| 独立浏览器 | 15 页 × 中英文 × 1440/834/390/320，120 组通过；13 项交互通过；未发现控制台错误和横向溢出 |
| 真实截图 | PC 1440×1000、iPad 834×1180、H5 390×844，各首页/作品/日志/联系四张，共 12 张；检查真实编码尺寸后转换 WebP，未缩放 |
| 主站依赖及类型 | `pnpm install --offline --frozen-lockfile`、`pnpm exec tsc --noEmit` 通过 |
| 主站改动文件 ESLint | Artemis 适配、registry、next.config.ts 通过 |
| 主站合同测试 | `node --test scripts/tests/deformo-package.test.mjs scripts/tests/template-release.test.mjs`，3 项通过 |
| 固定包和源码 ZIP | `template:check --id artemis` 与 `template:release:check` 通过；版本、摘要、源码提交及发布记录一致 |
| 主站浏览器 | 120 组页面/语言/视口通过，验证主站品牌、示例备案、市场入口、图片加载和横向溢出 |
| 主站生产构建 | `TEMPLATES_MODULE_ENABLED=true WEBSITE_BUILD_DIR=.next-artemis-production pnpm build` 完成，编译、类型、37 个静态页面生成与构建追踪通过 |
| 生产运行 | 固定包生产服务 30 条语言路由通过；正式 standalone 入口补齐 public/static 后复验 10 条代表路由，HTTP 200、图片正常 |
| 主站交互 | 语言路径/查询/锚点、表单错误、表单通过但未发送、FAQ 共 4 项通过；语言切换首次断言早于导航完成，重新读取 DOM 和 URL 后通过，保留初次记录 |
| 市场和三端预览 | 详情显示每端四张截图，三种预览实际打开新标签页；iframe CSS 视口分别 834×1180、390×844，外层缩放 |

独立证据在 `.tpl/reports/verification.json`、`browser.json`、`screenshots.json` 和 `.tpl/assets/`。主站证据在本工程 `artifacts/artemis/host-routes.json`、`host-interactions.json`、`production-routes.json`、`standalone.json`、`marketplace.json`、`host-build.log` 与对应截图；宿主联调记录没有写入独立模板仓库。

## 限制与风险

1. 原站图片再分发和商业使用许可未确认，来源及 SHA256 已登记。保持 `listed=false`、`redistributionAllowed=false`；公开源码和 ZIP 不构成素材商业授权，正式商用前应取得授权或替换素材。
2. 没有执行从 GitHub 全新克隆后的再次安装验收；已在独立 Linux 目录安装、运行，并对已提交归档检查源码摘要。
3. 系统“减少动态效果”未通过浏览器环境模拟验证；代码已使用系统偏好与对应 CSS 规则。浏览器自动化不能直接操作模拟器 iframe 内控件，本次验证了真实 iframe 尺寸、内容加载及独立等尺寸页面的交互。
4. 构建有既有 Next ESLint 插件提示和其他页面的无效 eslint-disable 警告，未改动无关文件。主站检查针对本次 WSL 验收副本，不将并发任务之后的其他改动描述为已验证。
5. 已提交并推送独立模板；主站改动未提交、未推送、未部署，未公开市场上架。保留其他任务和用户已有修改。

## 后续更新与回退

通用修改先在独立工程验证、提交并推送，再在本地 WSL 执行 `pnpm bundle`。主站执行 `template:update --id artemis <tgz>`，在本地 WSL 由 pnpm 更新锁，执行 `template:release --ids artemis`、`template:check --id artemis`、`template:release:check` 和 build。生产不得读取本地源码路径。

当前仅首次本地接入，没有线上版本切换。若撤回接入，应只撤回 Artemis 注册、适配、包依赖、模板锁和发布记录；不要覆盖用户或其他模板修改，不删除已公开的内容寻址 COS 对象。后续已部署版本回退须同时恢复固定包、两种依赖/模板锁和对应发布记录，再在本地 WSL 构建及健康验证。
