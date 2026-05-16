from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.db.models import OrderType

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None
    type: OrderType
    discount_applied: float = 0.0
    city: str
    items: List[SaleItemCreate]

class SaleItemResponse(SaleItemCreate):
    id: int
    sale_id: int
    model_config = ConfigDict(from_attributes=True)

class SaleResponse(BaseModel):
    id: int
    customer_id: Optional[int]
    type: OrderType
    total_amount: float
    discount_applied: float
    city: str
    created_at: datetime
    items: List[SaleItemResponse]
    model_config = ConfigDict(from_attributes=True)
