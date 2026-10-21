# Conicorn 与 Grovia 独立工程迁移

日期：2026-10-20。范围仅为 Conicorn、Grovia；保留其他任务对 Souma、Furnexa、Mondragon 等文件的修改。

## 交付与维护边界

| 模板 | 独立源码 | 真实 Git 地址 | 主站入口 |
| --- | --- | --- | --- |
| Conicorn | `D:/code/code-tpl/conicorn-template` | <https://github.com/weelume/conicorn-template> | `/templates/conicorn/site` |
| Grovia | `D:/code/code-tpl/grovia-template` | <https://github.com/weelume/grovia-template> | `/templates/grovia/site` |

两边对应关系以本表登记。独立工程是后续通用源码的维护位置；独立站默认中文 `/`、英文 `/en`。Conicorn 9 页、Grovia 10 页，页面与双语路径均保留。主站 catalog 只保留 `meta.ts`、`weelume.tsx` 和接入说明，通过 Provider 注入主站品牌、Logo、模板市场和示例备案，不复制通用页面。

品牌配置、双语文案数据、主题、公共组件、页面组合和路由各有入口；全部字体、Logo、运行图片归各自 `public/templates/<id>`。独立工程不依赖主站 Logo、公共字体或其他模板源码。原说明、来源快照和旧验证资料留在 `legacy/`，仅作历史记录。

独立工程提供 `.tpl` 0.2.0 元数据、工具链、运行合同、修改指南、许可说明和源码摘要绑定的验收报告。两个远端仓库已按用户后续授权提交并推送完整源码；当前分支和提交见 `docs/template-repositories.md`。未部署或上架。现有固定包在首次 Git 提交前生成，因此包锁中的 `sourceCommit=null`、`sourceDirty=true` 仍如实表示当时打包基线，不冒充当前 Git 状态。

## 本地开发与部署快照

在 `website` 执行：

```powershell
node scripts/deformo-package.mjs local D:/code/code-tpl/conicorn-template --id conicorn
node scripts/deformo-package.mjs local D:/code/code-tpl/grovia-template --id grovia
pnpm dev
```

`*.local` 仅开发时引用源码并监听素材，不进入 Git 或 Docker。生产仅使用 `vendor` 固定归档；包 SHA256、版本和依赖记录分别位于 `templates/conicorn.lock.json`、`templates/grovia.lock.json`、`package.json`、`pnpm-lock.yaml`。运行素材及截图由包生成，已从主站 Git 跟踪移除，磁盘副本仍可用于运行。

后续更新顺序：独立工程检查与必要页面验证 → `pnpm bundle` → 主站 `template:update` 指向归档并指定 `--id` → `pnpm install` 生成锁 → `template:check` → 构建及受影响页面验证。不得只修改开发源码而遗漏部署包。

并行构建可设置 `WEBSITE_BUILD_DIR` 使用独立目录；未设置时仍为 `.next`。开发服务继续按端口隔离产物。本次临时目录为 `.next-conicorn-grovia-validation`。

## 实际验证

| 检查 | 结果 |
| --- | --- |
| 两个独立工程 | `pnpm typecheck`、`pnpm lint`、`pnpm test`、`pnpm build` 均通过 |
| 独立协议 | `node .tpl/tools/check.mjs . --require-verified` 通过，验收报告摘要与当前源码一致 |
| 独立浏览器 | Conicorn 72 组合、5 项交互通过；Grovia 80 组合、7 项交互通过，最终首页修改另验 8 组合、7 项交互通过 |
| 主站浏览器 | Conicorn 72 组合、5 项交互；Grovia 80 组合、7 项交互；最终报告均无失败、无运行错误 |
| 检查维度 | 全部双语页面 × 1440×1000、834×1180、390×844、320×844；单 H1、图片、横向溢出、品牌隔离、市场与备案插槽 |
| 交互 | 菜单与 Escape、FAQ、套餐、表单本地校验、语言切换保留页面/查询/锚点且无整页刷新；Grovia 另验功能标签与键盘切换 |
| 三端截图 | 两个独立服务重新生成各 12 张截图；独立 `.tpl/assets` 与主站映射逐文件 SHA256 一致 |
| 包一致性 | Conicorn 259、Grovia 319 个交付文件在独立源码与已安装固定包中逐文件 SHA256 一致 |
| 主站静态检查 | `pnpm exec tsc --noEmit --incremental false`、改动文件 ESLint 通过 |
| 共享同步回归 | `node --test scripts/tests/deformo-package.test.mjs`，2 项通过 |
| 市场 | 实际点击新标签页、两套模板 iPad/H5 真实视口与菜单，共 6 项通过，控制台错误 0 |

本次验收脚本及逐页证据保存在宿主 `artifacts/template-migration/`（忽略提交）；独立验收资料只记录模板自身行为，保存在各自 `.tpl/reports/`。独立 `.work/{typecheck,lint,test,build}.log` 保存检查输出。

## 修复与验证边界

- Conicorn 独立 `/404` 被 Next.js 内置路径接管：新增显式页面入口和回归契约检查，生产实际路由复验通过。
- Conicorn 语言切换原先丢失查询与锚点：切换时读取当前位置并通过客户端路由保留，浏览器验证通过。
- 减少动态效果下出现水合差异：显式固定按钮焦点属性；Grovia 图表高度、套餐透明度和首屏 transform 使用一致初始状态，仅按媒体偏好调整动画。首次只修焦点属性未覆盖所有动效初始值，后续以开发模式控制台和 iframe 验收定位完整原因；最终浏览器无水合错误。验收脚本也改为等待水合后再调整懒加载属性，防止测试自身修改待水合 DOM。
- 主站常规生产构建曾完成编译、类型和页面生成，在 Windows standalone 符号链接复制时发生 `EPERM`。并行构建还曾覆盖 `.next` 追踪清单，引发 `ENOENT`；为此增加可选构建目录隔离。最终构建结果见下方补充记录；不能把独立工程构建或主站页面运行通过解释成 standalone 部署包已可交付。
- 未验证 Linux/CI standalone 打包、独立克隆安装、线上部署或真实发送服务；表单仍仅本地校验。参考图片和正文的商业使用与再分发授权待核实。

## 回退与恢复

未改数据库或外部业务数据。需要回退时，以迁移前 Git 基线恢复本次两个 catalog 和对应素材，并一并恢复这两个包依赖、模板锁及 pnpm 锁；公共配置只移除本次新增项，必须保留其他任务修改。归档包 SHA 校验失败时停止构建，重新从已验证独立源码 bundle，并按上述流程更新，不跳过校验。不要以删除其他模板文件或覆盖公共配置的方式回退。

## 最终构建补充

最终固定包已安装并通过全量类型检查。停止本次预览后，使用独立目录再次执行主站 `pnpm build`：生产编译、lint/类型检查和 35/35 页面生成完成，最终仍在 standalone 符号链接复制阶段因 Windows `EPERM` 失败。未更改 standalone 发布配置，也未将此次构建标记为通过；需在具备符号链接权限的 Windows 环境或 Linux/CI 重新完成打包验证。汇总证据见 `verification/conicorn-grovia.json`；日志保留在 `artifacts/template-migration/host-build-isolated.log`。
