from pydantic import BaseModel
from typing import Optional, Dict, Any

class WorkflowTriggerRequest(BaseModel):
    user_input: str

class WorkflowApproveRequest(BaseModel):
    approved: bool

class WorkflowStatusResponse(BaseModel):
    id: int
    status: str
    context_data: Optional[Dict[str, Any]] = None
