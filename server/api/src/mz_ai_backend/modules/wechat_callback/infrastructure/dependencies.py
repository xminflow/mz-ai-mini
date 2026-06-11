from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from mz_ai_backend.shared import SnowflakeGenerator
from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import (
    get_handle_wechat_callback_use_case,
    get_snowflake_id_generator,
)
from mz_ai_backend.modules.agent_auth.application.use_cases.handle_wechat_callback import (
    HandleAgentWechatCallbackUseCase,
)
from mz_ai_backend.modules.camp_auth.infrastructure.dependencies import (
    get_camp_account_repository,
)
from mz_ai_backend.modules.camp_auth.infrastructure.repositories import SqlAlchemyCampAccountRepository
from mz_ai_backend.modules.camp_auth.application.use_cases.handle_wechat_callback import (
    HandleCampWechatCallbackUseCase,
)
from mz_ai_backend.modules.agent_auth.infrastructure.dependencies import (
    get_official_wechat_gateway,
)
from mz_ai_backend.modules.agent_auth.infrastructure.wechat_official import WechatOfficialAccountGateway

from ..application.dispatcher import WechatCallbackDispatcher


def get_wechat_callback_dispatcher(
    wechat_gateway: Annotated[WechatOfficialAccountGateway, Depends(get_official_wechat_gateway)],
    agent_handler: Annotated[HandleAgentWechatCallbackUseCase, Depends(get_handle_wechat_callback_use_case)],
    camp_account_repository: Annotated[
        SqlAlchemyCampAccountRepository,
        Depends(get_camp_account_repository),
    ],
    snowflake_id_generator: Annotated[SnowflakeGenerator, Depends(get_snowflake_id_generator)],
) -> WechatCallbackDispatcher:
    """构造 WechatCallbackDispatcher：agent_handler 直接复用 agent_auth 的工厂（含自动回复配置），
    camp_handler 独立构造（仅需 repo + snowflake）。
    """
    camp_handler = HandleCampWechatCallbackUseCase(
        account_repository=camp_account_repository,
        snowflake_id_generator=snowflake_id_generator,
    )
    return WechatCallbackDispatcher(
        wechat_gateway=wechat_gateway,
        agent_handler=agent_handler,
        camp_handler=camp_handler,
    )
