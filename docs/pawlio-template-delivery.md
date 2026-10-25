# Pawlio 单页模板实现与验收

参考：https://jiro.build/templates/local-services/pet-grooming-landing-page-pawlio 。按 `docs/template-replication-guide.md` 执行；用户明确限定为原站单页及其动效，不扩展博客、团队或招聘内页。

## 当前状态

已实现九区块双语单页、独立工程、主站共享包适配与12张真实三端截图。应用检查和本地编译通过。**未达到完整交付验收**：公开 Git 仓库创建被自动审批拒绝；源码 ZIP 尚未发布；全量动效逐帧对照尚未完成，存在下述差异。不将本地编译描述为正式发布门禁通过。

- 独立工程：`D:/code/code-tpl/pawlio-template`，分支 `codex/pawlio`。
- 本地已提交源码：`e08e07430644850f783a434aedd2ed4c6879ae23`，工作区干净；未创建公开远端、未推送。
- `.tpl/template.json` 的 `gitUrl` 保持 `null`，不虚构仓库地址；协议检查实际报 `$.gitUrl: 类型不正确`，`stage=scaffold`。审批解除后需补齐真实地址、重新检查并转为 ready。
- 主站 `catalog/pawlio` 仅含 `meta.ts` 与 `weelume.tsx`，通用代码从独立包加载；注入微域生光、现有 Logo、市场入口和共享示例备案。
- 主站本地配置 `website/pawlio.local` 引用独立源码；生产使用固定运行包，不依赖本机路径。
- 本地预览：[主站中文单页](http://localhost:43681/templates/pawlio/site)、[独立单页](http://localhost:43680/)。服务仅在本机 WSL 运行；终端会话停止后需重新启动。

## 内容与交互

首屏、关于、六项专业服务固定滚动、三类护理卡片、四组前后对比、四条评价、三档套餐、六条 FAQ、订阅与联系页脚。默认中文，英文位于端路径后的 `/en`。保留单页锚点导航；语言切换保留查询参数和锚点。

图片、Logo、MiSans 400/700 与 Poppins 400/600/700 全部本地托管，来源与许可记录在独立工程 `.tpl/docs/ASSETS.json` 和字体目录。未新增第三方运行库，沿用现有 Next.js / React / Framer Motion 工具链。预约与订阅仅本地校验，明确显示“未发送、未保存”，日志只记录步骤结果，不记录字段值。

已实现小狗追逐骨头光标、奔跑/坐姿/眨眼/摇尾/口水、梳剪浮动、逐词/逐字标题入场、木牌悬停字符弹跳、关于卡片分向错峰与旋转、24秒齿轮、滚动透明度、1200ms计数及重播、桌面纵向/移动横向服务滚动、弹簧卡片、对比切换、桌面评价叠卡和移动评价主卡/缩略选择、价格错峰与高亮、FAQ展开、菜单抽屉及页脚分层入场。

减少动态效果设置下停止追逐及循环，服务转为静态网格。完整清单和参数在独立工程 `.tpl/docs/MOTION.md`。

## 固定运行包

- `website/vendor/pawlio-template-1.0.0-8e368cf3f726.tgz`。
- SHA256：`8e368cf3f7263861815fdd5e414be32b07b2f7ca6e186873f58676fabe000552`。
- `sourceCommit=e08e07430644850f783a434aedd2ed4c6879ae23`，`sourceDirty=false`。
- `website/templates/pawlio.lock.json`、`package.json` 与 pnpm 自动生成的 `pnpm-lock.yaml` 配套交付。更新锁前核对输入哈希，保留并发新增的其他模板依赖。
- 源码 ZIP 未上传，`templates/releases.json` 未添加虚构记录；市场提示词复制保持未发布状态。

## 实际验证

所有安装、编译、打包均在本机 WSL Ubuntu 的 Linux 文件系统完成；未在服务器构建，未部署主站。

| 检查 | 结果 |
| --- | --- |
| 独立干净本地 Git 克隆 | `/home/xmin/workspace/pawlio-20261025/package-source` |
| 冻结离线安装 | 通过，Node 24.16.0 / pnpm 9.15.4 |
| `pnpm typecheck`、`pnpm lint` | 通过 |
| `pnpm test` | 8项通过：双语内容、图片真实签名、字体分片/字重、表单无外发/持久化及桌面/移动时间轴边界、空集合、scrub无超调 |
| 独立 `pnpm build` | 通过 |
| 独立 HTTP | 235项通过，包含双语首页、未知路径404及全部运行素材 |
| 主站 `pnpm template:check --id pawlio` | 最终提交、版本及 SHA256 一致 |
| 主站类型与适配文件 ESLint | 通过 |
| 主站本地编译 | `WEBSITE_BUILD_DIR=.next-pawlio-ready pnpm exec next build` 通过；这是代码编译验收，不替代发布门禁 |
| 主站标准 `pnpm build` | 被门禁阻止：`pawlio: 源码 ZIP 尚未发布` |
| 主站 HTTP | 250项通过，包含双语单页、详情、手机/iPad预览、未知页404及全部素材/截图 |
| PC / iPad / H5 / 320px | 实际视口1440×1000、834×1180、390×844、320×844，未发现横向溢出、损坏图片 |
| 浏览器交互 | 手机菜单、预约本地校验、FAQ、前后对比、评价、隐私弹窗/Escape及语言 query/hash 保留通过；控制台无错误 |
| 桌面追逐 | 点击移动光标后小狗从x260推进至x265.994，最终x854.036，接近目标后骨头opacity0，坐姿停止；不是完整逐帧轨迹验收 |
| 主站适配 | 中英文品牌、字体、`/templates`市场入口、示例备案通过；手机入口Logo22px、触控高度约43px |
| 设备框 | 手机真实iframe390×844、iPad834×1180；手机框内菜单实际可操作 |
| 截图 | 12张真实截图，原始像素精确核对后转WebP，未缩放放大；独立`.tpl/assets`映射主站`screenshots` |
| 独立协议 | 未通过：真实Git地址尚未配置；不冒充 ready 或严格报告通过 |

主站验收目录：`/home/xmin/workspace/pawlio-20261025/website`。最终编译前同步了验收期间新增的现有 ZenPanda 包与注册信息，仅为保留并发修改、验证当前依赖组合；未修改其源码。历史运行包仅保留用于回溯，当前锁以最终 SHA256 为准。

证据位于 `artifacts/pawlio/`：HTTP结果、12张截图、截图尺寸、三端卡片状态、光标终态、主站运行与设备框记录、编译/检查日志。独立工程自身结果在 `.tpl/reports/application-checks.json`，摘要 `10554a5a181e1394bd452cf57864134ce6ab4706a941a8002e33d41670bd9d16`；该摘要只绑定源码字节，不证明完整视觉一致或商业许可。

## 未完成项与差异

1. 自动审批拒绝公开仓库创建，理由是尚未确认向 `weelume/pawlio-template` 公开完整源码的授权。需明确授权后创建/核对仓库、填写真实URL、提交推送并验证远端 SHA。
2. 源码 ZIP 尚未发布。Git地址确认后重新 bundle、`template:update`、pnpm 更新锁，再按既有 `template:release` 流程在 WSL 打包、COS上传、匿名下载核对 SHA256/ZIP完整性，之后才能通过正式构建门禁。
3. 服务滚动已从弹簧改为固定时长指数 scrub，文字按同一原站时间轴分段切换，并校正三端素材宽度、间距与文字窗口。卡通狗、贴纸与工具图标的 SVG 细节、FAQ水印仍并非逐像素一致。完整逐帧对照未结束，不得宣称完整动效复刻验收通过。
4. PC/iPad/H5全部模块的亚秒级逐帧对照、所有悬停状态、系统减少动态效果实测尚未完成。当前截图、参数核对和部分初/终态不能替代这些检查。
5. 参考设计及素材商业再分发权利未完整核实，保持 `listed=false`、`redistributionAllowed=false`，不进行市场上架。演示报价、评价和指标不代表真实业务记录。

主站未提交/推送，未部署服务器。回滚本次接入应同时回滚 Pawlio 注册、适配、固定包、模板锁及依赖声明/锁，保留其他模板和用户已有修改；未发布的 ZIP 无需对象回滚。

## 2026-10-25 完整版本发布补记

此前 ZIP 未发布或源码未推送的描述为历史状态。本次来源提交为 73eff1efec0f659c39e1785d0fb20a19d3368159，与固定快照一致；已完成 Git 推送核对、COS 上传及匿名完整下载 SHA256 / ZIP CRC 校验。ZIP 10896696 字节，SHA256 5430a164c69a0387751d3f73d706cc26616f4afee7d4b2edf10bfeb9ee119e96。

[完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/pawlio/1.0.0-73eff1efec0f659c39e1785d0fb20a19d3368159/5430a164c69a0387751d3f73d706cc26616f4afee7d4b2edf10bfeb9ee119e96.zip)。真实源码仓库为 https://github.com/weelume/pawlio-template ，codex/pawlio；补齐元数据后重新完成独立检查、生产构建和 3 项 HTTP 检查，报告源码摘要一致。主站发布结果见 [完整追加版本记录](releases/release-20261025-full2.md)。原有视觉动效、系统减少动态效果和素材权利限制继续保留，未自动上架。
