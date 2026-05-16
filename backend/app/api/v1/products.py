from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.db.models import Product, Inventory
from app.schemas.product import ProductResponse, ProductPriceUpdate, ProductCreate, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[ProductResponse])
async def get_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).options(selectinload(Product.inventory)))
    return result.scalars().all()

@router.post("/", response_model=ProductResponse, status_code=201)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)):
    # Check SKU uniqueness
    existing = await db.execute(select(Product).filter(Product.sku == payload.sku))
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail=f"SKU '{payload.sku}' already exists")

    product = Product(
        name=payload.name,
        sku=payload.sku,
        base_price=payload.base_price,
        category=payload.category,
    )
    db.add(product)
    await db.flush()  # get product.id without committing

    for inv in payload.inventory:
        db.add(Inventory(
            product_id=product.id,
            city=inv.city,
            quantity=inv.quantity,
            low_stock_threshold=inv.low_stock_threshold,
        ))

    await db.commit()
    result = await db.execute(
        select(Product).options(selectinload(Product.inventory)).filter(Product.id == product.id)
    )
    return result.scalars().first()

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, payload: ProductUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).options(selectinload(Product.inventory)).filter(Product.id == product_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if payload.name is not None: product.name = payload.name
    if payload.sku is not None: product.sku = payload.sku
    if payload.base_price is not None: product.base_price = payload.base_price
    if payload.category is not None: product.category = payload.category

    await db.commit()
    await db.refresh(product)
    return product

@router.put("/{product_id}/price", response_model=ProductResponse)
async def update_product_price(product_id: int, price_data: ProductPriceUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Product).options(selectinload(Product.inventory)).filter(Product.id == product_id)
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.base_price = price_data.new_price
    product.ai_updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=204)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await db.delete(product)
    await db.commit()
