from pydantic import BaseModel, ConfigDict
from typing import Optional, Union

class CampaignCreate(BaseModel):
    name: str
    coupon_code: str
    discount_percent: float
    region: str
    projected_impact: Optional[str] = None
    ai_generated: bool = False

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    coupon_code: Optional[str] = None
    discount_percent: Optional[float] = None
    region: Optional[str] = None
    projected_impact: Optional[str] = None
    is_active: Optional[bool] = None

class CampaignResponse(CampaignCreate):
    id: Union[int, str]
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

