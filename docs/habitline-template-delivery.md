# Habitline 模板交付与滚动条优化

## 当前状态

最终独立版本 **1.0.3**。已实现参考站九个页面、18 条双语路径，并接入主站共享模板体系。用户追加的原生滚动条优化已实现并在内置浏览器检查。**不能标记“完整复刻验收通过”**：原站全站三端的动效逐帧轨迹、精确速度、拖拽回弹及视频轮播尚未完成完整对照，部分视觉和内容仍有差异。

参考站：<https://habitline-wbs.framer.website/>；依据 `docs/template-replication-guide.md`。原站没有博客，12 张核心截图使用首页、第二版首页、关于、联系四类页面，没有虚构参考站博客。

## 源码与页面

- 独立主维护工程：`D:/code/code-tpl/habitline-template`。
- Git：<https://github.com/weelume/habitline-template/tree/codex/habitline>。
- 分支 `codex/habitline`，最终提交 `f7d006c50b2e5347c301b6fd0f1c6071f22c3177`，普通推送后已核对远端一致。
- 页面：首页、`home-2`、`about`、`waitlist`、`changelog`、`faqs`、`contact`、`legal-pages/privacy-policy`、`legal-pages/terms-conditions`；英文位于 `/en`。
- 采用品牌配置、内容数据、主题变量、共享组件、页面组合与路由分层；主站 `catalog/habitline` 只有 `meta.ts`、`weelume.tsx` 宿主适配。
- 主站注入微域生光品牌、模板市场入口与 `TemplateFiling` 示例备案；独立工程保留 Habitline 自身品牌。
- 194 个公开媒体文件本地托管，包含 8 段视频。来源和权利边界记录于独立工程 `.tpl/docs/ASSETS.json`、`LICENSE.md`；MiSans 400/700 和 Poppins 400/600/700 使用既有字体。
- 表单仅做浏览器校验，不发送、不保存。账户、真实提醒、AI、离线同步、下载和价格均为演示。

## 滚动条与交互

- 页面滚动条 8px，内部区域 6px，圆角灰绿滑块、浅色轨道、橙色悬停与按压色；保留原生滚动机制。
- 主题位于 `scrollbars.css`。`Shell` 挂载时为文档根节点添加专属标记，卸载时恢复之前的状态；避免将根滚动条样式遗留在宿主其他页面。
- Chromium 显式协调标准属性与 WebKit 伪元素，避免标准 `scrollbar-width` 覆盖 8px 自定义尺寸。支持其他浏览器的标准细滚动条；强制颜色模式恢复系统颜色。
- 内置浏览器三端四类页面均读取到 8px，12 个状态无横向溢出；键盘和滚轮已实际操作。原生滑块拖拽尝试未获得可靠验证证据，不能标记为通过。
- 修复滚动条 CSS 展开后的字体导入顺序，避免 MiSans 的 `@import` 排在普通规则之后被丢弃；刷新后的截图均等待字体加载完成。
- 修复宿主全局标题规则覆盖模板字体及字重的问题：在模板主题中显式设置标题继承字体并使用700字重；最终主站实测为 `HabitlinePoppins, MiSans`、700，字体加载完成。
- 已抽样操作手机菜单与切页关闭、场景标签、FAQ、本地表单、月付/年付、语言切换参数与锚点、视频打开/关闭与实际时间推进。
- 页面含首屏错峰入场、浮动玻璃面板、双向习惯带、日程循环、SVG 环形进度、数字滚轮、云层、手机视差等。完整差异和待验收项见独立工程 `.tpl/docs/MOTION.md`。

## 固定包与源码 ZIP

- 固定运行包：`website/vendor/habitline-template-1.0.3-b6f4864f1a27.tgz`。
- SHA256：`b6f4864f1a278eb3e9be8d45c007f3935ddd099bf2210e6fd1bb360e47736b96`。
- 快照提交为上述最终提交，`sourceDirty=false`。配套 `templates/habitline.lock.json`、`package.json`、pnpm 生成的依赖锁一起交付。
- [完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/habitline/1.0.3-f7d006c50b2e5347c301b6fd0f1c6071f22c3177/64715912f6656499837f9bf9ea52c85b5b385ed2be0485b873faff441f5f438c.zip)。
- ZIP 为 50,966,852 字节，SHA256 `64715912f6656499837f9bf9ea52c85b5b385ed2be0485b873faff441f5f438c`。
- 已取得用户对 GitHub 公开仓库和既有 COS 专用目录公开下载的明确授权。使用既有 COS SDK 上传，匿名完整下载后通过 SHA256 与 ZIP 完整性校验，再切换发布清单；旧对象保留。
- 修正复用的 bundle 脚本误取历史归档风险：改为按当前 `package.json` 精确选择版本；已在同时存在历史 1.0.0/1.0.1 包时生成正确 1.0.3 包。

## 构建与验证

所有依赖安装、编译、运行包构建和 ZIP 打包均在本机 WSL Ubuntu 的 Linux 文件系统执行，没有远端构建或服务器部署。

- 独立源码与验收：`/home/xmin/workspace/habitline-20261026/source`。
- 主站隔离验收：`/home/xmin/workspace/habitline-20261026/host/website`。
- Node 24.16.0、pnpm 9.15.4，复用现有库与离线缓存，没有新增第三方库或升级依赖。

| 检查 | 实际结果 |
| --- | --- |
| 独立冻结离线安装 | 通过 |
| 独立 `pnpm typecheck`、`pnpm lint`、`pnpm build` | 通过 |
| 独立 `pnpm test` | 真实生产服务的18条双语路径、404和本地媒体检查通过，测试进程已停止 |
| 协议 `check --require-verified` | 通过；源码摘要 `075ec79078f5316b03bed453fcf64a3336b0f5e27bfb78b5457082eb89ee83b1` |
| 初始三端全部九页双语 | 54个页面状态无横向溢出或损坏图片；滚动条修改后核心12个状态另行复查 |
| 320px 联系页 | 无横向溢出 |
| 滚动条最终三端四页 | 12个状态为8px、字体加载完成、无横向溢出 |
| 独立原视频 | 实际播放，播放时间从0.15秒推进至10.68秒；关闭正常 |
| 主站1.0.3固定包检查、完整类型检查 | 通过 |
| 主站宿主适配 ESLint | 通过 |
| 源码 ZIP 匿名验证、发布清单检查 | 通过 |
| 主站最终1.0.3完整生产构建 | 通过，字体导入顺序警告已消除 |
| 主站实际HTTP | 18条双语路径、详情与手机/iPad预览均200，未知页面404，共22项检查通过 |
| 主站浏览器 | 微域生光品牌、示例备案、8px滚动条、模板字体与700字重正常，无损坏图片或横向溢出；新标签控制台无错误或警告 |
| 样式作用域 | 点击市场入口后专属标记移除，恢复主站10px滚动条；客户端返回模板后恢复8px |
| 设备预览 | 手机iframe为390×844、iPad为834×1180；框内菜单可打开并跳转联系页 |

运行截图、浏览器矩阵及命令日志保存在 `artifacts/habitline/`。12张展示截图按真实像素记录尺寸，没有将截图放大伪造为标准视口；标准 CSS 视口为1440×1000、834×1180、390×844。

主站构建标识为 `Zo5D1cyOLkIpXHVQAm4VV`；构建清单 `.next/build-manifest.json` 的 SHA256 为 `dfc6e8fe83fc608979fb533be5a20c9f293d20dd94dcd0396613b68c8d6b6439`（仅为该清单摘要）。最终本地生产预览：<http://localhost:43570/templates/habitline/site>。既有 `pnpm start` 脚本打印 standalone 启动方式提示，实际页面与资源检查通过；没有据此执行远端部署。

## 限制与回滚

原站全站逐帧动效、自动视频轮播、完整拖拽回弹和系统减少动态效果矩阵仍未验收；部分示意、团队、法律文案及场景内容作了演示适配。公开可访问或已获上传授权不等于素材商业许可，保持 `listed=false`、`redistributionAllowed=false`，未市场上架。

未推送主站仓库、未部署服务器。回滚时一起恢复 Habitline 固定包、快照锁、依赖声明/锁和发布记录，再在本机 WSL 构建；不删除既有 COS 对象。
