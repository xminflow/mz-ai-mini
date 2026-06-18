# website-aicamp

AI 编程实战训练营独立站点(从 `website` 工程迁移而来),为纯静态内容页,**无后端 API 依赖**,可独立部署、独立启动。

## 运行

```bash
pnpm install
pnpm dev      # 开发,端口 3100
# 或
pnpm build && pnpm start   # 生产,端口 3100
```

访问 http://localhost:3100/

## 说明

- 技术栈与原 `website` 一致:Next.js 15(App Router)+ React 19 + Tailwind v4 + framer-motion。
- 训练营页面挂载在根路由 `/`。
- 仅迁移了页面所需的组件子树:`motion`、`ContactQrCodeModal`、`pages/ai-coding-camp/*`,未迁移依赖鉴权的 `TopNav` / `SiteFooter`。
- 本地资源仅 `public/contact.jpg`;讲师头像为远程 COS URL,无需本地文件。
- Windows 本地构建未启用 `output: 'standalone'`(需符号链接权限);容器化部署时在 Linux/Docker 下再开启。
- 原 `website` 工程中的训练营页面与组件**保留未删除**。
