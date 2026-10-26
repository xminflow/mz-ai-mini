# Rescale 模板复刻与接入记录

日期：2026-10-24。参考站：<https://rescale.framer.ai/>。依据 `docs/template-replication-guide.md` 实现。没有部署主站或公开市场上架；不声明完整原站动效精确验收通过。

## 实现范围

独立源码：`D:/code/code-tpl/rescale-template/`。主站 `website/src/features/site-templates/catalog/rescale/` 只保留注册与品牌适配，页面、双语内容、主题、组件与运行素材由独立共享包提供。

覆盖首页、联系页、期刊列表、6 篇文章和 404，共 10 页、20 条双语路径。页面范围来自原站 sitemap 与实际公开链接，未虚构原站没有的政策页面。中文默认；英文端路径后加 `/en`，切换保留对应页面、查询参数与锚点。

实现蓝紫动态视频背景、玻璃卡片、悬浮导航和展开菜单、标题 Y 轴翻转与错峰、看板滚动透视、环形路径绘制与计数、报告文件轮换、伙伴环绕、棋盘翻转、流程滑块、集成节点、指标计数、团队两秒自动轮播与拖拽回弹、悬停暂停、客户视频、双列反向评价循环、月年价格切换、FAQ 高度过渡、按钮文字滚动、桌面跟随光标和页脚关键词轮换。

原站公开模块确认六项指标为 6K+、34K、200K、180K、92%、36K，系统可靠性 99%。团队配置为 2 秒间隔、允许拖拽、spring stiffness=200 / damping=40。详细清单与未完成对照见独立 `.tpl/docs/MOTION.md`；首屏原始参数保存在 `reference-appear.json`。

联系、订阅为演示表单，仅本地校验；明确提示不发送、不保存，不记录姓名、邮箱、电话与正文。未新增后端、数据库或外部业务服务。

## 素材与品牌

90 项原站素材本地托管，来源见独立 `public/templates/rescale/sources.json`。首屏实际使用 `9f3YOJWd8t3cibP1iqPDR1mCMro.mp4`；客户视频使用 `mzEJrfIah6lDBrFElC0qZbQTJ2o.mp4`，保留真实播放。字体为本地 MiSans 400 / 700 与 Poppins 400 / 600 / 700，保留许可文件。

独立工程保留 Rescale 品牌。主站注入微域生光 / Weelume、既有 Logo、深色固定市场入口和 `TemplateFiling` 示例备案；不把宿主信息写入通用模板。主站 `public/templates/rescale/` 为包同步生成目录。

独立 `.tpl/assets/` 包含首页、功能、期刊和联系页三端共 12 张真实截图。CSS 视口为 1440×1000、834×1180、390×844；浏览器工具输出图片的实际像素分别为 1425×990、819×1159、375×812，元数据按真实像素登记。

## 已验证内容

| 项目 | 结果与方式 |
| --- | --- |
| 独立冻结安装 | 本地 WSL Linux 干净 Git 克隆，离线缓存安装通过 |
| 独立类型 / Lint / 测试 / 构建 | `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 通过；3 项合同检查覆盖素材完整性、公开文章与页面路径、宿主隔离 |
| 独立生产 HTTP | 20 条路径、未知路由 404、90 项素材 HEAD 通过 |
| 独立生产浏览器 | 10 页 × 双语 × 1440 / 834 / 390 / 320，共 80 组，无页面横向溢出或关键损坏图片 |
| 实际交互 | 语言切换保留页面 / query / hash、有效演示表单、菜单与 Escape、年付切换、FAQ、加载第 6 篇文章、手机翻页、团队自动轮播、暂停 / 恢复通过 |
| 动效状态 | 环形数值实际达到 73% / 67% / 54%；流程滑块前后 transform 不同；伙伴循环暂停恢复；客户视频实际播放至 6 秒以上；桌面实际拖拽从 Zane 切换到 Ethan，释放后 transform 回到 none |
| 协议 | `.tpl/tools/check.mjs --require-verified` 通过，报告匹配最终应用源码摘要 |
| 主站适配 | Rescale 快照检查、类型及适配文件 ESLint 通过；既有素材同步和发布检查 3 项测试通过 |
| 主站隔离构建 | `template:check --id rescale`、`template:release:check`、`tsc --noEmit`、`pnpm build` 通过 |
| 主站生产 HTTP | 20 条双语路径、未知路由 404、90 项运行素材通过 |
| 主站生产浏览器 | 80 组双语 / 视口组合通过，市场入口均为 `/templates` |
| 详情及设备预览 | PC / H5 / iPad 各 4 张图；新标签页链接 `_blank`；iframe 真实 `innerWidth/innerHeight` 为 390×844、834×1180，框内菜单可展开 |

生产浏览器批量连续导航时曾观察到预取请求被后续导航取消和图片请求中断；改为等待页面加载完成后复查，最终 80 组通过。没有通过吞异常或增加静默兜底处理这些验收过程中的取消请求。

开发服务与生产构建曾共用 `.next`，造成一次预览模块缓存冲突。已停止本任务残留进程，最终验收改在独立 Git 克隆构建并启动生产产物；未以该次开发缓存错误作为生产验收结果。

## 主站构建范围

当前原工作区另有 Offersuite、Portfolica、Shelta 的并行草稿。首次整仓类型检查因这些模板尚缺包而失败；随后部分并行任务已补充依赖。本任务不修改、回滚或删除这些改动。

本次主站验收副本采用“主站已提交注册表及共享包清单 + Rescale 接入”。仅在验收副本移出未交付的并行模板目录，原工作区完整保留。隔离检查通过不代表这些并行草稿已整仓验收通过。最终主站构建、HTTP、浏览器与产物记录见 `artifacts/rescale/`。

交付末次原工作区全量 `template:release:check` 仍因并行的 `noter: 源码 ZIP 尚未发布` 而失败；Rescale 自身的 ZIP 与快照一致性已通过。未绕过原工作区的全量发布检查。

实际构建位置均为本地 WSL Ubuntu Linux 文件系统：

- 独立生产：`/home/xmin/workspace/rescale-20261024/delivery`。
- 主站隔离副本：`/home/xmin/workspace/rescale-20261024/website`。

没有在远端服务器构建、安装依赖或部署。主站锁文件由既有 pnpm 9.15.4 生成，未升级第三方依赖；更新时检查并保留并行任务对依赖声明和锁文件的修改。

最终主站构建 ID：`uw3NsKNxqFFbPRxhgoMnW`；build-manifest SHA256：`5cf1b8699c1c31bfecfe73cf1ebaf1a97fc24fae8e353f6f2c362481103845c4`。完整记录见 `artifacts/rescale/production-build.json`。

本机交付预览：<http://localhost:43413/templates/rescale/site>；详情：<http://localhost:43413/templates/rescale>。地址依赖本次保留的本地生产预览进程。开发与独立验收辅助服务已停止。

## 源码与固定产物

- Git：<https://github.com/weelume/rescale-template>。
- 分支：`main`；已推送并核对远端 SHA：`42189255ab22f070794a25ddb48d089c1cda58e1`。
- 应用验收基线：`75c510d`；随后仅更新验收报告。源码摘要：`032930ef0c2047c34804b0d345ba18ae3c55ade7cc072f1cd7e3d65fbfd53838`。
- 固定包：`website/vendor/rescale-template-1.0.0-05698db9bc3e.tgz`。
- 包 SHA256：`05698db9bc3eb32fee1dd045fc86bd9ab81a39a7c7ec11d1e5b7ff0f6e77489d`，sourceDirty=false。
- [完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/rescale/1.0.0-42189255ab22f070794a25ddb48d089c1cda58e1/15a32034362e96cb64afaafbfa151183759bba26dcf64dab964686223cd758eb.zip)。18075038 字节，SHA256：`15a32034362e96cb64afaafbfa151183759bba26dcf64dab964686223cd758eb`。本地 WSL `git archive` 打包，既有 COS SDK 上传，匿名下载 SHA256 和 ZIP CRC 校验通过。

模板锁、依赖声明、pnpm 锁与 releases.json 配套更新。保留旧 COS 内容寻址对象。主站未提交、推送或部署。

## 明确限制

1. 原站全部页面在三端的逐项、逐时刻精确动效对照尚未完成；手机真实拖拽释放回弹、系统减少动态效果偏好仍未完成实际验收，不能标记完整动效复刻通过。
2. 图形示意素材中仍有原站英文文字；第三方品牌、图片、视频与英文文案的商业及再分发权利未核实，维持 listed=false。
3. 未验证登录后教程提示词复制链路；演示表单不连接真实服务。并行模板的未完成状态不由本任务修复。

回滚时同时恢复 Rescale vendor、模板锁、依赖声明、pnpm 锁和发布清单至同一已验收版本，使用相同本地构建产物流程；不删除旧 COS 对象，不覆盖其他模板或用户改动。

## 2026-10-26：内置浏览器复核与 1.0.1 更新

本轮按用户要求使用内置浏览器查看参考站，并在已有实现上修正实际差异；上文 1.0.0 的记录保留为历史，不作为本轮源码的验收结果。

### 修正内容及根因

- 原站年付价格实际为 `$21 / $57 / $145`，旧实现从“Save 20%”推算价格，造成数值错误。改为内容模块明确声明年付月均价，年付总额由该数据计算，保留数字切换过渡。
- 团队区旧实现使用大图和渐变文字覆盖，与参考站下置姓名、职位不符。桌面恢复 160×240 窄幅肖像，iPad 自适应，手机保留单张大图；拖拽期间暂停自动换人。
- 旧手机断点沿用视频与评价并排布局，遗漏原站横向评价轮播。改为单列视频与横向单卡评价，包含两秒自动切换、暂停、翻页、拖拽及减少动态效果分支；桌面双列反向循环保留。
- 上次实现和验收没有以实际手机状态完整覆盖这些分支，因此不能依靠旧的路由、静态布局检查认定动效一致。

### 本轮验收

- 独立工程：本地 WSL Linux 干净 Git 克隆、冻结安装、`pnpm typecheck`、`pnpm lint`、`pnpm test`（4 项）、`pnpm build`、`.tpl/tools/check.mjs . --require-verified` 通过。源码摘要为 `f34ab9484b95bd28057e5227730061006654b6258119cade71a93b3e3e2354a0`；20 条双语页面、未知路由 404、90 项素材检查通过。
- 独立浏览器：查看原站桌面与手机团队、客户区和年付切换；检查修正后桌面 / iPad / 手机团队布局，以及手机视频整列展示、评价自动切换及暂停保持当前内容。手机真实拖拽换人未得到可确认结果，不标记通过。
- 主站原样完整构建失败：无关 `catalog/goalz/weelume.tsx` 引用了未安装的 `goalz-template`。原工作区及其已有修改完整保留。首次单独类型检查还缺少构建时生成的 `catalog.generated.json`；正式构建已生成该文件，剩余阻塞为 Goalz 缺包。
- 仅在 WSL 验收副本隔离未登记 Goalz 草稿后，`template:check --id rescale`、全量 `tsc --noEmit`、Rescale 适配 ESLint、`template:release:check` 与主站构建通过。这不代表原工作区整仓构建通过；没有新增 Goalz 依赖或修改其源码。
- 最终主站生产预览：20 条双语路径、未知路由 404、90 项素材通过；内置浏览器完成 10 页 × 双语 × 1440 / 834 / 390 / 320 共 80 组检查，无横向溢出或已加载图片损坏，市场入口均为 `/templates`。另验证 FAQ 展开、语言切换保留 query/hash、菜单展开、Escape 关闭并恢复焦点，以及年付价格。
- 日志与证据：`artifacts/rescale/20261026/`。原样失败日志为 `host-build.log`，隔离成功日志为 `host-isolated-build.log`，产物位置和摘要见 `build.json`；浏览器 80 组结果见 `host-browser-matrix.json`。未在服务器构建或部署。

### 源码与配套产物

- Git：<https://github.com/weelume/rescale-template>，`main`，提交及已核对远端 SHA：`06bd7fb6a9a580a05198d05a7351f00eb0351f7d`。
- 固定包：`website/vendor/rescale-template-1.0.1-16a130f94efa.tgz`，SHA256：`16a130f94efa51380c5ee5507da10f138ac5aa4647f7e5775a48fee975df6d65`，`sourceDirty=false`。
- [1.0.1 完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/rescale/1.0.1-06bd7fb6a9a580a05198d05a7351f00eb0351f7d/435e2fadefd114c5cc4baca2a358bb977303ec08814db19de06e41fd2aa86523.zip)，18078174 字节，SHA256：`435e2fadefd114c5cc4baca2a358bb977303ec08814db19de06e41fd2aa86523`。本地 WSL 打包、既有 COS SDK 上传、匿名下载 SHA256 与 ZIP 完整性验证通过，旧对象保留。
- 已同步模板锁、包声明、pnpm 生成的依赖锁、发布清单及 Git 索引文档；依赖锁本轮只改变 Rescale 包。主站未提交、推送、部署或上架。
- 最新本机预览：<http://localhost:43414/templates/rescale/site>，详情：<http://localhost:43414/templates/rescale>。地址依赖本地保留的预览进程；43413 为历史版本，不作为本轮交付入口。

完整原站三端动效逐项逐时刻精确对照、手机真实拖拽换人及系统减少动态效果偏好仍未完成实际验收；图形素材英文标签和商业、再分发许可限制仍保留，维持 `listed=false`。本轮不能标记为“完整原站动效精确复刻验收通过”。

### 主站接入入口复核

用户补充要求接入主站后，使用内置浏览器从主站首页 `/` 选择“企业官网”，确认存在“Rescale · 微域生光智能增长”卡片，并实际点击进入 `/templates/rescale`。详情页显示 10 个页面、PC / H5 / iPad 入口及当前设备 4 张截图；三个设备预览链接均使用 `_blank`，整站入口为 `/templates/rescale/site`。主站品牌、市场返回入口和示例备案沿用宿主适配；固定包、模板锁、依赖锁和源码 ZIP 已在主站工作区接入，本轮无需重复实现注册或复制模板源码。

详情页已在内置浏览器保留，入口证据为 `artifacts/rescale/20261026/host-integration-detail.png`。上述结论针对本地主站代码及生产验收预览，不代表线上主站已部署新版本；源码许可和动效验收限制仍按上文保留。
