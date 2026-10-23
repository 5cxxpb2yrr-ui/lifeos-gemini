# LifeOS - Mission Control Gemini

LifeOS is a **Decision Operating System (DOS)** designed to continuously turn information into decisions, decisions into actions, and actions into outcomes.

## Architecture
- **Frontend:** React + TypeScript + Vite + Tailwind + Zustand
- **Backend:** Fastify + TypeScript + Zod
- **Database:** SurrealDB (Graph Native)
- **Monorepo Manager:** pnpm + Turborepo

## Visual Specification
The visual design enforces the Mission Control Strategic Operations Center aesthetic:
- Near-black background (`#0A0B0D`)
- Electric blue glow (`#3B82F6`) & Fire Amber alerts (`#F59E0B`)
- Recommendation-centered UX with Next Best Action (NBA) hero card.

## Workspace
- `packages/domain` - entity, signal and recommendation types (Zod)
- `packages/shared` - `lifeosTheme` design tokens
- `apps/web` - React/Vite Mission Control UI with the `NextBestActionCard`
- `services/` - reserved (API and SurrealDB not scaffolded yet)

## Getting Started
```bash
pnpm install
pnpm build
pnpm dev
```
