# NexusForge API Integration Guide

This document outlines the REST and SSE endpoints available in the backend. The frontend agent can use this as a reference for integrating the React Native application.

All endpoints are prefixed with: `http://localhost:8000` (or your respective production/dev URL).

---

## 1. Dashboard

### `GET /api/v1/dashboard/metrics`
Fetches high-level operational metrics for the dashboard cards.
- **Response**:
  ```json
  {
    "total_revenue": 150000,
    "total_orders": 45,
    "active_campaigns": 2,
    "low_stock_alerts": 3
  }
  ```

---

## 2. Products & Inventory

### `GET /api/v1/products`
Returns a list of all products along with their regional inventory counts.
- **Response**: Array of product objects.

### `PUT /api/v1/products/{id}/price`
Updates the base price of a specific product.
- **Body**: `{"price": 199.99}`
- **Response**: Success message and updated product details.

---

## 3. Sales

### `POST /api/v1/sales`
Creates a new sale and automatically deducts stock from the specified regional inventory.
- **Body**:
  ```json
  {
    "customer_id": 1,
    "type": "Walk-in",
    "total_amount": 5000,
    "discount_applied": 0,
    "city": "Lahore",
    "items": [
      {"product_id": 1, "quantity": 1, "unit_price": 5000}
    ]
  }
  ```
- **Response**: `{"message": "Sale recorded successfully", "sale_id": 12}`

---

## 4. Campaigns

### `GET /api/v1/campaigns`
Fetches all active marketing campaigns.
- **Response**: Array of campaign objects.

### `POST /api/v1/campaigns`
Manually creates a new campaign (though the AI can also do this autonomously).
- **Body**:
  ```json
  {
    "name": "Summer Sale",
    "coupon_code": "SUMMER10",
    "discount_percent": 10.0,
    "region": "Karachi"
  }
  ```

---

## 5. Operations Center (AI Workflows)

These endpoints run the core AI orchestration pipeline.

### `POST /api/v1/workflows/trigger`
Triggers a new AI workflow from natural language input. Starts the orchestrator in the background.
- **Body**:
  ```json
  {
    "user_input": "Sales in Lahore are dropping, what should we do?"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Workflow started",
    "workflow_id": "1"
  }
  ```
*Note: Immediately after calling this, the frontend should connect to the SSE endpoint below using the returned `workflow_id`.*

### `GET /api/v1/workflows/{id}/status`
Fetches the current status of the workflow, and importantly, retrieves the `DecisionAction` JSON payload when the status is `PENDING_APPROVAL`.
- **Response**:
  ```json
  {
    "id": 1,
    "status": "PENDING_APPROVAL",
    "context_data": {
      "action_type": "create_campaign",
      "details": {"name": "Lahore Boost", "discount_percent": 15},
      "justification": "Sales in Lahore dropped 20%, a targeted discount will increase volume."
    }
  }
  ```

### `POST /api/v1/workflows/{id}/approve`
Approves or rejects the pending AI decision.
- **Body**:
  ```json
  {
    "approved": true
  }
  ```
- **Response**: `{"message": "Workflow approved and executing"}`

---

## 6. Live Streaming (SSE)

### `GET /api/v1/streaming/workflow/{workflow_id}`
A Server-Sent Events (SSE) endpoint that streams real-time text logs of what the AI is thinking and doing.
- **Connection Type**: Standard HTTP connection with `Accept: text/event-stream`.
- **Events Yielded**:
  ```text
  data: Parsing input...

  data: Analyzing sales and inventory data...

  data: Formulating action plan...

  data: Awaiting approval

  data: Workflow paused
  ```
*Note: When the client calls `/approve` to resume the workflow, this same stream will continue emitting the final execution logs until it sends `data: Workflow completed`, at which point the connection cleanly closes.*
