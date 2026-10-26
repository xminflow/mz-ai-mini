# Designfast 模板交付记录

参考站：https://designfast-demo.framer.website/ 。按 docs/template-replication-guide.md 实现，使用 Codex 内置浏览器观察与操作。未部署或推送主站，模板保持 listed=false。

## 源码与产物

- 独立主维护工程：D:/code/code-tpl/designfast-template/。
- Git：https://github.com/weelume/designfast-template ，分支 main，提交 15decf989c0c0d0cafb4f49c2235a61289c5064a，已推送且远端一致，工作树干净。
- 主站仅保留 catalog/designfast/meta.ts、weelume.tsx，注入微域生光品牌、现有Logo、市场入口和TemplateFiling。
- 固定包：website/vendor/designfast-template-1.0.0-215b412bd746.tgz；SHA256 215b412bd746c4ca31e3d12a44a89b96fca31cd3fe0a32bd7106fc3f6c6b051e，sourceDirty=false，提交与Git一致。
- 配套交付 website/templates/designfast.lock.json、package.json、pnpm-lock.yaml、templates/releases.json；依赖锁由本地WSL pnpm生成。没有新增第三方依赖版本。
- [完整源码ZIP](https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/template-packages/designfast/1.0.0-15decf989c0c0d0cafb4f49c2235a61289c5064a/35252538a8087e02979679f3b3ffcb382c931743143ca951b69aa27ecb4930de.zip)：10,939,471字节，SHA256 35252538a8087e02979679f3b3ffcb382c931743143ca951b69aa27ecb4930de。既有COS SDK上传后匿名完整下载，摘要和ZIP CRC通过；未修改桶权限。

## 实现范围

19页、38条双语路径：首页；服务列表及品牌识别、平面设计、Framer设计、网站设计四详情；案例列表及六详情；关于；联系；法律入口及隐私、Cookie、服务条款。默认中文，英文为端路径后/en，切换保留当前页面、查询参数和锚点。

config/brand.ts 管理品牌，content/ui.ts 管理界面文案，content/data.ts 管理业务资料，content/details.json 管理60节双语详情。主题、公共组件、页面组合与路由分别维护。图片字体本地托管，61项图片/图标来源记录及字体许可保留。参观视频使用原站相同YouTube按需嵌入，不是离线视频文件。

动效参数按原站公开资源静态分析和实际行为校准：标题上移10px、spring .4秒、逐词.075秒、延迟.4秒；区块.8秒、延迟.2秒；导航/卡片spring .6秒；作品/服务/客户标志20px/s，工具10px/s两排反向。手机服务纵向向上。评价为手动分页、前后、方向键和真实拖拽，弹簧stiffness=500/damping=60/mass=1，没有自行加入自动轮播。FAQ弹簧展开。图表、通知和聊天按原站作为静态示意，未添加持续循环、无依据视差或装饰箭头。完整清单见独立工程.tpl/docs/MOTION.md。

## 已验证

全部安装、编译、打包在本机WSL Ubuntu Linux文件系统完成。独立验收目录 /home/xmin/workspace/designfast-20261026/designfast-template；固定包来自 release-source 干净克隆；主站隔离目录 /home/xmin/workspace/designfast-20261026/website。

- 独立工程 pnpm typecheck、pnpm lint、pnpm test（3项路由回归）、pnpm build 通过。隔离生产服务全部38路径成功后已停止。
- node .tpl/tools/check.mjs . --require-verified 在Windows主工程及WSL干净克隆通过，摘要一致，报告绑定实际结果。
- 内置浏览器巡检19页×2语言×4视口（1440×1000、834×1180、390×844、320×844）共152组合，无标题缺失、横溢出、已加载坏图。
- 已实测菜单展开、背景锁定、Escape关闭与恢复；语言切换保留详情/query/hash；FAQ展开关闭；评价分页/前后及真实拖拽切换；循环位移与焦点暂停恢复；表单本地校验并明确未发送、未保存。
- YouTube点击加载后已在内置浏览器观察到实际播放至结束；仍依赖第三方网络。
- 十二张三端真实截图已更新：首页、服务、案例、联系各三端。配置视口与实际输出不同：PC1430×993、iPad824×1166、H5380×822；原始JPEG转WebP不缩放、不放大，元数据填写实际像素。内容宽度少10px为滚动条占宽。
- 主站 pnpm exec tsc --noEmit、Designfast适配ESLint、pnpm template:check --id designfast、pnpm template:release:check 通过。ZIP流程末尾曾被其他模板并行更新拦住，随后全站发布检查已通过。
- 主站浏览器已确认微域品牌、市场入口/templates、页脚市场文案及“示例ICP备00000000号”。

主站最终构建结果在本记录末尾补充。首次开发/构建共用.next造成清单覆盖，随后分别使用 WEBSITE_BUILD_DIR=.next-designfast-dev / .next-designfast-build；第二次构建由内核OOM终止，已关闭本任务预览并设置 NODE_OPTIONS=--max-old-space-size=4096 后重跑。没有停止其他运行服务。

## 验收边界

全部页面、全部断点、完整时间轴逐帧一致性、真实触控设备、系统减少动态切换尚未全面验证，不能标记“完整动效复刻验收通过”。152项巡检和静态截图不替代完整动效矩阵。

第三方设计、照片、图标、视频的商业再分发许可未核实，保持restricted、redistributionAllowed=false。没有后端、数据库、支付或真实表单发送。

## 预览与回滚

独立预览：http://localhost:43632/ 。主站隔离预览：http://localhost:43634/templates/designfast/site 。现有3000服务未替换，可能尚未读取此次模板。

回滚时一起恢复Designfast固定包、模板锁、依赖声明、pnpm锁、发布清单对应条目，在本地WSL构建；旧COS对象保留，不删除或覆盖。宿主适配和注册中的Designfast增量配套处理，不回滚其他模板或用户修改。

## 最终主站验收结果

已在本地WSL以4GB Node堆限制完成生产构建，退出码0。使用同一份 .next-designfast-build 产物启动43634实例，全部38条Designfast中英文路径返回200并包含模板正文与示例备案。

内置浏览器生产验证：英文服务详情切中文保留 ?source=qa#details；微域品牌与中英市场ARIA正确；点击市场入口到/templates后.df-root已移除且模板滚动条选择器不再生效；新标签页设备预览的H5 iframe为390×844，iPad为834×1180，只缩放设备外壳。已保存主站首屏和设备框截图。当前43634为生产构建预览，保留运行供查看；此前本任务的开发进程已关闭。

构建仍有其他模板既存的CSS import顺序、playbook无效eslint-disable和Next ESLint配置提示，不阻止构建，本次未修改这些无关内容。通用模板路由First Load JS约1.39MB，后续可独立优化注册表的按模板拆包，避免模板数量增加持续推高首包。

后续人工检查：在实际iOS/Android设备拖拽评价和滚动；切换系统减少动态设置后检查标题、循环与FAQ；对照.tpl/docs/MOTION.md在三端逐项记录完整时间轴。完成这些检查前仍保留动效验收边界，不宣称完整逐帧一致。

最终构建ID：I2n9K11EDhK6ZXjEbZsh0；app-build-manifest.json SHA256：6fe0e30be46e3e125a4926f487a3aedc3c265470f4cac5aae859089f395f2a5b（清单摘要，非完整部署包摘要）。最终生产首屏浏览器控制台无error，默认1280×720预览无横向溢出。

## 3000开发主站同步

已按用户后续要求将Designfast增量同步到 /home/xmin/workspace/weelume-dev-20261025/website，先备份涉及配置，仅新增Designfast依赖、适配、注册、固定包和发布条目，保留其他模板内容。WSL离线pnpm安装仅新增该包，类型检查与template:check通过；目录已更新为56套。3000首次编译约49秒，随后 /templates/designfast/site 返回200；内置浏览器已确认微域生光品牌、正文和无横向溢出。直接预览改用 http://localhost:3000/templates/designfast/site 。
