from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, field_validator

from ..application import (
    CaseResearchRequestSummary,
    CreateCaseResearchOrderCommand,
    CreateCaseResearchOrderResult,
    CreatePublicCaseResearchRequestCommand,
    CreatePublicCaseResearchRequestResult,
    GetCaseResearchOrderResult,
    ListUserCaseResearchRequestsResult,
    MiniProgramIdentity,
)


class CreateCaseResearchRequestPayload(BaseModel):
    """HTTP payload for creating one case research request."""

    model_config = ConfigDict(frozen=True)

    title: str
    description: str

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("title must not be empty.")
        if len(stripped) > 255:
            raise ValueError("title must not exceed 255 characters.")
        return stripped

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("description must not be empty.")
        return stripped

    def to_public_command(
        self,
        *,
        identity: MiniProgramIdentity,
    ) -> CreatePublicCaseResearchRequestCommand:
        return CreatePublicCaseResearchRequestCommand(
            identity=identity,
            title=self.title,
            description=self.description,
        )

    def to_order_command(
        self,
        *,
        identity: MiniProgramIdentity,
    ) -> CreateCaseResearchOrderCommand:
        return CreateCaseResearchOrderCommand(
            identity=identity,
            title=self.title,
            description=self.description,
        )


class CreateCaseResearchRequestResponse(BaseModel):
    """HTTP response payload after creating a public case research request."""

    model_config = ConfigDict(frozen=True)

    request_id: str
    visibility: str
    status: str
    created_at: datetime

    @classmethod
    def from_result(
        cls,
        result: CreatePublicCaseResearchRequestResult,
    ) -> "CreateCaseResearchRequestResponse":
        return cls(
            request_id=str(result.request_id),
            visibility=result.visibility.value,
            status=result.status.value,
            created_at=result.created_at,
        )


class CaseResearchPaymentParamsResponse(BaseModel):
    """HTTP payment params used by wx.requestPayment."""

    model_config = ConfigDict(frozen=True)

    time_stamp: str
    nonce_str: str
    package: str
    sign_type: str
    pay_sign: str


class CreateCaseResearchOrderResponse(BaseModel):
    """HTTP response payload after creating a private case research order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    amount_fen: int
    status: str
    payment_params: CaseResearchPaymentParamsResponse

    @classmethod
    def from_result(
        cls,
        result: CreateCaseResearchOrderResult,
    ) -> "CreateCaseResearchOrderResponse":
        payload = result.model_dump(mode="json")
        payload["status"] = result.status.value
        return cls.model_validate(payload)


class GetCaseResearchOrderResponse(BaseModel):
    """HTTP response payload for one case research order."""

    model_config = ConfigDict(frozen=True)

    order_no: str
    amount_fen: int
    status: str
    request_applied: bool
    request_id: str | None

    @classmethod
    def from_result(
        cls,
        result: GetCaseResearchOrderResult,
    ) -> "GetCaseResearchOrderResponse":
        return cls(
            order_no=result.order_no,
            amount_fen=result.amount_fen,
            status=result.status.value,
            request_applied=result.request_applied,
            request_id=str(result.request_id) if result.request_id is not None else None,
        )


class CaseResearchRequestSummaryResponse(BaseModel):
    """HTTP summary item for one case research request."""

    model_config = ConfigDict(frozen=True)

    request_id: str
    title: str
    description: str
    status: str
    linked_case_id: str | None
    created_at: datetime

    @classmethod
    def from_summary(
        cls,
        summary: CaseResearchRequestSummary,
    ) -> "CaseResearchRequestSummaryResponse":
        return cls(
            request_id=str(summary.request_id),
            title=summary.title,
            description=summary.description,
            status=summary.status.value,
            linked_case_id=summary.linked_case_id,
            created_at=summary.created_at,
        )


class ListUserCaseResearchRequestsResponse(BaseModel):
    """HTTP response payload for a list of case research requests."""

    model_config = ConfigDict(frozen=True)

    items: list[CaseResearchRequestSummaryResponse]

    @classmethod
    def from_result(
        cls,
        result: ListUserCaseResearchRequestsResult,
    ) -> "ListUserCaseResearchRequestsResponse":
        return cls(
            items=[CaseResearchRequestSummaryResponse.from_summary(item) for item in result.items]
        )


class WechatPayNotifyAcknowledgeResponse(BaseModel):
    """Acknowledgement payload required by WeChat Pay callback protocol."""

    model_config = ConfigDict(frozen=True)

    code: str
    message: str
