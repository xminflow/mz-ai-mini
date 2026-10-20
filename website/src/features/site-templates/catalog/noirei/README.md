# Noirei 湖畔酒店模板

按 `docs/template-replication-guide.md` 接入现有模板体系，参考站为 <https://noirei.framer.website/>。默认中文，英文位于 `/templates/noirei/site/en`。共用一个响应式站点，不重复注册移动站点。

## 页面与结构

- 首页：湖景首屏、日期咨询栏、老宅介绍与数据、横向房型画廊、湖区示意图、体验切换、入住礼遇、旅客感言、日志、分时照片画廊。
- 关于：四段历史、三项待客理念、人物、可持续主题。
- 客房：六种房型、三类筛选、入住权益、FAQ；六个详情包含图集、设施、房价示意与房型咨询。
- 体验：餐饮、水疗、湖区三章与水疗菜单；六个独立详情。
- 入住礼遇：三个独立详情，包含日期、适用夜数和示例条款。
- 日志：精选文章、分类筛选、六篇独立文章与相关阅读。
- 联系：本地校验表单、交通说明、位置摄影和 FAQ。
- 法律说明：隐私及使用条款锚点。

注册表完整列出 28 个页面，两种语言共 56 条路径。详情页复用各自类型的页面组件，内容在 `data.ts` 集中维护。`media.json` 记录参考路径与本地照片的对应关系。

## 设计与交互

暗色底与暖白背景交替，大幅摄影保留参考站叙事顺序。`theme.css` 统一内容宽度、留白、字号与玻璃卡片。背景可铺满视口，正文容器始终保留左右边距。中文 MiSans、英文与数字 Poppins 使用项目已有本地字体；主标题 28–44px，章节 24–36px，文章 26–36px。

根据用户反馈，模板按钮、卡片、文字链接和菜单中不使用右上角装饰箭头；相册保留必要的左右翻页操作。品牌、页脚、浮动入口统一为微域生光 / Weelume。右下角参照 Conicorn / Viral 使用深色圆角品牌按钮，桌面显示 Logo 和品牌文字，手机收起文字并适配安全区，点击进入 `/templates` 模板市场。语言切换保留当前路径、参数和锚点，站内跳转使用 Next Link。

交互包括手机菜单及 Escape、房型/日志筛选、体验切换、礼遇展开、单项 FAQ、原生 dialog 照片灯箱、时段图集和感言切换。Framer Motion 负责滚动入场、菜单与 FAQ；支持减少动态效果设置。图片区的悬浮缩放在主题中统一设置。

首页日期栏将日期、人数和房型带入咨询页；房型、体验和礼遇详情也提供对应预填。咨询和订阅仅做浏览器本地校验，不发送请求、不保存个人信息、不创建预订。成功提示明确说明这一行为，演示未接入酒店后台。

## 素材与权利

`public/templates/noirei/assets/` 保存 80 张本地照片。`sources.json` 记录原始 URL、下载 URL、文件名、SHA-256、页面与字体许可来源。公开的参考照片并不自动获得商用授权，正式交付需取得许可或替换。英文内容为适配后的示例文案，人物、服务、价格、优惠和交通均按演示场景处理。

## 验收与复现

页面滚动条复用共享 `PageScrollbar`，按暖金色主题显示 4px 悬浮滑块，悬停及拖动时加宽；滚动时显示，静止 1.2 秒后淡出。根节点取消原生滚动条预留槽，保持原生 document 滚动，并支持轨道点击、拖动、键盘及触屏；照片灯箱打开时禁用页面滑块。离开模板后自动恢复官网滚动条样式。页脚使用 `TemplateFiling` 固定显示“示例ICP备00000000号”，不链接真实备案查询页。专项验收命令为 `node scripts/verify-template-scrollbars.mjs`，截图脚本检查三端无预留白边。

在 `website/` 执行：

```powershell
pnpm exec tsc --noEmit
pnpm exec eslint src/features/site-templates/catalog/noirei src/features/site-templates/registry.ts scripts/capture-noirei.mjs scripts/verify-noirei.mjs scripts/sync-noirei-assets.mjs scripts/inspect-noirei.mjs
node scripts/verify-noirei.mjs
node scripts/capture-noirei.mjs
```

浏览器脚本使用仓库已有 Chrome CDP 工具，不新增依赖。默认地址 `http://localhost:3000`，可用 `TEMPLATE_ORIGIN` 指定验证服务。完整验证覆盖 1440×1000、834×1180、390×844 和 320×844 的中英文全部页面，共 224 个组合，并检查图片、单一主标题、字体、导航裁切、容器边距和横向溢出。交互验收另外检查客户端导航、语言状态、筛选、表单、灯箱、模板市场新标签页入口和设备预览。页面报告保存于 `artifacts/noirei-verification/report.json`。仅复查交互可设置 `NOIREI_INTERACTIONS_ONLY=1`，此时报告单独保存于 `interactions.json`，保留完整页面验收记录。

12 张 WebP 真实页面截图覆盖首页、客房筛选、日志和联系页，各有 PC / iPad / H5 三档；尺寸与设备记录于 `meta.ts`，供现有详情画廊使用。截图只排除开发环境的 Next.js 调试浮层，不修改页面内容。设计更新后运行截图脚本同步刷新。

本次不涉及数据库迁移、第三方预订系统或生产部署。主要交付边界为图片商用权及真实酒店服务接口尚未接入。

## 本次验证结果

已通过 TypeScript、模板及相关脚本 ESLint、224 个页面组合、9 组真实浏览器交互，80 张本地照片解码成功，12 张截图尺寸符合规范。开发服务日志中的既有 Webpack 缓存写入警告未影响本次页面与交互验收；本次未改动构建缓存配置。

