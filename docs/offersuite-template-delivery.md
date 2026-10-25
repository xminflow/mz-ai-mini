# OfferSuite 模板交付记录

日期：2026-10-24。参考站：https://offersuite.framer.website/。

## 实现与接入

- 独立源码：`D:/code/code-tpl/offersuite-template/`，通用页面、双语内容、主题、组件、字体与图片均在此维护。
- 共 21 个页面，覆盖首页、关于、日志、6 篇文章、6 个体验页、结算、隐私、条款、感谢、404 以及按规范补充的联系页；中文和英文路由均提供。
- 已实现分字入场、图片视差、首屏鼠标视差、双向循环图库及暂停、FAQ、移动菜单、语言切换、演示表单和演示结算。联系表单只做本地验证和成功提示，不发送或保存业务数据。
- 主站 `website/src/features/site-templates/catalog/offersuite/` 只保留注册和宿主适配，注入微域生光品牌、模板市场入口和示例备案；生产使用固定包，无本机源码路径依赖。
- 运行素材本地托管。179 张 PNG 转为 WebP，保留尺寸并验证透明通道；来源和编码检查记录位于独立源码的素材清单与 `.tpl/reports/`。

## Git、固定包与源码下载

- 仓库：https://github.com/weelume/offersuite-template
- 分支：`codex/offersuite`。
- 提交：`97c6acee40ed5d10198c21ed8f5ac9f556667b81`。已推送，`ls-remote` 确认远端一致。
- 源码摘要：`e3d34e302ec72855871cf1ebeaf45741a559de05788a3c7c71ed00e34708c251`。
- 固定包：`website/vendor/offersuite-template-1.0.0-dc905948e733.tgz`，69,223,600 字节。
- 包 SHA256：`dc905948e73337e5bf18b789b7cbeccf2f48faa9242b47172436ca2e241b1157`。
- 完整已提交源码 ZIP：69,416,682 字节，SHA256 为 `d5febec103f768ff47775fb2f5cec8a1da887271e509e39af295e69bafca9f89`。
- [源码 ZIP 公开下载](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/offersuite/1.0.0-97c6acee40ed5d10198c21ed8f5ac9f556667b81/d5febec103f768ff47775fb2f5cec8a1da887271e509e39af295e69bafca9f89.zip)。既有 COS SDK 上传后完成匿名完整下载、SHA256 和 ZIP CRC/结构校验，再更新 `website/templates/releases.json` 的 OfferSuite 记录。
- 依赖声明、pnpm 生成的锁、模板锁和固定包配套更新。仓库登记同步至 `docs/template-repositories.json`、`.md` 和主站 `gitUrl`。

## 验收记录

所有依赖安装、编译、固定包与 ZIP 打包均在本地 WSL Ubuntu 的 Linux 文件系统完成，没有服务器构建。

- 独立工程构建位置：`/home/xmin/workspace/offersuite-20261024/offersuite-template`。
- 最终源码运行 `pnpm typecheck`、`pnpm lint`、`pnpm test`（2 项内容与素材检查）、`pnpm build`，全部通过；协议命令 `node .tpl/tools/check.mjs . --require-verified` 通过且源码摘要匹配。
- HTTP 曾检查双语 42 条路由及 110 个引用素材；404 页面返回预期状态。
- 浏览器早期完成 168 组双语四档宽度检查，无溢出或破图；体验页调整后完成 48 组即时回归，其中一组首次加载暂报溢出，稳定态前 20 组复核通过，后续被浏览器安全策略中止。
- 菜单、语言切换保留页面及 query/hash、FAQ、表单空值拒绝与有效表单成功反馈曾实测通过，当轮控制台错误为空。
- 主站隔离副本位置：`/home/xmin/workspace/offersuite-20261024/website`。以主站提交 `f1ee772ee1a92a4a706ddaf4d5d70b227a3654a4` 为基线加入 OfferSuite，隔离其他并发模板的未完成修改；`pnpm exec tsc --noEmit`、OfferSuite 适配范围 ESLint、`pnpm template:check --id offersuite`、`pnpm template:release:check` 已通过。
- 最终执行 `TEMPLATES_MODULE_ENABLED=true NEXT_DIST_DIR=.next-offersuite-final pnpm build`，退出码 0，生产构建通过；日志保存于 `artifacts/offersuite/host-final-build.log`。存在基线原有的 ESLint 警告，未阻断构建。当前工作区整体不能据此宣称已验收，其他并发模板不属于此隔离验证范围。

## 未完成项与使用边界

- 原站全部页面、三端动效的节奏和轨迹尚未逐项比对，不能宣称完整视觉与动效复刻验收。
- 浏览器安全策略阻止了后续导航，没有采用其他浏览器或间接方式绕过；需策略状态恢复后继续人工或允许的浏览器验收。
- 12 张真实展示图已提供，但晚于截图的页脚、标题、图片编码、分字入场和鼠标光标调整尚未重新截图及逐项浏览器复核。
- 减少动态效果已实现，尚未模拟系统偏好验证；尚未完成从远端全新克隆后的重装验收。
- 参考素材的商业和再分发许可尚未核实，模板保持 `listed=false`、`redistributionAllowed=false`。源码包公开可下载不代表获得素材商业授权。
- 本任务未推送主站仓库、未部署主站、未上架市场。独立验证服务已停止。

## 回滚

需要回退时保留现有 COS 对象及 Git 历史，选择同一历史提交对应的固定包、模板锁、依赖声明、pnpm 锁及源码 ZIP 发布记录一并恢复，随后重新执行模板包检查、ZIP 发布检查和本地 WSL 构建。不要单独修改源码提交或下载地址来绕过摘要门禁。
