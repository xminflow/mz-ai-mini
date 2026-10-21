# Conicorn AI 自动化官网模板

## 复刻范围

本模板依据 `https://conicorn.framer.ai/` 和项目 `docs/template-replication-guide.md` 完成，覆盖完整官网模块与页面：

- 首页：Hero、Who We Are、Metrics、Value、Capabilities、Security、Process、Case Studies、Integrations、Testimonials、Pricing、Team、FAQ、Footer。
- 案例：案例列表，以及房地产询盘机器人、创意团队项目管理自动化、金融 SaaS 工作流自动化三个详情页。
- 转化与信息页：Contact、Terms of Service、Privacy Policy、404。
- 所有页面支持中文默认语言和 `/en` 英文路径，导航与菜单会保留当前页面路径切换语言。

## 页面路由

中文页面位于 `/templates/conicorn/site`，英文页面在路径后追加 `/en`：

| 页面 | 中文路由 | 英文路由 |
| --- | --- | --- |
| 首页 | `/` | `/en` |
| 案例列表 | `/case-studies` | `/en/case-studies` |
| 房地产案例 | `/case-studies/ai-property-inquiry-chatbot-for-real-estate-firms` | `/en/case-studies/ai-property-inquiry-chatbot-for-real-estate-firms` |
| 项目管理案例 | `/case-studies/ai-project-management-automation-for-creative-teams` | `/en/case-studies/ai-project-management-automation-for-creative-teams` |
| 金融 SaaS 案例 | `/case-studies/ai-workflow-automation-for-finance-saas-company` | `/en/case-studies/ai-workflow-automation-for-finance-saas-company` |
| 联系 | `/contact` | `/en/contact` |
| 服务条款 | `/terms-of-service` | `/en/terms-of-service` |
| 隐私政策 | `/privacy-policy` | `/en/privacy-policy` |
| 404 | `/404` | `/en/404` |

## 设计与交互

- 黑白灰基底配合紫色渐变视频 Hero，桌面端内容宽度约 1180px，移动端按 390px 及窄屏布局收缩。
- 能力模块支持四个服务卡片切换；FAQ 支持展开与收起；价格模块支持月付/年付切换。
- 联系表单为本地演示提交，拦截默认提交并显示状态，不向外部服务发送数据。
- 所有图片、视频与截图均从 `public/templates/conicorn` 本地加载，避免预览时依赖第三方资源。

## 资源记录

参考站点资源地址、采集日期和本地化说明记录在 [`public/templates/conicorn/sources.json`](../../../../../public/templates/conicorn/sources.json) 中。当前模板仅使用本地副本，正式发布前按项目资产授权要求复核。

## 截图与验收

通过 `pnpm exec node scripts/capture-conicorn.mjs` 使用本机 Chrome/CDP 生成 12 张验收截图：桌面端 1440×1000、平板端 834×1180、移动端 390×844，覆盖首页、能力模块、案例、联系页。结果写入 `public/templates/conicorn/screenshots/capture-report.json`，并检查：

- 页面就绪、页脚存在、视口尺寸正确；
- 图片 `decode()` 无失败；
- 页面无横向溢出；
- reduced motion 模式下截图稳定。

## 验证命令

```bash
cd website
pnpm exec tsc --noEmit --incremental false
pnpm exec eslint src/features/site-templates/catalog/conicorn src/features/site-templates/registry.ts
pnpm exec node scripts/capture-conicorn.mjs
```
