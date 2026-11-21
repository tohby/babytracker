# Nappa — Roadmap

**Goal:** A global baby tracker (naps, feeds, diapers, sleep predictions) that matches Huckleberry's free logging, beats it on trust, reliability and calm design, and gives nap prediction away honestly. Research: [docs/competitor/](docs/competitor/huckleberry.md) ([landscape](docs/competitor/landscape.md)).

**Status:** M0 done · M1 in progress · M2 logging and sync implementation in progress.

_Last updated: 2026-11-21_

---

## Positioning (drives priorities)

- **Match:** free logging set, live timers, day view, caregiver sync, age-based wake-window prediction, custom wake windows.
- **Beat:** logged data always free and exportable; free explainable prediction; offline-first, loss-proof sync; no ads or upsell pop-ups; opt-in notifications; multi-child and twins from the start.
- **Skip for now:** human sleep coaching, AI chat, community, Apple Watch, tube-feeding, daycare workflows.

---

## Milestones

### M1: Accounts, baby setup and quick unlock — `in progress`

The [Nov 21 onboarding designs](https://www.figma.com/design/uRRG0z2UlrjjeuCzmTUE4G?node-id=429-2) define the intro, email-code sign-in and account creation, optional device-only quick unlock, and five baby setup steps through the first prediction and Today. Quick unlock includes PIN creation and confirmation, biometric enrolment, the root lock gate, persistent retry pauses and email-code recovery. Quick unlock settings need design.

Device verification covers new and returning accounts, OTP paste and autofill, PIN retry and recovery, and Face ID or fingerprint in native builds. Social sign-in setup and the remaining glossary and unit settings stay on [the board](TASKS.md).

### M2: Logging core — `in progress`

Events table and API; quick-log for sleep, feeds and diapers; live sleep and nursing timers with left/right side; edit, delete and backdate; offline-first queue; Home tiles driven by real data. Done = a parent can run a full day on Nappa without touching sample data.

### M3: Timeline, history and more log types — `todo`

Day view, daily summaries and charts; then pumping, solids, medication, growth and activities (bath, tummy time). Done = full free-tier logging parity with Huckleberry.

### M4: Caregivers and multi-child — `todo`

Invite and share a baby between caregivers, conflict-safe sync across devices, multiple children and twins, trend comparison. Done = two phones logging the same baby with no lost or duplicated entries.

### M5: Nap prediction — `todo`

Wake-window engine from public pediatric age ranges, personalised from logs, custom windows, a "why this time" explanation, and a wake-window report. Home's next-nap card switches from sample data to the engine. Done = predictions shown and explained for babies from 2 months.

### M6: Launch readiness — `todo`

Pricing model and paywall, opt-in notifications, widgets, data export and account deletion, privacy and children's-data compliance (GDPR and similar), first extra languages (French, German, Spanish, then Chinese Simplified; native review, store listings), crash reporting, store listing. Done = submitted to the App Store and Play Store.

---

## Completed

- **M0: Foundations** — shipped 2026-11-13 to 2026-11-14. Hostinger deploy pipeline with SSH auto-deploy, `/api/ping`, API client, app renamed Nappa, Uniwind set up, Home screen UI on sample data (not yet committed), Figma designs for screens, paywall, login and onboarding.

---

## Notes / risks

- **Open decision: pricing model.** Free plus one-time unlock versus subscription for advanced features only. Needed before M6 paywall work and should shape the marketing promise early. Task on the board.
- **Prediction is our own.** Build on public wake-window ranges. Do not imitate Huckleberry's SweetSpot output.
- **Sync is the main technical risk** and the main differentiator. Design the event model for offline writes and idempotent sync in M2, not M4.
- **Privacy:** baby data is sensitive. Decide hosting region and retention policy before launch. Current host is Hostinger shared hosting; check it is adequate for a global launch.
- **Competitor pricing data is unreliable.** Verify in the stores before committing to price points.
- **Localisation:** every new screen from M1 on must be translatable (no hard-coded text). Outfit has no Chinese glyphs, and a Chinese UI is not the same as launching in mainland China; see risks in [docs/i18n.md](docs/i18n.md).
