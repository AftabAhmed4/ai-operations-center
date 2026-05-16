from pydantic import BaseModel
from typing import List

class DashboardMetrics(BaseModel):
    total_revenue: float
    orders_today: int
    active_campaigns: int
    low_stock_alerts: int
