from __future__ import annotations

import base64
import binascii
import logging
import unicodedata
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from ..dtos import AgentAccountSummary, GetCurrentAgentAccountQuery
from ..ports import AgentAccountRepository, TokenService
from ..ports.services import AgentAvatarStorage
from ._resolve_current_account import resolve_current_account_id
from ...domain import AgentAccountDisabledException

logger = logging.getLogger(__name__)
MAX_AVATAR_BYTES = 2 * 1024 * 1024


class DisplayNameInput(BaseModel):
    display_name: str = Field(max_length=64)

    @field_validator("display_name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        name = value.strip()
        if not name or any(unicodedata.category(char).startswith("C") for char in name):
            raise ValueError("用户名需为 1-64 个可见字符。")
        return name


class AvatarInput(BaseModel):
    content_type: str
    content_base64: str = Field(max_length=((MAX_AVATAR_BYTES + 2) // 3) * 4)

    @model_validator(mode="after")
    def validate_image(self) -> Self:
        try:
            content = self.decode_content()
        except (ValueError, binascii.Error) as exc:
            raise ValueError("头像内容必须是有效的 Base64。") from exc
        if not content or len(content) > MAX_AVATAR_BYTES:
            raise ValueError("头像大小不能超过 2 MB。")
        # 只接受栅格图片并核对文件标识，禁止将 SVG/HTML 作为头像上传。
        valid = (
            self.content_type == "image/png" and content.startswith(b"\x89PNG\r\n\x1a\n")
            or self.content_type == "image/jpeg" and content.startswith(b"\xff\xd8\xff")
            or self.content_type == "image/webp" and content[:4] == b"RIFF" and content[8:12] == b"WEBP"
        )
        if not valid:
            raise ValueError("请选择 JPG、PNG 或 WebP 图片。")
        return self

    def decode_content(self) -> bytes:
        return base64.b64decode(self.content_base64, validate=True)


class UpdateAgentDisplayNameCommand(DisplayNameInput, GetCurrentAgentAccountQuery):
    pass


class UploadAgentAvatarCommand(AvatarInput, GetCurrentAgentAccountQuery):
    pass


class AgentProfileResult(BaseModel):
    model_config = ConfigDict(frozen=True)
    account: AgentAccountSummary


class UpdateAgentProfileUseCase:
    def __init__(self, *, account_repository: AgentAccountRepository, token_service: TokenService) -> None:
        self._repository = account_repository
        self._tokens = token_service

    async def execute(self, command: UpdateAgentDisplayNameCommand) -> AgentProfileResult:
        account_id = await resolve_current_account_id(
            account_repository=self._repository, token_service=self._tokens,
            access_token=command.access_token,
        )
        account = await self._repository.update_account_profile(
            account_id=account_id, display_name=command.display_name,
        )
        if account is None:
            raise AgentAccountDisabledException()
        logger.debug("个人展示名已更新：account_id=%s", account_id)
        return AgentProfileResult(account=AgentAccountSummary.from_account(account))


class UploadAgentAvatarUseCase:
    def __init__(self, *, account_repository: AgentAccountRepository, token_service: TokenService,
                 avatar_storage: AgentAvatarStorage) -> None:
        self._repository = account_repository
        self._tokens = token_service
        self._storage = avatar_storage

    async def execute(self, command: UploadAgentAvatarCommand) -> AgentProfileResult:
        account_id = await resolve_current_account_id(
            account_repository=self._repository, token_service=self._tokens,
            access_token=command.access_token,
        )
        content = command.decode_content()
        logger.debug("头像上传开始：account_id=%s bytes=%s content_type=%s",
                     account_id, len(content), command.content_type)
        avatar_url = await self._storage.upload(
            account_id=account_id, content=content, content_type=command.content_type,
        )
        account = await self._repository.update_account_profile(account_id=account_id, avatar_url=avatar_url)
        if account is None:
            raise AgentAccountDisabledException()
        logger.debug("头像已持久化：account_id=%s", account_id)
        return AgentProfileResult(account=AgentAccountSummary.from_account(account))
