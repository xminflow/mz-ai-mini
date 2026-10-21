# 模板源码 ZIP 发布

Git 地址保留为源码来源；市场提示词只使用 `website/templates/releases.json` 中经过公开下载验证的 COS ZIP 地址。没有已发布 ZIP 的模板禁用复制，不退回 Git 地址。

## 更新顺序

1. 独立模板完成适用检查、页面验收和源码提交；按既有 Git 交付约定维护远端及记录。
2. 共享模板在本地 WSL Linux 文件系统中 bundle，主站 `template:update --id <id> <tgz>`，由 pnpm 更新锁文件。ZIP 要求快照的 `sourceCommit` 与模板当前干净提交一致。
3. 在主站 `website` 执行 `pnpm template:release`。Windows 入口调用本地 WSL `python3` 在 Linux 文件系统生成 ZIP，上传使用已有 `server/.venv` 中的 COS SDK，不安装依赖。Linux 入口须运行在本地 WSL。
4. 执行 `pnpm template:release:check`，在本地 WSL Linux 工程中构建并验证受影响详情页，再按既有流程部署相同产物。此任务不自动部署主站。

发布范围来自 `docs/template-repositories.json`。默认 Linux 产物目录 `/tmp/weelume-template-release`，可通过 `TEMPLATE_RELEASE_OUTPUT` 指定本地 Linux 路径；`TEMPLATE_RELEASE_PYTHON` 可指定已安装项目 COS SDK 的 Python。

增量交付使用 `pnpm template:release --ids id1,id2`。只对指定且已登记的模板打包、上传、匿名下载和校验，全部成功后合并发布清单；其他模板的记录和对象保持不变。分步执行时 `pack` 与 `publish` 必须使用相同 `--ids`，建议为每批指定独立产物目录。重复、未知、空 ID 或不匹配的打包清单会被拒绝。末尾的发布检查仅核对本地清单及快照关系，不访问历史模板页面。

也可分步执行：

```text
# 本地 WSL，输出必须在 Linux 文件系统
python3 scripts/template_release.py pack /tmp/weelume-template-release
# 已有服务端 Python，可在 Windows 使用 WSL 目录的 UNC 路径
server/.venv/bin/python scripts/template_release.py publish /tmp/weelume-template-release
```

## 产物与安全边界

- ZIP 来自 `git archive` 的已提交完整工程，包含启动配置、依赖锁及 `.tpl` 使用说明；不是主站消费的 `.tgz` 组件包。
- 拒绝路径越界、符号链接、依赖目录、构建缓存、日志和私密配置。保留无真实凭据的 `.env.example` / `.env.sample`。
- 复用 `CosStorageSettings` 和 `CosStorageClient`，凭据从服务端既有环境读取，禁止写入前端或日志。
- 对象键：`website/template-packages/<id>/<version>-<sourceCommit>/<sha256>.zip`，长期公开下载；不会配置或放宽整个存储桶 ACL。若现有策略不允许公开读取，发布直接失败。
- 上传后匿名 GET 完整 ZIP，校验 SHA256 和 ZIP CRC；全部成功才原子替换主站发布清单。旧内容寻址对象保留用于回滚，上传失败允许重跑，不删除已有对象。
- `pnpm build` 自动校验所有共享模板已发布，且 ZIP 的源码提交与生产快照摘要一致，拒绝临时签名地址。

## 回滚与验收

回滚时将主站模板 vendor、快照锁、依赖锁及发布清单一起恢复至前一已验收版本，再在本地 WSL 构建；服务器不构建。清单未切换时无需回滚；部分上传成功的未引用对象不影响线上。

自动检查：`python3 -m unittest discover -s scripts -p test_template_release.py`、`node --test website/scripts/tests/template-release.test.mjs`、`pnpm template:release:check`。页面验收应验证登录后展开教程、复制提示词，以及未发布模板的禁用状态。ZIP 下载校验不等于重新对每个模板进行应用启动验收；源码功能验收沿用各模板对应提交的既有记录。
