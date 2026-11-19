import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

import type { LogEvent, RunningTimer } from '@/data/log-events';
import { eventToMutation, shouldApplySnapshot, snapshotToEvent, type EventSnapshot } from '@/data/log-sync';

const LEGACY_KEY = 'nappa.log.v1';
const dbPromise = SQLite.openDatabaseAsync('nappa-logs.db');
type Database = Awaited<typeof dbPromise>;

export type OutboxRow = { mutation_id: string; baby_id: string; event_id: string; body: string };

async function init(db: Database) {
  await db.execAsync(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS log_events (account TEXT NOT NULL, id TEXT NOT NULL, baby_id TEXT NOT NULL, body TEXT NOT NULL, change_number INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(account,id));
    CREATE TABLE IF NOT EXISTS log_outbox (account TEXT NOT NULL, mutation_id TEXT NOT NULL, baby_id TEXT NOT NULL, event_id TEXT NOT NULL, body TEXT NOT NULL, PRIMARY KEY(account,mutation_id));
    CREATE TABLE IF NOT EXISTS log_meta (account TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY(account,key));`);
}

const initialized = dbPromise.then(async (db) => { await init(db); return db; });
export function openLogDatabase() { return initialized; }

export async function loadLocal(account: string) {
  const db = await openLogDatabase();
  const rows = await db.getAllAsync<{ body: string }>('SELECT body FROM log_events WHERE account = ?', account);
  const timer = await db.getFirstAsync<{ value: string }>('SELECT value FROM log_meta WHERE account = ? AND key = ?', account, 'timer');
  return { events: rows.map((row) => JSON.parse(row.body) as LogEvent).filter((event) => !event.deletedAt), timer: timer ? JSON.parse(timer.value) as RunningTimer : null };
}

export async function migrateLegacy(account: string) {
  const db = await openLogDatabase();
  const raw = await AsyncStorage.getItem(LEGACY_KEY);
  if (!raw) return;
  const legacy = JSON.parse(raw) as { events: LogEvent[]; timer: RunningTimer | null };
  await db.withExclusiveTransactionAsync(async (tx) => {
    const owner = await tx.getFirstAsync<{ value: string }>('SELECT value FROM log_meta WHERE account = ? AND key = ?', '_global', 'legacy_owner');
    if (owner && owner.value !== account) return;
    const imported = await tx.getFirstAsync('SELECT 1 FROM log_meta WHERE account = ? AND key = ?', account, 'legacy_imported');
    if (imported) return;
    for (const event of legacy.events) {
      const id = event.id.startsWith('local-') ? randomUUID() : event.id;
      const migrated = { ...event, id, pendingSync: true };
      await tx.runAsync('INSERT OR IGNORE INTO log_events(account,id,baby_id,body) VALUES(?,?,?,?)', account, id, migrated.babyId, JSON.stringify(migrated));
      const mutationId = randomUUID();
      await tx.runAsync('INSERT INTO log_outbox(account,mutation_id,baby_id,event_id,body) VALUES(?,?,?,?,?)', account, mutationId, migrated.babyId, id, JSON.stringify(eventToMutation(migrated, mutationId)));
    }
    if (legacy.timer) await tx.runAsync('INSERT OR REPLACE INTO log_meta(account,key,value) VALUES(?,?,?)', account, 'timer', JSON.stringify(legacy.timer));
    await tx.runAsync('INSERT OR IGNORE INTO log_meta(account,key,value) VALUES(?,?,?)', '_global', 'legacy_owner', account);
    await tx.runAsync('INSERT INTO log_meta(account,key,value) VALUES(?,?,?)', account, 'legacy_imported', '1');
  });
}

export function saveLocalEventSync(account: string, event: LogEvent, clearTimer = false) {
  const db = SQLite.openDatabaseSync('nappa-logs.db');
  try {
    const mutationId = randomUUID();
    db.withTransactionSync(() => {
      db.runSync('INSERT OR REPLACE INTO log_events(account,id,baby_id,body,change_number) VALUES(?,?,?,?,?)', account, event.id, event.babyId, JSON.stringify(event), event.changeNumber ?? 0);
      db.runSync('INSERT INTO log_outbox(account,mutation_id,baby_id,event_id,body) VALUES(?,?,?,?,?)', account, mutationId, event.babyId, event.id, JSON.stringify(eventToMutation(event, mutationId)));
      if (clearTimer) db.runSync('DELETE FROM log_meta WHERE account = ? AND key = ?', account, 'timer');
    });
  } finally { db.closeSync(); }
}

export function saveLocalTimerSync(account: string, timer: RunningTimer | null) {
  const db = SQLite.openDatabaseSync('nappa-logs.db');
  try {
    if (timer) db.runSync('INSERT OR REPLACE INTO log_meta(account,key,value) VALUES(?,?,?)', account, 'timer', JSON.stringify(timer));
    else db.runSync('DELETE FROM log_meta WHERE account = ? AND key = ?', account, 'timer');
  } finally { db.closeSync(); }
}

export async function pendingMutations(account: string) {
  const db = await openLogDatabase();
  return db.getAllAsync<OutboxRow>('SELECT mutation_id,baby_id,event_id,body FROM log_outbox WHERE account = ? ORDER BY rowid', account);
}

export async function acknowledge(account: string, mutationId: string, snapshot: EventSnapshot) {
  const db = await openLogDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    const row = await tx.getFirstAsync<{ event_id: string }>('SELECT event_id FROM log_outbox WHERE account = ? AND mutation_id = ?', account, mutationId);
    if (!row) return;
    await tx.runAsync('DELETE FROM log_outbox WHERE account = ? AND mutation_id = ?', account, mutationId);
    await mergeOne(tx, account, snapshot);
  });
}

async function mergeOne(tx: Database, account: string, snapshot: EventSnapshot) {
  const pending = await tx.getFirstAsync('SELECT 1 FROM log_outbox WHERE account = ? AND event_id = ?', account, snapshot.id);
  const existing = await tx.getFirstAsync<{ body: string }>('SELECT body FROM log_events WHERE account = ? AND id = ?', account, snapshot.id);
  const local = existing ? JSON.parse(existing.body) as LogEvent : undefined;
  if (!shouldApplySnapshot(local, snapshot.change_number, Boolean(pending))) return;
  const event = snapshotToEvent(snapshot);
  if (!event.loggedBy && local?.loggedBy) event.loggedBy = local.loggedBy;
  await tx.runAsync('INSERT OR REPLACE INTO log_events(account,id,baby_id,body,change_number) VALUES(?,?,?,?,?)', account, event.id, event.babyId, JSON.stringify(event), snapshot.change_number);
}

export async function mergePage(account: string, babyId: string, snapshots: EventSnapshot[], cursor: number) {
  const db = await openLogDatabase();
  await db.withExclusiveTransactionAsync(async (tx) => {
    for (const snapshot of snapshots) await mergeOne(tx, account, snapshot);
    await tx.runAsync('INSERT OR REPLACE INTO log_meta(account,key,value) VALUES(?,?,?)', account, `cursor:${babyId}`, String(cursor));
  });
}

export async function getCursor(account: string, babyId: string) {
  const db = await openLogDatabase();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM log_meta WHERE account = ? AND key = ?', account, `cursor:${babyId}`);
  return Number(row?.value ?? 0);
}

export async function knownBabies(account: string) {
  const db = await openLogDatabase();
  const rows = await db.getAllAsync<{ baby_id: string }>('SELECT DISTINCT baby_id FROM log_events WHERE account = ?', account);
  return rows.map((row) => row.baby_id);
}
