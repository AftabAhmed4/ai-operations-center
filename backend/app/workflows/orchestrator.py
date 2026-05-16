import json
import asyncio
import os
from sqlalchemy.ext.asyncio import AsyncSession
from google import genai
from app.db.database import AsyncSessionLocal
from app.db.models import AIWorkflow, WorkflowStatus, AIActionLog
from app.streaming.sse_manager import sse_manager
from app.agents.intake import analyze_input
from app.agents.insight import generate_insights
from app.agents.decision import make_decision
from app.agents.execution import execute_action
from app.tools.analytics import get_regional_sales_summary, get_low_stock_summary

# It's recommended to initialize the client explicitly or let it pick up GEMINI_API_KEY from environment
client = genai.Client()

async def run_ai_pipeline(workflow_id: int, user_input: str):
    str_id = str(workflow_id)
    
    # Create an independent DB session for the background task
    async with AsyncSessionLocal() as db:
        workflow = await db.get(AIWorkflow, workflow_id)
        if not workflow:
            return
            
        try:
            await sse_manager.emit(str_id, "Parsing input...")
            # 1. Intake
            classification = analyze_input(client, user_input)
            
            await sse_manager.emit(str_id, "Analyzing sales and inventory data...")
            # 2. Insight
            sales_data = await get_regional_sales_summary(db)
            inventory_data = await get_low_stock_summary(db)
            insight = generate_insights(client, classification, sales_data, inventory_data)
            
            await sse_manager.emit(str_id, "Formulating action plan...")
            # 3. Decision
            decision = make_decision(client, insight)
            
            # Save decision to context
            workflow.context_data = decision.model_dump()
            workflow.status = WorkflowStatus.PENDING_APPROVAL
            await db.commit()
            
            await sse_manager.emit(str_id, "Awaiting approval")
            await sse_manager.emit(str_id, "Workflow paused")
            
        except Exception as e:
            workflow.status = WorkflowStatus.REJECTED
            await db.commit()
            await sse_manager.emit(str_id, f"Error: {str(e)}")

async def run_execution(workflow_id: int):
    str_id = str(workflow_id)
    
    async with AsyncSessionLocal() as db:
        workflow = await db.get(AIWorkflow, workflow_id)
        if not workflow or workflow.status != WorkflowStatus.APPROVED:
            return
            
        try:
            await sse_manager.emit(str_id, "Execution started...")
            
            # Re-construct DecisionAction from JSON
            from app.schemas.agents import DecisionAction
            decision = DecisionAction(**workflow.context_data)
            
            result_msg = await execute_action(db, decision)
            
            # Log action
            log = AIActionLog(
                workflow_id=workflow_id,
                action_category=decision.action_type,
                log_message=result_msg
            )
            db.add(log)
            
            workflow.status = WorkflowStatus.EXECUTED
            await db.commit()
            
            await sse_manager.emit(str_id, f"Action completed: {result_msg}")
            await sse_manager.emit(str_id, "Workflow completed")
            
        except Exception as e:
            workflow.status = WorkflowStatus.REJECTED
            await db.commit()
            await sse_manager.emit(str_id, f"Error: {str(e)}")
