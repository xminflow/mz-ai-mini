# UIUXfolio 模板实现与接入验收

## 交付位置

- 主维护工程：`D:/code/code-tpl/uiuxfolio-template`，独立 Git 工程，Next.js / React / TypeScript strict，固定 Node 与 pnpm。
- 主站只保留 `website/src/features/site-templates/catalog/uiuxfolio/meta.ts`、`weelume.tsx` 和接入说明，不复制通用页面与样式。
- 开发通过 `uiuxfolio.local` 引用独立源码并同步素材；生产通过 vendor 中的 SHA256 固定包引用，不依赖本机路径。
- 最终包、`templates/uiuxfolio.lock.json`、`package.json` 与 pnpm 锁文件一并交付。实际包摘要以锁文件为准；未提交源码，sourceCommit=null、sourceDirty=true。

## 实现范围

参考 `https://uiuxfolio.framer.website/` 的白色网格、粉色强调、纸片视觉、六个交错作品、作品画廊、技能、评价、履历、关于和联系。覆盖六个案例、联系表单、履历打印、政策与 404，共 12 页、24 条中英文路由。参考站没有博客，因此三端展示截图采用首页、作品区、案例详情和联系区，每端四张。字体和图片本地托管，来源与许可记录随独立工程保存。

独立模板显示 UIUXfolio 品牌。主站通过 Provider 注入微域生光中英文品牌、Logo、模板市场入口与 `TemplateFiling` 示例备案。源图中的英文设计说明保留，页面文案、导航、操作与表单提示提供双语。联系表单仅本地校验，不发送、不保存、不预约。

## 已执行验证

| 项目 | 结果 |
| --- | --- |
| 独立工程冻结离线安装 | 通过；沿用主站现有版本，未升级技术栈 |
| 独立 `pnpm typecheck`、`pnpm lint`、`pnpm test` | 通过；3 项合同测试 |
| 独立 `pnpm build` | 通过；24 条注册页面路由生成 |
| 独立自带 `pnpm run verify:browser` | 通过；1440×1000、834×1180、390×844、320×844，中英文共 96 组合，7 项交互，无浏览器异常 |
| 主站 TypeScript、改动文件 ESLint | 通过 |
| 主站同步器测试 | 2 项通过；原 Deformo 同步与新增模板隔离 |
| 两套模板 `template:check` 快照校验 | 通过 |
| 主站真实页面 | 96 个视口/语言/页面组合通过；8 项交互通过，无控制台异常 |
| 模板市场详情与设备预览 | 通过；12 页面、三端各 4 截图、真实鼠标点击后新标签页打开、834×1180 / 390×844 框内交互 |
| Deformo 页面回归 | 通过 |
| 主站生产构建 | 编译、类型与页面生成通过，Windows standalone 归档阶段 EPERM 失败，完整构建未通过 |

浏览器验证使用本次专用端口：独立工程 43262，主站 43263，避免干扰已有的 43122 / 3000 服务。早期脚本的默认端口冲突、提前操作未完成挂载的页面和修改懒加载属性造成的验证干扰均已排除，最终报告仅采用专用端口与非侵入式图像探针的结果。

原始结果保存在本工程 `artifacts/uiuxfolio/host-report.json`、`marketplace-report.json`；独立结果、源码工作树摘要与截图保存在独立工程 `.tpl/reports`、`.tpl/assets`。主站 `.next-templates-dev` 与生产 `.next` 分离，避免旧单模板缓存的客户端模块清单混用。

## 遗留限制

1. 用户未提供真实 Git 地址，独立元数据 `gitUrl=null`，完整 `.tpl` 协议检查明确失败；没有虚构远端，也未创建远端或推送。
2. 参考图像的再分发授权尚未确认，保持 `listed=false`，未部署、发布或出售。
3. 案例图内的英文示意内容尚未汉化，已在页面和独立说明中注明。
4. 主站完整 standalone 构建受已记录的 Windows 符号链接权限问题限制；Linux/Docker 生产归档尚未验证，不宣称部署验收通过。

## 后续维护

修改通用模板请在独立工程进行，品牌、内容、主题与页面组合各有明确入口，见其 `.tpl/customization.json`。主站接入命令见 `website/src/features/site-templates/catalog/uiuxfolio/README.md`。正式版本应补齐真实 Git 地址和素材许可，再提交验证、bundle、更新快照与锁文件；不要建立双向源码复制。
