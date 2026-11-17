# LifeOS v3 — Product & Architecture Constitution

## Product
LifeOS is a personal operating system centered on attention management, events, and unresolved commitments. It is not a task manager, CRM, note app, or calendar.

Primary objective: reduce Life Load over time.

## Four first-class objects
- **Event:** immutable historical record of something meaningful that happened.
- **Open Loop:** unresolved commitment, dependency, risk, or follow-up.
- **Person:** relationship context connected to events and commitments.
- **Asset:** something maintained, protected, or producing value.

Goals, decisions, notes, streams, finance records, and insights remain secondary records or relationship metadata. They are not top-level navigation destinations.

## Navigation
Mission Control, Open Loops, Timeline, Search, and Universal Capture are the only primary destinations. Detail navigation uses a single push stack; Back retraces the exact path. Capture is a bottom sheet. The mobile bottom bar is always available outside a detail stack.

## Event and loop invariants
- Events preserve history; do not mutate an event to represent a later state.
- Open Loops represent unresolved work; completion creates a linked Event and preserves the loop record.
- Relationships are explicit IDs and views derive from those links.
- Timeline is a projection of Events, including completion events.
- Search spans all four first-class object types.

## Life Load v1 resolver
Life Load is deterministic and explainable. Current initial formula, applied per unresolved loop:
- Base: 5 points
- Age: 0.5 points per day, capped at 15
- Priority: low 0, normal 2, high 5, urgent 8
- Risk: +8
- Waiting-on dependency: +2

The resolver returns a per-loop contribution and a breakdown. Status bands: 0–25 Calm, 26–75 Stable, 76–125 Busy, 126–175 Stressed, 176+ Critical.

This is an initial versioned product rule. Calibrate weights with real usage before treating the score as a validated measure of stress. AI must not calculate or silently alter Life Load.

## Universal Capture
Auto mode classifies plain-language capture into Events and/or Open Loops. Explicit type override is available when classification is ambiguous. Person and Asset records can be created directly and linked to existing context.

## Current prototype boundaries
- Local-first persistence in browser storage; no account sync or multi-device graph yet.
- Capture classification is deterministic keyword/rule parsing, not an LLM.
- Relationship links are explicit and searchable; no graph database backend yet.
- Seed records demonstrate the experience and can be replaced with real captures.
- Automation Studio, advanced search, attachments, finance integrations, and server sync are later phases.

## Build principles
- Keep visible navigation small.
- Resolver owns each calculated metric.
- Derived views never become competing sources of truth.
- Make every displayed recommendation explainable.
- Prefer rules for routine automation; AI assists interpretation, never canonical state.
