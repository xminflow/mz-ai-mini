# Tomasfolio 模板复刻与交付验收

参考 https://td-tomasfolio.framer.website/ 。独立工程位于 D:/code/code-tpl/tomasfolio-template，通用源码仅在独立工程维护；主站 catalog/tomasfolio 保留注册、品牌和主题适配。主站未提交、推送、部署或上架，用户已有修改保留。

## 交付内容

覆盖首页、作品列表、5 个案例、文章列表、4 篇文章、联系、隐私政策和服务条款，共 15 页、30 条中英文路径，另有 404。默认中文；英文 /en；语言切换保留对应页面、查询和锚点。原站 projects/korop.co 按现有主站约束映射为 projects/korop-co，显示名称保留 Korop.Co。

实现暖白与橙红主题、大字和人物叠层、桌面侧栏、移动菜单、玻璃卡片、作品图集、文章正文、履历折叠、图像动效及本地表单校验；主站注入微域生光 / Weelume、现有 Logo、Next Link 市场按钮与 TemplateFiling 示例备案。Weelume 字符长度与独立品牌不同，weelume.css 在宿主主题中调整字号，已验证 320px 不裁切。图片和 MiSans/Poppins 本地托管，来源和许可证保留。

12 张真实 WebP 截图覆盖首页、作品、文章和联系，PC 1440×1000、iPad 834×1180、H5 390×844；保存在独立 .tpl/assets 并由共享包同步到主站截图位置。320px 另作窄屏验证。

## Git、快照与 ZIP

- Git：[tomasfolio-template](https://github.com/weelume/tomasfolio-template)，main，提交 3dc2514a3b5385e3e7321b600a2789cdeb11ebd4；远端 SHA 与本地一致，独立工作区干净。
- 共享包：website/vendor/tomasfolio-template-1.0.0-34e83906080a.tgz，SHA256 34e83906080adcc302e7f3c42cf51a74a79d24c75c86c5618761cc5c0ac0d54d，sourceDirty=false。
- 源码 ZIP：[长期公开下载](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/tomasfolio/1.0.0-3dc2514a3b5385e3e7321b600a2789cdeb11ebd4/cdf7287965dcf2cf31b4d0258a09c719319e05f2532bae42dcf4c89654f71905.zip)，19721703 字节；SHA256 cdf7287965dcf2cf31b4d0258a09c719319e05f2532bae42dcf4c89654f71905；本地 WSL 打包、既有 COS SDK 上传，匿名完整下载与 ZIP CRC 验证通过。
- 同步交付 website/templates/tomasfolio.lock.json、package.json、pnpm-lock.yaml、templates/releases.json；pnpm 自动生成锁，仅增加当前模板包，无第三方依赖升级。

## 实际验证

| 验证 | 结果 |
| --- | --- |
| 独立 pnpm typecheck / lint / test / build | 通过，4 项合同及语言路由回归测试 |
| 独立 .tpl/tools/check.mjs --require-verified | 通过，源码摘要与真实验收报告一致 |
| 独立生产路径与服务 | 30 条双语路由及真实 404 通过；验收服务已停止 |
| 独立浏览器 | 15 页 × 双语 × 4 视口，120 组合通过；7 项交互通过 |
| 主站 pnpm exec tsc --noEmit | 通过 |
| 主站改动文件 ESLint | 通过 |
| 同步器与发布校验回归 | node --test website/scripts/tests/deformo-package.test.mjs website/scripts/tests/template-release.test.mjs，3 项通过 |
| template:check --id tomasfolio / template:release:check | 通过 |
| 主站本地 WSL pnpm build | 完整通过，包含 standalone 产物 |
| 最终 standalone 浏览器 | 120 组合通过，无横向溢出、文本裁切或损坏图片 |
| 模板详情与设备预览 | 三端各 4 图、截图切换、新标签打开、iframe 实际 834×1180 / 390×844、框内菜单/导航/语言/表单通过 |
| 主站品牌与语言 | 市场按钮 48px 高、/templates 链接、示例备案、双向语言切换保留查询及锚点通过 |

构建实际位置：本地 WSL Ubuntu /home/xmin/workspace/tomasfolio-20261023/website；未在远端服务器构建。最终 BUILD_ID：dUO_3YRPomATtZ0JBHrPQ；standalone/server.js SHA256：6a616c3dc01b3dff586c7f327cba32e649bdecf90162cfc0a7d77d70e4955fb8。最终预览使用同一份产物：[本地预览](http://localhost:43324/templates/tomasfolio/site)。

独立源码绑定报告及截图在独立工程 .tpl/reports、.tpl/assets；主站证据在 artifacts/tomasfolio/host-browser.json、marketplace-report.json、host-build.log、delivery-report.json。

## 限制与后续维护

原站素材商业与再分发授权尚未确认，因此 listed=false；公开 Git/ZIP 不等于已取得素材授权。正式商用前取得许可或替换为自有素材。放映区明确为图像动效，未取得可复用的原站视频；原素材中的英文设计文字保留。表单不发送、不保存；履历、客户与评价均为演示。未登录状态下未执行使用教程复制，不据此声称登录链路已验收；源码 ZIP 本身已真实下载校验。

通用改动回独立工程；主站专属品牌样式不回灌。更新时先验证、提交/推送、WSL bundle，再 template:update、pnpm 更新锁、template:check、源码 ZIP 发布验证及 WSL build。回滚时共同恢复注册适配、vendor、模板锁、依赖锁和发布清单到同一版本，保留旧 COS 对象，不单独切换源码或下载包。

构建与运行验证基于本任务保存在本地 WSL 的主站快照。工作区期间出现的 Artemis 模板、账户/导航模块等并行修改已保留，不纳入本次 Tomasfolio 验收结论。

## 2026-10-23 去掉箭头

已移除首页、菜单、作品卡片、文章日期、返回链接、联系按钮及页脚的装饰箭头，并删除专用箭头样式。保留原有链接与交互。独立类型、Lint、4 项测试、WSL 构建及 30 条生产路由通过；主站 30 条双语页面实际检查无箭头，菜单跳转正常。12 张三端截图已更新，源码摘要报告同步刷新。当前 43324 为源码开发预览；本次未提交/推送独立修改，未更新固定生产快照及已发布 ZIP，既有发布记录仍指向上次版本。
