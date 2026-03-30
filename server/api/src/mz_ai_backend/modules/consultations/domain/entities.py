from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict


class ConsultationBusinessType(StrEnum):
    """Supported consultation business types."""

    MARKETING_GROWTH = "marketing_growth"
    SALES_CONVERSION = "sales_conversion"
    CUSTOMER_SERVICE = "customer_service"
    OPERATION_EFFICIENCY = "operation_efficiency"
    KNOWLEDGE_TRAINING = "knowledge_training"
    DATA_ANALYSIS = "data_analysis"
    SYSTEM_INTEGRATION = "system_integration"
    OTHER = "other"


class ConsultationRequest(BaseModel):
    """Consultation request aggregate."""

    model_config = ConfigDict(frozen=True)

    consultation_id: int
    user_id: int
    openid: str
    phone: str
    email: str
    business_type: ConsultationBusinessType
    business_type_other: str | None
    business_description: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime
