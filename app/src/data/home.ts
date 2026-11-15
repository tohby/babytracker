/**
 * Shape of the data the Home screen needs, plus sample values.
 * When the API exists, fetch a `HomeData` and pass it to the screen;
 * nothing else needs to change.
 */

export type TileAccent = 'orange' | 'lavender' | 'mint' | 'yellow';

export type TimeSinceTileData = {
  id: string;
  accent: TileAccent;
  title: string;
  /** The big number, e.g. "2h 10m". */
  value: string;
  caption: string;
};

export type HomeData = {
  babyName: string;
  familyName: string;
  hasUnreadNotifications: boolean;
  nextNap: {
    time: string;
    windowUntil: string;
    startsIn: string;
  };
  feedDue: {
    time: string;
  };
  syncedWith: string;
  sinceLast: TimeSinceTileData[];
};

export const sampleHomeData: HomeData = {
  babyName: 'Ada',
  familyName: "Ada's family",
  hasUnreadNotifications: true,
  nextNap: {
    time: '1:40 pm',
    windowUntil: 'Window until 2:10 pm',
    startsIn: 'in about 35 min',
  },
  feedDue: {
    time: '~3:10',
  },
  syncedWith: 'Kemi',
  sinceLast: [
    { id: 'feed', accent: 'orange', title: 'Last feed', value: '2h 10m', caption: 'Bottle · 120 ml' },
    { id: 'awake', accent: 'lavender', title: 'Awake for', value: '1h 35m', caption: 'Woke 12:05 pm' },
    { id: 'nappy', accent: 'mint', title: 'Last nappy', value: '45m', caption: 'Wet' },
    { id: 'sleep', accent: 'yellow', title: 'Sleep today', value: '4h 20m', caption: '2 naps so far' },
  ],
};
