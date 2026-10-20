# 微域生光社媒增长模板

复刻参考站点：<https://viral-sma.framer.website/>

模板包含中文默认路径和英文 `/en` 路径，页面覆盖首页、关于、案例、博客、博客文章、预约通话、隐私政策、服务条款和 404。图片素材已下载到 `website/public/templates/viral/assets/`，来源与内部演示许可记录见 `website/public/templates/viral/sources.json`。

页面只使用仓库已有的 Next.js、React、Tailwind CSS 和 framer-motion 能力；联系表单仅进行浏览器本地校验，不发送或保存数据。

## 首页对照修正

本轮以原站实际浏览器样式和截图为依据，修正首页及共享导航、页脚。内页内容保留既有实现，仅验证运行与共享外壳，尚未逐页按原站重建。

- 根因：样式表多轮覆盖将英文首屏标题从原站的 100px 缩小到 72px；未加载原站字体，且标题继承了宿主字体。服务视频使用裁切放大，评价、FAQ、预约和页脚结构也与原站不一致。
- 修正：合并断点规则，隔离模板字体，下载原站 Inter、Source Serif、Havana、品牌标识和客户 Logo；恢复视频白框、底部渐隐、服务视频径向遮罩、评价视频、居中 FAQ、双卡片预约区和浅色页脚。
- 保留宿主差异：默认中文、英文 `/en`、语言切换、模板市场入口、现有联系表单演示语义。
- 视频切换主动暂停非当前视频，避免隐藏视频持续解码。自动播放失败会输出带视频来源的控制台日志。
- 品牌定制：中英文所有页面、页面标题和市场元数据中的原模板品牌展示统一替换为“微域生光”。共享 `Brand`/`Mark` 组件统一使用宿主已有的 `/logo/weiyu-logo-web-light.svg`；社交平台、客户品牌和功能图标保留自身含义。模板技术 ID、路径与来源记录保持稳定。

## 验收

在 `website` 目录执行：

```powershell
pnpm exec eslint src/features/site-templates/catalog/viral
pnpm exec tsc --noEmit
$env:VIRAL_PREVIEW_URL='http://localhost:3000'
node scripts/verify-viral.mjs
node scripts/capture-viral.mjs
pnpm build
```

`verify-viral.mjs` 验证 1440×1000、834×1180、390×844 的双语首页：英文标题字号为 100/80/48px，无横向溢出、无损坏图片、媒体可解码、视频切换与暂停、FAQ 展开收起、移动菜单展开；另验证八个关联内页的中英文版本及浏览器运行时异常，检查品牌文字、标识和页面标题无旧品牌残留。过程截图和 JSON 报告位于仓库 `artifacts/viral-comparison/`。`capture-viral.mjs` 更新模板市场的十二张中文截图。

最终 ESLint、类型检查、浏览器检查与十二张截图生成通过。生产构建完成编译、类型检查和 35 个静态页面生成，最终 standalone 收集阶段受 Windows 符号链接权限 `EPERM` 阻断，不能视为完整生产打包成功。没有修改构建配置来绕过该限制。

原站视频和品牌条持续运动，截图不能直接作为逐像素相同比较；本轮以区块结构、实测尺寸、文字排版和实际交互验收。
