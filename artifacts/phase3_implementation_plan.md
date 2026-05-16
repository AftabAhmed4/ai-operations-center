# Phase 3: AI Agents & Tooling Framework Implementation Plan

This document outlines the approach for building the multi-agent system utilizing the Gemini API and Google GenAI SDK for the NexusForge Operations Center.

## User Review Required

> [!IMPORTANT]
> Please review this plan for the Phase 3 implementation. It covers the creation of the core AI agents (Intake, Insight, Decision, Execution), guardrails, and tools.
> Once approved, I will begin execution and also create a permanent copy of this plan in your `d:\Tayyab\AISeekho-Hackathon\artifacts\` folder.

## Open Questions

> [!WARNING]
> - Do you already have a `GEMINI_API_KEY` configured in your `.env` file for the backend?
> - For the Pandas-aggregated JSON mentioned in the Insight Agent's scope, should we mock a simple data payload first, or rely on a specific `data_prep.py` function if it exists?

## Proposed Changes

### AI Agents Framework

We will create four distinct AI agents responsible for the core decision pipeline.

#### [NEW] `app/agents/intake.py`
- Implements the **Intake Agent**.
- **Role**: Takes raw input (text, news, csv context) and classifies the intent/domain of the request.
- Uses `google-genai` to parse input.

#### [NEW] `app/agents/insight.py`
- Implements the **Insight Agent**.
- **Role**: Merges the classified input with Pandas-aggregated JSON data.
- Detects anomalies, trends, or immediate business needs.

#### [NEW] `app/agents/decision.py`
- Implements the **Decision Agent**.
- **Role**: Consumes the insights and formulates actionable business events (e.g., pricing drops, campaign creation).
- Uses Gemini's Structured Outputs with **Pydantic** to ensure strictly formatted JSON.

#### [NEW] `app/agents/execution.py`
- Implements the **Execution Agent**.
- **Role**: Translates the Pydantic JSON decisions into expected database mutations (simulated).

### Guardrails & Tooling

#### [NEW] `app/core/guardrails.py`
- Implements strict system prompts and pre-checks to enforce business-only topics.
- Blocks out-of-scope requests or prompt injection attempts before they reach the main agents.

#### [NEW] `app/tools/db_tools.py` & `app/tools/analytics.py`
- Provide functions that the agents can optionally call or use to fetch context for the `Insight Agent`.

## Verification Plan

### Automated Tests / Manual Verification
- **Guardrails Test**: Send a non-business prompt (e.g., "Write a poem about the ocean") and ensure the system immediately rejects it.
- **Pydantic Output Test**: Pass a mock business scenario to the Decision Agent and verify the return payload exactly matches the expected schema.
- **End-to-End Flow**: Manually script a sequence calling Intake -> Insight -> Decision -> Execution to ensure data flows correctly between agents.
