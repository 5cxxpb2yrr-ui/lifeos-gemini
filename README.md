# LifeOS — Personal Operating System

LifeOS is an event-driven personal operating system. Mission Control is a projection of the system, not its source of truth.

## Architecture

- **Web:** React + TypeScript + Vite + Tailwind + Zustand
- **API:** Node.js HTTP service (native runtime; no framework overhead)
- **Database:** SurrealDB, with an append-only event history and rebuildable projections
- **Workspace:** pnpm + Turborepo

The canonical record types are Event, Open Loop, Person, and Asset. Commands append immutable events; deterministic projectors rebuild current state. The UI must not become a second source of truth.

## Run the API locally

1. Copy `.env.example` to `.env`.
2. Change `SURREAL_PASS` and `LIFEOS_API_TOKEN` to private values.
3. Start the database and API:

```sh
docker compose up --build
```

The API listens on `http://localhost:8787`. Its schema is initialized automatically.

- `GET /health`
- `GET /v1/state` (Bearer token required)
- `GET /v1/timeline` (Bearer token required)
- `POST /v1/objects`
- `PATCH /v1/objects/:id`
- `POST /v1/objects/:id/relations`
- `POST /v1/loops/:id/complete`
- `POST /v1/capture`

Authenticated routes require `Authorization: Bearer <LIFEOS_API_TOKEN>`. Keep this token on the server; never embed it in browser code.

## Validate

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
```

See [docs/LIFEOS-OPERATING-SYSTEM.md](docs/LIFEOS-OPERATING-SYSTEM.md) for the event model, invariants, and next implementation slices.
