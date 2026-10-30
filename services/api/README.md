# @lifeos/api

Small Fastify API that stores Mission Control data in SurrealDB so it syncs between devices. Optional: the web app works without it.

## Run locally
```
API_TOKEN=<at least 16 characters> pnpm --filter @lifeos/api start
```
Data goes to `./data/lifeos` (embedded SurrealKV). Tests: `pnpm --filter @lifeos/api test`. Types: `pnpm --filter @lifeos/api typecheck`.

## Environment
| Variable | Meaning |
| --- | --- |
| `API_TOKEN` | Required, 16+ characters. Every `/api/*` request needs `Authorization: Bearer <token>`. |
| `ALLOWED_ORIGIN` | CORS origins, comma separated, with no path. For GitHub Pages: `https://5cxxpb2yrr-ui.github.io`. |
| `SURREAL_URL` | Default `surrealkv://./data/lifeos` (embedded, on disk). `mem://` for tests. A `ws://` URL for a standalone SurrealDB server. |
| `PORT`, `HOST` | Default `8787`, `0.0.0.0`. |

## Endpoints
- `GET /health` no auth.
- `GET /api/records` returns `{ records: [{ table, id, updatedAt, data }] }`.
- `PUT /api/records` takes `{ records: [...] }` (up to 2000). A record is applied only if its `updatedAt` is newer than the stored one (last write wins). Nothing is ever deleted.

Tables: bill, decision, loop, person, insight, project, goal, and `kv` (one document holding inbox, archive, scoring weights and snoozes).

## Hosting notes
- The web app is on GitHub Pages (HTTPS), so the API must also be HTTPS, or browsers block the calls.
- The embedded database needs a persistent disk. Without one, data is lost on every deploy. `Dockerfile` and `render.yaml` are provided as a starting point.
- Back up the data directory (or the disk snapshot). The browser also keeps its own copy.
- Single user, single shared token. There is no rate limiting, so use a long random token and keep it out of the repo.

## Known limits
Conflicts are resolved per record by timestamp, so two devices editing the same record at the same time keep only the newer edit. The inbox, archive, weights and snoozes sync as one document with the same rule. Sections the app does not edit (the rest of a full backup) are not synced.
