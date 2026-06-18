# community-backend

「知识汇 · Community」通用知识问答社区的后端服务。基于 **FastAPI + SQLAlchemy（async）**，
严格沿用仓库内 `server/`（`mz_ai_backend`）的 **DDD + 整洁架构** 约定（`domain / application /
infrastructure / presentation` 四层），与现有后端解耦独立部署。

本期为**骨架版**：仅提供应用工厂、配置、数据库、结构化日志、统一异常/响应协议与 `/health`
健康检查端点，**不含任何业务模块**。后续业务模块按 `modules/system` 的四层范本逐个新增。

## 目录结构

```
community-server/
├── main.py                       # 入口（端口 8001）
├── pyproject.toml                # 依赖（uv 管理）
├── .env.example                  # 环境变量样例
└── api/
    ├── src/community_backend/    # 应用包
    │   ├── core/                 # 框架边界与共享基础设施
    │   ├── modules/system/       # 健康检查模块（四层范本）
    │   └── shared/               # 跨切面工具（预留）
    ├── migrations/               # SQL 迁移与执行器
    └── tests/                    # pytest 测试
```

## 环境变量

环境变量前缀为 `COMMUNITY_BACKEND_`，从仓库工程根的 `.env` 读取。参见 `.env.example`。

- `COMMUNITY_BACKEND_ENV`：`development` / `test` / `production`
- `COMMUNITY_BACKEND_LOG_LEVEL`：开发环境建议 `DEBUG`
- `COMMUNITY_BACKEND_DEVELOPMENT_DATABASE_URL`：开发库连接串

## 数据库

复用现有 PostgreSQL **实例**，使用**新建数据库 `community`**（与现有后端 schema 隔离）。
需先由 DBA/用户创建数据库：

```sql
CREATE DATABASE community;
```

连接串格式：`postgresql+asyncpg://<user>:<password>@<host>:5432/community`

## 运行

```bash
# 安装依赖
uv sync

# 启动开发服务（端口 8001）
uv run python main.py

# 健康检查
curl http://127.0.0.1:8001/api/v1/health
```

## 迁移

迁移执行器会自动创建 `schema_migrations` 元表，并按文件名顺序应用 `migrations/*.sql`
中尚未应用的迁移（已应用的跳过，可重复执行）。本期无业务表。

```bash
uv run python api/migrations/run_sql_migrations.py
```

## 测试

```bash
uv run pytest
```

健康检查测试不依赖真实数据库。
