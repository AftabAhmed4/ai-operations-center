from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.db.models import Inventory

async def reduce_inventory(db: AsyncSession, product_id: int, city: str, quantity: int):
    # Find inventory for product in the specific city
    result = await db.execute(select(Inventory).filter(Inventory.product_id == product_id, Inventory.city == city))
    inventory_item = result.scalars().first()

    if not inventory_item:
        raise HTTPException(status_code=400, detail=f"No inventory found for product {product_id} in {city}")

    if inventory_item.quantity < quantity:
        raise HTTPException(status_code=400, detail=f"Insufficient stock for product {product_id} in {city}")

    inventory_item.quantity -= quantity
    db.add(inventory_item)
    return inventory_item
