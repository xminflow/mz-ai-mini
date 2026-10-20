# weelume-website

Next.js 官网前端。

## 镜像构建

构建时如需走代理，通过 `--build-arg` 传入代理地址，并用 `--add-host` 让容器内能解析 `host.docker.internal`（Linux 环境必须）。

```bash
# 在 website/ 目录下执行
docker build  --build-arg HTTPS_PROXY=http://192.168.32.1:7078  -t weelume-website .
```

不需要代理时：

```bash
docker build -t weelume-website .
```

## 运行时环境变量

| 变量 | 说明 |
|---|---|
| `PORT` | 监听端口，默认 `3000` |

## 本地开发

```bash
pnpm install
pnpm run dev
```

## Deformo 共享模板

Deformo 与 UIUXfolio 接入独立模板包，其余模板保持原布局。通用页面源码由各自独立工程维护，本工程的 catalog/deformo 与 catalog/uiuxfolio 仅为宿主适配。UIUXfolio 的命令在原命令后追加 `--id uiuxfolio`，默认不带参数仍操作 Deformo；具体见 `src/features/site-templates/catalog/uiuxfolio/README.md`。

本机可执行 `pnpm run template:local <模板工程目录>` 后 `pnpm dev`，直接引用源码并监听素材。deformo.local 与 uiuxfolio.local 被 Git 和 Docker 忽略；移走对应文件并重启即可恢复安装包开发。共享模板开发单独使用 .next-templates-dev，避免与生产构建或旧单模板客户端模块清单共用输出。

生产构建不读取本机路径。模板验证并提交后运行其 `pnpm run bundle`；在本目录执行 `pnpm run template:update <tgz>`、`pnpm install --no-frozen-lockfile`、`pnpm run template:check`、`pnpm run build`。部署时必须包含 vendor 中当前引用的包、templates/deformo.lock.json、package.json 与 pnpm-lock.yaml，冻结安装后可独立构建。

Docker 在安装前复制 vendor，构建时生成模板素材，运行镜像携带已编译代码与 public；无需模板仓库或本机 D 盘路径。public/templates/deformo 为生成目录，不手工编辑。旧远端素材采集脚本不属于当前更新流程，不要用它覆盖生成素材。

模板是否可访问沿用现有 TEMPLATES_MODULE_ENABLED 开关：开发默认开启、生产默认关闭。部署产物包含模板不等于公开入口已开启；需要生产预览时显式设置 TEMPLATES_MODULE_ENABLED=true 并重启服务，无需改变模板包或重新构建。

## Cerno 独立共享模板

Cerno 通用业务源码在 `D:/code/code-tpl/cerno-template/`，接入约定见 `src/features/site-templates/catalog/cerno/README.md`。命令追加 `--id cerno`；本机 `cerno.local` 直接引用源码，生产依赖 `vendor` 固定包及 `templates/cerno.lock.json`，不读取本机目录。16 个页面提供中英文，PC / iPad / H5 共用响应式站点，详情为 `/templates/cerno`。完整实施与验收记录见 `../docs/cerno-template-delivery.md`。
