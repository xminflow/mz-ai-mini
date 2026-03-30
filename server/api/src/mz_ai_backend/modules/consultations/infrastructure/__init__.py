"""Infrastructure exports for the consultations module.

Usage:
- Import dependency factories and repository implementations from this package.

Development rules:
- Keep framework and persistence details here.
- Convert infrastructure objects into domain entities before returning.
"""

from .dependencies import (
    MiniProgramIdentity,
    SystemCurrentTimeProvider,
    get_create_consultation_request_use_case,
    get_current_mini_program_identity,
    get_current_time_provider,
    get_consultation_request_repository,
    get_consultation_user_reader,
    get_snowflake_id_generator,
)
from .repositories import (
    AuthConsultationUserReader,
    SqlAlchemyConsultationRequestRepository,
)

__all__ = [
    "AuthConsultationUserReader",
    "MiniProgramIdentity",
    "SqlAlchemyConsultationRequestRepository",
    "SystemCurrentTimeProvider",
    "get_create_consultation_request_use_case",
    "get_current_mini_program_identity",
    "get_current_time_provider",
    "get_consultation_request_repository",
    "get_consultation_user_reader",
    "get_snowflake_id_generator",
]
