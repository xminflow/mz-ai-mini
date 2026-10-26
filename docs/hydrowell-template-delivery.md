# Hydrowell 模板交付记录

日期：2026-10-26。参考站：https://hydrowell.framer.website/ 。观察、素材下载和交互验证使用 Codex 内置浏览器。

## 交付内容

- 独立工程：`D:/code/code-tpl/hydrowell-template`；主站仅保留 `catalog/hydrowell/meta.ts` 与 `weelume.tsx` 宿主适配，业务源码由固定共享包提供。
- 9 页、18 条中英文路由：首页、服务、博客、三篇文章、联系、隐私政策、使用条款。原站存在首页与两张政策页，其余为按复刻规范补充的演示内容。
- 图片与字体本地托管，33 张原站图片记录来源、真实 MIME 和摘要；中文 MiSans 400/700，英文 Poppins 400/600/700。
- 逐字/逐词模糊入场、区块入场、滚动视差、统计、服务悬停、折叠切图、前后对比滑块、循环评价、价格、FAQ、视频浮层及移动菜单。
- 主站注入微域生光品牌、市场入口及示例备案。表单仅本地校验，不发送或保存。

## 可追溯版本

- 版本：`1.0.1`。
- Git：https://github.com/weelume/hydrowell-template ，分支 `main`。
- 提交：`14f42dbe25dc6796de8cd8d2c1ed00fb8d5a3891`，已推送并验证远端一致。
- 源码摘要：`ced460f04269cfcb58ba12ce6fcabe556195122be79fbd8ac4411c3bf600b8d1`。
- 主站包：`website/vendor/hydrowell-template-1.0.1-818d4064052f.tgz`。
- 包 SHA256：`818d4064052fa70fdc9702bbf510bd60afc553153fd09134c6cdfbb4de7407bf`。
- 源码 ZIP：https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/hydrowell/1.0.1-14f42dbe25dc6796de8cd8d2c1ed00fb8d5a3891/e73d33c1ecd363622ca67ece6042a8c4b050ab454a3a4a95ffc802e7bb834cc6.zip
- ZIP SHA256：`e73d33c1ecd363622ca67ece6042a8c4b050ab454a3a4a95ffc802e7bb834cc6`，8,164,267 字节，已匿名下载验证摘要与 ZIP 完整性。
- 模板锁、package.json、pnpm 生成的依赖锁、仓库登记及 releases.json 已同步。旧版本产物保留。

## 验证结果

所有依赖安装、编译、打包在本地 WSL Linux 文件系统 `/home/xmin/workspace/hydrowell-20261026/` 执行，Node 24.16.0、pnpm 9.15.4。

- 独立工程 `pnpm run typecheck`、`lint`、`build`、`verify` 与严格模板协议校验通过；报告位于独立工程 `.tpl/reports/`。
- 18 条独立生产路由 HTTP 200。72 组检查（9 页 × 双语 × 1440/834/390/320）未发现横向溢出、一级标题异常或已加载坏图。
- 三端正文初态/终态、真实滑块拖动、统计、FAQ、评价暂停、视频播放/关闭恢复通过；双语表单六组、菜单焦点/Escape/背景锁定、语言切换路径/query/hash 保留通过。
- 12 张真实展示截图已生成；平板 651/834/1100 双语首屏卡片重叠已修复并验证。
- 主站 `node scripts/deformo-package.mjs check --id hydrowell`、适配文件 ESLint、全量 `template-release-check.mjs` 通过。
- 主站 18 条路由 HTTP 200，品牌和模板根检查通过。1.0.1 移动首屏复核正文 41 个动画单元最终可见且无横向溢出。
- 已验证主站三端品牌、市场入口、截图切换、H5/平板预览 iframe 与移动菜单；教程跳转现有登录流程。最终宿主证据位于 `artifacts/hydrowell/`。
- 后续接入复核：同步当前主站代码后，`pnpm install --offline --frozen-lockfile`、Hydrowell 快照检查、全量 ZIP 清单检查、适配 ESLint 和主站完整 `pnpm run build` 均通过。实际构建目录为本地 WSL `/home/xmin/workspace/hydrowell-20261026/website/.next-hydrowell-integrated`，未在服务器构建。
- 已使用该生产构建启动本地主站，18 条双语路由再次全部通过 HTTP/品牌检查；内置浏览器确认 `/templates/hydrowell` 详情页包含 9 页、12 张三端展示图，主图已加载，无横向溢出；模板首页品牌注入正常。最新构建日志为 `artifacts/hydrowell/host-build-integrated.log`，详情截图为 `host-integrated-detail.png`。

## 验收边界与未完成项

- 先前 Goalz 依赖缺失及 Webpack 缓存异常的阻塞已被最新主站构建通过结果取代；旧 `host-typecheck-final.log` 和 `host-build-final.log` 仅保留作历史记录。本次未修改无关 Goalz 源码或跳过类型检查。
- 动效已基于原站观察与初终态采样实现，但准确时长、缓动及逐帧轨迹未完整量测；减少动态效果系统设置模拟、触控惯性及滚动条拖动未完整验收。
- 原站故事视频实际为 Framer 演示，保留原 YouTube 视频并已实际播放，未另造品牌影片。
- 未登录教程，未验证复制提示词动作；公开源码 ZIP 已独立校验。
- 原站素材商业再分发许可尚未确认，`listed=false`、`redistributionAllowed=false`。未市场上架、未部署、未提交或推送主站仓库。

主站详情：http://127.0.0.1:34332/templates/hydrowell 。在线预览：http://127.0.0.1:34332/templates/hydrowell/site 。预览依赖当前 WSL 本地生产服务存活；仍未部署到远端。内部工作台 `/templates` 可见，公开案例页仍按 `listed=false` 保持不上架。
