# Unseen 创意工作室模板

参考 `https://unseen.co/`，遵循 `docs/template-replication-guide.md`，接入现有模板市场与设备预览。模板默认中文，品牌统一为微域生光，英文使用 `/en`。

## 入口与范围

- 详情：`/templates/unseen`。
- 中文首页：`/templates/unseen/site`；英文首页：`/templates/unseen/site/en`。
- 栏目：`projects`、`world`、`contact`，以及 `privacy`、`terms` 两篇模板说明。
- 36 个项目使用 `/projects/<id>`，中英文共 84 条实际页面路径。
- iPad：`/templates/unseen/preview?viewport=tablet`。
- H5：`/templates/unseen/preview?viewport=mobile`。
- 仅注册一个响应式官网端，`listed:false`，尚未对外上架。

保留参考站粉色建筑、光线、水面、作品与创意画廊的视觉方向。空间效果由本地预渲染场景和原生 WebGL 折射水面实现；作品采用响应式目录，World 采用可拖拽和缩放的二维画布。完整原站三维引擎、球面画廊及各实验的 WebGL 算法不在本实现内。项目详情提供选编素材与双语解读；政策说明针对本模板行为编写。

## 素材与品牌

- 项目与 World 素材均本地托管，公开图像及视频来源记录在 `public/templates/unseen/asset-sources.json`。
- 场景来源、原始尺寸及改编范围记录在 `source-reference.json`。
- 参考素材的权利归原作者所有，未发现公开商用再分发许可；正式交付前应取得许可或换成已获许可的素材。
- 案例、奖项与参考影像不作为微域生光客户背书，页面保留归属提示。
- 字体复用现有本地 MiSans 与 Poppins，详见 `public/templates/lunera/fonts/README.md`。
- 浅底使用现有 `weiyu-logo-web-dark.svg`，图形 24px，品牌文字 18px。
- 仅使用既有 React、Next.js、Framer Motion；未增加依赖。

## 交互与验收标准

1. 首页、作品、World、联系在 PC 1440×1000、iPad 834×1180、H5 390×844 与 320px 窄屏均无横向溢出。
2. 中文与英文站内路由可用；语言切换保留当前页面、查询参数与锚点。
3. 全屏菜单支持鼠标、触控、Escape 关闭与焦点恢复；导航使用 Next.js 客户端路由。
4. 五类作品筛选计数正确；所有项目详情和下一项目入口可达。
5. World 可拖拽、缩放、重置与方向键移动；无障碍列表包含全部 58 条素材，预览支持关闭与视频播放。
6. 联系类型切换、FAQ、本地表单校验与反馈可操作；表单不发送网络请求或保存输入。
7. 环境音仅用户点击后启用，支持关闭；减少动态效果偏好下水面保持静态。
8. 详情页有三组、每组四张真实页面截图；新标签页预览和设备框内交互可用。
9. TypeScript 与改动文件 ESLint 通过；浏览器无未捕获运行异常、图片加载错误。

## 验证命令

在 `website` 下执行：

```powershell
pnpm exec tsc --noEmit
pnpm exec eslint src/features/site-templates/catalog/unseen src/features/site-templates/registry.ts src/features/site-templates/gallery/selectors.ts src/features/site-templates/components/TemplateMarketSection.tsx src/features/site-templates/workbench/MarketplaceShell.tsx 'src/app/(templates)/templates/page.tsx' 'src/app/(templates)/templates/[id]/[[...slug]]/page.tsx'
node scripts/capture-unseen.mjs
```

浏览器脚本使用本机 Chrome 与 CDP，无额外依赖。通过 `UNSEEN_PREVIEW_URL` 指定服务地址、`CHROME_PATH` 指定 Chrome。脚本生成三端共 12 张真实截图及 `screenshots/verification-report.json`，包含视口、图片、溢出、交互、路由与本次市场入口修正的结果。

2026-10-16 本次验收：TypeScript、改动文件 ESLint 通过；87 项真实浏览器检查、84 条中英文路由、12 张截图全部通过。额外验证了真实鼠标手势启动音频、减少动态偏好下场景静止、设备框内菜单与语言切换，以及全量模板倒序和品牌点击落地路径。

## 动效与滚动体验修订

首版的场景只有轻微横移和条带水纹，菜单与切页以淡入为主；文档根节点缺少滚动条处理。这些实现不足以表达参考站明显的视角跟随和连续动态材质。本轮调整如下：

- 场景使用自主编写的原生 WebGL 材质，增加双轴透视位移、连续折射水面与四组衰减涟漪。移动或点击水面触发扰动；建筑仍为预渲染影像，原站几何模型、完整三维相机与球面 World 尚未重建。
- 标题增加分行入场、反向指针跟随及滚动淡出；作品增加图片滚动视差和错峰入场，服务符号支持悬浮旋转。
- 菜单增加裁切展开、逐项入场和收起过渡，保留焦点恢复与背景锁定；站内页面使用遮罩入场过渡。
- World 条目轻微漂浮，可见的视频自动播放，离屏、后台和减少动态偏好时暂停。
- 将既有 Nubo 的文档滚动条提取为 `shared/PageScrollbar.tsx`，Nubo 保留原配置。Unseen 使用悬浮细滑块，滚动时显示，闲置隐藏，支持拖动、点击轨道、方向键、Home、End、PageUp 和 PageDown。
- 样式通过 `html:has([data-template='unseen'])` 处理文档根滚动条，移除占位白边，离开模板后恢复宿主样式。桌面滚轮平滑插值，触屏、键盘、滑块和嵌套滚动保留原生文档滚动来源。
- 场景离屏或切后台时暂停；减少动态效果偏好会禁用视差、水纹、涟漪、漂浮、预览自动播放和平滑滚轮。开发模式的 `[unseen/scene]` debug 日志记录素材、视口、动态偏好和可见性。渲染或媒体失败明确记录错误。

新增验收：`node scripts/verify-unseen-motion.mjs`。40 项实际浏览器检查通过，包含 GPU uniform 的双向变化、标题反向移动、水面帧变化、真实点击涟漪、菜单中间帧、滑块拖动／键盘／轨道定位、闲置隐藏、390px／320px 原始触屏事件、英文联系页、World 预览及 Nubo 回归。记录见 `motion-verification.json`，对比截图见仓库 `.local/unseen-motion/`。原有 87 项交互、84 条路由和 12 张三端截图亦已重新验证与生成。未新增依赖。

`node scripts/sync-unseen-assets.mjs` 可重新同步参考站项目／World 媒体并记录来源。KTX2 对应的原始图片经 HTTP 状态核对确定格式，所有解析结果明确输出；找不到素材时脚本报错终止。参考 HTML 仅写入仓库 `.local/unseen-pages`，不随网站公开。场景文件是参考时截取的影像，重新取景后应同步更新来源记录并重新运行截图脚本。

生产构建尚未在本任务中运行：项目记录了 Windows standalone 输出限制，且当前开发服务供用户使用；本次以类型检查、ESLint 和真实浏览器运行验收。无数据库、后端、依赖或 schema 改动。

## 页脚排版修订

页脚原先只有随视口变化的横向 padding，缺少最大内容宽度；版权栏使用两端分散的 flex 布局，平板宽度下备案信息还会与悬浮入口重叠。本次增加 1120px 居中内容容器，统一标题、导航和版权分隔线的左右边界；桌面三列导航、手机两列导航，版权与来源信息按屏幕宽度切换布局，并为悬浮入口保留底部空间。

通过本机 Chrome 验证 1920、1440、834、390、320px 的中英文共 10 组布局：内容宽度不超过 1120px、左右留白至少 24px、文字在容器范围内、页面无横向溢出、悬浮入口无文字遮挡，且没有浏览器运行时异常。1440px 下两侧留白均为 160px。检查记录与修改前后截图位于 `website/.local/unseen-footer/`。TypeScript 与页脚组件 ESLint 检查通过。

## 同次市场调整

- 市场左上角图标和品牌文字共用 `/` 链接，返回官网主页，明确无障碍标签。
- `getTemplatesNewestFirst()` 从注册表返回倒序副本，模板市场、相关模板、案例列表及官网模板区共用。当前“最新”以追加到注册表的顺序为准；新增模板继续追加到数组末尾。
