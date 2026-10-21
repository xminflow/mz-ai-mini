# Lunera 与 Noirei 独立工程迁移

日期：2026年10月21日（Asia/Shanghai）。范围仅为本批两套模板；验收采用增量方式，不访问其他旧模板页面。保留其他任务已有修改。

## 交付

| 模板 | 独立源码 | Git | 提交 | 页面数 |
| --- | --- | --- | --- | --- |
| lunera | D:/code/code-tpl/lunera-template | [源码](https://github.com/weelume/lunera-template) | c21387da5fc1f8b6376926bed4b231ee4714077f | 10 |
| noirei | D:/code/code-tpl/noirei-template | [源码](https://github.com/weelume/noirei-template) | 184f80cce54b859e39734b8e606f79f01d4e46c0 | 28 |

两个仓库 main 分支已普通推送并通过远端 SHA 一致性检查，工作树干净。Git 地址同步至独立 .tpl/template.json、主站 gitUrl 和 docs/template-repositories.{json,md}。累计登记 13 套；其他模板的历史验收状态未改写。

独立工程采用 .tpl 0.2.0，提供品牌配置、内容与双语数据、主题、组件、页面、路由、宿主插槽、素材及本身验收报告。Noirei 的 media.json 是运行素材索引，随源码保留；旧接入说明归档在 legacy/。主站 catalog 仅保留 meta.ts、weelume.tsx、README.md；通用源码由共享包提供。独立默认显示自己的品牌，主站通过 Provider 注入微域生光 Logo、市场入口与示例备案。

## 开发与生产

当前主站开发配置已生成（忽略提交）：

```powershell
cd website
node scripts/deformo-package.mjs local D:/code/code-tpl/lunera-template --id lunera
node scripts/deformo-package.mjs local D:/code/code-tpl/noirei-template --id noirei
```

先配置 local 或安装固定包，再替换宿主导入，并让开发服务重读配置。本次此前仅安装 WSL 验收副本的依赖，当前 Windows 开发服务缺少新包，导致 Module not found；补齐上述显式 local 配置并重载后，两套新增开发路由实际通过，模块及运行错误均为 0。生产始终忽略本机路径，只使用 vendor 中固定归档。

- vendor/lunera-template-1.0.0-675659511103.tgz，SHA256：67565951110312aae4a840fbfd336a225adf58043aba71d0bc5aac63867fdf9b，sourceCommit：c21387da5fc1f8b6376926bed4b231ee4714077f，sourceDirty=false。
- vendor/noirei-template-1.0.0-12aa379d6f21.tgz，SHA256：12aa379d6f21f53a37d2287e2f321e96ace73b5308474154672a7aedccb37cb6，sourceCommit：184f80cce54b859e39734b8e606f79f01d4e46c0，sourceDirty=false。

两个模板归档均在本地 WSL Linux 文件系统、干净的已提交源码上生成。部署归档、templates/*.lock.json、package.json 和 pnpm-lock.yaml 一并交付。运行素材由包生成，不手工修改。素材从主站 Git 索引移除，磁盘副本保留。

原主站公共字体读取 Lunera 目录，存在跨模板耦合。本次将主站字体移至 public/fonts/brand，更新原有公共入口和直接引用；206 个字体及许可文件与原文件逐项一致（文本仅规范换行），来源 README 明确独立模板自行交付字体。只核对资源内容，不回归其他模板页面。

## 验收结果

| 检查 | 结果 |
| --- | --- |
| 独立工程 | 两边 pnpm typecheck、pnpm lint、pnpm test、pnpm build 通过；严格协议检查 --require-verified 通过，源码摘要一致 |
| 独立浏览器 | Lunera 80 组合 / 5 项交互，Noirei 224 组合 / 8 项交互；错误 0 |
| 主站 standalone 浏览器 | 同样 304 个组合、13 项交互通过；错误 0 |
| 覆盖维度 | 全部双语页面 × 1440、834、390、320px；H1、图片、横向溢出、品牌、市场、备案 |
| 关键交互 | 菜单与 Escape、FAQ、表单空值及有效内容、语言保留页面/查询/锚点且无整页刷新；Noirei 另验房型/日志筛选、照片灯箱 |
| 模板市场 | 仅本批两套详情截图、新标签整站、平板和手机 iframe 视口/菜单，6 项通过 |
| 包与素材 | 296 / 330 个包交付文件与独立源码逐文件 SHA256 一致；24 张截图映射一致；归档 SHA256 一致 |
| 主站静态检查 | tsc --noEmit --incremental false、改动适配文件 ESLint、2 项共享素材测试通过 |
| 主站构建 | node scripts/next-with-templates.mjs build 完整通过，包括 standalone 打包；实际启动同一份 standalone 产物验收 |
| 当前开发服务 | 本批两个新增路由成功打开，Module not found 和浏览器运行错误均为 0 |

模板模块默认在生产关闭，初次 standalone 请求因此被重定向；只在本任务验收进程显式设置 TEMPLATES_MODULE_ENABLED=true 后完成验证，未修改默认开关。临时服务已停止，用户 3000 开发服务保留。

实际构建位置：/home/xmin/workspace/template-migration-20261021/website。运行环境 Linux x64 / Node 24.16.0。standalone 目录：/home/xmin/workspace/template-migration-20261021/website/.next-lunera-noirei/standalone。Build ID：WR6bywQJHwy8kazidK6l-；完整目录摘要（按路径排序的文件 SHA256 与链接目标集合）：432a23f2c5bf9c63fb5df9f016a5abd3ffd792e2813aef9b483da8028c9fbbe7。未在远端服务器安装依赖、编译或构建。

机器记录见 [verification/lunera-noirei.json](verification/lunera-noirei.json)。宿主过程脚本、浏览器逐页证据和日志在 artifacts/template-migration（忽略提交）；独立通用验收在各 .tpl/reports。

## 边界与恢复

未推送主站、部署或改变上架状态；未测试远端全新克隆安装、Docker 镜像或真实业务发送。表单仍仅本地校验。原参考素材的商用及再分发授权待确认。

无数据库变更。回退时以本批原始备份 artifacts/template-migration/original/{lunera,noirei} 恢复两个旧 catalog，并一并恢复对应资产跟踪、两个依赖、固定包、模板锁与 pnpm 锁；公共字体路径调整须与字体文件一并恢复。只处理本批变更，保留其他任务修改。独立工程继续作为通用源码主维护位置，不建立双向源码复制。
