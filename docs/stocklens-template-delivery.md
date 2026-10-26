# StockLens 模板交付记录

## 2026-10-26 续验收：完整主站构建通过

用户另行明确授权补齐 Alex 源码 ZIP。已执行标准 `template:release --ids alex`，既有 COS 上传、匿名下载 SHA256 与 ZIP 完整性验证通过；全站 `template:release:check` 门禁已解除。下文此前的阻塞描述保留为历史，不代表当前状态。

- 实际构建位置：本机 WSL Linux `/home/xmin/workspace/cryptocalc-20261026/website`。冻结离线安装、全量非增量 TypeScript 检查、全站源码 ZIP 门禁和正式 `pnpm build` 均通过，未绕过检查。构建日志见 `artifacts/stocklens-rename/host-final-{typecheck,release-check,build}.log`。
- 正式构建的 32 条双语业务路径、12 张截图与源码字节一致性、5 类旧地址 308 和查询参数保留通过。主站首页、市场入口、详情和三种设备预览均 HTTP 200；详见 `full-main-http.json`、`full-main-redirects.json` 和 `.work/stocklens-rename/full-main-http.mjs`。
- 内置浏览器实测完整主站详情的三端各四张画廊，12 张图片加载正常；手机预览新标签页、PC/iPad/H5 模拟器 iframe 尺寸 1440×1000、834×1180、390×844 正确。手机计算 10 股、成本 200 美元，得到市值 2282.60、成本 2000、盈亏 +282.60、收益率 +14.13%；移动菜单进入行情页并切到英文，保留当前页面。
- 未登录点击 WorkBuddy 指南进入 `/login?next=%2Ftemplates%2Fstocklens%23workbuddy-guide`，登录保护正常；没有登录，未验收认证后的提示词复制及后端微信登录链路。详情页检查时未记录脚本错误。
- 原 43563 隔离宿主服务已在核对进程工作目录后替换为同一份完整主站 standalone 产物。当前详情 `http://localhost:43563/templates/stocklens`，站点 `http://localhost:43563/templates/stocklens/site`。未部署服务器、未推送主站、未公开上架。
- BUILD_ID：`UqGWz26sTPIBTYYTgTqY7`；standalone/server.js SHA256：`d7f95cd6f31ae809065d9affc856fa65930b363c2f53bf3d0305599b428d6e1e`。该摘要标识启动文件，不作为完整站点发布包摘要；本次未打包或部署主站发布产物。

浏览器证据：`artifacts/stocklens-rename/full-main-gallery.json`、`full-main-devices.json`、`full-main-detail.png`、`full-main-mobile.png`。本轮未新增业务代码；未重新完成原参考站全部动效逐帧、悬停暂停/恢复和系统减少动态效果的完整矩阵，保留此验收边界。全站构建通过不等于全站所有模板交互逐一验收。

---


## 最新版本1.2.0：统一命名与旧地址兼容

2026年10月26日，按用户要求将模板标识、包名、模块目录、运行素材、独立工程、GitHub仓库及默认分支统一命名。展示品牌及美股分析业务沿用1.1.0，持仓计算没有改变。下文旧版本记录保留作历史。

| 项目 | 新值 |
| --- | --- |
| 模板ID | stocklens |
| 共享包 | stocklens-template@1.2.0 |
| 独立工程 | D:/code/code-tpl/stocklens-template |
| 独立模块 | src/features/site-templates/catalog/stocklens |
| 主站适配 | website/src/features/site-templates/catalog/stocklens |
| 运行素材 | public/templates/stocklens |
| Git仓库 | https://github.com/weelume/stocklens-template |
| 默认分支 | codex/stocklens |
| 当前预览 | http://localhost:43563/templates/stocklens/site |

用户明确选择GitHub仓库也同步改名。核对目标名称未占用及仓库ID后，对同一仓库1433715043执行改名，保留全部历史和旧分支；GitHub旧仓库地址自动重定向。独立工程移动前核对了绝对源/目标路径、目标不存在、Git工作区干净，保留.git历史，未覆盖其他工程。

主站在实际next.config.ts中配置 /templates/cryptocalc/:path* → /templates/stocklens/:path* 永久重定向，不重复注册两个模板。旧详情、预览和站点路径均保留尾部与查询参数；浏览器实测锚点也保留。旧版vendor包、模板锁和COS对象保留供回滚，不再作为活动模板依赖。stocklens.local指向新工程；主站生产只读取固定包。

### 验证

- 本地WSL Linux /home/xmin/workspace/stocklens-rename-20261026/source 完成冻结离线安装、pnpm typecheck、pnpm lint、6项测试及pnpm build，全部通过；最终生产32条双语路径通过，专用服务已停止。
- 发现WSL校时使一次测试记录结束时间早于开始时间，未改写时间冒充通过，而是重跑该项测试并刷新报告；最终check --require-verified通过。
- 本地主站隔离副本完成pnpm安装并生成依赖锁、全量非增量类型检查、改动文件ESLint、template:check --id stocklens，通过。回写锁前核对源package.json未被并行修改。
- 43563隔离宿主预览消费实际固定包，直接引用实际主站Next配置；32条双语页面、12张截图HTTP字节、5类旧路径308跳转通过。浏览器另实测英文子页面旧URL的查询/锚点保留及中文切换，新首页无旧资源路径或横向溢出，未记录脚本错误。
- 全站正式pnpm build与template:release:check仍被 alex: 源码 ZIP 尚未发布 阻塞。没有绕过门禁，也没有改动其他模板解除阻塞。StockLens自身源码ZIP/快照一致性通过；该预览不代表完整主站生产部署。

证据在artifacts/stocklens-rename/：checks.json、services.json、host-verification.json、redirects.json、host-build.log、各命令日志及preview.png。完整原参考站逐帧动画矩阵未重新全面验收；本次按命名和路由影响验收，保留既有业务、视觉和动效。

### 源码与发布产物

提交e4030078a2be3b47d614ea74fde6d28028857790，分支codex/stocklens，已推送并git ls-remote核对远端一致。独立源码摘要428efc214dbbb67364bac849b720088abd044a3d41c9702d65caa30c2f943375。

固定包：website/vendor/stocklens-template-1.2.0-16739793796e.tgz；SHA256 16739793796e3ea7a7945c2a499281a6c271edcfb29561ce353e4cec6cbeac5f；sourceDirty=false。包在本地WSL已提交源码的干净克隆package-source中生成。package.json、pnpm-lock.yaml及templates/stocklens.lock.json同步交付。

源码ZIP：https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/stocklens/1.2.0-e4030078a2be3b47d614ea74fde6d28028857790/840a301e69e2c65a8d8e95dbe7eef3f1011ef8f9f6041ec88e6a147454f15bae.zip 。4,884,247字节，SHA256 840a301e69e2c65a8d8e95dbe7eef3f1011ef8f9f6041ec88e6a147454f15bae。本地WSL打包、既有COS SDK上传、匿名下载SHA256及ZIP完整性均通过；随后新增stocklens发布记录，保留旧cryptocalc对象与记录。沿用用户本会话对同一模板源码推送及ZIP上传的明确授权，不部署主站、不市场上架。

回滚需恢复模板注册、适配、包依赖/锁、模板锁及release记录，并调整目录/本地引用；Git历史与旧分支保留，不强制推送。旧地址重定向与模板活动ID要配套处理，避免相互跳转。

---

# StockLens 美股分析交付记录

## 最新版本1.1.0：整站改为美股分析

2026年10月26日，按用户选择改为美股研究与持仓盈亏测算。保留既有模板ID、包名、导出、主站地址和16个页面URL，展示品牌改为StockLens；不影响已接入链接。主站宿主仍使用微域生光品牌。下文1.0.0记录为历史。

### 本次内容

- 全部中英文导航、首页、功能、市场、目录、FAQ、博客和三篇指南、关于、联系及政策页统一为股票研究。旧业务文案由源码回归测试和真实页面扫描验证，无残留。
- 12只美股固定示例，覆盖科技、金融、消费、医疗、能源；图标改为本地自绘股票代码标记，不使用公司官方Logo。行业筛选、公司名/代码搜索、空结果及排序可用。
- 标普500、纳斯达克、道琼斯及VIX示例，指数点数、股价、市值与市盈率替代旧指标；所有数据明确为固定演示，未接行情源或券商。
- 原换算器替换为持股数量、平均成本和参考股价测算：市值、成本、浮动盈亏及收益率；支持小数股数，非法输入显式报错，零成本/零数量收益率显示无定义，数值溢出明确拒绝。不计算费用、税款、分红或组合风险。
- 原有轨道、反向滚动、计数、绘图、盾牌、菜单和FAQ动效保留；12张三端展示图已刷新。

### 实际验证

独立工程在本地WSL /home/xmin/workspace/stocklens-20261026/source 进行冻结离线安装、pnpm typecheck、pnpm lint、pnpm test（6项）与pnpm build，全部通过。测试覆盖盈利、亏损、小数股数、零成本、零数量、非法/溢出输入和旧业务文案回归。

默认100股、成本200美元、示例价228.26美元实测结果：市值22826、成本20000、盈利2826、收益率14.13%。页面另实测亏损、小数股数、零成本、非法输入、代码搜索、医疗行业筛选和无结果状态。

最终独立生产服务32条中英文路径全部200，响应含实际页面且无旧业务文案；该专用生产服务已停止。桌面1440×1000、平板834×1180、手机390×844首页/功能/博客/联系12张截图无破图、旧文案或横向溢出；英文首页/市场/目录另检查三端与320px宽度，共12组通过。位图实际尺寸仍为1432×994、826×1169、382×827，未拉伸。

主站最新源码和固定包在本地WSL /home/xmin/workspace/cryptocalc-20261026/website 完成非增量全量类型检查、适配ESLint与template:check --id cryptocalc，均通过。43563隔离宿主预览已重启为1.1.0；对应32条路径及12张截图HTTP/源码字节一致性校验通过，品牌、市场入口、示例备案保留。该预览不是完整主站部署。

正式主站pnpm build与全站源码ZIP清单检查仍被alex: 源码 ZIP 尚未发布阻塞；没有绕过门禁，没有修改Alex或其他模板来消除阻塞。StockLens自身ZIP/快照定向一致性检查通过。完整参考站逐帧动效矩阵未重新全面验收；本次重点验收业务内容、计算器和受影响布局。

证据：artifacts/stocklens/checks.json、services.json、captures.json、english-checks.json、host-verification.json、host-build.log及各命令日志与截图。

### 提交与发布产物

- 独立Git沿用 https://github.com/weelume/cryptocalc-template/tree/codex/cryptocalc ，新版提交4ffaf7503bd06ff22013bb8530db036d234e998b，已推送并核对远端一致。首次网络重置后使用项目既有代理重试成功。
- 源码摘要：01b2acb5e04ff158555cfca59f8c44fd9cc8fe0cf4b67120ae9a6ba9f9f01a35，独立check --require-verified通过，工作区干净。
- 固定包website/vendor/cryptocalc-template-1.1.0-d35a609a1e1b.tgz，SHA256 d35a609a1e1bd29bee5b8d143192c387ff9a66fde2d523ab7c1a27d4f4270eca，sourceDirty=false。在本机WSL已提交源码的干净克隆package-source中bundle；主站锁由pnpm生成，保留其他模板并行变更。
- 源码ZIP：https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/cryptocalc/1.1.0-4ffaf7503bd06ff22013bb8530db036d234e998b/f451ec643076816141c8b65ccb936c1f8b7e552a301430f21968d87bc8c1d484.zip 。4,885,060字节，SHA256 f451ec643076816141c8b65ccb936c1f8b7e552a301430f21968d87bc8c1d484。沿用用户本会话对同一模板源码推送及ZIP上传校验的明确授权；标准template:release入口已完成本地WSL打包、COS上传、匿名完整下载及ZIP校验，随后切换本模板发布记录；末尾全站检查被Alex阻塞。旧版本保留。

未新增第三方依赖、未做数据库变更、未部署服务器或上架市场。公开参考设计的商业再分发限制继续保留。回滚时一并恢复本模板适配、包/快照、依赖锁及release记录，保留其他模板变更和历史COS对象。

---

# 1.0.0 历史交付记录

日期：2026年10月26日（Asia/Shanghai）。依据 `docs/template-replication-guide.md` 实施。已完成独立模板、固定共享包、主站注册与宿主适配、Git 推送、源码 ZIP 上传和对应检查。**完整原站三端逐帧动效验收尚未全部完成；主站全量构建被并行 Alex 模板的缺失交付阻塞。**

## 页面与实现

参考：https://jiro.build/templates/fintech/crypto-exchange-calculator-landing-page-cryptocalc 。已通过内置浏览器实际读取公开预览、查看布局与运行状态，并与公开区块资源交叉核对。未使用受限源码入口。

原站是单页，包含轨道币种、换算器、两列反向滚动行情、深色功能卡片、市场总览、币种目录、FAQ 和页脚。按项目规范补齐功能、市场、币种、FAQ、博客、三篇指南、关于、联系、隐私、条款、Cookie、免责和安全页，共16个页面、32条双语路径。扩展内页不是原站已有独立页面。

独立工程：`D:/code/code-tpl/cryptocalc-template`。品牌、双语数据、主题、组件、页面及路由分别维护；React / Next.js / Framer Motion 沿用既有版本，无新增第三方库。中文 MiSans 400/700，英文数字 Poppins 400/600/700，全部素材本地托管。政策与表单明确为演示，报价、评价、统计不是实时服务，不连接钱包或交易所。

主站 `website/src/features/site-templates/catalog/cryptocalc/` 仅保存 `meta.ts`、`weelume.tsx`；通用源码来自共享包。主站注入微域生光品牌、Next Link 市场入口和 `TemplateFiling` 的“示例ICP备00000000号”。`cryptocalc.local` 为忽略的本地开发引用；生产只消费 vendor 快照，不读取本机路径。

## 动效与差异

已实现14枚币种在第3/4轨道35秒正转及反向保持朝向、2.4秒心跳和独立延迟；首屏文字向上入场、计算器向下入场、功能标题/网格的差异化入场；两列20秒反向垂直滚动；图表4–6秒裁剪绘制；数字2秒计数、10秒重放；市场表格20秒循环；盾牌15秒环线、3秒浮动和4秒发光；币种卡片错峰、菜单、FAQ 和按钮反馈。原站18/24秒轨道样式未被实际币种使用，不能将其误述为可见币种的周期。

三端运行时均采集到77个动画元素，分别记录不同时刻的 transform / clip-path 变化。首屏入场结束后采集截图，FAQ、菜单等已操作检查。主市场图按原路径还原；小图曲线仍为示意，部分功能卡片排版和字号按双语规范调整。

**未完成项**：原站与实现逐区、逐端的完整初始/运行/结束时序矩阵；真实悬停暂停/恢复；系统减少动态设置实际切换。后两项受当前浏览器接口能力限制，仅完成源码检查。没有用静态截图或路由200冒充完整动效通过。详细清单在独立工程 `.tpl/docs/MOTION.md`。

## Git、固定包与源码 ZIP

- Git：<https://github.com/weelume/cryptocalc-template/tree/codex/cryptocalc>。
- 分支 `codex/cryptocalc`，提交 `6783206ac653b83d937a77db62a120f612635391`；`git ls-remote` 核对一致，独立工作区干净。未推送主站仓库。
- 独立协议检查 `check --require-verified` 通过，报告源码摘要 `c0660350239e878e003ec4b95808fa1ec792e7a861c4a26227a2f292db175c90`。报告中的 passed 仅表示声明的应用检查通过，limitations 保留动效限制。
- 包：`website/vendor/cryptocalc-template-1.0.0-533c8095ee16.tgz`。
- 包 SHA256：`533c8095ee16069bdfd11ffeedb6bb12395035fc1a62646f79afa12a85ff195a`；`sourceDirty=false`，模板锁、依赖声明及 pnpm 生成的依赖锁已同步。
- 源码 ZIP：<https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/cryptocalc/1.0.0-6783206ac653b83d937a77db62a120f612635391/7600021041593befdb2a0149a28fc41b2be917a397b8ef02c0def3bd25f5adc8.zip>。
- ZIP 4,844,121 字节，SHA256 `7600021041593befdb2a0149a28fc41b2be917a397b8ef02c0def3bd25f5adc8`。用户明确授权后，通过标准 `template:release --ids cryptocalc` 完成本地 WSL 打包、既有 COS SDK 上传、匿名完整下载、摘要和 ZIP CRC 校验，随后合并 releases.json。旧对象未删除或覆盖。

初次 GitHub 操作被自动审批拒绝；用户随后明确授权创建公开仓库与源码推送，才执行成功。COS 上传另获用户明确授权。该记录不构成主站部署、市场上架或素材商业再分发许可。模板保持 `listed=false`、`redistributionAllowed=false`。

## 验证结果

| 项目 | 实际结果 |
| --- | --- |
| 独立 `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` | 通过，3项换算规则测试 |
| 独立最终生产构建的32条中英文HTTP路径 | 全部200，响应含实际模板HTML；该专用服务已停止 |
| 三端截图 | 首页/功能/博客/联系共12张，未发现破图与横向溢出 |
| 英文首页/市场/币种，含320px窄屏 | 12组视口检查通过 |
| 交互 | 金额换算、反向换算、币种搜索、空结果、稳定币筛选、FAQ、图表周期、手机菜单、联系表单本地校验通过 |
| 语言切换 | 独立和宿主适配均验证对应页面、查询参数与锚点保留 |
| 固定共享包 `template:check --id cryptocalc` | 通过 |
| CryptoCalc定向源码ZIP/快照一致性检查 | 通过 |
| 主站改动文件 ESLint | 通过 |
| 隔离宿主适配类型检查、32条双语路径和12张截图字节校验 | 全部通过；品牌、市场入口、示例备案及手机触控高度通过 |
| 浏览器脚本错误 | 对宿主预览读取 error 日志，未发现错误 |
| 主站全量类型检查 | 失败：并行 Alex 模板尚缺 alex-template/template 与 /host |
| 正式主站 `pnpm build`、全站 `template:release:check` | 被 `alex: 源码 ZIP 尚未发布` 阻塞，未绕过门禁 |

验收中曾发现搜索参数 Hook 使独立生产首屏仅客户端渲染，已改为客户端语言切换时读取 URL 查询/锚点。修复后重跑全部独立检查和32条真实生产路径，通过响应包含实际HTML确认，而非仅凭代码判断。另修复平板功能卡片双列、手机语言入口及深色卡片对比度。

截图按 CSS 视口1440×1000、834×1180、390×844采集；内置截图工具实际导出的位图分别为1432×994、826×1169、382×827。未拉伸补齐，独立/主站元数据按真实位图尺寸记录。独立 `.tpl/assets/` 映射到主站 `public/templates/cryptocalc/screenshots/`。

构建位置全部在本机 WSL Linux 文件系统：`/home/xmin/workspace/cryptocalc-20261026/`，其中 `cryptocalc-template` 为独立检查目录，`package-source` 是已提交源码的干净 Git 克隆，`website` 是完整主站检查副本，`host-fixture` 仅验证真实宿主适配，不代表完整主站生产构建通过。浏览器检查、截图和WebP转换在Windows本机完成。没有服务器构建、服务器部署或市场上架。

证据在 `artifacts/cryptocalc/`：checks.json、services.json、captures.json、english-viewport-checks.json、motion-samples.json、host-verification.json、host-build.log、host-lint.log 及截图。

## 预览与后续

隔离宿主适配预览：<http://localhost:43563/templates/cryptocalc/site>。此端口复用实际固定包、宿主适配、Logo、备案及模板路径；不包含完整模板市场。工作区没有可访问的3000主站，本次未替换用户运行实例。

等待 Alex 自身完成运行包和 ZIP 交付后，可对最新主站源码重新在本地 WSL 冻结安装，执行全量类型、`template:release:check`、build 和完整模板详情页/新标签页设备预览检查。当前未完成主站模板详情画廊、新标签页设备框的实际交互验收。

回滚本次接入时，只撤销 CryptoCalc 的注册、适配、transpile/local配置及依赖项，连同本模板 vendor、模板锁、pnpm锁对应项及 releases 记录一并处理；不回滚其他模板的用户改动，不删除旧 COS 对象。下次变更遵循独立源码验证/提交/推送、干净克隆 bundle、template:update、pnpm更新锁、源码ZIP上传校验及本地WSL构建的顺序。
