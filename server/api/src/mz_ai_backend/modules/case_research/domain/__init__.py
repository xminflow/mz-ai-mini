"""Domain exports for the case_research module.

Usage:
- Import case research entities and exceptions from this package.

Development rules:
- Keep domain types stable and framework-agnostic.
- Raise domain exceptions for business failures.
"""

from .entities import (
    PRIVATE_CASE_RESEARCH_PRICE_FEN,
    CaseResearchOrder,
    CaseResearchOrderStatus,
    CaseResearchRequest,
    CaseResearchRequestStatus,
    CaseResearchVisibility,
)
from .exceptions import (
    CaseResearchOrderNotFoundException,
    CaseResearchOrderStatusInvalidException,
)

__all__ = [
    "PRIVATE_CASE_RESEARCH_PRICE_FEN",
    "CaseResearchOrder",
    "CaseResearchOrderNotFoundException",
    "CaseResearchOrderStatus",
    "CaseResearchOrderStatusInvalidException",
    "CaseResearchRequest",
    "CaseResearchRequestStatus",
    "CaseResearchVisibility",
]
