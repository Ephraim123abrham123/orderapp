# Architecture Decisions Document (ADD)

This document outlines the core architectural patterns, design principles, and technical decisions implemented in **orderapp**.

---

## 1. Architectural Style: Hexagonal (Ports & Adapters)

To ensure the long-term maintainability, testability, and decouple our business logic from external libraries, we adopted the **Hexagonal (Ports and Adapters) Architecture**.

```
                         +----------------------------------------+
                         |                Adapters                |
                         |  [Web/HTTP]   [WebSocket]  [Spreadsheet]|
                         +-------------------+--------------------+
                                             |
                                             v
                         +-------------------+--------------------+
                         |                 Ports                  |
                         |  [Notification] [TaskQueue] [Converter]|
                         +-------------------+--------------------+
                                             |
                                             v
                         +-------------------+--------------------+
                         |                Services                |
                         |  [OrderService]   [BulkImportService]  |
                         +-------------------+--------------------+
                                             |
                                             v
                         +-------------------+--------------------+
                         |             Repository                 |
                         |  [OrderRepo]      [UserRepo]           |
                         +----------------------------------------+
```

### Key Layers:
1. **Core Domain (Models & Schemas)**: Pure representations of data structures (SQLAlchemy models) and validation constraints (Pydantic models). They are framework-agnostic.
2. **Repository Layer**: Encapsulates all raw SQL/ORM query transactions (e.g. `OrderRepository`). Services never construct database queries directly.
3. **Services**: Contains the core business logic and orchestration rules (e.g., coordinates order validation, conversion calculations, and broadcast updates).
4. **Ports**: Abstract interfaces (defined via Python `abc.ABCMeta`) establishing strict interaction contracts for external communications.
5. **Adapters**: Concrete implementations of Ports (e.g., `ExchangeRateAdapter` calling the external API, `WebSocketNotificationAdapter` broadcasting payloads).

* **Decision Rationale**: By isolating business logic from drivers, we can swap out the database engine (e.g. migrate to CockroachDB) or the background task provider (e.g. migrate from FastAPI BackgroundTasks to a celery/redis queue) without changing any code in the service layer.

---

## 2. Real-Time Synchronization Protocol

Rather than relying on resource-intensive REST polling or complex server-sent event (SSE) channels, we chose an **Event-Driven WebSocket Model**:

* **Connection Registry**: The backend `ConnectionManager` accepts authenticated socket client streams, manages heartbeats, and cleans up inactive/disconnected connections.
* **Immediate Broadcast**: When a mutation occurs (order created, status changed, bulk import finishes), the service triggers `broadcast_order_status_change` using the notification adapter.
* **Reactive Client-Side Invalidation**: 
  Instead of mapping socket event payloads directly into local React state (which risk getting out of sync with paginated data), the frontend `useWebSocket.tsx` hook catches the event and triggers **TanStack React Query Cache Invalidation**. 
  React Query automatically fetches the fresh dataset in the background, updating all data grids and KPI summary panels reactively and concurrently across all connected browser sessions without requiring page reloads.

---

## 3. Pluggable Metrics Analytics Engine

To calculate dashboard KPIs and chart values dynamically, we avoided hardcoding calculations inside controllers. Instead, we implemented a **Metrics Calculator Registry**:

* **Design**: An abstract `MetricCalculator` base defines the structure. Concrete subclasses (`RevenueTrendCalculator`, `StatusBreakdownCalculator`, `TopCustomersCalculator`) implement their specific queries and aggregation logic.
* **Registry**: A central registry maps calculator keys to instances. 
* **Decision Rationale**: To add a new dashboard widget or calculation, a developer only needs to write a new calculator class and register it. The main analytical service logic remains entirely untouched, adhering to the Open-Closed Principle.

---

## 4. Database Schema & Concurrency

The database is built on **PostgreSQL 15** and managed using **Alembic** migrations.

* **Indexing for High Lookups**: We added database indexes on the `customer_name` and `status` columns of the `orders` table. These columns are heavily queried during pagination, search, and status updates.
* **ORM Lazy Loading Prevention**: In SQLAlchemy async configurations, accessing database-generated columns (like `updated_at` on modification flushes) outside of an awaited session context raises a `MissingGreenlet` error. To avoid this, our repositories explicitly call `await self.db.refresh(obj)` right after flushes to fetch database-generated values under the active transaction before rendering.

---

## 5. Third-Party Integrations & Resilience

Our system calculates the USD value of foreign currencies dynamically.

* **Primary Adapter**: Integrates with the open `ExchangeRate-API`.
* **Graceful Degradation (Resilience)**: If the API times out or is offline, the adapter catches the exception, logs it, and falls back to a locally stored, hardcoded exchange rate dictionary (e.g., `EUR -> USD = 1.09`, `GBP -> USD = 1.28`). This ensures the creation of orders never fails, and dashboard operations remain 100% online.
