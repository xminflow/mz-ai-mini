"""Application exports for the business_cases module.

Usage:
- Import DTOs and use cases through this package.
- Public case payloads include case-level `industry`, `tags`, and a shared
  case cover image. Document payloads contain title and markdown content only.

Development rules:
- Keep orchestration logic in use cases.
- Depend on ports instead of concrete infrastructure implementations.
"""

from .dtos import (
    BusinessCaseDetailResult,
    BusinessCaseDocumentContent,
    BusinessCaseDocumentResult,
    BusinessCaseDocumentsResult,
    BusinessCaseListItemResult,
    CreateBusinessCaseCommand,
    DeleteBusinessCaseCommand,
    DeleteBusinessCaseResult,
    GetBusinessCaseQuery,
    ListAdminBusinessCasesQuery,
    ListBusinessCasesResult,
    ListPublicBusinessCasesQuery,
    ReplaceBusinessCaseCommand,
)
from .use_cases import (
    CreateBusinessCaseUseCase,
    DeleteBusinessCaseUseCase,
    GetAdminBusinessCaseUseCase,
    GetPublicBusinessCaseUseCase,
    ListAdminBusinessCasesUseCase,
    ListPublicBusinessCasesUseCase,
    ReplaceBusinessCaseUseCase,
)

__all__ = [
    "BusinessCaseDetailResult",
    "BusinessCaseDocumentContent",
    "BusinessCaseDocumentResult",
    "BusinessCaseDocumentsResult",
    "BusinessCaseListItemResult",
    "CreateBusinessCaseCommand",
    "CreateBusinessCaseUseCase",
    "DeleteBusinessCaseCommand",
    "DeleteBusinessCaseResult",
    "DeleteBusinessCaseUseCase",
    "GetAdminBusinessCaseUseCase",
    "GetBusinessCaseQuery",
    "GetPublicBusinessCaseUseCase",
    "ListAdminBusinessCasesQuery",
    "ListAdminBusinessCasesUseCase",
    "ListBusinessCasesResult",
    "ListPublicBusinessCasesQuery",
    "ListPublicBusinessCasesUseCase",
    "ReplaceBusinessCaseCommand",
    "ReplaceBusinessCaseUseCase",
]
