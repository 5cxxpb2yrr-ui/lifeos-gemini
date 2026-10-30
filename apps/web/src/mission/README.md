# Mission Control UI (apps/web/src/mission)

Self-contained port of the LifeOS Mission Control prototype. Nothing outside this folder is touched, so it will not overwrite your existing `App.tsx`, `lifeosTheme.ts` or global CSS.

## Mount it
```tsx
import MissionApp from './mission/MissionApp';
// render <MissionApp /> where you want it (for example, replace the Mission route's content)
```

## Dependencies
Nothing to add. It uses only `react`, `react-dom` and `zustand`, which `@lifeos/web` already has, so `pnpm install --frozen-lockfile` still passes. Tailwind `content` already covers `./src/**/*.{ts,tsx}`.

## How it fits your repo
- `src/App.tsx` now renders `MissionApp` (the old sample-card scaffold is replaced; `components/NextBestActionCard.tsx` is left in place, unused).
- `mission/theme/lifeosTheme.ts` reads colors from `@lifeos/shared`. `mission/theme/tokens.css` defines the same values as CSS variables, with no global body styles.
- `store.ts` persists to localStorage (`lifeos-mission-control`) and starts from `seed.ts`. When the Fastify API exists, swap the store's `data` for fetched records. `lib/` is pure and could move into `@lifeos/domain` later.
- The existing `Recommendation` type in `@lifeos/domain` uses different field names (`impactScore`, `whyThisMatters`, ...). `mission/types.ts` has its own `Rec`. Mapping between them is not done.

## Layout
- `lib/` pure, tested domain logic: scoring, resolve, ledger, loans, agenda, health, capture, dates
- `components/` cards, Sheet, BillSheet, PersonSheet, OptionsPanel, forms, chart
- `screens/` Mission, Inbox, Entities, Search, More, and the secondary views

## Not done
- No `>project` / `^goal` linking (the seed has no such records).
- Calendar links open Google Calendar; there is no sync.
- No backend or SurrealDB wiring.

## Sync (optional)
More -> "Sync between devices": enter the API URL and token (see `services/api`). The app pulls, merges by timestamp (newest record wins, nothing is deleted), pushes what the server lacks, and repeats on start, on return to the app, when back online, and shortly after local changes. The token is stored in this browser only. With no API configured, everything stays on the device.

## Links
`>project` and `^goal` tags resolve against your projects and goals (exact title, or every word starts a word in exactly one title). Green chips open the record; unknown names offer to add one. Records can use `title` or `name`.

## Tests
Tests live in `apps/web/tests/mission/` so the production `tsc` build does not need a test runner. To run them: `pnpm add -D vitest --filter @lifeos/web` (updates the lockfile, commit it), then `pnpm --filter @lifeos/web exec vitest run tests/mission` (35 tests).

## Not done
- Sections of a full backup that the app does not edit are not synced.
- Calendar links open Google Calendar; there is no sync.
- Mapping to the `Recommendation` type in `@lifeos/domain` is not done.
