from google.cloud import firestore

def get_product_by_sku(db: firestore.Client, sku: str) -> dict | None:
    docs = db.collection("products").where(filter=firestore.FieldFilter("sku", "==", sku)).limit(1).stream()
    docs_list = list(docs)
    if docs_list:
        data = docs_list[0].to_dict()
        data["id"] = docs_list[0].id
        return data
    return None

def get_product_by_name(db: firestore.Client, name: str) -> dict | None:
    # Firestore doesn't have ilike. We'll fetch all and filter in Python.
    # Note: Not efficient for large collections, but works for demo scale.
    docs = db.collection("products").stream()
    for doc in docs:
        data = doc.to_dict()
        if name.lower() in data.get("name", "").lower():
            data["id"] = doc.id
            return data
    return None

def get_inventory_for_product(db: firestore.Client, product_id: str):
    doc = db.collection("products").document(str(product_id)).get()
    if doc.exists:
        return doc.to_dict().get("inventory", [])
    return []

def get_active_campaigns(db: firestore.Client, region: str = None):
    query = db.collection("campaigns").where(filter=firestore.FieldFilter("is_active", "==", True))
    if region:
        query = query.where(filter=firestore.FieldFilter("region", "==", region))
    
    docs = query.stream()
    campaigns = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        campaigns.append(data)
    return campaigns
