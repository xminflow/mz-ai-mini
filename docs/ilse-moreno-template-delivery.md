# Ilse Moreno 本地复刻与接入验收

参考站：https://ilse-moreno.framer.website/ 。依据 `docs/template-replication-guide.md` 执行。用户于 2026-10-24 明确授权后，已完成公开源码仓库、正常推送、COS 源码 ZIP 发布与下载校验、主站固定快照及本地 WSL 生产构建。未部署或上架；完整原站动效对照仍未完成。

## 已实现内容

独立工程位于 `D:/code/code-tpl/ilse-moreno-template`，主站 `catalog/ilse-moreno/` 仅保留注册和宿主适配。通用业务源码、品牌、双语内容、主题、公共交互和素材在独立工程维护，生产快照不读取本机源码路径。

覆盖首页、作品、关于及 Waymark、CallWave、Citebound、FirstCheck、Nonlinear、Noted 六个案例，共 9 页、18 条中英文路径。原站未发现独立博客、联系或政策页面；联系表单位于首页锚点。没有为凑页面数虚构博客或政策页。

实现点阵背景、紫色选框、人物与标题叠层、画布入场、平移惯性、中心缩放、项目聚焦、三枚评价图钉、缩略地图、画布／列表切换、手机卡片堆叠和水平拖动、客户评价、关于页示意动画、履历下载、邮箱复制和演示表单。根据原站**运行后的真实 DOM**修正六个项目的位置与比例；画布在容器宽度 640px 以下切为手机卡片，iPad 保留画布。

默认中文，英文 `/en`；语言切换保留对应页面、查询参数与锚点。主站注入微域生光 / Weelume、现有 Logo、48px 高市场按钮与 `TemplateFiling` 示例备案。表单仅本地校验，明确不发送、不保存，日志不输出姓名、邮箱或项目正文。

运行图片、字体、标志与履历本地托管；55 项图片来源和 PDF 来源见独立工程 `public/templates/ilse-moreno/sources.json`。MiSans / Poppins 许可随包保留，未新增第三方运行依赖或升级现有依赖。

## 实际验证

| 检查 | 实际结果 |
| --- | --- |
| 独立 WSL 冻结离线安装 | 通过；Node v24.16.0、模板已声明的 pnpm 12.10.1 |
| 独立 `pnpm run typecheck / lint / test / build` | 通过；4 项测试覆盖拖拽边界、居中、缩放往返与语言路径 |
| 独立生产服务 | 18 条路径与真实 404 通过；验收脚本启动的 43344 服务已停止 |
| 独立图片 HEAD 请求 | 55 项通过，另有本地履历 PDF |
| 独立浏览器 | 9 页 × 双语 × 1440 / 834 / 390 / 320，共 72 组合，无页面横向溢出或损坏图片 |
| 实际交互 | 桌面入场初末状态、缩放、拖拽、项目聚焦、列表切换、评价；手机菜单、卡片切换、评价打开关闭；邮箱复制；无效／有效表单提示；语言切换保留查询和锚点通过 |
| 主站类型与适配文件 Lint | WSL 通过 |
| `template:check --id ilse-moreno` | 通过，固定包版本、依赖路径和 SHA256 一致 |
| 既有同步与发布测试 | 3 项通过：`node --test scripts/tests/deformo-package.test.mjs scripts/tests/template-release.test.mjs` |
| 最终主站浏览器 | 72 个双语／视口组合通过；检查期间控制台无 error |
| 最终主站真实 HTTP | 18 条页面、404 与 55 项图片通过 |
| 市场详情与设备预览 | 各端 4 图、截图切换、新标签页打开 iPad 预览、iframe CSS 834×1180 / 390×844、框内手机菜单通过 |
| 主站 `build` / 发布检查 | 2026-10-24 本地 WSL 通过；所有共享模板源码 ZIP 与固定快照一致 |
| 独立 `.tpl/tools/check.mjs --require-verified` | 通过，源码摘要与真实验收报告一致 |

手机交互曾发现背景卡片遮挡评价按钮，根因是前景卡片缺少定位，`z-index` 未生效；补充相对定位后，真实点击评价保持在当前页面并正常打开、关闭弹窗，切换卡片通过。

截图源位于独立 `.tpl/assets/`，主站映射至 `public/templates/ilse-moreno/screenshots/`。CSS 视口为 1440×1000、834×1180、390×844；浏览器工具对输出截图缩放，真实文件尺寸为 1425×990、819×1159、375×812。两套元数据记录真实文件像素，未伪称为原始分辨率。

## 公开源码与固定快照

- 独立源码：[ilse-moreno-template](https://github.com/weelume/ilse-moreno-template)，main，已正常推送并核对完整远端 SHA：`eed5b7ee8fcfccf9a2ef1af8c4202bf3a39bfa94`，工作区干净。
- 应用验收基线：`23203f1fc347440e4e8cebc551bdbc399e5187c3`；随后仅提交验收报告。源码摘要：`c7e81ad5025421667371025db4f7109b69ef1c7003737cc49c3b26f46cea224a`。
- 运行包：`website/vendor/ilse-moreno-template-1.0.0-6e658f76f40f.tgz`，SHA256：`6e658f76f40f2a1c13d3b285a4f3e2538f5f5463b99e7f67deb67bbec67747dc`，sourceDirty=false。
- [完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/ilse-moreno/1.0.0-eed5b7ee8fcfccf9a2ef1af8c4202bf3a39bfa94/ffdcbecb12e11077cd8c9f9438ab84d310111e4770179eb35c869f3254f006a8.zip)，17119641 字节，SHA256：`ffdcbecb12e11077cd8c9f9438ab84d310111e4770179eb35c869f3254f006a8`。本地 WSL git archive 打包，使用现有 COS SDK 上传，匿名 GET 完整下载 SHA256 与 ZIP CRC 均通过。
- 模板锁、package.json、由主站 pnpm 9.15.4 生成的 pnpm-lock.yaml 和 releases.json 配套更新；保留其他模板的并行修改。

构建实际位置：**本地 WSL Ubuntu Linux 文件系统** `/home/xmin/workspace/ilse-moreno-20261023/delivery`；主站验收副本在同目录下 `website`。没有在远端服务器构建。

证据：独立 `.tpl/reports/verification.json` 和 `.tpl/docs/MOTION.md`；主站 `artifacts/ilse-moreno/` 中的 `browser-matrix.json`、`host-browser-matrix.json`、`http-standalone.json`、`http-host.json`、`screenshots.json` 与 `host-home.jpg`。

本地预览：[主站模板](http://localhost:43343/templates/ilse-moreno/site)、[模板详情](http://localhost:43343/templates/ilse-moreno)、[独立开发预览](http://localhost:43341/)；这些地址依赖本次本地预览进程。

## 本次生产验证

独立工程重新执行 pnpm run typecheck、lint、test、build，通过；4 项逻辑测试、18 条生产路径与真实 404 通过。协议检查发现并补齐 customization.json 的 Schema 声明和 project.json 的统一 verify 操作；严格模式通过。展示元数据中的平板、手机截图尺寸已按实际文件校正，未改动设计画面。

主站在本地 WSL Linux 文件系统执行 template:check --id ilse-moreno、template:release:check、tsc --noEmit、适配文件 ESLint、3 项既有同步和发布测试、pnpm build，全部通过。构建存在其他页面的既有未使用 eslint-disable 警告，未影响成功结果。Windows 主站未安装本模板，因此 Windows 的快照命令不能解析包；最终有效快照检查在 WSL 已安装副本完成。

实际启动本次生产产物，模板详情返回 200；18 条双语路径、404 与 55 项图片通过，43346 验收服务已停止。构建 ID：`NWdccSq9uLOGxYPIbHCGB`；build-manifest.json SHA256：`4624877670ee2fb2acde89b9c65e9dfaa8a564954e26fd3ca7ef774beed6f284`。详细产物摘要与结果在 artifacts/ilse-moreno/production-build.json、publication.json、host-production.log、http-host.json；构建原始日志在本地 WSL /tmp/ilse-host-build.log。

## 明确未完成与限制

1. **完整原站动效验收未完成**：全部页面三端尚未完成逐项、逐时刻对照；关于页细节和原站自绘光标手势状态仍需精确核对。系统减少动态效果分支未实际切换系统设置验证。不能标记为完整复刻或完整动效验收通过。
2. **权利边界**：原站图片、第三方标志、案例及履历的商用和再分发许可未确认；保持 listed=false。公开源码不代表取得素材许可。原图内英文设计文字保留。
3. **运行范围**：未验证登录后教程复制链路；表单仅本地校验，不连接服务。主站未提交推送或部署，模板未公开市场上架。

用户的“授权”覆盖公开仓库、源码推送和 COS ZIP，相关公开交付已完成。此前审批阻止记录属于授权前历史，不再作为当前阻塞。

回滚需同时恢复本模板 vendor、模板锁、依赖声明、pnpm 锁与发布清单到同一已验收版本；旧内容寻址对象保留，不删除或覆盖。保留 Folioxa 与其他已有修改。
