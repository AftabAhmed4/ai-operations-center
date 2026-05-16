# Phase 4: Operations Center Workflow & State Management

This phase focuses on connecting the AI agents built in Phase 3 into a cohesive pipeline, managing the pause-and-resume state for human approval, and broadcasting events to the SSE stream built in Phase 5.

## User Review Required

> [!IMPORTANT]
> Please review this plan for Phase 4. This is the final piece of the backend puzzle! It wires all your agents together and hooks them into the streaming backbone. Once you approve, I will implement the orchestrator, update the progress checklist, and create the permanent artifacts in your `artifacts/` folder.

## Proposed Changes

### 1. Operations Router

#### [NEW] `app/api/v1/operations.py`
We will expose the endpoints required to trigger and manage AI workflows:
- `POST /api/v1/workflows/trigger`: Takes the unstructured user input, creates an `AIWorkflow` record in the database with status `PROCESSING`, and starts the orchestrator in the background using `FastAPI.BackgroundTasks`. It returns the `workflow_id` to the frontend so it can immediately connect to the SSE endpoint.
- `GET /api/v1/workflows/{id}/status`: Fetches the current database status and context data of a workflow.
- `POST /api/v1/workflows/{id}/approve`: Accepts an approval or rejection. If approved, changes the status to `APPROVED` and runs the execution task in the background.

#### [MODIFY] `app/main.py`
- Register the new `operations.py` router.

### 2. The Orchestrator

#### [NEW] `app/workflows/orchestrator.py`
This will contain the core background functions that drive the agents and emit SSE logs:
- `run_ai_pipeline(workflow_id, user_input, db)`:
  1. Emits `"Parsing input..."` to SSE. Calls `Intake Agent`.
  2. Emits `"Analyzing sales and inventory data..."`. Uses `db_tools` and `analytics` to fetch metrics. Calls `Insight Agent`.
  3. Emits `"Formulating action plan..."`. Calls `Decision Agent`.
  4. Saves the resulting `DecisionAction` JSON into the workflow's `context_data` column.
  5. Updates workflow status to `PENDING_APPROVAL`.
  6. Emits `"Awaiting approval"` and cleanly pauses.
  
- `run_execution(workflow_id, db)`:
  1. Fetches the `DecisionAction` from the workflow context.
  2. Emits `"Execution started..."` to SSE.
  3. Calls `Execution Agent` to perform the database update.
  4. Creates an `AIActionLog` entry to record the event.
  5. Updates workflow status to `EXECUTED`.
  6. Emits `"Workflow completed"` to cleanly close the SSE stream.

## Verification Plan

### Automated Tests / Manual Verification
- **Full Pipeline Test**: I will create a temporary scratch script that hits the `/trigger` endpoint, listens to the SSE stream to see the agents thinking, and then hits the `/approve` endpoint to verify the execution and final database state change.
