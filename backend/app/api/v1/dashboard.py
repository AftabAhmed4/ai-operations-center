from fastapi import APIRouter, Depends, Query
from google.cloud import firestore
from datetime import datetime, timezone
from typing import Optional, List

from app.db.database import get_db
from app.schemas.dashboard import (
    DashboardMetrics, MonthlySalesResponse, MonthlySalesPoint,
    LowStockResponse, LowStockItem, HighDemandResponse, HighDemandItem
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

@router.get("/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(db: firestore.Client = Depends(get_db)):
    # Total Revenue and Orders Today
    sales_docs = list(db.collection("sales").stream())
    total_revenue = 0.0
    orders_today = 0
    
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    
    for doc in sales_docs:
        sale = doc.to_dict()
        total_revenue += sale.get("total_amount", 0.0)
        
        created_at = sale.get("created_at", "")
        if created_at.startswith(today_str):
            orders_today += 1

    # Active Campaigns
    campaigns_query = db.collection("campaigns").where(filter=firestore.FieldFilter("is_active", "==", True)).stream()
    active_campaigns = len(list(campaigns_query))

    # Low Stock Alerts
    products_docs = db.collection("products").stream()
    low_stock_alerts = 0
    for doc in products_docs:
        product = doc.to_dict()
        for inv in product.get("inventory", []):
            if inv.get("quantity", 0) <= inv.get("low_stock_threshold", 5):
                low_stock_alerts += 1

    return DashboardMetrics(
        total_revenue=total_revenue,
        orders_today=orders_today,
        active_campaigns=active_campaigns,
        low_stock_alerts=low_stock_alerts
    )


@router.get("/monthly-sales", response_model=MonthlySalesResponse)
def get_monthly_sales(
    year: Optional[int] = Query(default=None),
    db: firestore.Client = Depends(get_db)
):
    target_year = year or datetime.utcnow().year
    
    sales_docs = db.collection("sales").stream()
    
    monthly_data = {m: {"revenue": 0.0, "orders": 0} for m in range(1, 13)}
    
    for doc in sales_docs:
        sale = doc.to_dict()
        created_at_str = sale.get("created_at", "")
        if not created_at_str: continue
        
        try:
            created_at = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            if created_at.year == target_year:
                m = created_at.month
                monthly_data[m]["revenue"] += sale.get("total_amount", 0.0)
                monthly_data[m]["orders"] += 1
        except ValueError:
            pass

    data = []
    for m in range(1, 13):
        data.append(MonthlySalesPoint(
            month=MONTH_NAMES[m - 1],
            revenue=monthly_data[m]["revenue"],
            orders=monthly_data[m]["orders"],
        ))

    return MonthlySalesResponse(data=data)


@router.get("/low-stock", response_model=LowStockResponse)
def get_low_stock(db: firestore.Client = Depends(get_db)):
    products_docs = db.collection("products").stream()
    items = []
    
    for doc in products_docs:
        product = doc.to_dict()
        product_id = doc.id
        product_name = product.get("name", "")
        sku = product.get("sku", "")
        
        for inv in product.get("inventory", []):
            quantity = inv.get("quantity", 0)
            threshold = inv.get("low_stock_threshold", 5)
            if quantity <= threshold:
                items.append(LowStockItem(
                    product_id=product_id,
                    product_name=product_name,
                    sku=sku,
                    city=inv.get("city", ""),
                    quantity=quantity,
                    threshold=threshold
                ))
                
    # Sort by quantity ascending
    items.sort(key=lambda x: x.quantity)
    
    return LowStockResponse(items=items)


@router.get("/high-demand", response_model=HighDemandResponse)
def get_high_demand(db: firestore.Client = Depends(get_db)):
    sales_docs = db.collection("sales").stream()
    products_docs = db.collection("products").stream()
    
    # Map product details
    product_map = {}
    for doc in products_docs:
        product_map[doc.id] = doc.to_dict()
        
    # Aggregate sales
    demand_map = {}
    for doc in sales_docs:
        sale = doc.to_dict()
        for item in sale.get("items", []):
            prod_id = str(item.get("product_id"))
            quantity = item.get("quantity", 0)
            unit_price = item.get("unit_price", 0.0)
            
            if prod_id not in demand_map:
                demand_map[prod_id] = {"total_sold": 0, "total_revenue": 0.0}
                
            demand_map[prod_id]["total_sold"] += quantity
            demand_map[prod_id]["total_revenue"] += (quantity * unit_price)
            
    # Build response
    items = []
    for prod_id, stats in demand_map.items():
        prod_data = product_map.get(prod_id, {})
        items.append(HighDemandItem(
            product_id=prod_id,
            product_name=prod_data.get("name", "Unknown"),
            sku=prod_data.get("sku", "Unknown"),
            category=prod_data.get("category", "Unknown"),
            total_sold=stats["total_sold"],
            total_revenue=stats["total_revenue"]
        ))
        
    # Sort by total_sold descending
    items.sort(key=lambda x: x.total_sold, reverse=True)
    
    return HighDemandResponse(items=items[:10])
