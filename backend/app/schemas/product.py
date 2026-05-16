from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class InventoryBase(BaseModel):
    city: str
    quantity: int
    low_stock_threshold: int

class InventoryResponse(InventoryBase):
    id: int
    product_id: int
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    sku: str
    base_price: float
    category: str

class ProductResponse(ProductBase):
    id: int
    ai_updated_at: Optional[datetime] = None
    inventory: List[InventoryResponse] = []
    model_config = ConfigDict(from_attributes=True)

class ProductPriceUpdate(BaseModel):
    new_price: float
