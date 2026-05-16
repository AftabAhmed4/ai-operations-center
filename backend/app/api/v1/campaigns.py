from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.database import get_db
from app.db.models import Campaign
from app.schemas.campaign import CampaignCreate, CampaignResponse

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

@router.get("/", response_model=List[CampaignResponse])
async def get_campaigns(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign))
    return result.scalars().all()

@router.post("/", response_model=CampaignResponse)
async def create_campaign(campaign_data: CampaignCreate, db: AsyncSession = Depends(get_db)):
    new_campaign = Campaign(**campaign_data.model_dump())
    db.add(new_campaign)
    await db.commit()
    await db.refresh(new_campaign)
    return new_campaign
