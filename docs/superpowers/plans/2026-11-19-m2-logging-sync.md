# M2 Logging and Sync Implementation Plan

> **For agentic workers:** Use the repository instructions and implement each task with focused regression tests.

**Goal:** Keep one-tap logging local and durable while syncing edits, timer completions, and tombstones through a versioned API.

**Architecture:** SQLite is the app's source for rendering; an outbox retries mutations using device UUIDs. The Laravel API stores event snapshots, assigns monotonically increasing per-baby change numbers inside transactions, and exposes a paginated catch-up feed. Request success and catch-up both reconcile the same local rows; device clocks only control displayed occurrence time.

**Tech Stack:** Laravel 13, MySQL 8, Sanctum, Expo 58, React Native, TypeScript, expo-sqlite.

**Spec:** `ROADMAP.md` M2, `TASKS.md` M2, repository `AGENTS.md`, and `docs/v2-design-implementation.md`.

## Global Constraints

- Logging must remain usable offline and without waiting for an API response.
- Existing AsyncStorage logs and running timers must survive migration.
- IDs are UUIDs generated on device. Deletes are tombstones.
- Sync ordering uses server change numbers, never client timestamps.
- Do not require a queue worker or add M3 logging features.

## Review Focus

- A retry after an acknowledged mutation must not overwrite a partner's newer edit.
- Catch-up after a long offline period must not miss or duplicate rows.
- Two accounts on one phone must not see each other's logs.
- A delete must reach the other device and remain deleted after reopening.
- A failed migration or storage write must not silently discard old logs.

## Tasks

### 1. Events API and change feed

**Files:** `api/database/migrations/`, `api/app/Models/`, `api/app/Http/Controllers/Api/V1/`, `api/routes/api.php`, `api/tests/Feature/Api/V1/`.

- [x] Add feature tests for access control, UUID writes, idempotent retries, updates, tombstones, ordering, and pagination.
- [x] Add an event table and mutation receipt table. Serialize per-baby mutations with a database row lock and increment a per-baby counter.
- [x] Expose `PUT /v1/babies/{baby}/events/{id}` with `mutation_id`, event fields, and `deleted`; return the saved snapshot. Expose `GET /v1/babies/{baby}/events?after=N&limit=100` with `next_cursor` and `has_more`.
- [x] Verify API tests and formatter.

### 2. SQLite log store and outbox

**Files:** `app/src/data/log-events.ts`, `app/src/data/log-store.tsx`, `app/src/data/`, `app/package.json`, `app/package-lock.json`.

- [ ] Add native SQLite tests for migration, persisted writes, and account isolation; current tests cover mutation mapping and network catch-up with a mocked store.
- [x] Install SDK-compatible `expo-sqlite`; migrate existing AsyncStorage logs into account-scoped SQLite tables without deleting the old copy until import succeeds.
- [x] Generate UUID IDs, commit events and outbox rows atomically, and render from local rows immediately.
- [x] Drain the outbox on app open/reconnect, then page the catch-up feed. Persist the cursor transactionally with merged rows.
- [x] Keep pending status accurate and retry failed writes on subsequent sync attempts.
- [x] Verify app tests and changed-file lint. Full-project lint and type checking are blocked by pre-existing web-file errors.

### 3. End-to-end acceptance

- [x] Run the API and app suites (163 API tests on SQLite; 53 app tests). MySQL could not be reached from this sandbox.
- [ ] Check create/edit/delete/backdate, timer completion, reopen, offline retry, and two-device catch-up on development builds.
- [x] Record limitations: CoreSimulator was unavailable, so no device run yet; timer starts remain device-local until stopped; partner updates use foreground catch-up and 30-second polling, not push delivery.
