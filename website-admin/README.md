# website-admin

## 项目简介

weelume 官网 `camp_auth` 用户管理端，独立的 Vite + React SPA，不与 `website` 官网共用构建产物，仅通过 HTTP API 与后端 `server` 交互。

## 技术栈

- Vite + React 19 + TypeScript
- Tailwind CSS v4（`@tailwindcss/vite`）
- 手写 UI 原语（无 UI 组件库依赖）
- react-router-dom

## 本地开发

### 前置条件

1. 后端服务在本地运行：

   ```bash
   cd server
   uv run python -m uvicorn main:app --reload --port 8000
   ```

2. `server/.env` 中已配置以下管理端专用变量：

   - `MZ_AI_BACKEND_ADMIN_USERNAME`
   - `MZ_AI_BACKEND_ADMIN_PASSWORD`
   - `MZ_AI_BACKEND_ADMIN_TOKEN_SECRET`

   若缺失任一项，管理端登录接口会返回 500（`secret not configured` 等提示）。这些变量在进程启动时读取并缓存于内存，**必须在配置好 `.env` 之后再启动/重启后端进程**，仅修改 `.env` 不重启不会生效。

### 安装与启动

```bash
pnpm install
pnpm dev
```

默认监听 `http://localhost:5175`。Vite 已将 `/api` 代理到 `http://127.0.0.1:8000`，本地开发无需处理跨域。

登录成功后可对 `camp_auth` 用户执行：

- 列表查询、按用户名/邮箱搜索、按状态筛选
- 启用 / 禁用账号
- 会员等级管理（`none` / `basic` / `premium`）及到期时间设置
- 逻辑删除用户

## 构建

```bash
pnpm build
```

等价于 `tsc -b && vite build`，产物输出到 `dist/`。

## 生产部署要点

- 该 SPA 只是静态产物，需要与后端 API 建立可访问的调用路径，二选一：
  - 与后端 API 同源反向代理（推荐，天然规避跨域）；
  - 或后端显式配置 `MZ_AI_BACKEND_ADMIN_CORS_ORIGINS`（逗号分隔的来源列表）放开管理端域名，默认不允许跨域。
- 登录令牌为无状态 HMAC token（非 JWT 库签发），前端登录后存入 `localStorage`，后续请求以 `Authorization: Bearer <token>` 携带。
- 令牌有效期由后端 `MZ_AI_BACKEND_ADMIN_TOKEN_TTL_MINUTES` 控制，默认 720 分钟（12 小时），过期需重新登录。

## 鉴权说明

管理员账号是后端配置文件中的单一账号（用户名 + 密码），**没有独立的管理员用户表**，不支持多管理员、注册或找回密码，账号变更需通过修改后端环境变量并重启进程完成。
