from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from google.cloud import firestore
from datetime import datetime

from app.db.database import get_db
from app.schemas.enums import WorkflowStatus
from app.schemas.operations import WorkflowTriggerRequest, WorkflowApproveRequest, WorkflowStatusResponse
from app.workflows.orchestrator import run_ai_pipeline, run_execution
from app.streaming.sse_manager import sse_manager

router = APIRouter(prefix="/workflows", tags=["Operations Center"])

@router.post("/trigger")
def trigger_workflow(request: WorkflowTriggerRequest, background_tasks: BackgroundTasks, db: firestore.Client = Depends(get_db)):
    doc_ref = db.collection("workflows").document()
    
    workflow_data = {
        "trigger_source": request.user_input,
        "status": WorkflowStatus.PROCESSING.value,
        "context_data": None,
        "created_at": datetime.utcnow().isoformat(),
        "id": doc_ref.id
    }
    
    doc_ref.set(workflow_data)
    
    # Start the orchestrator in the background
    background_tasks.add_task(run_ai_pipeline, doc_ref.id, request.user_input)
    
    return {"message": "Workflow started", "workflow_id": doc_ref.id}

@router.get("/{workflow_id}/status", response_model=WorkflowStatusResponse)
def get_workflow_status(workflow_id: str, db: firestore.Client = Depends(get_db)):
    doc = db.collection("workflows").document(str(workflow_id)).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    workflow_data = doc.to_dict()
    
    return WorkflowStatusResponse(
        id=workflow_data.get("id", workflow_id),
        status=workflow_data.get("status"),
        context_data=workflow_data.get("context_data")
    )

@router.post("/{workflow_id}/approve")
def approve_workflow(workflow_id: str, request: WorkflowApproveRequest, background_tasks: BackgroundTasks, db: firestore.Client = Depends(get_db)):
    doc_ref = db.collection("workflows").document(str(workflow_id))
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    workflow_data = doc.to_dict()
        
    if workflow_data.get("status") != WorkflowStatus.PENDING_APPROVAL.value:
        raise HTTPException(status_code=400, detail="Workflow is not pending approval")
        
    if request.approved:
        doc_ref.update({"status": WorkflowStatus.APPROVED.value})
        
        # Start execution in background
        background_tasks.add_task(run_execution, workflow_id)
        return {"message": "Workflow approved and executing"}
    else:
        doc_ref.update({"status": WorkflowStatus.REJECTED.value})
        # Note: sse_manager.emit is async, we can't await it here unless the route is async.
        # But we made the route sync. We can run it in event loop or background task.
        background_tasks.add_task(emit_rejection, workflow_id)
        return {"message": "Workflow rejected"}

async def emit_rejection(workflow_id: str):
    await sse_manager.emit(str(workflow_id), "Workflow failed") # Closes stream
