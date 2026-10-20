# Tabfolio Pro 模板

参考来源：<https://tabfoliopro.framer.ai/>

本模板按项目、实验、关于、简历、案例详情、联系和政策页面拆分，图片和封面资源使用 `public/templates/tabfolio/assets/` 下的本地 PNG、JPEG、AVIF 与 SVG，页面不依赖远程图片或字体。首页布局参考源站 1440px 桌面端的 1152px 内容边界、564×423 项目卡片和居中导航胶囊，并提供中文默认页与 `/en` 英文页。

## 设计对齐（2026-10-19）

对比源站 1440、834、390px 的项目、实验、关于、简历页面，修正了以下偏差：

- 原英文字体和全局标题字体覆盖改变了文字宽度，介绍多出一行，首屏卡片下移。英文改用源站的本地 Manrope 500 / 600 / 700，显式隔离全局标题字体与字形设置；中文保留 MiSans。
- 渐变背景原来在 320px 高度截断，现改为带纵向和斜向遮罩的连续淡出。
- 断点改为与源站一致的 1280 / 810px。平板保留胶囊导航、双列项目和三列实验；手机在头像上方展示胶囊导航，语言切换单独放置。
- 修正实验媒体随列宽缩放的比例、项目卡片标题和元信息、按钮尺寸、页脚头像和列布局。项目卡片复用 Next Link，避免进入详情时整页刷新。
- 关于页从错误的木屋图片改为已有的人像源素材，并对齐裁切位置、标题、正文宽度和预约按钮。

字体来源记录在 `public/templates/tabfolio/source-reference.json`，许可证位于 `fonts/OFL.txt`，未新增 npm 依赖。

## 验收

在 `website/` 下执行：

```powershell
pnpm exec tsc --noEmit
pnpm exec eslint src/features/site-templates/catalog/tabfolio/components/Shell.tsx src/features/site-templates/catalog/tabfolio/pages/HomePage.tsx src/features/site-templates/catalog/tabfolio/pages/AboutPage.tsx
node scripts/verify-tabfolio.mjs
node scripts/capture-tabfolio.mjs
```

浏览器检查覆盖 1440 / 834 / 390 / 320px、中英文及全部 11 条页面路由，验证导航可见、无横向溢出、图片加载、标题字体，以及客户端导航、案例跳转、联系演示表单校验。桌面首页额外校验 564×423 卡片和约 346.4px 的纵向起点。报告保存在 `artifacts/tabfolio-alignment/verification.json`。

`inspect-tabfolio.mjs` 可重新采集源站与本地四个核心页面的浏览器几何数据和截图；传 `--local` 只采集修改后的本地页面。截图保存在 `artifacts/tabfolio-alignment/`，模板市场使用的 12 张三端截图由 `capture-tabfolio.mjs` 更新。

边界：本次校准核心页面及共享外壳；案例正文未逐段做源站视觉比对。顶部光效使用 CSS 渐变近似源站画布光效，现有项目封面仍为静态图片，关于页圆点仍为展示元素。联系页仅做本地演示校验。
