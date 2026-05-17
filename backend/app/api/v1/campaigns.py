from fastapi import APIRouter, Depends, HTTPException
from google.cloud import firestore
from typing import List

from app.db.database import get_db
from app.schemas.campaign import CampaignCreate, CampaignResponse, CampaignUpdate

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("/", response_model=List[CampaignResponse])
def get_campaigns(db: firestore.Client = Depends(get_db)):
    campaigns_ref = db.collection("campaigns")
    docs = campaigns_ref.stream()
    
    campaigns = []
    for doc in docs:
        campaign_data = doc.to_dict()
        campaign_data["id"] = int(doc.id) if doc.id.isdigit() else doc.id
        campaigns.append(campaign_data)
        
    return campaigns

@router.post("/", response_model=CampaignResponse, status_code=201)
def create_campaign(campaign_data: CampaignCreate, db: firestore.Client = Depends(get_db)):
    campaigns_ref = db.collection("campaigns")
    doc_ref = campaigns_ref.document()
    
    new_campaign = campaign_data.model_dump()
    new_campaign["is_active"] = True  # Default value from old model
    new_campaign["id"] = doc_ref.id
    
    doc_ref.set(new_campaign)
    return new_campaign

@router.put("/{campaign_id}", response_model=CampaignResponse)
def update_campaign(campaign_id: str, payload: CampaignUpdate, db: firestore.Client = Depends(get_db)):
    doc_ref = db.collection("campaigns").document(str(campaign_id))
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    update_data = payload.model_dump(exclude_none=True)
    if update_data:
        doc_ref.update(update_data)
        
    updated_doc = doc_ref.get()
    return updated_doc.to_dict()

@router.delete("/{campaign_id}", status_code=204)
def delete_campaign(campaign_id: str, db: firestore.Client = Depends(get_db)):
    doc_ref = db.collection("campaigns").document(str(campaign_id))
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    doc_ref.delete()
    return

