import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.agents import DecisionAction
from app.db.models import Product, Campaign, Inventory

async def execute_action(db: AsyncSession, action: DecisionAction) -> str:
    """
    Translates the Pydantic JSON decisions into database mutations.
    Returns a success message.
    """
    action_type = action.action_type
    details = action.details
    
    if action_type == 'update_price':
        # Expects: product_id or product_name, new_price
        product_name = details.get('product_name')
        new_price = details.get('new_price')
        
        result = await db.execute(select(Product).where(Product.name.ilike(f"%{product_name}%")))
        product = result.scalars().first()
        
        if product and new_price:
            product.base_price = float(new_price)
            await db.commit()
            return f"Updated price for {product.name} to {new_price}."
        return "Product not found or missing details."
        
    elif action_type == 'create_campaign':
        # Expects: name, discount_percent, region
        campaign = Campaign(
            name=details.get('name', 'AI Auto Campaign'),
            coupon_code=details.get('coupon_code', 'AI-SALE'),
            discount_percent=float(details.get('discount_percent', 10.0)),
            region=details.get('region', 'All'),
            ai_generated=True,
            projected_impact=action.justification
        )
        db.add(campaign)
        await db.commit()
        return f"Created campaign {campaign.name} for {campaign.region}."
        
    elif action_type == 'reorder_stock':
        product_name = details.get('product_name')
        city = details.get('city')
        quantity = int(details.get('quantity', 50))
        
        result = await db.execute(
            select(Inventory).join(Product).where(Product.name.ilike(f"%{product_name}%"), Inventory.city == city)
        )
        inventory = result.scalars().first()
        
        if inventory:
            inventory.quantity += quantity
            await db.commit()
            return f"Reordered {quantity} units of {product_name} for {city}."
            
        return "Inventory location not found."
        
    elif action_type == 'no_action':
        return "No action required based on current insights."
        
    return f"Unknown action type: {action_type}"
