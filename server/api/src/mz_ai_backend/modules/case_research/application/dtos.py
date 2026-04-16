from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from mz_ai_backend.shared.wechat_pay import WechatPayPaymentParams

from ..domain import (
    CaseResearchOrder,
    CaseResearchOrderStatus,
    CaseResearchRequest,
    CaseResearchRequestStatus,
    CaseResearchVisibility,
)


class MiniProgramIdentity(BaseModel):
    """Trusted mini program identity injected by cloud hosting."""

    model_config = ConfigDict(frozen=True)

    openid: str
    app_id: str | None
    union_id: str | None


class CreatePublicCaseResearchRequestCommand(BaseModel):
    """Input command for creating one public case research request."""

    model_config = ConfigDict(frozen=True)

    identity: MiniProgramIdentity
    title: str
    description: str


class CreatePublicCaseResearchRequestResult(BaseModel):
    """Result returned after creating one public case research request."""

    model_config = ConfigDict(frozen=True)

    request_id: int
    visibility: CaseResearchVisibility
    status: CaseResearchRequestStatus
    created_at: datetime


class CreateCaseResearchOrderCommand(BaseModel):
    """Input command for creating one private case research order."""

    model_config = ConfigDict(frozen=True)

    identity: MiniProgramIdentity
    title: str
    description: str


class CreateCaseResearchOrderResult(BaseModel):
    """Result returned after creating one case research order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    amount_fen: int
    status: CaseResearchOrderStatus
    payment_params: WechatPayPaymentParams


class GetCaseResearchOrderQuery(BaseModel):
    """Input query for fetching one case research order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    identity: MiniProgramIdentity


class GetCaseResearchOrderResult(BaseModel):
    """Result returned after fetching one case research order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    amount_fen: int
    status: CaseResearchOrderStatus
    request_applied: bool
    request_id: int | None


class HandleWechatPayNotifyCommand(BaseModel):
    """Input command for handling one WeChat Pay callback request."""

    model_config = ConfigDict(frozen=True)

    headers: dict[str, str]
    body: bytes


class HandleWechatPayNotifyResult(BaseModel):
    """Result returned after one WeChat Pay callback is handled."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    status: CaseResearchOrderStatus


class ListUserCaseResearchRequestsQuery(BaseModel):
    """Input query for listing a user's private case research requests."""

    model_config = ConfigDict(frozen=True)

    identity: MiniProgramIdentity


class CaseResearchRequestSummary(BaseModel):
    """Summary item for one case research request in list responses."""

    model_config = ConfigDict(frozen=True)

    request_id: int
    title: str
    description: str
    status: CaseResearchRequestStatus
    linked_case_id: str | None
    created_at: datetime


class ListUserCaseResearchRequestsResult(BaseModel):
    """Result returned after listing a user's private case research requests."""

    model_config = ConfigDict(frozen=True)

    items: list[CaseResearchRequestSummary]


class CaseResearchRequestRegistration(BaseModel):
    """Repository payload for creating one case research request."""

    model_config = ConfigDict(frozen=True)

    request_id: int
    user_id: int
    openid: str
    title: str
    description: str
    visibility: CaseResearchVisibility


class CaseResearchOrderRegistration(BaseModel):
    """Repository payload for creating one pending case research order."""

    model_config = ConfigDict(frozen=True)

    order_id: int
    order_no: str
    user_id: int
    openid: str
    amount_fen: int
    title: str
    description: str
