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
