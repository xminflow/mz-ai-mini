# aicamp 微信扫码登录体系 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `website-aicamp` 引入独立的微信公众号扫码登录体系（独立 `camp_*` 用户表），与 `website` 的 `agent_auth` 隔离，但共用同一个公众号与同一套后端。

**Architecture:** 后端新增 `camp_auth` DDD 模块（镜像 `agent_auth` 的扫码登录子集，独立 `camp_*` 表），复用同公众号的 `WechatOfficialAccountGateway` 与 `Sha256TokenService`；新增中立模块 `wechat_callback` 独占那唯一的公众号回调 URL，按 scene 前缀分发到 `agent_auth` / `camp_auth`；`agent_auth` 仅做最小机械改造（抽 `handle_message` + 移走回调路由），website 行为字节级不变。前端 `website-aicamp` 镜像 `website` 的 BFF + feature/auth（换前缀、指向 `/camp-auth/*`、host-only `camp_*` Cookie），首页公开、`PROTECTED_ROUTES` 留空。

**Tech Stack:** FastAPI + SQLAlchemy(async) + 原始顺序 SQL 迁移 + pytest（后端）；Next.js 15.3 App Router + React 19 + Tailwind v4（前端，无新依赖）。

**参考实现（执行时务必对照阅读）：**
- 后端模块模板：`server/api/src/mz_ai_backend/modules/agent_auth/`
- 前端模板：`website/src/features/auth/`、`website/src/app/api/auth/`、`website/src/app/(site)/login/`、`website/src/middleware.ts`、`website/src/components/layout/{TopNav,AccountMenu}.tsx`
- 设计文档：`docs/superpowers/specs/2026-06-11-aicamp-auth-design.md`

---

## 关于「镜像 + 改名」任务的执行约定（务必先读）

本计划大量任务是「把 `agent_auth` 的某文件镜像成 `camp_auth` 同名文件，套用统一改名表」。这是**精确指令**，不是占位：执行时**打开参考文件，整文件复制，套用下方改名表，再按该任务的「额外差异」逐条改**。理由：`agent_auth` 是在产、已被测试覆盖的代码，逐行重抄进计划反而违背 DRY 且会引入漂移。

**统一改名表（适用于所有后端镜像任务）：**

| 类别 | agent_auth | camp_auth |
|---|---|---|
| 模块路径 | `modules/agent_auth` | `modules/camp_auth` |
| 类名前缀 | `Agent…`（如 `AgentAccount`、`AgentWechatIdentity`、`AgentAuthSession`、`AgentAccessTokenRecord`、`AgentWechatLoginSession`、`AgentAccountStatus`、`AgentWechatSubscribeStatus`、`AgentWechatLoginSessionStatus`、`SqlAlchemyAgentAccountRepository`、`AgentAccountRepository`、各 UseCase / DTO / Exception / Response schema） | 同名把 `Agent` → `Camp` |
| 表名 | `agent_accounts` / `agent_auth_sessions` / `agent_auth_access_tokens` / `agent_wechat_identities` / `agent_wechat_login_sessions` | `camp_accounts` / `camp_auth_sessions` / `camp_auth_access_tokens` / `camp_wechat_identities` / `camp_wechat_login_sessions` |
| ORM `__tablename__` | 同上 agent_* | 同上 camp_* |
| scene 前缀 | `"agent-login-"` | `"camp-login-"` |
| 自动用户名 | `f"wxoa_{generated_account_id}"` | `f"camp_{generated_account_id}"` |
| 路由前缀 | `APIRouter(prefix="/agent-auth")` | `APIRouter(prefix="/camp-auth")` |
| 错误码成员 | `AGENT_AUTH_*`（值 `"AGENT_AUTH.*"`） | `CAMP_AUTH_*`（值 `"CAMP_AUTH.*"`） |
| Settings 字段 | `agent_auth_token_pepper` / `agent_auth_access_token_ttl_seconds` / `agent_auth_refresh_token_ttl_days` / `agent_auth_wechat_login_session_ttl_seconds` | `camp_auth_*` 同名 |
| WeChat 凭证 Settings | `wechat_official_*` | **复用，不改名** |

**复用（camp 直接 import agent_auth，不复制）：**
- `from mz_ai_backend.modules.agent_auth.infrastructure.wechat_official import WechatOfficialAccountGateway`
- gateway 值对象与 Protocol：`from mz_ai_backend.modules.agent_auth.application.ports.services import OfficialWechatGateway, OfficialWechatInboundMessage, OfficialWechatQrTicket, TokenService`
- `from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import Sha256TokenService`
- TTL 计算助手：`from mz_ai_backend.modules.agent_auth.application.dtos import build_access_token_expiry, build_refresh_token_expiry`
- 雪花：`from mz_ai_backend.core.<snowflake 模块> import get_snowflake_generator`（执行时按 `agent_auth/infrastructure/dependencies.py` 里的实际 import 路径照搬）

> 依赖方向只允许 `camp_auth → agent_auth`、`wechat_callback → {agent_auth, camp_auth}`；**禁止** `agent_auth → camp_auth`。

**enrollment 字段说明：** `camp_accounts` 比 `agent_accounts` 少 membership 三件套、多「报名」三件套：`enrollment_status`（`none`/`enrolled`/`expired`，默认 `none`）、`enrolled_at`、`enrollment_expires_at`（均 nullable）。本期只持久化、不在 `/camp-auth/me` 返回（`CampAccountSummary` 形态与 website 一致：`account_id/username/email/status/created_at`，`email` 恒为 null）。

---

# Part 1 — 后端 camp_auth 模块

### Task 1: 错误码 CAMP_AUTH_*

**Files:**
- Modify: `server/api/src/mz_ai_backend/core/error_codes.py`

- [ ] **Step 1: 阅读现有 AGENT_AUTH_* 错误码**

打开 `core/error_codes.py`，定位所有 `AGENT_AUTH_*` 成员（形如 `AGENT_AUTH_REFRESH_TOKEN_EXPIRED = "AGENT_AUTH.REFRESH_TOKEN_EXPIRED"`）。确认枚举类名与值格式（点号分隔）。

- [ ] **Step 2: 镜像新增 CAMP_AUTH_* 成员**

对扫码登录子集需要的每个 agent 错误码，新增对应 camp 成员（成员名 `AGENT_AUTH_*`→`CAMP_AUTH_*`，值 `"AGENT_AUTH.*"`→`"CAMP_AUTH.*"`）。至少包含：

```
CAMP_AUTH_ACCESS_TOKEN_EXPIRED = "CAMP_AUTH.ACCESS_TOKEN_EXPIRED"
CAMP_AUTH_REFRESH_TOKEN_EXPIRED = "CAMP_AUTH.REFRESH_TOKEN_EXPIRED"
CAMP_AUTH_SESSION_REVOKED = "CAMP_AUTH.SESSION_REVOKED"
CAMP_AUTH_WECHAT_LOGIN_SESSION_EXPIRED = "CAMP_AUTH.WECHAT_LOGIN_SESSION_EXPIRED"
CAMP_AUTH_WECHAT_LOGIN_SESSION_PENDING = "CAMP_AUTH.WECHAT_LOGIN_SESSION_PENDING"
CAMP_AUTH_WECHAT_LOGIN_SESSION_CONSUMED = "CAMP_AUTH.WECHAT_LOGIN_SESSION_CONSUMED"
CAMP_AUTH_WECHAT_IDENTITY_NOT_SUBSCRIBED = "CAMP_AUTH.WECHAT_IDENTITY_NOT_SUBSCRIBED"
CAMP_AUTH_WECHAT_CALLBACK_INVALID = "CAMP_AUTH.WECHAT_CALLBACK_INVALID"
CAMP_AUTH_WECHAT_CONFIG_MISSING = "CAMP_AUTH.WECHAT_CONFIG_MISSING"
```
（`USER_DISABLED` 复用现有，不新增。）

- [ ] **Step 3: 校验导入**

Run: `cd server/api && uv run python -c "from mz_ai_backend.core.error_codes import ErrorCode; print(ErrorCode.CAMP_AUTH_REFRESH_TOKEN_EXPIRED.value)"`
Expected: 打印 `CAMP_AUTH.REFRESH_TOKEN_EXPIRED`

- [ ] **Step 4: Commit**

```bash
git add server/api/src/mz_ai_backend/core/error_codes.py
git commit -m "feat(camp_auth): add CAMP_AUTH error codes"
```

---

### Task 2: Settings 增加 camp_auth_* 字段

**Files:**
- Modify: `server/api/src/mz_ai_backend/core/config.py`

- [ ] **Step 1: 阅读现有 agent_auth_* 设置**

定位 `Settings` 类里的 `agent_auth_token_pepper` / `agent_auth_access_token_ttl_seconds`(=1800) / `agent_auth_refresh_token_ttl_days`(=7) / `agent_auth_wechat_login_session_ttl_seconds`(=300)。

- [ ] **Step 2: 新增 camp_auth_* 字段（同默认值）**

在 agent_auth 字段附近新增：

```python
camp_auth_token_pepper: str | None = None
camp_auth_access_token_ttl_seconds: int = 1800
camp_auth_refresh_token_ttl_days: int = 7
camp_auth_wechat_login_session_ttl_seconds: int = 300
```
`wechat_official_*` 复用，不新增。

- [ ] **Step 3: 校验**

Run: `cd server/api && uv run python -c "from mz_ai_backend.core.config import Settings; s=Settings(); print(s.camp_auth_access_token_ttl_seconds, s.camp_auth_refresh_token_ttl_days)"`
Expected: 打印 `1800 7`

- [ ] **Step 4: Commit**

```bash
git add server/api/src/mz_ai_backend/core/config.py
git commit -m "feat(camp_auth): add camp_auth settings (pepper + TTLs)"
```

---

### Task 3: SQL 迁移 0029 — 建 camp_* 表

**Files:**
- Create: `server/api/migrations/0029_create_camp_auth_tables.sql`

- [ ] **Step 1: 对照 agent_auth 的建表迁移**

阅读 `server/api/migrations/0013_create_agent_auth_tables.sql`、`0014_add_agent_wechat_login.sql`、`0017_add_account_membership.sql`，确认列类型、`TIMESTAMP WITHOUT TIME ZONE`、`BIGINT GENERATED ... AS IDENTITY`、唯一约束与索引写法。

- [ ] **Step 2: 写迁移文件（全部 IF NOT EXISTS，幂等）**

```sql
-- 0029_create_camp_auth_tables.sql
-- aicamp 独立扫码登录用户表，与 agent_* 完全隔离；纯新增，回滚=DROP 这 5 张表。

CREATE TABLE IF NOT EXISTS camp_accounts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    account_id BIGINT NOT NULL UNIQUE,
    username VARCHAR(32) NOT NULL UNIQUE,
    email VARCHAR(256) UNIQUE,
    status VARCHAR(16) NOT NULL,
    enrollment_status VARCHAR(16) NOT NULL DEFAULT 'none',
    enrolled_at TIMESTAMP WITHOUT TIME ZONE,
    enrollment_expires_at TIMESTAMP WITHOUT TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_camp_accounts_account_id ON camp_accounts (account_id);
CREATE INDEX IF NOT EXISTS ix_camp_accounts_username ON camp_accounts (username);
CREATE INDEX IF NOT EXISTS ix_camp_accounts_email ON camp_accounts (email);

CREATE TABLE IF NOT EXISTS camp_auth_sessions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    session_id BIGINT NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    refresh_token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_camp_auth_sessions_session_id ON camp_auth_sessions (session_id);
CREATE INDEX IF NOT EXISTS ix_camp_auth_sessions_account_id ON camp_auth_sessions (account_id);
CREATE INDEX IF NOT EXISTS ix_camp_auth_sessions_refresh_token_hash ON camp_auth_sessions (refresh_token_hash);

CREATE TABLE IF NOT EXISTS camp_auth_access_tokens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    token_id BIGINT NOT NULL UNIQUE,
    session_id BIGINT NOT NULL,
    access_token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_camp_auth_access_tokens_token_id ON camp_auth_access_tokens (token_id);
CREATE INDEX IF NOT EXISTS ix_camp_auth_access_tokens_session_id ON camp_auth_access_tokens (session_id);
CREATE INDEX IF NOT EXISTS ix_camp_auth_access_tokens_access_token_hash ON camp_auth_access_tokens (access_token_hash);

CREATE TABLE IF NOT EXISTS camp_wechat_identities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    identity_id BIGINT NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    official_openid VARCHAR(64) NOT NULL UNIQUE,
    subscribe_status VARCHAR(16) NOT NULL,
    subscribed_at TIMESTAMP WITHOUT TIME ZONE,
    unsubscribed_at TIMESTAMP WITHOUT TIME ZONE,
    last_event_at TIMESTAMP WITHOUT TIME ZONE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_camp_wechat_identities_identity_id ON camp_wechat_identities (identity_id);
CREATE INDEX IF NOT EXISTS ix_camp_wechat_identities_account_id ON camp_wechat_identities (account_id);
CREATE INDEX IF NOT EXISTS ix_camp_wechat_identities_official_openid ON camp_wechat_identities (official_openid);

CREATE TABLE IF NOT EXISTS camp_wechat_login_sessions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    login_session_id BIGINT NOT NULL UNIQUE,
    scene_key VARCHAR(128) NOT NULL UNIQUE,
    status VARCHAR(16) NOT NULL,
    official_openid VARCHAR(64),
    account_id BIGINT,
    login_grant_token_hash VARCHAR(128) UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    authenticated_at TIMESTAMP WITHOUT TIME ZONE,
    consumed_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_camp_wechat_login_sessions_login_session_id ON camp_wechat_login_sessions (login_session_id);
CREATE INDEX IF NOT EXISTS ix_camp_wechat_login_sessions_scene_key ON camp_wechat_login_sessions (scene_key);
CREATE INDEX IF NOT EXISTS ix_camp_wechat_login_sessions_status ON camp_wechat_login_sessions (status);
```

> 注意：列类型/默认值/索引命名需与 Step 1 看到的 agent 迁移风格一致；若 agent 迁移用的是 `BIGSERIAL` 而非 `GENERATED ... IDENTITY`，或索引命名前缀不同，则照其风格改写本文件。

- [ ] **Step 3: 应用迁移并验证**

Run: `cd server/api && uv run python migrations/run_sql_migrations.py`
Expected: 输出包含已应用 `0029_create_camp_auth_tables.sql`，无报错。

验证表存在：用数据库客户端（psql 等）执行 `\dt camp_*` 或 `SELECT to_regclass('public.camp_accounts');` 确认 5 张 `camp_*` 表已建；也会在 Task 8 的仓储测试里间接验证。

- [ ] **Step 4: Commit**

```bash
git add server/api/migrations/0029_create_camp_auth_tables.sql
git commit -m "feat(camp_auth): add 0029 migration for camp_* tables"
```

---

### Task 4: domain（entities + exceptions）镜像

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/__init__.py`
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/domain/__init__.py`
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/domain/entities.py`
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/domain/exceptions.py`

- [ ] **Step 1: 镜像 entities.py**

复制 `agent_auth/domain/entities.py` → `camp_auth/domain/entities.py`，套用改名表。**删除** email-challenge 实体（`AgentEmailLoginChallenge`）。`CampAccount` 实体的字段：把 membership 三件套替换为 enrollment 三件套（`enrollment_status: str`、`enrolled_at: datetime | None`、`enrollment_expires_at: datetime | None`）；若原 `AgentAccount` 实体未含 membership 字段（仅在 ORM/summary 层），则保持 `CampAccount` 与之同构、不加 enrollment 到实体。枚举：`CampAccountStatus`(active/disabled)、`CampWechatSubscribeStatus`(subscribed/unsubscribed)、`CampWechatLoginSessionStatus`(pending/authenticated/expired/consumed)。

- [ ] **Step 2: 镜像 exceptions.py**

复制 `agent_auth/domain/exceptions.py` → camp 版，套改名表。**仅保留扫码登录子集**用到的异常（删 email/username/dev 相关：`*EmailLogin*`、`*Email*`、`*Username*`、`*InvalidCredentials*`）。保留：`CampAccountDisabledException`(USER_DISABLED)、`CampAccessTokenExpiredException`、`CampRefreshTokenExpiredException`、`CampSessionRevokedException`、`CampWechatLoginSessionExpiredException`、`CampWechatLoginSessionPendingException`、`CampWechatLoginSessionConsumedException`、`CampWechatIdentityNotSubscribedException`、`CampWechatCallbackInvalidException`、`CampWechatConfigMissingException`。每个 `error_code=ErrorCode.CAMP_AUTH_*`（`USER_DISABLED` 不变）。

- [ ] **Step 3: 镜像 domain/__init__.py 与 camp_auth/__init__.py**

`domain/__init__.py` re-export 上述实体+枚举+异常（照 agent 版裁剪）。`camp_auth/__init__.py` 暂时空或 `# camp_auth module`（Task 10 后再加 `from .presentation.router import router`）。

- [ ] **Step 4: 校验导入**

Run: `cd server/api && uv run python -c "from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus, CampWechatLoginSessionStatus, CampWechatIdentityNotSubscribedException; print(CampWechatLoginSessionStatus.PENDING)"`
Expected: 打印 `CampWechatLoginSessionStatus.PENDING`（或其值 `pending`）

- [ ] **Step 5: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/__init__.py server/api/src/mz_ai_backend/modules/camp_auth/domain/
git commit -m "feat(camp_auth): add domain entities and exceptions"
```

---

### Task 5: application/dtos.py 镜像（扫码子集）

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/application/__init__.py`
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/application/dtos.py`

- [ ] **Step 1: 镜像 dtos.py（仅扫码子集）**

复制 `agent_auth/application/dtos.py` → camp 版，套改名表。**保留**：`CampAccountSummary`、`RefreshCampSessionCommand`、`LogoutCampSessionCommand`、`GetCurrentCampAccountQuery`、`CampAccountRegistration`、`CampTokenPair`、`CampSessionIssue`、`CampAuthenticationResult`、`CampWechatLoginSessionSummary`、`CreateCampWechatLoginSessionCommand`、`CreateCampWechatLoginSessionResult`、`GetCampWechatLoginSessionQuery`、`CampWechatLoginSessionStatusResult`、`ExchangeCampWechatLoginCommand`、`CampWechatIdentityUpsert`、`CampWechatLoginSessionCreate`、`CampWechatLoginGrantIssue`、`HandleCampWechatCallbackCommand`、`LogoutCampSessionResult`，以及 `normalize_camp_username`。**删除**所有 email/username-input/dev DTO 与 `EMAIL_*` 正则、`DEV_FAKE_LOGIN_DEFAULT_USERNAME`。

- [ ] **Step 2: TTL 助手改为复用 agent 版**

`build_access_token_expiry` / `build_refresh_token_expiry` 不在 camp dtos 里重复定义，改为从 agent 复用：在需要它们的 use_case 里 `from mz_ai_backend.modules.agent_auth.application.dtos import build_access_token_expiry, build_refresh_token_expiry`。（若你倾向自包含，也可在 camp dtos 保留这两个纯函数副本——二选一，本计划默认复用。）

- [ ] **Step 3: 校验导入**

Run: `cd server/api && uv run python -c "from mz_ai_backend.modules.camp_auth.application.dtos import CampAccountSummary, HandleCampWechatCallbackCommand, normalize_camp_username; print(normalize_camp_username(' Foo '))"`
Expected: 打印 `foo`

- [ ] **Step 4: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/application/__init__.py server/api/src/mz_ai_backend/modules/camp_auth/application/dtos.py
git commit -m "feat(camp_auth): add application DTOs (qr-login subset)"
```

---

### Task 6: ports（repositories + services）

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/application/ports/__init__.py`
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/application/ports/repositories.py`

- [ ] **Step 1: 镜像 repositories.py（仅扫码子集方法）**

复制 `agent_auth/application/ports/repositories.py` → camp 版，套改名表。**保留**扫码登录链路用到的方法，**删除** email-challenge 与 username 相关方法。需保留的方法（签名见参考文件，全部 async）：`get_account_by_id`、`create_account`、`create_session`、`get_session_by_refresh_token_hash`、`get_session_by_id`、`get_access_token_record`、`revoke_session`、`revoke_session_by_refresh_token_hash`、`replace_session_tokens`、`get_wechat_identity_by_openid`、`create_wechat_identity`、`update_wechat_identity`、`create_wechat_login_session`、`get_wechat_login_session_by_id`、`get_wechat_login_session_by_scene_key`、`mark_wechat_login_session_authenticated`、`mark_wechat_login_session_expired`、`mark_wechat_login_session_consumed`。（`get_account_by_username`/`by_email`/`update_account_email`/`update_account_username`/`get_wechat_identity_by_account_id` 在扫码子集非必需，可删；若镜像简单可保留 `get_account_by_username`。）

- [ ] **Step 2: services 端口改为复用 agent**

不新建 camp 的 services.py。camp 的 use_case 直接复用 agent 的 `TokenService` 与 gateway 类型：`from mz_ai_backend.modules.agent_auth.application.ports.services import TokenService, OfficialWechatGateway`。`ports/__init__.py` re-export `CampAccountRepository` 以及（为方便）re-export 上述两个复用类型。

- [ ] **Step 3: 校验导入**

Run: `cd server/api && uv run python -c "from mz_ai_backend.modules.camp_auth.application.ports import CampAccountRepository; print('ok')"`
Expected: 打印 `ok`

- [ ] **Step 4: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/application/ports/
git commit -m "feat(camp_auth): add repository port (reuse agent service ports)"
```

---

### Task 7: infrastructure/models.py（5 个 ORM 模型）

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/__init__.py`
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/models.py`

- [ ] **Step 1: 写 models.py**

以 `agent_auth/infrastructure/models.py` 为模板，套改名表，写 5 个模型：`CampAccountModel`(`camp_accounts`)、`CampAuthSessionModel`(`camp_auth_sessions`)、`CampAuthAccessTokenModel`(`camp_auth_access_tokens`)、`CampWechatIdentityModel`(`camp_wechat_identities`)、`CampWechatLoginSessionModel`(`camp_wechat_login_sessions`)。`CampAccountModel` 列与 Task 3 SQL 对齐：去掉 `password_*` 与 `membership_*`，加 `enrollment_status`(String(16), default "none")、`enrolled_at`、`enrollment_expires_at`（nullable DateTime）。`CampWechatLoginSessionModel` 含 `login_grant_token_hash`（与 agent 一致）。全部继承 `from mz_ai_backend.core.database import Base`。

- [ ] **Step 2: 校验模型与表名**

Run: `cd server/api && uv run python -c "from mz_ai_backend.modules.camp_auth.infrastructure.models import CampAccountModel, CampWechatLoginSessionModel; print(CampAccountModel.__tablename__, CampWechatLoginSessionModel.__tablename__)"`
Expected: 打印 `camp_accounts camp_wechat_login_sessions`

- [ ] **Step 3: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/__init__.py server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/models.py
git commit -m "feat(camp_auth): add SQLAlchemy models"
```

---

### Task 8: infrastructure/repositories.py + 仓储测试

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/repositories.py`
- Create: `server/api/tests/camp_auth/__init__.py`
- Create: `server/api/tests/camp_auth/infrastructure/__init__.py`
- Create: `server/api/tests/camp_auth/infrastructure/test_camp_auth_repository.py`

- [ ] **Step 1: 写失败测试（建账号 + openid 身份 + 登录会话往返）**

以 `tests/agent_auth/infrastructure/test_agent_auth_repository_datetime.py` 为参考（复用同样的 async session fixture / DB 准备方式）。测试 `SqlAlchemyCampAccountRepository`：

```python
import pytest
from mz_ai_backend.modules.camp_auth.application.dtos import CampAccountRegistration
from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus
from mz_ai_backend.modules.camp_auth.infrastructure.repositories import SqlAlchemyCampAccountRepository

@pytest.mark.asyncio
async def test_create_and_get_camp_account(camp_db_session):  # 复用 agent 测试里的 db session fixture 名/写法
    repo = SqlAlchemyCampAccountRepository(session=camp_db_session)
    created = await repo.create_account(
        CampAccountRegistration(
            account_id=1234567890,
            username="camp_1234567890",
            status=CampAccountStatus.ACTIVE,
        )
    )
    fetched = await repo.get_account_by_id(1234567890)
    assert created.account_id == 1234567890
    assert fetched is not None
    assert fetched.username == "camp_1234567890"
    assert fetched.status == CampAccountStatus.ACTIVE
```
> fixture：照搬 agent 仓储测试的 DB 准备方式（同一个测试库 + 迁移已应用）。若 agent 测试用 `tests/conftest.py` 的全局机制建表，则 camp 表已由 Task 3 迁移建好；否则在 fixture 里对测试库跑 `0029` 迁移。

- [ ] **Step 2: 运行确认失败**

Run: `cd server/api && uv run pytest tests/camp_auth/infrastructure/test_camp_auth_repository.py -v`
Expected: FAIL（`SqlAlchemyCampAccountRepository` 不存在 / ImportError）

- [ ] **Step 3: 写 repositories.py**

复制 `agent_auth/infrastructure/repositories.py` → camp 版，套改名表。删除 email-challenge 与 username 相关方法及其 mapper。`_to_camp_account` mapper 映射 enrollment 字段（不映射 password/membership）。`IntegrityError` 处理：用户名冲突无对应业务异常（camp 用户名是系统生成的 `camp_{id}`，几乎不冲突）——保留与 agent 同样的 IntegrityError→异常映射，或简化为重新抛出（执行时按 agent 风格保守保留）。

- [ ] **Step 4: 运行确认通过**

Run: `cd server/api && uv run pytest tests/camp_auth/infrastructure/test_camp_auth_repository.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/repositories.py server/api/tests/camp_auth/
git commit -m "feat(camp_auth): add SQLAlchemy repository + repo test"
```

---

### Task 9: use_cases（登录子集 + camp 回调 handler）

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/application/use_cases/__init__.py`
- Create: `.../use_cases/_session_tokens.py`
- Create: `.../use_cases/create_wechat_login_session.py`
- Create: `.../use_cases/get_wechat_login_session.py`
- Create: `.../use_cases/exchange_wechat_login.py`
- Create: `.../use_cases/refresh_camp_session.py`
- Create: `.../use_cases/logout_camp_session.py`
- Create: `.../use_cases/get_current_camp_account.py`
- Create: `.../use_cases/handle_wechat_callback.py`

- [ ] **Step 1: 镜像无回调的 6 个 use case + _session_tokens**

逐个复制 agent 对应文件 → camp 版，套改名表：
- `_session_tokens.py` → `issue_camp_auth_tokens(...)`（结构同 agent，`AgentSessionIssue`→`CampSessionIssue`、`AgentAuthenticationResult`→`CampAuthenticationResult`、`AgentAccountSummary`→`CampAccountSummary`；`build_*_expiry` 从 agent dtos import）。
- `create_wechat_login_session.py` → `CreateCampWechatLoginSessionUseCase`，**scene_key 改为 `f"camp-login-{login_session_id}"`**，TTL 用 `camp_auth_wechat_login_session_ttl_seconds` / `wechat_official_qr_expire_seconds`。
- `get_wechat_login_session.py` → `GetCampWechatLoginSessionUseCase`（懒过期逻辑不变）。
- `exchange_wechat_login.py` → `ExchangeCampWechatLoginUseCase`（校验 + 标记 consumed + `issue_camp_auth_tokens`；异常用 camp 版）。
- `refresh_agent_session.py` → `refresh_camp_session.py` / `RefreshCampSessionUseCase`。
- `logout_agent_session.py` → `logout_camp_session.py` / `LogoutCampSessionUseCase`。
- `get_current_agent_account.py` → `get_current_camp_account.py` / `GetCurrentCampAccountUseCase`。

- [ ] **Step 2: 写 camp 回调 handler（novel：只认 camp scene + 取关同步，绝不建 agent 账号）**

`handle_wechat_callback.py`。**关键差异**：camp 回调由 `wechat_callback` 分发器调用，分两种入口——(a) 带 `camp-login-*` scene 的登录事件；(b) 无 scene 的 `unsubscribe` 广播。因此实现一个 `handle_message(message, scene_key)` 方法（不做签名校验/解析，那是分发器的事）：

```python
from __future__ import annotations

import logging

from ..dtos import (
    CampAccountRegistration,
    CampWechatIdentityUpsert,
    CampWechatLoginGrantIssue,
    normalize_camp_username,
)
from ..ports import CampAccountRepository
from ...domain import (
    CampAccountStatus,
    CampWechatLoginSessionStatus,
    CampWechatSubscribeStatus,
)
from mz_ai_backend.modules.agent_auth.application.ports.services import OfficialWechatInboundMessage

logger = logging.getLogger(__name__)

# camp 扫码登录 scene 前缀；分发器据此把 camp-login-* 事件路由到本 handler。
LOGIN_SCENE_PREFIX = "camp-login-"


class HandleCampWechatCallbackUseCase:
    """处理分发到 camp 的公众号事件。

    仅两类入口：
    1) 带 camp-login-* scene 的 subscribe/SCAN：绑定 camp 身份（必要时建 camp 账号）+ 标记 camp 登录会话 authenticated。
    2) 无 scene 的 unsubscribe 广播：仅当已存在该 openid 的 camp 身份时标记取关，否则跳过（记 debug，不报错）。
    camp 账号只经 camp 扫码创建，绝不在此为自然关注创建账号、也绝不触碰 agent_* 表。
    """

    def __init__(self, *, account_repository: CampAccountRepository, snowflake_id_generator) -> None:
        self._account_repository = account_repository
        self._snowflake_id_generator = snowflake_id_generator

    async def handle_message(
        self,
        message: OfficialWechatInboundMessage,
        scene_key: str | None,
    ) -> None:
        event_type = message.event_type
        openid = message.official_openid
        if event_type is None or not openid:
            return

        existing = await self._account_repository.get_wechat_identity_by_openid(openid)

        # 取关：仅同步已存在身份，不创建任何东西
        if event_type == "unsubscribe":
            if existing is None:
                logger.debug("camp callback: unsubscribe for unknown openid, skip. openid=%s", openid)
                return
            await self._account_repository.update_wechat_identity(
                CampWechatIdentityUpsert(
                    identity_id=existing.identity_id,
                    account_id=existing.account_id,
                    official_openid=openid,
                    subscribe_status=CampWechatSubscribeStatus.UNSUBSCRIBED,
                    subscribed_at=existing.subscribed_at,
                    unsubscribed_at=message.message_time,
                    last_event_at=message.message_time,
                )
            )
            return

        # 到这里只处理带 camp-login-* scene 的登录事件（subscribe / SCAN）
        if scene_key is None or not scene_key.startswith(LOGIN_SCENE_PREFIX):
            return

        account_id = existing.account_id if existing is not None else None
        if account_id is None:
            generated_account_id = self._snowflake_id_generator.generate()
            account = await self._account_repository.create_account(
                CampAccountRegistration(
                    account_id=generated_account_id,
                    username=normalize_camp_username(f"camp_{generated_account_id}"),
                    status=CampAccountStatus.ACTIVE,
                )
            )
            account_id = account.account_id

        identity_payload = CampWechatIdentityUpsert(
            identity_id=existing.identity_id if existing is not None else self._snowflake_id_generator.generate(),
            account_id=account_id,
            official_openid=openid,
            subscribe_status=CampWechatSubscribeStatus.SUBSCRIBED,
            subscribed_at=message.message_time,
            unsubscribed_at=None,
            last_event_at=message.message_time,
        )
        if existing is None:
            await self._account_repository.create_wechat_identity(identity_payload)
        else:
            await self._account_repository.update_wechat_identity(identity_payload)

        login_session = await self._account_repository.get_wechat_login_session_by_scene_key(scene_key)
        if login_session is not None and login_session.status == CampWechatLoginSessionStatus.PENDING:
            await self._account_repository.mark_wechat_login_session_authenticated(
                login_session_id=login_session.login_session_id,
                official_openid=openid,
                account_id=account_id,
                issue=CampWechatLoginGrantIssue(authenticated_at=message.message_time),
            )
```

- [ ] **Step 3: use_cases/__init__.py re-export**

re-export 全部 7 个 use case 类 + `issue_camp_auth_tokens` + `LOGIN_SCENE_PREFIX`。

- [ ] **Step 4: 校验导入**

Run: `cd server/api && uv run python -c "from mz_ai_backend.modules.camp_auth.application.use_cases import HandleCampWechatCallbackUseCase, ExchangeCampWechatLoginUseCase, CreateCampWechatLoginSessionUseCase; print('ok')"`
Expected: 打印 `ok`

- [ ] **Step 5: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/application/use_cases/
git commit -m "feat(camp_auth): add use cases incl. camp wechat callback handler"
```

---

### Task 10: presentation（schemas + router，无回调路由）

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/presentation/__init__.py`
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/presentation/schemas.py`
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/presentation/router.py`
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/__init__.py`

- [ ] **Step 1: 镜像 schemas.py（扫码子集）**

复制 `agent_auth/presentation/schemas.py` → camp 版，套改名表。保留：`CampAuthAccountResponse`、`CampAuthTokensResponse`、`CampAuthenticationResponse`、`RefreshCampSessionRequest`、`LogoutCampSessionRequest`、`LogoutCampSessionResponse`、`ExchangeCampWechatLoginRequest`、`CampWechatLoginSessionResponse`、`CampWechatLoginSessionStatusResponse`。删除 email/username/dev schema。雪花 id → 字符串的 `_serialize_business_id` 一并保留。

- [ ] **Step 2: 镜像 router.py（去掉两个 callback 路由）**

复制 `agent_auth/presentation/router.py` → camp 版，套改名表，`prefix="/camp-auth"`。**保留**：`POST /wechat-official/login-sessions`、`GET /wechat-official/login-sessions/{login_session_id}`、`POST /wechat-official/login-sessions/{login_session_id}/exchange`、`POST /refresh`、`POST /logout`、`GET /me`。**删除**：两个 `/wechat-official/callback` 路由（GET/POST）、`PATCH /me/username`、email-binding、`/dev/fake-login`。依赖项指向 Task 11 的 camp providers。

- [ ] **Step 3: camp_auth/__init__.py 导出 router**

```python
from .presentation.router import router

__all__ = ["router"]
```

- [ ] **Step 4: 校验导入（依赖 Task 11 providers，可先占位）**

> 本任务与 Task 11 强耦合，建议连续实现。校验放在 Task 11 Step 末尾。

- [ ] **Step 5: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/presentation/ server/api/src/mz_ai_backend/modules/camp_auth/__init__.py
git commit -m "feat(camp_auth): add presentation schemas and router (no callback route)"
```

---

### Task 11: infrastructure/dependencies.py（camp providers）

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/dependencies.py`

- [ ] **Step 1: 写 camp providers（复用 gateway/token service/snowflake）**

复制 `agent_auth/infrastructure/dependencies.py` → camp 版，套改名表，并改为复用 agent 的基础设施：
- `get_camp_account_repository` → `SqlAlchemyCampAccountRepository(session=...)`。
- token service：复用 agent 的 `Sha256TokenService`，但 pepper 用 camp 自己的：
  ```python
  from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import Sha256TokenService
  def get_camp_token_service(settings = Depends(get_settings_dependency)) -> Sha256TokenService:
      return Sha256TokenService(pepper=settings.camp_auth_token_pepper)
  ```
- wechat gateway / snowflake：直接复用 agent 的 `get_official_wechat_gateway`、`get_snowflake_id_generator`（`from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import get_official_wechat_gateway, get_snowflake_id_generator`）——同公众号、同雪花配置。
- bearer 抽取：复用 agent 的 `get_current_agent_access_token`，或镜像一个 `get_current_camp_access_token`（抛 `CampAccessTokenExpiredException`）。镜像更干净（错误码语义正确）。
- providers：`get_create_wechat_login_session_use_case`（TTL 用 `camp_auth_wechat_login_session_ttl_seconds`）、`get_get_wechat_login_session_use_case`、`get_exchange_wechat_login_use_case`、`get_refresh_camp_session_use_case`、`get_logout_camp_session_use_case`、`get_get_current_camp_account_use_case`，以及 `get_handle_camp_wechat_callback_use_case`（只需 `account_repository` + `snowflake_id_generator`，**无** auto-reply 参数）。

- [ ] **Step 2: 校验 router + providers 装配**

Run: `cd server/api && uv run python -c "from mz_ai_backend.modules.camp_auth import router; print([r.path for r in router.routes])"`
Expected: 打印含 `/camp-auth/wechat-official/login-sessions`、`/camp-auth/refresh`、`/camp-auth/logout`、`/camp-auth/me` 等，**不含** `/callback`。

- [ ] **Step 3: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/dependencies.py
git commit -m "feat(camp_auth): add DI providers (reuse wechat gateway/token service)"
```

---

### Task 12: 把 camp_auth router 接入 app

**Files:**
- Modify: `server/api/src/mz_ai_backend/modules/__init__.py`
- Modify: `server/api/src/mz_ai_backend/core/application.py`

- [ ] **Step 1: modules/__init__.py 导出 camp_auth_router**

仿 `from .agent_auth import router as agent_auth_router` 增加 `from .camp_auth import router as camp_auth_router`，加入 `__all__`。

- [ ] **Step 2: application.py include_router**

仿 `app.include_router(agent_auth_router, prefix=settings.api_prefix)`，在其后增加：
```python
app.include_router(camp_auth_router, prefix=settings.api_prefix)
```
import 元组里加 `camp_auth_router`。

- [ ] **Step 3: 校验 app 启动 + 路由存在**

Run: `cd server/api && uv run python -c "from mz_ai_backend.core.application import create_app; app=create_app(); paths=[r.path for r in app.routes]; assert any('/camp-auth/me' in p for p in paths); print('camp-auth wired')"`
Expected: 打印 `camp-auth wired`

- [ ] **Step 4: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/__init__.py server/api/src/mz_ai_backend/core/application.py
git commit -m "feat(camp_auth): wire camp_auth router into app"
```

---

### Task 13: camp_auth 路由契约测试（stub 依赖）

**Files:**
- Create: `server/api/tests/camp_auth/presentation/__init__.py`
- Create: `server/api/tests/camp_auth/presentation/test_camp_auth_router.py`

- [ ] **Step 1: 写契约测试（用 dependency_overrides + Stub use case）**

以 `tests/agent_auth/presentation/test_agent_auth_router.py` 为模板，套改名表。覆盖：建登录会话、轮询状态、exchange 成功返回 token、refresh、logout、me。示例（exchange）：

```python
from fastapi.testclient import TestClient
from datetime import datetime, UTC
from mz_ai_backend.core.application import create_app
from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import get_exchange_wechat_login_use_case
from mz_ai_backend.modules.camp_auth.application.dtos import (
    CampAuthenticationResult, CampAccountSummary, CampTokenPair,
)
from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus


class _StubExchange:
    async def execute(self, command):
        now = datetime.now(UTC).replace(tzinfo=None)
        return CampAuthenticationResult(
            account=CampAccountSummary(account_id=1, username="camp_1", email=None,
                                       status=CampAccountStatus.ACTIVE, created_at=now),
            tokens=CampTokenPair(access_token="at", access_token_expires_at=now,
                                 refresh_token="rt", refresh_token_expires_at=now),
        )


def test_exchange_returns_tokens():
    app = create_app()
    app.dependency_overrides[get_exchange_wechat_login_use_case] = lambda: _StubExchange()
    client = TestClient(app, raise_server_exceptions=False)
    resp = client.post("/api/v1/camp-auth/wechat-official/login-sessions/999/exchange")
    assert resp.status_code == 200
    body = resp.json()
    assert body["data"]["tokens"]["access_token"] == "at"
    assert body["data"]["account"]["username"] == "camp_1"
```
> `api/v1` 前缀按 `settings.api_prefix` 实际值调整；响应 envelope 形态（`code`/`data`）按 agent 路由测试里看到的断言方式对齐。

- [ ] **Step 2: 运行**

Run: `cd server/api && uv run pytest tests/camp_auth/presentation/test_camp_auth_router.py -v`
Expected: PASS（全部用例）

- [ ] **Step 3: Commit**

```bash
git add server/api/tests/camp_auth/presentation/
git commit -m "test(camp_auth): router contract tests with stubbed use cases"
```

---

# Part 2 — 共享回调分发改造（中立模块）

### Task 14: agent_auth 抽出 handle_message（机械重构，回归护栏）

**Files:**
- Modify: `server/api/src/mz_ai_backend/modules/agent_auth/application/use_cases/handle_wechat_callback.py`

- [ ] **Step 1: 先跑现有 agent 回调测试，确认基线绿**

Run: `cd server/api && uv run pytest tests/agent_auth/application/test_handle_wechat_callback_auto_reply.py tests/agent_auth/presentation/test_agent_auth_router.py -v`
Expected: PASS（记录为重构前基线）

- [ ] **Step 2: 抽 handle_message**

把 `HandleAgentWechatCallbackUseCase.execute` 中**解析之后**的逻辑（当前从 `event_type = message.event_type` 起到 `return reply`）原样移入新方法 `async def handle_message(self, message, scene_key: str | None) -> str | None`。`execute` 改为：

```python
async def execute(self, command: HandleAgentWechatCallbackCommand) -> str | None:
    # 签名校验（保持原逻辑：msg_signature 优先，否则 signature）
    if command.msg_signature:
        valid = self._wechat_gateway.verify_msg_signature(
            msg_signature=command.msg_signature, timestamp=command.timestamp,
            nonce=command.nonce, xml_body=command.xml_body,
        )
    else:
        valid = self._wechat_gateway.verify_callback_signature(
            signature=command.signature, timestamp=command.timestamp, nonce=command.nonce,
        )
    if not valid:
        raise AgentWechatCallbackInvalidException(message="WeChat callback signature is invalid.")
    message = self._wechat_gateway.parse_inbound_message(command.xml_body)
    if message.msg_type != "event" or message.event_type is None:
        logger.debug("WeChat inbound non-event message ignored: msg_type=%s openid=%s",
                     message.msg_type, message.official_openid)
        return None
    scene_key = _normalize_scene_key(message.event_key)
    return await self.handle_message(message, scene_key)
```
`handle_message` 内部不再重复 `_normalize_scene_key`（已由 execute 传入），其余逻辑（identity upsert、建账号、自动回复、标记登录会话）保持不变。

> 注意：原 `execute` 里 `scene_key = _normalize_scene_key(message.event_key)` 在 `if not subscribed: return None` 之后。抽方法后，`scene_key` 在 execute 顶部算好传入；`handle_message` 内 `subscribed`/`is_login_scene` 等判断照旧。确保移动后语义不变。

- [ ] **Step 3: 跑回归，必须与基线一致全绿**

Run: `cd server/api && uv run pytest tests/agent_auth/application/test_handle_wechat_callback_auto_reply.py tests/agent_auth/presentation/test_agent_auth_router.py -v`
Expected: PASS（与 Step 1 一致）

- [ ] **Step 4: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/agent_auth/application/use_cases/handle_wechat_callback.py
git commit -m "refactor(agent_auth): extract handle_message from callback execute (no behavior change)"
```

---

### Task 15: 中立 wechat_callback 模块（分发器 + 独占回调路由）

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/wechat_callback/__init__.py`
- Create: `.../wechat_callback/application/__init__.py`
- Create: `.../wechat_callback/application/dispatcher.py`
- Create: `.../wechat_callback/infrastructure/__init__.py`
- Create: `.../wechat_callback/infrastructure/dependencies.py`
- Create: `.../wechat_callback/presentation/__init__.py`
- Create: `.../wechat_callback/presentation/router.py`
- Modify: `server/api/src/mz_ai_backend/modules/agent_auth/presentation/router.py`（移除两个 callback 路由）
- Modify: `server/api/src/mz_ai_backend/modules/__init__.py`、`core/application.py`（接入 wechat_callback router）

- [ ] **Step 1: 写 dispatcher.py**

```python
from __future__ import annotations

import logging

from mz_ai_backend.modules.agent_auth.application.dtos import HandleAgentWechatCallbackCommand
from mz_ai_backend.modules.agent_auth.application.use_cases.handle_wechat_callback import (
    HandleAgentWechatCallbackUseCase, _normalize_scene_key,
)
from mz_ai_backend.modules.agent_auth.application.ports.services import OfficialWechatGateway
from mz_ai_backend.modules.agent_auth.domain import AgentWechatCallbackInvalidException
from mz_ai_backend.modules.camp_auth.application.use_cases.handle_wechat_callback import (
    HandleCampWechatCallbackUseCase, LOGIN_SCENE_PREFIX as CAMP_LOGIN_SCENE_PREFIX,
)

logger = logging.getLogger(__name__)

AGENT_LOGIN_SCENE_PREFIX = "agent-login-"


class WechatCallbackDispatcher:
    """独占公众号回调：共享「签名校验 + 解析」，再按 scene 前缀 / 事件类型分发。

    分发规则：
    - scene 前缀 camp-login- → 仅 camp.handle_message
    - scene 前缀 agent-login- → 仅 agent.handle_message
    - 无登录 scene 的 subscribe（自然关注）→ 仅 agent.handle_message（建 agent 账号 + 被动回复）
    - 无 scene 的 unsubscribe（取关）→ 广播：agent.handle_message + camp.handle_message
    返回 agent 的被动回复 XML（camp 不产生回复）。
    """

    def __init__(
        self,
        *,
        wechat_gateway: OfficialWechatGateway,
        agent_handler: HandleAgentWechatCallbackUseCase,
        camp_handler: HandleCampWechatCallbackUseCase,
    ) -> None:
        self._gateway = wechat_gateway
        self._agent = agent_handler
        self._camp = camp_handler

    async def dispatch(self, command: HandleAgentWechatCallbackCommand) -> str | None:
        if command.msg_signature:
            valid = self._gateway.verify_msg_signature(
                msg_signature=command.msg_signature, timestamp=command.timestamp,
                nonce=command.nonce, xml_body=command.xml_body,
            )
        else:
            valid = self._gateway.verify_callback_signature(
                signature=command.signature, timestamp=command.timestamp, nonce=command.nonce,
            )
        if not valid:
            raise AgentWechatCallbackInvalidException(message="WeChat callback signature is invalid.")

        message = self._gateway.parse_inbound_message(command.xml_body)
        if message.msg_type != "event" or message.event_type is None:
            logger.debug("wechat callback: non-event ignored msg_type=%s", message.msg_type)
            return None

        scene_key = _normalize_scene_key(message.event_key)

        # 登录 scene 路由
        if scene_key is not None and scene_key.startswith(CAMP_LOGIN_SCENE_PREFIX):
            await self._camp.handle_message(message, scene_key)
            return None
        if scene_key is not None and scene_key.startswith(AGENT_LOGIN_SCENE_PREFIX):
            return await self._agent.handle_message(message, scene_key)

        # 无登录 scene：agent 处理（自然关注/取关都要更新 agent 身份+回复）
        reply = await self._agent.handle_message(message, scene_key)
        # 取关广播给 camp（仅同步已存在的 camp 身份）
        if message.event_type == "unsubscribe":
            await self._camp.handle_message(message, None)
        return reply
```

> `verify_msg_signature` 在 `OfficialWechatGateway` Protocol 上未声明、但具体 gateway 有该方法——与现状一致，直接调用即可。

- [ ] **Step 2: 写 infrastructure/dependencies.py**

```python
from typing import Annotated
from fastapi import Depends

from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import (
    get_official_wechat_gateway, get_snowflake_id_generator, get_agent_account_repository,
)
from mz_ai_backend.modules.agent_auth.infrastructure.repositories import SqlAlchemyAgentAccountRepository
from mz_ai_backend.modules.agent_auth.application.use_cases.handle_wechat_callback import (
    HandleAgentWechatCallbackUseCase,
)
from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import get_camp_account_repository
from mz_ai_backend.modules.camp_auth.application.use_cases.handle_wechat_callback import (
    HandleCampWechatCallbackUseCase,
)
from ..application.dispatcher import WechatCallbackDispatcher
from mz_ai_backend.core.config import Settings
# get_settings_dependency 的实际 import 路径照搬 agent_auth/infrastructure/dependencies.py 顶部那一行
from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import get_settings_dependency


def get_wechat_callback_dispatcher(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
    gateway = Depends(get_official_wechat_gateway),
    snowflake = Depends(get_snowflake_id_generator),
    agent_repo: Annotated[SqlAlchemyAgentAccountRepository, Depends(get_agent_account_repository)] = None,
    camp_repo = Depends(get_camp_account_repository),
) -> WechatCallbackDispatcher:
    # agent handler 需要与现有 get_handle_wechat_callback_use_case 完全一致的 auto-reply 配置
    agent_handler = HandleAgentWechatCallbackUseCase(
        account_repository=agent_repo,
        wechat_gateway=gateway,
        snowflake_id_generator=snowflake,
        auto_reply_enabled=settings.wechat_official_auto_reply_enabled,
        auto_reply_subscribe_news_title=settings.wechat_official_auto_reply_subscribe_news_title or None,
        auto_reply_subscribe_news_description=settings.wechat_official_auto_reply_subscribe_news_description or None,
        auto_reply_subscribe_news_pic_url=settings.wechat_official_auto_reply_subscribe_news_pic_url or None,
        auto_reply_subscribe_news_url=settings.wechat_official_auto_reply_subscribe_news_url or None,
    )
    camp_handler = HandleCampWechatCallbackUseCase(
        account_repository=camp_repo,
        snowflake_id_generator=snowflake,
    )
    return WechatCallbackDispatcher(
        wechat_gateway=gateway, agent_handler=agent_handler, camp_handler=camp_handler,
    )
```
> 执行时：(a) 修正 dispatcher 的相对 import 路径；(b) `get_settings_dependency` 用 agent dependencies 里实际的 import；(c) auto-reply 字段的清洗沿用 agent 的 `_clean`（可 `from ...agent_auth.infrastructure.dependencies import _clean` 后包裹，保持与现有回调字节级一致）。**务必让 agent_handler 的构造参数与原 `get_handle_wechat_callback_use_case` 完全一致**，否则自动回复行为会偏移。

- [ ] **Step 3: 写 presentation/router.py（独占 callback，路径不变）**

```python
from typing import Annotated
from fastapi import APIRouter, Depends, Query, Request, Response

from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import get_official_wechat_gateway
from mz_ai_backend.modules.agent_auth.infrastructure.wechat_official import WechatOfficialAccountGateway
from mz_ai_backend.modules.agent_auth.application.dtos import HandleAgentWechatCallbackCommand
from ..application.dispatcher import WechatCallbackDispatcher
from ..infrastructure.dependencies import get_wechat_callback_dispatcher

# 不带 prefix：完整保留原 URL /agent-auth/wechat-official/callback（WeChat 后台配置不变）
router = APIRouter(tags=["wechat-callback"])


@router.get("/agent-auth/wechat-official/callback", summary="WeChat callback verification")
async def verify_wechat_callback(
    signature: str | None = Query(default=None),
    timestamp: str | None = Query(default=None),
    nonce: str | None = Query(default=None),
    echostr: str | None = Query(default=None),
    gateway: Annotated[WechatOfficialAccountGateway, Depends(get_official_wechat_gateway)] = None,
) -> Response:
    if gateway is None:
        return Response(content="", media_type="text/plain")
    valid = gateway.verify_callback_signature(signature=signature, timestamp=timestamp, nonce=nonce)
    return Response(content=echostr if valid and echostr is not None else "", media_type="text/plain")


@router.post("/agent-auth/wechat-official/callback", summary="WeChat callback events (dispatched)")
async def handle_wechat_callback(
    request: Request,
    dispatcher: Annotated[WechatCallbackDispatcher, Depends(get_wechat_callback_dispatcher)],
    signature: str | None = Query(default=None),
    msg_signature: str | None = Query(default=None),
    timestamp: str | None = Query(default=None),
    nonce: str | None = Query(default=None),
) -> Response:
    body = (await request.body()).decode("utf-8")
    reply = await dispatcher.dispatch(
        HandleAgentWechatCallbackCommand(
            signature=signature, msg_signature=msg_signature,
            timestamp=timestamp, nonce=nonce, xml_body=body,
        )
    )
    if reply:
        return Response(content=reply, media_type="application/xml")
    return Response(content="success", media_type="text/plain")
```
`wechat_callback/__init__.py` 导出 `router`。

- [ ] **Step 4: 从 agent_auth router 移除两个 callback 路由**

在 `agent_auth/presentation/router.py` 删除 `GET/POST /wechat-official/callback` 两个路由及其专用 import（`get_handle_wechat_callback_use_case` 若不再被该文件使用则移除该 import；use case 与 provider 本身保留，dispatcher 仍在用）。agent_auth router 的 prefix 仍是 `/agent-auth`，其余路由不动。

- [ ] **Step 5: 接入 app（在 agent_auth router 之后 include）**

`modules/__init__.py` 加 `from .wechat_callback import router as wechat_callback_router` + `__all__`；`application.py` 加 `app.include_router(wechat_callback_router, prefix=settings.api_prefix)`。
> 因 callback 路由现在不带子 prefix、由 `settings.api_prefix` 统一加前缀，最终路径仍为 `{api_prefix}/agent-auth/wechat-official/callback`，与改造前一致。**执行后务必比对改造前后该完整路径字符串相等。**

- [ ] **Step 6: 校验完整回调路径未变 + 应用启动**

Run: `cd server/api && uv run python -c "from mz_ai_backend.core.application import create_app; app=create_app(); cb=[r.path for r in app.routes if 'wechat-official/callback' in r.path]; print(sorted(set(cb)))"`
Expected: 仅出现一个回调完整路径（如 `['{api_prefix}/agent-auth/wechat-official/callback']`），且 GET/POST 各一，**不重复、不缺失**。

- [ ] **Step 7: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/wechat_callback/ server/api/src/mz_ai_backend/modules/agent_auth/presentation/router.py server/api/src/mz_ai_backend/modules/__init__.py server/api/src/mz_ai_backend/core/application.py
git commit -m "feat(wechat_callback): neutral dispatcher owns single callback, routes by scene prefix"
```

---

### Task 16: 分发器路由测试（agent 回归 + camp 分支 + 取关广播）

**Files:**
- Create: `server/api/tests/wechat_callback/__init__.py`
- Create: `server/api/tests/wechat_callback/test_dispatcher.py`

- [ ] **Step 1: 写分发单元测试（用 fake gateway + fake handlers）**

直接测 `WechatCallbackDispatcher.dispatch`，注入记录调用的 fake：

```python
import pytest
from mz_ai_backend.modules.wechat_callback.application.dispatcher import WechatCallbackDispatcher
from mz_ai_backend.modules.agent_auth.application.dtos import HandleAgentWechatCallbackCommand
from mz_ai_backend.modules.agent_auth.application.ports.services import OfficialWechatInboundMessage
from datetime import datetime, UTC


class _Gateway:
    def __init__(self, message): self._m = message
    def verify_msg_signature(self, **k): return True
    def verify_callback_signature(self, **k): return True
    def parse_inbound_message(self, xml): return self._m


class _Handler:
    def __init__(self, reply=None): self.calls = []; self._reply = reply
    async def handle_message(self, message, scene_key):
        self.calls.append((message.event_type, scene_key)); return self._reply


def _msg(event_type, event_key=None):
    return OfficialWechatInboundMessage(
        msg_type="event", official_openid="openid_x", to_user_name="gh",
        event_type=event_type, event_key=event_key, ticket=None, content=None,
        message_time=datetime.now(UTC).replace(tzinfo=None),
    )


def _cmd(): return HandleAgentWechatCallbackCommand(
    signature="s", msg_signature=None, timestamp="t", nonce="n", xml_body="<xml/>")


@pytest.mark.asyncio
async def test_camp_login_scene_routes_only_to_camp():
    agent, camp = _Handler(reply="<xml>r</xml>"), _Handler()
    d = WechatCallbackDispatcher(wechat_gateway=_Gateway(_msg("subscribe", "qrscene_camp-login-7")),
                                 agent_handler=agent, camp_handler=camp)
    reply = await d.dispatch(_cmd())
    assert camp.calls == [("subscribe", "camp-login-7")]
    assert agent.calls == []
    assert reply is None


@pytest.mark.asyncio
async def test_agent_login_scene_routes_only_to_agent():
    agent, camp = _Handler(reply=None), _Handler()
    d = WechatCallbackDispatcher(wechat_gateway=_Gateway(_msg("SCAN", "agent-login-3")),
                                 agent_handler=agent, camp_handler=camp)
    await d.dispatch(_cmd())
    assert agent.calls == [("SCAN", "agent-login-3")]
    assert camp.calls == []


@pytest.mark.asyncio
async def test_organic_subscribe_goes_to_agent_only():
    agent, camp = _Handler(reply="<xml>welcome</xml>"), _Handler()
    d = WechatCallbackDispatcher(wechat_gateway=_Gateway(_msg("subscribe", None)),
                                 agent_handler=agent, camp_handler=camp)
    reply = await d.dispatch(_cmd())
    assert agent.calls == [("subscribe", None)]
    assert camp.calls == []
    assert reply == "<xml>welcome</xml>"


@pytest.mark.asyncio
async def test_unsubscribe_broadcasts_to_both():
    agent, camp = _Handler(reply=None), _Handler()
    d = WechatCallbackDispatcher(wechat_gateway=_Gateway(_msg("unsubscribe", None)),
                                 agent_handler=agent, camp_handler=camp)
    await d.dispatch(_cmd())
    assert agent.calls == [("unsubscribe", None)]
    assert camp.calls == [("unsubscribe", None)]
```

- [ ] **Step 2: 运行**

Run: `cd server/api && uv run pytest tests/wechat_callback/test_dispatcher.py -v`
Expected: PASS（4 用例）

- [ ] **Step 3: camp 回调 handler 单测（新用户扫码建 camp 账号、取关跳过未知 openid）**

新增 `tests/camp_auth/application/test_handle_camp_wechat_callback.py`：用 fake repo 验证 `HandleCampWechatCallbackUseCase.handle_message`：(a) `camp-login-*` + 未知 openid → 调 `create_account` + `create_wechat_identity` + `mark_wechat_login_session_authenticated`；(b) `unsubscribe` + 未知 openid → 不调任何写方法（仅 debug）。（fake repo 记录方法调用，参照 Step 1 风格。）

Run: `cd server/api && uv run pytest tests/camp_auth/application/test_handle_camp_wechat_callback.py -v`
Expected: PASS

- [ ] **Step 4: 全后端回归**

Run: `cd server/api && uv run pytest tests/agent_auth tests/camp_auth tests/wechat_callback -v`
Expected: 全 PASS（agent 既有用例无回归）

- [ ] **Step 5: Commit**

```bash
git add server/api/tests/wechat_callback/ server/api/tests/camp_auth/application/
git commit -m "test(wechat_callback): dispatch routing + camp callback handler"
```

---

# Part 3 — aicamp BFF + feature/auth

> 前端无单元测试（项目规范）；每个前端任务以「类型检查 / 构建 / 运行验证」收尾。统一 BFF 改名：endpoint `/agent-auth/*`→`/camp-auth/*`；Cookie 前缀见 Task 17；env `WEBSITE_API_BASE_URL`→`CAMP_API_BASE_URL`（`INTERNAL_API_URL` 复用名）；错误码判断 `AGENT_AUTH.*`→`CAMP_AUTH.*`。

### Task 17: cookie-names + env 约定

**Files:**
- Create: `website-aicamp/src/features/auth/cookie-names.ts`
- Create: `website-aicamp/.env.local.example`（或在 README 注明）

- [ ] **Step 1: cookie-names.ts（host-only，camp 前缀）**

```ts
export const ACCESS_TOKEN_COOKIE = 'camp_access_token'
export const REFRESH_TOKEN_COOKIE = 'camp_refresh_token'
export const ACCESS_EXPIRES_COOKIE = 'camp_access_expires_at'
export const REFRESH_EXPIRES_COOKIE = 'camp_refresh_expires_at'
```

- [ ] **Step 2: 记录 env 约定**

新增 `website-aicamp/.env.local.example`：
```
# aicamp BFF 指向同一套后端（与 website 同后端，不同域名前端）
CAMP_API_BASE_URL=https://api.weelume.com/api/v1
# 同一个微信公众号 bizmid（移动端「在微信中打开」）
NEXT_PUBLIC_WECHAT_OFFICIAL_BIZMID=
```

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/features/auth/cookie-names.ts website-aicamp/.env.local.example
git commit -m "feat(aicamp-auth): cookie names (camp_*) and env conventions"
```

---

### Task 18: features/auth/types.ts

**Files:**
- Create: `website-aicamp/src/features/auth/types.ts`

- [ ] **Step 1: 复制 website types.ts，删 EmailBindingChallenge**

把 `website/src/features/auth/types.ts` 原样复制，删除 `EmailBindingChallenge` 类型（aicamp 无邮箱绑定）。其余（`AuthAccount`/`AuthTokenSet`/`AuthPayload`/`AuthState`/`ApiErrorPayload`/`WechatLoginSession`/`WechatLoginSessionStatus`）保持不变。

- [ ] **Step 2: Commit**

```bash
git add website-aicamp/src/features/auth/types.ts
git commit -m "feat(aicamp-auth): auth types"
```

---

### Task 19: features/auth/server/backend.ts

**Files:**
- Create: `website-aicamp/src/features/auth/server/backend.ts`

- [ ] **Step 1: 复制 + 改 endpoint/env，删非扫码函数**

复制 `website/src/features/auth/server/backend.ts`。改动：
- `resolveApiBaseUrl()`：`process.env.WEBSITE_API_BASE_URL` → `process.env.CAMP_API_BASE_URL`（`INTERNAL_API_URL` 保留）。
- 所有上游路径 `/agent-auth/...` → `/camp-auth/...`（`refreshSession`→`/camp-auth/refresh`、`logoutSession`→`/camp-auth/logout`、`getCurrentAccount`→`/camp-auth/me`、`createWechatLoginSession`→`/camp-auth/wechat-official/login-sessions`、`getWechatLoginSession`→`/camp-auth/wechat-official/login-sessions/{id}`、`exchangeWechatLogin`→`/camp-auth/wechat-official/login-sessions/{id}/exchange`）。
- **删除** `devFakeLogin`（aicamp 不做 dev 登录）。
- `WebsiteAuthError` 类名可保留（仅内部用），或改名 `CampAuthError`——本计划保留原名以减少改动面。

- [ ] **Step 2: 类型检查**

Run: `cd website-aicamp && pnpm exec tsc --noEmit`
Expected: 无与 backend.ts 相关的类型错误（其他未创建文件的报错此步可忽略，最终在 Task 27 后全绿）。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/features/auth/server/backend.ts
git commit -m "feat(aicamp-auth): BFF backend client (/camp-auth, CAMP_API_BASE_URL)"
```

---

### Task 20: features/auth/server/cookies.ts（host-only）

**Files:**
- Create: `website-aicamp/src/features/auth/server/cookies.ts`

- [ ] **Step 1: 复制 website cookies.ts**

原样复制 `website/src/features/auth/server/cookies.ts`（依赖 Task 17 的 cookie-names、Task 18 的 types）。

- [ ] **Step 2: 确认 host-only（不设 Domain）**

检查 `cookieOptions` / `metadataCookieOptions`：保持**不含 `domain` 字段**（website 版本本就未设 domain → 默认 host-only）。在文件顶部加注释：
```ts
// host-only：不设 domain，Cookie 绑定到 aicamp 自身域名，与 website 的 weelume_agent_* 物理隔离。
```

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/features/auth/server/cookies.ts
git commit -m "feat(aicamp-auth): cookie read/write (host-only camp_*)"
```

---

### Task 21: features/auth/server/session.ts

**Files:**
- Create: `website-aicamp/src/features/auth/server/session.ts`

- [ ] **Step 1: 复制 + 改错误码判断 + 改函数名**

复制 `website/src/features/auth/server/session.ts`。改动：
- 函数名 `getWebsiteAuthState` → `getCampAuthState`（aicamp 内部统一用此名；后续 layout/api 引用一致）。
- `isSessionRevocationError`：错误码 `'AGENT_AUTH.REFRESH_TOKEN_EXPIRED'`/`'AGENT_AUTH.SESSION_REVOKED'` → `'CAMP_AUTH.REFRESH_TOKEN_EXPIRED'`/`'CAMP_AUTH.SESSION_REVOKED'`。

- [ ] **Step 2: Commit**

```bash
git add website-aicamp/src/features/auth/server/session.ts
git commit -m "feat(aicamp-auth): session resolver (getCampAuthState, CAMP_AUTH codes)"
```

---

### Task 22: protected-routes.ts（留空）

**Files:**
- Create: `website-aicamp/src/features/auth/protected-routes.ts`

- [ ] **Step 1: 写空保护列表**

```ts
// 本期只做登录态基础设施：首页与所有现有页面公开，无强制登录页面。
// 未来新增受保护页面时，往 PROTECTED_ROUTES 添加路径前缀即可（中间件会重定向到 /login）。
export const PROTECTED_ROUTES: string[] = []

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    if (route === '/') return pathname === '/'
    return pathname === route || pathname.startsWith(`${route}/`)
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add website-aicamp/src/features/auth/protected-routes.ts
git commit -m "feat(aicamp-auth): empty protected-routes (home public)"
```

---

### Task 23: BFF api/auth 路由 + _shared

**Files:**
- Create: `website-aicamp/src/app/api/auth/_shared.ts`
- Create: `website-aicamp/src/app/api/auth/wechat-login/sessions/route.ts`
- Create: `website-aicamp/src/app/api/auth/wechat-login/sessions/[sessionId]/route.ts`
- Create: `website-aicamp/src/app/api/auth/wechat-login/sessions/[sessionId]/exchange/route.ts`
- Create: `website-aicamp/src/app/api/auth/logout/route.ts`
- Create: `website-aicamp/src/app/api/auth/me/route.ts`

- [ ] **Step 1: _shared.ts（精简为仅 authErrorResponse）**

```ts
import { NextResponse } from 'next/server'

import type { ApiErrorPayload } from '@/features/auth/types'
import { WebsiteAuthError } from '@/features/auth/server/backend'

export function authErrorResponse(error: unknown): NextResponse<ApiErrorPayload> {
  if (error instanceof WebsiteAuthError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    )
  }
  return NextResponse.json(
    { error: { code: 'AUTH.INTERNAL_ERROR', message: '认证请求处理失败' } },
    { status: 500 },
  )
}
```
（不需要 `proxyAuthRequest`/`readJsonBody`/`getAccessTokenOrThrow`——那些只服务 email/username 代理。）

- [ ] **Step 2: 五个路由文件**

逐一复制 website 对应文件（见参考），仅改 import 路径深度与（me 路由）`getWebsiteAuthState`→`getCampAuthState`：

`wechat-login/sessions/route.ts`：
```ts
import { NextResponse } from 'next/server'
import { createWechatLoginSession } from '@/features/auth/server/backend'
import { authErrorResponse } from '../../_shared'

export async function POST() {
  try {
    const session = await createWechatLoginSession()
    return NextResponse.json({ session })
  } catch (error) {
    return authErrorResponse(error)
  }
}
```

`wechat-login/sessions/[sessionId]/route.ts`：
```ts
import { NextResponse } from 'next/server'
import { getWechatLoginSession } from '@/features/auth/server/backend'
import { authErrorResponse } from '../../../_shared'

type RouteContext = { params: Promise<{ sessionId: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params
  try {
    const status = await getWechatLoginSession(sessionId)
    return NextResponse.json({ status })
  } catch (error) {
    return authErrorResponse(error)
  }
}
```

`wechat-login/sessions/[sessionId]/exchange/route.ts`：
```ts
import { NextResponse } from 'next/server'
import { exchangeWechatLogin } from '@/features/auth/server/backend'
import { toAuthenticatedState, writeAuthCookies } from '@/features/auth/server/cookies'
import { authErrorResponse } from '../../../../_shared'

type RouteContext = { params: Promise<{ sessionId: string }> }

export async function POST(_request: Request, context: RouteContext) {
  const { sessionId } = await context.params
  try {
    const payload = await exchangeWechatLogin(sessionId)
    await writeAuthCookies(payload)
    return NextResponse.json({ state: toAuthenticatedState(payload) })
  } catch (error) {
    return authErrorResponse(error)
  }
}
```

`logout/route.ts`：
```ts
import { NextResponse } from 'next/server'
import { logoutSession } from '@/features/auth/server/backend'
import { clearAuthCookies, readAuthCookies } from '@/features/auth/server/cookies'
import { authErrorResponse } from '../_shared'

export async function POST() {
  const snapshot = await readAuthCookies()
  try {
    if (snapshot.refreshToken) await logoutSession(snapshot.refreshToken)
    await clearAuthCookies()
    return NextResponse.json({ revoked: true })
  } catch (error) {
    await clearAuthCookies()
    return authErrorResponse(error)
  }
}
```

`me/route.ts`：
```ts
import { NextResponse } from 'next/server'
import { getCampAuthState } from '@/features/auth/server/session'
import { authErrorResponse } from '../_shared'

export async function GET() {
  try {
    const state = await getCampAuthState()
    return NextResponse.json({ state })
  } catch (error) {
    return authErrorResponse(error)
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/app/api/auth/
git commit -m "feat(aicamp-auth): BFF auth routes (wechat-login/logout/me)"
```

---

### Task 24: middleware.ts

**Files:**
- Create: `website-aicamp/src/middleware.ts`

- [ ] **Step 1: 复制 + 改 cookie 名/refresh 路径**

复制 `website/src/middleware.ts`。改动：
- cookie-names import 来自 aicamp 的 `@/features/auth/cookie-names`（已是 camp_*）。
- `refreshSession`/`WebsiteAuthError` 来自 aicamp 的 `@/features/auth/server/backend`（已指向 `/camp-auth/refresh`）。
- `isProtectedPath` 来自 aicamp 的 `@/features/auth/protected-routes`（空列表 → 非保护路径，仅做静默刷新，从不重定向）。
- `isSessionRevocation` 错误码 `AGENT_AUTH.*` → `CAMP_AUTH.*`。
- `config.matcher` 保持 `['/((?!_next/static|_next/image|favicon.ico|logo|api/auth).*)']`。

- [ ] **Step 2: 类型检查**

Run: `cd website-aicamp && pnpm exec tsc --noEmit`
Expected: 无 middleware 相关类型错误。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/middleware.ts
git commit -m "feat(aicamp-auth): middleware (silent refresh, camp_* cookies)"
```

---

# Part 4 — 登录 UI + 导航登录态

### Task 25: WechatLoginPanel.tsx

**Files:**
- Create: `website-aicamp/src/app/login/WechatLoginPanel.tsx`

- [ ] **Step 1: 原样复制**

把 `website/src/app/(site)/login/WechatLoginPanel.tsx` 原样复制到 aicamp `app/login/`。无需改动（它请求的是同源 `/api/auth/wechat-login/...`，aicamp 已提供；类型 import `@/features/auth/types` 已存在；`NEXT_PUBLIC_WECHAT_OFFICIAL_BIZMID` 同公众号）。错误码分支 `AGENT_AUTH.WECHAT_IDENTITY_NOT_SUBSCRIBED` → 改为 `CAMP_AUTH.WECHAT_IDENTITY_NOT_SUBSCRIBED`；`USER.DISABLED` 保持。

- [ ] **Step 2: Commit**

```bash
git add website-aicamp/src/app/login/WechatLoginPanel.tsx
git commit -m "feat(aicamp-auth): wechat login panel (qr poll/exchange)"
```

---

### Task 26: /login 页 + LoginContent

**Files:**
- Create: `website-aicamp/src/app/login/page.tsx`
- Create: `website-aicamp/src/app/login/LoginContent.tsx`

- [ ] **Step 1: page.tsx**

```tsx
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginContent } from './LoginContent'

export const metadata: Metadata = {
  title: '登录 · 微域生光',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  )
}
```

- [ ] **Step 2: LoginContent.tsx（复制 website 版，删 dev/email 块）**

以 `website/src/app/(site)/login/LoginContent.tsx` 为模板：保留 `normalizeNextPath`、`handleLoginSuccess`（`router.replace(nextPath); router.refresh()`）、`<WechatLoginPanel onSuccess=...>` 卡片。**删除**整个 dev-login（用户名输入 + POST `/api/auth/dev-login`）块。Tailwind class 直接沿用（aicamp 与 website 同 design tokens）。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/app/login/page.tsx website-aicamp/src/app/login/LoginContent.tsx
git commit -m "feat(aicamp-auth): /login page (wechat qr only)"
```

---

### Task 27: 导航登录态 + root layout 注入

**Files:**
- Create: `website-aicamp/src/components/layout/AccountMenu.tsx`
- Modify: `website-aicamp/src/components/layout/TopNav.tsx`
- Modify: `website-aicamp/src/components/layout/index.ts`
- Modify: `website-aicamp/src/app/layout.tsx`

- [ ] **Step 1: AccountMenu.tsx（无 /account，label 不可点）**

```tsx
'use client'

import type { AuthState } from '@/features/auth/types'

export function AccountMenu({
  authState,
  loggingOut,
  onLogout,
}: {
  authState: AuthState
  loggingOut: boolean
  onLogout: () => void
}) {
  if (!authState.authenticated) return null
  const label = authState.account.email || authState.account.username || '已登录'
  return (
    <div className="flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5">
      <span className="max-w-[150px] truncate text-[13px] text-ink-soft">{label}</span>
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        className="text-[13px] text-muted transition-colors hover:text-ink disabled:opacity-50"
      >
        {loggingOut ? '退出中' : '退出'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: TopNav.tsx 接登录态**

改 `TopNav` 接收 `initialAuthState: AuthState` prop，沿用 website 的 auth 接法：
- `import { useState, useEffect } from 'react'`、`import Link from 'next/link'`（已有）、`import { usePathname } from 'next/navigation'`、`import type { AuthState } from '@/features/auth/types'`、`import { AccountMenu } from './AccountMenu'`。
- `const [authState, setAuthState] = useState(initialAuthState)`；`useEffect(() => setAuthState(initialAuthState), [initialAuthState])`。
- `const [loggingOut, setLoggingOut] = useState(false)`；`handleLogout`：`setLoggingOut(true); await fetch('/api/auth/logout', { method: 'POST' }); setAuthState({ authenticated: false, reason: 'missing_session' }); setLoggingOut(false)`。
- `const pathname = usePathname()`；`const loginNextPath = pathname?.startsWith('/login') ? '/' : (pathname || '/')`；`const loginHref = '/login?next=' + encodeURIComponent(loginNextPath)`。
- 右侧把现有「咨询」按钮包进 `<div className="flex items-center gap-2">`，在其**左侧**插入：
  ```tsx
  {authState.authenticated
    ? <AccountMenu authState={authState} loggingOut={loggingOut} onLogout={handleLogout} />
    : <Link href={loginHref} className="rounded-full border border-hairline bg-surface px-4 py-1.5 text-[14px] font-medium text-ink transition-all hover:border-hairline-strong sm:text-[15px]">登录</Link>}
  ```
  「咨询」按钮与 `ContactQrCodeModal` 逻辑保持不动。

- [ ] **Step 3: layout/index.ts 导出 AccountMenu（可选）**

`export { AccountMenu } from './AccountMenu'`（如需）。

- [ ] **Step 4: root layout.tsx 改 async 注入 authState**

把 `website-aicamp/src/app/layout.tsx` 的 `RootLayout` 改为 `async`，注入登录态：
```tsx
import { getCampAuthState } from '@/features/auth/server/session'
// ...
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const authState = await getCampAuthState()
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className="relative min-h-screen bg-canvas font-sans text-ink">
        <div className="relative flex min-h-screen flex-col">
          <TopNav initialAuthState={authState} />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
```
> `getCampAuthState` 在 Server Component 渲染期可能尝试写 cookie（刷新 token）——website 的 `cookies.ts` 已对「只读渲染上下文」做了 `console.warn` 跳过处理（已随 Task 20 复制）。中间件在顶层文档导航时已做静默刷新，故 layout 内通常只读，不会抛错。

- [ ] **Step 5: 类型检查 + 构建**

Run: `cd website-aicamp && pnpm exec tsc --noEmit`
Expected: 全绿（所有 auth 文件已就位）。

Run: `cd website-aicamp && pnpm run build`
Expected: 构建成功，无类型/路由错误。

- [ ] **Step 6: Commit**

```bash
git add website-aicamp/src/components/layout/ website-aicamp/src/app/layout.tsx
git commit -m "feat(aicamp-auth): nav login state + async root layout auth injection"
```

---

### Task 28: 端到端联调验证（后端 + aicamp 前端 + 真实扫码）

**Files:** 无（验证任务）

- [ ] **Step 1: 启后端**

Run: `cd server && uv run python -m uvicorn main:app --reload --port 8000`
确认启动日志无报错，`/api/v1/camp-auth/me` 路由存在。

- [ ] **Step 2: 启 aicamp 前端**

配置 `website-aicamp/.env.local`：`CAMP_API_BASE_URL=http://127.0.0.1:8000/api/v1`、`NEXT_PUBLIC_WECHAT_OFFICIAL_BIZMID=<同公众号 bizmid>`。
Run: `cd website-aicamp && pnpm run dev`（端口 3100）

- [ ] **Step 2.5: 确认回调可达（公众号配置不变）**

公众号后台回调 URL 仍为后端 `.../api/v1/agent-auth/wechat-official/callback`（未改）。本地联调若公众号无法回调本机，使用与 website 相同的内网穿透/测试号方案（与现有 agent 扫码登录调试方式一致）。

- [ ] **Step 3: 扫码登录流程（chrome-devtools）**

浏览器开 `http://localhost:3100/login`：
- 二维码渲染、倒计时刷新正常。
- 用**同一个公众号**扫码关注/扫码。
- 后端日志（debug）应显示：`wechat_callback` 分发 → `camp` 分支 → 建 `camp_accounts` 账号 + `camp_wechat_identities` 绑定 + 标记 camp 登录会话 authenticated。
- 前端轮询到 authenticated → exchange → `router.replace('/')` + refresh。

- [ ] **Step 4: 验证登录态与 Cookie 隔离**

- 浏览器 DevTools → Application → Cookies：存在 `camp_access_token`/`camp_refresh_token`（host-only，Domain 为 aicamp 域名/localhost，**非** `.weelume.com`）。
- 顶部导航显示账号（`camp_{id}`）+ 退出按钮。
- 刷新页面，登录态保持（中间件静默刷新生效）。
- 点「退出」→ 调 `/api/auth/logout`，Cookie 清除，导航回到「登录」。

- [ ] **Step 5: 验证 website 未受影响（回归）**

启 website（端口 3000），扫码登录仍正常（agent 分支），其 `weelume_agent_*` Cookie 与 aicamp 互不干扰。

- [ ] **Step 6: 数据库核对**

查询确认：`camp_accounts` 有新行、`agent_accounts` **未**因 aicamp 扫码新增行（隔离正确）。

- [ ] **Step 7: 最终后端测试全跑**

Run: `cd server/api && uv run pytest tests/agent_auth tests/camp_auth tests/wechat_callback -v`
Expected: 全 PASS。

---

## 验收标准汇总

- 后端：`pytest tests/agent_auth tests/camp_auth tests/wechat_callback` 全绿；agent 既有回调/路由测试无回归。
- 回调：全应用仅一个 `/agent-auth/wechat-official/callback` 完整路径（GET+POST），由 `wechat_callback` 独占并按 scene 前缀分发。
- 数据：aicamp 扫码只写 `camp_*` 表，不触碰 `agent_*`；同 openid 两表各一账号。
- 前端：`tsc --noEmit` 与 `pnpm run build` 通过；真实同公众号扫码可登录，`camp_*` host-only Cookie 隔离，导航登录态/刷新/登出正确；首页公开、无强制登录。

## 风险与回滚

- 最高风险=Task 14/15 触碰 agent 在产回调链路 → 以 Task 14 Step 1 基线 + Task 16 Step 4 回归为护栏；务必比对回调完整路径字符串改造前后相等。
- 数据回滚：`DROP TABLE camp_wechat_login_sessions, camp_wechat_identities, camp_auth_access_tokens, camp_auth_sessions, camp_accounts;`（纯新增，无破坏性）。
- 代码回滚：camp_auth / wechat_callback 为新增模块；agent_auth 改动仅「抽方法 + 移路由」，可单独 revert（回调路由移回 agent router 即恢复原状）。
