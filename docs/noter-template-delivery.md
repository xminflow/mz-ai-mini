# Noter 模板实现与接入验收

## 当前状态

已建立独立双语模板并以固定共享包接入主站，可在本地预览；尚不能标记“完整复刻验收通过”。独立工程类型、lint、合同测试、生产构建通过，主站类型、改动文件 lint、固定快照及全部36条接入HTTP检查通过。Git公开仓库创建被自动审批拒绝，未填写虚构地址；正式协议检查因此失败。主站发布检查与构建被 `noter: 源码 ZIP 尚未发布` 阻止，未绕过、未部署或上架。

## 范围与源码

- 参考站：<https://noter.framer.website/>，依据 `docs/template-replication-guide.md`。
- 主维护工程：`D:/code/code-tpl/noter-template/`。本地分支 `codex/noter`，提交 `3e52961296d3ed9ce767852340b6dc9d9703a041`，共享包记录 `sourceDirty=false`；无远端、未推送。
- 首页、关于、联系、条款、3个分类、9篇完整文章，共16页、32条双语路由。原站没有独立功能页，三端截图采用首页、设计分类、文章、联系，每端4张。
- 默认中文，英文在端路径后的 `/en`。独立工程使用自身品牌；主站只保留 `catalog/noter/meta.ts`、`weelume.tsx` 宿主适配，注入微域生光、现有Logo、市场按钮与示例备案。
- 图片、字体与玻璃纹理本地托管。MiSans真实400/700与Poppins400/600/700。联系页采用WebGL2实时长虹玻璃折射，保留原站16槽、曲率1.4、折射0.11、色散1.54；原站该着色器没有时间变量，未擅自添加循环或替换为截图。
- 搜索、菜单、分类、加载更多、文章前后篇、订阅与联系本地校验已实现。演示表单明确不发送、不保存，日志不记录字段值。

## 本地构建与产物

依赖安装、编译、构建、截图转换、共享包和源码ZIP归档均在本机WSL Ubuntu Linux文件系统完成，未使用服务器或远端builder。

- 独立检查目录：`/home/xmin/workspace/noter-20261024/noter-template`。
- 主站检查目录：`/home/xmin/workspace/noter-20261024/website`。
- Node `24.16.0`，项目实际 pnpm `9.15.4`，复用现有依赖版本；新增的运行依赖为本任务自身模板包。
- 固定包：`website/vendor/noter-template-1.0.0-7ca1d4470e74.tgz`。
- 包SHA256：`7ca1d4470e741513606ec12c67ad74d889d705004aaf473763d539df425ea81b`。
- `website/templates/noter.lock.json`、`website/package.json`、pnpm生成的`pnpm-lock.yaml`一并交付。回填前核对输入哈希，保留并行任务已有变更。
- 本地完整已提交源码ZIP：`artifacts/noter/noter-1.0.0-3e52961296d3ed9ce767852340b6dc9d9703a041.zip`，8,555,059字节；SHA256 `e27169a3cff1c433788123631f453188032ce83ba1154840a2e7726b176863e1`。仅本地生成，未上传。

## 已执行验收

| 检查 | 实际结果 |
| --- | --- |
| 独立冻结离线安装 | 通过 |
| 独立`pnpm typecheck`、`pnpm lint` | 通过 |
| 独立`pnpm test` | 3项通过：双语文章/分类/素材、嵌套路由语言切换、16页注册合同 |
| 独立`pnpm build` | 通过，32条语言路由；Next提示未检测到其ESLint插件，独立ESLint检查已通过 |
| 独立32条HTTP路由 | 全部200 |
| 实际浏览器 | PC首页/搜索、三端四类页面与截图；iPad/H5联系玻璃无显示错误，H5无损坏图片；320px菜单跳到关于页后关闭、无横向溢出 |
| 搜索和演示表单 | 搜索初始9项，“取消邮件”筛选1项；联系表单实际反馈校验通过且未发送保存 |
| 语言切换 | 实际切换到`/en/contact?check=1#nt-main`，语言、查询、锚点保持，英文无横向溢出 |
| 截图 | 12张实际页面截图，以显式区域导出并核验1440×1000、834×1180、390×844；没有将默认缩小图放大冒充 |
| 主站`pnpm install --offline --frozen-lockfile` | 通过 |
| 主站`pnpm exec tsc --noEmit --incremental false` | 通过 |
| 主站改动文件ESLint | 通过，覆盖Noter适配、注册表与Next配置 |
| 主站`pnpm template:check --id noter` | 通过，包版本和SHA256一致 |
| 主站HTTP | 目录、详情、两种设备入口与32条语言路由，共36条全部200 |
| 主站实际页面 | 已显示微域生光品牌、`/templates`市场入口及明确无障碍名称、示例备案；无损坏图片或横向溢出 |
| 详情与新标签页 | 桌面四张图加载正常，三端入口均配置`target=_blank`；H5入口实际打开新标签页 |
| 模拟设备实际运行 | H5 iframe真实390×844、框内菜单展开通过；切换iPad后真实834×1180、URL更新、同一页面地址与已打开菜单状态保留；设备页浏览器错误日志为空 |
| 主站`pnpm template:release:check`与`pnpm build` | 均被Noter未发布源码ZIP门禁阻止，未生成可部署主站产物 |
| 本地源码ZIP | 已提交源码归档、CRC、必需文件与禁止文件检查通过；未上传 |
| 独立协议检查 | 明确失败：缺少真实`gitUrl`，stage保持scaffold，未伪造通过报告 |

证据保存在 `artifacts/noter/`；独立工程 `.tpl/reports/checks.json` 记录实际命令、时间与退出码，`browser.json`、`routes.json` 记录当时的浏览器检查和HTTP结果。独立报告早于后续语言浏览器复核，后续结果以本接入记录为准。

## 未完成、差异与风险

1. 全站原站三端动效逐帧对照及完整双语浏览器矩阵未完成，菜单、悬停、按钮、加载布局与移动搜索仍有待逐项确认的时序/几何差异。现有浏览器观测有秒至数十秒延迟，不能可靠采集亚秒动效的初始/运行帧；当前静态、结束状态及公开脚本参数核对不等于逐帧验收。搜索已按公开脚本使用0.95缩放及spring(600,40)，不能据此推断全部动效通过。细目见独立 `.tpl/docs/MOTION.md`。
2. 参考文章、图片和字体的商业再分发许可未完整核实，保持`listed=false`、`redistributionAllowed=false`，不代表可商业上架。
3. 自动审批拒绝使用本机GitHub凭据创建公开仓库，要求本次明确授权。未重试、未绕过，真实Git地址与远端一致性验证均未完成。
4. COS源码ZIP未发布，因此正式主站构建未通过。后续须补真实Git地址、提交并推送，刷新共享快照，再通过既有`pnpm template:release --ids noter`上传并匿名下载核验后更新发布清单，最后重跑主站构建。不得手填下载地址或跳过门禁。
5. 开发服务存在Next跨来源访问提示；最初localhost连接失败的浏览器旧日志按来源隔离，未当作当前WSL地址页面故障。未修改全站开发安全配置。
6. 未推送主站仓库、未部署服务器、未公开市场上架；其他任务与用户已有变更保留。


## 2026-10-25 发布补记

此前阻塞状态为历史记录。本轮源码 ZIP 已发布并通过匿名完整下载、SHA256 和 ZIP CRC 校验。源码提交 5cbccf1bd2bf9acbf7bc875ef309f8eb7e74125a，ZIP SHA256 5ef939d01e8bd51278d161f357ca555e643e3d0e18a83efbdccc13e67c1e3878，8565626 字节。

[完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/noter/1.0.0-5cbccf1bd2bf9acbf7bc875ef309f8eb7e74125a/5ef939d01e8bd51278d161f357ca555e643e3d0e18a83efbdccc13e67c1e3878.zip)。主站发布结果见 [本次记录](releases/release-20261025-full.md)。真实源码仓库为 https://github.com/weelume/noter-template ，codex/noter；补齐 Git 元数据后重新完成独立类型、lint、3 项测试、生产构建和格式检查，stage 保持 scaffold。原有视觉、动效和许可限制继续保留。
