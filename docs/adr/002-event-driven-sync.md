# ADR 002: Event-Driven Real-Time State Synchronization

*   **Status**: Accepted
*   **Date**: 2026-07-21

## Context and Problem Statement

In a multi-user real-time order dashboard, operations (like creating/updating orders or completing bulk spreadsheet uploads) modified by one user must be displayed instantly on other users' dashboard screens. We need a real-time synchronization strategy that:
1. Keeps visual lists, charts, and metrics accurate.
2. Handles complex client states like paginated grids, status filter dropdowns, and search terms.
3. Minimizes network overhead and duplicate client state parsing logic.

## Alternatives Considered

### 1. HTTP Short Polling / Long Polling
*   **Pros**: Trivial to implement, standard HTTP requests.
*   **Cons**: Extremely resource-intensive. Constant server hits overload the database connection pools and drain mobile devices' batteries even when no operational updates occur.

### 2. Direct State Pushing over WebSockets
*   **Pros**: Lowest latency, zero subsequent REST API hits.
*   **Cons**: High complexity. When a socket receives a modified order model, it must merge it into a local memory array. If the user has active text filters, pagination (e.g., page 2), or sorting (e.g., sort by revenue descending), the client must duplicate the backend's sorting, pagination, and filtering logic to maintain consistency.

### 3. Server-Sent Events (SSE)
*   **Pros**: Unidirectional streaming natively supported by browsers.
*   **Cons**: Unidirectional only (cannot send client pings easily over the same channel), and does not support bidirectional signaling if future dashboard capabilities require it.

## Decision

We chose an **Event-Driven Cache Invalidation model using WebSockets + TanStack React Query**.

```
[ User Updates Order status ] ──> [ DB Updated ] ──> [ WebSocket Adapter ]
                                                              │
                                                              v
                                                      [ Broadcast Event ]
                                                              │
                                                              v
[ React Query fetches fresh data ] <── [ Invalidate Cache ] <── [ useOrders hook ]
```

1. **State Mutation**: When a status change or file import completes, the backend publishes a lightweight event (e.g. `order_status_changed` or `bulk_import_complete`) via the WebSocket connection manager.
2. **Hook Interception**: Frontend React hooks (`useOrders`, `useAnalytics`, `useBulkImport`) listen to these events.
3. **Cache Invalidation**: Upon event capture, the client triggers `queryClient.invalidateQueries({ queryKey: [...] })`.
4. **Refetch**: React Query triggers an async background HTTP GET request to pull the fresh, sorted, and filtered dataset. The single source of truth remains the database.

## Consequences

### Pros
*   **Consistent Client State**: Paginated tables and aggregated chart widgets never drift out of sync since they are recalculated directly from the server.
*   **Minimal Client State Logic**: The client does not need to duplicate complex sorting or searching logic.
*   **Low Socket Payload**: Sockets broadcast small event notification messages rather than large data structures.

### Cons
*   **Extra HTTP Request**: Invalidation triggers a subsequent GET request. However, since mutations are sparse compared to reads, the overhead is negligible and far lower than constant polling.
*   **WebSocket Dependency**: Requires setting up and maintaining connection heartbeats and reconnection timers on client disconnects.
