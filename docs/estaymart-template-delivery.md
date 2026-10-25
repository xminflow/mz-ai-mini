# EstayMart 模板实现与交付记录

## 当前结论

已实现并交付中英文住宅整站、原站主要动效机制、独立 Git 工程及固定共享包，完整源码 ZIP 已上传 COS 并完成匿名下载校验。**尚不能标记“完整复刻验收通过”**：完整三端逐时刻运动轨迹对照、拖拽释放与减少动态效果的实操仍未完成；主站全量构建另受其他未完成模板阻断（最终全局检查为 benjamen 尚未发布 ZIP）。

参考：<https://jiro.build/templates/real-estate-construction/luxury-residential-properties-website-estaymart>。实施依据为 `docs/template-replication-guide.md`。原站为单页，用户已明确要求补齐页脚占位入口对应的双语内页。

## 源码、页面与动效

- 独立主维护工程：`D:/code/code-tpl/estaymart-template`。
- Git：<https://github.com/weelume/estaymart-template>，分支 `codex/estaymart`，提交 `193a8e7b80476a2b5428143539dbba981e541bda`。已正常推送、通过 `ls-remote` 核对远端一致，独立工作区干净。
- 22 个页面、44 条语言路由：首页、关于、住宅列表及 4 个详情、服务、图库、联系、博客及 3 篇文章、FAQ、招聘、可持续生活、置业指南、投资说明、市场观察与政策。
- 默认中文，英文 `/en`；Next Link 站内切页，切换语言保留当前页面、查询参数和锚点。
- 品牌、双语内容、主题、公共组件、页面组合与路由分层维护。主站 `catalog/estaymart` 只保留 `meta.ts` 和 `weelume.tsx`，通过 Context 注入微域生光、现有 Logo、模板市场入口与示例备案。
- 本地 MiSans 400/700 与 Poppins 400/600/700；19 张图片、2 个 SVG 与 3 段视频本地托管。素材逐项来源与许可记录在独立工程 `.tpl/docs/ASSETS.json`。
- 实现首屏鸟群视频、山景/房屋分层弹簧入场、145px 圆形揭示与局部放大、逐字错峰、逐字按钮翻动、关于区从中心展开、25 块碎片切图与 6 秒轮播、服务区交替方向入场/悬停放大/图片探索器、住宅标签与错峰面板、三联镜像 360° 惯性拖拽、曲面裁切、房间切换、联系区与视频页脚。具体参数及未验收项见独立工程 `.tpl/docs/MOTION.md`。
- 表单只在浏览器内校验，不发送、不保存、不创建预约；日志不记录输入正文。房源、价格、评分、地址、招聘及新增文章均为演示。

## 运行包与源码 ZIP

- 运行包：`website/vendor/estaymart-template-1.0.0-ff18d8b6b4b0.tgz`。
- 运行包 SHA256：`ff18d8b6b4b05103dcfe1114f0d2dea93228f2ca5a492a2cdd573454a7d2c79a`。
- 包溯源 `sourceDirty=false`，源码提交与上述 Git 提交一致；模板锁、依赖声明及 pnpm 自动生成的锁文件配套交付。本地 `estaymart.local` 指向独立源码，生产使用固定包。
- [完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/estaymart/1.0.0-193a8e7b80476a2b5428143539dbba981e541bda/2abf36f644086064fe99ba652910e5cd703978b053796008327d76056ab486a6.zip)。
- ZIP SHA256：`2abf36f644086064fe99ba652910e5cd703978b053796008327d76056ab486a6`，23,758,642 字节。使用既有 COS SDK 上传，匿名完整下载校验 SHA256 与 ZIP CRC 后更新发布清单，旧对象保留。
- 用户已分别明确授权公开 GitHub 创建/推送，以及 COS 上传与公开下载；未推送主站仓库、未部署服务器、未市场上架。

## 构建位置与验收

依赖安装、源码编译、共享包与源码 ZIP 打包均在本机 WSL Ubuntu 的 Linux 文件系统完成，没有在远端服务器构建。

- 独立工作目录：`/home/xmin/workspace/estaymart-20261025/template`。
- 干净克隆验收：`/home/xmin/workspace/estaymart-20261025/verified`。
- 干净提交打包：`/home/xmin/workspace/estaymart-20261025/package-source`。
- 主站验收副本：`/home/xmin/workspace/estaymart-20261025/website`。
- 隔离宿主验收入口：`/home/xmin/workspace/estaymart-20261025/host-preview`，复用实际主站适配文件、类型、全局 CSS 类型声明、Logo 与固定包；输入文件摘要记录在 `artifacts/estaymart/host-preview-inputs.json`。这是目标模板的接入测试，不能替代完整主站构建或模板市场预览外框验收。

| 验证项目 | 实际结果 |
| --- | --- |
| 干净克隆 `pnpm install --frozen-lockfile --offline` | 通过，复用现有依赖版本 |
| `pnpm typecheck`、`pnpm lint` | 通过 |
| `pnpm test` | 4 项通过：媒体、路由与双语、表单无发送/持久化、字体 |
| 独立 `pnpm build`、生产服务健康 | 通过，报告专用健康检查服务已停止 |
| 独立 HTTP | 44 条双语路由、24 项媒体全部 200，未知路由 404 |
| 图片解码 | 19 张位图完整解码通过；曾下载中断的卧室图片已重下原文件 |
| 三端真实截图 | 首页、住宅、博客、联系共 12 张；1440×1000、834×1180、390×844 原始像素检查后转 WebP，未缩放 |
| 三端四类页面 | 无损坏图片、无横向溢出，字体使用本地模板字体 |
| 320px 首页、住宅、联系 | 无损坏图片、无横向溢出 |
| 实际交互 | 手机菜单展开、导航后关闭；联系页中英切换保留 `?check=1#em-main`；表单明确未发送/保存；FAQ 展开；图库 150%→175% 与 Escape 关闭 |
| 宿主浏览器补充 | 微域生光品牌、示例备案、市场 href、无溢出/坏图、控制台无 error；360° 实际切换到主卧套房。原生拖拽输入返回，但后续状态采集超时，不记拖拽验收通过 |
| 实际视频状态 | 首屏视频时间推进，离屏服务/页脚视频暂停 |
| 协议 `check --require-verified` | 通过，ready，报告与源码摘要匹配 |
| `template:check --id estaymart` | 版本、SHA256、源码提交与干净状态一致 |
| Estaymart 发布记录检查 | 通过，ZIP 与运行快照、源码提交一致 |
| 主站改动文件 ESLint | 通过 |
| 隔离宿主生产编译与严格类型检查 | 通过，44 条语言路由均 200，品牌、市场 href 与示例备案均存在 |
| 主站全量类型检查 | 首次副本检查因 `pawlio-template` 缺包失败；其他任务随后已在主站补齐该包，最新全量类型检查未重跑。本模板隔离严格类型已通过 |
| 主站全量 `pnpm build` / 全局发布检查 | 构建当时被 `zenpanda: 源码 ZIP 尚未发布` 阻断；其他任务随后完成该模板，最终全局检查仍因 `benjamen: 源码 ZIP 尚未发布` 失败。均未绕过门禁 |
| 主站市场详情、设备外框与新标签页整套预览 | 尚未完成实际验收，不能用隔离宿主结果替代 |

独立报告源码摘要：`7745e1eb261a930add5d296355e25959d1abc2d1b191356ba5a95eb68d70aa02`。报告证明明确列出的命令与服务检查，不证明全部动效逐帧一致。WSL 曾在测试计时期间校时，已重新运行该项测试并用单调时钟记录实际起止顺序，严格协议检查通过。

全部证据位于 `artifacts/estaymart/`：源工程和宿主构建日志、HTTP 结果、原始 JPG、截图尺寸 JSON、三端/窄屏状态、表单和语言切换、FAQ/图库结果。截图接口默认会裁去部分边缘，最终采用显式视口截图，交付 `.tpl/assets` 仅使用尺寸验证通过的版本。

## 剩余限制与后续

1. 原站与本地全部模块的 PC/iPad/H5 初始、运动、终态逐项对照仍未完成；指针遮罩轨迹、碎片悬停、完整拖拽释放回弹、系统减少动态效果仍需实际对照。因此不能宣称完整动效复刻验收通过。
2. 完整主站构建依赖其他模板完成各自依赖与源码 ZIP 交付。已保留其修改，没有代为发布或移除；只清理了共享注册表中同一 `consutechTemplate` 的重复登记。
3. 原始设计、图片、视频的商业再分发权利未完整核实，保持 `listed=false`、`redistributionAllowed=false`。公开 Git 和 ZIP 不等于商业素材授权。
4. 全站服务尚未部署。后续先解决其他模板门禁，再执行主站全量类型、发布检查与 WSL build，验证模板市场详情与设备外框。不得在服务器构建。
5. 本模板首次接入没有旧版本可原位回滚；如需撤销，只移除 Estaymart 注册、依赖与锁项、运行包和发布清单引用，保留其他模板及历史 COS 对象。后续更新按独立源码验证/提交/推送、bundle、`template:update`、pnpm 更新锁、ZIP 发布、主站检查顺序进行。

本地宿主隔离预览：<http://192.168.34.186:43594/templates/estaymart/site>。仅运行在本机 WSL，用于查看目标模板，尚不表示完整主站可发布。

## 2026-10-25 完整版本发布补记

此前 ZIP 未发布或源码未推送的描述为历史状态。本次来源提交为 72ab44326559ca80eb3d94b51156c6977d5f984b，与固定快照一致；已完成 Git 推送核对、COS 上传及匿名完整下载 SHA256 / ZIP CRC 校验。ZIP 23758883 字节，SHA256 f76ddba35d42a3c2f4b85fa4b12caddc02bb9eb7287d598fb120ba2f660009d4。

[完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/estaymart/1.0.0-72ab44326559ca80eb3d94b51156c6977d5f984b/f76ddba35d42a3c2f4b85fa4b12caddc02bb9eb7287d598fb120ba2f660009d4.zip)。本次另纳入关于页紧凑标题与间距调整，独立类型、Lint、合同测试、生产构建和 45 项 HTTP 检查通过，源码摘要报告已刷新。主站发布结果见 [完整追加版本记录](releases/release-20261025-full2.md)。原有视觉动效、系统减少动态效果和素材权利限制继续保留，未自动上架。
