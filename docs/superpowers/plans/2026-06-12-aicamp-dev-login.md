# aicamp 开发环境免微信登录（dev fake-login）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 `website-aicamp` 增加仅开发环境可用、可选会员 tier 的免微信登录入口，参照官网 `website` 的 dev fake-login 机制。

**Architecture:** 后端在 `camp_auth` 模块新增 `DevCampFakeLoginUseCase`（按 username find-or-create 账号 → 可选强制写会员列 → 复用 `issue_camp_auth_tokens` 签发 token）+ `set_membership` 仓储方法 + `POST /camp-auth/dev/fake-login` 路由（`settings.env=="production"` 时 404）。前端新增 `devFakeLogin` 后端客户端 + `/api/auth/dev-login` 路由（`NODE_ENV=="production"` 时 404）+ 登录页 dev 面板（username + tier 选择）。会员列已在 `camp_accounts` 表，无 schema 变更。

**Tech Stack:** 后端 FastAPI + SQLAlchemy + DDD（pytest 测试，`cd server && uv run pytest`）；前端 Next.js 15 App Router + React 19 + TypeScript（无单测框架，验证用 `pnpm exec tsc --noEmit` + 运行时）。

**规格依据：** `docs/superpowers/specs/2026-06-12-aicamp-dev-login-design.md`

> 约定：后端命令在 `server/` 下用 `uv run`；前端命令在 `website-aicamp/` 下。后端 tier 用 `Literal["none","basic","premium"]`，在 FastAPI 边界自动 422 校验，避免手动校验/跨模块导入枚举。所有 dev 后门均注释标注 dev-only。

**文件结构：**

| 文件 | 改动 | 职责 |
|---|---|---|
| `camp_auth/application/dtos.py` | 改 | 加 `DEV_FAKE_LOGIN_DEFAULT_USERNAME` + `DevCampFakeLoginCommand` |
| `camp_auth/application/__init__.py` | 改 | 导出上述两项 |
| `camp_auth/application/ports/repositories.py` | 改 | 加 `set_membership` 协议方法 |
| `camp_auth/infrastructure/repositories.py` | 改 | 实现 `set_membership` |
| `camp_auth/application/use_cases/dev_camp_fake_login.py` | 建 | `DevCampFakeLoginUseCase` |
| `camp_auth/application/use_cases/__init__.py` | 改 | 导出用例 |
| `camp_auth/infrastructure/dependencies.py` | 改 | `get_dev_camp_fake_login_use_case` |
| `camp_auth/infrastructure/__init__.py` | 改 | 导出依赖工厂 |
| `camp_auth/presentation/schemas.py` | 改 | `DevCampFakeLoginRequest` |
| `camp_auth/presentation/router.py` | 改 | `POST /dev/fake-login` + 生产守卫 |
| `website-aicamp/src/features/auth/server/backend.ts` | 改 | `devFakeLogin()` |
| `website-aicamp/src/app/api/auth/dev-login/route.ts` | 建 | dev-only 路由 |
| `website-aicamp/src/app/login/LoginContent.tsx` | 改 | dev 面板（username + tier） |

---

### Task 1: DTO — DevCampFakeLoginCommand

**Files:**
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/application/dtos.py`
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/application/__init__.py`

- [ ] **Step 1: 在 dtos.py 顶部 import 区加 `Literal`**

`dtos.py` 现有首部为 `from __future__ import annotations` + `from datetime import datetime` + `from pydantic import BaseModel, ConfigDict, field_validator`。在 `from datetime import datetime` 下方补：
```python
from typing import Literal
```

- [ ] **Step 2: 在 dtos.py 文件末尾追加 command 与默认常量**

```python
# dev-only：本地免微信登录命令。tier 用 Literal，非法值在 FastAPI 边界即被拒。
DEV_FAKE_LOGIN_DEFAULT_USERNAME = "dev_local"


class DevCampFakeLoginCommand(BaseModel):
    """dev-only 免微信登录命令：按 username find-or-create，并可选设置会员 tier。"""

    model_config = ConfigDict(frozen=True)

    username: str = DEV_FAKE_LOGIN_DEFAULT_USERNAME
    tier: Literal["none", "basic", "premium"] = "none"
```

- [ ] **Step 3: 在 application/__init__.py 导出**

打开 `application/__init__.py`，在其从 `.dtos` 导入的列表中加入 `DEV_FAKE_LOGIN_DEFAULT_USERNAME` 与 `DevCampFakeLoginCommand`，并加入 `__all__`（与现有 DTO 导出方式一致）。

- [ ] **Step 4: 校验导入无误**

```bash
cd server && uv run python -c "from mz_ai_backend.modules.camp_auth.application import DevCampFakeLoginCommand, DEV_FAKE_LOGIN_DEFAULT_USERNAME; print(DevCampFakeLoginCommand(tier='basic'))"
```
Expected: 打印一个 `username='dev_local' tier='basic'` 的对象，无异常。

- [ ] **Step 5: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/application/dtos.py server/api/src/mz_ai_backend/modules/camp_auth/application/__init__.py
git commit -m "feat(camp-auth): dev fake-login 命令 DTO(含 tier)"
```

---

### Task 2: 仓储方法 set_membership

**Files:**
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/application/ports/repositories.py`
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/repositories.py`
- Test: `server/api/tests/camp_auth/infrastructure/test_camp_auth_repository.py`

- [ ] **Step 1: 在 port 协议加方法签名**

在 `ports/repositories.py` 的 `CampAccountRepository` 协议内（紧邻 `get_membership_summary` 之后）加：
```python
    async def set_membership(
        self,
        *,
        account_id: int,
        tier: str,
        started_at: datetime,
        expires_at: datetime,
    ) -> None:
        """[dev-only] 强制设置账号会员三列；生产授予走 camp_membership 支付回调。"""
```
（`datetime` 已在该文件 import。）

- [ ] **Step 2: 写失败测试**

在 `test_camp_auth_repository.py` 末尾追加（沿用该文件既有的 repo + session fixture 风格；若 fixture 名不同，按文件内现有用例调整）：
```python
async def test_set_membership_writes_account_columns(camp_account_repository):
    from datetime import UTC, datetime, timedelta
    from mz_ai_backend.modules.camp_auth.application import CampAccountRegistration
    from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus

    repo = camp_account_repository
    account = await repo.create_account(
        CampAccountRegistration(account_id=77001, username="dev_set_member", status=CampAccountStatus.ACTIVE)
    )
    now = datetime.now(UTC).replace(tzinfo=None)
    await repo.set_membership(
        account_id=account.account_id, tier="basic", started_at=now, expires_at=now + timedelta(days=365)
    )

    summary = await repo.get_membership_summary(account_id=account.account_id, now=now)
    assert summary.tier == "basic"
    assert summary.is_active is True
```
> 若该测试文件用的是同步函数 + 自定义 async runner，或 repo fixture 名不同，先读文件顶部 fixture/import 约定再对齐命名；逻辑断言不变。

- [ ] **Step 3: 运行测试，确认失败**

```bash
cd server && uv run pytest api/tests/camp_auth/infrastructure/test_camp_auth_repository.py -k set_membership -v
```
Expected: FAIL（`AttributeError: ... has no attribute 'set_membership'` 或断言失败）。

- [ ] **Step 4: 实现 set_membership**

在 `infrastructure/repositories.py` 的 `SqlAlchemyCampAccountRepository` 内（`get_membership_summary` 方法之后）加：
```python
    async def set_membership(
        self,
        *,
        account_id: int,
        tier: str,
        started_at: datetime,
        expires_at: datetime,
    ) -> None:
        # dev-only：直接覆盖写账号会员三列；生产授予走 camp_membership 支付回调。
        result = await self._session.execute(
            select(CampAccountModel).where(
                CampAccountModel.account_id == account_id,
                CampAccountModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            raise ValueError(f"camp account not found for set_membership: {account_id}")
        model.membership_tier = tier
        model.membership_started_at = started_at
        model.membership_expires_at = expires_at
        await self._session.commit()
```

- [ ] **Step 5: 运行测试，确认通过**

```bash
cd server && uv run pytest api/tests/camp_auth/infrastructure/test_camp_auth_repository.py -k set_membership -v
```
Expected: PASS。

- [ ] **Step 6: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/application/ports/repositories.py server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/repositories.py server/api/tests/camp_auth/infrastructure/test_camp_auth_repository.py
git commit -m "feat(camp-auth): 仓储 set_membership(dev 强制写会员列)"
```

---

### Task 3: 用例 DevCampFakeLoginUseCase

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/camp_auth/application/use_cases/dev_camp_fake_login.py`
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/application/use_cases/__init__.py`
- Test: `server/api/tests/camp_auth/application/test_dev_camp_fake_login.py`

- [ ] **Step 1: 写用例**

`dev_camp_fake_login.py`：
```python
"""dev-only 免微信假登录用例。

按 username find-or-create 一个 ACTIVE camp 账号；可选强制设置会员 tier（基础/高级），
再复用标准 issue_camp_auth_tokens 签发 token。不创建任何微信身份/登录会话记录。
仅供开发环境；路由层须在 env=production 时 404 拒绝调用。
"""

from __future__ import annotations

from datetime import UTC, datetime, timedelta

from ..dtos import CampAccountRegistration, DevCampFakeLoginCommand
from ..ports import CampAccountRepository, TokenService
from ...domain import CampAccountStatus
from ._session_tokens import issue_camp_auth_tokens

_DEV_MEMBERSHIP_TTL_DAYS = 365


class DevCampFakeLoginUseCase:
    """Issue camp tokens for a username without WeChat scan, optionally granting a tier."""

    def __init__(
        self,
        *,
        account_repository: CampAccountRepository,
        token_service: TokenService,
        snowflake_id_generator,
        access_token_ttl_seconds: int,
        refresh_token_ttl_days: int,
    ) -> None:
        self._account_repository = account_repository
        self._token_service = token_service
        self._snowflake_id_generator = snowflake_id_generator
        self._access_token_ttl_seconds = access_token_ttl_seconds
        self._refresh_token_ttl_days = refresh_token_ttl_days

    async def execute(self, command: DevCampFakeLoginCommand):
        account = await self._account_repository.get_account_by_username(command.username)
        if account is None:
            account = await self._account_repository.create_account(
                CampAccountRegistration(
                    account_id=self._snowflake_id_generator.generate(),
                    username=command.username,
                    status=CampAccountStatus.ACTIVE,
                )
            )
        if command.tier != "none":
            now = datetime.now(UTC).replace(tzinfo=None)
            await self._account_repository.set_membership(
                account_id=account.account_id,
                tier=command.tier,
                started_at=now,
                expires_at=now + timedelta(days=_DEV_MEMBERSHIP_TTL_DAYS),
            )
        return await issue_camp_auth_tokens(
            account_repository=self._account_repository,
            token_service=self._token_service,
            snowflake_id_generator=self._snowflake_id_generator,
            account=account,
            access_token_ttl_seconds=self._access_token_ttl_seconds,
            refresh_token_ttl_days=self._refresh_token_ttl_days,
        )
```

- [ ] **Step 2: 导出用例**

在 `use_cases/__init__.py` 加 `from .dev_camp_fake_login import DevCampFakeLoginUseCase` 并加入 `__all__`（与现有用例导出一致）。

- [ ] **Step 3: 写失败测试（fakes 风格，参照 test_handle_camp_wechat_callback.py）**

`test_dev_camp_fake_login.py`：
```python
from __future__ import annotations

from datetime import UTC, datetime

import pytest

from mz_ai_backend.modules.camp_auth.application.dtos import DevCampFakeLoginCommand
from mz_ai_backend.modules.camp_auth.application.use_cases.dev_camp_fake_login import (
    DevCampFakeLoginUseCase,
)
from mz_ai_backend.modules.camp_auth.application import CampAccountRegistration
from mz_ai_backend.modules.camp_auth.domain import CampAccount, CampAccountStatus


def _account(account_id: int, username: str) -> CampAccount:
    now = datetime.now(UTC).replace(tzinfo=None)
    return CampAccount(
        account_id=account_id, username=username, email=None, status=CampAccountStatus.ACTIVE,
        enrollment_status="none", enrolled_at=None, enrollment_expires_at=None,
        is_deleted=False, created_at=now, updated_at=now,
    )


class _Snowflake:
    def __init__(self) -> None:
        self._v = 8000

    def generate(self) -> int:
        self._v += 1
        return self._v


class _TokenService:
    def generate_token(self) -> str:
        return "tok"

    def hash_token(self, token: str) -> str:
        return f"h:{token}"


class _Repo:
    def __init__(self, existing: CampAccount | None = None) -> None:
        self._existing = existing
        self.created: CampAccountRegistration | None = None
        self.set_membership_calls: list[dict] = []
        self.sessions: list = []

    async def get_account_by_username(self, username: str):
        return self._existing

    async def create_account(self, registration: CampAccountRegistration):
        self.created = registration
        return _account(registration.account_id, registration.username)

    async def set_membership(self, *, account_id, tier, started_at, expires_at) -> None:
        self.set_membership_calls.append({"account_id": account_id, "tier": tier})

    async def create_session(self, issue) -> None:
        self.sessions.append(issue)


def _use_case(repo: _Repo) -> DevCampFakeLoginUseCase:
    return DevCampFakeLoginUseCase(
        account_repository=repo, token_service=_TokenService(), snowflake_id_generator=_Snowflake(),
        access_token_ttl_seconds=900, refresh_token_ttl_days=30,
    )


@pytest.mark.asyncio
async def test_creates_account_and_issues_tokens_without_tier():
    repo = _Repo(existing=None)
    result = await _use_case(repo).execute(DevCampFakeLoginCommand(username="dev_a", tier="none"))
    assert repo.created is not None and repo.created.username == "dev_a"
    assert repo.set_membership_calls == []           # tier=none 不写会员
    assert result.tokens.access_token == "tok"
    assert len(repo.sessions) == 1


@pytest.mark.asyncio
async def test_sets_membership_when_tier_given_and_reuses_existing_account():
    existing = _account(9100, "dev_b")
    repo = _Repo(existing=existing)
    await _use_case(repo).execute(DevCampFakeLoginCommand(username="dev_b", tier="premium"))
    assert repo.created is None                       # 复用已存在账号
    assert repo.set_membership_calls == [{"account_id": 9100, "tier": "premium"}]
```
> 若该测试套件未启用 `pytest-asyncio` 的 `asyncio_mode=auto`，保留 `@pytest.mark.asyncio`；若启用了 auto，可去掉装饰器。先看 `test_handle_camp_wechat_callback.py` 是否带该装饰器并对齐。

- [ ] **Step 4: 运行，确认通过**

```bash
cd server && uv run pytest api/tests/camp_auth/application/test_dev_camp_fake_login.py -v
```
Expected: 2 passed。

- [ ] **Step 5: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/application/use_cases/dev_camp_fake_login.py server/api/src/mz_ai_backend/modules/camp_auth/application/use_cases/__init__.py server/api/tests/camp_auth/application/test_dev_camp_fake_login.py
git commit -m "feat(camp-auth): DevCampFakeLoginUseCase(find-or-create+可选tier+签发token)"
```

---

### Task 4: 依赖装配 get_dev_camp_fake_login_use_case

**Files:**
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/dependencies.py`
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/__init__.py`

- [ ] **Step 1: 在 dependencies.py 加工厂**

先确认文件顶部已 import `DevCampFakeLoginUseCase`（在从 `..application.use_cases import (...)` 的列表里加上它）。token_service / snowflake / settings 的依赖工厂沿用 `get_exchange_wechat_login_use_case` 已用的同名 import（`get_token_service`、`Sha256TokenService`、`get_snowflake_id_generator`、`get_settings_dependency`、`get_camp_account_repository`、`SqlAlchemyCampAccountRepository`、`Settings` 均已在本文件可用）。追加：
```python
def get_dev_camp_fake_login_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository,
        Depends(get_camp_account_repository),
    ],
    token_service: Annotated[Sha256TokenService, Depends(get_token_service)],
    snowflake_id_generator: Annotated[
        SnowflakeGenerator,
        Depends(get_snowflake_id_generator),
    ],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> DevCampFakeLoginUseCase:
    """Construct the dev-only camp fake login use case (env=production 时路由层 404 拒绝)。"""

    return DevCampFakeLoginUseCase(
        account_repository=account_repository,
        token_service=token_service,
        snowflake_id_generator=snowflake_id_generator,
        access_token_ttl_seconds=settings.camp_auth_access_token_ttl_seconds,
        refresh_token_ttl_days=settings.camp_auth_refresh_token_ttl_days,
    )
```
> 若 `get_token_service`/`Sha256TokenService`/`SnowflakeGenerator` 在本文件尚未 import，按 `get_exchange_wechat_login_use_case` 实际使用的 import 行补齐（它们必为已有，否则 exchange 无法编译）。

- [ ] **Step 2: 在 infrastructure/__init__.py 导出**

把 `get_dev_camp_fake_login_use_case` 加入 `infrastructure/__init__.py` 的导出（与 `get_exchange_wechat_login_use_case` 等并列）。

- [ ] **Step 3: 校验可导入**

```bash
cd server && uv run python -c "from mz_ai_backend.modules.camp_auth.infrastructure import get_dev_camp_fake_login_use_case; print('ok')"
```
Expected: 打印 `ok`。

- [ ] **Step 4: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/dependencies.py server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/__init__.py
git commit -m "feat(camp-auth): dev fake-login 依赖装配"
```

---

### Task 5: 路由 POST /camp-auth/dev/fake-login + 生产守卫

**Files:**
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/presentation/schemas.py`
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/presentation/router.py`
- Test: `server/api/tests/camp_auth/presentation/test_camp_auth_router.py`

- [ ] **Step 1: 加请求 schema**

在 `presentation/schemas.py` 顶部 import 区补（若缺）：
```python
from typing import Literal
from ..application.dtos import DEV_FAKE_LOGIN_DEFAULT_USERNAME, DevCampFakeLoginCommand
```
文件末尾追加：
```python
class DevCampFakeLoginRequest(BaseModel):
    """dev-only 免微信登录请求体；不传时用默认账号 dev_local、tier=none。"""

    model_config = ConfigDict(frozen=True)

    username: str = DEV_FAKE_LOGIN_DEFAULT_USERNAME
    tier: Literal["none", "basic", "premium"] = "none"

    def to_command(self) -> DevCampFakeLoginCommand:
        return DevCampFakeLoginCommand(username=self.username, tier=self.tier)
```

- [ ] **Step 2: 加路由 + 生产守卫**

在 `router.py`：
- import 区把 `Depends` 行改为 `from fastapi import APIRouter, Depends, HTTPException`；补 `from mz_ai_backend.core.config import Settings` 与 `from mz_ai_backend.core.dependencies import get_settings_dependency`。
- 从 `..application.use_cases import (...)` 列表加 `DevCampFakeLoginUseCase`。
- 从 `..infrastructure import (...)` 列表加 `get_dev_camp_fake_login_use_case`。
- 从 `.schemas import (...)` 列表加 `DevCampFakeLoginRequest`。
- 文件末尾追加路由：
```python
@router.post(
    "/dev/fake-login",
    response_model=ApiResponse[CampAuthenticationResponse],
    summary="[dev-only] 跳过微信扫码，按 username 签发 token（可选设置会员 tier）",
    description="本地联调专用：env=production 时返回 404 拒绝调用。",
)
async def dev_fake_login(
    request: DevCampFakeLoginRequest,
    settings: Annotated[Settings, Depends(get_settings_dependency)],
    use_case: Annotated[
        DevCampFakeLoginUseCase,
        Depends(get_dev_camp_fake_login_use_case),
    ],
) -> ApiResponse[CampAuthenticationResponse]:
    # 双保险：env=production 直接 404，避免生产暴露 dev 后门
    if settings.env == "production":
        raise HTTPException(status_code=404, detail="Not Found")
    result = await use_case.execute(request.to_command())
    return success_response(data=CampAuthenticationResponse.from_result(result))
```

- [ ] **Step 3: 写路由测试（参照 test_camp_auth_router.py 的 TestClient + dependency_overrides）**

在 `test_camp_auth_router.py` 末尾追加：
```python
def test_dev_fake_login_returns_tokens_in_dev():
    from mz_ai_backend.modules.camp_auth.application import CampAuthenticationResult, CampAccountSummary, CampTokenPair
    from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus
    from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import get_dev_camp_fake_login_use_case
    from mz_ai_backend.core.dependencies import get_settings_dependency

    class _StubUseCase:
        async def execute(self, command):
            now = datetime.now(UTC)
            return CampAuthenticationResult(
                account=CampAccountSummary(account_id=3100, username=command.username, email=None,
                                           status=CampAccountStatus.ACTIVE, created_at=_now()),
                tokens=CampTokenPair(access_token="a", access_token_expires_at=now,
                                     refresh_token="r", refresh_token_expires_at=now),
            )

    class _DevSettings:
        env = "development"

    app = create_app()
    app.dependency_overrides[get_dev_camp_fake_login_use_case] = lambda: _StubUseCase()
    app.dependency_overrides[get_settings_dependency] = lambda: _DevSettings()
    client = TestClient(app)
    resp = client.post("/api/v1/camp-auth/dev/fake-login", json={"username": "dev_x", "tier": "basic"})
    assert resp.status_code == 200
    assert resp.json()["data"]["account"]["username"] == "dev_x"
    app.dependency_overrides.clear()


def test_dev_fake_login_404_in_production():
    from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import get_dev_camp_fake_login_use_case
    from mz_ai_backend.core.dependencies import get_settings_dependency

    class _ProdSettings:
        env = "production"

    app = create_app()
    app.dependency_overrides[get_settings_dependency] = lambda: _ProdSettings()
    client = TestClient(app)
    resp = client.post("/api/v1/camp-auth/dev/fake-login", json={"username": "dev_x"})
    assert resp.status_code == 404
    app.dependency_overrides.clear()
```
> 路由前缀：camp 路由 `prefix="/camp-auth"` 挂在全局 `/api/v1` 下（参照文件内其它用例调用的实际路径，如 exchange 测试用的 URL，对齐 `/api/v1/...` 前缀）。`_now`、`create_app`、`TestClient`、`datetime/UTC` 已在该测试文件顶部可用。

- [ ] **Step 4: 运行新测试**

```bash
cd server && uv run pytest api/tests/camp_auth/presentation/test_camp_auth_router.py -k dev_fake_login -v
```
Expected: 2 passed。

- [ ] **Step 5: 跑一遍 camp_auth 全套，确认无回归**

```bash
cd server && uv run pytest api/tests/camp_auth -q
```
Expected: 全绿。

- [ ] **Step 6: Commit**

```bash
git add server/api/src/mz_ai_backend/modules/camp_auth/presentation/schemas.py server/api/src/mz_ai_backend/modules/camp_auth/presentation/router.py server/api/tests/camp_auth/presentation/test_camp_auth_router.py
git commit -m "feat(camp-auth): POST /camp-auth/dev/fake-login(生产 404 守卫)"
```

---

### Task 6: 前端后端客户端 devFakeLogin

**Files:**
- Modify: `website-aicamp/src/features/auth/server/backend.ts`

- [ ] **Step 1: 加 devFakeLogin**

在 `backend.ts` 末尾追加（`CampMembershipTier` 从 `../types` 导入；该文件已 import 多个类型，把 `CampMembershipTier` 加进现有 `import type { ... } from '../types'` 行）：
```ts
// dev-only：直连后端 POST /camp-auth/dev/fake-login 拿 token；后端 env=production 时会 404。
export async function devFakeLogin(
  username?: string,
  tier?: CampMembershipTier,
): Promise<AuthPayload> {
  const body: Record<string, string> = {}
  if (username && username.trim() !== '') body.username = username.trim()
  if (tier) body.tier = tier
  const payload = await requestUpstream<UpstreamAuthPayload>('/camp-auth/dev/fake-login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return normalizeAuthPayload(payload)
}
```

- [ ] **Step 2: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 3: Commit**

```bash
git add website-aicamp/src/features/auth/server/backend.ts
git commit -m "feat(aicamp): devFakeLogin 后端客户端"
```

---

### Task 7: 前端 dev-login 路由

**Files:**
- Create: `website-aicamp/src/app/api/auth/dev-login/route.ts`

- [ ] **Step 1: 先读 sibling 路由确认 _shared 助手**

```bash
cd website-aicamp && cat src/app/api/auth/_shared.ts
```
记录可复用的 helper（如 `readJsonBody`、错误响应函数）的确切名字与签名，下一步据此对齐。

- [ ] **Step 2: 写路由**

`src/app/api/auth/dev-login/route.ts`（核心逻辑如下；错误响应改用上一步确认的 `_shared` helper，与 `src/app/api/auth/wechat-login/sessions/route.ts` 风格一致）：
```ts
import { NextResponse } from 'next/server'

import { WebsiteAuthError, devFakeLogin } from '@/features/auth/server/backend'
import { toAuthenticatedState, writeAuthCookies } from '@/features/auth/server/cookies'
import type { CampMembershipTier } from '@/features/auth/types'

// dev-only: 仅在 NODE_ENV !== 'production' 时启用；生产返回 404。
// 后端 /camp-auth/dev/fake-login 在 env=production 也返回 404，双层保险。

const ALLOWED_TIERS: CampMembershipTier[] = ['none', 'basic', 'premium']

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Not Found' } }, { status: 404 })
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const usernameRaw = body['username']
    const username = typeof usernameRaw === 'string' ? usernameRaw : undefined
    const tierRaw = body['tier']
    const tier =
      typeof tierRaw === 'string' && ALLOWED_TIERS.includes(tierRaw as CampMembershipTier)
        ? (tierRaw as CampMembershipTier)
        : undefined
    const payload = await devFakeLogin(username, tier)
    await writeAuthCookies(payload)
    return NextResponse.json({ state: toAuthenticatedState(payload) })
  } catch (error) {
    if (error instanceof WebsiteAuthError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      )
    }
    return NextResponse.json(
      { error: { code: 'AUTH.UNKNOWN', message: '本地登录失败' } },
      { status: 500 },
    )
  }
}
```
> 若 `_shared.ts` 已有标准 `authErrorResponse(error)` / `readJsonBody(request)`，改用它们替换上面的内联错误响应与 body 解析，保持与 sibling 路由一致（DRY）。

- [ ] **Step 3: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 4: Commit**

```bash
git add website-aicamp/src/app/api/auth/dev-login/route.ts
git commit -m "feat(aicamp): /api/auth/dev-login 路由(生产 404)"
```

---

### Task 8: 登录页 dev 面板（username + tier）

**Files:**
- Modify: `website-aicamp/src/app/login/LoginContent.tsx`

- [ ] **Step 1: 读现有 LoginContent 结构**

```bash
cd website-aicamp && cat src/app/login/LoginContent.tsx
```
确认：是否 `'use client'`、登录成功处理函数名（如 `handleLoginSuccess` / `router.refresh`）、WechatLoginPanel 渲染位置、`AuthState` 类型 import、是否已有 `useState`。

- [ ] **Step 2: 加 dev 面板状态与处理函数**

在组件顶部（其它 `useState` 旁）加：
```tsx
const IS_DEV_BUILD = process.env.NODE_ENV !== 'production'
```
在组件内加状态与处理（`CampMembershipTier` 从 `@/features/auth/types` 导入；登录成功复用文件内既有的成功处理逻辑——下方 `applyLoginState` 用实际函数名替换）：
```tsx
const [devUsername, setDevUsername] = useState('dev_local')
const [devTier, setDevTier] = useState<CampMembershipTier>('basic')
const [devPending, setDevPending] = useState(false)
const [devError, setDevError] = useState<string | null>(null)

const handleDevLogin = async () => {
  setDevPending(true)
  setDevError(null)
  try {
    const resp = await fetch('/api/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: devUsername, tier: devTier }),
    })
    if (!resp.ok) {
      setDevError('本地登录失败，请检查后端是否启动')
      return
    }
    const { state } = (await resp.json()) as { state: AuthState }
    applyLoginState(state) // ← 替换为文件内既有的登录成功处理（刷新登录态 + 跳转 next）
  } catch {
    setDevError('本地登录请求异常')
  } finally {
    setDevPending(false)
  }
}
```

- [ ] **Step 3: 在 WechatLoginPanel 下渲染 dev 面板**

在登录卡片中 `<WechatLoginPanel ... />` 之后插入：
```tsx
{IS_DEV_BUILD && (
  <div className="mt-5 rounded-[6px] border border-dashed border-hairline bg-surface/40 p-3">
    <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted">
      dev only · 本地快捷登录
    </p>
    <p className="mt-1 text-xs leading-relaxed text-muted">
      绕过微信扫码，按 username + 会员等级直接拿 token（仅本地开发）。
    </p>
    <div className="mt-3 flex gap-2">
      <input
        type="text"
        value={devUsername}
        onChange={(e) => setDevUsername(e.target.value)}
        placeholder="dev_local"
        disabled={devPending}
        className="h-9 flex-1 rounded-[6px] border border-hairline bg-surface px-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-2"
      />
      <select
        value={devTier}
        onChange={(e) => setDevTier(e.target.value as CampMembershipTier)}
        disabled={devPending}
        className="h-9 rounded-[6px] border border-hairline bg-surface px-2 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent-2"
      >
        <option value="none">none</option>
        <option value="basic">basic</option>
        <option value="premium">premium</option>
      </select>
      <button
        type="button"
        onClick={handleDevLogin}
        disabled={devPending || devUsername.trim() === ''}
        className="inline-flex h-9 items-center rounded-[6px] border border-hairline bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-surface/60 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {devPending ? '登录中...' : '本地登录'}
      </button>
    </div>
    {devError !== null && <p className="mt-2 text-xs text-accent-3">{devError}</p>}
  </div>
)}
```

- [ ] **Step 4: 类型检查**

```bash
cd website-aicamp && pnpm exec tsc --noEmit
```
Expected: exit 0。

- [ ] **Step 5: Commit**

```bash
git add website-aicamp/src/app/login/LoginContent.tsx
git commit -m "feat(aicamp): 登录页 dev 面板(username+tier)"
```

---

### Task 9: 端到端运行时验证

**Files:** 无（验证任务）

> 前置：后端 dev 服务运行（`cd server && uv run python -m uvicorn main:app --reload --port 8000`，env 非 production）；aicamp dev 服务运行（`cd website-aicamp && pnpm run dev`，端口 3100）。**注意：勿在 aicamp dev 运行时另跑 `next build`，会损坏共享 `.next`。**

- [ ] **Step 1: 后端 dev 接口直连冒烟**

```bash
curl -s -X POST http://127.0.0.1:8000/api/v1/camp-auth/dev/fake-login -H "Content-Type: application/json" -d '{"username":"dev_local","tier":"basic"}' | head -c 400
```
Expected: 返回 `code: COMMON.SUCCESS` 且 `data.account.username == "dev_local"`、含 tokens。

- [ ] **Step 2: 前端 dev 登录 + 门禁验证（浏览器或 chrome-devtools）**

1. 打开 `http://localhost:3100/login`，确认出现「dev only · 本地快捷登录」面板。
2. username=`dev_local`、tier=`basic`、点本地登录 → 登录成功、顶栏变为已登录态。
3. 访问 `/course` → 可进入；basic 章可看；premium 章带 🔒。
4. 重新 dev 登录同 username、tier=`premium` → 刷新后 premium 章可访问。
5. tier=`none` 登录另一个 username → 访问 `/course` 跳 `/membership`。

- [ ] **Step 3: 生产守卫验证**

```bash
# 后端：以 env=production 起一个实例（或单测已覆盖）→ 同 curl 期望 404
# 前端：NODE_ENV=production 下 /api/auth/dev-login 期望 404；登录页无 dev 面板
```
> 生产前端可用 `cd website-aicamp && NEXT_STANDALONE= NODE_ENV=production` 构建产物验证，或以 Task 5 的后端单测 `test_dev_fake_login_404_in_production` 作为生产守卫的权威证据并在此记录。注意生产构建需先停 aicamp dev 服务，避免 `.next` 冲突。

- [ ] **Step 4: 记录验证结果（无代码改动则无需提交）**

---

## 自检结论（规格覆盖）

- 后端 camp_auth dev fake-login 用例 + tier：Task 1（DTO）、Task 3（用例）。✓
- set_membership 仓储（dev 强制写会员列，无 schema 变更）：Task 2。✓
- 依赖装配 + 路由 + 生产守卫：Task 4、Task 5。✓
- 前端 devFakeLogin / dev-login 路由 / 登录页 dev 面板（含 tier 选择）：Task 6、7、8。✓
- 双层 404 生产安全：后端 Task 5（`settings.env`）、前端 Task 7（`NODE_ENV`）。✓
- 验收（dev 登录各 tier 门禁、生产 404）：Task 9 + Task 5 单测。✓
- 不污染真实流水（不写订单/微信身份/登录会话）：用例仅 find-or-create + set_membership + 签发 token。✓
- tier=none 不降级既有会员：用例 `if tier != "none"` 才写——与规格遗留项一致。✓
