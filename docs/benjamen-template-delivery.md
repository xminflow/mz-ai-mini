# Benjamen 模板实现与接入验收

## 交付状态

2026-10-25：已实现双语响应式作品集和主要动效，已接入主站共享模板体系，独立源码已提交、推送并核对远端。独立类型、lint、合同测试、生产构建、生产路由和严格源码摘要协议检查通过；主站类型、改动文件 lint、固定包检查及实际路由与设备预览通过。

**尚不能标记为“全部原站动效完整复刻验收通过”**：全区块三端逐帧对照、系统减少动态偏好实测和图片内嵌英文的完整汉化尚未完成。主站正式构建因 `benjamen: 源码 ZIP 尚未发布` 被现有门禁阻止，未绕过检查，未部署或上架。

## 工程、页面与来源

- 参考：[Jiro Benjamen](https://jiro.build/templates/portfolio/smm-portfolio-benjamen)，实际预览 `/preview/template/portfolio/smm-portfolio-benjamen`。
- 原站为单页作品集，包含首屏、关于我、核心专长、精选作品、案例研究、增长数据、评价、经历、联系、CTA、页脚共 11 个区块；没有博客。隐私和更新记录原为占位锚点，本次补充独立双语演示页面。
- 独立主维护工程：`D:/code/code-tpl/benjamen-template/`。
- Git：[weelume/benjamen-template](https://github.com/weelume/benjamen-template)，分支 `main`。
- 本地 HEAD 和 `git ls-remote origin refs/heads/main` 均为 `a64fc9062051a585d2f672a76f704e3b97207185`，工作区干净。
- 主站入口：`/templates/benjamen`；中文 `/templates/benjamen/site`，英文 `/templates/benjamen/site/en`，另含两种语言的 `privacy` 和 `changelog`。
- 主站 catalog 仅含 meta、宿主品牌适配和接入说明；页面、内容、主题、组件与运行素材由独立包维护。主站注入微域生光 / Weelume、既有 Logo、模板市场按钮和 `TemplateFiling` 示例备案。
- 本地字体为 MiSans 400/700、Poppins 400/600/700；参考图片、SVG 和两段视频全部本地托管，逐项来源位于独立工程 `.tpl/docs/ASSETS.json`。
- 默认中文；语言切换保留页面、查询及锚点。联系表单仅校验，不发送、不保存，日志不包含输入内容。

## 动效实现与实际修复

动效按公开预览脚本逐区分析，具体原参数和未完成项保存在独立工程 `.tpl/docs/MOTION.md`：

1. 固定侧栏 x=-20 入场，首屏 y=16 入场、0.12 秒错峰；按钮双层文字翻折与按压。
2. 人物和介绍视频、可见区播放与离屏暂停；Logo 680px / 32s 线性循环，支持聚焦暂停与恢复。
3. 标题逐字弹簧入场；关于图组的 rotateX、缩放、宽高扩展和视频遮罩；78+ 计数。
4. 服务默认激活第二项，激活后保持；背景图片 1.04 缩放、缩略图隐去、说明文字从 y=50 揭示。支持鼠标、点击及键盘焦点。
5. 作品 hover 1.05 / rotate 2°，按压 1.08；桌面案例按滚动进度叠卡、平板与手机使用轮播。
6. 指标 1.2s 计数，填充 93/55/18%，聚焦或悬停填充 100%；评价按字符 0.004s 错峰切换；经历与页脚入场。
7. 菜单高度/透明度展开和退出。实际发现关闭后透明遮罩可能残留拦截点击，已改为独立 key，并通过关闭态父容器 inert 和指针规则隔离整个退出阶段；手机“菜单→案例→下一项”回归通过。

按规范调整字体、标题比例、玻璃卡片及主站品牌，不增加装饰箭头。原站没有拖拽和 FAQ，不额外添加。减少动态分支已实现，但尚未通过系统偏好实测。

## 构建位置与固定产物

所有安装、编译、构建验收、截图转换和源码 ZIP 打包均在本机 WSL Ubuntu 的 Linux 文件系统执行，没有服务器构建。

| 项目 | 位置或摘要 |
| --- | --- |
| 独立构建目录 | `/home/xmin/workspace/benjamen-20261025/template` |
| 干净交付副本 | `/home/xmin/workspace/benjamen-20261025/delivery` |
| 主站隔离验收目录 | `/home/xmin/workspace/benjamen-20261025/website` |
| 固定共享包 | `website/vendor/benjamen-template-1.0.0-8ecb99a19935.tgz` |
| 包 SHA256 | `8ecb99a19935cf59aff56821233f7ea08ceeaaf776f64c9c03d7ef8fe409242b` |
| 来源 | `a64fc9062051a585d2f672a76f704e3b97207185`，`sourceDirty=false` |
| 源码报告摘要 | `b5d77b170c622d3e5c372bbff50103ffaf8bfa360aa6a995c32f8d3b590f4fae` |
| 本地完整源码 ZIP | `artifacts/benjamen/source-zip/benjamen-1.0.0-a64fc9062051a585d2f672a76f704e3b97207185.zip` |
| ZIP SHA256 | `0a7c517b2d1296fc4e7db605269fadf7898067aab189035652839112f0ccbfc0` |

包由独立工程原生 bundle 生成，主站执行 `template:update --id benjamen`，`pnpm-lock.yaml` 中已包含相同归档及完整性条目。复用既有第三方依赖，没有新增或升级第三方库。

ZIP 来自已提交的 `git archive`，Python 标准库 `python3 -m zipfile -t` 检查通过。本机没有 unzip，未将其失败当作校验通过。ZIP 仅在本地准备，尚未上传 COS；正式发布应走 `docs/template-zip-release.md` 中的上传、匿名下载 SHA256 与完整性验证流程。

## 已执行验证

| 检查 | 结果 |
| --- | --- |
| 独立 `pnpm install --offline --frozen-lockfile` | 通过，固定 pnpm 9.15.4 |
| 独立 `pnpm typecheck`、`pnpm lint` | 通过 |
| 独立 `pnpm test` | 3 项通过：路由合同、本地素材完整性、禁止外部发送及装饰箭头 |
| 独立 `pnpm build` | 通过，生成六条双语业务路由 |
| 独立生产实例 | 本地 WSL 临时端口 43519，六条路由返回 200；该验证实例已停止 |
| `node .tpl/tools/check.mjs . --require-verified` | Windows 主维护工程和 WSL 干净交付副本均通过，报告与源码摘要一致 |
| 独立浏览器路由 | 1440×1000、834×1180、390×844、320×844，六条双语路由共 24 组合，无持续横向溢出或损坏图片 |
| 独立核心交互 | 视频播放/暂停、卡片激活、叠卡中间态、案例/评价切换、菜单、表单校验、双语查询/锚点、循环焦点暂停恢复通过 |
| 三端展示截图 | 三端各四张：首页、专长、作品、联系，共 12 张真实 WebP |
| 主站 `pnpm exec tsc --noEmit --incremental false` | 通过 |
| 主站 `pnpm exec eslint …` | 通过，覆盖 Benjamen 宿主适配、注册表、Next 配置 |
| 主站 `template:check --id benjamen` / 素材生成 | 通过，270 项运行及展示素材由包生成 |
| 主站浏览器路由 | 同样 24 组合；品牌、市场链接、示例备案及图片通过。320px 英文隐私页一次切换中采到 323px 瞬态宽度，重新进入并稳定后为 310px，与 clientWidth 相同，未复现持续溢出；保留原始记录 |
| 主站详情与设备预览 | 三端各四图、iPad 新标签页、834×1180 和 390×844 iframe CSS 尺寸、框内菜单与案例切换通过 |
| 主站浏览器错误 | 本任务页面 error 日志为空；开发首次编译有 Next 跨 origin 和缓存性能提示，未将其当作模板功能错误 |
| 主站 `pnpm build` | 失败于既有发布门禁：`benjamen: 源码 ZIP 尚未发布`；未绕过 |

浏览器截图工具裁去滚动条：实际像素为 PC 1425×990、iPad 819×1159、H5 375×812，元数据按真实图片尺寸登记；测试 CSS 视口仍按规范标准。

证据在 `artifacts/benjamen/`：`browser-evidence.json`、`host-routes.json`、`production-routes.json`、`final-checks.json`、`final-*.log`、三端截图和本地包/ZIP。独立报告在 `.tpl/reports/verification.json`；报告通过只证明声明的检查通过，不代表全部动效逐帧一致。

## 协作边界与未完成项

- 保留其他模板已有修改。曾发现主站 Consutech 重复注册，随后由其他工作移除；本任务未删除该模板注册。
- 并行工作曾使 Pawlio 的 package 与锁短时不一致。本任务的隔离锁增量工具检测到 Benjamen 已被包管理器写入后停止，没有覆盖其他锁条目；最后读取时 Pawlio 的 manifest 与锁已一致。本次不替其他模板验收其更新。
- 整目录覆盖同步曾被自动审批拒绝；之后先核对本任务独立仓库并提交可恢复基线，再以仓库身份、干净状态和逐文件摘要检查进行安全同步，已完成，没有遗留覆盖阻塞。
- 尚未完成：原站全区块三端逐帧比较、系统减少动态偏好实测、内嵌英文完整汉化、素材商业再分发许可确认、COS 源码 ZIP 发布与主站正式构建。
- 保持 `listed=false`、`redistributionAllowed=false`。源码推送不代表素材授权、主站推送、部署或市场上架；本任务未执行后三项。

最终一致性核对仅将独立协议和示例环境的默认端口对齐到原生启动脚本及 README 的 43510；生产服务验收仍显式使用 PORT=43519。该声明修正已推送并重新通过严格源码摘要检查，运行包字节 SHA256 保持不变，因此无需改变包管理器生成的归档依赖锁。应用检查基线记录保留在独立报告中，最终来源提交和本地完整 ZIP 以本报告上表为准。

验收工具限制：当前浏览器接口支持分时采样和真实交互，但未提供逐帧时间线导出或系统减少动态偏好的模拟接口，因此这两项不能用已采集截图替代验收，也未标记为通过。完成检查后已停止本任务启动的独立与主站开发预览进程；没有停止其他工作已有服务。重新运行时，独立工程默认端口为 43510，也可显式设置 PORT；主站仍使用既有 dev 命令和 Benjamen 本地引用配置。

## 2026-10-25 完整版本发布补记

此前 ZIP 未发布或源码未推送的描述为历史状态。本次来源提交为 a64fc9062051a585d2f672a76f704e3b97207185，与固定快照一致；已完成 Git 推送核对、COS 上传及匿名完整下载 SHA256 / ZIP CRC 校验。ZIP 20910882 字节，SHA256 da2423597955df0ba7da72c9206b596976372eb0f491f5f7d60cb75859f432df。

[完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/benjamen/1.0.0-a64fc9062051a585d2f672a76f704e3b97207185/da2423597955df0ba7da72c9206b596976372eb0f491f5f7d60cb75859f432df.zip)。主站发布结果见 [完整追加版本记录](releases/release-20261025-full2.md)。原有视觉动效、系统减少动态效果和素材权利限制继续保留，未自动上架。
