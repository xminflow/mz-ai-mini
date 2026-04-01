"""Domain exports for the business_cases module.

Usage:
- Import business case entities and domain-specific exceptions from this package.
- Case summaries and aggregates expose case-level `type`, `industry`, and `tags`.
- Business case documents expose title and markdown content without per-document
  cover metadata.

Development rules:
- Keep domain types stable and framework-agnostic.
- Raise domain exceptions for business failures.
"""

from .entities import (
    BusinessCase,
    BusinessCaseDocument,
    BusinessCaseIndustry,
    BusinessCaseDocumentType,
    BusinessCaseDocuments,
    BusinessCaseStatus,
    BusinessCaseSummary,
    BusinessCaseType,
    required_document_types_for_case_type,
    supports_loaded_document_types,
)
from .exceptions import (
    BusinessCaseInvalidDocumentSetException,
    BusinessCaseNotFoundException,
)

__all__ = [
    "BusinessCase",
    "BusinessCaseDocument",
    "BusinessCaseIndustry",
    "BusinessCaseDocumentType",
    "BusinessCaseDocuments",
    "BusinessCaseInvalidDocumentSetException",
    "BusinessCaseNotFoundException",
    "BusinessCaseStatus",
    "BusinessCaseSummary",
    "BusinessCaseType",
    "required_document_types_for_case_type",
    "supports_loaded_document_types",
]
