w# ai-camp 会员等级体系 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 ai-camp（website-aicamp + 后端 camp 上下文）引入 NONE/BASIC/PREMIUM 三档会员，含微信支付 Native 下单与回调落账、camp_auth `/me` 带回等级、前端购买页与等级徽章、按等级判定的后端/前端门禁原语。

**Architecture:** 新建独立限界上下文 `camp_membership`，镜像 `account_membership` 的 DDD 四层（domain / application / infrastructure / presentation），会员列写在 camp 账号表 `camp_accounts`（ORM `CampAccountModel`）上；camp_auth `/me` 仅读同库会员列、无跨服务调用；前端镜像 website 的 membership feature（proxy 路由 + 二维码轮询）。

**Tech Stack:** 后端 FastAPI + SQLAlchemy（async）+ 原生 SQL 迁移（`run_sql_migrations.py`）+ pytest；前端 Next.js 15（App Router）+ React 19 + Tailwind v4。微信支付复用 `shared/wechat_pay` 的 `WechatPayV3Gateway`（Native）。

---

## 实现注记（阅读现有代码后确认的事实，落地必须遵守）

1. **camp 鉴权依赖**：camp access token 的解析依赖是 `mz_ai_backend.modules.camp_auth.infrastructure.dependencies.get_current_camp_access_token`（从 `Authorization: Bearer` 头取 token，缺失/格式错误抛 `CampAccessTokenExpiredException`）。把 token 解析成账号用 `GetCurrentCampAccountUseCase`（构造器 `get_get_current_camp_account_use_case`），其 `execute(GetCurrentCampAccountQuery(access_token=...))` 返回 `CampAccountSummary`（含 `account_id`）。本模块的 `get_current_camp_account_id` 依赖将复用这两者，**不重复实现 token 校验**。
2. **camp 账号表**：表名 `camp_accounts`，ORM 类 `CampAccountModel`（`mz_ai_backend.modules.camp_auth.infrastructure.models`）。它当前**没有** `membership_*` 列；本次迁移新增 `membership_tier` / `membership_started_at` / `membership_expires_at`，并在 `CampAccountModel` 上新增对应 `Mapped` 列。`enrollment_status` 等列保留不动。
3. **迁移框架形态**：不是 Alembic。迁移是 `server/api/migrations/NNNN_*.sql` 原生 SQL 文件，由 `server/api/migrations/run_sql_migrations.py` 按文件名排序顺序执行，已执行记录写入 `schema_migrations` 表（按 `filename` 去重）。最新文件是 `0029_create_camp_auth_tables.sql`，本次新增 **`0030_add_camp_membership.sql`**。SQL 按 `;` 切分逐条执行，故每条语句必须以 `;` 结尾且语句内不得有裸分号。无独立回滚文件，回滚以注释形式写在迁移文件头部。
4. **account_membership 的 upgrade/续费逻辑不可照搬**：`account_membership` 的 `create_membership_order` 含 NORMAL→PREMIUM 差价折算，repository 的 `process_wechat_pay_notification` 含同档续费延长有效期。**camp_membership 按 spec 明确不做升级、不做续费叠加**：下单前校验「当前无有效会员」，回调落账一律「付款时刻起 365 天」覆盖写。故 camp 版的 use_case / repository 是 account_membership 的**简化版**，不要把差价/续费代码搬过来。
5. **测试命令**：项目根的 uv 工程在 `server/`（含 `uv.lock`、`.venv`），源码在 `server/api/src`，测试在 `server/api/tests`。运行命令统一为 `cd server && uv run python -m pytest api/tests/...`。已实测 `uv run python -m pytest api/tests/account_membership/domain/test_entities.py -q` 通过。测试用 `@pytest.mark.asyncio` 显式标注（无全局 asyncio_mode）。
6. **会员快照 `account_id` 类型**：camp `account_id` 是 BIGINT（雪花 id），HTTP 响应里 camp_auth 把它序列化成 `str`（见 `CampAuthAccountResponse.account_id: str`）。会员快照内部用 `int`，对外 `MyMembershipResponse` 不含 account_id（与 account_membership 一致），故无需序列化处理。
7. **前端缺少 QR 编码库**：website-aicamp 的 `package.json` **没有** `qrcode.react`（website 有）。后端下单返回的 `code_url` 是 `weixin://wxpay/native...` 字符串，必须客户端编码成二维码图片。**新增依赖 `qrcode.react` 需用户批准**（CLAUDE.md 约束）。在 Task F3 提供两种方案：方案 A（推荐，需批准）引入 `qrcode.react`；方案 B（零新依赖）由后端不可行（后端只回 code_url），改为前端用浏览器原生无法编码——故若用户不批准依赖，退而使用纯前端 SVG 二维码实现需另评估。**执行前必须就此向用户确认**，默认走方案 A。
8. **SKU 价格配置**：account_membership 用 `settings.account_membership_normal_fen` / `account_membership_premium_fen`。camp 需要独立价格项 `camp_membership_basic_fen` / `camp_membership_premium_fen`（默认值参考营销页 ¥1999/¥3999 → 199900 / 399900 分）。**新增 Settings 字段属配置项非依赖**，但仍需在计划中显式登记，落地前与用户确认默认价格数值。

---

## File Structure（将创建/修改的文件及单一职责）

### 后端 — 新建模块 `camp_membership`（镜像 account_membership）

| 文件 | 职责 |
|---|---|
| `server/api/src/mz_ai_backend/modules/camp_membership/__init__.py` | 模块公共入口，导出 `router` |
| `.../camp_membership/domain/__init__.py` | 领域层导出聚合 |
| `.../camp_membership/domain/entities.py` | 枚举 `CampMembershipTier/CampMembershipSku/CampOrderStatus`、`SKU_TIER_MAP`、`CAMP_MEMBERSHIP_DURATION_DAYS`、`MEMBERSHIP_QR_TTL_SECONDS`、`CampMembershipSnapshot`、`CampMembershipOrder`、`tier_satisfies()` 门禁原语 |
| `.../camp_membership/domain/exceptions.py` | 业务异常：SKU 非法 / 订单未找到 / 订单越权 / 订单状态非法 / **已有有效会员不可下单** / **会员等级不满足（门禁）** |
| `.../camp_membership/application/__init__.py` | 应用层导出（dtos + use_cases） |
| `.../camp_membership/application/dtos.py` | 命令/查询/结果 DTO，镜像 account_membership |
| `.../camp_membership/application/ports/__init__.py` | 端口导出 |
| `.../camp_membership/application/ports/repositories.py` | `CampMembershipRepository` Protocol（下单/读订单/落账/读快照） |
| `.../camp_membership/application/ports/services.py` | `SnowflakeIdGenerator/CurrentTimeProvider/WechatPayNativeGateway` Protocol |
| `.../camp_membership/application/use_cases/__init__.py` | 用例导出 |
| `.../camp_membership/application/use_cases/create_camp_membership_order.py` | 下单用例：校验「无有效会员」→ 建单 → Native 下单 → 回写 code_url（**无差价逻辑**） |
| `.../camp_membership/application/use_cases/get_camp_order_status.py` | 轮询用例：取单 + 越权校验（**无主动查单**，保持最小实现） |
| `.../camp_membership/application/use_cases/get_my_camp_membership.py` | 读当前账号会员快照 |
| `.../camp_membership/application/use_cases/handle_camp_wechat_pay_notify.py` | 回调用例：验签 → 幂等落账 |
| `.../camp_membership/infrastructure/__init__.py` | 基础设施导出 |
| `.../camp_membership/infrastructure/models.py` | `CampMembershipOrderModel`（表 `camp_membership_orders`） |
| `.../camp_membership/infrastructure/repositories.py` | `SqlAlchemyCampMembershipRepository`，落账锁 `camp_accounts` 行 + `membership_applied` 幂等列 |
| `.../camp_membership/infrastructure/wechat_pay_native_adapter.py` | `CampWechatPayNativeAdapter`（薄封装 shared gateway） |
| `.../camp_membership/infrastructure/dependencies.py` | 依赖装配：repository / 时钟 / 雪花 / camp 网关 / `get_current_camp_account_id` / 四个用例工厂 |
| `.../camp_membership/presentation/__init__.py` | 表现层导出 `router` |
| `.../camp_membership/presentation/schemas.py` | HTTP 请求/响应模型 |
| `.../camp_membership/presentation/router.py` | 路由：`POST /camp-membership/orders`、`GET /orders/{order_no}`、`GET /me`、`POST /wechat-pay/notify` |

### 后端 — 修改现有文件（集成 + 注册 + 门禁依赖）

| 文件 | 改动 |
|---|---|
| `server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/models.py` | `CampAccountModel` 新增 3 个 membership 列 |
| `server/api/src/mz_ai_backend/modules/camp_auth/domain/entities.py` | `CampAccountSummary` 不变；新增 `CampMembershipSummary` 由 camp_membership 提供，camp_auth 仅引用——见 Task B7 决策（在 camp_auth 的 dtos/schemas 增 membership 字段） |
| `server/api/src/mz_ai_backend/modules/camp_auth/application/dtos.py` | `CampAccountSummary` 增加可选 `membership` 字段 |
| `server/api/src/mz_ai_backend/modules/camp_auth/application/use_cases/get_current_camp_account.py` | 读 camp 账号会员列，填充 `membership` |
| `server/api/src/mz_ai_backend/modules/camp_auth/presentation/schemas.py` | `CampAuthAccountResponse` 增加 `membership` 嵌套响应 |
| `server/api/src/mz_ai_backend/modules/__init__.py` | 导出 `camp_membership_router` |
| `server/api/src/mz_ai_backend/core/application.py` | `include_router(camp_membership_router, ...)` |
| `server/api/src/mz_ai_backend/core/error_codes.py` | 新增 5 个 `CAMP_MEMBERSHIP.*` 错误码 |
| `server/api/src/mz_ai_backend/core/config.py` | 新增 `camp_membership_basic_fen` / `camp_membership_premium_fen` |
| `server/api/migrations/0030_add_camp_membership.sql` | 加列 + 建表 + 索引（幂等） |

### 后端 — 测试（新建 `server/api/tests/camp_membership/`）

| 文件 | 覆盖 |
|---|---|
| `tests/camp_membership/domain/test_entities.py` | `tier_satisfies` 等级序；过期回落 NONE（快照语义） |
| `tests/camp_membership/application/test_create_camp_membership_order.py` | 无有效会员可下单 / 有效期内拒单 |
| `tests/camp_membership/application/test_get_my_camp_membership.py` | 读快照 |
| `tests/camp_membership/application/test_handle_camp_wechat_pay_notify.py` | 回调落账（用例层） |
| `tests/camp_membership/application/test_require_camp_tier.py` | `require_camp_tier` 满足 / 不满足分支 |
| `tests/camp_membership/infrastructure/test_repositories.py` | DB 落账幂等（`membership_applied`）+ 快照（需 PG，缺失则 skip） |
| `tests/camp_membership/presentation/test_router.py` | 三个接口 + notify 契约（依赖覆盖） |
| `tests/camp_auth/test_me_membership.py` | camp_auth `/me` 回归：返回 `membership` 字段 |

### 前端 — website-aicamp 新建/修改

| 文件 | 职责 |
|---|---|
| `website-aicamp/src/features/auth/types.ts`（改） | `AuthAccount` 增 `membership` 字段；新增 `CampMembership` 类型 |
| `website-aicamp/src/features/auth/server/backend.ts`（改） | `normalizeAccount` 解析 `membership` |
| `website-aicamp/src/features/membership/types.ts`（新） | 会员/订单/SKU 前端类型 |
| `website-aicamp/src/features/membership/api.ts`（新） | 前端 fetch 封装（下单/查单/查会员） |
| `website-aicamp/src/features/membership/usePollMembershipOrder.ts`（新） | 订单轮询 hook |
| `website-aicamp/src/features/membership/require-tier.ts`（新） | `requireTier(account, required)` 前端门禁工具 |
| `website-aicamp/src/features/membership/MembershipBadge.tsx`（新） | 等级徽章 + 到期展示 |
| `website-aicamp/src/features/membership/PaymentQrCodeModal.tsx`（新） | 二维码弹窗 + 轮询 + 成功刷新登录态 |
| `website-aicamp/src/features/membership/MembershipPurchasePanel.tsx`（新） | 三档横向对比 + 选档下单（线性留白，无卡片堆叠） |
| `website-aicamp/src/app/api/camp-membership/_shared.ts`（新） | proxy 封装（复用 auth cookie 取 access token） |
| `website-aicamp/src/app/api/camp-membership/orders/route.ts`（新） | `POST` 下单代理 |
| `website-aicamp/src/app/api/camp-membership/orders/[orderNo]/route.ts`（新） | `GET` 查单代理 |
| `website-aicamp/src/app/api/camp-membership/me/route.ts`（新） | `GET` 查会员代理 |
| `website-aicamp/src/app/membership/page.tsx`（新） | 购买页（服务端取 authState + 会员快照） |
| `website-aicamp/src/components/layout/AccountMenu.tsx`（改） | 账户区展示 `MembershipBadge` |

---

## Tasks

> 约定：每个 step 是 2–5 分钟动作。测试命令一律在仓库根目录用 `cd server && uv run python -m pytest <路径> -q` 形式给出。commit message 用中文 conventional commit，执行阶段再追加 Co-Authored-By（此处不写）。

---

### Task A1 — 领域层：枚举、快照、门禁原语 `tier_satisfies`

**Files:**
- Create: `server/api/src/mz_ai_backend/modules/camp_membership/__init__.py`（占位，先空导出，A6 再补 router）
- Create: `server/api/src/mz_ai_backend/modules/camp_membership/domain/__init__.py`
- Create: `server/api/src/mz_ai_backend/modules/camp_membership/domain/entities.py`
- Create: `server/api/src/mz_ai_backend/modules/camp_membership/domain/exceptions.py`
- Test: `server/api/tests/camp_membership/domain/test_entities.py`

- [ ] 创建包目录与空 `__init__.py`：先建 `camp_membership/`、`camp_membership/domain/`、`camp_membership/application/`、`camp_membership/application/ports/`、`camp_membership/application/use_cases/`、`camp_membership/infrastructure/`、`camp_membership/presentation/` 七个目录，各放一个最小 `__init__.py`（内容见后续 Task；本步先建 domain 的）。`camp_membership/__init__.py` 暂为空文件。

- [ ] 写失败测试 `tests/camp_membership/domain/test_entities.py`：

```python
from __future__ import annotations

from mz_ai_backend.modules.camp_membership.domain import (
    CampMembershipSku,
    CampMembershipTier,
    SKU_TIER_MAP,
    tier_satisfies,
)


def test_sku_tier_map_resolves_each_sku() -> None:
    assert SKU_TIER_MAP[CampMembershipSku.ANNUAL_BASIC] == CampMembershipTier.BASIC
    assert SKU_TIER_MAP[CampMembershipSku.ANNUAL_PREMIUM] == CampMembershipTier.PREMIUM


def test_tier_satisfies_orders_none_basic_premium() -> None:
    # 高档满足低档；同档满足；低档不满足高档
    assert tier_satisfies(CampMembershipTier.PREMIUM, CampMembershipTier.BASIC) is True
    assert tier_satisfies(CampMembershipTier.PREMIUM, CampMembershipTier.PREMIUM) is True
    assert tier_satisfies(CampMembershipTier.BASIC, CampMembershipTier.BASIC) is True
    assert tier_satisfies(CampMembershipTier.BASIC, CampMembershipTier.PREMIUM) is False
    assert tier_satisfies(CampMembershipTier.NONE, CampMembershipTier.BASIC) is False
    assert tier_satisfies(CampMembershipTier.PREMIUM, CampMembershipTier.NONE) is True
```

- [ ] 运行确认失败：`cd server && uv run python -m pytest api/tests/camp_membership/domain/test_entities.py -q`
  期望：`ModuleNotFoundError: No module named 'mz_ai_backend.modules.camp_membership'`（或 import 失败）。

- [ ] 写 `domain/entities.py`：

```python
from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


CAMP_MEMBERSHIP_DURATION_DAYS = 365
MEMBERSHIP_QR_TTL_SECONDS = 15 * 60


class CampMembershipTier(StrEnum):
    """ai-camp 会员等级；序为 NONE < BASIC < PREMIUM。"""

    NONE = "none"
    BASIC = "basic"
    PREMIUM = "premium"


class CampMembershipSku(StrEnum):
    """ai-camp 会员 SKU。"""

    ANNUAL_BASIC = "annual_basic"
    ANNUAL_PREMIUM = "annual_premium"


# SKU → 等级映射；基础设施层无需感知此规则，由领域层统一定义。
SKU_TIER_MAP: dict["CampMembershipSku", "CampMembershipTier"] = {
    CampMembershipSku.ANNUAL_BASIC: CampMembershipTier.BASIC,
    CampMembershipSku.ANNUAL_PREMIUM: CampMembershipTier.PREMIUM,
}


# 等级序值；门禁判定基于此序，禁止用枚举字符串字典序判断。
_TIER_ORDER: dict["CampMembershipTier", int] = {
    CampMembershipTier.NONE: 0,
    CampMembershipTier.BASIC: 1,
    CampMembershipTier.PREMIUM: 2,
}


class CampOrderStatus(StrEnum):
    """ai-camp 会员订单状态。"""

    PENDING = "pending"
    PAID = "paid"
    CLOSED = "closed"


class CampMembershipSnapshot(BaseModel):
    """挂在单个 camp 账号上的会员快照。"""

    model_config = ConfigDict(frozen=True)

    account_id: int
    tier: CampMembershipTier
    started_at: datetime | None
    expires_at: datetime | None
    is_active: bool
    remaining_days: int


class CampMembershipOrder(BaseModel):
    """一笔 ai-camp 会员订单聚合。"""

    model_config = ConfigDict(frozen=True)

    order_id: int
    order_no: str
    account_id: int
    sku: CampMembershipSku
    amount_fen: int
    status: CampOrderStatus
    code_url: str | None
    transaction_id: str | None
    trade_state: str | None
    paid_at: datetime | None
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None
    notify_payload: str | None
    created_at: datetime
    updated_at: datetime


def tier_satisfies(current: CampMembershipTier, required: CampMembershipTier) -> bool:
    """判定当前等级是否满足所需等级；高档自动满足低档。"""

    return _TIER_ORDER[current] >= _TIER_ORDER[required]
```

- [ ] 写 `domain/exceptions.py`：

```python
from __future__ import annotations

from http import HTTPStatus

from mz_ai_backend.core.error_codes import ErrorCode
from mz_ai_backend.core.exceptions import BusinessException

from .entities import CampMembershipTier


class CampMembershipSkuInvalidException(BusinessException):
    """SKU 不受支持。"""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_SKU_INVALID,
            message="Camp membership SKU is invalid.",
            http_status=HTTPStatus.BAD_REQUEST,
        )


class CampMembershipOrderNotFoundException(BusinessException):
    """订单不存在。"""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_ORDER_NOT_FOUND,
            message="Camp membership order does not exist.",
            http_status=HTTPStatus.NOT_FOUND,
        )


class CampMembershipOrderForbiddenException(BusinessException):
    """订单不属于当前账号。"""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_ORDER_FORBIDDEN,
            message="Camp membership order is forbidden.",
            http_status=HTTPStatus.FORBIDDEN,
        )


class CampMembershipOrderStatusInvalidException(BusinessException):
    """订单状态迁移非法。"""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_ORDER_STATUS_INVALID,
            message="Camp membership order state is invalid.",
            http_status=HTTPStatus.CONFLICT,
        )


class CampMembershipAlreadyActiveException(BusinessException):
    """已有有效会员期间不可再次下单（不升级、不叠加续费）。"""

    def __init__(self) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_ALREADY_ACTIVE,
            message="Camp membership is still active; new order is not allowed.",
            http_status=HTTPStatus.CONFLICT,
        )


class CampMembershipTierRequiredException(BusinessException):
    """门禁：当前等级不满足受保护资源所需等级。details 带 required/current。"""

    def __init__(
        self,
        *,
        required: CampMembershipTier,
        current: CampMembershipTier,
    ) -> None:
        super().__init__(
            error_code=ErrorCode.CAMP_MEMBERSHIP_TIER_REQUIRED,
            message="Camp membership tier is insufficient.",
            http_status=HTTPStatus.FORBIDDEN,
            details={"required": required.value, "current": current.value},
        )
```

> **实现注记（已核实）**：`mz_ai_backend.core.exceptions.BusinessException.__init__` 支持 `details: Mapping[str, Any] | None`（已读 `core/exceptions.py` 确认），故 `CampMembershipTierRequiredException(details={"required":..,"current":..})` 可直接用，`ApiResponse.details` 会带回前端。**注意**：`AppException` 内部把 `error_code` 存为 `self.error_code = str(error_code)`（字符串，非枚举），因此任何断言 `error_code` 的测试必须用字符串比较 `exc.error_code == "CAMP_MEMBERSHIP.TIER_REQUIRED"`，**不要**用 `.value`（A7 测试已据此编写）。

- [ ] 写 `domain/__init__.py`：导出 `entities` 与 `exceptions` 全部公共符号（`CAMP_MEMBERSHIP_DURATION_DAYS`、`MEMBERSHIP_QR_TTL_SECONDS`、`SKU_TIER_MAP`、`CampMembershipOrder`、`CampMembershipSnapshot`、`CampMembershipSku`、`CampMembershipTier`、`CampOrderStatus`、`tier_satisfies`、6 个异常类），`__all__` 按字母序列全。

- [ ] 运行确认通过：`cd server && uv run python -m pytest api/tests/camp_membership/domain/test_entities.py -q`，期望 2 passed。

- [ ] commit：
```
git add server/api/src/mz_ai_backend/modules/camp_membership server/api/tests/camp_membership/domain
git commit -m "feat(camp-membership): 领域层等级模型与门禁原语 tier_satisfies"
```

---

### Task A2 — 错误码登记

**Files:**
- Modify: `server/api/src/mz_ai_backend/core/error_codes.py`（在 `ACCOUNT_MEMBERSHIP_*` 段后追加，约第 58 行后）
- Test: 复用 Task A1 测试（exceptions 已引用这些码，import 即验证）

- [ ] 在 `ErrorCode` 枚举里、`ACCOUNT_MEMBERSHIP_SKU_INVALID = "ACCOUNT_MEMBERSHIP.SKU_INVALID"` 之后插入：

```python
    CAMP_MEMBERSHIP_SKU_INVALID = "CAMP_MEMBERSHIP.SKU_INVALID"
    CAMP_MEMBERSHIP_ORDER_NOT_FOUND = "CAMP_MEMBERSHIP.ORDER_NOT_FOUND"
    CAMP_MEMBERSHIP_ORDER_FORBIDDEN = "CAMP_MEMBERSHIP.ORDER_FORBIDDEN"
    CAMP_MEMBERSHIP_ORDER_STATUS_INVALID = "CAMP_MEMBERSHIP.ORDER_STATUS_INVALID"
    CAMP_MEMBERSHIP_ALREADY_ACTIVE = "CAMP_MEMBERSHIP.ALREADY_ACTIVE"
    CAMP_MEMBERSHIP_TIER_REQUIRED = "CAMP_MEMBERSHIP.TIER_REQUIRED"
```

- [ ] 运行：`cd server && uv run python -m pytest api/tests/camp_membership/domain/test_entities.py -q`（确认枚举可解析、import 不报 AttributeError），期望仍 2 passed。

- [ ] commit：
```
git add server/api/src/mz_ai_backend/core/error_codes.py
git commit -m "feat(camp-membership): 登记 CAMP_MEMBERSHIP 错误码"
```

---

### Task A3 — 应用层：DTOs 与端口

**Files:**
- Create: `.../camp_membership/application/dtos.py`
- Create: `.../camp_membership/application/ports/repositories.py`
- Create: `.../camp_membership/application/ports/services.py`
- Create: `.../camp_membership/application/ports/__init__.py`
- Create: `.../camp_membership/application/__init__.py`
- Test: 暂无独立测试（被后续用例测试覆盖）；本任务以 import 烟测验证。

- [ ] 写 `application/dtos.py`：

```python
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..domain import CampMembershipSnapshot, CampMembershipSku, CampOrderStatus


class CreateCampMembershipOrderCommand(BaseModel):
    """创建一笔 camp 会员订单的输入命令。"""

    model_config = ConfigDict(frozen=True)

    account_id: int
    sku: CampMembershipSku


class CreateCampMembershipOrderResult(BaseModel):
    """Native 订单创建后的返回。"""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: CampMembershipSku
    amount_fen: int
    status: CampOrderStatus
    code_url: str
    qr_expires_at: datetime


class CampMembershipOrderRegistration(BaseModel):
    """仓储建单入参。"""

    model_config = ConfigDict(frozen=True)

    order_id: int
    order_no: str
    account_id: int
    sku: CampMembershipSku
    amount_fen: int


class GetCampOrderStatusQuery(BaseModel):
    """轮询订单的输入查询。"""

    model_config = ConfigDict(frozen=True)

    account_id: int
    order_no: str


class CampMembershipOrderStatusResult(BaseModel):
    """订单状态返回。"""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: CampMembershipSku
    amount_fen: int
    status: CampOrderStatus
    code_url: str | None
    paid_at: datetime | None
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None


class HandleCampWechatPayNotifyCommand(BaseModel):
    """处理一次微信支付回调的输入命令。"""

    model_config = ConfigDict(frozen=True)

    headers: dict[str, str]
    body: bytes


class GetMyCampMembershipQuery(BaseModel):
    """读当前账号会员快照的输入查询。"""

    model_config = ConfigDict(frozen=True)

    account_id: int


MyCampMembershipResult = CampMembershipSnapshot
```

- [ ] 写 `application/ports/services.py`：与 account_membership 的 `services.py` 逐行一致（`SnowflakeIdGenerator` / `CurrentTimeProvider` / `WechatPayNativeGateway` 三个 Protocol，导入自 `mz_ai_backend.shared.wechat_pay`）。完整内容：

```python
from __future__ import annotations

from datetime import datetime
from typing import Protocol

from mz_ai_backend.shared.wechat_pay import (
    WechatPayNativeCreateOrderRequest,
    WechatPayNativeCreateOrderResult,
    WechatPayNotification,
)


class SnowflakeIdGenerator(Protocol):
    """生成业务 id 的契约。"""

    def generate(self) -> int:
        """生成一个唯一 id。"""


class CurrentTimeProvider(Protocol):
    """读取当前时间的契约。"""

    def now(self) -> datetime:
        """返回当前 naive UTC datetime。"""


class WechatPayNativeGateway(Protocol):
    """微信支付 Native 下单与回调契约。"""

    async def create_native_order(
        self,
        request: WechatPayNativeCreateOrderRequest,
    ) -> WechatPayNativeCreateOrderResult:
        """创建一笔 Native 订单。"""

    def parse_notification(
        self,
        *,
        headers: dict[str, str],
        body: bytes,
    ) -> WechatPayNotification:
        """验签并解析一次回调。"""
```

> 注：camp 版**不做主动查单/sweep**，故 `WechatPayNativeGateway` 端口**去掉 `query_order`**（account_membership 有，camp 不需要）。

- [ ] 写 `application/ports/repositories.py`：

```python
from __future__ import annotations

from datetime import datetime
from typing import Protocol

from mz_ai_backend.shared.wechat_pay import WechatPayNotification

from ...domain import (
    CampMembershipOrder,
    CampMembershipSnapshot,
    CampMembershipSku,
    CampMembershipTier,
)
from ..dtos import CampMembershipOrderRegistration


class CampMembershipRepository(Protocol):
    """ai-camp 会员持久化契约。"""

    async def create_pending_order(
        self,
        registration: CampMembershipOrderRegistration,
    ) -> CampMembershipOrder:
        """创建一笔 pending 订单。"""

    async def update_order_code_url(
        self,
        *,
        order_no: str,
        code_url: str,
    ) -> CampMembershipOrder:
        """回写 Native 二维码 URL。"""

    async def get_order_by_order_no(self, *, order_no: str) -> CampMembershipOrder | None:
        """按商户订单号取订单。"""

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        now: datetime,
        sku_tier_map: dict[CampMembershipSku, CampMembershipTier],
    ) -> CampMembershipOrder:
        """持久化回调结果并原子化授予会员（幂等）。"""

    async def get_membership_snapshot(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> CampMembershipSnapshot:
        """返回单个账号的会员快照。"""
```

- [ ] 写 `application/ports/__init__.py`：

```python
"""Application ports for ai-camp membership."""

from .repositories import CampMembershipRepository
from .services import CurrentTimeProvider, SnowflakeIdGenerator, WechatPayNativeGateway

__all__ = [
    "CampMembershipRepository",
    "CurrentTimeProvider",
    "SnowflakeIdGenerator",
    "WechatPayNativeGateway",
]
```

- [ ] 写 `application/__init__.py`（先只导出 dtos，用例在 A4 补；为避免循环引用，A4 完成后再补用例导出）：

```python
"""Application exports for ai-camp membership."""

from .dtos import (
    CampMembershipOrderRegistration,
    CampMembershipOrderStatusResult,
    CreateCampMembershipOrderCommand,
    CreateCampMembershipOrderResult,
    GetCampOrderStatusQuery,
    GetMyCampMembershipQuery,
    HandleCampWechatPayNotifyCommand,
    MyCampMembershipResult,
)

__all__ = [
    "CampMembershipOrderRegistration",
    "CampMembershipOrderStatusResult",
    "CreateCampMembershipOrderCommand",
    "CreateCampMembershipOrderResult",
    "GetCampOrderStatusQuery",
    "GetMyCampMembershipQuery",
    "HandleCampWechatPayNotifyCommand",
    "MyCampMembershipResult",
]
```

- [ ] 烟测 import：`cd server && uv run python -c "import sys; sys.path.insert(0,'api/src'); import mz_ai_backend.modules.camp_membership.application as m; print(sorted(m.__all__))"`，期望打印 8 个名字、无异常。

- [ ] commit：
```
git add server/api/src/mz_ai_backend/modules/camp_membership/application
git commit -m "feat(camp-membership): 应用层 DTO 与仓储/服务端口"
```

---

### Task A4 — 应用层用例：下单（无有效会员才可下单）

**Files:**
- Create: `.../camp_membership/application/use_cases/create_camp_membership_order.py`
- Modify: `.../camp_membership/application/use_cases/__init__.py`（本任务新建）
- Modify: `.../camp_membership/application/__init__.py`（补用例导出）
- Test: `server/api/tests/camp_membership/application/test_create_camp_membership_order.py`

- [ ] 写失败测试 `test_create_camp_membership_order.py`：

```python
from __future__ import annotations

from datetime import datetime, timedelta

import pytest

from mz_ai_backend.modules.camp_membership.application import (
    CreateCampMembershipOrderCommand,
    CreateCampMembershipOrderUseCase,
)
from mz_ai_backend.modules.camp_membership.application.dtos import (
    CampMembershipOrderRegistration,
)
from mz_ai_backend.modules.camp_membership.domain import (
    CampMembershipAlreadyActiveException,
    CampMembershipOrder,
    CampMembershipSku,
    CampMembershipSnapshot,
    CampMembershipTier,
    CampOrderStatus,
)
from mz_ai_backend.shared.wechat_pay import (
    WechatPayNativeCreateOrderRequest,
    WechatPayNativeCreateOrderResult,
)


class Repository:
    def __init__(self, *, snapshot: CampMembershipSnapshot) -> None:
        self._snapshot = snapshot
        self.order: CampMembershipOrder | None = None

    async def get_membership_snapshot(self, *, account_id: int, now: datetime) -> CampMembershipSnapshot:
        return self._snapshot

    async def create_pending_order(self, registration: CampMembershipOrderRegistration) -> CampMembershipOrder:
        now = datetime(2026, 6, 12, 10, 0, 0)
        self.order = CampMembershipOrder(
            order_id=registration.order_id,
            order_no=registration.order_no,
            account_id=registration.account_id,
            sku=registration.sku,
            amount_fen=registration.amount_fen,
            status=CampOrderStatus.PENDING,
            code_url=None,
            transaction_id=None,
            trade_state=None,
            paid_at=None,
            membership_applied=False,
            membership_started_at=None,
            membership_expires_at=None,
            notify_payload=None,
            created_at=now,
            updated_at=now,
        )
        return self.order

    async def update_order_code_url(self, *, order_no: str, code_url: str) -> CampMembershipOrder:
        assert self.order is not None
        self.order = self.order.model_copy(update={"code_url": code_url})
        return self.order


class Snowflake:
    def generate(self) -> int:
        return 1900000000000000001


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 6, 12, 10, 0, 0)


class Gateway:
    def __init__(self) -> None:
        self.requests: list[WechatPayNativeCreateOrderRequest] = []

    async def create_native_order(self, request: WechatPayNativeCreateOrderRequest) -> WechatPayNativeCreateOrderResult:
        self.requests.append(request)
        return WechatPayNativeCreateOrderResult(code_url="weixin://wxpay/native")

    def parse_notification(self, *, headers, body):
        raise NotImplementedError


def _snapshot(*, tier: CampMembershipTier, is_active: bool) -> CampMembershipSnapshot:
    return CampMembershipSnapshot(
        account_id=3001,
        tier=tier,
        started_at=None,
        expires_at=datetime(2027, 6, 12) if is_active else None,
        is_active=is_active,
        remaining_days=365 if is_active else 0,
    )


def _use_case(repo: Repository) -> CreateCampMembershipOrderUseCase:
    return CreateCampMembershipOrderUseCase(
        repository=repo,
        snowflake_id_generator=Snowflake(),
        current_time_provider=Clock(),
        wechat_pay_gateway=Gateway(),
        sku_prices={
            CampMembershipSku.ANNUAL_BASIC: 199900,
            CampMembershipSku.ANNUAL_PREMIUM: 399900,
        },
    )


@pytest.mark.asyncio
async def test_create_order_allowed_when_no_active_membership() -> None:
    repo = Repository(snapshot=_snapshot(tier=CampMembershipTier.NONE, is_active=False))
    use_case = _use_case(repo)

    result = await use_case.execute(
        CreateCampMembershipOrderCommand(account_id=3001, sku=CampMembershipSku.ANNUAL_BASIC)
    )

    assert result.order_no == "CAMP1900000000000000001"
    assert result.amount_fen == 199900
    assert result.code_url == "weixin://wxpay/native"
    assert result.status == CampOrderStatus.PENDING


@pytest.mark.asyncio
async def test_create_order_rejected_when_membership_active() -> None:
    repo = Repository(snapshot=_snapshot(tier=CampMembershipTier.BASIC, is_active=True))
    use_case = _use_case(repo)

    with pytest.raises(CampMembershipAlreadyActiveException):
        await use_case.execute(
            CreateCampMembershipOrderCommand(account_id=3001, sku=CampMembershipSku.ANNUAL_PREMIUM)
        )
```

- [ ] 运行确认失败：`cd server && uv run python -m pytest api/tests/camp_membership/application/test_create_camp_membership_order.py -q`，期望 import 失败（`CreateCampMembershipOrderUseCase` 不存在）。

- [ ] 写 `use_cases/create_camp_membership_order.py`：

```python
from __future__ import annotations

from datetime import timedelta

from mz_ai_backend.core.logging import get_logger
from mz_ai_backend.shared.wechat_pay import WechatPayNativeCreateOrderRequest

from ...domain import (
    MEMBERSHIP_QR_TTL_SECONDS,
    CampMembershipAlreadyActiveException,
    CampMembershipSku,
    CampOrderStatus,
)
from ..dtos import (
    CampMembershipOrderRegistration,
    CreateCampMembershipOrderCommand,
    CreateCampMembershipOrderResult,
)
from ..ports import (
    CampMembershipRepository,
    CurrentTimeProvider,
    SnowflakeIdGenerator,
    WechatPayNativeGateway,
)

camp_membership_logger = get_logger("mz_ai_backend.camp_membership")


class CreateCampMembershipOrderUseCase:
    """创建一笔 ai-camp 会员 Native 支付订单。

    购买资格：仅当账号当前无有效会员（NONE 或已过期）才允许下单；
    有有效会员期间下单直接拒绝（不升级、不叠加续费）。
    """

    def __init__(
        self,
        *,
        repository: CampMembershipRepository,
        snowflake_id_generator: SnowflakeIdGenerator,
        current_time_provider: CurrentTimeProvider,
        wechat_pay_gateway: WechatPayNativeGateway,
        sku_prices: dict[CampMembershipSku, int],
    ) -> None:
        self._repository = repository
        self._snowflake_id_generator = snowflake_id_generator
        self._current_time_provider = current_time_provider
        self._wechat_pay_gateway = wechat_pay_gateway
        self._sku_prices = sku_prices

    async def execute(
        self, command: CreateCampMembershipOrderCommand
    ) -> CreateCampMembershipOrderResult:
        now = self._current_time_provider.now()

        # 购买资格校验：有有效会员则拒单，明确错误语义，不静默兜底。
        snapshot = await self._repository.get_membership_snapshot(
            account_id=command.account_id,
            now=now,
        )
        if snapshot.is_active:
            camp_membership_logger.info(
                "camp_membership.order.rejected_active account_id=%s tier=%s expires_at=%s",
                command.account_id,
                snapshot.tier.value,
                snapshot.expires_at,
            )
            raise CampMembershipAlreadyActiveException()

        amount_fen = self._sku_prices[command.sku]

        order_id = self._snowflake_id_generator.generate()
        order_no = f"CAMP{order_id}"
        order = await self._repository.create_pending_order(
            CampMembershipOrderRegistration(
                order_id=order_id,
                order_no=order_no,
                account_id=command.account_id,
                sku=command.sku,
                amount_fen=amount_fen,
            )
        )

        native_result = await self._wechat_pay_gateway.create_native_order(
            WechatPayNativeCreateOrderRequest(
                order_no=order.order_no,
                amount_fen=order.amount_fen,
                description="微域生光 AI 编程训练营会员",
            )
        )
        order = await self._repository.update_order_code_url(
            order_no=order.order_no,
            code_url=native_result.code_url,
        )
        qr_expires_at = order.created_at + timedelta(seconds=MEMBERSHIP_QR_TTL_SECONDS)

        camp_membership_logger.info(
            "camp_membership.order.created order_no=%s account_id=%s sku=%s amount_fen=%s",
            order.order_no,
            order.account_id,
            order.sku.value,
            order.amount_fen,
        )
        camp_membership_logger.debug(
            "camp_membership.order.code_url_attached order_no=%s code_url_prefix=%s",
            order.order_no,
            order.code_url[:16] if order.code_url else None,
        )
        return CreateCampMembershipOrderResult(
            order_no=order.order_no,
            sku=CampMembershipSku(order.sku),
            amount_fen=order.amount_fen,
            status=CampOrderStatus(order.status),
            code_url=order.code_url or native_result.code_url,
            qr_expires_at=qr_expires_at,
        )
```

> **实现注记**：描述文案 `"微域生光 AI 编程训练营会员"` 不含英文品牌（符合用户偏好）。`description` 出现在微信支付页，禁止出现 weelume.com。

- [ ] 新建 `use_cases/__init__.py`：

```python
"""Use case exports for ai-camp membership."""

from .create_camp_membership_order import CreateCampMembershipOrderUseCase

__all__ = [
    "CreateCampMembershipOrderUseCase",
]
```

- [ ] 在 `application/__init__.py` 追加用例导入与 `__all__` 项：
```python
from .use_cases.create_camp_membership_order import CreateCampMembershipOrderUseCase
```
并把 `"CreateCampMembershipOrderUseCase"` 加入 `__all__`（保持字母序）。

- [ ] 运行确认通过：`cd server && uv run python -m pytest api/tests/camp_membership/application/test_create_camp_membership_order.py -q`，期望 2 passed。

- [ ] commit：
```
git add server/api/src/mz_ai_backend/modules/camp_membership/application server/api/tests/camp_membership/application/test_create_camp_membership_order.py
git commit -m "feat(camp-membership): 下单用例（无有效会员才可下单）"
```

---

### Task A5 — 应用层用例：查会员快照、查单、回调落账

**Files:**
- Create: `.../use_cases/get_my_camp_membership.py`
- Create: `.../use_cases/get_camp_order_status.py`
- Create: `.../use_cases/handle_camp_wechat_pay_notify.py`
- Modify: `.../use_cases/__init__.py`、`.../application/__init__.py`
- Test: `tests/camp_membership/application/test_get_my_camp_membership.py`、`test_handle_camp_wechat_pay_notify.py`

- [ ] 写失败测试 `test_get_my_camp_membership.py`：

```python
from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.camp_membership.application import (
    GetMyCampMembershipQuery,
    GetMyCampMembershipUseCase,
)
from mz_ai_backend.modules.camp_membership.domain import (
    CampMembershipSnapshot,
    CampMembershipTier,
)


class Repository:
    async def get_membership_snapshot(self, *, account_id: int, now: datetime) -> CampMembershipSnapshot:
        assert account_id == 3001
        return CampMembershipSnapshot(
            account_id=account_id,
            tier=CampMembershipTier.PREMIUM,
            started_at=datetime(2026, 1, 1),
            expires_at=datetime(2027, 1, 1),
            is_active=True,
            remaining_days=203,
        )


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 6, 12)


@pytest.mark.asyncio
async def test_get_my_camp_membership_returns_snapshot() -> None:
    use_case = GetMyCampMembershipUseCase(repository=Repository(), current_time_provider=Clock())

    result = await use_case.execute(GetMyCampMembershipQuery(account_id=3001))

    assert result.tier == CampMembershipTier.PREMIUM
    assert result.is_active is True
    assert result.remaining_days == 203
```

- [ ] 写失败测试 `test_handle_camp_wechat_pay_notify.py`（镜像 account_membership 同名测试，改类型）：

```python
from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.camp_membership.application import (
    HandleCampWechatPayNotifyCommand,
    HandleCampWechatPayNotifyUseCase,
)
from mz_ai_backend.modules.camp_membership.domain import (
    SKU_TIER_MAP,
    CampMembershipOrder,
    CampMembershipSku,
    CampOrderStatus,
)
from mz_ai_backend.shared.wechat_pay import WechatPayNotification


class Repository:
    async def process_wechat_pay_notification(self, *, notification: WechatPayNotification, now, sku_tier_map) -> CampMembershipOrder:
        assert notification.trade_state == "SUCCESS"
        return CampMembershipOrder(
            order_id=1,
            order_no=notification.order_no,
            account_id=3001,
            sku=CampMembershipSku.ANNUAL_BASIC,
            amount_fen=199900,
            status=CampOrderStatus.PAID,
            code_url=None,
            transaction_id=notification.transaction_id,
            trade_state=notification.trade_state,
            paid_at=now,
            membership_applied=True,
            membership_started_at=now,
            membership_expires_at=now,
            notify_payload=notification.raw_payload,
            created_at=now,
            updated_at=now,
        )


class Clock:
    def now(self) -> datetime:
        return datetime(2026, 6, 12, 10, 0, 0)


class Gateway:
    def parse_notification(self, *, headers: dict[str, str], body: bytes) -> WechatPayNotification:
        assert headers["wechatpay-signature"] == "signature"
        assert body == b"{}"
        return WechatPayNotification(
            order_no="CAMP1",
            transaction_id="wx-tx-1",
            trade_state="SUCCESS",
            amount_fen=199900,
            payer_openid=None,
            success_time=datetime(2026, 6, 12, 10, 0, 0),
            raw_payload='{"resource":{}}',
        )

    async def create_native_order(self, request):
        raise NotImplementedError


@pytest.mark.asyncio
async def test_handle_camp_wechat_pay_notify_processes_success() -> None:
    use_case = HandleCampWechatPayNotifyUseCase(
        repository=Repository(),
        current_time_provider=Clock(),
        wechat_pay_gateway=Gateway(),
        sku_tier_map=SKU_TIER_MAP,
    )

    result = await use_case.execute(
        HandleCampWechatPayNotifyCommand(headers={"wechatpay-signature": "signature"}, body=b"{}")
    )

    assert result.order_no == "CAMP1"
    assert result.status == CampOrderStatus.PAID
    assert result.membership_applied is True
```

- [ ] 运行确认失败：`cd server && uv run python -m pytest api/tests/camp_membership/application/test_get_my_camp_membership.py api/tests/camp_membership/application/test_handle_camp_wechat_pay_notify.py -q`，期望 import 失败。

- [ ] 写 `use_cases/get_my_camp_membership.py`：

```python
from __future__ import annotations

from ..dtos import GetMyCampMembershipQuery, MyCampMembershipResult
from ..ports import CampMembershipRepository, CurrentTimeProvider


class GetMyCampMembershipUseCase:
    """返回当前 ai-camp 账号会员快照。"""

    def __init__(
        self,
        *,
        repository: CampMembershipRepository,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._repository = repository
        self._current_time_provider = current_time_provider

    async def execute(self, query: GetMyCampMembershipQuery) -> MyCampMembershipResult:
        return await self._repository.get_membership_snapshot(
            account_id=query.account_id,
            now=self._current_time_provider.now(),
        )
```

- [ ] 写 `use_cases/get_camp_order_status.py`（**无主动查单**，纯读 + 越权校验）：

```python
from __future__ import annotations

from ...domain import (
    CampMembershipOrderForbiddenException,
    CampMembershipOrderNotFoundException,
    CampOrderStatus,
)
from ..dtos import CampMembershipOrderStatusResult, GetCampOrderStatusQuery
from ..ports import CampMembershipRepository, CurrentTimeProvider


class GetCampOrderStatusUseCase:
    """返回当前账号的一笔订单状态。"""

    def __init__(
        self,
        *,
        repository: CampMembershipRepository,
        current_time_provider: CurrentTimeProvider,
    ) -> None:
        self._repository = repository
        self._current_time_provider = current_time_provider

    async def execute(self, query: GetCampOrderStatusQuery) -> CampMembershipOrderStatusResult:
        order = await self._repository.get_order_by_order_no(order_no=query.order_no)
        if order is None:
            raise CampMembershipOrderNotFoundException()
        if order.account_id != query.account_id:
            raise CampMembershipOrderForbiddenException()

        return CampMembershipOrderStatusResult(
            order_no=order.order_no,
            sku=order.sku,
            amount_fen=order.amount_fen,
            status=order.status,
            # pending 时回二维码地址供前端展示，paid/closed 不再回。
            code_url=order.code_url if order.status == CampOrderStatus.PENDING else None,
            paid_at=order.paid_at,
            membership_applied=order.membership_applied,
            membership_started_at=order.membership_started_at,
            membership_expires_at=order.membership_expires_at,
        )
```

- [ ] 写 `use_cases/handle_camp_wechat_pay_notify.py`：

```python
from __future__ import annotations

from mz_ai_backend.core.logging import get_logger

from ...domain import CampMembershipSku, CampMembershipTier
from ..dtos import CampMembershipOrderStatusResult, HandleCampWechatPayNotifyCommand
from ..ports import CampMembershipRepository, CurrentTimeProvider, WechatPayNativeGateway

camp_membership_logger = get_logger("mz_ai_backend.camp_membership")


class HandleCampWechatPayNotifyUseCase:
    """处理微信支付回调并原子化授予 ai-camp 会员。"""

    def __init__(
        self,
        *,
        repository: CampMembershipRepository,
        current_time_provider: CurrentTimeProvider,
        wechat_pay_gateway: WechatPayNativeGateway,
        sku_tier_map: dict[CampMembershipSku, CampMembershipTier],
    ) -> None:
        self._repository = repository
        self._current_time_provider = current_time_provider
        self._wechat_pay_gateway = wechat_pay_gateway
        self._sku_tier_map = sku_tier_map

    async def execute(
        self, command: HandleCampWechatPayNotifyCommand
    ) -> CampMembershipOrderStatusResult:
        notification = self._wechat_pay_gateway.parse_notification(
            headers=command.headers,
            body=command.body,
        )

        order = await self._repository.process_wechat_pay_notification(
            notification=notification,
            now=self._current_time_provider.now(),
            sku_tier_map=self._sku_tier_map,
        )
        camp_membership_logger.info(
            "camp_membership.wechat_notify.handled order_no=%s status=%s trade_state=%s",
            order.order_no,
            order.status.value,
            order.trade_state,
        )
        return CampMembershipOrderStatusResult(
            order_no=order.order_no,
            sku=order.sku,
            amount_fen=order.amount_fen,
            status=order.status,
            code_url=None,
            paid_at=order.paid_at,
            membership_applied=order.membership_applied,
            membership_started_at=order.membership_started_at,
            membership_expires_at=order.membership_expires_at,
        )
```

- [ ] 更新 `use_cases/__init__.py` 为：

```python
"""Use case exports for ai-camp membership."""

from .create_camp_membership_order import CreateCampMembershipOrderUseCase
from .get_camp_order_status import GetCampOrderStatusUseCase
from .get_my_camp_membership import GetMyCampMembershipUseCase
from .handle_camp_wechat_pay_notify import HandleCampWechatPayNotifyUseCase

__all__ = [
    "CreateCampMembershipOrderUseCase",
    "GetCampOrderStatusUseCase",
    "GetMyCampMembershipUseCase",
    "HandleCampWechatPayNotifyUseCase",
]
```

- [ ] 更新 `application/__init__.py`：补 4 个用例的导入与 `__all__` 项（与 use_cases 一致，整体保持字母序）。

- [ ] 运行确认通过：`cd server && uv run python -m pytest api/tests/camp_membership/application -q`，期望全部 passed（含 Task A4 的 2 个）。

- [ ] commit：
```
git add server/api/src/mz_ai_backend/modules/camp_membership/application server/api/tests/camp_membership/application
git commit -m "feat(camp-membership): 查快照/查单/回调落账用例"
```

---

### Task A6 — 基础设施：ORM 模型、仓储、微信网关适配、依赖装配

**Files:**
- Create: `.../infrastructure/models.py`
- Create: `.../infrastructure/wechat_pay_native_adapter.py`
- Create: `.../infrastructure/repositories.py`
- Create: `.../infrastructure/dependencies.py`
- Create: `.../infrastructure/__init__.py`
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/models.py`（`CampAccountModel` 加 3 列，落账需要）
- Modify: `server/api/src/mz_ai_backend/core/config.py`（加 2 个价格项）
- Test: `server/api/tests/camp_membership/infrastructure/test_repositories.py`（需 PG，缺失自动 skip）

- [ ] 先给 `CampAccountModel` 加列（落账与快照读取依赖这些列）。在 `camp_auth/infrastructure/models.py` 的 `CampAccountModel` 中，`enrollment_expires_at` 之后、`is_deleted` 之前插入：

```python
    membership_tier: Mapped[str] = mapped_column(String(16), nullable=False, default="none")
    membership_started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )
    membership_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=False),
        nullable=True,
    )
```

> 注：该文件已 import `String`、`DateTime`、`Mapped`、`mapped_column`、`datetime`，无需新增 import。`enrollment_status` 等列保留不动。

- [ ] 在 `core/config.py` 的 `account_membership_*` 价格项附近（约第 48 行后）加：

```python
    camp_membership_basic_fen: int = Field(default=199900, ge=1)
    camp_membership_premium_fen: int = Field(default=399900, ge=1)
```

> **实现注记**：默认价 ¥1999 / ¥3999（199900 / 399900 分）来自营销页文案，落地前请向用户确认数值。

- [ ] 写 `infrastructure/models.py`：

```python
from __future__ import annotations

from datetime import datetime

from sqlalchemy import BigInteger, Boolean, DateTime, Identity, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from mz_ai_backend.core.database import Base


class CampMembershipOrderModel(Base):
    """ai-camp 会员订单 ORM 模型。"""

    __tablename__ = "camp_membership_orders"

    id: Mapped[int] = mapped_column(BigInteger, Identity(), primary_key=True)
    order_id: Mapped[int] = mapped_column(BigInteger, nullable=False, unique=True, index=True)
    order_no: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
    account_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String(32), nullable=False)
    amount_fen: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    code_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    transaction_id: Mapped[str | None] = mapped_column(String(64), nullable=True, unique=True)
    trade_state: Mapped[str | None] = mapped_column(String(32), nullable=True)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    membership_applied: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    membership_started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    membership_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)
    notify_payload: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=False),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
```

> 注：camp 版**不含** `last_wechat_query_at` 列（无 sweep/主动查单）。

- [ ] 写 `infrastructure/wechat_pay_native_adapter.py`（与 account_membership 适配器逐行一致，去掉 `query_order`）：

```python
from __future__ import annotations

from mz_ai_backend.shared.wechat_pay import (
    WechatPayNativeCreateOrderRequest,
    WechatPayNativeCreateOrderResult,
    WechatPayNotification,
    WechatPayV3Gateway,
)


class CampWechatPayNativeAdapter:
    """基于 shared 网关的 ai-camp Native 操作适配器。"""

    def __init__(self, *, gateway: WechatPayV3Gateway) -> None:
        self._gateway = gateway

    async def create_native_order(
        self,
        request: WechatPayNativeCreateOrderRequest,
    ) -> WechatPayNativeCreateOrderResult:
        return await self._gateway.create_native_order(request)

    def parse_notification(
        self,
        *,
        headers: dict[str, str],
        body: bytes,
    ) -> WechatPayNotification:
        return self._gateway.parse_notification(headers=headers, body=body)
```

- [ ] 写 `infrastructure/repositories.py`：

```python
from __future__ import annotations

from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.modules.camp_auth.infrastructure.models import CampAccountModel
from mz_ai_backend.shared.wechat_pay import (
    WechatPayNotification,
    WechatPayNotifyMismatchException,
)

from ..application.dtos import CampMembershipOrderRegistration
from ..domain import (
    CAMP_MEMBERSHIP_DURATION_DAYS,
    CampMembershipOrder,
    CampMembershipOrderNotFoundException,
    CampMembershipOrderStatusInvalidException,
    CampMembershipSnapshot,
    CampMembershipSku,
    CampMembershipTier,
    CampOrderStatus,
)
from .models import CampMembershipOrderModel


def _to_order(model: CampMembershipOrderModel) -> CampMembershipOrder:
    return CampMembershipOrder(
        order_id=model.order_id,
        order_no=model.order_no,
        account_id=model.account_id,
        sku=CampMembershipSku(model.sku),
        amount_fen=model.amount_fen,
        status=CampOrderStatus(model.status),
        code_url=model.code_url,
        transaction_id=model.transaction_id,
        trade_state=model.trade_state,
        paid_at=model.paid_at,
        membership_applied=model.membership_applied,
        membership_started_at=model.membership_started_at,
        membership_expires_at=model.membership_expires_at,
        notify_payload=model.notify_payload,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _remaining_days(*, expires_at: datetime | None, now: datetime) -> int:
    if expires_at is None or expires_at <= now:
        return 0
    return max(0, (expires_at - now).days)


class SqlAlchemyCampMembershipRepository:
    """持久化 ai-camp 会员订单与快照。"""

    def __init__(self, *, session: AsyncSession) -> None:
        self._session = session

    async def create_pending_order(
        self,
        registration: CampMembershipOrderRegistration,
    ) -> CampMembershipOrder:
        model = CampMembershipOrderModel(
            order_id=registration.order_id,
            order_no=registration.order_no,
            account_id=registration.account_id,
            sku=registration.sku.value,
            amount_fen=registration.amount_fen,
            status=CampOrderStatus.PENDING.value,
            code_url=None,
            transaction_id=None,
            trade_state=None,
            paid_at=None,
            membership_applied=False,
            membership_started_at=None,
            membership_expires_at=None,
            notify_payload=None,
            is_deleted=False,
        )
        self._session.add(model)
        await self._session.commit()
        await self._session.refresh(model)
        return _to_order(model)

    async def update_order_code_url(
        self,
        *,
        order_no: str,
        code_url: str,
    ) -> CampMembershipOrder:
        model = await self._load_order(order_no=order_no, for_update=False)
        if model is None:
            raise CampMembershipOrderNotFoundException()
        model.code_url = code_url
        await self._session.commit()
        await self._session.refresh(model)
        return _to_order(model)

    async def get_order_by_order_no(self, *, order_no: str) -> CampMembershipOrder | None:
        model = await self._load_order(order_no=order_no, for_update=False)
        return None if model is None else _to_order(model)

    async def process_wechat_pay_notification(
        self,
        *,
        notification: WechatPayNotification,
        now: datetime,
        sku_tier_map: dict[CampMembershipSku, CampMembershipTier],
    ) -> CampMembershipOrder:
        # 锁订单行：PAID 直接幂等返回；金额不匹配按明确错误语义抛出，不静默吞没。
        order_model = await self._load_order(order_no=notification.order_no, for_update=True)
        if order_model is None:
            raise CampMembershipOrderNotFoundException()

        current_status = CampOrderStatus(order_model.status)
        if current_status == CampOrderStatus.PAID:
            return _to_order(order_model)
        if current_status != CampOrderStatus.PENDING:
            raise CampMembershipOrderStatusInvalidException()
        if order_model.amount_fen != notification.amount_fen:
            raise WechatPayNotifyMismatchException(message="Callback amount mismatches order amount.")

        normalized_trade_state = notification.trade_state.strip().upper()
        order_model.trade_state = normalized_trade_state
        order_model.transaction_id = notification.transaction_id
        order_model.notify_payload = notification.raw_payload

        if normalized_trade_state == "SUCCESS":
            account_model = await self._load_account(account_id=order_model.account_id, for_update=True)
            if account_model is None:
                raise CampMembershipOrderNotFoundException()

            granted_tier = sku_tier_map.get(CampMembershipSku(order_model.sku), CampMembershipTier.BASIC)
            paid_at = notification.success_time or now
            # 不升级、不续费叠加：一律从付款时刻起 365 天，覆盖写账号会员列。
            started_at = paid_at
            expires_at = paid_at + timedelta(days=CAMP_MEMBERSHIP_DURATION_DAYS)

            account_model.membership_tier = granted_tier.value
            account_model.membership_started_at = started_at
            account_model.membership_expires_at = expires_at

            order_model.status = CampOrderStatus.PAID.value
            order_model.paid_at = paid_at
            order_model.membership_applied = True
            order_model.membership_started_at = started_at
            order_model.membership_expires_at = expires_at
        elif normalized_trade_state in {"CLOSED", "REVOKED", "PAYERROR"}:
            order_model.status = CampOrderStatus.CLOSED.value

        await self._session.commit()
        await self._session.refresh(order_model)
        return _to_order(order_model)

    async def get_membership_snapshot(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> CampMembershipSnapshot:
        account_model = await self._load_account(account_id=account_id, for_update=False)
        if account_model is None:
            raise CampMembershipOrderNotFoundException()
        tier = CampMembershipTier(account_model.membership_tier or CampMembershipTier.NONE.value)
        expires_at = account_model.membership_expires_at
        # is_active = 等级非 NONE 且未过期；过期则视为有效等级回落 NONE（不改库内历史 tier）。
        is_active = tier != CampMembershipTier.NONE and expires_at is not None and expires_at > now
        return CampMembershipSnapshot(
            account_id=account_id,
            tier=tier,
            started_at=account_model.membership_started_at,
            expires_at=expires_at,
            is_active=is_active,
            remaining_days=_remaining_days(expires_at=expires_at, now=now),
        )

    async def _load_order(
        self,
        *,
        order_no: str,
        for_update: bool,
    ) -> CampMembershipOrderModel | None:
        statement = select(CampMembershipOrderModel).where(
            CampMembershipOrderModel.order_no == order_no,
            CampMembershipOrderModel.is_deleted.is_(False),
        )
        if for_update:
            statement = statement.with_for_update()
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()

    async def _load_account(
        self,
        *,
        account_id: int,
        for_update: bool,
    ) -> CampAccountModel | None:
        statement = select(CampAccountModel).where(
            CampAccountModel.account_id == account_id,
            CampAccountModel.is_deleted.is_(False),
        )
        if for_update:
            statement = statement.with_for_update()
        result = await self._session.execute(statement)
        return result.scalar_one_or_none()
```

> **实现注记**：快照「过期回落 NONE」体现在 `is_active` 与 `remaining_days`；库里 `membership_tier` 历史值保留（spec 3.2）。门禁原语在表现层用「有效等级」判断——见 Task A7 `require_camp_tier`：当 `is_active` 为假时把有效等级视为 NONE。

- [ ] 写 `infrastructure/dependencies.py`：

```python
from __future__ import annotations

from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from mz_ai_backend.core.config import Settings
from mz_ai_backend.core.dependencies import get_async_session_dependency, get_settings_dependency
from mz_ai_backend.modules.camp_auth.application import GetCurrentCampAccountQuery
from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import (
    get_current_camp_access_token,
    get_get_current_camp_account_use_case,
)
from mz_ai_backend.shared import SnowflakeGenerator, get_snowflake_generator
from mz_ai_backend.shared.wechat_pay import WechatPayConfigMissingException, WechatPayV3Gateway

from ..application import (
    CreateCampMembershipOrderUseCase,
    GetCampOrderStatusUseCase,
    GetMyCampMembershipUseCase,
    HandleCampWechatPayNotifyUseCase,
)
from ..domain import SKU_TIER_MAP, CampMembershipSku
from .repositories import SqlAlchemyCampMembershipRepository
from .wechat_pay_native_adapter import CampWechatPayNativeAdapter


class SystemCurrentTimeProvider:
    """返回 naive UTC datetime 供持久化。"""

    def now(self) -> datetime:
        return datetime.now(UTC).replace(tzinfo=None)


def get_camp_membership_repository(
    session: Annotated[AsyncSession, Depends(get_async_session_dependency)],
) -> SqlAlchemyCampMembershipRepository:
    """构造 ai-camp 会员仓储。"""

    return SqlAlchemyCampMembershipRepository(session=session)


def get_camp_snowflake_id_generator(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> SnowflakeGenerator:
    """构造业务 id 生成器。"""

    return get_snowflake_generator(
        worker_id=settings.snowflake_worker_id,
        datacenter_id=settings.snowflake_datacenter_id,
    )


def get_camp_current_time_provider() -> SystemCurrentTimeProvider:
    """构造当前时间提供者。"""

    return SystemCurrentTimeProvider()


async def get_current_camp_account_id(
    access_token: Annotated[str, Depends(get_current_camp_access_token)],
    use_case: Annotated[object, Depends(get_get_current_camp_account_use_case)],
) -> int:
    """从 camp access token 解析当前账号 id（复用 camp_auth 鉴权，不重复实现）。"""

    account = await use_case.execute(GetCurrentCampAccountQuery(access_token=access_token))
    return account.account_id


def get_camp_wechat_pay_gateway(
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> CampWechatPayNativeAdapter:
    """构造 ai-camp 微信 Native 网关（复用 website 的支付商户配置）。"""

    required_values = (
        settings.wechat_pay_mchid,
        settings.wechat_pay_web_appid,
        settings.wechat_pay_cert_serial_no,
        settings.wechat_pay_apiv3_key,
        settings.wechat_pay_web_notify_url,
    )
    if any(value is None or value.strip() == "" for value in required_values):
        raise WechatPayConfigMissingException()

    from mz_ai_backend.modules.membership.infrastructure.dependencies import (
        _resolve_optional_public_key,
        _resolve_private_key,
    )
    from wechatpayv3 import WeChatPayType

    public_key, public_key_id = _resolve_optional_public_key(settings)
    gateway = WechatPayV3Gateway(
        mchid=settings.wechat_pay_mchid.strip(),
        appid=settings.wechat_pay_web_appid.strip(),
        private_key=_resolve_private_key(settings).strip(),
        cert_serial_no=settings.wechat_pay_cert_serial_no.strip(),
        apiv3_key=settings.wechat_pay_apiv3_key.strip(),
        notify_url=settings.wechat_pay_web_notify_url.strip(),
        cert_dir=settings.wechat_pay_cert_dir.strip() if settings.wechat_pay_cert_dir else None,
        public_key=public_key,
        public_key_id=public_key_id,
        pay_type=WeChatPayType.NATIVE,
    )
    return CampWechatPayNativeAdapter(gateway=gateway)


def get_create_camp_membership_order_use_case(
    repository: Annotated[SqlAlchemyCampMembershipRepository, Depends(get_camp_membership_repository)],
    snowflake_id_generator: Annotated[SnowflakeGenerator, Depends(get_camp_snowflake_id_generator)],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_camp_current_time_provider)],
    wechat_pay_gateway: Annotated[CampWechatPayNativeAdapter, Depends(get_camp_wechat_pay_gateway)],
    settings: Annotated[Settings, Depends(get_settings_dependency)],
) -> CreateCampMembershipOrderUseCase:
    """构造下单用例。"""

    sku_prices = {
        CampMembershipSku.ANNUAL_BASIC: settings.camp_membership_basic_fen,
        CampMembershipSku.ANNUAL_PREMIUM: settings.camp_membership_premium_fen,
    }
    return CreateCampMembershipOrderUseCase(
        repository=repository,
        snowflake_id_generator=snowflake_id_generator,
        current_time_provider=current_time_provider,
        wechat_pay_gateway=wechat_pay_gateway,
        sku_prices=sku_prices,
    )


def get_get_camp_order_status_use_case(
    repository: Annotated[SqlAlchemyCampMembershipRepository, Depends(get_camp_membership_repository)],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_camp_current_time_provider)],
) -> GetCampOrderStatusUseCase:
    """构造查单用例。"""

    return GetCampOrderStatusUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
    )


def get_get_my_camp_membership_use_case(
    repository: Annotated[SqlAlchemyCampMembershipRepository, Depends(get_camp_membership_repository)],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_camp_current_time_provider)],
) -> GetMyCampMembershipUseCase:
    """构造会员快照用例。"""

    return GetMyCampMembershipUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
    )


def get_handle_camp_wechat_pay_notify_use_case(
    repository: Annotated[SqlAlchemyCampMembershipRepository, Depends(get_camp_membership_repository)],
    current_time_provider: Annotated[SystemCurrentTimeProvider, Depends(get_camp_current_time_provider)],
    wechat_pay_gateway: Annotated[CampWechatPayNativeAdapter, Depends(get_camp_wechat_pay_gateway)],
) -> HandleCampWechatPayNotifyUseCase:
    """构造回调用例。"""

    return HandleCampWechatPayNotifyUseCase(
        repository=repository,
        current_time_provider=current_time_provider,
        wechat_pay_gateway=wechat_pay_gateway,
        sku_tier_map=SKU_TIER_MAP,
    )
```

> **实现注记**：`get_camp_wechat_pay_gateway` 复用 `membership.infrastructure.dependencies` 的 `_resolve_optional_public_key` / `_resolve_private_key`（account_membership 也是这么复用的）。落地时先 `Read` `mz_ai_backend.modules.membership.infrastructure.dependencies` 确认这两个私有函数名仍存在；若已重命名，按实际名修正。同理确认 `mz_ai_backend.shared` 导出 `SnowflakeGenerator` 与 `get_snowflake_generator`、`mz_ai_backend.core.dependencies` 导出 `get_async_session_dependency` / `get_settings_dependency`（account_membership/dependencies.py 已这样导入，可直接照用）。

- [ ] 写 `infrastructure/__init__.py`：

```python
"""Infrastructure exports for ai-camp membership."""

from .dependencies import (
    SystemCurrentTimeProvider,
    get_camp_current_time_provider,
    get_camp_membership_repository,
    get_camp_snowflake_id_generator,
    get_camp_wechat_pay_gateway,
    get_create_camp_membership_order_use_case,
    get_current_camp_account_id,
    get_get_camp_order_status_use_case,
    get_get_my_camp_membership_use_case,
    get_handle_camp_wechat_pay_notify_use_case,
)
from .repositories import SqlAlchemyCampMembershipRepository
from .wechat_pay_native_adapter import CampWechatPayNativeAdapter

__all__ = [
    "CampWechatPayNativeAdapter",
    "SqlAlchemyCampMembershipRepository",
    "SystemCurrentTimeProvider",
    "get_camp_current_time_provider",
    "get_camp_membership_repository",
    "get_camp_snowflake_id_generator",
    "get_camp_wechat_pay_gateway",
    "get_create_camp_membership_order_use_case",
    "get_current_camp_account_id",
    "get_get_camp_order_status_use_case",
    "get_get_my_camp_membership_use_case",
    "get_handle_camp_wechat_pay_notify_use_case",
]
```

- [ ] 写 DB 仓储测试 `tests/camp_membership/infrastructure/test_repositories.py`（镜像 account_membership 的 `test_repositories.py`，账号表换成 `CampAccountModel`，建表换成 camp 两表）：

```python
from __future__ import annotations

from collections.abc import AsyncIterator
from datetime import datetime, timedelta

import pytest
import pytest_asyncio
from sqlalchemy import delete, text
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from mz_ai_backend.core.config import get_settings
from mz_ai_backend.modules.camp_auth.infrastructure.models import CampAccountModel
from mz_ai_backend.modules.camp_membership.application.dtos import CampMembershipOrderRegistration
from mz_ai_backend.modules.camp_membership.domain import (
    SKU_TIER_MAP,
    CampMembershipSku,
    CampMembershipTier,
    CampOrderStatus,
)
from mz_ai_backend.modules.camp_membership.infrastructure.models import CampMembershipOrderModel
from mz_ai_backend.modules.camp_membership.infrastructure.repositories import (
    SqlAlchemyCampMembershipRepository,
)
from mz_ai_backend.shared.wechat_pay import WechatPayNotification

pytestmark = pytest.mark.asyncio

ACCOUNT_ID = 920_001_001
ORDER_ID = 920_002_001
ORDER_NO = "CAMPMEMTEST920002001"
TRANSACTION_ID = "420000920002001"


@pytest_asyncio.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    settings = get_settings()
    engine = create_async_engine(settings.database_url)
    try:
        async with engine.begin() as connection:
            try:
                await connection.execute(text("SELECT 1"))
            except (ConnectionRefusedError, OSError, OperationalError) as exc:
                pytest.skip(f"PostgreSQL test database is not available: {exc!s}")
            await connection.run_sync(CampAccountModel.__table__.create, checkfirst=True)
            await connection.run_sync(CampMembershipOrderModel.__table__.create, checkfirst=True)
    except (ConnectionRefusedError, OSError, OperationalError) as exc:
        await engine.dispose()
        pytest.skip(f"PostgreSQL test database is not available: {exc!s}")

    session_maker = async_sessionmaker(engine, expire_on_commit=False)
    async with session_maker() as session:
        await _cleanup(session)
        await _insert_account(session)
        yield session
        await _cleanup(session)
    await engine.dispose()


async def _insert_account(session: AsyncSession) -> None:
    session.add(
        CampAccountModel(
            account_id=ACCOUNT_ID,
            username="repo-camp-membership-test",
            email="repo-camp-membership-test@example.com",
            status="active",
            enrollment_status="none",
            membership_tier=CampMembershipTier.NONE.value,
            membership_started_at=None,
            membership_expires_at=None,
            is_deleted=False,
        )
    )
    await session.commit()


async def _cleanup(session: AsyncSession) -> None:
    await session.execute(delete(CampMembershipOrderModel).where(CampMembershipOrderModel.account_id == ACCOUNT_ID))
    await session.execute(delete(CampAccountModel).where(CampAccountModel.account_id == ACCOUNT_ID))
    await session.commit()


def _registration() -> CampMembershipOrderRegistration:
    return CampMembershipOrderRegistration(
        order_id=ORDER_ID,
        order_no=ORDER_NO,
        account_id=ACCOUNT_ID,
        sku=CampMembershipSku.ANNUAL_BASIC,
        amount_fen=199_900,
    )


def _success_notification() -> WechatPayNotification:
    return WechatPayNotification(
        order_no=ORDER_NO,
        transaction_id=TRANSACTION_ID,
        trade_state="SUCCESS",
        amount_fen=199_900,
        payer_openid=None,
        success_time=datetime(2026, 6, 12, 10, 0, 0),
        raw_payload='{"trade_state":"SUCCESS"}',
    )


async def test_repository_applies_membership_and_is_idempotent(db_session: AsyncSession) -> None:
    repository = SqlAlchemyCampMembershipRepository(session=db_session)
    now = datetime(2026, 6, 12, 10, 0, 0)

    await repository.create_pending_order(_registration())
    paid_order = await repository.process_wechat_pay_notification(
        notification=_success_notification(), now=now, sku_tier_map=SKU_TIER_MAP
    )
    # 二次回调：membership_applied 已 True，状态 PAID，幂等返回不重复延长。
    again = await repository.process_wechat_pay_notification(
        notification=_success_notification(), now=now, sku_tier_map=SKU_TIER_MAP
    )
    snapshot = await repository.get_membership_snapshot(account_id=ACCOUNT_ID, now=now)

    assert paid_order.status == CampOrderStatus.PAID
    assert paid_order.membership_applied is True
    assert paid_order.membership_expires_at == now + timedelta(days=365)
    assert again.membership_expires_at == paid_order.membership_expires_at
    assert snapshot.tier == CampMembershipTier.BASIC
    assert snapshot.is_active is True
```

- [ ] 运行：`cd server && uv run python -m pytest api/tests/camp_membership/infrastructure/test_repositories.py -q`。若本机无 PG 测试库，期望 `skipped`（不算失败）；有 PG 则期望 passed。同时跑整模块 import 烟测：`cd server && uv run python -c "import sys; sys.path.insert(0,'api/src'); import mz_ai_backend.modules.camp_membership.infrastructure as i; print('ok')"`。

- [ ] commit：
```
git add server/api/src/mz_ai_backend/modules/camp_membership/infrastructure server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/models.py server/api/src/mz_ai_backend/core/config.py server/api/tests/camp_membership/infrastructure
git commit -m "feat(camp-membership): 订单模型/仓储/微信网关/依赖装配与账号会员列"
```

---

### Task A7 — 表现层门禁依赖 `require_camp_tier` + 测试

**Files:**
- Create: `.../presentation/dependencies.py`（门禁依赖工厂，独立于 router 便于复用与测试）
- Test: `server/api/tests/camp_membership/application/test_require_camp_tier.py`

- [ ] 写失败测试 `test_require_camp_tier.py`（直接调用工厂返回的依赖函数，注入假用例与快照）：

```python
from __future__ import annotations

from datetime import datetime

import pytest

from mz_ai_backend.modules.camp_membership.domain import (
    CampMembershipSnapshot,
    CampMembershipTier,
    CampMembershipTierRequiredException,
)
from mz_ai_backend.modules.camp_membership.presentation.dependencies import require_camp_tier


class _SnapshotUseCase:
    def __init__(self, snapshot: CampMembershipSnapshot) -> None:
        self._snapshot = snapshot

    async def execute(self, query) -> CampMembershipSnapshot:
        return self._snapshot


def _snapshot(*, tier: CampMembershipTier, is_active: bool) -> CampMembershipSnapshot:
    return CampMembershipSnapshot(
        account_id=3001,
        tier=tier,
        started_at=None,
        expires_at=datetime(2027, 1, 1) if is_active else None,
        is_active=is_active,
        remaining_days=365 if is_active else 0,
    )


@pytest.mark.asyncio
async def test_require_camp_tier_passes_when_active_tier_satisfies() -> None:
    dependency = require_camp_tier(CampMembershipTier.BASIC)
    snapshot = _snapshot(tier=CampMembershipTier.PREMIUM, is_active=True)

    tier = await dependency(account_id=3001, use_case=_SnapshotUseCase(snapshot))

    assert tier == CampMembershipTier.PREMIUM


@pytest.mark.asyncio
async def test_require_camp_tier_rejects_when_expired_falls_back_to_none() -> None:
    dependency = require_camp_tier(CampMembershipTier.BASIC)
    # 过期：有效等级回落 NONE，不满足 BASIC。
    snapshot = _snapshot(tier=CampMembershipTier.PREMIUM, is_active=False)

    with pytest.raises(CampMembershipTierRequiredException) as exc_info:
        await dependency(account_id=3001, use_case=_SnapshotUseCase(snapshot))

    # AppException 把 error_code 存为字符串（非枚举），故用字符串比较。
    assert exc_info.value.error_code == "CAMP_MEMBERSHIP.TIER_REQUIRED"
    assert exc_info.value.details == {"required": "basic", "current": "none"}


@pytest.mark.asyncio
async def test_require_camp_tier_rejects_when_tier_too_low() -> None:
    dependency = require_camp_tier(CampMembershipTier.PREMIUM)
    snapshot = _snapshot(tier=CampMembershipTier.BASIC, is_active=True)

    with pytest.raises(CampMembershipTierRequiredException):
        await dependency(account_id=3001, use_case=_SnapshotUseCase(snapshot))
```

> **实现注记（已核实）**：`AppException.error_code` 是字符串，`details` 是 `dict`，故测试用 `exc.error_code == "CAMP_MEMBERSHIP.TIER_REQUIRED"` 与 `exc.details == {"required": "basic", "current": "none"}` 断言（已写入测试）。

- [ ] 运行确认失败：`cd server && uv run python -m pytest api/tests/camp_membership/application/test_require_camp_tier.py -q`，期望 import 失败（`require_camp_tier` 不存在）。

- [ ] 写 `presentation/dependencies.py`：

```python
from __future__ import annotations

from typing import Annotated, Callable

from fastapi import Depends

from ..application import GetMyCampMembershipQuery, GetMyCampMembershipUseCase
from ..domain import (
    CampMembershipTier,
    CampMembershipTierRequiredException,
    tier_satisfies,
)
from ..infrastructure import (
    get_current_camp_account_id,
    get_get_my_camp_membership_use_case,
)


def require_camp_tier(
    required_tier: CampMembershipTier,
) -> Callable[..., "CampMembershipTier"]:
    """构造一个 FastAPI 依赖：要求当前账号有效等级 >= required_tier。

    将来课件接口只需 ``Depends(require_camp_tier(CampMembershipTier.BASIC))``。
    过期会员有效等级回落 NONE；不满足时抛 CAMP_MEMBERSHIP.TIER_REQUIRED（含 required/current），
    不静默兜底。
    """

    async def _dependency(
        account_id: Annotated[int, Depends(get_current_camp_account_id)],
        use_case: Annotated[
            GetMyCampMembershipUseCase,
            Depends(get_get_my_camp_membership_use_case),
        ],
    ) -> CampMembershipTier:
        snapshot = await use_case.execute(GetMyCampMembershipQuery(account_id=account_id))
        # 过期 → 有效等级回落 NONE；有效 → 取快照 tier。
        effective_tier = snapshot.tier if snapshot.is_active else CampMembershipTier.NONE
        if not tier_satisfies(effective_tier, required_tier):
            raise CampMembershipTierRequiredException(
                required=required_tier,
                current=effective_tier,
            )
        return effective_tier

    return _dependency
```

> 注：测试以关键字 `account_id=` / `use_case=` 直接调用 `_dependency`，故内层函数参数名必须是 `account_id` 与 `use_case`（已对齐）。

- [ ] 运行确认通过：`cd server && uv run python -m pytest api/tests/camp_membership/application/test_require_camp_tier.py -q`，期望 3 passed。

- [ ] commit：
```
git add server/api/src/mz_ai_backend/modules/camp_membership/presentation/dependencies.py server/api/tests/camp_membership/application/test_require_camp_tier.py
git commit -m "feat(camp-membership): 后端门禁依赖 require_camp_tier"
```

---

### Task A8 — 表现层：schemas、router、模块导出与注册

**Files:**
- Create: `.../presentation/schemas.py`
- Create: `.../presentation/router.py`
- Create: `.../presentation/__init__.py`
- Modify: `.../camp_membership/__init__.py`（导出 router）
- Modify: `server/api/src/mz_ai_backend/modules/__init__.py`、`server/api/src/mz_ai_backend/core/application.py`
- Test: `server/api/tests/camp_membership/presentation/test_router.py`

- [ ] 写失败测试 `test_router.py`（镜像 account_membership 的 `test_router.py`，改 SKU/前缀/类型/金额）：

```python
from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.camp_membership.application import (
    CampMembershipOrderStatusResult,
    CreateCampMembershipOrderResult,
)
from mz_ai_backend.modules.camp_membership.domain import (
    CampMembershipSnapshot,
    CampMembershipSku,
    CampMembershipTier,
    CampOrderStatus,
)
from mz_ai_backend.modules.camp_membership.infrastructure.dependencies import (
    get_create_camp_membership_order_use_case,
    get_current_camp_account_id,
    get_get_camp_order_status_use_case,
    get_get_my_camp_membership_use_case,
    get_handle_camp_wechat_pay_notify_use_case,
)


class CreateUseCase:
    async def execute(self, command) -> CreateCampMembershipOrderResult:
        assert command.account_id == 3001
        assert command.sku == CampMembershipSku.ANNUAL_BASIC
        return CreateCampMembershipOrderResult(
            order_no="CAMP1",
            sku=CampMembershipSku.ANNUAL_BASIC,
            amount_fen=199900,
            status=CampOrderStatus.PENDING,
            code_url="weixin://wxpay/native",
            qr_expires_at=datetime(2026, 6, 12, 10, 15, 0),
        )


class StatusUseCase:
    async def execute(self, query) -> CampMembershipOrderStatusResult:
        assert query.account_id == 3001
        assert query.order_no == "CAMP1"
        return CampMembershipOrderStatusResult(
            order_no="CAMP1",
            sku=CampMembershipSku.ANNUAL_BASIC,
            amount_fen=199900,
            status=CampOrderStatus.PAID,
            code_url=None,
            paid_at=datetime(2026, 6, 12, 10, 0, 0),
            membership_applied=True,
            membership_started_at=datetime(2026, 6, 12, 10, 0, 0),
            membership_expires_at=datetime(2027, 6, 12, 10, 0, 0),
        )


class MyMembershipUseCase:
    async def execute(self, query) -> CampMembershipSnapshot:
        assert query.account_id == 3001
        return CampMembershipSnapshot(
            account_id=3001,
            tier=CampMembershipTier.BASIC,
            started_at=datetime(2026, 6, 12, 10, 0, 0),
            expires_at=datetime(2027, 6, 12, 10, 0, 0),
            is_active=True,
            remaining_days=365,
        )


class NotifyUseCase:
    async def execute(self, command) -> CampMembershipOrderStatusResult:
        assert command.headers.get("wechatpay-signature") == "signature"
        assert command.body == b'{"id":"notify"}'
        return CampMembershipOrderStatusResult(
            order_no="CAMP1",
            sku=CampMembershipSku.ANNUAL_BASIC,
            amount_fen=199900,
            status=CampOrderStatus.PAID,
            code_url=None,
            paid_at=datetime(2026, 6, 12, 10, 0, 0),
            membership_applied=True,
            membership_started_at=datetime(2026, 6, 12, 10, 0, 0),
            membership_expires_at=datetime(2027, 6, 12, 10, 0, 0),
        )


def _build_client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_current_camp_account_id] = lambda: 3001
    app.dependency_overrides[get_create_camp_membership_order_use_case] = lambda: CreateUseCase()
    app.dependency_overrides[get_get_camp_order_status_use_case] = lambda: StatusUseCase()
    app.dependency_overrides[get_get_my_camp_membership_use_case] = lambda: MyMembershipUseCase()
    app.dependency_overrides[get_handle_camp_wechat_pay_notify_use_case] = lambda: NotifyUseCase()
    return TestClient(app, raise_server_exceptions=False)


def test_camp_membership_router_creates_order() -> None:
    with _build_client() as client:
        response = client.post("/api/v1/camp-membership/orders", json={"sku": "annual_basic"})
    body = response.json()
    assert response.status_code == 200
    assert body["data"]["order_no"] == "CAMP1"
    assert body["data"]["code_url"] == "weixin://wxpay/native"


def test_camp_membership_router_gets_order_status() -> None:
    with _build_client() as client:
        response = client.get("/api/v1/camp-membership/orders/CAMP1")
    body = response.json()
    assert response.status_code == 200
    assert body["data"]["status"] == "paid"
    assert body["data"]["membership_applied"] is True


def test_camp_membership_router_gets_my_membership() -> None:
    with _build_client() as client:
        response = client.get("/api/v1/camp-membership/me")
    body = response.json()
    assert response.status_code == 200
    assert body["data"]["tier"] == "basic"
    assert body["data"]["remaining_days"] == 365


def test_camp_membership_router_handles_wechat_pay_notify() -> None:
    with _build_client() as client:
        response = client.post(
            "/api/v1/camp-membership/wechat-pay/notify",
            headers={"wechatpay-signature": "signature"},
            content=b'{"id":"notify"}',
        )
    assert response.status_code == 200
    assert response.json() == {"code": "SUCCESS", "message": "success"}
```

- [ ] 运行确认失败：`cd server && uv run python -m pytest api/tests/camp_membership/presentation/test_router.py -q`，期望失败（router 未注册 / 404 或 import 失败）。

- [ ] 写 `presentation/schemas.py`：

```python
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ..application import (
    CampMembershipOrderStatusResult,
    CreateCampMembershipOrderCommand,
    CreateCampMembershipOrderResult,
)
from ..domain import CampMembershipSku, CampMembershipSnapshot


class CreateCampMembershipOrderRequest(BaseModel):
    """下单 HTTP 请求体。"""

    model_config = ConfigDict(frozen=True)

    sku: CampMembershipSku

    def to_command(self, *, account_id: int) -> CreateCampMembershipOrderCommand:
        return CreateCampMembershipOrderCommand(account_id=account_id, sku=self.sku)


class CreateCampMembershipOrderResponse(BaseModel):
    """下单 HTTP 响应。"""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: str
    amount_fen: int
    status: str
    code_url: str
    qr_expires_at: datetime

    @classmethod
    def from_result(cls, result: CreateCampMembershipOrderResult) -> "CreateCampMembershipOrderResponse":
        return cls(
            order_no=result.order_no,
            sku=result.sku.value,
            amount_fen=result.amount_fen,
            status=result.status.value,
            code_url=result.code_url,
            qr_expires_at=result.qr_expires_at,
        )


class CampMembershipOrderStatusResponse(BaseModel):
    """订单状态 HTTP 响应。"""

    model_config = ConfigDict(frozen=True)

    order_no: str
    sku: str
    amount_fen: int
    status: str
    code_url: str | None
    paid_at: datetime | None
    membership_applied: bool
    membership_started_at: datetime | None
    membership_expires_at: datetime | None

    @classmethod
    def from_result(cls, result: CampMembershipOrderStatusResult) -> "CampMembershipOrderStatusResponse":
        return cls(
            order_no=result.order_no,
            sku=result.sku.value,
            amount_fen=result.amount_fen,
            status=result.status.value,
            code_url=result.code_url,
            paid_at=result.paid_at,
            membership_applied=result.membership_applied,
            membership_started_at=result.membership_started_at,
            membership_expires_at=result.membership_expires_at,
        )


class MyCampMembershipResponse(BaseModel):
    """会员快照 HTTP 响应。"""

    model_config = ConfigDict(frozen=True)

    tier: str
    started_at: datetime | None
    expires_at: datetime | None
    is_active: bool
    remaining_days: int

    @classmethod
    def from_result(cls, result: CampMembershipSnapshot) -> "MyCampMembershipResponse":
        return cls(
            tier=result.tier.value,
            started_at=result.started_at,
            expires_at=result.expires_at,
            is_active=result.is_active,
            remaining_days=result.remaining_days,
        )


class CampWechatPayNotifyAcknowledgeResponse(BaseModel):
    """微信支付回调协议要求的应答体。"""

    model_config = ConfigDict(frozen=True)

    code: str
    message: str
```

- [ ] 写 `presentation/router.py`：

```python
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from mz_ai_backend.core.protocol import ApiResponse, success_response
from mz_ai_backend.shared.wechat_pay import WechatPayNotifyInvalidException

from ..application import (
    CreateCampMembershipOrderUseCase,
    GetCampOrderStatusQuery,
    GetCampOrderStatusUseCase,
    GetMyCampMembershipQuery,
    GetMyCampMembershipUseCase,
    HandleCampWechatPayNotifyCommand,
    HandleCampWechatPayNotifyUseCase,
)
from ..infrastructure import (
    get_create_camp_membership_order_use_case,
    get_current_camp_account_id,
    get_get_camp_order_status_use_case,
    get_get_my_camp_membership_use_case,
    get_handle_camp_wechat_pay_notify_use_case,
)
from .schemas import (
    CampMembershipOrderStatusResponse,
    CampWechatPayNotifyAcknowledgeResponse,
    CreateCampMembershipOrderRequest,
    CreateCampMembershipOrderResponse,
    MyCampMembershipResponse,
)


router = APIRouter(prefix="/camp-membership", tags=["camp-membership"])


@router.post(
    "/orders",
    response_model=ApiResponse[CreateCampMembershipOrderResponse],
    summary="Create one ai-camp membership order",
)
async def create_camp_membership_order(
    request: CreateCampMembershipOrderRequest,
    account_id: Annotated[int, Depends(get_current_camp_account_id)],
    use_case: Annotated[
        CreateCampMembershipOrderUseCase,
        Depends(get_create_camp_membership_order_use_case),
    ],
) -> ApiResponse[CreateCampMembershipOrderResponse]:
    """为当前 ai-camp 账号创建一笔 Native 扫码订单。"""

    result = await use_case.execute(request.to_command(account_id=account_id))
    return success_response(data=CreateCampMembershipOrderResponse.from_result(result))


@router.get(
    "/orders/{order_no}",
    response_model=ApiResponse[CampMembershipOrderStatusResponse],
    summary="Get one ai-camp membership order",
)
async def get_camp_membership_order(
    order_no: str,
    account_id: Annotated[int, Depends(get_current_camp_account_id)],
    use_case: Annotated[GetCampOrderStatusUseCase, Depends(get_get_camp_order_status_use_case)],
) -> ApiResponse[CampMembershipOrderStatusResponse]:
    """返回当前账号一笔订单的状态。"""

    result = await use_case.execute(GetCampOrderStatusQuery(account_id=account_id, order_no=order_no))
    return success_response(data=CampMembershipOrderStatusResponse.from_result(result))


@router.get(
    "/me",
    response_model=ApiResponse[MyCampMembershipResponse],
    summary="Get current ai-camp membership snapshot",
)
async def get_my_camp_membership(
    account_id: Annotated[int, Depends(get_current_camp_account_id)],
    use_case: Annotated[GetMyCampMembershipUseCase, Depends(get_get_my_camp_membership_use_case)],
) -> ApiResponse[MyCampMembershipResponse]:
    """返回当前账号会员快照。"""

    result = await use_case.execute(GetMyCampMembershipQuery(account_id=account_id))
    return success_response(data=MyCampMembershipResponse.from_result(result))


@router.post(
    "/wechat-pay/notify",
    response_model=CampWechatPayNotifyAcknowledgeResponse,
    summary="Handle one ai-camp WeChat Pay callback",
)
async def handle_camp_wechat_pay_notify(
    request: Request,
    use_case: Annotated[
        HandleCampWechatPayNotifyUseCase,
        Depends(get_handle_camp_wechat_pay_notify_use_case),
    ],
) -> JSONResponse:
    """处理一次微信支付回调并返回微信协议应答。"""

    body = await request.body()
    headers = {key: value for key, value in request.headers.items()}
    try:
        await use_case.execute(HandleCampWechatPayNotifyCommand(headers=headers, body=body))
    except WechatPayNotifyInvalidException as exc:
        return JSONResponse(status_code=400, content={"code": "FAIL", "message": exc.message})
    payload = CampWechatPayNotifyAcknowledgeResponse(code="SUCCESS", message="success")
    return JSONResponse(status_code=200, content=payload.model_dump(mode="json"))
```

- [ ] 写 `presentation/__init__.py`：
```python
"""Presentation exports for ai-camp membership."""

from .router import router

__all__ = ["router"]
```

- [ ] 写 `camp_membership/__init__.py`：
```python
"""Public entrypoints for ai-camp membership."""

from .presentation import router

__all__ = ["router"]
```

- [ ] 在 `modules/__init__.py`：`from .camp_auth import router as camp_auth_router` 之后加 `from .camp_membership import router as camp_membership_router`，并把 `"camp_membership_router"` 加入 `__all__`。

- [ ] 在 `core/application.py`：`from ..modules import (...)` 列表里加 `camp_membership_router`，并在 `app.include_router(camp_auth_router, ...)` 之后加 `app.include_router(camp_membership_router, prefix=settings.api_prefix)`。

- [ ] 运行确认通过：`cd server && uv run python -m pytest api/tests/camp_membership/presentation/test_router.py -q`，期望 4 passed。再跑整模块：`cd server && uv run python -m pytest api/tests/camp_membership -q`。

- [ ] commit：
```
git add server/api/src/mz_ai_backend/modules/camp_membership server/api/src/mz_ai_backend/modules/__init__.py server/api/src/mz_ai_backend/core/application.py server/api/tests/camp_membership/presentation
git commit -m "feat(camp-membership): 表现层接口与路由注册"
```

---

### Task B7 — camp_auth `/me` 增量返回 membership（回归）

**Files:**
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/application/dtos.py`（`CampAccountSummary` 加可选 `membership`）
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/application/use_cases/get_current_camp_account.py`（读会员列填充）
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/application/ports/repositories.py`（新增读会员快照方法）
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/infrastructure/repositories.py`（实现该方法）
- Modify: `server/api/src/mz_ai_backend/modules/camp_auth/presentation/schemas.py`（`CampAuthAccountResponse` 加 `membership`）
- Test: `server/api/tests/camp_auth/test_me_membership.py`

> **实现注记（避免循环依赖）**：camp_auth 不应反向 import camp_membership（依赖方向是 camp_membership → camp_auth）。因此 camp_auth 的 `/me` **不复用** camp_membership 的快照类型，而是在 camp_auth 内自带一个轻量 `CampMembershipSummary`（tier/is_active/expires_at/remaining_days 四字段，纯字符串/原始类型），由 camp_auth 仓储直接读 `camp_accounts` 的会员列计算。等级取值用字符串 `'none'/'basic'/'premium'`，与 camp_membership 的 `CampMembershipTier.value` 对齐但不 import。

- [ ] 写失败测试 `tests/camp_auth/test_me_membership.py`（用依赖覆盖造一个返回带 membership 的 summary 的假用例，断言响应结构）：

```python
from __future__ import annotations

from datetime import datetime

from fastapi.testclient import TestClient

from mz_ai_backend import create_app
from mz_ai_backend.modules.camp_auth.application import CampAccountSummary
from mz_ai_backend.modules.camp_auth.application.dtos import CampMembershipSummary
from mz_ai_backend.modules.camp_auth.domain import CampAccountStatus
from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import (
    get_current_camp_access_token,
    get_get_current_camp_account_use_case,
)


class FakeUseCase:
    async def execute(self, query) -> CampAccountSummary:
        return CampAccountSummary(
            account_id=3001,
            username="camper",
            email=None,
            status=CampAccountStatus.ACTIVE,
            created_at=datetime(2026, 1, 1),
            membership=CampMembershipSummary(
                tier="basic",
                is_active=True,
                expires_at=datetime(2027, 1, 1),
                remaining_days=203,
            ),
        )


def _client() -> TestClient:
    app = create_app()
    app.dependency_overrides[get_current_camp_access_token] = lambda: "tok"
    app.dependency_overrides[get_get_current_camp_account_use_case] = lambda: FakeUseCase()
    return TestClient(app, raise_server_exceptions=False)


def test_camp_me_returns_membership() -> None:
    with _client() as client:
        response = client.get("/api/v1/camp-auth/me", headers={"Authorization": "Bearer tok"})
    body = response.json()
    assert response.status_code == 200
    assert body["data"]["membership"]["tier"] == "basic"
    assert body["data"]["membership"]["is_active"] is True
    assert body["data"]["membership"]["remaining_days"] == 203
```

- [ ] 运行确认失败：`cd server && uv run python -m pytest api/tests/camp_auth/test_me_membership.py -q`，期望 import 失败（`CampMembershipSummary` 不存在）。

- [ ] 在 `camp_auth/application/dtos.py`：新增 `CampMembershipSummary` 并给 `CampAccountSummary` 加可选 `membership`：

```python
class CampMembershipSummary(BaseModel):
    """登录态随账号带回的会员摘要（camp_auth 内自有，避免反向依赖 camp_membership）。"""

    model_config = ConfigDict(frozen=True)

    tier: str
    is_active: bool
    expires_at: datetime | None
    remaining_days: int
```

并修改 `CampAccountSummary`，在 `created_at: datetime` 之后加 `membership: CampMembershipSummary | None = None`。把 `CampMembershipSummary` 加入 `application/__init__.py` 的导入与 `__all__`。

- [ ] 在 `camp_auth/application/ports/repositories.py` 的 `CampAccountRepository` Protocol 增加方法：

```python
    async def get_membership_summary(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> "CampMembershipSummary":
        """读取账号会员列并返回登录态会员摘要。"""
```

并在文件顶部从 `..dtos` import `CampMembershipSummary`（该文件已 import `datetime`）。

- [ ] 在 `camp_auth/infrastructure/repositories.py` 的 `SqlAlchemyCampAccountRepository` 增加实现（直接读 `CampAccountModel` 会员列计算，等级用字符串）：

```python
    async def get_membership_summary(
        self,
        *,
        account_id: int,
        now: datetime,
    ) -> CampMembershipSummary:
        result = await self._session.execute(
            select(CampAccountModel).where(
                CampAccountModel.account_id == account_id,
                CampAccountModel.is_deleted.is_(False),
            )
        )
        model = result.scalar_one_or_none()
        if model is None:
            # 账号缺失时返回 none 摘要而非抛错：/me 已通过 token 校验，仅会员信息缺省。
            return CampMembershipSummary(tier="none", is_active=False, expires_at=None, remaining_days=0)
        tier = model.membership_tier or "none"
        expires_at = model.membership_expires_at
        is_active = tier != "none" and expires_at is not None and expires_at > now
        remaining_days = 0 if expires_at is None or expires_at <= now else max(0, (expires_at - now).days)
        return CampMembershipSummary(
            tier=tier,
            is_active=is_active,
            expires_at=expires_at,
            remaining_days=remaining_days,
        )
```

在该文件顶部 `from ..application import (...)` 增补 `CampMembershipSummary`。

- [ ] 在 `camp_auth/application/use_cases/get_current_camp_account.py`：`execute` 末尾构造 `CampAccountSummary` 前，调用仓储取 membership，并填入：

```python
        membership = await self._account_repository.get_membership_summary(
            account_id=account.account_id,
            now=now,
        )
        return CampAccountSummary(
            account_id=account.account_id,
            username=account.username,
            email=account.email,
            status=account.status,
            created_at=account.created_at,
            membership=membership,
        )
```

（`now` 在该方法里已定义为 `datetime.now(UTC).replace(tzinfo=None)`。）

- [ ] 在 `camp_auth/presentation/schemas.py`：新增 `CampMembershipResponse` 并给 `CampAuthAccountResponse` 加 `membership`：

```python
class CampMembershipResponse(BaseModel):
    """登录态会员摘要 HTTP 响应。"""

    model_config = ConfigDict(frozen=True)

    tier: str
    is_active: bool
    expires_at: datetime | None
    remaining_days: int
```

在 `CampAuthAccountResponse` 的 `created_at: datetime` 之后加 `membership: CampMembershipResponse | None`，并在 `from_summary` 里：

```python
        membership = (
            CampMembershipResponse(
                tier=summary.membership.tier,
                is_active=summary.membership.is_active,
                expires_at=summary.membership.expires_at,
                remaining_days=summary.membership.remaining_days,
            )
            if summary.membership is not None
            else None
        )
        return cls(
            account_id=_serialize_business_id(summary.account_id),
            username=summary.username,
            email=summary.email,
            status=summary.status.value,
            created_at=summary.created_at,
            membership=membership,
        )
```

- [ ] 运行确认通过：`cd server && uv run python -m pytest api/tests/camp_auth/test_me_membership.py -q`，期望 1 passed。再跑全量回归保证未破坏 camp_auth 既有用例：`cd server && uv run python -m pytest api/tests/camp_auth -q`。

> **实现注记**：`CampAccountSummary` 加了带默认值 `None` 的 `membership` 字段，refresh/exchange 等其他用例构造该 summary 时不传 membership 也能通过，`/me` 才填充——这保证 refresh/exchange 既有测试不回归。落地后若 refresh/exchange 也希望带 membership，可单独跟进，不在本次范围。

- [ ] commit：
```
git add server/api/src/mz_ai_backend/modules/camp_auth server/api/tests/camp_auth/test_me_membership.py
git commit -m "feat(camp-auth): /me 增量返回会员摘要 membership"
```

---

### Task M1 — 数据迁移 `0030_add_camp_membership.sql`

**Files:**
- Create: `server/api/migrations/0030_add_camp_membership.sql`
- Test: 迁移本身无 pytest；以「应用迁移 + 验证 SQL」人工/脚本验证。

- [ ] 写 `migrations/0030_add_camp_membership.sql`（幂等：`ADD COLUMN IF NOT EXISTS` / `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`；文件头注释写回滚）：

```sql
-- ai-camp 三档会员：camp_accounts 加会员列 + 新建 camp_membership_orders 表。
-- 纯新增、非破坏性；enrollment_* 列保留不动。
-- 回滚：
--   ALTER TABLE camp_accounts
--     DROP COLUMN IF EXISTS membership_tier,
--     DROP COLUMN IF EXISTS membership_started_at,
--     DROP COLUMN IF EXISTS membership_expires_at;
--   DROP TABLE IF EXISTS camp_membership_orders;
-- 注意：本仓库迁移按文件名记录于 schema_migrations，无独立 down 文件；回滚需手工执行上述语句并删除对应 schema_migrations 行。

ALTER TABLE camp_accounts
    ADD COLUMN IF NOT EXISTS membership_tier VARCHAR(16) NOT NULL DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS membership_started_at TIMESTAMP WITHOUT TIME ZONE NULL,
    ADD COLUMN IF NOT EXISTS membership_expires_at TIMESTAMP WITHOUT TIME ZONE NULL;

CREATE INDEX IF NOT EXISTS idx_camp_accounts_membership_expires_at
    ON camp_accounts (membership_expires_at);

CREATE TABLE IF NOT EXISTS camp_membership_orders (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    sku VARCHAR(32) NOT NULL,
    amount_fen INTEGER NOT NULL CHECK (amount_fen > 0),
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    code_url TEXT NULL,
    transaction_id VARCHAR(64) NULL,
    trade_state VARCHAR(32) NULL,
    paid_at TIMESTAMP WITHOUT TIME ZONE NULL,
    membership_applied BOOLEAN NOT NULL DEFAULT FALSE,
    membership_started_at TIMESTAMP WITHOUT TIME ZONE NULL,
    membership_expires_at TIMESTAMP WITHOUT TIME ZONE NULL,
    notify_payload TEXT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_camp_membership_orders_transaction_id
    ON camp_membership_orders (transaction_id)
    WHERE transaction_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_camp_membership_orders_account_id
    ON camp_membership_orders (account_id);
CREATE INDEX IF NOT EXISTS idx_camp_membership_orders_status
    ON camp_membership_orders (status);
CREATE INDEX IF NOT EXISTS idx_camp_membership_orders_created_at
    ON camp_membership_orders (created_at);
```

> **实现注记**：`order_no` / `order_id` 唯一约束直接由 `UNIQUE` 列约束保证（与 0017 一致）。`transaction_id` 用部分唯一索引（允许多行 NULL）。`camp_membership_orders.id` 用 `BIGSERIAL`，但 ORM 模型用 `Identity()`——与 0017/account_membership 的差异一致（既有项目接受这种 BIGSERIAL vs Identity 的等价写法，因为 ORM 不负责建表，建表以 SQL 为准）。

- [ ] 应用迁移并验证（开发库）：
```
cd server && uv run python api/migrations/run_sql_migrations.py
```
期望：无报错；`schema_migrations` 出现 `0030_add_camp_membership.sql` 一行。

- [ ] 验证 SQL（确认列/表/约束）。用 psql 或 `uv run python` 执行下列查询并核对：
```sql
-- 1) 新列存在且默认 'none'
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'camp_accounts'
  AND column_name IN ('membership_tier', 'membership_started_at', 'membership_expires_at');

-- 2) 存量行 membership_tier 均为 'none'
SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE membership_tier = 'none') AS none_count
FROM camp_accounts;

-- 3) 新表存在
SELECT to_regclass('public.camp_membership_orders') IS NOT NULL AS table_exists;

-- 4) order_no 唯一约束生效
SELECT COUNT(*) AS uniq_order_no
FROM pg_indexes
WHERE tablename = 'camp_membership_orders' AND indexdef ILIKE '%UNIQUE%order_no%';
```
期望：(1) 三列均在、`membership_tier` 默认 `'none'`、`NOT NULL`；(2) `total == none_count`；(3) `table_exists = true`；(4) `uniq_order_no >= 1`。

- [ ] 幂等性验证：再次执行 `run_sql_migrations.py`，因 `schema_migrations` 已记录，迁移被跳过（不重复执行）；手工对单条 `ALTER ... ADD COLUMN IF NOT EXISTS` 重跑也应无错（IF NOT EXISTS 保证）。

> **待确认点（spec 6 待确认）**：若库中已有 `enrollment_status='enrolled'` 的真实 camp 账号是否需映射等级。默认**不映射**，全部按 `none` 起算。落地前执行 `SELECT enrollment_status, COUNT(*) FROM camp_accounts GROUP BY 1;` 查存量并向用户确认。

- [ ] commit：
```
git add server/api/migrations/0030_add_camp_membership.sql
git commit -m "feat(camp-membership): 数据迁移加会员列与订单表（幂等）"
```

---

### Task F1 — 前端类型与 normalizeAccount 解析 membership

**Files:**
- Modify: `website-aicamp/src/features/auth/types.ts`
- Modify: `website-aicamp/src/features/auth/server/backend.ts`
- Create: `website-aicamp/src/features/membership/types.ts`
- 验证：`cd website-aicamp && pnpm run build`（类型检查）+ 浏览器看 `/api/auth/me` 返回带 membership。

- [ ] 在 `features/auth/types.ts`：新增 `CampMembership` 类型并给 `AuthAccount` 加字段：

```ts
export type CampMembershipTier = 'none' | 'basic' | 'premium'

export type CampMembership = {
  tier: CampMembershipTier
  is_active: boolean
  expires_at: string | null
  remaining_days: number
}

export type AuthAccount = {
  account_id: string
  username: string
  email: string | null
  status: 'active' | 'disabled'
  created_at: string
  membership: CampMembership | null
}
```

- [ ] 在 `features/auth/server/backend.ts`：扩展 `UpstreamAuthAccount` 并在 `normalizeAccount` 解析 membership：

```ts
type UpstreamCampMembership = {
  tier?: unknown
  is_active?: unknown
  expires_at?: unknown
  remaining_days?: unknown
}

type UpstreamAuthAccount = {
  account_id?: unknown
  username?: unknown
  email?: unknown
  status?: unknown
  created_at?: unknown
  membership?: unknown
}

function normalizeMembership(raw: unknown): CampMembership | null {
  if (!raw || typeof raw !== 'object') return null
  const m = raw as UpstreamCampMembership
  const tier = m.tier === 'basic' || m.tier === 'premium' ? m.tier : 'none'
  return {
    tier,
    is_active: m.is_active === true,
    expires_at: typeof m.expires_at === 'string' ? m.expires_at : null,
    remaining_days:
      typeof m.remaining_days === 'number' && Number.isFinite(m.remaining_days)
        ? m.remaining_days
        : 0,
  }
}

function normalizeAccount(raw: UpstreamAuthAccount): AuthAccount {
  return {
    account_id: asString(raw.account_id),
    username: asString(raw.username),
    email: asString(raw.email) || null,
    status: raw.status === 'disabled' ? 'disabled' : 'active',
    created_at: asString(raw.created_at),
    membership: normalizeMembership(raw.membership),
  }
}
```

并在文件顶部 import 增补 `CampMembership`：`import type { AuthAccount, AuthPayload, CampMembership, WechatLoginSession, WechatLoginSessionStatus } from '../types'`。

- [ ] 创建 `features/membership/types.ts`：

```ts
export type CampMembershipSku = 'annual_basic' | 'annual_premium'

export type CampMembershipTier = 'none' | 'basic' | 'premium'

export type CampOrderStatus = 'pending' | 'paid' | 'closed'

export type CreateCampOrderResponse = {
  order_no: string
  sku: string
  amount_fen: number
  status: CampOrderStatus
  code_url: string
  qr_expires_at: string
}

export type CampOrderStatusResponse = {
  order_no: string
  sku: string
  amount_fen: number
  status: CampOrderStatus
  code_url: string | null
  paid_at: string | null
  membership_applied: boolean
  membership_started_at: string | null
  membership_expires_at: string | null
}

export type MyCampMembershipResponse = {
  tier: CampMembershipTier
  started_at: string | null
  expires_at: string | null
  is_active: boolean
  remaining_days: number
}

export type FrontendApiError = {
  error: {
    code: string
    message: string
  }
}
```

- [ ] 验证类型：`cd website-aicamp && pnpm install && pnpm run build`，期望编译通过（normalizeAccount 处现在要求 membership，确保所有调用点都走 normalizeAccount，不会有别处手工构造 AuthAccount 缺字段——若有，编译会报错，按报错补 `membership: null`）。

- [ ] commit：
```
git add website-aicamp/src/features/auth/types.ts website-aicamp/src/features/auth/server/backend.ts website-aicamp/src/features/membership/types.ts
git commit -m "feat(camp-membership): 前端 AuthAccount 增 membership 与会员类型"
```

---

### Task F2 — 前端 proxy 路由（下单/查单/查会员）

**Files:**
- Create: `website-aicamp/src/app/api/camp-membership/_shared.ts`
- Create: `website-aicamp/src/app/api/camp-membership/orders/route.ts`
- Create: `website-aicamp/src/app/api/camp-membership/orders/[orderNo]/route.ts`
- Create: `website-aicamp/src/app/api/camp-membership/me/route.ts`
- 验证：`pnpm run build` + 登录后浏览器 `POST /api/camp-membership/orders` 返回 code_url。

- [ ] 写 `_shared.ts`（镜像 website 的 `api/membership/_shared.ts`，但复用 website-aicamp 的 auth 模块路径；上游路径前缀改 `/camp-membership`）：

```ts
import { NextResponse } from 'next/server'

import { WebsiteAuthError } from '@/features/auth/server/backend'
import { readAuthCookies } from '@/features/auth/server/cookies'
import { getCampAuthState } from '@/features/auth/server/session'
import type { ApiErrorPayload } from '@/features/auth/types'

const DEFAULT_DEV_API_BASE_URL = 'http://127.0.0.1:8000/api/v1'
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://api.weelume.com/api/v1'
const REQUEST_TIMEOUT_MS = 8000
const SUCCESS_CODE = 'COMMON.SUCCESS'

type UpstreamEnvelope<T> = {
  code?: unknown
  message?: unknown
  data?: T
}

export function membershipErrorResponse(error: unknown): NextResponse<ApiErrorPayload> {
  if (error instanceof WebsiteAuthError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    )
  }
  return NextResponse.json(
    { error: { code: 'membership_internal_error', message: '会员请求处理失败' } },
    { status: 500 },
  )
}

function trimTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, '')
}

export function resolveMembershipApiBaseUrl(): string {
  const explicit = process.env.CAMP_API_BASE_URL?.trim()
  if (explicit) return trimTrailingSlashes(explicit)

  const internalOrigin = process.env.INTERNAL_API_URL?.trim()
  if (internalOrigin) return `${trimTrailingSlashes(internalOrigin)}/api/v1`

  return process.env.NODE_ENV === 'production'
    ? DEFAULT_PRODUCTION_API_BASE_URL
    : DEFAULT_DEV_API_BASE_URL
}

export async function getAccessTokenOrThrow(): Promise<string> {
  const state = await getCampAuthState()
  if (!state.authenticated) {
    throw new WebsiteAuthError('请先登录后再开通会员', { code: 'auth_required', status: 401 })
  }
  const snapshot = await readAuthCookies()
  if (!snapshot.accessToken) {
    throw new WebsiteAuthError('登录状态无效，请重新登录', { code: 'auth_required', status: 401 })
  }
  return snapshot.accessToken
}

export async function proxyMembershipRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<NextResponse<T | ApiErrorPayload>> {
  try {
    const accessToken = await getAccessTokenOrThrow()
    const response = await fetch(`${resolveMembershipApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers ?? {}),
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: 'no-store',
    })

    const envelope = (await response.json()) as UpstreamEnvelope<T>
    if (!response.ok || envelope.code !== SUCCESS_CODE || envelope.data === undefined) {
      return NextResponse.json(
        {
          error: {
            code: typeof envelope.code === 'string' ? envelope.code : 'membership_upstream_error',
            message: typeof envelope.message === 'string' ? envelope.message : '会员服务请求失败',
          },
        },
        { status: response.status },
      )
    }
    return NextResponse.json(envelope.data)
  } catch (error) {
    return membershipErrorResponse(error)
  }
}
```

> **实现注记**：website-aicamp 的 base url 环境变量是 `CAMP_API_BASE_URL`（见 auth/server/backend.ts），不是 website 的 `WEBSITE_API_BASE_URL`——已对齐。

- [ ] 写 `orders/route.ts`：

```ts
import { NextRequest } from 'next/server'

import { membershipErrorResponse, proxyMembershipRequest } from '../_shared'
import type { CreateCampOrderResponse } from '@/features/membership/types'

export const dynamic = 'force-dynamic'

const VALID_SKUS = ['annual_basic', 'annual_premium'] as const
type ValidSku = (typeof VALID_SKUS)[number]

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown
    const sku: unknown =
      body && typeof body === 'object' && 'sku' in body ? (body as Record<string, unknown>).sku : undefined
    if (!VALID_SKUS.includes(sku as ValidSku)) {
      return Response.json({ error: { code: 'invalid_sku', message: '无效的会员 SKU' } }, { status: 400 })
    }
    return proxyMembershipRequest<CreateCampOrderResponse>('/camp-membership/orders', {
      method: 'POST',
      body: JSON.stringify({ sku }),
    })
  } catch {
    return membershipErrorResponse(new Error('请求体解析失败'))
  }
}
```

- [ ] 写 `orders/[orderNo]/route.ts`：

```ts
import { proxyMembershipRequest } from '../../_shared'
import type { CampOrderStatusResponse } from '@/features/membership/types'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: Promise<{ orderNo: string }> }) {
  const { orderNo } = await context.params
  return proxyMembershipRequest<CampOrderStatusResponse>(
    `/camp-membership/orders/${encodeURIComponent(orderNo)}`,
  )
}
```

- [ ] 写 `me/route.ts`：

```ts
import { proxyMembershipRequest } from '../_shared'
import type { MyCampMembershipResponse } from '@/features/membership/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  return proxyMembershipRequest<MyCampMembershipResponse>('/camp-membership/me')
}
```

- [ ] 验证：`cd website-aicamp && pnpm run build` 通过；启动 `pnpm run dev`（端口 3100）+ 后端运行，登录后用浏览器或 curl `POST /api/camp-membership/orders {"sku":"annual_basic"}` 应返回 `code_url`（截图/日志留证）。

- [ ] commit：
```
git add website-aicamp/src/app/api/camp-membership
git commit -m "feat(camp-membership): 前端会员下单/查单/查会员代理路由"
```

---

### Task F3 — 前端 api 封装、轮询 hook、二维码弹窗

**Files:**
- Create: `website-aicamp/src/features/membership/api.ts`
- Create: `website-aicamp/src/features/membership/usePollMembershipOrder.ts`
- Create: `website-aicamp/src/features/membership/PaymentQrCodeModal.tsx`
- 依赖：`qrcode.react`（**需用户批准**，见实现注记 7）
- 验证：浏览器跑通下单→展示二维码→轮询。

- [ ] **依赖确认**：执行前向用户确认引入 `qrcode.react`。批准后：`cd website-aicamp && pnpm add qrcode.react`（同时 framer-motion 已在依赖中，可用于弹窗动画）。若不批准，停下与用户讨论替代方案，不要自行引入其他库。

- [ ] 写 `api.ts`（镜像 website 的 membership/api.ts，改 SKU 类型与路径）：

```ts
import type { CampOrderStatusResponse, CampMembershipSku, CreateCampOrderResponse, MyCampMembershipResponse } from './types'

class MembershipApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, options: { status: number; code: string }) {
    super(message)
    this.name = 'MembershipApiError'
    this.status = options.status
    this.code = options.code
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })
  const payload = (await response.json()) as unknown
  if (!response.ok) {
    const error =
      payload && typeof payload === 'object' && 'error' in payload
        ? (payload as { error?: { code?: string; message?: string } }).error
        : undefined
    throw new MembershipApiError(error?.message ?? '会员服务请求失败', {
      status: response.status,
      code: error?.code ?? 'membership_request_failed',
    })
  }
  return payload as T
}

export async function createCampMembershipOrder(sku: CampMembershipSku): Promise<CreateCampOrderResponse> {
  return requestJson<CreateCampOrderResponse>('/api/camp-membership/orders', {
    method: 'POST',
    body: JSON.stringify({ sku }),
  })
}

export async function getCampMembershipOrder(orderNo: string): Promise<CampOrderStatusResponse> {
  return requestJson<CampOrderStatusResponse>(`/api/camp-membership/orders/${encodeURIComponent(orderNo)}`)
}

export async function getMyCampMembership(): Promise<MyCampMembershipResponse> {
  return requestJson<MyCampMembershipResponse>('/api/camp-membership/me')
}

export { MembershipApiError }
```

- [ ] 写 `usePollMembershipOrder.ts`（与 website 同名文件逐行一致，仅把 `getMembershipOrder`→`getCampMembershipOrder`、`OrderStatusResponse`→`CampOrderStatusResponse`）。完整内容参考 website `usePollMembershipOrder.ts`（退避数组 `[1000,1000,2000,2000,3000,5000]`、过期/closed/paid/error 终态、连续 3 次错误终止）；import 改为：
```ts
import { getCampMembershipOrder } from './api'
import type { CampOrderStatusResponse } from './types'
```
其余逻辑不变（把类型别名里 `OrderStatusResponse` 全部替换为 `CampOrderStatusResponse`，调用 `getMembershipOrder` 替换为 `getCampMembershipOrder`）。

- [ ] 写 `PaymentQrCodeModal.tsx`（镜像 website 同名，改：成功后不跳 `/account` 而是回调 `onPaid()` 刷新登录态；用 `QRCodeSVG` 渲染 `code_url`；文案去英文品牌）：

```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

import { usePollMembershipOrder } from './usePollMembershipOrder'
import type { CreateCampOrderResponse } from './types'

type PaymentQrCodeModalProps = {
  open: boolean
  order: CreateCampOrderResponse | null
  onClose: () => void
  onRetry: () => void
  onPaid: () => void
}

function formatCurrency(amountFen: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: 0,
  }).format(amountFen / 100)
}

function formatCountdown(expiresAt: string | null, nowMs: number): string {
  if (!expiresAt) return '00:00'
  const ts = expiresAt.endsWith('Z') || expiresAt.includes('+') ? expiresAt : `${expiresAt}Z`
  const remainingMs = Math.max(0, new Date(ts).getTime() - nowMs)
  const totalSeconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function PaymentQrCodeModal({ open, order, onClose, onRetry, onPaid }: PaymentQrCodeModalProps) {
  const [nowMs, setNowMs] = useState(() => Date.now())
  // qr_expires_at 为 naive UTC，轮询 hook 与倒计时都需按 UTC 解析；统一加 Z。
  const qrExpiresAtUtc = order?.qr_expires_at
    ? order.qr_expires_at.endsWith('Z') || order.qr_expires_at.includes('+')
      ? order.qr_expires_at
      : `${order.qr_expires_at}Z`
    : null
  const pollState = usePollMembershipOrder({
    orderNo: order?.order_no ?? null,
    qrExpiresAt: qrExpiresAtUtc,
    enabled: open && Boolean(order),
  })

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !order) return
    const id = window.setInterval(() => setNowMs(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [open, order])

  // 支付成功：刷新登录态（拉取带新等级的 /me），由父组件 onPaid 处理。
  useEffect(() => {
    if (pollState.status !== 'paid') return
    const id = window.setTimeout(() => onPaid(), 1200)
    return () => window.clearTimeout(id)
  }, [pollState.status, onPaid])

  const countdown = formatCountdown(order?.qr_expires_at ?? null, nowMs)

  const stateLabel = useMemo(() => {
    if (!order) return '正在创建订单'
    if (pollState.status === 'paid') return '支付成功'
    if (pollState.status === 'closed') return '订单已关闭'
    if (pollState.status === 'expired') return '二维码已过期'
    if (pollState.status === 'error') return '查询失败'
    return '等待微信支付'
  }, [order, pollState.status])

  const terminalMessage =
    pollState.status === 'paid'
      ? '会员已开通，正在刷新登录状态…'
      : pollState.status === 'closed' || pollState.status === 'expired' || pollState.status === 'error'
        ? pollState.error
        : null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="camp-payment-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 bg-canvas/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="camp-payment-panel"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md rounded-[8px] border border-hairline bg-surface p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] sm:p-6">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface/80 text-muted transition-colors hover:text-ink"
                aria-label="关闭"
              >
                <span aria-hidden className="text-lg leading-none">×</span>
              </button>

              <div className="pr-8">
                <h2 className="text-2xl font-semibold text-ink">{stateLabel}</h2>
                {order && (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    订单 {order.order_no} · {formatCurrency(order.amount_fen)}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-center">
                <div className="flex h-64 w-64 items-center justify-center rounded-[8px] border border-hairline bg-white p-4">
                  {order?.code_url && pollState.status !== 'paid' ? (
                    <QRCodeSVG value={order.code_url} size={220} level="M" />
                  ) : (
                    <div className="text-center text-sm text-muted">
                      {pollState.status === 'paid' ? '支付已完成' : '订单生成中'}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 min-h-14 rounded-[8px] border border-hairline bg-canvas/45 px-4 py-3">
                {terminalMessage ? (
                  <p className="text-sm leading-6 text-ink-soft">{terminalMessage}</p>
                ) : (
                  <div className="flex items-center justify-between gap-4 text-sm text-ink-soft">
                    <span>请使用微信扫码支付</span>
                    <span className="font-mono tabular text-accent-2">{countdown}</span>
                  </div>
                )}
              </div>

              {pollState.status !== 'paid' && (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={onRetry}
                    disabled={pollState.status === 'polling'}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-[6px] border border-hairline-strong bg-surface px-4 text-sm font-medium text-ink transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    重新生成
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-[6px] border border-hairline bg-canvas px-4 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                  >
                    关闭
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

> **实现注记**：`QRCodeSVG` 的 `includeMargin` 在新版 `qrcode.react` 已弃用为 `marginSize`；按安装到的版本调整（若用旧版保留 `includeMargin`，新版用 `marginSize={4}` 或省略）。`code_url` 是 `weixin://wxpay/native...`，可被微信扫码识别。

- [ ] 验证：`pnpm run build` 通过；`pnpm run dev` 下登录后触发下单，弹窗出现二维码、倒计时走动、轮询请求发出（Network 面板留证）。

- [ ] commit：
```
git add website-aicamp/src/features/membership/api.ts website-aicamp/src/features/membership/usePollMembershipOrder.ts website-aicamp/src/features/membership/PaymentQrCodeModal.tsx website-aicamp/package.json website-aicamp/pnpm-lock.yaml
git commit -m "feat(camp-membership): 前端会员 API/轮询/二维码弹窗"
```

---

### Task F4 — 前端门禁工具 `requireTier` + 等级徽章

**Files:**
- Create: `website-aicamp/src/features/membership/require-tier.ts`
- Create: `website-aicamp/src/features/membership/MembershipBadge.tsx`
- Modify: `website-aicamp/src/components/layout/AccountMenu.tsx`
- 验证：登录后顶栏账户区显示等级徽章 + 到期。

- [ ] 写 `require-tier.ts`（纯函数门禁工具，与后端 `tier_satisfies` 语义一致；过期回落 NONE）：

```ts
import type { AuthAccount, CampMembershipTier } from '@/features/auth/types'

const TIER_ORDER: Record<CampMembershipTier, number> = {
  none: 0,
  basic: 1,
  premium: 2,
}

/** 账号「有效等级」：会员存在且 is_active 才取其 tier，否则回落 none。 */
export function effectiveTier(account: AuthAccount | null): CampMembershipTier {
  const m = account?.membership
  if (!m || !m.is_active) return 'none'
  return m.tier
}

/** 当前账号有效等级是否满足所需等级（高档满足低档）。 */
export function requireTier(account: AuthAccount | null, required: CampMembershipTier): boolean {
  return TIER_ORDER[effectiveTier(account)] >= TIER_ORDER[required]
}
```

- [ ] 写 `MembershipBadge.tsx`（横向线性展示，无嵌套卡片；徽章 + 到期文字）：

```tsx
import type { AuthAccount } from '@/features/auth/types'
import { effectiveTier } from './require-tier'

const TIER_LABEL: Record<string, string> = {
  none: '普通',
  basic: '基础',
  premium: '高级',
}

function formatDate(value: string | null): string {
  if (!value) return ''
  const ts = value.endsWith('Z') || value.includes('+') ? value : `${value}Z`
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

export function MembershipBadge({ account }: { account: AuthAccount }) {
  const tier = effectiveTier(account)
  const label = TIER_LABEL[tier] ?? '普通'
  const expiresAt = account.membership?.is_active ? account.membership.expires_at : null

  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
      <span
        className={[
          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
          tier === 'premium'
            ? 'border border-amber-300/40 bg-amber-300/10 text-amber-200'
            : tier === 'basic'
              ? 'border border-hairline bg-canvas/60 text-ink-soft'
              : 'border border-hairline bg-transparent text-muted',
        ].join(' ')}
      >
        {label}会员
      </span>
      {expiresAt && <span className="text-[11px] text-muted">{formatDate(expiresAt)} 到期</span>}
    </span>
  )
}
```

- [ ] 修改 `AccountMenu.tsx`：在用户名标签旁插入 `MembershipBadge`（保持单行横向，无新增容器层级）：

```tsx
'use client'

import type { AuthState } from '@/features/auth/types'
import { MembershipBadge } from '@/features/membership/MembershipBadge'

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
      <MembershipBadge account={authState.account} />
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

- [ ] 验证：`pnpm run build` 通过；`pnpm run dev` 下用已开通会员账号登录，顶栏显示「基础会员 / 高级会员 + 到期日」；未开通显示「普通会员」无到期。截图核对视觉（线性、无卡片堆叠）。

- [ ] commit：
```
git add website-aicamp/src/features/membership/require-tier.ts website-aicamp/src/features/membership/MembershipBadge.tsx website-aicamp/src/components/layout/AccountMenu.tsx
git commit -m "feat(camp-membership): 前端门禁工具 requireTier 与等级徽章"
```

---

### Task F5 — 购买页（三档横向对比 + 下单 + 成功刷新登录态）

**Files:**
- Create: `website-aicamp/src/features/membership/MembershipPurchasePanel.tsx`
- Create: `website-aicamp/src/app/membership/page.tsx`
- 验证：访问 `/membership` 走完选档→下单→二维码→（支付）→刷新登录态全流程。

- [ ] 写 `MembershipPurchasePanel.tsx`（client 组件：横向三档对比 + 选档下单；登录引导；成功后 `router.refresh()` 刷新 server 渲染的登录态）。要点：
  - 入参：`authenticated: boolean`、`membership: MyCampMembershipResponse | null`。
  - 三档：普通（当前态展示，不可购买）/ 基础(annual_basic, ¥1999)/ 高级(annual_premium, ¥3999)。
  - 「已有有效会员」时所有购买按钮禁用并提示「会员有效期内不可重复购买」（对应后端 `CAMP_MEMBERSHIP.ALREADY_ACTIVE`）。
  - 未登录点击购买 → `router.push('/login?next=/membership')`。
  - 下单成功 → 打开 `PaymentQrCodeModal`，其 `onPaid` 回调里 `router.refresh()` + 关闭弹窗。
  - 视觉：横向并排 + 线性留白，避免卡片堆叠/嵌套容器（用分隔线 + 列对齐，不要每档一个带阴影的大卡片再嵌套）。

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { createCampMembershipOrder, MembershipApiError } from './api'
import { PaymentQrCodeModal } from './PaymentQrCodeModal'
import type { CampMembershipSku, CreateCampOrderResponse, MyCampMembershipResponse } from './types'

type TierColumn = {
  sku: CampMembershipSku | null
  name: string
  priceYuan: number | null
  features: string[]
}

const COLUMNS: TierColumn[] = [
  { sku: null, name: '普通', priceYuan: null, features: ['注册即得', '可浏览公开内容'] },
  { sku: 'annual_basic', name: '基础', priceYuan: 1999, features: ['零基础 AI 编程全章', '一年有效期'] },
  { sku: 'annual_premium', name: '高级', priceYuan: 3999, features: ['含基础全部', 'AI 编程专家进阶', '一年有效期'] },
]

type Props = {
  authenticated: boolean
  membership: MyCampMembershipResponse | null
}

export function MembershipPurchasePanel({ authenticated, membership }: Props) {
  const router = useRouter()
  const [order, setOrder] = useState<CreateCampOrderResponse | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submittingSku, setSubmittingSku] = useState<CampMembershipSku | null>(null)
  const [error, setError] = useState<string | null>(null)

  const hasActive = membership?.is_active === true

  const handlePurchase = async (sku: CampMembershipSku) => {
    if (!authenticated) {
      router.push('/login?next=/membership')
      return
    }
    setSubmittingSku(sku)
    setError(null)
    try {
      const created = await createCampMembershipOrder(sku)
      setOrder(created)
      setModalOpen(true)
    } catch (e) {
      if (e instanceof MembershipApiError && e.status === 401) {
        router.push('/login?next=/membership')
        return
      }
      setError(e instanceof Error ? e.message : '创建订单失败，请稍后重试')
    } finally {
      setSubmittingSku(null)
    }
  }

  const handlePaid = () => {
    setModalOpen(false)
    // 刷新 server 渲染的登录态（layout 的 getCampAuthState 重新拉 /me，带回新等级）。
    router.refresh()
  }

  return (
    <>
      <div className="grid gap-px overflow-hidden rounded-[8px] border border-hairline bg-hairline sm:grid-cols-3">
        {COLUMNS.map((col) => {
          const isCurrent =
            (col.sku === null && (!membership || membership.tier === 'none' || !hasActive)) ||
            (col.sku === 'annual_basic' && hasActive && membership?.tier === 'basic') ||
            (col.sku === 'annual_premium' && hasActive && membership?.tier === 'premium')
          return (
            <div key={col.name} className="flex flex-col gap-4 bg-canvas p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-ink">{col.name}</span>
                {isCurrent && <span className="text-[11px] text-accent-2">当前</span>}
              </div>
              <p className="text-3xl font-semibold text-ink">
                {col.priceYuan === null ? '免费' : `¥${col.priceYuan}`}
                {col.priceYuan !== null && <span className="ml-1 text-sm text-muted">/ 年</span>}
              </p>
              <ul className="space-y-2 text-sm text-ink-soft">
                {col.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-accent-2">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {col.sku !== null && (
                <button
                  type="button"
                  onClick={() => handlePurchase(col.sku as CampMembershipSku)}
                  disabled={hasActive || submittingSku !== null}
                  className="mt-auto inline-flex h-11 items-center justify-center rounded-[6px] bg-ink px-4 text-sm font-medium text-canvas transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submittingSku === col.sku ? '创建订单中…' : hasActive ? '会员有效期内' : '立即开通'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {hasActive && (
        <p className="mt-4 text-xs text-muted">会员有效期内不支持升级或重复购买，到期后可再次开通。</p>
      )}
      {error && (
        <p className="mt-4 rounded-[6px] border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">{error}</p>
      )}

      <PaymentQrCodeModal
        open={modalOpen}
        order={order}
        onClose={() => setModalOpen(false)}
        onRetry={() => order && handlePurchase(order.sku as CampMembershipSku)}
        onPaid={handlePaid}
      />
    </>
  )
}
```

> **实现注记**：`grid gap-px bg-hairline` + 列内 `bg-canvas` 用 1px 间隙线分隔三列，符合「线性留白、避免卡片堆叠/嵌套容器」的视觉偏好。`onRetry` 用 `order.sku`（string）转回 `CampMembershipSku`——`order.sku` 来自后端是 `'annual_basic'|'annual_premium'`，类型断言安全。

- [ ] 写 `app/membership/page.tsx`（服务端取 authState 与会员快照，传给 client 面板）：

```tsx
import type { Metadata } from 'next'

import { getCampAuthState } from '@/features/auth/server/session'
import { MembershipPurchasePanel } from '@/features/membership/MembershipPurchasePanel'
import type { MyCampMembershipResponse } from '@/features/membership/types'

export const metadata: Metadata = {
  title: '开通会员 · 微域生光',
}

export const dynamic = 'force-dynamic'

export default async function MembershipPage() {
  const authState = await getCampAuthState()
  // 登录态里已含 membership（camp_auth /me 带回），直接用，避免再发一次请求。
  const membership: MyCampMembershipResponse | null = authState.authenticated
    ? authState.account.membership
      ? {
          tier: authState.account.membership.tier,
          started_at: null,
          expires_at: authState.account.membership.expires_at,
          is_active: authState.account.membership.is_active,
          remaining_days: authState.account.membership.remaining_days,
        }
      : null
    : null

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-ink sm:text-4xl">选择你的会员等级</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        基础档覆盖零基础 AI 编程；高级档包含基础全部并进阶到 AI 编程专家。一年有效期，微信扫码支付。
      </p>
      <div className="mt-10">
        <MembershipPurchasePanel
          authenticated={authState.authenticated}
          membership={membership}
        />
      </div>
    </section>
  )
}
```

> **实现注记**：购买页直接复用 layout 已拉到的登录态 membership（`authState.account.membership`），不再发 `/api/camp-membership/me`。若担心 layout 与购买页 authState 不一致，可改为购买页内 `await fetch(...camp-membership/me)`，但当前实现更省一次请求。`started_at` 在登录态摘要里没有（camp_auth `/me` 的 membership 不含 started_at），故置 `null`；购买页不展示 started_at，无影响。

- [ ] 验证：`pnpm run build` 通过；`pnpm run dev` 下访问 `/membership`：未登录点购买跳登录；登录后选基础/高级出二维码；模拟支付成功后（或后端置 paid）`router.refresh()` 后徽章变更。截图核对三档横向布局。

- [ ] commit：
```
git add website-aicamp/src/features/membership/MembershipPurchasePanel.tsx website-aicamp/src/app/membership/page.tsx
git commit -m "feat(camp-membership): 会员购买页（三档对比+下单+成功刷新登录态）"
```

---

### Task Z1 — 全量回归与收尾

**Files:** 无新增（仅运行验证）

- [ ] 后端全量：`cd server && uv run python -m pytest api/tests/camp_membership api/tests/camp_auth -q`，期望全部 passed（DB 仓储测试在无 PG 时 skipped 可接受）。
- [ ] 后端全仓回归（确认未破坏既有模块）：`cd server && uv run python -m pytest api/tests -q`。
- [ ] 前端：`cd website-aicamp && pnpm run build`，期望编译通过。
- [ ] 启动前后端联调：后端 `cd server && uv run python -m uvicorn main:app --reload --port 8000`；前端 `cd website-aicamp && pnpm run dev`。浏览器走 登录 → `/membership` 下单 → 二维码 → 轮询 → （后端置 paid）→ 徽章刷新，全链路截图留证。
- [ ] commit（如有 lint/格式微调）：
```
git commit -m "chore(camp-membership): 全量回归与联调收尾"
```

---

## Self-Review 覆盖核对表（spec 章节 → Task）

| spec 章节 | 要求 | 落实 Task |
|---|---|---|
| §2 架构决策 | 新建独立 `camp_membership` 限界上下文，镜像 account_membership 分层 | A1–A8（domain/app/infra/presentation 齐全） |
| §3.1 枚举 | NONE<BASIC<PREMIUM、SKU 映射、OrderStatus | A1（entities.py） |
| §3.2 快照 | account_id/tier/started_at/expires_at/is_active/remaining_days；is_active 公式；过期回落 NONE 保留历史 tier | A1（CampMembershipSnapshot）+ A6（仓储 get_membership_snapshot） |
| §3.3 有效期与购买资格 | 365 天/单；仅无有效会员可下单；有效期内拒单；不升级不续费 | A4（下单资格）+ A6（落账 365 天覆盖，无续费） |
| §3.4 enrollment reconcile | membership_tier 权威；enrollment_status 保留不动 | A6（账号列）+ M1（迁移保留 enrollment_*） |
| §4 接口 | POST /orders、GET /orders/{no}、GET /me、POST /wechat-pay/notify，camp token 鉴权 | A8（router）+ A6（get_current_camp_account_id 复用 camp_auth 鉴权） |
| §4 支付落账 | 锁账号行、membership_applied 幂等、写 tier+365 天+transaction_id；异常不静默 | A6（process_wechat_pay_notification）+ A5（回调用例） |
| §4 camp_auth /me 增量 | 登录态账号增 membership（tier/is_active/expires_at/remaining_days），读同库列无跨服务 | B7 |
| §5.1 后端门禁 | 领域 tier_satisfies；表现层 require_camp_tier；不满足 CAMP_MEMBERSHIP.TIER_REQUIRED（含 required/current） | A1（tier_satisfies）+ A7（require_camp_tier） |
| §5.2 前端 | AuthAccount+normalizeAccount 增 membership；购买页（选档→下单→二维码→轮询→成功刷新登录态）；等级徽章+到期；requireTier 工具+未授权购买引导 | F1（类型/normalize）+ F2/F3（下单/轮询/二维码）+ F4（requireTier/徽章）+ F5（购买页+登录引导） |
| §5.2 视觉 | 横向对比+线性留白，避免卡片堆叠/嵌套容器；截图核对 | F4/F5（grid gap-px 线性分隔；各 Task 截图验证） |
| §6 数据升级 | 加列（tier 默认 none 非空）+ started/expires 可空；新建 camp_membership_orders（order_no 唯一+membership_applied 幂等列）；enrollment_status 保留；回滚=删表删列；幂等 IF NOT EXISTS/IF EXISTS；验证 SQL | M1 |
| §6 待确认点 | 存量 enrolled 是否映射等级（默认不映射，落地前查库确认） | M1（待确认点注记 + 查询） |
| §7 测试 | 领域 tier_satisfies/过期回落；应用下单资格/回调幂等落账/require_camp_tier 满足与不满足；表现三接口契约；camp_auth /me 回归；前端页面运行验证 | A1/A4/A5/A6/A7/A8/B7 测试 + F2–F5 浏览器验证 |
| §8 交付边界 | 三档模型/支付落账/me 带等级/购买页+展示/前后端门禁原语；不做真实课件映射、不做升级续费 | 全 Task 覆盖；升级/续费已在 A4/A6 显式排除 |

---

## 执行前必须与用户确认的开放项（实现注记汇总）

1. `qrcode.react` 新依赖引入（Task F3）—— CLAUDE.md 要求依赖须批准。
2. `camp_membership_basic_fen` / `camp_membership_premium_fen` 默认价（199900 / 399900 分）数值确认（Task A6）。
3. 存量 `camp_accounts` 是否有 `enrollment_status='enrolled'` 需映射等级（Task M1 待确认点）。
