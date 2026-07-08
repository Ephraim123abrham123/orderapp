# Architectural Decisions Summary

We have structured the application using a clean separation of concerns, choosing patterns that support loose coupling, easy testability, and fast iteration.

---

## 1. Backend Architecture: Ports and Adapters (Hexagonal)

The backend is structured to isolate our core business logic from external libraries, transport protocols, and frameworks:
* **Core / Domain**: Models (SQLAlchemy entities) and schemas (Pydantic models) represent our core concepts.
* **Services**: Orchestrates business rules (e.g. `OrderService`, `BulkImportService`). They do not speak HTTP or database dialects directly; they execute workflow processes.
* **Ports**: Abstract bases (e.g. `ExchangeRatePort`, `NotificationPort`, `TaskQueuePort`) define contracts.
* **Adapters**: Concrete implementations (e.g. `ExchangeRateAdapter` calling HTTPX, `WebSocketNotificationAdapter` broadcasting to sockets, `BackgroundTaskAdapter` using FastAPI BackgroundTasks).
* **Benefits**: In the future, we can change the database engine or swap out the local background task adapter for a distributed Celery queue without touching any service layer code.

---

## 2. Pluggable Metric Analytics Engine

Rather than hardcoding metric calculations inside routers, we implemented a pluggable **Metric Registry**:
* **MetricCalculator Port**: An abstract calculator taking `List[Order]` and outputting the computed metric.
* **Pluggable Calculators**: Isolated files for `RevenueTrendCalculator`, `StatusBreakdownCalculator`, and `TopCustomersCalculator`.
* **Central Registry**: Associates unique keys to instances. 
* **Extension**: Adding a new widget card requires writing a single isolated calculator class and registering it under `registry.py`—zero modifications to main analytics service pipelines.

---

## 3. Real-Time Synchronization Architecture

To build a zero-refresh dashboard, we chose an **Event-Driven WebSocket Model**:
1. **WebSocket Connection Manager**: Tracks active browser tabs, automatically clean-sweeps dead connections, and schedules heartbeats.
2. **Immediate Action Broadcast**: Any endpoint mutation (e.g., status changes or file uploads completing) triggers services to publish JSON event payloads.
3. **Reactive Query Invalidation**: Rather than mapping incoming socket packages directly into local react states (which bypasses cache and creates data desyncs), we use the WebSocket event to invalidate TanStack React Query queries. React Query refetches affected scopes behind the scenes, ensuring the entire view updates automatically and stays fully in sync with the database.

---

## 4. Frontend State & UI Decisions

* **Zustand**: Used for lightweight global UI states (sidebar status, active theme, global alert toast queue).
* **TanStack React Query**: Used for server-state caching, page mutations, and reactive cache invalidation.
* **SheetJS (xlsx)**: Parses selected spreadsheet files locally in-browser to preview the first 5 rows *before* transmitting bytes to the server, enhancing user confidence.
* **React Grid Layout**: Manages drag-and-drop coordinate arrays. Layout adjustments are debounced and saved in PostgreSQL using a JSONB column format associated with the user record.
