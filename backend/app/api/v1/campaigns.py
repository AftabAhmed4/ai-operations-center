from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.database import get_db
from app.db.models import Campaign
from app.schemas.campaign import CampaignCreate, CampaignResponse, CampaignUpdate

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("/", response_model=List[CampaignResponse])
async def get_campaigns(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign))
    return result.scalars().all()

@router.post("/", response_model=CampaignResponse, status_code=201)
async def create_campaign(campaign_data: CampaignCreate, db: AsyncSession = Depends(get_db)):
    new_campaign = Campaign(**campaign_data.model_dump())
    db.add(new_campaign)
    await db.commit()
    await db.refresh(new_campaign)
    return new_campaign

@router.put("/{campaign_id}", response_model=CampaignResponse)
async def update_campaign(campaign_id: int, payload: CampaignUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign).filter(Campaign.id == campaign_id))
    campaign = result.scalars().first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    update_data = payload.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(campaign, key, value)
    await db.commit()
    await db.refresh(campaign)
    return campaign

@router.delete("/{campaign_id}", status_code=204)
async def delete_campaign(campaign_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign).filter(Campaign.id == campaign_id))
    campaign = result.scalars().first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    await db.delete(campaign)
    await db.commit()

