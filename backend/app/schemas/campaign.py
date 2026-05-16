from pydantic import BaseModel, ConfigDict
from typing import Optional

class CampaignCreate(BaseModel):
    name: str
    coupon_code: str
    discount_percent: float
    region: str
    projected_impact: Optional[str] = None
    ai_generated: bool = False

class CampaignResponse(CampaignCreate):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)
