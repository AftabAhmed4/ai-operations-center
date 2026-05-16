import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Sale, SaleItem, Product, Inventory

async def get_regional_sales_summary(db: AsyncSession) -> str:
    """
    Fetches all sales and uses Pandas to group them by region.
    Returns a summarized JSON string to feed to the Insight Agent.
    """
    result = await db.execute(select(Sale.city, Sale.total_amount, Sale.type))
    sales = result.all()
    
    if not sales:
        return '{"message": "No sales data available"}'
        
    df = pd.DataFrame(sales, columns=["city", "total_amount", "type"])
    summary = df.groupby(["city", "type"])["total_amount"].sum().unstack(fill_value=0)
    
    # Calculate total revenue per city
    summary['Total Revenue'] = summary.sum(axis=1)
    return summary.to_json(orient='index')

async def get_low_stock_summary(db: AsyncSession) -> str:
    """
    Fetches inventory and uses Pandas to identify low stock products per city.
    """
    result = await db.execute(
        select(Inventory.city, Inventory.quantity, Inventory.low_stock_threshold, Product.name)
        .join(Product, Inventory.product_id == Product.id)
    )
    inventory_items = result.all()
    
    if not inventory_items:
        return '{"message": "No inventory data available"}'
        
    df = pd.DataFrame(inventory_items, columns=["city", "quantity", "low_stock_threshold", "product_name"])
    
    # Filter for low stock
    low_stock = df[df["quantity"] <= df["low_stock_threshold"]]
    
    if low_stock.empty:
        return '{"message": "All inventory levels are optimal."}'
        
    summary = low_stock.groupby("city").apply(
        lambda x: x[["product_name", "quantity"]].to_dict('records')
    ).to_json()
    
    return summary
