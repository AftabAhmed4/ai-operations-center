from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api.v1 import products, sales, campaigns, dashboard, streaming, operations

app = FastAPI(
    title="NexusForge AI Operations Center",
    description="Backend API for the autonomous AI operations center.",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "app": "NexusForge Backend"}

# Routers
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(sales.router, prefix="/api/v1")
app.include_router(campaigns.router, prefix="/api/v1")
app.include_router(streaming.router, prefix="/api/v1")
app.include_router(operations.router, prefix="/api/v1")
