# 知识汇 · Community（前端）

「知识汇」通用知识问答社区（知识星球）的前端，基于 **Next.js 15 App Router**，SSR/CSR 混合渲染。

## 渲染分层

- `(marketing)`：落地页 `/`、星球简介 `/about` —— SSG，面向拉新与 SEO。
- `(public-content)`：公开帖 `/posts/[slug]`、专栏 `/columns/[slug]` —— ISR（`revalidate=3600`）+ OG 分享卡 meta。
- `(app)`：登录后区 `/feed`、`/new`、`/me` —— CSR，由 `src/middleware.ts` 校验会话保护。
- `/login`：登录页（CSR 表单）。

## 数据与鉴权

浏览器**永不直连** FastAPI（community-server）：

- 公开页在 RSC 内经 `src/lib/api/server.ts` 服务端取数（本期为 `src/lib/mock`）。
- 登录/登出/会话经 `/api/auth/*`；会话存 httpOnly cookie `community_session`。
- 登录后取数经 `/api/bff/*` 代理（校验 cookie 后转发）。

> 本期为**渲染架构骨架**：内容与登录均为 mock，真实鉴权与内容接口为后续迭代。

## 运行

```bash
pnpm install
pnpm dev          # http://localhost:8666
pnpm build && pnpm start
```

环境变量见 `.env.example`（`COMMUNITY_API_INTERNAL_URL` 指向 community-server，默认 `http://127.0.0.1:8001`）。
