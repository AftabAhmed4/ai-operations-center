# Walkthrough: Phase 3 (AI Agents & Tooling Framework)

We have successfully implemented the Phase 3 backend core agents using the Gemini API. 

## Changes Made
- **Schemas**: Defined `IntakeClassification`, `InsightResult`, and `DecisionAction` using Pydantic in `app/schemas/agents.py` to strongly type inputs/outputs.
- **Guardrails**: Added `app/core/guardrails.py` to prevent out-of-scope requests or prompt injections using Gemini's structured outputs.
- **Analytics Tools**: Created `app/tools/analytics.py` using Pandas to query the database and summarize sales and inventory by city without exposing raw SQL to the LLM.
- **DB Tools**: Created `app/tools/db_tools.py` to provide agents quick lookups.
- **Intake Agent**: Classifies inputs and determines the domain and intent.
- **Insight Agent**: Merges user queries with real-time aggregate stats.
- **Decision Agent**: Decides the best course of action (e.g. `create_campaign`, `update_price`).
- **Execution Agent**: Takes the exact JSON action payloads and runs `SQLAlchemy` asynchronous operations to apply business state mutations.

## Data Persistence
I have saved the `implementation_plan`, `task`, and `walkthrough` artifacts for Phases 1, 2, and 3 directly inside the `d:\Tayyab\AISeekho-Hackathon\artifacts\` folder so you will not lose them upon restart.

## What's Next?
In **Phase 4**, we will wire these agents together in `app/workflows/orchestrator.py` to create a continuous pipeline, pausing at the `Pending Approval` state before the Execution Agent runs.
