from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Product, Inventory, Campaign

async def get_product_by_sku(db: AsyncSession, sku: str) -> Product | None:
    result = await db.execute(select(Product).where(Product.sku == sku))
    return result.scalars().first()

async def get_product_by_name(db: AsyncSession, name: str) -> Product | None:
    result = await db.execute(select(Product).where(Product.name.ilike(f"%{name}%")))
    return result.scalars().first()

async def get_inventory_for_product(db: AsyncSession, product_id: int):
    result = await db.execute(select(Inventory).where(Inventory.product_id == product_id))
    return result.scalars().all()

async def get_active_campaigns(db: AsyncSession, region: str = None):
    query = select(Campaign).where(Campaign.is_active == True)
    if region:
        query = query.where(Campaign.region == region)
    result = await db.execute(query)
    return result.scalars().all()
