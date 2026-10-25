# Kelo 模板实现与接入验收

已实现独立模板、主站共享包接入、Git 推送和源码 ZIP 发布。**不能标记完整动效逐帧复刻验收通过**：系统减少动态设置与原站全部悬停/按压、三端逐帧时序及长时间循环矩阵仍未完整对照。完整主站构建受既有 Benjamen 未发布源码 ZIP 的门禁阻塞，不能将独立构建或开发预览通过描述为主站生产构建通过。

参考：<https://jiro.build/templates/ai-agents-chatbots/ai-customer-support-landing-page-kelo>。依据 `docs/template-replication-guide.md`。原参考为单页；内页和三篇文章为同风格原创扩展，不冒充原站已有内页。

## 源码与接入

- 独立主维护工程：`D:/code/code-tpl/kelo-template`。
- Git：<https://github.com/weelume/kelo-template/tree/codex/kelo>。
- 分支 `codex/kelo`，提交 `1a4cb0e05fe31ed25987c9d5fae77a2b24f4a821`；正常推送后通过 `git ls-remote` 核对远端 SHA 一致，独立工作区干净。
- 14 页、28 条双语路径：首页、功能、解决方案、集成、价格、帮助、关于、更新列表、三篇文章、联系、隐私和条款。
- 品牌、双语内容、主题、公共组件、页面、路由分离。主站 `catalog/kelo` 仅保留 `meta.ts`、`weelume.tsx`，注入微域生光品牌、Logo、模板市场入口和 `TemplateFiling` 示例备案。
- 开发用忽略跟踪的 `website/kelo.local` 引用独立源码；生产只读取 vendor 固定快照。运行素材和截图由现有生成器同步，仅管理 `public/templates/kelo`。

## 动效与交互

原 Hero 03.mp4 本地托管，静音、inline、循环；视区内且页面活动时播放，离开或隐藏暂停。自动播放受阻记录错误名称并显示原生控件；预期可见性中断记录 debug。图片、图标、头像和 MiSans 400/700、Poppins 400/600/700 均本地托管，来源登记于独立工程 `.tpl/docs/ASSETS.json`。

实现导航 y -20→0/0.8s；首屏标题、描述和 CTA 0.6s/.1/.2/.3 错峰；品牌错峰 .1s；功能卡片悬停、训练标签横向入场与旋转、工作流浮块 y/rotate/scale 循环及节点错峰、音量柱循环与洞察柱状图增长。三步流程使用原 .21/.47/.32/.98 曲线与 .2s 错峰，含扫描光带、节点浮动、图标循环、五环扩散和分析点阵/柱形循环。集成横列按原每帧 .5px 换算为 30px/s，支持悬停、聚焦与手动暂停，以及触控、鼠标拖动和键盘操作。FAQ 保留 height/opacity .3s 展开，文章保留上移和图片缩放。详细参数与差异见 `.tpl/docs/MOTION.md`。

手机菜单与导航、FAQ 展开/分类、本地表单、集成筛选和空结果已实际操作。表单明确未发送、未保存，不连接真实支付、订阅、CRM 或账户。三端功能/流程已记录不同时刻的 transform、height、opacity；手机柱状图在滚动进入后由 0 增长。横列暂停时 scrollLeft 保持 0.667，恢复后增长至 38。

## 构建位置与检查

全部安装、编译、bundle 和源码 ZIP 打包发生在本机 WSL Ubuntu Linux 文件系统，未在 Windows 或远端服务器构建。

- 独立验收：`/home/xmin/workspace/kelo-20261025/template`。
- 干净包源码：`/home/xmin/workspace/kelo-20261025/package-source`。
- 主站集成：`/home/xmin/workspace/kelo-20261025/host/website`。
- Node 24.16.0、pnpm 9.15.4，复用已有版本，没有引入新第三方库。

| 检查 | 结果 |
| --- | --- |
| 独立冻结离线安装 | 通过 |
| 独立 typecheck / lint | 最终源码通过 |
| 独立 `pnpm test` | 4 项通过：双语路由、表单不外发/持久化、业务素材本地托管/无装饰箭头、运行素材与字体存在 |
| 独立 `pnpm build` | 通过，生成 28 条双语页面 |
| 独立生产服务 | 专用实例启动、HTTP 200 后停止，报告 stopped=true |
| `check --require-verified` | 通过，报告与源码摘要匹配 |
| 独立 HTTP | 28 条页面 200，未知页面 404，运行素材可访问 |
| 三端四类页面 | 无损坏图片或横向溢出，等待字体和入场完成后采集真实截图 |
| 320px | 联系页无横向溢出 |
| 主站类型 / 适配 lint | `pnpm exec tsc --noEmit` 与 Kelo 适配 ESLint 通过 |
| 主站固定包 | `pnpm template:check --id kelo` 通过 |
| pnpm 依赖锁 | WSL 包管理器生成；当时与主锁相比仅 Kelo 19 行新增，未手改结构 |
| 主站 HTTP | Kelo 28 条双语页面 200，未知页面 404，49 项本地运行素材可访问 |
| 主站浏览器 | 品牌、市场入口、示例备案、图片、字体、原视频正常，检查时无控制台 error |
| 主站语言 | contact?check=host#kl-main 实际切至 site/en/contact?check=host#kl-main |
| 模拟设备框 | H5 iframe 390×844、iPad 834×1180，框内菜单与功能页导航可用 |
| Kelo ZIP 专项 | 固定快照/提交一致，上传、匿名下载、SHA256 与 ZIP 完整性通过 |
| 完整主站构建 | 未通过：正式入口被既有 `benjamen: 源码 ZIP 尚未发布` 阻塞，未绕过门禁或修改其他模板 |

独立报告：`.tpl/reports/verification.json`。源码摘要：`fb4b5cb6a8ccedcb86d9ad2a8fb1255897b597f40bd9dc951aa9940145ce37a7`。日志、HTTP、截图和动效证据位于 `artifacts/kelo/`。应用检查通过不等于完整视觉动效逐帧一致。

## 固定包与源码 ZIP

- 运行包：`website/vendor/kelo-template-1.0.0-8d175e24b69b.tgz`。
- 包 SHA256：`8d175e24b69beb13b36f793c966969bcd3f3dd8aeb09a535d11c43e4caac4366`。
- 配套交付：`website/templates/kelo.lock.json`、`website/package.json`、pnpm 生成的 `website/pnpm-lock.yaml` 和 `website/templates/releases.json`。快照 sourceDirty=false，源码提交同上。
- [完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/kelo/1.0.0-1a4cb0e05fe31ed25987c9d5fae77a2b24f4a821/aae1e26be4a92e929554f0e03e6086f817a03ee35826bae3ad5d8aeb06ce0567.zip)，11895864 字节，SHA256 `aae1e26be4a92e929554f0e03e6086f817a03ee35826bae3ad5d8aeb06ce0567`。

自动审批最初拒绝公开 COS 上传；用户明确批准后才执行。复用现有 COS SDK，匿名完整下载验证全部通过后更新 Kelo 清单，未覆盖或删除旧对象。脚本末尾全站检查因 Benjamen 未发布失败；随后 `verifyTemplateReleases(undefined, ['kelo'])` 单独通过。

12 张展示图在独立工程 `.tpl/assets`，映射主站 `public/templates/kelo/screenshots`。CSS 视口 1440×1000、834×1180、390×844，浏览器实际输出 1425×990、819×1159、375×812；元数据记录实际像素，未放大或伪造。

## 剩余限制与交付边界

系统减少动态设置未真实切换验收；原站全部悬停/按压、三端逐帧时序及长时间循环矩阵未完整对照。字体、中文排版和玻璃卡片按项目规范调整，与原参考存在有意差异。参考设计、图片、视频和第三方标记的商业再分发许可尚未完整核实，保持 `listed=false`、`redistributionAllowed=false`。

本地集成预览：<http://localhost:43546/templates/kelo/site>。未推送主站仓库、未部署服务器、未市场上架。D: 盘耗尽的阻塞解除后重新执行了最终检查，没有沿用故障前结果。

后续在独立工程修改、检查、提交、推送，再 bundle、template:update、pnpm 更新锁、发布对应源码 ZIP 和主站构建。回滚时共同恢复 Kelo 包、快照锁、依赖声明/锁和发布记录；旧 COS 对象保留。

## 3000 端口补充验收

用户反馈 3000 列表没有 Kelo 后，确认该端口运行于 `/home/xmin/workspace/weelume-dev-20261025/website`，此前仅专用集成目录 43546 接入，因此实际开发工作区未同步。已先备份该工作区配置，再仅补入 Kelo 固定包、依赖、发布记录、宿主适配和注册；由 WSL pnpm 生成锁，素材生成器写入 268 项本模板文件，保留其他模板更新。Next 配置重载期间首次类型检查遇到生成类型文件短暂消失，待服务稳定后使用非增量检查重验。

实际 3000 的列表、Kelo 详情、整站预览、封面均 HTTP 200；浏览器确认 Kelo 为“全部模板”首张，显示名“微域生光 · AI 客户支持”，原视频实际播放。证据：`artifacts/kelo/main-3000-*`。当前预览为 <http://localhost:3000/templates/kelo/site>，不再以 43546 单独预览代替用户正在使用的 3000 工作区验收。
`pnpm exec tsc --noEmit --incremental false` 在服务稳定后通过。已等待客户端导航完成，确认列表卡片实际进入 `http://localhost:3000/templates/kelo`。
