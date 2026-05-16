# Backend Implementation Plan: Autonomous AI Operations Center (NexusForge)

This document outlines the implementation plan for the backend of the NexusForge Autonomous AI Operations Center. The architecture is designed to support a lightweight, fast, and highly traceable workflow, prioritizing AI orchestration, live status streaming, and business state mutation.

## 1. Backend Architecture Stack
- **Environment Management**: `uv` (for fast Python virtual environment initialization)
- **Web Framework**: FastAPI (high performance, built-in async and Pydantic support)
- **AI Orchestration**: Google Agent Development Kit (ADK) / Google GenAI SDK with Gemini API
- **Database**: MySQL (relational operational data)
- **ORM & Migrations**: SQLAlchemy (async preferred) + Alembic
- **Data Processing (AI Input Layer)**: Pandas & NumPy (aggregation and analysis to prevent passing raw tabular data to LLMs)
- **Data Validation**: Pydantic
- **Live Streaming**: Server-Sent Events (SSE) via `fastapi-sse` or native `StreamingResponse`

---

## 2. Folder Structure

```text
/backend
├── alembic/                 # Database migrations
├── app/
│   ├── agents/              # Multi-agent definitions (Intake, Insight, Decision, Execution)
│   ├── api/                 # FastAPI routes (routers)
│   │   └── v1/              
│   │       ├── dashboard.py
│   │       ├── operations.py
│   │       ├── products.py
│   │       ├── campaigns.py
│   │       ├── sales.py
│   │       └── streaming.py # SSE endpoints
│   ├── core/                # Configuration and environment variables
│   │   ├── config.py
│   │   ├── guardrails.py    # AI topic enforcement
│   │   └── exceptions.py    # Global error handling
│   ├── db/                  # Database connection and Base models
│   │   ├── database.py
│   │   └── models.py        # SQLAlchemy models
│   ├── schemas/             # Pydantic models (Input/Output/Agent Structured Outputs)
│   ├── services/            # Business logic
│   │   ├── data_prep.py     # Pandas data preprocessing layer
│   │   ├── inventory.py     # Inventory deduction logic
│   │   └── campaigns.py     # Campaign logic
│   ├── tools/               # Tools exposed to AI agents
│   │   ├── db_tools.py
│   │   └── analytics.py
│   ├── workflows/           # Orchestration logic linking agents together
│   │   └── orchestrator.py
│   ├── streaming/           # SSE connection manager
│   │   └── sse_manager.py
│   └── main.py              # FastAPI application entry point
├── pyproject.toml           # uv project configuration and dependencies
├── alembic.ini              # Alembic configuration
└── requirements.txt
```

---

## 3. Database Models (SQLAlchemy)

- **Product**: `id`, `name`, `sku`, `base_price`, `category`, `ai_updated_at`
- **Inventory**: `id`, `product_id`, `city` (Karachi, Lahore, Islamabad), `quantity`, `low_stock_threshold`
- **Sale**: `id`, `customer_id` (optional), `type` (Walk-in, Online), `total_amount`, `discount_applied`, `city`, `created_at`
- **SaleItem**: `id`, `sale_id`, `product_id`, `quantity`, `unit_price`
- **Campaign**: `id`, `name`, `coupon_code`, `discount_percent`, `region`, `is_active`, `ai_generated`, `projected_impact`
- **AIWorkflow**: `id`, `trigger_source`, `status` (Processing, Pending Approval, Approved, Rejected, Executed), `context_data` (JSON)
- **AIActionLog**: `id`, `workflow_id`, `action_category`, `log_message`, `before_state` (JSON), `after_state` (JSON), `timestamp`

---

## 4. Implementation Phases

### Phase 1: Foundation & Data Layer
**Objective**: Scaffold the application, configure the database, and build the analytical preprocessing layer.
- **Implementation Scope**: Set up `uv` virtual environment, configure FastAPI, set up MySQL connection, build SQLAlchemy models, configure Alembic, and create basic seed data. Implement the Pandas layer that queries tables and exports aggregated JSON summaries.
- **Files Involved**: `app/db/models.py`, `app/db/database.py`, `app/services/data_prep.py`, `alembic/env.py`.
- **Dependencies**: `fastapi`, `sqlalchemy`, `pymysql`, `alembic`, `pandas`, `numpy`.
- **APIs**: None directly (foundation for next phases).
- **Testing Checklist**:
  - [ ] Migrations run successfully against MySQL.
  - [ ] Seed data populates correctly.
  - [ ] Pandas service correctly generates regional summaries without exposing raw tables.

### Phase 2: Standard Operations APIs (No AI Yet)
**Objective**: Establish the core operational endpoints to power the mobile dashboard and sales features.
- **Implementation Scope**: Build CRUD endpoints for Products, Sales, Campaigns, and the Dashboard aggregates.
- **Files Involved**: `app/api/v1/*.py`, `app/services/inventory.py`.
- **Dependencies**: `pydantic`.
- **APIs**:
  - `GET /api/v1/dashboard/metrics`
  - `GET /api/v1/products`
  - `POST /api/v1/sales` (Contains inventory deduction logic)
  - `GET /api/v1/campaigns`
- **Testing Checklist**:
  - [ ] Creating a sale automatically reduces the correct inventory location.
  - [ ] Dashboard metrics reflect accurate numbers.

### Phase 3: AI Agents & Tooling Framework
**Objective**: Build the multi-agent system utilizing the Gemini API and Google ADK.
- **Implementation Scope**:
  - **Intake Agent**: Classifies inputs (news, csv, text).
  - **Insight Agent**: Merges user input with Pandas-aggregated JSON to detect anomalies.
  - **Decision Agent**: Formulates actions (e.g., pricing drops, campaign creation) and returns strictly validated Pydantic JSON.
  - **Execution Agent**: Translates JSON decisions into simulated database updates.
- **Files Involved**: `app/agents/*.py`, `app/tools/*.py`, `app/core/guardrails.py`.
- **Dependencies**: `google-genai` (or equivalent ADK), `pydantic`.
- **Testing Checklist**:
  - [ ] Guardrails effectively block out-of-scope requests (e.g., prompt injection).
  - [ ] Agents output perfectly structured JSON matching Pydantic schemas.

### Phase 4: Operations Center Workflow & State Management
**Objective**: Connect the agents into a linear workflow pipeline with approval gates.
- **Implementation Scope**: Build the orchestrator that passes data from Intake -> Insight -> Decision. Pause the workflow and mark it `Pending Approval` in the database. Expose endpoints for the frontend to approve/reject the proposed actions. When approved, trigger the Execution Agent.
- **Files Involved**: `app/workflows/orchestrator.py`, `app/api/v1/operations.py`.
- **APIs**:
  - `POST /api/v1/workflows/trigger`
  - `GET /api/v1/workflows/{id}/status`
  - `POST /api/v1/workflows/{id}/approve`
- **Testing Checklist**:
  - [ ] System stops and persists state when requiring human approval.
  - [ ] Approval correctly resumes the process and mutates the database.
  - [ ] Dashboard metrics update immediately post-execution.

### Phase 5: Live Workflow Tracing (SSE)
**Objective**: Stream real-time logs to the frontend as the agents think and execute.
- **Implementation Scope**: Implement Server-Sent Events. The Orchestrator will emit events to an `SSEManager`, which pushes them to the connected client.
- **Files Involved**: `app/streaming/sse_manager.py`, `app/api/v1/streaming.py`.
- **APIs**: `GET /api/v1/streaming/workflow/{id}`
- **Testing Checklist**:
  - [ ] Frontend can connect and receive distinct streaming steps ("Parsing input...", "Analyzing inventory...", "Awaiting approval").
  - [ ] Connection cleanly closes when the workflow ends or pauses.

---

## 5. Core Architectural Concepts

### AI Data Processing Rules & Guardrails
- **Pandas Preprocessing Layer**: LLMs will **never** receive direct `SELECT * FROM sales` data. A dedicated service uses Pandas to group, aggregate, and calculate percentage changes. The output is a highly compressed JSON payload sent to the Insight Agent.
- **Guardrails**: System prompts are strictly injected into every agent. `app/core/guardrails.py` intercepts incoming requests and immediately aborts if it detects non-business topics.

### Approval System & Execution Simulation
- The **Decision Agent** generates an action payload (e.g., `{"action": "create_campaign", "details": {...}}`). 
- The orchestrator saves this payload to the `AIWorkflow` table and pauses.
- When the frontend calls the approval endpoint, the **Execution Agent** reads the payload and performs a database transaction.
- **Before vs After State**: The Execution Agent captures the `Product` state *before* the transaction and *after* the transaction, storing both in `AIActionLog` so the frontend can visualize the exact impact.

### Live Workflow Tracing (SSE Streaming)
- A singleton `SSEManager` using `asyncio.Queue` handles active connections.
- Throughout the Python orchestrator script, explicit calls like `await sse_manager.emit(workflow_id, "Extracting insights from data...")` are used.
- This creates the highly desirable "AI is thinking and acting" visual effect on the frontend.

### Error Handling Strategy
- **Validation Errors**: Pydantic handles input schema validation. 
- **LLM Parse Failures**: If an LLM returns invalid JSON, the orchestrator includes a retry loop (max 2 retries) asking the LLM to fix the structure.
- **API Errors**: A global exception handler returns standard formatted JSON errors to the frontend.
- **State Failures**: Database transactions use SQLAlchemy's `session.begin()`. If the Execution Agent fails mid-update, the transaction rolls back, and an error state is emitted via SSE.
