import enum
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

class OrderType(str, enum.Enum):
    WALK_IN = "Walk-in"
    ONLINE = "Online Delivery"

class WorkflowStatus(str, enum.Enum):
    PROCESSING = "Processing"
    PENDING_APPROVAL = "Pending Approval"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    EXECUTED = "Executed"

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    sku = Column(String(100), unique=True, index=True)
    base_price = Column(Float)
    category = Column(String(100))
    ai_updated_at = Column(DateTime, nullable=True)

    inventory = relationship("Inventory", back_populates="product", cascade="all, delete")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    city = Column(String(100)) # Karachi, Lahore, Islamabad
    quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=5)

    product = relationship("Product", back_populates="inventory")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    type = Column(Enum(OrderType))
    total_amount = Column(Float)
    discount_applied = Column(Float, default=0.0)
    city = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("SaleItem", back_populates="sale", cascade="all, delete")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    unit_price = Column(Float)

    sale = relationship("Sale", back_populates="items")
    product = relationship("Product")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    coupon_code = Column(String(50))
    discount_percent = Column(Float)
    region = Column(String(100))
    is_active = Column(Boolean, default=True)
    ai_generated = Column(Boolean, default=False)
    projected_impact = Column(String(255), nullable=True)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    phone = Column(String(50), nullable=True)
    risk_status = Column(String(50), nullable=True)
    churn_prediction = Column(Float, nullable=True)

class AIWorkflow(Base):
    __tablename__ = "ai_workflows"

    id = Column(Integer, primary_key=True, index=True)
    trigger_source = Column(String(255))
    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.PROCESSING)
    context_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    logs = relationship("AIActionLog", back_populates="workflow", cascade="all, delete")

class AIActionLog(Base):
    __tablename__ = "ai_action_logs"

    id = Column(Integer, primary_key=True, index=True)
    workflow_id = Column(Integer, ForeignKey("ai_workflows.id"))
    action_category = Column(String(100))
    log_message = Column(String(500))
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    workflow = relationship("AIWorkflow", back_populates="logs")
