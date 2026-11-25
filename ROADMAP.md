# Nappa — Roadmap

**Goal:** A global baby tracker (naps, feeds, diapers, sleep predictions) that matches Huckleberry's free logging, beats it on trust, reliability and calm design, and gives nap prediction away honestly. Research: [docs/competitor/](docs/competitor/huckleberry.md) ([landscape](docs/competitor/landscape.md)).

**Status:** M0 done · M1 build complete, device checks plus unit settings and `Accept-Language` open · M2 code complete, device acceptance open · M3 and M5 partly built ahead of schedule · M4 and M6 not started.

_Last updated: 2026-11-21_

---

## Positioning (drives priorities)

- **Match:** free logging set, live timers, day view, caregiver sync, age-based wake-window prediction, custom wake windows.
- **Beat:** logged data always free and exportable; free explainable prediction; offline-first, loss-proof sync; no ads or upsell pop-ups; opt-in notifications; multi-child and twins from the start.
- **Skip for now:** human sleep coaching, AI chat, community, Apple Watch, tube-feeding, daycare workflows.

---

## Milestones

### M1: Accounts, baby setup and quick unlock — `in progress`

The [Nov 21 onboarding designs](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-2) define the intro, email-code sign-in and account creation, optional device-only quick unlock, and five baby setup steps through the first prediction and Today. Quick unlock includes PIN creation and confirmation, biometric enrolment, the root lock gate, persistent retry pauses and email-code recovery. 
Device verification covers new and returning accounts, OTP paste and autofill, PIN retry and recovery, and Face ID or fingerprint in native builds. Unit settings and the `Accept-Language` work stay on [the board](TASKS.md).

**Built (v0.5.0):** intro, email-code sign-in and sign-up, five-step baby setup with first prediction, PIN, biometrics, root lock gate with persistent lockout, email-code PIN recovery, babies API, Home header and greeting on real account and baby data, i18n foundation.

**Blocking M1 done:** (1) device verification of onboarding and quick unlock on iOS and Android native builds, including physical Face ID or fingerprint and OTP autofill; (2) i18n and Home checks on a real device; (3) unit settings (ml/oz, kg/lb, diaper/nappy wording), not started; (4) `Accept-Language` middleware and localised mail and push, not started.

**Moved to M2 (2026-11-21):** Sign in with Apple and Google (blocked on Apple .p8 / Team ID, Google client IDs, an Android package name and `eas.json`) and quick unlock settings (change PIN, biometrics toggle, turn off; needs design).

### M2: Logging core — `in progress` (code complete, not device-verified)

Events table and API; quick-log for sleep, feeds and diapers; live sleep and nursing timers with left/right side; edit, delete and backdate; offline-first queue; Home tiles driven by real data. Also carried in from M1: Sign in with Apple and Google, and quick unlock settings. Done = a parent can run a full day on Nappa without touching sample data.

**Built:** events table and idempotent `PUT /v1/babies/{baby}/events/{id}` with a per-baby change feed; SQLite store with outbox and catch-up; quick-log and log screens for every type; sleep and nursing timers with side switching; edit, delete and backdate; Today driven by real events and the 7-day average.

**Blocking M2 done:** run the full-day acceptance on development builds (create, edit, delete, backdate, timer completion, reopen, offline retry, two-device catch-up). The native SQLite tests (migration, persistence, account isolation) are not written, and the API suite has only run on SQLite, not MySQL (production). Timer starts stay on the device until stopped, so a partner does not see a running timer; this is acceptable for M2 and matters for M4.

### M3: Timeline, history and more log types — `in progress` (UI built ahead of schedule)

Day view, daily summaries and charts; then pumping, solids, medication, growth and activities (bath, tummy time). Done = full free-tier logging parity with Huckleberry.

**Built on local events:** Timeline tab, Insights tab with day totals and trends, Growth screen, and log screens for pumping, solids, medicine, growth and activity. **Open:** device verification, a check of charts and summaries against a week of real data, and confirming each new type syncs through the events API (`EventPayload` rule) and exports.

### M4: Caregivers and multi-child — `todo` (groundwork only)

Invite and share a baby between caregivers, conflict-safe sync across devices, multiple children and twins, trend comparison. Done = two phones logging the same baby with no lost or duplicated entries.

Groundwork in place: `baby_user` pivot with owner and caregiver roles, per-baby change numbers, idempotent writes. Not built: invite API (the invite sheet is a disabled stub with an honest banner), accepting invites, viewer role enforcement, twins and trend comparison.

### M5: Nap prediction — `in progress` (first version on the client)

Wake-window engine from public pediatric age ranges, personalised from logs, custom windows, a "why this time" explanation, and a wake-window report. Home's next-nap card switches from sample data to the engine. Done = predictions shown and explained for babies from 2 months.

**Built:** `lib/prediction.ts` (no prediction under 8 weeks, age-based first window, then the median of recent wake windows), "Why this time" and sources screens, Home next-nap card on the engine, local nap reminder. **Open:** custom wake windows, the wake-window report, citing the pediatric ranges in a repo doc (ranges are sourced only in a code comment), tests for the engine (none yet), and wiring the reminder toggles to scheduling (they only request permission today).

### M6: Launch readiness — `todo` (small pieces started)

Pricing model and paywall, opt-in notifications, widgets, data export and account deletion, privacy and children's-data compliance (GDPR and similar), first extra languages (French, German, Spanish, then Chinese Simplified; native review, store listings), crash reporting, store listing. Done = submitted to the App Store and Play Store.

Started: account deletion (email-code confirmed, API and screen), data export screen (CSV and JSON via the share sheet; PDF not built), Plus screens (UI only, no purchase flow), TestFlight guide in `docs/ios-testing.md`. Not started: pricing decision, paywall purchase, widgets, crash reporting, privacy and GDPR review, extra languages.

---

## Completed

- **M0: Foundations** — shipped 2026-11-13 to 2026-11-14. Hostinger deploy pipeline with SSH auto-deploy, `/api/ping`, API client, app renamed Nappa, Uniwind set up, Home screen UI on sample data, Figma designs for screens, paywall, login and onboarding.

---

## Notes / risks

- **Open decision: pricing model.** Free plus one-time unlock versus subscription for advanced features only. Needed before M6 paywall work and should shape the marketing promise early. Task on the board.
- **Prediction is our own.** Build on public wake-window ranges. Do not imitate Huckleberry's SweetSpot output.
- **Sync is the main technical risk** and the main differentiator. Design the event model for offline writes and idempotent sync in M2, not M4.
- **Privacy:** baby data is sensitive. Decide hosting region and retention policy before launch. Current host is Hostinger shared hosting; check it is adequate for a global launch.
- **Competitor pricing data is unreliable.** Verify in the stores before committing to price points.
- **Localisation:** every new screen from M1 on must be translatable (no hard-coded text). Outfit has no Chinese glyphs, and a Chinese UI is not the same as launching in mainland China; see risks in [docs/i18n.md](docs/i18n.md).
