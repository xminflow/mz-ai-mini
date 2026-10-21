# Mondragon 模板交付记录

日期：2026-10-20。参考站：<https://mondragon.framer.website/>。

## 工程与接入

- 通用源码独立维护于 `D:/code/code-tpl/mondragon-template/`，协议为 git-template 0.2.0，模板版本 1.0.0。具备品牌配置、双语内容、主题、组件、页面与路由分层，以及完整 `.tpl` 规则、修改映射、素材来源和源码摘要验收。
- 按用户明确授权创建了公开空仓库 <https://github.com/weelume/mondragon-template>，真实地址已填写双方元数据及独立 origin。没有 Git 提交、推送、部署或公开上架。独立文件仅登记到 Git 索引用于协议检查。
- 主站 `catalog/mondragon/` 仅保留 meta/weelume 宿主适配及接入说明，注入微域生光 / Weelume、既有浅/深色 Logo、模板市场入口及 `TemplateFiling` 示例备案。独立工程不保存宿主品牌和接入记录。
- `mondragon.local` 仅用于开发源码引用，生产使用 `vendor/mondragon-template-1.0.0-730ff3567575.tgz`，SHA256 为 `730ff3567575dba6272ed62281487c740dacccc2bf130e8b6e5154200b7d71d5`。同步交付 `templates/mondragon.lock.json`、`package.json` 和包管理器生成的 `pnpm-lock.yaml`。
- 主站 `public/templates/mondragon/` 由共享包同步器生成并忽略重复入库；展示图从独立 `.tpl/assets/` 映射至 screenshots。未复制页面源码到主站。

## 页面与功能

22 页，中文默认、英文 `/en`，共 44 条业务路由：

- 首页、机构介绍、项目列表、博客列表、联系页。
- 10 个案例：Lementa、Adamant Inc.、White Gate Hotel、Fashionista、Levi Z55、Heaven、Holo Agency、Mellisa Clothings、Alta Group、Wizard from TRAPPIST-1。
- 4 篇文章：2026 视觉设计新趋势、网页设计的未来、营销的新维度、超越屏幕与界面。
- 演示隐私说明、使用条款、404 展示页。

保留浅灰底、扭转图片带、大字标、预约卡片、机构圆形轨迹与博客图片带，覆盖六项服务、六步流程、项目分类与加载更多、案例灯箱、月度/项目报价、评价切换、前后比较滑块、视频弹窗、FAQ、手机菜单与本地表单。MiSans 400/700、Poppins 400/600/700 本地托管。图带、入场与交互使用现有 framer-motion，尊重减少动态偏好。

源站项目标题标注 12，但 sitemap 实际仅 10 个案例，模板从实际集合计算数量。失效 `/lementa` 修正为案例路由。中文正文按同一主题编写，政策按演示真实行为编写；表单与订阅只在本页校验，不发送、不保存。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| 独立 TypeScript / ESLint | `pnpm typecheck`、`pnpm lint` 通过 |
| 独立生产构建 | `pnpm build` 通过，44 条双语业务路由 |
| 独立测试 | `pnpm test` 三项通过：路由完整性、117 份素材 SHA256、12 张截图编码尺寸 |
| 位图解码 | 113 张位图可正常解码 |
| 独立浏览器 | 22 页 × 2 语言 × 1440 / 834 / 390 / 320 四视口，共 176 组通过，控制台错误与警告 0 |
| 独立交互 | 加载更多、分类、语言保留查询/锚点、报价、灯箱切换与 Escape、FAQ、评价、比较滑块键盘、视频弹窗、手机菜单、表单与订阅本地校验通过 |
| 首屏修正 | 浮点样式取三位小数消除 hydration 差异；修正中英字标尺寸与纵向拉伸留白，受影响三端首页重拍，标题与字标实际矩形不重叠 |
| 协议严格验收 | `node .tpl/tools/check.mjs . --require-verified` 通过，411 个文件，摘要 `90eed5f2fc73b6d63146d568a116761b62a41766b369f0b59be16d31558b7c42` |
| 主站类型与 lint | `pnpm exec tsc --noEmit`、Mondragon 适配和 next.config.ts ESLint 通过 |
| 素材同步回归 | `node --test website/scripts/tests/deformo-package.test.mjs` 两项通过 |
| 固定包一致性 | `template:check --id mondragon` 通过；368 个业务源码、运行素材与截图逐文件匹配独立工程 |
| 主站浏览器 | 176 组检查；一次 320px 英文案例记录被开发热更新分块错误干扰，新标签复查无溢出、无控制台错误，原异常保留在报告中 |
| 预览模拟器 | 实际点击 iPad 新标签入口成功；iframe 为 834×1180，切 H5 为 390×844，框内语言切换与手机菜单通过 |
| 三端截图 | 每端首页、项目、博客、联系各四张；1440×1000、834×1180、390×844。独立文件、主站生成文件和 HTTP 内容 SHA256 一致 |

独立报告在 `.tpl/reports/verification.json` 与 `browser.json`。本工程运行证据在忽略的 `artifacts/mondragon/`，包含 checks.json、独立/主站浏览器报告、交互记录、预览报告、截图一致性报告、构建日志与实际截图。

## 限制与差异

- 主站生产构建通过编译、类型检查、页面生成，在 Windows standalone 符号链接复制阶段因 `EPERM` 失败；最终日志 `artifacts/mondragon/host-build-final.log`。没有改变部署配置规避，不能宣称整站生产打包通过。
- 主站并发修改期间出现过热更新分块 SyntaxError / ChunkLoadError，随后配置热重启又遇到 tsconfig 文件读取错误；新标签复查没有重现业务页面问题。保留原始日志，不把开发热更新错误描述为零错误。
- 图带与环形动效使用 CSS 和现有 motion 重新实现，未保留 Framer 私有 WebGL 组件。视频弹窗使用参考站公开短片，未验证原 Vimeo 影片一致性。需求清单改为本地可编辑 TXT；原站 DOCX、案例二维码与真实外站跳转没有接入。
- 原图片中的英文、人物、客户商标保留，第三方素材、英文正文与品牌的商业及再分发授权未确认。`listed=false`，仅本地评审，不能据工具或字体许可推断整包可公开分发。
- 无真实后端、数据库、支付、账户或表单发送路径；仅本地格式校验。
- 仓库为空，源码未提交或推送；运行包来自当前工作树，`sourceCommit=null`、`sourceDirty=true`。独立目录为新初始化工程，未进行独立克隆验收。

## 维护

通用修改回到独立工程；本机 local 直接引用，交付生产版本需重新验证、bundle、template:update、pnpm 更新锁、template:check 和主站 build。详情路径 `/templates/mondragon`，整站 `/templates/mondragon/site`，英文其后加 `/en`。本次主站使用隔离端口 3007 验收，独立站使用 43287，停止服务后按各自 README 启动。
