# 模板 ZIP 发布验收记录（2026-10-21）

## 已完成

- 13 套已独立化模板：cerno、conicorn、deformo、foldex、furnexa、grovia、latte、mondragon、souma、uiuxfolio、viral、lunera、noirei。
- 总计 311,556,984 字节。所有 ZIP 来自干净的已提交源码，12 套共享模板的源码提交与主站生产快照一致。
- 全部上传既有 COS 的 `website/template-packages/` 专用前缀；逐个匿名 GET 后 SHA256 与本地一致，下载 ZIP 的 CRC 与必需工程文件检查通过。未改变存储桶 ACL。
- 地址、版本、源码提交、大小、ZIP SHA256 和生产快照摘要见 `website/templates/releases.json`。本次清单文件 SHA256：`6bf4167b4e63b1fd0aa796a3f4ec527a7a4d3fe6c21f77ec2dd24234f2759528`。
- 市场详情提示词和真实剪贴板内容均已切换为对应 COS ZIP 地址，Git 元数据保留。

## 实际执行位置与验证

- 打包位置：本地 Ubuntu WSL，`/home/xmin/workspace/template-zip-release-20261021/`。从 Windows 模板目录只读获取 Git 对象，在 WSL Linux 文件系统生成 ZIP；未在服务器打包或构建。
- 上传位置：本机 Windows，使用现有 `server/.venv/Scripts/python.exe` 及既有 COS 适配器，读取 WSL 中同一份 ZIP 上传。
- 主站构建位置：本地 Ubuntu WSL，`/home/xmin/workspace/template-zip-check-20261021/website/`，复用现有 WSL 依赖，未新增或升级依赖。
- `python3 -m unittest discover -s scripts -p test_template_release.py`：4 项通过，包含危险文件拒绝、组件包不完整拒绝、公开下载损坏不切换清单及成功重试。
- `node --test website/scripts/tests/template-release.test.mjs`：通过，覆盖缺包、快照改变和临时签名链接拒绝。
- `node website/scripts/template-release-check.mjs`：13 套发布记录通过，12 套共享快照一致。
- `node scripts/next-with-templates.mjs build`：通过生产编译、类型检查和页面生成；现有部分模板存在 unused eslint-disable 警告，不在本次修改范围。
- 本地候选实例 3031 端口运行；`node scripts/verify-template-download.mjs` 对 13 套已发布模板逐一展开教程、验证 COS 地址并读取真实剪贴板内容，全部通过；liubai 未发布 ZIP 时复制禁用，提示明确；无未捕获浏览器异常。
- 浏览器验收仅在测试上下文模拟 `/api/auth/me` 的已登录响应；未修改服务端鉴权，也未重新验证真实账户登录链路。
- 截图及浏览器结果：`artifacts/template-zip-release/`；构建与运行日志同目录保存。该目录是本机验收产物，不进入源码交付。

## 边界与遗留项

- 尚未部署线上主站，当前线上提示词不会因本地代码更新自动改变。COS ZIP 已真实上传并公开可下载。
- Deformo 当前快照和 ZIP 使用 `8018ee8696d0456a909e1b14c18ba4aa39025f86`；本次核对远端 main 及旧 Git 交付记录仍为 `814a874794b899df1f1d6c3f92f76e8fd9765817`。发布工具显式记录差异，本任务没有推送 Git 或修改旧交付记录。
- 本次没有逐个重新安装并启动下载后的 13 个独立工程；已验证完整已提交源码归档、公开下载字节、主站构建与提示词交互，不能将这些结果描述为全部独立模板应用重新验收通过。
- 未独立化模板没有推测下载地址，不会退回 Git；待按独立化及发布流程交付。
