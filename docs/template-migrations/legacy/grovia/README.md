# 微域生光 · 团队增长模板

参考站：[Grovia](https://grovia.framer.ai/)。复刻约定参考 [整站模板复刻规范](../../../../../../docs/template-replication-guide.md) 与 Lunera 的现有实现。独立接入模板注册表，`listed: false`，在模板市场内预览，尚未发布到对外案例页。

## 页面与入口

- 详情：`/templates/grovia`
- 中文整站：`/templates/grovia/site`
- 英文整站：`/templates/grovia/site/en`
- iPad：`/templates/grovia/preview?viewport=tablet`
- H5：`/templates/grovia/preview?viewport=mobile`

覆盖参考站 sitemap 的全部 10 页：首页、关于、案例列表、设计系统，以及 Pluto、VitaHealth、BoxMedia、NovaTech、NaviAI、Lumora 六篇完整案例。对应相对路径为 `/`、`/about`、`/case-studies`、`/design-system`、`/case-studies/{slug}`。源站没有单独的博客、政策与联系页面；功能、价格、FAQ 和联系表单位于首页。

业务为团队增长、战略咨询与运营协作。品牌统一为微域生光 / Weelume，使用项目现有深浅 Logo 和固定的模板占位备案号。根据本次用户修正，页脚标语为「让团队成长更有方向 / Give your team a clearer path to growth」。其余财务类表述仅保留案例行业背景和 CFO 职位。右下角为模板市场入口，移动端仅显示 Logo。

## 设计与适配

- 保留暖灰底、黑黄配色、浮动客户卡、统计图表及参考站内容顺序；卡片按项目规范重新设计为玻璃质感。
- 复用本地 MiSans 400/700 与 Poppins 400/600/700。字体声明与滚动显现组件抽到 `shared/`，供 Grovia 与 Lunera 共用，无新增 npm 依赖。MiSans 声明由构建工具内联，避免合并 CSS 后中途出现的浏览器 `@import` 被忽略。
- 首屏标题 28–44px，章节 24–36px，正文 16–17px、约 1.8 行高。导航品牌 18px、Logo 24px、操作按钮 36px，收起高度 54px；标题按语义分行并省略行尾标点。
- PC 1440×1000、iPad 834×1180、H5 390×844，补测 320px。平板调整为双列与折叠菜单，手机改为单列、触控布局及安全区间距，小程序未纳入本次范围。
- 中英文覆盖正文、案例、表单提示、菜单、无障碍名称与 DOM 看板示意；语言切换保留对应页面、查询参数和锚点。站内使用 Next 客户端路由。
- 使用现有 Framer Motion 实现滚动入场、卡片悬浮、图表、按钮、标签切换、菜单与 FAQ，尊重系统减少动态效果设置。
- PC 在新标签页直接打开整站；iPad/H5 新标签页使用现有设备框，iframe 保持真实 CSS 视口并支持整站交互。

## 内容与素材

- `data.ts`、`cases.ts`：有类型约束的双语展示内容；`components/`：页面、导航、表单与双语看板；`pages/`：按需加载入口；`theme.css`：模板隔离样式与 `--tpl-gv-*` 令牌。
- 联系和订阅表单仅做本地必填、邮箱与长度校验，显示尚未发送或保存；debug 日志仅记录表单类型、校验状态和保存状态。真实接收接口尚待接入。
- 团队、评价、合作伙伴、统计、案例和价格均用于模板演示。参考站起步套餐为 $24，成长版 $49、规模版 $99 及部分关于页统计为补充演示值。购买、账户连接和工具集成未接入真实服务。
- 69 张参考图片已转为本地 WebP，最长边不超过 1600px，总计约 3MB。原始页面及内容快照见 `source-reference.json`；素材 URL 与尺寸见 `public/templates/grovia/sources.json`。
- 图片记录的是来源，逐项商业使用许可尚待核实。MiSans 使用小米字体许可协议；Poppins 使用 SIL OFL，复用字体的声明和许可见 `public/templates/lunera/fonts/README.md` 及 `Poppins-OFL.txt`。

## 验证与截图更新

在 `website/` 执行：

```powershell
pnpm exec tsc --noEmit --incremental false
pnpm exec eslint src/features/site-templates/catalog/grovia src/features/site-templates/shared src/features/site-templates/catalog/lunera/components/Motion.tsx src/features/site-templates/registry.ts
node --check scripts/capture-grovia.mjs
py -3 -m py_compile scripts/sync-grovia-assets.py
node scripts/capture-grovia.mjs
```

素材同步脚本为 `py -3 scripts/sync-grovia-assets.py`，依赖本机已有 Pillow；截图脚本使用 Node 22 内置 WebSocket 与本机 Chrome，可通过 `CHROME_PATH` 指定浏览器、`GROVIA_PREVIEW_URL` 指定已启动服务，无需额外 npm 包。

截图共 12 张，按三端分别覆盖首页、功能、案例和联系区，保存在 `public/templates/grovia/screenshots/`。生成时等待实际字体与图片加载、启用减少动态效果，校验截图宽高、图片、溢出、MiSans 两档真实加载及页脚文案；结果记录于 `capture-report.json`。修改设计后重新执行截图命令。

浏览器验收覆盖 10 页 × 中英文 × PC/iPad/H5/320px 共 80 次加载，检查单 H1、无横向溢出、图片完整、标题标点、备案、语言、实际字体与页脚标语，逐页结果见 [verification.json](verification.json)。另验四项功能标签、键盘切换、三种套餐、FAQ 单项展开/收起、手机菜单与 Escape、表单无效/有效校验、语言切换保持文档，以及三端新标签预览、设备框内导航与操作。Lunera 联系页回归确认中文字体 400/700 加载正常。

验证环境为本地开发服务；生产构建、部署和真实业务接口尚未验收。

