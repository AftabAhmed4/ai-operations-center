from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.schemas.sale import SaleCreate, SaleResponse
from app.services.inventory import reduce_inventory

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.get("/", response_model=List[SaleResponse])
def get_sales(db: firestore.Client = Depends(get_db)):
    sales_ref = db.collection("sales")
    # Order by created_at desc
    docs = sales_ref.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    
    sales = []
    for doc in docs:
        sale_data = doc.to_dict()
        sale_data["id"] = int(doc.id) if doc.id.isdigit() else doc.id
        sales.append(sale_data)
        
    return sales

@router.post("/", response_model=SaleResponse)
def create_sale(sale_data: SaleCreate, db: firestore.Client = Depends(get_db)):
    # Calculate total and reduce inventory
    total_amount = 0.0
    
    for item in sale_data.items:
        # Reduce inventory
        reduce_inventory(db, str(item.product_id), sale_data.city, item.quantity)
        total_amount += (item.quantity * item.unit_price)
        
    total_amount -= sale_data.discount_applied
    
    # Create Sale
    sales_ref = db.collection("sales")
    doc_ref = sales_ref.document()
    
    new_sale = {
        "customer_id": sale_data.customer_id,
        "type": sale_data.type,
        "total_amount": total_amount,
        "discount_applied": sale_data.discount_applied,
        "city": sale_data.city,
        "created_at": datetime.utcnow().isoformat(),
        "id": doc_ref.id,
        "items": []
    }
    
    # Add Sale Items into the sale document
    for item in sale_data.items:
        sale_item = {
            "sale_id": doc_ref.id,
            "product_id": item.product_id,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "id": f"{doc_ref.id}_{item.product_id}" # Simple item id
        }
        new_sale["items"].append(sale_item)
        
    doc_ref.set(new_sale)
    
    return new_sale
