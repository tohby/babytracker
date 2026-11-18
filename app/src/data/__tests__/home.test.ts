import { nextNapFromRhythm } from '@/data/home';

const birth = '2026-07-20'; // ~4 months on 17 Nov 2026: naps at 9:00, 12:15 and a 15:30 catnap with a 7:30 wake

describe('nextNapFromRhythm', () => {
  it('picks the next nap today', () => {
    const nap = nextNapFromRhythm(birth, '07:30', new Date(2026, 10, 17, 10, 0));
    const start = new Date(nap!.windowStart);
    expect([start.getDate(), start.getHours(), start.getMinutes()]).toEqual([17, 12, 15]);
    expect(new Date(nap!.windowEnd).getTime() - start.getTime()).toBe(30 * 60_000);
    expect(nap!.basis).toBe('age');
  });

  it('keeps a nap whose window is still open', () => {
    const nap = nextNapFromRhythm(birth, '07:30', new Date(2026, 10, 17, 12, 30));
    expect(new Date(nap!.windowStart).getHours()).toBe(12);
  });

  it('moves to tomorrow’s first nap after the last one', () => {
    const nap = nextNapFromRhythm(birth, '07:30', new Date(2026, 10, 17, 21, 0));
    const start = new Date(nap!.windowStart);
    expect([start.getDate(), start.getHours(), start.getMinutes()]).toEqual([18, 9, 0]);
  });

  it('has nothing without a birthday', () => {
    expect(nextNapFromRhythm(null, '07:30')).toBeNull();
  });
});
