from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.db.models import Product, Inventory
from app.schemas.product import ProductResponse, ProductPriceUpdate

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).options(selectinload(Product.inventory)))
    products = result.scalars().all()
    return products

@router.put("/{product_id}/price", response_model=ProductResponse)
async def update_product_price(product_id: int, price_data: ProductPriceUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).options(selectinload(Product.inventory)).filter(Product.id == product_id))
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product.base_price = price_data.new_price
    product.ai_updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(product)
    
    return product
