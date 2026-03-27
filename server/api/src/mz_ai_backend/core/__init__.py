"""Public core APIs shared across the backend.

Usage:
- Import `create_app` to bootstrap the application.
- Import response builders and exception types from this package only.
- Configure environment-specific database access with
  `MZ_AI_BACKEND_DEVELOPMENT_DATABASE_URL` and
  `MZ_AI_BACKEND_PRODUCTION_DATABASE_URL` when `MZ_AI_BACKEND_DATABASE_URL`
  is not set.

Development rules:
- Keep framework boundary code in `core`.
- Keep module-specific logic out of this package.
- Keep database URL selection centralized in `core.config`.
"""

from .application import create_app
from .config import Settings, get_settings
from .database import Base
from .error_codes import ErrorCode
from .exceptions import (
    AppException,
    BusinessException,
    InternalServerException,
    NotFoundException,
    SystemException,
    UnauthorizedException,
    ValidationException,
)
from .protocol import ApiResponse, error_response, success_response

__all__ = [
    "ApiResponse",
    "AppException",
    "Base",
    "BusinessException",
    "ErrorCode",
    "InternalServerException",
    "NotFoundException",
    "Settings",
    "SystemException",
    "UnauthorizedException",
    "ValidationException",
    "create_app",
    "error_response",
    "get_settings",
    "success_response",
]
