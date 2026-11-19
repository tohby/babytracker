import { eventToMutation, snapshotToEvent, shouldApplySnapshot } from '../log-sync';
import type { LogEvent } from '../log-events';

const event: LogEvent = { id: '7d686899-d180-49b1-a1ac-9753320589e1', babyId: 'baby', type: 'nappy', startAt: '2026-11-19T00:00:00Z', nappy: { kind: 'wet' }, loggedBy: 'Tobi', pendingSync: true, createdAt: '2026-11-19T00:00:00Z', updatedAt: '2026-11-19T00:00:00Z' };

test('serializes event payload for the M2 API', () => {
  expect(eventToMutation(event, 'mutation')).toEqual({ mutation_id: 'mutation', type: 'nappy', occurred_at: event.startAt, ended_at: null, payload: { nappy: { kind: 'wet' } }, note: null, deleted: false });
});

test('a pending local edit survives an older server snapshot', () => {
  expect(shouldApplySnapshot({ ...event, changeNumber: 3 }, 4, true)).toBe(false);
  expect(shouldApplySnapshot({ ...event, changeNumber: 3 }, 4, false)).toBe(true);
});

test('tombstones remain hidden while preserving server order', () => {
  const result = snapshotToEvent({ id: event.id, baby_id: 'baby', type: 'nappy', occurred_at: event.startAt, ended_at: null, payload: { nappy: { kind: 'wet' } }, note: null, deleted_at: event.startAt, change_number: 5, logged_by: 1, logged_by_name: 'Tobi', created_at: event.createdAt, updated_at: event.updatedAt });
  expect(result.deletedAt).toBe(event.startAt);
  expect(result.changeNumber).toBe(5);
  expect(result.loggedBy).toBe('Tobi');
});
