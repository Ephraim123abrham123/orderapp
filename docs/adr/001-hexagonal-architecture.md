# ADR 001: Adoption of Hexagonal (Ports & Adapters) Architecture

*   **Status**: Accepted
*   **Date**: 2026-07-21

## Context and Problem Statement

The application requires core business services (e.g. creating orders, validating spreadsheet imports, computing dashboard analytics) to remain highly maintainable, testable, and independent of external technologies. If business logic is directly coupled to specific databases (Postgres), background task frameworks, or external network services (currency conversion APIs), it becomes extremely difficult to:
1. Write fast, reliable unit tests without configuring complex database mock environments.
2. Swap out infrastructure components (e.g., migrating from FastAPI BackgroundTasks to Celery/Redis, or switching database drivers).
3. Prevent framework upgrades from breaking core domain logic.

## Alternatives Considered

### 1. Traditional Three-Tier Layered Architecture (Controller-Service-DAO)
*   **Pros**: Simple structure, low boilerplate, widely understood.
*   **Cons**: Services directly depend on the database layer and ORM entities. Business logic becomes scattered with SQL queries and ORM transaction flushes, making unit testing services in isolation difficult.

### 2. Clean/Onion Architecture
*   **Pros**: Strong domain isolation, dependency inversion, very strict boundaries.
*   **Cons**: Excessive abstraction layers (Entities, Use Cases, Presenters) that introduce unnecessary complexity for an order dashboard of this size.

## Decision

We chose **Hexagonal Architecture (Ports & Adapters)**. 

Business logic resides inside core **Services** (`app/services/`), which interact with infrastructure through abstract **Ports** (`app/adapters/*/base.py`). The actual external integrations—such as SQL repositories, CSV/Excel parsers, HTTP API conversion requests, and WebSocket broadcasters—are implemented as concrete **Adapters** (`app/adapters/` and `app/repositories/`).

```
                +-------------------------------------------------+
                |                   Adapters                      |
                |  [FastAPI HTTP]  [WebSocket ConnectionManager]  |
                +-----------------------+-------------------------+
                                        |
                                        v
                +-----------------------+-------------------------+
                |                     Ports                       |
                |   [ExchangeRatePort]      [NotificationPort]    |
                +-----------------------+-------------------------+
                                        |
                                        v
                +-----------------------+-------------------------+
                |                   Services                      |
                |   [OrderService]       [BulkImportService]      |
                +-----------------------+-------------------------+
                                        |
                                        v
                +-----------------------+-------------------------+
                |                  Repositories                   |
                |   [OrderRepository]    [UserRepository]         |
                +-------------------------------------------------+
```

## Consequences

### Pros
*   **Decoupled Infrastructure**: Domain code is completely unaware of libraries like `openpyxl`, `httpx`, or `websockets`.
*   **High Unit Testability**: We can write pure unit tests for `OrderService` or `BulkImportService` in milliseconds by passing mock adapters instead of hitting live endpoints.
*   **Resilience & Graceful Degradation**: Infrastructure fallbacks (like caching or hardcoded currency values) can be handled inside adapters without dirtying business rule service functions.

### Cons
*   **Structural Boilerplate**: Requires creating abstract base classes (Ports) and implementing corresponding adapter mapping overrides.
*   **Slight Overhead**: Additional mapping layers (converting ORM models to schemas and back) add small runtime memory and file structure overhead.
