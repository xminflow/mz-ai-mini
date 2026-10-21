# 剩余七套旧模板迁移与源码 ZIP 交付

日期：2026年10月21日（Asia/Shanghai）。本批范围为 hellomonday、liubai、nubo、recueil、studiothink、tabfolio、unseen。只做本批增量验收，未访问历史 13 套模板页面；历史发布记录逐条一致。

## 交付与下载

独立工程位于 D:/code/code-tpl/<id>-template，均为 .tpl 0.2.0、main 分支、版本 1.0.0；源码已普通推送，未重写远端历史。Git 地址同步至独立 .tpl/template.json、主站 gitUrl 和 docs/template-repositories.{json,md}。

| 模板 | 页面 | Git 提交 | 已验证 COS 源码 ZIP |
| --- | --- | --- | --- |
| hellomonday | 88 | [ae22ade9e5c7](https://github.com/weelume/hellomonday-template/commit/ae22ade9e5c7264fdbc05b2f78e8039786362df4) | [下载 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/hellomonday/1.0.0-ae22ade9e5c7264fdbc05b2f78e8039786362df4/fcc680d30eb688d036cd70426efd9a20564b56d09e7b9fa75d5dded9cc74db53.zip)（67.92 MiB） |
| liubai | 5 | [48a04153daf5](https://github.com/weelume/liubai-template/commit/48a04153daf553bb77ddd16f2f8b280d45df445d) | [下载 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/liubai/1.0.0-48a04153daf553bb77ddd16f2f8b280d45df445d/9304704c4c55c79c1b5dbbf6a2750968a213700f69047681b6051354dd2116f4.zip)（6.08 MiB） |
| nubo | 13 | [3e82b931c8ff](https://github.com/weelume/nubo-template/commit/3e82b931c8ffcb7d1c9fe38476b3e36c9f5146b5) | [下载 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/nubo/1.0.0-3e82b931c8ffcb7d1c9fe38476b3e36c9f5146b5/aeeb3e65de73244989791c450f6a167b6ac5ee5883230fc46823959a563b5825.zip)（15.80 MiB） |
| recueil | 3 | [a9bae6c51a4b](https://github.com/weelume/recueil-template/commit/a9bae6c51a4b1679b4f01dad7ceecc738532ea4a) | [下载 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/recueil/1.0.0-a9bae6c51a4b1679b4f01dad7ceecc738532ea4a/77f23dcccae64790fcbc43b4f4c2dac95c886633c718b1c80d7349b5c690c304.zip)（43.85 MiB） |
| studiothink | 4 | [532b4173b98d](https://github.com/weelume/studiothink-template/commit/532b4173b98da1fe87ea2596ce15c5b1fd4b7585) | [下载 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/studiothink/1.0.0-532b4173b98da1fe87ea2596ce15c5b1fd4b7585/45f76c79b7953113ee456e22c4b8f6a0b733634b3ac97cb7789f09dad362bda9.zip)（10.73 MiB） |
| tabfolio | 11 | [2055eb9ecbb6](https://github.com/weelume/tabfolio-template/commit/2055eb9ecbb630003a5b820b0e75351031888334) | [下载 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/tabfolio/1.0.0-2055eb9ecbb630003a5b820b0e75351031888334/f3c9fcf6fe3c6c6d22ff7cbdfac0c0a79394dd2d9ae9796ded809b4f2c970a6d.zip)（14.91 MiB） |
| unseen | 42 | [c9f996f65538](https://github.com/weelume/unseen-template/commit/c9f996f65538d02d6722ceb64403785e64dea8b2) | [下载 ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/unseen/1.0.0-c9f996f65538d02d6722ceb64403785e64dea8b2/f3618133bd654f7c9bd777e39e735e4f8be9420cea6f554d5c1d75bc74deae9f.zip)（56.03 MiB） |

ZIP 是 git archive 生成的完整已提交工程，包含启动配置、锁文件、源码、素材、.tpl 规则及自身验收资料。未包含依赖、缓存、日志或私密环境文件。上传使用既有服务端 COS SDK，逐个匿名 GET 验证 SHA256 与 ZIP CRC/路径安全后才合并发布清单；长期公开地址不带签名。旧对象保留。

## 迁移边界

主站 catalog 仅保留 meta.ts、weelume.tsx、README.md，通用页面直接消费独立共享包。开发使用各模板 .local 源码引用，生产只使用 vendor 固定版本与摘要，不读取本机路径。部署归档、templates/*.lock.json、package.json、pnpm-lock.yaml 和 releases.json 一并交付。运行素材与展示截图由包生成，不建立双向源码复制。

留白仅保留 5 个双语官网页面。已删除原 4 个管理后台页面、AdminShell、后台专用数据、注册入口和样式；独立 /admin 与主站 /templates/liubai/admin 均返回 404，ZIP 不含后台代码。后台相关作品介绍等官网内容不属于后台实现，继续保留。

独立模板各自携带字体与 Logo，不依赖宿主品牌素材；主站通过既有 Provider 注入 Logo、品牌、市场入口及备案。留白原设计无可见备案，继续保留；测试按实际 DOM 验证，排除 RSC script 序列化文本。页面缺失的演示 /404 使用显式路由。字体族与路径已核对，留白两种视口逐元素比较未发现工具类缺失，固有宽度差异来自两端滚动条和数字动画。

## 验收结果

| 检查 | 结果与范围 |
| --- | --- |
| 独立工程 | 7 套 typecheck、lint、test、build 通过；严格协议检查通过，源码摘要匹配 |
| 独立浏览器 | 196 个桌面/手机 × 双语页面组合，23 项交互通过；另覆盖本批全部 332 个双语注册路由 HTTP 状态及留白后台 404 |
| 主站浏览器 | 196 个组合、23 项交互通过；本批全部双语路由及留白后台删除通过 |
| 最后定点修正 | Nubo、StudioThink 悬浮市场入口恢复宿主品牌；新包及 ZIP 更新后，仅复核最终产物的 8 个品牌组合和这两套教程复制 |
| 包与素材 | 2636 个交付文件逐项 SHA256 一致；81 张截图映射一致 |
| 主站静态检查 | tsc --noEmit --incremental false、改动适配文件 ESLint、3 项包与发布测试通过 |
| 发布工具 | 5 项 Python 测试及 1 项 Node 发布检查测试通过；覆盖增量保留、失败不切换、重试和未知/重复 ID 拒绝 |
| 源码 ZIP | 7 套真实 COS 上传、匿名下载、SHA256 及 ZIP 完整性校验通过；历史 13 条记录未改变 |
| 教程提示词 | 仅本批 7 套展开与复制通过，提示词使用对应 COS ZIP，未回退 Git 地址；登录响应使用浏览器 fixture |
| 主站生产产物 | 本地 WSL Linux build 与 standalone 启动通过，服务端日志无异常，页面运行错误 0 |

增量发布命令：

```text
pnpm template:release --ids hellomonday,liubai,nubo,recueil,studiothink,tabfolio,unseen
pnpm template:release:check
node scripts/verify-template-download.mjs --ids hellomonday,liubai,nubo,recueil,studiothink,tabfolio,unseen
```

发布脚本支持 --ids；只打包、上传和下载核对指定模板，成功后原子合并清单。最后一次品牌修正只以 --ids nubo,studiothink 更新；其余 18 条不重发。过程见 docs/template-zip-release.md。构建期间的全局本地清单检查不访问历史模板页面。

## 构建产物与恢复

实际构建位置：/home/xmin/workspace/template-migration-seven-20261021/website。Linux x64，Node 24.16.0。standalone：/home/xmin/workspace/template-migration-seven-20261021/website/.next-remaining-seven/standalone。Build ID：JDkJsgTtEq4LEfjGkyrZO；产物目录摘要：4d3bdab0167e94f7024092649d3f985151e5388838c2845514e197f231439051。未使用远端服务器、远端 builder 或 CI 构建。未部署主站。

机器验收记录见 [verification/remaining-seven.json](verification/remaining-seven.json)，包含最终 Git SHA、快照摘要、ZIP SHA256/字节数与公开地址、浏览器逐项结果和构建摘要。原始日志与截图保存在 artifacts/template-migration，独立通用验收在各工程 .tpl/reports。

无数据库变更。需要回退时只恢复本批 catalog 备份 artifacts/template-migration/original/<id> 及对应素材跟踪、7 个依赖、包锁、vendor、pnpm 锁和发布清单；保留其他任务修改。源码与 ZIP 版本回退时必须同时恢复相互匹配的固定包和清单，再在本地 WSL 构建。旧内容寻址 ZIP 不删除。

未验证真实业务发送、远端全新克隆安装或 Docker；表单继续仅本地演示。参考素材商业及再分发授权仍待确认。未推送主站、未部署或改变市场上架状态。
