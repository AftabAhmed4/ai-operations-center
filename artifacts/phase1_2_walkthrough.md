# Walkthrough: Backend Phases 1 & 2

I have successfully initialized the backend foundation and built out the core CRUD endpoints.

## Phase 1: Framework & Database
- **Environment**: Setup `uv` virtual environment and installed all dependencies (`fastapi`, `sqlalchemy`, `aiomysql`, `alembic`, `pydantic`, etc.)
- **Models**: Created Async SQLAlchemy models for `Product`, `Inventory`, `Sale`, `Campaign`, and `AIWorkflow`.
- **Migrations**: Generated the Alembic setup for asynchronous MySQL migrations.
- **Config**: Created `.env.example` and `app/core/config.py` for cloud MySQL credentials.

## Phase 2: Core CRUD APIs & Business Logic
- **Schemas**: Defined all data validation schemas in `app/schemas/` (Products, Sales, Campaigns, Dashboard).
- **Business Logic**: Created `app/services/inventory.py` to automatically deduct regional inventory stock when a new sale is created.
- **Routers**: Implemented the primary REST API endpoints in `app/api/v1/`:
  - `GET /api/v1/dashboard/metrics` — Returns total revenue, active campaigns, and low stock alerts.
  - `GET /api/v1/products` — Fetches products with attached inventory data.
  - `PUT /api/v1/products/{id}/price` — Allows updating base prices and sets the `ai_updated_at` timestamp.
  - `POST /api/v1/sales` — Creates a sale, registers sale items, and triggers inventory deduction logic.
  - `GET /api/v1/campaigns` & `POST /api/v1/campaigns` — Manages regional AI campaigns.
- **Registration**: Mounted all the routers into `app/main.py`.

## Next Steps
You now have a fully functional operational backend API! To test it out, you must first set up your `.env` file.

> [!IMPORTANT]
> When you edit the `.env` file with real MySQL cloud credentials, make sure to run the following command to apply the database migrations:
> ```bash
> uv run alembic upgrade head
> ```

After running migrations, start the application:
```bash
uv run uvicorn app.main:app --reload
```
You can then access the interactive API docs at `http://localhost:8000/docs`.
