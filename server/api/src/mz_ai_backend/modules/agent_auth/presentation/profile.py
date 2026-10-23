from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from mz_ai_backend.core.protocol import ApiResponse, success_response
from mz_ai_backend.shared import CosStorageClient, CosStorageSettings
from ..application.use_cases.update_agent_profile import (
    UpdateAgentDisplayNameCommand, UploadAgentAvatarCommand,
    UpdateAgentProfileUseCase, UploadAgentAvatarUseCase, DisplayNameInput, AvatarInput,
)
from ..infrastructure.dependencies import (
    get_agent_account_repository, get_token_service, get_current_agent_access_token,
    Sha256TokenService,
)
from ..infrastructure.repositories import SqlAlchemyAgentAccountRepository
from ..infrastructure.avatar_storage import CosAgentAvatarStorage
from .schemas import AgentAuthAccountResponse

router = APIRouter()


class ProfileResponse(BaseModel):
    account: AgentAuthAccountResponse


def get_update_profile_use_case(
    repository: Annotated[SqlAlchemyAgentAccountRepository, Depends(get_agent_account_repository)],
    tokens: Annotated[Sha256TokenService, Depends(get_token_service)],
) -> UpdateAgentProfileUseCase:
    return UpdateAgentProfileUseCase(account_repository=repository, token_service=tokens)


def get_avatar_storage() -> CosAgentAvatarStorage:
    return CosAgentAvatarStorage(client=CosStorageClient(settings=CosStorageSettings.from_env()))


def get_upload_avatar_use_case(
    repository: Annotated[SqlAlchemyAgentAccountRepository, Depends(get_agent_account_repository)],
    tokens: Annotated[Sha256TokenService, Depends(get_token_service)],
    storage: Annotated[CosAgentAvatarStorage, Depends(get_avatar_storage)],
) -> UploadAgentAvatarUseCase:
    return UploadAgentAvatarUseCase(account_repository=repository, token_service=tokens, avatar_storage=storage)


@router.patch("/me/profile", response_model=ApiResponse[ProfileResponse], summary="修改个人展示名")
async def update_profile(
    request: DisplayNameInput,
    access_token: Annotated[str, Depends(get_current_agent_access_token)],
    use_case: Annotated[UpdateAgentProfileUseCase, Depends(get_update_profile_use_case)],
) -> ApiResponse[ProfileResponse]:
    result = await use_case.execute(UpdateAgentDisplayNameCommand(
        access_token=access_token, display_name=request.display_name,
    ))
    return success_response(data=ProfileResponse(account=AgentAuthAccountResponse.from_summary(result.account)))


@router.post("/me/avatar", response_model=ApiResponse[ProfileResponse], summary="上传并更新个人头像")
async def upload_avatar(
    request: AvatarInput,
    access_token: Annotated[str, Depends(get_current_agent_access_token)],
    use_case: Annotated[UploadAgentAvatarUseCase, Depends(get_upload_avatar_use_case)],
) -> ApiResponse[ProfileResponse]:
    result = await use_case.execute(UploadAgentAvatarCommand(
        access_token=access_token, content_type=request.content_type, content_base64=request.content_base64,
    ))
    return success_response(data=ProfileResponse(account=AgentAuthAccountResponse.from_summary(result.account)))
