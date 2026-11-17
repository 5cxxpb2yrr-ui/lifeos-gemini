# LifeOS — Operating System Foundation

## Architectural correction

The Mission Control UI is a projection of the operating system, not the system itself. Canonical history lives in an append-only SurrealDB event store. Current state is derived by replaying events through deterministic projectors. The UI must never become a second source of truth. The current web preview is local-first and stores its workspace in browser storage; it is not yet connected to the SurrealDB API.

## Canonical flow

`Capture / Command → Immutable Event → Projection → Resolver → Recommendation → User Action → Outcome Event`

The first implementation keeps the canonical record types to Event, Open Loop, Person, and Asset. Areas are editable classifications attached to these records, not separate workspaces. Relationships are explicit and symmetric. **Areas** describe ongoing parts of life (such as Health, Finances, Relationships, Work, and Home) and connect the same records; they do not become separate mini-applications. Goals, decisions, finance details, and notes can be represented as linked records or supporting data without expanding primary navigation.

## Product ethos

LifeOS should be simpler, more natural, and easier to navigate. Prefer familiar words over internal systems terminology. Keep the interface focused on what needs attention, and let the underlying model handle complexity. A feature belongs only when it reduces the effort of managing life. Do not add a new object type, workspace, metric, or workflow when an existing record and relationship can express the same thing.

## First backend vertical slice

- Append-only `life_event` records in SurrealDB.
- Rebuildable projection for the four canonical object types.
- Object create and update commands represented as events.
- Explicit relationship events.
- Loop completion emits an immutable outcome event and creates a linked historical Event projection.
- Universal Capture stores raw input as `capture.received`; interpretation is deliberately a later stage and cannot silently mutate canonical state.
- API routes are protected by a server-side bearer token. Never put this token in browser code.

## API

- `GET /health` — database connectivity.
- `GET /v1/state` — rebuilt current state and event count.
- `GET /v1/timeline` — immutable event history, newest first.
- `POST /v1/objects` — create Event, Open Loop, Person, or Asset.
- `PATCH /v1/objects/:id` — append an object update event.
- `POST /v1/objects/:id/relations` — link two existing objects.
- `POST /v1/loops/:id/complete` — complete a loop and create its outcome event.
- `POST /v1/capture` — preserve raw capture input.

## Runtime configuration

Set `SURREAL_URL`, `SURREAL_PASS`, and `LIFEOS_API_TOKEN`. Optional settings: `SURREAL_NAMESPACE` (default `lifeos`), `SURREAL_DATABASE` (default `main`), `SURREAL_USER` (default `root`), and `PORT` (default `8787`). Apply `services/api/schema.surql` once before starting the service.

Run with `pnpm --filter @lifeos/api test` and `pnpm --filter @lifeos/api start`.

## Invariants

1. Events are immutable; corrections are new events.
2. A projection can be deleted and rebuilt from event history.
3. A resolver owns each calculated value.
4. AI may interpret or propose; it cannot silently write canonical facts.
5. Every recommendation must cite the events and relationships that caused it.
6. The system must preserve provenance, timestamps, and source for imported or captured facts.

## Next vertical slices

1. Add schema validation and command idempotency.
2. Add projection snapshots and replay checkpoints for scale.
3. Add domain resolvers for life load, time, cash pressure, asset maintenance, and relationship attention.
4. Add a capture interpreter that proposes a typed change set for confirmation where confidence is low.
5. Connect the UI to the API; remove seeded records and browser-only canonical storage.
6. Add authentication and per-user data isolation before any real personal data is stored.
