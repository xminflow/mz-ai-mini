"""Domain exports for the business_cases module.

Usage:
- Import business case entities and domain-specific exceptions from this package.
- Case summaries and aggregates expose case-level `tags`.

Development rules:
- Keep domain types stable and framework-agnostic.
- Raise domain exceptions for business failures.
"""

from .entities import (
    BusinessCase,
    BusinessCaseDocument,
    BusinessCaseDocumentType,
    BusinessCaseDocuments,
    BusinessCaseStatus,
    BusinessCaseSummary,
)
from .exceptions import (
    BusinessCaseInvalidDocumentSetException,
    BusinessCaseNotFoundException,
)

__all__ = [
    "BusinessCase",
    "BusinessCaseDocument",
    "BusinessCaseDocumentType",
    "BusinessCaseDocuments",
    "BusinessCaseInvalidDocumentSetException",
    "BusinessCaseNotFoundException",
    "BusinessCaseStatus",
    "BusinessCaseSummary",
]
