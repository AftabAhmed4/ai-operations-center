import pandas as pd
from google.cloud import firestore

def get_regional_sales_summary(db: firestore.Client) -> str:
    """
    Fetches all sales and uses Pandas to group them by region.
    Returns a summarized JSON string to feed to the Insight Agent.
    """
    sales_docs = db.collection("sales").stream()
    sales_data = []
    
    for doc in sales_docs:
        data = doc.to_dict()
        sales_data.append({
            "city": data.get("city", "Unknown"),
            "total_amount": data.get("total_amount", 0.0),
            "type": data.get("type", "Unknown")
        })
        
    if not sales_data:
        return '{"message": "No sales data available"}'
        
    df = pd.DataFrame(sales_data, columns=["city", "total_amount", "type"])
    summary = df.groupby(["city", "type"])["total_amount"].sum().unstack(fill_value=0)
    
    # Calculate total revenue per city
    summary['Total Revenue'] = summary.sum(axis=1)
    return summary.to_json(orient='index')

def get_low_stock_summary(db: firestore.Client) -> str:
    """
    Fetches inventory and uses Pandas to identify low stock products per city.
    """
    products_docs = db.collection("products").stream()
    inventory_items = []
    
    for doc in products_docs:
        product = doc.to_dict()
        product_name = product.get("name", "Unknown")
        
        for inv in product.get("inventory", []):
            inventory_items.append({
                "city": inv.get("city", "Unknown"),
                "quantity": inv.get("quantity", 0),
                "low_stock_threshold": inv.get("low_stock_threshold", 5),
                "product_name": product_name
            })
            
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
