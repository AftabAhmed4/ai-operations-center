from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.db.database import get_db
from app.db.models import Sale, Campaign, Inventory
from app.schemas.dashboard import DashboardMetrics

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    # Total Revenue
    revenue_result = await db.execute(select(func.sum(Sale.total_amount)))
    total_revenue = revenue_result.scalar() or 0.0
    
    # Orders Today
    # For hackathon, just count all orders
    orders_result = await db.execute(select(func.count(Sale.id)))
    orders_today = orders_result.scalar() or 0
    
    # Active Campaigns
    campaigns_result = await db.execute(select(func.count(Campaign.id)).filter(Campaign.is_active == True))
    active_campaigns = campaigns_result.scalar() or 0
    
    # Low stock alerts
    # Comparing quantity to low_stock_threshold
    low_stock_result = await db.execute(select(func.count(Inventory.id)).filter(Inventory.quantity <= Inventory.low_stock_threshold))
    low_stock_alerts = low_stock_result.scalar() or 0
    
    return DashboardMetrics(
        total_revenue=total_revenue,
        orders_today=orders_today,
        active_campaigns=active_campaigns,
        low_stock_alerts=low_stock_alerts
    )
