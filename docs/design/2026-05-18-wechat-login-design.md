# 官网登录改造：微信扫码关注为主，邮箱登录为辅

**日期：** 2026-05-18  
**范围：** `website` 前端 + `features/auth` 层，后端无需改动

---

## 背景

官网当前登录页（`LoginContent.tsx`）仅支持邮箱验证码登录。后端已完整实现微信官方账号二维码登录的全部接口和业务逻辑。本次改造在前端侧将微信扫码登录设为主要入口，邮箱登录作为折叠的次选项。

---

## 设计决策

| 问题 | 决策 |
|------|------|
| 布局方式 | C — 主次分层：微信二维码占据卡片主体，邮箱登录折叠在下方 |
| 移动端处理 | A — 自动检测：移动端隐藏二维码，改为「在微信中打开」按钮 |
| 二维码过期 | A — 自动刷新：倒计时归零后静默重新生成，用户无感知 |
| 实现方式 | 方案二：拆分子组件 + 新增 Next.js API 路由 |

---

## 文件结构

**新增文件：**

```
website/src/app/(site)/login/
└── WechatLoginPanel.tsx          # 微信扫码登录面板（新增）
└── EmailLoginPanel.tsx           # 邮箱登录面板（从 LoginContent 抽取）

website/src/app/api/auth/wechat-login/
├── sessions/route.ts                          # POST：创建二维码会话
└── sessions/[sessionId]/
    ├── route.ts                               # GET：轮询会话状态
    └── exchange/route.ts                      # POST：兑换令牌并写 Cookie
```

**改造文件：**

```
website/src/features/auth/server/backend.ts   # 新增三个微信登录 API 函数
website/src/features/auth/types.ts            # 新增两个微信登录类型
website/src/app/(site)/login/LoginContent.tsx # 改为组合 WechatLoginPanel + EmailLoginPanel
```

---

## 职责划分

| 文件 | 职责 |
|------|------|
| `WechatLoginPanel` | 持有二维码状态机、轮询定时器、倒计时、移动端检测；无登录业务逻辑 |
| `EmailLoginPanel` | 持有邮箱/验证码表单状态；与现有 LoginContent 逻辑完全一致 |
| `LoginContent` | 持有「邮箱区是否展开」状态和 `nextPath` 解析；登录成功后统一跳转 |
| Next.js API 路由 | 纯代理，不含业务逻辑；`exchange` 路由负责写入 Cookie |
| `backend.ts` 新增函数 | 复用现有 `requestUpstream` 和 `normalizeAuthPayload` |

---

## 数据流

### 后端已有接口（复用）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/agent-auth/wechat-official/login-sessions` | 创建二维码会话，返回 `{login_session_id, qr_code_url, expires_at, poll_interval_ms}` |
| GET  | `/agent-auth/wechat-official/login-sessions/{id}` | 轮询状态，返回 `{login_session_id, status, expires_at}` |
| POST | `/agent-auth/wechat-official/login-sessions/{id}/exchange` | 兑换令牌，返回 `{account, tokens}`（与邮箱登录格式一致） |

### `features/auth/server/backend.ts` 新增函数

```typescript
createWechatLoginSession(): Promise<WechatLoginSession>
getWechatLoginSession(id: string): Promise<WechatLoginSessionStatus>
exchangeWechatLogin(id: string): Promise<AuthPayload>  // 复用 normalizeAuthPayload
```

### Next.js API 路由（代理层）

- `POST /api/auth/wechat-login/sessions` → 调用 `createWechatLoginSession()`
- `GET /api/auth/wechat-login/sessions/[sessionId]` → 调用 `getWechatLoginSession(id)`
- `POST /api/auth/wechat-login/sessions/[sessionId]/exchange` → 调用 `exchangeWechatLogin(id)`，写入 Cookie（复用 `writeAuthCookies`）

---

## WechatLoginPanel 状态机

```
idle
  ↓ 组件挂载自动触发
loading（生成二维码中）
  ↓ createSession 成功
ready（显示二维码 + 倒计时 + 轮询）
  ├─ AUTHENTICATED → exchanging → done → onSuccess(state)
  ├─ 倒计时归零 → loading（静默刷新）
  ├─ EXPIRED → loading（静默刷新）
  └─ 轮询连续失败 3 次 → error（显示提示，可手动重试）
* → error（网络/服务异常）
```

**轮询策略：**
- 间隔使用后端返回的 `poll_interval_ms`（通常 2000ms）
- 仅在 `ready` 状态下轮询，其他状态停止
- 组件卸载时清除所有定时器

**移动端检测：**
- 在 `useEffect` 中检测 `navigator.userAgent`，避免 SSR hydration 问题
- 移动端隐藏二维码，显示「在微信中打开」按钮
- 按钮点击后继续轮询，用户在微信完成关注后页面自动跳转
- 公众号链接所需的 `__biz` 通过环境变量 `NEXT_PUBLIC_WECHAT_OFFICIAL_BIZMID` 注入

---

## 类型定义（新增至 `types.ts`）

```typescript
type WechatLoginSession = {
  login_session_id: string
  qr_code_url: string
  expires_at: string
  poll_interval_ms: number
}

type WechatLoginSessionStatus = {
  login_session_id: string
  status: 'pending' | 'authenticated' | 'consumed' | 'expired'
  expires_at: string
}
```

---

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| `createSession` 失败 | 进入 `error` 状态，显示提示 + 「重试」按钮 |
| 轮询失败 | 静默重试最多 3 次，超过后进入 `error` 状态 |
| `exchange` 失败 | 显示错误提示，回到 `ready` 状态继续轮询 |
| 账户已禁用 | 显示「账户已被禁用，请联系客服」 |
| 未订阅异常 | 静默重新生成二维码 |
| 会话过期 | 倒计时主动触发，静默重新生成二维码 |

---

## UI 结构（LoginContent 改造后）

```tsx
<section>
  <div>  {/* 左侧标题区 - 不变 */} </div>
  <div>  {/* 右侧卡片 */}
    <WechatLoginPanel onSuccess={handleLoginSuccess} />
    <div>  {/* 邮箱折叠区 */}
      <button onClick={toggleEmail}>▸ 使用邮箱登录</button>
      {emailOpen && <EmailLoginPanel onSuccess={handleLoginSuccess} />}
    </div>
  </div>
</section>
```

---

## 验收标准

1. 桌面端打开登录页，默认显示微信二维码，邮箱区折叠收起
2. 二维码倒计时归零后自动刷新，无报错、无闪烁
3. 展开「使用邮箱登录」，可正常完成邮箱验证码登录流程
4. 移动端访问，二维码区域替换为「在微信中打开」按钮，点击可跳转微信
5. 微信扫码关注后，页面自动跳转至登录前目标页
6. `pnpm tsc --noEmit` 无类型报错

---

## 不在范围内

- 后端接口修改（已完整实现，无需改动）
- 微信小程序登录（独立模块，不涉及）
- 账户页面样式调整
- 微信支付相关逻辑
