# weelume-backend

FastAPI 后端服务。

## 镜像构建

构建时如需走代理，通过 `--build-arg` 传入代理地址，并用 `--add-host` 让容器内能解析 `host.docker.internal`（Linux 环境必须）。

```bash
# 在 server/ 目录下执行
docker build --build-arg HTTPS_PROXY=http://192.168.32.1:7078  -t weelume-backend .
```

不需要代理时：

```bash
docker build -t weelume-backend .
```

## 运行时环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `MZ_AI_BACKEND_DATABASE_URL` | 是 | 数据库连接串 |
| `MZ_AI_BACKEND_ENV` | 否 | 默认 `production` |
| `MZ_AI_BACKEND_LOG_LEVEL` | 否 | 日志级别 |
| `MZ_AI_BACKEND_SNOWFLAKE_WORKER_ID` | 否 | Snowflake worker ID |
| `MZ_AI_BACKEND_SNOWFLAKE_DATACENTER_ID` | 否 | Snowflake datacenter ID |

## 本地开发

```bash
uv run python -m uvicorn src.main:app --reload --port 8000
```
