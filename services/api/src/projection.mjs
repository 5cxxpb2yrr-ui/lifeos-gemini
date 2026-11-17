/**
 * LifeOS canonical state projection.
 *
 * The event log is authoritative. This function is deliberately pure so every
 * projection can be rebuilt from the same immutable history.
 */
export function projectLifeState(events = []) {
  const ordered = [...events].sort((a, b) =>
    String(a.occurredAt).localeCompare(String(b.occurredAt)) ||
    String(a.eventId).localeCompare(String(b.eventId))
  );
  const objects = new Map();

  for (const event of ordered) {
    const payload = event.payload ?? {};
    switch (event.eventType) {
      case 'object.created': {
        const object = payload.object;
        if (object?.id) objects.set(object.id, {
          ...object,
          relatedIds: [...new Set(object.relatedIds ?? [])],
        });
        break;
      }
      case 'object.updated': {
        const current = objects.get(payload.objectId);
        if (current) objects.set(current.id, {
          ...current,
          ...payload.patch,
          id: current.id,
          type: current.type,
          createdAt: current.createdAt,
          updatedAt: event.occurredAt,
        });
        break;
      }
      case 'object.related': {
        const source = objects.get(payload.sourceId);
        const target = objects.get(payload.targetId);
        if (source && target) {
          source.relatedIds = [...new Set([...(source.relatedIds ?? []), target.id])];
          target.relatedIds = [...new Set([...(target.relatedIds ?? []), source.id])];
        }
        break;
      }
      case 'loop.completed': {
        const loop = objects.get(payload.loopId);
        if (loop?.type === 'loop' && loop.status !== 'complete') {
          loop.status = 'complete';
          loop.updatedAt = event.occurredAt;
          loop.completedAt = event.occurredAt;
          if (payload.completionEventId && !objects.has(payload.completionEventId)) {
            objects.set(payload.completionEventId, {
              id: payload.completionEventId,
              type: 'event',
              title: payload.title ?? `Completed: ${loop.title}`,
              occurredAt: event.occurredAt,
              createdAt: event.occurredAt,
              updatedAt: event.occurredAt,
              relatedIds: [loop.id],
              notes: payload.notes ?? '',
              eventKind: 'loop.completed',
            });
            loop.relatedIds = [...new Set([...(loop.relatedIds ?? []), payload.completionEventId])];
          }
        }
        break;
      }
      default:
        // Unknown event types remain in history and do not corrupt projections.
        break;
    }
  }

  return {
    objects: [...objects.values()],
    eventCount: ordered.length,
    lastEventAt: ordered.at(-1)?.occurredAt ?? null,
  };
}
