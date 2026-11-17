-- LifeOS event store schema. Also applied automatically by the API on startup.
-- Canonical history is append-only. Projections are rebuilt from life_event records.
DEFINE TABLE IF NOT EXISTS life_event SCHEMALESS;
DEFINE INDEX IF NOT EXISTS life_event_occurred_at ON TABLE life_event FIELDS occurredAt;
DEFINE INDEX IF NOT EXISTS life_event_type ON TABLE life_event FIELDS eventType;
