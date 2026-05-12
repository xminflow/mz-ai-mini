# 网页素材采集 — 关键词驱动批量采集 (Feature 004 + 006 多平台)

本目录是关键词采集特性在前端的全部实现。完整规格位于
[`specs/004-douyin-keyword-crawl/`](../../../../specs/004-douyin-keyword-crawl/)
（抖音单平台基线）与
[`specs/006-xiaohongshu-keyword-crawl/`](../../../../specs/006-xiaohongshu-keyword-crawl/)
（多平台扩展）。本文档仅记录目录组织与组件分工，便于代码审阅。

## 目录结构

```
keyword-crawl/
├── index.tsx                  # 路由入口；导出 `<KeywordCrawl/>`
├── KeywordCrawlScreen.tsx     # 单页组合：ReadyStatusCard + KeywordsList +
│                               # BatchProgressCard + BatchSummaryDialog
├── routes.ts                  # v1 仅一个内层路由
├── ready-status/              # 用户故事 3 — 就绪卡片
│   ├── ReadyStatusCard.tsx    # 三行（浏览器 / 会话 / 抖音可达性）+ 单按钮修复 +
│   │                           # 溢出菜单（清除登录态 / 打开日志目录）
│   ├── ResetSessionDialog.tsx
│   ├── useReadyStatus.ts      # react-query 轮询 sessionStatus 每 2 s
│   ├── useInstallBrowser.ts
│   ├── useStartSession.ts
│   └── useResetSession.ts
├── keywords/                  # 用户故事 1 — 关键词 CRUD
│   ├── KeywordsList.tsx       # 含 「开始采集」/「停止整批」 顶部按钮 + 添加按钮
│   ├── KeywordRow.tsx         # 单行 = Checkbox + 文本 + 编辑/删除按钮
│   ├── KeywordEditDialog.tsx  # 添加 + 编辑 共用 Dialog
│   ├── KeywordDeleteDialog.tsx # 二次确认 AlertDialog
│   ├── strings.ts
│   ├── useKeywordsList.ts
│   ├── useKeywordCreate.ts
│   ├── useKeywordUpdate.ts
│   └── useKeywordDelete.ts
├── batch/                     # 用户故事 2 — 批量采集
│   ├── BatchProgressCard.tsx  # 状态徽章 + 当前关键词 + 四个计数 + 起始时间
│   ├── BatchSummaryDialog.tsx # 批次结束时弹出；按关键词列出 stopReason + 计数
│   ├── strings.ts
│   ├── useBatchStart.ts
│   ├── useBatchStop.ts
│   ├── useBatchStatus.ts      # mount 时拉取一次快照
│   └── useBatchEventStream.ts # 订阅 keyword:batch:event；事件→状态 reducer
├── library/
│   └── LibraryTab.tsx         # 包装共享 <LibraryView/>；行徽章基于
│                              # captured_by_device='web:keyword:<text>'
│                              # 自动渲染「🌐 网页搜索（关键词：xxx）」
└── __tests__/                 # vitest + RTL smoke tests
```

## 与上下游模块的关系

| 模块 | 角色 |
|---|---|
| `frontend/src/utility/keyword-crawl/` | 唯一的 Node 后端：patchright 单实例 / 关键词 CRUD / 批次执行器 |
| `frontend/src/main/ipc/keyword-*.ts`, `session-*.ts`, `batch-*.ts` | 主进程 IPC 桥；调用 utility-host RPC |
| `frontend/src/main/utility-host.ts` | 进程间消息中枢；额外支持 `{type:"event", topic}` 流式事件 |
| `frontend/src/preload/index.ts` | 暴露 `window.api.keyword.*`，包括 `onBatchEvent(callback)` |
| `frontend/src/shared/contracts/keyword/` | 单一的 Zod 契约源；utility / main / renderer 共用 |
| `frontend/src/shared/library/` | 002 已抽出的共享 LibraryView；004 直接复用，徽章已识别新前缀 |

## 事件流模型（Decision 8）

批次执行期间 utility 进程通过 `process.parentPort.postMessage(
  {type:"event", topic:"keyword:batch:event", payload})` 推送 5 类事件
（`batch-started` / `keyword-started` / `progress` / `keyword-ended` /
`batch-ended`）。主进程 `utility-host.ts` 的 `subscribe(topic, cb)` 接收，
然后 fan-out 到所有 BrowserWindow。渲染进程通过
`window.api.keyword.onBatchEvent(callback)` 订阅，由
`useBatchEventStream` 维护一份运行时快照。

事件 schema 在三层（utility 发送前 / main 透传 / renderer 接收）均做 Zod 校验
（belt-and-suspenders）。
