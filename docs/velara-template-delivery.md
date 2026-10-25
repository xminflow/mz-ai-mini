# Velara AI 主站接入与截图修复记录

**主站3000的封面和三端截图已修复并实际验证。完整原站动效逐帧矩阵仍未完成，不声明全部复刻验收通过。**

## 问题根因及修复

首次接入时截图元数据只有待采集路径，.tpl/assets 没有真实截图文件，导致封面和详情画廊为空。之前因浏览器工具失败而将截图留作待办，未完成此项验收，不能将当时的接入状态视为完整交付。

随后发现常用3000主站运行在独立WSL副本，和仓库、43621验收实例不同；已增量同步到实际服务。本次截图修复同时更新独立源码、仓库、固定包和实际3000实例。更新固定包后，Next曾缓存旧版单张截图元数据，重载开发服务后已验证三组各四张。

## 截图采集

截图在 **Windows 本机** 使用已安装Chrome的独立无登录上下文采集，只访问本地页面，不使用用户浏览器个人资料。截图没有通过WSL采集；WSL仅用于项目规定的安装、构建和打包。

| 设备 | 实际像素 | 页面 |
| --- | --- | --- |
| PC | 1440×1000 | 首页、功能、博客、联系 |
| iPad | 834×1180 | 首页、功能、博客、联系 |
| H5 | 390×844 | 首页、功能、博客、联系 |

12张真实页面图转换为WebP，保存于独立工程 .tpl/assets，并由共享包同步到 website/public/templates/velara/screenshots。同步器只管理本模板目录。没有放大、拼造或使用其他模板图片。

采集等待本地字体、图片、入场完成。所有拍摄视口无横向溢出、损坏图片或页面脚本异常；三端首屏视频有实际播放时间。截图不代表全部动效运行矩阵通过。

## 源码及固定包

- 独立工程：D:/code/code-tpl/velara-template。
- Git：https://github.com/weelume/velara-template/tree/codex/velara 。
- 版本1.0.1，提交9f60097d3fbea6d43af2a990b08506cfbaaafcd3，已推送并通过git ls-remote核对。
- 固定包：website/vendor/velara-template-1.0.1-6e3e393ead8d.tgz。
- SHA256：6e3e393ead8d96bf621400a8a771411b9e45142e83c6c81f1d791d18c66ef2f7。
- website/templates/velara.lock.json 的提交和摘要一致，sourceDirty=false。package.json与pnpm生成的锁已更新；保留其他模板并行修改。
- 生产仅消费固定包。本地velara.local引用独立源码，运行素材不手工修改。
- 独立工程stage=ready；严格协议检查与验收报告源码摘要匹配。摘要687ebd18420f1c6d0dfe5285a0356ad5573dbdc3c55cb373a47e2709449d8070。

源码ZIP：https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/velara/1.0.1-9f60097d3fbea6d43af2a990b08506cfbaaafcd3/563f0dcb9d10ca766d4d04852abb7b97cf673bffe42a4754219dadbf90ca8e41.zip

ZIP为7,447,690字节，SHA256为563f0dcb9d10ca766d4d04852abb7b97cf673bffe42a4754219dadbf90ca8e41。用户明确授权新版上传后，通过既有COS SDK上传及匿名完整下载，SHA256和ZIP完整性均通过。releases.json与固定包一致；旧对象保留。

## 验证结果

独立源码的安装、编译和运行包生成位置：/home/xmin/workspace/velara-20261025/velara-template 与 package-source-1.0.1，均为本机WSL Linux文件系统。没有在服务器构建。Node24.16.0、pnpm9.15.4，无新增第三方库。

| 检查 | 结果 |
| --- | --- |
| 独立 typecheck、lint、3项契约测试、build | 全部通过 |
| 新版独立生产服务 | 22条双语路径200，验证专用服务已停止 |
| 独立 check --require-verified | 通过，源码摘要与实际报告匹配 |
| 3000运行副本固定包、类型及适配lint | 通过 |
| 主站12张图片HTTP/尺寸/字节 | 全部通过，与独立源文件一致 |
| 主站封面 | 实际1440×1000图片已显示 |
| 画廊设备组及缩略图切换 | PC/iPad/H5三组，每组4张，全部实际加载通过 |
| 浏览器页面异常 | 未发现脚本错误 |
| Velara源码ZIP与固定包一致性 | 仓库和3000运行副本均通过 |
| 主站全量类型检查 | 过期增量缓存导致一次检查失败，禁用增量后真实全量检查通过 |
| 正式主站build | 当前被benjamen源码ZIP未发布门禁阻塞；不宣称全站生产编译通过 |

主站build未绕过门禁。template:release的Velara上传下载步骤通过，末尾全站检查同样受benjamen缺失记录阻塞。未修改其他模板消除门禁。

证据：artifacts/velara/screenshots/capture-report.json、artifacts/velara/main-gallery/verification.json、.work/velara/source-checks.json、service-check.json、host-build-1.0.1.log。目录及三端画廊实际画面在artifacts/velara/main-gallery/。

## 主站位置与范围

用户主站：http://localhost:3000/templates ，详情：http://localhost:3000/templates/velara ，页面：http://localhost:3000/templates/velara/site 。

实际运行副本：/home/xmin/workspace/weelume-dev-20261025/website。43621仅是隔离验收实例。独立业务页面11个、双语路径22条，主站只注入品牌、市场入口和TemplateFiling示例备案，不复制通用页面。

参考：https://jiro.build/templates/fintech/ai-budget-tracking-landing-page-velara-ai 。新增功能、博客、联系及政策等内页为同风格扩展。原站完整三端动效逐帧一致性、系统减少动态及全部交互矩阵仍未完成，见独立工程.tpl/docs/MOTION.md。源码公开预览的视觉实现不等于原站受限源码。

第三方设计、视频与头像商业再分发许可待核实，listed=false、redistributionAllowed=false。账户、价格、评价均为演示，表单只校验、不发送、不保存。未部署服务器、未市场上架、未推送主站仓库。

后续更新独立源码后需验证、提交/推送、干净副本bundle、template:update、pnpm更新锁、源码ZIP发布及实际主站同步。回滚需一并恢复Velara运行包、模板锁、依赖声明/锁与发布记录；旧COS对象保留。
