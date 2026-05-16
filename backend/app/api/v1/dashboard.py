from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, extract
from datetime import datetime
from typing import Optional, List

from app.db.database import get_db
from app.db.models import Sale, SaleItem, Campaign, Inventory, Product
from app.schemas.dashboard import (
    DashboardMetrics, MonthlySalesResponse, MonthlySalesPoint,
    LowStockResponse, LowStockItem, HighDemandResponse, HighDemandItem
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    revenue_result = await db.execute(select(func.sum(Sale.total_amount)))
    total_revenue = revenue_result.scalar() or 0.0

    orders_result = await db.execute(select(func.count(Sale.id)))
    orders_today = orders_result.scalar() or 0

    campaigns_result = await db.execute(
        select(func.count(Campaign.id)).filter(Campaign.is_active == True)
    )
    active_campaigns = campaigns_result.scalar() or 0

    low_stock_result = await db.execute(
        select(func.count(Inventory.id)).filter(
            Inventory.quantity <= Inventory.low_stock_threshold
        )
    )
    low_stock_alerts = low_stock_result.scalar() or 0

    return DashboardMetrics(
        total_revenue=total_revenue,
        orders_today=orders_today,
        active_campaigns=active_campaigns,
        low_stock_alerts=low_stock_alerts
    )


@router.get("/monthly-sales", response_model=MonthlySalesResponse)
async def get_monthly_sales(
    year: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    target_year = year or datetime.utcnow().year

    result = await db.execute(
        select(
            extract("month", Sale.created_at).label("month"),
            func.sum(Sale.total_amount).label("revenue"),
            func.count(Sale.id).label("orders")
        )
        .filter(extract("year", Sale.created_at) == target_year)
        .group_by(extract("month", Sale.created_at))
        .order_by(extract("month", Sale.created_at))
    )
    rows = result.all()

    # Build full 12-month array, filling zeros for missing months
    monthly_map = {int(r.month): r for r in rows}
    data = []
    for m in range(1, 13):
        r = monthly_map.get(m)
        data.append(MonthlySalesPoint(
            month=MONTH_NAMES[m - 1],
            revenue=float(r.revenue) if r else 0.0,
            orders=int(r.orders) if r else 0,
        ))

    return MonthlySalesResponse(data=data)


@router.get("/low-stock", response_model=LowStockResponse)
async def get_low_stock(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Inventory, Product)
        .join(Product, Inventory.product_id == Product.id)
        .filter(Inventory.quantity <= Inventory.low_stock_threshold)
        .order_by(Inventory.quantity.asc())
    )
    rows = result.all()

    items = [
        LowStockItem(
            product_id=inv.product_id,
            product_name=prod.name,
            sku=prod.sku,
            city=inv.city,
            quantity=inv.quantity,
            threshold=inv.low_stock_threshold,
        )
        for inv, prod in rows
    ]
    return LowStockResponse(items=items)


@router.get("/high-demand", response_model=HighDemandResponse)
async def get_high_demand(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            Product.id,
            Product.name,
            Product.sku,
            Product.category,
            func.sum(SaleItem.quantity).label("total_sold"),
            func.sum(SaleItem.quantity * SaleItem.unit_price).label("total_revenue"),
        )
        .join(SaleItem, SaleItem.product_id == Product.id)
        .group_by(Product.id, Product.name, Product.sku, Product.category)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(10)
    )
    rows = result.all()

    items = [
        HighDemandItem(
            product_id=r.id,
            product_name=r.name,
            sku=r.sku,
            category=r.category,
            total_sold=int(r.total_sold or 0),
            total_revenue=float(r.total_revenue or 0.0),
        )
        for r in rows
    ]
    return HighDemandResponse(items=items)
