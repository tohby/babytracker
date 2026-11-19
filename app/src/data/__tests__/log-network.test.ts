import { syncLogs } from '../log-network';
import { authedRequest } from '@/lib/auth/tokens';
import { acknowledge, getCursor, mergePage, pendingMutations } from '../log-database';

jest.mock('../log-database', () => ({ pendingMutations: jest.fn(async () => []), knownBabies: jest.fn(async () => []), getCursor: jest.fn(async () => 0), mergePage: jest.fn(async () => {}), loadLocal: jest.fn(async () => ({ events: [], timer: null })), acknowledge: jest.fn() }));
jest.mock('@/lib/auth/tokens', () => ({ authedRequest: jest.fn() }));

test('fetches linked babies even when local events are empty', async () => {
  const request = authedRequest as jest.Mock;
  request.mockImplementation(async (path: string) => path === '/v1/babies'
    ? { data: [{ id: 'partner-baby' }] }
    : { data: [], next_cursor: 0, has_more: false });
  await syncLogs('account', jest.fn());
  expect(request).toHaveBeenCalledWith('/v1/babies/partner-baby/events?after=0&limit=100');
});

test('acknowledges the snapshot inside the PUT data wrapper', async () => {
  (pendingMutations as jest.Mock).mockResolvedValueOnce([{ mutation_id: 'mutation', baby_id: 'baby', event_id: 'event', body: '{}' }]);
  const snapshot = { id: 'event', change_number: 1 };
  (authedRequest as jest.Mock).mockImplementation(async (path: string) => path.includes('/events/event') ? { data: snapshot } : path === '/v1/babies' ? { data: [] } : { data: [], next_cursor: 0, has_more: false });
  await syncLogs('account', jest.fn());
  expect(acknowledge).toHaveBeenCalledWith('account', 'mutation', snapshot);
});

test('keeps a failed mutation for the next sync attempt', async () => {
  const mutation = { mutation_id: 'retry-id', baby_id: 'baby', event_id: 'event', body: '{}' };
  (pendingMutations as jest.Mock).mockResolvedValueOnce([mutation]).mockResolvedValueOnce([mutation]);
  const request = authedRequest as jest.Mock;
  request.mockRejectedValueOnce(new Error('offline')).mockImplementation(async (path: string) => path.includes('/events/event')
    ? { data: { id: 'event', change_number: 1 } }
    : { data: [] });
  expect(await syncLogs('account', jest.fn())).toBe(false);
  expect(acknowledge).not.toHaveBeenCalledWith('account', 'retry-id', expect.anything());
  expect(await syncLogs('account', jest.fn())).toBe(true);
  expect(request).toHaveBeenCalledWith('/v1/babies/baby/events/event', { method: 'PUT', body: {} });
});

test('pages catch-up from the saved cursor', async () => {
  (getCursor as jest.Mock).mockResolvedValueOnce(8);
  const request = authedRequest as jest.Mock;
  request.mockImplementation(async (path: string) => path === '/v1/babies'
    ? { data: [{ id: 'baby' }] }
    : path.includes('after=8')
      ? { data: [{ id: 'first' }], next_cursor: 9, has_more: true }
      : { data: [{ id: 'second' }], next_cursor: 10, has_more: false });
  await syncLogs('account', jest.fn());
  expect(request).toHaveBeenCalledWith('/v1/babies/baby/events?after=9&limit=100');
  expect(mergePage).toHaveBeenCalledWith('account', 'baby', [{ id: 'second' }], 10);
});
