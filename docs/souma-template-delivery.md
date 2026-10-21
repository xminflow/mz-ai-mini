# Souma 模板交付与接入验收

## 完成范围

参考站为 <https://souma.framer.website/>。已建立独立主维护工程 `D:/code/code-tpl/souma-template/`，主站仅在 `website/src/features/site-templates/catalog/souma/` 保留共享包注册与品牌适配。

共 10 页、20 条中英文路由：首页、下载页、日志列表、三篇文章、联系页、隐私、使用条款和 Cookie 政策。原站仅提供首页与下载页；其余页面按用户确认补充设计，文章不是原站译文。

保留森林光影、瑜伽摄影、深绿与米白色调、圆角布局，提供玻璃卡片与减少动态效果支持。中文使用本地 MiSans 400/700，英文与数字使用本地 Poppins 400/600/700。首屏照片内的界面文案由 DOM 覆盖，随语言与宿主品牌更新。

主要交互包括手机菜单、练习类型及键盘切换、手机示意课程选择、精选课程、会员故事轮播、FAQ、日志筛选、同页语言切换与本地表单校验。语言切换保留查询和锚点。下载和订阅按钮不下载、不收费；表单不发送、不保存。

独立工程使用 Souma 品牌；主站注入微域生光 / Weelume、现有 Logo、模板市场入口和共享 `TemplateFiling` 示例备案。默认中文，主站路径为 `/templates/souma/site`，英文为 `/templates/souma/site/en`，详情为 `/templates/souma`。

## 固定包与本地开发

- 固定包：`website/vendor/souma-template-1.0.0-aa77c5118d12.tgz`。
- SHA256：`aa77c5118d12a3f30eb1dd76ed6c46ca0ece8a2cdb17717b5436bd801540bf81`。
- 配套锁：`website/templates/souma.lock.json`、`website/package.json` 与 pnpm 生成的 `website/pnpm-lock.yaml`。
- 本地源码引用配置 `website/souma.local` 已生成并忽略；生产使用固定包，不读取独立工程绝对路径。
- 运行素材与 12 张三端截图由包同步至 `website/public/templates/souma/`，不手工维护该目录。
- 未提交、推送或部署；`sourceCommit=null`、`sourceDirty=true`。

后续通用修改在独立工程进行。更新部署版本时，先验证独立工程、执行 `pnpm bundle`，再在 website 执行：

```powershell
pnpm template:update --id souma D:/code/code-tpl/souma-template/.work/packages/souma-template-1.0.0.tgz
pnpm install --offline
pnpm template:check --id souma
pnpm build
```

独立预览使用 `pnpm dev`，默认端口 43284；若该端口被其他任务占用，先设置 `PORT` 为未占用端口。主站启用模板模块时复用既有 `TEMPLATES_MODULE_ENABLED=true` 配置。

## 已执行验证

| 验证项 | 结果 |
| --- | --- |
| 独立 `pnpm install --offline`、`--offline --frozen-lockfile` | 通过，沿用既有固定版本，无新增第三方库 |
| 独立 `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` | 通过；三项合同测试覆盖素材摘要、截图真实编码尺寸和宿主隔离 |
| 独立 `pnpm verify:browser` | 80 组路由/语言/视口组合、10 项交互通过，控制台无捕获错误，图片及字体加载正常，无横向溢出 |
| 三端截图 | PC 1440×1000、iPad 834×1180、H5 390×844，各首页、练习功能、日志、联系四张，共 12 张；补测 320px |
| 主站 `template:check --id souma` | 包摘要、版本和依赖路径一致 |
| 主站素材同步测试 | 两项通过，包含 Souma 注册标识检查 |
| 主工作区改动文件 ESLint | 通过 |
| 主工作区 TypeScript / 完整构建 | 受并行 Furnexa、Mondragon 未安装包影响；类型检查报告其缺失模块，构建启动器先在 Furnexa 缺包处停止 |
| 隔离主站 TypeScript / 改动文件 ESLint | 通过 |
| 隔离主站浏览器验收 | 80 组页面组合、11 项交互通过，包含微域生光品牌、市场入口及示例备案 |
| 隔离主站市场与预览 | Souma 可见；三端各四张截图；实际点击三种新标签页预览；iPad / H5 iframe 实际视口为 834×1180 / 390×844 |
| 隔离主站生产构建 | 编译、类型、35 页生成通过，进程退出码 0；standalone traced files 拷贝出现 Windows EPERM 警告，完整 standalone 归档未验收通过 |
| 隔离主站固定包生产运行 | 显式开启模板模块后，已编译页面中的品牌、市场、详情和真实新标签页预览通过；非 standalone 归档运行验证 |

隔离主站是 `HEAD` 中的 website 加本次 Souma 接入，使用固定包与既有依赖，不包含其他未完成的并行模板注册。未回滚、覆盖或删除主工作区中的 Furnexa、Mondragon 或用户原有修改。隔离验证不能替代当前主工作区的完整构建。

证据保存在独立工程 `.tpl/reports/browser.json`、`.tpl/reports/verification.json` 和 `.tpl/assets/`；主站接入报告为独立工程 `.work/host-browser.json`，市场报告及截图在本工程 `artifacts/souma/marketplace-report.json`、`artifacts/souma/host/`。初次懒加载检测超时及中间验收失败保留在 `.work` / artifacts 中；最终浏览器报告是通过版本。

## 未完成与风险

1. 用户后续明确授权后，已创建空公开仓库 <https://github.com/weelume/souma-template>，回填独立模板及主站 `gitUrl` 并配置 origin；尚未提交或推送源码。补齐修改指南 Schema 引用后，模板协议格式检查通过。独立工程保持 `stage=scaffold`；此前应用验收报告绑定变更前摘要，当前显示 stale，不将旧报告当成本次元数据更新的完整运行验收。
2. 原站素材再分发许可未确认，来源与 SHA256 保存在独立工程 `.tpl/docs/asset-sources.json`；`listed=false`、`redistributionAllowed=false`，不公开上架或出售。
3. 主工作区完整验证须等其他并行模板依赖齐备后执行；Windows standalone 归档还需在有相应权限的环境或 Linux 构建验证。
4. 当前为本地交付，未部署公网，也未接入真实账号、订阅、支付或联系服务。

## 2026-10-20 仓库地址补齐

创建的是空公开仓库，不上传源码、素材或验收文件。仓库地址已写入独立 template.json、运行时 meta.ts、主站宿主适配及已安装固定包。执行独立类型检查、三项合同测试、模板协议格式检查、主站改动文件 ESLint 与 template:check 均通过；pnpm 已更新主站依赖锁。页面业务与素材未改动，本轮未重复浏览器截图或完整生产构建。

## 2026-10-20 源码推送

用户明确授权后，独立 Souma 仓库已创建初始提交并推送 origin/master。推送前类型检查、三项合同测试和模板协议格式检查通过；旧完整运行报告仍是变更前摘要，未冒充本次完整运行验收。本工程主站改动未提交或推送，原有固定包 sourceCommit=null 表示该包生成时尚未提交，不据此改写历史包来源。
