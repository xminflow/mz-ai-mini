# Spycat 模板交付记录

参考：[Jiro Spycat](https://jiro.build/templates/e-commerce/cat-food-single-ecommerce-spycat)。交付日期：2026-10-25。

## 实现范围

- 复刻参考落地页的九个区块：猫咪插画首屏、八袋口味公转环、三张自制理念卡、食材环、包装展示、猫龄环、六条评价轮播、FAQ、页脚。
- 默认中文，英文 `/en`；补全原站空按钮、错误锚点、联系与政策入口。共首页、喂养指南、联系、隐私、条款五页，十条双语路径。原站没有独立博客或交易链路，不虚构为已复刻页面。
- 包含首屏错峰入场、30 秒口味公转与反转、90 秒食材/猫龄公转与反转、4.5 秒内容切换、悬停产品卡、弹簧评价切换、触控/键盘/分页、FAQ 高度动画及减少动态效果支持。
- 按规范使用 MiSans 400/700、Poppins 400/600/700，主题令牌管理 28–44px 首屏标题、玻璃卡片与三端布局。标题比例与原站超大英文标题有意不同。
- 联系表单仅在本地校验，不发送、不保存。原站葡萄及未经验证的健康功效、评价文案已改成明确的设计演示内容；不提供实际猫粮配方或医疗建议。

## 源码与产物

- 独立主维护工程：`D:/code/code-tpl/spycat-template`。
- Git：[weelume/spycat-template](https://github.com/weelume/spycat-template)，分支 `main`，提交 `125199709fcf3c8f73387558a3f0fcae765f7869`；已推送，`ls-remote` 与本地 HEAD 一致，独立工作区干净。
- 固定包：`website/vendor/spycat-template-1.0.0-7ea0a42eafe9.tgz`，SHA256：`7ea0a42eafe983f6116fb269ae6cfc9ba4e07a7d4e05339ed9707632018d09ca`，`sourceDirty=false`。模板锁、依赖声明及 pnpm 自动生成的锁一并交付。
- [完整源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/spycat/1.0.0-125199709fcf3c8f73387558a3f0fcae765f7869/e77bb8fc787a28106489adf44364a5717b31684d4dd29ab8b9a472772fb39f12.zip)，7,398,173 字节，SHA256：`e77bb8fc787a28106489adf44364a5717b31684d4dd29ab8b9a472772fb39f12`。由已提交源码在本地 WSL Linux 文件系统生成；复用既有 COS SDK 上传，匿名完整下载、SHA256 与 ZIP CRC 校验通过后登记发布清单。
- 主站 `catalog/spycat/` 仅保留注册和宿主适配，注入微域生光品牌、模板市场入口及示例备案；通用页面和素材由独立包维护。`spycat.local` 为忽略的本地开发配置，生产只使用固定包。

## 验收结果

独立构建位置：本地 WSL `/home/xmin/workspace/spycat-20261025/template`。

- `pnpm typecheck`、`pnpm lint`、`pnpm test`（3 项合同测试）、`pnpm build` 通过。
- 十条双语路由、226 项本地素材逐字节摘要、未知路径 404 和生产服务健康检查通过；验收服务按协议已停止，另保留本地预览服务。
- `node .tpl/tools/check.mjs . --require-verified` 通过，源码摘要 `57a1b0965de1fad4b731bf2b4b00d4176f1c6f2f20573571eeae9bc290b3990b`。详细报告随独立工程 `.tpl/reports/` 交付。
- 1440×1000、834×1180、390×844、320px 共 40 次双语页面巡检，无横向溢出或破图；首页、食材、指南、联系页十二张真实三端截图位于 `.tpl/assets/`，映射到主站模板素材目录。
- 浏览器截图会裁去滚动条；截图实际像素为桌面 1425×990、平板 819×1159、手机 375×812，展示元数据如实记录；CSS 测试视口仍为上述标准尺寸，没有放大图片伪造截图。
- 实测三端口味动画暂停/恢复、4/5/6 个评价分页边界与弹簧切换，另验证食材自动轮换/选择/暂停、理念卡悬停、FAQ、移动菜单、语言切换保留查询/锚点、联系表单错误与成功提示。控制台未捕获错误。

主站隔离验收位置：本地 WSL `/home/xmin/workspace/spycat-20261025/baseline/website`，基于已提交主站 `3bfd5477e4bc62e8e876956cc65c665750177784` 加本次 Spycat 接入。

- `template:check --id spycat`、`template:release:check`、接入文件 ESLint、`WEBSITE_BUILD_DIR=.next-spycat-build pnpm build`、`pnpm exec tsc --noEmit` 全部通过。
- Build ID：`Wb55jPsr6iGAHim2NAI2h`；`server/app-paths-manifest.json` SHA256：`c308da3ac0ed5ad5d0bc0470476b8b9e60ce184843478a7d9b5144428ab35969`。
- 十条生产路径、详情页、iPad/H5 预览路由、未知路径 404、238 项生成素材 HTTP 与摘要检查通过。
- 主站三端首页无溢出、无破图，品牌、市场链接 `/templates`、中英文无障碍名称和示例备案正确；主站语言切换保留路径/查询/锚点。
- 详情页 PC 与 H5 新标签页入口实测通过；模拟器内 H5 真正为 390×844、iPad 为 834×1180。H5 模拟器内菜单、联系表单、语言切换通过。
- 运行截图：`assets/spycat/host-desktop-home.jpg`、`host-tablet-home.jpg`、`host-mobile-home.jpg`。本地生产预览：[Spycat 主站接入](http://localhost:43473/templates/spycat/site)；独立预览：[Spycat](http://localhost:43470)。

## 限制与风险

- 当前完整工作区的构建因并行 Vetala 接入缺少 `vetala-template/template` 和 `vetala-template/host` 失败；保留其未提交修改，没有修改或回滚该任务。上述主站通过结果仅覆盖已提交基线加 Spycat，不能视为整个工作区构建已通过。
- 全部原站动效的逐帧轨迹、系统减少动态效果偏好、触屏惯性回弹尚未逐项实测，不宣称完整像素或动效一致。详细触发参数与有意差异见独立工程 `.tpl/docs/MOTION.md`。
- 登录后的教程展开和提示词复制未实测；源码 ZIP 地址绑定、公开下载及完整性已通过发布流程验证。
- 设计、插画与素材的商业再分发权利尚未核实，保持 `listed=false`，未上架。字体权利边界独立记录，不因工具许可推断素材许可。
- 未提交或推送主站仓库，未部署主站，未在远端服务器构建。构建、依赖安装、运行包与 ZIP 均在本地 WSL Linux 文件系统完成。

## 后续更新与回滚

修改通用源码后，在独立工程完成验证、提交并 bundle；主站执行 `template:update --id spycat`，通过 pnpm 更新锁，再执行 `template:release --ids spycat`、发布检查和本地 WSL 构建。不要手工编辑生成素材或重新复制页面源码。

本次为首次接入；撤回时只移除 Spycat 的注册、配置 ID、依赖、模板锁、运行包、生成素材及发布清单条目，pnpm 重新生成依赖锁后在 WSL 构建验证。保留 Git 历史与 COS 内容寻址对象，不覆盖其他模板或用户修改；后续版本按模板 ZIP 发布文档成套恢复上一快照。
