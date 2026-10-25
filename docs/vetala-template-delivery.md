# Vetala 复刻与主站接入

## 当前交付状态

已实现双语整站与主要交互，独立源码提交、推送、固定共享包和源码 ZIP 下载校验完成。**未标记“完整复刻验收通过”**：三端指针拖拽释放、系统减少动态效果及全站逐帧对照仍未完整验证。主站完整工作区还存在其他并行模板的未完成项，接入范围验证与全量验证分别记录。

依据：[整站模板复刻规范](./template-replication-guide.md)。参考：[Jiro Vetala](https://jiro.build/templates/ai-agents-chatbots/ai-employee-marketing-website-vetala)。公开预览是11区块单页；保留首页结构与区块顺序，按整站文档补充原创双语内页。中文字号、玻璃卡片、品牌和禁止装饰箭头按项目规范调整。

## 源码与接入

- 独立主维护工程：`D:/code/code-tpl/vetala-template`。
- Git：<https://github.com/weelume/vetala-template>，分支 `codex/vetala`。
- 最终提交：`16ca0042f3b49f452d66cc0dd8a17cbeeb26e55e`；通过用户提供的代理正常推送，`git ls-remote` 已核对远端一致，无强推。
- 主站仅有 `website/src/features/site-templates/catalog/vetala/meta.ts` 与 `weelume.tsx` 适配，注入微域生光、既有 Logo、市场入口与示例备案，通用业务代码不复制到主站。
- 本地 `vetala.local` 指向独立源码；生产使用固定 vendor 包，不读取本机源码路径。
- 9个页面、18条双语路由：首页、功能、博客、三篇演示文章、联系、隐私说明、使用说明。默认中文，英文位于端路径后的 `/en`，客户端导航，切换保留页面、查询参数和锚点。
- 本地 MiSans 400/700、Poppins 400/600/700。运行图片、视频、Logo、字体及素材来源均在独立工程；主站素材由共享包同步器生成。
- 十二张真实截图覆盖首页、功能、博客、联系，原始像素为1440×1000、834×1180、390×844；通过明确截图裁剪区域生成并验证，未放大图片。

## 动效与实际验证

已实现首屏左右视频寻帧与移动端交替播放、标题逐字弹簧错峰、两侧入场、25秒伙伴循环、真实矩形插值的视频滚动展开、逐词变色、对比放大镜、功能图文切换、指标增长、15节点弹性波面与可拖拽物理徽章、3.5秒弹簧评价轮播、24秒半椭圆工具轨道、月年价格和权益切换、FAQ、CTA与页脚入场。

实际浏览器已验证：

- 桌面指针移动使右视频进度到2.29秒、左视频到1.93秒，显示正确切换。
- 手机右视频实际播放后结束，左视频开始播放；不是用静态图片替代。
- 三端介绍视频从小尺寸连续扩展到中间状态；三端指标最终到79%、+39%、147%。
- 年付月均价格变为39/119/239美元，FAQ切换正常。
- 空表单显示错误，有效输入明确提示“未发送、未保存”；不访问外部发送服务、不持久化输入。debug只记录结果与字段名。
- 手机菜单展开后可跳转英文资源页并关闭；语言切换保留 `contact?check=1#vt-main`。
- 桌面、iPad、H5四类页面无横向溢出或损坏图片；320px英文博客无溢出。浏览器控制台未见错误。

未完成：全量三端逐帧轨迹、完整拖拽释放/邻接碰撞、系统减少动态效果实测及所有循环悬停恢复矩阵。评价暂停恢复的后续浏览器调用遇到CDP连接超时，未将该操作记为通过。独立 `.tpl/docs/MOTION.md` 区分参数实现与实测范围。中文重绘示意图与原图有排版差异，工具图标使用轻量符号，原始视频内部英文界面保留。

## 固定运行包与源码 ZIP

- 运行包：`website/vendor/vetala-template-1.0.1-1ddd1c5d70b3.tgz`。
- 运行包 SHA256：`1ddd1c5d70b37bbe55f9b582cf01b73f65af746721be6e884c17300537c4931d`。
- 溯源：上述最终提交，`sourceDirty=false`。
- [完整已提交源码 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/vetala/1.0.1-16ca0042f3b49f452d66cc0dd8a17cbeeb26e55e/c91639f7d8b755b49cde06a117ae27bd0cd9569b5b09a4ff678a4fe71633d24a.zip)。
- ZIP SHA256：`c91639f7d8b755b49cde06a117ae27bd0cd9569b5b09a4ff678a4fe71633d24a`，12,569,445字节。
- 使用既有 `pnpm template:release --ids vetala`，在本地WSL Linux文件系统打包，复用现有COS SDK上传，匿名完整下载并校验SHA256与ZIP完整性。Vetala专用发布检查通过。
- 发布器末尾的全量检查在不同时间被并行Estaymart/Pawlio缺少源码ZIP阻断；Vetala对象本身已通过上传及下载验证。并行发布曾从旧清单写回，覆盖本模板新增记录；已根据经过校验的产物元数据，仅恢复Vetala并保留其他条目。建议后续独立任务为发布流程增加跨进程互斥或版本比较，避免丢失更新。

## 构建位置与检查

依赖安装、编译、运行包和源码ZIP打包均在本机WSL Ubuntu的Linux文件系统完成，没有使用远端服务器或远端builder。

- 独立干净克隆：`/home/xmin/workspace/vetala-20261025/package-source`。
- 开发验收副本：`/home/xmin/workspace/vetala-20261025/vetala-template`。
- 主站隔离验收副本：`/home/xmin/workspace/vetala-20261025/website`。
- Node24.16.0、pnpm9.15.4，沿用已有依赖版本。

|检查|结果|
|---|---|
|独立冻结离线安装|通过|
|`pnpm typecheck`、`pnpm lint`|通过|
|`pnpm test`|6项通过，含语言路由与锚点回归|
|独立`pnpm build`及生产HTTP|通过，18条双语路由200、未知路由404；报告专用服务已停止|
|独立`check --require-verified`|通过，源码摘要匹配|
|主站`template:check --id vetala`|通过，版本、SHA与提交一致|
|Vetala宿主改动文件ESLint|通过|
|Vetala专用ZIP清单检查|通过|
|主站完整工作区类型/发布检查|受Estaymart未完成依赖/ZIP及共享注册表重复Consutech阻断，正式登记未改|
|主站隔离接入构建|1.0.1通过；临时验收副本排除未完成Estaymart并去除重复Consutech登记，不能代表完整工作区通过|

独立验收报告为 `.tpl/reports/verification.json`，源码摘要 `8c032225ea163217eb9e544ef4d498f87a1c5d6c9d9f7c668373b90500108238`。主站证据在 `artifacts/vetala/`，包括真实HTTP、构建日志、三端视口、视频状态、源码ZIP元数据与页面截图。

## 风险与边界

参考设计、照片、视频、Logo及商业再分发权利尚未完整核实；保持 `listed=false`、`redistributionAllowed=false`，未进行市场上架。公开源码/ZIP不表示已获得素材商业授权。

未推送主站仓库，未部署主站或远端服务器。其他模板和用户原有修改保留。回滚Vetala需同时回滚运行包、模板锁、依赖声明/锁及发布清单中的Vetala条目，旧COS对象保留。

## 1.0.1 视频取消误报修复

主站浏览器检查发现切换设备尺寸时，旧的play()请求被正常pause()取消，却显示失败条。根因是未区分视频effect的生命周期；现为每个播放请求维护当前标记，清理时先取消所属关系再pause，过期回调只记录debug取消，真实失败保留error语义。手机播放切至1440px桌面实测错误提示数量始终0；独立检查、构建、严格报告及新Git/包/ZIP已更新。

## 最终主站检查

1.0.1主站隔离范围生产构建通过；29项真实HTTP检查再次通过。浏览器确认微域生光品牌、市场入口、示例备案、无横向溢出及视频错误条。H5设备iframe真实390×844、iPad834×1180，框内菜单跳转博客后切换设备仍保留页面；证据device-frame.json。

本地预览：http://localhost:43580/templates/vetala/site 。构建副本范围限制见artifacts/vetala/integration-scope.json；未将隔离范围构建描述为并行工作区全量通过。

最终复核：固定包、package.json、pnpm-lock.yaml及已匿名校验的ZIP均指向1.0.1。正式独立工作区干净，严格报告摘要通过。主站最终浏览器未显示视频失败条；最终截图为artifacts/vetala/host-desktop.jpg。自动审批曾拒绝修改正式Consutech重复登记，理由为超出Vetala最小范围；仅验收副本作隔离处理，未据此修改正式其他模板登记。
