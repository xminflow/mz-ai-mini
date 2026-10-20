# Recueil 香氛订阅模板

按 `docs/template-replication-guide.md` 接入现有模板体系，参考 <https://recueil.framer.website/>。本地入口 `/templates/recueil/site`，英文入口 `/templates/recueil/site/en`，模板详情 `/templates/recueil`。

## 页面与设计

参考站是单页产品服务站，全部站内页面为首页、`privacy-policy`、`404`。本模板对应注册三个页面，双语共六条路径。首页保留香水视频首屏、四组数据、品牌宣言、三款香氛、玻璃质感细节拼贴、六种原料、两段故事、三步流程、三种方案、五项 FAQ、编辑灵感条和联系订阅区。原站无独立博客或联系页，因此三端各四张截图对应首页、香氛库、故事及联系订阅区，不虚构额外业务栏目。

蓝紫色背景、浅蓝按钮、艺术香水图像与半透明玻璃卡片保持参考站视觉方向。主题集中管理容器、左右留白、字号和断点，正文保持 16–17px / 1.8 行高，主标题 28–44px，章节标题 24–36px，隐私文章标题 28–36px。字体复用本地 MiSans 400/700 与 Poppins 400/600/700，标题显式继承模板字体，避免受官网全局标题字体影响。

导航、页脚及右下角统一微域生光 / Weelume 品牌。固定品牌入口为深色圆角矩形，桌面包含 24px Logo 和文字，手机收起文字并保留 22px Logo、42px 触控高度及安全区；Next Link 跳转 `/templates`。模板内不使用右上角装饰箭头，页脚复用模板占位备案组件 `TemplateFiling`。

## 交互与数据边界

- 所有站内页面和导航使用 Next Link；语言切换停留对应页面，保留参数、锚点与客户端会话。
- 手机菜单支持 Escape、焦点循环；原料支持点击、方向键、Home/End；FAQ 单项展开。
- 三种方案打开原生 dialog，支持 Escape、关闭后恢复按钮焦点。表单挂载后再聚焦，避免切换方案时焦点落在旧输入框。
- 姓名、邮箱、确认项只做本地校验；方案和邮件表单不发起 POST，不保存本地存储，不创建订单、订阅或扣款。错误及成功提示均双语，页面与隐私说明明确演示状态。
- Framer Motion 负责入场、滚动、悬浮、菜单、FAQ 与原料淡入。系统开启减少动态效果时，视频暂停并使用静态海报，CSS 停止动效。浏览器不允许自动播放时保留海报，并输出带 `[recueil]` 上下文的 debug 信息。
- 人物故事、品牌服务、数据及欧元方案为示意，隐私说明按模板真实数据流重写，不冒用参考品牌的主体、邮箱、供应商或运营承诺。

## 本地素材

`public/templates/recueil/sources.json` 记录参考源、素材 URL、文件字节数、SHA256、本地字体来源及许可说明。18 个原始下载保留核验，使用环境已有 FFmpeg 派生 16 张 WebP 和一个 1440px H.264 视频，共 35 个素材记录；页面使用派生资源。首屏视频由 16,505,161 字节降至 1,474,205 字节，保留 faststart 与无声循环。同步脚本依赖环境现有 FFmpeg，不新增 npm 依赖。

公开可访问不等于取得商业再分发授权。参考图片与视频仅供内部演示，商业发布或交付前须取得授权或替换。

## 验收与复现

页面滚动条复用共享 `PageScrollbar`，按半透明白色主题显示 4px 悬浮滑块，悬停及拖动时加宽；滚动时显示，静止 1.2 秒后淡出。根节点取消原生滚动条预留槽，保持 document 滚动，并支持轨道点击、拖动、键盘及触屏；方案弹窗打开时禁用页面滑块。离开模板自动恢复官网滚动条样式。专项验收命令为 `node scripts/verify-template-scrollbars.mjs`；截图脚本检查三端无预留白边。

在 `website/` 执行：

```powershell
pnpm exec tsc --noEmit
pnpm exec eslint src/features/site-templates/catalog/recueil src/features/site-templates/registry.ts scripts/inspect-recueil.mjs scripts/sync-recueil-assets.mjs scripts/capture-recueil.mjs scripts/verify-recueil.mjs
node scripts/verify-recueil.mjs
node scripts/capture-recueil.mjs
```

参考抓取与素材同步：`node scripts/inspect-recueil.mjs`、`node scripts/sync-recueil-assets.mjs`。原始参考证据位于 `artifacts/recueil-reference/`。

已通过类型检查和上述 ESLint。浏览器验收报告 `artifacts/recueil-verification/report.json` 包含 1440×1000、834×1180、390×844、320×844，三个页面 × 两种语言，共 24 组检查：标题、字体、图片、导航裁切、横向溢出、正文边距与品牌按钮。九组交互覆盖菜单、原料键盘操作、FAQ、方案弹窗及表单、双向语言与路由、视频减少动态效果、市场入口和新标签页、iPad/H5 真实 iframe 视口、35 个本地素材 SHA256。浏览器错误为零。

12 张真实截图已登记设备与宽高，位于 `public/templates/recueil/screenshots/`，由现有详情画廊展示。仅验证开发服务，未执行生产构建或部署；本次不涉及后端、数据库或迁移。


## 2026-10-20 颜色还原校正

重新采集源站主题令牌和浏览器计算样式。此前只保留了蓝紫视觉方向，正文使用偏蓝的高亮色，所有玻璃卡片套同一个低透明度渐变，主推方案也被替换成亮蓝白，导致区块层次与源站不符。本次只调整主题颜色、渐变、边框与阴影，保留项目既有字号、字体、布局和品牌适配。

| 语义 | 源站采样及本地主题 |
| --- | --- |
| 页面底色 | `#2a3f6a` |
| 深色文字、方案底色 | `#192750` |
| 原料选中态、图片标签 | `#364972`，图片标签透明度 60% |
| 标题、首屏正文 | 白色 |
| 普通正文、辅助文字 | 白色 50%；次级信息白色 70% |
| 主按钮 | `#bae6fd` |
| 高光 | `#5978a0` → 透明蓝；香氛卡片光源从右、中、左分别进入 |
| 主推方案 | 径向渐变 `#b9b1c7` → `#a29aad` |
| 香氛扇形图底色 | `#8c8696` → `#364972` |
| 细边框 | 白色 12% |

验收标准：桌面和手机实际计算色值符合上述映射；三端无溢出、无损坏图片；双语三个页面、菜单、原料、FAQ、方案弹窗和语言切换不回归；模板市场 12 张截图同步更新。参考采样、桌面/手机六个区块截图及颜色断言脚本保存在 `artifacts/recueil-colors/`（仓库根目录）。

复现：在仓库根目录运行 `node artifacts/recueil-colors/verify.mjs`，在 `website/` 运行前述类型、lint、交互及截图命令。仅完成本地开发环境验收，未部署；本次未更换项目字体或字号，因此排版仍保留主站模板规范的有意差异。

本轮结果：类型检查、模板 ESLint、1440/390 颜色断言及六个区块截图、原料切换、FAQ、方案弹窗开关、手机菜单通过，颜色专项报告 `artifacts/recueil-colors/colors-report.json` 浏览器错误为零；三端 12 张市场截图已刷新，无溢出、无损坏图片。完整 `verify-recueil.mjs` 跨页回归多次因开发编译超时中断，本轮不计为完整通过。开发服务还出现过主站模块编译错误与 `.next` 清单缺失，未修改无关页面。最终专项使用临时 3015 服务和独立缓存，验证后关闭服务并移除自动生成的临时类型配置引用。

如默认服务不稳定，可在仓库根目录运行 `node artifacts/recueil-colors/server.mjs`，另一个 PowerShell 窗口设置 `$env:TEMPLATE_ORIGIN='http://127.0.0.1:3015'` 后运行颜色专项脚本；首次编译需先预热页面。
