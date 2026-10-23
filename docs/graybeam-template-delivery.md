# Graybeam 模板复刻与交付验收

交付日期：2026-10-23（Asia/Shanghai）。参考站：https://communicative-psychology-099138.framer.app/ 。该 URL 实际为 Graybeam Builders 建筑施工官网，按 docs/template-replication-guide.md 与独立模板协议 0.2.0 实施。

## 完成内容

独立主维护工程：D:/code/code-tpl/graybeam-template/。覆盖原站 29 个页面、58 条中英文路由：11 个基础页面、4 类服务、8 个项目案例、6 篇建造文章。保留黑白、工程蓝、大幅建筑摄影、公开费用与书面合同的视觉方向，按中文规范调整字号与留白。中文使用本地 MiSans 400/700，英文和数字使用本地 Poppins 400/600/700。卡片、颜色、间距、字号与响应式规则集中管理。

实现 42 项费用分类筛选、项目分类、改造前后滑块、图片放大与 Escape 关闭、移动导航、语言切换、FAQ、演示表单。表单校验姓名、电话、类型、地址和描述；拒绝仅符号或数字位数不合要求的电话。成功只表示本地校验完成，不发送、不保存。隐私、法律与条款按实际演示能力编写，价格、职位、评价、资质和联系信息均为示例。

通用源码按品牌配置、双语内容、主题、共享组件、页面组合和路由元数据分层。主站 catalog/graybeam 仅保留 meta.ts/weelume.tsx，注入微域生光 / Weelume、既有 Logo、模板市场入口及共享 TemplateFiling 示例备案，没有复制整套通用页面。运行素材由包同步至 public/templates/graybeam，12 张真实展示图由 .tpl/assets 映射到 screenshots。

## 访问与维护

- 正式本地生产预览：http://127.0.0.1:43332/templates/graybeam/site
- 英文：http://127.0.0.1:43332/templates/graybeam/site/en
- 模板详情：http://127.0.0.1:43332/templates/graybeam
- 独立工程默认端口 43328，当前验收端口 43338 的服务已按报告停止；主站正式预览保持运行。
- 通用修改入口：src/features/site-templates/catalog/graybeam/config/brand.ts、content.ts、costs.json、tokens.css/theme.css、components/、pages/ 和 meta.ts。
- 本地 graybeam.local 直接引用独立源码；生产只读取随仓固定包，不读取本机路径。

## Git、固定包与源码 ZIP

| 项目 | 结果 |
| --- | --- |
| 真实源码仓库 | https://github.com/weelume/graybeam-template |
| 分支及本地/远端一致提交 | main · cfde40260b7c2c9428baebd0a455bd44a8ad3e3b |
| 版本 | 1.0.0 |
| 固定包 | website/vendor/graybeam-template-1.0.0-67813fb3b4e8.tgz |
| 固定包 SHA256 | 67813fb3b4e8902825f90bc70ac68bfe495ece37cb556510df2fa2047f7c3ee5 |
| 来源状态 | sourceDirty=false |
| 独立验收源码摘要 | 0334e3a4b0f191d43e0caf962fd8ec365a3ef154ff714d67fd431806fd743b9f |
| 源码 ZIP 字节数 | 28107386 |
| 源码 ZIP SHA256 | f8b14003322856ea10c0f6b74e4cd7897368e71230d2171075bf1b52be5d1649 |

[完整已提交源码 ZIP 长期公开下载](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/graybeam/1.0.0-cfde40260b7c2c9428baebd0a455bd44a8ad3e3b/f8b14003322856ea10c0f6b74e4cd7897368e71230d2171075bf1b52be5d1649.zip)。用户明确批准使用现有 GitHub 凭据创建和推送当前公开仓库，并上传既有 COS 专用目录。上传后完成匿名 GET、SHA256、ZIP CRC 和完整源码结构检查，全部成功才更新 releases.json。旧内容寻址对象保留。真实 Git 地址已登记于独立 .tpl/template.json、主站 gitUrl 和 docs/template-repositories.json/.md。

初期宿主集成阶段的报告已移到主站 artifacts/graybeam/initial-application.json；独立 .tpl 仅保留自身验收。资料清理未改变业务源码摘要或运行包字节，最终 Git/ZIP 指针已同步并重新构建主站客户端。

## 验证结果

所有依赖安装、应用编译、共享包与 ZIP 打包均在本地 WSL Ubuntu 的 Linux 文件系统完成。独立目录 /home/xmin/workspace/graybeam-20261023/graybeam-template，主站目录 /home/xmin/workspace/graybeam-20261023/website。主站产物 .next-graybeam-production，构建 ID 7hKcdgZwAyVVwAtt-iA3G；正式运行入口为其中 standalone/server.js，补齐同一产物的 public/static。未在远端服务器构建或部署。

| 检查 | 结果 |
| --- | --- |
| 独立环境与安装 | Node 24.16.0、pnpm 9.15.4，复用既有依赖，离线冻结安装通过，无新增第三方库 |
| 独立应用 | pnpm typecheck、pnpm lint、pnpm test、pnpm build 通过；2 项合同测试检查 42 项双语费用及素材摘要 |
| 严格协议 | node .tpl/tools/check.mjs . --require-verified 通过，ready，报告源码摘要与最终提交一致 |
| 独立服务 | 四项命令记录真实起止时间；58 条语言 HTTP 路由及全部登记图片请求通过，临时服务停止状态已核实 |
| 独立浏览器 | 29 页 × 中英文 × 1440/834/390/320，共 232 组路由和溢出检查通过；交互修复后分别回归 |
| 展示图 | PC 1440×1000、iPad 834×1180、H5 390×844，各首页/服务/日志/联系四张，共 12 张；ffprobe 核验实际 WebP 编码尺寸，转换未缩放 |
| 主站类型和 ESLint | pnpm exec tsc --noEmit，以及 Graybeam 适配、registry、next.config.ts 的 ESLint 通过 |
| 主站合同测试 | 素材隔离、共享模板登记、源码 ZIP 发布门禁 3 项通过 |
| 快照及 ZIP 门禁 | template:check --id graybeam、template:release:check 通过；24 套现有记录保持一致 |
| 主站浏览器 | 三端全部页面/语言 174 组，加 320px 代表页面 16 组，共 190 组通过；品牌、市场入口、示例备案、图片及横向溢出已核对 |
| 主站生产构建 | TEMPLATES_MODULE_ENABLED=true WEBSITE_BUILD_DIR=.next-graybeam-production pnpm build 通过，37 个静态页面生成及构建追踪完成 |
| 正式 standalone | 最终产物 58 条 HTTP 路由、实际图片、12 张展示图尺寸及最终 COS URL 编译内容核验通过 |
| 生产交互 | 语言路径/查询/锚点保留、拒绝无效电话、本地表单成功语义通过，未发现页面控制台错误 |
| 三端新标签页预览 | PC、iPad、H5 均实际打开；模拟器 CSS 视口为 834×1180、390×844，保留首次加载失败及成功重试记录 |

实测修复：手机首屏按钮避开底部固定栏；入场动效改为始终可读的位移；语言切换使用 Next Router 携带当前查询与锚点；电话校验增加有效数字位数。首次协议校验缺少 customization 的 Schema 引用已补齐，没有放宽校验。GitHub 直连失败后使用项目指定代理完成推送。并发 Artemis 更新导致隔离副本门禁不一致时，同步已发布快照后重建，没有覆盖其他模板源码。

独立证据：.tpl/reports/verification.json、browser.json、interactions.json、screenshots.json、service-routes.json。主站证据：artifacts/graybeam/host-routes.json、host-interactions.json、production-routes.json、production-interactions.json、production.json、previews.json、host-build.log、standalone.log 与真实截图。

## 限制与后续

1. 参考站图片的商业与再分发许可未核实；保持 listed=false、redistributionAllowed=false。公开 Git/ZIP 不代表取得素材商业授权，正式商用前应取得授权或替换素材。
2. 未从远端全新克隆后重新安装；已在独立 Linux 目录冻结安装、构建、运行，并核对最终源码摘要。减少动态效果已在实现中支持，未通过浏览器系统偏好模拟验证。
3. 当前没有已登录本地会话，未实际验证登录后展开 WorkBuddy 教程和剪贴板复制；未绕过鉴权。已核对现有组件使用发布清单、生产客户端包含最终 COS URL。人工步骤：登录后打开详情页，展开教程，复制并核对上方 ZIP 地址。
4. 浏览器不能直接读取沙箱 iframe 的 contentDocument；已验证其 CSS 尺寸及渲染内容，并在对应真实 CSS 视口单独检验页面交互。首次 H5 弹出页连接重置，重新由详情页点击后通过，未隐去初次失败。
5. 主站构建保留既有 Next ESLint 插件和无效 eslint-disable 警告，未修改无关页面。开发详情页出现过现有登录后端不可达日志，模板页面本身无需该接口；未扩大为鉴权或后端改造任务。
6. 仅独立源码仓库已提交推送；主站改动未提交、未推送、未部署，未公开市场上架。其他任务和用户已有修改均保留。本次主站验收对应上述隔离副本和构建 ID，不覆盖后续并发改动。

后续更新：在独立工程修改、验证、提交、推送，再在本地 WSL bundle；主站 template:update --id graybeam，pnpm 生成锁，template:release --ids graybeam，template:check、template:release:check 和 build。固定包、模板锁、package.json、pnpm-lock.yaml 和 releases.json 必须共同交付。回退时恢复相互匹配的上述文件并在本地 WSL 验证；不删除旧 COS 对象。本次没有线上部署，无需线上回滚。
