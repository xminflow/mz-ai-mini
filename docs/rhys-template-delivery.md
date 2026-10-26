# Rhys 模板复刻交付

日期：2026-10-26（Asia/Shanghai）。参考站：<https://rhys1.framer.website/>。依据 `docs/template-replication-guide.md` 与独立模板协议 0.2.0 实施，原站观察及页面验收均使用内置浏览器。

## 交付范围

独立工程：`D:/code/code-tpl/rhys-template/`，React、Next.js、TypeScript strict、framer-motion，沿用现有运行库。通用代码按品牌配置、内容、主题、公共组件、页面、路由拆分；主站 `catalog/rhys/` 仅保存注册、品牌注入和宿主根滚动容器适配。

原站包括首页、作品列表、8 个作品详情、探索、随笔列表、6 篇文章、关于页，联系为共享页面锚点。另按规范增加隐私与条款，共 21 页、42 条中英文路由；默认中文，英文 `/en`，切换保持对应页面、查询参数与锚点。Fieldstone 的原始 Unicode slug 规范化为 `fieldstone-eval-workspace`，适配既有路由合同。

保留原站 6 个 MP4、GIF、图片与品牌展示素材并本地托管，来源及权利限制见独立工程 `.tpl/docs/ASSETS.json` 和 `LICENSE.md`。字体按文档使用 MiSans 400/700、Poppins 400/600/700；中文首屏标题 28–44px。主站注入微域生光 / Weelume、已有 Logo、市场入口和共享 `TemplateFiling` 示例备案。简历与模板下载为本地演示提示，没有提交表单或真实发送。

## 动效与交互

- 首屏徽章 12 秒线性旋转、拖动回弹；五张彩色卡片错峰弹簧入场、扇形布局、滚动位移/旋转，手机叠放。
- 区块 80px 位移、透明度与弹簧入场，实验卡片带 rotateX；封面悬浮缩放、按钮按压、评价标题分词与桌面 sticky。
- 照片轮播自动/手动切换、圆点、拖拽、聚焦/悬停暂停；随笔横向滚动与前后切换；品牌和探索循环带。
- 实际 MP4/GIF 动态素材，视频按可见性播放与暂停，减少动态效果时提供手动控制。
- 菜单高度动画、错峰项、背景锁定与 Escape 焦点恢复；FAQ 高度过渡；作品加载更多 6→8。
- 页脚圆贴纸按折线裁切、背面镜像、拖动揭开与弹簧回弹，提供键盘等价操作。

动效入口与原站参数记录在独立工程 `.tpl/docs/MOTION.md`。不以静态截图作为全部动效已还原的证明。

## 独立验证

实际依赖安装、编译、构建验收与打包均位于本地 WSL Linux 文件系统：`/home/xmin/workspace/rhys-20261026/rhys-template` 和 `rhys-delivery`，Node 24.16.0、pnpm 9.15.4；未在远端服务器构建。

- `pnpm install --frozen-lockfile`、`pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 通过。
- 测试核对全部双语数据、正文素材、15 项创意实验，以及挂载路由和语言参数保留。
- 独立生产候选 42 条路由 HTTP 200，验收后停止自有健康检查进程。
- 21 页 × 2 种语言 × 1440/834/390/320，共 168 组真实浏览器检查，无横向溢出、已加载损坏图片或主标题数量异常。
- 三端采样入场初态与运行态、徽章角度、视频时间、轮播第三张和循环轨道聚焦暂停。平板最外侧视频离屏暂停，中央可见视频正常播放。
- FAQ、下载提示、菜单焦点与滚动锁、语言查询/锚点保留通过。手机加载更多实际滚动后鼠标点击与键盘操作均为 8 项；自动滚动未结束时的过早点击误命中，按真实操作复核。
- 独立协议严格验收在 Windows 工作树和 Linux Git 克隆均通过，源码摘要 `0c4fd8eb5ecfb30aeb25666500c7ce3e8daed0970bad7e536306e98d38d620cf`。

三端各交付首页、作品、随笔、联系四张，共 12 张真实截图。浏览器实际输出 JPEG，经过解码后无缩放转为 WebP，按真实像素登记：

| 设备 | CSS 视口 | 截图真实像素 |
| --- | --- | --- |
| PC | 1440×1000 | 1430×993 |
| iPad | 834×1180 | 824×1166 |
| H5 | 390×844 | 380×822 |

证据在独立工程 `.tpl/reports/`，主站侧与过程日志在本工程 `artifacts/rhys/`。

## 问题修复

首轮生产构建发现路由函数从客户端组件导出后被服务端调用，已提取为普通 `routing.ts` 模块，后续生产构建通过。

主站开发模式发现贴纸初始 `clip-path` 与矩阵浮点精度被浏览器 CSS 序列化压缩，引发 hydration 属性不一致。1.0.1 改为稳定初态，翻折几何仅在交互后输出；修正后主站源码候选控制台复验无 hydration 错误。宿主根滚动容器的定位上下文与滚动条样式单独保留在 `host.css`，离开模板自动失效。

最终视觉复查发现拖拽卡片拆层后，外层残留旧背景，导致旋转卡片后方露出矩形色块。1.0.2 移除重复外层背景，三端逐项读取五个外层均为透明、无横向溢出，更新三张首页截图，并重跑独立类型、lint、测试、构建和 42 条生产路由。

## Git、固定包与 ZIP

Git：<https://github.com/weelume/rhys-template>，分支 `main`，提交 `d7a544b84b46a25aeeeb8e24a863ff99b15f0b81`，已正常推送并核对远端一致，未强推。真实地址同时登记于 `.tpl/template.json`、主站适配及两个仓库清单文件。

版本 1.0.2 固定包：`website/vendor/rhys-template-1.0.2-071ad7177547.tgz`，SHA256 `071ad717754766c919d879488e31ae9b06cd03fd077635aab657a79202a5752e`。包来源为干净本地 Git 克隆，主站模板锁、依赖声明和 pnpm 锁同步交付。生产不读取本机源码路径。

本地完整源码 ZIP：`artifacts/rhys/rhys-1.0.2-d7a544b84b46a25aeeeb8e24a863ff99b15f0b81.zip`，33,579,628 字节，SHA256 `de2fc0827c4fbe38dfccde1f671fee6e42841bb3df605ea0c08e361736c2ce9c`。仅包含已提交源码，已通过本地 ZIP 完整性检查。

用户已明确批准上述 1.0.2 具体载荷。复用既有 COS SDK 完成上传、匿名完整下载、SHA256 与 ZIP CRC 验证后，更新了 `website/templates/releases.json`。长期[完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/rhys/1.0.2-d7a544b84b46a25aeeeb8e24a863ff99b15f0b81/de2fc0827c4fbe38dfccde1f671fee6e42841bb3df605ea0c08e361736c2ce9c.zip)。旧对象保留，没有部署主站。

Rhys 定向发布一致性校验及最终全局 ZIP 发布检查均通过，源码提交、生产快照与公开 ZIP 一致。此前其他模板接入中的发布阻塞已解除。

## 主站验证与限制

主站 WSL 验收工程：`/home/xmin/workspace/rhys-20261026/website`。冻结安装、`template:check --id rhys`、Rhys 宿主适配 ESLint 通过，目录生成通过；24 组三端双语挂载检查中品牌、市场链接、示例备案、素材和溢出均正常。最终固定包三端贴纸初态、揭开终态与控制台复查通过，无 hydration 错误或滚动测量警告。

1.0.2 在重新启动的主站固定包候选中额外完成 6 组三端双语首页复验：五个卡片外层均透明、无横向溢出、市场入口正确，控制台无错误或警告。证据为 `artifacts/rhys/host-102-regression.json`，最终主站画面为 `host-final.jpg`。

快速导航后立即采样曾出现英文页面宽度异常；等待对应页面入场完成后重新测量，24 组全部无溢出。原始采样与终态结果分别保留在 `artifacts/rhys/host-final-browser.json` 和 `host-settled-browser.json`，不将过早测量当作已确认的布局缺陷。

首轮主站完整检查曾受 Goalz 依赖与 Hydrowell 未使用导入阻塞。2026-10-26 主站接入复验时，这些并行任务的更新已到位；在本地 WSL `/home/xmin/workspace/rhys-20261026/website` 同步当前主站源码后，冻结离线安装、`pnpm exec tsc --noEmit`、注册表与 Rhys 适配 ESLint、`WEBSITE_BUILD_DIR=.next-rhys pnpm build` 全部通过，未跳过类型或 lint 检查。构建仍有 playbook 既有无效 eslint-disable 与 webpack 大字符串缓存警告。日志位于 `artifacts/rhys/main-integration/`。

## 实际运行主站接入复验

实际运行的本地主站为 `http://localhost:3000/`，运行目录 `/home/xmin/workspace/weelume-dev-20261025/website`。此前 Rhys 虽已注册，但注册表位置靠前，首页倒序且首批仅显示 9 项，导致入口被藏在后面。本轮仅将 Rhys 追加到注册表末尾，保持其他模板的相对顺序，并对运行副本做相同定向更新；原注册表备份在 `artifacts/rhys/main-integration/runtime-registry-before.ts`。没有覆盖其他模板并行更新。

内置浏览器实测首页首批已展示 Rhys，详情页 21 个页面、PC/iPad/H5 截图与预览入口正常，点击在线预览可打开真实新标签页。中文和英文首页无横向溢出、损坏图片，模板市场返回入口及示例备案正常，预览控制台无错误或警告。截图为该目录的 `home.jpg`、`detail.jpg`、`site-zh.jpg` 和 `site-en.jpg`。WorkBuddy 说明入口按主站现有规则要求登录，未登录后的提示词界面本轮未验证。

运行副本 `template:check --id rhys` 与 Rhys 定向源码 ZIP/生产快照一致性校验通过；该副本全局 `template:release:check` 仍报告 `goalz: 源码 ZIP 尚未发布`，属于运行副本其他模板的发布记录缺失，本轮未替其发布或绕过检查。Rhys 继续使用已授权、已验证的 1.0.2 ZIP，无需重新打包上传。本轮未部署线上主站，也未推送主站仓库。

仍有以下限制：

1. 原站全部页面、三端的动效尚未逐项逐帧对照；页面转场、贴纸光影/几何、原始轮播间隔与拖拽速度曲线未完整核对，不标记为所有动效逐像素一致。
2. 系统减少动态效果实际模拟、触控惯性和滚动条滑块拖动未完整验证。
3. 中文正文为本地化整理，非逐句等长翻译；原站 Fieldstone 案例正文与结尾协作清单指标不一致，英文保留，中文注明。
4. 素材商业再分发许可未确认，保持 `listed=false`、`redistributionAllowed=false`。公开源码不等于素材商业授权。
5. 未提交或推送主站仓库，未部署官网或市场上架。
