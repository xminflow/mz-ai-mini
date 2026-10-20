# Foldex 模板交付记录

## 完成内容

- 参考站：https://foldex.framer.website/；按站点地图覆盖 13 页：主页、作品总览、品牌、网站、摄影、印刷、数字插画、艺术、报价、评价、关于、联系、404。原站没有博客、文章或政策页面，未添加无来源页面；截图以作品总览和品牌分类覆盖内容展示。
- 独立 Git 工程：`D:/code/code-tpl/foldex-template/`。通用品牌配置、双语内容、主题变量、公共组件、页面组合和路由分层维护；46 项作品、64 个原站图片与装饰素材本地托管。MiSans 400/700、Poppins 400/600/700 及其来源说明随工程保存。
- 主站 `catalog/foldex/` 仅保留宿主适配。主站注入微域生光品牌、深浅 Logo、模板市场入口和 `TemplateFiling` 示例备案。独立工程不保存主站品牌或接入记录。
- 默认中文，英文位于端路径后的 `/en`。站内使用 Next Link；语言切换保留对应页面、查询和锚点。手机菜单、作品灯箱、方向键、Escape、焦点返回、演示表单本地校验已实现。
- 米色方格纸、固定侧栏、照片叠放和回形针素材保留原站视觉特征；卡片采用集中管理的半透明玻璃主题，手机隐藏侧栏、平板双列、桌面三列分类。
- 已生成 12 张真实 WebP 截图：PC 1440×1000、iPad 834×1180、H5 390×844，每端包含主页、作品总览、品牌分类、联系页。截图由浏览器指定精确区域采集，未拉伸；尺寸已逐张解码核对。
- 新模板维持 `listed: false`。没有创建远端、提交、推送、部署或公开上架。

## 主站入口与维护

- 详情：`/templates/foldex`。
- 中文：`/templates/foldex/site`；英文：`/templates/foldex/site/en`。
- 模拟器：`/templates/foldex/preview?viewport=tablet` 或 `viewport=mobile`。
- 开发：在 `website` 执行 `pnpm template:local --id foldex D:/code/code-tpl/foldex-template`，随后 `pnpm dev`。本机 `foldex.local` 已忽略；开发直接引用独立源码并监听运行素材与截图。
- 生产只读取 `vendor` 中的固定包；版本与 SHA256 见 `website/templates/foldex.lock.json`，依赖声明与 `pnpm-lock.yaml` 已由包管理器更新。后续更新须在独立工程 bundle，再通过 `template:update --id foldex`、`pnpm install`、`template:check --id foldex` 和构建更新生产快照。

## 已执行验证

| 验证 | 结果 |
| --- | --- |
| 独立工程 `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` | 通过；精确命令、时间、退出码及源码摘要见独立工程 `.tpl/reports/verification.json` |
| 独立生产服务 `node scripts/next.mjs start` | HTTP 200；验收报告使用隔离端口验证并停止本次服务 |
| 独立生产页面：13 页 × 中英 × 1440/834/390/320px | 104 组通过；无横向溢出、无已加载图片破损；控制台无错误或警告 |
| 独立交互 | 8 项通过：菜单 Escape、站内导航、语言保留查询锚点、无效与有效表单、灯箱下一项/方向键/Escape |
| 主站 `pnpm exec tsc --noEmit` | 通过；并行 Cerno 依赖完成后重新检查，无 Foldex 或其他类型错误 |
| 主站改动文件 ESLint | 通过：`catalog/foldex`、`registry.ts`、`next.config.ts` |
| `pnpm template:check --id foldex` | 通过；固定包、安装版本、依赖路径及 SHA256 一致 |
| 主站页面：13 页 × 中英 × 1440/834/390/320px | 104 组通过，无横向溢出及已加载破图；浏览器未报告警告或错误 |
| 主站截图画廊与模拟器 | 9 项通过：三端四张画廊、切图、新标签页 H5 预览、390×844 与 834×1180 iframe、iframe 内菜单与语言切换 |
| 主站品牌与备案 | 实际页面显示微域生光/Weelume、市场入口与示例备案；市场按钮链接为 `/templates` |
| 主站完整 `pnpm build` | 编译、类型检查、35 页生成通过；最后 standalone 文件追踪复制因 Windows `EPERM symlink` 失败，不能声明完整生产构建通过 |

浏览器证据在 `artifacts/foldex/`：`browser-pages.json`、`browser-interactions.json`、`host-browser-pages.json`、`host-browser-interactions.json`，以及精确尺寸的独立页和主站首页截图。

## 已知限制与后续事项

1. 用户确认 Git 远端尚未配置；`.tpl/template.json` 的 `gitUrl` 明确为 `null`。完整协议检查因此失败，不满足市场导入合同；应用检查通过不等于协议验收或发布通过。获得真实仓库地址后填写并重新执行格式检查，不生成猜测链接。
2. 原站设计与图片的再分发授权未确认，素材已记录原始 URL，许可声明为 restricted、不可再分发。商业分发前须取得授权或替换相关素材。
3. 主站 Windows standalone 打包受符号链接权限限制。未修改主站既有部署配置；需要在允许创建符号链接的环境或既有 Linux 构建环境执行完整构建，再核实部署包。
4. 减少动态效果分支已实现并代码核查；当前浏览器工具没有媒体偏好切换能力，未实际模拟该偏好。离屏懒加载图片未全部滚动逐张验收，全部本地素材存在性已检查。
5. 联系表单为演示，只执行浏览器本地校验，不发邮件、不保存内容。没有新增后端、数据库或外部服务；无需数据迁移。
