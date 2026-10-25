# Zenpanda 模板实现与接入验收

## 交付状态

已实现以 Zenpanda Header 为首页核心的完整双语慢生活网站，接入主站共享模板体系，完成独立源码提交、推送、固定运行包及源码 ZIP 发布。**尚不能标记“完整复刻验收通过”**：原站与本地三端亚秒级逐帧、水波持续轨迹、悬停与系统减少动态效果的完整运行矩阵未完成。主工作区全量检查另受并行中的其他模板阻塞，隔离集成结果不能替代全站通过。

参考：<https://jiro.build/components/header/mindful-living-and-slow-lifestyle-header-zenpanda>。实施依据为 `docs/template-replication-guide.md`。用户已明确选择“以该 Header 为首页，补齐同风格完整网站及内页”。新增内页为原创同风格内容，不冒充参考组件已有页面。

## 源码与页面

- 独立主维护工程：`D:/code/code-tpl/zenpanda-template`。
- Git：<https://github.com/weelume/zenpanda-template/tree/codex/zenpanda>。
- 分支：`codex/zenpanda`；最终提交：`118500c32448fd9a4b5c1136f0bcf4c64a3c41d9`。正常推送后已通过 `git ls-remote` 核对远端一致。
- 12 个页面、24 条双语路径：首页、理念、正念练习、自然、生活手记、三篇手记文章、社区、联系、隐私与条款。
- 默认中文，英文在端路径后的 `/en`；站内使用 Next Link。语言切换实际验证保留当前页面、查询与锚点。
- 品牌、双语内容、主题、公共组件、页面与路由分离。主站 `catalog/zenpanda` 仅有 `meta.ts`、`weelume.tsx`，注入微域生光 Logo、模板市场入口与 `TemplateFiling` 示例备案。
- 本地运行素材包含原参考熊猫视频、三张自然主题照片、MiSans 400/700 与 Poppins 400/600/700 字体。来源及权利边界保存在独立工程 `.tpl/docs/ASSETS.json` 与 `LICENSE.md`。

## 动效与交互

- 原始熊猫泛舟视频，静音、inline、自动播放、循环；按原场景 cover 裁切。
- 原生 WebGL 实现 16 点指针水波，不新增渲染依赖。保留原参考水面遮罩、环形包络、波速、厚度、相位、振幅、点击双环和衰减参数；按 60fps 校正老化速率。
- 标题字符 `.35 + i × .045s` 错峰、`.85s` 模糊上移入场；容器与描述保留独立 1s 入场节奏。导航/按钮文字滚动悬停；独立品牌熊猫包含耳朵、眼睛与瞳孔循环。
- 手机和平板抽屉导航，补全真实站内路由、Escape、焦点与关闭逻辑。
- 新增页面包括滚动入场、玻璃卡片悬停、FAQ、本地表单校验及可暂停/重置的呼吸节奏引导。
- 视频播放、暂停与恢复已实际操作；暂停视频后实际点击水面，记录波纹运行与衰减。`ripple-difference.json` 中指定水面区域有 19736 / 150000 像素发生变化，仅作为运行证据，不作为逐帧一致性证明。
- 导航首帧保持可见，避免切页闪烁；字体/字号按中文规范调整。文字滚动槽统一为 22px。差异详见独立工程 `.tpl/docs/MOTION.md`。
- 减少动态设置已实现：禁用入场/Logo循环/交互水波，默认暂停视频，可手动播放；系统设置的真实操作尚未验收。
- 演示联系和订阅只在浏览器校验，不发送、不保存字段；日志只记步骤与结果。没有真实账户、课程、报名、交易或邮件服务。

## 固定运行包与源码 ZIP

- 运行包：`website/vendor/zenpanda-template-1.0.0-42dd4aabfc3a.tgz`。
- 运行包 SHA256：`42dd4aabfc3a86fae334f243c1572a230806c7397289a128fb2c733c9b1f2e25`。
- 快照提交同上，`sourceDirty=false`。对应 `website/templates/zenpanda.lock.json`、`package.json` 与 pnpm 生成的依赖锁共同交付。
- [完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/zenpanda/1.0.0-118500c32448fd9a4b5c1136f0bcf4c64a3c41d9/5faf4915e7e4e5909b168a806b874a2435fe3e5568b6ec65a0d2d27a069fcc04.zip)。
- ZIP：6845137 字节，SHA256 `5faf4915e7e4e5909b168a806b874a2435fe3e5568b6ec65a0d2d27a069fcc04`。
- 复用现有服务端 COS SDK 上传并匿名完整下载，SHA256 与 ZIP 完整性均通过后登记 `releases.json`；旧对象未覆盖或删除。
- `template:release --ids zenpanda` 的打包、上传与下载验证已通过；末尾全站发布检查因当时 `pawlio` 未发布而失败。Zenpanda 专项 `verifyTemplateReleases(undefined, ['zenpanda'])` 已通过。
- pnpm 在 WSL 生成锁并比较输入备份；差异为零，当前主锁已包含相同 Zenpanda 固定包，无需回写覆盖用户并行变更。证据：`artifacts/zenpanda/lock-update.diff`。

## 构建位置与验证

全部依赖安装、生产编译、共享包生成、源码 ZIP 打包均在本机 WSL Ubuntu Linux 文件系统完成，未在服务器构建或部署。

- 独立开发验收：`/home/xmin/workspace/zenpanda-20261025/zenpanda-template`。
- 独立干净克隆：`/home/xmin/workspace/zenpanda-20261025/package-source`。
- 主站隔离验收：`/home/xmin/workspace/zenpanda-20261025/host/website`。
- Node 24.16.0、pnpm 9.15.4；复用既有依赖，未引入新的第三方库。

| 验证 | 结果 |
| --- | --- |
| 独立冻结离线安装 | 通过 |
| 独立 `pnpm typecheck`、`pnpm lint` | 通过 |
| 独立 `pnpm test` | 3 项通过：页面/语言注册、运行素材/字体隔离、表单无外发/持久化 |
| 独立 `pnpm build`、生产服务 | 通过；报告专用服务健康检查后已停止 |
| 独立 HTTP | 24 条双语路由全部 200，未知路由 404 |
| 独立严格协议检查 | `check --require-verified` 通过，报告与源码摘要匹配 |
| 三端四类核心页面 | 标准视口无横向溢出、损坏或待加载图片，视频实际播放 |
| 320px | 联系页无横向溢出 |
| 交互 | 手机菜单、路由关闭、FAQ、语言参数/锚点、表单未发送未保存、呼吸计时/暂停均已实际操作 |
| 主站 Zenpanda 快照 | `pnpm template:check --id zenpanda` 通过 |
| 主站适配 ESLint | 通过 |
| 最新完整主站类型检查 | 并行模板依赖补齐后重新冻结当前范围，`pnpm exec tsc --noEmit` 通过，见 `host-final-typecheck.log` |
| 完整主站构建/发布检查 | 最后再次尝试仍受 `benjamen: 源码 ZIP 尚未发布` 阻塞，见 `host-full-build.log`；此前还出现过并行模板缺依赖及 `pawlio` 未发布。未改其他模板消除门禁 |
| 隔离主站类型/构建 | 明确排除上述未完成模板后通过，范围见 `integration-scope.json`；不等于主工作区全量通过 |
| 主站 HTTP | 最终隔离构建的24条Zenpanda双语实际路由全部200 |
| 主站入口/错误路径 | 模板详情、H5/iPad预览均200，未知页面404 |
| 主站浏览器 | 微域生光品牌、市场入口、示例备案、本地字体、视频正常，无损坏图片/溢出；控制台无错误 |
| 主站语言路径 | `site/contact?check=host#zp-main` 切至 `site/en/contact?check=host#zp-main` |
| 设备预览 | H5 iframe CSS 390×844、iPad 834×1180，框内菜单可用；切到手记后换设备仍保留页面 |

独立报告为 `.tpl/reports/verification.json`，源码摘要 `6f253ba1de98642ba1f824f936cc65f68ae6386d52f80fcc6605bb248af045b2`。该报告证明所列命令与服务检查，不代表完整视觉动效逐帧验收。主站运行证据、截图与构建日志位于 `artifacts/zenpanda/`。

## 截图与剩余限制

12 张真实截图在标准 CSS 视口 1440×1000、834×1180、390×844 下等待字体、媒体与入场完成后采集。浏览器接口裁去滚动条后按比例返回图像，实际为 1425×990、819×1159、375×812；按真实像素填写两边元数据并转 WebP，未放大或伪造原始尺寸。截图位置为独立工程 `.tpl/assets`，由同步器映射主站 `public/templates/zenpanda/screenshots`。

原站三端持续水波轨迹、亚秒级逐帧、悬停/循环及减少动态设置的完整矩阵尚未完成；参考浏览器读取曾超时，不能据参数或静态截图宣称完整复刻通过。原参考 Parkinsans 和大字号按项目规范调整，宿主使用微域生光 Logo，因此没有独立熊猫 Logo 动效。新增页面、照片与文章为原创扩展/主题素材。

原设计、熊猫图形和视频商业再分发许可未完整核实，保持 `listed=false`、`redistributionAllowed=false`，未市场上架。公开 Git 与 ZIP 不构成素材商业授权。未推送主站仓库、未部署服务器，未覆盖其他模板或已有修改。

后续更新在独立工程完成检查、提交、推送，再 bundle、`template:update`、pnpm 更新锁、源码 ZIP 发布及主站构建。回滚时同步恢复 Zenpanda 运行包、快照锁、依赖声明/锁及发布记录；旧 COS 对象保留。

本机隔离主站预览：<http://localhost:43531/templates/zenpanda/site>；这是本地集成验收实例，未部署远端。
