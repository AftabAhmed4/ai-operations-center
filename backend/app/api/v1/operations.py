from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.db.models import AIWorkflow, WorkflowStatus
from app.schemas.operations import WorkflowTriggerRequest, WorkflowApproveRequest, WorkflowStatusResponse
from app.workflows.orchestrator import run_ai_pipeline, run_execution
from app.streaming.sse_manager import sse_manager

router = APIRouter(prefix="/workflows", tags=["Operations Center"])

@router.post("/trigger")
async def trigger_workflow(request: WorkflowTriggerRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    workflow = AIWorkflow(
        trigger_source=request.user_input,
        status=WorkflowStatus.PROCESSING
    )
    db.add(workflow)
    await db.commit()
    await db.refresh(workflow)
    
    # Start the orchestrator in the background
    background_tasks.add_task(run_ai_pipeline, workflow.id, request.user_input)
    
    return {"message": "Workflow started", "workflow_id": str(workflow.id)}

@router.get("/{workflow_id}/status", response_model=WorkflowStatusResponse)
async def get_workflow_status(workflow_id: int, db: AsyncSession = Depends(get_db)):
    workflow = await db.get(AIWorkflow, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return WorkflowStatusResponse(
        id=workflow.id,
        status=workflow.status.value,
        context_data=workflow.context_data
    )

@router.post("/{workflow_id}/approve")
async def approve_workflow(workflow_id: int, request: WorkflowApproveRequest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    workflow = await db.get(AIWorkflow, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    if workflow.status != WorkflowStatus.PENDING_APPROVAL:
        raise HTTPException(status_code=400, detail="Workflow is not pending approval")
        
    if request.approved:
        workflow.status = WorkflowStatus.APPROVED
        await db.commit()
        
        # Start execution in background
        background_tasks.add_task(run_execution, workflow.id)
        return {"message": "Workflow approved and executing"}
    else:
        workflow.status = WorkflowStatus.REJECTED
        await db.commit()
        await sse_manager.emit(str(workflow.id), "Workflow failed") # Closes stream
        return {"message": "Workflow rejected"}
