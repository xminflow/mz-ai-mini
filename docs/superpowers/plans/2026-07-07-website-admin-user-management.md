# Website 管理端（camp_auth 用户管理）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 交付一个独立管理端，让管理员登录后对 camp_auth 用户做列表搜索、启用/禁用、会员（membership_tier + 到期）管理、逻辑删除。

**Architecture:** 后端在 `server` 新增轻量 `admin_auth` 模块（配置单账号 + 无状态 HMAC 令牌 + `require_admin` 依赖），并在 `camp_auth` 模块扩展 admin 仓储/用例/router 操作 `CampAccountModel`；前端为独立 `website-admin`（Vite + React SPA），直接调后端 `/api/v1/admin/*`。

**Tech Stack:** 后端 FastAPI + SQLAlchemy（DDD 整洁架构，stdlib hmac/hashlib，零新依赖、零迁移）；前端 Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui + react-router-dom v7。

## Global Constraints

- 后端零新增依赖：仅用 stdlib `hmac` / `hashlib` / `base64` / `json`。
- 无数据库 schema 变更、无迁移、无回填：仅复用 `users` 表现有列。
- 令牌无状态、HMAC-SHA256 签名、带 `exp` 过期；密钥/密码只从 env 读，禁止硬编码、禁止写日志。
- 所有 `/admin/camp-accounts/*` 路由强制 `Depends(require_admin)`；删除为逻辑删除（`is_deleted=True`）。
- 会员写入目标是 `membership_tier`（取值 `none` / `basic` / `premium`）+ `membership_started_at` + `membership_expires_at`，不动僵尸字段 `enrollment_*`。
- 后端类型标注完整；Python 时间统一 UTC naive 落库（复用现有 `_to_naive_utc` 约定）。
- 后端命令 `cd server/api`；测试 `uv run pytest`。前端命令 `cd website-admin`；包管理用 `pnpm`。
- 提交信息用中文，结尾附 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。

---

# Part A — 后端（server）

工作目录：`server/api`。所有路径相对 `server/api/`。

## Task 1: 新增 admin 配置项与错误码

**Files:**
- Modify: `src/mz_ai_backend/core/config.py`（在 `Settings` 尾部字段后、`@model_validator` 前追加）
- Modify: `src/mz_ai_backend/core/error_codes.py`（在 `SYSTEM_INTERNAL_ERROR` 前追加）
- Test: `tests/core/test_admin_settings.py`

**Interfaces:**
- Produces: `Settings.admin_username: str | None`、`admin_password: str | None`、`admin_token_secret: str | None`、`admin_token_ttl_minutes: int`、`admin_cors_origins: str`；`ErrorCode.ADMIN_INVALID_CREDENTIALS`、`ErrorCode.ADMIN_UNAUTHORIZED`。

- [ ] **Step 1: 写失败测试**

创建 `tests/core/test_admin_settings.py`：

```python
from __future__ import annotations

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.error_codes import ErrorCode


def test_admin_settings_have_expected_defaults() -> None:
    settings = Settings(
        _env_file=None,
        admin_username=None,
        admin_password=None,
        admin_token_secret=None,
    )
    assert settings.admin_username is None
    assert settings.admin_password is None
    assert settings.admin_token_secret is None
    assert settings.admin_token_ttl_minutes == 720
    assert settings.admin_cors_origins == ""


def test_admin_error_codes_exist() -> None:
    assert ErrorCode.ADMIN_INVALID_CREDENTIALS.value == "ADMIN.INVALID_CREDENTIALS"
    assert ErrorCode.ADMIN_UNAUTHORIZED.value == "ADMIN.UNAUTHORIZED"
```

- [ ] **Step 2: 运行测试确认失败**

Run: `uv run pytest tests/core/test_admin_settings.py -v`
Expected: FAIL（`admin_token_ttl_minutes` 属性不存在 / `ADMIN_INVALID_CREDENTIALS` 不存在）

- [ ] **Step 3: 实现**

在 `core/error_codes.py` 的 `SYSTEM_INTERNAL_ERROR = "SYSTEM.INTERNAL_ERROR"` 行**之前**加入：

```python
    ADMIN_INVALID_CREDENTIALS = "ADMIN.INVALID_CREDENTIALS"
    ADMIN_UNAUTHORIZED = "ADMIN.UNAUTHORIZED"
```

在 `core/config.py` 的 `track_analysis_import_token: str | None = Field(default=None)` 行**之后**、`@model_validator(mode="after")` 之前加入：

```python
    # 管理端：配置写死的单管理员账号 + 无状态 HMAC 令牌；缺省为空表示未启用管理端。
    admin_username: str | None = Field(default=None)
    admin_password: str | None = Field(default=None)
    admin_token_secret: str | None = Field(default=None)
    admin_token_ttl_minutes: int = Field(default=720, ge=5, le=10080)
    # 逗号分隔的允许跨域来源；为空表示不放开任何跨域。
    admin_cors_origins: str = Field(default="")
```

- [ ] **Step 4: 运行测试确认通过**

Run: `uv run pytest tests/core/test_admin_settings.py -v`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/mz_ai_backend/core/config.py src/mz_ai_backend/core/error_codes.py tests/core/test_admin_settings.py
git commit -m "feat(admin): 新增管理端配置项与错误码"
```

---

## Task 2: admin_auth 令牌服务与凭据校验器

**Files:**
- Create: `src/mz_ai_backend/modules/admin_auth/__init__.py`
- Create: `src/mz_ai_backend/modules/admin_auth/application/__init__.py`
- Create: `src/mz_ai_backend/modules/admin_auth/application/dtos.py`
- Create: `src/mz_ai_backend/modules/admin_auth/application/ports/__init__.py`
- Create: `src/mz_ai_backend/modules/admin_auth/application/ports/services.py`
- Create: `src/mz_ai_backend/modules/admin_auth/infrastructure/__init__.py`
- Create: `src/mz_ai_backend/modules/admin_auth/infrastructure/services.py`
- Test: `tests/admin_auth/__init__.py`, `tests/admin_auth/infrastructure/__init__.py`, `tests/admin_auth/infrastructure/test_admin_services.py`

**Interfaces:**
- Produces:
  - `AdminTokenResult(token: str, expires_at: datetime)`、`AdminIdentity(username: str)`、`AdminLoginCommand(username: str, password: str)`
  - `HmacAdminTokenService(secret: str)` → `issue(*, username, now, ttl_minutes) -> AdminTokenResult`、`verify(*, token, now) -> AdminIdentity`（无效/过期抛 `UnauthorizedException(ADMIN_UNAUTHORIZED)`）
  - `ConfigAdminCredentialVerifier(username, password)` → `verify(*, username, password) -> bool`

- [ ] **Step 1: 写失败测试**

创建包 `__init__.py`（`tests/admin_auth/__init__.py` 与 `tests/admin_auth/infrastructure/__init__.py` 内容为空），并创建 `tests/admin_auth/infrastructure/test_admin_services.py`：

```python
from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from mz_ai_backend.core.exceptions import UnauthorizedException
from mz_ai_backend.modules.admin_auth.infrastructure import (
    ConfigAdminCredentialVerifier,
    HmacAdminTokenService,
)


def _now() -> datetime:
    return datetime(2026, 7, 7, 12, 0, 0, tzinfo=UTC)


def test_issue_then_verify_round_trip() -> None:
    service = HmacAdminTokenService(secret="s3cret-value")
    issued = service.issue(username="root", now=_now(), ttl_minutes=60)
    identity = service.verify(token=issued.token, now=_now() + timedelta(minutes=59))
    assert identity.username == "root"
    assert issued.expires_at == _now() + timedelta(minutes=60)


def test_verify_rejects_expired_token() -> None:
    service = HmacAdminTokenService(secret="s3cret-value")
    issued = service.issue(username="root", now=_now(), ttl_minutes=10)
    with pytest.raises(UnauthorizedException):
        service.verify(token=issued.token, now=_now() + timedelta(minutes=11))


def test_verify_rejects_tampered_signature() -> None:
    service = HmacAdminTokenService(secret="s3cret-value")
    issued = service.issue(username="root", now=_now(), ttl_minutes=10)
    tampered = issued.token[:-1] + ("0" if issued.token[-1] != "0" else "1")
    with pytest.raises(UnauthorizedException):
        service.verify(token=tampered, now=_now())


def test_verify_rejects_wrong_secret() -> None:
    issued = HmacAdminTokenService(secret="secret-a").issue(
        username="root", now=_now(), ttl_minutes=10
    )
    with pytest.raises(UnauthorizedException):
        HmacAdminTokenService(secret="secret-b").verify(token=issued.token, now=_now())


def test_verify_rejects_malformed_token() -> None:
    service = HmacAdminTokenService(secret="s3cret-value")
    with pytest.raises(UnauthorizedException):
        service.verify(token="not-a-valid-token", now=_now())


def test_credential_verifier_matches_exact_pair() -> None:
    verifier = ConfigAdminCredentialVerifier(username="root", password="pw")
    assert verifier.verify(username="root", password="pw") is True
    assert verifier.verify(username="root", password="wrong") is False
    assert verifier.verify(username="nope", password="pw") is False
```

- [ ] **Step 2: 运行测试确认失败**

Run: `uv run pytest tests/admin_auth/infrastructure/test_admin_services.py -v`
Expected: FAIL（模块 `admin_auth` 不存在）

- [ ] **Step 3: 实现**

`modules/admin_auth/__init__.py`：

```python
"""Public entrypoints for the admin_auth module.

Usage:
- Import `router` to register admin authentication endpoints.
- Import `require_admin` to guard admin-only routes.
"""

from .presentation import require_admin, router

__all__ = ["require_admin", "router"]
```

> 注意：本步骤尚未创建 `presentation`。为让 Step 4 只跑本任务测试通过，先将 `modules/admin_auth/__init__.py` 内容临时留空（写 `"""admin_auth module."""`），待 Task 4 建好 presentation 后再替换为上面的最终内容。本步先创建以下文件。

`modules/admin_auth/__init__.py`（本任务先写占位）：

```python
"""admin_auth module package."""
```

`modules/admin_auth/application/dtos.py`：

```python
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator


class AdminLoginCommand(BaseModel):
    """Input command for admin username/password login."""

    model_config = ConfigDict(frozen=True)

    username: str
    password: str

    @field_validator("username", "password")
    @classmethod
    def _not_blank(cls, value: str) -> str:
        normalized = value.strip()
        if normalized == "":
            raise ValueError("must not be blank.")
        return normalized


class AdminTokenResult(BaseModel):
    """Issued admin token plus its absolute expiry."""

    model_config = ConfigDict(frozen=True)

    token: str
    expires_at: datetime


class AdminIdentity(BaseModel):
    """Authenticated admin identity resolved from a token."""

    model_config = ConfigDict(frozen=True)

    username: str
```

`modules/admin_auth/application/ports/services.py`：

```python
from __future__ import annotations

from datetime import datetime
from typing import Protocol

from ..dtos import AdminIdentity, AdminTokenResult


class AdminCredentialVerifier(Protocol):
    """Verify admin username/password against the configured account."""

    def verify(self, *, username: str, password: str) -> bool: ...


class AdminTokenService(Protocol):
    """Issue and verify stateless admin tokens."""

    def issue(self, *, username: str, now: datetime, ttl_minutes: int) -> AdminTokenResult: ...

    def verify(self, *, token: str, now: datetime) -> AdminIdentity: ...
```

`modules/admin_auth/application/ports/__init__.py`：

```python
from .services import AdminCredentialVerifier, AdminTokenService

__all__ = ["AdminCredentialVerifier", "AdminTokenService"]
```

`modules/admin_auth/application/__init__.py`：

```python
from .dtos import AdminIdentity, AdminLoginCommand, AdminTokenResult

__all__ = ["AdminIdentity", "AdminLoginCommand", "AdminTokenResult"]
```

`modules/admin_auth/infrastructure/services.py`：

```python
from __future__ import annotations

import base64
import hmac
import json
from datetime import datetime, timedelta
from hashlib import sha256

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import InternalServerException, UnauthorizedException

from ..application.dtos import AdminIdentity, AdminTokenResult


class ConfigAdminCredentialVerifier:
    """基于配置单账号的凭据校验，使用 compare_digest 防时序侧信道。"""

    def __init__(self, *, username: str | None, password: str | None) -> None:
        if not username or not password:
            raise InternalServerException(message="Admin credentials are not configured.")
        self._username = username
        self._password = password

    def verify(self, *, username: str, password: str) -> bool:
        user_ok = hmac.compare_digest(self._username, username)
        pass_ok = hmac.compare_digest(self._password, password)
        return user_ok and pass_ok


class HmacAdminTokenService:
    """无状态令牌：payload=base64url(json{sub,exp})，signature=HMAC-SHA256(secret,payload)。"""

    def __init__(self, *, secret: str | None) -> None:
        if not secret or secret.strip() == "":
            raise InternalServerException(message="Admin token secret is not configured.")
        self._secret = secret.encode("utf-8")

    def _sign(self, payload_b64: bytes) -> str:
        return hmac.new(self._secret, payload_b64, sha256).hexdigest()

    def issue(self, *, username: str, now: datetime, ttl_minutes: int) -> AdminTokenResult:
        expires_at = now + timedelta(minutes=ttl_minutes)
        payload = {"sub": username, "exp": int(expires_at.timestamp())}
        payload_b64 = base64.urlsafe_b64encode(
            json.dumps(payload, separators=(",", ":")).encode("utf-8")
        )
        token = f"{payload_b64.decode('ascii')}.{self._sign(payload_b64)}"
        return AdminTokenResult(token=token, expires_at=expires_at)

    def verify(self, *, token: str, now: datetime) -> AdminIdentity:
        parts = token.split(".", 1)
        if len(parts) != 2:
            raise self._unauthorized("Invalid admin token.")
        payload_b64 = parts[0].encode("ascii")
        if not hmac.compare_digest(self._sign(payload_b64), parts[1]):
            raise self._unauthorized("Invalid admin token.")
        try:
            payload = json.loads(base64.urlsafe_b64decode(payload_b64))
            exp = int(payload["exp"])
            username = str(payload["sub"])
        except (ValueError, KeyError, TypeError):
            raise self._unauthorized("Invalid admin token.")
        if exp <= int(now.timestamp()):
            raise self._unauthorized("Admin token expired.")
        return AdminIdentity(username=username)

    @staticmethod
    def _unauthorized(message: str) -> UnauthorizedException:
        return UnauthorizedException(
            error_code=ErrorCode.ADMIN_UNAUTHORIZED,
            message=message,
        )
```

`modules/admin_auth/infrastructure/__init__.py`：

```python
from .services import ConfigAdminCredentialVerifier, HmacAdminTokenService

__all__ = ["ConfigAdminCredentialVerifier", "HmacAdminTokenService"]
```

- [ ] **Step 4: 运行测试确认通过**

Run: `uv run pytest tests/admin_auth/infrastructure/test_admin_services.py -v`
Expected: PASS（6 passed）

- [ ] **Step 5: 提交**

```bash
git add src/mz_ai_backend/modules/admin_auth tests/admin_auth
git commit -m "feat(admin): admin_auth 令牌服务与配置凭据校验器"
```

---

## Task 3: admin_auth 登录用例

**Files:**
- Create: `src/mz_ai_backend/modules/admin_auth/application/use_cases/__init__.py`
- Create: `src/mz_ai_backend/modules/admin_auth/application/use_cases/admin_login.py`
- Modify: `src/mz_ai_backend/modules/admin_auth/application/__init__.py`（追加导出）
- Test: `tests/admin_auth/application/__init__.py`, `tests/admin_auth/application/test_admin_login.py`

**Interfaces:**
- Consumes: `AdminCredentialVerifier`、`AdminTokenService`、`AdminLoginCommand`、`AdminTokenResult`
- Produces: `AdminLoginUseCase(credential_verifier, token_service, token_ttl_minutes)` → `async execute(command: AdminLoginCommand) -> AdminTokenResult`；凭据错误抛 `UnauthorizedException(ADMIN_INVALID_CREDENTIALS)`

- [ ] **Step 1: 写失败测试**

`tests/admin_auth/application/__init__.py` 留空；创建 `tests/admin_auth/application/test_admin_login.py`：

```python
from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from mz_ai_backend.core.exceptions import UnauthorizedException
from mz_ai_backend.modules.admin_auth.application import (
    AdminLoginCommand,
    AdminTokenResult,
)
from mz_ai_backend.modules.admin_auth.application.use_cases import AdminLoginUseCase


class _StubVerifier:
    def __init__(self, *, ok: bool) -> None:
        self._ok = ok

    def verify(self, *, username: str, password: str) -> bool:
        return self._ok


class _StubTokenService:
    def issue(self, *, username: str, now: datetime, ttl_minutes: int) -> AdminTokenResult:
        assert username == "root"
        assert ttl_minutes == 720
        return AdminTokenResult(token="issued-token", expires_at=now + timedelta(minutes=ttl_minutes))

    def verify(self, *, token: str, now: datetime):  # pragma: no cover - unused here
        raise NotImplementedError


@pytest.mark.anyio
async def test_login_success_returns_token() -> None:
    use_case = AdminLoginUseCase(
        credential_verifier=_StubVerifier(ok=True),
        token_service=_StubTokenService(),
        token_ttl_minutes=720,
    )
    result = await use_case.execute(AdminLoginCommand(username="root", password="pw"))
    assert result.token == "issued-token"


@pytest.mark.anyio
async def test_login_failure_raises_unauthorized() -> None:
    use_case = AdminLoginUseCase(
        credential_verifier=_StubVerifier(ok=False),
        token_service=_StubTokenService(),
        token_ttl_minutes=720,
    )
    with pytest.raises(UnauthorizedException):
        await use_case.execute(AdminLoginCommand(username="root", password="bad"))
```

> 说明：仓库已有 async 用例测试（如 `tests/camp_auth/application/test_dev_camp_fake_login.py`），确认其使用的 async 运行方式（`anyio`/`asyncio`）。若该文件用 `@pytest.mark.asyncio` 则本文件同样改用 `asyncio`；保持与现有约定一致。

- [ ] **Step 2: 运行测试确认失败**

Run: `uv run pytest tests/admin_auth/application/test_admin_login.py -v`
Expected: FAIL（`use_cases` 不存在）

- [ ] **Step 3: 实现**

`modules/admin_auth/application/use_cases/admin_login.py`：

```python
from __future__ import annotations

from datetime import UTC, datetime

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import UnauthorizedException

from ..dtos import AdminLoginCommand, AdminTokenResult
from ..ports import AdminCredentialVerifier, AdminTokenService


class AdminLoginUseCase:
    """校验配置凭据并签发无状态管理端令牌。"""

    def __init__(
        self,
        *,
        credential_verifier: AdminCredentialVerifier,
        token_service: AdminTokenService,
        token_ttl_minutes: int,
    ) -> None:
        self._credential_verifier = credential_verifier
        self._token_service = token_service
        self._token_ttl_minutes = token_ttl_minutes

    async def execute(self, command: AdminLoginCommand) -> AdminTokenResult:
        if not self._credential_verifier.verify(
            username=command.username, password=command.password
        ):
            raise UnauthorizedException(
                error_code=ErrorCode.ADMIN_INVALID_CREDENTIALS,
                message="Invalid admin username or password.",
            )
        return self._token_service.issue(
            username=command.username,
            now=datetime.now(UTC),
            ttl_minutes=self._token_ttl_minutes,
        )
```

`modules/admin_auth/application/use_cases/__init__.py`：

```python
from .admin_login import AdminLoginUseCase

__all__ = ["AdminLoginUseCase"]
```

将 `modules/admin_auth/application/__init__.py` 更新为：

```python
from .dtos import AdminIdentity, AdminLoginCommand, AdminTokenResult
from .use_cases import AdminLoginUseCase

__all__ = [
    "AdminIdentity",
    "AdminLoginCommand",
    "AdminLoginUseCase",
    "AdminTokenResult",
]
```

- [ ] **Step 4: 运行测试确认通过**

Run: `uv run pytest tests/admin_auth/application/test_admin_login.py -v`
Expected: PASS（2 passed）

- [ ] **Step 5: 提交**

```bash
git add src/mz_ai_backend/modules/admin_auth tests/admin_auth/application
git commit -m "feat(admin): admin_auth 登录用例"
```

---

## Task 4: admin_auth 路由、require_admin 依赖与应用挂载（含 CORS）

**Files:**
- Create: `src/mz_ai_backend/modules/admin_auth/infrastructure/dependencies.py`
- Create: `src/mz_ai_backend/modules/admin_auth/presentation/__init__.py`
- Create: `src/mz_ai_backend/modules/admin_auth/presentation/schemas.py`
- Create: `src/mz_ai_backend/modules/admin_auth/presentation/router.py`
- Modify: `src/mz_ai_backend/modules/admin_auth/__init__.py`（替换占位为最终导出）
- Modify: `src/mz_ai_backend/modules/__init__.py`（导出 `admin_auth_router`）
- Modify: `src/mz_ai_backend/core/application.py`（挂载 router + CORS 中间件）
- Test: `tests/admin_auth/presentation/__init__.py`, `tests/admin_auth/presentation/test_admin_auth_router.py`

**Interfaces:**
- Consumes: `AdminLoginUseCase`、`HmacAdminTokenService`、`ConfigAdminCredentialVerifier`、`AdminIdentity`
- Produces:
  - FastAPI 依赖 `get_admin_token_service(settings) -> HmacAdminTokenService`、`get_admin_login_use_case(...) -> AdminLoginUseCase`、`require_admin(authorization, token_service) -> AdminIdentity`
  - `router`（prefix `/admin/auth`）：`POST /login` → `ApiResponse[AdminTokenResponse]`；`GET /me` → `ApiResponse[AdminMeResponse]`
  - 模块导出 `admin_auth_router`（即 `router`）与 `require_admin`

- [ ] **Step 1: 写失败测试**

`tests/admin_auth/presentation/__init__.py` 留空；创建 `tests/admin_auth/presentation/test_admin_auth_router.py`：

```python
from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.admin_auth.application import AdminTokenResult
from mz_ai_backend.modules.admin_auth.infrastructure.dependencies import (
    get_admin_login_use_case,
    get_admin_token_service,
)


class _StubLoginUseCase:
    async def execute(self, command):
        assert command.username == "root"
        assert command.password == "pw"
        return AdminTokenResult(
            token="issued-token",
            expires_at=datetime.now(UTC) + timedelta(minutes=720),
        )


class _StubTokenService:
    def issue(self, *, username, now, ttl_minutes):  # pragma: no cover - unused
        raise NotImplementedError

    def verify(self, *, token, now):
        from mz_ai_backend.core.error_codes import ErrorCode
        from mz_ai_backend.core.exceptions import UnauthorizedException
        from mz_ai_backend.modules.admin_auth.application import AdminIdentity

        if token == "good-token":
            return AdminIdentity(username="root")
        raise UnauthorizedException(
            error_code=ErrorCode.ADMIN_UNAUTHORIZED, message="Invalid admin token."
        )


def _build_client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_admin_login_use_case] = lambda: _StubLoginUseCase()
    app.dependency_overrides[get_admin_token_service] = lambda: _StubTokenService()
    return TestClient(app, raise_server_exceptions=False)


def test_login_returns_token() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/admin/auth/login", json={"username": "root", "password": "pw"}
        )
    assert response.status_code == 200
    body = response.json()
    assert body["code"] == "COMMON.SUCCESS"
    assert body["data"]["token"] == "issued-token"


def test_me_requires_valid_bearer() -> None:
    with _build_client() as client:
        ok = client.get(
            "/api/v1/admin/auth/me", headers={"Authorization": "Bearer good-token"}
        )
        missing = client.get("/api/v1/admin/auth/me")
        bad = client.get(
            "/api/v1/admin/auth/me", headers={"Authorization": "Bearer bad-token"}
        )
    assert ok.status_code == 200
    assert ok.json()["data"]["username"] == "root"
    assert missing.status_code == 401
    assert bad.status_code == 401
```

- [ ] **Step 2: 运行测试确认失败**

Run: `uv run pytest tests/admin_auth/presentation/test_admin_auth_router.py -v`
Expected: FAIL（`dependencies` / router 不存在）

- [ ] **Step 3: 实现**

`modules/admin_auth/infrastructure/dependencies.py`：

```python
from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, Header

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import get_settings_dependency
from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import UnauthorizedException

from ..application import AdminIdentity, AdminLoginUseCase
from .services import ConfigAdminCredentialVerifier, HmacAdminTokenService


def get_admin_token_service(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> HmacAdminTokenService:
    return HmacAdminTokenService(secret=settings.admin_token_secret)


def get_admin_login_use_case(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
    token_service: Annotated[HmacAdminTokenService, Depends(get_admin_token_service)],
) -> AdminLoginUseCase:
    verifier = ConfigAdminCredentialVerifier(
        username=settings.admin_username,
        password=settings.admin_password,
    )
    return AdminLoginUseCase(
        credential_verifier=verifier,
        token_service=token_service,
        token_ttl_minutes=settings.admin_token_ttl_minutes,
    )


def require_admin(
    token_service: Annotated[HmacAdminTokenService, Depends(get_admin_token_service)],
    authorization: Annotated[str | None, Header(alias="Authorization")] = None,
) -> AdminIdentity:
    """解析 Bearer 令牌并校验；缺失/非法/过期一律 401。"""

    prefix = "Bearer "
    if authorization is None or not authorization.startswith(prefix):
        raise UnauthorizedException(
            error_code=ErrorCode.ADMIN_UNAUTHORIZED, message="Missing admin token."
        )
    token = authorization[len(prefix):].strip()
    if token == "":
        raise UnauthorizedException(
            error_code=ErrorCode.ADMIN_UNAUTHORIZED, message="Missing admin token."
        )
    return token_service.verify(token=token, now=datetime.now(UTC))
```

`modules/admin_auth/presentation/schemas.py`：

```python
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..application import AdminIdentity, AdminLoginCommand, AdminTokenResult


class AdminLoginRequest(BaseModel):
    model_config = ConfigDict(frozen=True)

    username: str
    password: str

    def to_command(self) -> AdminLoginCommand:
        return AdminLoginCommand(username=self.username, password=self.password)


class AdminTokenResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    token: str
    expires_at: datetime

    @classmethod
    def from_result(cls, result: AdminTokenResult) -> "AdminTokenResponse":
        return cls(token=result.token, expires_at=result.expires_at)


class AdminMeResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    username: str

    @classmethod
    def from_identity(cls, identity: AdminIdentity) -> "AdminMeResponse":
        return cls(username=identity.username)
```

`modules/admin_auth/presentation/router.py`：

```python
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from mz_ai_backend.core.protocol import ApiResponse, success_response

from ..application import AdminIdentity, AdminLoginUseCase
from ..infrastructure.dependencies import get_admin_login_use_case, require_admin
from .schemas import AdminLoginRequest, AdminMeResponse, AdminTokenResponse


router = APIRouter(prefix="/admin/auth", tags=["admin-auth"])


@router.post(
    "/login",
    response_model=ApiResponse[AdminTokenResponse],
    summary="Admin login with configured credentials",
)
async def admin_login(
    request: AdminLoginRequest,
    use_case: Annotated[AdminLoginUseCase, Depends(get_admin_login_use_case)],
) -> ApiResponse[AdminTokenResponse]:
    result = await use_case.execute(request.to_command())
    return success_response(data=AdminTokenResponse.from_result(result))


@router.get(
    "/me",
    response_model=ApiResponse[AdminMeResponse],
    summary="Return the current admin identity",
)
async def admin_me(
    identity: Annotated[AdminIdentity, Depends(require_admin)],
) -> ApiResponse[AdminMeResponse]:
    return success_response(data=AdminMeResponse.from_identity(identity))
```

`modules/admin_auth/presentation/__init__.py`：

```python
from .router import router
from ..infrastructure.dependencies import require_admin

__all__ = ["require_admin", "router"]
```

将 `modules/admin_auth/__init__.py` 占位替换为最终内容：

```python
"""Public entrypoints for the admin_auth module."""

from .presentation import require_admin, router

__all__ = ["require_admin", "router"]
```

在 `modules/__init__.py`：`from .agent_auth import router as agent_auth_router` 附近加入
`from .admin_auth import router as admin_auth_router`，并在 `__all__` 加入 `"admin_auth_router"`。

在 `core/application.py`：
1. 顶部 import 区加入 `from fastapi.middleware.cors import CORSMiddleware`，并在 `from ..modules import (` 列表内加入 `admin_auth_router,`。
2. 在 `register_middlewares(app)` 之后加入 CORS（按配置放开；空则不加）：

```python
    _admin_origins = [o.strip() for o in (settings.admin_cors_origins or "").split(",") if o.strip()]
    if _admin_origins:
        # 管理端用 Bearer 头鉴权（非 cookie），故 allow_credentials=False
        app.add_middleware(
            CORSMiddleware,
            allow_origins=_admin_origins,
            allow_credentials=False,
            allow_methods=["*"],
            allow_headers=["*"],
        )
```

3. 在 `app.include_router(agent_auth_router, prefix=settings.api_prefix)` 之前加入
`app.include_router(admin_auth_router, prefix=settings.api_prefix)`。

- [ ] **Step 4: 运行测试确认通过**

Run: `uv run pytest tests/admin_auth -v`
Expected: PASS（全部 admin_auth 测试通过）

- [ ] **Step 5: 提交**

```bash
git add src/mz_ai_backend/modules/admin_auth src/mz_ai_backend/modules/__init__.py src/mz_ai_backend/core/application.py tests/admin_auth/presentation
git commit -m "feat(admin): admin_auth 路由/require_admin 依赖/应用挂载与 CORS"
```

---

## Task 5: camp_auth admin DTO、仓储端口与实现

**Files:**
- Create: `src/mz_ai_backend/modules/camp_auth/application/admin_dtos.py`
- Create: `src/mz_ai_backend/modules/camp_auth/application/ports/admin_repositories.py`
- Modify: `src/mz_ai_backend/modules/camp_auth/application/__init__.py`（追加导出）
- Modify: `src/mz_ai_backend/modules/camp_auth/infrastructure/repositories.py`（追加 admin 方法与 `_to_admin_view`）
- Test: `tests/camp_auth/infrastructure/test_camp_admin_repository_integration.py`

**Interfaces:**
- Produces:
  - `CampAccountAdminView`（含 `account_id,int username,email,status,membership_tier,membership_started_at,membership_expires_at,is_deleted,created_at,updated_at`）
  - `CampAccountAdminFilter(keyword: str|None, status: CampAccountStatus|None, include_deleted: bool)`
  - `CampAccountAdminPage(items: list[CampAccountAdminView], total: int, page: int, page_size: int)`
  - 端口 `CampAccountAdminRepository`（见下方方法签名）
  - `SqlAlchemyCampAccountRepository` 新增实现：`list_admin_accounts`、`count_admin_accounts`、`get_admin_account_by_id`、`update_account_status`、`update_account_membership`、`soft_delete_account`

- [ ] **Step 1: 写实现（DTO + 端口）**

> 本任务的仓储实现走真实 Postgres 集成测试（需要测试库）。DTO/端口无独立行为，其正确性由 Task 6 用例测试（假仓储实现同一端口）与 Task 7 路由测试覆盖。此处先落地代码，再写集成测试。

`modules/camp_auth/application/admin_dtos.py`：

```python
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from ..domain import CampAccountStatus


class CampAccountAdminView(BaseModel):
    """管理端账号视图：含真正生效的 membership_* 列，不含僵尸 enrollment_* 列。"""

    model_config = ConfigDict(frozen=True)

    account_id: int
    username: str
    email: str | None
    status: CampAccountStatus
    membership_tier: str
    membership_started_at: datetime | None
    membership_expires_at: datetime | None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime


class CampAccountAdminFilter(BaseModel):
    model_config = ConfigDict(frozen=True)

    keyword: str | None = None
    status: CampAccountStatus | None = None
    include_deleted: bool = False


class CampAccountAdminPage(BaseModel):
    model_config = ConfigDict(frozen=True)

    items: list[CampAccountAdminView]
    total: int
    page: int
    page_size: int


class ListCampAccountsQuery(BaseModel):
    model_config = ConfigDict(frozen=True)

    keyword: str | None = None
    status: CampAccountStatus | None = None
    include_deleted: bool = False
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class GetCampAccountQuery(BaseModel):
    model_config = ConfigDict(frozen=True)

    account_id: int


class UpdateCampAccountStatusCommand(BaseModel):
    model_config = ConfigDict(frozen=True)

    account_id: int
    status: CampAccountStatus


class UpdateCampAccountMembershipCommand(BaseModel):
    model_config = ConfigDict(frozen=True)

    account_id: int
    tier: str  # 由用例做 {none,basic,premium} 白名单校验
    expires_at: datetime | None = None


class DeleteCampAccountCommand(BaseModel):
    model_config = ConfigDict(frozen=True)

    account_id: int
```

`modules/camp_auth/application/ports/admin_repositories.py`：

```python
from __future__ import annotations

from datetime import datetime
from typing import Protocol

from ...domain import CampAccountStatus
from ..admin_dtos import CampAccountAdminFilter, CampAccountAdminView


class CampAccountAdminRepository(Protocol):
    """管理端对 camp 账号的读写契约。"""

    async def list_admin_accounts(
        self, *, filter_: CampAccountAdminFilter, offset: int, limit: int
    ) -> list[CampAccountAdminView]: ...

    async def count_admin_accounts(self, *, filter_: CampAccountAdminFilter) -> int: ...

    async def get_admin_account_by_id(self, account_id: int) -> CampAccountAdminView | None: ...

    async def update_account_status(
        self, *, account_id: int, status: CampAccountStatus
    ) -> CampAccountAdminView | None: ...

    async def update_account_membership(
        self,
        *,
        account_id: int,
        tier: str,
        started_at: datetime | None,
        expires_at: datetime | None,
    ) -> CampAccountAdminView | None: ...

    async def soft_delete_account(self, *, account_id: int) -> bool: ...
```

在 `modules/camp_auth/application/__init__.py` 的 import 与 `__all__` 中追加（保持字母序不强制）：

```python
from .admin_dtos import (
    CampAccountAdminFilter,
    CampAccountAdminPage,
    CampAccountAdminView,
    DeleteCampAccountCommand,
    GetCampAccountQuery,
    ListCampAccountsQuery,
    UpdateCampAccountMembershipCommand,
    UpdateCampAccountStatusCommand,
)
```

并把这些名字加入 `__all__`。

- [ ] **Step 2: 实现仓储方法**

在 `modules/camp_auth/infrastructure/repositories.py`：
1. 顶部 import 增加 `func`, `or_`：将 `from sqlalchemy import delete, select` 改为 `from sqlalchemy import delete, func, or_, select`。
2. 增加 import：`from ..application.admin_dtos import CampAccountAdminFilter, CampAccountAdminView`。
3. 增加映射函数（放在 `_to_camp_account` 之后）：

```python
def _to_admin_view(model: CampAccountModel) -> CampAccountAdminView:
    """管理端视图映射：读取真正生效的 membership_* 列。"""
    return CampAccountAdminView(
        account_id=model.account_id,
        username=model.username,
        email=model.email,
        status=CampAccountStatus(model.status),
        membership_tier=model.membership_tier or "none",
        membership_started_at=model.membership_started_at,
        membership_expires_at=model.membership_expires_at,
        is_deleted=model.is_deleted,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )
```

4. 在 `SqlAlchemyCampAccountRepository` 类内追加方法：

```python
    def _apply_admin_filters(self, stmt, filter_: CampAccountAdminFilter):
        if not filter_.include_deleted:
            stmt = stmt.where(CampAccountModel.is_deleted.is_(False))
        if filter_.status is not None:
            stmt = stmt.where(CampAccountModel.status == filter_.status.value)
        if filter_.keyword:
            like = f"%{filter_.keyword.strip()}%"
            stmt = stmt.where(
                or_(
                    CampAccountModel.username.ilike(like),
                    CampAccountModel.email.ilike(like),
                )
            )
        return stmt

    async def list_admin_accounts(
        self, *, filter_: CampAccountAdminFilter, offset: int, limit: int
    ) -> list[CampAccountAdminView]:
        stmt = self._apply_admin_filters(select(CampAccountModel), filter_)
        stmt = stmt.order_by(CampAccountModel.created_at.desc()).offset(offset).limit(limit)
        result = await self._session.execute(stmt)
        return [_to_admin_view(model) for model in result.scalars().all()]

    async def count_admin_accounts(self, *, filter_: CampAccountAdminFilter) -> int:
        stmt = self._apply_admin_filters(
            select(func.count()).select_from(CampAccountModel), filter_
        )
        result = await self._session.execute(stmt)
        return int(result.scalar_one())

    async def get_admin_account_by_id(self, account_id: int) -> CampAccountAdminView | None:
        result = await self._session.execute(
            select(CampAccountModel).where(CampAccountModel.account_id == account_id)
        )
        model = result.scalar_one_or_none()
        return None if model is None else _to_admin_view(model)

    async def update_account_status(
        self, *, account_id: int, status: CampAccountStatus
    ) -> CampAccountAdminView | None:
        model = await self._load_active_account(account_id=account_id)
        if model is None:
            return None
        model.status = status.value
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_admin_view(model)

    async def update_account_membership(
        self,
        *,
        account_id: int,
        tier: str,
        started_at: datetime | None,
        expires_at: datetime | None,
    ) -> CampAccountAdminView | None:
        model = await self._load_active_account(account_id=account_id)
        if model is None:
            return None
        model.membership_tier = tier
        model.membership_started_at = _to_naive_utc(started_at)
        model.membership_expires_at = _to_naive_utc(expires_at)
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_admin_view(model)

    async def soft_delete_account(self, *, account_id: int) -> bool:
        model = await self._load_active_account(account_id=account_id)
        if model is None:
            return False
        model.is_deleted = True
        model.updated_at = datetime.now(UTC).replace(tzinfo=None)
        await self._session.commit()
        return True

    async def _load_active_account(self, *, account_id: int) -> CampAccountModel | None:
        result = await self._session.execute(
            select(CampAccountModel).where(
                CampAccountModel.account_id == account_id,
                CampAccountModel.is_deleted.is_(False),
            )
        )
        return result.scalar_one_or_none()
```

- [ ] **Step 3: 写集成测试（需测试 Postgres）**

创建 `tests/camp_auth/infrastructure/test_camp_admin_repository_integration.py`，模仿现有 `test_camp_auth_repository_integration.py` 的 DB fixture 用法（先阅读该文件确认建表/清理与 session 获取方式，照搬其 fixtures）。测试覆盖：

```python
# 伪代码骨架——按现有 integration 测试的 session/清库 fixture 补全：
# 1) 插入 3 个账号（active/active/disabled），其一 is_deleted=True
# 2) list_admin_accounts 默认不含已删除；status 过滤生效；keyword 命中用户名/邮箱
# 3) count_admin_accounts 与 list 过滤一致
# 4) update_account_status 改 disabled 后再读为 disabled
# 5) update_account_membership(tier="premium", started_at, expires_at) 后 view 反映新值
# 6) soft_delete_account 后 list 默认不返回，get_admin_account_by_id 仍可读到 is_deleted=True
```

> 若本地无测试 Postgres（`postgresql+asyncpg://test:test@127.0.0.1:5432/mz_ai_backend_test`），本集成测试标记跳过或在验收时说明未运行原因；仓储正确性另由 Task 6/7 的无 DB 测试与 Task 12 端到端联调兜底。

- [ ] **Step 4: 运行**

Run: `uv run pytest tests/camp_auth/infrastructure/test_camp_admin_repository_integration.py -v`
Expected: PASS（有测试库时）；无库时标注跳过。同时跑 `uv run pytest tests/camp_auth -q` 确认未破坏既有测试。

- [ ] **Step 5: 提交**

```bash
git add src/mz_ai_backend/modules/camp_auth tests/camp_auth/infrastructure/test_camp_admin_repository_integration.py
git commit -m "feat(admin): camp_auth admin 视图 DTO/端口/仓储实现"
```

---

## Task 6: camp_auth admin 用例（假仓储 TDD）

**Files:**
- Create: `src/mz_ai_backend/modules/camp_auth/application/use_cases/admin_manage_accounts.py`
- Modify: `src/mz_ai_backend/modules/camp_auth/application/use_cases/__init__.py`（追加导出）
- Test: `tests/camp_auth/application/test_admin_manage_accounts.py`

**Interfaces:**
- Consumes: `CampAccountAdminRepository`、`CampAccountAdminView/Filter/Page`、上述 Query/Command DTO
- Produces:
  - `ListCampAccountsUseCase(repository)` → `execute(ListCampAccountsQuery) -> CampAccountAdminPage`
  - `GetCampAccountUseCase(repository)` → `execute(GetCampAccountQuery) -> CampAccountAdminView`（缺失/已删除抛 `NotFoundException`）
  - `UpdateCampAccountStatusUseCase(repository)` → `execute(UpdateCampAccountStatusCommand) -> CampAccountAdminView`（缺失抛 `NotFoundException`）
  - `UpdateCampAccountMembershipUseCase(repository)` → `execute(UpdateCampAccountMembershipCommand) -> CampAccountAdminView`（非法 tier 或 tier≠none 缺 expires_at 抛 `ValidationException`；缺失抛 `NotFoundException`）
  - `DeleteCampAccountUseCase(repository)` → `execute(DeleteCampAccountCommand) -> None`（缺失抛 `NotFoundException`）
  - 常量 `ALLOWED_MEMBERSHIP_TIERS = ("none", "basic", "premium")`

- [ ] **Step 1: 写失败测试**

创建 `tests/camp_auth/application/test_admin_manage_accounts.py`：

```python
from __future__ import annotations

from datetime import UTC, datetime, timedelta

import pytest

from mz_ai_backend.core.exceptions import NotFoundException, ValidationException
from mz_ai_backend.modules.camp_auth.application.admin_dtos import (
    CampAccountAdminFilter,
    CampAccountAdminView,
    DeleteCampAccountCommand,
    GetCampAccountQuery,
    ListCampAccountsQuery,
    UpdateCampAccountMembershipCommand,
    UpdateCampAccountStatusCommand,
)
from mz_ai_backend.modules.camp_auth.application.use_cases import (
    DeleteCampAccountUseCase,
    GetCampAccountUseCase,
    ListCampAccountsUseCase,
    UpdateCampAccountMembershipUseCase,
    UpdateCampAccountStatusUseCase,
)
from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus


def _now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _view(account_id: int, **overrides) -> CampAccountAdminView:
    base = dict(
        account_id=account_id,
        username=f"camp_{account_id}",
        email=None,
        status=CampAccountStatus.ACTIVE,
        membership_tier="none",
        membership_started_at=None,
        membership_expires_at=None,
        is_deleted=False,
        created_at=_now(),
        updated_at=_now(),
    )
    base.update(overrides)
    return CampAccountAdminView(**base)


class FakeAdminRepository:
    def __init__(self, accounts: list[CampAccountAdminView]) -> None:
        self._accounts = {a.account_id: a for a in accounts}

    async def list_admin_accounts(self, *, filter_, offset, limit):
        rows = [a for a in self._accounts.values() if filter_.include_deleted or not a.is_deleted]
        if filter_.status is not None:
            rows = [a for a in rows if a.status == filter_.status]
        return rows[offset : offset + limit]

    async def count_admin_accounts(self, *, filter_):
        rows = [a for a in self._accounts.values() if filter_.include_deleted or not a.is_deleted]
        if filter_.status is not None:
            rows = [a for a in rows if a.status == filter_.status]
        return len(rows)

    async def get_admin_account_by_id(self, account_id):
        return self._accounts.get(account_id)

    async def update_account_status(self, *, account_id, status):
        acc = self._accounts.get(account_id)
        if acc is None or acc.is_deleted:
            return None
        updated = acc.model_copy(update={"status": status})
        self._accounts[account_id] = updated
        return updated

    async def update_account_membership(self, *, account_id, tier, started_at, expires_at):
        acc = self._accounts.get(account_id)
        if acc is None or acc.is_deleted:
            return None
        updated = acc.model_copy(
            update={
                "membership_tier": tier,
                "membership_started_at": started_at,
                "membership_expires_at": expires_at,
            }
        )
        self._accounts[account_id] = updated
        return updated

    async def soft_delete_account(self, *, account_id):
        acc = self._accounts.get(account_id)
        if acc is None or acc.is_deleted:
            return False
        self._accounts[account_id] = acc.model_copy(update={"is_deleted": True})
        return True


@pytest.mark.anyio
async def test_list_returns_page_with_total() -> None:
    repo = FakeAdminRepository([_view(1), _view(2), _view(3, is_deleted=True)])
    use_case = ListCampAccountsUseCase(repository=repo)
    page = await use_case.execute(ListCampAccountsQuery(page=1, page_size=20))
    assert page.total == 2
    assert len(page.items) == 2
    assert page.page == 1


@pytest.mark.anyio
async def test_get_missing_raises_not_found() -> None:
    use_case = GetCampAccountUseCase(repository=FakeAdminRepository([]))
    with pytest.raises(NotFoundException):
        await use_case.execute(GetCampAccountQuery(account_id=999))


@pytest.mark.anyio
async def test_update_status_toggles_disabled() -> None:
    repo = FakeAdminRepository([_view(1)])
    use_case = UpdateCampAccountStatusUseCase(repository=repo)
    updated = await use_case.execute(
        UpdateCampAccountStatusCommand(account_id=1, status=CampAccountStatus.DISABLED)
    )
    assert updated.status == CampAccountStatus.DISABLED


@pytest.mark.anyio
async def test_update_membership_premium_sets_fields() -> None:
    repo = FakeAdminRepository([_view(1)])
    use_case = UpdateCampAccountMembershipUseCase(repository=repo)
    expires = _now() + timedelta(days=30)
    updated = await use_case.execute(
        UpdateCampAccountMembershipCommand(account_id=1, tier="premium", expires_at=expires)
    )
    assert updated.membership_tier == "premium"
    assert updated.membership_expires_at == expires
    assert updated.membership_started_at is not None


@pytest.mark.anyio
async def test_update_membership_none_clears_dates() -> None:
    repo = FakeAdminRepository(
        [_view(1, membership_tier="premium", membership_started_at=_now(), membership_expires_at=_now())]
    )
    use_case = UpdateCampAccountMembershipUseCase(repository=repo)
    updated = await use_case.execute(
        UpdateCampAccountMembershipCommand(account_id=1, tier="none", expires_at=None)
    )
    assert updated.membership_tier == "none"
    assert updated.membership_started_at is None
    assert updated.membership_expires_at is None


@pytest.mark.anyio
async def test_update_membership_rejects_invalid_tier() -> None:
    use_case = UpdateCampAccountMembershipUseCase(repository=FakeAdminRepository([_view(1)]))
    with pytest.raises(ValidationException):
        await use_case.execute(
            UpdateCampAccountMembershipCommand(account_id=1, tier="gold", expires_at=_now())
        )


@pytest.mark.anyio
async def test_update_membership_non_none_requires_expiry() -> None:
    use_case = UpdateCampAccountMembershipUseCase(repository=FakeAdminRepository([_view(1)]))
    with pytest.raises(ValidationException):
        await use_case.execute(
            UpdateCampAccountMembershipCommand(account_id=1, tier="basic", expires_at=None)
        )


@pytest.mark.anyio
async def test_delete_missing_raises_not_found() -> None:
    use_case = DeleteCampAccountUseCase(repository=FakeAdminRepository([]))
    with pytest.raises(NotFoundException):
        await use_case.execute(DeleteCampAccountCommand(account_id=1))
```

- [ ] **Step 2: 运行测试确认失败**

Run: `uv run pytest tests/camp_auth/application/test_admin_manage_accounts.py -v`
Expected: FAIL（用例不存在）

- [ ] **Step 3: 实现**

`modules/camp_auth/application/use_cases/admin_manage_accounts.py`：

```python
from __future__ import annotations

from datetime import UTC, datetime

from mz_ai_backend.core.exceptions import NotFoundException, ValidationException

from ..admin_dtos import (
    CampAccountAdminFilter,
    CampAccountAdminPage,
    CampAccountAdminView,
    DeleteCampAccountCommand,
    GetCampAccountQuery,
    ListCampAccountsQuery,
    UpdateCampAccountMembershipCommand,
    UpdateCampAccountStatusCommand,
)
from ..ports.admin_repositories import CampAccountAdminRepository

ALLOWED_MEMBERSHIP_TIERS = ("none", "basic", "premium")


class ListCampAccountsUseCase:
    def __init__(self, *, repository: CampAccountAdminRepository) -> None:
        self._repository = repository

    async def execute(self, query: ListCampAccountsQuery) -> CampAccountAdminPage:
        filter_ = CampAccountAdminFilter(
            keyword=query.keyword,
            status=query.status,
            include_deleted=query.include_deleted,
        )
        offset = (query.page - 1) * query.page_size
        items = await self._repository.list_admin_accounts(
            filter_=filter_, offset=offset, limit=query.page_size
        )
        total = await self._repository.count_admin_accounts(filter_=filter_)
        return CampAccountAdminPage(
            items=items, total=total, page=query.page, page_size=query.page_size
        )


class GetCampAccountUseCase:
    def __init__(self, *, repository: CampAccountAdminRepository) -> None:
        self._repository = repository

    async def execute(self, query: GetCampAccountQuery) -> CampAccountAdminView:
        view = await self._repository.get_admin_account_by_id(query.account_id)
        if view is None:
            raise NotFoundException(message="Camp account not found.")
        return view


class UpdateCampAccountStatusUseCase:
    def __init__(self, *, repository: CampAccountAdminRepository) -> None:
        self._repository = repository

    async def execute(
        self, command: UpdateCampAccountStatusCommand
    ) -> CampAccountAdminView:
        updated = await self._repository.update_account_status(
            account_id=command.account_id, status=command.status
        )
        if updated is None:
            raise NotFoundException(message="Camp account not found.")
        return updated


class UpdateCampAccountMembershipUseCase:
    def __init__(self, *, repository: CampAccountAdminRepository) -> None:
        self._repository = repository

    async def execute(
        self, command: UpdateCampAccountMembershipCommand
    ) -> CampAccountAdminView:
        if command.tier not in ALLOWED_MEMBERSHIP_TIERS:
            raise ValidationException(
                message=f"Invalid membership tier: {command.tier}."
            )
        existing = await self._repository.get_admin_account_by_id(command.account_id)
        if existing is None or existing.is_deleted:
            raise NotFoundException(message="Camp account not found.")

        if command.tier == "none":
            started_at: datetime | None = None
            expires_at: datetime | None = None
        else:
            if command.expires_at is None:
                raise ValidationException(
                    message="expires_at is required for a non-none membership tier."
                )
            started_at = existing.membership_started_at or datetime.now(UTC).replace(
                tzinfo=None
            )
            expires_at = command.expires_at

        updated = await self._repository.update_account_membership(
            account_id=command.account_id,
            tier=command.tier,
            started_at=started_at,
            expires_at=expires_at,
        )
        if updated is None:
            raise NotFoundException(message="Camp account not found.")
        return updated


class DeleteCampAccountUseCase:
    def __init__(self, *, repository: CampAccountAdminRepository) -> None:
        self._repository = repository

    async def execute(self, command: DeleteCampAccountCommand) -> None:
        deleted = await self._repository.soft_delete_account(
            account_id=command.account_id
        )
        if not deleted:
            raise NotFoundException(message="Camp account not found.")
```

在 `modules/camp_auth/application/use_cases/__init__.py` 追加导出：

```python
from .admin_manage_accounts import (
    ALLOWED_MEMBERSHIP_TIERS,
    DeleteCampAccountUseCase,
    GetCampAccountUseCase,
    ListCampAccountsUseCase,
    UpdateCampAccountMembershipUseCase,
    UpdateCampAccountStatusUseCase,
)
```

并把这些名字加入该文件的 `__all__`。

- [ ] **Step 4: 运行测试确认通过**

Run: `uv run pytest tests/camp_auth/application/test_admin_manage_accounts.py -v`
Expected: PASS（8 passed）

- [ ] **Step 5: 提交**

```bash
git add src/mz_ai_backend/modules/camp_auth/application tests/camp_auth/application/test_admin_manage_accounts.py
git commit -m "feat(admin): camp_auth admin 账号管理用例"
```

---

## Task 7: camp_auth admin 路由、schema、依赖装配与挂载

**Files:**
- Create: `src/mz_ai_backend/modules/camp_auth/presentation/admin_schemas.py`
- Create: `src/mz_ai_backend/modules/camp_auth/presentation/admin_router.py`
- Modify: `src/mz_ai_backend/modules/camp_auth/infrastructure/dependencies.py`（追加 admin 用例 provider）
- Modify: `src/mz_ai_backend/modules/camp_auth/__init__.py`（导出 `admin_router`）
- Modify: `src/mz_ai_backend/modules/__init__.py`（导出 `camp_admin_router`）
- Modify: `src/mz_ai_backend/core/application.py`（挂载 `camp_admin_router`）
- Test: `tests/camp_auth/presentation/test_camp_admin_router.py`

**Interfaces:**
- Consumes: Task 6 的用例、`require_admin`（来自 admin_auth）、`get_camp_account_repository`
- Produces: `admin_router`（prefix `/admin/camp-accounts`，`dependencies=[Depends(require_admin)]`），端点：
  - `GET ""`（query `keyword,status,page,page_size,include_deleted`）→ `ApiResponse[CampAccountAdminPageResponse]`
  - `GET "/{account_id}"` → `ApiResponse[CampAccountAdminResponse]`
  - `PATCH "/{account_id}/status"` body `{status}` → `ApiResponse[CampAccountAdminResponse]`
  - `PATCH "/{account_id}/membership"` body `{tier, expires_at}` → `ApiResponse[CampAccountAdminResponse]`
  - `DELETE "/{account_id}"` → `ApiResponse[CampAccountDeleteResponse]`

- [ ] **Step 1: 写失败测试**

创建 `tests/camp_auth/presentation/test_camp_admin_router.py`：

```python
from __future__ import annotations

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.admin_auth.application import AdminIdentity
from mz_ai_backend.modules.admin_auth.infrastructure.dependencies import require_admin
from mz_ai_backend.modules.camp_auth.application.admin_dtos import (
    CampAccountAdminPage,
    CampAccountAdminView,
)
from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus
from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import (
    get_delete_camp_account_use_case,
    get_get_camp_account_use_case,
    get_list_camp_accounts_use_case,
    get_update_camp_account_membership_use_case,
    get_update_camp_account_status_use_case,
)


def _now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _view(account_id: int = 5001, **ov) -> CampAccountAdminView:
    base = dict(
        account_id=account_id,
        username=f"camp_{account_id}",
        email="u@example.com",
        status=CampAccountStatus.ACTIVE,
        membership_tier="none",
        membership_started_at=None,
        membership_expires_at=None,
        is_deleted=False,
        created_at=_now(),
        updated_at=_now(),
    )
    base.update(ov)
    return CampAccountAdminView(**base)


class _StubList:
    async def execute(self, query):
        return CampAccountAdminPage(items=[_view()], total=1, page=query.page, page_size=query.page_size)


class _StubGet:
    async def execute(self, query):
        return _view(account_id=query.account_id)


class _StubStatus:
    async def execute(self, command):
        return _view(account_id=command.account_id, status=command.status)


class _StubMembership:
    async def execute(self, command):
        return _view(
            account_id=command.account_id,
            membership_tier=command.tier,
            membership_expires_at=command.expires_at,
        )


class _StubDelete:
    async def execute(self, command):
        return None


def _build_client(*, authorized: bool = True) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_list_camp_accounts_use_case] = lambda: _StubList()
    app.dependency_overrides[get_get_camp_account_use_case] = lambda: _StubGet()
    app.dependency_overrides[get_update_camp_account_status_use_case] = lambda: _StubStatus()
    app.dependency_overrides[get_update_camp_account_membership_use_case] = lambda: _StubMembership()
    app.dependency_overrides[get_delete_camp_account_use_case] = lambda: _StubDelete()
    if authorized:
        app.dependency_overrides[require_admin] = lambda: AdminIdentity(username="root")
    return TestClient(app, raise_server_exceptions=False)


def test_list_requires_admin() -> None:
    # 未覆盖 require_admin 且不带令牌 → 401
    with _build_client(authorized=False) as client:
        response = client.get("/api/v1/admin/camp-accounts")
    assert response.status_code == 401


def test_list_returns_page() -> None:
    with _build_client() as client:
        response = client.get("/api/v1/admin/camp-accounts?page=1&page_size=20")
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["total"] == 1
    assert body["data"]["items"][0]["account_id"] == "5001"


def test_update_status() -> None:
    with _build_client() as client:
        response = client.patch(
            "/api/v1/admin/camp-accounts/5001/status", json={"status": "disabled"}
        )
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "disabled"


def test_update_membership() -> None:
    expires = (datetime.now(UTC) + timedelta(days=30)).isoformat()
    with _build_client() as client:
        response = client.patch(
            "/api/v1/admin/camp-accounts/5001/membership",
            json={"tier": "premium", "expires_at": expires},
        )
    assert response.status_code == 200
    assert response.json()["data"]["membership_tier"] == "premium"


def test_delete_account() -> None:
    with _build_client() as client:
        response = client.delete("/api/v1/admin/camp-accounts/5001")
    assert response.status_code == 200
    assert response.json()["data"]["deleted"] is True
```

- [ ] **Step 2: 运行测试确认失败**

Run: `uv run pytest tests/camp_auth/presentation/test_camp_admin_router.py -v`
Expected: FAIL（依赖 provider 与 admin_router 不存在）

- [ ] **Step 3: 实现**

`modules/camp_auth/presentation/admin_schemas.py`：

```python
from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from ..application.admin_dtos import (
    CampAccountAdminPage,
    CampAccountAdminView,
    UpdateCampAccountMembershipCommand,
    UpdateCampAccountStatusCommand,
)
from ..domain import CampAccountStatus


class CampAccountAdminResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    account_id: str
    username: str
    email: str | None
    status: str
    membership_tier: str
    membership_started_at: datetime | None
    membership_expires_at: datetime | None
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_view(cls, view: CampAccountAdminView) -> "CampAccountAdminResponse":
        return cls(
            account_id=str(view.account_id),
            username=view.username,
            email=view.email,
            status=view.status.value,
            membership_tier=view.membership_tier,
            membership_started_at=view.membership_started_at,
            membership_expires_at=view.membership_expires_at,
            is_deleted=view.is_deleted,
            created_at=view.created_at,
            updated_at=view.updated_at,
        )


class CampAccountAdminPageResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    items: list[CampAccountAdminResponse]
    total: int
    page: int
    page_size: int

    @classmethod
    def from_page(cls, page: CampAccountAdminPage) -> "CampAccountAdminPageResponse":
        return cls(
            items=[CampAccountAdminResponse.from_view(v) for v in page.items],
            total=page.total,
            page=page.page,
            page_size=page.page_size,
        )


class UpdateCampAccountStatusRequest(BaseModel):
    model_config = ConfigDict(frozen=True)

    status: Literal["active", "disabled"]

    def to_command(self, *, account_id: int) -> UpdateCampAccountStatusCommand:
        return UpdateCampAccountStatusCommand(
            account_id=account_id, status=CampAccountStatus(self.status)
        )


class UpdateCampAccountMembershipRequest(BaseModel):
    model_config = ConfigDict(frozen=True)

    tier: Literal["none", "basic", "premium"]
    expires_at: datetime | None = None

    def to_command(self, *, account_id: int) -> UpdateCampAccountMembershipCommand:
        return UpdateCampAccountMembershipCommand(
            account_id=account_id, tier=self.tier, expires_at=self.expires_at
        )


class CampAccountDeleteResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    deleted: bool
```

`modules/camp_auth/presentation/admin_router.py`：

```python
from __future__ import annotations

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, Query

from mz_ai_backend.core.protocol import ApiResponse, success_response
from mz_ai_backend.modules.admin_auth import require_admin

from ..application.admin_dtos import (
    DeleteCampAccountCommand,
    GetCampAccountQuery,
    ListCampAccountsQuery,
)
from ..application.use_cases import (
    DeleteCampAccountUseCase,
    GetCampAccountUseCase,
    ListCampAccountsUseCase,
    UpdateCampAccountMembershipUseCase,
    UpdateCampAccountStatusUseCase,
)
from ..domain import CampAccountStatus
from ..infrastructure.dependencies import (
    get_delete_camp_account_use_case,
    get_get_camp_account_use_case,
    get_list_camp_accounts_use_case,
    get_update_camp_account_membership_use_case,
    get_update_camp_account_status_use_case,
)
from .admin_schemas import (
    CampAccountAdminPageResponse,
    CampAccountAdminResponse,
    CampAccountDeleteResponse,
    UpdateCampAccountMembershipRequest,
    UpdateCampAccountStatusRequest,
)


admin_router = APIRouter(
    prefix="/admin/camp-accounts",
    tags=["admin-camp-accounts"],
    dependencies=[Depends(require_admin)],
)


@admin_router.get("", response_model=ApiResponse[CampAccountAdminPageResponse])
async def list_camp_accounts(
    use_case: Annotated[ListCampAccountsUseCase, Depends(get_list_camp_accounts_use_case)],
    keyword: str | None = Query(default=None),
    status: Literal["active", "disabled"] | None = Query(default=None),
    include_deleted: bool = Query(default=False),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> ApiResponse[CampAccountAdminPageResponse]:
    result = await use_case.execute(
        ListCampAccountsQuery(
            keyword=keyword,
            status=CampAccountStatus(status) if status is not None else None,
            include_deleted=include_deleted,
            page=page,
            page_size=page_size,
        )
    )
    return success_response(data=CampAccountAdminPageResponse.from_page(result))


@admin_router.get("/{account_id}", response_model=ApiResponse[CampAccountAdminResponse])
async def get_camp_account(
    account_id: int,
    use_case: Annotated[GetCampAccountUseCase, Depends(get_get_camp_account_use_case)],
) -> ApiResponse[CampAccountAdminResponse]:
    result = await use_case.execute(GetCampAccountQuery(account_id=account_id))
    return success_response(data=CampAccountAdminResponse.from_view(result))


@admin_router.patch("/{account_id}/status", response_model=ApiResponse[CampAccountAdminResponse])
async def update_camp_account_status(
    account_id: int,
    request: UpdateCampAccountStatusRequest,
    use_case: Annotated[
        UpdateCampAccountStatusUseCase, Depends(get_update_camp_account_status_use_case)
    ],
) -> ApiResponse[CampAccountAdminResponse]:
    result = await use_case.execute(request.to_command(account_id=account_id))
    return success_response(data=CampAccountAdminResponse.from_view(result))


@admin_router.patch("/{account_id}/membership", response_model=ApiResponse[CampAccountAdminResponse])
async def update_camp_account_membership(
    account_id: int,
    request: UpdateCampAccountMembershipRequest,
    use_case: Annotated[
        UpdateCampAccountMembershipUseCase,
        Depends(get_update_camp_account_membership_use_case),
    ],
) -> ApiResponse[CampAccountAdminResponse]:
    result = await use_case.execute(request.to_command(account_id=account_id))
    return success_response(data=CampAccountAdminResponse.from_view(result))


@admin_router.delete("/{account_id}", response_model=ApiResponse[CampAccountDeleteResponse])
async def delete_camp_account(
    account_id: int,
    use_case: Annotated[DeleteCampAccountUseCase, Depends(get_delete_camp_account_use_case)],
) -> ApiResponse[CampAccountDeleteResponse]:
    await use_case.execute(DeleteCampAccountCommand(account_id=account_id))
    return success_response(data=CampAccountDeleteResponse(deleted=True))
```

在 `modules/camp_auth/infrastructure/dependencies.py` 追加（顶部 import 增加用例类）：

```python
from ..application.use_cases import (
    DeleteCampAccountUseCase,
    GetCampAccountUseCase,
    ListCampAccountsUseCase,
    UpdateCampAccountMembershipUseCase,
    UpdateCampAccountStatusUseCase,
)
```

并追加 provider（`SqlAlchemyCampAccountRepository` 已实现 admin 端口方法，可直接复用 `get_camp_account_repository`）：

```python
def get_list_camp_accounts_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository, Depends(get_camp_account_repository)
    ],
) -> ListCampAccountsUseCase:
    return ListCampAccountsUseCase(repository=account_repository)


def get_get_camp_account_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository, Depends(get_camp_account_repository)
    ],
) -> GetCampAccountUseCase:
    return GetCampAccountUseCase(repository=account_repository)


def get_update_camp_account_status_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository, Depends(get_camp_account_repository)
    ],
) -> UpdateCampAccountStatusUseCase:
    return UpdateCampAccountStatusUseCase(repository=account_repository)


def get_update_camp_account_membership_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository, Depends(get_camp_account_repository)
    ],
) -> UpdateCampAccountMembershipUseCase:
    return UpdateCampAccountMembershipUseCase(repository=account_repository)


def get_delete_camp_account_use_case(
    account_repository: Annotated[
        SqlAlchemyCampAccountRepository, Depends(get_camp_account_repository)
    ],
) -> DeleteCampAccountUseCase:
    return DeleteCampAccountUseCase(repository=account_repository)
```

> 确认 `modules/camp_auth/infrastructure/__init__.py` 会 re-export 这些 provider（若该文件用 `from .dependencies import *` 或显式列名，则补上新 provider 名，供 router 与测试 import）。

在 `modules/camp_auth/__init__.py` 增加导出：

```python
from .presentation.admin_router import admin_router

__all__ = ["admin_router", "router"]
```

在 `modules/__init__.py`：加入 `from .camp_auth import admin_router as camp_admin_router`，并把 `"camp_admin_router"` 加进 `__all__`。

在 `core/application.py`：`from ..modules import (` 列表加入 `camp_admin_router,`；在 `app.include_router(camp_auth_router, prefix=settings.api_prefix)` 之后加入
`app.include_router(camp_admin_router, prefix=settings.api_prefix)`。

- [ ] **Step 4: 运行测试确认通过**

Run: `uv run pytest tests/camp_auth/presentation/test_camp_admin_router.py -v`
Expected: PASS（5 passed）

- [ ] **Step 5: 后端全量回归 + 提交**

```bash
uv run pytest tests/admin_auth tests/camp_auth tests/core -q
```
Expected: 全绿（集成测试无库时按 Task 5 说明处理）。

```bash
git add src/mz_ai_backend/modules/camp_auth src/mz_ai_backend/modules/__init__.py src/mz_ai_backend/core/application.py tests/camp_auth/presentation/test_camp_admin_router.py
git commit -m "feat(admin): camp_auth admin 路由/schema/依赖装配与挂载"
```

---

# Part B — 前端（website-admin，独立 SPA）

工作目录：仓库根新建 `website-admin/`。命令用 `pnpm`。此部分不写组件测试（遵循 CLAUDE.md），以“可运行 + 浏览器联调”验收。

## Task 8: 脚手架（Vite + React + TS + Tailwind v4 + shadcn + 路由）

**Files:**
- Create: `website-admin/`（Vite 模板）
- Modify: `website-admin/vite.config.ts`（Tailwind 插件 + `/api` 代理 + `@` 别名）
- Create: `website-admin/src/index.css`（Tailwind v4 入口 + shadcn 变量）
- Create/Modify: `website-admin/src/main.tsx`、`website-admin/src/App.tsx`
- Create: `website-admin/.env.example`

**Interfaces:**
- Produces: 可 `pnpm dev` 启动的空壳应用；`/api` 代理到 `http://127.0.0.1:8000`；react-router 路由骨架 `/login`、`/users`。

- [ ] **Step 1: 生成模板并装依赖**

```bash
cd /d/code/weelume-base
pnpm create vite@latest website-admin -- --template react-ts
cd website-admin
pnpm install
pnpm add react-router-dom
pnpm add -D tailwindcss @tailwindcss/vite @types/node
```

- [ ] **Step 2: 配置 Vite（Tailwind 插件 + 代理 + 别名）**

将 `website-admin/vite.config.ts` 写为：

```ts
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 3: Tailwind v4 入口 + shadcn 初始化**

将 `website-admin/src/index.css` 首行写为 `@import "tailwindcss";`（其余 shadcn 变量在下一步由 CLI 注入）。在 `tsconfig.json` 与 `tsconfig.app.json` 的 `compilerOptions` 加入：

```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

运行 shadcn 初始化（按提示选择 default 风格、CSS 变量）：

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input table dialog badge select sonner
```

> 若 shadcn CLI 与 Tailwind v4 交互有变化，按其向导完成；目标是 `src/components/ui/*` 生成上述组件、`src/lib/utils.ts` 提供 `cn`。

- [ ] **Step 4: 路由骨架**

`website-admin/src/App.tsx`：

```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function Placeholder({ title }: { title: string }) {
  return <div className="p-8 text-xl font-semibold">{title}</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Placeholder title="登录" />} />
        <Route path="/users" element={<Placeholder title="用户管理" />} />
        <Route path="*" element={<Navigate to="/users" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

`website-admin/src/main.tsx` 确保 `import './index.css'` 存在，并渲染 `<App />`。

创建 `website-admin/.env.example`：

```
# 生产构建时后端同源反代；开发用 vite 代理，无需额外变量。
```

- [ ] **Step 5: 验证启动 + 提交**

```bash
pnpm dev
```
在浏览器打开 `http://localhost:5175/users`，确认渲染“用户管理”占位、无控制台报错（可用 chrome-devtools 截图确认）。停止后：

```bash
cd /d/code/weelume-base
git add website-admin
git commit -m "feat(admin-web): website-admin 脚手架（Vite+React+Tailwind+shadcn+路由）"
```

---

## Task 9: API 客户端 + 鉴权（登录页 / token 存储 / 路由守卫）

**Files:**
- Create: `website-admin/src/lib/apiClient.ts`
- Create: `website-admin/src/features/auth/token.ts`
- Create: `website-admin/src/features/auth/api.ts`
- Create: `website-admin/src/features/auth/AuthContext.tsx`
- Create: `website-admin/src/features/auth/RequireAuth.tsx`
- Create: `website-admin/src/features/auth/LoginPage.tsx`
- Modify: `website-admin/src/App.tsx`（接入 AuthProvider + 守卫 + 登录页）

**Interfaces:**
- Produces:
  - `apiClient.request<T>(path, { method, body, token }) -> Promise<T>`；非 2xx 抛 `ApiError{status, code, message}`；`ApiResponse` 信封解包返回 `data`
  - `tokenStore`：`get(): string | null`、`set(token: string)`、`clear()`（localStorage key `admin_token`）
  - `authApi.login(username, password) -> { token, expiresAt }`、`authApi.me(token) -> { username }`
  - `useAuth()`：`{ token, username, login, logout }`
  - `<RequireAuth>`：无 token 重定向 `/login`

- [ ] **Step 1: apiClient + token 存储**

`website-admin/src/lib/apiClient.ts`：

```ts
export type ApiEnvelope<T> = {
  code: string
  message: string
  data: T | null
}

export class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  let envelope: ApiEnvelope<T> | null = null
  try {
    envelope = (await response.json()) as ApiEnvelope<T>
  } catch {
    envelope = null
  }

  if (!response.ok) {
    const code = envelope?.code ?? 'HTTP.ERROR'
    const message = envelope?.message ?? `Request failed with ${response.status}`
    throw new ApiError(response.status, code, message)
  }
  return (envelope?.data as T) ?? (null as T)
}
```

`website-admin/src/features/auth/token.ts`：

```ts
const TOKEN_KEY = 'admin_token'

export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },
  set(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
}
```

- [ ] **Step 2: auth api + context + 守卫 + 登录页**

`website-admin/src/features/auth/api.ts`：

```ts
import { request } from '@/lib/apiClient'

export const authApi = {
  async login(username: string, password: string) {
    const data = await request<{ token: string; expires_at: string }>('/admin/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    return { token: data.token, expiresAt: data.expires_at }
  },
  async me(token: string) {
    return request<{ username: string }>('/admin/auth/me', { token })
  },
}
```

`website-admin/src/features/auth/AuthContext.tsx`：

```tsx
import { createContext, useContext, useMemo, useState } from 'react'
import { authApi } from './api'
import { tokenStore } from './token'

type AuthValue = {
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => tokenStore.get())

  const value = useMemo<AuthValue>(
    () => ({
      token,
      async login(username, password) {
        const { token: next } = await authApi.login(username, password)
        tokenStore.set(next)
        setToken(next)
      },
      logout() {
        tokenStore.clear()
        setToken(null)
      },
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
```

`website-admin/src/features/auth/RequireAuth.tsx`：

```tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

`website-admin/src/features/auth/LoginPage.tsx`：

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ApiError } from '@/lib/apiClient'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/users', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? '用户名或密码错误' : '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={onSubmit} className="w-80 space-y-4 rounded-lg border p-6">
        <h1 className="text-lg font-semibold">管理端登录</h1>
        <Input placeholder="用户名" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? '登录中…' : '登录'}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: 接线 App.tsx**

```tsx
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { LoginPage } from '@/features/auth/LoginPage'

function UsersPlaceholder() {
  return <div className="p-8 text-xl font-semibold">用户管理（待实现）</div>
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/users"
            element={
              <RequireAuth>
                <UsersPlaceholder />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

- [ ] **Step 4: 验证**

启动后端（`cd server/api && uv run python -m uvicorn ...` 或既有启动方式，并在 `server/.env` 配好 `MZ_AI_BACKEND_ADMIN_USERNAME/PASSWORD/TOKEN_SECRET`）与 `pnpm dev`。浏览器访问 `/users` 应重定向到 `/login`；输入正确账号登录后跳转 `/users`；错误密码显示“用户名或密码错误”。用 chrome-devtools 核对网络请求 `POST /api/v1/admin/auth/login` 200、`localStorage.admin_token` 已写入。

- [ ] **Step 5: 提交**

```bash
git add website-admin/src
git commit -m "feat(admin-web): API 客户端与管理员登录/鉴权守卫"
```

---

## Task 10: 用户列表页（表格 + 搜索 + 状态筛选 + 分页）

**Files:**
- Create: `website-admin/src/features/users/types.ts`
- Create: `website-admin/src/features/users/api.ts`
- Create: `website-admin/src/features/users/UsersPage.tsx`
- Modify: `website-admin/src/App.tsx`（用 `UsersPage` 替换占位）

**Interfaces:**
- Consumes: `request`、`useAuth().token`、`useAuth().logout`
- Produces:
  - `CampAccountAdmin` 类型（对齐后端 `CampAccountAdminResponse`）
  - `usersApi.list({ keyword, status, page, pageSize, token }) -> { items, total, page, pageSize }`
  - `usersApi.updateStatus`、`usersApi.updateMembership`、`usersApi.remove`（供 Task 11 复用）
  - `<UsersPage>`：分页表格、搜索框、状态下拉；401 时调用 `logout()`

- [ ] **Step 1: 类型 + api**

`website-admin/src/features/users/types.ts`：

```ts
export type MembershipTier = 'none' | 'basic' | 'premium'
export type AccountStatus = 'active' | 'disabled'

export type CampAccountAdmin = {
  account_id: string
  username: string
  email: string | null
  status: AccountStatus
  membership_tier: MembershipTier
  membership_started_at: string | null
  membership_expires_at: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export type CampAccountPage = {
  items: CampAccountAdmin[]
  total: number
  page: number
  page_size: number
}
```

`website-admin/src/features/users/api.ts`：

```ts
import { request } from '@/lib/apiClient'
import type { AccountStatus, CampAccountAdmin, CampAccountPage, MembershipTier } from './types'

type ListParams = {
  keyword?: string
  status?: AccountStatus | ''
  page: number
  pageSize: number
  token: string
}

export const usersApi = {
  list(p: ListParams): Promise<CampAccountPage> {
    const q = new URLSearchParams()
    if (p.keyword) q.set('keyword', p.keyword)
    if (p.status) q.set('status', p.status)
    q.set('page', String(p.page))
    q.set('page_size', String(p.pageSize))
    return request<CampAccountPage>(`/admin/camp-accounts?${q.toString()}`, { token: p.token })
  },
  updateStatus(accountId: string, status: AccountStatus, token: string): Promise<CampAccountAdmin> {
    return request<CampAccountAdmin>(`/admin/camp-accounts/${accountId}/status`, {
      method: 'PATCH',
      body: { status },
      token,
    })
  },
  updateMembership(
    accountId: string,
    tier: MembershipTier,
    expiresAt: string | null,
    token: string,
  ): Promise<CampAccountAdmin> {
    return request<CampAccountAdmin>(`/admin/camp-accounts/${accountId}/membership`, {
      method: 'PATCH',
      body: { tier, expires_at: expiresAt },
      token,
    })
  },
  remove(accountId: string, token: string): Promise<{ deleted: boolean }> {
    return request<{ deleted: boolean }>(`/admin/camp-accounts/${accountId}`, {
      method: 'DELETE',
      token,
    })
  },
}
```

- [ ] **Step 2: 列表页**

`website-admin/src/features/users/UsersPage.tsx`（表格 + 搜索 + 状态筛选 + 分页；401 登出）：

```tsx
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ApiError } from '@/lib/apiClient'
import { useAuth } from '@/features/auth/AuthContext'
import { usersApi } from './api'
import type { AccountStatus, CampAccountAdmin } from './types'

const PAGE_SIZE = 20

export function UsersPage() {
  const { token, logout } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<AccountStatus | ''>('')
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<CampAccountAdmin[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    try {
      const data = await usersApi.list({ keyword, status, page, pageSize: PAGE_SIZE, token })
      setRows(data.items)
      setTotal(data.total)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout()
        return
      }
      setError('加载失败')
    }
  }, [token, keyword, status, page, logout])

  useEffect(() => {
    void load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">用户管理</h1>
        <Button variant="outline" onClick={logout}>退出登录</Button>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="搜索用户名 / 邮箱"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); void load() } }}
          className="max-w-xs"
        />
        <select
          className="h-9 rounded-md border px-2 text-sm"
          value={status}
          onChange={(e) => { setStatus(e.target.value as AccountStatus | ''); setPage(1) }}
        >
          <option value="">全部状态</option>
          <option value="active">正常</option>
          <option value="disabled">已禁用</option>
        </select>
        <Button onClick={() => { setPage(1); void load() }}>搜索</Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>用户名</TableHead>
            <TableHead>邮箱</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>会员</TableHead>
            <TableHead>会员到期</TableHead>
            <TableHead>注册时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.account_id}>
              <TableCell>{r.username}</TableCell>
              <TableCell>{r.email ?? '—'}</TableCell>
              <TableCell>
                <Badge variant={r.status === 'active' ? 'default' : 'secondary'}>
                  {r.status === 'active' ? '正常' : '已禁用'}
                </Badge>
              </TableCell>
              <TableCell>{r.membership_tier}</TableCell>
              <TableCell>{r.membership_expires_at?.slice(0, 10) ?? '—'}</TableCell>
              <TableCell>{r.created_at.slice(0, 10)}</TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">暂无数据</TableCell></TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-end gap-2 text-sm">
        <span>共 {total} 条 · 第 {page}/{totalPages} 页</span>
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>上一页</Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>下一页</Button>
      </div>
    </div>
  )
}
```

在 `App.tsx` 用 `import { UsersPage } from '@/features/users/UsersPage'` 替换 `UsersPlaceholder`。

- [ ] **Step 3: 验证**

登录后 `/users` 展示列表。用 dev fake-login 或数据库现有 camp 账号造数据：可先 `POST /api/v1/camp-auth/dev/fake-login {username,tier}` 造几个账号（env=development）。核对搜索、状态筛选、翻页与后端请求参数一致（chrome-devtools 网络面板）。

- [ ] **Step 4: 提交**

```bash
git add website-admin/src
git commit -m "feat(admin-web): 用户列表页（搜索/筛选/分页）"
```

---

## Task 11: 用户详情抽屉 + 三类写操作（启用禁用 / 会员 / 删除）

**Files:**
- Create: `website-admin/src/features/users/UserDetailDialog.tsx`
- Modify: `website-admin/src/features/users/UsersPage.tsx`（行操作触发抽屉/对话框 + 刷新）

**Interfaces:**
- Consumes: `usersApi.updateStatus/updateMembership/remove`、`useAuth().token`
- Produces: `<UserDetailDialog account onClose onChanged onDeleted>`：展示全字段；启用/禁用切换；会员编辑（tier 下拉 + 到期日期，tier≠none 必填日期）；删除二次确认

- [ ] **Step 1: 详情/操作对话框**

`website-admin/src/features/users/UserDetailDialog.tsx`：

```tsx
import { useState } from 'react'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/features/auth/AuthContext'
import { ApiError } from '@/lib/apiClient'
import { usersApi } from './api'
import type { CampAccountAdmin, MembershipTier } from './types'

type Props = {
  account: CampAccountAdmin
  onClose: () => void
  onChanged: () => void
  onDeleted: () => void
}

export function UserDetailDialog({ account, onClose, onChanged, onDeleted }: Props) {
  const { token } = useAuth()
  const [tier, setTier] = useState<MembershipTier>(account.membership_tier)
  const [expiresAt, setExpiresAt] = useState<string>(account.membership_expires_at?.slice(0, 10) ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function run(fn: () => Promise<unknown>, after: () => void) {
    if (!token) return
    setBusy(true); setError(null)
    try {
      await fn()
      after()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '操作失败')
    } finally {
      setBusy(false)
    }
  }

  const toggleStatus = () =>
    run(
      () => usersApi.updateStatus(account.account_id, account.status === 'active' ? 'disabled' : 'active', token!),
      onChanged,
    )

  const saveMembership = () => {
    if (tier !== 'none' && !expiresAt) {
      setError('非 none 会员必须填写到期日期')
      return
    }
    const iso = tier === 'none' ? null : new Date(`${expiresAt}T00:00:00Z`).toISOString()
    return run(() => usersApi.updateMembership(account.account_id, tier, iso, token!), onChanged)
  }

  const doDelete = () => run(() => usersApi.remove(account.account_id, token!), onDeleted)

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>用户：{account.username}</DialogTitle></DialogHeader>

        <div className="space-y-3 text-sm">
          <div>邮箱：{account.email ?? '—'}</div>
          <div>状态：{account.status === 'active' ? '正常' : '已禁用'}</div>
          <div>注册：{account.created_at.slice(0, 19).replace('T', ' ')}</div>

          <div className="flex items-center gap-2 pt-2">
            <span>会员等级</span>
            <select
              className="h-9 rounded-md border px-2"
              value={tier}
              onChange={(e) => setTier(e.target.value as MembershipTier)}
            >
              <option value="none">none</option>
              <option value="basic">basic</option>
              <option value="premium">premium</option>
            </select>
            <Input
              type="date"
              value={expiresAt}
              disabled={tier === 'none'}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="max-w-[10rem]"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="outline" disabled={busy} onClick={toggleStatus}>
            {account.status === 'active' ? '禁用账号' : '启用账号'}
          </Button>
          <Button disabled={busy} onClick={saveMembership}>保存会员</Button>
          {confirmDelete ? (
            <Button variant="destructive" disabled={busy} onClick={doDelete}>确认删除</Button>
          ) : (
            <Button variant="destructive" disabled={busy} onClick={() => setConfirmDelete(true)}>删除</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: 列表接线**

在 `UsersPage.tsx`：为每行加“管理”按钮，点击设 `selected` 账号并渲染 `<UserDetailDialog>`；`onChanged` → 关闭并 `void load()`；`onDeleted` → 关闭并 `void load()`。新增状态 `const [selected, setSelected] = useState<CampAccountAdmin | null>(null)`，表格加一列操作按钮，末尾条件渲染对话框。

```tsx
// 表头追加 <TableHead>操作</TableHead>
// 行内追加：
<TableCell>
  <Button size="sm" variant="outline" onClick={() => setSelected(r)}>管理</Button>
</TableCell>
// 组件末尾（return 根节点内）追加：
{selected && (
  <UserDetailDialog
    account={selected}
    onClose={() => setSelected(null)}
    onChanged={() => { setSelected(null); void load() }}
    onDeleted={() => { setSelected(null); void load() }}
  />
)}
```

并 `import { UserDetailDialog } from './UserDetailDialog'`，表头 colSpan 由 6 改为 7。

- [ ] **Step 3: 验证**

对一条账号：禁用→列表状态变“已禁用”；改会员为 premium + 到期日→列表会员/到期更新；tier=premium 但清空日期→前端拦截提示；删除→二次确认后行消失（默认列表不含已删除）。全程 chrome-devtools 核对 PATCH/DELETE 请求与响应。

- [ ] **Step 4: 提交**

```bash
git add website-admin/src
git commit -m "feat(admin-web): 用户详情与启用禁用/会员/删除操作"
```

---

## Task 12: 端到端联调与验收

**Files:**
- Create: `website-admin/README.md`（启动与配置说明）

- [ ] **Step 1: 配置后端 admin 账号**

在 `server/.env` 增加（值自定，勿提交真实密钥）：

```
MZ_AI_BACKEND_ADMIN_USERNAME=admin
MZ_AI_BACKEND_ADMIN_PASSWORD=<强密码>
MZ_AI_BACKEND_ADMIN_TOKEN_SECRET=<长随机串>
MZ_AI_BACKEND_ADMIN_TOKEN_TTL_MINUTES=720
# 生产若跨域再配置：MZ_AI_BACKEND_ADMIN_CORS_ORIGINS=https://admin.example.com
```

- [ ] **Step 2: 后端全量测试**

```bash
cd server/api && uv run pytest tests/admin_auth tests/camp_auth tests/core -q
```
Expected: 全绿（集成测试按 Task 5 说明）。

- [ ] **Step 3: 端到端走查（chrome-devtools）**

启动后端与 `pnpm dev`；用 dev fake-login 造若干 camp 账号。逐条验证关键路径并截图：
1. 未登录访问 `/users` → 跳 `/login`
2. 错误密码 → 提示；正确密码 → 进入 `/users`
3. 搜索用户名/邮箱、状态筛选、翻页
4. 禁用/启用切换
5. 会员改为 premium+到期、再改回 none（到期清空）
6. 删除二次确认后消失
7. 手动清除 `localStorage.admin_token` 后发请求 → 401 → 自动登出回登录页

- [ ] **Step 4: 写 README + 提交**

`website-admin/README.md` 写明：依赖安装、`pnpm dev`（依赖本地后端 `127.0.0.1:8000` 与 admin env）、生产构建 `pnpm build` 与同源反代/CORS 说明。

```bash
git add website-admin/README.md
git commit -m "docs(admin-web): 启动与配置说明；完成端到端联调"
```

---

# 自检（写作者已过）

- **spec 覆盖**：登录/鉴权(Task 2-4,9) · require_admin 守卫(Task 4,7) · 列表搜索分页(Task 5,6,7,10) · 启用禁用(Task 6,7,11) · 会员 membership_tier 管理(Task 6,7,11) · 逻辑删除(Task 5,6,7,11) · CORS(Task 4) · 无迁移/无新依赖(全程) · 前端 SPA(Task 8-12)。
- **占位符**：无 TODO/TBD；集成测试(Task 5-3)给出明确骨架与“无库时处理”说明，属已知外部前置条件而非占位。
- **类型一致**：后端 `CampAccountAdminView`/`update_account_membership(started_at,expires_at)`/`require_admin` 在各 Task 间签名一致；前端 `CampAccountAdmin` 字段对齐 `CampAccountAdminResponse`（account_id 为字符串）。
