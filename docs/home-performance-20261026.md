# 首页加载性能修复

## 根因与修改

- 线上首页引用 34 个 CSS，解压后合计 4,089,743 字节；其中混入模板专属样式及 2,957 条字体声明。一个首页 JS 包压缩后 1,066,293 字节，解压后 3,107,148 字节，包含多个模板的组件实现。
- 首页原先直接引用完整模板注册表。现在 `template:catalog` 从同一注册表生成纯展示 JSON，首页仅引用 `catalog-data.ts`；不手写第二份模板清单。生成器移除页面 `load` 属性，再由已有 TypeScript 工具消除仅供加载器使用的组件导入。注册表结构校验仍会执行，失败直接阻止启动或构建。
- `dev/build` 在 Next 启动前生成目录；开发模式监听宿主和显式配置的独立模板源目录，数据变更后重新生成。生产只读取已安装的固定模板包。没有修改任何独立模板或固定快照。
- 官网路由过渡设置 `initial={false}`，使服务端首屏默认可见，避免整页等待 JavaScript 后才从透明状态显示。
- Caddy 在两个官网域名追加的 `private, max-age=0` 与 Next.js 静态资源缓存头冲突，已仅移除这两条规则。其他域名及 API 配置保持原样。

## 检查命令

```bash
node --test scripts/template-catalog.test.mjs
python3 scripts/test_fix_caddy_cache.py
pnpm template:catalog
pnpm exec tsc --noEmit --incremental false
pnpm build
# 以同一生产产物启动临时实例后执行：
node scripts/check-home-resources.mjs http://127.0.0.1:<端口>
```

应用安装、生产编译和构建验收必须在本地 WSL Linux 文件系统完成。资源检查要求首页不超过 3 个 CSS、CSS 解压体积低于 600 KB、JS gzip 估算合计低于 400 KB，不包含已确认的模板运行资源标记，且不输出透明首屏容器。该脚本同时包括旧浏览器 polyfill，是资源上界核查，不代替浏览器 FCP/LCP 测量。

## 已完成验证

- 目录抽取测试通过：保留中英文元数据，且未执行仅供页面加载器使用的客户端依赖。
- 缓存补丁两项测试通过：只修改两个官网域名、重复执行不再修改、歧义配置拒绝处理。
- 新增 JavaScript 脚本语法检查及 `git diff --check` 通过。
- 线上 Caddy 候选配置 `caddy validate` 通过；核对差异仅删除两条追加缓存头，确认原配置 SHA256 未变后原子替换并平滑重载。
- 线上 HTTP 检查：首页及哈希 JS 均返回 200；JS 只包含 `public, max-age=31536000, immutable`，HTML 保留 `private, no-cache, no-store, max-age=0, must-revalidate`。

## 代理回滚

本次服务器没有安装依赖、编译源码或构建镜像，只修改并重载代理配置。

- 原文件：`/home/deploy/workspace/caddy/conf/Caddyfile`
- 备份：`/home/deploy/workspace/caddy/conf/Caddyfile.cache-0a0267ecfe1b.bak`
- 原 SHA256：`0a0267ecfe1b0e5023822901618b1ed487f0739a3fdbbdd2b80a88a649e8fbf4`
- 修改后 SHA256：`c03166addf8e57ad0005fac1a686e63f470b4bf5bf461828df64a25eb90d6f01`

需要回滚时先确认没有后续配置修改，再将备份恢复至原路径；执行 `docker exec caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`，通过后执行对应 `caddy reload`。不要用旧备份覆盖后续站点改动。

## 构建状态

本地 WSL 隔离目录：`/home/xmin/workspace/home-performance-20261026/website`。WSL 恢复后显式固定 Linux 运行时 PATH，使用 Linux Node 24.16.0 和已有 pnpm 11.6.0；`pnpm install --frozen-lockfile --offline` 成功，未新增、升级依赖或改写源工作区锁文件。

- `pnpm build` 通过，包含模板发布门禁、固定快照校验、素材生成、编译、类型检查与页面生成。Next.js 报告首页 First Load JS 为 164 KB。
- 独立执行 `pnpm exec tsc --noEmit --incremental false` 通过。
- 本次三个前端修改文件的 ESLint 检查通过。
- 在 WSL 运行同一构建的 `.next/standalone/server.js`，临时端口 43671；配齐同一构建的静态资源及生成素材后执行 HTTP 验收。
- 首页资源预算脚本通过：未检出已确认的模板运行代码标记，未输出透明首屏容器。
- `/`、`/templates` 及两者首批九张截图通过；Habitline、Deformo、Designfast 的详情、中英文真实预览共九条路由返回 200；不存在的模板返回 404。目录共 56 个模板。
- 核对验收副本与当前工作区的关键源码、注册表、Next 配置、package.json 和 pnpm 锁文件内容一致。

| 首页指标 | 修改前线上样本 | 修改后本地生产产物 | 降幅 |
| --- | ---: | ---: | ---: |
| CSS 请求数 | 34 | 3 | 91.2% |
| CSS 解压字节 | 4,089,743 | 357,633 | 91.3% |
| CSS gzip 估算字节 | 1,167,595 | 93,936 | 92.0% |
| JS gzip 估算字节 | 1,283,978 | 207,065 | 83.9% |

比较使用相同 gzip 算法；JS 包含 HTML 引用的旧浏览器 polyfill。线上样本是修改前 50 个模板，本地验收包含当前 56 个模板；不是同一网络下的加载时间对比，也不代表 FCP/LCP 测量。

构建证据保存在 WSL 验收目录的上一级：`build.log`、`typecheck.log`、`lint.log`、`home-resources.json`、`route-check.json`；资源与路由 JSON 同步至本工程 `.work/home-performance-20261026/`。

- 构建 ID 文件 SHA256：`0d5c58415d01224d39c882eab6588bd5f4f3097039326aba5efa230148632fe9`
- standalone 入口文件 SHA256：`89e551030d68c9c2c381520698fbd3a41159f16fc2aac641e31c671d9d0df0f9`
- 自动生成目录 SHA256：`6ee183154c67c17c406f79b73fa7dd74a4592008a706a963f8460da40a54df90`

前端改动尚未部署；线上目前生效的是代理缓存修复。未执行浏览器 FCP/LCP 或移动弱网测量。构建存在 LearnAI/Alex 模板字体 `@import` 顺序、已有无用 eslint-disable 及 webpack 大字符串缓存告警，不阻止构建；这些模板自身的问题保留为后续独立修复项。本任务未修改独立模板、素材包或发布它们的新版本。
