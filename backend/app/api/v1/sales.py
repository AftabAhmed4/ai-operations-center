from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import Sale, SaleItem, Product
from app.schemas.sale import SaleCreate, SaleResponse
from app.services.inventory import reduce_inventory

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.post("/", response_model=SaleResponse)
async def create_sale(sale_data: SaleCreate, db: AsyncSession = Depends(get_db)):
    # Calculate total and reduce inventory
    total_amount = 0.0
    
    for item in sale_data.items:
        # Reduce inventory
        await reduce_inventory(db, item.product_id, sale_data.city, item.quantity)
        total_amount += (item.quantity * item.unit_price)
        
    total_amount -= sale_data.discount_applied
    
    # Create Sale
    new_sale = Sale(
        customer_id=sale_data.customer_id,
        type=sale_data.type,
        total_amount=total_amount,
        discount_applied=sale_data.discount_applied,
        city=sale_data.city
    )
    db.add(new_sale)
    await db.commit()
    await db.refresh(new_sale)
    
    # Create Sale Items
    for item in sale_data.items:
        sale_item = SaleItem(
            sale_id=new_sale.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        db.add(sale_item)
        
    await db.commit()
    
    # Fetch complete sale to return
    result = await db.execute(select(Sale).options(selectinload(Sale.items)).filter(Sale.id == new_sale.id))
    completed_sale = result.scalars().first()
    return completed_sale
